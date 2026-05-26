const express = require('express');
const router = express.Router();
const hubController = require('../controllers/hubController');

const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.post('/setup', protect, hubController.setupHubs);
router.get('/systems/:userId', protect, hubController.getUserSystems);
router.get('/user/:userId', protect, hubController.getHubs);
router.get('/cleanup-orphans', protect, restrictTo('SuperAdmin'), hubController.cleanupOrphans);
router.delete('/systems/:id', protect, hubController.deleteSystem);
router.post('/open_join', protect, hubController.startHubOpenJoin);
router.post('/:hubId/leave', protect, hubController.leaveHub);
router.delete('/:hubId', protect, hubController.deleteHub);

module.exports = router;
