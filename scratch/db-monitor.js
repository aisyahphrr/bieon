const mongoose = require('mongoose');
require('dotenv').config({ path: './apps/backend-api/.env' });

async function checkStats() {
    try {
        const mongoURI = process.env.MONGODB_URI;
        await mongoose.connect(mongoURI);
        const db = mongoose.connection.db;

        // 1. Cek Ukuran Database
        const stats = await db.command({ dbStats: 1 });
        console.log("=== STATISTIK DATABASE BIEON ===");
        console.log(`Nama Database  : ${stats.db}`);
        console.log(`Jumlah Koleksi : ${stats.collections}`);
        console.log(`Total Ukuran   : ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Ukuran Storage : ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        console.log("================================\n");

        // 2. Cek Detail per Koleksi (Tabel)
        console.log("=== DETAIL KOLEKSI ===");
        const collections = await db.listCollections().toArray();
        for (let col of collections) {
            const colStats = await db.command({ collStats: col.name });
            console.log(`- ${col.name.padEnd(20)}: ${colStats.count} dokumen (${(colStats.size / 1024).toFixed(2)} KB)`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Gagal mengambil statistik:", err.message);
    }
}

checkStats();
