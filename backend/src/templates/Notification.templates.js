// backend/src/templates/notification.templates.js
module.exports = {
    // Template: Bienvenue
    WELCOME: {
        templateId: 'welcome_v1',
        type: 'system',
        subtype: 'welcome',
        title: '🎉 Bienvenue sur EduCours, {{userName}} !',
        message: 'Nous sommes ravis de vous compter parmi nous. Explorez nos cours, rencontrez nos enseignants et commencez votre parcours d\'apprentissage dès aujourd\'hui !',
        priority: 'medium',
        action: {
            type: 'navigate',
            route: '/dashboard',
            label: 'Accéder au tableau de bord'
        },
        icon: 'award',
        channels: { inApp: true, email: true }
    },
    
    // Template: Inscription à un cours
    COURSE_ENROLLMENT: {
        templateId: 'course_enrollment_v1',
        type: 'course',
        subtype: 'course_enrollment',
        title: '📚 Vous êtes inscrit à {{courseName}}',
        message: 'Félicitations ! Vous êtes maintenant inscrit au cours "{{courseName}}". Commencez votre apprentissage dès maintenant.',
        priority: 'medium',
        action: {
            type: 'navigate',
            route: '/courses/{{courseId}}',
            label: 'Commencer le cours'
        },
        icon: 'book',
        channels: { inApp: true, email: true }
    },
    
    // Template: Paiement réussi
    PAYMENT_SUCCESS: {
        templateId: 'payment_success_v1',
        type: 'payment',
        subtype: 'payment_success',
        title: '✅ Paiement réussi',
        message: 'Votre paiement de {{amount}} {{currency}} a été traité avec succès. Vous avez maintenant accès au cours "{{courseName}}".',
        priority: 'high',
        action: {
            type: 'navigate',
            route: '/courses/{{courseId}}',
            label: 'Accéder au cours'
        },
        icon: 'credit-card',
        channels: { inApp: true, email: true }
    },
    
    // Template: Devoir noté
    ASSIGNMENT_GRADED: {
        templateId: 'assignment_graded_v1',
        type: 'assignment',
        subtype: 'assignment_graded',
        title: '📝 Devoir noté : {{assignmentTitle}}',
        message: 'Votre devoir "{{assignmentTitle}}" a été noté. Vous avez obtenu {{grade}}/{{maxScore}}. Cliquez pour voir les commentaires du professeur.',
        priority: 'medium',
        action: {
            type: 'navigate',
            route: '/assignments/{{assignmentId}}',
            label: 'Voir la notation'
        },
        icon: 'file-text',
        channels: { inApp: true, email: false }
    },
    
    // Template: Classe en direct bientôt
    LIVE_CLASS_SOON: {
        templateId: 'live_class_soon_v1',
        type: 'live',
        subtype: 'live_class_starting',
        title: '⏰ Classe en direct bientôt !',
        message: 'La classe en direct "{{className}}" commence dans {{minutes}} minutes. Préparez-vous à rejoindre la session.',
        priority: 'high',
        action: {
            type: 'navigate',
            route: '/live/{{classId}}',
            label: 'Rejoindre la classe'
        },
        icon: 'video',
        channels: { inApp: true, push: true, email: true }
    },
    
    // Template: Badge obtenu
    BADGE_EARNED: {
        templateId: 'badge_earned_v1',
        type: 'achievement',
        subtype: 'badge_earned',
        title: '🏆 Félicitations ! Vous avez obtenu un badge',
        message: 'Vous venez d\'obtenir le badge "{{badgeName}}" pour {{achievementReason}}. Continuez votre excellent travail !',
        priority: 'medium',
        action: {
            type: 'navigate',
            route: '/profile/achievements',
            label: 'Voir mes badges'
        },
        icon: 'award',
        channels: { inApp: true, email: false }
    },
    
    // Template: Rappel de deadline
    DEADLINE_REMINDER: {
        templateId: 'deadline_reminder_v1',
        type: 'reminder',
        subtype: 'deadline_reminder',
        title: '⏰ Deadline approchant : {{assignmentTitle}}',
        message: 'Rappel : Le devoir "{{assignmentTitle}}" est à rendre dans {{hours}} heures. Assurez-vous de le soumettre à temps.',
        priority: 'high',
        action: {
            type: 'navigate',
            route: '/assignments/{{assignmentId}}',
            label: 'Soumettre le devoir'
        },
        icon: 'clock',
        channels: { inApp: true, push: true, email: true }
    },
    
    // Template: Nouveau message
    NEW_MESSAGE: {
        templateId: 'new_message_v1',
        type: 'community',
        subtype: 'new_message',
        title: '💬 Nouveau message de {{senderName}}',
        message: '{{senderName}} vous a envoyé un message : "{{messagePreview}}..."',
        priority: 'medium',
        action: {
            type: 'navigate',
            route: '/messages/{{conversationId}}',
            label: 'Voir le message'
        },
        icon: 'message-circle',
        channels: { inApp: true, push: true }
    },
    
    // Template: Cours recommandé
    COURSE_RECOMMENDATION: {
        templateId: 'course_recommendation_v1',
        type: 'course',
        subtype: 'course_recommendation',
        title: '🎯 Cours recommandé pour vous',
        message: 'Basé sur vos intérêts, nous pensons que vous aimeriez le cours "{{courseName}}" de {{teacherName}}.',
        priority: 'low',
        action: {
            type: 'navigate',
            route: '/courses/{{courseId}}',
            label: 'Découvrir le cours'
        },
        icon: 'target',
        channels: { inApp: true, email: false }
    },
    
    // Template: Certificat disponible
    CERTIFICATE_READY: {
        templateId: 'certificate_ready_v1',
        type: 'course',
        subtype: 'certificate_ready',
        title: '📜 Certificat de réussite disponible !',
        message: 'Félicitations ! Vous avez terminé le cours "{{courseName}}". Votre certificat est maintenant disponible au téléchargement.',
        priority: 'high',
        action: {
            type: 'open_url',
            url: '{{certificateUrl}}',
            label: 'Télécharger le certificat'
        },
        icon: 'file',
        channels: { inApp: true, email: true }
    }
};