const EnergyLog = require('../models/EnergyLog');
const EnvironmentLog = require('../models/EnvironmentLog');
const SecurityLog = require('../models/SecurityLog');
const WaterQualityLog = require('../models/WaterQualityLog');
const Activity = require('../models/Activity');
const Alert = require('../models/Alert');
const User = require('../models/User');
const PlnTariff = require('../models/PlnTariff');
const PdmMeter = require('../models/PdmMeter');

const buildFlexibleBieonIdRegex = (value) => {
    const chars = String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').split('');
    if (chars.length === 0) return null;
    return new RegExp(`^${chars.map((char) => `${char}[^A-Z0-9]*`).join('')}$`, 'i');
};

/**
 * Helper to get homeownerId based on user role
 */
const getTargetHomeownerId = (req) => {
    if (['SuperAdmin', 'Technician'].includes(req.user?.role)) {
        return req.query.homeownerId || req.user.userId;
    }
    return req.user.userId;
};

/**
 * Helper to build query with date range and owner
 */
const buildHistoryQuery = async (req, ownerField = 'owner') => {
    const ownerId = getTargetHomeownerId(req);
    const { startDate, endDate, bieonId } = req.query;
    
    let query = { [ownerField]: ownerId };

    // Date Range Filter
    if (startDate || endDate) {
        // Handle different date field names across models
        const dateField = (req.path.includes('activity')) ? 'timestamp' : 'date';
        query[dateField] = {};
        if (startDate) query[dateField].$gte = new Date(startDate);
        if (endDate) query[dateField].$lte = new Date(endDate);
    }

    // Bieon ID Filter (via Hub) - WITH DEVICE FALLBACK FOR LEGACY DATA
    if (bieonId) {
        const Hub = require('../models/Hub');
        const KendaliPerangkat = require('../models/KendaliPerangkat');
        
        // 1. Cari Hub ID berdasarkan BIEON ID
        const bieonRegex = buildFlexibleBieonIdRegex(bieonId);
        const hubs = bieonRegex ? await Hub.find({ bieonId: bieonRegex }).select('_id') : [];
        const hubIds = hubs.map(h => h._id);
        
        if (hubIds.length > 0) {
            // 2. Cari semua perangkat yang terdaftar di Hub ini untuk fallback data lama
            const devices = await KendaliPerangkat.find({ hubId: { $in: hubIds } }).select('_id name location');
            const deviceIds = devices.map(d => d._id);
            const rooms = Array.from(new Set(devices.map(d => d.location).filter(Boolean)));
            const actuatorNames = devices.map(d => d.name);

            // 3. Filter berdasarkan Hub (Data Baru) ATAU Metadata (Data Lama)
            const mongoose = require('mongoose');
            let ownerCriteria;
            try {
                ownerCriteria = [
                    { [ownerField]: new mongoose.Types.ObjectId(ownerId) },
                    { [ownerField]: ownerId.toString() }
                ];
            } catch (e) {
                ownerCriteria = [{ [ownerField]: ownerId }];
            }
            
            query.$and = [
                { $or: ownerCriteria },
                {
                    $or: [
                        { hub: { $in: hubIds } }, // New Data
                        { device: { $in: deviceIds } }, // Legacy Device
                        { room: { $in: rooms } }, // Legacy Room (Env)
                        { actuator: { $in: actuatorNames } }, // Legacy Actuator (Activity)
                        { "metadata.deviceId": { $in: deviceIds } }, // Legacy Alerts (ObjectId)
                        { "metadata.deviceId": { $in: deviceIds.map(id => id.toString()) } } // Legacy Alerts (String)
                    ]
                }
            ];
            
            delete query[ownerField];
        }
    }

    return query;
};

// 1. GET /api/history/environment
exports.getEnvironmentHistory = async (req, res) => {
    try {
        const query = await buildHistoryQuery(req);
        const data = await EnvironmentLog.find(query)
            .sort({ date: -1 })
            .limit(100);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. GET /api/history/security
exports.getSecurityHistory = async (req, res) => {
    try {
        const query = await buildHistoryQuery(req);
        const data = await SecurityLog.find(query)
            .populate('device', 'name') // Menarik nama perangkat
            .sort({ date: -1 })
            .limit(100);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. GET /api/history/water
exports.getWaterHistory = async (req, res) => {
    try {
        const query = await buildHistoryQuery(req);
        const data = await WaterQualityLog.find(query)
            .sort({ date: -1 })
            .limit(100);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. GET /api/history/energy
exports.getEnergyHistory = async (req, res) => {
    try {
        const query = await buildHistoryQuery(req);
        const data = await EnergyLog.find(query)
            .populate('device', 'name') // Menarik nama perangkat (PENTING)
            .sort({ date: -1 })
            .limit(100);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. GET /api/history/activity
exports.getActivityHistory = async (req, res) => {
    try {
        const query = await buildHistoryQuery(req, 'user');
        const data = await Activity.find(query)
            .sort({ timestamp: -1 })
            .limit(100);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. GET /api/history/alerts
exports.getAlertHistory = async (req, res) => {
    try {
        const query = await buildHistoryQuery(req);
        const data = await Alert.find(query)
            .sort({ date: -1 })
            .limit(100);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. PUT /api/history/alerts/:id/read
exports.markAlertAsRead = async (req, res) => {
    try {
        const ownerId = getTargetHomeownerId(req);
        const alert = await Alert.findOneAndUpdate(
            { _id: req.params.id, owner: ownerId }, 
            { isRead: true },
            { new: true }
        );

        if (!alert) {
            return res.status(403).json({ success: false, message: 'Notifikasi tidak ditemukan atau Anda tidak berwenang.' });
        }

        res.status(200).json({ success: true, message: 'Notifikasi ditandai sebagai dibaca' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 8. PUT /api/history/alerts/read-all
exports.markAllAsRead = async (req, res) => {
    try {
        const ownerId = getTargetHomeownerId(req);
        await Alert.updateMany({ owner: ownerId, isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: 'Semua notifikasi ditandai sebagai dibaca' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 9. PUT /api/history/alerts/reset-read
exports.resetAllRead = async (req, res) => {
    try {
        const ownerId = getTargetHomeownerId(req);
        await Alert.updateMany({ owner: ownerId }, { isRead: false });
        res.status(200).json({ success: true, message: 'Status baca berhasil di-reset' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 10. GET /api/history/energy-summary
exports.getEnergySummary = async (req, res) => {
    try {
        const ownerId = getTargetHomeownerId(req);
        const { bieonId } = req.query;

        let hubIds = [];
        if (bieonId) {
            const Hub = require('../models/Hub');
            const bieonRegex = buildFlexibleBieonIdRegex(bieonId);
            const hubs = bieonRegex ? await Hub.find({ bieonId: bieonRegex }).select('_id') : [];
            hubIds = hubs.map(h => h._id);
        }
        
        // 1. Ambil data User untuk info token & tarif
        const user = await User.findById(ownerId);
        if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

        // --- CEK RESET BULANAN ---
        const now = new Date();
        const lastReset = user.lastBudgetReset ? new Date(user.lastBudgetReset) : new Date(0);
        
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
            // Bulan berganti! Update lastBudgetReset
            user.lastBudgetReset = now;
            await user.save();
            
            // Kirim notifikasi penyambutan bulan baru
            await Alert.create({
                owner: user._id,
                category: 'Energi',
                title: 'Bulan Baru, Anggaran Baru!',
                message: `Selamat datang di bulan ${MONTH_NAMES[now.getMonth()]}! Anggaran listrik Anda sebesar Rp ${user.tokenBalance.toLocaleString('id-ID')} telah diaktifkan kembali.`,
                type: 'Success',
                link: 'dashboard'
            });
        }

        // 2. Tentukan tarif per kWh
        let tariffRate = 1444.00; // Default R1 standar
        if (user.plnTariff) {
            const latestTariff = await PlnTariff.findOne({ category: user.plnTariff }).sort({ createdAt: -1 });
            if (latestTariff) tariffRate = latestTariff.tariff;
        }
        
        // 3. Ambil data hari ini (Harian)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const queryDaily = {
            owner: ownerId,
            date: { $gte: startOfDay, $lte: endOfDay }
        };
        if (hubIds.length > 0) queryDaily.hub = { $in: hubIds };

        const logsToday = await EnergyLog.find(queryDaily).sort({ date: 1 });

        // Aggregate hourly
        const hourlyBuckets = Array(24).fill(0).map((_, i) => ({ time: `${String(i).padStart(2, '0')}:00`, kwh: 0, cost: 0 }));
        let totalKwhToday = 0;
        let totalCostToday = 0;

        logsToday.forEach(log => {
            const hour = new Date(log.date).getHours();
            hourlyBuckets[hour].kwh += log.totalKwh;
            hourlyBuckets[hour].cost += Math.round(log.totalKwh * tariffRate);
            totalKwhToday += log.totalKwh;
            totalCostToday += Math.round(log.totalKwh * tariffRate);
        });

        // 4. Ambil data Bulanan (12 bulan terakhir)
        const startOfYear = new Date();
        startOfYear.setMonth(0, 1);
        startOfYear.setHours(0, 0, 0, 0);

        const queryYearly = {
            owner: ownerId,
            date: { $gte: startOfYear }
        };
        if (hubIds.length > 0) queryYearly.hub = { $in: hubIds };

        const logsYear = await EnergyLog.find(queryYearly);

        const monthlyData = Array(12).fill(0).map((_, i) => ({ 
            month: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][i],
            kwh: 0, 
            cost: 0 
        }));

        logsYear.forEach(log => {
            const month = new Date(log.date).getMonth();
            monthlyData[month].kwh += log.totalKwh;
            monthlyData[month].cost += Math.round(log.totalKwh * tariffRate);
        });

        // 5. Ambil Beban Realtime dari Perangkat Power Meter
        const KendaliPerangkat = require('../models/KendaliPerangkat');
        const pmQuery = { 
            owner: ownerId, 
            $or: [
                { category: 'Sensor Energi' },
                { environmentAspect: 'Energi' }
            ]
        };
        if (hubIds.length > 0) pmQuery.hubId = { $in: hubIds };

        const powerMeter = await KendaliPerangkat.findOne(pmQuery);
        const pdmMeter = await PdmMeter.findOne({
            owner: ownerId,
            ...(hubIds.length > 0 ? { bieonId: buildFlexibleBieonIdRegex(bieonId) || bieonId } : {})
        });

        const combinedLoad = (powerMeter?.currentValues?.currentLoad || 0) + (pdmMeter?.currentValues?.currentLoad || 0);

        res.status(200).json({ 
            success: true, 
            data: {
                dailyData: hourlyBuckets.slice(0, new Date().getHours() + 1), // Hanya tampilkan sampai jam sekarang
                monthlyData,
                currentLoad: combinedLoad,
                runningConsumption: parseFloat(totalKwhToday.toFixed(2)),
                avgHourly: totalKwhToday > 0 ? parseFloat((totalKwhToday / (new Date().getHours() + 1)).toFixed(3)) : 0,
                totalCost: totalCostToday,
                // Info Token untuk Dashboard
                tokenBalance: user.tokenBalance || 0,
                tokenThreshold: user.tokenThreshold || 50000
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
