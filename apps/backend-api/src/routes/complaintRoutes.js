const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// [Homeowner] Membuat aduan
router.post('/', authMiddleware, roleMiddleware('Homeowner'), complaintController.createComplaint);

// [Homeowner/Superadmin] Mengambil aduan owner spesifik
router.get('/owner/:userId', authMiddleware, complaintController.getComplaintsByOwner);

// [SuperAdmin] Melihat semua aduan
router.get('/', authMiddleware, roleMiddleware('SuperAdmin'), complaintController.getAllComplaints);

// [SuperAdmin] Meng-assign teknisi ke sebuah tiket
router.put('/:id/assign', authMiddleware, roleMiddleware('SuperAdmin'), complaintController.assignTechnician);

// [Technician] Melihat aduan yang di-assign padanya
router.get('/technician', authMiddleware, roleMiddleware('Technician'), complaintController.getComplaintsByTechnician);

// [Technician] Mengupdate status ('Diproses' / 'Menunggu Konfirmasi')
router.put('/:id/status', authMiddleware, roleMiddleware('Technician', 'SuperAdmin'), complaintController.updateComplaintStatus);

module.exports = router;
