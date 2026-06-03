require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bieon');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const checkStatus = async () => {
    await connectDB();

    try {
        const BieonSystem = require('./apps/backend-api/src/models/BieonSystem');
        const User = require('./apps/backend-api/src/models/User');

        console.log('\n=== CHECKING bieon_001 STATUS ===\n');

        // Check BieonSystem
        const system = await BieonSystem.findOne({ bieonId: 'bieon_001' });
        console.log('BieonSystem.bieon_001:');
        console.log('  Exists:', system ? 'YES' : 'NO');
        if (system) {
            console.log('  Owner:', system.owner);
            console.log('  Status:', system.status);
        }

        // Check User with bieonId
        const user = await User.findOne({ bieonId: 'bieon_001' });
        console.log('\nUser with bieonId bieon_001:');
        console.log('  Exists:', user ? 'YES' : 'NO');
        if (user) {
            console.log('  Email:', user.email);
            console.log('  Role:', user.role);
        }

        // List all BieonSystems
        const allSystems = await BieonSystem.find({});
        console.log('\nAll BieonSystems in DB:', allSystems.length);
        allSystems.forEach(s => {
            console.log(`  - ${s.bieonId} (owner: ${s.owner ? 'YES' : 'NO'})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkStatus();
