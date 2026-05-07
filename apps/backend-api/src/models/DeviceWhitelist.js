const mongoose = require('mongoose');

const deviceWhitelistSchema = new mongoose.Schema({
    device_ieee: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
    },
    device_name: { 
        type: String, 
        required: true 
    },
    model_id: { 
        type: String, 
        required: true 
    },
    device_id: {
        type: String,
        required: true
    },
    device_profile: {
        type: String,
        default: 'UNKNOWN'
    },
    hub_ieee: {
        type: String
    },
    master_ieee: {
        type: String
    },
    approved: { 
        type: Boolean, 
        default: true 
    },
    reason: { 
        type: String 
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('DeviceWhitelist', deviceWhitelistSchema);
