/**
 * Socket.IO Event Emitter Module
 * Centralized place for emitting real-time events from controllers
 */

const { 
  getSocket, 
  emitDeviceTelemetry, 
  emitNewUnassignedDevice, 
  emitDeviceStatusUpdate 
} = require('../config/socket');

/**
 * Emit device telemetry update
 * Called when device data/status changes
 */
function broadcastDeviceTelemetry(systemId, device) {
  try {
    emitDeviceTelemetry(systemId, {
      deviceId: device._id,
      name: device.name,
      type: device.type,
      category: device.category,
      location: device.location,
      status: device.status,
      lastSeen: device.lastSeen,
      battery: device.battery,
      signal: device.signal,
      telemetry: device.telemetry || {},
      updatedAt: new Date()
    });
  } catch (err) {
    console.error('Error broadcasting device telemetry:', err);
  }
}

/**
 * Emit new unassigned device
 * Called when a new device is registered without assignment
 */
function broadcastNewDevice(device) {
  try {
    emitNewUnassignedDevice({
      deviceId: device._id,
      name: device.name,
      type: device.type,
      category: device.category,
      status: device.status,
      createdAt: new Date()
    });
  } catch (err) {
    console.error('Error broadcasting new device:', err);
  }
}

/**
 * Emit device status change (on/off, connected/disconnected, etc)
 * Called when device status changes
 */
function broadcastDeviceStatusChange(systemId, deviceId, status) {
  try {
    emitDeviceStatusUpdate(systemId, {
      deviceId,
      status,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error broadcasting device status:', err);
  }
}

/**
 * Broadcast telemetry data from device
 * Called when telemetry data arrives (temp, humidity, etc)
 */
function broadcastTelemetryData(systemId, deviceId, telemetry) {
  try {
    const io = getSocket();
    io.to(`system_${systemId}`).emit('telemetry_data', {
      deviceId,
      data: telemetry,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error broadcasting telemetry data:', err);
  }
}

module.exports = {
  broadcastDeviceTelemetry,
  broadcastNewDevice,
  broadcastDeviceStatusChange,
  broadcastTelemetryData
};
