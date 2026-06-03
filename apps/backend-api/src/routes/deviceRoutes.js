const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const remoteRegistrationController = require('../controllers/remoteRegistrationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', deviceController.createDevice);
router.get('/owner/:userId', deviceController.getDevicesByOwner);
router.get('/unassigned', deviceController.getUnassignedDevices);
router.post('/pairing/start', deviceController.startPairing);
router.post('/pairing/open', authMiddleware, deviceController.startOpenJoin);
router.post('/registration/:bieonId/start', authMiddleware, remoteRegistrationController.startRemoteRegistration);
router.get('/registration/:bieonId/catalog', authMiddleware, remoteRegistrationController.getRawBitCatalog);
router.patch('/registration/catalog/:catalogId', authMiddleware, remoteRegistrationController.updateRawBitCatalog);

module.exports = router;
