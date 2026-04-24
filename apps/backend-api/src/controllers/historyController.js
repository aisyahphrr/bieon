const EnergyLog = require('../models/EnergyLog');
const EnvironmentLog = require('../models/EnvironmentLog');
const SecurityLog = require('../models/SecurityLog');
const WaterQualityLog = require('../models/WaterQualityLog');
const Activity = require('../models/Activity');
const Alert = require('../models/Alert');

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

    // Bieon ID Filter (via Hub)
    if (bieonId && !req.path.includes('activity')) {
        const Hub = require('../models/Hub');
        const hubs = await Hub.find({ bieonId }).select('_id');
        const hubIds = hubs.map(h => h._id);
        query.hub = { $in: hubIds };
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
        await Alert.findByIdAndUpdate(req.params.id, { isRead: true });
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
