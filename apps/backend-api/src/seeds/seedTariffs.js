/**
 * Script Seed Data Tarif PLN
 * Jalankan sekali dengan perintah: node src/seeds/seedTariffs.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const PlnTariff = require('../models/PlnTariff');

const SEED_DATA = [
    {
        category: 'R1 - 450 VA (Subsidi)',
        tariff: 415,
        effectiveDate: new Date('2026-01-01'),
        note: 'Tarif dasar subsidi - Kementerian ESDM 2026',
        percentage: 0
    },
    {
        category: 'R1 - 900 VA (Subsidi)',
        tariff: 605,
        effectiveDate: new Date('2026-01-01'),
        note: 'Tarif dasar subsidi - Kementerian ESDM 2026',
        percentage: 0
    },
    {
        category: 'R1M - 900 VA (Non-Subsidi)',
        tariff: 1352,
        effectiveDate: new Date('2026-01-01'),
        note: 'Tarif Rumah Tangga Mampu (RTM) - Kementerian ESDM 2026',
        percentage: 0
    },
    {
        category: 'R1 - 1300 VA',
        tariff: 1444.70,
        effectiveDate: new Date('2026-01-01'),
        note: 'Tarif dasar rumah tangga non-subsidi - SK Kementerian ESDM 2026',
        percentage: 0
    },
    {
        category: 'R1 - 2200 VA',
        tariff: 1444.70,
        effectiveDate: new Date('2026-01-01'),
        note: 'Tarif dasar rumah tangga non-subsidi - SK Kementerian ESDM 2026',
        percentage: 0
    },
    {
        category: 'R2 - 3500 s.d 5500 VA',
        tariff: 1699.53,
        effectiveDate: new Date('2026-01-01'),
        note: 'Tarif rumah tangga menengah atas - SK Kementerian ESDM 2026',
        percentage: 0
    },
    {
        category: 'R3 - 6600 VA ke atas',
        tariff: 1699.53,
        effectiveDate: new Date('2026-01-01'),
        note: 'Tarif rumah tangga daya besar - SK Kementerian ESDM 2026',
        percentage: 0
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Terhubung ke MongoDB');

        // Hapus data lama agar tidak duplikat
        const existing = await PlnTariff.countDocuments();
        if (existing > 0) {
            console.log(`⚠️  Koleksi PlnTariff sudah berisi ${existing} dokumen. Seed dilewati.`);
            console.log('   Hapus data lama terlebih dahulu jika ingin reset.');
        } else {
            await PlnTariff.insertMany(SEED_DATA);
            console.log(`✅ Berhasil menambahkan ${SEED_DATA.length} data tarif PLN ke database.`);
        }
    } catch (error) {
        console.error('❌ Seed gagal:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Koneksi MongoDB ditutup.');
        process.exit(0);
    }
};

seed();
