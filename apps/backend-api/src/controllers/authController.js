const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Fungsi Registrasi
exports.register = async (req, res) => {
    try {
        const { email, password, role, fullName, username, dateOfBirth, phoneNumber, address, systemName, plnTariff, bieonId, technicianId, assignedRegion } = req.body;

        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedEmail || !password || !fullName) {
            return res.status(400).json({ message: 'Email, password, dan fullName wajib diisi.' });
        }

        // Cek apakah email sudah dipakai
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar!' });
        }

        // Buat user baru (Data yang kosong dari frontend akan otomatis diabaikan oleh MongoDB)
        const newUser = new User({
            email: normalizedEmail,
            password,
            role,
            fullName,
            username,
            dateOfBirth,
            phoneNumber,
            address,
            systemName,
            plnTariff,
            bieonId,
            technicianId,
            assignedRegion
        });

        await newUser.save(); // Password otomatis dienkripsi karena hook di User.js sebelumnya

        res.status(201).json({ message: 'Registrasi berhasil!', user: { id: newUser._id, email: newUser.email, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
};

// Fungsi Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: 'Email dan password wajib diisi!' });
        }

        // Cari user berdasarkan email
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: 'Email tidak ditemukan!' });
        }

        // Cocokkan password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password salah!' });
        }

        // Buat Kunci JWT (Berlaku 1 Hari)
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'rahasia_cadangan',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login berhasil!',
            token,
            user: { id: user._id, fullName: user.fullName, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
};

// Fungsi untuk mengambil data profil user yang sedang login
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data profil', error: error.message });
    }
};

// Fungsi untuk update data profile / settings
exports.updateSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updates = req.body;

        const allowedUpdates = {};
        if (updates.username !== undefined) allowedUpdates.username = updates.username;
        if (updates.fullName !== undefined) allowedUpdates.fullName = updates.fullName;
        if (updates.phoneNo !== undefined) allowedUpdates.phoneNumber = updates.phoneNo;
        if (updates.dob !== undefined) allowedUpdates.dateOfBirth = updates.dob;
        if (updates.address !== undefined) allowedUpdates.address = updates.address;
        if (updates.email !== undefined) allowedUpdates.email = updates.email;

        const updatedUser = await User.findByIdAndUpdate(userId, allowedUpdates, { new: true }).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        res.status(200).json({ message: 'Profil berhasil diperbarui', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui profil', error: error.message });
    }
};

// Fungsi Logout (hanya memberikan response sukses)
exports.logout = async (req, res) => {
    try {
        res.status(200).json({ message: 'Logout berhasil' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal melakukan logout', error: error.message });
    }
};