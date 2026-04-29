const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const PlnTariff = require('../models/PlnTariff');

const TARRIFS_TO_UPDATE = [
    {
        category: 'B-1/TR - 450-5.500 VA',
        tariff: 1444.7,
        effectiveDate: new Date('2026-01-01'),
        note: 'Update tarif sub-golongan B1 sesuai instruksi (Januari 2026)'
    },
    {
        category: 'B-4/TT - > 30.000 kVA',
        tariff: 996.74,
        effectiveDate: new Date('2026-01-01'),
        note: 'Update tarif sub-golongan B4 (Tegangan Tinggi) (Januari 2026)'
    },
    {
        category: 'I-1/TR - 450-5.500 VA',
        tariff: 1112.47,
        effectiveDate: new Date('2026-01-01'),
        note: 'Update tarif sub-golongan I1 sesuai instruksi (Januari 2026)'
    },
    {
        category: 'I-2/TM - 6.600 VA-200 kVA',
        tariff: 1033.0,
        effectiveDate: new Date('2026-01-01'),
        note: 'Update tarif sub-golongan I2 (Tegangan Menengah) (Januari 2026)'
    }
];

async function updateTariffs() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        for (const data of TARRIFS_TO_UPDATE) {
            console.log(`Processing category: ${data.category}`);
            
            // We use upsert or just create a new record to maintain history if the system depends on latest createdAt
            // Given the controller sorts by createdAt, adding a new record is usually better for audit trail
            // But if it's currently 0 (missing), we definitely need to add it.
            
            const existing = await PlnTariff.findOne({ category: data.category }).sort({ createdAt: -1 });
            
            if (existing && existing.tariff === data.tariff) {
                console.log(`  Tariff for ${data.category} is already ${data.tariff}. Skipping.`);
                continue;
            }

            const newTariff = new PlnTariff({
                ...data,
                percentage: existing ? ((data.tariff - existing.tariff) / existing.tariff) * 100 : 0
            });

            await newTariff.save();
            console.log(`  Updated ${data.category} to ${data.tariff}`);
        }

        console.log('Update complete.');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error during update:', error);
        process.exit(1);
    }
}

updateTariffs();
