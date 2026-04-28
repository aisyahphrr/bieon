const mongoose = require('mongoose');

const accountDeletionRequestSchema = new mongoose.Schema({
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    targetRole: {
        type: String,
        enum: ['Homeowner', 'Technician'],
        required: true,
    },
    targetSnapshot: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        username: { type: String, default: '' },
        technicianId: { type: String, default: '' },
        bieonId: { type: String, default: '' },
        phoneNumber: { type: String, default: '' },
        address: { type: String, default: '' },
        workArea: { type: String, default: '' },
        position: { type: String, default: '' },
        status: { type: String, default: '' },
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    requestedBySnapshot: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, required: true },
    },
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true,
    },
    decisionTokenHash: {
        type: String,
        required: true,
        unique: true,
    },
    projectOwnerEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    decisionNote: {
        type: String,
        default: '',
    },
    decidedAt: {
        type: Date,
        default: null,
    },
    targetNotifiedAt: {
        type: Date,
        default: null,
    },
    requesterNotifiedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

accountDeletionRequestSchema.index({ targetUser: 1, createdAt: -1 });

module.exports = mongoose.model('AccountDeletionRequest', accountDeletionRequestSchema);
