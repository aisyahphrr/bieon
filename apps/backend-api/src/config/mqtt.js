const mqtt = require('mqtt');
const { SUPPORTED_MODELS } = require('./supportedDevices');
const Device = require('../models/Device');
const KendaliPerangkat = require('../models/KendaliPerangkat');
const SensorData = require('../models/SensorData');

let mqttClient = null;
let ioInstance = null;

const connectMQTT = (io) => {
  ioInstance = io;
  const brokerUrl = process.env.MQTT_BROKER || 'mqtt://127.0.0.1:1883';
  const options = {};
  if (process.env.MQTT_USER && process.env.MQTT_PASS) {
    options.username = process.env.MQTT_USER;
    options.password = process.env.MQTT_PASS;
  }

  mqttClient = mqtt.connect(brokerUrl, options);

  mqttClient.on('connect', () => {
    console.log('Connected to MQTT Broker for Zigbee2MQTT and ESP32');
    // Subscribe ke event bridge dan SEMUA data perangkat
    mqttClient.subscribe('zigbee2mqtt/bridge/event');
    mqttClient.subscribe('zigbee2mqtt/#');
    mqttClient.subscribe('bieon/#'); // Menangkap status & command
  });

  mqttClient.on('message', async (topic, message) => {
    try {
      let payload;
      const rawMsg = message.toString();
      try {
        payload = JSON.parse(rawMsg);
      } catch (e) {
        payload = isNaN(rawMsg) ? rawMsg : Number(rawMsg);
      }

      if (topic.startsWith('zigbee2mqtt/')) {
        const friendlyName = topic.split('/')[1];
        if (friendlyName !== 'bridge') {
          await handleDeviceTelemetry(friendlyName, payload);
        }
      } else if (topic.startsWith('bieon/')) {
        const parts = topic.split('/');
        if (parts.length >= 3) {
          const friendlyName = parts[1];
          const param = parts[2]; // suhu, kelembapan, status, command

          let actualValue = payload;
          if (typeof payload === 'object' && payload !== null) {
            actualValue = payload.status !== undefined ? payload.status : 
                          (payload.value !== undefined ? payload.value : payload);
          }

          // Format data untuk database
          const formattedPayload = {};
          if (param === 'suhu') {
            if (friendlyName.toLowerCase().includes('air')) formattedPayload.waterTemp = actualValue;
            else formattedPayload.temperature = actualValue;
          }
          else if (param === 'kelembapan') formattedPayload.humidity = actualValue;
          else if (param === 'ph') formattedPayload.ph = actualValue;
          else if (param === 'tds') formattedPayload.tds = actualValue;
          else if (param === 'turbidity') formattedPayload.turbidity = actualValue;
          else if (param === 'status' || param === 'command') formattedPayload.status = String(actualValue);

          await handleDeviceTelemetry(friendlyName, formattedPayload);
          await new SensorData({ topic, value: actualValue }).save();
        }
      }
    } catch (err) {
      console.error('MQTT Message Error:', err.message);
    }
  });

  return mqttClient;
};

const handleDeviceTelemetry = async (friendlyName, payload) => {
  try {
    // Mapping khusus untuk sensor air agar sinkron antara MQTT dan Database
    let searchName = friendlyName;
    if (friendlyName.toLowerCase().includes('sensor_air')) {
        searchName = "Sensor Kualitas Air";
    }

    const nameRegex = new RegExp('^' + searchName.replace(/[_\s]/g, '[_\\s]') + '$', 'i');
    let device = await KendaliPerangkat.findOne({ name: nameRegex });

    if (!device) return;

    const updates = { lastSeen: new Date() };
    if (payload.temperature !== undefined) updates['currentValues.temperature'] = payload.temperature;
    if (payload.waterTemp !== undefined) updates['currentValues.waterTemp'] = payload.waterTemp;
    if (payload.humidity !== undefined) updates['currentValues.humidity'] = payload.humidity;
    if (payload.ph !== undefined) updates['currentValues.ph'] = payload.ph;
    if (payload.tds !== undefined) updates['currentValues.tds'] = payload.tds;
    if (payload.turbidity !== undefined) updates['currentValues.turbidity'] = payload.turbidity;
    if (payload.battery !== undefined) updates.battery = payload.battery;
    
    // Auto-Berubah Warna (Status)
    if (payload.status !== undefined) {
        let normStatus = String(payload.status).toUpperCase();
        if (normStatus === 'ON' || normStatus === '1') normStatus = '1';
        else if (normStatus === 'OFF' || normStatus === '0') normStatus = '0';
        updates.status = normStatus;
    }

    const updatedDevice = await KendaliPerangkat.findOneAndUpdate(
      { _id: device._id },
      { $set: updates },
      { new: true }
    );

    // Kirim teriakan ke Frontend agar warna berubah otomatis
    if (updatedDevice && ioInstance) {
      ioInstance.emit('device_telemetry', {
        _id: updatedDevice._id,
        currentValues: updatedDevice.currentValues,
        battery: updatedDevice.battery,
        status: String(updatedDevice.status)
      });
    }

    // ==========================================
    // LOGIKA OTOMATISASI: KENDALI LINGKUNGAN
    // ==========================================
    if (updatedDevice && updatedDevice.category === 'Sensor' && updatedDevice.currentValues) {
      let aspect = updatedDevice.type; // misal: 'Kenyamanan', 'Kualitas Air'
      
      // Mapping untuk sensor fisik Zigbee atau sensor custom
      if (aspect === 'SNZB-02DR2' || aspect === 'Sensor Kenyamanan' || aspect === 'sensor aisyah') {
          aspect = 'Kenyamanan';
      }
      
      if (['Kenyamanan', 'Kualitas Air', 'Keamanan'].includes(aspect)) {
        // Cari semua aktuator milik user ini yang bergantung pada aspek lingkungan ini
        const actuators = await KendaliPerangkat.find({
            owner: updatedDevice.owner,
            category: 'Control Actuator System',
            controlMethod: 'Lingkungan',
            environmentAspect: aspect
        });

        if (actuators.length > 0) {
            for (const act of actuators) {
                if (!act.thresholds) continue;

                let isMet = true;
                let hasCondition = false;
                const sensor = updatedDevice; // HANYA cek sensor yang baru saja mengirim data

                if (!sensor.currentValues) continue;

                // Cek Suhu (Temperature)
                if (act.thresholds.temperature !== undefined) {
                    // PRIORITAS: Gunakan nilai dari sensor yang baru saja mengirim data (sensor.currentValues)
                    const sensorVal = sensor.currentValues.waterTemp !== undefined ? sensor.currentValues.waterTemp : sensor.currentValues.temperature;
                    
                    if (sensorVal !== undefined) {
                        hasCondition = true;
                        if (sensorVal <= act.thresholds.temperature) {
                            isMet = false;
                        }
                    }
                }
                
                // Cek Kelembapan (Humidity)
                if (act.thresholds.humidity !== undefined && sensor.currentValues.humidity !== undefined) {
                    hasCondition = true;
                    if (sensor.currentValues.humidity <= act.thresholds.humidity) {
                        isMet = false;
                    }
                }

                // Cek Kualitas Air (opsional jika dibutuhkan nanti)
                if (act.thresholds.ph !== undefined && sensor.currentValues.ph !== undefined) {
                    hasCondition = true;
                    if (sensor.currentValues.ph <= act.thresholds.ph) {
                        isMet = false;
                    }
                }
                if (act.thresholds.tds !== undefined && sensor.currentValues.tds !== undefined) {
                    hasCondition = true;
                    if (sensor.currentValues.tds <= act.thresholds.tds) {
                        isMet = false;
                    }
                }
                if (act.thresholds.turbidity !== undefined && sensor.currentValues.turbidity !== undefined) {
                    hasCondition = true;
                    if (sensor.currentValues.turbidity <= act.thresholds.turbidity) {
                        isMet = false;
                    }
                }

                if (hasCondition) {
                    const targetTopic = `bieon/${act.name.replace(/\s+/g, '_')}/command`;
                    
                    if (isMet) {
                        if (String(act.status) !== '1') {
                            console.log(`[Automation] Triggering Actuator ${act.name} to ON (All sensors met threshold)`);
                            publishCommand(targetTopic, 'ON');
                            await KendaliPerangkat.findByIdAndUpdate(act._id, { status: '1' });
                            if (ioInstance) {
                                ioInstance.emit('device_telemetry', { _id: act._id, status: '1' });
                            }
                        }
                    } else {
                        if (String(act.status) !== '0') {
                            console.log(`[Automation] Triggering Actuator ${act.name} to OFF (Sensor condition not met)`);
                            publishCommand(targetTopic, 'OFF');
                            await KendaliPerangkat.findByIdAndUpdate(act._id, { status: '0' });
                            if (ioInstance) {
                                ioInstance.emit('device_telemetry', { _id: act._id, status: '0' });
                            }
                        }
                    }
                }
            }
        }
      }
    }

  } catch (err) {
    console.error('❌ Telemetry Error:', err.message);
  }
};

const startPermitJoin = (duration = 60) => {
  if (mqttClient) {
    mqttClient.publish('zigbee2mqtt/bridge/request/permit_join', JSON.stringify({ value: true, time: duration }));
  }
};

const publishCommand = (topic, payload) => {
  if (mqttClient) {
    const message = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
    mqttClient.publish(topic, message, { qos: 1 });
  }
};

module.exports = { connectMQTT, startPermitJoin, publishCommand };
