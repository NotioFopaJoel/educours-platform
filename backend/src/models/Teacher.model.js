// backend/src/models/Teacher.model.js
const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // Informations professionnelles
    teacherId: {
        type: String,
        unique: true,
        sparse: true
    },
    title: {
        type: String,
        enum: ['mr', 'mrs', 'ms', 'dr', 'prof'],
        default: 'mr'
    },
    bio: {
        type: String,
        maxlength: 2000
    },
    shortBio: {
        type: String,
        maxlength: 500
    },
    specialization: [{
        type: String,
        trim: true
    }],
    qualifications: [{
        degree: String,
        institution: String,
        year: Number,
        certificateUrl: String
    }],
    experience: {
        years: { type: Number, default: 0 },
        description: String
    },
    
    // Informations de contact professionnel
    website: {
        type: String,
        trim: true
    },
    linkedin: {
        type: String,
        trim: true
    },
    twitter: {
        type: String,
        trim: true
    },
    youtube: {
        type: String,
        trim: true
    },
    
    // Cours et enseignements
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    publishedCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    draftCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    
    // Élèves
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    
    // Revenus et paiements
    earnings: {
        total: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
        withdrawn: { type: Number, default: 0 },
        lastPayout: Date
    },
    payoutMethod: {
        type: {
            type: String,
            enum: ['bank', 'paypal', 'mobile_money', 'crypto'],
            default: 'bank'
        },
        details: {
            bankName: String,
            accountNumber: String,
            accountName: String,
            paypalEmail: String,
            phoneNumber: String,
            walletAddress: String
        },
        verified: { type: Boolean, default: false }
    },
    minimumPayout: {
        type: Number,
        default: 50
    },
    
    // Évaluations et réputation
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
        breakdown: {
            '5': { type: Number, default: 0 },
            '4': { type: Number, default: 0 },
            '3': { type: Number, default: 0 },
            '2': { type: Number, default: 0 },
            '1': { type: Number, default: 0 }
        }
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    
    // Disponibilité et planning
    availability: {
        schedule: [{
            day: {
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            slots: [{
                start: String,
                end: String,
                type: {
                    type: String,
                    enum: ['consultation', 'office_hours', 'live_class']
                }
            }]
        }],
        timezone: {
            type: String,
            default: 'UTC'
        },
        bookingLeadTime: { // en heures
            type: Number,
            default: 24
        }
    },
    
    // Paramètres d'enseignement
    teachingPreferences: {
        maxStudentsPerClass: { type: Number, default: 30 },
        preferredTeachingMethods: [String],
        language: {
            type: String,
            default: 'fr'
        },
        responseTime: { // en heures
            type: Number,
            default: 24
        }
    },
    
    // Statistiques
    statistics: {
        totalStudents: { type: Number, default: 0 },
        activeStudents: { type: Number, default: 0 },
        courseCompletionRate: { type: Number, default: 0 },
        averageStudentRating: { type: Number, default: 0 },
        totalTeachingHours: { type: Number, default: 0 },
        lastActivity: { type: Date, default: Date.now }
    },
    
    // Documents de vérification
    verification: {
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected', 'unverified'],
            default: 'unverified'
        },
        documents: [{
            type: {
                type: String,
                enum: ['id_card', 'diploma', 'certificate', 'resume', 'portfolio']
            },
            url: String,
            verified: { type: Boolean, default: false },
            uploadedAt: Date
        }],
        verifiedAt: Date,
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    
    // Paramètres de notification
    notifications: {
        newEnrollments: { type: Boolean, default: true },
        courseReviews: { type: Boolean, default: true },
        assignmentSubmissions: { type: Boolean, default: true },
        paymentUpdates: { type: Boolean, default: true },
        studentMessages: { type: Boolean, default: true }
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
    isFeatured: {
        type: Boolean,
        default: false
    },
    featuredUntil: Date,
    
    // Suspension et restrictions
    suspension: {
        isSuspended: { type: Boolean, default: false },
        reason: String,
        suspendedAt: Date,
        suspendedUntil: Date,
        suspendedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
}, {
    timestamps: true
});

// Indexes
teacherSchema.index({ user: 1 });
teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ 'ratings.average': -1 });
teacherSchema.index({ 'earnings.total': -1 });
teacherSchema.index({ 'verification.status': 1 });
teacherSchema.index({ isFeatured: 1 });
teacherSchema.index({ 'statistics.lastActivity': -1 });

// Méthodes d'instance
teacherSchema.methods.calculateRating = function() {
    const breakdown = this.ratings.breakdown;
    const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) return 0;
    
    const weightedSum = (5 * breakdown['5'] || 0) +
                       (4 * breakdown['4'] || 0) +
                       (3 * breakdown['3'] || 0) +
                       (2 * breakdown['2'] || 0) +
                       (1 * breakdown['1'] || 0);
    
    return weightedSum / total;
};

teacherSchema.methods.getTeachingStats = async function() {
    const Course = mongoose.model('Course');
    const courses = await Course.find({ instructor: this._id });
    
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;
    const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
    
    // Calculer le revenu mensuel
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const Payment = mongoose.model('Payment');
    const monthlyRevenue = await Payment.aggregate([
        {
            $match: {
                teacher: this._id,
                status: 'completed',
                createdAt: { $gte: oneMonthAgo }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);
    
    return {
        totalCourses,
        publishedCourses,
        draftCourses: totalCourses - publishedCourses,
        totalEnrollments,
        monthlyRevenue: monthlyRevenue[0]?.total || 0
    };
};

teacherSchema.methods.addEarning = async function(amount, type = 'course_sale') {
    this.earnings.total += amount;
    this.earnings.pending += amount;
    
    // Historique des gains
    const Earning = mongoose.model('Earning');
    await Earning.create({
        teacher: this._id,
        amount,
        type,
        status: 'pending',
        transactionDate: new Date()
    });
    
    return this.save();
};

teacherSchema.methods.requestPayout = async function(amount) {
    if (amount < this.minimumPayout) {
        throw new Error(`Montant minimum de retrait: ${this.minimumPayout}`);
    }
    
    if (amount > this.earnings.pending) {
        throw new Error('Fonds insuffisants');
    }
    
    // Créer une demande de retrait
    const PayoutRequest = mongoose.model('PayoutRequest');
    const payoutRequest = await PayoutRequest.create({
        teacher: this._id,
        amount,
        payoutMethod: this.payoutMethod,
        status: 'pending',
        requestedAt: new Date()
    });
    
    // Mettre à jour les gains en attente
    this.earnings.pending -= amount;
    await this.save();
    
    return payoutRequest;
};

// Middleware pre-save
teacherSchema.pre('save', function(next) {
    // Mettre à jour la note moyenne
    if (this.isModified('ratings.breakdown')) {
        this.ratings.average = this.calculateRating();
        this.ratings.count = Object.values(this.ratings.breakdown).reduce((sum, count) => sum + count, 0);
    }
    
    // Mettre à jour la date de dernière activité
    this.statistics.lastActivity = new Date();
    
    next();
});

// Méthodes statiques
teacherSchema.statics.getTopTeachers = async function(limit = 10) {
    return this.find({ 
        isActive: true, 
        'verification.status': 'verified',
        'courses.0': { $exists: true }
    })
    .sort({ 'ratings.average': -1, 'statistics.totalStudents': -1 })
    .limit(limit)
    .populate('user', 'name avatar email')
    .select('user ratings statistics specialization bio');
};

teacherSchema.statics.getTeacherByUserId = async function(userId) {
    return this.findOne({ user: userId })
        .populate('user', 'name email avatar phone')
        .populate({
            path: 'courses',
            select: 'title thumbnail price enrollmentCount rating isPublished',
            options: { limit: 10 }
        })
        .populate({
            path: 'students',
            select: 'user',
            populate: {
                path: 'user',
                select: 'name avatar'
            },
            options: { limit: 10 }
        });
};

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;