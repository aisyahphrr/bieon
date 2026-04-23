const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../apps/backend-api/.env') });

// Force use of reliable DNS to avoid ECONNREFUSED in certain networks
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const User = require('../apps/backend-api/src/models/User');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');
const Hub = require('../apps/backend-api/src/models/Hub');
const EnergyLog = require('../apps/backend-api/src/models/EnergyLog');
const EnvironmentLog = require('../apps/backend-api/src/models/EnvironmentLog');
const SecurityLog = require('../apps/backend-api/src/models/SecurityLog');
const WaterQualityLog = require('../apps/backend-api/src/models/WaterQualityLog');
const Activity = require('../apps/backend-api/src/models/Activity');
const Alert = require('../apps/backend-api/src/models/Alert');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bieon';
        console.log('Connecting to:', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected!');
    } catch (err) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }
};

const seed = async () => {
    try {
        await connectDB();

        // 1. Find or Create "lagi testingakun"
        let homeowner = await User.findOne({ 
            $or: [
                { fullName: /testingakun/i },
                { username: /testingakun/i },
                { email: /testingakun/i }
            ]
        });

        if (!homeowner) {
            console.log('Creating "lagi testingakun"...');
            homeowner = new User({
                fullName: 'lagi testingakun',
                email: 'testing@bieon.id',
                password: 'password123',
                role: 'Homeowner',
                address: 'Kawasan Industri BPJS, Jakarta',
                systemName: 'Rumah Testing',
                bieonId: 'BIEON-TEST-001'
            });
            await homeowner.save();
        } else {
            console.log('Found user:', homeowner.fullName);
            // Ensure role is Homeowner
            if (homeowner.role !== 'Homeowner') {
                homeowner.role = 'Homeowner';
                await homeowner.save();
            }
        }

        // 2. Ensure Hub exists
        let hub = await Hub.findOne({ owner: homeowner._id });
        if (!hub) {
            console.log('Creating Hub for user...');
            hub = new Hub({
                owner: homeowner._id,
                hubId: 'HUB-TEST-001',
                status: 'online'
            });
            await hub.save();
        }

        // 3. Ensure Devices exist
        let devices = await KendaliPerangkat.find({ owner: homeowner._id });
        if (devices.length === 0) {
            console.log('Creating default devices...');
            const defaultDevices = [
                { name: 'Lampu Utama', type: 'light', room: 'R1 - Ruang Keluarga', status: 'off', owner: homeowner._id },
                { name: 'AC Split', type: 'ac', room: 'R1 - Ruang Keluarga', status: 'off', owner: homeowner._id },
                { name: 'Power Meter', type: 'power-meter', room: 'Panel Listrik', status: 'online', owner: homeowner._id }
            ];
            await KendaliPerangkat.insertMany(defaultDevices);
            devices = await KendaliPerangkat.find({ owner: homeowner._id });
        }

        // 4. Clean existing history
        console.log('Cleaning old logs...');
        await Promise.all([
            EnvironmentLog.deleteMany({ owner: homeowner._id }),
            SecurityLog.deleteMany({ owner: homeowner._id }),
            WaterQualityLog.deleteMany({ owner: homeowner._id }),
            EnergyLog.deleteMany({ owner: homeowner._id }),
            Activity.deleteMany({ user: homeowner._id }),
            Alert.deleteMany({ owner: homeowner._id })
        ]);

        const now = new Date();
        const rooms = ['R1 - Ruang Keluarga', 'R2 - Kamar Tidur', 'R3 - Dapur', 'R5 - Ruang Produksi'];
        const getPastDate = (hoursAgo) => new Date(now.getTime() - hoursAgo * 3600000);

        // 5. Seed Comfort (Environment)
        console.log('Seeding Environment...');
        const envLogs = [];
        for (let i = 0; i < 50; i++) {
            envLogs.push({
                hub: hub._id,
                date: getPastDate(i * 2), // Every 2 hours
                avgTemperature: Number((23 + Math.random() * 4).toFixed(1)),
                avgHumidity: (55 + Math.random() * 10).toFixed(0) + '%',
                room: rooms[i % rooms.length],
                status: Math.random() > 0.9 ? 'Tidak Nyaman' : 'Nyaman',
                owner: homeowner._id
            });
        }
        await EnvironmentLog.insertMany(envLogs);

        // 6. Seed Security
        console.log('Seeding Security...');
        const secLogs = [];
        for (let i = 0; i < 30; i++) {
            secLogs.push({
                owner: homeowner._id,
                room: rooms[i % rooms.length],
                door: Math.random() > 0.8 ? 'Terbuka' : 'Tertutup',
                motion: Math.random() > 0.9 ? 'Terdeteksi Gerak' : 'Tidak Ada Gerak',
                status: Math.random() > 0.95 ? 'Bahaya' : 'Aman',
                date: getPastDate(i * 4)
            });
        }
        await SecurityLog.insertMany(secLogs);

        // 7. Seed Water
        console.log('Seeding Water...');
        const waterLogs = [];
        for (let i = 0; i < 20; i++) {
            const ph = (6.8 + Math.random() * 1.2).toFixed(1);
            waterLogs.push({
                owner: homeowner._id,
                device: 'Toren Air Utama',
                ph: ph,
                turbidity: (1 + Math.random() * 3).toFixed(0) + ' NTU',
                temperature: (24 + Math.random() * 2).toFixed(1) + '°C',
                tds: (130 + Math.random() * 40).toFixed(0) + ' ppm',
                status: 'Layak Pakai',
                date: getPastDate(i * 6)
            });
        }
        await WaterQualityLog.insertMany(waterLogs);

        // 8. Seed Energy
        console.log('Seeding Energy...');
        const energyLogs = [];
        const pm = devices.find(d => d.type === 'power-meter') || { _id: new mongoose.Types.ObjectId() };
        for (let i = 0; i < 24; i++) {
            energyLogs.push({
                device: pm._id,
                date: getPastDate(i), // Hourly
                totalKwh: Number((2500 + i * 0.4).toFixed(2)),
                voltage: Number((220 + Math.random() * 4).toFixed(1)),
                current: Number((2 + Math.random() * 5).toFixed(1)),
                power: Number((400 + Math.random() * 800).toFixed(0)),
                pf: Number((0.88 + Math.random() * 0.1).toFixed(2)),
                owner: homeowner._id
            });
        }
        await EnergyLog.insertMany(energyLogs);

        // 9. Seed Activities
        console.log('Seeding Activities...');
        const acts = [];
        const items = ['Lampu Teras', 'Lampu Tengah', 'Kipas Angin', 'Smart TV'];
        for (let i = 0; i < 40; i++) {
            acts.push({
                user: homeowner._id,
                room: rooms[i % rooms.length],
                actuator: items[i % items.length],
                status: Math.random() > 0.5 ? 'ON' : 'OFF',
                trigger: Math.random() > 0.7 ? 'Otomasi' : 'Manual App',
                timestamp: getPastDate(i * 1.5)
            });
        }
        await Activity.insertMany(acts);

        // 10. Seed Alerts
        console.log('Seeding Alerts...');
        const alerts = [];
        const msgs = [
            'Filter air perlu dibersihkan.',
            'Tegangan listrik terdeteksi drop.',
            'Pintu belakang terbuka.',
            'Suhu ruangan melebihi batas nyaman.'
        ];
        for (let i = 0; i < 15; i++) {
            alerts.push({
                owner: homeowner._id,
                category: i % 2 === 0 ? 'Keamanan' : 'Air Sanitasi',
                room: rooms[i % rooms.length],
                message: msgs[i % msgs.length],
                type: Math.random() > 0.8 ? 'Bahaya' : 'Waspada',
                date: getPastDate(i * 8)
            });
        }
        await Alert.insertMany(alerts);

        console.log('\nSUCCESS: History data for "lagi testingakun" has been seeded! 🚀');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();
