const mongoose = require('mongoose');
const dataSizePlugin = require('../plugins/dataSizePlugin');

const securityLogSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'KendaliPerangkat' },
    hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
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

securityLogSchema.plugin(dataSizePlugin);

module.exports = mongoose.model('SecurityLog', securityLogSchema);
