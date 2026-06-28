const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend-api
dotenv.config({ path: path.join(__dirname, 'apps/backend-api/.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bieon';

async function query() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at', mongoUri);

    // 1. Print all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));

    const KendaliPerangkat = mongoose.model('KendaliPerangkat', new mongoose.Schema({}, { strict: false }), 'kendaliperangkat');
    const SensorData = mongoose.model('SensorData', new mongoose.Schema({}, { strict: false }), 'sensordatas');
    const SystemLog = mongoose.model('SystemLog', new mongoose.Schema({}, { strict: false }), 'systemlogs');
    
    // Print all devices
    console.log('\n--- Printing all devices ---');
    const allDevices = await KendaliPerangkat.find({}).lean();
    console.log(`Found ${allDevices.length} total devices:`);
    allDevices.forEach(d => {
      console.log({
        _id: d._id,
        name: d.name,
        device_ieee: d.device_ieee,
        bieonId: d.bieonId,
        tenantId: d.tenantId,
        status: d.status,
        currentValues: d.currentValues,
        lastSeen: d.lastSeen
      });
    });

    console.log('\n--- Searching for latest temperature records in sensordatas ---');
    const logs = await SensorData.find({
      topic: /suhu/i
    }).sort({ timestamp: -1 }).limit(10).lean();

    console.log(`Found ${logs.length} temperature records:`);
    logs.forEach(l => {
      console.log({
        timestamp: l.timestamp || l.createdAt,
        topic: l.topic,
        value: l.value
      });
    });

    console.log('\n--- Searching for latest TDS records in sensordatas ---');
    const tdsLogs = await SensorData.find({
      topic: /tds/i
    }).sort({ timestamp: -1 }).limit(10).lean();

    console.log(`Found ${tdsLogs.length} TDS records:`);
    tdsLogs.forEach(l => {
      console.log({
        timestamp: l.timestamp || l.createdAt,
        topic: l.topic,
        value: l.value
      });
    });

    console.log('\n--- Searching for latest pH records in sensordatas ---');
    const phLogs = await SensorData.find({
      topic: /ph/i
    }).sort({ timestamp: -1 }).limit(10).lean();

    console.log(`Found ${phLogs.length} pH records:`);
    phLogs.forEach(l => {
      console.log({
        timestamp: l.timestamp || l.createdAt,
        topic: l.topic,
        value: l.value
      });
    });

    console.log('\n--- Searching for latest SystemLog records ---');
    const sysLogs = await SystemLog.find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    console.log(`Found ${sysLogs.length} SystemLog records:`);
    sysLogs.forEach(l => {
      console.log({
        timestamp: l.timestamp || l.createdAt,
        eventType: l.eventType,
        payload: l.payload
      });
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

query();
