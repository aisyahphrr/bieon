const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - Express server instance
 * @returns {Promise<Server>} Socket.IO instance
 */
async function initializeSocket(httpServer) {
  // Initialize Socket.IO
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Middleware untuk autentikasi (optional)
  io.use((socket, next) => {
    // Bisa tambah auth check di sini jika diperlukan
    next();
  });

  // Koneksi handler
  io.on('connection', (socket) => {
    console.log(`\n🔗 Socket.IO client connected: ${socket.id}`);

    // Join client ke room berdasarkan systemId atau userId
    socket.on('join_system', (systemId) => {
      socket.join(`system_${systemId}`);
      console.log(`📍 Socket ${socket.id} joined room: system_${systemId}`);
    });

    socket.on('leave_system', (systemId) => {
      socket.leave(`system_${systemId}`);
      console.log(`📍 Socket ${socket.id} left room: system_${systemId}`);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`\n❌ Socket.IO client disconnected: ${socket.id}`);
    });

    // Error handler
    socket.on('error', (err) => {
      console.error(`⚠️ Socket.IO error for ${socket.id}:`, err);
    });
  });

  console.log('✅ Socket.IO initialized with Redis adapter');
  return io;
}

/**
 * Get Socket.IO instance
 */
function getSocket() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
}

/**
 * Emit device telemetry to clients
 * @param {string} systemId - System ID
 * @param {Object} deviceData - Device data to emit
 */
function emitDeviceTelemetry(systemId, deviceData) {
  if (!io) return;
  // Fallback to global emit to ensure delivery, just like mqtt.js does
  io.emit('device_telemetry', deviceData);
}

/**
 * Emit new unassigned device to all clients
 * @param {Object} deviceData - New device data
 */
function emitNewUnassignedDevice(deviceData) {
  if (!io) return;
  io.emit('new_unassigned_device', deviceData);
}

/**
 * Emit device status update
 * @param {string} systemId - System ID
 * @param {Object} statusUpdate - Status update object
 */
function emitDeviceStatusUpdate(systemId, statusUpdate) {
  if (!io) return;
  io.to(`system_${systemId}`).emit('device_status_update', statusUpdate);
}

/**
 * Gracefully close connections
 */
async function closeRedisConnections() {
  // No-op since Redis adapter is removed
}

module.exports = {
  initializeSocket,
  getSocket,
  emitDeviceTelemetry,
  emitNewUnassignedDevice,
  emitDeviceStatusUpdate,
  closeRedisConnections
};
