const mqtt = require('mqtt');

// Gunakan NAMA perangkat Anda yang muncul di layar
const DEVICE_NAME = "SNZB-02DR2"; 

console.log('⏳ Sedang mencoba menyambung ke MQTT Broker (127.0.0.1:1883)...');

const client = mqtt.connect('mqtt://127.0.0.1:1883', {
    connectTimeout: 5000 // Berhenti mencoba jika lebih dari 5 detik
});

client.on('connect', () => {
    console.log('✅ BERHASIL! Simulator Sensor Terhubung ke Broker.');
    console.log('🚀 Mulai mengirim data suhu & lembap setiap 2 detik...');
    
    let temp = 25.0;
    let hum = 60.0;

    setInterval(() => {
        temp += (Math.random() - 0.5) * 0.5;
        hum += (Math.random() - 0.5) * 1.0;

        const payload = {
            temperature: parseFloat(temp.toFixed(2)),
            humidity: parseFloat(hum.toFixed(2)),
            battery: 100
        };

        client.publish(`zigbee2mqtt/${DEVICE_NAME}`, JSON.stringify(payload));
        console.log(`📤 DATA TERKIRIM: ${payload.temperature}°C | ${payload.humidity}%`);
    }, 2000);
});

client.on('error', (err) => {
    console.error('❌ ERROR MQTT:', err.message);
});

client.on('offline', () => {
    console.log('⚠️ Status: Offline (Broker mungkin belum nyala)');
});
