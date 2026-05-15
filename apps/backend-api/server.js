require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { connectMQTT } = require('./src/config/mqtt');
const { startScheduler } = require('./src/services/scheduler');
const { startMonitoring } = require('./src/services/state-monitor');

// Jalankan koneksi ke database
connectDB();

const PORT = process.env.PORT || 5000;

// Buat HTTP server untuk Express dan Socket.IO
const server = http.createServer(app);

// Inisialisasi SATU-SATUNYA instance Socket.IO
const io = new Server(server, {
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Jalankan MQTT dengan instance socket yang sama
connectMQTT(io);

io.on('connection', (socket) => {
    console.log(`\n🔗 Socket.IO client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log(`❌ Socket.IO client disconnected: ${socket.id}`);
    });
});

// Nyalakan server
server.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🟢 Server BIEON berjalan di port ${PORT}`);
    console.log(`🔗 Cek API: http://localhost:${PORT}/api`);
    console.log(`📡 Socket.io & MQTT Ready`);
    
    // Jalankan Scheduler Otomatis untuk mengecek Jadwal
    startScheduler();
    
    // Jalankan State Monitoring (Stale/Orphan detection)
    startMonitoring();

    console.log(`=========================================\n`);
});