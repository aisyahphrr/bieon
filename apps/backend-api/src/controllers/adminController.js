const User = require('../models/User');
const Hub = require('../models/Hub');

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
                const hubCount = await Hub.countDocuments({ owner: user._id });

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
                    role: user.role,
                    registrationDate: user.createdAt,
                    totalHubs: hubCount,
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
