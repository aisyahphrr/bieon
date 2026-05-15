const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');
const Hub = require('../apps/backend-api/src/models/Hub');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to DB');

    const newSystems = ['bieon_002', 'bieon_003', 'bieon_004'];

    for (let i = 0; i < newSystems.length; i++) {
        const bieonId = newSystems[i];
        const sysIndex = i + 2; // 2, 3, 4

        // 1. Create System
        let sys = await BieonSystem.findOne({ bieonId });
        if (!sys) {
            sys = new BieonSystem({
                bieonId: bieonId,
                name: `BIEON Smart Home System ${String.fromCharCode(65 + i + 1)}`, // B, C, D
                status: 'Active'
            });
            await sys.save();
        }

        // 2. Create 2 Hubs
        for (let j = 1; j <= 2; j++) {
            const hubName = `Hub Node 00${j}`;
            let hub = await Hub.findOne({ bieonId, name: hubName });
            if (!hub) {
                hub = new Hub({
                    name: hubName,
                    bieonId: bieonId,
                    device_ieee: `40:4C:CA:FF:FE:0${sysIndex}:00:0${j}`, // Dummy unique IEEE
                    status: 'Online'
                });
                await hub.save();

                // 3. Create Default UNCLAIMED Devices attached to Hub 1 only (like bieon_001)
                if (j === 1) {
                    const stockDevices = [
                        {
                            name: 'sensor_th',
                            location: 'Gudang Stok',
                            hubId: hub._id,
                            category: 'Sensor',
                            type: 'Sonoff Airguard TH SNZB-02DR2',
                            lifecycleState: 'UNCLAIMED',
                            bieonId: bieonId,
                            device_ieee: `A4:C1:38:09:99:A6:0${sysIndex}:0${j}`
                        },
                        {
                            name: 'smart_plug',
                            location: 'Gudang Stok',
                            hubId: hub._id,
                            category: 'Control Actuator System',
                            type: 'Sonoff Zigbee Smart Plug S60DTPF',
                            lifecycleState: 'UNCLAIMED',
                            bieonId: bieonId,
                            device_ieee: `A4:C1:38:0D:48:41:0${sysIndex}:0${j}`
                        },
                        {
                            name: 'analog_sensor',
                            location: 'Gudang Stok',
                            hubId: hub._id,
                            category: 'Sensor',
                            type: 'Bieon Bluecheck Water Quality Monitoring Sistem',
                            lifecycleState: 'UNCLAIMED',
                            bieonId: bieonId,
                            device_ieee: `42:4C:CA:FF:FE:57:0${sysIndex}:0${j}`
                        }
                    ];
                    await KendaliPerangkat.insertMany(stockDevices);
                }
            }
        }
        console.log(`Seeded ${bieonId} with 2 hubs and 3 devices.`);
    }

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
