const mongoose = require('mongoose');
const dataSizePlugin = require('../plugins/dataSizePlugin');

const technicianAccessSchema = new mongoose.Schema({
    homeownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    technicianId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    token: { 
        type: String, 
        required: true 
    },
    tokenExpiresAt: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Active', 'Completed', 'Expired'], 
        default: 'Pending' 
    },
    startTime: { 
        type: Date 
    },
    endTime: { 
        type: Date 
    },
    report: { 
        type: String 
    }
}, { 
    timestamps: true 
});

technicianAccessSchema.plugin(dataSizePlugin);

module.exports = mongoose.model('TechnicianAccess', technicianAccessSchema);
