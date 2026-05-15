const mqtt = require('mqtt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const brokerUrl = process.env.MQTT_BROKER || 'mqtt://127.0.0.1:1883';
const options = {};
if (process.env.MQTT_USER && process.env.MQTT_PASS) {
    options.username = process.env.MQTT_USER;
    options.password = process.env.MQTT_PASS;
}

const client = mqtt.connect(brokerUrl, options);

// Ambil nama perangkat dari argumen (default ke plug_01)
const deviceId = process.argv[2] || 'plug_01';

client.on('connect', () => {
    console.log('✅ Connected to Broker:', brokerUrl);
    
    const topic = `tenant/tenant_abc/bieon/bieon_01/hub/hub_01/device/${deviceId}/telemetry`;
    const payload = JSON.stringify({
        clusters: [
            { cluster: "on_off", value: 1 },
            { cluster: "temperature", value: 24.5 }
        ]
    });

    console.log('Sending simulation message to:', topic);
    client.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) console.error('❌ Error publishing:', err);
        else console.log('🚀 Message sent successfully!');
        
        client.end();
    });
});

client.on('error', (err) => {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
});
