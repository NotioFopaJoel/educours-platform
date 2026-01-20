
const Payment = require('../models/Payment.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const PaymentService = require('../services/payment.service');
const NotificationService = require('../services/notification.service');
const logger = require('../utils/logger');
const { PAYMENT_STATUS, PAYMENT_METHODS } = require('../utils/constants');

class PaymentController {
    // POST /api/payments/create-checkout - Crée une session de paiement
    async createCheckoutSession(req, res) {
        try {
            const { courseId } = req.body;
            const user = req.user;

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            if (course.price <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cours gratuit - pas de paiement requis'
                });
            }

            // Vérifier si déjà acheté
            const existingPayment = await Payment.findOne({
                user: user._id,
                course: courseId,
                status: PAYMENT_STATUS.COMPLETED
            });

            if (existingPayment) {
                return res.status(400).json({
                    success: false,
                    message: 'Vous avez déjà acheté ce cours'
                });
            }

            // Créer la session de paiement
            const session = await PaymentService.createCheckoutSession({
                course,
                user,
                successUrl: `${process.env.FRONTEND_URL}/payment/success/{CHECKOUT_SESSION_ID}`,
                cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel/{CHECKOUT_SESSION_ID}`
            });

            // Enregistrer la tentative de paiement
            await Payment.create({
                user: user._id,
                course: courseId,
                amount: course.price,
                currency: 'xof',
                paymentMethod: PAYMENT_METHODS.STRIPE,
                status: PAYMENT_STATUS.PENDING,
                sessionId: session.sessionId,
                metadata: {
                    sessionUrl: session.url
                }
            });

            res.json({
                success: true,
                data: session
            });
        } catch (error) {
            logger.error('Create checkout session error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création du paiement'
            });
        }
    }

    // POST /api/payments/webhook - Webhook Stripe
    async handleWebhook(req, res) {
        try {
            const signature = req.headers['stripe-signature'];
            const event = await PaymentService.handleWebhook(req.body, signature);

            switch (event.type) {
                case 'checkout.session.completed':
                    await this.handleSuccessfulPayment(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handleFailedPayment(event.data.object);
                    break;
            }

            res.json({ received: true });
        } catch (error) {
            logger.error('Webhook error:', error);
            res.status(400).json({
                success: false,
                error: 'Webhook error'
            });
        }
    }

    // GET /api/payments/success/:sessionId - Succès paiement
    async paymentSuccess(req, res) {
        try {
            const { sessionId } = req.params;
            const user = req.user;

            const payment = await Payment.findOne({
                sessionId,
                user: user._id
            });

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Paiement non trouvé'
                });
            }

            // Mettre à jour le statut
            payment.status = PAYMENT_STATUS.COMPLETED;
            payment.completedAt = new Date();
            await payment.save();

            // Inscrire l'utilisateur au cours
            const course = await Course.findById(payment.course);
            if (course) {
                course.students.push(user._id);
                await course.save();
            }

            // Notification
            await NotificationService.createPredefinedNotification(
                NotificationService.NOTIFICATION_TYPES.PAYMENT.PAYMENT_SUCCESS,
                user._id,
                {
                    amount: payment.amount,
                    currency: payment.currency,
                    courseTitle: course?.title,
                    paymentId: payment._id
                }
            );

            res.json({
                success: true,
                message: 'Paiement réussi',
                data: {
                    payment,
                    course: course ? {
                        id: course._id,
                        title: course.title
                    } : null
                }
            });
        } catch (error) {
            logger.error('Payment success error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du traitement du paiement'
            });
        }
    }

    // GET /api/payments/cancel/:sessionId - Annulation paiement
    async paymentCancel(req, res) {
        try {
            const { sessionId } = req.params;
            const user = req.user;

            const payment = await Payment.findOne({
                sessionId,
                user: user._id
            });

            if (payment) {
                payment.status = PAYMENT_STATUS.CANCELLED;
                payment.cancelledAt = new Date();
                await payment.save();
            }

            res.json({
                success: true,
                message: 'Paiement annulé'
            });
        } catch (error) {
            logger.error('Payment cancel error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'annulation'
            });
        }
    }

    // GET /api/payments/history - Historique des paiements
    async getPaymentHistory(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const user = req.user;

            const payments = await Payment.find({ user: user._id })
                .populate('course', 'title thumbnail')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            const total = await Payment.countDocuments({ user: user._id });

            res.json({
                success: true,
                data: payments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            logger.error('Get payment history error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de l\'historique'
            });
        }
    }

    // GET /api/payments/:id - Détails d'un paiement
    async getPaymentById(req, res) {
        try {
            const payment = await Payment.findById(req.params.id)
                .populate('course', 'title description thumbnail')
                .populate('user', 'fullName email');

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Paiement non trouvé'
                });
            }

            // Vérifier les permissions
            if (payment.user._id.toString() !== req.user._id.toString() && 
                req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            res.json({
                success: true,
                data: payment
            });
        } catch (error) {
            logger.error('Get payment by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du paiement'
            });
        }
    }

    // POST /api/payments/manual - Paiement manuel
    async processManualPayment(req, res) {
        try {
            const { courseId, paymentMethod, transactionId, notes } = req.body;
            const user = req.user;

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            const payment = await Payment.create({
                user: user._id,
                course: courseId,
                amount: course.price,
                currency: 'xof',
                paymentMethod,
                transactionId,
                status: PAYMENT_STATUS.PENDING,
                notes,
                metadata: {
                    isManual: true,
                    processedBy: user._id
                }
            });

            res.status(201).json({
                success: true,
                message: 'Paiement manuel créé',
                data: payment
            });
        } catch (error) {
            logger.error('Process manual payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du traitement manuel'
            });
        }
    }

    // Méthodes privées
    async handleSuccessfulPayment(session) {
        try {
            const payment = await Payment.findOne({ sessionId: session.id });
            if (payment) {
                payment.status = PAYMENT_STATUS.COMPLETED;
                payment.completedAt = new Date();
                payment.metadata.stripeEvent = session;
                await payment.save();

                // Inscrire l'utilisateur au cours
                const user = await User.findById(payment.user);
                const course = await Course.findById(payment.course);
                
                if (course && user) {
                    course.students.push(user._id);
                    await course.save();
                }
            }
        } catch (error) {
            logger.error('Handle successful payment error:', error);
        }
    }

    async handleFailedPayment(paymentIntent) {
        try {
            const payment = await Payment.findOne({
                metadata: { 'stripe.paymentIntentId': paymentIntent.id }
            });
            
            if (payment) {
                payment.status = PAYMENT_STATUS.FAILED;
                payment.failedAt = new Date();
                payment.metadata.failureReason = paymentIntent.last_payment_error;
                await payment.save();
            }
        } catch (error) {
            logger.error('Handle failed payment error:', error);
        }
    }
}

module.exports = new PaymentController();