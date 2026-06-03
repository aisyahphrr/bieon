require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bieon');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const checkEmail = async () => {
    await connectDB();

    try {
        const User = require('./apps/backend-api/src/models/User');

        // List semua user yang ada
        const users = await User.find({}, 'email fullName role bieonId');
        console.log('\n=== ALL USERS IN DATABASE ===\n');
        users.forEach(u => {
            console.log(`Email: ${u.email}`);
            console.log(`  Name: ${u.fullName}, Role: ${u.role}, BieonId: ${u.bieonId || 'NONE'}\n`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkEmail();
