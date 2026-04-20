const express = require('express');
const router = express.Router();
const kendaliPerangkatController = require('../controllers/kendaliPerangkatController');

// Route untuk simpan perangkat baru (Direct dari Form UI)
router.post('/', kendaliPerangkatController.createDevice);

// Route untuk mendeteksi perangkat baru (icon di atas)
router.post('/discover', kendaliPerangkatController.discoverDevice);

// Route untuk konfigurasi perangkat (setelah diklik dan diisi form-nya)
router.put('/configure/:id', kendaliPerangkatController.configureDevice);

// Ambil semua perangkat di satu Hub
router.get('/hub/:hubId', kendaliPerangkatController.getDevicesByHub);

// Ambil semua perangkat berdasarkan User
router.get('/user/:userId', kendaliPerangkatController.getDevicesByUser);

// Ambil semua perangkat yang belum dikonfigurasi (discovered)
router.get('/discovered', kendaliPerangkatController.getDiscoveredDevices);

// Hapus perangkat
router.delete('/:id', kendaliPerangkatController.deleteDevice);

module.exports = router;
