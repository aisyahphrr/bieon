const mongoose = require('mongoose');
require('dotenv').config();

const Complaint = require('./src/models/Complaint');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await Complaint.updateMany(
            { status: 'menunggu konfirmasi' },
            { $set: { status: 'menunggu konfirmasi pelanggan' } }
        );

        console.log(`Updated ${result.modifiedCount} complaints to 'menunggu konfirmasi pelanggan'`);

        // Also update timeline statuses
        const complaints = await Complaint.find({ 'timeline.status': 'menunggu konfirmasi' });
        for (const c of complaints) {
            c.timeline.forEach(t => {
                if (t.status === 'menunggu konfirmasi') t.status = 'menunggu konfirmasi pelanggan';
            });
            await c.save();
        }
        console.log(`Updated timeline entries for ${complaints.length} complaints`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrate();
