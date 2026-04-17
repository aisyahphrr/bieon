const mongoose = require('mongoose');

const hubSchema = new mongoose.Schema({
    name: { type: String, required: true }, // misal: "Hub 1", "Hub 2"
    bieonId: { type: String, required: true }, // ID BIEON dari Master
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Online', 'Offline'], default: 'Offline' }
}, { timestamps: true });

module.exports = mongoose.model('Hub', hubSchema);
