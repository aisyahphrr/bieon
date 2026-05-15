const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const User = require('../apps/backend-api/src/models/User');
const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const email = 'jul2005war@gmail.com';
        const julman = await User.findOne({ email });

        if (!julman) {
            console.log(`User dengan email ${email} tidak ditemukan.`);
            process.exit(1);
        }

        console.log(`Menghubungkan bieon_001 ke ${julman.fullName} (${email})...`);

        // 1. Update di tabel Stok
        await BieonSystem.updateOne(
            { bieonId: 'bieon_001' },
            { $set: { owner: julman._id } }
        );

        // 2. Pastikan di tabel User juga ada ID-nya
        julman.bieonId = 'bieon_001';
        await julman.save();

        console.log('SELESAI! Sekarang bieon_001 100% milik Julman Waruwu.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
