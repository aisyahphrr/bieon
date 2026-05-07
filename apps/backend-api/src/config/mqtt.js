const mqtt = require('mqtt');
const { SUPPORTED_MODELS } = require('./supportedDevices');
const Device = require('../models/Device');
const KendaliPerangkat = require('../models/KendaliPerangkat');
const SensorData = require('../models/SensorData');
const DeviceWhitelist = require('../models/DeviceWhitelist');
const User = require('../models/User');
const PlnTariff = require('../models/PlnTariff');
const EnergyLog = require('../models/EnergyLog');
const EnvironmentLog = require('../models/EnvironmentLog');
const SecurityLog = require('../models/SecurityLog');
const WaterQualityLog = require('../models/WaterQualityLog');
const Activity = require('../models/Activity');
const alertService = require('../services/alertService');
const AuthEvent = require('../models/AuthEvent');

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

        // Handle Auth Request: bieon/<master_id>/auth/request
        if (parts.length >= 4 && parts[2] === 'auth' && parts[3] === 'request') {
          const masterId = parts[1];
          await handleAuthRequest(masterId, payload);
          return;
        }

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

    if (updatedDevice && ioInstance) {
      ioInstance.emit('device_telemetry', {
        _id: updatedDevice._id,
        currentValues: updatedDevice.currentValues,
        battery: updatedDevice.battery,
        status: String(updatedDevice.status)
      });
    }

    // 1. Notifikasi Perubahan Status
    if (updates.status !== undefined && device.status !== updates.status) {
      const Alert = require('../models/Alert');
      const statusText = updates.status === '1' ? 'Menyala (ON)' : 'Mati (OFF)';
      let category = device.environmentAspect === 'Keamanan' ? 'Keamanan' : 
                     (device.environmentAspect === 'Kenyamanan' ? 'Kenyamanan' : 
                     (device.environmentAspect === 'Kualitas Air' ? 'Air Sanitasi' : 'Sistem'));

      await Alert.create({
        owner: device.owner,
        hub: device.hubId,
        category,
        title: `Perangkat ${statusText}`,
        message: `[Log] Perangkat ${device.name} di ${device.location} telah berubah status menjadi ${statusText}.`,
        type: 'Info',
        link: 'kendali',
        metadata: { deviceId: device._id }
      });
    }

    // 2. Delta Billing & Energy Logging
    if (updatedDevice && payload.energyToday !== undefined) {
      const user = await User.findById(updatedDevice.owner);
      if (user) {
        const prevEnergy = updatedDevice.currentValues?.lastEnergyReading || 0;
        const currentEnergy = payload.energyToday;
        let deltaKwh = Math.max(0, currentEnergy - prevEnergy);
        if (currentEnergy < prevEnergy) deltaKwh = currentEnergy; 

        if (deltaKwh > 0) {
          const plnCategory = user.plnTariff || 'R-1/TR 1300 VA';
          const tariffRecord = await PlnTariff.findOne({ category: new RegExp(plnCategory, 'i') }).sort({ createdAt: -1 });
          const tariffPrice = tariffRecord ? tariffRecord.tariff : 1444;
          const cost = deltaKwh * tariffPrice;
          
          // user.tokenBalance = Math.max(0, (user.tokenBalance || 0) - cost); // STOP DEDUCTION (Switching to Budget System)
          // await user.save();

          await KendaliPerangkat.findByIdAndUpdate(updatedDevice._id, { 
            'currentValues.lastEnergyReading': currentEnergy,
            'currentValues.energyToday': currentEnergy,
            'currentValues.currentLoad': payload.currentLoad || 0
          });

          await new EnergyLog({
            device: updatedDevice._id,
            hub: updatedDevice.hubId,
            date: new Date(),
            totalKwh: deltaKwh,
            power: payload.currentLoad || 0,
            owner: user._id
          }).save();
        }
      }
    }

    // 3. History Logging & Danger Alerts
    if (updatedDevice && updatedDevice.category === 'Sensor') {
      if (payload.temperature !== undefined || payload.humidity !== undefined) {
        await new EnvironmentLog({
          hub: updatedDevice.hubId,
          date: new Date(),
          avgTemperature: payload.temperature || updatedDevice.currentValues?.temperature || 0,
          avgHumidity: (payload.humidity || updatedDevice.currentValues?.humidity || 0) + '%',
          room: updatedDevice.location || 'Lainnya',
          owner: updatedDevice.owner
        }).save();
      }
      if (payload.doorOpen !== undefined || payload.motion !== undefined) {
        await new SecurityLog({
          device: updatedDevice._id,
          hub: updatedDevice.hubId,
          date: new Date(),
          room: updatedDevice.location || 'Lainnya',
          door: payload.doorOpen ? 'Terbuka' : 'Tertutup',
          motion: payload.motion ? 'Terdeteksi Gerak' : 'Tidak Ada Gerak',
          status: (payload.doorOpen || payload.motion) ? 'Waspada' : 'Aman',
          owner: updatedDevice.owner
        }).save();
      }
      if (payload.ph !== undefined || payload.turbidity !== undefined || payload.tds !== undefined) {
        await new WaterQualityLog({
          owner: updatedDevice.owner,
          device: updatedDevice._id,
          hub: updatedDevice.hubId,
          ph: payload.ph || updatedDevice.currentValues?.ph || 0,
          turbidity: payload.turbidity || updatedDevice.currentValues?.turbidity || 0,
          temperature: payload.waterTemp || updatedDevice.currentValues?.waterTemp || 0,
          tds: payload.tds || updatedDevice.currentValues?.tds || 0,
          status: 'Layak Pakai',
          date: new Date()
        }).save();
      }
      await alertService.simulateSensorData(updatedDevice._id, payload);
    }

    // 4. Logika Otomatisasi
    if (updatedDevice && updatedDevice.category === 'Sensor' && updatedDevice.currentValues) {
      let aspect = updatedDevice.type;
      if (aspect === 'SNZB-02DR2' || aspect === 'Sensor Kenyamanan' || aspect === 'Kenyamanan') aspect = 'Kenyamanan';
      else if (aspect === 'Sensor Kualitas Air' || aspect === 'Kualitas Air') aspect = 'Kualitas Air';
      else if (aspect === 'Sensor Keamanan' || aspect === 'Keamanan') aspect = 'Keamanan';

      if (['Kenyamanan', 'Kualitas Air', 'Keamanan'].includes(aspect)) {
        const actuators = await KendaliPerangkat.find({
          owner: updatedDevice.owner,
          category: 'Control Actuator System',
          controlMethod: 'Lingkungan',
          environmentAspect: aspect
        });

        for (const act of actuators) {
          if (!act.thresholds) continue;
          let isMet = true;
          let hasCondition = false;
          const sensor = updatedDevice;

          // Check Temperature
          if (act.thresholds.temperature !== undefined) {
            const sensorVal = sensor.currentValues.waterTemp !== undefined ? sensor.currentValues.waterTemp : sensor.currentValues.temperature;
            if (sensorVal !== undefined) {
              hasCondition = true;
              if (sensorVal <= act.thresholds.temperature) isMet = false;
            }
          }
          // Check Humidity
          if (act.thresholds.humidity !== undefined && sensor.currentValues.humidity !== undefined) {
            hasCondition = true;
            if (sensor.currentValues.humidity <= act.thresholds.humidity) isMet = false;
          }
          // Check Water Quality
          if (act.thresholds.ph !== undefined && sensor.currentValues.ph !== undefined) {
            hasCondition = true;
            if (sensor.currentValues.ph <= act.thresholds.ph) isMet = false;
          }
          if (act.thresholds.tds !== undefined && sensor.currentValues.tds !== undefined) {
            hasCondition = true;
            if (sensor.currentValues.tds <= act.thresholds.tds) isMet = false;
          }
          if (act.thresholds.turbidity !== undefined && sensor.currentValues.turbidity !== undefined) {
            hasCondition = true;
            if (sensor.currentValues.turbidity <= act.thresholds.turbidity) isMet = false;
          }

          if (hasCondition) {
            const targetTopic = `bieon/${act.name.replace(/\s+/g, '_')}/command`;
            const newStatus = isMet ? '1' : '0';
            
            if (String(act.status) !== newStatus) {
              console.log(`[Automation] ${act.name} -> ${newStatus === '1' ? 'ON' : 'OFF'}`);
              publishCommand(targetTopic, newStatus === '1' ? 'ON' : 'OFF');
              await KendaliPerangkat.findByIdAndUpdate(act._id, { status: newStatus });

              await new Activity({
                user: act.owner,
                hub: act.hubId,
                room: act.location,
                actuator: act.name,
                status: newStatus === '1' ? 'ON' : 'OFF',
                action: newStatus === '1' ? 'Menyalakan' : 'Mematikan',
                trigger: `Otomasi (${aspect})`
              }).save();

              if (ioInstance) ioInstance.emit('device_telemetry', { _id: act._id, status: newStatus });

              const Alert = require('../models/Alert');
              await Alert.create({
                owner: act.owner,
                hub: act.hubId,
                category: aspect === 'Kualitas Air' ? 'Air Sanitasi' : aspect,
                title: isMet ? 'Otomasi Aktif' : 'Otomasi Selesai',
                message: `Sistem otomatis ${isMet ? 'menyalakan' : 'mematikan'} ${act.name} karena kondisi ${aspect} ${isMet ? 'memerlukan tindakan' : 'kembali normal'}.`,
                type: isMet ? 'Success' : 'Info',
                link: 'kendali',
                metadata: { deviceId: act._id }
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('❌ Telemetry Error:', err.message);
  }
};

const handleAuthRequest = async (masterId, payload) => {
  try {
    // Mendukung dua format payload:
    // Format 1: Langsung object device ({"device_ieee": "...", ...})
    // Format 2: Sesuai struktur db ({"devices": {"IEEE_MAC": {...}}})

    let devicesToAuth = [];

    if (payload && payload.devices) {
      // Format 2
      for (const [ieee, data] of Object.entries(payload.devices)) {
        devicesToAuth.push({ device_ieee: ieee, ...data });
      }
    } else if (payload && payload.device_ieee) {
      // Format 1 (Single device)
      devicesToAuth.push(payload);
    } else if (Array.isArray(payload)) {
      devicesToAuth = payload;
    }

    const responses = [];

    for (const device of devicesToAuth) {
      const { device_ieee, device_name, device_profile: reqProfile, model_id: reqModel } = device;
      if (!device_ieee) continue;

      const last4Mac = device_ieee ? device_ieee.replace(/:/g, '').slice(-4).toUpperCase() : '0000';
      const currentTs = Math.floor(Date.now() / 1000);
      const hub_ieee = payload.hub_ieee || masterId;

      // Normalisasi IEEE untuk memastikan format cocok dengan database
      let cleanIeee = device_ieee.replace(/:/g, '').toUpperCase();
      let colonIeee = cleanIeee.match(/.{1,2}/g).join(':');

      // Cek di whitelist db dengan berbagai kombinasi format
      const whitelistEntry = await DeviceWhitelist.findOne({
        $or: [
          { device_ieee: device_ieee },
          { device_ieee: cleanIeee },
          { device_ieee: cleanIeee.toLowerCase() },
          { device_ieee: colonIeee },
          { device_ieee: colonIeee.toLowerCase() }
        ]
      });

      let decision = 'block';
      let responseObj = {
        type: "auth_response",
        master_ieee: masterId,
        device_ieee: device_ieee,
        ts: currentTs
      };

      if (whitelistEntry && whitelistEntry.approved) {
        decision = 'allow';
        const profile = whitelistEntry.device_profile && whitelistEntry.device_profile !== 'UNKNOWN' ? whitelistEntry.device_profile : (reqProfile || whitelistEntry.model_id || 'UNKNOWN');
        
        console.log(`[Auth Decision] Allow for ${device_ieee} (${whitelistEntry.device_name || 'Unknown'})`);
        responseObj = {
          ...responseObj,
          decision: "allow",
          device_id: whitelistEntry.device_id || "unknown",
          device_name: whitelistEntry.device_name || "Unknown",
          device_profile: profile,
          model_id: whitelistEntry.model_id || "UNKNOWN",
          alias: `${profile}_${last4Mac}`,
        };
      } else {
        decision = 'block';
        const profile = reqProfile || 'UNKNOWN';
        console.log(`[Auth Decision] Block for ${device_ieee} (${device_name || 'Unknown'})`);
        responseObj = {
          ...responseObj,
          decision: "block",
          device_id: "unknown",
          device_profile: profile,
          model_id: reqModel || "UNKNOWN",
          alias: `${profile}_${last4Mac}`,
        };
      }

      responses.push(responseObj);

      // Log AuthEvent
      await AuthEvent.create({
        type: 'auth_request',
        status: decision === 'allow' ? 'allow' : (whitelistEntry ? 'rejected' : 'pending'),
        decision: decision,
        master_ieee: masterId,
        hub_ieee: hub_ieee,
        device_ieee: device_ieee,
        device_id: responseObj.device_id,
        device_name: responseObj.device_name || device_name,
        device_profile: responseObj.device_profile,
        model_id: responseObj.model_id,
        alias: responseObj.alias,
        cached: payload.cached || false,
        source: 'mqtt',
        ts: currentTs
      });
    }

    // Publish ke response topic
    if (responses.length > 0) {
      const responseTopic = `bieon/${masterId}/auth/response`;
      // Jika hanya 1 balasan, kirim object langsung. Jika lebih, kirim array
      if (responses.length === 1) {
        publishCommand(responseTopic, responses[0]);
      } else {
        publishCommand(responseTopic, responses);
      }
    }

  } catch (error) {
    console.error('❌ Error handling auth request:', error.message);
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
