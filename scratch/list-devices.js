const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const DeviceWhitelist = require('../apps/backend-api/src/models/DeviceWhitelist');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');
const User = require('../apps/backend-api/src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('\n=== DAFTAR MASTER PERANGKAT (WHITELIST) ===');
    const whitelist = await DeviceWhitelist.find();
    console.table(whitelist.map(d => ({
        Name: d.device_name,
        IEEE: d.device_ieee,
        Profile: d.device_profile,
        Model: d.model_id,
        System: d.master_ieee
    })));

    console.log('\n=== DAFTAR PERANGKAT DI USER (KENDALI PERANGKAT) ===');
    const devices = await KendaliPerangkat.find().populate('owner', 'email');
    console.table(devices.map(d => ({
        Name: d.name,
        IEEE: d.device_ieee,
        Type: d.type,
        State: d.lifecycleState,
        Owner: d.owner ? d.owner.email : 'UNCLAIMED',
        Tenant: d.tenantId || '-'
    })));

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
