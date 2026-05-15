const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');
const DeviceWhitelist = require('../apps/backend-api/src/models/DeviceWhitelist');

async function heal() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const devices = await KendaliPerangkat.find({ bieonId: 'bieon_002' });
        
        console.log('--- HEALING DATA BIEON_002 ---');
        
        for (const d of devices) {
            if (!d.device_ieee || d.device_ieee === "0000000000000000" || d.device_ieee.length < 10) {
                console.log(`Menyembuhkan ${d.name} (${d.type})...`);
                
                // Coba cari di whitelist
                const match = await DeviceWhitelist.findOne({
                    $or: [
                        { device_id: d.name },
                        { device_profile: d.name },
                        { device_name: d.name },
                        { model_id: d.name },
                        { device_id: /SNZB/i } // Guess fallback
                    ]
                });

                if (match) {
                    d.device_ieee = match.device_ieee;
                    d.modelId = match.model_id;
                    await d.save();
                    console.log(`✅ BERHASIL! IEEE Baru: ${d.device_ieee}`);
                } else {
                    console.log(`❌ GAGAL menemukan whitelist untuk ${d.name}`);
                }
            }
        }
        
        console.log('--- HEALING SELESAI ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

heal();
