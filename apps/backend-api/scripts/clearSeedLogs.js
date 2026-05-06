require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const dns = require('dns');

// DNS Fix for Atlas
dns.setServers(['8.8.8.8', '1.1.1.1']);

const EnergyLog = require('../src/models/EnergyLog');
const EnvironmentLog = require('../src/models/EnvironmentLog');
const SecurityLog = require('../src/models/SecurityLog');
const WaterQualityLog = require('../src/models/WaterQualityLog');
const Activity = require('../src/models/Activity');
const Alert = require('../src/models/Alert');

const TARGET_USER_ID = '69e1e4987a65b4693c569135';

const clearLogs = async () => {
    try {
        console.log('🔄 Menghubungkan ke MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Terhubung.');

        console.log(`🧹 Membersihkan data riwayat untuk User: ${TARGET_USER_ID}...`);

        const results = await Promise.all([
            EnergyLog.deleteMany({ owner: TARGET_USER_ID }),
            EnvironmentLog.deleteMany({ owner: TARGET_USER_ID }),
            SecurityLog.deleteMany({ owner: TARGET_USER_ID }),
            WaterQualityLog.deleteMany({ owner: TARGET_USER_ID }),
            Activity.deleteMany({ user: TARGET_USER_ID }),
            Alert.deleteMany({ owner: TARGET_USER_ID })
        ]);

        console.log(`✅ Pembersihan Selesai!`);
        console.log(`- Energy Logs: ${results[0].deletedCount}`);
        console.log(`- Environment Logs: ${results[1].deletedCount}`);
        console.log(`- Security Logs: ${results[2].deletedCount}`);
        console.log(`- Water Quality Logs: ${results[3].deletedCount}`);
        console.log(`- Activity Logs: ${results[4].deletedCount}`);
        console.log(`- Alerts: ${results[5].deletedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Gagal membersihkan data:', error.message);
        process.exit(1);
    }
};

clearLogs();
