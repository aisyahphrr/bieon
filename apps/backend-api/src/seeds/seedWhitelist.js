const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DeviceWhitelist = require('../models/DeviceWhitelist');

// Load environment variables
dotenv.config();

const devicesSeedData = [
  { manufacturer: "SONOFF", model: "SNZB-02DR2" },
  { manufacturer: "SONOFF", model: "S60ZBTPF" },
  { manufacturer: "BIEON SMART LIVING MONITORING", model: "BLUECHECK" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bieon');
        console.log('✅ Connected to MongoDB for seeding DeviceWhitelist');

        // Clear existing whitelist since schema completely changed
        await DeviceWhitelist.deleteMany({});
        console.log('🗑️ Cleared existing DeviceWhitelist data');
        
        // Drop old indexes to prevent duplicate key errors on old unique fields
        try {
            await DeviceWhitelist.collection.dropIndexes();
            console.log('🗑️ Dropped old indexes');
        } catch (idxErr) {
            console.log('⚠️ Could not drop indexes (maybe none exist):', idxErr.message);
        }

        for (const device of devicesSeedData) {
            await DeviceWhitelist.findOneAndUpdate(
                { manufacturer: device.manufacturer, model: device.model },
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
