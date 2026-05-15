const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const Hub = require('../apps/backend-api/src/models/Hub');
const Device = require('../apps/backend-api/src/models/Device');

async function checkHardware() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- SEARCHING HARDWARE FOR "001" ---');
        const hubs = await Hub.find({ bieonId: /001/i });
        console.log('Hubs:', hubs.map(h => ({id: h.hubId, bieonId: h.bieonId})));

        const devices = await Device.find({ bieonId: /001/i });
        console.log('Devices count:', devices.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkHardware();
