const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const PlnTariff = require('../models/PlnTariff');

async function checkTariffs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const categories = [
            'B-1/TR - 450-5.500 VA',
            'B-4/TT - > 30.000 kVA',
            'I-1/TR - 450-5.500 VA',
            'I-2/TM - 6.600 VA-200 kVA'
        ];

        for (const cat of categories) {
            const latest = await PlnTariff.findOne({ category: cat }).sort({ createdAt: -1 });
            console.log(`Category: ${cat}`);
            if (latest) {
                console.log(`  Tariff: ${latest.tariff}`);
                console.log(`  Effective Date: ${latest.effectiveDate}`);
            } else {
                console.log('  No record found');
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTariffs();
