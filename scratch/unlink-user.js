const mongoose = require('mongoose');
require('dotenv').config({ path: 'apps/backend-api/.env' });
const User = require('../apps/backend-api/src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const result = await User.updateMany({ bieonId: 'bieon_003' }, { $unset: { bieonId: '' } });
    console.log('Removed bieonId from', result.modifiedCount, 'users');
    process.exit(0);
}).catch(console.error);
