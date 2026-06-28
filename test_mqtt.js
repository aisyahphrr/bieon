const mqtt = require('mqtt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'apps/backend-api/.env') });

const brokerUrl = process.env.MQTT_BROKER || 'mqtt://127.0.0.1:1883';
const options = {};
if (process.env.MQTT_USER && process.env.MQTT_PASS) {
  options.username = process.env.MQTT_USER;
  options.password = process.env.MQTT_PASS;
}

console.log('Connecting to MQTT broker:', brokerUrl);
const client = mqtt.connect(brokerUrl, options);

client.on('connect', () => {
  console.log('Connected! Subscribing to bieon/#...');
  client.subscribe('bieon/#');
});

client.on('message', (topic, message) => {
  const payload = message.toString();
  if (topic.includes('404ccafffe57a8ec') || payload.includes('404ccafffe57a8ec') || topic.includes('tds') || payload.includes('tds') || payload.includes('ph') || payload.includes('turbidity')) {
    console.log(`[MATCH] Topic: ${topic} | Payload: ${payload}`);
  } else {
    // console.log(`[OTHER] Topic: ${topic} | Payload: ${payload}`);
  }
});

setTimeout(() => {
  console.log('Exiting after 40 seconds...');
  client.end();
  process.exit(0);
}, 40000);
