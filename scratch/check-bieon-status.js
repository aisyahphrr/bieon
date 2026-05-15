const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const User = require('../apps/backend-api/src/models/User');
const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');
const RegisteredProduct = require('../apps/backend-api/src/models/RegisteredProduct');

async function checkStatus() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- CHECKING bieon_001 ---');

        const user = await User.findOne({ bieonId: 'bieon_001' });
        console.log('User with bieonId bieon_001:', user ? user.email : 'NONE');

        const system = await BieonSystem.findOne({ bieonId: 'bieon_001' });
        console.log('BieonSystem bieon_001 owner:', system ? system.owner : 'NONE');

        const product = await RegisteredProduct.findOne({ productId: 'bieon_001' });
        console.log('RegisteredProduct bieon_001 isUsed:', product ? product.isUsed : 'NONE');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkStatus();
