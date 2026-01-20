const nodemailer = require('nodemailer');

// Configuration du transporteur
const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou autre service: 'outlook', 'yahoo', etc.
    auth: {
        user: process.env.EMAIL_USER || 'votre-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'votre-mot-de-passe-app'
    }
});

// Alternative SMTP direct (plus fiable)
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Fonction d'envoi d'email
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"Educours Platform" <${process.env.SMTP_FROM || 'noreply@educours.com'}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé:', info.messageId);
        return info;
    } catch (error) {
        console.error('Erreur envoi email:', error);
        throw error;
    }
};

// Templates d'emails
const emailTemplates = {
    welcome: (name, verificationLink) => ({
        subject: 'Bienvenue sur Educours Platform!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Bienvenue ${name}!</h2>
                <p>Merci de vous être inscrit sur Educours Platform.</p>
                <p>Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous:</p>
                <a href="${verificationLink}" 
                   style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Vérifier mon email
                </a>
                <p>Ou copiez ce lien: ${verificationLink}</p>
                <p>Ce lien expire dans 24 heures.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                    Si vous ne vous êtes pas inscrit, ignorez cet email.
                </p>
            </div>
        `
    }),
    
    passwordReset: (name, resetLink) => ({
        subject: 'Réinitialisation de votre mot de passe',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #DC2626;">Réinitialisation de mot de passe</h2>
                <p>Bonjour ${name},</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe:</p>
                <a href="${resetLink}" 
                   style="background-color: #DC2626; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Réinitialiser mon mot de passe
                </a>
                <p>Ou copiez ce lien: ${resetLink}</p>
                <p>Ce lien expire dans 1 heure.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
        `
    }),
    
    courseEnrollment: (name, courseTitle) => ({
        subject: `Inscription confirmée - ${courseTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Inscription confirmée!</h2>
                <p>Félicitations ${name}!</p>
                <p>Vous êtes maintenant inscrit au cours: <strong>${courseTitle}</strong></p>
                <p>Vous pouvez commencer votre apprentissage immédiatement.</p>
                <a href="${process.env.FRONTEND_URL}/dashboard" 
                   style="background-color: #059669; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Accéder à mon dashboard
                </a>
                <p>Bon apprentissage!</p>
            </div>
        `
    }),
    
    paymentConfirmation: (name, amount, courseTitle) => ({
        subject: 'Confirmation de paiement',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #059669;">Paiement confirmé!</h2>
                <p>Bonjour ${name},</p>
                <p>Votre paiement de <strong>${amount}€</strong> pour le cours 
                   <strong>${courseTitle}</strong> a été traité avec succès.</p>
                <p>Vous pouvez maintenant accéder au cours depuis votre dashboard.</p>
                <p>Merci pour votre confiance!</p>
            </div>
        `
    })
};

// Fonction pour envoyer un template
const sendTemplateEmail = async (to, templateName, data) => {
    const template = emailTemplates[templateName];
    if (!template) {
        throw new Error(`Template ${templateName} non trouvé`);
    }
    
    const { subject, html } = template(...data);
    
    return sendEmail({
        to,
        subject,
        html
    });
};

// Version SIMPLIFIÉE pour test (sans nodemailer)
const sendEmailSimple = async (options) => {
    console.log('📧 Email simulé envoyé à:', options.to);
    console.log('📋 Sujet:', options.subject);
    console.log('🔗 Lien dans email:', options.html?.match(/https?:\/\/[^\s"']+/)?.[0] || 'Aucun lien');
    
    // En mode développement, retourner un succès simulé
    return {
        messageId: `simulated-${Date.now()}`,
        accepted: [options.to],
        rejected: []
    };
};

// Utilisez la version simple en développement
module.exports = process.env.NODE_ENV === 'production' ? sendEmail : sendEmailSimple;
module.exports.sendTemplateEmail = sendTemplateEmail;
module.exports.emailTemplates = emailTemplates;