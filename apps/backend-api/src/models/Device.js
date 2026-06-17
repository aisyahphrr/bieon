const mongoose = require('mongoose');
const dataSizePlugin = require('../plugins/dataSizePlugin');

const deviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, 
    status: { type: String, default: 'OFFLINE' }, // Backward Compatibility
    lifecycleState: { 
        type: String, 
        enum: ['UNCLAIMED', 'PROVISIONED', 'AUTH_PENDING', 'AUTHORIZED', 'STALE', 'ORPHAN', 'BLOCKED', 'DECOMMISSIONED'],
        default: 'UNCLAIMED' 
    },
    isAuthorized: { type: Boolean, default: false },
    ieeeAddress: { type: String, unique: true, sparse: true }, // Network Source of Truth
    model: { type: String },
    vendor: { type: String },
    metadata: [String],
    hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tenantId: { type: String }, // For multi-tenant isolation
    bieonId: { type: String, uppercase: true },  // Hierarchical mapping
    hubId: { type: String },    // Hierarchical mapping
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

deviceSchema.plugin(dataSizePlugin);

module.exports = mongoose.model('Device', deviceSchema);
