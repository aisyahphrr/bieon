const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });

const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');
const Hub = require('../apps/backend-api/src/models/Hub');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to DB');

    for (let i = 5; i <= 10; i++) {
        const bieonId = `bieon_${i.toString().padStart(3, '0')}`;
        console.log(`\n=== Seeding ${bieonId} ===`);

        // 1. Cek atau Buat BieonSystem
        let sys = await BieonSystem.findOne({ bieonId });
        if (!sys) {
            sys = new BieonSystem({
                bieonId: bieonId,
                name: `BIEON Smart Home System ${String.fromCharCode(65 + i)}`,
                status: 'Active'
            });
            await sys.save();
            console.log(`Created System ${bieonId}`);
        } else {
            console.log(`System ${bieonId} already exists, skipping creation.`);
        }

        // 2. Buat Hub
        for (let h = 1; h <= 2; h++) {
            const hubName = `Hub Node ${String(h).padStart(3, '0')}`;
            const canonicalIeee = `404CCAFFFE${i.toString().padStart(2, '0')}00${h.toString().padStart(2, '0')}`;
            
            let hub = await Hub.findOne({ bieonId, name: hubName });
            if (!hub) {
                hub = new Hub({
                    name: hubName,
                    bieonId: bieonId,
                    status: 'Online',
                    device_ieee: canonicalIeee
                });
                await hub.save();
                console.log(`Created Hub ${hubName} with IEEE ${canonicalIeee}`);
            }

            // 3. Buat Perangkat untuk Hub ini
            const devicesToCreate = [
                {
                    name: `sensor_th_${bieonId}_${h}`,
                    type: 'sensor_th',
                    room: h === 1 ? 'Ruang Keluarga' : 'Kamar Utama',
                    category: 'Sensor',
                    location: 'Indoor',
                    device_ieee: `AABBCCDDEE${i.toString().padStart(2, '0')}${h}01`
                },
                {
                    name: `smart_plug_${bieonId}_${h}`,
                    type: 'smart_plug',
                    room: h === 1 ? 'Ruang Keluarga' : 'Dapur',
                    category: 'Control Actuator System',
                    location: 'Indoor',
                    device_ieee: `AABBCCDDEE${i.toString().padStart(2, '0')}${h}02`
                },
                {
                    name: `analog_sensor_${bieonId}_${h}`,
                    type: 'analog_sensor',
                    room: h === 1 ? 'Teras' : 'Halaman Belakang',
                    category: 'Sensor',
                    location: 'Outdoor',
                    device_ieee: `AABBCCDDEE${i.toString().padStart(2, '0')}${h}03`
                }
            ];

            for (const devData of devicesToCreate) {
                let device = await KendaliPerangkat.findOne({ name: devData.name });
                if (!device) {
                    const newDevice = new KendaliPerangkat({
                        name: devData.name,
                        type: devData.type,
                        room: devData.room,
                        category: devData.category,
                        location: devData.location,
                        status: 'Active',
                        isAuthorized: true,
                        lifecycleState: 'UNCLAIMED',
                        hubId: hub._id,
                        bieonId: bieonId,
                        device_ieee: devData.device_ieee,
                        currentValues: {
                            temperature: 25.5,
                            humidity: 60,
                            on_off: 'OFF'
                        }
                    });
                    await newDevice.save();
                    console.log(`Created Device ${devData.name}`);
                }
            }
        }
    }

    console.log('\n✅ SEEDING COMPLETE!');
    process.exit(0);

}).catch(err => {
    console.error(err);
    process.exit(1);
});
