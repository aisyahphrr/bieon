const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const plnTariffController = require('../controllers/plnTariffController');

// Semua route dilindungi: wajib login sebagai SuperAdmin

// Public route untuk daftar kategori
router.get('/public/categories', plnTariffController.getCategories);

// GET /api/admin/tariffs/current
router.get('/current', authMiddleware, roleMiddleware('SuperAdmin'), plnTariffController.getCurrentTariffs);

// GET /api/admin/tariffs/summary
router.get('/summary', authMiddleware, roleMiddleware('SuperAdmin'), plnTariffController.getPlnSummary);

// GET /api/admin/tariffs/history
router.get('/history', authMiddleware, roleMiddleware('SuperAdmin'), plnTariffController.getHistory);

// GET /api/admin/tariffs/distribution
router.get('/distribution', authMiddleware, roleMiddleware('SuperAdmin'), plnTariffController.getDistribution);

// GET /api/admin/tariffs/trend
router.get('/trend', authMiddleware, roleMiddleware('SuperAdmin'), plnTariffController.getTrend);

// POST /api/admin/tariffs
router.post('/', authMiddleware, roleMiddleware('SuperAdmin'), plnTariffController.createTariff);

module.exports = router;
