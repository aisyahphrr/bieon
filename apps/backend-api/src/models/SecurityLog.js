const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'KendaliPerangkat' },
    room: { type: String, required: true },
    door: { type: String, default: 'Tertutup' }, // e.g., "Terbuka", "Tertutup"
    motion: { type: String, default: 'Tidak Ada Gerak' }, // e.g., "Terdeteksi Gerak"
    status: { 
        type: String, 
        enum: ['Aman', 'Waspada', 'Bahaya'], 
        default: 'Aman' 
    },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

securityLogSchema.index({ owner: 1, date: -1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
