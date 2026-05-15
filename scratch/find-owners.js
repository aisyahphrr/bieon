const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const User = require('../apps/backend-api/src/models/User');

async function findOwners() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({ bieonId: { $in: ['BIEON-001', 'BIEON_001', 'bieon_001'] } });
        users.forEach(u => console.log(`Email: ${u.email}, ID: ${u.bieonId}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findOwners();
