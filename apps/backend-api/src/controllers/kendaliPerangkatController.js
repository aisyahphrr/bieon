const KendaliPerangkat = require('../models/KendaliPerangkat');
const SensorData = require('../models/SensorData');
const RegisteredProduct = require('../models/RegisteredProduct');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { broadcastNewDevice, broadcastDeviceTelemetry } = require('../shared/socketEmitter');
const Hub = require('../models/Hub');
const TechnicianAccess = require('../models/TechnicianAccess');
const DeviceWhitelist = require('../models/DeviceWhitelist');
const mqtt = require('../config/mqtt');

// Helper: normalize product/device identifiers (IEEE / productId)
function normalizeId(input) {
    if (!input && input !== 0) return '';
    return String(input || '').replace(/[:\-\s]/g, '').toUpperCase();
}

// 1. Mencatat perangkat yang terdeteksi (tanda icon di UI)
exports.discoverDevice = async (req, res) => {
    try {
        const { hubId, category, type } = req.body;
        const ownerId = req.user.userId;
        
        const newDevice = new KendaliPerangkat({
            name: `New ${type}`, // Nama default sementara
            location: 'Pending', 
            hubId,
            category,
            type,
            status: 'Discovered',
            owner: ownerId
        });

        await newDevice.save();
        broadcastNewDevice(newDevice);
        res.status(201).json({ message: 'Perangkat baru terdeteksi!', device: newDevice });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mendeteksi perangkat', error: error.message });
    }
};

// 2. Simpan perangkat baru (Direct dari Form UI)
exports.createDevice = async (req, res) => {
    try {
        const { name, deviceType, category, location, notes, hubId, sensorParams, scheduleSettings, controlMode, sensorData, controlledDevice, remoteState, ownerId: manualOwnerId, device_ieee } = req.body;
        
        // Fallback untuk lokasi agar tidak error validation failed
        const finalLocation = location || "Ruangan Utama";
        let ownerId = req.user.userId;
        
        // Cek jika teknisi sedang mendaftarkan perangkat untuk homeowner
        if (manualOwnerId && manualOwnerId !== ownerId) {
            if (req.user.role === 'Technician') {
                const session = await TechnicianAccess.findOne({
                    homeownerId: manualOwnerId,
                    technicianId: ownerId,
                    status: 'Active'
                });
                if (!session) return res.status(403).json({ message: 'Sesi akses teknisi tidak valid.' });
                ownerId = manualOwnerId;
            } else if (req.user.role !== 'SuperAdmin') {
                return res.status(403).json({ message: 'Akses ditolak.' });
            } else {
                ownerId = manualOwnerId;
            }
        }
        
        const user = await User.findById(ownerId);
        
        let hub;
        try {
            // Coba cari pake ID asli dulu
            hub = await Hub.findById(hubId);
        } catch (err) {
            // Kalau gagal (bukan format ObjectId), cari pake bieonId atau nama
            hub = await Hub.findOne({ 
                $or: [{ bieonId: hubId }, { name: hubId }] 
            });
        }

        if (!hub) {
            return res.status(404).json({ message: 'Hub tidak ditemukan. Pastikan Hub ID valid.' });
        }

        // --- AUTO-REGISTER BARANG: jangan blok simpan saat device belum ada di daftar ---
        const rawProdId = req.body.productId || deviceType;
        const prodId = normalizeId(rawProdId);
        let myProduct = await RegisteredProduct.findOne({ 
            productId: prodId, 
            owner: ownerId,
            isUsed: false 
        });

        if (!myProduct) {
            // [JALUR VVIP] Cek apakah ini barang Whitelist (Bieon Original) yang sedang di-Open Join
            const whitelistMatch = await DeviceWhitelist.findOne({
                $or: [
                    { model: prodId },
                    { manufacturer: prodId } // Fallback jikalau yang dikirim adalah manufacturer
                ]
            });

            if (whitelistMatch) {
                // AUTO-REGISTER: Daftarkan/Update otomatis ke user jika barang whitelist
                let regCategory = String(category).toLowerCase();
                if (regCategory.includes('control')) regCategory = 'control';
                else if (regCategory.includes('sensor')) regCategory = 'sensor';

                const targetAspect = (function() {
                    const a = String(req.body.aspect || req.body.environmentAspect || '').toLowerCase();
                    if (a.includes('air')) return 'air';
                    if (a.includes('nyaman')) return 'kenyamanan';
                    if (a.includes('aman')) return 'keamanan';
                    if (a.includes('plug')) return 'smart-plug';
                    return regCategory === 'sensor' ? 'kenyamanan' : 'none';
                })();

                try {
                    myProduct = await RegisteredProduct.findOneAndUpdate(
                        { productId: prodId }, // Cari berdasarkan ID unik barang
                        { 
                            $set: {
                                productId: prodId,
                                productName: name || whitelistMatch.device_id,
                                category: regCategory,
                                aspect: targetAspect,
                                owner: ownerId,
                                isUsed: false
                            }
                        },
                        { upsert: true, new: true }
                    );
                } catch (err) {
                    // Handle duplicate key race: another request created the product concurrently
                    if (err && err.code === 11000) {
                        myProduct = await RegisteredProduct.findOne({ productId: prodId });
                    } else {
                        throw err;
                    }
                }
                
                console.log(`[AUTO-REG] Whitelisted device ${prodId} successfully processed for user ${ownerId}`);

                // JIKA HANYA DAFTAR (Quick Save), STOP DI SINI!
                if (req.body.onlyRegister) {
                    return res.status(201).json({ 
                        message: 'Perangkat berhasil terdaftar! Silakan atur di menu Perangkat Terdaftar.', 
                        product: myProduct 
                    });
                }
            } else {
                const fallbackCategory = String(category || deviceType || 'sensor').toLowerCase().includes('control') ? 'control' : 'sensor';
                const fallbackAspect = fallbackCategory === 'control' ? 'smart-switch' : 'kenyamanan';

                try {
                    myProduct = await RegisteredProduct.findOneAndUpdate(
                        { productId: prodId, owner: ownerId },
                        {
                            $set: {
                                productId: prodId,
                                productName: name || prodId,
                                category: fallbackCategory,
                                aspect: fallbackAspect,
                                owner: ownerId,
                                isUsed: false
                            }
                        },
                        { upsert: true, new: true }
                    );
                } catch (err) {
                    if (err && err.code === 11000) {
                        myProduct = await RegisteredProduct.findOne({ productId: prodId });
                    } else {
                        throw err;
                    }
                }

                console.log(`[AUTO-REG] Non-whitelisted device ${prodId} allowed without IEEE validation for user ${ownerId}`);
            }
        }

        // --- NEW: AUTO LOOKUP IEEE FROM WHITELIST DIBATALKAN ---
        // Karena DeviceWhitelist sekarang berbasis model, bukan perangkat individual,
        // maka IEEE *harus* dikirim dari frontend/MQTT.
        let finalIeee = device_ieee || req.body.ieee || req.body.mac || req.body.productId;
        let finalModelId = normalizeId(req.body.productId || deviceType);
        
        const capturedIeee = finalIeee || "0000000000000000";
        const capturedModelId = finalModelId;

        const newDevice = new KendaliPerangkat({
            name,
            location: finalLocation,
            notes,
            hubId,
            category: category, // KendaliPerangkat mau APA ADANYA (Sensor / Control Actuator System)
            type: deviceType,
            status: 'Active',
            lifecycleState: 'PROVISIONED',
            owner: ownerId,
            tenantId: user?.tenantId || "tenant_001", 
            bieonId: user?.bieonId || hub?.bieonId || 'Unknown',
            device_ieee: capturedIeee, 
            modelId: capturedModelId, // Simpan model id asli (ID Teknis)
            thresholds: sensorParams, 
            controlMethod: controlMode || 'manual',
            scheduleSettings,
            sensorData, 
            controlledDevice,
            remoteState,
            lastActivity: new Date()
        });

        await newDevice.save();

        // Update RegisteredProduct status if productId provided
        if (req.body.productId) {
            const prodToMark = normalizeId(req.body.productId);
            await RegisteredProduct.findOneAndUpdate(
                { productId: prodToMark },
                { isUsed: true, owner: ownerId }
            );
        }

        broadcastNewDevice(newDevice);

        // MQTT device-map/config publish removed to keep the active topic surface minimal.
        // UI and downstream services rely on socket events and the approved Bieon topics instead.

        res.status(201).json({ message: 'Perangkat berhasil disimpan ke database!', device: newDevice });
    } catch (error) {
        console.error('SERVER ERROR [createDevice]:', error);
        console.error('PAYLOAD SENT:', JSON.stringify(req.body, null, 2));
        res.status(500).json({ message: 'Gagal menyimpan perangkat', error: error.message });
    }
};

// 3. Konfigurasi perangkat (mengisi nama, lokasi, dan batas aman/threshold)
exports.configureDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, sensorParams, controlMode, environmentAspect, scheduleSettings, thresholds, controlMethod, notes, controlledDevice, remoteState } = req.body;

        // Cari dulu untuk cek kepemilikan
        const device = await KendaliPerangkat.findById(id);
        if (!device) {
            return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
        }

        // Cek kepemilikan (Kecuali SuperAdmin)
        if (req.user.role !== 'SuperAdmin' && String(device.owner) !== String(req.user.userId)) {
            return res.status(403).json({ message: 'Anda tidak memiliki hak akses untuk mengonfigurasi perangkat ini.' });
        }

        // Bangun objek update secara kondisional
        // scheduleSettings HANYA diupdate jika nilainya dikirim secara eksplisit (bukan null)
        // Ini mencegah jadwal terhapus saat menyimpan perubahan lain (nama, lokasi, dll)
        const updateFields = {
            name,
            location,
            notes,
            thresholds: sensorParams || thresholds,
            controlMethod: controlMode || controlMethod,
            environmentAspect,
            controlledDevice,
            remoteState,
            status: 'Active',
            lastActivity: new Date()
        };

        if (scheduleSettings !== null && scheduleSettings !== undefined) {
            updateFields.scheduleSettings = scheduleSettings;
        }

        const updatedDevice = await KendaliPerangkat.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, returnDocument: 'after', runValidators: true }
        );

        if (updatedDevice && req.body.productId) {
            await RegisteredProduct.findOneAndUpdate(
                { productId: req.body.productId },
                { isUsed: true }
            );
        }

        if (!updatedDevice) {
            return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
        }
        // Emit device telemetry update to connected clients
        if (updatedDevice.hubId) {
            broadcastDeviceTelemetry(updatedDevice.hubId, updatedDevice);
        }

        res.status(200).json({ message: 'Konfigurasi berhasil simpan!', device: updatedDevice });
    } catch (error) {
        res.status(500).json({ message: 'Gagal konfigurasi perangkat', error: error.message });
    }
};

// 4. Ambil perangkat berdasarkan User (Self)
exports.getDevicesByUser = async (req, res) => {
    try {
        let userId = req.user.userId;
        const targetOwnerId = req.query.ownerId;

        // Jika ada targetOwnerId, cek otorisasi teknisi
        if (targetOwnerId && targetOwnerId !== userId) {
            if (req.user.role === 'Technician') {
                const activeSession = await TechnicianAccess.findOne({
                    homeownerId: targetOwnerId,
                    technicianId: userId,
                    status: 'Active'
                });

                if (!activeSession) {
                    return res.status(403).json({ message: 'Anda tidak memiliki sesi aktif untuk pelanggan ini.' });
                }
                userId = targetOwnerId;
            } else if (req.user.role !== 'SuperAdmin') {
                return res.status(403).json({ message: 'Akses ditolak.' });
            } else {
                userId = targetOwnerId;
            }
        }

        const devices = await KendaliPerangkat.find({ owner: userId }).sort({ updatedAt: -1, createdAt: -1 }).lean();

        const normalizeIeee = (value) => String(value || '').replace(/[:\-\s]/g, '').toUpperCase();
        const seen = new Map();

        for (const device of devices) {
            const key = normalizeIeee(device.device_ieee) || String(device._id);
            if (!seen.has(key)) {
                seen.set(key, device);
            }
        }

        res.status(200).json(Array.from(seen.values()));
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data perangkat user', error: error.message });
    }
};

// 5. Ambil perangkat berdasarkan Hub
exports.getDevicesByHub = async (req, res) => {
    try {
        const devices = await KendaliPerangkat.find({ hubId: req.params.hubId }).sort({ updatedAt: -1, createdAt: -1 }).lean();

        const normalizeIeee = (value) => String(value || '').replace(/[:\-\s]/g, '').toUpperCase();
        const seen = new Map();

        for (const device of devices) {
            const key = normalizeIeee(device.device_ieee) || String(device._id);
            if (!seen.has(key)) {
                seen.set(key, device);
            }
        }

        res.status(200).json(Array.from(seen.values()));
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data perangkat', error: error.message });
    }
};

// 6. Ambil semua perangkat yang baru terdeteksi (discovered) - Khusus milik user
exports.getDiscoveredDevices = async (req, res) => {
    try {
        let userId = req.user.userId;
        const targetOwnerId = req.query.ownerId;

        if (targetOwnerId && targetOwnerId !== userId) {
            if (req.user.role === 'Technician') {
                const activeSession = await TechnicianAccess.findOne({
                    homeownerId: targetOwnerId,
                    technicianId: userId,
                    status: 'Active'
                });
                if (!activeSession) return res.status(403).json({ message: 'Akses ditolak.' });
                userId = targetOwnerId;
            } else if (req.user.role !== 'SuperAdmin') {
                return res.status(403).json({ message: 'Akses ditolak.' });
            } else {
                userId = targetOwnerId;
            }
        }

        const devices = await KendaliPerangkat.find({ owner: userId, status: 'Discovered' }).sort({ updatedAt: -1, createdAt: -1 }).lean();

        const normalizeIeee = (value) => String(value || '').replace(/[:\-\s]/g, '').toUpperCase();
        const seen = new Map();

        for (const device of devices) {
            const key = normalizeIeee(device.device_ieee) || String(device._id);
            if (!seen.has(key)) {
                seen.set(key, device);
            }
        }

        res.status(200).json(Array.from(seen.values()));
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data perangkat baru', error: error.message });
    }
};

// 7. Hapus perangkat
exports.deleteDevice = async (req, res) => {
    try {
        const device = await KendaliPerangkat.findById(req.params.id);
        if (!device) return res.status(404).json({ message: 'Perangkat tidak ditemukan' });

        if (req.user.role !== 'SuperAdmin' && String(device.owner) !== String(req.user.userId)) {
            return res.status(403).json({ message: 'Anda tidak memiliki hak akses.' });
        }

        const bieonId = device.bieonId || req.user.bieonId;
        const normalizedIeee = String(device.device_ieee || device.modelId || device.name || '').replace(/[:\-\s]/g, '').toUpperCase();
        if (bieonId) {
            const leaveTopic = `bieon/${bieonId}/admin/leave`;
            const leavePayload = {
                command: 'leave_device',
                action: 'leave',
                ieee: normalizedIeee,
                device_ieee: normalizedIeee,
                device_id: String(device._id),
                command_id: `cmd_${Date.now()}`,
                requested_by: String(req.user.userId),
                timestamp: Date.now()
            };
            const leavePublished = mqtt.publishCommand(leaveTopic, leavePayload);
            if (!leavePublished) {
                return res.status(503).json({ message: 'MQTT broker belum siap untuk mengirim leave command' });
            }
            console.log(`[MQTT] Published admin leave to ${leaveTopic}`, leavePayload);
        }

        // Remove the device record
        await KendaliPerangkat.findByIdAndDelete(req.params.id);

        // CLEANUP: Attempt to release or remove RegisteredProduct entries tied to this device.
        // We will normalize possible product ids and then check whether any other KendaliPerangkat
        // refers to the same productId/modelId. If none remain and the RegisteredProduct is owned by this user,
        // delete it. Otherwise mark it unused and clear owner.
        try {
            const RegisteredProduct = require('../models/RegisteredProduct');
            const candidates = new Set();
            if (device.device_ieee) candidates.add(normalizeId(device.device_ieee));
            if (device.modelId) candidates.add(normalizeId(device.modelId));
            if (device.type) candidates.add(normalizeId(device.type));
            if (device._id) candidates.add(String(device._id));

            const prodIds = Array.from(candidates).filter(v => v && v.length > 0);
            if (prodIds.length > 0) {
                const regs = await RegisteredProduct.find({ productId: { $in: prodIds } });
                for (const reg of regs) {
                    // check if any other device references this productId/modelId
                    const other = await KendaliPerangkat.findOne({
                        _id: { $ne: device._id },
                        $or: [ { device_ieee: reg.productId }, { modelId: reg.productId }, { name: reg.productId } ]
                    }).lean();

                    if (!other && String(reg.owner) === String(device.owner)) {
                        // safe to remove the registered product for this owner
                        await RegisteredProduct.deleteOne({ _id: reg._id });
                        console.log(`[Cleanup] Deleted RegisteredProduct ${reg.productId} owned by ${device.owner}`);
                    } else {
                        // release ownership so it can be reused but keep record
                        await RegisteredProduct.findByIdAndUpdate(reg._id, { isUsed: false, owner: null });
                        console.log(`[Cleanup] Released RegisteredProduct ${reg.productId} (set isUsed=false, owner=null)`);
                    }
                }
            }
        } catch (cleanupErr) {
            console.warn('[Cleanup] Failed to fully cleanup RegisteredProduct entries:', cleanupErr && cleanupErr.message ? cleanupErr.message : cleanupErr);
        }

        res.status(200).json({ message: 'Perangkat berhasil dihapus dan ID produk telah dilepaskan.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus perangkat', error: error.message });
    }
};

// 8. Toggle Device ON/OFF dari Dashboard Web
exports.toggleDevice = async (req, res) => {
    console.log(`🔌 Toggling device with ID: ${req.params.id}`);
    try {
        const device = await KendaliPerangkat.findById(req.params.id);
        if (!device) {
            return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
        }

        // Tentukan command yang akan dikirim
        const newStatus = device.status === '1' ? '0' : '1';

        // Cek kepemilikan (PENTING!)
        if (req.user.role !== 'SuperAdmin' && String(device.owner) !== String(req.user.userId)) {
            // Cek jika ini adalah teknisi dengan sesi aktif untuk owner ini
            if (req.user.role === 'Technician') {
                const session = await TechnicianAccess.findOne({
                    homeownerId: device.owner,
                    technicianId: req.user.userId,
                    status: 'Active'
                });
                if (!session) {
                    return res.status(403).json({ message: 'Anda tidak diizinkan mengontrol perangkat ini (Sesi tidak aktif).' });
                }
            } else {
                return res.status(403).json({ message: 'Anda tidak diizinkan mengontrol perangkat ini.' });
            }
        }
        
        // UPDATE STATUS DI DATABASE SEKARANG JUGA (Sinkronisasi Mutlak)
        device.status = newStatus;
        device.lastActivity = new Date();
        // Tambahkan penanda bahwa kita baru saja kirim perintah (untuk gembok status)
        device.lastCommand = newStatus;
        device.lastCommandTime = new Date();
        await device.save();

        const bieonId = device.bieonId || req.user.bieonId;
        const normalizedIeee = String(device.device_ieee || device.modelId || device.name || '').replace(/[:\-\s]/g, '').toLowerCase();
        
        // Cari info hub (bieonId/alias hub-nya)
        const Hub = require('../models/Hub');
        const hub = await Hub.findById(device.hubId);
        const hubIdAlias = hub?.bieonId || 'hub_01'; // Fallback ke alias hub

        // Publish hanya ke admin command topic untuk perangkat fisik.
        // Backend/ESP-B akan meneruskan ke ESP-A berdasarkan ieee target.
        try {
            const adminTopic = `bieon/${bieonId}/admin/command`;
            const adminPayload = {
                command: newStatus === '1' ? 'on' : 'off',
                action: newStatus === '1' ? 'on' : 'off',
                status: newStatus,
                bieon_id: bieonId,
                ieee: normalizedIeee,
                device_ieee: normalizedIeee,
                device_id: String(device._id),
                command_id: `cmd_${Date.now()}`,
                requested_by: String(req.user.userId),
                timestamp: Date.now()
            };
            const published = mqtt.publishCommand(adminTopic, adminPayload);
            if (!published) {
                return res.status(503).json({ message: 'MQTT broker belum siap untuk mengirim command' });
            }
            console.log(`[MQTT] Published admin command to ${adminTopic}`, adminPayload);
        } catch (err) {
            console.warn('[MQTT] Failed to publish admin command to ESP-B topic:', err && err.message ? err.message : err);
        }

        // LOGGING KE AKTIVITAS TERBARU
        await new Activity({
            user: device.owner,
            hub: device.hubId,
            room: device.location,
            actuator: device.name,
            status: newStatus === '1' ? 'ON' : 'OFF',
            action: newStatus === '1' ? 'Menyalakan' : 'Mematikan',
            trigger: 'Manual (Web)'
        }).save();

        // [ADD] NOTIFIKASI ALERT UNTUK KONTROL MANUAL
        const Alert = require('../models/Alert');
        const statusText = newStatus === '1' ? 'Menyala (ON)' : 'Mati (OFF)';
        
        let category = 'Sistem';
        if (device.environmentAspect === 'Keamanan') category = 'Keamanan';
        else if (device.environmentAspect === 'Kenyamanan') category = 'Kenyamanan';
        else if (device.environmentAspect === 'Kualitas Air') category = 'Air Sanitasi';

        await Alert.create({
            owner: device.owner,
            hub: device.hubId,
            category: category,
            title: `Kontrol Perangkat: ${statusText}`,
            messageKey: 'notification.global.device_manual_control',
            message: `[Manual] Anda telah ${newStatus === '1' ? 'menyalakan' : 'mematikan'} ${device.name} di ${device.location}.`,
            type: 'Info',
            link: 'kendali',
            metadata: { 
                deviceId: device._id,
                deviceName: device.name,
                location: device.location,
                action: newStatus === '1' ? 'ON' : 'OFF'
            }
        });

        // SINKRONISASI REAL-TIME: Kirim data LENGKAP agar UI tidak kehilangan info sensor/baterai
        broadcastDeviceTelemetry(device.hubId, device);

        res.status(200).json({ 
            message: `Perangkat ${device.name} berhasil diubah ke status ${newStatus}`,
            device 
        });
    } catch (error) {
        console.error("Error toggling device:", error);
        res.status(500).json({ message: 'Gagal mengubah status perangkat', error: error.message });
    }
};

// 9. Semat/Pin Perangkat (Max 2)
exports.togglePinDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const device = await KendaliPerangkat.findById(id);
        if (!device) {
            return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
        }

        // Cek kepemilikan
        if (String(device.owner) !== String(userId)) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses ke perangkat ini.' });
        }

        // Jika ingin menyematkan (pin), cek apakah sudah mencapai limit 2
        if (!device.isPinned) {
            const pinnedCount = await KendaliPerangkat.countDocuments({ owner: userId, isPinned: true });
            if (pinnedCount >= 2) {
                return res.status(400).json({ message: 'Maksimal 2 perangkat yang dapat disematkan.' });
            }
        }

        // Toggle status pin
        device.isPinned = !device.isPinned;
        await device.save();

        res.status(200).json({ 
            message: device.isPinned ? 'Perangkat berhasil disematkan!' : 'Sematkan dilepas!', 
            device 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menyematkan perangkat', error: error.message });
    }
};

// 8. Update parameters (Suhu, Volume, Speed, etc) untuk remote atau actuator
exports.updateDeviceParams = async (req, res) => {
    try {
        const { id } = req.params;
        const { controlType, value } = req.body;

        const device = await KendaliPerangkat.findById(id);
        if (!device) return res.status(404).json({ message: 'Perangkat tidak ditemukan' });

        // Update remoteState (Persistent state untuk sub-targets)
        if (!device.remoteState) device.remoteState = new Map();
        
        // Simpan nilai baru ke Map
        device.remoteState.set(controlType, value);
        
        // Tandai modifikasi untuk Map
        device.markModified('remoteState');
        await device.save();

        res.status(200).json({ 
            message: 'Parameter berhasil diperbarui', 
            device 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui parameter', error: error.message });
    }
};

// 9. Publish remote command from frontend mapping using original remote source IEEE
exports.sendRemoteCommand = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            catalogId,
            rawSignature,
            rawBitText,
            rawBitHex,
            rawBitBinary,
            sourceRemoteIeee,
            sourceRemoteId,
            functionKey,
            functionLabel,
            label,
            protocol
        } = req.body;

        const device = await KendaliPerangkat.findById(id);
        if (!device) return res.status(404).json({ message: 'Perangkat tidak ditemukan' });

        if (req.user.role !== 'SuperAdmin' && String(device.owner) !== String(req.user.userId)) {
            if (req.user.role === 'Technician') {
                const session = await TechnicianAccess.findOne({
                    homeownerId: device.owner,
                    technicianId: req.user.userId,
                    status: 'Active'
                });
                if (!session) {
                    return res.status(403).json({ message: 'Anda tidak diizinkan mengontrol perangkat ini (Sesi tidak aktif).' });
                }
            } else {
                return res.status(403).json({ message: 'Anda tidak diizinkan mengontrol perangkat ini.' });
            }
        }

        const bieonId = device.bieonId || req.user.bieonId;
        if (!bieonId) return res.status(400).json({ message: 'Bieon ID tidak tersedia untuk perangkat ini.' });

        const normalizedDeviceIeee = String(device.device_ieee || device.modelId || device.name || '').replace(/[:\-\s]/g, '').toLowerCase() || undefined;
        const adminTopic = `bieon/${bieonId}/admin/command`;

        // Determine raw hex and bit count for firmware compatibility
        let raw_hex = rawBitHex || '';
        let bits = 0;
        let inferredProtocol = protocol || req.body.protocol || undefined;

        // Try to infer protocol and bits from rawSignature (format: protocol|bits|hex)
        if (rawSignature && typeof rawSignature === 'string') {
            const sigParts = rawSignature.split('|');
            if (sigParts.length >= 3) {
                const sigProtocol = sigParts[0];
                const sigBits = Number(sigParts[1]);
                if (!inferredProtocol && sigProtocol && sigProtocol !== 'unknown') {
                    inferredProtocol = sigProtocol;
                }
                if (!bits && sigBits && !isNaN(sigBits)) {
                    bits = sigBits;
                }
            }
        }

        // Helper: attempt to set raw_hex/bits from a parsed object
        const tryExtractFromObject = (obj) => {
            if (!obj || typeof obj !== 'object') return false;
            // common keys: raw_hex, raw_value, raw, rawBit, raw_bit, bits, bit_length, bit_count
            if (obj.raw_hex) raw_hex = raw_hex || String(obj.raw_hex);
            if (obj.raw_value) raw_hex = raw_hex || String(obj.raw_value);
            if (obj.raw) raw_hex = raw_hex || String(obj.raw);
            if (obj.rawBit) raw_hex = raw_hex || String(obj.rawBit);
            if (obj.raw_bit) raw_hex = raw_hex || String(obj.raw_bit);
            if (obj.rawBitHex) raw_hex = raw_hex || String(obj.rawBitHex);
            if (obj.bits && Number(obj.bits)) bits = bits || Number(obj.bits);
            if (obj.bit_length && Number(obj.bit_length)) bits = bits || Number(obj.bit_length);
            if (obj.bit_count && Number(obj.bit_count)) bits = bits || Number(obj.bit_count);
            if (obj.protocol) inferredProtocol = inferredProtocol || String(obj.protocol);
            return !!(raw_hex || bits);
        };
        // 1) If rawBitText is JSON-encoded, parse and extract
        if (rawBitText && typeof rawBitText === 'string') {
            let parsed = null;
            try {
                parsed = JSON.parse(rawBitText);
            } catch (e) {
                parsed = null;
            }
            if (parsed) {
                tryExtractFromObject(parsed);
                // If parsed.raw_bit is a semicolon key=value string like slot=0;protocol=1;bits=64;raw=0x...
                const raw_bit_field = parsed.raw_bit || parsed.rawBit || parsed.rawBitText || parsed.raw_bit_text;
                if (raw_bit_field && typeof raw_bit_field === 'string') {
                    const parts = raw_bit_field.split(';');
                    for (const p of parts) {
                        const kv = p.split('=');
                        if (kv.length === 2) {
                            const k = kv[0].trim();
                            const v = kv[1].trim();
                            if ((k === 'raw' || k === 'raw_hex') && v) raw_hex = raw_hex || v;
                            if ((k === 'bits' || k === 'bit_length' || k === 'bit_count') && Number(v)) bits = bits || Number(v);
                            if (k === 'protocol' && v) inferredProtocol = inferredProtocol || v;
                        }
                    }
                }
            } else {
                // FALLBACK REGEX: if JSON parsing failed due to historical truncation in the database
                const hexMatch = rawBitText.match(/raw(?:_hex|_value)?["']?\s*[:=]\s*["']?(0x[0-9a-fA-F]+)/i);
                if (hexMatch) {
                    raw_hex = raw_hex || hexMatch[1];
                }
                const bitsMatch = rawBitText.match(/(?:bits|bit_length|bit_count)["']?\s*[:=]\s*["']?(\d+)/i);
                if (bitsMatch) {
                    bits = bits || Number(bitsMatch[1]);
                }
                const protoMatch = rawBitText.match(/protocol["']?\s*[:=]\s*["']?(\d+)/i);
                if (protoMatch) {
                    inferredProtocol = inferredProtocol || protoMatch[1];
                }
            }
        }
        // 2) If rawBitBinary provided as bit string
        if ((!raw_hex || raw_hex === '') && rawBitBinary) {
            const bin = String(rawBitBinary || '').replace(/[^01]/g, '');
            if (bin.length > 0) {
                bits = bits || Math.min(bin.length, 64);
                try {
                    const value = BigInt('0b' + bin.slice(0, bits));
                    raw_hex = raw_hex || ('0x' + value.toString(16));
                } catch (e) {
                    // ignore conversion errors
                }
            }
        }

        // 3) If rawBitText is plain binary or hex string
        if ((!raw_hex || raw_hex === '') && rawBitText && typeof rawBitText === 'string') {
            const txt = rawBitText.trim();
            if (/^[01]{1,64}$/.test(txt)) {
                bits = bits || Math.min(txt.length, 64);
                const value = BigInt('0b' + txt.slice(0, bits));
                raw_hex = raw_hex || ('0x' + value.toString(16));
            } else if (/^0x[0-9a-fA-F]+$/.test(txt)) {
                raw_hex = raw_hex || txt;
            }
        }

        // 4) fallback to provided rawBitHex
        if ((!raw_hex || raw_hex === '') && rawBitHex) {
            raw_hex = String(rawBitHex || '');
        }

        // 5) If we have raw_hex but not bits, infer from hex length
        if ((!bits || bits === 0) && raw_hex && raw_hex.length > 0) {
            const hx = raw_hex.replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '');
            if (hx.length > 0) bits = Math.min(hx.length * 4, 64);
        }

        const payload = {
            command: req.body.command || 'transmit', // firmware expects transmit/send/run
            action: functionKey || 'remote',
            rawBitText: rawBitText || undefined,
            rawBitHex: rawBitHex || undefined,
            rawBitBinary: rawBitBinary || undefined,
            raw_signature: rawSignature || undefined,
            raw_hex: raw_hex || undefined,
            raw_value: raw_hex || undefined,
            bits: bits ? String(bits) : undefined, // force string format for raw JSON parser on firmware
            protocol: inferredProtocol ? String(inferredProtocol) : undefined, // force string format
            sourceRemoteIeee: sourceRemoteIeee || undefined,
            sourceRemoteId: sourceRemoteId || undefined,
            // Include both target_ieee and ieee to match firmware expectations
            target_ieee: normalizedDeviceIeee,
            ieee: normalizedDeviceIeee,
            device_ieee: normalizedDeviceIeee,
            device_id: String(device._id),
            catalog_id: catalogId || undefined,
            label: label || functionLabel || undefined,
            command_id: `cmd_${Date.now()}`,
            requested_by: String(req.user.userId),
            timestamp: Date.now()
        };

        console.log(`[MQTT] Publishing admin command to ${adminTopic}:`, JSON.stringify(payload));
        const published = mqtt.publishCommand(adminTopic, payload);
        if (!published) {
            return res.status(503).json({ message: 'MQTT broker belum siap untuk mengirim perintah remote' });
        }

        res.status(200).json({ message: 'Perintah remote berhasil dikirim', payload });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengirim perintah remote', error: error.message });
    }
};

// ====================================================================
// SIMULASI TELEMETRI (Development Only)
// POST /api/kendaliperangkat/:id/simulate-telemetry
// Body: { temperature: 28.5, humidity: 65 }
// ====================================================================
exports.simulateTelemetry = async (req, res) => {
    try {
        const { id } = req.params;
        const { temperature, humidity } = req.body;

        const updateFields = { lastSeen: new Date(), status: 'Active' };
        if (temperature !== undefined) updateFields['currentValues.temperature'] = Number(temperature);
        if (humidity !== undefined) updateFields['currentValues.humidity'] = Number(humidity);

        const updatedDevice = await KendaliPerangkat.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedDevice) {
            return res.status(404).json({ message: 'Device tidak ditemukan' });
        }

        // Emit via Socket.IO langsung dari io instance yang di-share via app
        const io = req.app.get('io');
        if (io) {
            const emitPayload = {
                _id: updatedDevice._id,
                device_ieee: updatedDevice.device_ieee,
                ieee: updatedDevice.device_ieee,
                model: updatedDevice.modelId || updatedDevice.type,
                manufacturer: updatedDevice.manufacturer,
                currentValues: updatedDevice.currentValues,
                battery: updatedDevice.battery,
                status: String(updatedDevice.status),
            };
            io.emit('device_telemetry', emitPayload);
            console.log('📡 [SIMULATE] Emitted device_telemetry:', updatedDevice.device_ieee, updatedDevice.currentValues);
        } else {
            console.warn('⚠️ [SIMULATE] io instance not found on app');
        }

        res.status(200).json({
            message: 'Simulasi telemetri berhasil',
            device: {
                _id: updatedDevice._id,
                name: updatedDevice.name,
                currentValues: updatedDevice.currentValues,
                status: updatedDevice.status
            }
        });
    } catch (error) {
        console.error('Error simulating telemetry:', error);
        res.status(500).json({ message: 'Gagal simulasi telemetri', error: error.message });
    }
};
