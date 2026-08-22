const mongoose = require('mongoose');
const dns = require('dns');

// Paksa Node.js gunakan DNS Google/Cloudflare agar menembus blokir DNS WiFi kantor
// DNS hack dihapus secara permanen untuk kompatibilitas server Railway

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bieon_db';
        await mongoose.connect(mongoURI);
        console.log('🗄️  Berhasil terhubung ke MongoDB Cloud (Atlas)');
    } catch (error) {
        console.error('❌ Gagal terhubung ke MongoDB:', error.message);
        process.exit(1); // Menghentikan server jika database mati
    }
};

module.exports = connectDB;