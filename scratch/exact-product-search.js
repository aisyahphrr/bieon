const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const RegisteredProduct = require('../apps/backend-api/src/models/RegisteredProduct');

async function exactProductSearch() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const product = await RegisteredProduct.findOne({ productId: 'bieon_001' });
        console.log('Product found:', product ? {id: product.productId, isUsed: product.isUsed} : 'NONE');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

exactProductSearch();
