const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const PasswordReset = require('../models/PasswordReset');
const { generateNumericOtp, isValidOtp } = require('../shared/otp');
const { isValidEmail, normalizeEmail, isValidIdPhone, normalizePhoneE164 } = require('../shared/identifier');
const { sendOtpEmail } = require('../shared/mailer');
const { sendOtpWhatsApp } = require('../shared/whatsappCloud');

const OTP_EXPIRES_MINUTES = 5;
const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_PER_HOUR = 5;
const OTP_MAX_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRES = '10m';

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

        // --- VALIDASI BIEON ID (Hardware Flow) ---
        if (bieonId) {
            const BieonSystem = require('../models/BieonSystem');
            
            // Normalisasi input
            const normalizedBieonId = String(bieonId).trim();
            
            // 1. Cek apakah ID ada di stok developer (case-insensitive)
            const systemStock = await BieonSystem.findOne({ 
                bieonId: { $regex: new RegExp(`^${normalizedBieonId}$`, 'i') } 
            });
            
            if (!systemStock) {
                // Jika masuk ke sini, artinya bieonId memang benar-benar tidak ada di koleksi BieonSystem
                return res.status(400).json({ message: 'Bieon ID tidak valid atau tidak terdaftar di stok developer.' });
            }

            const exactBieonId = systemStock.bieonId;

            // 2. Cek apakah ID sudah diklaim user lain
            const ownerExists = await User.findOne({ bieonId: exactBieonId });
            if (ownerExists || systemStock.owner) {
                return res.status(400).json({ message: 'Bieon ID sudah digunakan oleh pengguna lain.' });
            }

            // Simpan User Baru
            const newUser = new User({
                email: normalizedEmail,
                password,
                role,
                fullName,
                username,
                dateOfBirth,
                phoneNumber: phoneNumber ? normalizePhoneE164(phoneNumber) : undefined,
                address,
                systemName,
                plnTariff,
                bieonId: exactBieonId,
                technicianId,
                assignedRegion,
                tenantId: `tenant_${String(await User.countDocuments({ role: 'Homeowner' }) + 1).padStart(3, '0')}`
            });

            await newUser.save();

            // 3. Link BieonSystem ke Owner baru (Claiming)
            systemStock.owner = newUser._id;
            await systemStock.save();

            // 4. Link semua Hub yang terkait dengan bieonId ini ke Owner baru
            const Hub = require('../models/Hub');
            const { publishCommand } = require('../config/mqtt');
            
            const hubs = await Hub.find({ bieonId });
            const hubsPayload = [];

            for (const hub of hubs) {
                hub.owner = newUser._id;
                hub.tenantId = newUser.tenantId;
                await hub.save();

                // Format nama hub dari "Hub Node 001" menjadi "hubnode_001"
                let formattedHubId = hub.name.toLowerCase().replace('hub node ', 'hubnode_');
                
                // Format IEEE ke kanonik: uppercase hex tanpa pemisah (misal AABBCCDDEEFF)
                let rawIeee = hub.device_ieee || "0000000000000000";
                let canonicalIeee = rawIeee.replace(/[:\-]/g, '').toUpperCase();

                hubsPayload.push({
                    id: formattedHubId,
                    ieee: canonicalIeee
                });
            }

            // 5. MENGIRIM BOOTSTRAP CLAIM KE HARDWARE SECARA KOLEKTIF
            if (hubsPayload.length > 0) {
                const payload = {
                    tenant_id: newUser.tenantId, 
                    bieon_id: bieonId,
                    hub_id: "hub_001", // ID Master/Gateway
                    hubs: hubsPayload
                };
                
                // Tambahkan RETAIN agar ESP32 yang telat nyala tetap menerimanya
                publishCommand(`bieon/${bieonId}/bootstrap/claim`, payload, { qos: 1, retain: true });
            }

            return res.status(201).json({ message: 'Registrasi berhasil!', user: { id: newUser._id, email: newUser.email, role: newUser.role } });
        }

        // Fallback jika tidak ada bieonId (misal untuk teknisi/admin)
        const newUser = new User({
            email: normalizedEmail,
            password,
            role,
            fullName,
            username,
            dateOfBirth,
            phoneNumber: phoneNumber ? normalizePhoneE164(phoneNumber) : undefined,
            address,
            systemName,
            plnTariff,
            bieonId,
            technicianId,
            assignedRegion
        });

        await newUser.save();

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
            { userId: user._id, role: user.role, bieonId: user.bieonId },
            process.env.JWT_SECRET || 'rahasia_cadangan',
            { expiresIn: '1d' }
        );

        // Update status menjadi aktif saat login
        await User.findByIdAndUpdate(user._id, { status: 'aktif' });

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
        if (updates.systemName !== undefined) allowedUpdates.systemName = updates.systemName;
        if (updates.plnTariff !== undefined) allowedUpdates.plnTariff = updates.plnTariff;
        if (updates.bieonId !== undefined) allowedUpdates.bieonId = updates.bieonId;

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


exports.firebaseLogin = async (req, res) => {
    try {
        const { token, mode } = req.body;
        const admin = require('../config/firebaseAdmin');
        if (!admin) {
            return res.status(501).json({
                success: false,
                message: 'Login Google belum dikonfigurasi di backend (firebase-service-account.json belum tersedia).'
            });
        }

        // 1. Validasi token ke server Firebase (Otomatis mengecek keaslian)
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { email, name, picture, given_name, family_name } = decodedToken;

        // 2. Cari user di MongoDB berdasarkan email
        let user = await User.findOne({ email });

        // 3. Jika user belum ada
        if (!user) {
            // Jika mode-nya adalah login, tapi user tidak ditemukan, lempar error
            if (mode === 'login') {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Akun Google ini belum terdaftar di BIEON. Silakan klik "Sign Up" terlebih dahulu untuk mendaftar.' 
                });
            }

            // Jika mode-nya adalah signup, buatkan akun baru!
            const crypto = require('crypto');
            // Bikin password acak yang sangat rumit karena user ini pakai Google
            const randomPassword = crypto.randomBytes(32).toString('hex');
            
            user = new User({
                email: email,
                fullName: name,
                role: 'Homeowner', // Default role
                password: randomPassword
            });
            await user.save();
        }

        // 4. Jika sukses, buatkan JWT bieon_token seperti sistem login Anda saat ini
        const bieonToken = jwt.sign(
            { userId: user._id, role: user.role, bieonId: user.bieonId },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Kirim kembali ke frontend
        res.status(200).json({ 
            success: true, 
            token: bieonToken, 
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                bieonId: user.bieonId || '',
                firstName: given_name || name?.split(' ')[0] || '',
                lastName: family_name || name?.split(' ').slice(1).join(' ') || ''
            } 
        });

    } catch (error) {
        console.error("Firebase Login Error:", error);
        res.status(401).json({ success: false, message: 'Token tidak valid', detail: error.message });
    }
};

const buildGenericOtpResponse = () => ({
    message: 'Jika akun terdaftar, OTP telah dikirim.'
});

const resolveUserByIdentifier = async (identifierRaw) => {
    const identifier = String(identifierRaw || '').trim();
    if (!identifier) return { type: null, normalized: null, user: null };

    if (isValidEmail(identifier)) {
        const normalized = normalizeEmail(identifier);
        const user = await User.findOne({ email: normalized });
        return { type: 'email', normalized, user };
    }

    const normalizedPhone = normalizePhoneE164(identifier);
    if (isValidIdPhone(normalizedPhone)) {
        const user = await User.findOne({ phoneNumber: normalizedPhone });
        return { type: 'phone', normalized: normalizedPhone, user };
    }

    return { type: null, normalized: null, user: null };
};

// 1) POST /api/auth/forgot-password/request
exports.requestForgotPasswordOtp = async (req, res) => {
    try {
        const { identifier } = req.body;

        const resolved = await resolveUserByIdentifier(identifier);
        if (!resolved.type) {
            return res.status(400).json({ message: 'Identifier tidak valid. Gunakan email atau nomor +62...' });
        }

        // Anti user-enumeration: kalau user tidak ada, selalu respons generik 200.
        if (!resolved.user) {
            return res.status(200).json(buildGenericOtpResponse());
        }

        const user = resolved.user;
        const userId = user._id;

        // Rate limit berbasis DB (per user)
        const latest = await PasswordReset.findOne({ userId }).sort({ createdAt: -1 });
        if (latest && Date.now() - new Date(latest.createdAt).getTime() < OTP_COOLDOWN_MS) {
            return res.status(200).json(buildGenericOtpResponse());
        }

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const countLastHour = await PasswordReset.countDocuments({ userId, createdAt: { $gte: oneHourAgo } });
        if (countLastHour >= OTP_MAX_PER_HOUR) {
            return res.status(200).json(buildGenericOtpResponse());
        }

        const channel = resolved.type === 'email' ? 'email' : 'whatsapp';

        if (channel === 'whatsapp' && !user.phoneNumber) {
            // Tetap generik, tidak mengirim.
            return res.status(200).json(buildGenericOtpResponse());
        }

        // Expire OTP pending lama agar hanya 1 yang aktif
        await PasswordReset.updateMany({ userId, status: 'Pending' }, { status: 'Expired' });

        const otp = generateNumericOtp();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

        const record = await PasswordReset.create({
            userId,
            channel,
            otpHash,
            expiresAt,
            status: 'Pending',
            attempts: 0
        });

        try {
            if (channel === 'email') {
                await sendOtpEmail({ to: user.email, otp, expiresMinutes: OTP_EXPIRES_MINUTES });
            } else {
                await sendOtpWhatsApp({ toPhoneE164: user.phoneNumber, otp, expiresMinutes: OTP_EXPIRES_MINUTES });
            }
        } catch (sendErr) {
            // Ubah status OTP menjadi Expired karena gagal kirim
            await PasswordReset.findByIdAndUpdate(record._id, { status: 'Expired' });
            console.error('OTP Send Error:', sendErr.message || sendErr);
            
            // Ganti ini agar user tahu sistem sedang bermasalah dan tidak kebingungan menunggu email
            return res.status(500).json({ message: 'Sistem gagal mengirimkan email OTP. Pastikan email valid atau coba lagi nanti.' });
        }

        return res.status(200).json(buildGenericOtpResponse());
    } catch (error) {
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
};

// 2) POST /api/auth/forgot-password/verify
exports.verifyForgotPasswordOtp = async (req, res) => {
    try {
        const { identifier, otp } = req.body;

        const resolved = await resolveUserByIdentifier(identifier);
        if (!resolved.type || !isValidOtp(otp)) {
            return res.status(400).json({ message: 'OTP tidak valid atau kedaluwarsa.' });
        }

        if (!resolved.user) {
            return res.status(400).json({ message: 'OTP tidak valid atau kedaluwarsa.' });
        }

        const user = resolved.user;
        const userId = user._id;

        const record = await PasswordReset.findOne({ userId, status: 'Pending' }).sort({ createdAt: -1 });
        if (!record) {
            return res.status(400).json({ message: 'OTP tidak valid atau kedaluwarsa.' });
        }

        if (new Date() > record.expiresAt) {
            record.status = 'Expired';
            await record.save();
            return res.status(400).json({ message: 'OTP tidak valid atau kedaluwarsa.' });
        }

        if (record.attempts >= OTP_MAX_ATTEMPTS) {
            record.status = 'Expired';
            await record.save();
            return res.status(400).json({ message: 'OTP tidak valid atau kedaluwarsa.' });
        }

        const ok = await bcrypt.compare(String(otp).trim(), record.otpHash);
        if (!ok) {
            record.attempts += 1;
            if (record.attempts >= OTP_MAX_ATTEMPTS) {
                record.status = 'Expired';
            }
            await record.save();
            return res.status(400).json({ message: 'OTP tidak valid atau kedaluwarsa.' });
        }

        record.status = 'Used';
        await record.save();

        const resetToken = jwt.sign(
            { type: 'password_reset', userId: String(userId) },
            process.env.JWT_SECRET || 'rahasia_cadangan',
            { expiresIn: RESET_TOKEN_EXPIRES }
        );

        return res.status(200).json({ resetToken });
    } catch (error) {
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
};

// 3) POST /api/auth/forgot-password/reset
exports.resetForgotPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: 'resetToken dan newPassword wajib diisi.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'rahasia_cadangan');
        } catch (e) {
            return res.status(400).json({ message: 'resetToken tidak valid atau kedaluwarsa.' });
        }

        if (!decoded || decoded.type !== 'password_reset' || !decoded.userId) {
            return res.status(400).json({ message: 'resetToken tidak valid atau kedaluwarsa.' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: 'resetToken tidak valid atau kedaluwarsa.' });
        }

        user.password = newPassword;
        await user.save();

        await PasswordReset.updateMany({ userId: user._id, status: 'Pending' }, { status: 'Expired' });

        return res.status(200).json({ message: 'Password berhasil direset.' });
    } catch (error) {
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
};

/**
 * Ganti Password (Memerlukan autentikasi)
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Password lama salah' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memperbarui password', error: error.message });
    }
};
