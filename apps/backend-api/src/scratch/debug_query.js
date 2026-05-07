const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

async function debug() {
    try {
        const uri = 'mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?appName=Cluster0';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const total = await Complaint.countDocuments();
        console.log('Total Complaints:', total);

        const allStatuses = await Complaint.distinct('status');
        console.log('All unique statuses in DB:', allStatuses);

        const finished = await Complaint.find({ status: { $in: ['selesai', 'ditolak', 'Selesai', 'Ditolak'] } }).limit(5);
        console.log('Sample Finished/Rejected Complaints:', JSON.stringify(finished.map(c => ({ id: c._id, status: c.status, homeowner: c.homeowner, device: c.device })), null, 2));

        // Check for specific homeowner from screenshot
        const user = await User.findOne({ fullName: /testingakun/i });
        if (user) {
            console.log('Found user:', user.fullName, user._id);
            const userComplaints = await Complaint.find({ homeowner: user._id });
            console.log(`Complaints for this user (${userComplaints.length}):`, userComplaints.map(c => ({ id: c._id, status: c.status })));
        } else {
            console.log('User "testingakun" not found');
        }

        process.exit(0);
    } catch (err) {
        console.error('Debug failed:', err);
        process.exit(1);
    }
}

debug();
