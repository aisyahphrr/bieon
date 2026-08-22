require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { connectMQTT } = require('./src/config/mqtt');
const { startScheduler } = require('./src/services/scheduler');
const { startMonitoring } = require('./src/services/state-monitor');
const { initializeSocket, closeRedisConnections } = require('./src/config/socket');

// Jalankan koneksi ke database
connectDB();

const PORT = process.env.PORT || 80;

async function startServer() {
  // Buat HTTP server untuk Express dan Socket.IO
  const server = http.createServer(app);

  // Inisialisasi SATU-SATUNYA instance Socket.IO via shared module (dengan Redis adapter)
  const io = await initializeSocket(server);

  // Share io via Express app agar bisa diakses dari controller/route
  app.set('io', io);

  // Jalankan MQTT dengan instance socket yang sama
  connectMQTT(io);

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

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing connections...');
    await closeRedisConnections();
    process.exit(0);
  });
}

startServer().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
