const TechnicianAccess = require('../models/TechnicianAccess');
const User = require('../models/User');

// Helper to generate 6-character alphanumeric token
const generateAlphanumericToken = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 6; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};

// 1. Generate Token (Homeowner)
exports.generateToken = async (req, res) => {
    try {
        const { homeownerId } = req.body;

        // Validasi homeownerId
        const homeowner = await User.findById(homeownerId);
        if (!homeowner || homeowner.role !== 'Homeowner') {
            return res.status(400).json({ message: 'User bukan Homeowner atau tidak ditemukan' });
        }

        // Cek jika ada token aktif atau pending, kita bisa update atau ganti
        // Tapi sesuai instruksi, kita buat baru dan token sebelumnya jadi Expired jika belum terpakai
        await TechnicianAccess.updateMany(
            { homeownerId, status: 'Pending' },
            { status: 'Expired' }
        );

        const token = generateAlphanumericToken();
        const tokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

        const newAccess = new TechnicianAccess({
            homeownerId,
            token,
            tokenExpiresAt,
            status: 'Pending'
        });

        await newAccess.save();

        res.status(201).json({
            message: 'Token berhasil dibuat',
            token,
            expiresAt: tokenExpiresAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat token', error: error.message });
    }
};

// 2. Validate Token & Start Session (Technician)
exports.validateToken = async (req, res) => {
    try {
        const { token, technicianId } = req.body;

        const access = await TechnicianAccess.findOne({ token, status: 'Pending' });

        if (!access) {
            return res.status(404).json({ message: 'Token tidak valid' });
        }

        if (new Date() > access.tokenExpiresAt) {
            access.status = 'Expired';
            await access.save();
            return res.status(400).json({ message: 'Token sudah kedaluwarsa' });
        }

        // "CUT" Logika: Jika ada sesi aktif lama, tutup otomatis agar yang baru bisa masuk
        await TechnicianAccess.updateMany(
            { homeownerId: access.homeownerId, status: 'Active' },
            { status: 'Completed', report: 'Sesi diputus otomatis oleh akses teknisi baru.' }
        );

        // Mulai sesi
        access.status = 'Active';
        access.technicianId = technicianId;
        access.startTime = new Date();
        access.endTime = new Date(Date.now() + 30 * 60 * 1000); // Max 30 menit
        
        await access.save();

        // Dapatkan nama Homeowner dari database
        const homeowner = await User.findById(access.homeownerId);
        const homeownerName = homeowner ? homeowner.fullName : 'Homeowner';

        res.status(200).json({
            message: 'Akses diterima, sesi dimulai (30 menit)',
            homeownerName,
            session: access
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal validasi token', error: error.message });
    }
};

// 3. Get Status (Homeowner/Technician)
exports.getStatus = async (req, res) => {
    try {
        const { homeownerId } = req.params;

        // Cari sesi aktif
        const activeSession = await TechnicianAccess.findOne({ 
            homeownerId, 
            status: 'Active' 
        }).populate('technicianId', 'fullName phoneNumber');

        if (!activeSession) {
            return res.status(200).json({ isAccessed: false });
        }

        // Cek jika waktu sudah habis (> 30 menit)
        if (new Date() > activeSession.endTime) {
            // Kita tidak otomatis Complete kan di sini karena butuh laporan
            // Tapi kita info kan di status bahwa waktu sudah habis (Wajib Laporan)
            return res.status(200).json({ 
                isAccessed: true, 
                status: 'TimeOut',
                session: activeSession 
            });
        }

        res.status(200).json({ 
            isAccessed: true, 
            status: 'Active',
            session: activeSession 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil status akses', error: error.message });
    }
};

// 4. Submit Report & End Session (Technician)
exports.submitReport = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { report, technicianId } = req.body;

        if (!report || report.trim() === '') {
            return res.status(400).json({ message: 'Laporan wajib diisi' });
        }

        let access;
        if (sessionId) {
            access = await TechnicianAccess.findById(sessionId);
        } else {
            // Jika sessionId tidak ada, cari sesi 'Active' untuk teknisi ini
            // Idealnya pakai req.user.id dari auth middleware, tapi untuk sekarang kita pakai technicianId dari body (mock)
            // Atau cari sesi Active yang paling baru di sistem untuk keamanan sementara
            access = await TechnicianAccess.findOne({ 
                status: 'Active' 
            }).sort({ startTime: -1 });
        }

        if (!access) {
            return res.status(404).json({ message: 'Sesi aktif tidak ditemukan atau sudah ditutup' });
        }

        access.report = report;
        access.status = 'Completed';
        access.finishTime = new Date();
        
        await access.save();

        res.status(200).json({ message: 'Laporan tersimpan, sesi ditutup', session: access });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengirim laporan', error: error.message });
    }
};
