const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');

async function detailCheck() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const systems = await BieonSystem.find({ bieonId: /001/i });
        console.log('--- SYSTEM DETAILS ---');
        systems.forEach(s => {
            console.log(`bieonId: ${s.bieonId}, owner: ${s.owner}, status: ${s.status}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

detailCheck();
