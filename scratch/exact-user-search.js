const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const User = require('../apps/backend-api/src/models/User');

async function exactUserSearch() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ bieonId: 'bieon_001' });
        console.log('User found:', user ? user.email : 'NONE');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

exactUserSearch();
