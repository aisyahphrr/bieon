const KendaliPerangkat = require('../models/KendaliPerangkat');
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
            { new: true, runValidators: true }
        );

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
