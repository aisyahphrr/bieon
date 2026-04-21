const express = require('express');
const router = express.Router();
const technicianAccessController = require('../controllers/technicianAccessController');

// Route untuk Homeowner generate token
router.post('/generate-token', technicianAccessController.generateToken);

// Route untuk Teknisi validasi token
router.post('/validate-token', technicianAccessController.validateToken);

// Route untuk mendapatkan status akses saat ini (Homeowner/Teknisi)
router.get('/status/:homeownerId', technicianAccessController.getStatus);

// Route untuk mengirim laporan sesi (Teknisi)
router.post('/submit-report', technicianAccessController.submitReport);
router.post('/report/:sessionId', technicianAccessController.submitReport);

module.exports = router;
