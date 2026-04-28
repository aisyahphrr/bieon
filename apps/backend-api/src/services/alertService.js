const Alert = require('../models/Alert');
const KendaliPerangkat = require('../models/KendaliPerangkat');
const Hub = require('../models/Hub');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// --- 1. SENSOR & LINGKUNGAN (Homeowner) ---
// Simulasi penerima data IoT. Mengecek data masuk melawan threshold di KendaliPerangkat
exports.simulateSensorData = async (deviceId, sensorData) => {
    try {
        const device = await KendaliPerangkat.findById(deviceId);
        if (!device || !device.thresholds) return null;

        const alertsToCreate = [];
        
        // Cek pH Air
        if (sensorData.ph && device.thresholds.ph) {
            // Misal: Jika deviasi pH terlalu besar dari nilai ideal (misal batas toleransi +- 1.5)
            // Di sini kita asumsikan thresholds.ph adalah nilai ideal.
            if (Math.abs(sensorData.ph - device.thresholds.ph) > 1.5) {
                alertsToCreate.push({
                    owner: device.owner,
                    category: 'Air Sanitasi',
                    title: 'Peringatan Kualitas Air',
                    message: `pH Air pada ${device.name} terdeteksi abnormal (${sensorData.ph}). Cek filter air Anda.`,
                    type: 'Bahaya',
                    link: 'kendali'
                });
            }
        }

        // Cek Suhu (Temperature)
        if (sensorData.temperature && device.thresholds.temperature) {
            if (sensorData.temperature > device.thresholds.temperature + 5) {
                alertsToCreate.push({
                    owner: device.owner,
                    category: 'Kenyamanan',
                    title: 'Suhu Terlalu Panas',
                    message: `Suhu ruangan di ${device.location} mencapai ${sensorData.temperature}°C.`,
                    type: 'Waspada',
                    link: 'kendali'
                });
            }
        }

        // Cek Keamanan Pintu
        if (sensorData.doorOpen && device.thresholds.isDoorEnabled) {
            alertsToCreate.push({
                owner: device.owner,
                category: 'Keamanan',
                title: 'Aktivitas Pintu Terdeteksi',
                message: `Pintu di ${device.location} terbuka melebihi batas waktu aman.`,
                type: 'Bahaya',
                link: 'kendali'
            });
        }

        if (alertsToCreate.length > 0) {
            await Alert.insertMany(alertsToCreate);
            return alertsToCreate;
        }

        return null;
    } catch (error) {
        console.error("Error in simulateSensorData:", error);
        throw error;
    }
};

// --- 2. OTOMATISASI JADWAL (Homeowner) ---
exports.simulateScheduleExecution = async (deviceId, actionStr) => {
    try {
        const device = await KendaliPerangkat.findById(deviceId);
        if (!device) return null;

        const newAlert = await Alert.create({
            owner: device.owner,
            category: 'Sistem',
            title: 'Jadwal Otomatis',
            message: `Perangkat ${device.name} telah di-${actionStr} secara otomatis berdasarkan jadwal.`,
            type: 'Info',
            link: 'kendali'
        });

        return newAlert;
    } catch (error) {
        console.error("Error in simulateScheduleExecution:", error);
        throw error;
    }
};

// --- 3. OPERASIONAL & SISTEM (Teknisi & SA) ---
// Simulasi mengecek Hub yang Offline
exports.checkSystemHealth = async () => {
    try {
        // Simulasi kita paksa ambil 1 hub secara acak (jika ada) dan anggap offline
        const randomHub = await Hub.findOne().populate('owner', 'bieonId');
        if (!randomHub) return;

        // Beri tahu SuperAdmin
        const admins = await User.find({ role: { $regex: /admin/i } });
        const adminAlerts = admins.map(admin => ({
            owner: admin._id,
            category: 'Sistem',
            title: 'Hub Offline (Peringatan Massal)',
            message: `KONEKSI TERPUTUS: Hub BIEON milik pelanggan ${randomHub.owner?.bieonId || 'Unknown'} tidak dapat dihubungi.`,
            type: 'Danger',
            link: 'admin-dashboard'
        }));

        if (adminAlerts.length > 0) {
            await Alert.insertMany(adminAlerts);
        }

        return adminAlerts;
    } catch (error) {
        console.error("Error in checkSystemHealth:", error);
        throw error;
    }
};
