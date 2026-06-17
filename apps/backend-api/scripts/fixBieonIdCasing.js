require('dotenv').config();
const mongoose = require('mongoose');

// Models
const BieonSystem = require('../src/models/BieonSystem');
const Device = require('../src/models/Device');
const Hub = require('../src/models/Hub');
const KendaliPerangkat = require('../src/models/KendaliPerangkat');
const PdmMeter = require('../src/models/PdmMeter');

async function fixBieonIdCasing() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin_daffa:daffa12345@cluster0.sqclpaj.mongodb.net/bieon_db?retryWrites=true&w=majority');
        console.log('Connected to MongoDB.\n');

        // 1. Fix BieonSystem
        console.log('--- Fixing BieonSystem ---');
        const systems = await BieonSystem.find({});
        for (const sys of systems) {
            const uppercaseId = sys.bieonId.toUpperCase();
            if (sys.bieonId !== uppercaseId) {
                console.log(`Found lowercase system: ${sys.bieonId} (ID: ${sys._id})`);

                // Check if uppercase version already exists
                const existingUppercase = await BieonSystem.findOne({ bieonId: uppercaseId });

                if (existingUppercase) {
                    console.log(`  -> Uppercase version ${uppercaseId} already exists (ID: ${existingUppercase._id}).`);

                    // If the lowercase one has an owner and uppercase one does not, transfer it
                    if (sys.owner && !existingUppercase.owner) {
                        existingUppercase.owner = sys.owner;
                        await existingUppercase.save();
                        console.log(`  -> Transferred owner ${sys.owner} to the uppercase version.`);
                    } else if (sys.owner && existingUppercase.owner && sys.owner.toString() !== existingUppercase.owner.toString()) {
                        console.log(`  -> WARNING: Conflict! Both have different owners. Updating the uppercase owner to ${sys.owner} just in case to keep the account link.`);
                        existingUppercase.owner = sys.owner;
                        await existingUppercase.save();
                    }

                    // Since uppercase exists, and owner is retained, delete the lowercase duplicate
                    await BieonSystem.deleteOne({ _id: sys._id });
                    console.log(`  -> Deleted duplicate lowercase record ${sys.bieonId}.`);
                } else {
                    // Just update to uppercase
                    sys.bieonId = uppercaseId;
                    await sys.save();
                    console.log(`  -> Updated ${sys.bieonId} to uppercase.`);
                }
            }
        }

        // 2. Fix Hub
        console.log('\n--- Fixing Hub ---');
        const hubs = await Hub.find({});
        let hubUpdates = 0;
        for (const hub of hubs) {
            if (hub.bieonId && hub.bieonId !== hub.bieonId.toUpperCase()) {
                hub.bieonId = hub.bieonId.toUpperCase();
                await hub.save();
                hubUpdates++;
            }
        }
        console.log(`Updated ${hubUpdates} Hub records.`);

        // 3. Fix Device
        console.log('\n--- Fixing Device ---');
        const devices = await Device.find({});
        let devUpdates = 0;
        for (const dev of devices) {
            if (dev.bieonId && dev.bieonId !== dev.bieonId.toUpperCase()) {
                dev.bieonId = dev.bieonId.toUpperCase();
                await dev.save();
                devUpdates++;
            }
        }
        console.log(`Updated ${devUpdates} Device records.`);

        // 4. Fix KendaliPerangkat
        console.log('\n--- Fixing KendaliPerangkat ---');
        const kendalis = await KendaliPerangkat.find({});
        let kenUpdates = 0;
        for (const ken of kendalis) {
            if (ken.bieonId && ken.bieonId !== ken.bieonId.toUpperCase()) {
                ken.bieonId = ken.bieonId.toUpperCase();
                await ken.save();
                kenUpdates++;
            }
        }
        console.log(`Updated ${kenUpdates} KendaliPerangkat records.`);

        // 5. Fix PdmMeter
        console.log('\n--- Fixing PdmMeter ---');
        const meters = await PdmMeter.find({});
        let meterUpdates = 0;
        for (const met of meters) {
            if (met.bieonId && met.bieonId !== met.bieonId.toUpperCase()) {
                met.bieonId = met.bieonId.toUpperCase();
                await met.save();
                meterUpdates++;
            }
        }
        console.log(`Updated ${meterUpdates} PdmMeter records.`);

        console.log('\nMigration completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

fixBieonIdCasing();
