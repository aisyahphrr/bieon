const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Force use of reliable DNS to avoid ECONNREFUSED in certain networks
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const User = require('../models/User');
const KendaliPerangkat = require('../models/KendaliPerangkat');
const Hub = require('../models/Hub');
const EnergyLog = require('../models/EnergyLog');
const EnvironmentLog = require('../models/EnvironmentLog');
const SecurityLog = require('../models/SecurityLog');
const WaterQualityLog = require('../models/WaterQualityLog');
const Activity = require('../models/Activity');
const Alert = require('../models/Alert');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bieon';
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected for Seeding...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedHistory = async () => {
    try {
        await connectDB();

        // 1. Get a Homeowner
        const homeowner = await User.findOne({ role: 'Homeowner' });
        if (!homeowner) {
            console.error('No Homeowner found. Please seed users first.');
            process.exit(1);
        }
        console.log(`Seeding history for: ${homeowner.fullName} (${homeowner._id})`);

        // 2. Get Hub and Devices
        const hub = await Hub.findOne({ owner: homeowner._id });
        const devices = await KendaliPerangkat.find({ owner: homeowner._id });

        if (!hub) {
            console.warn('No Hub found for this homeowner. Some logs might be incomplete.');
        }

        // Clean existing history data (optional, but good for clean seed)
        await Promise.all([
            EnergyLog.deleteMany({ owner: homeowner._id }),
            EnvironmentLog.deleteMany({ owner: homeowner._id }),
            SecurityLog.deleteMany({ owner: homeowner._id }),
            WaterQualityLog.deleteMany({ owner: homeowner._id }),
            Activity.deleteMany({ user: homeowner._id }),
            Alert.deleteMany({ owner: homeowner._id })
        ]);

        const now = new Date();
        const rooms = ['R1 - Ruang Keluarga', 'R2 - Kamar Tidur', 'R3 - Dapur', 'R5 - Ruang Produksi'];

        // Helper to generate dates backwards
        const getPastDate = (minutesAgo) => new Date(now.getTime() - minutesAgo * 60000);

        // --- SEED ENVIRONMENT LOG (Comfort) ---
        console.log('Seeding Environment Logs...');
        const envLogs = [];
        for (let i = 0; i < 20; i++) {
            envLogs.push({
                hub: hub ? hub._id : new mongoose.Types.ObjectId(),
                date: getPastDate(i * 15), // Every 15 mins
                avgTemperature: Number((22 + Math.random() * 5).toFixed(1)),
                avgHumidity: (50 + Math.random() * 15).toFixed(0) + '%',
                room: rooms[i % rooms.length],
                status: Math.random() > 0.8 ? 'Tidak Nyaman' : 'Nyaman',
                owner: homeowner._id
            });
        }
        await EnvironmentLog.insertMany(envLogs);

        // --- SEED SECURITY LOG ---
        console.log('Seeding Security Logs...');
        const secLogs = [];
        for (let i = 0; i < 15; i++) {
            secLogs.push({
                owner: homeowner._id,
                room: rooms[i % rooms.length],
                door: Math.random() > 0.8 ? 'Terbuka' : 'Tertutup',
                motion: Math.random() > 0.8 ? 'Terdeteksi Gerak' : 'Tidak Ada Gerak',
                status: Math.random() > 0.9 ? 'Bahaya' : (Math.random() > 0.7 ? 'Waspada' : 'Aman'),
                date: getPastDate(i * 20)
            });
        }
        await SecurityLog.insertMany(secLogs);

        // --- SEED WATER QUALITY LOG ---
        console.log('Seeding Water Quality Logs...');
        const waterLogs = [];
        for (let i = 0; i < 10; i++) {
            const ph = (6.5 + Math.random() * 1.5).toFixed(1);
            waterLogs.push({
                owner: homeowner._id,
                device: 'Toren Air',
                ph: ph,
                turbidity: (1 + Math.random() * 4).toFixed(0) + ' NTU',
                temperature: (23 + Math.random() * 3).toFixed(1) + '°C',
                tds: (120 + Math.random() * 50).toFixed(0) + ' ppm',
                status: (ph < 6.8 || ph > 8.5) ? 'Tidak Layak' : 'Layak Pakai',
                date: getPastDate(i * 30)
            });
        }
        await WaterQualityLog.insertMany(waterLogs);

        // --- SEED ENERGY LOG ---
        console.log('Seeding Energy Logs...');
        const energyLogs = [];
        const powerMeter = devices.find(d => d.type.toLowerCase().includes('power')) || { _id: new mongoose.Types.ObjectId(), name: 'Power Meter Utama' };
        for (let i = 0; i < 12; i++) {
            energyLogs.push({
                device: powerMeter._id,
                date: getPastDate(i * 60), // Hourly
                totalKwh: Number((1450 + i * 0.5).toFixed(2)),
                voltage: Number((218 + Math.random() * 5).toFixed(1)),
                current: Number((1 + Math.random() * 3).toFixed(1)),
                power: Number((200 + Math.random() * 600).toFixed(0)),
                pf: Number((0.85 + Math.random() * 0.12).toFixed(2)),
                owner: homeowner._id
            });
        }
        await EnergyLog.insertMany(energyLogs);

        // --- SEED ACTIVITY LOG (Device Action) ---
        console.log('Seeding Activity Logs...');
        const activities = [];
        const actuators = ['AC Split', 'Smart TV', 'Lampu Utama', 'Kipas Exhaust'];
        const triggers = ['Manual (Web)', 'Jadwal Otomatis', 'Otomasi (Suhu 24°C)'];
        for (let i = 0; i < 15; i++) {
            activities.push({
                user: homeowner._id,
                room: rooms[i % rooms.length],
                actuator: actuators[i % actuators.length],
                status: Math.random() > 0.5 ? 'ON' : 'OFF',
                trigger: triggers[i % triggers.length],
                timestamp: getPastDate(i * 45)
            });
        }
        await Activity.insertMany(activities);

        // --- SEED ALERTS ---
        console.log('Seeding Alert Logs...');
        const alerts = [];
        const categories = ['Keamanan', 'Air Sanitasi', 'Energi', 'Gas'];
        const messages = [
            'Pintu utama dibuka menggunakan akses PIN.',
            'Terdeteksi pergerakan tidak wajar di area garasi!',
            'Kekeruhan air meningkat drastis. Status: Tidak Layak.',
            'Beban daya melebihi 1000 W. Mendekati batas limit harian.',
            'Terdeteksi peningkatan kadar gas. Kualitas udara memburuk.'
        ];
        for (let i = 0; i < 10; i++) {
            alerts.push({
                owner: homeowner._id,
                category: categories[i % categories.length],
                room: rooms[i % rooms.length],
                message: messages[i % messages.length],
                type: Math.random() > 0.7 ? 'Bahaya' : 'Waspada',
                date: getPastDate(i * 120)
            });
        }
        await Alert.insertMany(alerts);

        console.log('All history data seeded successfully! ✅');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedHistory();
