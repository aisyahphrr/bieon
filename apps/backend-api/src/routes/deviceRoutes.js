const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.post('/', deviceController.createDevice);
router.get('/owner/:userId', deviceController.getDevicesByOwner);
router.get('/unassigned', deviceController.getUnassignedDevices);
router.post('/pairing/start', deviceController.startPairing);

module.exports = router;
