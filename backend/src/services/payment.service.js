// backend/src/services/payment.service.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PAYMENT_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

class PaymentService {
    constructor() {
        this.stripeEnabled = process.env.STRIPE_ENABLED === 'true';
        this.currency = process.env.PAYMENT_CURRENCY || 'xof';
        
        // Configurer les webhooks
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    }

    /**
     * Crée un client Stripe
     * @param {Object} user - Utilisateur
     * @returns {Promise<Object>} - Client Stripe
     */
    async createCustomer(user) {
        if (!this.stripeEnabled) {
            throw new Error('Stripe payment is not enabled');
        }

        try {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.fullName,
                metadata: {
                    userId: user._id.toString(),
                    userRole: user.role
                }
            });

            logger.info('Stripe customer created', {
                userId: user._id,
                customerId: customer.id
            });

            return customer;
        } catch (error) {
            logger.error('Stripe customer creation failed:', error);
            throw error;
        }
    }

    /**
     * Crée une session de paiement
     * @param {Object} options - Options de paiement
     * @returns {Promise<Object>} - Session Stripe
     */
    async createCheckoutSession(options) {
        if (!this.stripeEnabled) {
            throw new Error('Stripe payment is not enabled');
        }

        const {
            course,
            user,
            successUrl,
            cancelUrl,
            metadata = {}
        } = options;

        try {
            const session = await stripe.checkout.sessions.create({
                customer_email: user.email,
                line_items: [
                    {
                        price_data: {
                            currency: this.currency,
                            product_data: {
                                name: course.title,
                                description: course.description,
                                images: course.thumbnail ? [course.thumbnail] : [],
                                metadata: {
                                    courseId: course._id.toString()
                                }
                            },
                            unit_amount: Math.round(course.price * 100), // Convertir en centimes
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    courseId: course._id.toString(),
                    userId: user._id.toString(),
                    ...metadata
                },
                customer_creation: 'if_required',
                payment_intent_data: {
                    capture_method: 'automatic',
                    metadata: {
                        courseId: course._id.toString(),
                        userId: user._id.toString()
                    }
                }
            });

            logger.info('Checkout session created', {
                sessionId: session.id,
                userId: user._id,
                courseId: course._id,
                amount: course.price
            });

            return {
                sessionId: session.id,
                url: session.url,
                amount: course.price,
                currency: this.currency
            };
        } catch (error) {
            logger.error('Checkout session creation failed:', error);
            throw error;
        }
    }

    /**
     * Crée un PaymentIntent pour les paiements personnalisés
     * @param {Object} options - Options de paiement
     * @returns {Promise<Object>} - PaymentIntent
     */
    async createPaymentIntent(options) {
        if (!this.stripeEnabled) {
            throw new Error('Stripe payment is not enabled');
        }

        const {
            amount,
            currency = this.currency,
            customerId,
            metadata = {},
            description
        } = options;

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convertir en centimes
                currency,
                customer: customerId,
                description,
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            logger.info('Payment intent created', {
                paymentIntentId: paymentIntent.id,
                amount,
                currency,
                customerId
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount,
                currency
            };
        } catch (error) {
            logger.error('Payment intent creation failed:', error);
            throw error;
        }
    }

    /**
     * Traite un webhook Stripe
     * @param {string} payload - Payload du webhook
     * @param {string} signature - Signature du webhook
     * @returns {Promise<Object>} - Événement Stripe
     */
    async handleWebhook(payload, signature) {
        if (!this.stripeEnabled || !this.webhookSecret) {
            throw new Error('Stripe webhook not configured');
        }

        try {
            const event = stripe.webhooks.constructEvent(
                payload,
                signature,
                this.webhookSecret
            );

            logger.info('Stripe webhook received', {
                eventType: event.type,
                eventId: event.id
            });

            switch (event.type) {
                case 'checkout.session.completed':
                    await this.handleCheckoutSessionCompleted(event.data.object);
                    break;

                case 'payment_intent.succeeded':
                    await this.handlePaymentIntentSucceeded(event.data.object);
                    break;

                case 'payment_intent.payment_failed':
                    await this.handlePaymentIntentFailed(event.data.object);
                    break;

                case 'charge.refunded':
                    await this.handleChargeRefunded(event.data.object);
                    break;

                default:
                    logger.info(`Unhandled event type: ${event.type}`);
            }

            return event;
        } catch (error) {
            logger.error('Webhook handling failed:', error);
            throw error;
        }
    }

    /**
     * Gère une session de paiement complétée
     * @param {Object} session - Session Stripe
     */
    async handleCheckoutSessionCompleted(session) {
        try {
            const { courseId, userId } = session.metadata;
            
            logger.info('Checkout session completed', {
                sessionId: session.id,
                userId,
                courseId,
                paymentStatus: session.payment_status,
                amountTotal: session.amount_total / 100
            });

            // Ici, vous devriez mettre à jour votre base de données
            // Marquer le paiement comme complété et inscrire l'utilisateur au cours
            
            return {
                status: PAYMENT_STATUS.COMPLETED,
                sessionId: session.id,
                paymentIntentId: session.payment_intent,
                amount: session.amount_total / 100,
                currency: session.currency
            };
        } catch (error) {
            logger.error('Checkout session handling failed:', error);
            throw error;
        }
    }

    /**
     * Gère un PaymentIntent réussi
     * @param {Object} paymentIntent - PaymentIntent Stripe
     */
    async handlePaymentIntentSucceeded(paymentIntent) {
        logger.info('Payment intent succeeded', {
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            customerId: paymentIntent.customer
        });

        // Traiter le paiement réussi dans votre système
        return paymentIntent;
    }

    /**
     * Gère un PaymentIntent échoué
     * @param {Object} paymentIntent - PaymentIntent Stripe
     */
    async handlePaymentIntentFailed(paymentIntent) {
        logger.warn('Payment intent failed', {
            paymentIntentId: paymentIntent.id,
            error: paymentIntent.last_payment_error
        });

        // Gérer l'échec du paiement
        return paymentIntent;
    }

    /**
     * Gère un remboursement
     * @param {Object} charge - Charge Stripe
     */
    async handleChargeRefunded(charge) {
        logger.info('Charge refunded', {
            chargeId: charge.id,
            amountRefunded: charge.amount_refunded / 100,
            currency: charge.currency
        });

        // Traiter le remboursement dans votre système
        return charge;
    }

    /**
     * Rembourse un paiement
     * @param {string} paymentIntentId - ID du PaymentIntent
     * @param {number} amount - Montant à rembourser (optionnel)
     * @returns {Promise<Object>} - Remboursement Stripe
     */
    async refundPayment(paymentIntentId, amount = null) {
        if (!this.stripeEnabled) {
            throw new Error('Stripe payment is not enabled');
        }

        try {
            const refundOptions = {
                payment_intent: paymentIntentId
            };

            if (amount) {
                refundOptions.amount = Math.round(amount * 100);
            }

            const refund = await stripe.refunds.create(refundOptions);

            logger.info('Payment refunded', {
                paymentIntentId,
                refundId: refund.id,
                amount: refund.amount / 100,
                status: refund.status
            });

            return {
                refundId: refund.id,
                amount: refund.amount / 100,
                currency: refund.currency,
                status: refund.status
            };
        } catch (error) {
            logger.error('Refund failed:', error);
            throw error;
        }
    }

    /**
     * Récupère les détails d'un paiement
     * @param {string} paymentIntentId - ID du PaymentIntent
     * @returns {Promise<Object>} - Détails du paiement
     */
    async getPaymentDetails(paymentIntentId) {
        if (!this.stripeEnabled) {
            throw new Error('Stripe payment is not enabled');
        }

        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            const charges = await stripe.charges.list({
                payment_intent: paymentIntentId
            });

            return {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                customerId: paymentIntent.customer,
                charges: charges.data.map(charge => ({
                    id: charge.id,
                    amount: charge.amount / 100,
                    refunded: charge.refunded,
                    refundAmount: charge.amount_refunded / 100,
                    status: charge.status
                })),
                metadata: paymentIntent.metadata
            };
        } catch (error) {
            logger.error('Get payment details failed:', error);
            throw error;
        }
    }

    /**
     * Méthode de paiement alternative (pour les régions sans Stripe)
     * @param {Object} paymentData - Données de paiement
     * @returns {Promise<Object>} - Résultat du paiement
     */
    async processManualPayment(paymentData) {
        const {
            userId,
            courseId,
            amount,
            paymentMethod,
            transactionId,
            notes = ''
        } = paymentData;

        try {
            logger.info('Manual payment processed', {
                userId,
                courseId,
                amount,
                paymentMethod,
                transactionId
            });

            // Ici, vous pourriez intégrer d'autres méthodes de paiement
            // comme PayPal, Mobile Money, virement bancaire, etc.

            return {
                status: PAYMENT_STATUS.COMPLETED,
                paymentMethod,
                transactionId,
                amount,
                processedAt: new Date(),
                notes
            };
        } catch (error) {
            logger.error('Manual payment processing failed:', error);
            throw error;
        }
    }

    /**
     * Génère un lien de paiement personnalisé
     * @param {Object} options - Options du lien
     * @returns {Promise<Object>} - Lien de paiement
     */
    async generatePaymentLink(options) {
        const {
            course,
            user,
            expiresAt = null
        } = options;

        if (!this.stripeEnabled) {
            // Générer un lien de paiement manuel
            const token = require('crypto').randomBytes(32).toString('hex');
            const paymentUrl = `${process.env.FRONTEND_URL}/payment/manual/${token}`;
            
            return {
                url: paymentUrl,
                token,
                expiresAt,
                amount: course.price,
                currency: this.currency
            };
        }

        try {
            const price = await stripe.prices.create({
                unit_amount: Math.round(course.price * 100),
                currency: this.currency,
                product_data: {
                    name: course.title,
                    description: course.description
                }
            });

            const paymentLink = await stripe.paymentLinks.create({
                line_items: [
                    {
                        price: price.id,
                        quantity: 1
                    }
                ],
                after_completion: {
                    type: 'redirect',
                    redirect: {
                        url: `${process.env.FRONTEND_URL}/payment/success?course=${course._id}`
                    }
                },
                metadata: {
                    courseId: course._id.toString(),
                    userId: user._id.toString()
                },
                expires_at: expiresAt ? Math.floor(expiresAt.getTime() / 1000) : null
            });

            return {
                url: paymentLink.url,
                amount: course.price,
                currency: this.currency,
                expiresAt
            };
        } catch (error) {
            logger.error('Payment link generation failed:', error);
            throw error;
        }
    }
}

module.exports = new PaymentService();