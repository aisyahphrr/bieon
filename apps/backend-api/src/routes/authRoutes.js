const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Alamat API untuk registrasi dan login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Ambil profil diri sendiri (Memerlukan Token)
router.get('/me', authMiddleware, authController.getMe);
router.put('/settings', authMiddleware, authController.updateSettings);
router.post('/logout', authMiddleware, authController.logout);
router.post('/firebase-login', authController.firebaseLogin);

module.exports = router;