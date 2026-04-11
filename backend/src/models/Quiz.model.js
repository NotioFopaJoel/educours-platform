// backend/src/models/Quiz.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sous-schéma pour les options de question
const questionOptionSchema = new Schema({
    text: {
        type: String,
        required: [true, 'Le texte de l\'option est requis'],
        trim: true
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    explanation: {
        type: String,
        trim: true
    }
});

// Sous-schéma pour les questions
const questionSchema = new Schema({
    type: {
        type: String,
        required: [true, 'Le type de question est requis'],
        enum: {
            values: ['multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'fill_blank'],
            message: 'Type de question non valide'
        }
    },
    text: {
        type: String,
        required: [true, 'Le texte de la question est requis'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    points: {
        type: Number,
        required: [true, 'Les points sont requis'],
        min: [0.5, 'Les points minimum sont 0.5'],
        max: [100, 'Les points maximum sont 100'],
        default: 1
    },
    // Pour les questions à choix multiple
    options: [questionOptionSchema],
    
    // Pour les questions vrai/faux
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        // Validation conditionnelle selon le type
        validate: {
            validator: function(value) {
                switch (this.type) {
                    case 'true_false':
                        return typeof value === 'boolean';
                    case 'short_answer':
                    case 'essay':
                        return typeof value === 'string' && value.trim().length > 0;
                    case 'multiple_choice':
                        // Pour les QCM, correctAnswer est l'index de l'option correcte
                        return typeof value === 'number' && value >= 0 && value < this.options.length;
                    default:
                        return true;
                }
            },
            message: 'Réponse correcte non valide pour ce type de question'
        }
    },
    
    // Pour les questions de correspondance (matching)
    matchingPairs: [{
        left: String,
        right: String
    }],
    
    // Pour les questions à trous (fill in the blank)
    blanks: [{
        position: Number,
        correctAnswer: String,
        caseSensitive: { type: Boolean, default: false }
    }],
    
    explanation: {
        type: String,
        trim: true
    },
    hints: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        default: 'medium'
    },
    timeLimit: {
        type: Number, // en secondes
        min: 0,
        default: 0 // 0 = pas de limite
    },
    mediaUrl: {
        type: String,
        trim: true
    },
    mediaType: {
        type: String,
        enum: ['image', 'audio', 'video', 'document'],
        default: 'image'
    },
    metadata: {
        type: Map,
        of: String,
        default: new Map()
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Sous-schéma pour les tentatives
const attemptSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur est requis']
    },
    score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    rawScore: {
        type: Number, // Points bruts obtenus
        default: 0
    },
    totalPossibleScore: {
        type: Number, // Points totaux possibles
        default: 0
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    timeSpent: {
        type: Number, // en secondes
        default: 0
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned', 'timed_out'],
        default: 'in_progress'
    },
    answers: [{
        questionIndex: {
            type: Number,
            required: true,
            min: 0
        },
        questionType: {
            type: String,
            enum: ['multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'fill_blank']
        },
        answer: mongoose.Schema.Types.Mixed, // Réponse de l'utilisateur
        correctAnswer: mongoose.Schema.Types.Mixed, // Réponse correcte (stockée pour référence)
        isCorrect: {
            type: Boolean,
            default: false
        },
        pointsEarned: {
            type: Number,
            default: 0,
            min: 0
        },
        pointsPossible: {
            type: Number,
            default: 0
        },
        feedback: {
            type: String,
            trim: true
        },
        gradedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        gradedAt: {
            type: Date
        },
        autoGraded: {
            type: Boolean,
            default: true
        },
        reviewed: {
            type: Boolean,
            default: false
        }
    }],
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    deviceInfo: {
        type: Map,
        of: String,
        default: new Map()
    },
    cheatingFlags: [{
        type: String,
        enum: ['multiple_tabs', 'copy_paste', 'time_violation', 'ip_mismatch', 'user_agent_change']
    }],
    metadata: {
        type: Map,
        of: String,
        default: new Map()
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Schéma principal du quiz
const quizSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Le titre du quiz est requis'],
        trim: true,
        maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Le cours est requis'],
        index: true
    },
    module: {
        type: Schema.Types.ObjectId,
        ref: 'Module'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le créateur est requis']
    },
    questions: [questionSchema],
    
    // Paramètres du quiz
    settings: {
        duration: {
            type: Number, // en minutes
            min: [1, 'La durée minimum est 1 minute'],
            max: [300, 'La durée maximum est 300 minutes'],
            default: 60
        },
        maxAttempts: {
            type: Number,
            min: [1, 'Le nombre minimum de tentatives est 1'],
            max: [10, 'Le nombre maximum de tentatives est 10'],
            default: 1
        },
        passingScore: {
            type: Number,
            min: [0, 'Le score de passage minimum est 0%'],
            max: [100, 'Le score de passage maximum est 100%'],
            default: 70
        },
        showAnswers: {
            type: Boolean,
            default: false
        },
        showScore: {
            type: Boolean,
            default: true
        },
        showLeaderboard: {
            type: Boolean,
            default: false
        },
        shuffleQuestions: {
            type: Boolean,
            default: false
        },
        shuffleOptions: {
            type: Boolean,
            default: false
        },
        requireProctoring: {
            type: Boolean,
            default: false
        },
        allowReview: {
            type: Boolean,
            default: true
        },
        allowNavigation: {
            type: Boolean,
            default: true
        },
        allowBacktracking: {
            type: Boolean,
            default: true
        },
        allowCalculator: {
            type: Boolean,
            default: false
        },
        allowResources: {
            type: [String],
            enum: ['none', 'formula_sheet', 'periodic_table', 'dictionary', 'custom'],
            default: ['none']
        },
        availableFrom: {
            type: Date,
            default: null
        },
        availableUntil: {
            type: Date,
            default: null
        },
        timeBetweenAttempts: {
            type: Number, // en heures
            min: 0,
            default: 0
        },
        randomization: {
            questionPool: {
                type: Number, // Nombre de questions dans la pool
                min: 0,
                default: 0 // 0 = toutes les questions
            },
            selectCount: {
                type: Number, // Nombre de questions à sélectionner
                min: 1,
                default: 0 // 0 = toutes les questions
            }
        },
        security: {
            requirePassword: {
                type: Boolean,
                default: false
            },
            password: {
                type: String,
                select: false
            },
            ipRestriction: [{
                type: String,
                trim: true
            }],
            lockdownBrowser: {
                type: Boolean,
                default: false
            }
        },
        notifications: {
            onStart: {
                type: Boolean,
                default: true
            },
            onCompletion: {
                type: Boolean,
                default: true
            },
            onGrade: {
                type: Boolean,
                default: true
            }
        },
        grading: {
            method: {
                type: String,
                enum: ['auto', 'manual', 'mixed'],
                default: 'auto'
            },
            partialCredit: {
                type: Boolean,
                default: false
            },
            penaltyForWrong: {
                type: Number,
                min: 0,
                max: 1,
                default: 0
            }
        }
    },
    
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'scheduled'],
        default: 'draft',
        index: true
    },
    
    attempts: [attemptSchema],
    
    // Analytics et statistiques
    analytics: {
        totalAttempts: {
            type: Number,
            default: 0
        },
        completedAttempts: {
            type: Number,
            default: 0
        },
        averageScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        medianScore: {
            type: Number,
            default: 0
        },
        highestScore: {
            type: Number,
            default: 0
        },
        lowestScore: {
            type: Number,
            default: 0
        },
        standardDeviation: {
            type: Number,
            default: 0
        },
        passingRate: {
            type: Number,
            default: 0
        },
        averageTimeSpent: {
            type: Number, // en secondes
            default: 0
        },
        questionStats: [{
            questionIndex: Number,
            totalAttempts: Number,
            correctAttempts: Number,
            averageScore: Number,
            difficultyIndex: Number, // 0-1, plus proche de 0 = difficile
            discriminationIndex: Number // -1 à 1, corrélation avec le score total
        }],
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    
    // Métadonnées et organisation
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    category: {
        type: String,
        trim: true
    },
    version: {
        type: Number,
        default: 1
    },
    parentQuiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz' // Pour les versions précédentes
    },
    isTemplate: {
        type: Boolean,
        default: false
    },
    language: {
        type: String,
        default: 'fr',
        enum: ['fr', 'en', 'es', 'ar']
    },
    accessibility: {
        screenReader: {
            type: Boolean,
            default: true
        },
        highContrast: {
            type: Boolean,
            default: true
        },
        extraTime: {
            type: Number, // Pourcentage de temps supplémentaire
            min: 0,
            max: 200,
            default: 0
        }
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: new Map()
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false }
});

// ==================== INDEXES ====================
quizSchema.index({ course: 1, status: 1, createdAt: -1 });
quizSchema.index({ title: 'text', description: 'text', tags: 'text' });
quizSchema.index({ 'settings.availableFrom': 1, 'settings.availableUntil': 1 });
quizSchema.index({ createdBy: 1, status: 1 });
quizSchema.index({ 'attempts.user': 1, 'attempts.completedAt': -1 });
quizSchema.index({ tags: 1, status: 1 });

// ==================== VIRTUALS ====================

// Vérifier si le quiz est disponible
quizSchema.virtual('isAvailable').get(function() {
    if (this.status !== 'published') return false;
    
    const now = new Date();
    const { availableFrom, availableUntil } = this.settings;
    
    if (availableFrom && now < availableFrom) return false;
    else if (availableUntil && now > availableUntil) return false;
    
    return true;
});

// Temps restant avant disponibilité/expiration
quizSchema.virtual('timeRemaining').get(function() {
    const now = new Date();
    const { availableFrom, availableUntil } = this.settings;
    
    if (availableFrom && now < availableFrom) {
        return {
            type: 'before_start',
            milliseconds: availableFrom - now
        };
    }
    
    if (availableUntil && now < availableUntil) {
        return {
            type: 'before_end',
            milliseconds: availableUntil - now
        };
    }
    
    return null;
});

// Nombre total de points
quizSchema.virtual('totalPoints').get(function() {
    return this.questions.reduce((total, question) => total + question.points, 0);
});

// Difficulté globale estimée
quizSchema.virtual('estimatedDifficulty').get(function() {
    if (this.questions.length === 0) return 'unknown';
    
    const difficulties = {
        easy: 0,
        medium: 1,
        hard: 2,
        expert: 3
    };
    
    const avgDifficulty = this.questions.reduce((sum, q) => {
        return sum + (difficulties[q.difficulty] || 1);
    }, 0) / this.questions.length;
    
    if (avgDifficulty < 0.5) return 'easy';
    if (avgDifficulty < 1.5) return 'medium';
    if (avgDifficulty < 2.5) return 'hard';
    return 'expert';
});

// Durée estimée en minutes
quizSchema.virtual('estimatedDuration').get(function() {
    const baseDuration = this.settings.duration || 60;
    
    // Ajuster selon le nombre et la difficulté des questions
    const timePerQuestion = this.questions.reduce((total, q) => {
        let time = 1; // minute par défaut
        switch (q.difficulty) {
            case 'easy': time = 0.5; break;
            case 'medium': time = 1; break;
            case 'hard': time = 2; break;
            case 'expert': time = 3; break;
        }
        return total + time;
    }, 0);
    
    return Math.max(baseDuration, timePerQuestion);
});

// ==================== METHODS ====================

/**
 * Vérifie si un utilisateur peut tenter le quiz
 */
quizSchema.methods.canAttempt = function(userId) {
    const userAttempts = this.attempts.filter(attempt => 
        attempt.user.toString() === userId.toString()
    );
    
    // Vérifier le nombre maximal de tentatives
    if (this.settings.maxAttempts > 0 && userAttempts.length >= this.settings.maxAttempts) {
        return {
            allowed: false,
            reason: 'max_attempts_reached',
            attemptsUsed: userAttempts.length,
            maxAttempts: this.settings.maxAttempts
        };
    }
    
    // Vérifier la disponibilité
    if (!this.isAvailable) {
        return {
            allowed: false,
            reason: 'quiz_not_available',
            status: this.status
        };
    }
    
    // Vérifier le temps entre les tentatives
    if (this.settings.timeBetweenAttempts > 0 && userAttempts.length > 0) {
        const lastAttempt = userAttempts[userAttempts.length - 1];
        const hoursSinceLastAttempt = (Date.now() - lastAttempt.completedAt) / (1000 * 60 * 60);
        
        if (hoursSinceLastAttempt < this.settings.timeBetweenAttempts) {
            return {
                allowed: false,
                reason: 'waiting_period',
                hoursRemaining: Math.ceil(this.settings.timeBetweenAttempts - hoursSinceLastAttempt)
            };
        }
    }
    
    return {
        allowed: true,
        attemptsRemaining: this.settings.maxAttempts - userAttempts.length,
        nextAttemptAvailable: null
    };
};

/**
 * Démarre une nouvelle tentative
 */
quizSchema.methods.startAttempt = function(userId, ipAddress, userAgent) {
    const canAttempt = this.canAttempt(userId);
    if (!canAttempt.allowed) {
        throw new Error(`Cannot start attempt: ${canAttempt.reason}`);
    }
    
    const attempt = {
        user: userId,
        startedAt: new Date(),
        status: 'in_progress',
        ipAddress,
        userAgent,
        deviceInfo: new Map()
    };
    
    this.attempts.push(attempt);
    return this.attempts[this.attempts.length - 1];
};

/**
 * Soumet une tentative
 */
quizSchema.methods.submitAttempt = async function(attemptId, answers, autoGrade = true) {
    const attemptIndex = this.attempts.findIndex(
        attempt => attempt._id.toString() === attemptId
    );
    
    if (attemptIndex === -1) {
        throw new Error('Attempt not found');
    }
    
    const attempt = this.attempts[attemptIndex];
    
    // Marquer comme terminé
    attempt.completedAt = new Date();
    attempt.status = 'completed';
    attempt.timeSpent = Math.floor((attempt.completedAt - attempt.startedAt) / 1000);
    
    // Enregistrer les réponses
    attempt.answers = answers.map(answer => ({
        questionIndex: answer.questionIndex,
        questionType: this.questions[answer.questionIndex]?.type,
        answer: answer.answer,
        pointsPossible: this.questions[answer.questionIndex]?.points || 0
    }));
    
    // Notation automatique si demandé
    if (autoGrade) {
        await this.gradeAttempt(attemptIndex);
    }
    
    // Mettre à jour les analytics
    await this.updateAnalytics();
    
    return attempt;
};

/**
 * Note une tentative
 */
quizSchema.methods.gradeAttempt = async function(attemptIndex) {
    const attempt = this.attempts[attemptIndex];
    let totalPointsEarned = 0;
    let totalPointsPossible = 0;
    
    attempt.answers.forEach((answer, /*index*/) => {
        const question = this.questions[answer.questionIndex];
        if (!question) return;
        
        totalPointsPossible += question.points;
        answer.pointsPossible = question.points;
        answer.correctAnswer = question.correctAnswer;
        
        // Notation selon le type de question
        let pointsEarned = 0;
        let isCorrect = false;
        //let feedback = '';
        
        switch (question.type) {
            case 'multiple_choice':
                const selectedOption = question.options[answer.answer];
                if (selectedOption && selectedOption.isCorrect) {
                    pointsEarned = question.points;
                    isCorrect = true;
                    feedback = 'Réponse correcte';
                } else {
                    feedback = 'Réponse incorrecte';
                }
                break;
                
            case 'true_false':
                if (answer.answer === question.correctAnswer) {
                    pointsEarned = question.points;
                    isCorrect = true;
                    feedback = 'Réponse correcte';
                } else {
                    feedback = 'Réponse incorrecte';
                }
                break;
                
            case 'short_answer':
                if (this.compareShortAnswer(answer.answer, question.correctAnswer)) {
                    pointsEarned = question.points;
                    isCorrect = true;
                    feedback = 'Réponse correcte';
                } else {
                    feedback = 'Réponse incorrecte';
                }
                break;
                
            case 'essay':
                // Les essais nécessitent une notation manuelle
                pointsEarned = 0;
                feedback = 'En attente de correction manuelle';
                answer.autoGraded = false;
                break;
                
            default:
                pointsEarned = 0;
                feedback = 'Type de question non supporté pour la notation automatique';
        }
        
        // Appliquer la pénalité pour les mauvaises réponses
        if (!isCorrect && this.settings.grading.penaltyForWrong > 0) {
            pointsEarned = -question.points * this.settings.grading.penaltyForWrong;
        }
        
        answer.pointsEarned = Math.max(0, pointsEarned);
        answer.isCorrect = isCorrect;
        answer.feedback = feedback;
        
        totalPointsEarned += answer.pointsEarned;
    });
    
    // Calculer le score
    attempt.rawScore = totalPointsEarned;
    attempt.totalPossibleScore = totalPointsPossible;
    attempt.score = totalPointsPossible > 0 ? 
        (totalPointsEarned / totalPointsPossible) * 100 : 0;
    
    // Mettre à jour l'analytics
    this.analytics.totalAttempts = this.attempts.length;
    this.analytics.completedAttempts = this.attempts.filter(a => a.status === 'completed').length;
    
    return attempt;
};

/**
 * Compare les réponses courtes (insensible à la casse, espaces)
 */
quizSchema.methods.compareShortAnswer = function(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) return false;
    
    const normalize = (str) => 
        str.toLowerCase().trim().replace(/\s+/g, ' ');
    
    return normalize(userAnswer) === normalize(correctAnswer);
};

/**
 * Met à jour les statistiques du quiz
 */
quizSchema.methods.updateAnalytics = async function() {
    const completedAttempts = this.attempts.filter(a => a.status === 'completed');
    
    if (completedAttempts.length === 0) return;
    
    // Calculer les statistiques de base
    const scores = completedAttempts.map(a => a.score);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    
    this.analytics.averageScore = totalScore / completedAttempts.length;
    this.analytics.highestScore = Math.max(...scores);
    this.analytics.lowestScore = Math.min(...scores);
    this.analytics.passingRate = (completedAttempts.filter(a => a.score >= this.settings.passingScore).length / completedAttempts.length) * 100;
    
    // Calculer le temps moyen
    const totalTime = completedAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    this.analytics.averageTimeSpent = totalTime / completedAttempts.length;
    
    // Calculer la médiane
    const sortedScores = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sortedScores.length / 2);
    this.analytics.medianScore = sortedScores.length % 2 !== 0 ? 
        sortedScores[mid] : 
        (sortedScores[mid - 1] + sortedScores[mid]) / 2;
    
    // Calculer l'écart-type
    const mean = this.analytics.averageScore;
    const squareDiffs = scores.map(score => Math.pow(score - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / scores.length;
    this.analytics.standardDeviation = Math.sqrt(avgSquareDiff);
    
    // Mettre à jour les statistiques par question
    this.analytics.questionStats = this.questions.map((question, index) => {
        const questionAttempts = completedAttempts.filter(a => 
            a.answers.some(ans => ans.questionIndex === index)
        );
        
        if (questionAttempts.length === 0) {
            return {
                questionIndex: index,
                totalAttempts: 0,
                correctAttempts: 0,
                averageScore: 0,
                difficultyIndex: 0,
                discriminationIndex: 0
            };
        }
        
        const correctAttempts = questionAttempts.filter(a => {
            const answer = a.answers.find(ans => ans.questionIndex === index);
            return answer?.isCorrect;
        }).length;
        
        const averageScore = questionAttempts.reduce((sum, a) => {
            const answer = a.answers.find(ans => ans.questionIndex === index);
            return sum + (answer?.pointsEarned || 0);
        }, 0) / questionAttempts.length;
        
        // Indice de difficulté (0 = difficile, 1 = facile)
        const difficultyIndex = correctAttempts / questionAttempts.length;
        
        // Indice de discrimination (corrélation avec le score total)
        // À implémenter avec une formule plus sophistiquée
        
        return {
            questionIndex: index,
            totalAttempts: questionAttempts.length,
            correctAttempts,
            averageScore,
            difficultyIndex,
            discriminationIndex: 0 // À calculer
        };
    });
    
    this.analytics.lastUpdated = new Date();
    
    await this.save();
};

/**
 * Clone le quiz (pour les nouvelles versions)
 */
quizSchema.methods.clone = function(options = {}) {
    const clonedQuiz = this.toObject();
    
    // Supprimer les champs non clonables
    delete clonedQuiz._id;
    delete clonedQuiz.createdAt;
    delete clonedQuiz.updatedAt;
    delete clonedQuiz.__v;
    delete clonedQuiz.attempts;
    delete clonedQuiz.analytics;
    
    // Appliquer les options
    Object.assign(clonedQuiz, options);
    
    // Incrémenter la version
    clonedQuiz.version = this.version + 1;
    clonedQuiz.parentQuiz = this._id;
    
    return clonedQuiz;
};

/**
 * Génère un rapport détaillé
 */
quizSchema.methods.generateReport = function(options = {}) {
    const { includeQuestions = true, includeAttempts = false } = options;
    
    const report = {
        quizId: this._id,
        title: this.title,
        description: this.description,
        status: this.status,
        settings: this.settings,
        analytics: this.analytics,
        totalQuestions: this.questions.length,
        totalPoints: this.totalPoints,
        estimatedDifficulty: this.estimatedDifficulty,
        estimatedDuration: this.estimatedDuration,
        isAvailable: this.isAvailable,
        timeRemaining: this.timeRemaining,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
    
    if (includeQuestions) {
        report.questions = this.questions.map((q, index) => ({
            index,
            type: q.type,
            text: q.text,
            points: q.points,
            difficulty: q.difficulty,
            tags: q.tags
        }));
    }
    
    if (includeAttempts) {
        report.attempts = this.attempts.map(a => ({
            userId: a.user,
            score: a.score,
            status: a.status,
            startedAt: a.startedAt,
            completedAt: a.completedAt,
            timeSpent: a.timeSpent
        }));
    }
    
    return report;
};

// ==================== STATICS ====================

/**
 * Recherche des quiz avec filtres avancés
 */
quizSchema.statics.search = async function(filters = {}) {
    const {
        query,
        courseId,
        status,
        category,
        tags,
        difficulty,
        createdBy,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = filters;
    
    const skip = (page - 1) * limit;
    
    const searchQuery = {};
    
    // Filtre par texte
    if (query) {
        searchQuery.$text = { $search: query };
    }
    
    // Filtres simples
    if (courseId) searchQuery.course = courseId;
    if (status) searchQuery.status = status;
    if (category) searchQuery.category = category;
    if (createdBy) searchQuery.createdBy = createdBy;
    
    // Filtre par tags
    if (tags && tags.length > 0) {
        searchQuery.tags = { $all: tags };
    }
    
    // Filtre par difficulté estimée
    if (difficulty) {
        // Cette logique nécessiterait un pré-calcul ou une aggregation
    }
    
    const [quizzes, total] = await Promise.all([
        this.find(searchQuery)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limit)
            .populate('course', 'title')
            .populate('createdBy', 'fullName avatar')
            .lean(),
        this.countDocuments(searchQuery)
    ]);
    
    return {
        quizzes,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Récupère les statistiques globales des quiz
 */
quizSchema.statics.getGlobalStats = async function() {
    const stats = await this.aggregate([
        {
            $facet: {
                totalQuizzes: [{ $count: 'count' }],
                byStatus: [
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ],
                byCategory: [
                    { $group: { _id: '$category', count: { $sum: 1 } } }
                ],
                averageQuestions: [
                    { $group: { _id: null, avg: { $avg: { $size: '$questions' } } } }
                ],
                totalAttempts: [
                    { $unwind: '$attempts' },
                    { $count: 'count' }
                ],
                recentActivity: [
                    { $sort: { updatedAt: -1 } },
                    { $limit: 10 },
                    {
                        $project: {
                            title: 1,
                            status: 1,
                            updatedAt: 1,
                            'analytics.totalAttempts': 1
                        }
                    }
                ]
            }
        }
    ]);
    
    return {
        totalQuizzes: stats[0].totalQuizzes[0]?.count || 0,
        byStatus: stats[0].byStatus.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {}),
        byCategory: stats[0].byCategory.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {}),
        averageQuestions: stats[0].averageQuestions[0]?.avg || 0,
        totalAttempts: stats[0].totalAttempts[0]?.count || 0,
        recentActivity: stats[0].recentActivity
    };
};

// ==================== MIDDLEWARE ====================

// Pré-save: calculer les points totaux
quizSchema.pre('save', function(next) {
    // Calculer les points totaux des questions
    if (this.questions && this.questions.length > 0) {
        // Les points totaux sont calculés par le virtual
        // Mais nous pourrions pré-calculer d'autres métriques ici
    }
    
    // Valider les dates de disponibilité
    if (this.settings.availableFrom && this.settings.availableUntil) {
        if (this.settings.availableFrom >= this.settings.availableUntil) {
            return next(new Error('La date de début doit être antérieure à la date de fin'));
        }
    }
    
    next();
});

// Post-save: créer une notification si le quiz est publié
quizSchema.post('save', async function(doc) {
    if (doc.isModified('status') && doc.status === 'published') {
        try {
            // Notifier les étudiants inscrits au cours
            const NotificationService = require('../services/notification.service');
            await NotificationService.sendQuizPublishedNotification(doc);
        } catch (error) {
            console.error('Failed to send quiz published notification:', error);
        }
    }
});

// ==================== EXPORT ====================

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;