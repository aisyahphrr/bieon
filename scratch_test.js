const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'apps/backend-api/.env') });
const mongoUri = process.env.MONGODB_URI;

const KendaliPerangkat = require('./apps/backend-api/src/models/KendaliPerangkat');

async function test() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected');
    
    const dev = await KendaliPerangkat.findOne({ device_ieee: '404CCAFFFE57A8EC' });
    if (!dev) {
      console.log('Device not found');
      return;
    }
    console.log('Before update:', dev.currentValues);
    
    const newValues = {
      temperature: 31.81,
      waterTemp: 31.81,
      ph: 7.888,
      turbidity: 150.909,
      tds: 999
    };
    console.log('Updating with:', newValues);
    
    const updated = await KendaliPerangkat.findByIdAndUpdate(
      dev._id,
      { $set: { currentValues: newValues } },
      { new: true }
    );
    
    console.log('After update:', updated.currentValues);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
test();
