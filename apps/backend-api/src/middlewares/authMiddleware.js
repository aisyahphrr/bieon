const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    // Ambil token dari header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rahasia_cadangan');
        req.user = decoded; // Berisi userId dan role
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token tidak valid atau sudah kadaluwarsa.' });
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Anda tidak memiliki hak akses untuk melakukan tindakan ini.' 
            });
        }
        next();
    };
};

module.exports = protect; // Untuk backward compatibility
module.exports.protect = protect;
module.exports.restrictTo = restrictTo;
