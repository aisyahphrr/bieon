const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
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

module.exports = authMiddleware;
