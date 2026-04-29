const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const PlnTariff = require('../models/PlnTariff');

async function checkAllTariffs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const all = await PlnTariff.find().sort({ createdAt: -1 });
        console.log(JSON.stringify(all, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

checkAllTariffs();
