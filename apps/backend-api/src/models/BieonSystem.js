const mongoose = require('mongoose');
const dataSizePlugin = require('../plugins/dataSizePlugin');

const bieonSystemSchema = new mongoose.Schema({
    bieonId: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false 
    },
    hubCount: { 
        type: Number, 
        required: true, 
        default: 1 
    },
    status: { 
        type: String, 
        enum: ['Active', 'Maintenance', 'Offline'], 
        default: 'Active' 
    }
}, { timestamps: true });

bieonSystemSchema.plugin(dataSizePlugin);

module.exports = mongoose.model('BieonSystem', bieonSystemSchema);
