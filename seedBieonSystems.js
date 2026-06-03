require('dotenv').config();
const mongoose = require('mongoose');
const BieonSystem = require('./apps/backend-api/src/models/BieonSystem');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bieon');
        console.log('MongoDB Connected for Seeding BieonSystem');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedBieonSystems = async () => {
    await connectDB();

    try {
        // Array of bieon IDs to seed
        const bieonIds = [
            'bieon_001', 'bieon_002', 'bieon_003', 'bieon_004', 'bieon_005',
            'bieon_006', 'bieon_007', 'bieon_008', 'bieon_009', 'bieon_010'
        ];

        for (const bieonId of bieonIds) {
            const existing = await BieonSystem.findOne({ bieonId });
            if (!existing) {
                const newSystem = new BieonSystem({
                    bieonId: bieonId,
                    hubCount: 1,
                    status: 'Active'
                });
                await newSystem.save();
                console.log(`✓ Seeded ${bieonId}`);
            } else {
                console.log(`✗ ${bieonId} already exists (skipped)`);
            }
        }

        console.log('\nSeeding BieonSystem completed!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedBieonSystems();
