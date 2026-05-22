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
        const { hubId, duration = 30 } = req.body || {};
        if (!hubId) {
            return res.status(400).json({ message: 'Missing hubId in request body' });
        }

        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
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

        if (!targetBieonId) {
            return res.status(404).json({ message: 'Tidak dapat menemukan hub dengan id yang diberikan (coba gunakan bieon_001 atau hub _id yang valid).' });
        }

        if (String(req.user.role || '').toLowerCase() !== 'superadmin') {
            if (!targetHub?.owner || String(targetHub.owner) !== String(req.user.userId)) {
                return res.status(403).json({ message: 'Anda tidak memiliki akses untuk membuka open join pada hub ini.' });
            }
        }

        const { publishOpenJoin } = require('../config/mqtt');
        const published = publishOpenJoin(targetBieonId, Number(duration) || 30, {
            hubId: targetHub?._id ? String(targetHub._id) : String(hubId),
            requestedBy: String(req.user.userId)
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
