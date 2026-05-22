const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
    bieonId: { type: String, required: true },
    topic: { type: String, required: true },
    eventType: { type: String },
    payload: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

systemLogSchema.index({ bieonId: 1, createdAt: -1 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
