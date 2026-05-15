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
const BieonSystem = require('../models/BieonSystem');
const Hub = require('../models/Hub');

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
    
    // Bootstrap & Legacy Auth
    mqttClient.subscribe('bieon/#'); 
    
    // Hierarchical Tree Structure Subscriptions (Hardware Doc V2)
    mqttClient.subscribe('tenant/+/bieon/+/hub/+/device/+/command');
    mqttClient.subscribe('tenant/+/bieon/+/hub/+/device/+/auth/request');
    mqttClient.subscribe('tenant/+/bieon/+/hub/+/device/+/telemetry');
    mqttClient.subscribe('tenant/+/bieon/+/hub/+/device/+/status');
    mqttClient.subscribe('tenant/+/bieon/+/log/system');
    mqttClient.subscribe('tenant/+/bieon/+/status');
    mqttClient.subscribe('tenant/+/bieon/+/diagnostic');
    mqttClient.subscribe('bieon/+/bootstrap/#');
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
      } else if (topic.startsWith('tenant/')) {
        // Hierarchical Tree Structure
        const parts = topic.split('/');
        
        // Device level topics: tenant/{tenant}/bieon/{bieon}/hub/{hub}/device/{device}/...
        if (parts.length >= 9 && parts[2] === 'bieon' && parts[4] === 'hub' && parts[6] === 'device') {
          const tenantId = parts[1];
          const bieonId = parts[3];
          const hubId = parts[5];
          const deviceId = parts[7];
          const streamType = parts[8]; // telemetry, command, status, auth, response
          
          if (streamType === 'telemetry' || streamType === 'status') {
            await handleHierarchicalTelemetry(tenantId, bieonId, hubId, deviceId, payload);
          } else if (streamType === 'response') {
            console.log(`[MQTT] Command response received for ${deviceId} in tenant ${tenantId}`);
            try {
              const device = await KendaliPerangkat.findOne({ name: deviceId, tenantId: tenantId });
              if (device) {
                device.lastCommandStatus = payload.status === 'ok' ? 'completed' : 'failed';
                await device.save();
              }
            } catch (err) { console.error(err.message); }
          } else if (streamType === 'auth') {
             // Substream: auth/request
             const subStream = parts[9];
             if (subStream === 'request') {
                 await handleHierarchicalAuth(tenantId, bieonId, hubId, deviceId, payload);
             }
          }
        } else if (parts.length >= 5 && parts[2] === 'bieon') {
           // System level logs: tenant/{tenant}/bieon/{bieon}/log/system
           if (parts[4] === 'log' || parts[4] === 'status' || parts[4] === 'diagnostic') {
              // Ignore spamming logs for now, but they are correctly routed
           }
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
            const deviceIdentifier = act.device_ieee || act.modelId || act.name.replace(/\s+/g, '_').toLowerCase();
            const hubAlias = updatedDevice.hubId ? (await require('../models/Hub').findById(updatedDevice.hubId))?.bieonId || 'hub_01' : 'hub_01';
            
            // Samakan format topik dengan Kontrol Manual (Hierarchical)
            const targetTopic = `tenant/${act.owner}/bieon/${act.bieonId}/hub/${hubAlias}/device/${deviceIdentifier}/command`;
            
            const newStatus = isMet ? '1' : '0';
            
            if (String(act.status) !== newStatus) {
              console.log(`[Automation] ${act.name} (IEEE: ${deviceIdentifier}) -> ${newStatus === '1' ? 'ON' : 'OFF'}`);
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

              if (ioInstance) ioInstance.emit('device_telemetry', act);

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

// ===== HIERARCHICAL AUTH HANDLER (TREE STRUCTURE) =====
const handleHierarchicalAuth = async (tenantId, bieonId, hubId, deviceId, payload) => {
    console.log(`\n[MQTT-AUTH] 🔐 Device Auth Request: ${deviceId} (Tenant: ${tenantId})`);
    
    try {
        // --- PENCARIAN BERLAPIS (EXHAUSTIVE SEARCH) ---
        let cleanIeee = deviceId.replace(/[:\-]/g, '').toUpperCase();
        let colonIeee = (cleanIeee.match(/.{1,2}/g) || []).join(':');

        let device = await KendaliPerangkat.findOne({ 
            tenantId: tenantId,
            $or: [
                { name: deviceId },
                { device_ieee: deviceId },
                { device_ieee: cleanIeee },
                { device_ieee: colonIeee },
                { device_ieee: cleanIeee.toLowerCase() },
                { device_ieee: colonIeee.toLowerCase() }
            ]
        });
        
        // Jurus Terakhir: Suffix Matching (misal: th_sensor_FFFF)
        if (!device && deviceId.includes('_')) {
            const parts = deviceId.split('_');
            const suffix = parts[parts.length - 1].toUpperCase();
            if (suffix.length >= 4) {
                console.log(`[MQTT-AUTH] 🔍 Final attempt with suffix: ...${suffix}`);
                device = await KendaliPerangkat.findOne({ 
                    tenantId: tenantId,
                    device_ieee: { $regex: new RegExp(suffix + '$', 'i') } 
                });
            }
        }

        const responseTopic = `tenant/${tenantId}/bieon/${bieonId}/hub/${hubId}/device/${deviceId}/auth/response`;
        const configTopic = `tenant/${tenantId}/bieon/${bieonId}/config/device-map`;

        if (!device) {
            console.log(`[MQTT-AUTH] ❌ Device ${deviceId} not found in DB even with suffix search. Blocking.`);
            publishCommand(responseTopic, { 
                type: "auth_response",
                device_ieee: deviceId,
                decision: "block", 
                tenant_id: tenantId,
                hub_id: hubId,
                ts: Math.floor(Date.now()/1000) 
            });
            return;
        }

        if (device.lifecycleState === 'PROVISIONED' || device.lifecycleState === 'AUTHORIZED' || device.lifecycleState === 'STALE') {
            console.log(`[MQTT-AUTH] ✅ Device ${deviceId} is approved (${device.lifecycleState}). Allowing.`);
            
            // Mark as authorized
            if (device.lifecycleState !== 'AUTHORIZED') {
                device.lifecycleState = 'AUTHORIZED';
                device.isAuthorized = true;
                device.status = 'Active';
                device.lastSeen = new Date();
                await device.save();
                
                if (ioInstance) {
                    ioInstance.emit('device_telemetry', {
                        _id: device._id,
                        status: 'Active',
                        lifecycleState: 'AUTHORIZED'
                    });
                }
            }

            // Publish Auth Response (FORMAT DIVISI HARDWARE)
            publishCommand(responseTopic, { 
                type: "auth_response",
                device_ieee: (device.device_ieee || deviceId).replace(/[:\-]/g, '').toLowerCase(),
                device_id: device.modelId || device.type || "SNZB_02DR2", 
                decision: "allow", 
                tenant_id: tenantId,
                hub_id: hubId.replace('hubnode_', 'hub_'), // Normalisasi hubnode_001 -> hub_001
                ts: Math.floor(Date.now()/1000) 
            });

            // Publish Device Map Config
            publishCommand(configTopic, {
                device_id: deviceId,
                model: device.type || "UNKNOWN",
                features: ["telemetry", "command", "status"],
                ts: Math.floor(Date.now()/1000)
            });

        } else {
            console.log(`[MQTT-AUTH] ⚠️ Device ${deviceId} rejected due to state: ${device.lifecycleState}`);
            publishCommand(responseTopic, { 
                type: "auth_response",
                device_ieee: device.device_ieee || deviceId,
                decision: "block", 
                tenant_id: tenantId,
                hub_id: hubId,
                ts: Math.floor(Date.now()/1000) 
            });
        }

    } catch (err) {
        console.error(`[MQTT-AUTH] Error handling auth for ${deviceId}:`, err.message);
    }
};

const handleHierarchicalTelemetry = async (tenantId, bieonId, hubId, deviceId, payload) => {
  try {
    console.log(`\n[MQTT] 📥 RECEIVED: ${deviceId} (Tenant: ${tenantId}, Bieon: ${bieonId}, Hub: ${hubId})`);
    
    // Find device by device_id (alias). 
    let device = await KendaliPerangkat.findOne({ 
      name: deviceId,
      $or: [
        { tenantId: tenantId },
        { tenantId: { $exists: false } },
        { tenantId: null }
      ]
    });

    if (!device) {
      console.log(`[MQTT] ❌ Hierarchical device not found in DB: ${deviceId}`);
      return;
    }

    // --- STRICT AUTH FLOW ENFORCEMENT ---
    if (device.lifecycleState === 'UNCLAIMED' || device.lifecycleState === 'BLOCKED' || device.lifecycleState === 'DECOMMISSIONED') {
      console.log(`[MQTT] ⚠️ Rejecting telemetry. Device ${deviceId} is in state: ${device.lifecycleState}`);
      return; // Stop processing if not provisioned or authorized
    }

    // --- DEBUG: START AUTO-PROVISIONING ---
    console.log(`[DEBUG] Checking hierarchy for Bieon: ${bieonId}, Hub: ${hubId}`);

    // 1. BieonSystem
    let system = await BieonSystem.findOne({ bieonId: bieonId });
    if (!system) {
        console.log(`[DEBUG] ➕ BieonSystem ${bieonId} NOT FOUND. Creating now...`);
        try {
            const newSystem = new BieonSystem({
                bieonId: bieonId,
                owner: device.owner,
                status: 'Active'
            });
            await newSystem.save();
            console.log(`[DEBUG] ✨ SUCCESS: BieonSystem ${bieonId} saved to DB.`);
        } catch (e) {
            console.error(`[DEBUG] ❌ FAILED to save BieonSystem: ${e.message}`);
        }
    } else {
        console.log(`[DEBUG] ✅ BieonSystem ${bieonId} already exists.`);
    }

    // 2. Hub
    let hubRecord = await Hub.findOne({ bieonId: hubId });
    if (!hubRecord) {
        console.log(`[DEBUG] ➕ Hub ${hubId} NOT FOUND. Creating now...`);
        try {
            hubRecord = new Hub({
                name: `Hub ${hubId}`,
                bieonId: hubId,
                tenantId: tenantId,
                owner: device.owner,
                status: 'Online'
            });
            await hubRecord.save();
            console.log(`[DEBUG] ✨ SUCCESS: Hub ${hubId} saved to DB.`);
        } catch (e) {
            console.error(`[DEBUG] ❌ FAILED to save Hub: ${e.message}`);
        }
    } else {
        console.log(`[DEBUG] ✅ Hub ${hubId} already exists.`);
    }

    const updates = { 
      lastSeen: new Date(),
      lifecycleState: 'AUTHORIZED', // Data received means it's authorized and active
      status: 'Active',
      isAuthorized: true,
      tenantId: tenantId,
      bieonId: bieonId,
      hub: hubRecord?._id // Link to the hub record
    };

    // Parse clusters if present (Hardware Doc Format)
    if (payload.clusters && Array.isArray(payload.clusters)) {
      payload.clusters.forEach(c => {
        if (c.cluster === 'temperature') updates['currentValues.temperature'] = c.value;
        if (c.cluster === 'humidity') updates['currentValues.humidity'] = c.value;
        if (c.cluster === 'on_off') {
            let normStatus = String(c.value).toUpperCase();
            if (normStatus === 'ON' || normStatus === '1') normStatus = '1';
            else if (normStatus === 'OFF' || normStatus === '0') normStatus = '0';
            updates.status = normStatus;
        }
        // Add more cluster mappings as needed
      });
    } else {
      // Fallback to flat payload (Backward Compatibility)
      if (payload.temperature !== undefined) updates['currentValues.temperature'] = payload.temperature;
      if (payload.humidity !== undefined) updates['currentValues.humidity'] = payload.humidity;
      if (payload.status !== undefined) updates.status = String(payload.status);
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
        status: String(updatedDevice.status),
        lifecycleState: updatedDevice.lifecycleState
      });
    }

    // --- INTEGRASI KE DATABASE LAIN (LOGGING) ---

    // 1. SensorData (Suhu & Kelembapan sesuai permintaan User)
    if (updates['currentValues.temperature'] !== undefined) {
        await new SensorData({ topic: `tenant/${tenantId}/bieon/${bieonId}/temp`, value: updates['currentValues.temperature'] }).save();
    }
    if (updates['currentValues.humidity'] !== undefined) {
        await new SensorData({ topic: `tenant/${tenantId}/bieon/${bieonId}/humi`, value: updates['currentValues.humidity'] }).save();
    }

    // 2. WaterQualityLog
    if (updates['currentValues.ph'] !== undefined || updates['currentValues.tds'] !== undefined) {
        await new WaterQualityLog({
          owner: updatedDevice.owner,
          device: updatedDevice._id,
          hub: updatedDevice.hubId,
          ph: updates['currentValues.ph'] || updatedDevice.currentValues?.ph || 0,
          tds: updates['currentValues.tds'] || updatedDevice.currentValues?.tds || 0,
          temperature: updates['currentValues.waterTemp'] || updatedDevice.currentValues?.waterTemp || 0,
          status: 'Layak Pakai',
          date: new Date()
        }).save();
    }

    // 3. Alerts (Jika status berubah)
    if (updates.status !== undefined && device.status !== updates.status) {
        const Alert = require('../models/Alert');
        const statusText = updates.status === '1' ? 'Menyala (ON)' : 'Mati (OFF)';
        await Alert.create({
          owner: updatedDevice.owner,
          hub: updatedDevice.hubId,
          category: 'Sistem',
          title: `Perangkat ${statusText}`,
          message: `[Hardware Baru] Perangkat ${updatedDevice.name} telah berubah status menjadi ${statusText}.`,
          type: 'Info',
          link: 'kendali',
          metadata: { deviceId: updatedDevice._id }
        });
    }

    // 4. EnergyLog (Jika ada payload energy - Adaptasi dari handleDeviceTelemetry)
    if (payload.energyToday !== undefined) {
        await new EnergyLog({
            device: updatedDevice._id,
            hub: updatedDevice.hubId,
            date: new Date(),
            totalKwh: payload.energyToday,
            power: payload.currentLoad || 0,
            owner: updatedDevice.owner
        }).save();
    }

    console.log(`[MQTT] Hierarchical Telemetry updated & logged for ${deviceId}`);
  } catch (err) {
    console.error('❌ Hierarchical Telemetry Error:', err.message);
  }
};

const startPermitJoin = (duration = 60) => {
  if (mqttClient) {
    mqttClient.publish('zigbee2mqtt/bridge/request/permit_join', JSON.stringify({ value: true, time: duration }));
  }
};

const publishCommand = (topic, payload, options = { qos: 1 }) => {
  if (mqttClient) {
    const message = typeof payload === 'object' ? JSON.stringify(payload, null, 2) : String(payload);
    mqttClient.publish(topic, message, options);
  }
};

const publishHierarchicalCommand = (tenantId, bieonId, hubId, deviceId, command, params) => {
    const topic = `tenant/${tenantId}/bieon/${bieonId}/hub/${hubId}/device/${deviceId}/command`;
    const payload = {
        command_id: `cmd_${Date.now()}`,
        timestamp: Date.now(),
        command: command,
        parameters: params
    };
    publishCommand(topic, payload);
};

module.exports = { connectMQTT, startPermitJoin, publishCommand, publishHierarchicalCommand };
