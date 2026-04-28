const mqtt = require('mqtt');
const { SUPPORTED_MODELS } = require('./supportedDevices');
const Device = require('../models/Device');
const KendaliPerangkat = require('../models/KendaliPerangkat');

let mqttClient = null;
let ioInstance = null;

const connectMQTT = (io) => {
  ioInstance = io;
  const brokerUrl = process.env.MQTT_BROKER || 'mqtt://127.0.0.1:1883';
  
  mqttClient = mqtt.connect(brokerUrl);

  mqttClient.on('connect', () => {
    console.log('Connected to MQTT Broker for Zigbee2MQTT');
    // Subscribe ke event bridge dan SEMUA data perangkat
    mqttClient.subscribe('zigbee2mqtt/bridge/event');
    mqttClient.subscribe('zigbee2mqtt/#'); // Menangkap semua data sensor
  });

  mqttClient.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      
      if (topic === 'zigbee2mqtt/bridge/event') {
        await handleBridgeEvent(payload);
      } else if (topic.startsWith('zigbee2mqtt/')) {
        // Ini adalah data dari perangkat (Sensor/Actuator)
        const friendlyName = topic.split('/')[1];
        if (friendlyName !== 'bridge') {
          await handleDeviceTelemetry(friendlyName, payload);
        }
      }
    } catch (err) {
      console.error('MQTT Message Error:', err);
    }
  });

  return mqttClient;
};

const handleBridgeEvent = async (payload) => {
  const { type, data } = payload;

  // Kita fokus pada event interview yang sukses (Network-Level Verification)
  if (type === 'device_interview' && data.status === 'successful') {
    const modelId = data.definition?.model;
    const ieee = data.ieee_address;

    // Cek apakah perangkat sudah ada di DB
    let device = await Device.findOne({ ieeeAddress: ieee });

    if (!device) {
      // PERANGKAT BARU (Belum didaftarkan/Unassigned)
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const tempName = `New-Device-${randomId}`;

      device = new Device({
        name: tempName,
        type: 'Unassigned',
        ieeeAddress: ieee,
        model: modelId || 'Unknown',
        status: 'OFFLINE',
        vendor: data.definition?.vendor || 'Unknown'
      });
      await device.save();

      console.log(`📡 New Unassigned Device Discovered: ${tempName}`);
      
      if (ioInstance) {
        ioInstance.emit('new_unassigned_device', device);
      }
    } else {
      device.status = 'ONLINE';
      await device.save();
    }
  }
};

// LOGIC: Menangani data monitoring dari sensor fisik (suhu, lembap, dll)
const handleDeviceTelemetry = async (friendlyName, payload) => {
  try {
    console.log(`📡 MQTT Data: topic=[${friendlyName}] payload=${JSON.stringify(payload)}`);

    // Cari di KendaliPerangkat (koleksi yang digunakan frontend)
    const device = await KendaliPerangkat.findOne({
      $or: [
        { name: friendlyName },
        { name: { $regex: new RegExp(friendlyName, 'i') } }
      ]
    });

    if (!device) {
      console.log(`⚠️  Perangkat '${friendlyName}' tidak ditemukan di database.`);
      return;
    }

    console.log(`✅ Perangkat ditemukan: ${device.name} (${device._id})`);

    // Update data sensor secara real-time
    const updates = { lastSeen: new Date() };
    if (payload.temperature !== undefined) updates['currentValues.temperature'] = payload.temperature;
    if (payload.humidity !== undefined) updates['currentValues.humidity'] = payload.humidity;
    if (payload.battery !== undefined) updates.battery = payload.battery;

    const updatedDevice = await KendaliPerangkat.findOneAndUpdate(
      { _id: device._id },
      { $set: updates },
      { new: true }
    );

    console.log(`💾 Data tersimpan! Suhu: ${updatedDevice.currentValues?.temperature}°C, Lembap: ${updatedDevice.currentValues?.humidity}%`);

    // Broadcast ke semua browser yang sedang buka Dashboard!
    if (ioInstance) {
      ioInstance.emit('device_telemetry', {
        _id: updatedDevice._id,
        currentValues: updatedDevice.currentValues,
        battery: updatedDevice.battery,
        status: updatedDevice.status
      });
      console.log(`📡 Data di-broadcast ke Frontend!`);
    }
  } catch (err) {
    console.error('❌ Telemetry Processing Error:', err.message);
  }
};

const startPermitJoin = (duration = 60) => {
  if (mqttClient) {
    console.log(`🔓 Opening Zigbee Network for ${duration}s...`);
    mqttClient.publish('zigbee2mqtt/bridge/request/permit_join', JSON.stringify({ 
      value: true, 
      time: duration 
    }));
  }
};

module.exports = { connectMQTT, startPermitJoin };
