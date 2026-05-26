const mongoose = require('mongoose');
const dataSizePlugin = require('../plugins/dataSizePlugin');

const PdmMeterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    device_id: { type: String, required: true, unique: true },
    bieonId: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isSystemMeter: { type: Boolean, default: false },
    manufacturer: { type: String },
    modelId: { type: String },
    status: { type: String, default: 'Active' },
    currentValues: {
        lastEnergyReading: { type: Number, default: 0 },
        energyToday: { type: Number, default: 0 },
        currentLoad: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

PdmMeterSchema.plugin(dataSizePlugin);

module.exports = mongoose.model('PdmMeter', PdmMeterSchema);
