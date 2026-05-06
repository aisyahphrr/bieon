const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

async function cleanDatabase() {
    try {
        console.log('⏳ Menghubungkan ke database untuk pembersihan...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Terhubung!');

        // Cari semua perangkat yang statusnya ON/OFF (ilegal)
        const invalidDevices = await KendaliPerangkat.find({ 
            status: { $in: ['ON', 'OFF', 'on', 'off'] } 
        });

        console.log(`🔍 Ditemukan ${invalidDevices.length} perangkat dengan status tidak valid.`);

        for (let device of invalidDevices) {
            const oldStatus = device.status;
            const newStatus = (oldStatus.toUpperCase() === 'ON') ? '1' : '0';
            
            device.status = newStatus;
            await device.save();
            console.log(`✨ Perangkat [${device.name}] berhasil dibersihkan: ${oldStatus} -> ${newStatus}`);
        }

        console.log('🚀 Semua data sudah bersih dan sesuai standar (1/0)!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Gagal membersihkan database:', err.message);
        process.exit(1);
    }
}

cleanDatabase();
