const mongoose = require('mongoose');
const dataSizePlugin = require('../plugins/dataSizePlugin');

const sensorDataSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    timestamp: { type: Date, default: Date.now }
}, {
    collection: 'sensordatas'
});

sensorDataSchema.plugin(dataSizePlugin);

module.exports = mongoose.model('SensorData', sensorDataSchema);
