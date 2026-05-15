const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const Hub = require('../apps/backend-api/src/models/Hub');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to DB');
    
    // Update all Hubs
    const hubRes = await Hub.updateMany({}, { tenantId: "tenant_001" });
    console.log(`Updated ${hubRes.modifiedCount} Hubs to tenant_001`);

    // Update all Devices
    const devRes = await KendaliPerangkat.updateMany({}, { tenantId: "tenant_001" });
    console.log(`Updated ${devRes.modifiedCount} Devices to tenant_001`);

    console.log('\n✅ DATABASE CLEANUP COMPLETE!');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
