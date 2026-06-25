const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const EnvironmentLog = require('../src/models/EnvironmentLog');
const WaterQualityLog = require('../src/models/WaterQualityLog');
const Hub = require('../src/models/Hub');
const KendaliPerangkat = require('../src/models/KendaliPerangkat');

const OWNER_ID = new mongoose.Types.ObjectId('6a0e8c9f04efcb00eeb794af'); // jul
const HUB_ID = new mongoose.Types.ObjectId('6a0162aa6ec2cd955177019c'); // Hub Node 001

async function runMigration() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Ensure Hub exists
    let hub = await Hub.findById(HUB_ID);
    if (!hub) {
      console.log('Hub Node 001 not found, creating it...');
      hub = await Hub.create({
        _id: HUB_ID,
        name: 'Hub Node 001',
        bieonId: 'BIEON_001',
        device_ieee: '0000000000000001',
        owner: OWNER_ID,
        status: 'Online'
      });
    }

    // 2. Ensure Devices exist so they are properly registered in system
    let sensor01 = await KendaliPerangkat.findOne({ name: 'sensor_01' });
    if (!sensor01) {
      console.log('Creating mock device sensor_01...');
      sensor01 = await KendaliPerangkat.create({
        name: 'sensor_01',
        location: 'Ruang Tamu',
        notes: 'Sensor Kenyamanan Utama',
        hubId: HUB_ID,
        category: 'Sensor',
        type: 'Sensor Kenyamanan',
        status: 'Active',
        lifecycleState: 'AUTHORIZED',
        isAuthorized: true,
        bieonId: 'BIEON_001',
        device_ieee: 'SENSOR01IEEE',
        currentValues: { temperature: 27, humidity: 60 },
        owner: OWNER_ID
      });
    }

    let sensorAir01 = await KendaliPerangkat.findOne({ name: 'sensor_air_01' });
    if (!sensorAir01) {
      console.log('Creating mock device sensor_air_01...');
      sensorAir01 = await KendaliPerangkat.create({
        name: 'sensor_air_01',
        location: 'Kamar Mandi',
        notes: 'Sensor Kualitas Air Utama',
        hubId: HUB_ID,
        category: 'Sensor',
        type: 'Sensor Kualitas Air',
        status: 'Active',
        lifecycleState: 'AUTHORIZED',
        isAuthorized: true,
        bieonId: 'BIEON_001',
        device_ieee: 'SENSORAIR01IEEE',
        currentValues: { ph: 7.2, tds: 150, turbidity: 5, waterTemp: 26 },
        owner: OWNER_ID
      });
    }

    // 3. Clear existing log entries for this hub to prevent duplication
    console.log('🧹 Clearing old EnvironmentLog and WaterQualityLog entries...');
    await EnvironmentLog.deleteMany({ hub: HUB_ID });
    await WaterQualityLog.deleteMany({ hub: HUB_ID });

    // 4. Fetch all raw sensordatas
    console.log('📥 Fetching all raw telemetry data from sensordatas...');
    const rawData = await mongoose.connection.db.collection('sensordatas').find({}).toArray();
    console.log(`Found ${rawData.length} total documents in sensordatas.`);

    // 5. Group by 10-minute buckets
    console.log('🧠 Grouping and aggregating data into 10-minute intervals...');
    
    // Buckets for Environment (sensor_01)
    // key: bucket timestamp
    const envBuckets = {};

    // Buckets for Water Quality (sensor_air_01)
    // key: bucket timestamp
    const waterBuckets = {};

    rawData.forEach(doc => {
      const topic = String(doc.topic || '').toLowerCase();
      const val = Number(doc.value);
      if (isNaN(val)) return;

      const dateObj = new Date(doc.timestamp || doc.createdAt || doc._id.getTimestamp());
      // Bucket to 10-minute boundaries
      const bucketTime = Math.floor(dateObj.getTime() / (10 * 60 * 1000)) * (10 * 60 * 1000);

      // A. Comfort sensor_01
      if (topic.includes('sensor_01/')) {
        if (!envBuckets[bucketTime]) {
          envBuckets[bucketTime] = { temps: [], hums: [] };
        }
        if (topic.includes('suhu')) {
          envBuckets[bucketTime].temps.push(val);
        } else if (topic.includes('kelembapan')) {
          envBuckets[bucketTime].hums.push(val);
        }
      }
      
      // B. Water sensor_air_01
      else if (topic.includes('sensor_air_01/')) {
        if (!waterBuckets[bucketTime]) {
          waterBuckets[bucketTime] = { phs: [], tdss: [], turbidities: [], temps: [] };
        }
        if (topic.includes('ph')) {
          waterBuckets[bucketTime].phs.push(val);
        } else if (topic.includes('tds')) {
          waterBuckets[bucketTime].tdss.push(val);
        } else if (topic.includes('turbidity')) {
          waterBuckets[bucketTime].turbidities.push(val);
        } else if (topic.includes('suhu')) {
          waterBuckets[bucketTime].temps.push(val);
        }
      }
    });

    // 6. Calculate averages and create EnvironmentLog documents
    const envLogsToInsert = [];
    Object.keys(envBuckets).forEach(timestampStr => {
      const ts = Number(timestampStr);
      const data = envBuckets[ts];
      
      // Skip if both are empty
      if (data.temps.length === 0 && data.hums.length === 0) return;

      const avgTemp = data.temps.length > 0 
        ? parseFloat((data.temps.reduce((a, b) => a + b, 0) / data.temps.length).toFixed(1)) 
        : 26.5; // fallback standard

      const avgHumVal = data.hums.length > 0 
        ? Math.round(data.hums.reduce((a, b) => a + b, 0) / data.hums.length) 
        : 60; // fallback standard

      envLogsToInsert.push({
        hub: HUB_ID,
        date: new Date(ts),
        avgTemperature: avgTemp,
        avgHumidity: avgHumVal + '%',
        room: 'Ruang Tamu',
        status: (avgTemp > 30 || avgTemp < 18) ? 'Tidak Nyaman' : 'Nyaman',
        owner: OWNER_ID
      });
    });

    // 7. Calculate averages and create WaterQualityLog documents
    const waterLogsToInsert = [];
    Object.keys(waterBuckets).forEach(timestampStr => {
      const ts = Number(timestampStr);
      const data = waterBuckets[ts];

      if (data.phs.length === 0 && data.tdss.length === 0 && data.turbidities.length === 0 && data.temps.length === 0) return;

      const avgPh = data.phs.length > 0
        ? parseFloat((data.phs.reduce((a, b) => a + b, 0) / data.phs.length).toFixed(2))
        : 7.2;

      const avgTds = data.tdss.length > 0
        ? Math.round(data.tdss.reduce((a, b) => a + b, 0) / data.tdss.length)
        : 150;

      const avgTurbidity = data.turbidities.length > 0
        ? parseFloat((data.turbidities.reduce((a, b) => a + b, 0) / data.turbidities.length).toFixed(1))
        : 5.0;

      const avgTemp = data.temps.length > 0
        ? parseFloat((data.temps.reduce((a, b) => a + b, 0) / data.temps.length).toFixed(1))
        : 26.0;

      waterLogsToInsert.push({
        owner: OWNER_ID,
        device: sensorAir01._id,
        hub: HUB_ID,
        ph: avgPh,
        turbidity: avgTurbidity,
        temperature: avgTemp,
        tds: avgTds,
        status: (avgPh < 6.5 || avgPh > 8.5 || avgTds > 500) ? 'Tidak Layak' : 'Layak Pakai',
        date: new Date(ts)
      });
    });

    console.log(`\nInserting ${envLogsToInsert.length} EnvironmentLogs into MongoDB...`);
    if (envLogsToInsert.length > 0) {
      await EnvironmentLog.insertMany(envLogsToInsert);
      console.log('✅ EnvironmentLogs successfully inserted.');
    }

    console.log(`Inserting ${waterLogsToInsert.length} WaterQualityLogs into MongoDB...`);
    if (waterLogsToInsert.length > 0) {
      await WaterQualityLog.insertMany(waterLogsToInsert);
      console.log('✅ WaterQualityLogs successfully inserted.');
    }

    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log(`- Environment logs created: ${envLogsToInsert.length} (from sensor_01)`);
    console.log(`- Water quality logs created: ${waterLogsToInsert.length} (from sensor_air_01)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration Error:', error);
    process.exit(1);
  }
}

runMigration();
