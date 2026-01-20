
const Quiz = require('../models/Quiz.model');
const QuizAttempt = require('../models/QuizAttempt.model');
const Course = require('../models/Course.model');
const NotificationService = require('../services/notification.service');
const logger = require('../utils/logger');
const { USER_ROLES, QUIZ_STATUS } = require('../utils/constants');

class QuizController {
    // POST /api/quiz - Crée un quiz
    async createQuiz(req, res) {
        try {
            const { courseId, title, description, questions, settings } = req.body;

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

            const quiz = await Quiz.create({
                course: courseId,
                createdBy: req.user._id,
                title,
                description: description || '',
                questions: questions || [],
                settings: {
                    duration: settings?.duration || 30,
                    passingScore: settings?.passingScore || 60,
                    maxAttempts: settings?.maxAttempts || 1,
                    showResults: settings?.showResults || true,
                    ...settings
                },
                status: QUIZ_STATUS.PUBLISHED
            });

            // Notifier les étudiants
            await NotificationService.sendCourseNotification(courseId, {
                title: 'Nouveau quiz disponible',
                message: `"${title}" - Testez vos connaissances`,
                type: 'quiz',
                actionUrl: `/quiz/${quiz._id}`
            });

            res.status(201).json({
                success: true,
                message: 'Quiz créé avec succès',
                data: quiz
            });
        } catch (error) {
            logger.error('Create quiz error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création'
            });
        }
    }

    // GET /api/quiz/course/:courseId - Quiz d'un cours
    async getCourseQuizzes(req, res) {
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

            const quizzes = await Quiz.find({ course: courseId })
                .select('title description settings status createdAt')
                .sort({ createdAt: -1 });

            // Pour les étudiants, ajouter les informations d'essai
            if (isStudent) {
                const quizzesWithAttempts = await Promise.all(
                    quizzes.map(async (quiz) => {
                        const attempts = await QuizAttempt.find({
                            quiz: quiz._id,
                            user: user._id
                        }).sort({ createdAt: -1 });

                        const bestScore = attempts.length > 0 
                            ? Math.max(...attempts.map(a => a.score))
                            : null;

                        const canRetake = quiz.settings.maxAttempts > attempts.length;

                        return {
                            ...quiz.toObject(),
                            attempts: attempts.length,
                            bestScore,
                            canRetake,
                            lastAttempt: attempts[0] || null
                        };
                    })
                );

                return res.json({
                    success: true,
                    data: quizzesWithAttempts
                });
            }

            res.json({
                success: true,
                data: quizzes
            });
        } catch (error) {
            logger.error('Get course quizzes error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // GET /api/quiz/:id - Détails d'un quiz
    async getQuizById(req, res) {
        try {
            const quiz = await Quiz.findById(req.params.id)
                .populate('course', 'title thumbnail')
                .populate('createdBy', 'fullName avatar');

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz non trouvé'
                });
            }

            const course = await Course.findById(quiz.course);
            const isTeacher = course.teacher.toString() === req.user._id.toString();
            const isStudent = course.students.some(id => id.toString() === req.user._id.toString());

            if (!isTeacher && !isStudent && req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            // Pour les étudiants, masquer les réponses correctes
            let quizData = quiz.toObject();
            if (isStudent && !isTeacher) {
                quizData.questions = quizData.questions.map(question => {
                    const { correctAnswer, ...questionWithoutAnswer } = question;
                    return {
                        ...questionWithoutAnswer,
                        options: question.options ? question.options.map(option => {
                            const { isCorrect, ...optionWithoutCorrect } = option;
                            return optionWithoutCorrect;
                        }) : []
                    };
                });
            }

            res.json({
                success: true,
                data: quizData
            });
        } catch (error) {
            logger.error('Get quiz by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // PUT /api/quiz/:id - Met à jour un quiz
    async updateQuiz(req, res) {
        try {
            const quiz = await Quiz.findById(req.params.id);

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz non trouvé'
                });
            }

            const course = await Course.findById(quiz.course);
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

            Object.assign(quiz, req.body);
            await quiz.save();

            res.json({
                success: true,
                message: 'Quiz mis à jour',
                data: quiz
            });
        } catch (error) {
            logger.error('Update quiz error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour'
            });
        }
    }

    // DELETE /api/quiz/:id - Supprime un quiz
    async deleteQuiz(req, res) {
        try {
            const quiz = await Quiz.findById(req.params.id);

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz non trouvé'
                });
            }

            const course = await Course.findById(quiz.course);
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

            // Supprimer aussi les tentatives
            await QuizAttempt.deleteMany({ quiz: quiz._id });
            await quiz.deleteOne();

            res.json({
                success: true,
                message: 'Quiz supprimé'
            });
        } catch (error) {
            logger.error('Delete quiz error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression'
            });
        }
    }

    // POST /api/quiz/:id/start - Démarre un quiz
    async startQuiz(req, res) {
        try {
            const quiz = await Quiz.findById(req.params.id);

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz non trouvé'
                });
            }

            const course = await Course.findById(quiz.course);
            const isStudent = course.students.some(id => id.toString() === req.user._id.toString());

            if (!isStudent && req.user.role !== USER_ROLES.ADMIN && 
                course.teacher.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès non autorisé'
                });
            }

            // Vérifier les tentatives restantes
            const attempts = await QuizAttempt.countDocuments({
                quiz: quiz._id,
                user: req.user._id
            });

            if (attempts >= quiz.settings.maxAttempts) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre maximum de tentatives atteint'
                });
            }

            // Créer une tentative
            const attempt = await QuizAttempt.create({
                quiz: quiz._id,
                user: req.user._id,
                startedAt: new Date(),
                expiresAt: new Date(Date.now() + (quiz.settings.duration * 60000)),
                status: 'in_progress'
            });

            // Préparer le quiz sans réponses
            const quizForStudent = {
                ...quiz.toObject(),
                questions: quiz.questions.map(question => {
                    const { correctAnswer, ...questionWithoutAnswer } = question;
                    return {
                        ...questionWithoutAnswer,
                        options: question.options ? question.options.map(option => {
                            const { isCorrect, ...optionWithoutCorrect } = option;
                            return optionWithoutCorrect;
                        }) : []
                    };
                })
            };

            res.json({
                success: true,
                data: {
                    quiz: quizForStudent,
                    attempt: {
                        id: attempt._id,
                        startedAt: attempt.startedAt,
                        expiresAt: attempt.expiresAt,
                        duration: quiz.settings.duration
                    }
                }
            });
        } catch (error) {
            logger.error('Start quiz error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du démarrage du quiz'
            });
        }
    }

    // POST /api/quiz/:id/submit - Soumet un quiz
    async submitQuiz(req, res) {
        try {
            const { attemptId, answers } = req.body;

            const attempt = await QuizAttempt.findById(attemptId)
                .populate('quiz');

            if (!attempt) {
                return res.status(404).json({
                    success: false,
                    message: 'Tentative non trouvée'
                });
            }

            if (attempt.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            if (attempt.status !== 'in_progress') {
                return res.status(400).json({
                    success: false,
                    message: 'Tentative déjà soumise'
                });
            }

            // Vérifier le temps
            if (new Date() > attempt.expiresAt) {
                return res.status(400).json({
                    success: false,
                    message: 'Temps écoulé'
                });
            }

            // Calculer le score
            const quiz = attempt.quiz;
            let score = 0;
            let totalPoints = 0;

            quiz.questions.forEach(question => {
                totalPoints += question.points || 1;
                
                const userAnswer = answers.find(a => a.questionId === question._id.toString());
                if (!userAnswer) return;

                let isCorrect = false;

                switch (question.type) {
                    case 'multiple_choice':
                        const correctOptions = question.options
                            .filter(opt => opt.isCorrect)
                            .map(opt => opt._id.toString());
                        
                        const userSelected = userAnswer.selectedOptions || [];
                        isCorrect = correctOptions.length === userSelected.length &&
                            correctOptions.every(id => userSelected.includes(id));
                        break;

                    case 'true_false':
                        isCorrect = userAnswer.answer === question.correctAnswer;
                        break;

                    case 'short_answer':
                        const userText = (userAnswer.text || '').trim().toLowerCase();
                        const correctText = (question.correctAnswer || '').trim().toLowerCase();
                        isCorrect = userText === correctText;
                        break;
                }

                if (isCorrect) {
                    score += question.points || 1;
                }
            });

            const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
            const isPassing = percentage >= quiz.settings.passingScore;

            // Mettre à jour la tentative
            attempt.answers = answers;
            attempt.score = score;
            attempt.totalPoints = totalPoints;
            attempt.percentage = percentage;
            attempt.isPassing = isPassing;
            attempt.completedAt = new Date();
            attempt.status = 'completed';
            await attempt.save();

            // Notifier l'étudiant
            await NotificationService.createPredefinedNotification(
                NotificationService.NOTIFICATION_TYPES.ASSIGNMENT.ASSIGNMENT_GRADED,
                req.user._id,
                {
                    assignmentTitle: quiz.title,
                    grade: percentage.toFixed(1),
                    maxScore: 100,
                    isPassing,
                    quizId: quiz._id
                }
            );

            res.json({
                success: true,
                data: {
                    score,
                    totalPoints,
                    percentage: percentage.toFixed(1),
                    isPassing,
                    passed: isPassing,
                    answers: quiz.settings.showResults ? 
                        this.getCorrectAnswers(quiz, answers) : 
                        undefined
                }
            });
        } catch (error) {
            logger.error('Submit quiz error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la soumission'
            });
        }
    }

    // GET /api/quiz/:id/results - Résultats d'un quiz
    async getQuizResults(req, res) {
        try {
            const quiz = await Quiz.findById(req.params.id);

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz non trouvé'
                });
            }

            const course = await Course.findById(quiz.course);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }

            // Vérifier les permissions (seul le prof peut voir tous les résultats)
            if (course.teacher.toString() !== req.user._id.toString() && 
                req.user.role !== USER_ROLES.ADMIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Non autorisé'
                });
            }

            const attempts = await QuizAttempt.find({ quiz: quiz._id })
                .populate('user', 'fullName avatar email')
                .sort({ percentage: -1 });

            const statistics = {
                totalAttempts: attempts.length,
                averageScore: attempts.length > 0 
                    ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length 
                    : 0,
                passingCount: attempts.filter(a => a.isPassing).length,
                highestScore: attempts.length > 0 
                    ? Math.max(...attempts.map(a => a.percentage)) 
                    : 0,
                lowestScore: attempts.length > 0 
                    ? Math.min(...attempts.map(a => a.percentage)) 
                    : 0
            };

            res.json({
                success: true,
                data: {
                    attempts,
                    statistics
                }
            });
        } catch (error) {
            logger.error('Get quiz results error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // GET /api/quiz/attempts/user - Tentatives de l'utilisateur
    async getUserAttempts(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const attempts = await QuizAttempt.find({ user: req.user._id })
                .populate({
                    path: 'quiz',
                    populate: {
                        path: 'course',
                        select: 'title thumbnail'
                    }
                })
                .sort({ completedAt: -1 })
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            const total = await QuizAttempt.countDocuments({ user: req.user._id });

            res.json({
                success: true,
                data: attempts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            logger.error('Get user attempts error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur'
            });
        }
    }

    // Méthode privée pour obtenir les réponses correctes
    getCorrectAnswers(quiz, userAnswers) {
        return quiz.questions.map(question => {
            const userAnswer = userAnswers.find(a => a.questionId === question._id.toString());
            
            let isCorrect = false;
            let correctAnswer = null;

            switch (question.type) {
                case 'multiple_choice':
                    correctAnswer = question.options
                        .filter(opt => opt.isCorrect)
                        .map(opt => opt._id.toString());
                    
                    const userSelected = userAnswer?.selectedOptions || [];
                    isCorrect = correctAnswer.length === userSelected.length &&
                        correctAnswer.every(id => userSelected.includes(id));
                    break;

                case 'true_false':
                    correctAnswer = question.correctAnswer;
                    isCorrect = userAnswer?.answer === correctAnswer;
                    break;

                case 'short_answer':
                    correctAnswer = question.correctAnswer;
                    isCorrect = (userAnswer?.text || '').trim().toLowerCase() === 
                               (correctAnswer || '').trim().toLowerCase();
                    break;
            }

            return {
                questionId: question._id,
                questionText: question.text,
                isCorrect,
                correctAnswer,
                userAnswer: userAnswer || null,
                points: question.points || 1
            };
        });
    }
}

module.exports = new QuizController();