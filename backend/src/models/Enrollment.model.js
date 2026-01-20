// backend/src/models/Enrollment.model.js
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    // Relations
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
        index: true
    },
    
    // Informations d'inscription
    enrollmentId: {
        type: String,
        unique: true,
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    enrollmentMethod: {
        type: String,
        enum: ['direct', 'invitation', 'promotion', 'admin'],
        default: 'direct'
    },
    
    // Statut et progression
    status: {
        type: String,
        enum: ['active', 'completed', 'dropped', 'suspended', 'pending'],
        default: 'active',
        index: true
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    completedAt: Date,
    droppedAt: Date,
    
    // Informations de paiement
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    pricePaid: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    discountApplied: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'free', 'scholarship', 'pending', 'failed'],
        default: 'paid'
    },
    
    // Suivi d'activité
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    totalTimeSpent: {
        type: Number, // en minutes
        default: 0
    },
    accessCount: {
        type: Number,
        default: 0
    },
    
    // Progression détaillée
    completedLessons: [{
        lesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        },
        completedAt: Date,
        timeSpent: Number // en minutes
    }],
    
    completedSections: [{
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section'
        },
        completedAt: Date
    }],
    
    // Notes et évaluations
    grades: [{
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment'
        },
        score: Number,
        maxScore: Number,
        percentage: Number,
        gradedAt: Date,
        grader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    averageGrade: {
        type: Number,
        default: 0
    },
    
    // Certificat
    certificate: {
        issued: { type: Boolean, default: false },
        certificateId: String,
        issuedAt: Date,
        downloadUrl: String,
        requirementsMet: { type: Boolean, default: false }
    },
    
    // Paramètres
    settings: {
        notifications: {
            newContent: { type: Boolean, default: true },
            deadlines: { type: Boolean, default: true },
            announcements: { type: Boolean, default: true }
        },
        playbackSpeed: {
            type: Number,
            default: 1.0
        },
        subtitles: {
            enabled: { type: Boolean, default: false },
            language: { type: String, default: 'fr' }
        }
    },
    
    // Données de suivi
    analytics: {
        dailyProgress: [{
            date: Date,
            timeSpent: Number,
            lessonsCompleted: Number
        }],
        peakHours: [{
            hour: Number,
            frequency: Number
        }]
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
    }
}, {
    timestamps: true
});

// Indexes composés
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1, enrolledAt: -1 });
enrollmentSchema.index({ teacher: 1, status: 1 });
enrollmentSchema.index({ status: 1, enrolledAt: -1 });
enrollmentSchema.index({ progress: 1 });
enrollmentSchema.index({ 'certificate.issued': 1 });

// Méthodes d'instance
enrollmentSchema.methods.updateProgress = function() {
    const Course = mongoose.model('Course');
    
    return Course.findById(this.course)
        .populate({
            path: 'sections',
            populate: {
                path: 'lessons',
                select: '_id'
            }
        })
        .then(course => {
            if (!course) return 0;
            
            const totalLessons = course.sections.reduce((total, section) => {
                return total + (section.lessons ? section.lessons.length : 0);
            }, 0);
            
            if (totalLessons === 0) return 0;
            
            const completedCount = this.completedLessons.length;
            const progress = Math.round((completedCount / totalLessons) * 100);
            
            this.progress = Math.min(progress, 100);
            
            // Mettre à jour le statut si le cours est terminé
            if (this.progress >= 100 && this.status !== 'completed') {
                this.status = 'completed';
                this.completedAt = new Date();
                this.certificate.requirementsMet = true;
            }
            
            return this.progress;
        });
};

enrollmentSchema.methods.completeLesson = function(lessonId, timeSpent = 0) {
    // Vérifier si la leçon n'est pas déjà complétée
    const alreadyCompleted = this.completedLessons.some(
        lesson => lesson.lesson.toString() === lessonId.toString()
    );
    
    if (!alreadyCompleted) {
        this.completedLessons.push({
            lesson: lessonId,
            completedAt: new Date(),
            timeSpent
        });
        
        // Mettre à jour le temps total
        this.totalTimeSpent += timeSpent;
        
        // Mettre à jour la dernière activité
        this.lastAccessed = new Date();
        this.accessCount += 1;
    }
    
    return this.updateProgress();
};

enrollmentSchema.methods.getTimeStats = function() {
    const totalMinutes = this.totalTimeSpent;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return {
        totalMinutes,
        formatted: `${hours}h ${minutes}m`,
        averagePerDay: this.accessCount > 0 ? totalMinutes / this.accessCount : 0
    };
};

enrollmentSchema.methods.calculateGrade = function() {
    if (!this.grades || this.grades.length === 0) {
        this.averageGrade = 0;
        return 0;
    }
    
    const total = this.grades.reduce((sum, grade) => {
        if (grade.percentage) {
            return sum + grade.percentage;
        } else if (grade.score && grade.maxScore) {
            return sum + (grade.score / grade.maxScore) * 100;
        }
        return sum;
    }, 0);
    
    this.averageGrade = total / this.grades.length;
    return this.averageGrade;
};

// Middleware pre-save
enrollmentSchema.pre('save', function(next) {
    // Générer un ID d'inscription s'il n'existe pas
    if (!this.enrollmentId) {
        this.enrollmentId = `ENR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    
    // Mettre à jour la note moyenne si les notes ont changé
    if (this.isModified('grades')) {
        this.calculateGrade();
    }
    
    next();
});

// Middleware post-save
enrollmentSchema.post('save', async function() {
    // Mettre à jour les statistiques de l'étudiant
    const Student = mongoose.model('Student');
    await Student.findByIdAndUpdate(this.student, {
        $addToSet: { enrollments: this._id },
        $set: { 'statistics.lastActive': new Date() }
    });
    
    // Mettre à jour les statistiques du cours
    const Course = mongoose.model('Course');
    await Course.findByIdAndUpdate(this.course, {
        $inc: { enrollmentCount: 1 }
    });
    
    // Mettre à jour les statistiques du professeur
    const Teacher = mongoose.model('Teacher');
    await Teacher.findByIdAndUpdate(this.teacher, {
        $inc: { 
            'statistics.totalStudents': 1,
            'statistics.activeStudents': this.status === 'active' ? 1 : 0
        },
        $addToSet: { students: this.student }
    });
});

// Méthodes statiques
enrollmentSchema.statics.findByStudentAndCourse = async function(studentId, courseId) {
    return this.findOne({
        student: studentId,
        course: courseId
    })
    .populate('course', 'title thumbnail instructor category')
    .populate('student', 'user')
    .populate('teacher', 'user');
};

enrollmentSchema.statics.getActiveEnrollments = async function(studentId) {
    return this.find({
        student: studentId,
        status: 'active',
        isActive: true
    })
    .populate({
        path: 'course',
        select: 'title thumbnail description instructor category progress duration'
    })
    .sort({ lastAccessed: -1 });
};

enrollmentSchema.statics.getCourseEnrollments = async function(courseId, options = {}) {
    const { page = 1, limit = 20, status } = options;
    
    const query = { course: courseId };
    if (status) query.status = status;
    
    const enrollments = await this.find(query)
        .populate({
            path: 'student',
            select: 'user',
            populate: {
                path: 'user',
                select: 'name email avatar'
            }
        })
        .sort({ enrolledAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    
    const total = await this.countDocuments(query);
    
    return {
        enrollments,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;