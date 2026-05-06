const mongoose = require('mongoose');
require('dotenv').config();

// Define Schemas manually to avoid dependency issues in scratch script
const userSchema = new mongoose.Schema({
    fullName: String,
    role: String,
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bieonId: String
});
const User = mongoose.model('User', userSchema);

const hubSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String
});
const Hub = mongoose.model('Hub', hubSchema);

const deviceSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: String
});
const Device = mongoose.model('Device', deviceSchema);

async function inspectData() {
    try {
        const uri = 'mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?appName=Cluster0';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const technicians = await User.find({ 
            fullName: { $in: ['Daffa Alkindi', 'Andi Pratama', 'Alanpenggendong'] },
            role: 'Technician'
        }).lean();

        console.log(`Found ${technicians.length} technicians.`);

        for (const tech of technicians) {
            console.log(`\nTechnician: ${tech.fullName} (${tech._id})`);
            
            const clients = await User.find({ assignedTechnician: tech._id, role: 'Homeowner' }).lean();
            console.log(`Assigned Clients: ${clients.length}`);

            for (const client of clients) {
                const hubs = await Hub.find({ owner: client._id }).lean();
                const devices = await Device.countDocuments({ owner: client._id });
                console.log(`  - Client: ${client.fullName} (${client._id})`);
                console.log(`    BIEON Hubs: ${hubs.length} (${hubs.map(h => h.status).join(', ') || 'none'})`);
                console.log(`    Smart Devices: ${devices}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspectData();
