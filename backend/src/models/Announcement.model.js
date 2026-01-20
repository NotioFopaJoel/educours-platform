// backend/src/models/Announcement.model.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    // Relations
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        index: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Contenu
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        maxlength: 5000
    },
    summary: {
        type: String,
        maxlength: 500
    },
    
    // Type et catégorie
    type: {
        type: String,
        enum: ['general', 'course', 'system', 'event', 'reminder', 'update', 'important'],
        default: 'general',
        index: true
    },
    category: {
        type: String,
        enum: ['announcement', 'news', 'update', 'maintenance', 'security', 'feature'],
        default: 'announcement'
    },
    
    // Audience
    audience: {
        type: {
            type: String,
            enum: ['all', 'students', 'teachers', 'admins', 'specific_course', 'specific_group'],
            default: 'all'
        },
        recipients: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group'
        },
        roles: [String],
        filters: {
            enrollmentStatus: [String],
            subscriptionLevel: [String],
            country: [String],
            language: [String]
        }
    },
    
    // Pièces jointes
    attachments: [{
        filename: String,
        originalName: String,
        fileType: String,
        fileSize: Number,
        fileUrl: String,
        thumbnailUrl: String
    }],
    
    // Liens et références
    links: [{
        url: String,
        title: String,
        description: String,
        type: {
            type: String,
            enum: ['resource', 'external', 'course', 'assignment']
        }
    }],
    
    // Dates importantes
    publishedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    scheduledFor: {
        type: Date,
        index: true
    },
    expiresAt: {
        type: Date,
        index: true
    },
    
    // Priorité et importance
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    },
    isImportant: {
        type: Boolean,
        default: false,
        index: true
    },
    isPinned: {
        type: Boolean,
        default: false,
        index: true
    },
    pinnedUntil: Date,
    
    // Visibilité et statut
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'published', 'archived', 'deleted'],
        default: 'draft',
        index: true
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'unlisted'],
        default: 'public'
    },
    
    // Engagement et statistiques
    stats: {
        views: {
            type: Number,
            default: 0
        },
        uniqueViews: {
            type: Number,
            default: 0
        },
        clicks: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        },
        commentsCount: {
            type: Number,
            default: 0
        }
    },
    
    // Interactions
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reaction: {
            type: String,
            enum: ['like', 'love', 'insightful', 'helpful', 'celebrate']
        },
        reactedAt: Date
    }],
    
    // Commentaires
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: {
            type: String,
            required: true,
            maxlength: 1000
        },
        attachments: [{
            filename: String,
            fileUrl: String,
            fileType: String
        }],
        isEdited: {
            type: Boolean,
            default: false
        },
        editedAt: Date,
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        replies: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            content: String,
            repliedAt: Date,
            likes: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }]
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Notification et diffusion
    notificationSettings: {
        sendEmail: {
            type: Boolean,
            default: false
        },
        sendPush: {
            type: Boolean,
            default: true
        },
        sendInApp: {
            type: Boolean,
            default: true
        },
        emailTemplate: String,
        pushTitle: String,
        pushBody: String
    },
    
    // Suivi de lecture
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: Date,
        readCount: {
            type: Number,
            default: 1
        }
    }],
    
    // Métadonnées
    metadata: {
        language: {
            type: String,
            default: 'fr'
        },
        tags: [String],
        authorInfo: {
            name: String,
            avatar: String,
            role: String
        },
        version: {
            type: Number,
            default: 1
        },
        originalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Announcement'
        }
    },
    
    // État
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Historique des modifications
    history: [{
        action: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changes: mongoose.Schema.Types.Mixed,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
announcementSchema.index({ course: 1, publishedAt: -1 });
announcementSchema.index({ author: 1, status: 1 });
announcementSchema.index({ 'audience.type': 1, publishedAt: -1 });
announcementSchema.index({ isImportant: 1, publishedAt: -1 });
announcementSchema.index({ isPinned: 1 });
announcementSchema.index({ status: 1, scheduledFor: 1 });
announcementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Méthodes d'instance
announcementSchema.methods.markAsRead = function(userId) {
    const existingRead = this.readBy.find(read => 
        read.user.toString() === userId.toString()
    );
    
    if (existingRead) {
        existingRead.readCount += 1;
        existingRead.readAt = new Date();
    } else {
        this.readBy.push({
            user: userId,
            readAt: new Date(),
            readCount: 1
        });
        
        this.stats.uniqueViews += 1;
    }
    
    this.stats.views += 1;
    
    return this.save();
};

announcementSchema.methods.addReaction = function(userId, reaction) {
    const existingReaction = this.reactions.find(r => 
        r.user.toString() === userId.toString()
    );
    
    if (existingReaction) {
        existingReaction.reaction = reaction;
        existingReaction.reactedAt = new Date();
    } else {
        this.reactions.push({
            user: userId,
            reaction,
            reactedAt: new Date()
        });
    }
    
    return this.save();
};

announcementSchema.methods.addComment = function(userId, content, attachments = []) {
    const comment = {
        user: userId,
        content,
        attachments,
        createdAt: new Date(),
        likes: [],
        replies: []
    };
    
    this.comments.push(comment);
    this.stats.commentsCount += 1;
    
    // Ajouter à l'historique
    this.history.push({
        action: 'comment_added',
        changedBy: userId,
        changes: { commentId: comment._id },
        timestamp: new Date()
    });
    
    return this.save().then(() => comment);
};

announcementSchema.methods.publish = function() {
    if (this.status === 'draft' || this.status === 'scheduled') {
        this.status = 'published';
        this.publishedAt = new Date();
        
        // Si c'était programmé, mettre à jour la date de publication
        if (this.scheduledFor && this.scheduledFor > new Date()) {
            this.publishedAt = this.scheduledFor;
        }
        
        // Ajouter à l'historique
        this.history.push({
            action: 'published',
            changedBy: this.author,
            changes: { publishedAt: this.publishedAt },
            timestamp: new Date()
        });
    }
    
    return this.save();
};

announcementSchema.methods.schedule = function(publishDate) {
    this.status = 'scheduled';
    this.scheduledFor = publishDate;
    
    // Ajouter à l'historique
    this.history.push({
        action: 'scheduled',
        changedBy: this.author,
        changes: { scheduledFor: publishDate },
        timestamp: new Date()
    });
    
    return this.save();
};

announcementSchema.methods.pin = function(untilDate = null) {
    this.isPinned = true;
    this.pinnedUntil = untilDate;
    
    return this.save();
};

announcementSchema.methods.unpin = function() {
    this.isPinned = false;
    this.pinnedUntil = null;
    
    return this.save();
};

// Middleware pre-save
announcementSchema.pre('save', function(next) {
    // Générer un résumé si non fourni
    if (!this.summary && this.content) {
        this.summary = this.content.length > 200 
            ? this.content.substring(0, 200) + '...'
            : this.content;
    }
    
    // Mettre à jour les informations de l'auteur
    if (this.isNew && !this.metadata.authorInfo) {
        const User = mongoose.model('User');
        User.findById(this.author)
            .then(user => {
                if (user) {
                    this.metadata.authorInfo = {
                        name: user.name,
                        avatar: user.avatar,
                        role: user.role
                    };
                }
                next();
            })
            .catch(next);
    } else {
        next();
    }
});

// Méthodes statiques
announcementSchema.statics.getCourseAnnouncements = async function(courseId, options = {}) {
    const { 
        page = 1, 
        limit = 20, 
        status = 'published',
        importantOnly = false,
        pinnedOnly = false
    } = options;
    
    const query = { course: courseId, status };
    
    if (importantOnly) query.isImportant = true;
    if (pinnedOnly) query.isPinned = true;
    
    const announcements = await this.find(query)
        .populate('author', 'name avatar role')
        .sort({ 
            isPinned: -1,
            isImportant: -1,
            publishedAt: -1 
        })
        .skip((page - 1) * limit)
        .limit(limit);
    
    const total = await this.countDocuments(query);
    
    return {
        announcements,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

announcementSchema.statics.getUserAnnouncements = async function(userId, options = {}) {
    const { 
        page = 1, 
        limit = 20,
        role,
        courseId
    } = options;
    
    const query = {
        status: 'published',
        $or: [
            { 'audience.type': 'all' },
            { 'audience.type': 'students', 'audience.roles': { $in: [role || 'student'] } },
            { 'audience.type': 'teachers', 'audience.recipients': userId },
            { 'audience.type': 'specific_course', 'audience.courseId': courseId },
            { 'audience.recipients': userId }
        ]
    };
    
    // Filtrer par cours si spécifié
    if (courseId) {
        query.$or.push({ course: courseId });
    }
    
    const announcements = await this.find(query)
        .populate('author', 'name avatar role')
        .populate('course', 'title thumbnail')
        .sort({ 
            isPinned: -1,
            isImportant: -1,
            publishedAt: -1 
        })
        .skip((page - 1) * limit)
        .limit(limit);
    
    const total = await this.countDocuments(query);
    
    return {
        announcements,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

announcementSchema.statics.getScheduledAnnouncements = async function() {
    return this.find({
        status: 'scheduled',
        scheduledFor: { $lte: new Date() }
    });
};

announcementSchema.statics.processScheduledAnnouncements = async function() {
    const scheduled = await this.getScheduledAnnouncements();
    
    for (const announcement of scheduled) {
        await announcement.publish();
        
        // Envoyer des notifications si configuré
        if (announcement.notificationSettings.sendEmail || announcement.notificationSettings.sendPush) {
            // Ici, vous intégrerez votre service de notification
            console.log(`Annonce programmée publiée: ${announcement.title}`);
        }
    }
    
    return scheduled.length;
};

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;