// backend/src/services/notification.service.js
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const mongoose = require('mongoose');
//const EventEmitter = require('events');

// Créer un émetteur d'événements pour les notifications en temps réel
class NotificationEmitter extends EventEmitter {}
const notificationEmitter = new NotificationEmitter();

/**
 * Service de gestion des notifications
 * Version sans WebSocket - Utilise EventEmitter pour les événements
 */
class NotificationService {
    /**
     * Envoyer une notification à un utilisateur
     * @param {Object} notificationData - Données de la notification
     */
    static async sendNotification(notificationData) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const {
                userId,
                title,
                message,
                type = 'info',
                priority = 'medium',
                actionUrl,
                metadata = {},
                expiresAt,
                sendEmail = true
            } = notificationData;

            // Validation des données
            if (!userId || !title || !message) {
                throw new Error('userId, title et message sont requis');
            }

            // Vérifier que l'utilisateur existe
            const user = await User.findById(userId).select('email name notificationPreferences');
            if (!user) {
                throw new Error(`Utilisateur ${userId} non trouvé`);
            }

            // Respecter les préférences de notification de l'utilisateur
            const userPrefs = user.notificationPreferences || {};
            if (userPrefs[type] === false) {
                console.log(`Notification de type ${type} désactivée pour l'utilisateur ${userId}`);
                await session.abortTransaction();
                return {
                    success: false,
                    message: 'Notifications désactivées pour ce type'
                };
            }

            // Créer la notification
            const notification = new Notification({
                user: userId,
                title,
                message,
                type,
                priority,
                actionUrl,
                metadata,
                expiresAt: expiresAt || this.calculateExpiryDate(priority),
                status: 'unread',
                readAt: null,
                sentAt: new Date()
            });

            await notification.save({ session });

            // Émettre un événement de notification
            this.emitNotificationEvent(userId, notification);

            // Envoyer par email si activé
            let emailSent = false;
            if (sendEmail && (priority === 'high' || type === 'payment')) {
                emailSent = await this.sendEmailNotification(user, notification);
            }

            await session.commitTransaction();

            // Mettre à jour les statistiques utilisateur
            await this.updateUserNotificationStats(userId);

            return {
                success: true,
                notification: {
                    id: notification._id,
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    priority: notification.priority,
                    actionUrl: notification.actionUrl,
                    status: notification.status,
                    sentAt: notification.sentAt,
                    metadata: notification.metadata
                },
                emailSent,
                message: 'Notification envoyée avec succès'
            };
        } catch (error) {
            await session.abortTransaction();
            console.error('Erreur lors de l\'envoi de notification:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Envoyer une notification à plusieurs utilisateurs
     * @param {Array} userIds - Liste des IDs utilisateurs
     * @param {Object} notificationData - Données de la notification
     */
    static async sendBulkNotification(userIds, notificationData) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const results = {
                success: 0,
                failed: 0,
                errors: []
            };

            // Vérifier les utilisateurs existants et leurs préférences
            const users = await User.find({ _id: { $in: userIds } })
                .select('_id email name notificationPreferences');
            
            const notifications = [];
            const usersToNotify = [];

            for (const user of users) {
                const userPrefs = user.notificationPreferences || {};
                const notificationType = notificationData.type || 'info';
                
                // Vérifier si l'utilisateur accepte ce type de notification
                if (userPrefs[notificationType] !== false) {
                    usersToNotify.push(user._id);
                }
            }

            if (usersToNotify.length === 0) {
                await session.abortTransaction();
                return {
                    success: true,
                    message: 'Aucun utilisateur ne souhaite recevoir ce type de notification',
                    totalSent: 0
                };
            }

            // Créer les notifications
            const notificationPromises = usersToNotify.map(async (userId) => {
                const notification = new Notification({
                    user: userId,
                    title: notificationData.title,
                    message: notificationData.message,
                    type: notificationData.type || 'info',
                    priority: notificationData.priority || 'medium',
                    actionUrl: notificationData.actionUrl,
                    metadata: notificationData.metadata || {},
                    expiresAt: notificationData.expiresAt || this.calculateExpiryDate(notificationData.priority),
                    status: 'unread',
                    sentAt: new Date()
                });

                await notification.save({ session });
                notifications.push(notification);

                // Émettre l'événement pour chaque utilisateur
                this.emitNotificationEvent(userId, notification);

                results.success++;
            });

            await Promise.all(notificationPromises);

            // Marquer les utilisateurs non trouvés
            const foundUserIds = users.map(u => u._id.toString());
            const nonExistingUsers = userIds.filter(id => 
                !foundUserIds.includes(id.toString())
            );
            
            if (nonExistingUsers.length > 0) {
                results.failed = nonExistingUsers.length;
                results.errors.push({
                    users: nonExistingUsers,
                    message: 'Utilisateurs non trouvés'
                });
            }

            await session.commitTransaction();

            return {
                success: true,
                results,
                totalSent: notifications.length,
                notifications: notifications.map(n => ({
                    id: n._id,
                    title: n.title,
                    userId: n.user
                }))
            };
        } catch (error) {
            await session.abortTransaction();
            console.error('Erreur lors de l\'envoi de notifications en masse:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Envoyer une notification liée à un cours
     * @param {String} courseId - ID du cours
     * @param {Object} notificationData - Données de la notification
     */
    static async sendCourseNotification(courseId, notificationData) {
        try {
            // Récupérer tous les étudiants inscrits au cours
            const course = await Course.findById(courseId)
                .populate({
                    path: 'students',
                    select: '_id notificationPreferences'
                });

            if (!course) {
                throw new Error('Cours non trouvé');
            }

            if (!course.students || course.students.length === 0) {
                return {
                    success: true,
                    message: 'Aucun étudiant inscrit à ce cours',
                    total: 0
                };
            }

            const studentIds = course.students.map(student => student._id);

            // Ajouter des métadonnées spécifiques au cours
            const courseNotificationData = {
                ...notificationData,
                metadata: {
                    ...notificationData.metadata,
                    courseId: course._id,
                    courseTitle: course.title,
                    courseThumbnail: course.thumbnail,
                    instructor: course.instructor
                }
            };

            const result = await this.sendBulkNotification(studentIds, courseNotificationData);

            return {
                success: true,
                ...result,
                course: {
                    id: course._id,
                    title: course.title,
                    totalStudents: studentIds.length
                }
            };
        } catch (error) {
            console.error('Erreur lors de l\'envoi de notification de cours:', error);
            throw error;
        }
    }

    /**
     * Émettre un événement de notification
     * @param {String} userId - ID de l'utilisateur
     * @param {Object} notification - Données de la notification
     */
    static emitNotificationEvent(userId, notification) {
        try {
            const eventData = {
                type: 'NOTIFICATION_CREATED',
                userId: userId.toString(),
                notification: {
                    id: notification._id,
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    priority: notification.priority,
                    actionUrl: notification.actionUrl,
                    status: notification.status,
                    sentAt: notification.sentAt,
                    metadata: notification.metadata
                },
                timestamp: new Date().toISOString()
            };

            // Émettre l'événement (peut être écouté par d'autres services)
            notificationEmitter.emit('notification', eventData);
            
            // Émettre un événement spécifique à l'utilisateur
            notificationEmitter.emit(`notification:${userId}`, eventData);

            // Log pour le débogage
            console.log(`Événement de notification émis pour l'utilisateur ${userId}:`, {
                title: notification.title,
                type: notification.type
            });

            return true;
        } catch (error) {
            console.warn('Erreur lors de l\'émission d\'événement de notification:', error.message);
            return false;
        }
    }

    /**
     * Écouter les événements de notification
     * @param {String} userId - ID de l'utilisateur (optionnel)
     * @param {Function} callback - Fonction de callback
     */
    static onNotification(userId, callback) {
        if (typeof userId === 'function') {
            // Écouter toutes les notifications
            callback = userId;
            notificationEmitter.on('notification', callback);
        } else {
            // Écouter les notifications d'un utilisateur spécifique
            notificationEmitter.on(`notification:${userId}`, callback);
        }
    }

    /**
     * Marquer une notification comme lue
     * @param {String} notificationId - ID de la notification
     * @param {String} userId - ID de l'utilisateur
     */
    static async markAsRead(notificationId, userId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const notification = await Notification.findOneAndUpdate(
                {
                    _id: notificationId,
                    user: userId,
                    status: 'unread'
                },
                {
                    status: 'read',
                    readAt: new Date()
                },
                { 
                    new: true,
                    session 
                }
            );

            if (!notification) {
                await session.abortTransaction();
                return {
                    success: false,
                    message: 'Notification non trouvée ou déjà lue'
                };
            }

            await session.commitTransaction();

            // Émettre un événement de notification lue
            notificationEmitter.emit(`notification:read:${userId}`, {
                notificationId,
                userId,
                readAt: notification.readAt
            });

            return {
                success: true,
                notification: {
                    id: notification._id,
                    title: notification.title,
                    status: notification.status,
                    readAt: notification.readAt
                },
                message: 'Notification marquée comme lue'
            };
        } catch (error) {
            await session.abortTransaction();
            console.error('Erreur lors du marquage comme lu:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Marquer toutes les notifications comme lues
     * @param {String} userId - ID de l'utilisateur
     */
    static async markAllAsRead(userId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const result = await Notification.updateMany(
                {
                    user: userId,
                    status: 'unread'
                },
                {
                    status: 'read',
                    readAt: new Date()
                },
                { session }
            );

            if (result.modifiedCount === 0) {
                await session.commitTransaction();
                return {
                    success: true,
                    message: 'Aucune notification à marquer comme lue',
                    modifiedCount: 0
                };
            }

            await session.commitTransaction();

            // Émettre un événement pour toutes les notifications lues
            notificationEmitter.emit(`notifications:all-read:${userId}`, {
                userId,
                modifiedCount: result.modifiedCount,
                timestamp: new Date().toISOString()
            });

            // Mettre à jour les statistiques utilisateur
            await this.updateUserNotificationStats(userId);

            return {
                success: true,
                modifiedCount: result.modifiedCount,
                message: `${result.modifiedCount} notifications marquées comme lues`
            };
        } catch (error) {
            await session.abortTransaction();
            console.error('Erreur lors du marquage de toutes les notifications:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Récupérer les notifications d'un utilisateur
     * @param {String} userId - ID de l'utilisateur
     * @param {Object} options - Options de pagination et filtrage
     */
    static async getUserNotifications(userId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                type,
                priority,
                startDate,
                endDate,
                unreadOnly = false,
                sortBy = 'sentAt',
                sortOrder = 'desc'
            } = options;

            const query = { user: userId };

            // Appliquer les filtres
            if (status) query.status = status;
            if (type) query.type = type;
            if (priority) query.priority = priority;
            if (unreadOnly) query.status = 'unread';

            // Filtre par date
            if (startDate || endDate) {
                query.sentAt = {};
                if (startDate) query.sentAt.$gte = new Date(startDate);
                if (endDate) query.sentAt.$lte = new Date(endDate);
            }

            // Ne pas inclure les notifications expirées
            query.$or = [
                { expiresAt: { $exists: false } },
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ];

            const total = await Notification.countDocuments(query);

            // Déterminer l'ordre de tri
            const sortOptions = {};
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
            sortOptions['priority'] = -1; // Toujours prioriser par priorité

            const notifications = await Notification.find(query)
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(limit)
                .select('-__v')
                .lean();

            // Compter les notifications non lues
            const unreadCount = await Notification.countDocuments({
                user: userId,
                status: 'unread',
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: null },
                    { expiresAt: { $gt: new Date() } }
                ]
            });

            // Formater les dates pour la réponse
            const formattedNotifications = notifications.map(notification => ({
                ...notification,
                isExpired: notification.expiresAt ? new Date() > new Date(notification.expiresAt) : false,
                sentAt: notification.sentAt ? notification.sentAt.toISOString() : null,
                readAt: notification.readAt ? notification.readAt.toISOString() : null,
                expiresAt: notification.expiresAt ? notification.expiresAt.toISOString() : null
            }));

            return {
                success: true,
                data: {
                    notifications: formattedNotifications,
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
                }
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des notifications:', error);
            throw error;
        }
    }

    /**
     * Obtenir le nombre de notifications non lues
     * @param {String} userId - ID de l'utilisateur
     */
    static async getUnreadCount(userId) {
        try {
            const count = await Notification.countDocuments({
                user: userId,
                status: 'unread',
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: null },
                    { expiresAt: { $gt: new Date() } }
                ]
            });

            return {
                success: true,
                count,
                message: count === 1 ? '1 notification non lue' : `${count} notifications non lues`
            };
        } catch (error) {
            console.error('Erreur lors du comptage des notifications non lues:', error);
            throw error;
        }
    }

    /**
     * Supprimer une notification
     * @param {String} notificationId - ID de la notification
     * @param {String} userId - ID de l'utilisateur
     */
    static async deleteNotification(notificationId, userId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const notification = await Notification.findOneAndDelete({
                _id: notificationId,
                user: userId
            }, { session });

            if (!notification) {
                await session.abortTransaction();
                return {
                    success: false,
                    message: 'Notification non trouvée ou accès refusé'
                };
            }

            await session.commitTransaction();

            // Émettre un événement de suppression
            notificationEmitter.emit(`notification:deleted:${userId}`, {
                notificationId,
                userId,
                timestamp: new Date().toISOString()
            });

            // Mettre à jour les statistiques
            await this.updateUserNotificationStats(userId);

            return {
                success: true,
                message: 'Notification supprimée avec succès',
                notification: {
                    id: notification._id,
                    title: notification.title
                }
            };
        } catch (error) {
            await session.abortTransaction();
            console.error('Erreur lors de la suppression de notification:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Supprimer toutes les notifications d'un utilisateur
     * @param {String} userId - ID de l'utilisateur
     * @param {Object} options - Options de filtrage
     */
    static async clearAllNotifications(userId, options = {}) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { readOnly = false, type } = options;

            const query = { user: userId };
            if (readOnly) query.status = 'read';
            if (type) query.type = type;

            const result = await Notification.deleteMany(query, { session });

            await session.commitTransaction();

            // Émettre un événement de suppression en masse
            notificationEmitter.emit(`notifications:cleared:${userId}`, {
                userId,
                deletedCount: result.deletedCount,
                options,
                timestamp: new Date().toISOString()
            });

            // Réinitialiser les statistiques
            await this.resetUserNotificationStats(userId);

            return {
                success: true,
                deletedCount: result.deletedCount,
                message: `${result.deletedCount} notifications supprimées`
            };
        } catch (error) {
            await session.abortTransaction();
            console.error('Erreur lors de la suppression des notifications:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Supprimer les notifications expirées
     */
    static async cleanupExpiredNotifications() {
        try {
            const result = await Notification.deleteMany({
                expiresAt: { $lt: new Date() },
                status: 'read'
            });

            console.log(`Nettoyage des notifications: ${result.deletedCount} notifications expirées supprimées`);

            return {
                success: true,
                deletedCount: result.deletedCount,
                message: `${result.deletedCount} notifications expirées supprimées`
            };
        } catch (error) {
            console.error('Erreur lors du nettoyage des notifications:', error);
            throw error;
        }
    }

    /**
     * Envoyer une notification par email
     * @param {Object} user - Objet utilisateur
     * @param {Object} notification - Données de la notification
     */
    static async sendEmailNotification(user, notification) {
        try {
            if (!user.email) {
                return false;
            }

            // Vérifier si l'utilisateur a désactivé les emails
            const userPrefs = user.notificationPreferences || {};
            if (userPrefs.email === false) {
                return false;
            }

            // Simuler l'envoi d'email (à remplacer par un vrai service)
            console.log(`📧 Email de notification envoyé à ${user.email}:`, {
                subject: notification.title,
                message: notification.message,
                type: notification.type
            });

            // Ici, vous intégrerez votre service d'email réel
            // Exemple avec nodemailer :
            /*
            const emailService = require('./email.service');
            await emailService.sendNotificationEmail({
                to: user.email,
                subject: notification.title,
                template: 'notification',
                data: {
                    userName: user.name,
                    notificationTitle: notification.title,
                    notificationMessage: notification.message,
                    actionUrl: notification.actionUrl,
                    priority: notification.priority
                }
            });
            */

            return true;
        } catch (error) {
            console.warn('Impossible d\'envoyer l\'email de notification:', error.message);
            return false;
        }
    }

    /**
     * Mettre à jour les statistiques de notification de l'utilisateur
     * @param {String} userId - ID de l'utilisateur
     */
    static async updateUserNotificationStats(userId) {
        try {
            const unreadCount = await Notification.countDocuments({
                user: userId,
                status: 'unread',
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: null },
                    { expiresAt: { $gt: new Date() } }
                ]
            });

            const totalCount = await Notification.countDocuments({
                user: userId,
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: null },
                    { expiresAt: { $gt: new Date() } }
                ]
            });

            // Mettre à jour l'utilisateur avec les dernières stats
            await User.findByIdAndUpdate(userId, {
                $set: {
                    'notificationStats.unreadCount': unreadCount,
                    'notificationStats.totalCount': totalCount,
                    'notificationStats.lastUpdated': new Date()
                }
            });

            return { unreadCount, totalCount };
        } catch (error) {
            console.warn('Erreur lors de la mise à jour des statistiques:', error.message);
            return null;
        }
    }

    /**
     * Réinitialiser les statistiques de notification
     * @param {String} userId - ID de l'utilisateur
     */
    static async resetUserNotificationStats(userId) {
        try {
            await User.findByIdAndUpdate(userId, {
                $set: {
                    'notificationStats.unreadCount': 0,
                    'notificationStats.totalCount': 0,
                    'notificationStats.lastUpdated': new Date()
                }
            });
        } catch (error) {
            console.warn('Erreur lors de la réinitialisation des statistiques:', error.message);
        }
    }

    /**
     * Calculer la date d'expiration selon la priorité
     * @param {String} priority - Priorité de la notification
     * @returns {Date} Date d'expiration
     */
    static calculateExpiryDate(priority) {
        const now = new Date();
        
        switch (priority) {
            case 'low':
                return new Date(now.setDate(now.getDate() + 7)); // 7 jours
            case 'medium':
                return new Date(now.setDate(now.getDate() + 30)); // 30 jours
            case 'high':
                return new Date(now.setDate(now.getDate() + 90)); // 90 jours
            default:
                return new Date(now.setDate(now.getDate() + 30));
        }
    }

    /**
     * Types de notifications prédéfinis
     */
    static NOTIFICATION_TYPES = {
        COURSE: {
            NEW_COURSE: 'course_new',
            COURSE_UPDATED: 'course_updated',
            COURSE_PUBLISHED: 'course_published',
            COURSE_COMPLETED: 'course_completed',
            NEW_LESSON: 'lesson_new',
            LIVE_CLASS_SOON: 'live_class_soon',
            LIVE_CLASS_STARTED: 'live_class_started',
            COURSE_ANNOUNCEMENT: 'course_announcement'
        },
        PAYMENT: {
            PAYMENT_SUCCESS: 'payment_success',
            PAYMENT_FAILED: 'payment_failed',
            PAYMENT_REFUNDED: 'payment_refunded',
            INVOICE_READY: 'invoice_ready',
            SUBSCRIPTION_RENEWAL: 'subscription_renewal'
        },
        ASSIGNMENT: {
            ASSIGNMENT_POSTED: 'assignment_posted',
            ASSIGNMENT_SUBMITTED: 'assignment_submitted',
            ASSIGNMENT_GRADED: 'assignment_graded',
            ASSIGNMENT_DEADLINE: 'assignment_deadline',
            ASSIGNMENT_OVERDUE: 'assignment_overdue'
        },
        SYSTEM: {
            WELCOME: 'welcome',
            PROFILE_UPDATED: 'profile_updated',
            PASSWORD_CHANGED: 'password_changed',
            ACCOUNT_VERIFIED: 'account_verified',
            SECURITY_ALERT: 'security_alert'
        },
        SUPPORT: {
            TICKET_CREATED: 'ticket_created',
            TICKET_UPDATED: 'ticket_updated',
            TICKET_RESOLVED: 'ticket_resolved',
            SUPPORT_REPLY: 'support_reply'
        },
        COMMUNITY: {
            NEW_MESSAGE: 'new_message',
            NEW_COMMENT: 'new_comment',
            LIKE_RECEIVED: 'like_received',
            FOLLOW_RECEIVED: 'follow_received'
        }
    };

    /**
     * Priorités de notifications
     */
    static NOTIFICATION_PRIORITIES = {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
        URGENT: 'urgent'
    };

    /**
     * Créer une notification prédéfinie
     * @param {String} type - Type de notification prédéfini
     * @param {String} userId - ID de l'utilisateur
     * @param {Object} customData - Données personnalisées
     */
    static async createPredefinedNotification(type, userId, customData = {}) {
        const notificationTemplates = {
            // Système
            [this.NOTIFICATION_TYPES.SYSTEM.WELCOME]: {
                title: '🎉 Bienvenue sur EduCours !',
                message: 'Nous sommes ravis de vous compter parmi nous. Commencez votre parcours d\'apprentissage dès maintenant !',
                type: 'system',
                priority: 'medium',
                actionUrl: '/dashboard',
                metadata: { isWelcome: true }
            },

            // Cours
            [this.NOTIFICATION_TYPES.COURSE.NEW_COURSE]: {
                title: '📚 Nouveau cours disponible !',
                message: `Le cours "${customData.courseTitle || 'Nouveau cours'}" est maintenant disponible.`,
                type: 'course',
                priority: 'medium',
                actionUrl: `/courses/${customData.courseId}`,
                metadata: { courseId: customData.courseId }
            },

            // Paiement
            [this.NOTIFICATION_TYPES.PAYMENT.PAYMENT_SUCCESS]: {
                title: '✅ Paiement réussi !',
                message: `Votre paiement de ${customData.amount || '0'} ${customData.currency || 'USD'} a été traité avec succès.`,
                type: 'payment',
                priority: 'high',
                actionUrl: `/payments/${customData.paymentId || ''}`,
                metadata: { 
                    paymentId: customData.paymentId,
                    amount: customData.amount,
                    currency: customData.currency
                }
            },

            // Devoirs
            [this.NOTIFICATION_TYPES.ASSIGNMENT.ASSIGNMENT_GRADED]: {
                title: '📝 Devoir noté',
                message: `Votre devoir "${customData.assignmentTitle || 'Devoir'}" a été noté. Note : ${customData.grade || 'N/A'}/${customData.maxScore || '100'}`,
                type: 'assignment',
                priority: 'medium',
                actionUrl: `/assignments/${customData.assignmentId}`,
                metadata: {
                    assignmentId: customData.assignmentId,
                    grade: customData.grade,
                    maxScore: customData.maxScore
                }
            },

            // Classes en direct
            [this.NOTIFICATION_TYPES.COURSE.LIVE_CLASS_SOON]: {
                title: '⏰ Classe en direct bientôt !',
                message: `La classe en direct "${customData.classTitle || 'Classe'}" commence dans ${customData.minutes || 'quelques'} minutes.`,
                type: 'live',
                priority: 'high',
                actionUrl: `/live/${customData.classId}`,
                metadata: {
                    classId: customData.classId,
                    startTime: customData.startTime,
                    minutesUntil: customData.minutes
                }
            },

            // Support
            [this.NOTIFICATION_TYPES.SUPPORT.TICKET_RESOLVED]: {
                title: '🔧 Ticket résolu',
                message: `Votre ticket de support "${customData.ticketTitle || 'Ticket'}" a été résolu.`,
                type: 'support',
                priority: 'medium',
                actionUrl: `/support/tickets/${customData.ticketId}`,
                metadata: {
                    ticketId: customData.ticketId,
                    resolution: customData.resolution
                }
            }
        };

        const template = notificationTemplates[type];
        if (!template) {
            throw new Error(`Type de notification prédéfini non trouvé : ${type}`);
        }

        // Fusionner avec les données personnalisées
        const notificationData = {
            ...template,
            userId,
            metadata: {
                ...template.metadata,
                ...customData.metadata,
                notificationType: type,
                timestamp: new Date().toISOString(),
                version: '1.0'
            }
        };

        // Surcharger avec les données personnalisées si fournies
        if (customData.title) notificationData.title = customData.title;
        if (customData.message) notificationData.message = customData.message;
        if (customData.priority) notificationData.priority = customData.priority;
        if (customData.actionUrl) notificationData.actionUrl = customData.actionUrl;

        return await this.sendNotification(notificationData);
    }
}

// Exporter l'émetteur d'événements pour une utilisation externe
NotificationService.emitter = notificationEmitter;

module.exports =  NotificationService;