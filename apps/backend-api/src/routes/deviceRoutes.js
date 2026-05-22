const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', deviceController.createDevice);
router.get('/owner/:userId', deviceController.getDevicesByOwner);
router.get('/unassigned', deviceController.getUnassignedDevices);
router.post('/pairing/start', deviceController.startPairing);
router.post('/pairing/open', authMiddleware, deviceController.startOpenJoin);

module.exports = router;
