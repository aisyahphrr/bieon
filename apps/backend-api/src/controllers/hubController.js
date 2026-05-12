const Hub = require('../models/Hub');
const BieonSystem = require('../models/BieonSystem');
const KendaliPerangkat = require('../models/KendaliPerangkat');
const Alert = require('../models/Alert');
const Activity = require('../models/Activity');

const { publishCommand } = require('../config/mqtt');

// Setup Hubs awal untuk sistem baru atau klaim stok yang sudah ada
exports.setupHubs = async (req, res) => {
    try {
        const { bieonId, totalHubs, hubCount, userId } = req.body;
        const count = totalHubs || hubCount || 1;

        // 1. Cek apakah sistem sudah ada
        let system = await BieonSystem.findOne({ bieonId });
        
        if (system) {
            // Jika sudah ada tapi sudah ada ownernya, tolak
            if (system.owner) {
                return res.status(400).json({ message: 'ID BIEON ini sudah digunakan di sistem kami!' });
            }
            // Jika belum ada owner, klaim sistem ini
            system.owner = userId;
            system.status = 'Active';
            await system.save();
        } else {
            // Jika sistem belum ada sama sekali, buat baru (Legacy Support)
            system = new BieonSystem({
                bieonId,
                owner: userId,
                hubCount: count
            });
            await system.save();
        }

        // 2. Klaim semua Hub terkait
        const hubs = await Hub.find({ bieonId });
        const hubsPayload = [];

        if (hubs.length > 0) {
            for (const hub of hubs) {
                const user = await User.findById(userId);
                hub.owner = userId;
                hub.tenantId = user?.tenantId || "tenant_001";
                await hub.save();

                let formattedHubId = hub.name.toLowerCase().replace('hub node ', 'hubnode_');
                let rawIeee = hub.device_ieee || "0000000000000000";
                let canonicalIeee = rawIeee.replace(/[:\-]/g, '').toUpperCase();

                hubsPayload.push({
                    id: formattedHubId,
                    ieee: canonicalIeee
                });
            }
        } else {
            // Fallback legacy (buat Hub dinamis jika tidak ada di gudang)
            for (let i = 1; i <= count; i++) {
                const newHub = new Hub({
                    name: `Hub ${i}`,
                    bieonId: bieonId,
                    owner: userId,
                    status: 'Online'
                });
                await newHub.save();
                hubs.push(newHub);
            }
        }

        // 3. Klaim semua Perangkat terkait ke user baru ini
        await KendaliPerangkat.updateMany(
            { bieonId: bieonId, lifecycleState: 'UNCLAIMED' },
            { $set: { owner: userId, tenantId: userId } }
        );

        // 4. Publikasi MQTT Claim jika stok berasal dari gudang
        if (hubsPayload.length > 0) {
            const payload = {
                tenant_id: "tenant_001",
                bieon_id: bieonId,
                hub_id: "hub_001",
                hubs: hubsPayload
            };
            publishCommand(`bieon/${bieonId}/bootstrap/claim`, payload, { qos: 1, retain: true });
        }

        res.status(201).json({ 
            message: 'Sistem BIEON dan Hub berhasil disiapkan!', 
            system: system,
            hubs: hubs 
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
        const hubs = await Hub.find({ owner: req.params.userId }); 
        res.status(200).json(hubs);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data hub', error: error.message });
    }
};

// Hapus sistem BIEON beserta Hub-hubnya
exports.deleteSystem = async (req, res) => {
    try {
        const { id } = req.params;
        const system = await BieonSystem.findById(id);
        if (!system) {
            return res.status(404).json({ message: 'Sistem tidak ditemukan' });
        }

        // 1. Hapus semua Hub yang terkait dengan bieonId ini
        await Hub.deleteMany({ bieonId: system.bieonId });

        // 2. Hapus semua perangkat yang terkait dengan bieonId ini
        await KendaliPerangkat.deleteMany({ bieonId: system.bieonId });

        // 3. Hapus sistemnya
        await BieonSystem.findByIdAndDelete(id);

        res.status(200).json({ message: 'Sistem BIEON dan semua hub berhasil dihapus' });
    } catch (error) {
        console.error('Error deleteSystem:', error);
        res.status(500).json({ message: 'Gagal menghapus sistem', error: error.message });
    }
};

// Emergency cleanup for orphaned devices, alerts, and activities (Ultra Clean)
exports.cleanupOrphans = async (req, res) => {
    try {
        const hubs = await Hub.find({}, '_id');
        const validHubIds = hubs.map(h => h._id.toString());
        
        const deviceResult = await KendaliPerangkat.deleteMany({ 
            hubId: { $nin: validHubIds },
            location: { $ne: 'Pending' } 
        });

        const activeDevices = await KendaliPerangkat.find({}, 'owner location name');
        const userValidRooms = {};
        const userHasDevices = {};

        activeDevices.forEach(d => {
            const userId = d.owner.toString();
            userHasDevices[userId] = true;
            if (!userValidRooms[userId]) userValidRooms[userId] = new Set();
            userValidRooms[userId].add(d.location);
        });

        // 1. Hapus ALERT (Notifikasi)
        const allAlerts = await Alert.find({});
        let deletedAlertsCount = 0;
        for (const alert of allAlerts) {
            const userId = alert.owner.toString();
            const validRooms = userValidRooms[userId] || new Set();
            const hasDevices = userHasDevices[userId] || false;

            let shouldDelete = false;

            // Jika user tidak punya perangkat sama sekali, hapus notif sistem/IoT (kecuali pengaduan)
            if (!hasDevices && ['Sistem', 'Kenyamanan', 'Keamanan', 'Air Sanitasi', 'Energi'].includes(alert.category)) {
                shouldDelete = true;
            } 
            // Jika ada field room dan room-nya sudah tidak valid
            else if (alert.room && !validRooms.has(alert.room)) {
                shouldDelete = true;
            }
            // Jika room kosong tapi pesan menyebutkan ruangan yang tidak valid (heuristic check)
            else if (!alert.room && alert.message) {
                // Cari apakah ada nama ruangan "hantu" di dalam pesan
                // Kita asumsikan jika pesan mengandung "di [Nama Ruangan]" dan ruangan itu tidak valid
                const match = alert.message.match(/di\s+([^.]+)/i);
                if (match && match[1]) {
                    const suspectedRoom = match[1].trim();
                    // Jika pesan mengandung nama ruangan yang tidak ada di daftar validRooms
                    if (suspectedRoom === 'Kamar Asri' || (validRooms.size > 0 && !Array.from(validRooms).some(r => alert.message.includes(r)))) {
                        shouldDelete = true;
                    }
                }
            }

            if (shouldDelete) {
                await Alert.findByIdAndDelete(alert._id);
                deletedAlertsCount++;
            }
        }

        // 2. Hapus AKTIVITAS
        const allActivities = await Activity.find({});
        let deletedActivitiesCount = 0;
        for (const act of allActivities) {
            const userId = act.user.toString();
            const validRooms = userValidRooms[userId] || new Set();
            const hasDevices = userHasDevices[userId] || false;

            if (!hasDevices || (act.room && !validRooms.has(act.room))) {
                await Activity.findByIdAndDelete(act._id);
                deletedActivitiesCount++;
            }
        }
        
        res.status(200).json({ 
            message: `Pembersihan super teliti berhasil!`,
            deletedDevices: deviceResult.deletedCount,
            deletedAlerts: deletedAlertsCount,
            deletedActivities: deletedActivitiesCount
        });
    } catch (error) {
        console.error('Cleanup Error:', error);
        res.status(500).json({ message: 'Gagal membersihkan data hantu', error: error.message });
    }
};
