const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: { type: String, required: true },
    room: { type: String, required: true }, // Lokasi/Ruangan (R1, R2, Outdoor)
    desc: { type: String, required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    homeowner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Opsional saat baru dibuat
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
