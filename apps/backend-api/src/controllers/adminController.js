const User = require('../models/User');
const Hub = require('../models/Hub');
const Device = require('../models/Device');
const dashboardService = require('../modules/admin/dashboardService');
const technicianService = require('../modules/users/technicianService');
const homeownerService = require('../modules/users/homeownerService');

// ========================================================
// GET /api/admin/homeowners
// Mengambil semua user dengan role Homeowner beserta hub mereka
// Hanya bisa diakses oleh SuperAdmin
// ========================================================
exports.getAllHomeowners = async (req, res) => {
    try {
        // Ambil semua user yang rolenya 'Homeowner', tanpa field password
        const homeowners = await User.find({ role: 'Homeowner' }).select('-password').lean();

        // Untuk setiap homeowner, ambil jumlah hub yang mereka punya
        const homeownersWithStats = await Promise.all(
            homeowners.map(async (user) => {
                const [hubCount, deviceCount] = await Promise.all([
                    Hub.countDocuments({ owner: user._id }),
                    Device.countDocuments({ owner: user._id }),
                ]);

                return {
                    _id: user._id,
                    fullName: user.fullName,
                    username: user.username || '-',
                    email: user.email,
                    phoneNumber: user.phoneNumber || '-',
                    address: user.address || '-',
                    systemName: user.systemName || '-',
                    plnTariff: user.plnTariff || '-',
                    bieonId: user.bieonId || '-',
                    status: user.status || 'aktif',
                    role: user.role,
                    registrationDate: user.createdAt,
                    totalHubs: hubCount,
                    totalDevices: deviceCount,
                };
            })
        );

        res.status(200).json({
            success: true,
            total: homeownersWithStats.length,
            data: homeownersWithStats,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data homeowner',
            error: error.message,
        });
    }
};
// ========================================================
// GET /api/admin/homeowners/available
// Mengambil homeowner yang belum memiliki teknisi
// ========================================================
exports.getAvailableHomeowners = async (req, res) => {
    try {
        const homeowners = await User.find({
            role: 'Homeowner',
            $or: [
                { assignedTechnician: { $exists: false } },
                { assignedTechnician: null }
            ]
        }).select('fullName email phoneNumber address systemName assignedTechnician').lean();

        res.status(200).json({
            success: true,
            data: homeowners,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data homeowner yang tersedia.',
            error: error.message,
        });
    }
};

// ========================================================
// GET /api/admin/homeowners/:id
// Mengambil detail homeowner beserta stats
// ========================================================
exports.getHomeownerById = async (req, res) => {
    try {
        const data = await homeownerService.getHomeownerById(req.params.id);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            success: false,
            message: statusCode >= 500 ? 'Gagal mengambil detail homeowner.' : error.message,
            error: error.message,
        });
    }
};

// ========================================================
// POST /api/admin/homeowners
// Membuat akun homeowner baru
// ========================================================
exports.createHomeowner = async (req, res) => {
    try {
        const created = await homeownerService.createHomeowner(req.body);

        res.status(201).json({
            success: true,
            message: 'Akun homeowner berhasil dibuat.',
            data: created,
        });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            success: false,
            message: statusCode >= 500 ? 'Gagal membuat akun homeowner.' : error.message,
            error: error.message,
        });
    }
};

// ========================================================
// PUT /api/admin/homeowners/:id
// Mengupdate data homeowner berdasarkan id
// ========================================================
exports.updateHomeowner = async (req, res) => {
    try {
        const updated = await homeownerService.updateHomeowner(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: 'Data homeowner berhasil diperbarui.',
            data: updated,
        });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            success: false,
            message: statusCode >= 500 ? 'Gagal memperbarui data homeowner.' : error.message,
            error: error.message,
        });
    }
};

// ========================================================
// GET /api/admin/homeowners/:id/stats
// Mengambil data statistik device/hub homeowner
// ========================================================
exports.getHomeownerStats = async (req, res) => {
    try {
        const stats = await homeownerService.getHomeownerStats(req.params.id);

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            success: false,
            message: statusCode >= 500 ? 'Gagal mengambil statistik homeowner.' : error.message,
            error: error.message,
        });
    }
};

// ========================================================
// DELETE /api/admin/homeowners/:id
// Menghapus akun homeowner dan semua hub terkait
// Hanya bisa diakses oleh SuperAdmin
// ========================================================
exports.deleteHomeowner = async (req, res) => {
    try {
        const { id } = req.params;

        // Cari user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        if (user.role !== 'Homeowner') {
            return res.status(400).json({ success: false, message: 'Hanya bisa menghapus user dengan role Homeowner' });
        }

        // Hapus semua hub terkait
        await Hub.deleteMany({ owner: id });

        // Hapus user
        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Akun homeowner dan perangkat terkait berhasil dihapus',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus homeowner',
            error: error.message,
        });
    }
};

// ========================================================
// GET /api/admin/dashboard/metrics
// Mengambil aggregated metrics untuk dashboard
// Menampilkan: Total Users, Total Hubs, Total Devices, Total Complaints
// Hanya bisa diakses oleh SuperAdmin
// ========================================================
exports.getDashboardMetrics = async (req, res) => {
    try {
        const metrics = await dashboardService.getDashboardMetrics();

        res.status(200).json({
            success: true,
            data: metrics,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data dashboard metrics',
            error: error.message,
        });
    }
};

// ========================================================
// POST /api/admin/technicians
// Membuat akun teknisi baru
// Hanya bisa diakses oleh SuperAdmin
// ========================================================
exports.createTechnician = async (req, res) => {
    try {
        const payload = {
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            position: req.body.position,
            experience: req.body.experience,
            specializations: req.body.specializations,
            workArea: req.body.workArea,
            coverageAreas: req.body.coverageAreas,
            workSchedule: req.body.workSchedule,
            status: req.body.status,
        };

        const created = await technicianService.createTechnician(payload);

        res.status(201).json({
            success: true,
            message: 'Akun teknisi berhasil dibuat.',
            data: created,
        });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            success: false,
            message: statusCode >= 500 ? 'Gagal membuat akun teknisi.' : error.message,
            error: error.message,
        });
    }
};

// ========================================================
// GET /api/admin/technicians
// Mengambil daftar teknisi dengan filter dan pagination
// Hanya bisa diakses oleh SuperAdmin
// ========================================================
exports.getAllTechnicians = async (req, res) => {
    try {
        const result = await technicianService.listTechnicians(req.query);

        res.status(200).json({
            success: true,
            total: result.total,
            page: result.page,
            limit: result.limit,
            data: result.data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar teknisi.',
            error: error.message,
        });
    }
};

// ========================================================
// GET /api/admin/technicians/:id
// Mengambil detail teknisi berdasarkan id
// Hanya bisa diakses oleh SuperAdmin
// ========================================================
exports.getTechnicianById = async (req, res) => {
    try {
        const data = await technicianService.getTechnicianById(req.params.id);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            success: false,
            message: statusCode >= 500 ? 'Gagal mengambil detail teknisi.' : error.message,
            error: error.message,
        });
    }
};

// ========================================================
// PUT /api/admin/technicians/:id
// Mengupdate data teknisi berdasarkan id
// Hanya bisa diakses oleh SuperAdmin
// ========================================================
exports.updateTechnician = async (req, res) => {
    try {
        const payload = {
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            position: req.body.position,
            experience: req.body.experience,
            specializations: req.body.specializations,
            workArea: req.body.workArea,
            coverageAreas: req.body.coverageAreas,
            workSchedule: req.body.workSchedule,
            status: req.body.status,
        };

        const updated = await technicianService.updateTechnician(req.params.id, payload);

        res.status(200).json({
            success: true,
            message: 'Data teknisi berhasil diperbarui.',
            data: updated,
        });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            success: false,
            message: statusCode >= 500 ? 'Gagal memperbarui data teknisi.' : error.message,
            error: error.message,
        });
    }
};

// ========================================================
// POST /api/admin/technicians/:id/assign-clients
// Menugaskan beberapa pelanggan ke teknisi tertentu
// Hanya bisa diakses oleh SuperAdmin
// ========================================================
exports.assignClientsToTechnician = async (req, res) => {
    try {
        const technicianId = req.params.id;
        const { clientIds } = req.body;

        if (!Array.isArray(clientIds)) {
            return res.status(400).json({ success: false, message: 'clientIds harus berupa array.' });
        }

        // Pastikan teknisi ada
        const technician = await User.findOne({ _id: technicianId, role: 'Technician' });
        if (!technician) {
            return res.status(404).json({ success: false, message: 'Teknisi tidak ditemukan.' });
        }

        // Update semua homeowner yang dipilih untuk ditugaskan ke teknisi ini
        const updateResult = await User.updateMany(
            { _id: { $in: clientIds }, role: 'Homeowner' },
            { $set: { assignedTechnician: technicianId } }
        );

        res.status(200).json({
            success: true,
            message: `${updateResult.modifiedCount} pelanggan berhasil ditugaskan ke teknisi.`,
            modifiedCount: updateResult.modifiedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menugaskan pelanggan ke teknisi.',
            error: error.message,
        });
    }
};

// ========================================================
// DELETE /api/admin/technicians/:id
// Menghapus akun teknisi
// Hanya bisa diakses oleh SuperAdmin
// ========================================================
exports.deleteTechnician = async (req, res) => {
    try {
        const deleted = await technicianService.deleteTechnician(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Akun teknisi berhasil dihapus.',
            data: deleted,
        });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).json({
            success: false,
            message: statusCode >= 500 ? 'Gagal menghapus akun teknisi.' : error.message,
            error: error.message,
        });
    }
};
