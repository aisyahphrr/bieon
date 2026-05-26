const mongoose = require('mongoose');
const dataSizePlugin = require('../plugins/dataSizePlugin');

const scheduleSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['ON', 'OFF'], required: true },
    time: { type: String, required: true }, // Format "HH:mm"
    days: [{ type: String }], // Array of days, e.g. ["Monday", "Wednesday"]
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

scheduleSchema.plugin(dataSizePlugin);

module.exports = mongoose.model('Schedule', scheduleSchema);
