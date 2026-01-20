
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const Video = require('../models/Video.model');
const Assignment = require('../models/Assignment.model');
const Material = require('../models/Material.model');
const Quiz = require('../models/Quiz.model');
const Payment = require('../models/Payment.model');
const NotificationService = require('../services/notification.service');
const StorageService = require('../services/storage.service');
const logger = require('../utils/logger');
const { USER_ROLES, COURSE_STATUS } = require('../utils/constants');

class CourseController {
    // GET /api/courses - Récupère tous les cours
    async getAllCourses(req, res) {
        try {
            const { page = 1, limit = 10, category, level, search } = req.query;
            
            const query = { isPublished: true };
            if (category) query.category = category;
            if (level) query.level = level;
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            const courses = await Course.find(query)
                .populate('teacher', 'fullName avatar')
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });

            const total = await Course.countDocuments(query);

            res.json({
                success: true,
                data: courses,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            logger.error('Get all courses error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // GET /api/courses/:id - Récupère un cours spécifique
    async getCourseById(req, res) {
        try {
            const course = await Course.findById(req.params.id)
                .populate('teacher', 'fullName avatar bio')
                .populate('students', 'fullName avatar');

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier si l'utilisateur est inscrit
            const isEnrolled = req.user ? 
                course.students.some(s => s._id.toString() === req.user._id.toString()) : 
                false;

            res.json({
                success: true,
                data: {
                    ...course.toObject(),
                    isEnrolled
                }
            });
        } catch (error) {
            logger.error('Get course by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // POST /api/courses - Crée un nouveau cours
    async createCourse(req, res) {
        try {
            const courseData = {
                ...req.body,
                teacher: req.user._id,
                status: 'draft',
                isPublished: false
            };

            const course = await Course.create(courseData);

            res.status(201).json({
                success: true,
                message: 'Cours créé avec succès',
                data: course
            });
        } catch (error) {
            logger.error('Create course error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création du cours'
            });
        }
    }

    // PUT /api/courses/:id - Met à jour un cours
    async updateCourse(req, res) {
        try {
            const course = await Course.findById(req.params.id);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier les permissions
            if (course.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            Object.assign(course, req.body);
            await course.save();

            res.json({
                success: true,
                message: 'Cours mis à jour',
                data: course
            });
        } catch (error) {
            logger.error('Update course error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour'
            });
        }
    }

    // DELETE /api/courses/:id - Supprime un cours
    async deleteCourse(req, res) {
        try {
            const course = await Course.findById(req.params.id);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier les permissions
            if (course.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            await course.deleteOne();

            res.json({
                success: true,
                message: 'Cours supprimé'
            });
        } catch (error) {
            logger.error('Delete course error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression'
            });
        }
    }

    // POST /api/courses/:id/enroll - Inscription au cours
    async enrollInCourse(req, res) {
        try {
            const course = await Course.findById(req.params.id);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            if (!course.isPublished) {
                return res.status(400).json({
                    success: false,
                    message: 'Cours non publié'
                });
            }

            // Vérifier si déjà inscrit
            const alreadyEnrolled = course.students.some(
                id => id.toString() === req.user._id.toString()
            );

            if (alreadyEnrolled) {
                return res.status(400).json({
                    success: false,
                    message: 'Déjà inscrit à ce cours'
                });
            }

            // Vérifier paiement pour les cours payants
            if (course.price > 0) {
                const payment = await Payment.findOne({
                    user: req.user._id,
                    course: course._id,
                    status: 'completed'
                });

                if (!payment) {
                    return res.status(402).json({
                        success: false,
                        message: 'Paiement requis',
                        data: {
                            courseId: course._id,
                            amount: course.price
                        }
                    });
                }
            }

            // Inscrire l'étudiant
            course.students.push(req.user._id);
            await course.save();

            res.json({
                success: true,
                message: 'Inscription réussie'
            });
        } catch (error) {
            logger.error('Enroll course error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'inscription'
            });
        }
    }

    // DELETE /api/courses/:id/unenroll - Désinscription
    async unenrollCourse(req, res) {
        try {
            const course = await Course.findById(req.params.id);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            course.students = course.students.filter(
                id => id.toString() !== req.user._id.toString()
            );
            await course.save();

            res.json({
                success: true,
                message: 'Désinscription réussie'
            });
        } catch (error) {
            logger.error('Unenroll course error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la désinscription'
            });
        }
    }

    // POST /api/courses/:id/modules - Ajoute un module
    async addModule(req, res) {
        try {
            const course = await Course.findById(req.params.id);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            if (course.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            const module = {
                title: req.body.title,
                description: req.body.description || '',
                order: req.body.order || course.modules.length,
                videos: [],
                assignments: [],
                materials: []
            };

            course.modules.push(module);
            await course.save();

            res.status(201).json({
                success: true,
                data: module
            });
        } catch (error) {
            logger.error('Add module error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'ajout du module'
            });
        }
    }

    // PUT /api/courses/:id/modules/:moduleId - Met à jour un module
    async updateModule(req, res) {
        try {
            const course = await Course.findById(req.params.id);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            if (course.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            const module = course.modules.id(req.params.moduleId);
            if (!module) {
                return res.status(404).json({
                    success: false,
                    message: 'Module non trouvé'
                });
            }

            if (req.body.title) module.title = req.body.title;
            if (req.body.description !== undefined) module.description = req.body.description;
            if (req.body.order !== undefined) module.order = req.body.order;

            await course.save();

            res.json({
                success: true,
                data: module
            });
        } catch (error) {
            logger.error('Update module error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour'
            });
        }
    }

    // GET /api/courses/:id/stats - Statistiques du cours
    async getCourseStats(req, res) {
        try {
            const course = await Course.findById(req.params.id);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier les permissions
            const isTeacher = course.teacher.toString() === req.user._id.toString();
            const isStudent = course.students.some(id => id.toString() === req.user._id.toString());

            if (!isTeacher && !isStudent && req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            const stats = {
                totalStudents: course.students.length,
                totalModules: course.modules.length,
                totalVideos: course.modules.reduce((sum, module) => sum + module.videos.length, 0),
                totalAssignments: course.modules.reduce((sum, module) => sum + module.assignments.length, 0),
                totalMaterials: course.modules.reduce((sum, module) => sum + module.materials.length, 0)
            };

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            logger.error('Get course stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des statistiques'
            });
        }
    }

    // GET /api/courses/search - Recherche de cours
    async searchCourses(req, res) {
        try {
            const { q, category, level, page = 1, limit = 10 } = req.query;

            const query = { isPublished: true };
            if (q) {
                query.$or = [
                    { title: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } }
                ];
            }
            if (category) query.category = category;
            if (level) query.level = level;

            const courses = await Course.find(query)
                .populate('teacher', 'fullName avatar')
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .sort({ createdAt: -1 });

            const total = await Course.countDocuments(query);

            res.json({
                success: true,
                data: courses,
                total,
                page: parseInt(page)
            });
        } catch (error) {
            logger.error('Search courses error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la recherche'
            });
        }
    }

    // GET /api/courses/recommended/for-me - Cours recommandés
    async getRecommendedCourses(req, res) {
        try {
            // Logique de recommandation simple
            const enrolledCourses = await Course.find({
                students: req.user._id
            }).select('category');

            const categories = [...new Set(enrolledCourses.map(c => c.category))];

            const recommended = await Course.find({
                isPublished: true,
                category: { $in: categories },
                students: { $ne: req.user._id }
            })
            .populate('teacher', 'fullName avatar')
            .limit(10);

            res.json({
                success: true,
                data: recommended
            });
        } catch (error) {
            logger.error('Get recommended courses error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des recommandations'
            });
        }
    }
}

module.exports = new CourseController();