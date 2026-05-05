const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    timestamp: { type: Date, default: Date.now }
}, {
    collection: 'sensordatas'
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
