const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const docs = await BieonSystem.find({});
        console.log(`Found ${docs.length} documents in bieonsystems:`);
        docs.forEach(doc => {
            console.log(`- _id: ${doc._id}, bieonId: "${doc.bieonId}", owner: ${doc.owner}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
