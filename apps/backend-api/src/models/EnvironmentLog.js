const mongoose = require('mongoose');

const environmentLogSchema = new mongoose.Schema({
    hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },
    date: { type: Date, required: true }, // Format per jam
    avgTemperature: { type: Number, required: true },
    avgHumidity: { type: Number, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

environmentLogSchema.index({ owner: 1, date: 1 });

module.exports = mongoose.model('EnvironmentLog', environmentLogSchema);
