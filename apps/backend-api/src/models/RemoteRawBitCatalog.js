const mongoose = require('mongoose');

const remoteRawBitCatalogSchema = new mongoose.Schema({
    bieonId: { type: String, required: true, trim: true, index: true },
    rawSignature: { type: String, required: true },
    rawPayload: { type: mongoose.Schema.Types.Mixed, required: true },
    rawBitText: { type: String },
    rawBitHex: { type: String },
    rawBitBinary: { type: String },
    protocol: { type: String },
    bitLength: { type: Number },
    bitCount: { type: Number },
    sequence: { type: Number },
    sessionId: { type: String },
    sourceTopic: { type: String },
    sourceRemoteId: { type: String },
    sourceRemoteIeee: { type: String },
    sourceHubId: { type: String },
    deviceType: { type: String },
    controlGroup: { type: String },
    controlAction: { type: String },
    controlLabel: { type: String },
    controlSchema: { type: mongoose.Schema.Types.Mixed },
    notes: { type: String },
    captureStatus: {
        type: String,
        enum: ['captured', 'mapped', 'disabled'],
        default: 'captured'
    },
    isActive: { type: Boolean, default: true },
    captureCount: { type: Number, default: 1 },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    latestEventPayload: { type: mongoose.Schema.Types.Mixed }
}, {
    timestamps: true,
    collection: 'remote_raw_bit_catalog'
});

remoteRawBitCatalogSchema.index({ bieonId: 1, rawSignature: 1 }, { unique: true });
remoteRawBitCatalogSchema.index({ bieonId: 1, lastSeenAt: -1 });

module.exports = mongoose.model('RemoteRawBitCatalog', remoteRawBitCatalogSchema);