const mongoose = require('mongoose');
const path = require('path');
const Complaint = require('../models/Complaint');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function checkComplaints() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bieon');
        console.log('Connected to MongoDB');

        const complaints = await Complaint.find({}).populate('homeowner', 'fullName');
        console.log(`Total Complaints: ${complaints.length}`);

        const statuses = Array.from(new Set(complaints.map(c => c.status)));
        console.log('Statuses in DB:', statuses);

        const counts = {};
        complaints.forEach(c => {
            counts[c.status] = (counts[c.status] || 0) + 1;
        });
        console.log('Counts per status:', counts);

        if (complaints.length > 0) {
            console.log('Sample Finished Complaint:', JSON.stringify(complaints.find(c => c.status === 'selesai'), null, 2));
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkComplaints();
