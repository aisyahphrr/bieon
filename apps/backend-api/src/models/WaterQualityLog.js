const mongoose = require('mongoose');

const waterQualityLogSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    device: { type: String, required: true }, // e.g., "Toren Air"
    ph: { type: Number, required: true },
    turbidity: { type: String, required: true }, // e.g., "2 NTU"
    temperature: { type: String, required: true }, // e.g., "24.0°C"
    tds: { type: String, required: true }, // e.g., "150 ppm"
    status: { 
        type: String, 
        enum: ['Layak Pakai', 'Tidak Layak', 'Out of Range'], 
        default: 'Layak Pakai' 
    },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

waterQualityLogSchema.index({ owner: 1, date: -1 });

module.exports = mongoose.model('WaterQualityLog', waterQualityLogSchema);
