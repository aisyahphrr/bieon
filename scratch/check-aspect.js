const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

async function checkAspect() {
    await mongoose.connect(process.env.MONGODB_URI);
    const d = await KendaliPerangkat.findOne({ name: 'plug 01' });
    console.log(`- Aspect: "${d.environmentAspect}"`);
    console.log(`- Control: "${d.controlMethod}"`);
    process.exit(0);
}
checkAspect();
