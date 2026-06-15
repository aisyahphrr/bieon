const mongoose = require('mongoose');
const BieonSystem = require('./src/models/BieonSystem');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const systems = await BieonSystem.find({});
    console.log(JSON.stringify(systems, null, 2));
    process.exit(0);
}
run();
