// backend/src/models/Student.model.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // Informations académiques
    studentId: {
        type: String,
        unique: true,
        sparse: true
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'beginner'
    },
    fieldOfStudy: {
        type: String,
        trim: true
    },
    institution: {
        type: String,
        trim: true
    },
    graduationYear: {
        type: Number
    },
    
    // Progression et performance
    points: {
        type: Number,
        default: 0
    },
    xp: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number,
        default: 0
    },
    badges: [{
        name: String,
        description: String,
        icon: String,
        earnedAt: Date,
        category: String
    }],
    
    // Cours et inscriptions
    enrollments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment'
    }],
    completedCourses: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        completedAt: Date,
        finalGrade: Number,
        certificateId: String
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    
    // Devoirs et évaluations
    assignments: [{
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment'
        },
        status: {
            type: String,
            enum: ['not_started', 'in_progress', 'submitted', 'graded', 'overdue'],
            default: 'not_started'
        },
        submittedAt: Date,
        grade: Number,
        feedback: String
    }],
    
    // Préférences d'apprentissage
    learningPreferences: {
        language: {
            type: String,
            default: 'fr'
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        },
        pace: {
            type: String,
            enum: ['slow', 'moderate', 'fast'],
            default: 'moderate'
        },
        notifications: {
            newCourses: { type: Boolean, default: true },
            deadlines: { type: Boolean, default: true },
            announcements: { type: Boolean, default: true }
        }
    },
    
    // Statistiques
    statistics: {
        totalStudyTime: {
            type: Number,
            default: 0
        },
        averageGrade: {
            type: Number,
            default: 0
        },
        completionRate: {
            type: Number,
            default: 0
        },
        streakDays: {
            type: Number,
            default: 0
        },
        lastActive: {
            type: Date,
            default: Date.now
        }
    },
    
    // Informations financières étudiantes
    studentDiscount: {
        eligible: { type: Boolean, default: false },
        percentage: { type: Number, default: 0 },
        verifiedAt: Date
    },
    
    // Métadonnées
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // État
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDocuments: [{
        type: {
            type: String,
            enum: ['student_id', 'enrollment_proof', 'transcript']
        },
        url: String,
        verified: { type: Boolean, default: false },
        uploadedAt: Date
    }]
}, {
    timestamps: true
});

// Indexes
studentSchema.index({ user: 1 });
studentSchema.index({ studentId: 1 });
studentSchema.index({ points: -1 });
studentSchema.index({ level: 1 });
studentSchema.index({ 'statistics.lastActive': -1 });

// Méthodes d'instance
studentSchema.methods.calculateLevel = function() {
    const levels = [
        { xp: 0, level: 'beginner' },
        { xp: 1000, level: 'intermediate' },
        { xp: 5000, level: 'advanced' },
        { xp: 15000, level: 'expert' }
    ];
    
    for (let i = levels.length - 1; i >= 0; i--) {
        if (this.xp >= levels[i].xp) {
            return levels[i].level;
        }
    }
    return 'beginner';
};

studentSchema.methods.getProgress = async function() {
    const Enrollment = mongoose.model('Enrollment');
    const enrollments = await Enrollment.find({ student: this._id });
    
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress >= 100).length;
    const inProgressCourses = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
    
    return {
        totalCourses,
        completedCourses,
        inProgressCourses,
        completionRate: totalCourses > 0 ? (completedCourses / totalCourses * 100) : 0
    };
};

studentSchema.methods.addBadge = function(badgeName, description, icon, category) {
    const badge = {
        name: badgeName,
        description,
        icon,
        earnedAt: new Date(),
        category: category || 'achievement'
    };
    
    this.badges.push(badge);
    return badge;
};

studentSchema.methods.getActiveAssignments = function() {
    return this.assignments.filter(a => 
        a.status === 'not_started' || a.status === 'in_progress'
    );
};

// Middleware pre-save
studentSchema.pre('save', function(next) {
    // Mettre à jour le niveau basé sur l'XP
    this.level = this.calculateLevel();
    
    // Mettre à jour la date de dernière activité
    this.statistics.lastActive = new Date();
    
    next();
});

// Méthode statique pour trouver les meilleurs étudiants
studentSchema.statics.getTopStudents = async function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ points: -1, xp: -1 })
        .limit(limit)
        .populate('user', 'name avatar email')
        .select('user points xp level badges statistics');
};

studentSchema.statics.getStudentByUserId = async function(userId) {
    return this.findOne({ user: userId })
        .populate('user', 'name email avatar phone')
        .populate({
            path: 'enrollments',
            populate: {
                path: 'course',
                select: 'title thumbnail instructor category'
            }
        })
        .populate('wishlist', 'title thumbnail price');
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;