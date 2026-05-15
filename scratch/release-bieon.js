const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const User = require('../apps/backend-api/src/models/User');
const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');

async function release() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // 1. Lepas dari User
        const oldOwner = await User.findOneAndUpdate(
            { bieonId: 'bieon_001' }, 
            { $unset: { bieonId: "" } }
        );
        
        // 2. Kosongkan Owner di Sistem
        const systemUpdate = await BieonSystem.findOneAndUpdate(
            { bieonId: 'bieon_001' }, 
            { owner: null }
        );
        
        console.log('✅ BERHASIL: Kepemilikan bieon_001 telah dilepaskan!');
        if (oldOwner) {
            console.log(`- Mantan pemilik: ${oldOwner.email}`);
        } else {
            console.log('- Tidak ditemukan pemilik aktif untuk ID tersebut.');
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

release();
