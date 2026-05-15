const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

async function audit() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const devices = await KendaliPerangkat.find({ bieonId: 'bieon_002' });
        
        console.log('--- AUDIT DEVICE BIEON_002 ---');
        devices.forEach(d => {
            console.log(`ID: ${d._id}`);
            console.log(`Name: ${d.name}`);
            console.log(`Type: ${d.type}`);
            console.log(`IEEE: ${d.device_ieee}`);
            console.log(`ModelID: ${d.modelId}`);
            console.log('---------------------------');
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

audit();
