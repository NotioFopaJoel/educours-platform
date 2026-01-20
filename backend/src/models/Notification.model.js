// backend/src/models/Notification.model.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // Destinataire
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Contenu de la notification
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    shortMessage: {
        type: String,
        maxlength: 150,
        trim: true
    },
    
    // Type et catégorie
    type: {
        type: String,
        required: true,
        enum: [
            'system',          // Notifications système
            'course',          // Cours et formations
            'payment',         // Paiements et facturation
            'assignment',      // Devoirs et évaluations
            'live',           // Classes en direct
            'support',        // Support et assistance
            'community',      // Communauté et interactions
            'security',       //Sécurité et compte
            'achievement',    // Réalisations et badges
            'reminder',       // Rappels
            'announcement',   // Annonces
            'promotion'       // Promotions et offres
        ],
        default: 'system',
        index: true
    },
    
    // Sous-type pour plus de précision
    subtype: {
        type: String,
        enum: [
            // System
            'welcome', 'profile_update', 'password_change', 'email_verification',
            'account_verification', 'security_alert', 'maintenance',
            
            // Course
            'course_enrollment', 'course_completion', 'course_update',
            'new_lesson', 'course_announcement', 'course_review',
            'certificate_ready', 'course_recommendation',
            
            // Payment
            'payment_success', 'payment_failed', 'payment_refund',
            'invoice_generated', 'subscription_renewal', 'payout_processed',
            'low_balance', 'promo_code_applied',
            
            // Assignment
            'assignment_posted', 'assignment_submitted', 'assignment_graded',
            'assignment_deadline', 'assignment_overdue', 'assignment_feedback',
            'quiz_available', 'quiz_completed',
            
            // Live
            'live_class_scheduled', 'live_class_starting', 'live_class_started',
            'live_class_ended', 'live_class_recording_available',
            
            // Support
            'ticket_created', 'ticket_updated', 'ticket_resolved',
            'support_reply', 'feedback_request',
            
            // Community
            'new_message', 'new_comment', 'reply_to_comment', 'like_received',
            'follow_received', 'mention', 'group_invitation',
            
            // Achievement
            'badge_earned', 'level_up', 'milestone_reached', 'streak_extended',
            'top_performer', 'course_completion_streak',
            
            // Reminder
            'study_reminder', 'deadline_reminder', 'course_reminder',
            'payment_reminder', 'live_class_reminder',
            
            // Announcement
            'platform_announcement', 'teacher_announcement', 'admin_announcement',
            
            // Promotion
            'discount_offer', 'new_feature', 'special_offer', 'referral_bonus'
        ],
        index: true
    },
    
    // Priorité
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    },
    
    // Statut
    status: {
        type: String,
        enum: ['unread', 'read', 'archived', 'deleted'],
        default: 'unread',
        index: true
    },
    
    // Action et navigation
    action: {
        type: {
            type: String,
            enum: ['navigate', 'open_url', 'open_modal', 'api_call', 'none'],
            default: 'navigate'
        },
        url: {
            type: String,
            trim: true
        },
        route: {
            type: String,
            trim: true
        },
        params: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        label: {
            type: String,
            trim: true
        }
    },
    
    // Données associées
    relatedTo: {
        type: {
            type: String,
            enum: ['course', 'assignment', 'payment', 'live_class', 'user', 'ticket', 'message', 'none'],
            default: 'none'
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'relatedTo.type'
        },
        title: String,
        thumbnail: String,
        metadata: mongoose.Schema.Types.Mixed
    },
    
    // Images et icônes
    icon: {
        type: String,
        default: 'bell'
    },
    imageUrl: {
        type: String,
        trim: true
    },
    avatarUrl: {
        type: String,
        trim: true
    },
    
    // Expiration et programmation
    expiresAt: {
        type: Date,
        index: true
    },
    scheduledFor: {
        type: Date,
        index: true
    },
    sentAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    readAt: {
        type: Date
    },
    
    // Diffusion et canaux
    channels: {
        inApp: {
            type: Boolean,
            default: true
        },
        email: {
            type: Boolean,
            default: false
        },
        push: {
            type: Boolean,
            default: false
        },
        sms: {
            type: Boolean,
            default: false
        }
    },
    deliveryStatus: {
        inApp: {
            delivered: { type: Boolean, default: false },
            deliveredAt: Date
        },
        email: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            opened: { type: Boolean, default: false },
            openedAt: Date
        },
        push: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            received: { type: Boolean, default: false },
            receivedAt: Date
        }
    },
    
    // Métadonnées
    metadata: {
        source: {
            type: String,
            enum: ['system', 'teacher', 'admin', 'student', 'automated'],
            default: 'system'
        },
        sourceId: mongoose.Schema.Types.ObjectId,
        trigger: String,
        campaignId: String,
        templateId: String,
        version: {
            type: String,
            default: '1.0'
        },
        tags: [String],
        locale: {
            type: String,
            default: 'fr'
        },
        data: mongoose.Schema.Types.Mixed
    },
    
    // Personnalisation
    personalization: {
        userName: String,
        userEmail: String,
        courseName: String,
        teacherName: String,
        amount: Number,
        currency: String,
        date: String,
        time: String,
        customFields: mongoose.Schema.Types.Mixed
    },
    
    // Statistiques d'interaction
    interaction: {
        clicks: {
            type: Number,
            default: 0
        },
        lastClickAt: Date,
        dismissals: {
            type: Number,
            default: 0
        },
        lastDismissedAt: Date
    },
    
    // Groupement et agrégation
    groupKey: {
        type: String,
        index: true
    },
    isGrouped: {
        type: Boolean,
        default: false
    },
    groupCount: {
        type: Number,
        default: 1
    },
    groupItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification'
    }],
    
    // Sécurité et contrôle d'accès
    visibility: {
        type: String,
        enum: ['public', 'private', 'role_based'],
        default: 'private'
    },
    allowedRoles: [String],
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    // État
    isActive: {
        type: Boolean,
        default: true
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    
    // Historique
    history: [{
        action: String,
        changedBy: mongoose.Schema.Types.ObjectId,
        changes: mongoose.Schema.Types.Mixed,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes composés pour optimiser les requêtes fréquentes
notificationSchema.index({ user: 1, status: 1, sentAt: -1 });
notificationSchema.index({ user: 1, type: 1, sentAt: -1 });
notificationSchema.index({ user: 1, priority: 1, sentAt: -1 });
notificationSchema.index({ 'relatedTo.type': 1, 'relatedTo.id': 1 });
notificationSchema.index({ groupKey: 1, sentAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ scheduledFor: 1 }, { sparse: true });

// Virtuals
notificationSchema.virtual('isExpired').get(function() {
    return this.expiresAt && new Date() > this.expiresAt;
});

notificationSchema.virtual('isScheduled').get(function() {
    return this.scheduledFor && new Date() < this.scheduledFor;
});

notificationSchema.virtual('isUnread').get(function() {
    return this.status === 'unread';
});

notificationSchema.virtual('ageInMinutes').get(function() {
    return Math.floor((new Date() - this.sentAt) / (1000 * 60));
});

notificationSchema.virtual('formattedSentAt').get(function() {
    const now = new Date();
    const sentDate = new Date(this.sentAt);
    const diffInMinutes = Math.floor((now - sentDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    
    return sentDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
});

// Méthodes d'instance
notificationSchema.methods.markAsRead = function() {
    if (this.status === 'unread') {
        this.status = 'read';
        this.readAt = new Date();
        
        this.history.push({
            action: 'marked_as_read',
            timestamp: new Date()
        });
    }
    return this.save();
};

notificationSchema.methods.markAsUnread = function() {
    this.status = 'unread';
    this.readAt = null;
    
    this.history.push({
        action: 'marked_as_unread',
        timestamp: new Date()
    });
    
    return this.save();
};

notificationSchema.methods.archive = function() {
    this.status = 'archived';
    this.isArchived = true;
    
    this.history.push({
        action: 'archived',
        timestamp: new Date()
    });
    
    return this.save();
};

notificationSchema.methods.unarchive = function() {
    this.status = 'read';
    this.isArchived = false;
    
    this.history.push({
        action: 'unarchived',
        timestamp: new Date()
    });
    
    return this.save();
};

notificationSchema.methods.trackClick = function() {
    this.interaction.clicks += 1;
    this.interaction.lastClickAt = new Date();
    
    return this.save();
};

notificationSchema.methods.trackDismissal = function() {
    this.interaction.dismissals += 1;
    this.interaction.lastDismissedAt = new Date();
    
    return this.save();
};

notificationSchema.methods.updateDeliveryStatus = function(channel, status) {
    if (!this.deliveryStatus[channel]) {
        this.deliveryStatus[channel] = {};
    }
    
    Object.assign(this.deliveryStatus[channel], status);
    
    if (status.sent || status.delivered) {
        this.deliveryStatus[channel].sentAt = new Date();
    }
    
    if (status.opened) {
        this.deliveryStatus[channel].openedAt = new Date();
    }
    
    if (status.received) {
        this.deliveryStatus[channel].receivedAt = new Date();
    }
    
    return this.save();
};

notificationSchema.methods.getFormattedAction = function() {
    if (this.action.type === 'navigate' && this.action.route) {
        return {
            type: 'navigate',
            route: this.action.route,
            params: this.action.params || {},
            label: this.action.label || 'Voir'
        };
    }
    
    if (this.action.type === 'open_url' && this.action.url) {
        return {
            type: 'open_url',
            url: this.action.url,
            label: this.action.label || 'Ouvrir'
        };
    }
    
    return null;
};

notificationSchema.methods.isActionable = function() {
    return ['navigate', 'open_url', 'open_modal', 'api_call'].includes(this.action.type);
};

notificationSchema.methods.isValidForUser = function(userId, userRole) {
    if (this.visibility === 'private' && this.user.toString() !== userId.toString()) {
        return false;
    }
    
    if (this.visibility === 'role_based' && this.allowedRoles.length > 0) {
        if (!this.allowedRoles.includes(userRole)) {
            return false;
        }
    }
    
    if (this.allowedUsers && this.allowedUsers.length > 0) {
        const allowedUserIds = this.allowedUsers.map(u => u.toString());
        if (!allowedUserIds.includes(userId.toString())) {
            return false;
        }
    }
    
    return !this.isExpired && this.isActive && !this.isArchived;
};

// Middleware pre-save
notificationSchema.pre('save', function(next) {
    // Générer un message court si non fourni
    if (!this.shortMessage && this.message) {
        this.shortMessage = this.message.length > 150 
            ? this.message.substring(0, 147) + '...'
            : this.message;
    }
    
    // Mettre à jour l'icône selon le type
    if (!this.icon) {
        const iconMap = {
            'system': 'settings',
            'course': 'book',
            'payment': 'credit-card',
            'assignment': 'file-text',
            'live': 'video',
            'support': 'help-circle',
            'community': 'users',
            'security': 'shield',
            'achievement': 'award',
            'reminder': 'clock',
            'announcement': 'megaphone',
            'promotion': 'gift'
        };
        this.icon = iconMap[this.type] || 'bell';
    }
    
    // Définir l'expiration par défaut selon la priorité
    if (!this.expiresAt) {
        const now = new Date();
        switch (this.priority) {
            case 'low':
                now.setDate(now.getDate() + 7); // 7 jours
                break;
            case 'medium':
                now.setDate(now.getDate() + 30); // 30 jours
                break;
            case 'high':
                now.setDate(now.getDate() + 90); // 90 jours
                break;
            case 'urgent':
                now.setDate(now.getDate() + 180); // 180 jours
                break;
        }
        this.expiresAt = now;
    }
    
    // Ajouter à l'historique pour les nouvelles notifications
    if (this.isNew) {
        this.history.push({
            action: 'created',
            timestamp: new Date()
        });
    }
    
    next();
});

// Méthodes statiques
notificationSchema.statics.findByUser = async function(userId, options = {}) {
    const {
        page = 1,
        limit = 20,
        status,
        type,
        subtype,
        priority,
        unreadOnly = false,
        includeExpired = false,
        includeArchived = false,
        sortBy = 'sentAt',
        sortOrder = 'desc'
    } = options;
    
    const query = { user: userId };
    
    // Filtres de base
    if (status) query.status = status;
    if (type) query.type = type;
    if (subtype) query.subtype = subtype;
    if (priority) query.priority = priority;
    
    // Filtres spéciaux
    if (unreadOnly) query.status = 'unread';
    if (!includeArchived) query.isArchived = false;
    
    // Exclusion des notifications expirées
    if (!includeExpired) {
        query.$or = [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ];
    }
    
    // Exclusion des notifications programmées non encore envoyées
    query.$or = query.$or || [];
    query.$or.push(
        { scheduledFor: { $exists: false } },
        { scheduledFor: null },
        { scheduledFor: { $lte: new Date() } }
    );
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Toujours trier par priorité d'abord pour les non lus
    if (unreadOnly) {
        sortOptions.priority = -1;
    }
    
    const notifications = await this.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email avatar')
        .populate('relatedTo.id')
        .lean();
    
    const total = await this.countDocuments(query);
    
    // Compter les notifications non lues
    const unreadQuery = { ...query, status: 'unread' };
    const unreadCount = await this.countDocuments(unreadQuery);
    
    return {
        notifications,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        },
        stats: {
            total,
            unread: unreadCount,
            read: total - unreadCount
        }
    };
};

notificationSchema.statics.getUnreadCount = async function(userId) {
    const count = await this.countDocuments({
        user: userId,
        status: 'unread',
        isActive: true,
        isArchived: false,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    });

    return count;
};

notificationSchema.statics.markAllAsRead = async function(userId) {
    const result = await this.updateMany(
        {
            user: userId,
            status: 'unread',
            isActive: true,
            isArchived: false
        },
        {
            $set: {
                status: 'read',
                readAt: new Date()
            },
            $push: {
                history: {
                    action: 'marked_as_read_bulk',
                    timestamp: new Date()
                }
            }
        }
    );
    
    return result.modifiedCount;
};

notificationSchema.statics.createFromTemplate = async function(template, data) {
    const {
        userId,
        type,
        subtype,
        title,
        message,
        priority = 'medium',
        action,
        relatedTo,
        personalization,
        metadata,
        channels = { inApp: true }
    } = template;
    
    // Remplacer les variables de personnalisation
    const processTemplate = (templateString, data) => {
        if (!templateString) return '';
        
        return templateString.replace( (match, key) => {
            return data[key] || match;
        });
    };
    
    const processedTitle = processTemplate(title, { ...personalization, ...data });
    const processedMessage = processTemplate(message, { ...personalization, ...data });
    
    const notification = new this({
        user: userId,
        title: processedTitle,
        message: processedMessage,
        type,
        subtype,
        priority,
        action: action || { type: 'none' },
        relatedTo: relatedTo || { type: 'none' },
        personalization: { ...personalization, ...data },
        metadata: {
            ...metadata,
            source: metadata?.source || 'system',
            templateId: template.templateId,
            data
        },
        channels,
        sentAt: new Date()
    });
    
    await notification.save();
    return notification;
};

notificationSchema.statics.sendBulkNotifications = async function(userIds, template, data) {
    const notifications = [];
    const batchSize = 50;
    
    for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const batchPromises = batch.map(userId => 
            this.createFromTemplate({ ...template, userId }, data)
                .catch(err => {
                    console.error(`Erreur création notification pour ${userId}:`, err.message);
                    return null;
                })
        );
        
        const batchResults = await Promise.all(batchPromises);
        notifications.push(...batchResults.filter(n => n !== null));
    }
    
    return notifications;
};

notificationSchema.statics.cleanupExpired = async function() {
    const result = await this.deleteMany({
        expiresAt: { $lt: new Date() },
        status: { $in: ['read', 'archived'] }
    });
    
    return result.deletedCount;
};

notificationSchema.statics.processScheduled = async function() {
    const scheduled = await this.find({
        scheduledFor: { $lte: new Date() },
        status: 'unread',
        isActive: true
    });
    
    for (const notification of scheduled) {
        notification.sentAt = new Date();
        await notification.save();
        
        // Ici, vous pourriez déclencher l'envoi par d'autres canaux
        // (email, push, etc.)
    }
    
    return scheduled.length;
};

// Hook post-save pour les événements en temps réel
notificationSchema.post('save', async function(doc) {
    // Émettre un événement pour les notifications en temps réel
    if (process.env.NODE_ENV !== 'test') {
        try {
            const { emitNotificationEvent } = require('../services/notification.service');
            if (emitNotificationEvent) {
                await emitNotificationEvent(doc.user, doc);
            }
        } catch (error) {
            console.warn('Impossible d\'émettre l\'événement de notification:', error.message);
        }
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;