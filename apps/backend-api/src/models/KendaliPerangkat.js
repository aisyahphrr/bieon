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
        enum: ['Discovered', 'Active', '1', '0', 'OFFLINE', 'STALE', 'ORPHAN', 'BLOCKED'], 
        default: 'Discovered' 
    },
    lifecycleState: { 
        type: String, 
        enum: ['UNCLAIMED', 'PROVISIONED', 'AUTH_PENDING', 'AUTHORIZED', 'STALE', 'ORPHAN', 'BLOCKED', 'DECOMMISSIONED'],
        default: 'UNCLAIMED' 
    },
    isAuthorized: { type: Boolean, default: false },
    tenantId: { type: String }, // For multi-tenant isolation
    bieonId: { type: String },  // Hierarchical mapping (BIEON System ID)
    device_ieee: { type: String, sparse: true }, // Hardware architecture requirement
    modelId: { type: String }, // Technical ID (e.g. SNZB_02DR2)
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
        waterTemp: { type: Number },
        // Power Meter Telemetry
        currentLoad: { type: Number }, // Beban Saat Ini (Watt/kW)
        energyToday: { type: Number }, // Konsumsi Hari Ini (kWh)
        lastEnergyReading: { type: Number } // Pembacaan kWh sebelumnya untuk delta billing
    },
    battery: { type: Number },
    lastSeen: { type: Date },
    controlledDevice: { type: String, default: null }, // For Remotes: TV, AC, Kipas, etc.
    remoteState: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }, // Persistent state for remote sub-targets (e.g. AC_temp: 24, TV_power: 1)
    isPinned: { type: Boolean, default: false },
    lastCommandStatus: { type: String }, // For command response correlation
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
}, { 
    timestamps: true,
    collection: 'kendaliperangkat' // Specifically requested name
});

module.exports = mongoose.model('KendaliPerangkat', kendaliPerangkatSchema);
