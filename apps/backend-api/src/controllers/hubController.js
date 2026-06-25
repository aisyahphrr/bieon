const Hub = require('../models/Hub');
const BieonSystem = require('../models/BieonSystem');
const KendaliPerangkat = require('../models/KendaliPerangkat');
const Alert = require('../models/Alert');
const Activity = require('../models/Activity');
const User = require('../models/User');

const { publishCommand } = require('../config/mqtt');
const {
    normalizeBieonId,
    findOneByBieonId,
    findManyByBieonId,
    deleteManyByBieonId,
    bieonIdFilter,
} = require('../shared/bieonId');

const buildFlexibleBieonIdRegex = (value) => {
    const chars = String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').split('');
    if (chars.length === 0) return null;
    return new RegExp(`^${chars.map((char) => `${char}[^A-Z0-9]*`).join('')}$`, 'i');
};

// Setup Hubs awal untuk sistem baru atau klaim stok yang sudah ada
exports.setupHubs = async (req, res) => {
    try {
        const { bieonId: rawBieonId, totalHubs, hubCount } = req.body;
        const bieonId = normalizeBieonId(rawBieonId);
    const bieonRegex = buildFlexibleBieonIdRegex(bieonId);
        // PRIORITAS: Ambil ID dari Token (jauh lebih aman & akurat)
        const userId = req.user?.userId || req.body.userId; 
        const count = totalHubs || hubCount || 1;

        if (!userId) {
            return res.status(401).json({ message: 'Sesi berakhir, silakan login kembali.' });
        }

        if (!bieonId) {
            return res.status(400).json({ message: 'Bieon ID tidak valid.' });
        }

        // 1. Cek apakah sistem sudah ada
        let system = bieonRegex ? await BieonSystem.findOne({ bieonId: bieonRegex }) : null;

        if (system) {
            // Jika ada owner, cek apakah owner tersebut masih aktif (bukan yatim piatu)
            if (system.owner) {
                const ownerExists = await User.findById(system.owner);
                if (!ownerExists) {
                    // Bersihkan rekaman yatim piatu (Cleanup Orphan)
                    await Hub.deleteMany({ bieonId: bieonRegex || bieonId });
                    await KendaliPerangkat.deleteMany({ bieonId: bieonRegex || bieonId });
                    await BieonSystem.deleteOne({ bieonId: bieonRegex || bieonId });
                    system = null; // Set null agar nanti dibuat baru
                } else {
                    // Jika owner masih ada, berarti benar-benar duplikat
                    return res.status(400).json({ message: 'ID BIEON ini sudah digunakan di sistem kami!' });
                }
            } else {
                // Jika sistem ada tapi owner kosong (Stok Gudang), klaim sistem ini
                system.owner = userId;
                system.status = 'Active';
                await system.save();
            }
        }

        // Jika sistem belum ada sama sekali atau baru saja dihapus karena yatim piatu
        if (!system) {
            system = new BieonSystem({
                bieonId: bieonId,
                owner: userId,
                hubCount: count
            });
            await system.save();
        }

        // 2. Klaim semua Hub terkait
        const hubs = await Hub.find({ bieonId: bieonRegex || bieonId });
        if (hubs.length > 0) {
            const user = await User.findById(userId);
            for (const hub of hubs) {
                hub.owner = userId;
                hub.tenantId = user?.tenantId || "tenant_001";
                await hub.save();
            }
        } else {
            console.log('[SETUP_HUBS] No hubs found in warehouse. No dummy hubs created.');
        }

        // 3. Klaim semua Perangkat terkait ke user baru ini
        await KendaliPerangkat.updateMany(
            { bieonId: bieonRegex || bieonId, lifecycleState: 'UNCLAIMED' },
            { $set: { owner: userId, tenantId: userId } }
        );

        // 4. (Dihapus) Fitur MQTT bootstrap claim sudah tidak digunakan lagi

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
        
        // --- KEAMANAN KETAT: Cek apakah yang minta adalah pemiliknya atau SuperAdmin ---
        if (req.user.role !== 'SuperAdmin' && String(userId) !== String(req.user.userId)) {
            return res.status(403).json({ message: 'Anda tidak diizinkan melihat data sistem pengguna lain.' });
        }

        const query = { $or: [{ owner: userId }] };
        if (req.user.bieonId) {
            query.$or.push({ bieonId: buildFlexibleBieonIdRegex(req.user.bieonId) || req.user.bieonId });
        }
        const systems = await BieonSystem.find(query);
        
        // Untuk setiap sistem, ambil daftar hub-nya
        const result = await Promise.all(systems.map(async (sys) => {
            const hubQuery = { $or: [{ owner: userId }] };
            if (req.user.bieonId) {
                hubQuery.$or.push({ bieonId: buildFlexibleBieonIdRegex(req.user.bieonId) || req.user.bieonId });
            }
            const hubs = await Hub.find({ ...hubQuery, ...bieonIdFilter(sys.bieonId) });
            return {
                ...sys.toObject(),
                hubs: hubs.map(h => ({
                    id: h._id,
                    name: h.name,
                    status: h.status,
                    device_ieee: h.device_ieee,
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
        const { userId } = req.params;

        // --- KEAMANAN KETAT ---
        if (req.user.role !== 'SuperAdmin' && String(userId) !== String(req.user.userId)) {
            return res.status(403).json({ message: 'Anda tidak diizinkan melihat data hub pengguna lain.' });
        }

        const query = { $or: [{ owner: userId }] };
        if (req.user.bieonId) {
            query.$or.push({ bieonId: buildFlexibleBieonIdRegex(req.user.bieonId) || req.user.bieonId });
        }
        const hubs = await Hub.find(query);
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
        await deleteManyByBieonId(Hub, system.bieonId);

        // 2. Hapus semua perangkat yang terkait dengan bieonId ini
        await deleteManyByBieonId(KendaliPerangkat, system.bieonId);

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

// POST /api/hubs/open_join
exports.startHubOpenJoin = async (req, res) => {
    try {
        const { bieonId, duration = 60 } = req.body || {};
        if (!bieonId) {
            return res.status(400).json({ message: 'Bieon ID tidak boleh kosong.' });
        }

        if (!req.user?.userId) {
            return res.status(401).json({ message: 'Sesi berakhir, silakan login kembali.' });
        }

        // Cari BieonSystem untuk verifikasi owner
        const system = await BieonSystem.findOne({ bieonId: buildFlexibleBieonIdRegex(bieonId) || bieonId });
        if (!system) {
            return res.status(404).json({ message: 'Sistem BIEON tidak ditemukan.' });
        }

        const isSystemOwner = String(system.owner) === String(req.user.userId);
        const isSystemMember = req.user.bieonId && String(req.user.bieonId).toLowerCase() === String(system.bieonId).toLowerCase();
        
        if (req.user.role !== 'SuperAdmin' && !isSystemOwner && !isSystemMember) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses untuk membuka open join pada sistem ini.' });
        }

        const { publishOpenJoin } = require('../config/mqtt');
        const published = publishOpenJoin(bieonId, Number(duration) || 60, {
            mode: 'add_hub_node',
            hub_only: true,
            requestedBy: String(req.user.userId)
        });

        res.status(200).json({
            message: published
                ? `Open join aktif untuk hub node pada sistem ${bieonId} (${duration}s). Silakan tekan tombol pairing pada Hub Anda.`
                : `Open join untuk sistem ${bieonId} sudah aktif.`
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengaktifkan mode open join Hub', error: error.message });
    }
};

// POST /api/hubs/:hubId/leave
exports.leaveHub = async (req, res) => {
    try {
        const { hubId } = req.params;
        const { remove_children = true } = req.body || {};

        const hub = await Hub.findById(hubId);
        if (!hub) {
            return res.status(404).json({ message: 'Hub tidak ditemukan.' });
        }

        const isHubOwner = String(hub.owner) === String(req.user.userId);
        const isHubMember = req.user.bieonId && String(req.user.bieonId).toLowerCase() === String(hub.bieonId).toLowerCase();

        if (req.user.role !== 'SuperAdmin' && !isHubOwner && !isHubMember) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses untuk menghapus hub ini.' });
        }

        const deviceIeee = hub.device_ieee;
        if (!deviceIeee) {
            // Jika tidak ada device_ieee, langsung hapus saja dari DB
            await Hub.findByIdAndDelete(hubId);
            return res.status(200).json({ message: 'Hub berhasil dihapus dari database (tidak memiliki device_ieee).' });
        }

        const { publishLeave } = require('../config/mqtt');
        const published = publishLeave(hub.bieonId, deviceIeee, {
            remove_children: remove_children !== false,
            requested_by: String(req.user.userId)
        });

        // Set status Hub ke 'Removing' di database
        hub.status = 'Removing';
        await hub.save();

        res.status(200).json({
            message: published
                ? 'Permintaan penghapusan Hub berhasil dikirim ke gateway. Menunggu konfirmasi...'
                : 'Gagal mempublikasikan perintah penghapusan ke MQTT.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memproses penghapusan hub', error: error.message });
    }
};

// DELETE /api/hubs/:hubId
exports.deleteHub = async (req, res) => {
    try {
        const { hubId } = req.params;

        const hub = await Hub.findById(hubId);
        if (!hub) {
            return res.status(404).json({ message: 'Hub tidak ditemukan.' });
        }

        const isHubOwner = String(hub.owner) === String(req.user.userId);
        const isHubMember = req.user.bieonId && String(req.user.bieonId).toLowerCase() === String(hub.bieonId).toLowerCase();

        if (req.user.role !== 'SuperAdmin' && !isHubOwner && !isHubMember) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses untuk menghapus hub ini.' });
        }

        const { publishLeave } = require('../config/mqtt');
        
        // Memicu leave_device untuk setiap perangkat di dalam hub ini
        const devices = await KendaliPerangkat.find({ hubId });
        for (const device of devices) {
            const normalizedIeee = String(device.device_ieee || device.modelId || device.name || '').replace(/[:\-\s]/g, '').toUpperCase();
            if (normalizedIeee) {
                publishLeave(device.bieonId || hub.bieonId, normalizedIeee, {
                    requested_by: String(req.user.userId)
                });
            }
        }

        const deviceIeee = hub.device_ieee;
        if (deviceIeee) {
            publishLeave(hub.bieonId, deviceIeee, {
                remove_children: true,
                requested_by: String(req.user.userId)
            });
        }

        await Hub.findByIdAndDelete(hubId);

        // Hapus perangkat yang menempel di hub ini
        await KendaliPerangkat.deleteMany({ hubId });

        res.status(200).json({ message: 'Hub berhasil dihapus secara paksa dari database.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus hub secara paksa', error: error.message });
    }
};

// POST /api/hubs/:hubId/claim
exports.claimHub = async (req, res) => {
    try {
        const { hubId } = req.params;
        const userId = req.user.userId;

        // 1. Cari hub di database
        const hub = await Hub.findById(hubId);
        if (!hub) {
            return res.status(404).json({ message: 'Hub tidak ditemukan.' });
        }

        // 2. Cari BieonSystem untuk memverifikasi kepemilikan sistem BIEON
        const system = await BieonSystem.findOne({ bieonId: hub.bieonId });
        if (!system) {
            return res.status(404).json({ message: 'Sistem BIEON untuk Hub ini tidak ditemukan.' });
        }

        // Pastikan user adalah pemilik sistem ini
        if (String(system.owner) !== String(userId)) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses ke sistem BIEON ini.' });
        }

        // 3. Set owner dan tenantId pada Hub
        const user = await User.findById(userId);
        hub.owner = userId;
        hub.tenantId = user?.tenantId || "tenant_001";
        hub.status = 'Online';
        await hub.save();

        // 4. (Dihapus) Fitur MQTT bootstrap claim sudah tidak digunakan lagi
        res.status(200).json({
            message: 'Hub berhasil disimpan dan diklaim!',
            hub: hub
        });
    } catch (error) {
        console.error('Error in claimHub:', error);
        res.status(500).json({ message: 'Gagal mengklaim Hub', error: error.message });
    }
};


