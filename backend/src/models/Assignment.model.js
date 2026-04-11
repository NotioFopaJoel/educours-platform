
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    default: ''
  },
  
  // Course and Teacher
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Timing
  createdAt: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Grading
  totalPoints: {
    type: Number,
    required: true,
    min: 0
  },
  weight: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  gradingRubric: [{
    criteria: String,
    points: Number,
    description: String
  }],
  
  // Attachments
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Submissions
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    files: [{
      name: String,
      url: String,
      type: String,
      size: Number
    }],
    textSubmission: String,
    submittedAt: Date,
    lateSubmission: {
      type: Boolean,
      default: false
    },
    lateDays: Number,
    grade: {
      points: Number,
      percentage: Number,
      feedback: String,
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      gradedAt: Date,
      rubricScores: [{
        criteria: String,
        points: Number,
        feedback: String
      }]
    },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'returned', 'missing'],
      default: 'submitted'
    }
  }],
  
  // Statistics
  totalSubmissions: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0
  },
  
  // Settings
  allowResubmission: {
    type: Boolean,
    default: false
  },
  maxResubmissions: {
    type: Number,
    default: 1
  },
  plagiarismCheck: {
    type: Boolean,
    default: false
  },
  requireApproval: {
    type: Boolean,
    default: false
  },
  
  // Status
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  
  // Metadata
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for due status
assignmentSchema.virtual('status').get(function() {
  const now = new Date();
  if (!this.isPublished) return 'draft';
  if (now > this.dueDate) return 'overdue';
  if (this.dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'due_soon';
  return 'active';
});

// Virtual for submission count
assignmentSchema.virtual('submissionCount').get(function() {
  return this.submissions.length;
});

// Virtual for pending grading count
assignmentSchema.virtual('pendingGradingCount').get(function() {
  return this.submissions.filter(s => s.status === 'submitted').length;
});

// Indexes
assignmentSchema.index({ course: 1, dueDate: -1 });
assignmentSchema.index({ teacher: 1 });
assignmentSchema.index({ dueDate: 1 });

// Method to submit assignment
assignmentSchema.methods.submitAssignment = async function(studentId, submissionData) {
  const existingSubmission = this.submissions.find(s => 
    s.student.toString() === studentId.toString()
  );
  
  const now = new Date();
  const isLate = now > this.dueDate;
  const lateDays = isLate ? Math.ceil((now - this.dueDate) / (1000 * 60 * 60 * 24)) : 0;
  
  const submission = {
    student: studentId,
    submittedAt: now,
    lateSubmission: isLate,
    lateDays: lateDays,
    status: 'submitted'
  };
  
  if (submissionData.files) {
    submission.files = submissionData.files;
  }
  
  if (submissionData.textSubmission) {
    submission.textSubmission = submissionData.textSubmission;
  }
  
  if (existingSubmission) {
    if (!this.allowResubmission) {
      throw new Error('Resubmission not allowed');
    }
    
    const resubmissionCount = this.submissions
      .filter(s => s.student.toString() === studentId.toString())
      .length;
    
    if (resubmissionCount >= this.maxResubmissions) {
      throw new Error('Maximum resubmissions reached');
    }
    
    this.submissions.push(submission);
  } else {
    this.submissions.push(submission);
  }
  
  this.totalSubmissions += 1;
  
  await this.save();
  
  // Update course progress
  const Course = require('./Course.model');
  const course = await Course.findById(this.course);
  if (course) {
    // Trigger progress update
    // This would update the student's progress in the course
  }
  
  return submission;
};

// Method to grade assignment
assignmentSchema.methods.gradeAssignment = async function(studentId, gradeData, graderId) {
  const submission = this.submissions.find(s => 
    s.student.toString() === studentId.toString()
  );
  
  if (!submission) {
    throw new Error('Submission not found');
  }
  
  // Calculate percentage
  const percentage = (gradeData.points / this.totalPoints) * 100;
  
  // Apply late penalty if applicable
  let finalPoints = gradeData.points;
  if (submission.lateSubmission && this.latePenalty > 0) {
    const penalty = (gradeData.points * this.latePenalty) / 100;
    finalPoints = Math.max(0, gradeData.points - penalty);
  }
  
  submission.grade = {
    points: finalPoints,
    percentage: (finalPoints / this.totalPoints) * 100,
    feedback: gradeData.feedback,
    gradedBy: graderId,
    gradedAt: new Date(),
    rubricScores: gradeData.rubricScores || []
  };
  
  submission.status = 'graded';
  
  // Update statistics
  const gradedSubmissions = this.submissions.filter(s => s.grade);
  if (gradedSubmissions.length > 0) {
    this.averageScore = gradedSubmissions.reduce((sum, s) => 
      sum + s.grade.percentage, 0) / gradedSubmissions.length;
  }
  
  this.completionRate = (this.submissions.filter(s => s.status === 'graded').length / 
    this.course.enrolledStudents.length) * 100;
  
  await this.save();
  
  // Create notification for student
  const Notification = require('./Notification.model');
  await Notification.create({
    user: studentId,
    type: 'assignment_graded',
    title: 'Assignment Graded',
    message: `Your assignment "${this.title}" has been graded. Score: ${finalPoints}/${this.totalPoints}`,
    data: {
      assignmentId: this._id,
      courseId: this.course,
      points: finalPoints,
      totalPoints: this.totalPoints
    }
  });
  
  return submission;
};

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;