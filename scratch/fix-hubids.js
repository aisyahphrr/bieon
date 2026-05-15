const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    // Map old Hub 1 to new Hub 1
    const result1 = await KendaliPerangkat.updateMany(
        { hubId: new mongoose.Types.ObjectId('69e5ccfc031e31da2d84bc71') },
        { $set: { hubId: new mongoose.Types.ObjectId('6a0162aa6ec2cd955177019c') } }
    );
    
    // Map old Hub 2 to new Hub 2
    const result2 = await KendaliPerangkat.updateMany(
        { hubId: new mongoose.Types.ObjectId('69e5ccfc031e31da2d84bc72') },
        { $set: { hubId: new mongoose.Types.ObjectId('6a0162aa6ec2cd955177019d') } }
    );
    
    console.log('Reassigned Hub 1 devices:', result1.modifiedCount);
    console.log('Reassigned Hub 2 devices:', result2.modifiedCount);
    process.exit(0);
}).catch(console.error);
