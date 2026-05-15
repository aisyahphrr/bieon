const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');
const RegisteredProduct = require('../apps/backend-api/src/models/RegisteredProduct');

async function listSamples() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('--- BIEON SYSTEMS ---');
        const systems = await BieonSystem.find().limit(5);
        systems.forEach(s => console.log(`ID: ${s.bieonId}, Owner: ${s.owner}`));

        console.log('--- REGISTERED PRODUCTS ---');
        const products = await RegisteredProduct.find().limit(5);
        products.forEach(p => console.log(`ID: ${p.productId}, Name: ${p.productName}, isUsed: ${p.isUsed}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listSamples();
