const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../../.env' });

async function checkUser() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?appName=Cluster0";
    await mongoose.connect(uri);
    
    const user = await User.findOne({ email: 'agalagan@example.com' });
    console.log("User details:", JSON.stringify(user, null, 2));
    console.log("Type of role:", typeof user?.role);
    console.log("Exact role value:", JSON.stringify(user?.role));
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

checkUser();
