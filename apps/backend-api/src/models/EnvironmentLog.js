const mongoose = require('mongoose');

const environmentLogSchema = new mongoose.Schema({
    hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },
    date: { type: Date, required: true },
    avgTemperature: { type: Number, required: true }, // Store as Number for calculations
    avgHumidity: { type: String, required: true }, // Store as String to match UI "55%"
    room: { type: String, required: true }, // e.g., "R1 - Ruang Keluarga"
    status: { 
        type: String, 
        enum: ['Nyaman', 'Tidak Nyaman', 'Out of Range'], 
        default: 'Nyaman' 
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

environmentLogSchema.index({ owner: 1, date: -1 });

module.exports = mongoose.model('EnvironmentLog', environmentLogSchema);
