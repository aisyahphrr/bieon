const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const Hub = require('../apps/backend-api/src/models/Hub');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');
const { connectMQTT, publishCommand } = require('../apps/backend-api/src/config/mqtt');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to DB');
    
    // Tunggu koneksi MQTT sebentar
    connectMQTT();
    await new Promise(r => setTimeout(r, 2000));

    const devices = await KendaliPerangkat.find({ status: 'Active' });
    console.log(`Found ${devices.length} active devices to sync.`);

    for (const dev of devices) {
        try {
            const hub = await Hub.findById(dev.hubId);
            if (hub) {
                const formattedHubId = hub.name.toLowerCase().replace('hub node ', 'hubnode_');
                // Pakai tenant_001 sesuai permintaan user
                const topic = `tenant/tenant_001/bieon/${dev.bieonId}/hub/${formattedHubId}/device/${dev.name}/status`;
                
                publishCommand(topic, {
                    type: "status",
                    state: "PROVISIONED",
                    ts: Math.floor(Date.now() / 1000)
                }, { qos: 1, retain: true });
                
                console.log(`[SYNC] Published hierarchy for: ${dev.name} -> ${topic}`);
            }
        } catch (err) {
            console.error(`Failed to sync ${dev.name}:`, err.message);
        }
    }

    console.log('\n✅ SYNC COMPLETE! Topics are now retained in Broker.');
    setTimeout(() => process.exit(0), 1000);

}).catch(err => {
    console.error(err);
    process.exit(1);
});
