const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const RegisteredProduct = require('../apps/backend-api/src/models/RegisteredProduct');

async function checkProduct() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const products = await RegisteredProduct.find({ productId: /001/i });
        console.log('--- PRODUCT DETAILS ---');
        products.forEach(p => {
            console.log(`productId: ${p.productId}, isUsed: ${p.isUsed}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProduct();
