// backend/src/models/AssignmentSubmission.model.js
const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
    // Relations
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true,
        index: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    enrollment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment',
        required: true,
        index: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
        index: true
    },
    
    // Identifiant unique
    submissionId: {
        type: String,
        unique: true,
        required: true
    },
    
    // Contenu de la soumission
    content: {
        text: {
            type: String,
            maxlength: 5000
        },
        files: [{
            filename: String,
            originalName: String,
            fileType: String,
            fileSize: Number,
            fileUrl: String,
            uploadedAt: Date
        }],
        links: [{
            url: String,
            title: String,
            description: String
        }],
        code: {
            language: String,
            code: String,
            repositoryUrl: String
        }
    },
    
    // Statut de la soumission
    status: {
        type: String,
        enum: ['draft', 'submitted', 'late', 'graded', 'returned', 'rejected'],
        default: 'draft',
        index: true
    },
    
    // Dates importantes
    submittedAt: {
        type: Date,
        index: true
    },
    lastEditedAt: {
        type: Date,
        default: Date.now
    },
    gradedAt: Date,
    
    // Notation
    grade: {
        score: {
            type: Number,
            min: 0
        },
        maxScore: {
            type: Number,
            default: 100
        },
        percentage: Number,
        letterGrade: String,
        rubricScores: [{
            criterion: String,
            score: Number,
            maxScore: Number,
            feedback: String
        }]
    },
    
    // Feedback
    feedback: {
        teacherComments: {
            type: String,
            maxlength: 2000
        },
        audioFeedback: {
            url: String,
            duration: Number
        },
        videoFeedback: {
            url: String,
            duration: Number
        },
        annotatedFiles: [{
            fileUrl: String,
            annotations: [{
                page: Number,
                comment: String,
                position: {
                    x: Number,
                    y: Number
                }
            }]
        }]
    },
    
    // Corrections
    corrections: [{
        requirement: String,
        status: {
            type: String,
            enum: ['pending', 'corrected', 'needs_improvement'],
            default: 'pending'
        },
        feedback: String,
        correctedAt: Date
    }],
    
    // Plagiat et originalité
    originality: {
        score: Number,
        reportUrl: String,
        checkedAt: Date,
        highlightedMatches: [{
            source: String,
            percentage: Number,
            text: String
        }]
    },
    
    // Suivi de révisions
    revisions: [{
        version: Number,
        content: {
            text: String,
            files: [Object],
            links: [Object]
        },
        submittedAt: Date,
        notes: String
    }],
    
    // Métadonnées de soumission
    metadata: {
        ipAddress: String,
        userAgent: String,
        device: String,
        browser: String,
        wordCount: Number,
        pageCount: Number,
        submissionSource: {
            type: String,
            enum: ['web', 'mobile', 'api'],
            default: 'web'
        }
    },
    
    // Paramètres
    settings: {
        allowResubmission: { type: Boolean, default: false },
        allowLateSubmission: { type: Boolean, default: false },
        visibility: {
            type: String,
            enum: ['private', 'students', 'public'],
            default: 'private'
        }
    },
    
    // État
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Historique des modifications
    history: [{
        action: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changes: mongoose.Schema.Types.Mixed,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
assignmentSubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
assignmentSubmissionSchema.index({ student: 1, status: 1 });
assignmentSubmissionSchema.index({ teacher: 1, status: 1 });
assignmentSubmissionSchema.index({ submittedAt: -1 });
assignmentSubmissionSchema.index({ 'grade.percentage': -1 });

// Méthodes d'instance
assignmentSubmissionSchema.methods.calculateGrade = function() {
    if (!this.grade || this.grade.score === undefined) {
        this.grade = this.grade || {};
        this.grade.percentage = 0;
        this.grade.letterGrade = this.getLetterGrade(0);
        return;
    }
    
    if (this.grade.maxScore && this.grade.maxScore > 0) {
        this.grade.percentage = Math.round((this.grade.score / this.grade.maxScore) * 100);
    } else {
        this.grade.percentage = this.grade.score || 0;
    }
    
    this.grade.letterGrade = this.getLetterGrade(this.grade.percentage);
};

assignmentSubmissionSchema.methods.getLetterGrade = function(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
};

assignmentSubmissionSchema.methods.addRevision = function(content, notes = '') {
    const newVersion = this.revisions.length + 1;
    
    this.revisions.push({
        version: newVersion,
        content: {
            text: content.text || this.content.text,
            files: content.files || this.content.files,
            links: content.links || this.content.links
        },
        submittedAt: new Date(),
        notes
    });
    
    this.lastEditedAt = new Date();
    
    // Ajouter à l'historique
    this.history.push({
        action: 'revision_added',
        changedBy: this.student.user,
        changes: { version: newVersion },
        timestamp: new Date()
    });
    
    return newVersion;
};

assignmentSubmissionSchema.methods.submit = function() {
    if (this.status === 'draft') {
        this.status = 'submitted';
        this.submittedAt = new Date();
        
        // Vérifier si c'est en retard
        const Assignment = mongoose.model('Assignment');
        return Assignment.findById(this.assignment)
            .then(assignment => {
                if (assignment && assignment.deadline && this.submittedAt > assignment.deadline) {
                    this.status = 'late';
                }
                
                // Ajouter à l'historique
                this.history.push({
                    action: 'submitted',
                    changedBy: this.student.user,
                    changes: { status: this.status },
                    timestamp: new Date()
                });
                
                return this.save();
            });
    }
    
    return Promise.resolve(this);
};

assignmentSubmissionSchema.methods.gradeSubmission = function(score, maxScore, feedback, rubricScores = []) {
    this.status = 'graded';
    this.grade = {
        score,
        maxScore,
        feedback: feedback || this.grade?.feedback
    };
    
    if (rubricScores.length > 0) {
        this.grade.rubricScores = rubricScores;
    }
    
    this.calculateGrade();
    this.gradedAt = new Date();
    
    // Ajouter à l'historique
    this.history.push({
        action: 'graded',
        changedBy: this.teacher.user,
        changes: { 
            score,
            maxScore,
            percentage: this.grade.percentage 
        },
        timestamp: new Date()
    });
    
    return this.save();
};

assignmentSubmissionSchema.methods.returnForCorrection = function(feedback) {
    this.status = 'returned';
    this.feedback = this.feedback || {};
    this.feedback.teacherComments = feedback;
    
    // Ajouter à l'historique
    this.history.push({
        action: 'returned_for_correction',
        changedBy: this.teacher.user,
        changes: { feedback },
        timestamp: new Date()
    });
    
    return this.save();
};

// Middleware pre-save
assignmentSubmissionSchema.pre('save', function(next) {
    // Générer un ID de soumission s'il n'existe pas
    if (!this.submissionId) {
        this.submissionId = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    
    // Mettre à jour la note si nécessaire
    if (this.grade && (this.isModified('grade.score') || this.isModified('grade.maxScore'))) {
        this.calculateGrade();
    }
    
    // Calculer les métadonnées
    if (this.isModified('content.text')) {
        this.metadata = this.metadata || {};
        this.metadata.wordCount = this.content.text ? this.content.text.split(/\s+/).length : 0;
    }
    
    next();
});

// Middleware post-save
assignmentSubmissionSchema.post('save', async function() {
    // Mettre à jour la soumission dans l'inscription
    const Enrollment = mongoose.model('Enrollment');
    const enrollment = await Enrollment.findById(this.enrollment);
    
    if (enrollment) {
        const gradeIndex = enrollment.grades.findIndex(g => 
            g.assignment && g.assignment.toString() === this.assignment.toString()
        );
        
        const gradeData = {
            assignment: this.assignment,
            score: this.grade?.score,
            maxScore: this.grade?.maxScore,
            percentage: this.grade?.percentage,
            gradedAt: this.gradedAt,
            grader: this.teacher.user
        };
        
        if (gradeIndex >= 0) {
            enrollment.grades[gradeIndex] = gradeData;
        } else {
            enrollment.grades.push(gradeData);
        }
        
        await enrollment.save();
    }
});

// Méthodes statiques
assignmentSubmissionSchema.statics.findByAssignmentAndStudent = async function(assignmentId, studentId) {
    return this.findOne({
        assignment: assignmentId,
        student: studentId
    })
    .populate('assignment', 'title description deadline maxScore')
    .populate({
        path: 'student',
        select: 'user',
        populate: {
            path: 'user',
            select: 'name email avatar'
        }
    })
    .populate('teacher', 'user');
};

assignmentSubmissionSchema.statics.getAssignmentSubmissions = async function(assignmentId, options = {}) {
    const { page = 1, limit = 20, status, graded } = options;
    
    const query = { assignment: assignmentId };
    if (status) query.status = status;
    if (graded !== undefined) {
        query.status = graded ? 'graded' : { $ne: 'graded' };
    }
    
    const submissions = await this.find(query)
        .populate({
            path: 'student',
            select: 'user',
            populate: {
                path: 'user',
                select: 'name email avatar'
            }
        })
        .sort({ submittedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    
    const total = await this.countDocuments(query);
    
    return {
        submissions,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

assignmentSubmissionSchema.statics.getStudentSubmissions = async function(studentId, options = {}) {
    const { page = 1, limit = 20, courseId, status } = options;
    
    const query = { student: studentId };
    if (status) query.status = status;
    
    if (courseId) {
        const Assignment = mongoose.model('Assignment');
        const assignmentIds = await Assignment.find({ course: courseId }).distinct('_id');
        query.assignment = { $in: assignmentIds };
    }
    
    const submissions = await this.find(query)
        .populate({
            path: 'assignment',
            select: 'title course deadline maxScore',
            populate: {
                path: 'course',
                select: 'title thumbnail'
            }
        })
        .sort({ submittedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    
    const total = await this.countDocuments(query);
    
    return {
        submissions,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);

module.exports = AssignmentSubmission;