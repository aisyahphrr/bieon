const mongoose = require('mongoose');
const dataSizePlugin = require('../plugins/dataSizePlugin');

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

deviceWhitelistSchema.plugin(dataSizePlugin);

module.exports = mongoose.model('DeviceWhitelist', deviceWhitelistSchema);
