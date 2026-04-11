
const Assignment = require('../models/Assignment.model');
const AssignmentSubmission = require('../models/AssignmentSubmission.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const NotificationService = require('../services/notification.service');
const StorageService = require('../services/storage.service');
const logger = require('../utils/logger');
const { USER_ROLES, ASSIGNMENT_STATUS, SUBMISSION_STATUS } = require('../utils/constants');

class AssignmentController {
    // POST /api/assignments - Crée un devoir
    async createAssignment(req, res) {
        try {
            const { courseId, title, description, dueDate, maxPoints, instructions } = req.body;

            const course = await Course.findById(courseId);
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

            const assignment = await Assignment.create({
                course: courseId,
                createdBy: req.user._id,
                title,
                description,
                dueDate: new Date(dueDate),
                maxPoints: maxPoints || 100,
                instructions: instructions || '',
                status: ASSIGNMENT_STATUS.PUBLISHED
            });

            // Notifier les étudiants
            await NotificationService.sendCourseNotification(courseId, {
                title: 'Nouveau devoir publié',
                message: `"${title}" - À rendre pour le ${new Date(dueDate).toLocaleDateString('fr-FR')}`,
                type: 'assignment',
                actionUrl: `/assignments/${assignment._id}`
            });

            res.status(201).json({
                success: true,
                message: 'Devoir créé avec succès',
                data: assignment
            });
        } catch (error) {
            logger.error('Create assignment error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création'
            });
        }
    }

    // GET /api/assignments/course/:courseId - Devoirs d'un cours
    async getCourseAssignments(req, res) {
        try {
            const { courseId } = req.params;
            const user = req.user;

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier l'accès
            const isTeacher = course.teacher.toString() === user._id.toString();
            const isStudent = course.students.some(id => id.toString() === user._id.toString());

            if (!isTeacher && !isStudent && user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            const assignments = await Assignment.find({ course: courseId })
                .sort({ dueDate: 1 });

            // Pour les étudiants, ajouter le statut de soumission
            if (isStudent) {
                const assignmentsWithStatus = await Promise.all(
                    assignments.map(async (assignment) => {
                        const submission = await AssignmentSubmission.findOne({
                            assignment: assignment._id,
                            student: user._id
                        });
                        
                        return {
                            ...assignment.toObject(),
                            submissionStatus: submission ? submission.status : 'not_submitted',
                            submittedAt: submission?.submittedAt,
                            grade: submission?.grade
                        };
                    })
                );

                return res.json({
                    success: true,
                    data: assignmentsWithStatus
                });
            }

            res.json({
                success: true,
                data: assignments
            });
        } catch (error) {
            logger.error('Get course assignments error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // GET /api/assignments/:id - Détails d'un devoir
    async getAssignmentById(req, res) {
        try {
            const assignment = await Assignment.findById(req.params.id)
                .populate('course', 'title thumbnail')
                .populate('createdBy', 'fullName avatar');

            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Devoir non trouvé'
                });
            }

            // Vérifier l'accès
            const course = await Course.findById(assignment.course);
            const isTeacher = course.teacher.toString() === req.user._id.toString();
            const isStudent = course.students.some(id => id.toString() === req.user._id.toString());

            if (!isTeacher && !isStudent && req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            // Pour les étudiants, ajouter leur soumission
            let userSubmission = null;
            if (isStudent) {
                userSubmission = await AssignmentSubmission.findOne({
                    assignment: assignment._id,
                    student: req.user._id
                });
            }

            res.json({
                success: true,
                data: {
                    ...assignment.toObject(),
                    userSubmission
                }
            });
        } catch (error) {
            logger.error('Get assignment by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // PUT /api/assignments/:id - Met à jour un devoir
    async updateAssignment(req, res) {
        try {
            const assignment = await Assignment.findById(req.params.id);

            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Devoir non trouvé'
                });
            }

            const course = await Course.findById(assignment.course);
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

            Object.assign(assignment, req.body);
            await assignment.save();

            res.json({
                success: true,
                message: 'Devoir mis à jour',
                data: assignment
            });
        } catch (error) {
            logger.error('Update assignment error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour'
            });
        }
    }

    // DELETE /api/assignments/:id - Supprime un devoir
    async deleteAssignment(req, res) {
        try {
            const assignment = await Assignment.findById(req.params.id);

            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Devoir non trouvé'
                });
            }

            const course = await Course.findById(assignment.course);
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

            // Supprimer aussi les soumissions
            await AssignmentSubmission.deleteMany({ assignment: assignment._id });
            await assignment.deleteOne();

            res.json({
                success: true,
                message: 'Devoir supprimé'
            });
        } catch (error) {
            logger.error('Delete assignment error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression'
            });
        }
    }

    // POST /api/assignments/:id/submit - Soumet un devoir
    async submitAssignment(req, res) {
        try {
            const assignment = await Assignment.findById(req.params.id);

            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Devoir non trouvé'
                });
            }

            // Vérifier si la date limite est dépassée
            if (new Date() > new Date(assignment.dueDate)) {
                return res.status(400).json({
                    success: false,
                    message: 'Date limite dépassée'
                });
            }

            // Vérifier si déjà soumis
            const existingSubmission = await AssignmentSubmission.findOne({
                assignment: assignment._id,
                student: req.user._id
            });

            if (existingSubmission) {
                return res.status(400).json({
                    success: false,
                    message: 'Déjà soumis'
                });
            }

            const submissionData = {
                assignment: assignment._id,
                student: req.user._id,
                submissionText: req.body.submissionText,
                notes: req.body.notes,
                status: SUBMISSION_STATUS.SUBMITTED,
                submittedAt: new Date()
            };

            // Gérer les fichiers uploadés
            if (req.files && req.files.attachments) {
                const attachments = Array.isArray(req.files.attachments) 
                    ? req.files.attachments 
                    : [req.files.attachments];
                
                submissionData.attachments = await Promise.all(
                    attachments.map(async (file) => {
                        const uploadResult = await StorageService.uploadDocument(file, 'assignments');
                        return {
                            filename: file.name,
                            url: uploadResult.url,
                            size: file.size,
                            mimetype: file.mimetype
                        };
                    })
                );
            }

            const submission = await AssignmentSubmission.create(submissionData);

            // Notifier le professeur
            await NotificationService.createPredefinedNotification(
                NotificationService.NOTIFICATION_TYPES.ASSIGNMENT.ASSIGNMENT_SUBMITTED,
                assignment.createdBy,
                {
                    assignmentTitle: assignment.title,
                    studentName: req.user.fullName,
                    submissionId: submission._id
                }
            );

            res.status(201).json({
                success: true,
                message: 'Devoir soumis avec succès',
                data: submission
            });
        } catch (error) {
            logger.error('Submit assignment error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la soumission'
            });
        }
    }

    // GET /api/assignments/:id/submissions - Soumissions d'un devoir
    async getSubmissions(req, res) {
        try {
            const assignment = await Assignment.findById(req.params.id);

            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Devoir non trouvé'
                });
            }

            const course = await Course.findById(assignment.course);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier les permissions (seul le prof peut voir toutes les soumissions)
            if (course.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            const submissions = await AssignmentSubmission.find({
                assignment: assignment._id
            })
            .populate('student', 'fullName avatar email')
            .sort({ submittedAt: -1 });

            res.json({
                success: true,
                data: submissions
            });
        } catch (error) {
            logger.error('Get submissions error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // GET /api/assignments/submissions/:submissionId - Détails d'une soumission
    async getSubmissionById(req, res) {
        try {
            const submission = await AssignmentSubmission.findById(req.params.submissionId)
                .populate('student', 'fullName avatar email')
                .populate('assignment', 'title maxPoints');

            if (!submission) {
                return res.status(404).json({
                    success: false,
                    message: 'Soumission non trouvée'
                });
            }

            // Vérifier les permissions
            const assignment = await Assignment.findById(submission.assignment);
            const course = await Course.findById(assignment.course);

            const isOwner = submission.student._id.toString() === req.user._id.toString();
            const isTeacher = course.teacher.toString() === req.user._id.toString();

            if (!isOwner && !isTeacher && req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            res.json({
                success: true,
                data: submission
            });
        } catch (error) {
            logger.error('Get submission by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // POST /api/assignments/submissions/:submissionId/grade - Note une soumission
    async gradeSubmission(req, res) {
        try {
            const { grade, feedback } = req.body;

            const submission = await AssignmentSubmission.findById(req.params.submissionId)
                .populate('assignment', 'title maxPoints createdBy')
                .populate('student', 'fullName email');

            if (!submission) {
                return res.status(404).json({
                    success: false,
                    message: 'Soumission non trouvée'
                });
            }

            const assignment = await Assignment.findById(submission.assignment);
            const course = await Course.findById(assignment.course);

            // Vérifier les permissions
            if (course.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            submission.grade = grade;
            submission.feedback = feedback;
            submission.gradedAt = new Date();
            submission.gradedBy = req.user._id;
            submission.status = SUBMISSION_STATUS.GRADED;
            await submission.save();

            // Notifier l'étudiant
            await NotificationService.createPredefinedNotification(
                NotificationService.NOTIFICATION_TYPES.ASSIGNMENT.ASSIGNMENT_GRADED,
                submission.student._id,
                {
                    assignmentTitle: assignment.title,
                    grade: grade,
                    maxScore: assignment.maxPoints,
                    assignmentId: assignment._id
                }
            );

            res.json({
                success: true,
                message: 'Soumission notée',
                data: submission
            });
        } catch (error) {
            logger.error('Grade submission error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la notation'
            });
        }
    }

    // GET /api/assignments/user/submissions - Soumissions de l'utilisateur
    async getUserSubmissions(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const submissions = await AssignmentSubmission.find({
                student: req.user._id
            })
            .populate({
                path: 'assignment',
                populate: {
                    path: 'course',
                    select: 'title thumbnail'
                }
            })
            .sort({ submittedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

            const total = await AssignmentSubmission.countDocuments({
                student: req.user._id
            });

            res.json({
                success: true,
                data: submissions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            logger.error('Get user submissions error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }
}

module.exports = new AssignmentController();