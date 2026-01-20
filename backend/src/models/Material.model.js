// backend/src/models/Material.model.js
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true,
        enum: ['pdf', 'doc', 'ppt', 'excel', 'image', 'video', 'zip', 'other']
    },
    fileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number, // en bytes
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index pour les recherches rapides
materialSchema.index({ course: 1, module: 1, order: 1 });
materialSchema.index({ title: 'text', description: 'text' });

// Virtual pour l'URL de téléchargement
materialSchema.virtual('downloadUrl').get(function() {
    return `/api/materials/${this._id}/download`;
});

// Méthode pour incrémenter les téléchargements
materialSchema.methods.incrementDownloads = async function() {
    this.downloads += 1;
    await this.save();
};

// Middleware pre-save
materialSchema.pre('save', function(next) {
    if (!this.metadata) {
        this.metadata = new Map();
    }
    next();
});

module.exports = mongoose.model('Material', materialSchema);