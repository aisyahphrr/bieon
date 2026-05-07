const User = require('../../models/User');
const Hub = require('../../models/Hub');
const Device = require('../../models/Device');
const KendaliPerangkat = require('../../models/KendaliPerangkat');
const Complaint = require('../../models/Complaint');

const buildMonthlySeries = (rows = []) => {
    const series = Array(12).fill(0);

    rows.forEach((row) => {
        const monthIndex = Number(row._id) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            series[monthIndex] = row.count;
        }
    });

    return series;
};

/**
 * Get aggregated dashboard metrics for SuperAdmin dashboard
 * Returns totals and monthly stats for the current year
 * @returns {Promise<Object>} Object containing totals and monthly trends
 */
exports.getDashboardMetrics = async () => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

        const [
            totalUsers,
            activeHomeowners,
            inactiveHomeowners,
            warningHomeowners,
            totalHubs,
            lastMonthHubs,
            totalDevices,
            lastMonthDevices,
            totalComplaints,
            pendingComplaints,
            totalTechnicians,
            activeTechnicians,
            monthlyInstalasiRows,
            monthlyPelangganRows,
            monthlyTechniciansRows,
            monthlyDevicesRows,
            monthlyComplaintsRows,
            monthlyHubsRows,
        ] = await Promise.all([
            User.countDocuments({ role: 'Homeowner' }),
            User.countDocuments({ role: 'Homeowner', status: { $nin: ['nonaktif', 'warning'] } }),
            User.countDocuments({ role: 'Homeowner', status: 'nonaktif' }),
            User.countDocuments({ role: 'Homeowner', status: 'warning' }),
            Hub.countDocuments(),
            Hub.countDocuments({ createdAt: { $lt: startOfCurrentMonth } }),
            KendaliPerangkat.countDocuments(),
            KendaliPerangkat.countDocuments({ createdAt: { $lt: startOfCurrentMonth } }),
            Complaint.countDocuments(),
            Complaint.countDocuments({ status: { $in: ['proses', 'perbaikan'] } }),
            User.countDocuments({ role: 'Technician' }),
            User.countDocuments({ role: 'Technician', status: 'aktif' }),
            User.aggregate([
                {
                    $match: {
                        bieonId: { $exists: true, $nin: [null, ''] },
                        createdAt: { $gte: startOfYear, $lte: endOfYear },
                    },
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            User.aggregate([
                {
                    $match: {
                        role: 'Homeowner',
                        createdAt: { $gte: startOfYear, $lte: endOfYear },
                    },
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            User.aggregate([
                {
                    $match: {
                        role: 'Technician',
                        createdAt: { $gte: startOfYear, $lte: endOfYear },
                    },
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            KendaliPerangkat.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfYear, $lte: endOfYear },
                    },
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            Complaint.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfYear, $lte: endOfYear },
                    },
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            Hub.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfYear, $lte: endOfYear },
                    },
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        // Hitung Tren Persentase
        const calculateTrend = (total, lastMonth) => {
            if (lastMonth === 0) return total > 0 ? 100 : 0;
            const diff = total - lastMonth;
            return Math.round((diff / lastMonth) * 100);
        };

        return {
            totalUsers,
            totalHubs,
            hubTrend: calculateTrend(totalHubs, lastMonthHubs),
            totalDevices,
            deviceTrend: calculateTrend(totalDevices, lastMonthDevices),
            totalComplaints,
            pendingComplaints,
            totalTechnicians,
            activeTechnicians,
            activeHomeowners,
            inactiveHomeowners,
            warningHomeowners,
            monthlyInstalasi: buildMonthlySeries(monthlyInstalasiRows),
            monthlyPelanggan: buildMonthlySeries(monthlyPelangganRows),
            monthlyTechnicians: buildMonthlySeries(monthlyTechniciansRows),
            monthlyDevices: buildMonthlySeries(monthlyDevicesRows),
            monthlyComplaints: buildMonthlySeries(monthlyComplaintsRows),
            monthlyHubs: buildMonthlySeries(monthlyHubsRows),
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        throw new Error(`Failed to fetch dashboard metrics: ${error.message}`);
    }
};
