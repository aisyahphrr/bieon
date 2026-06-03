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

client.on('connect', () => {
    console.log('Connected to broker:', brokerUrl);
    const topic = process.argv[2] || 'bieon/bieon_001/energi/pdm/telemetry';
    const payload = {
        type: 'telemetry',
        device_id: 'bieon_001',
        device_ieee: 'a4c1380d4841ffff',
        model: 'S60ZBTPF',
        manufacturer: 'Tuya',
        currentValues: { on_off: 1, active_power: 0 }
    };

    console.log('Publishing malformed Zigbee telemetry to:', topic);
    client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) console.error('Publish error:', err);
        else console.log('Published.');
        setTimeout(() => client.end(), 500);
    });
});

client.on('error', (err) => {
    console.error('Connection error:', err.message);
    process.exit(1);
});
