const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: String }, // e.g., "R1 - Ruang Keluarga"
    actuator: { type: String, required: true }, // e.g., "Smart TV"
    status: { type: String, required: true }, // e.g., "ON", "OFF"
    trigger: { 
        type: String, 
        // Removing strict enum to allow dynamic triggers like "Otomasi (Suhu > 31°C)"
        default: 'Manual (Web)'
    },
    action: { type: String }, // Optional, misal: "Menyalakan AC"
    details: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

activitySchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
