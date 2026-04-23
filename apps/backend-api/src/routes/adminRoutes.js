const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const adminController = require('../controllers/adminController');

// Semua route di sini membutuhkan:
// 1. authMiddleware  -> Memastikan user sudah login (JWT valid)
// 2. roleMiddleware  -> Memastikan user adalah SuperAdmin

// GET /api/admin/homeowners
router.get(
    '/homeowners',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.getAllHomeowners
);

// GET /api/admin/homeowners/available
router.get(
    '/homeowners/available',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.getAvailableHomeowners
);

// GET /api/admin/homeowners/:id
router.get(
    '/homeowners/:id',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.getHomeownerById
);

// POST /api/admin/homeowners
router.post(
    '/homeowners',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.createHomeowner
);

// PUT /api/admin/homeowners/:id
router.put(
    '/homeowners/:id',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.updateHomeowner
);

// GET /api/admin/homeowners/:id/stats
router.get(
    '/homeowners/:id/stats',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.getHomeownerStats
);

// DELETE /api/admin/homeowners/:id
router.delete(
    '/homeowners/:id',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.deleteHomeowner
);

// GET /api/admin/dashboard/metrics
router.get(
    '/dashboard/metrics',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.getDashboardMetrics
);

// POST /api/admin/technicians
router.post(
    '/technicians',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.createTechnician
);

// GET /api/admin/technicians
router.get(
    '/technicians',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.getAllTechnicians
);

// GET /api/admin/technicians/:id
router.get(
    '/technicians/:id',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.getTechnicianById
);

// PUT /api/admin/technicians/:id
router.put(
    '/technicians/:id',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.updateTechnician
);

// POST /api/admin/technicians/:id/assign-clients
router.post(
    '/technicians/:id/assign-clients',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.assignClientsToTechnician
);

// DELETE /api/admin/technicians/:id
router.delete(
    '/technicians/:id',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.deleteTechnician
);

// GET /api/admin/all-bieon-systems
router.get(
    '/all-bieon-systems',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.getAllBieonSystems
);

// GET /api/admin/bieon-systems/:homeownerId
router.get(
    '/bieon-systems/:homeownerId',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.getBieonSystemsByOwner
);

module.exports = router;
