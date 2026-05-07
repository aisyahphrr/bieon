const mongoose = require('mongoose');

const waterQualityLogSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'KendaliPerangkat' },
    hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
    ph: { type: Number, required: true },
    turbidity: { type: Number, required: true },
    temperature: { type: Number, required: true },
    tds: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Layak Pakai', 'Tidak Layak', 'Out of Range'], 
        default: 'Layak Pakai' 
    },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

waterQualityLogSchema.index({ owner: 1, date: -1 });

module.exports = mongoose.model('WaterQualityLog', waterQualityLogSchema);
