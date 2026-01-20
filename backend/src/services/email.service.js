// backend/src/services/email.service.js
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const logger = require('../utils/logger');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        this.templates = {
            WELCOME: 'welcome-email.ejs',
            VERIFICATION: 'verification-email.ejs',
            PASSWORD_RESET: 'password-reset.ejs',
            COURSE_ENROLLMENT: 'course-enrollment.ejs',
            ASSIGNMENT_DUE: 'assignment-due.ejs',
            PAYMENT_CONFIRMATION: 'payment-confirmation.ejs',
            LIVE_CLASS_REMINDER: 'live-class-reminder.ejs'
        };
    }

    /**
     * Rendu d'un template EJS
     * @param {string} templateName - Nom du template
     * @param {Object} data - Données pour le template
     * @returns {Promise<string>} - HTML rendu
     */
    async renderTemplate(templateName, data) {
        try {
            const templatePath = path.join(
                __dirname,
                '../templates/emails',
                templateName
            );
            return await ejs.renderFile(templatePath, data);
        } catch (error) {
            logger.error('Template rendering error:', error);
            throw error;
        }
    }

    /**
     * Envoi d'un email
     * @param {Object} options - Options d'envoi
     * @returns {Promise<Object>} - Résultat de l'envoi
     */
    async sendEmail(options) {
        const {
            to,
            subject,
            template,
            data = {},
            attachments = []
        } = options;

        try {
            // Rendu du template
            const html = await this.renderTemplate(template, {
                ...data,
                appName: process.env.APP_NAME || 'EDUCOURS',
                appUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
                year: new Date().getFullYear()
            });

            // Configuration de l'email
            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME || 'EDUCOURS'}" <${process.env.EMAIL_FROM}>`,
                to,
                subject,
                html,
                attachments
            };

            // Envoi de l'email
            const info = await this.transporter.sendMail(mailOptions);
            
            logger.info('Email sent successfully', {
                to,
                subject,
                messageId: info.messageId
            });

            return info;
        } catch (error) {
            logger.error('Email sending failed:', {
                error: error.message,
                to,
                subject
            });
            throw error;
        }
    }

    /**
     * Envoi d'un email de bienvenue
     * @param {string} email - Email du destinataire
     * @param {string} name - Nom de l'utilisateur
     * @param {string} verificationToken - Token de vérification
     */
    async sendWelcomeEmail(email, name, verificationToken) {
        return this.sendEmail({
            to: email,
            subject: 'Bienvenue sur EDUCOURS',
            template: this.templates.WELCOME,
            data: {
                name,
                verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`
            }
        });
    }

    /**
     * Envoi d'un email de réinitialisation de mot de passe
     * @param {string} email - Email du destinataire
     * @param {string} resetToken - Token de réinitialisation
     */
    async sendPasswordResetEmail(email, resetToken) {
        return this.sendEmail({
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            template: this.templates.PASSWORD_RESET,
            data: {
                resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
            }
        });
    }

    /**
     * Envoi d'une confirmation d'inscription à un cours
     * @param {string} email - Email de l'étudiant
     * @param {string} studentName - Nom de l'étudiant
     * @param {Object} course - Informations du cours
     * @param {Object} payment - Informations du paiement
     */
    async sendCourseEnrollmentEmail(email, studentName, course, payment) {
        return this.sendEmail({
            to: email,
            subject: `Confirmation d'inscription - ${course.title}`,
            template: this.templates.COURSE_ENROLLMENT,
            data: {
                studentName,
                courseTitle: course.title,
                courseDescription: course.description,
                teacherName: course.teacher.fullName,
                amount: payment.amount,
                paymentDate: new Date(payment.createdAt).toLocaleDateString('fr-FR'),
                courseUrl: `${process.env.FRONTEND_URL}/courses/${course._id}`
            }
        });
    }

    /**
     * Envoi d'un rappel pour un devoir à rendre
     * @param {string} email - Email de l'étudiant
     * @param {string} studentName - Nom de l'étudiant
     * @param {Object} assignment - Informations du devoir
     * @param {Object} course - Informations du cours
     */
    async sendAssignmentDueReminder(email, studentName, assignment, course) {
        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        const hoursLeft = Math.floor((dueDate - now) / (1000 * 60 * 60));

        return this.sendEmail({
            to: email,
            subject: `Rappel: Devoir à rendre - ${assignment.title}`,
            template: this.templates.ASSIGNMENT_DUE,
            data: {
                studentName,
                assignmentTitle: assignment.title,
                courseTitle: course.title,
                dueDate: dueDate.toLocaleDateString('fr-FR'),
                hoursLeft,
                assignmentUrl: `${process.env.FRONTEND_URL}/courses/${course._id}/assignments/${assignment._id}`
            }
        });
    }

    /**
     * Envoi d'un rappel pour un cours en direct
     * @param {string} email - Email du participant
     * @param {string} participantName - Nom du participant
     * @param {Object} liveClass - Informations du cours en direct
     */
    async sendLiveClassReminder(email, participantName, liveClass) {
        const startTime = new Date(liveClass.startTime);
        
        return this.sendEmail({
            to: email,
            subject: `Rappel: Cours en direct - ${liveClass.title}`,
            template: this.templates.LIVE_CLASS_REMINDER,
            data: {
                participantName,
                liveClassTitle: liveClass.title,
                startTime: startTime.toLocaleString('fr-FR'),
                joinUrl: `${process.env.FRONTEND_URL}/live/${liveClass._id}`,
                teacherName: liveClass.teacher.fullName
            }
        });
    }
}

module.exports = new EmailService();