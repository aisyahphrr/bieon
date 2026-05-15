const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const User = require('../apps/backend-api/src/models/User');

async function clearId() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await User.updateOne(
            { email: 'amel@gmail.com' }, 
            { $set: { bieonId: null, tenantId: null } }
        );
        console.log('ID bieon_001 sudah dicopot dari Amel.');
        console.log('Detail Update:', result);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

clearId();
