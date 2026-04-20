const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables dari folder apps/backend-api
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Hub = require('../src/models/Hub');
const Device = require('../src/models/Device');

const seedData = async () => {
    try {
        console.log('🔄 Menghubungkan ke MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Terhubung ke database:', mongoose.connection.db.databaseName);

        // 1. Buat Dummy Homeowner jika belum ada (Device butuh referensi Owner)
        let owner = await User.findOne({ role: 'Homeowner' });
        if (!owner) {
            owner = new User({
                fullName: 'Homeowner Dummy',
                email: 'homeowner@bieon.com',
                password: 'password123',
                role: 'Homeowner',
                phoneNumber: '081234567891',
                address: 'Dummy Address'
            });
            await owner.save();
            console.log('👤 Dummy Homeowner dibuat (homeowner@bieon.com).');
        } else {
            console.log(`👤 Menggunakan Homeowner yang sudah ada: ${owner.email}`);
        }

        // 2. Buat Dummy Hub jika belum ada (Device butuh referensi Hub)
        let hub = await Hub.findOne({ owner: owner._id });
        if (!hub) {
            hub = new Hub({
                name: 'Main Hub',
                bieonId: 'BIEON-HUB-001',
                owner: owner._id,
                status: 'Online'
            });
            await hub.save();
            console.log('🔌 Dummy Hub dibuat (BIEON-HUB-001).');
        } else {
            console.log(`🔌 Menggunakan Hub yang sudah ada: ${hub.name}`);
        }

        // 3. Cek jumlah existing device, batalkan kalau sudah ada isinya
        const countDevices = await Device.countDocuments();
        if (countDevices > 0) {
            console.log(`⚠️ Database sudah memiliki ${countDevices} Devices! Kita tidak perlu menambahkannya lagi.`);
            process.exit(0);
        }

        // 4. Tambahkan Dummy Devices
        const dummyDevices = [
            { name: 'Smart TV Ruang Keluarga', type: 'AC', status: 'ON', hub: hub._id, owner: owner._id, room: 'Ruang Keluarga' }, // Menggunakan enum 'AC', 'Light', atau 'Sensor' sesuai schema. Tipe aslinya mungkin Smart TV diatur sbg device apapun.
            { name: 'Lampu Teras', type: 'Light', status: 'OFF', hub: hub._id, owner: owner._id, room: 'Teras' },
            { name: 'Sensor Suhu Kamar', type: 'Sensor', status: 'ON', hub: hub._id, owner: owner._id, room: 'Kamar Utama' },
            { name: 'Lampu Dapur', type: 'Light', status: 'ON', hub: hub._id, owner: owner._id, room: 'Dapur' },
            { name: 'AC Kamar Anak', type: 'AC', status: 'OFFLINE', hub: hub._id, owner: owner._id, room: 'Kamar Anak' },
            { name: 'Smart Light Kamar Mandi', type: 'Light', status: 'OFF', hub: hub._id, owner: owner._id, room: 'Kamar Mandi' }
        ];

        console.log('🔄 Menyimpan Dummy Devices...');
        await Device.insertMany(dummyDevices);
        console.log('✅ Berhasil menyimpan 6 Dummy Devices ke database!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Gagal seeding data:', error.message);
        process.exit(1);
    }
};

seedData();