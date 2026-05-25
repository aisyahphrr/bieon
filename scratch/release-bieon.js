const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Override dengan Google DNS jika koneksi Atlas mengalami DNS Refused

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const User = require('../apps/backend-api/src/models/User');
const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');
<<<<<<< HEAD
const { bieonIdFilter } = require('../apps/backend-api/src/shared/bieonId');
=======
const Hub = require('../apps/backend-api/src/models/Hub');
const Device = require('../apps/backend-api/src/models/Device');
>>>>>>> f9da6b5 (Update gradient mask width in HomeownerHistory component)

async function release() {
    const targetId = process.argv[2];
    
    if (!targetId) {
        console.error('❌ ERROR: Masukkan ID BIEON yang ingin dilepas!');
        console.log('Penggunaan: node scratch/release-bieon.js <ID_BIEON>');
        console.log('Contoh:    node scratch/release-bieon.js BIEON-001');
        process.exit(1);
    }

    try {
        console.log(`Menghubungkan ke database untuk melepas BIEON ID: "${targetId}"...`);
        await mongoose.connect(process.env.MONGODB_URI);
<<<<<<< HEAD

        const targetId = process.argv[2] || 'bieon_001';
        const filter = bieonIdFilter(targetId);

        const oldOwner = await User.findOneAndUpdate(
            filter,
            { $unset: { bieonId: '' } }
        );

        await BieonSystem.findOneAndUpdate(filter, { owner: null });

        console.log(`✅ BERHASIL: Kepemilikan ${targetId} telah dilepaskan!`);
        if (oldOwner) {
            console.log(`- Mantan pemilik: ${oldOwner.email}`);
        } else {
            console.log('- Tidak ditemukan pemilik aktif untuk ID tersebut.');
        }

=======
        console.log("Koneksi database berhasil!");

        // Regex case-insensitive agar cocok dengan format apa pun (misal BIEON-001, bieon_001, dll)
        const formattedId = targetId.replace(/[-_]/g, '[-_]?');
        const idRegex = new RegExp(`^${formattedId}$`, 'i');

        // 1. Lepas dari koleksi User
        const userUpdate = await User.updateMany(
            { bieonId: { $regex: idRegex } },
            { $unset: { bieonId: "" } }
        );
        console.log(`- Koleksi Users: Berhasil menghapus link pada ${userUpdate.modifiedCount} user.`);

        // 2. Kosongkan owner di BieonSystem
        const systemUpdate = await BieonSystem.updateMany(
            { bieonId: { $regex: idRegex } },
            { owner: null }
        );
        console.log(`- Koleksi BieonSystems: Berhasil mengosongkan owner pada ${systemUpdate.modifiedCount} sistem.`);

        // 3. Kosongkan owner di Hub
        const hubUpdate = await Hub.updateMany(
            { bieonId: { $regex: idRegex } },
            { owner: null }
        );
        console.log(`- Koleksi Hubs: Berhasil mengosongkan owner pada ${hubUpdate.modifiedCount} hub.`);

        // 4. Kosongkan owner di Device
        const deviceUpdate = await Device.updateMany(
            { bieonId: { $regex: idRegex } },
            { owner: null }
        );
        console.log(`- Koleksi Devices: Berhasil mengosongkan owner pada ${deviceUpdate.modifiedCount} device.`);

        console.log(`\n✅ SUKSES: ID "${targetId}" kini bersih dan dapat digunakan oleh akun lain!`);
>>>>>>> f9da6b5 (Update gradient mask width in HomeownerHistory component)
        process.exit(0);
    } catch (err) {
        console.error('❌ Gagal melepas kepemilikan perangkat:', err);
        process.exit(1);
    }
}

release();
