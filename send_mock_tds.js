const mqtt = require('mqtt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'apps/backend-api/.env') });

const brokerUrl = process.env.MQTT_BROKER;
const options = {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS
};

const client = mqtt.connect(brokerUrl, options);

client.on('connect', () => {
  console.log('Connected');
  const topic = 'bieon/bieon_002/hub/hubnode_001/zigbee_devices/404CCAFFFE57A8EC/telemetry';
  const payload = {
    type: "telemetry",
    device_id: "bieon_001",
    device_ieee: "404CCAFFFE57A8EC",
    cluster: "analog_input",
    attr: "tds",
    value: "45.678",
    unit: "ppm"
  };
  client.publish(topic, JSON.stringify(payload), () => {
    console.log('Published mock TDS');
    client.end();
  });
});
