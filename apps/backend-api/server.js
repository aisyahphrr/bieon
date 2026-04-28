require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initializeSocket } = require('./src/config/socket');

// Jalankan koneksi ke database
connectDB();

const PORT = process.env.PORT || 5000;

// Buat HTTP server untuk Express dan Socket.IO
const server = http.createServer(app);

// Inisialisasi Socket.IO
initializeSocket(server);

// Nyalakan server
server.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🟢 Server BIEON berjalan di port ${PORT}`);
    console.log(`🔗 Cek API: http://localhost:${PORT}/api`);
    console.log(`🔗 Socket.IO ready on port ${PORT}`);
    console.log(`=========================================\n`);
});