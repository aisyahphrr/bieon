const mongoose = require('mongoose');

const complaintTimelineSchema = new mongoose.Schema({
    time: { type: String, required: true },
    desc: { type: String, required: true },
    status: { type: String }
}, { _id: false });

const complaintSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    category: { type: String, required: true },
    device: { type: String, required: true },
    desc: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['unassigned', 'menunggu respons', 'diproses', 'menunggu konfirmasi pelanggan', 'selesai', 'overdue respons', 'overdue perbaikan', 'ditolak'], 
        default: 'unassigned' 
    },
    homeowner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    timeline: [complaintTimelineSchema],
    files: [{
        name: String,
        url: String
    }],
    rating: {
        stars: { type: Number, min: 1, max: 5 },
        review: { type: String }
    },
    assignedAt: { type: Date, default: null },
    processStartedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    isEscalated: { type: Boolean, default: false },
    responsePoints: { type: Number, default: 0 },
    repairPoints: { type: Number, default: 0 },
    responseDuration: { type: String, default: null },
    repairDuration: { type: String, default: null },
    logRequestStatus: { type: String, enum: ['none', 'pending', 'granted', 'rejected', 'requested'], default: 'none' },
    logReason: { type: String, default: '' },
    hasStartedRepair: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
