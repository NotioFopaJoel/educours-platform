
const LiveClass = require('../models/LiveClass.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const NotificationService = require('../services/notification.service');
const logger = require('../utils/logger');
const { USER_ROLES, LIVE_CLASS_STATUS } = require('../utils/constants');

class LiveClassController {
    // GET /api/live-classes/upcoming - Classes à venir
    async getUpcomingClasses(req, res) {
        try {
            const classes = await LiveClass.find({
                startTime: { $gte: new Date() },
                status: LIVE_CLASS_STATUS.SCHEDULED
            })
            .populate('course', 'title thumbnail')
            .populate('teacher', 'fullName avatar')
            .sort('startTime')
            .limit(20);

            res.json({
                success: true,
                data: classes
            });
        } catch (error) {
            logger.error('Get upcoming classes error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // GET /api/live-classes/:id - Détails d'une classe
    async getClassById(req, res) {
        try {
            const liveClass = await LiveClass.findById(req.params.id)
                .populate('course', 'title description thumbnail')
                .populate('teacher', 'fullName avatar bio')
                .populate('participants.user', 'fullName avatar');

            if (!liveClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trouvée'
                });
            }

            res.json({
                success: true,
                data: liveClass
            });
        } catch (error) {
            logger.error('Get class by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // POST /api/live-classes - Crée une classe
    async createLiveClass(req, res) {
        try {
            const { courseId, title, description, startTime, duration, agenda } = req.body;

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier si l'utilisateur est le professeur du cours
            if (course.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            const liveClass = await LiveClass.create({
                course: courseId,
                teacher: req.user._id,
                title,
                description,
                startTime: new Date(startTime),
                duration: parseInt(duration) || 60,
                agenda: agenda || '',
                status: LIVE_CLASS_STATUS.SCHEDULED,
                meetingUrl: this.generateMeetingUrl()
            });

            // Notifier les étudiants du cours
            await NotificationService.sendCourseNotification(courseId, {
                title: 'Nouvelle classe en direct programmée',
                message: `"${title}" - Démarre le ${new Date(startTime).toLocaleDateString('fr-FR')}`,
                type: 'course',
                actionUrl: `/live-classes/${liveClass._id}`
            });

            res.status(201).json({
                success: true,
                message: 'Classe créée avec succès',
                data: liveClass
            });
        } catch (error) {
            logger.error('Create live class error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création'
            });
        }
    }

    // PUT /api/live-classes/:id - Met à jour une classe
    async updateLiveClass(req, res) {
        try {
            const liveClass = await LiveClass.findById(req.params.id);

            if (!liveClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trouvée'
                });
            }

            // Vérifier les permissions
            if (liveClass.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            // Ne pas permettre de modifier si la classe a commencé
            if (liveClass.status !== LIVE_CLASS_STATUS.SCHEDULED) {
                return res.status(400).json({
                    success: false,
                    message: 'Impossible de modifier une classe en cours ou terminée'
                });
            }

            Object.assign(liveClass, req.body);
            await liveClass.save();

            res.json({
                success: true,
                message: 'Classe mise à jour',
                data: liveClass
            });
        } catch (error) {
            logger.error('Update live class error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour'
            });
        }
    }

    // DELETE /api/live-classes/:id - Supprime une classe
    async deleteLiveClass(req, res) {
        try {
            const liveClass = await LiveClass.findById(req.params.id);

            if (!liveClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trouvée'
                });
            }

            // Vérifier les permissions
            if (liveClass.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            await liveClass.deleteOne();

            res.json({
                success: true,
                message: 'Classe supprimée'
            });
        } catch (error) {
            logger.error('Delete live class error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression'
            });
        }
    }

    // POST /api/live-classes/:id/join - Rejoindre une classe
    async joinLiveClass(req, res) {
        try {
            const liveClass = await LiveClass.findById(req.params.id);

            if (!liveClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trouvée'
                });
            }

            // Vérifier si l'utilisateur est inscrit au cours
            const course = await Course.findById(liveClass.course);
            const isEnrolled = course.students.some(
                studentId => studentId.toString() === req.user._id.toString()
            );

            if (!isEnrolled && req.user.role !== USER_ROLES.ADMIN && 
                liveClass.teacher.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous devez être inscrit au cours pour rejoindre la classe'
                });
            }

            // Vérifier si la classe a commencé
            if (new Date() < new Date(liveClass.startTime)) {
                return res.status(400).json({
                    success: false,
                    message: 'La classe n\'a pas encore commencé'
                });
            }

            // Vérifier si déjà dans les participants
            const alreadyJoined = liveClass.participants.some(
                p => p.user.toString() === req.user._id.toString()
            );

            if (!alreadyJoined) {
                liveClass.participants.push({
                    user: req.user._id,
                    joinedAt: new Date()
                });
                await liveClass.save();
            }

            res.json({
                success: true,
                data: {
                    meetingUrl: liveClass.meetingUrl,
                    token: this.generateJoinToken(liveClass._id, req.user._id)
                }
            });
        } catch (error) {
            logger.error('Join live class error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la connexion'
            });
        }
    }

    // POST /api/live-classes/:id/end - Terminer une classe
    async endLiveClass(req, res) {
        try {
            const liveClass = await LiveClass.findById(req.params.id);

            if (!liveClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trouvée'
                });
            }

            // Vérifier les permissions
            if (liveClass.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Seul l\'enseignant peut terminer la classe'
                });
            }

            liveClass.status = LIVE_CLASS_STATUS.COMPLETED;
            liveClass.endedAt = new Date();
            liveClass.duration = Math.floor((new Date() - new Date(liveClass.startTime)) / 60000);
            await liveClass.save();

            res.json({
                success: true,
                message: 'Classe terminée'
            });
        } catch (error) {
            logger.error('End live class error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la fin de la classe'
            });
        }
    }

    // GET /api/live-classes/:id/participants - Participants
    async getParticipants(req, res) {
        try {
            const liveClass = await LiveClass.findById(req.params.id)
                .populate('participants.user', 'fullName avatar email')
                .select('participants');

            if (!liveClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trouvée'
                });
            }

            res.json({
                success: true,
                data: liveClass.participants
            });
        } catch (error) {
            logger.error('Get participants error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // GET /api/live-classes/user/upcoming - Classes à venir de l'utilisateur
    async getUserUpcomingClasses(req, res) {
        try {
            const user = req.user;

            // Trouver les cours où l'utilisateur est inscrit ou enseignant
            const courses = await Course.find({
                $or: [
                    { students: user._id },
                    { teacher: user._id }
                ]
            }).select('_id');

            const courseIds = courses.map(c => c._id);

            const classes = await LiveClass.find({
                course: { $in: courseIds },
                startTime: { $gte: new Date() },
                status: LIVE_CLASS_STATUS.SCHEDULED
            })
            .populate('course', 'title thumbnail')
            .populate('teacher', 'fullName avatar')
            .sort('startTime');

            res.json({
                success: true,
                data: classes
            });
        } catch (error) {
            logger.error('Get user upcoming classes error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // GET /api/live-classes/user/history - Historique des classes
    async getUserClassHistory(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const user = req.user;

            const classes = await LiveClass.find({
                'participants.user': user._id,
                status: LIVE_CLASS_STATUS.COMPLETED
            })
            .populate('course', 'title thumbnail')
            .populate('teacher', 'fullName avatar')
            .sort({ endedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

            const total = await LiveClass.countDocuments({
                'participants.user': user._id,
                status: LIVE_CLASS_STATUS.COMPLETED
            });

            res.json({
                success: true,
                data: classes,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            logger.error('Get user class history error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // Méthodes privées
    generateMeetingUrl() {
        // Générer une URL de réunion (simulé pour l'exemple)
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let roomId = '';
        for (let i = 0; i < 10; i++) {
            roomId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `https://meet.educours.com/${roomId}`;
    }

    generateJoinToken(classId, userId) {
        // Générer un token JWT simple pour rejoindre
        const crypto = require('crypto');
        return crypto
            .createHash('sha256')
            .update(`${classId}-${userId}-${Date.now()}`)
            .digest('hex');
    }
}

module.exports = new LiveClassController();