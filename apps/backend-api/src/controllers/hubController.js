const Hub = require('../models/Hub');
const BieonSystem = require('../models/BieonSystem');

// Setup Hubs awal untuk sistem baru
exports.setupHubs = async (req, res) => {
    try {
        const { bieonId, totalHubs, hubCount, userId } = req.body;
        const count = totalHubs || hubCount || 1;

        // 1. Simpan rekaman sistem BIEON (agar unik secara global)
        const newSystem = new BieonSystem({
            bieonId,
            owner: userId,
            hubCount: count
        });
        await newSystem.save();

        // 2. Buat Hub-nya secara dinamis
        const hubs = [];
        for (let i = 1; i <= count; i++) {
            hubs.push({
                name: `Hub ${i}`,
                bieonId: bieonId, // Hub merujuk ke ID sistem
                owner: userId,    // Diperlukan oleh model Hub
                status: 'Offline' // Sesuaikan dengan enum model Hub
            });
        }

        const savedHubs = await Hub.insertMany(hubs);
        res.status(201).json({ 
            message: 'Sistem BIEON dan Hub berhasil disiapkan!', 
            system: newSystem,
            hubs: savedHubs 
        });
    } catch (error) {
        console.error('Error setupHubs:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'ID BIEON ini sudah digunakan di sistem kami!' });
        }
        res.status(500).json({ message: 'Gagal setup hub', error: error.message });
    }
};

// Ambil semua sistem BIEON milik user beserta Hub-nya
exports.getUserSystems = async (req, res) => {
    try {
        const { userId } = req.params;
        const systems = await BieonSystem.find({ owner: userId });
        
        // Untuk setiap sistem, ambil daftar hub-nya
        const result = await Promise.all(systems.map(async (sys) => {
            const hubs = await Hub.find({ bieonId: sys.bieonId });
            return {
                ...sys.toObject(),
                hubs: hubs.map(h => ({
                    id: h._id,
                    name: h.name,
                    status: h.status,
                    devices: [] // Akan diisi di frontend atau via join nanti
                }))
            };
        }));

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data sistem BIEON', error: error.message });
    }
};

exports.getHubs = async (req, res) => {
    try {
        const hubs = await Hub.find({ bieonId: req.params.userId }); 
        res.status(200).json(hubs);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data hub', error: error.message });
    }
};
