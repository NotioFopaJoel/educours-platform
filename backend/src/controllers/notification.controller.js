
// const Notification = require('../models/Notification.model');
const NotificationService = require('../services/notification.service');
const logger = require('../utils/logger');

class NotificationController {
    // GET /api/notification - Notifications de l'utilisateur
    async getUserNotifications(req, res) {
        try {
            const { page = 1, limit = 20, unreadOnly } = req.query;

            const result = await NotificationService.getUserNotifications(req.user._id, {
                page: parseInt(page),
                limit: parseInt(limit),
                unreadOnly: unreadOnly === 'true'
            });

            res.json(result);
        } catch (error) {
            logger.error('Get user notifications error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // GET /api/notification/unread-count - Nombre de notifications non lues
    async getUnreadCount(req, res) {
        try {
            const result = await NotificationService.getUnreadCount(req.user._id);
            res.json(result);
        } catch (error) {
            logger.error('Get unread count error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // PUT /api/notification/:id/read - Marquer comme lu
    async markAsRead(req, res) {
        try {
            const result = await NotificationService.markAsRead(req.params.id, req.user._id);
            res.json(result);
        } catch (error) {
            logger.error('Mark as read error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // PUT /api/notification/read-all - Tout marquer comme lu
    async markAllAsRead(req, res) {
        try {
            const result = await NotificationService.markAllAsRead(req.user._id);
            res.json(result);
        } catch (error) {
            logger.error('Mark all as read error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // DELETE /api/notification/:id - Supprimer une notification
    async deleteNotification(req, res) {
        try {
            const result = await NotificationService.deleteNotification(req.params.id, req.user._id);
            res.json(result);
        } catch (error) {
            logger.error('Delete notification error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // DELETE /api/notification - Supprimer toutes les notifications
    async clearAllNotifications(req, res) {
        try {
            const { readOnly, type } = req.query;
            const result = await NotificationService.clearAllNotifications(req.user._id, {
                readOnly: readOnly === 'true',
                type
            });
            res.json(result);
        } catch (error) {
            logger.error('Clear all notifications error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }
}

module.exports = new NotificationController();