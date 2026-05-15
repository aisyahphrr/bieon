const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const Hub = require('../apps/backend-api/src/models/Hub');
const DeviceWhitelist = require('../apps/backend-api/src/models/DeviceWhitelist');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to DB');

    const hub1 = await Hub.findOne({ device_ieee: '40:4C:CA:FF:FE:4D:9C:64' });

    // 3. Seed DeviceWhitelist
    const whitelistDevices = [
        { master_ieee: 'bieon_001', device_ieee: 'A4:C1:38:09:99:A6:FF:FF', device_id: 'sensor_th', device_name: 'Sonoff Airguard TH SNZB-02DR2', device_profile: 'sensor_th', model_id: 'SNZB_02DR2', approved: true },
        { master_ieee: 'bieon_001', device_ieee: 'A4:C1:38:0D:48:41:FF:FF', device_id: 'smart_plug', device_name: 'Sonoff Zigbee Smart Plug S60DTPF', device_profile: 'smart_plug', model_id: 'S60ZBTPF', approved: true },
        { master_ieee: 'bieon_001', device_ieee: '42:4C:CA:FF:FE:57:8B:5D', device_id: 'analog_sensor', device_name: 'Bieon Bluecheck Water Quality', device_profile: 'analog_sensor', model_id: 'BLCK04WQS', approved: true }
    ];
    await DeviceWhitelist.insertMany(whitelistDevices);
    console.log('Inserted DeviceWhitelist stock.');

    // 4. Seed KendaliPerangkat (UNCLAIMED stock)
    if (hub1) {
        const stockDevices = [
            {
                name: 'sensor_th',
                location: 'Gudang Stok',
                hubId: hub1._id,
                category: 'Sensor',
                type: 'Sonoff Airguard TH SNZB-02DR2',
                lifecycleState: 'UNCLAIMED',
                bieonId: 'bieon_001',
                device_ieee: 'A4:C1:38:09:99:A6:FF:FF'
            },
            {
                name: 'smart_plug',
                location: 'Gudang Stok',
                hubId: hub1._id,
                category: 'Control Actuator System',
                type: 'Sonoff Zigbee Smart Plug S60DTPF',
                lifecycleState: 'UNCLAIMED',
                bieonId: 'bieon_001',
                device_ieee: 'A4:C1:38:0D:48:41:FF:FF'
            },
            {
                name: 'analog_sensor',
                location: 'Gudang Stok',
                hubId: hub1._id,
                category: 'Sensor',
                type: 'Bieon Bluecheck Water Quality Monitoring Sistem',
                lifecycleState: 'UNCLAIMED',
                bieonId: 'bieon_001',
                device_ieee: '42:4C:CA:FF:FE:57:8B:5D'
            }
        ];
        await KendaliPerangkat.insertMany(stockDevices);
        console.log('Inserted KendaliPerangkat UNCLAIMED stock.');
    }

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
