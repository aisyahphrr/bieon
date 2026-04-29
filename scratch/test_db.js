const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config({ path: './apps/backend-api/.env' });

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const testConnection = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        console.log('Connecting to:', mongoURI);
        await mongoose.connect(mongoURI);
        console.log('✅ Connection successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    }
};

testConnection();
