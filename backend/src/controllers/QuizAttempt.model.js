
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    selectedOptions: [String], // Pour multiple_choice
    answer: mongoose.Schema.Types.Mixed, // Pour true_false (boolean) ou short_answer (string)
    text: String // Pour short_answer
});

const QuizAttemptSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [AnswerSchema],
    score: {
        type: Number,
        default: 0
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        default: 0
    },
    isPassing: {
        type: Boolean,
        default: false
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    expiresAt: {
        type: Date
    },
    duration: {
        type: Number, // en minutes
        default: 0
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'expired', 'abandoned'],
        default: 'in_progress'
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index pour les performances
QuizAttemptSchema.index({ quiz: 1, user: 1 });
QuizAttemptSchema.index({ user: 1, completedAt: -1 });
QuizAttemptSchema.index({ quiz: 1, percentage: -1 });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
[file content end]