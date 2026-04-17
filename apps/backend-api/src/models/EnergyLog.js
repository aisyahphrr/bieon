const mongoose = require('mongoose');

const energyLogSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    date: { type: Date, required: true }, // Format per jam (e.g. 2026-04-17T10:00:00Z)
    totalKwh: { type: Number, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexing for faster queries on specific hours
energyLogSchema.index({ owner: 1, date: 1 });

module.exports = mongoose.model('EnergyLog', energyLogSchema);
