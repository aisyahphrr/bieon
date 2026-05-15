const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');
const Hub = require('../apps/backend-api/src/models/Hub');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to DB');
    
    const idsToReset = ['bieon_001', 'bieon_002', 'bieon_003', 'bieon_004', 'bieon_005', 'bieon_006', 'bieon_007', 'bieon_008', 'bieon_009', 'bieon_010'];

    for (const bieonId of idsToReset) {
        // Reset BieonSystem
        const sys = await BieonSystem.findOne({ bieonId });
        if (sys) {
            sys.owner = undefined;
            await sys.save();
        }
        
        // Reset Hubs
        await Hub.updateMany({ bieonId }, { $unset: { owner: "", tenantId: "" } });

        // Reset Devices
        await KendaliPerangkat.updateMany(
            { bieonId }, 
            { 
                $unset: { owner: "", tenantId: "" },
                $set: { lifecycleState: 'UNCLAIMED' }
            }
        );
        
        console.log(`Reset owners for ${bieonId}`);
    }
    
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
