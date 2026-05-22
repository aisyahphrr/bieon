const mongoose = require('mongoose');

const deviceWhitelistSchema = new mongoose.Schema({
    manufacturer: { 
        type: String, 
        required: true 
    },
    model: { 
        type: String, 
        required: true 
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('DeviceWhitelist', deviceWhitelistSchema);
