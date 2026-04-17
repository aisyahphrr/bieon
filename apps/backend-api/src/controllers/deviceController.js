const Device = require('../models/Device');

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
