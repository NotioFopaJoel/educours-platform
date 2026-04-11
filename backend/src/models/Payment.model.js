const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment Information
  reference: {
    type: String,
    required: true,
    unique: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // User Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'FCFA',
    enum: ['FCFA', 'USD', 'EUR']
  },
  discountApplied: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  
  // Payment Method
  method: {
    type: String,
    required: true,
    enum: ['mtn_momo', 'orange_money', 'card', 'bank_transfer', 'paypal']
  },
  paymentDetails: {
    // MTN Mobile Money
    mtnPhoneNumber: String,
    mtnTransactionId: String,
    
    // Orange Money
    orangePhoneNumber: String,
    orangeTransactionId: String,
    
    // Card
    cardLast4: String,
    cardBrand: String,
    cardCountry: String,
    
    // Bank Transfer
    bankName: String,
    accountNumber: String,
    transferReference: String,
    
    // PayPal
    paypalEmail: String,
    paypalTransactionId: String
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: [
      'pending',           // Payment initiated
      'processing',        // Payment being processed
      'requires_action',   // Additional action required
      'requires_capture',  // Requires manual capture
      'succeeded',         // Payment successful
      'failed',            // Payment failed
      'canceled',          // Payment canceled
      'refunded',          // Payment refunded
      'disputed',          // Payment disputed
      'requires_confirmation' // Requires admin confirmation
    ],
    default: 'pending'
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  verificationNotes: String,
  
  // Payout to Teacher
  teacherPayout: {
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    payoutDate: Date,
    payoutMethod: String,
    payoutReference: String
  },
  
  // Platform Commission
  platformCommission: {
    amount: Number,
    percentage: Number
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String,
    browser: String
  },
  
  // Error Information
  errorCode: String,
  errorMessage: String,
  retryCount: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  expiresAt: Date,
  paidAt: Date,
  refundedAt: Date,
  
  // Receipt
  receiptUrl: String,
  invoiceNumber: String,
  
  // Security
  securityToken: String,
  isFraudulent: {
    type: Boolean,
    default: false
  },
  fraudScore: {
    type: Number,
    default: 0
  },
  fraudCheckPerformed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
paymentSchema.index({ reference: 1 });
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ course: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: 1 });
paymentSchema.index({ 'paymentDetails.mtnTransactionId': 1 }, { sparse: true });
paymentSchema.index({ 'paymentDetails.orangeTransactionId': 1 }, { sparse: true });

// Pre-save middleware to generate reference and calculate amounts
paymentSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate unique reference
    if (!this.reference) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      this.reference = `EDU-${timestamp}-${random}`;
    }
    
    // Calculate final amount
    this.finalAmount = this.amount - (this.amount * this.discountApplied / 100);
    
    // Calculate platform commission (30% default)
    const commissionPercentage = 30;
    this.platformCommission = {
      amount: (this.finalAmount * commissionPercentage) / 100,
      percentage: commissionPercentage
    };
    
    // Calculate teacher payout
    const Course = require('./Course.model');
    Course.findById(this.course).then(course => {
      if (course) {
        const teacherPercentage = course.teacherPercentage || 70;
        this.teacherPayout = {
          amount: (this.finalAmount * teacherPercentage) / 100,
          status: 'pending'
        };
      }
    }).catch(next);
    
    // Set expiry (24 hours)
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to verify payment
paymentSchema.methods.verifyPayment = async function(adminId, notes = '') {
  if (this.status !== 'requires_confirmation') {
    throw new Error('Payment cannot be verified in current status');
  }
  
  this.status = 'succeeded';
  this.isVerified = true;
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  this.verificationNotes = notes;
  
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = async function(reason = '') {
  if (this.status !== 'succeeded') {
    throw new Error('Only successful payments can be refunded');
  }
  
  this.status = 'refunded';
  this.refundedAt = new Date();
  
  // Update related entities
  const User = require('./User.model');
  const Course = require('./Course.model');
  
  // Remove course from user's enrolled courses
  await User.findByIdAndUpdate(this.user, {
    $pull: { enrolledCourses: this.course }
  });
  
  // Decrease course student count
  await Course.findByIdAndUpdate(this.course, {
    $inc: { currentStudents: -1 }
  });
  
  return this.save();
};

// Method to check if payment is expired
paymentSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Method to retry payment
paymentSchema.methods.retryPayment = function() {
  if (this.retryCount >= 3) {
    throw new Error('Maximum retry attempts exceeded');
  }
  
  this.status = 'pending';
  this.retryCount += 1;
  this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  return this.save();
};

// Static method to get payment statistics
paymentSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        totalPayments: [
          { $count: 'count' }
        ],
        totalRevenue: [
          { $match: { status: 'succeeded' } },
          { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ],
        monthlyRevenue: [
          { $match: { status: 'succeeded', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
          { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ],
        paymentMethods: [
          { $match: { status: 'succeeded' } },
          { $group: { _id: '$method', count: { $sum: 1 }, amount: { $sum: '$finalAmount' } } }
        ],
        statusDistribution: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]
      }
    }
  ]);
  
  return stats[0];
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment