const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

router.post('/', complaintController.createComplaint);
router.get('/owner/:userId', complaintController.getComplaintsByOwner);

module.exports = router;
