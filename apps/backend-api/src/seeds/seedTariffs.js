/**
 * Script Seed Data Tarif PLN
 * Jalankan sekali dengan perintah: node src/seeds/seedTariffs.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const dns = require('dns');
const PlnTariff = require('../models/PlnTariff');
const { getPlnTariffCategories } = require('../constants/plnTariffCategories');

// Samakan perilaku DNS dengan runtime server agar SRV Atlas konsisten.
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const DEFAULT_TARIFF_MAP = {
    'R-1/TR - 450 VA (Subsidi)': 415,
    'R-1/TR - 900 VA (Subsidi)': 605,
    'R-1/TR - 900 VA (Non-Subsidi)': 1352,
    'R-1/TR - 1.300 VA': 1444.7,
    'R-1/TR - 2.200 VA': 1444.7,
    'R-2/TR - 3.500-5.500 VA': 1699.53,
    'R-3/TR, TM - > 6.600 VA': 1699.53,

    'B-1/TR - 450-5.500 VA': 1444.7,
    'B-2/TR - 6.600 VA-200 kVA': 1444.7,
    'B-3/TM, TT - > 200 kVA': 1114.74,
    'B-4/TT - > 30.000 kVA': 996.74,

    'I-1/TR - 450-5.500 VA': 1444.7,
    'I-2/TM - 6.600 VA-200 kVA': 1114.74,
    'I-3/TM - > 200 kVA': 1114.74,
    'I-4/TT - > 30.000 kVA': 996.74,

    'P-1/TR - 6.600 VA-200 kVA': 1699.53,
    'P-2/TM - > 200 kVA': 1522.88,
    'P-3/TR - Penerangan Jalan Umum': 1699.53,

    'L/TR, TM, TT': 1644.52,

    'S-2/TM - > 200 kVA': 1522.88
};

const EFFECTIVE_DATE = new Date('2026-01-01T00:00:00.000Z');
const BASE_NOTE = 'Seed tarif dasar PLN 2026 (auto-generated)';

const buildSeedData = () => {
    const categories = getPlnTariffCategories({ scope: 'all' });
    if (!categories.ok) throw new Error(categories.error || 'Kategori PLN tidak valid.');

    return categories.data.map((item) => ({
        category: item.label,
        tariff: DEFAULT_TARIFF_MAP[item.label] ?? 1444.7,
        effectiveDate: EFFECTIVE_DATE,
        note: BASE_NOTE,
        percentage: 0
    }));
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Terhubung ke MongoDB');
        const SEED_DATA = buildSeedData();

        let inserted = 0;
        let skipped = 0;
        for (const row of SEED_DATA) {
            const latest = await PlnTariff.findOne({ category: row.category }).sort({ createdAt: -1 }).lean();
            if (latest) {
                skipped += 1;
                continue;
            }

            await PlnTariff.create(row);
            inserted += 1;
        }

        console.log(`✅ Seed selesai. Inserted: ${inserted}, Skipped(existing): ${skipped}, Total kategori target: ${SEED_DATA.length}`);
    } catch (error) {
        console.error('❌ Seed gagal:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Koneksi MongoDB ditutup.');
        process.exit(0);
    }
};

seed();
