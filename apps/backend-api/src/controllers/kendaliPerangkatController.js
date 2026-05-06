const KendaliPerangkat = require('../models/KendaliPerangkat');
const SensorData = require('../models/SensorData');
const RegisteredProduct = require('../models/RegisteredProduct');
const { publishCommand } = require('../config/mqtt');
const { broadcastNewDevice, broadcastDeviceTelemetry } = require('../shared/socketEmitter');

// 1. Mencatat perangkat yang terdeteksi (tanda icon di UI)
exports.discoverDevice = async (req, res) => {
    try {
        const { hubId, category, type, ownerId } = req.body;
        
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
        const { name, deviceType, category, location, notes, hubId, ownerId, sensorParams, scheduleSettings, controlMode, sensorData } = req.body;
        
        const newDevice = new KendaliPerangkat({
            name,
            location,
            notes,
            hubId,
            category,
            type: deviceType,
            status: 'Active',
            owner: ownerId,
            thresholds: sensorParams, // Mapping sensorsParams ke thresholds di model
            controlMethod: controlMode || 'manual',
            scheduleSettings,
            sensorData, // Data simulasi awal
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
        const { name, location, sensorParams, controlMode, environmentAspect, scheduleSettings, thresholds, controlMethod, notes } = req.body;

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

// 4. Ambil perangkat berdasarkan User
exports.getDevicesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
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

// 6. Ambil semua perangkat yang baru terdeteksi (status Discovered)
exports.getDiscoveredDevices = async (req, res) => {
    try {
        const devices = await KendaliPerangkat.find({ status: 'Discovered' });
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data perangkat baru', error: error.message });
    }
};

// 7. Hapus perangkat
exports.deleteDevice = async (req, res) => {
    try {
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
        
        // UPDATE STATUS DI DATABASE SEKARANG JUGA (Sinkronisasi Mutlak)
        device.status = newStatus;
        device.lastActivity = new Date();
        // Tambahkan penanda bahwa kita baru saja kirim perintah (untuk gembok status)
        device.lastCommand = newStatus;
        device.lastCommandTime = new Date();
        await device.save();

        // Topic format: bieon/<deviceName>/command
        // Misalnya: bieon/plug_01/command (sesuai arahan: command untuk subscribe command)
        const sanitizedName = device.name.toLowerCase().replace(/\s+/g, '_');
        const topicCommand = `bieon/${sanitizedName}/command`;

        // Publish ke MQTT dalam format angka TELANJANG (Raw) 
        // Contoh: command = 0
        publishCommand(topicCommand, newStatus);

        // Logging ke SensorData dihapus dari sini agar murni bergantung pada balasan 
        // status asli dari alat fisik via mqtt.js (2-way communication)

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
