// backend/src/middleware/validation.js
const { body, query, param, validationResult, checkSchema } = require('express-validator');
const mongoose = require('mongoose');
const { COURSE_CATEGORIES, COURSE_LEVELS, USER_ROLES } = require('../utils/constants');
const CustomValidator = require('../utils/validator');
const logger = require('../utils/logger');

// Middleware de validation générique
const validate = (validations) => {
    return async (req, res, next) => {
        // Exécuter toutes les validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value,
            location: err.location
        }));

        logger.logValidationErrors(extractedErrors, req);
        
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: extractedErrors
        });
    };
};

// Validation avec schéma
const validateSchema = (schema) => {
    return async (req, res, next) => {
        try {
            // Valider chaque champ du schéma
            const validations = Object.keys(schema).map(field => {
                const fieldValidations = schema[field];
                return body(field).custom(async (value, { req }) => {
                    for (const validation of fieldValidations) {
                        await validation(value, req, field);
                    }
                    return true;
                });
            });

            await Promise.all(validations.map(v => v.run(req)));

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const extractedErrors = errors.array().map(err => ({
                    field: err.path,
                    message: err.msg,
                    value: err.value
                }));
                
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    errors: extractedErrors
                });
            }

            next();
        } catch (error) {
            logger.error('Schema validation error:', error);
            res.status(500).json({
                success: false,
                message: 'Validation error occurred'
            });
        }
    };
};

// Règles de validation communes
const commonRules = {
    email: body('email')
        .trim()
        .notEmpty().withMessage('Lemail est requis')
        .isEmail().withMessage('Format demail invalide')
        .normalizeEmail()
        .customSanitizer(value => value.toLowerCase()),
    
    password: body('password')
        .trim()
        .notEmpty().withMessage('Le mot de passe est requis')
        .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
        .escape(),
    
    fullName: body('fullName')
        .trim()
        .notEmpty().withMessage('Le nom complet est requis')
        .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/).withMessage('Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes')
        .escape(),
    
    phone: body('phone')
        .optional({ checkFalsy: true })
        .trim()
        .custom(value => {
            if (!value) return true;
            return CustomValidator.isValidInternationalPhone(value);
        }).withMessage('Numéro de téléphone invalide'),
    
    mongoId: (field) => param(field)
        .isMongoId().withMessage('ID MongoDB invalide'),
    
    price: body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif')
        .custom(value => CustomValidator.isValidPrice(value, { min: 0, max: 1000000 }))
        .withMessage('Le prix doit être compris entre 0 et 1,000,000'),
    
    description: body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('La description ne peut dépasser 5000 caractères')
        .escape(),
    
    date: (field) => body(field)
        .optional()
        .isISO8601().withMessage('Format de date invalide (utilisez ISO 8601)')
        .custom(value => CustomValidator.isValidDateWithConstraints(value, { futureOnly: true }))
        .withMessage('La date doit être dans le futur'),
    
    url: (field) => body(field)
        .optional()
        .isURL().withMessage('URL invalide')
        .custom(value => {
            if (!value) return true;
            return CustomValidator.isValidVideoUrl(value);
        }).withMessage('URL de vidéo non supportée')
};

// Schémas de validation par modèle
const validationSchemas = {
    // Schéma d'inscription utilisateur
    registerUser: {
        fullName: [
            (value) => {
                if (!value || value.trim().length < 2) {
                    throw new Error('Le nom complet est requis (min 2 caractères)');
                }
                return true;
            }
        ],
        email: [
            async (value) => {
                if (!value) throw new Error('L\'email est requis');
                if (!CustomValidator.isValidEmail(value)) {
                    throw new Error('Format d\'email invalide');
                }
                // Vérifier si l'email existe déjà (asynchrone)
                const User = require('../models/User.model');
                const existingUser = await User.findOne({ email: value.toLowerCase() });
                if (existingUser) {
                    throw new Error('Cet email est déjà utilisé');
                }
                return true;
            }
        ],
        password: [
            (value) => {
                if (!value || value.length < 6) {
                    throw new Error('Le mot de passe doit contenir au moins 6 caractères');
                }
                return true;
            }
        ],
        role: [
            (value) => {
                if (value && !Object.values(USER_ROLES).includes(value)) {
                    throw new Error('Rôle utilisateur invalide');
                }
                return true;
            }
        ],
        phone: [
            (value) => {
                if (value && !CustomValidator.isValidInternationalPhone(value)) {
                    throw new Error('Numéro de téléphone invalide');
                }
                return true;
            }
        ]
    },

    // Schéma de création de cours
    createCourse: {
        title: [
            (value) => {
                if (!value || value.trim().length < 5) {
                    throw new Error('Le titre doit contenir au moins 5 caractères');
                }
                if (value.length > 200) {
                    throw new Error('Le titre ne peut dépasser 200 caractères');
                }
                return true;
            }
        ],
        description: [
            (value) => {
                if (!value || value.trim().length < 10) {
                    throw new Error('La description doit contenir au moins 10 caractères');
                }
                if (value.length > 5000) {
                    throw new Error('La description ne peut dépasser 5000 caractères');
                }
                return true;
            }
        ],
        category: [
            (value) => {
                if (!value) throw new Error('La catégorie est requise');
                if (!COURSE_CATEGORIES.includes(value)) {
                    throw new Error(`Catégorie invalide. Options: ${COURSE_CATEGORIES.join(', ')}`);
                }
                return true;
            }
        ],
        price: [
            (value) => {
                const price = parseFloat(value);
                if (isNaN(price) || price < 0) {
                    throw new Error('Le prix doit être un nombre positif');
                }
                if (price > 1000000) {
                    throw new Error('Le prix maximum est 1,000,000');
                }
                return true;
            }
        ],
        level: [
            (value) => {
                if (value && !COURSE_LEVELS.includes(value)) {
                    throw new Error(`Niveau invalide. Options: ${COURSE_LEVELS.join(', ')}`);
                }
                return true;
            }
        ],
        totalHours: [
            (value) => {
                if (value) {
                    const hours = parseFloat(value);
                    if (isNaN(hours) || hours < 0) {
                        throw new Error('Le nombre d\'heures doit être positif');
                    }
                    if (hours > 1000) {
                        throw new Error('Le nombre maximum d\'heures est 1000');
                    }
                }
                return true;
            }
        ]
    },

    // Schéma de création de quiz
    createQuiz: {
        title: [
            (value) => {
                if (!value || value.trim().length < 3) {
                    throw new Error('Le titre du quiz doit contenir au moins 3 caractères');
                }
                return true;
            }
        ],
        description: [
            (value) => {
                if (value && value.length > 1000) {
                    throw new Error('La description ne peut dépasser 1000 caractères');
                }
                return true;
            }
        ],
        'settings.duration': [
            (value) => {
                if (value && (value < 1 || value > 300)) {
                    throw new Error('La durée doit être entre 1 et 300 minutes');
                }
                return true;
            }
        ],
        'settings.passingScore': [
            (value) => {
                if (value && (value < 0 || value > 100)) {
                    throw new Error('Le score de passage doit être entre 0 et 100');
                }
                return true;
            }
        ],
        questions: [
            (value, req) => {
                if (!value || !Array.isArray(value) || value.length === 0) {
                    throw new Error('Le quiz doit contenir au moins une question');
                }
                
                // Valider chaque question
                value.forEach((question, index) => {
                    if (!question.text || question.text.trim().length < 3) {
                        throw new Error(`Question ${index + 1}: Le texte est requis (min 3 caractères)`);
                    }
                    
                    if (!question.points || question.points < 0.5 || question.points > 100) {
                        throw new Error(`Question ${index + 1}: Les points doivent être entre 0.5 et 100`);
                    }
                    
                    // Validation selon le type
                    switch (question.type) {
                        case 'multiple_choice':
                            if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
                                throw new Error(`Question ${index + 1}: Les QCM doivent avoir au moins 2 options`);
                            }
                            const hasCorrect = question.options.some(opt => opt.isCorrect);
                            if (!hasCorrect) {
                                throw new Error(`Question ${index + 1}: Au moins une option doit être correcte`);
                            }
                            break;
                            
                        case 'true_false':
                            if (typeof question.correctAnswer !== 'boolean') {
                                throw new Error(`Question ${index + 1}: La réponse doit être true ou false`);
                            }
                            break;
                            
                        case 'short_answer':
                            if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
                                throw new Error(`Question ${index + 1}: La réponse correcte est requise`);
                            }
                            break;
                    }
                });
                
                return true;
            }
        ]
    },

    // Schéma de paiement
    createPayment: {
        courseId: [
            async (value, req) => {
                if (!value || !mongoose.Types.ObjectId.isValid(value)) {
                    throw new Error('ID de cours invalide');
                }
                
                // Vérifier que le cours existe
                const Course = require('../models/Course.model');
                const course = await Course.findById(value);
                if (!course) {
                    throw new Error('Cours non trouvé');
                }
                
                // Stocker le cours dans la requête pour une utilisation ultérieure
                req.course = course;
                return true;
            }
        ],
        amount: [
            (value, req) => {
                if (!value || isNaN(value) || value <= 0) {
                    throw new Error('Montant invalide');
                }
                
                // Vérifier que le montant correspond au prix du cours
                if (req.course && parseFloat(value) !== req.course.price) {
                    throw new Error(`Le montant doit être de ${req.course.price}`);
                }
                
                return true;
            }
        ],
        paymentMethod: [
            (value) => {
                const validMethods = ['stripe', 'paypal', 'mobile_money', 'bank_transfer'];
                if (value && !validMethods.includes(value)) {
                    throw new Error(`Méthode de paiement invalide. Options: ${validMethods.join(', ')}`);
                }
                return true;
            }
        ]
    },

    // Schéma de fichier upload
    fileUpload: (allowedTypes, maxSize, required = false) => ({
        file: [
            (value, req) => {
                if (required && (!req.file && !value)) {
                    throw new Error('Le fichier est requis');
                }
                
                if (req.file) {
                    // Vérifier le type MIME
                    if (!allowedTypes.includes(req.file.mimetype)) {
                        throw new Error(`Type de fichier non autorisé. Types autorisés: ${allowedTypes.join(', ')}`);
                    }
                    
                    // Vérifier la taille
                    if (req.file.size > maxSize) {
                        const maxSizeMB = maxSize / (1024 * 1024);
                        throw new Error(`Fichier trop volumineux. Taille maximum: ${maxSizeMB}MB`);
                    }
                    
                    // Vérifier l'extension
                    const allowedExtensions = allowedTypes.map(type => 
                        type.split('/')[1]
                    ).filter(Boolean);
                    
                    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
                    if (!allowedExtensions.includes(fileExtension)) {
                        throw new Error(`Extension non autorisée. Extensions autorisées: ${allowedExtensions.join(', ')}`);
                    }
                }
                
                return true;
            }
        ]
    })
};

// Validation par route/contrôleur
const routeValidations = {
    // Authentification
    register: validate([
        commonRules.fullName,
        commonRules.email,
        commonRules.password,
        commonRules.phone,
        body('role')
            .optional()
            .isIn(Object.values(USER_ROLES))
            .withMessage(`Rôle invalide. Options: ${Object.values(USER_ROLES).join(', ')}`)
    ]),
    
    login: validate([
        commonRules.email,
        commonRules.password
    ]),
    
    forgotPassword: validate([
        commonRules.email
    ]),
    
    resetPassword: validate([
        body('token')
            .notEmpty().withMessage('Token de réinitialisation requis'),
        body('password')
            .notEmpty().withMessage('Nouveau mot de passe requis')
            .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
            .custom((value, { req }) => {
                if (value === req.body.currentPassword) {
                    throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
                }
                return true;
            })
    ]),
    
    // Cours
    createCourse: validateSchema(validationSchemas.createCourse),
    
    updateCourse: validate([
        param('id').isMongoId().withMessage('ID de cours invalide'),
        body('title')
            .optional()
            .trim()
            .isLength({ min: 5, max: 200 }).withMessage('Le titre doit contenir entre 5 et 200 caractères'),
        body('category')
            .optional()
            .isIn(COURSE_CATEGORIES).withMessage(`Catégorie invalide. Options: ${COURSE_CATEGORIES.join(', ')}`),
        body('price')
            .optional()
            .isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
        body('isPublished')
            .optional()
            .isBoolean().withMessage('isPublished doit être un booléen')
    ]),
    
    enrollCourse: validate([
        param('id').isMongoId().withMessage('ID de cours invalide')
    ]),
    
    // Vidéos
    createVideo: validate([
        body('title')
            .trim()
            .notEmpty().withMessage('Le titre de la vidéo est requis')
            .isLength({ min: 3, max: 200 }).withMessage('Le titre doit contenir entre 3 et 200 caractères'),
        body('videoUrl')
            .trim()
            .notEmpty().withMessage('L\'URL de la vidéo est requise')
            .custom(value => CustomValidator.isValidVideoUrl(value))
            .withMessage('URL de vidéo non supportée'),
        body('courseId')
            .notEmpty().withMessage('L\'ID du cours est requis')
            .isMongoId().withMessage('ID de cours invalide'),
        body('duration')
            .optional()
            .isInt({ min: 1 }).withMessage('La durée doit être un nombre positif en secondes'),
        body('isPreview')
            .optional()
            .isBoolean().withMessage('isPreview doit être un booléen')
    ]),
    
    // Quiz
    createQuiz: validateSchema(validationSchemas.createQuiz),
    
    startQuiz: validate([
        param('id').isMongoId().withMessage('ID de quiz invalide')
    ]),
    
    submitQuiz: validate([
        param('id').isMongoId().withMessage('ID de quiz invalide'),
        body('attemptId')
            .notEmpty().withMessage('ID de tentative requis'),
        body('answers')
            .isArray().withMessage('Les réponses doivent être un tableau')
            .notEmpty().withMessage('Au moins une réponse est requise')
    ]),
    
    // Paiements
    createPayment: validateSchema(validationSchemas.createPayment),
    
    // Assignments
    createAssignment: validate([
        body('title')
            .trim()
            .notEmpty().withMessage('Le titre du devoir est requis')
            .isLength({ min: 3, max: 200 }).withMessage('Le titre doit contenir entre 3 et 200 caractères'),
        body('description')
            .trim()
            .notEmpty().withMessage('La description est requise'),
        body('courseId')
            .notEmpty().withMessage('L\'ID du cours est requis')
            .isMongoId().withMessage('ID de cours invalide'),
        body('dueDate')
            .notEmpty().withMessage('La date d\'échéance est requise')
            .isISO8601().withMessage('Format de date invalide')
            .custom(value => {
                const dueDate = new Date(value);
                const now = new Date();
                if (dueDate <= now) {
                    throw new Error('La date d\'échéance doit être dans le futur');
                }
                return true;
            }),
        body('maxPoints')
            .optional()
            .isInt({ min: 1, max: 1000 }).withMessage('Les points maximum doivent être entre 1 et 1000'),
        body('instructions')
            .optional()
            .isLength({ max: 5000 }).withMessage('Les instructions ne peuvent dépasser 5000 caractères')
    ]),
    
    submitAssignment: validate([
        param('id').isMongoId().withMessage('ID de devoir invalide'),
        body('submissionText')
            .optional()
            .isLength({ max: 5000 }).withMessage('Le texte de soumission ne peut dépasser 5000 caractères'),
        body('notes')
            .optional()
            .isLength({ max: 1000 }).withMessage('Les notes ne peuvent dépasser 1000 caractères')
    ]),
    
    // Recherche et filtrage
    searchCourses: validate([
        query('q')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 }).withMessage('La requête de recherche doit contenir entre 2 et 100 caractères'),
        query('category')
            .optional()
            .isIn(COURSE_CATEGORIES).withMessage(`Catégorie invalide. Options: ${COURSE_CATEGORIES.join(', ')}`),
        query('level')
            .optional()
            .isIn(COURSE_LEVELS).withMessage(`Niveau invalide. Options: ${COURSE_LEVELS.join(', ')}`),
        query('minPrice')
            .optional()
            .isFloat({ min: 0 }).withMessage('Le prix minimum doit être positif'),
        query('maxPrice')
            .optional()
            .isFloat({ min: 0 }).withMessage('Le prix maximum doit être positif')
            .custom((value, { req }) => {
                if (req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
                    throw new Error('Le prix maximum doit être supérieur au prix minimum');
                }
                return true;
            }),
        query('page')
            .optional()
            .isInt({ min: 1 }).withMessage('La page doit être un nombre positif')
            .toInt(),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100')
            .toInt(),
        query('sort')
            .optional()
            .isIn(['createdAt', 'title', 'price', 'rating', 'students'])
            .withMessage('Critère de tri invalide'),
        query('order')
            .optional()
            .isIn(['asc', 'desc'])
            .withMessage('L\'ordre doit être asc ou desc')
    ]),
    
    // Utilisateurs
    updateProfile: validate([
        body('fullName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),
        body('email')
            .optional()
            .isEmail().withMessage('Format d\'email invalide')
            .custom(async (value, { req }) => {
                if (value) {
                    const User = require('../models/User.model');
                    const existingUser = await User.findOne({ 
                        email: value.toLowerCase(),
                        _id: { $ne: req.user._id }
                    });
                    if (existingUser) {
                        throw new Error('Cet email est déjà utilisé');
                    }
                }
                return true;
            }),
        body('phone')
            .optional()
            .custom(value => {
                if (value && !CustomValidator.isValidInternationalPhone(value)) {
                    throw new Error('Numéro de téléphone invalide');
                }
                return true;
            }),
        body('avatar')
            .optional()
            .isURL().withMessage('URL d\'avatar invalide')
    ]),
    
    changePassword: validate([
        body('currentPassword')
            .notEmpty().withMessage('Le mot de passe actuel est requis'),
        body('newPassword')
            .notEmpty().withMessage('Le nouveau mot de passe est requis')
            .isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
            .custom((value, { req }) => {
                if (value === req.body.currentPassword) {
                    throw new Error('Le nouveau mot de passe doit être différent de l\'actuel');
                }
                return true;
            }),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Les mots de passe ne correspondent pas');
                }
                return true;
            })
    ])
};

// Validation de fichiers
const fileValidations = {
    imageupload: (fieldName = 'image', required = false) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        return validateSchema(validationSchemas.fileUpload(allowedTypes, maxSize, required));
    },
    
    videoUpload: (fieldName = 'video', required = false) => {
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        const maxSize = 500 * 1024 * 1024; // 500MB
        
        return validateSchema(validationSchemas.fileUpload(allowedTypes, maxSize, required));
    },
    
    documentUpload: (fieldName = 'document', required = false) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain'
        ];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        return validateSchema(validationSchemas.fileUpload(allowedTypes, maxSize, required));
    }
};

// Validation de paramètres d'URL
const paramValidations = {
    mongoId: (paramName) => validate([
        param(paramName)
            .isMongoId().withMessage('ID MongoDB invalide')
            .custom(async (value) => {
                // Vérifier que l'ID existe dans la base de données
                const modelMap = {
                    'courseId': 'Course',
                    'userId': 'User',
                    'videoId': 'Video',
                    'quizId': 'Quiz',
                    'assignmentId': 'Assignment',
                    'paymentId': 'Payment'
                };
                
                const modelName = modelMap[paramName];
                if (modelName) {
                    const Model = require(`../models/${modelName}.model`);
                    const exists = await Model.exists({ _id: value });
                    if (!exists) {
                        throw new Error(`${modelName} non trouvé`);
                    }
                }
                return true;
            })
    ])
};

// Middleware de validation de rôle
const roleValidation = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Non authentifié'
            });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Accès non autorisé. Rôles autorisés: ${allowedRoles.join(', ')}`
            });
        }
        
        next();
    };
};

// Validation de propriétaire (vérifier que l'utilisateur possède la ressource)
const ownershipValidation = (modelName, paramName = 'id') => {
    return async (req, res, next) => {
        try {
            const Model = require(`../models/${modelName}.model`);
            const document = await Model.findById(req.params[paramName]);
            
            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: `${modelName} non trouvé`
                });
            }
            
            // Vérifier si l'utilisateur est propriétaire ou admin
            const isOwner = document.createdBy && document.createdBy.toString() === req.user._id.toString();
            const isAdmin = req.user.role === USER_ROLES.ADMIN;
            const isTeacher = modelName === 'Course' && document.teacher.toString() === req.user._id.toString();
            
            if (!isOwner && !isAdmin && !isTeacher) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'êtes pas autorisé à modifier cette ressource'
                });
            }
            
            // Attacher le document à la requête pour une utilisation ultérieure
            req.document = document;
            next();
        } catch (error) {
            logger.error('Ownership validation error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur de validation de propriété'
            });
        }
    };
};

// Middleware de validation de l'accès au cours
const courseAccessValidation = () => {
    return async (req, res, next) => {
        try {
            const Course = require('../models/Course.model');
            const courseId = req.params.courseId || req.params.id || req.body.courseId;
            
            if (!courseId) {
                return next();
            }
            
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Cours non trouvé'
                });
            }
            
            // Vérifier les accès
            const isTeacher = course.teacher.toString() === req.user._id.toString();
            const isAdmin = req.user.role === USER_ROLES.ADMIN;
            const isStudent = course.students.some(
                studentId => studentId.toString() === req.user._id.toString()
            );
            
            req.course = course;
            req.courseAccess = {
                isTeacher,
                isAdmin,
                isStudent,
                hasAccess: isTeacher || isAdmin || isStudent
            };
            
            next();
        } catch (error) {
            logger.error('Course access validation error:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur de validation d\'accès au cours'
            });
        }
    };
};

// Export de tous les validateurs
module.exports = {
    validate,
    validateSchema,
    commonRules,
    validationSchemas,
    routeValidations,
    fileValidations,
    paramValidations,
    roleValidation,
    ownershipValidation,
    courseAccessValidation
};