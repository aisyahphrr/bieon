const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.post('/', deviceController.createDevice);
router.get('/owner/:userId', deviceController.getDevicesByOwner);

module.exports = router;
