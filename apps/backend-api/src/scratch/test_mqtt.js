const mqtt = require('mqtt');

// Connect ke HiveMQ Cloud sesuai dengan MQTT Explorer Anda
const options = {
    username: 'BIEON_MASTER',
    password: 'Bieon12345678',
    protocol: 'mqtts' // Wajib mqtts untuk port 8883
};
const client = mqtt.connect('mqtts://a6f649d34b194da1bb0bda71a913ab9c.s1.eu.hivemq.cloud:8883', options);

client.on('connect', () => {
    console.log('✅ Terhubung ke MQTT Broker');

    const topic = 'bieon/42:4C:CA:FF:FE:51:34:35/auth/request';
    const payload = {
        "type": "auth_request",
        "master_ieee": "42:4C:CA:FF:FE:51:34:35",
        "hub_ieee": "42:4C:CA:FF:FE:4D:9C:65",
        "device_ieee": "AA:BB:11:22:33:44",
        "device_id": "water_sensor_01",
        "device_name": "Water Sensor",
        "model_id": "WATER_SENSOR",
        "alias": "WATER_SENSOR_8B5D",
        "cached": false,
        "ts": 1714982350
    };

    client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) {
            console.error('❌ Gagal publish:', err);
        } else {
            console.log(`🚀 Berhasil mem-publish payload ke topik: ${topic}`);
            console.log(JSON.stringify(payload, null, 2));
        }
        client.end(); // Tutup koneksi setelah publish
    });
});

client.on('error', (err) => {
    console.error('Koneksi Error:', err);
    client.end();
});
