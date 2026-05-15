const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const result = await KendaliPerangkat.updateMany(
        { owner: new mongoose.Types.ObjectId('69e1e4987a65b4693c569135') },
        { $set: { owner: new mongoose.Types.ObjectId('6a0181e64adad55e7307467b') } }
    );
    console.log('Reassigned devices:', result.modifiedCount);
    process.exit(0);
}).catch(console.error);
