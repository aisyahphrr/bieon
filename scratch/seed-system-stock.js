const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');

async function seedStock() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const ids = ['bieon_001', 'bieon_002', 'bieon_003', 'bieon_004', 'bieon_005'];
        
        for (const id of ids) {
            await BieonSystem.findOneAndUpdate(
                { bieonId: id },
                { bieonId: id, owner: null },
                { upsert: true, new: true }
            );
        }
        
        console.log('Stok ID BIEON (001-005) berhasil dibuat dan siap digunakan daftar manual!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedStock();
