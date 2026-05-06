const mongoose = require('mongoose');
require('dotenv').config();

const User = mongoose.model('User', new mongoose.Schema({
    fullName: String,
    role: String,
    assignedTechnician: mongoose.Schema.Types.ObjectId,
    currentLocation: { lat: Number, lng: Number }
}));

const Hub = mongoose.model('Hub', new mongoose.Schema({
    owner: mongoose.Schema.Types.ObjectId,
    status: String
}));

const KendaliPerangkat = mongoose.model('KendaliPerangkat', new mongoose.Schema({
    owner: mongoose.Schema.Types.ObjectId,
    status: String
}, { collection: 'kendaliperangkat' }));

async function testQuery() {
    try {
        const uri = 'mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?appName=Cluster0';
        await mongoose.connect(uri);
        
        const alanId = new mongoose.Types.ObjectId('69e5e7d83c29953fe5079069');
        const clients = await User.find({ assignedTechnician: alanId, role: 'Homeowner' }).lean();
        
        console.log('Clients found:', clients.length);
        
        for (const client of clients) {
            const hubs = await Hub.find({ owner: client._id }).lean();
            const devices = await KendaliPerangkat.find({ owner: client._id }).lean();
            
            const devicesOnline = devices.filter(d => ['Active', '1', '0'].includes(d.status)).length;
            
            console.log(`Client: ${client.fullName}`);
            console.log(`- Hubs: ${hubs.length}`);
            console.log(`- Devices: ${devices.length} (Online: ${devicesOnline})`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testQuery();
