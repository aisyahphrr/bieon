const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');
const RegisteredProduct = require('../apps/backend-api/src/models/RegisteredProduct');
const User = require('../apps/backend-api/src/models/User');

async function searchID() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- SEARCHING FOR "001" ---');
        
        const systems = await BieonSystem.find({ bieonId: /001/i });
        console.log('Systems matching "001":', systems.map(s => s.bieonId));

        const products = await RegisteredProduct.find({ productId: /001/i });
        console.log('Products matching "001":', products.map(p => ({id: p.productId, isUsed: p.isUsed})));

        const users = await User.find({ bieonId: /001/i });
        console.log('Users matching "001":', users.map(u => ({email: u.email, bieonId: u.bieonId})));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

searchID();
