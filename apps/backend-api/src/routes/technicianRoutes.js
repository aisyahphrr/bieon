const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');

// Route untuk Profil (Bisa diakses oleh SA atau Teknisi ybs)
router.get('/profile/:id', technicianController.getTechnicianProfile);

// Route untuk Update Profil
router.put('/profile/:id', technicianController.updateTechnicianProfile);

module.exports = router;
