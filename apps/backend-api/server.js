require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { connectMQTT } = require('./src/config/mqtt');
const { initializeSocket } = require('./src/config/socket');

// Jalankan koneksi ke database
connectDB();

const PORT = process.env.PORT || 5000;

// Buat HTTP server untuk Express dan Socket.IO
const server = http.createServer(app);

// Inisialisasi Socket.IO
const io = new Server(server, {
    cors: { origin: "*" }
});
initializeSocket(server);

// Jalankan MQTT
connectMQTT(io);

io.on('connection', (socket) => {
    console.log('User connected via Socket.io:', socket.id);
});

// Nyalakan server
server.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🟢 Server BIEON berjalan di port ${PORT}`);
    console.log(`🔗 Cek API: http://localhost:${PORT}/api`);
    console.log(`📡 Socket.io & MQTT Ready`);
    console.log(`=========================================\n`);
});