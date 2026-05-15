const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
    category: { 
        type: String, 
        enum: ['Keamanan', 'Air Sanitasi', 'Energi', 'Sistem', 'Pengaduan', 'Kenyamanan'],
        default: 'Sistem'
    },
    title: { type: String },
    room: { type: String }, // e.g., "R1 - Pintu Utama"
    messageKey: { type: String }, // Kunci translasi (contoh: 'notif.device_on')
    message: { type: String }, // Raw message sebagai fallback
    type: { 
        type: String, 
        enum: ['Info', 'Warning', 'Danger', 'Waspada', 'Bahaya', 'Success'], 
        default: 'Info' 
    },
    isRead: { type: Boolean, default: false },
    isSeen: { type: Boolean, default: false },
    link: { type: String }, // e.g., "admin-complaint", "pengaduan"
    metadata: { type: mongoose.Schema.Types.Mixed }, // Untuk data tambahan (deviceId, scrollTarget)
    date: { type: Date, default: Date.now }
}, { timestamps: true });

alertSchema.index({ owner: 1, date: -1 });

module.exports = mongoose.model('Alert', alertSchema);
