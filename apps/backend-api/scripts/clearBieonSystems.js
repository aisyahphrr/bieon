const mongoose = require('mongoose');
const BieonSystem = require('../src/models/BieonSystem');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Terhubung ke database.");

        const allSystems = await BieonSystem.find({});
        console.log(`Total data saat ini: ${allSystems.length}`);

        // Regex untuk mendeteksi "bieon_00X" (termasuk BIEON_001, BIEON-002, dll)
        const templateRegex = /^bieon[_|-]0\d{2}$/i;

        const toDelete = [];
        const toKeep = [];

        for (const sys of allSystems) {
            if (templateRegex.test(sys.bieonId)) {
                toKeep.push(sys.bieonId);
            } else {
                toDelete.push(sys.bieonId);
            }
        }

        console.log("\n--- DATA YANG AKAN DIPERTAHANKAN (Template) ---");
        console.log(toKeep);

        console.log("\n--- DATA YANG AKAN DIHAPUS ---");
        console.log(toDelete);

        // Melakukan penghapusan
        const result = await BieonSystem.deleteMany({ bieonId: { $in: toDelete } });
        console.log(`\nBerhasil menghapus ${result.deletedCount} data dari BieonSystem.`);

    } catch (err) {
        console.error("Terjadi kesalahan:", err);
    } finally {
        process.exit(0);
    }
}
run();
