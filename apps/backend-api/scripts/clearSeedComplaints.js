require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const Complaint = require('../src/models/Complaint');

const SEED_TOPICS = [
    "Status Baru (Tanpa Teknisi)",
    "Respons Aman (8 Menit)",
    "Respons Warning (20 Menit)",
    "Respons Kritis (35 Menit)",
    "Perbaikan Aman (10 Jam)",
    "Perbaikan Warning (50 Jam)",
    "Perbaikan Kritis (65 Jam)",
    "Laporan Ditolak (Tanpa Teknisi)",
    "Menunggu Konfirmasi (Selesai oleh Teknisi)",
    "Tiket Selesai (Sangat Puas)",
    "Kualitas Air Keruh (Selesai)",
    "Korsleting Listrik Ruang Tamu",
    "Sensor Air Tidak Deteksi Kekeruhan"
];

const clearComplaints = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        const result = await Complaint.deleteMany({
            topic: { $in: SEED_TOPICS }
        });

        console.log(`Deleted ${result.deletedCount} dummy complaints.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

clearComplaints();
