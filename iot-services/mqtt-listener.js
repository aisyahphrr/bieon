require('dotenv').config();
const mqtt = require('mqtt');
const mongoose = require('mongoose');

// Koneksi ke MongoDB Atlas
mongoose.connect(process.env.MONGO_URI);

// Koneksi ke Broker (Karena Mosquitto dijalankan via Docker, portnya tetap 1883)
const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
    console.log('✅ Backend terhubung ke Dockerized MQTT Broker');
    mqttClient.subscribe('zigbee2mqtt/#');
});

mqttClient.on('message', (topic, message) => {
    // Di sini logika penyimpanan ke MongoDB
    console.log(`📩 Data diterima dari [${topic}]: ${message.toString()}`);
});