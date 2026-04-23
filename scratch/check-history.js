const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
const fs = require('fs');

// Force use of reliable DNS
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const rootDir = 'C:\\Users\\Lenovo\\BIEON_BPJS\\bieon';
const envPath = path.join(rootDir, 'apps/backend-api/.env');
require('dotenv').config({ path: envPath });

const modelsDir = path.join(rootDir, 'apps/backend-api/src/models');

const User = require(path.join(modelsDir, 'User'));
const EnvironmentLog = require(path.join(modelsDir, 'EnvironmentLog'));
const SecurityLog = require(path.join(modelsDir, 'SecurityLog'));
const WaterQualityLog = require(path.join(modelsDir, 'WaterQualityLog'));
const EnergyLog = require(path.join(modelsDir, 'EnergyLog'));
const Activity = require(path.join(modelsDir, 'Activity'));
const Alert = require(path.join(modelsDir, 'Alert'));

async function checkData() {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bieon');
        console.log('Connected!');

        const collections = [
            { name: 'User', model: User },
            { name: 'EnvironmentLog', model: EnvironmentLog },
            { name: 'SecurityLog', model: SecurityLog },
            { name: 'WaterQualityLog', model: WaterQualityLog },
            { name: 'EnergyLog', model: EnergyLog },
            { name: 'ActivityLog', model: Activity },
            { name: 'Alert', model: Alert }
        ];

        console.log('--- Collection Counts ---');
        for (const col of collections) {
            const count = await col.model.countDocuments();
            console.log(`${col.name}: ${count}`);
        }

        const testUser = await User.findOne({ 
            $or: [
                { fullName: /testingakun/i },
                { username: /testingakun/i },
                { email: /testingakun/i }
            ]
        });

        if (testUser) {
            console.log('\n--- Test User Found ---');
            console.log(`ID: ${testUser._id}`);
            console.log(`Name: ${testUser.fullName}`);
            console.log(`Role: ${testUser.role}`);
            
            const userEnv = await EnvironmentLog.countDocuments({ owner: testUser._id });
            console.log(`Environment Logs for this user: ${userEnv}`);
        } else {
            console.log('\nUser "testingakun" NOT FOUND.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkData();
