const mongoose = require('mongoose');
const User = require('../src/models/User');
const BieonSystem = require('../src/models/BieonSystem');
const Hub = require('../src/models/Hub');

async function fix() {
    try {
        await mongoose.connect('mongodb://localhost:27017/bieon_db');
        console.log('Connected to MongoDB');

        // 1. Get Aisyah
        const aisyah = await User.findOne({ email: 'aisyah@gmail.com' });
        if (!aisyah) {
            console.log('Aisyah not found');
            process.exit(1);
        }

        console.log('Found Aisyah:', aisyah._id);

        // 2. Clear and recreate systems to be safe for demo
        await BieonSystem.deleteMany({ owner: aisyah._id });
        await Hub.deleteMany({ owner: aisyah._id });

        // 3. Add BIEON-001 (Master)
        const sys1 = new BieonSystem({
            bieonId: 'BIEON-001',
            owner: aisyah._id,
            hubCount: 2,
            status: 'Active'
        });
        await sys1.save();
        
        await Hub.create([
            { name: 'Hub Utama', bieonId: 'BIEON-001', owner: aisyah._id, status: 'Online' },
            { name: 'Hub Lantai 2', bieonId: 'BIEON-001', owner: aisyah._id, status: 'Offline' }
        ]);

        // 4. Add BIEON-002 (Secondary)
        const sys2 = new BieonSystem({
            bieonId: 'BIEON-002',
            owner: aisyah._id,
            hubCount: 1,
            status: 'Active'
        });
        await sys2.save();

        await Hub.create([
            { name: 'Hub Garasi', bieonId: 'BIEON-002', owner: aisyah._id, status: 'Online' }
        ]);

        console.log('Successfully linked BIEON-001 and BIEON-002 to Aisyah');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
