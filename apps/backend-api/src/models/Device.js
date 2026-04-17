const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Light', 'AC', 'Sensor'], required: true },
    status: { type: String, enum: ['ON', 'OFF', 'OFFLINE'], default: 'OFF' },
    hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: String, required: true } // misal: "R1", "R2", "Outdoor"
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
