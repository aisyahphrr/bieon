const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');
const Hub = require('../apps/backend-api/src/models/Hub');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to DB');
    
    const sys = await BieonSystem.findOne({ bieonId: 'bieon_001' });
    if (sys) {
        sys.owner = undefined;
        await sys.save();
        console.log('Reset owner for BieonSystem bieon_001');
    }
    
    await Hub.updateMany({ bieonId: 'bieon_001' }, { $unset: { owner: "", tenantId: "" } });
    console.log('Reset owners for Hubs under bieon_001');

    await KendaliPerangkat.updateMany(
        { bieonId: 'bieon_001' }, 
        { 
            $unset: { owner: "", tenantId: "" },
            $set: { lifecycleState: 'UNCLAIMED' }
        }
    );
    console.log('Reset owners for Devices under bieon_001 to UNCLAIMED stock');
    
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
