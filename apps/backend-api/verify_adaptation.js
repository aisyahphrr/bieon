const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const KendaliPerangkat = require('./src/models/KendaliPerangkat');

const verify = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI ? 'URI found' : 'URI NOT FOUND');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const devices = await KendaliPerangkat.find({});
        console.log(`\nFound ${devices.length} devices in database.`);
        
        console.log('\n--- Adaptation Check ---');
        let adaptedCount = 0;
        devices.forEach(d => {
            const isAdapted = d.lifecycleState !== undefined;
            if (isAdapted) adaptedCount++;
            
            console.log(`[${isAdapted ? '✓' : ' '}] Name: ${d.name.padEnd(20)} | State: ${(d.lifecycleState || 'N/A').padEnd(12)} | Tenant: ${d.tenantId || 'N/A'}`);
        });

        console.log(`\nSummary: ${adaptedCount}/${devices.length} devices have adaptation fields.`);
        
        if (adaptedCount < devices.length) {
            console.log('\n💡 Tip: Run State Monitoring or send an MQTT message to auto-populate fields.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

verify();
