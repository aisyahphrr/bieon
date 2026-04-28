const mongoose = require('mongoose');

const kendaliPerangkatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    hubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },
    category: { 
        type: String, 
        enum: ['Sensor', 'Control Actuator System'], 
        required: true 
    },
    type: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Discovered', 'Active'], 
        default: 'Discovered' 
    },
    // Thresholds for Sensors
    thresholds: {
        // Kualitas Air
        ph: { type: Number },
        turbidity: { type: Number },
        tds: { type: Number },
        temperature: { type: Number },
        notes: { type: String },
        // Kenyamanan
        humidity: { type: Number },
        // Keamanan
        isMotionEnabled: { type: Boolean, default: false },
        isDoorEnabled: { type: Boolean, default: false }
    },
    // Control Logic for Actuators
    controlMethod: { 
        type: String, 
        enum: ['Manual', 'Lingkungan', 'Jadwal'],
        default: 'Manual'
    },
    environmentAspect: { 
        type: String, 
        enum: ['Kualitas Air', 'Kenyamanan', 'Keamanan', null],
        default: null
    },
    scheduleSettings: [{
        startTime: { type: String },
        endTime: { type: String },
        action: { type: String },
        days: [{ type: String }]
    }],
    // Real-time Telemetry dari Sensor Fisik
    currentValues: {
        temperature: { type: Number },
        humidity: { type: Number },
        ph: { type: Number },
        turbidity: { type: Number },
        tds: { type: Number },
        waterTemp: { type: Number }
    },
    battery: { type: Number },
    lastSeen: { type: Date },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { 
    timestamps: true,
    collection: 'kendaliperangkat' // Specifically requested name
});

module.exports = mongoose.model('KendaliPerangkat', kendaliPerangkatSchema);
