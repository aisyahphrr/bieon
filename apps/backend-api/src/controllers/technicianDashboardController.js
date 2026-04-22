const dashboardService = require('../modules/dashboard/technicianDashboardService');

/**
 * GET /api/technician/dashboard/metrics
 */
exports.getMetrics = async (req, res) => {
    try {
        const metrics = await dashboardService.getMetrics(req.user.userId);
        res.status(200).json({
            success: true,
            data: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil metrik dashboard teknisi.',
            error: error.message
        });
    }
};

/**
 * GET /api/technician/dashboard/charts
 */
exports.getCharts = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();
        const charts = await dashboardService.getCharts(req.user.userId, year);
        res.status(200).json({
            success: true,
            data: charts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data grafik dashboard teknisi.',
            error: error.message
        });
    }
};

/**
 * GET /api/technician/dashboard/clients
 */
exports.getClients = async (req, res) => {
    try {
        const clients = await dashboardService.getClientMonitoring(req.user.userId);
        res.status(200).json({
            success: true,
            data: clients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar monitoring klien.',
            error: error.message
        });
    }
};
