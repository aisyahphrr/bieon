const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bieon';

async function query() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at', mongoUri);

    const KendaliPerangkat = mongoose.model('KendaliPerangkat', new mongoose.Schema({}, { strict: false }), 'kendaliperangkats');
    const SystemLog = mongoose.model('SystemLog', new mongoose.Schema({}, { strict: false }), 'systemlogs');

    console.log('\n--- Searching for Bluecheck Device ---');
    const devices = await KendaliPerangkat.find({ 
      $or: [
        { name: /bluecheck/i },
        { type: /bluecheck/i },
        { modelId: /bluecheck/i },
        { device_ieee: /404ccafffe57a8ec/i }
      ]
    }).lean();

    console.log(`Found ${devices.length} devices matching search criteria:`);
    devices.forEach(d => {
      console.log({
        _id: d._id,
        name: d.name,
        device_ieee: d.device_ieee,
        modelId: d.modelId,
        type: d.type,
        status: d.status,
        currentValues: d.currentValues,
        lastSeen: d.lastSeen
      });
    });

    console.log('\n--- Searching for System Logs ---');
    const logs = await SystemLog.find({
      topic: /telemetry/i
    }).sort({ _id: -1 }).limit(10).lean();

    console.log(`Found ${logs.length} system logs:`);
    logs.forEach(l => {
      console.log({
        timestamp: l.createdAt || l._id.getTimestamp(),
        topic: l.topic,
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
