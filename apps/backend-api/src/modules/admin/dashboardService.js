const User = require('../../models/User');
const Hub = require('../../models/Hub');
const Device = require('../../models/Device');
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
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

        const [
            totalUsers,
            totalHubs,
            totalDevices,
            totalComplaints,
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
            Hub.countDocuments(),
            Device.countDocuments(),
            Complaint.countDocuments(),
            User.countDocuments({ role: 'Technician' }),
            User.countDocuments({ role: 'Technician', status: 'aktif' }),
            User.aggregate([
                {
                    $match: {
                        role: 'Homeowner',
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
            Device.aggregate([
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

        return {
            totalUsers,
            totalHubs,
            totalDevices,
            totalComplaints,
            totalTechnicians,
            activeTechnicians,
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
