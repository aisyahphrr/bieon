const mongoose = require('mongoose');
const dns = require('dns');

// Paksa Node.js gunakan DNS Google/Cloudflare agar menembus blokir DNS WiFi kantor
// HANYA jika TIDAK sedang berjalan di Railway (karena ini akan merusak DNS bawaan server Railway)
if (!process.env.RAILWAY_ENVIRONMENT && process.env.NODE_ENV !== 'production') {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
}

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