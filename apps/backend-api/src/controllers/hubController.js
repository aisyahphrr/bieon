const Hub = require('../models/Hub');

exports.setupHubs = async (req, res) => {
    try {
        const { bieonId, userId } = req.body;

        // Cek apakah hub sudah ada untuk bieonId ini
        const existingHubs = await Hub.find({ bieonId });
        if (existingHubs.length > 0) {
            return res.status(400).json({ message: 'Hubs sudah terdaftar untuk ID BIEON ini!' });
        }

        // Otomatis buat 2 Hub
        const hubs = [
            { name: 'Hub 1', bieonId, owner: userId },
            { name: 'Hub 2', bieonId, owner: userId }
        ];

        const createdHubs = await Hub.insertMany(hubs);

        res.status(201).json({
            message: '2 Hub berhasil dibuat secara otomatis!',
            hubs: createdHubs
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal setup hubs', error: error.message });
    }
};

exports.getHubs = async (req, res) => {
    try {
        const hubs = await Hub.find({ owner: req.params.userId });
        res.status(200).json(hubs);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data hubs', error: error.message });
    }
};
