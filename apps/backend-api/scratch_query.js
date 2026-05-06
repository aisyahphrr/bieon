const mongoose = require('mongoose');
require('dotenv').config();

const KendaliPerangkat = require('./src/models/KendaliPerangkat');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://user:pass@cluster.mongodb.net/bieon_db')
  .then(async () => {
    const devices = await KendaliPerangkat.find({}, 'name location owner status');
    console.log("All Devices in DB:");
    devices.forEach(d => console.log(d));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
