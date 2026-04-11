const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'MAD',
        enum: ['MAD', 'USD', 'EUR']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit_card', 'paypal', 'bank_transfer', 'cash', 'mobile_money']
    },
    paymentProvider: {
        type: String,
        enum: ['stripe', 'paypal', 'cmi', 'manual', null]
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    providerTransactionId: String,
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    refundDate: Date,
    refundAmount: Number,
    refundReason: String,
    billingDetails: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        address: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            postalCode: String,
            country: String
        }
    },
    paymentDetails: {
        // For credit card payments (store only last 4 digits)
        last4: String,
        brand: String,
        // For bank transfer
        bankName: String,
        accountNumber: String,
        // For mobile money
        phoneNumber: String,
        operator: String
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        deviceType: String
    },
    notes: String,
    errorMessage: String
}, {
    timestamps: true,
    versionKey: false
});

// Indexes
paymentSchema.index({ user: 1 });
paymentSchema.index({ course: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ course: 1, status: 1 });
paymentSchema.index({ paymentMethod: 1, status: 1 });

// Index for reporting
paymentSchema.index({
    status: 1,
    paymentDate: 1,
    amount: 1
});

module.exports = mongoose.model('Payment', paymentSchema);