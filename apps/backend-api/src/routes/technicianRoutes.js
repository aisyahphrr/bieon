const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Route untuk Profil (Bisa diakses oleh SA atau Teknisi ybs)
router.get('/profile/:id', technicianController.getTechnicianProfile);

// Route untuk Update Profil
router.put('/profile/:id', technicianController.updateTechnicianProfile);

// Route untuk update lokasi live teknisi
router.post(
    '/location',
    authMiddleware,
    roleMiddleware('Technician'),
    technicianController.updateMyLocation
);

module.exports = router;
