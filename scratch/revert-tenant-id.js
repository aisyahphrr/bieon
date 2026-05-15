const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const Hub = require('../apps/backend-api/src/models/Hub');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to DB');
    
    // Hapus tenantId untuk yang belum punya owner (stok)
    const hubRes = await Hub.updateMany({ owner: { $exists: false } }, { $unset: { tenantId: "" } });
    console.log(`Cleared tenantId for ${hubRes.modifiedCount} unclaimed Hubs`);

    const devRes = await KendaliPerangkat.updateMany({ lifecycleState: 'UNCLAIMED' }, { $unset: { tenantId: "" } });
    console.log(`Cleared tenantId for ${devRes.modifiedCount} unclaimed Devices`);

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
