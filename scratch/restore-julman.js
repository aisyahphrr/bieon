const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const User = require('../apps/backend-api/src/models/User');
const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');

async function restore() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // 1. Cari Julman
        const julman = await User.findOne({ 
            $or: [
                { fullName: /Julman/i }, 
                { username: /Julman/i }, 
                { email: /julman/i },
                { bieonId: 'bieon_001' }
            ] 
        });

        if (!julman) {
            console.log('Julman tidak ditemukan. Operasi dibatalkan.');
            process.exit(1);
        }

        console.log(`Mengembalikan bieon_001 ke Julman (${julman.email})...`);

        // 2. Update Stok
        await BieonSystem.updateOne(
            { bieonId: 'bieon_001' },
            { $set: { owner: julman._id } }
        );

        console.log('BERHASIL! bieon_001 sudah dikembalikan ke Julman.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

restore();
