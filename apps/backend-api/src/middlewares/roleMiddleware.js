/**
 * Middleware untuk mengecek role user.
 * Digunakan SETELAH authMiddleware agar req.user sudah terisi.
 * 
 * @param  {...string} roles - Daftar role yang diperbolehkan (contoh: 'SuperAdmin', 'Technician')
 * @returns middleware function
 */
const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Akses ditolak. Tidak ada sesi pengguna.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Akses ditolak. Hanya ${roles.join(' atau ')} yang dapat mengakses endpoint ini.`
            });
        }

        next();
    };
};

module.exports = roleMiddleware;
