const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authMiddleware = require('../middlewares/authMiddleware');

// Endpoint sementara untuk seeding (ditaruh sebelum authMiddleware agar mudah dipanggil via browser)
router.get('/seed', alertController.seedAlerts);

// Proteksi semua endpoint alerts dengan authMiddleware
router.use(authMiddleware);

// GET /api/alerts
router.get('/', alertController.getAlerts);

// PUT /api/alerts/:id/read
router.put('/:id/read', alertController.markAsRead);

// PUT /api/alerts/seen-all
router.put('/seen-all', alertController.markAllAsSeen);

module.exports = router;
