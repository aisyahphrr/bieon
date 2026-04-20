const User = require('../../models/User');
const Hub = require('../../models/Hub');
const Device = require('../../models/Device');
const Complaint = require('../../models/Complaint');

/**
 * Get aggregated dashboard metrics for SuperAdmin dashboard
 * @returns {Promise<Object>} Object containing total counts for Users, Hubs, Devices, and Complaints
 */
exports.getDashboardMetrics = async () => {
    try {
        // Count total users (exclude SuperAdmin, only count active users: Homeowner and Technician)
        const totalUsers = await User.countDocuments({
            role: 'Homeowner'
        });

        // Count total hubs
        const totalHubs = await Hub.countDocuments();

        // Count total devices
        const totalDevices = await Device.countDocuments();

        // Count total complaints
        const totalComplaints = await Complaint.countDocuments();

        return {
            totalUsers,
            totalHubs,
            totalDevices,
            totalComplaints,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        throw new Error(`Failed to fetch dashboard metrics: ${error.message}`);
    }
};
