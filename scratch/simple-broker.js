const aedes = require('aedes')();
const net = require('net');

const server = net.createServer(aedes.handle);
const port = 1883;

server.listen(port, function () {
  console.log('\n=========================================');
  console.log('🟢 BROKER MQTT AKTIF di Port 1883');
  console.log('🚀 Jantung IoT BIEON sedang berdetak...');
  console.log('=========================================\n');
  console.log('ℹ️  Biarkan terminal ini tetap TERBUKA!');
  console.log('ℹ️  Buka terminal BARU, ketik: node scratch/test-sensor.js\n');
});

server.on('error', (err) => {
  console.error('❌ ERROR SERVER:', err.message);
});

aedes.on('client', (client) => {
  console.log('🔌 Client terhubung:', client.id);
});

aedes.on('publish', (packet, client) => {
  if (client) {
    console.log(`📩 Data masuk - Topic: ${packet.topic} | Data: ${packet.payload.toString()}`);
  }
});
