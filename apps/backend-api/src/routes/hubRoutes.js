const express = require('express');
const router = express.Router();
const hubController = require('../controllers/hubController');

router.post('/setup', hubController.setupHubs);
router.get('/systems/:userId', hubController.getUserSystems);
router.get('/user/:userId', hubController.getHubs);
router.get('/cleanup-orphans', hubController.cleanupOrphans);
router.delete('/systems/:id', hubController.deleteSystem);

module.exports = router;
