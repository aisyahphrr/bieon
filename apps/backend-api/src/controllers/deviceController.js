const Device = require('../models/Device');
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
