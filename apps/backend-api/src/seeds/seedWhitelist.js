const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DeviceWhitelist = require('../models/DeviceWhitelist');

// Load environment variables
dotenv.config();

const devicesSeedData = {
  "devices": {
    "A4:C1:38:0D:48:41:FF:FF": {
      "device_id": "plug_01",
      "device_name": "Smart Plug",
      "model_id": "SMART_PLUG",
      "approved": true,
      "reason": "Factory default - sudah embedded di firmware"
    },
    "42:4C:CA:FF:FE:57:8B:5D": {
      "device_id": "water_sensor_01",
      "device_name": "Water Sensor",
      "model_id": "WATER_SENSOR",
      "approved": true,
      "reason": "Factory default - sudah embedded di firmware"
    },
    "A4:C1:38:09:99:A6:FF:FF": {
      "device_id": "th_sensor_01",
      "device_name": "Sensor TH",
      "model_id": "SNZB-02",
      "approved": true,
      "reason": "Factory default - sudah embedded di firmware"
    },
    "42:4C:CA:FF:FE:4D:9C:65": {
      "device_id": "hub_01",
      "device_name": "Hub Node 1",
      "model_id": "HUB_NODE",
      "approved": true,
      "reason": "Default Hub Node"
    },
    "42:4C:CA:FF:FE:51:34:35": {
      "device_id": "master_01",
      "device_name": "Master Zigbee",
      "model_id": "MASTER",
      "approved": true,
      "reason": "Master node"
    }
  }
};

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bieon');
        console.log('✅ Connected to MongoDB for seeding DeviceWhitelist');

        // Prepare array of devices from the object
        const deviceArray = Object.entries(devicesSeedData.devices).map(([ieee, data]) => ({
            device_ieee: ieee,
            device_name: data.device_name,
            model_id: data.model_id,
            device_id: data.device_id,
            approved: data.approved,
            reason: data.reason
        }));

        for (const device of deviceArray) {
            await DeviceWhitelist.findOneAndUpdate(
                { device_ieee: device.device_ieee },
                device,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        console.log('✅ DeviceWhitelist data seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding DeviceWhitelist:', error);
        process.exit(1);
    }
};

seedDB();
