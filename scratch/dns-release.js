const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Override with Google Public DNS to bypass local SRV DNS blocks

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const User = require('../apps/backend-api/src/models/User');
const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');
const Hub = require('../apps/backend-api/src/models/Hub');
const Device = require('../apps/backend-api/src/models/Device');

async function run() {
    try {
        console.log("Menghubungkan ke MongoDB Atlas menggunakan MONGODB_URI...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Koneksi berhasil!");
        
        // Regex case-insensitive untuk mencocokkan BIEON-001, BIEON_001, bieon_001, dll.
        const idRegex = /^bieon[-_]001$/i;
        
        // 1. Cari & Lepas dari User
        const matchedUsers = await User.find({ bieonId: { $regex: idRegex } });
        console.log(`Ditemukan ${matchedUsers.length} user dengan ID ini.`);
        for (const user of matchedUsers) {
            console.log(`- Menghapus link dari User: ${user.email} (Nama: ${user.fullName})`);
        }
        
        const userUpdateResult = await User.updateMany(
            { bieonId: { $regex: idRegex } },
            { $unset: { bieonId: "" } }
        );
        console.log("Hasil update koleksi User:", userUpdateResult);

        // 2. Kosongkan owner di BieonSystem
        const matchedSystems = await BieonSystem.find({ bieonId: { $regex: idRegex } });
        console.log(`Ditemukan ${matchedSystems.length} sistem dengan ID ini.`);
        
        const systemUpdateResult = await BieonSystem.updateMany(
            { bieonId: { $regex: idRegex } },
            { owner: null }
        );
        console.log("Hasil update koleksi BieonSystem:", systemUpdateResult);

        // 3. Kosongkan owner di Hub
        const matchedHubs = await Hub.find({ bieonId: { $regex: idRegex } });
        console.log(`Ditemukan ${matchedHubs.length} Hub dengan ID ini.`);
        
        const hubUpdateResult = await Hub.updateMany(
            { bieonId: { $regex: idRegex } },
            { owner: null }
        );
        console.log("Hasil update koleksi Hub:", hubUpdateResult);

        // 4. Kosongkan owner di Device
        const matchedDevices = await Device.find({ bieonId: { $regex: idRegex } });
        console.log(`Ditemukan ${matchedDevices.length} Device dengan ID ini.`);
        
        const deviceUpdateResult = await Device.updateMany(
            { bieonId: { $regex: idRegex } },
            { owner: null }
        );
        console.log("Hasil update koleksi Device:", deviceUpdateResult);

        console.log("✅ BERHASIL: Seluruh kepemilikan BIEON-001/bieon_001 telah dibersihkan dari database!");
        process.exit(0);
    } catch (err) {
        console.error("Gagal menjalankan script database:", err);
        process.exit(1);
    }
}

run();
