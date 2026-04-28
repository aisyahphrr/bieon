const mqtt = require('mqtt');
// Asumsi Anda menggunakan mongoose untuk MongoDB
const mongoose = require('mongoose');

// Ganti dengan URI MongoDB Anda
const MONGO_URI = 'mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?appName=Cluster0';

// Hubungkan ke MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Terhubung ke MongoDB!'))
    .catch(err => console.error('Gagal konek MongoDB:', err));

// Definisikan schema sederhana (contoh untuk suhu)
const SensorSchema = new mongoose.Schema({
    topic: String,
    value: Number,
    timestamp: { type: Date, default: Date.now }
});
const SensorData = mongoose.model('SensorData', SensorSchema);

// Hubungkan ke Broker Pusat
const client = mqtt.connect('mqtt://192.168.0.182:1883');

client.on('connect', () => {
    console.log('Backend berhasil terhubung ke Broker Pusat!');
    // Subscribe ke semua topik di bawah 'bieon'
    client.subscribe('bieon/#');
});

client.on('message', async (topic, message) => {
    const payload = JSON.parse(message.toString());
    console.log(`Pesan masuk di ${topic}:`, payload);

    // Filter dan Simpan Data
    // Contoh: jika topik mengandung 'suhu'
    if (topic.includes('suhu')) {
        const newData = new SensorData({
            topic: topic,
            value: payload.temperature || payload.value || 0 // Sesuaikan dengan format JSON dari sensor
        });
        await newData.save();
        console.log('Data suhu berhasil disimpan ke database.');
    }
});