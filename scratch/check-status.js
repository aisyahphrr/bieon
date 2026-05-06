const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

async function checkStatus() {
    await mongoose.connect(process.env.MONGODB_URI);
    const devices = await KendaliPerangkat.find({}, 'name status');
    console.log('Current Device Statuses:');
    devices.forEach(d => console.log(`- ${d.name}: "${d.status}"`));
    process.exit(0);
}
checkStatus();
