const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');

const TECHNICIAN_UPDATES = [
    {
        fullName: 'Test Teknisi',
        email: 'tek1@bieon.com',
        password: '1234',
        workArea: 'Bandung',
        coverageAreas: ['Bandung Kota'],
    },
    {
        fullName: 'Andi Pratama',
        email: 'andi@tech.com',
        password: '1234',
        workArea: 'Jakarta',
        coverageAreas: ['Jakarta Pusat'],
    },
    {
        fullName: 'teknisi2bpjs',
        email: 'teknisi2bpjs@bieon.com',
        password: '1234',
        workArea: 'Surabaya',
        coverageAreas: ['Surabaya Pusat'],
    },
];

async function updateTechnicianDemoAccounts() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI not found in .env');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected.');

        const results = [];

        for (const target of TECHNICIAN_UPDATES) {
            const technician = await User.findOne({
                role: 'Technician',
                fullName: target.fullName,
                email: target.email,
            });

            if (!technician) {
                results.push({
                    fullName: target.fullName,
                    email: target.email,
                    updated: false,
                    reason: 'not found',
                });
                continue;
            }

            technician.password = target.password;
            technician.workArea = target.workArea;
            technician.coverageAreas = target.coverageAreas;
            await technician.save();

            const passwordMatches = await bcrypt.compare(target.password, technician.password);

            results.push({
                fullName: technician.fullName,
                email: technician.email,
                technicianId: technician.technicianId || null,
                workArea: technician.workArea,
                coverageAreas: technician.coverageAreas,
                passwordMatches,
                updated: true,
            });
        }

        console.log('\nUpdate complete:');
        console.log(JSON.stringify(results, null, 2));

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Failed to update technician demo accounts:', error);
        process.exit(1);
    }
}

updateTechnicianDemoAccounts();
