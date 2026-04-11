// backend/src/services/sms.service.js
const twilio = require('twilio');
const logger = require('../utils/logger');

class SMSService {
    constructor() {
        this.twilioEnabled = process.env.TWILIO_ENABLED === 'true';
        
        if (this.twilioEnabled) {
            this.client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
        }
    }

    /**
     * Envoie un SMS
     * @param {string} to - Numéro de téléphone destinataire
     * @param {string} message - Message à envoyer
     * @param {Object} options - Options supplémentaires
     * @returns {Promise<Object>} - Résultat de l'envoi
     */
    async sendSMS(to, message, options = {}) {
        try {
            if (!this.twilioEnabled) {
                logger.info('SMS not sent (Twilio disabled)', { to, message });
                return { success: false, reason: 'SMS service disabled' };
            }

            const result = await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: this.formatPhoneNumber(to),
                ...options
            });

            logger.info('SMS sent successfully', {
                to,
                messageSid: result.sid,
                status: result.status
            });

            return {
                success: true,
                messageSid: result.sid,
                status: result.status,
                to: result.to,
                from: result.from
            };
        } catch (error) {
            logger.error('SMS sending failed:', {
                error: error.message,
                to,
                message
            });
            
            throw error;
        }
    }

    /**
     * Formate un numéro de téléphone
     * @param {string} phoneNumber - Numéro de téléphone
     * @returns {string} - Numéro formaté
     */
    formatPhoneNumber(phoneNumber) {
        // Supprimer tous les caractères non numériques
        let cleaned = phoneNumber.replace(/\D/g, '');
        
        // Ajouter l'indicatif international si absent
        if (!cleaned.startsWith('+')) {
            // Supposons que c'est un numéro local, ajoutez l'indicatif par défaut
            // Vous devriez adapter cette logique selon vos besoins
            cleaned = '+221' + cleaned; // Exemple pour le Sénégal
        }
        
        return cleaned;
    }

    /**
     * Envoie un SMS de vérification OTP
     * @param {string} phoneNumber - Numéro de téléphone
     * @param {string} otpCode - Code OTP
     * @returns {Promise<Object>} - Résultat de l'envoi
     */
    async sendOTP(phoneNumber, otpCode) {
        const message = `Votre code de vérification EDUCOURS est: ${otpCode}. Valide 10 minutes.`;
        
        return this.sendSMS(phoneNumber, message);
    }

    /**
     * Envoie une notification de paiement
     * @param {string} phoneNumber - Numéro de téléphone
     * @param {Object} paymentInfo - Informations de paiement
     * @returns {Promise<Object>} - Résultat de l'envoi
     */
    async sendPaymentNotification(phoneNumber, paymentInfo) {
        const message = `Paiement confirmé: ${paymentInfo.amount} ${paymentInfo.currency} pour ${paymentInfo.courseTitle}. Merci!`;
        
        return this.sendSMS(phoneNumber, message);
    }

    /**
     * Envoie un rappel de cours en direct
     * @param {string} phoneNumber - Numéro de téléphone
     * @param {Object} classInfo - Informations du cours
     * @returns {Promise<Object>} - Résultat de l'envoi
     */
    async sendLiveClassReminder(phoneNumber, classInfo) {
        const startTime = new Date(classInfo.startTime).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const message = `Rappel: Cours "${classInfo.title}" commence à ${startTime}. URL: ${classInfo.joinUrl}`;
        
        return this.sendSMS(phoneNumber, message);
    }

    /**
     * Envoie une notification de devoir à rendre
     * @param {string} phoneNumber - Numéro de téléphone
     * @param {Object} assignmentInfo - Informations du devoir
     * @returns {Promise<Object>} - Résultat de l'envoi
     */
    async sendAssignmentReminder(phoneNumber, assignmentInfo) {
        const dueDate = new Date(assignmentInfo.dueDate).toLocaleDateString('fr-FR');
        
        const message = `Devoir à rendre: "${assignmentInfo.title}" pour ${dueDate}. Cours: ${assignmentInfo.courseTitle}`;
        
        return this.sendSMS(phoneNumber, message);
    }

    /**
     * Vérifie le statut d'un SMS
     * @param {string} messageSid - SID du message Twilio
     * @returns {Promise<Object>} - Statut du message
     */
    async getMessageStatus(messageSid) {
        if (!this.twilioEnabled) {
            throw new Error('Twilio not enabled');
        }

        try {
            const message = await this.client.messages(messageSid).fetch();
            
            return {
                sid: message.sid,
                status: message.status,
                to: message.to,
                from: message.from,
                body: message.body,
                dateSent: message.dateSent,
                errorCode: message.errorCode,
                errorMessage: message.errorMessage
            };
        } catch (error) {
            logger.error('Failed to get message status:', error);
            throw error;
        }
    }

    /**
     * Méthode de secours pour les SMS (simulation en développement)
     * @param {string} to - Numéro de téléphone
     * @param {string} message - Message
     * @returns {Promise<Object>} - Résultat simulé
     */
    async sendMockSMS(to, message) {
        logger.info('Mock SMS sent (development mode)', {
            to,
            message,
            timestamp: new Date().toISOString()
        });

        return {
            success: true,
            mock: true,
            message: 'SMS would be sent in production',
            to,
            timestamp: new Date()
        };
    }
}

module.exports = new SMSService();