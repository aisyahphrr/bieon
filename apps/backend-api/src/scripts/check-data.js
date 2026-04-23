const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Hub = require('../models/Hub');

const checkData = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bieon';
        await mongoose.connect(mongoUri);
        console.log('--- AUDIT DATA BIEON ---');

        const homeowners = await User.find({ role: 'Homeowner' }).select('fullName email bieonId role');
        console.log(`Total Homeowners: ${homeowners.length}`);
        homeowners.forEach(h => {
            console.log(`- Name: ${h.fullName}, Email: ${h.email}, BieonID: ${h.bieonId}`);
        });

        if (homeowners.length > 0) {
            const firstId = homeowners[0]._id;
            const hubs = await Hub.find({ owner: firstId });
            console.log(`\nHubs for ${homeowners[0].fullName}: ${hubs.length}`);
            hubs.forEach(hb => console.log(`  - Hub Name: ${hb.name}, BieonID: ${hb.bieonId}`));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
