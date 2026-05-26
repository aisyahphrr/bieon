const mongoose = require('mongoose');
const dataSizePlugin = require('../plugins/dataSizePlugin');

const authEventSchema = new mongoose.Schema({
    type: { type: String, enum: ['auth_request', 'auth_response'], required: true },
    status: { type: String, enum: ['pending', 'allow', 'block', 'rejected'], required: true },
    decision: { type: String, default: '' },
    master_ieee: { type: String, required: true },
    hub_ieee: { type: String },
    device_ieee: { type: String, required: true },
    device_id: { type: String },
    device_name: { type: String },
    device_profile: { type: String },
    model_id: { type: String },
    alias: { type: String },
    cached: { type: Boolean, default: false },
    source: { type: String, enum: ['zigbee', 'mqtt', 'cloud'], default: 'mqtt' },
    ts: { type: Number, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Indexes
authEventSchema.index({ master_ieee: 1, device_ieee: 1 });
authEventSchema.index({ device_ieee: 1 });
authEventSchema.index({ alias: 1 });
authEventSchema.index({ status: 1 });
authEventSchema.index({ ts: 1 });
authEventSchema.index({ master_ieee: 1, status: 1, ts: 1 });

authEventSchema.plugin(dataSizePlugin);

module.exports = mongoose.model('AuthEvent', authEventSchema);
