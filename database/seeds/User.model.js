const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let userSchema;
userSchema = new mongoose.Schema({
  // Basic Information
  notificationPreferences: {
    email: {type: Boolean, default: true},
    push: {type: Boolean, default: true},
    course: {type: Boolean, default: true},
    payment: {type: Boolean, default: true},
    assignment: {type: Boolean, default: true},
    system: {type: Boolean, default: true},
    live: {type: Boolean, default: true},
    support: {type: Boolean, default: true}
  },
  notificationStats: {
    unreadcount: {type: Number, default: 0},totalCount: {type: Number, default: 0},lastUpdated: {type: Date, default: Date.now }
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: 6
  },

  // Role-based fields
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },

  // Common fields for all users
  avatar: {
    type: String,
    default: null
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'Cameroon'
  },
  address: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },

  // Student specific fields
  studentInfo: {
    level: {
      type: String,
      enum: ['Ordinary Level', 'Advanced Level', 'University', 'Professional'],
      default: 'Ordinary Level'
    },
    school: String,
    enrollmentDate: Date,
    guardianName: String,
    guardianPhone: String
  },

  // Teacher specific fields
  teacherInfo: {
    qualification: String,
    experience: {
      type: Number,
      default: 0
    },
    subjects: [String],
    specialties: [String],
    certificates: [{
      name: String,
      issuingOrganization: String,
      issueDate: Date,
      fileUrl: String
    }],
    paymentMethod: {
      type: {
        type: String,
        enum: ['mtn', 'orange', 'bank', 'paypal'],
        default: 'mtn'
      },
      details: {
        mtnNumber: String,
        orangeNumber: String,
        bankName: String,
        accountNumber: String,
        paypalEmail: String
      }
    },
    earnings: {
      totalEarned: {
        type: Number,
        default: 0
      },
      pendingAmount: {
        type: Number,
        default: 0
      },
      lastPaymentDate: Date,
      paymentHistory: [{
        amount: Number,
        date: Date,
        method: String,
        status: {
          type: String,
          enum: ['pending', 'completed', 'failed'],
          default: 'pending'
        }
      }]
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      totalReviews: {
        type: Number,
        default: 0
      }
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended', 'rejected'],
      default: 'pending'
    }
  },

  // Admin specific fields
  adminInfo: {
    permissions: [String],
    lastLogin: Date,
    loginHistory: [{
      date: Date,
      ip: String,
      device: String
    }]
  },

  // Account status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailverificationToken: String,
  emailverificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Timestamps
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },

  // Relationships
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  refreshTokens: [{
    token: String,
    userAgent: String,
    ipAddress: String,
    createdAt: {type: Date, default: Date.now},
    revoked: {type: Boolean, default: false}
  }],
  loginLogs: [{
    date: Date,
    ipAddress: String,
    userAgent: String,
    success: Boolean
  }],
  securityNotifications: [{
    token: String,
    userAgent: String,
    ipAddress: String,
    createdAt: {type: Date, default: Date.now},
    revoked: {type: Boolean, default: false}
  }],
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  lastlogin: Date
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

module.exports = mongoose.model('User', userSchema);

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET || 'educours-secret-key',
    { expiresIn: '7d' }
  );
};

// Get user statistics
userSchema.methods.getStatistics = function() {
  const stats = {
    totalCourses: this.enrolledCourses?.length || 0,
    completionRate: 0,
    averageScore: 0,
    totalHours: 0
  };
  
  return stats;
};

// Update last login
userSchema.methods.updateLastLogin = function(ip, device) {
  this.lastLogin = new Date();
  this.loginCount += 1;
  
  if (this.role === 'admin' && this.adminInfo) {
    this.adminInfo.loginHistory.push({
      date: new Date(),
      ip: ip || 'Unknown',
      device: device || 'Unknown'
    });
    
    // Keep only last 10 logins
    if (this.adminInfo.loginHistory.length > 10) {
      this.adminInfo.loginHistory.shift();
    }
  }
  
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;