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
const { findOneByBieonId, normalizeBieonId } = require('../shared/bieonId');
const PdmMeter = require('../models/PdmMeter');
const SystemLog = require('../models/SystemLog');
const RemoteRawBitCatalog = require('../models/RemoteRawBitCatalog');

const buildFlexibleBieonIdRegex = (value) => {
  const chars = String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').split('');
  if (chars.length === 0) return null;
  return new RegExp(`^${chars.map((char) => `${char}[^A-Z0-9]*`).join('')}$`, 'i');
};

let mqttClient = null;
let ioInstance = null;
const openJoinSessions = new Map();
const remoteRegistrationSessions = new Map();

const normalizeDeviceCategory = (value) => {
  const text = String(value || '').toLowerCase();
  if (text.includes('actuator') || text.includes('control') || text.includes('relay') || text.includes('switch')) {
    return 'Control Actuator System';
  }
  return 'Sensor';
};

const setOpenJoinSession = (bieonId, session) => {
  if (!bieonId) return;
  openJoinSessions.set(String(bieonId), {
    ...session,
    bieonId: String(bieonId),
    expiresAt: Date.now() + Math.max(Number(session.duration) || 30, 1) * 1000
  });
};

const getOpenJoinSession = (bieonId) => {
  const session = openJoinSessions.get(String(bieonId));
  if (!session) return null;
  if (session.expiresAt && session.expiresAt < Date.now()) {
    openJoinSessions.delete(String(bieonId));
    return null;
  }
  return session;
};

const clearOpenJoinSession = (bieonId) => {
  if (!bieonId) return;
  openJoinSessions.delete(String(bieonId));
};

const setRemoteRegistrationSession = (bieonId, session = {}) => {
  if (!bieonId) return null;
  const normalizedBieonId = String(bieonId).toLowerCase();
  const duration = Math.max(Number(session.duration) || 90, 1);
  const expiresAt = Date.now() + duration * 1000;
  const nextSession = {
    ...session,
    bieonId: normalizedBieonId,
    duration,
    expiresAt,
    updatedAt: Date.now()
  };
  remoteRegistrationSessions.set(normalizedBieonId, nextSession);
  return nextSession;
};

const getRemoteRegistrationSession = (bieonId) => {
  if (!bieonId) return null;
  const normalizedBieonId = String(bieonId).toLowerCase();
  const session = remoteRegistrationSessions.get(normalizedBieonId);
  if (!session) return null;
  if (session.expiresAt && session.expiresAt < Date.now()) {
    remoteRegistrationSessions.delete(normalizedBieonId);
    return null;
  }
  return session;
};

const clearRemoteRegistrationSession = (bieonId) => {
  if (!bieonId) return;
  remoteRegistrationSessions.delete(String(bieonId).toLowerCase());
};

const toTrimmedString = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const pickFirstString = (...values) => {
  for (const value of values) {
    const text = toTrimmedString(value);
    if (text) return text;
  }
  return '';
};

const toNumberOrUndefined = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const stableStringify = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
};

const normalizeRemoteBitPayload = (topic, payload) => {
  const rawPayload = typeof payload === 'object' && payload !== null ? payload : { value: payload };
  const rawBitTextCandidate = pickFirstString(
    rawPayload.raw_bit,
    rawPayload.rawBit,
    rawPayload.raw_code,
    rawPayload.rawCode,
    rawPayload.bit,
    rawPayload.bits,
    rawPayload.code,
    rawPayload.value,
    rawPayload.raw,
    rawPayload.ir_code,
    rawPayload.rf_code,
    rawPayload.signal
  );
  const rawBitHexCandidate = pickFirstString(
    rawPayload.raw_hex,
    rawPayload.rawHex,
    rawPayload.hex,
    rawPayload.code_hex,
    rawPayload.ir_hex,
    rawPayload.rf_hex
  );
  const rawBitBinaryCandidate = pickFirstString(
    rawPayload.raw_binary,
    rawPayload.rawBinary,
    rawPayload.binary,
    rawPayload.bits_binary,
    rawPayload.bit_binary
  );
  const protocol = pickFirstString(
    rawPayload.protocol,
    rawPayload.type,
    rawPayload.signal_type,
    rawPayload.code_type,
    rawPayload.format
  );
  const bitLength = toNumberOrUndefined(
    rawPayload.bit_length ?? rawPayload.bitLength ?? rawPayload.length ?? rawPayload.bits_length ?? rawPayload.bitCount
  );
  const bitCount = toNumberOrUndefined(rawPayload.bit_count ?? rawPayload.bitCount ?? rawPayload.count);
  const sequence = toNumberOrUndefined(rawPayload.sequence ?? rawPayload.seq ?? rawPayload.index ?? rawPayload.order);
  const sessionId = pickFirstString(rawPayload.session_id, rawPayload.sessionId, rawPayload.registration_session_id, rawPayload.registrationSessionId);
  const sourceRemoteId = pickFirstString(rawPayload.remote_id, rawPayload.remoteId, rawPayload.device_id, rawPayload.deviceId, rawPayload.source_remote, rawPayload.sourceRemote);
  const sourceRemoteIeee = pickFirstString(rawPayload.remote_ieee, rawPayload.remoteIeee, rawPayload.device_ieee, rawPayload.deviceIeee, rawPayload.ieee, rawPayload.ieee_address);
  const sourceHubId = pickFirstString(rawPayload.hub_id, rawPayload.hubId, rawPayload.hub, rawPayload.source_hub, rawPayload.sourceHub);
  const rawBitText = rawBitTextCandidate || rawBitHexCandidate || rawBitBinaryCandidate || stableStringify(rawPayload);
  const rawSignature = [
    protocol || 'unknown',
    bitLength !== undefined ? String(bitLength) : 'na',
    rawBitHexCandidate || rawBitBinaryCandidate || rawBitText || stableStringify(rawPayload)
  ].join('|');

  return {
    bieonId: '',
    rawSignature,
    rawPayload,
    rawBitText,
    rawBitHex: rawBitHexCandidate,
    rawBitBinary: rawBitBinaryCandidate,
    protocol: protocol || undefined,
    bitLength,
    bitCount,
    sequence,
    sessionId: sessionId || undefined,
    sourceTopic: topic,
    sourceRemoteId: sourceRemoteId || undefined,
    sourceRemoteIeee: sourceRemoteIeee || undefined,
    sourceHubId: sourceHubId || undefined,
    latestEventPayload: rawPayload
  };
};

const persistRemoteRawBitCatalog = async (bieonId, topic, payload) => {
  const normalizedBieonId = normalizeBieonId(bieonId);
  if (!normalizedBieonId) return null;

  const bitEvent = normalizeRemoteBitPayload(topic, payload);
  const now = new Date();

  try {
    const updated = await RemoteRawBitCatalog.findOneAndUpdate(
      { bieonId: normalizedBieonId, rawSignature: bitEvent.rawSignature },
      {
        $setOnInsert: {
          bieonId: normalizedBieonId,
          rawSignature: bitEvent.rawSignature,
          rawPayload: bitEvent.rawPayload,
          rawBitText: bitEvent.rawBitText,
          rawBitHex: bitEvent.rawBitHex,
          rawBitBinary: bitEvent.rawBitBinary,
          protocol: bitEvent.protocol,
          bitLength: bitEvent.bitLength,
          bitCount: bitEvent.bitCount,
          sequence: bitEvent.sequence,
          sessionId: bitEvent.sessionId,
          sourceTopic: bitEvent.sourceTopic,
          sourceRemoteId: bitEvent.sourceRemoteId,
          sourceRemoteIeee: bitEvent.sourceRemoteIeee,
          sourceHubId: bitEvent.sourceHubId,
          firstSeenAt: now,
          lastSeenAt: now,
          latestEventPayload: bitEvent.latestEventPayload
        },
        $set: {
          rawPayload: bitEvent.rawPayload,
          rawBitText: bitEvent.rawBitText,
          rawBitHex: bitEvent.rawBitHex,
          rawBitBinary: bitEvent.rawBitBinary,
          protocol: bitEvent.protocol,
          bitLength: bitEvent.bitLength,
          bitCount: bitEvent.bitCount,
          sequence: bitEvent.sequence,
          sessionId: bitEvent.sessionId,
          sourceTopic: bitEvent.sourceTopic,
          sourceRemoteId: bitEvent.sourceRemoteId,
          sourceRemoteIeee: bitEvent.sourceRemoteIeee,
          sourceHubId: bitEvent.sourceHubId,
          lastSeenAt: now,
          latestEventPayload: bitEvent.latestEventPayload,
          isActive: true
        },
        $inc: { captureCount: 1 }
      },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return updated;
  } catch (error) {
    console.warn('[REMOTE][BIT] Failed to persist raw bit catalog:', error && error.message ? error.message : error);
    return {
      bieonId: normalizedBieonId,
      rawSignature: bitEvent.rawSignature,
      rawPayload: bitEvent.rawPayload,
      rawBitText: bitEvent.rawBitText,
      rawBitHex: bitEvent.rawBitHex,
      rawBitBinary: bitEvent.rawBitBinary,
      protocol: bitEvent.protocol,
      bitLength: bitEvent.bitLength,
      bitCount: bitEvent.bitCount,
      sequence: bitEvent.sequence,
      sessionId: bitEvent.sessionId,
      sourceTopic: bitEvent.sourceTopic,
      sourceRemoteId: bitEvent.sourceRemoteId,
      sourceRemoteIeee: bitEvent.sourceRemoteIeee,
      sourceHubId: bitEvent.sourceHubId,
      firstSeenAt: now,
      lastSeenAt: now,
      latestEventPayload: bitEvent.latestEventPayload,
      captureCount: 1,
      isActive: true
    };
  }
};

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
    mqttClient.subscribe('bieon/+/admin/command');
    mqttClient.subscribe('bieon/+/admin/open_join');
    mqttClient.subscribe('bieon/+/admin/device_announce');
    mqttClient.subscribe('bieon/+/events/registration');
    mqttClient.subscribe('bieon/+/events/bit_registration_announce');
    mqttClient.subscribe('bieon/+/log/system');
    mqttClient.subscribe('bieon/+/hub/+/lifecycle');
    mqttClient.subscribe('bieon/+/energi/pdm/telemetry');
    mqttClient.subscribe('bieon/+/hub/+/zigbee_devices/+/telemetry');
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
        console.log(`[MQTT] Ignored legacy tenant topic: ${topic}`);
      } else if (topic.startsWith('bieon/')) {
        const parts = topic.split('/');
        // Normalize bieon id segment to lowercase so all topics use canonical lowercase bieon ids
        if (parts && parts.length > 1) parts[1] = String(parts[1] || '').toLowerCase();

        // Handle device announce from ESP-B: bieon/{bieonId}/admin/device_announce
        if (parts.length >= 4 && parts[2] === 'admin' && parts[3] === 'device_announce') {
          const bieonId = parts[1];
          const announce = typeof payload === 'object' && payload !== null ? payload : {};
          const deviceIeee = String(announce.device_ieee || announce.ieee || announce.device_ieee_raw || '').replace(/[:\-\s]/g, '').toUpperCase();
          const deviceModel = String(announce.model || announce.model_id || announce.device_type || announce.type || '').trim();
          const deviceManufacturer = String(announce.manufacturer || announce.vendor || announce.brand || '').trim();
          const displayName = [deviceManufacturer, deviceModel].filter(Boolean).join(' ').trim() || deviceModel || 'Perangkat Baru';
          const openJoinSession = getOpenJoinSession(bieonId);
          let claimedDevice = null;

          // Determine whether this announce looks like a hub node
          const isHubCandidate = (deviceModel || '').toLowerCase().includes('hub') || (deviceModel || '').toLowerCase().includes('hub node') || (deviceManufacturer || '').toLowerCase().includes('bieon');

          if (openJoinSession && deviceIeee) {
            if (openJoinSession.hubOnly && !isHubCandidate) {
              // Ignore non-hub device announces when hub-only mode is active
              console.log('[DISCOVERY] Ignored non-hub announce during hub-only open-join for', bieonId, deviceIeee, deviceModel, deviceManufacturer);
              if (ioInstance) ioInstance.emit('device_discovered', { bieonId, ieee: deviceIeee, model: deviceModel, manufacturer: deviceManufacturer, openJoin: { active: true, hubOnly: true } });
            } else {
              try {
                const sessionHub = openJoinSession.hubId ? await Hub.findById(openJoinSession.hubId).lean() : await Hub.findOne({ bieonId }).lean();
                if (sessionHub) {
                  const now = new Date();
                  claimedDevice = await KendaliPerangkat.findOneAndUpdate(
                    { device_ieee: deviceIeee, bieonId },
                    {
                      $set: {
                        name: announce.display_name || displayName,
                        location: announce.location || sessionHub.name || 'Pending',
                        notes: announce.notes || undefined,
                        hubId: sessionHub._id,
                        category: announce.category || normalizeDeviceCategory(announce.type || announce.model),
                        type: announce.type || announce.model || 'Unknown',
                        status: 'Active',
                        lifecycleState: 'AUTHORIZED',
                        isAuthorized: true,
                        tenantId: sessionHub.tenantId || undefined,
                        bieonId,
                        device_ieee: deviceIeee,
                        modelId: announce.model || announce.model_id || undefined,
                        owner: sessionHub.owner || undefined,
                        lastSeen: now
                      },
                      $setOnInsert: {
                        thresholds: {}
                      }
                    },
                    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
                  );
                }
              } catch (err) {
                console.warn('[DISCOVERY] Failed to auto-claim device announce:', err && err.message ? err.message : err);
              }
            }
          }
          const discoveredPayload = {
            bieonId,
            ieee: deviceIeee || undefined,
            name: announce.display_name || displayName,
            model: deviceModel && deviceModel.toLowerCase() !== 'unknown' ? deviceModel : undefined,
            manufacturer: deviceManufacturer && deviceManufacturer.toLowerCase() !== 'unknown' ? deviceManufacturer : undefined,
            openJoin: openJoinSession ? {
              active: true,
              hubId: openJoinSession.hubId || null,
              requestedBy: openJoinSession.requestedBy || null
            } : { active: false },
            claimed: Boolean(claimedDevice),
            claimedHubId: claimedDevice?.hubId || openJoinSession?.hubId || null,
            raw: announce,
            topics: announce.topics || undefined
          };

          // If this announce looks like a hub node and we're in hub-only open-join,
          // create or update the Hub record so the master registers the new hub.
          if (openJoinSession && openJoinSession.hubOnly && isHubCandidate && deviceIeee) {
            try {
              const hubName = announce.display_name || displayName || (openJoinSession.hubId || `hub_${Date.now()}`);
              const ieeeCanonical = deviceIeee;
              // Try find by ieee first
              let hubRec = await Hub.findOne({ bieonId, device_ieee: ieeeCanonical }).lean();
              if (!hubRec) hubRec = await Hub.findOne({ bieonId, name: hubName }).lean();
              if (!hubRec) {
                const created = await Hub.create({ name: hubName, bieonId, device_ieee: ieeeCanonical, status: 'Online' });
                hubRec = created.toObject ? created.toObject() : created;
                console.log('[HUB] Auto-created hub from announce:', hubRec.name || hubRec._id);
              } else {
                await Hub.findByIdAndUpdate(hubRec._id, { $set: { status: 'Online', device_ieee: hubRec.device_ieee || ieeeCanonical } }).catch(() => {});
              }
              // Notify UI
              if (ioInstance) ioInstance.emit('hub_added', { bieonId, hub: hubRec, discovered: discoveredPayload });
            } catch (err) {
              console.warn('[HUB] Failed to auto-create hub from announce:', err && err.message ? err.message : err);
            }
          }

          console.log('[DISCOVERY] device_announce received:', discoveredPayload);
          if (ioInstance) {
            ioInstance.emit('device_discovered', discoveredPayload);
          }

          // If this device already exists in DB, update missing metadata (model/manufacturer/name)
          if (deviceIeee) {
            try {
              const updateFields = {};
              if (discoveredPayload.model) updateFields.modelId = discoveredPayload.model;
              if (discoveredPayload.manufacturer) updateFields.manufacturer = discoveredPayload.manufacturer;
              if (discoveredPayload.name) updateFields.name = discoveredPayload.name;
              if (Object.keys(updateFields).length > 0) {
                updateFields.lastSeen = new Date();
                const updated = await KendaliPerangkat.findOneAndUpdate(
                  { bieonId, $or: [{ device_ieee: deviceIeee }, { device_ieee: deviceIeee.toLowerCase() }] },
                  { $set: updateFields },
                  { new: true }
                );
                if (updated && ioInstance) {
                  ioInstance.emit('device_discovered', { ...discoveredPayload, updated: true });
                }
              }
            } catch (e) {
              console.warn('[DISCOVERY] Failed to update existing device metadata:', e && e.message ? e.message : e);
            }
          }
          return;
        }

        // Handle hub lifecycle events from ESP (bieon/{bieonId}/hub/{hubId}/lifecycle)
        if (parts.length >= 5 && parts[2] === 'hub' && parts[4] === 'lifecycle') {
          const bieonId = parts[1];
          const hubId = parts[3];
          const evt = typeof payload === 'object' && payload !== null ? payload : { event: String(payload) };
          const eventName = String(evt.event || evt.type || evt.status || '').toLowerCase();

          console.log('[HUB] lifecycle event received:', { bieonId, hubId, event: eventName, payload: evt });

          if (eventName === 'hub_added' || evt.event === 'hub_added') {
            try {
              const hubName = evt.hub_id || evt.hubId || hubId || `hub_${Date.now()}`;
              const ieee = String(evt.ieee || evt.device_ieee || evt.ieee_address || '').replace(/[:\-\s]/g, '').toUpperCase() || undefined;
              // Upsert hub by name or ieee
              let hubRec = null;
              if (ieee) hubRec = await Hub.findOne({ bieonId, device_ieee: ieee }).lean();
              if (!hubRec) hubRec = await Hub.findOne({ bieonId, name: hubName }).lean();
              if (!hubRec) {
                const created = await Hub.create({ name: hubName, bieonId, device_ieee: ieee, status: 'Online' });
                hubRec = created.toObject ? created.toObject() : created;
                console.log('[HUB] Created new hub record:', hubRec._id || hubRec.name);
              } else {
                // Update status/ieee if missing
                await Hub.findByIdAndUpdate(hubRec._id, { $set: { status: 'Online', device_ieee: ieee || hubRec.device_ieee } }).catch(() => {});
              }

              if (ioInstance) ioInstance.emit('hub_added', { bieonId, hub: hubRec, payload: evt });
            } catch (err) {
              console.warn('[HUB] Failed to persist hub_added event:', err && err.message ? err.message : err);
            }
          } else if (eventName === 'hub_add_failed' || evt.event === 'hub_add_failed') {
            if (ioInstance) ioInstance.emit('hub_add_failed', { bieonId, hubId, payload: evt });
          }
          return;
        }

        // Handle open join from backend/admin tools: bieon/{bieonId}/admin/open_join
        if (parts.length >= 4 && parts[2] === 'admin' && parts[3] === 'open_join') {
          const bieonId = parts[1];
          const openJoin = typeof payload === 'object' && payload !== null ? payload : {};
          const duration = Number(openJoin.duration) || 30;
          setOpenJoinSession(bieonId, {
            duration,
            hubId: openJoin.hub_id || openJoin.hubId || null,
            requestedBy: openJoin.requested_by || openJoin.requestedBy || null,
            hubOnly: Boolean(openJoin.mode === 'add_hub_node' || openJoin.hub_only || openJoin.hubOnly || openJoin.filter === 'hub_node_only')
          });
          console.log('[JOIN] admin/open_join received:', { bieonId, topic, payload: openJoin });
          if (ioInstance) {
            ioInstance.emit('join_state', {
              bieonId,
              topic,
              payload: openJoin,
              state: 'open'
            });
          }
          return;
        }

        const eventsIndex = parts.indexOf('events');
        if (eventsIndex >= 2 && parts[eventsIndex + 1] === 'registration') {
          const bieonId = parts[1];
          const registrationEvent = typeof payload === 'object' && payload !== null ? payload : { state: String(payload) };
          const registrationState = String(registrationEvent.state || registrationEvent.status || registrationEvent.event || registrationEvent.type || 'active').toLowerCase();
          const duration = Number(registrationEvent.duration || registrationEvent.timeout || registrationEvent.timeout_s || 90) || 90;
          const sessionId = String(registrationEvent.session_id || registrationEvent.sessionId || registrationEvent.registration_session_id || registrationEvent.registrationSessionId || `reg_${bieonId}`);
          const isClosed = ['close', 'closed', 'stop', 'stopped', 'off', 'inactive', 'end', 'ended', 'cancel', 'cancelled', 'complete', 'completed'].includes(registrationState);

          if (isClosed) {
            clearRemoteRegistrationSession(bieonId);
          } else {
            setRemoteRegistrationSession(bieonId, {
              duration,
              sessionId,
              requestedBy: registrationEvent.requested_by || registrationEvent.requestedBy || null,
              sourceTopic: topic,
              state: registrationState,
              active: true
            });
          }

          const liveState = {
            bieonId,
            topic,
            sessionId,
            state: isClosed ? 'closed' : registrationState,
            active: !isClosed,
            duration,
            payload: registrationEvent,
            requestedBy: registrationEvent.requested_by || registrationEvent.requestedBy || null,
            sourceTopic: topic,
            updatedAt: Date.now()
          };

          console.log('[REMOTE] registration event received:', liveState);
          if (ioInstance) {
            ioInstance.emit('remote_registration_state', liveState);
          }
          return;
        }

        if (eventsIndex >= 2 && parts[eventsIndex + 1] === 'bit_registration_announce') {
          const bieonId = parts[1];
          const registrationSession = getRemoteRegistrationSession(bieonId);
          const catalogItem = await persistRemoteRawBitCatalog(bieonId, topic, payload);
          const announcePayload = {
            bieonId,
            topic,
            sessionId: (typeof payload === 'object' && payload !== null && (payload.session_id || payload.sessionId || payload.registration_session_id || payload.registrationSessionId)) || registrationSession?.sessionId || null,
            activeSession: Boolean(registrationSession),
            payload,
            catalogItem,
            receivedAt: Date.now()
          };

          console.log('[REMOTE] bit registration announce received:', {
            bieonId,
            sessionId: announcePayload.sessionId,
            signature: catalogItem?.rawSignature,
            rawBit: catalogItem?.rawBitText
          });

          if (ioInstance) {
            ioInstance.emit('remote_bit_catalog_updated', announcePayload);
            ioInstance.emit('remote_bit_registration', announcePayload);
          }
          return;
        }

        // Handle system log from ESP-B: bieon/{bieonId}/log/system
        if (parts.length >= 4 && parts[2] === 'log' && parts[3] === 'system') {
          const bieonId = parts[1];
          const rawSystemLog = typeof payload === 'object' && payload !== null ? payload : { message: String(payload) };
          const normalizedTs = Number(rawSystemLog.ts || rawSystemLog.timestamp || Date.now());
          const systemLog = {
            ...rawSystemLog,
            type: String(rawSystemLog.type || rawSystemLog.event || rawSystemLog.status || 'system_event'),
            event: String(rawSystemLog.event || rawSystemLog.type || rawSystemLog.status || 'system_event'),
            message: String(rawSystemLog.message || rawSystemLog.detail || rawSystemLog.type || rawSystemLog.event || 'system event'),
            ts: Number.isFinite(normalizedTs) ? normalizedTs : Date.now()
          };
          const eventType = String(systemLog.type || systemLog.event || systemLog.status || 'system_event').toLowerCase();

          if (eventType.includes('zigbee_permit_') || eventType.includes('permit_join')) {
            if (eventType.includes('close')) {
              clearOpenJoinSession(bieonId);
            }
          }

          console.log('[SYSTEM] log/system received:', { bieonId, topic, payload: systemLog });
          try {
            await SystemLog.create({
              bieonId,
              topic,
              eventType,
              payload: systemLog
            });
          } catch (logErr) {
            console.warn('[SYSTEM] Failed to persist system log:', logErr && logErr.message ? logErr.message : logErr);
          }
          if (ioInstance) {
            ioInstance.emit('system_log', {
              bieonId,
              topic,
              payload: systemLog
            });
          }
          return;
        }

        // Handle Zigbee telemetry forwarded by ESP-B:
        // bieon/{bieonId}/hub/{hubId}/zigbee_devices/{deviceIeee}/telemetry
        if (parts.length >= 7 && parts[2] === 'hub' && parts[4] === 'zigbee_devices' && parts[6] === 'telemetry') {
          const bieonId = parts[1];
          const hubId = parts[3];
          const topicDeviceIeee = String(parts[5] || '').replace(/[:\-\s]/g, '').toUpperCase();
          const payloadObj = (typeof payload === 'object' && payload !== null) ? payload : { value: payload };
          const payloadDeviceIeee = String(payloadObj.device_ieee || payloadObj.ieee || '').replace(/[:\-\s]/g, '').toUpperCase();
          const deviceIeee = payloadDeviceIeee || topicDeviceIeee;

          const telemetryUpdate = {
            lastSeen: new Date(),
            status: 'Active',
            lifecycleState: 'AUTHORIZED'
          };

          const cluster = String(payloadObj.cluster || '').toLowerCase();
          const attr = String(payloadObj.attr || '').toLowerCase();
          const numericValue = Number(payloadObj.value);
          const hasNumericValue = Number.isFinite(numericValue);

          if (cluster.includes('temp') && hasNumericValue) {
            telemetryUpdate['currentValues.temperature'] = numericValue;
          } else if (cluster.includes('humid') && hasNumericValue) {
            telemetryUpdate['currentValues.humidity'] = numericValue;
          } else if (cluster.includes('on_off')) {
            const onOff = String(payloadObj.value).toLowerCase();
            telemetryUpdate.status = (onOff === '1' || onOff === 'true' || onOff === 'on') ? '1' : '0';
          }

          // Try to persist telemetry and emit a normalized device_telemetry payload.
          // Normalize by resolving DB `_id` when possible so frontend can match reliably.
          let emitPayload = {
            bieonId,
            hubId,
            ieee: deviceIeee || undefined,
            cluster: payloadObj.cluster,
            attr: payloadObj.attr,
            value: payloadObj.value,
            unit: payloadObj.unit,
            raw: payloadObj
          };

          if (deviceIeee) {
            try {
              const query = {
                bieonId,
                $or: [
                  { device_ieee: deviceIeee },
                  { device_ieee: deviceIeee.toLowerCase() }
                ]
              };
              const existing = await KendaliPerangkat.findOne(query).lean();
              if (existing) {
                // Update and return the updated device so we can emit canonical fields
                try {
                  const updatedDevice = await KendaliPerangkat.findByIdAndUpdate(existing._id, { $set: telemetryUpdate }, { new: true });
                  if (updatedDevice) {
                    emitPayload = {
                      _id: updatedDevice._id,
                      bieonId,
                      hubId,
                      ieee: updatedDevice.device_ieee || deviceIeee || undefined,
                      model: updatedDevice.modelId || updatedDevice.type || updatedDevice.model || undefined,
                      manufacturer: updatedDevice.manufacturer || undefined,
                      currentValues: updatedDevice.currentValues,
                      battery: updatedDevice.battery,
                      status: String(updatedDevice.status),
                      raw: payloadObj
                    };
                  }
                } catch (e) {
                  // If update-with-return fails, fall back to emitting at least an identifier and the raw payload
                  emitPayload = { ...emitPayload, _id: existing._id };
                }
              }
            } catch (err) {
              console.warn('[MQTT][ZIGBEE] Failed to persist zigbee telemetry:', err && err.message ? err.message : err);
            }
          }

          if (ioInstance) {
            ioInstance.emit('device_telemetry', emitPayload);
          }

          return;
        }

        // Handle PDM telemetry from firmware:
        // bieon/{bieonId}/energi/pdm/telemetry
        // bieon/{bieonId}/hub/{hubId}/energi/pdm/telemetry
        if ((parts.length === 5 && parts[2] === 'energi' && parts[3] === 'pdm' && parts[4] === 'telemetry') ||
            (parts.length === 7 && parts[2] === 'hub' && parts[4] === 'energi' && parts[5] === 'pdm' && parts[6] === 'telemetry')) {
          const bieonId = parts[1];

          // If firmware accidentally forwarded Zigbee device telemetry into the PDM
          // topic (common when UART frames are concatenated/misrouted), detect
          // by presence of `device_ieee`/`ieee`/type==='telemetry' and reroute
          // to internal `device_telemetry` emit instead of treating as PDM.
          if (typeof payload === 'object' && payload !== null) {
            const hasIeee = Boolean(payload.device_ieee || payload.ieee || payload.device_ieee_raw);
            const looksLikeZigbeeTelemetry = hasIeee || String(payload.type || '').toLowerCase() === 'telemetry' && (payload.device_id || payload.device_ieee || payload.ieee);
            if (looksLikeZigbeeTelemetry) {
              try {
                console.log(`[MQTT][PDM] Rerouting Zigbee telemetry found in PDM topic for ${bieonId}`);
                if (ioInstance) {
                  ioInstance.emit('device_telemetry', {
                    _id: payload._id || undefined,
                    device_ieee: (payload.device_ieee || payload.ieee || payload.device_ieee_raw || '').replace(/[:\-\s]/g, '').toUpperCase(),
                    model: payload.model || payload.type || undefined,
                    manufacturer: payload.manufacturer || undefined,
                    currentValues: payload.currentValues || payload.data || undefined,
                    status: payload.status !== undefined ? String(payload.status) : undefined,
                    raw: payload
                  });
                }
                // Also publish to device-facing zigbee telemetry topic so other
                // consumers (including ESP tooling) see it in expected location.
                try {
                  // resolve hubId from payload or fallback to DB lookup
                  let hubId = payload.hubId || payload.hub_id || payload.hub || payload.hubnode || null;
                  if (!hubId) {
                    const hubRec = await Hub.findOne({ bieonId }).lean();
                    hubId = hubRec?._id || hubRec?.id || hubRec?.hubId || hubRec?.name || null;
                  }
                  if (!hubId) hubId = 'hubnode_001';

                  const routedIeee = String(payload.device_ieee || payload.ieee || payload.device_ieee_raw || '').replace(/[:\-\s]/g, '').toUpperCase() || 'UNKNOWN';
                  const deviceTopic = `bieon/${bieonId}/hub/${hubId}/zigbee_devices/${routedIeee}/telemetry`;
                  const publishPayload = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
                  if (mqttClient) {
                    // Use publishCommand to ensure topic normalization and consistent publishes
                    publishCommand(deviceTopic, publishPayload);
                    // small metric: count misroutes
                    if (!global.__misroutedTelemetryCount) global.__misroutedTelemetryCount = new Map();
                    const cntKey = String(bieonId);
                    const prev = global.__misroutedTelemetryCount.get(cntKey) || 0;
                    global.__misroutedTelemetryCount.set(cntKey, prev + 1);
                    console.log(`[MQTT][PDM] Published rerouted zigbee telemetry to ${deviceTopic} (total rerouted for ${bieonId}=${prev+1})`);
                  }
                } catch (e) {
                  console.warn('[MQTT][PDM] Failed to publish rerouted zigbee telemetry to device topic:', e && e.message ? e.message : e);
                }
              } catch (e) {
                console.warn('[MQTT][PDM] Failed to reroute zigbee telemetry:', e && e.message ? e.message : e);
              }
              return;
            }
          }

          // Permit join status is not PDM telemetry. Some firmware versions incorrectly
          // publish join-state events to the PDM topic, so route them away here.
          if (typeof payload === 'object' && payload !== null) {
            const eventType = String(payload.type || payload.event || payload.status || '').toLowerCase();
            if (eventType.includes('zigbee_permit_') || eventType.includes('permit_join')) {
              // Debounce duplicate permit events coming rapidly from firmware
              if (!global.__lastPermitEvent) global.__lastPermitEvent = new Map();
              const lastPermitMap = global.__lastPermitEvent;
              const pKey = String(bieonId);
              const payloadStr = JSON.stringify(payload);
              const now = Date.now();
              const last = lastPermitMap.get(pKey);
              if (last && last.payload === payloadStr && (now - last.ts) < 2000) {
                // ignore duplicate within 2s
                return;
              }
              lastPermitMap.set(pKey, { payload: payloadStr, ts: now });

              console.log(`[MQTT][JOIN] Received permit event on PDM topic for ${bieonId}:`, payload);
              if (eventType.includes('close')) {
                clearOpenJoinSession(bieonId);
              }
              if (ioInstance) {
                ioInstance.emit('join_state', {
                  bieonId,
                  topic,
                  payload,
                  state: eventType.includes('close') ? 'closed' : 'open'
                });
              }
              return;
            }
          }

          const asNumber = (value, fallback = 0) => {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : fallback;
          };

          const voltage = asNumber(payload?.V ?? payload?.voltage ?? payload?.volt, 0);
          const current = asNumber(payload?.I ?? payload?.current, 0);
          const activePower = asNumber(payload?.AP ?? payload?.APP ?? payload?.currentLoad ?? payload?.power, 0);
          const pf = payload?.PF !== undefined ? asNumber(payload.PF, undefined) : undefined;
          const ae = payload?.AE !== undefined ? asNumber(payload.AE, undefined) : undefined;

          try {
            const bieonRegex = buildFlexibleBieonIdRegex(bieonId);
            let pdm = bieonRegex ? await PdmMeter.findOne({ bieonId: bieonRegex }) : null;
            if (!pdm) {
              const bieonSystem = bieonRegex ? await BieonSystem.findOne({ bieonId: bieonRegex }).select('owner') : null;
              pdm = await PdmMeter.create({
                name: `PDM ${bieonId}`,
                bieonId,
                owner: bieonSystem?.owner,
                isSystemMeter: true,
                status: 'Active',
                currentValues: {
                  currentLoad: activePower,
                  energyToday: ae || 0,
                  lastEnergyReading: ae || 0
                }
              });
            }

            const updates = {
              'currentValues.currentLoad': activePower,
              lastSeen: new Date(),
              status: 'Active'
            };
            if (ae !== undefined) {
              updates['currentValues.energyToday'] = ae;
            }

            const bieonSystem = bieonRegex ? await BieonSystem.findOne({ bieonId: bieonRegex }).select('owner') : null;
            if (bieonSystem?.owner && !pdm.owner) {
              updates.owner = bieonSystem.owner;
            }

            const updatedPdm = await PdmMeter.findByIdAndUpdate(pdm._id, { $set: updates }, { new: true });

            if (updatedPdm && ioInstance) {
              ioInstance.emit('device_telemetry', {
                _id: updatedPdm._id,
                currentValues: updatedPdm.currentValues,
                status: updatedPdm.status || 'Active'
              });
            }

            if (ae !== undefined && updatedPdm) {
              const prevEnergy = updatedPdm.currentValues?.lastEnergyReading || 0;
              let deltaKwh = Math.max(0, ae - prevEnergy);
              if (ae < prevEnergy) deltaKwh = ae;

              if (deltaKwh > 0) {
                await new EnergyLog({
                  device: updatedPdm._id,
                  hub: undefined,
                  date: new Date(),
                  totalKwh: deltaKwh,
                  power: activePower,
                  voltage,
                  current,
                  pf,
                  owner: updatedPdm.owner || bieonSystem?.owner
                }).save();

                await PdmMeter.findByIdAndUpdate(updatedPdm._id, {
                  $set: {
                    'currentValues.lastEnergyReading': ae,
                    'currentValues.energyToday': ae
                  }
                });
              }
            }
          } catch (err) {
            console.error('[MQTT][PDM] Error handling PDM telemetry:', err.message);
          }

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
        ieee: updatedDevice.device_ieee || undefined,
        model: updatedDevice.modelId || updatedDevice.type || updatedDevice.model || undefined,
        manufacturer: updatedDevice.manufacturer || undefined,
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
            const deviceIdentifier = String(act.device_ieee || act.modelId || act.name || '').replace(/[:\-\s]/g, '').toUpperCase();
            const newStatus = isMet ? '1' : '0';
            
            if (String(act.status) !== newStatus) {
              console.log(`[Automation] ${act.name} (IEEE: ${deviceIdentifier}) -> ${newStatus === '1' ? 'ON' : 'OFF'}`);
              publishCommand(`bieon/${act.bieonId}/admin/command`, {
                action: newStatus === '1' ? 'on' : 'off',
                bieon_id: act.bieonId,
                ieee: deviceIdentifier,
                command_id: `cmd_${Date.now()}`,
                requested_by: 'automation',
                timestamp: Date.now()
              });
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
      const { device_ieee, device_name, device_profile: reqProfile, model_id: reqModel, manufacturer, model } = device;
      if (!device_ieee) continue;

      const last4Mac = device_ieee ? device_ieee.replace(/:/g, '').slice(-4).toUpperCase() : '0000';
      const currentTs = Math.floor(Date.now() / 1000);
      const hub_ieee = payload.hub_ieee || masterId;

      // Cek di whitelist db berdasarkan manufacturer dan model
      let whitelistEntry = null;
      
      // Hardware bisa mengirim 'manufacturer' dan 'model' secara langsung
      // Jika tidak ada, fallback ke reqModel jika kebetulan match dengan 'model' di DB (meskipun tanpa manufacturer)
      if (manufacturer && model) {
          whitelistEntry = await DeviceWhitelist.findOne({
            manufacturer: manufacturer,
            model: model
          });
      } else if (model || reqModel) {
          whitelistEntry = await DeviceWhitelist.findOne({
            model: model || reqModel
          });
      }

      let decision = 'block';
      let responseObj = {
        type: "auth_response",
        master_ieee: masterId,
        device_ieee: device_ieee,
        ts: currentTs
      };

      if (whitelistEntry) {
        decision = 'allow';
        const profile = reqProfile || model || reqModel || 'UNKNOWN';
        
        console.log(`[Auth Decision] Allow for ${device_ieee} (Model: ${whitelistEntry.model})`);
        responseObj = {
          ...responseObj,
          decision: "allow",
          device_id: device_name || reqModel || "unknown",
          device_name: device_name || "Unknown",
          device_profile: profile,
          model_id: whitelistEntry.model || reqModel || "UNKNOWN",
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
const handleHierarchicalAuth = async () => {
    console.warn('[MQTT] hierarchical auth flow disabled by topic policy');
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
    const canonicalBieonId = normalizeBieonId(bieonId) || bieonId;
    let system = await findOneByBieonId(BieonSystem, bieonId);
    if (!system) {
        console.log(`[DEBUG] ➕ BieonSystem ${bieonId} NOT FOUND. Creating now...`);
        try {
            const newSystem = new BieonSystem({
                bieonId: canonicalBieonId,
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
        ieee: updatedDevice.device_ieee || undefined,
        model: updatedDevice.modelId || updatedDevice.type || updatedDevice.model || undefined,
        manufacturer: updatedDevice.manufacturer || undefined,
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

const publishOpenJoin = (bieonDeviceId, duration = 30, meta = {}) => {
  if (!bieonDeviceId) return;
  if (!mqttClient) return;
  const existingSession = getOpenJoinSession(bieonDeviceId);
  if (existingSession) {
    console.log(`[MQTT] skip duplicate open_join for ${bieonDeviceId}; session already active`);
    return false;
  }
  const topic = `bieon/${bieonDeviceId}/admin/open_join`;
  const payload = {
    command: 'open_permit_join',
    duration,
    ...(meta.hubId ? { hub_id: meta.hubId } : {}),
    ...(meta.requestedBy ? { requested_by: meta.requestedBy } : {})
  };
  setOpenJoinSession(bieonDeviceId, {
    duration,
    hubId: meta.hubId || null,
    requestedBy: meta.requestedBy || null
  });
  console.log(`[MQTT] publish open_join -> ${topic}`, payload);
  publishCommand(topic, payload);
  return true;
};

const publishRemoteRegistration = (bieonDeviceId, duration = 90, meta = {}) => {
  if (!bieonDeviceId) return false;
  if (!mqttClient) return false;
  const normalizedBieonId = String(bieonDeviceId).toLowerCase();
  const existingSession = getRemoteRegistrationSession(normalizedBieonId);
  if (existingSession) {
    console.log(`[MQTT] skip duplicate remote_registration for ${normalizedBieonId}; session already active`);
    return false;
  }

  const topic = `bieon/${normalizedBieonId}/admin/registration`;
  const payload = {
    command: 'remote_registration',
    mode: 'remote_registration',
    duration,
    source: meta.source || 'api',
    requested_by: meta.requestedBy || meta.requested_by || 'api',
    session_id: meta.sessionId || `reg_${Date.now()}`,
    ...(meta.remoteId ? { remote_id: meta.remoteId } : {}),
    ...(meta.remoteIeee ? { remote_ieee: meta.remoteIeee } : {}),
    ...(meta.hubId ? { hub_id: meta.hubId } : {})
  };

  setRemoteRegistrationSession(normalizedBieonId, {
    duration,
    requestedBy: payload.requested_by,
    sessionId: payload.session_id,
    sourceTopic: topic,
    state: 'requested',
    active: true
  });

  console.log(`[MQTT] publish remote_registration -> ${topic}`, payload);
  publishCommand(topic, payload);
  return true;
};

const publishCommand = (topic, payload, options = { qos: 1 }) => {
  if (!mqttClient) return false;
  // normalize bieon id in topic (if present) to lowercase
  try {
    if (typeof topic === 'string' && topic.startsWith('bieon/')) {
      const parts = topic.split('/');
      if (parts.length > 1) parts[1] = String(parts[1] || '').toLowerCase();
      topic = parts.join('/');
    }
  } catch (e) {
    // ignore normalization errors and proceed with original topic
  }
  const message = typeof payload === 'object' ? JSON.stringify(payload, null, 2) : String(payload);
  mqttClient.publish(topic, message, options);
  return true;
};

const publishHierarchicalCommand = (tenantId, bieonId, hubId, deviceId, command, params) => {
    const payload = {
        command_id: `cmd_${Date.now()}`,
        timestamp: Date.now(),
        command: command,
        parameters: params
    };
    // IMPORTANT: Do NOT publish hierarchical tenant topics to the device-facing MQTT broker.
    // Emit internally (Socket.IO) for internal consumers instead.
    try {
      if (ioInstance) {
        ioInstance.emit('hierarchical_command', {
          tenantId,
          bieonId,
          hubId,
          deviceId,
          payload
        });
        console.log('[MQTT] Emitted hierarchical_command internally (not published to broker):', {
          tenantId,
          bieonId,
          hubId,
          deviceId
        });
      } else {
        console.log('[MQTT] No ioInstance available — hierarchical command generated but not published to broker:', {
          tenantId,
          bieonId,
          hubId,
          deviceId
        });
      }
    } catch (err) {
      console.warn('[MQTT] Failed to emit hierarchical command internally:', err && err.message ? err.message : err);
    }

    // Also publish to ESP-B admin command topic (device-facing) so hardware receives the command.
    try {
      const adminTopic = `bieon/${String(bieonId || '').toLowerCase()}/admin/command`;
      const adminPayload = {
        command: command,
        params: params,
        device_id: deviceId,
        command_id: payload.command_id,
        timestamp: payload.timestamp
      };
      publishCommand(adminTopic, adminPayload);
      console.log(`[MQTT] Published admin command to ${adminTopic}`);
    } catch (err) {
      console.warn('[MQTT] Failed to publish hierarchical admin command to ESP-B topic:', err && err.message ? err.message : err);
    }
};

/**
 * Instruct gateway to request a Zigbee leave for a device (or hub).
 * Publishes to `bieon/{bieonId}/admin/leave` which ESP-B forwards to ESP-A UART.
 * Options: { remove_children: bool, rejoin: bool, requested_by: string, reason: string }
 */
const publishLeave = (bieonDeviceId, deviceIeee, options = {}) => {
  if (!bieonDeviceId || (!deviceIeee && !options.short_addr)) return false;
  if (!mqttClient) return false;
  const topic = `bieon/${String(bieonDeviceId).toLowerCase()}/admin/leave`;
  const payload = {
    command: 'leave_device',
    device_ieee: deviceIeee || undefined,
    short_addr: options.short_addr || undefined,
    remove_children: options.remove_children === undefined ? 1 : (options.remove_children ? 1 : 0),
    rejoin: options.rejoin ? 1 : 0,
    requested_by: options.requested_by || 'api',
    reason: options.reason || 'requested_from_ui'
  };
  publishCommand(topic, payload);
  console.log(`[MQTT] publish leave -> ${topic}`, payload);
  return true;
};

module.exports = { connectMQTT, publishCommand, publishHierarchicalCommand, publishOpenJoin, publishRemoteRegistration, publishLeave };
