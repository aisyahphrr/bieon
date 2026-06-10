const express = require('express');
const router = express.Router();
const kendaliPerangkatController = require('../controllers/kendaliPerangkatController');
const authMiddleware = require('../middlewares/authMiddleware');

// === DEV ONLY: Simulasi telemetri tanpa auth ===
router.post('/:id/simulate-telemetry', kendaliPerangkatController.simulateTelemetry);

// Apply authMiddleware to all routes below
router.use(authMiddleware);

// Route untuk simpan perangkat baru (Direct dari Form UI)
router.post('/', kendaliPerangkatController.createDevice);

// Route untuk mendeteksi perangkat baru (icon di atas)
router.post('/discover', kendaliPerangkatController.discoverDevice);

// Route untuk konfigurasi perangkat (setelah diklik dan diisi form-nya)
router.put('/configure/:id', kendaliPerangkatController.configureDevice);

// Route untuk toggle ON/OFF perangkat
router.put('/:id/toggle', kendaliPerangkatController.toggleDevice);

// Route untuk semat/pin perangkat
router.put('/:id/pin', kendaliPerangkatController.togglePinDevice);

// Route untuk update parameter (Remote/Actuator)
router.put('/:id/params', kendaliPerangkatController.updateDeviceParams);

// Route untuk publish perintah remote menggunakan source IEEE original
router.post('/:id/remote-command', kendaliPerangkatController.sendRemoteCommand);

// Ambil semua perangkat di satu Hub
router.get('/hub/:hubId', kendaliPerangkatController.getDevicesByHub);

// Ambil semua perangkat berdasarkan User (ID diambil dari Token)
router.get('/my-devices', kendaliPerangkatController.getDevicesByUser);

// Ambil semua perangkat yang belum dikonfigurasi (discovered)
router.get('/discovered', kendaliPerangkatController.getDiscoveredDevices);

// Hapus perangkat
router.delete('/:id', kendaliPerangkatController.deleteDevice);

module.exports = router;
