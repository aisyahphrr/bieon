const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const User = require('../apps/backend-api/src/models/User');

async function lookupUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user1 = await User.findById('69e1e4987a65b4693c569135');
        const user2 = await User.findById('6a0181e64adad55e7307467b');
        
        console.log('User 1:', user1 ? {email: user1.email, bieonId: user1.bieonId} : 'NOT FOUND');
        console.log('User 2:', user2 ? {email: user2.email, bieonId: user2.bieonId} : 'NOT FOUND');
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

lookupUser();
