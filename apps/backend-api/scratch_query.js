const mongoose = require('mongoose');
require('dotenv').config();

const KendaliPerangkat = require('./src/models/KendaliPerangkat');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const devices = await KendaliPerangkat.find({
      "remoteState.mappings.controlMethod": "Jadwal"
    });

    for (const d of devices) {
      console.log(`\nDevice: ${d.name} (_id: ${d._id})`);
      const mappingsObj = d.remoteState?.mappings;
      const mappingsMap = d.remoteState?.get ? d.remoteState.get('mappings') : null;
      console.log(`mappingsObj:`, mappingsObj);
      console.log(`mappingsMap exists?`, !!mappingsMap);
      if (mappingsMap) {
        console.log(`mappingsMap length:`, mappingsMap.length);
        console.log(`mappingsMap contents:`, JSON.stringify(mappingsMap, null, 2));
      }
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
