const mongoose = require('mongoose');
const Hub = require('../src/models/Hub');
const BieonSystem = require('../src/models/BieonSystem');

const uri = 'mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?appName=Cluster0';

async function fix() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const bieonId = '7RRQ';
        const system = await BieonSystem.findOne({ bieonId });
        
        if (!system) {
            console.log('System 7RRQ not found in database.');
            process.exit(0);
        }

        console.log(`Found system 7RRQ with hubCount: ${system.hubCount}`);
        
        // Update hub count
        system.hubCount = 1;
        await system.save();
        console.log('Updated hubCount to 1');

        // Clean up hubs
        const hubs = await Hub.find({ bieonId });
        console.log(`Found ${hubs.length} hubs for 7RRQ`);

        if (hubs.length > 1) {
            const hubsToKeep = hubs.slice(0, 1);
            const hubsToDelete = hubs.slice(1);
            
            const deleteIds = hubsToDelete.map(h => h._id);
            await Hub.deleteMany({ _id: { $in: deleteIds } });
            
            console.log(`Deleted ${hubsToDelete.length} extra hubs.`);
            console.log('Remaining hub:', hubsToKeep[0].name);
        } else {
            console.log('No extra hubs to delete.');
        }

        console.log('Fix completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fix();
