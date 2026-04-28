require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Alert = require('./src/models/Alert');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for Seeding Alerts');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedAlerts = async () => {
    await connectDB();

    try {
        // Fetch existing users
        const homeowners = await User.find({ role: 'homeowner' });
        const technicians = await User.find({ role: 'technician' });
        const admins = await User.find({ role: { $in: ['admin', 'SuperAdmin'] } });

        if (homeowners.length === 0 || technicians.length === 0 || admins.length === 0) {
            console.log("Mohon pastikan ada minimal 1 Homeowner, 1 Technician, dan 1 Admin di database sebelum seeding.");
            process.exit(0);
        }

        const alertsToInsert = [];

        // --- 1. HOMEOWNER ALERTS ---
        // Kita buat beragam notifikasi untuk setiap Homeowner (tanpa gas)
        homeowners.forEach(ho => {
            alertsToInsert.push(
                {
                    owner: ho._id,
                    category: 'Keamanan',
                    room: 'Garasi Depan',
                    message: 'Sensor mendeteksi pergerakan mencurigakan pada pukul 02:15 AM.',
                    type: 'Bahaya',
                    isRead: false,
                    link: 'kendali'
                },
                {
                    owner: ho._id,
                    category: 'Air Sanitasi',
                    room: 'Tandon Utama',
                    message: 'pH Air turun drastis ke level 5.5. Mohon periksa filter Anda.',
                    type: 'Waspada',
                    isRead: false,
                    link: 'kendali'
                },
                {
                    owner: ho._id,
                    category: 'Kenyamanan',
                    room: 'Kamar Tidur Utama',
                    message: 'Suhu ruangan melebihi 30°C, AC otomatis dinyalakan.',
                    type: 'Info',
                    isRead: true,
                    link: 'kendali'
                },
                {
                    owner: ho._id,
                    category: 'Energi',
                    room: 'Semua Ruangan',
                    message: 'Penggunaan listrik bulan ini sudah mencapai 90% dari batas bulanan Anda.',
                    type: 'Warning',
                    isRead: false,
                    link: 'history-energi'
                },
                {
                    owner: ho._id,
                    category: 'Sistem',
                    room: 'Dapur',
                    message: 'Jadwal otomatisasi (Lampu Taman) berhasil dieksekusi.',
                    type: 'Success',
                    isRead: true,
                    link: 'kendali'
                }
            );
        });

        // --- 2. TECHNICIAN ALERTS ---
        technicians.forEach(tech => {
            alertsToInsert.push(
                {
                    owner: tech._id,
                    category: 'Pengaduan',
                    message: 'Peringatan: Tiket TCK-001 hampir melewati batas SLA (Overdue Respons).',
                    type: 'Warning',
                    isRead: false,
                    link: 'pengaduan'
                },
                {
                    owner: tech._id,
                    category: 'Sistem',
                    message: 'Permintaan akses Data Log untuk BIEON ID-010 telah disetujui SuperAdmin.',
                    type: 'Success',
                    isRead: false,
                    link: 'pengaduan'
                },
                {
                    owner: tech._id,
                    category: 'Sistem',
                    message: 'Jadwal Pemeliharaan Rutin untuk Area B dijadwalkan hari ini.',
                    type: 'Info',
                    isRead: true,
                    link: 'pengaduan'
                }
            );
        });

        // --- 3. ADMIN / SUPERADMIN ALERTS ---
        admins.forEach(admin => {
            alertsToInsert.push(
                {
                    owner: admin._id,
                    category: 'Sistem',
                    message: 'KRITIS: 3 Hub IoT di Perumahan BIEON Green offline secara bersamaan.',
                    type: 'Danger',
                    isRead: false,
                    link: 'admin-dashboard'
                },
                {
                    owner: admin._id,
                    category: 'Pengaduan',
                    message: 'SLA Pelanggaran: Teknisi Budi gagal merespons tiket TCK-045 dalam 30 menit.',
                    type: 'Warning',
                    isRead: false,
                    link: 'admin-complaint'
                },
                {
                    owner: admin._id,
                    category: 'Sistem',
                    message: 'Laporan Performa Teknisi Bulan April sudah siap untuk diunduh.',
                    type: 'Success',
                    isRead: true,
                    link: 'admin-dashboard'
                }
            );
        });

        // Hapus data dummy sebelumnya yang mungkin ada (Optional, agar tidak menumpuk terus jika dijalankan berulang)
        // Disini kita biarkan menumpuk atau hapus spesifik. Lebih aman insert saja.
        
        await Alert.insertMany(alertsToInsert);
        console.log(`Berhasil menyuntikkan ${alertsToInsert.length} data notifikasi!`);
        
    } catch (error) {
        console.error("Gagal melakukan seeding:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedAlerts();
