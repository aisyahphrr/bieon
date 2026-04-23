const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { 
        type: String, 
        enum: ['Keamanan', 'Air Sanitasi', 'Energi', 'Gas', 'Sistem'],
        default: 'Sistem'
    },
    room: { type: String }, // e.g., "R1 - Pintu Utama"
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['Info', 'Warning', 'Danger', 'Waspada', 'Bahaya'], 
        default: 'Info' 
    },
    isRead: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

alertSchema.index({ owner: 1, date: -1 });

module.exports = mongoose.model('Alert', alertSchema);
