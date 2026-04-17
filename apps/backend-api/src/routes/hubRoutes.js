const express = require('express');
const router = express.Router();
const hubController = require('../controllers/hubController');

router.post('/setup', hubController.setupHubs);
router.get('/user/:userId', hubController.getHubs);

module.exports = router;
