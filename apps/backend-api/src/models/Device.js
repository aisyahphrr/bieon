const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, 
    status: { type: String, default: 'OFFLINE' },
    ieeeAddress: { type: String, unique: true, sparse: true }, // Network Source of Truth
    model: { type: String },
    vendor: { type: String },
    metadata: [String],
    hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    room: { type: String, default: 'Unassigned' },
    
    // Real-time Telemetry (Data Asli dari Sensor)
    currentValues: {
        temperature: { type: Number },
        humidity: { type: Number },
        waterTemp: { type: Number },
        ph: { type: Number },
        turbidity: { type: Number },
        tds: { type: Number }
    },

    // Configuration/Thresholds (Settingan User)
    thresholds: {
        temperature: { type: Number },
        humidity: { type: Number },
        ph: { type: Number },
        turbidity: { type: Number },
        tds: { type: Number },
        waterTemp: { type: Number },
        isMotionEnabled: { type: Boolean },
        isDoorEnabled: { type: Boolean }
    },
    battery: { type: Number },
    lastSeen: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
