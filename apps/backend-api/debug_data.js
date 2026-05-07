const mongoose = require('mongoose');
const User = require('./src/models/User');
const Hub = require('./src/models/Hub');
const KendaliPerangkat = require('./src/models/KendaliPerangkat');

async function debugData() {
    try {
        await mongoose.connect('mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?appName=Cluster0'); 
        console.log('Connected to DB');

        const user = await User.findOne({ email: 'akuntest1@example.com' });
        if (!user) {
            console.log('User not found');
            return;
        }
        console.log('User found:', user._id, user.fullName);

        const hubs = await Hub.find({ owner: user._id });
        console.log(`Found ${hubs.length} Hubs:`);
        hubs.forEach(h => console.log(` - Hub: ${h.name} (_id: ${h._id}, bieonId: ${h.bieonId})`));

        const devices = await KendaliPerangkat.find({ owner: user._id });
        console.log(`Found ${devices.length} Devices:`);
        devices.forEach(d => console.log(` - Device: ${d.name} (_id: ${d._id}, hubId: ${d.hubId}, type: ${d.type})`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugData();
