const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🗄️  Berhasil terhubung ke MongoDB (bieon_db)');
    } catch (error) {
        console.error('❌ Gagal terhubung ke MongoDB:', error.message);
        process.exit(1); // Menghentikan server jika database mati
    }
};

module.exports = connectDB;