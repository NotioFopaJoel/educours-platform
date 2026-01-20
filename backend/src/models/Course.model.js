const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // Course Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  
  // Categorization
  subject: {
    type: String,
    required: true,
    enum: [
      'Mathematics', 'Physics', 'Chemistry', 'Biology',
      'Computer Science', 'English', 'French', 'History',
      'Geography', 'Economics', 'Philosophy', 'Art',
      'Music', 'Physical Education', 'Other'
    ]
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Ordinary Level', 'Advanced Level', 'University']
  },
  category: {
    type: String,
    enum: ['Academic', 'Professional', 'Skill Development', 'Test Preparation'],
    default: 'Academic'
  },
  
  // Media
  thumbnail: {
    type: String,
    required: true
  },
  bannerImage: String,
  promoVideo: String,
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'FCFA',
    enum: ['FCFA', 'USD', 'EUR']
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  discountExpiry: Date,
  
  // Duration and Schedule
  duration: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'months'
    }
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    time: String,
    timezone: {
      type: String,
      default: 'Africa/Douala'
    }
  },
  
  // Content Structure
  chapters: [{
    title: String,
    description: String,
    order: Number,
    lessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }]
  }],
  
  // Requirements and Outcomes
  prerequisites: [String],
  learningOutcomes: [String],
  targetAudience: [String],
  
  // Teacher Information
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  
  // Statistics
  totalStudents: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalHours: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Content
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  }],
  assignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }],
  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  liveClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveClass'
  }],
  
  // Status and Settings
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'suspended'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  maxStudents: {
    type: Number,
    default: 50
  },
  currentStudents: {
    type: Number,
    default: 0
  },
  
  // Metadata
  tags: [String],
  language: {
    type: String,
    default: 'English'
  },
  certificateAvailable: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  publishedAt: Date,
  lastUpdated: Date,
  
  // Created by Admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discounted price
courseSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Virtual for availability
courseSchema.virtual('isAvailable').get(function() {
  return this.status === 'published' && this.currentStudents < this.maxStudents;
});

// Pre-save middleware to update slug
courseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Method to enroll student
courseSchema.methods.enrollStudent = async function(studentId) {
  if (this.currentStudents >= this.maxStudents) {
    throw new Error('Course is full');
  }
  
  if (this.status !== 'published') {
    throw new Error('Course is not available for enrollment');
  }
  
  this.currentStudents += 1;
  this.totalStudents += 1;
  
  return this.save();
};

// Method to calculate teacher earnings
courseSchema.methods.calculateTeacherEarnings = function() {
  return (this.discountedPrice * this.currentStudents * this.teacherPercentage) / 100;
};

// Method to get course progress for a specific student
courseSchema.methods.getStudentProgress = async function(studentId) {
  const LessonProgress = require('./LessonProgress.model');
  
  const totalLessons = this.chapters.reduce((total, chapter) => {
    return total + chapter.lessons.length;
  }, 0);
  
  const completedLessons = await LessonProgress.countDocuments({
    student: studentId,
    course: this._id,
    isCompleted: true
  });
  
  return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;