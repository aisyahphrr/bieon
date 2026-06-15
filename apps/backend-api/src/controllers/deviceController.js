const Device = require('../models/Device');
const Hub = require('../models/Hub');
const { startPermitJoin } = require('../config/mqtt');

exports.startPairing = async (req, res) => {
    try {
        const { qrCode } = req.body;
        
        // Validasi 14 digit di backend (Security layer)
        if (!/^\d{14}$/.test(qrCode)) {
            return res.status(400).json({ message: 'Format QR Code tidak valid (Harus 14 digit angka).' });
        }

        // Buka jaringan Zigbee (TIDAK menyimpan apa-apa ke DB dulu)
        startPermitJoin(60); 

        res.status(200).json({ 
            message: 'Mode pairing aktif (60s). Silakan tekan tombol pairing di alat kamu.' 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengaktifkan mode pairing', error: error.message });
    }
};

exports.startOpenJoin = async (req, res) => {
    try {
        let { hubId, duration = 30, mode, hub_only } = req.body || {};
        
        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = req.user.userId;

        // Jika hubId tidak diberikan, cari otomatis Hub Node milik user
        if (!hubId) {
            const userHubs = await Hub.find({ owner: userId }).lean();
            if (userHubs.length === 0) {
                return res.status(400).json({ message: 'Hub Node belum terdaftar. Silakan tambahkan Hub Node terlebih dahulu sebelum menambahkan perangkat!' });
            }
            // Pilih Hub Node pertama yang terdaftar secara otomatis
            hubId = String(userHubs[0]._id);
        }

        // Resolve hubId: allow either the BIEON device id (bieon_001) or Mongo _id
        let targetBieonId = null;
        let targetHub = null;
        // If already looks like bieon_xxx, use directly
        if (/^bieon[_\-]?\d+/i.test(String(hubId))) {
            targetBieonId = String(hubId);
            targetHub = await Hub.findOne({ bieonId: targetBieonId }).lean();
        } else {
            // Try to resolve as Hub._id
            try {
                targetHub = await Hub.findById(hubId).lean();
                if (targetHub && targetHub.bieonId) targetBieonId = targetHub.bieonId;
            } catch (err) {
                // ignore lookup error, will try fallback
            }
        }

        // Menjamin Hub Node terdaftar dan fisik Hub Node sudah terhubung (memiliki IEEE) sebelum memulai open join
        if (!targetHub || !targetHub.device_ieee) {
            return res.status(400).json({ message: 'Fisik Hub Node belum terhubung. Silakan pasangkan (pairing) Hub Node fisik Anda terlebih dahulu sebelum menambahkan perangkat!' });
        }

        if (String(req.user.role || '').toLowerCase() !== 'superadmin') {
            const BieonSystem = require('../models/BieonSystem');
            const buildFlexibleBieonIdRegex = (value) => {
                const chars = String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').split('');
                if (chars.length === 0) return null;
                return new RegExp(`^${chars.map((char) => `${char}[^A-Z0-9]*`).join('')}$`, 'i');
            };

            const system = await BieonSystem.findOne({
                $or: [
                    { bieonId: targetBieonId },
                    { bieonId: buildFlexibleBieonIdRegex(targetBieonId) || targetBieonId }
                ]
            }).lean();

            const isHubOwner = targetHub.owner && String(targetHub.owner) === String(userId);
            const isSystemOwner = system && system.owner && String(system.owner) === String(userId);

            if (!isHubOwner && !isSystemOwner) {
                return res.status(403).json({ message: 'Anda tidak memiliki akses untuk membuka open join pada hub ini.' });
            }

            // Self-healing database jika owner Hub kosong
            if (isSystemOwner && !targetHub.owner) {
                await Hub.findByIdAndUpdate(targetHub._id, { $set: { owner: userId } }).catch(() => {});
            }
        }

        const { publishOpenJoin } = require('../config/mqtt');
        const published = publishOpenJoin(targetBieonId, Number(duration) || 30, {
            hubId: String(targetHub._id),
            requestedBy: String(userId),
            mode,
            hub_only
        });

        res.status(200).json({
            message: published
                ? `Open join aktif untuk hub ${targetBieonId} (${duration}s). Silakan tekan tombol pairing pada alat kamu.`
                : `Open join untuk hub ${targetBieonId} sudah aktif. Permintaan baru diabaikan agar tidak spam.`
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengaktifkan open join', error: error.message });
    }
};

exports.createDevice = async (req, res) => {
    try {
        const { name, type, hubId, userId, room } = req.body;
        const newDevice = new Device({ name, type, hub: hubId, owner: userId, room });
        await newDevice.save();
        res.status(201).json({ message: 'Perangkat berhasil ditambahkan!', device: newDevice });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah perangkat', error: error.message });
    }
};

exports.getDevicesByOwner = async (req, res) => {
    try {
        const devices = await Device.find({ owner: req.params.userId }).populate('hub');
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data perangkat', error: error.message });
    }
};

exports.getUnassignedDevices = async (req, res) => {
    try {
        const devices = await Device.find({ type: 'Unassigned' });
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data perangkat baru', error: error.message });
    }
};
