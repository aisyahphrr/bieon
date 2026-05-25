const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?appName=Cluster0')
  .then(async () => {
    const email = 'asrisaras17@gmail.com';
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }
    
    // Set a known password
    user.password = 'Bieon123456';
    await user.save();
    console.log(`Successfully updated password for ${email} to 'Bieon123456'`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting/updating:', err);
    process.exit(1);
  });
