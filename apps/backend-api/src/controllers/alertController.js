const Alert = require('../models/Alert');

/**
 * GET /api/alerts
 * Mendapatkan daftar notifikasi berdasarkan role pengguna.
 */
exports.getAlerts = async (req, res) => {
    try {
        const { role, userId } = req.user;
        let query = {};

        // Filter Role Logic
        if (role.toLowerCase() === 'homeowner') {
            // Jika Homeowner, hanya ambil notifikasi miliknya (terkait rumah/perangkatnya)
            query.owner = userId;
        } else if (role.toLowerCase() === 'technician') {
            // Jika Teknisi, ambil notifikasi miliknya (tugas, sistem, teguran)
            query.owner = userId;
        } else if (role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin') {
            // Jika SuperAdmin/Admin, ambil notifikasi miliknya (sistem makro, operasional)
            query.owner = userId;
            // Atau bisa ditambahkan logika khusus jika SA butuh melihat semua notifikasi global
            // Namun karena desain sistem kita "push" notif langsung ke ID Admin saat ada kejadian,
            // mencari berdasarkan owner (Admin ID) sudah cukup.
        }

        const alerts = await Alert.find(query)
            .sort({ date: -1 })
            .limit(100);

        res.status(200).json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi', error: error.message });
    }
};

/**
 * PUT /api/alerts/:id/read
 * Menandai satu notifikasi sebagai telah dibaca
 */
exports.markAsRead = async (req, res) => {
    try {
        const alertId = req.params.id;
        
        // Memastikan notifikasi benar ada dan update isRead menjadi true
        const updatedAlert = await Alert.findOneAndUpdate(
            { _id: alertId, owner: req.user.userId },
            { isRead: true },
            { new: true }
        );

        if (!updatedAlert) {
            return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan atau bukan milik Anda' });
        }

        res.status(200).json({ success: true, message: 'Notifikasi ditandai sudah dibaca', data: updatedAlert });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengubah status baca', error: error.message });
    }
};

/**
 * PUT /api/alerts/seen-all
 * Menandai semua notifikasi unread sebagai "seen" (dilihat tapi belum ditekan/dibaca)
 */
exports.markAllAsSeen = async (req, res) => {
    try {
        await Alert.updateMany(
            { owner: req.user.userId, $or: [{ isSeen: false }, { isSeen: { $exists: false } }] }, 
            { $set: { isSeen: true } }
        );
        res.status(200).json({ success: true, message: 'Semua notifikasi ditandai sebagai dilihat' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengubah status dilihat', error: error.message });
    }
};

/**
 * GET /api/alerts/seed
 * Endpoint sementara untuk men-seed data dummy.
 */
exports.seedAlerts = async (req, res) => {
    try {
        const User = require('../models/User');
        
        // Hapus semua notifikasi lama
        await Alert.deleteMany({});

        const homeowners = await User.find({ role: { $regex: /^homeowner$/i } });
        const technicians = await User.find({ role: { $regex: /^technician$/i } });
        const admins = await User.find({ role: { $regex: /admin/i } });

        if (homeowners.length === 0 || technicians.length === 0 || admins.length === 0) {
            return res.status(400).json({ success: false, message: 'Minimal butuh 1 HO, 1 Teknisi, 1 Admin di DB' });
        }

        const alertsToInsert = [];

        // 1. HOMEOWNER
        homeowners.forEach(ho => {
            alertsToInsert.push(
                { owner: ho._id, category: 'Keamanan', room: 'Garasi Depan', message: 'Sensor mendeteksi pergerakan mencurigakan pada pukul 02:15 AM.', type: 'Bahaya', isRead: false, link: 'kendali' },
                { owner: ho._id, category: 'Air Sanitasi', room: 'Tandon Utama', message: 'pH Air turun drastis ke level 5.5. Mohon periksa filter Anda.', type: 'Waspada', isRead: false, link: 'kendali' },
                { owner: ho._id, category: 'Kenyamanan', room: 'Kamar Tidur Utama', message: 'Suhu ruangan melebihi 30°C, AC otomatis dinyalakan.', type: 'Info', isRead: true, link: 'kendali' },
                { owner: ho._id, category: 'Energi', room: 'Semua Ruangan', message: 'Penggunaan listrik bulan ini sudah mencapai 90% dari batas bulanan Anda.', type: 'Warning', isRead: false, link: 'history-energi' },
                { owner: ho._id, category: 'Sistem', room: 'Dapur', message: 'Jadwal otomatisasi (Lampu Taman) berhasil dieksekusi.', type: 'Success', isRead: true, link: 'kendali' }
            );
        });

        // 2. TECHNICIAN
        technicians.forEach(tech => {
            alertsToInsert.push(
                { owner: tech._id, category: 'Pengaduan', message: 'Peringatan: Tiket TCK-001 hampir melewati batas SLA (Overdue Respons).', type: 'Warning', isRead: false, link: 'pengaduan' },
                { owner: tech._id, category: 'Sistem', message: 'Permintaan akses Data Log untuk BIEON ID-010 telah disetujui SuperAdmin.', type: 'Success', isRead: false, link: 'pengaduan' },
                { owner: tech._id, category: 'Sistem', message: 'Jadwal Pemeliharaan Rutin untuk Area B dijadwalkan hari ini.', type: 'Info', isRead: true, link: 'pengaduan' }
            );
        });

        // 3. ADMIN / SUPERADMIN
        admins.forEach(admin => {
            alertsToInsert.push(
                { owner: admin._id, category: 'Sistem', message: 'KRITIS: 3 Hub IoT di Perumahan BIEON Green offline secara bersamaan.', type: 'Danger', isRead: false, link: 'admin-dashboard' },
                { owner: admin._id, category: 'Pengaduan', message: 'SLA Pelanggaran: Teknisi Budi gagal merespons tiket TCK-045 dalam 30 menit.', type: 'Warning', isRead: false, link: 'admin-complaint' },
                { owner: admin._id, category: 'Sistem', message: 'Laporan Performa Teknisi Bulan April sudah siap untuk diunduh.', type: 'Success', isRead: true, link: 'admin-dashboard' }
            );
        });

        await Alert.insertMany(alertsToInsert);
        res.status(200).json({ success: true, message: `Berhasil hapus data lama & suntik ${alertsToInsert.length} data baru!` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal seeding', error: error.message });
    }
};
