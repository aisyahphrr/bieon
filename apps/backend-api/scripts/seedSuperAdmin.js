require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const seedSuperAdmin = async () => {
    try {
        // Koneksi ke MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Terhubung ke MongoDB...');

        const superAdminEmail = 'superadmin@bieon.com';

        // Cek apakah SuperAdmin sudah ada
        const existingAdmin = await User.findOne({ email: superAdminEmail });
        if (existingAdmin) {
            console.log('⚠️ Akun SuperAdmin sudah ada!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            process.exit(0);
        }

        // Buat akun baru
        const newAdmin = new User({
            email: superAdminEmail,
            password: 'superadmin123',
            role: 'SuperAdmin',
            fullName: 'Super Administrator'
        });

        await newAdmin.save();
        console.log('🎉 Berhasil membuat akun SuperAdmin default!');
        console.log('Email: superadmin@bieon.com');
        console.log('Password: superadmin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Terjadi kesalahan:', error.message);
        process.exit(1);
    }
};

seedSuperAdmin();
