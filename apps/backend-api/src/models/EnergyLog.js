const mongoose = require('mongoose');

const energyLogSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'KendaliPerangkat', required: true },
    date: { type: Date, required: true },
    totalKwh: { type: Number, required: true },
    voltage: { type: Number },
    current: { type: Number },
    power: { type: Number },
    pf: { type: Number },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexing for faster queries on specific owners and dates
energyLogSchema.index({ owner: 1, date: -1 });

module.exports = mongoose.model('EnergyLog', energyLogSchema);
