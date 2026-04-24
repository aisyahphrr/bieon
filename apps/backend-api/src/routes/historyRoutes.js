const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const historyController = require('../controllers/historyController');

// All history routes require authentication
router.use(authMiddleware);

router.get('/environment', historyController.getEnvironmentHistory);
router.get('/security', historyController.getSecurityHistory);
router.get('/water', historyController.getWaterHistory);
router.get('/energy', historyController.getEnergyHistory);
router.get('/activity', historyController.getActivityHistory);
router.get('/alerts', historyController.getAlertHistory);
router.put('/alerts/:id/read', historyController.markAlertAsRead);
router.put('/alerts/read-all', historyController.markAllAsRead);
router.put('/alerts/reset-read', historyController.resetAllRead);

module.exports = router;
