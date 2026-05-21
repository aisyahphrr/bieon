const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config({ path: './apps/backend-api/.env' });
const PdmMeter = require('../apps/backend-api/src/models/PdmMeter');

// Fix DNS issues if any
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const seedPdmMeter = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        console.log('Connecting to:', mongoURI);
        await mongoose.connect(mongoURI);
        console.log('✅ Connection successful!');

        const meterData = {
            name: "AX9L Series One Phase Inteligent Energy Meter",
            device_id: "pdm_001",
            bieonId: "bieon_001",
            owner: null,
            isSystemMeter: true,
            manufacturer: "Renatta",
            modelId: "AX9L",
            status: "Active",
            currentValues: { lastEnergyReading: 0, energyToday: 0, currentLoad: 0 }
            // createdAt is automatically handled by the schemas `timestamps: true`
        };

        const newMeter = new PdmMeter(meterData);
        const result = await newMeter.save();
        
        console.log('✅ Data berhasil dimasukkan!');
        console.log(result);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Terjadi kesalahan:', error.message);
        process.exit(1);
    }
};

seedPdmMeter();
