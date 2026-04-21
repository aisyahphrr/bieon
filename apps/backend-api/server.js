require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

// Jalankan koneksi ke database
connectDB();

const PORT = process.env.PORT || 5000;

// Nyalakan server
app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🟢 Server BIEON berjalan di port ${PORT}`);
    console.log(`🔗 Cek API: http://localhost:${PORT}/api`);
    console.log(`=========================================\n`);
});