const KendaliPerangkat = require('../models/KendaliPerangkat');
const SensorData = require('../models/SensorData');
const RegisteredProduct = require('../models/RegisteredProduct');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { publishCommand } = require('../config/mqtt');
const { broadcastNewDevice, broadcastDeviceTelemetry } = require('../shared/socketEmitter');
const Hub = require('../models/Hub');
const TechnicianAccess = require('../models/TechnicianAccess');
const DeviceWhitelist = require('../models/DeviceWhitelist');
const { SUPPORTED_MODELS } = require('../config/supportedDevices');

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
        const { name, deviceType, category, location, notes, hubId, sensorParams, scheduleSettings, controlMode, sensorData, controlledDevice, ownerId: manualOwnerId, device_ieee } = req.body;
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
        const hub = await Hub.findById(hubId);

        // --- NEW: AUTO LOOKUP IEEE FROM WHITELIST ---
        // Cari di Whitelist berdasarkan nama atau profile yang diinput user
        let finalIeee = device_ieee || req.body.ieee || req.body.mac || req.body.productId;
        let finalModelId = null;
        
        if (!finalIeee || finalIeee === "0000000000000000") {
            const whitelistMatch = await DeviceWhitelist.findOne({
                $or: [
                    { device_id: name },
                    { device_profile: name },
                    { device_name: name }
                ]
            });
            if (whitelistMatch) {
                finalIeee = whitelistMatch.device_ieee;
                finalModelId = whitelistMatch.model_id;
                console.log(`[WHITELIST] Found matching IEEE for ${name}: ${finalIeee} (${finalModelId})`);
            }
        }
        
        const capturedIeee = finalIeee || "0000000000000000";

        const newDevice = new KendaliPerangkat({
            name,
            location,
            notes,
            hubId,
            category,
            type: deviceType,
            status: 'Active',
            lifecycleState: 'PROVISIONED',
            owner: ownerId,
            tenantId: user?.tenantId || "tenant_001", 
            bieonId: user?.bieonId || hub?.bieonId || 'Unknown',
            device_ieee: capturedIeee, 
            modelId: finalModelId, // Simpan model id asli
            thresholds: sensorParams, 
            controlMethod: controlMode || 'manual',
            scheduleSettings,
            sensorData, 
            controlledDevice,
            lastActivity: new Date()
        });

        await newDevice.save();

        // Update RegisteredProduct status if productId provided
        if (req.body.productId) {
            await RegisteredProduct.findOneAndUpdate(
                { productId: req.body.productId },
                { isUsed: true }
            );
        }

        broadcastNewDevice(newDevice);

        // --- MQTT CONFIG & HIERARCHY SYNC ---
        try {
            if (hub) {
                const formattedHubId = hub.name.toLowerCase().replace('hub node ', 'hubnode_');
                const userTenantId = user?.tenantId || "tenant_001";
                
                // 1. Collective Device Map Publish (Command to Hardware)
                const allUserDevices = await KendaliPerangkat.find({ owner: ownerId, status: 'Active' });
                const configTopic = `tenant/${userTenantId}/bieon/${newDevice.bieonId}/config/device-map`;
                
                const mappedDevices = allUserDevices.map(d => {
                    // Smart Matching: Cek di Nama, Tipe, dan Kategori
                    let modelInfo = SUPPORTED_MODELS[d.type] || SUPPORTED_MODELS[d.category] || {};
                    
                    if (!modelInfo.telemetry_fields) {
                        const searchString = `${d.name} ${d.type} ${d.category}`.toLowerCase();
                        if (searchString.includes('kenyamanan') || searchString.includes('th') || searchString.includes('temp') || searchString.includes('sensor')) {
                            modelInfo = SUPPORTED_MODELS["SNZB-02DR2"];
                        } else if (searchString.includes('plug') || searchString.includes('switch') || searchString.includes('stop kontak') || searchString.includes('listrik')) {
                            modelInfo = SUPPORTED_MODELS["smart_plug"];
                        } else if (searchString.includes('analog') || searchString.includes('water') || searchString.includes('quality') || searchString.includes('air')) {
                            modelInfo = SUPPORTED_MODELS["analog_sensor"];
                        }
                    }
                    
                    let rawIeee = d.device_ieee || "0000000000000000";
                    let cleanIeee = rawIeee.replace(/[:\-]/g, '').toUpperCase();
                    let formattedIeee = (cleanIeee.match(/.{1,2}/g) || ["00", "00", "00", "00", "00", "00", "00", "00"]).join(':');

                    return {
                        ieee: formattedIeee,
                        device_id: d.name, 
                        telemetry_fields: modelInfo.telemetry_fields || ["status"],
                        command_fields: modelInfo.command_fields || []
                    };
                });

                publishCommand(configTopic, {
                    type: "device_map",
                    devices: mappedDevices,
                    ts: Math.floor(Date.now() / 1000)
                }, { qos: 1, retain: true });

                console.log(`[MQTT] Config Map published for tenant: ${userTenantId}. Waiting for hardware to announce status.`);
            }
        } catch (mqttErr) {
            console.error('[MQTT] Config Sync Failed:', mqttErr.message);
        }

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
        const { name, location, sensorParams, controlMode, environmentAspect, scheduleSettings, thresholds, controlMethod, notes, controlledDevice } = req.body;

        // Cari dulu untuk cek kepemilikan
        const device = await KendaliPerangkat.findById(id);
        if (!device) {
            return res.status(404).json({ message: 'Perangkat tidak ditemukan' });
        }

        // Cek kepemilikan (Kecuali SuperAdmin)
        if (req.user.role !== 'SuperAdmin' && String(device.owner) !== String(req.user.userId)) {
            return res.status(403).json({ message: 'Anda tidak memiliki hak akses untuk mengonfigurasi perangkat ini.' });
        }

        const updatedDevice = await KendaliPerangkat.findByIdAndUpdate(
            id,
            { 
                name, 
                location, 
                notes,
                thresholds: sensorParams || thresholds, 
                controlMethod: controlMode || controlMethod, 
                environmentAspect,
                scheduleSettings,
                controlledDevice,
                status: 'Active',
                lastActivity: new Date()
            },
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

        const devices = await KendaliPerangkat.find({ owner: userId });
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data perangkat user', error: error.message });
    }
};

// 5. Ambil perangkat berdasarkan Hub
exports.getDevicesByHub = async (req, res) => {
    try {
        const devices = await KendaliPerangkat.find({ hubId: req.params.hubId });
        res.status(200).json(devices);
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

        const devices = await KendaliPerangkat.find({ owner: userId, status: 'Discovered' });
        res.status(200).json(devices);
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

        await KendaliPerangkat.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Perangkat berhasil dihapus' });
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

        // --- HIERARCHICAL TOPIC GENERATION (Hardware Flow) ---
        // Format: tenant/<tenantId>/bieon/<bieonId>/hub/<hubId>/device/<deviceId>/command
        const tenantId = String(device.owner);
        const bieonId = device.bieonId || req.user.bieonId;
        
        // Cari info hub (bieonId/alias hub-nya)
        const Hub = require('../models/Hub');
        const hub = await Hub.findById(device.hubId);
        const hubIdAlias = hub?.bieonId || 'hub_01'; // Fallback ke alias hub

        const sanitizedDeviceName = device.name.toLowerCase().replace(/\s+/g, '_');
        const topicCommand = `tenant/${tenantId}/bieon/${bieonId}/hub/${hubIdAlias}/device/${sanitizedDeviceName}/command`;

        console.log(`[MQTT] Sending hierarchical command to: ${topicCommand}`);

        // Publish ke MQTT
        publishCommand(topicCommand, newStatus);

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
            message: `[Manual] Anda telah ${newStatus === '1' ? 'menyalakan' : 'mematikan'} ${device.name} di ${device.location}.`,
            type: 'Info',
            link: 'kendali',
            metadata: { deviceId: device._id }
        });

        // SINKRONISASI REAL-TIME: Langsung kirim balasan ke frontend agar tidak stuck di 'Memproses...'
        broadcastDeviceTelemetry(device.hubId, {
            _id: device._id,
            status: device.status
        });

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
