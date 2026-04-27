const mongoose = require('mongoose');
const User = require('../src/models/User');

const uri = 'mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?appName=Cluster0';

async function fixAlan() {
    try {
        console.log('Connecting to Atlas...');
        await mongoose.connect(uri);
        console.log('Connected.');

        const alan = await User.findOne({ email: 'alan@bieon.id' });
        if (!alan) {
            console.log('Alan not found.');
            return;
        }

        console.log('Current Alan:', alan.fullName);
        
        alan.username = alan.username || 'alan_penggendong';
        alan.nik = alan.nik || '3201234567890001';
        alan.dateOfBirth = alan.dateOfBirth || '1995-05-15';
        alan.joinDate = alan.joinDate || '2023-01-10';
        
        await alan.save();
        console.log('Alan updated successfully.');
        console.log({
            username: alan.username,
            nik: alan.nik,
            dateOfBirth: alan.dateOfBirth,
            joinDate: alan.joinDate
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

fixAlan();
