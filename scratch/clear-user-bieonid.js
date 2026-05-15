const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const User = require('../apps/backend-api/src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to DB');
    const res = await User.updateMany({}, { $unset: { bieonId: "" } });
    console.log(`Cleared bieonId from ${res.modifiedCount} users`);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
