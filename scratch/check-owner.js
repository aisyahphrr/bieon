const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

async function checkOwner() {
    await mongoose.connect(process.env.MONGODB_URI);
    const devices = await KendaliPerangkat.find({ name: 'plug 01' });
    devices.forEach(d => {
        console.log(`Device: ${d.name}`);
        console.log(`- Status: ${d.status}`);
        console.log(`- Owner: ${d.owner}`);
        console.log(`- Category: ${d.category}`);
        console.log(`- Location: ${d.location}`);
        console.log(`- HubId: ${d.hubId}`);
    });
    process.exit(0);
}
checkOwner();
