const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/technicianDashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Semua route di sini memerlukan autentikasi dan role Technician
router.use(authMiddleware);
router.use(roleMiddleware('Technician'));

router.get('/metrics', dashboardController.getMetrics);
router.get('/charts', dashboardController.getCharts);
router.get('/clients', dashboardController.getClients);

module.exports = router;
