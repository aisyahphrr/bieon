const mongoose = require('mongoose');
require('dotenv').config({ path: 'apps/backend-api/.env' });

const Hub = require('../apps/backend-api/src/models/Hub');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');
const DeviceWhitelist = require('../apps/backend-api/src/models/DeviceWhitelist');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to DB');

    const canonicalize = (ieee) => {
        if (!ieee) return ieee;
        return ieee.replace(/[:\-]/g, '').toUpperCase();
    };

    // Update Hubs
    const hubs = await Hub.find({ device_ieee: { $exists: true } });
    for (const hub of hubs) {
        if (hub.device_ieee) {
            hub.device_ieee = canonicalize(hub.device_ieee);
            await hub.save();
        }
    }
    console.log(`Updated ${hubs.length} Hubs`);

    // Update KendaliPerangkat
    const devices = await KendaliPerangkat.find({ device_ieee: { $exists: true } });
    for (const dev of devices) {
        if (dev.device_ieee) {
            dev.device_ieee = canonicalize(dev.device_ieee);
            await dev.save();
        }
    }
    console.log(`Updated ${devices.length} KendaliPerangkat`);

    // Update DeviceWhitelist
    const whitelists = await DeviceWhitelist.find({ device_ieee: { $exists: true } });
    for (const wl of whitelists) {
        if (wl.device_ieee) {
            wl.device_ieee = canonicalize(wl.device_ieee);
            await wl.save();
        }
    }
    console.log(`Updated ${whitelists.length} DeviceWhitelist`);

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
