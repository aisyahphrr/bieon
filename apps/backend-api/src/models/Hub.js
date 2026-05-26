const mongoose = require('mongoose');
const dataSizePlugin = require('../plugins/dataSizePlugin');

const hubSchema = new mongoose.Schema({
    name: { type: String, required: true }, // misal: "Hub 1", "Hub 2"
    bieonId: { type: String, required: true }, // ID BIEON dari Master
    device_ieee: { type: String }, // MAC/IEEE Address for the Hub
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    tenantId: { type: String }, // For multi-tenant isolation
    status: { type: String, enum: ['Online', 'Offline'], default: 'Offline' }
}, { timestamps: true });

hubSchema.plugin(dataSizePlugin);

module.exports = mongoose.model('Hub', hubSchema);
