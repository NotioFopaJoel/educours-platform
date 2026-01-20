const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
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
        maxlength: 500
    },
    category: {
        type: String,
        required: true,
        enum: ['mathematics', 'physics', 'computer_science', 'languages', 'business', 'art']
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountedPrice: {
        type: Number,
        min: 0,
        validate: {
            validator: function(value) {
                return value <= this.price;
            },
            message: 'Discounted price cannot be higher than regular price'
        }
    },
    currency: {
        type: String,
        default: 'MAD',
        enum: ['MAD', 'USD', 'EUR']
    },
    thumbnail: {
        url: String,
        publicId: String
    },
    previewVideo: {
        url: String,
        publicId: String
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    durationHours: {
        type: Number,
        default: 0,
        min: 0
    },
    totalLessons: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    totalStudents: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    requirements: [String],
    learningObjectives: [String],
    targetAudience: [String],
    tags: [String],
    metadata: {
        views: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 }
    },
    publishedAt: Date,
    approvalDate: Date,
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    versionKey: false
});

// Indexes
courseSchema.index({ slug: 1 });
courseSchema.index({ teacher: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ rating: -1 });
courseSchema.index({ totalStudents: -1 });
courseSchema.index({ createdAt: -1 });

// Compound indexes
courseSchema.index({ isPublished: 1, isApproved: 1 });
courseSchema.index({ category: 1, isPublished: 1 });
courseSchema.index({ teacher: 1, isPublished: 1 });

// Text search index
courseSchema.index({
    title: 'text',
    description: 'text',
    shortDescription: 'text',
    tags: 'text'
});

module.exports = mongoose.model('Course', courseSchema);