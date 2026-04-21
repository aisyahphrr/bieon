const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixComplaintData() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('MONGODB_URI not found in .env');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('complaints');

        const complaints = await collection.find({}).toArray();
        console.log(`Analyzing ${complaints.length} complaints...`);

        let updatedCount = 0;

        for (const doc of complaints) {
            let newStatus = doc.status ? doc.status.toLowerCase() : 'unassigned';
            let needsUpdate = false;

            // 1. Handle legacy 'baru' status
            if (newStatus === 'baru') {
                newStatus = 'unassigned';
                needsUpdate = true;
            }

            // 2. Logic: No technician means it cannot be 'menunggu respons' or in-progress states
            const hasTechnician = !!doc.technician;
            
            if (!hasTechnician) {
                // If it's something that requires a technician, revert to unassigned
                const techRequiredStatuses = ['menunggu respons', 'diproses', 'menunggu konfirmasi', 'overdue respons', 'overdue perbaikan'];
                if (techRequiredStatuses.includes(newStatus)) {
                    console.log(`Ticket [${doc._id}] has no technician but status is '${newStatus}'. Reverting to 'unassigned'.`);
                    newStatus = 'unassigned';
                    needsUpdate = true;
                }
            } else {
                // If it has a technician but is still 'unassigned', move to 'menunggu respons'
                if (newStatus === 'unassigned') {
                    console.log(`Ticket [${doc._id}] has technician but status is 'unassigned'. Moving to 'menunggu respons'.`);
                    newStatus = 'menunggu respons';
                    needsUpdate = true;
                }
            }

            // 3. Normalize casing if it was mixed
            if (doc.status !== newStatus) {
                needsUpdate = true;
            }

            if (needsUpdate) {
                await collection.updateOne(
                    { _id: doc._id },
                    { $set: { status: newStatus } }
                );
                updatedCount++;
            }
        }

        console.log(`\nMaintenance Complete!`);
        console.log(`Updated ${updatedCount} documents.`);
        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Failed to fix data:', err);
        process.exit(1);
    }
}

fixComplaintData();
