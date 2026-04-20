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

// DELETE /api/admin/homeowners/:id
router.delete(
    '/homeowners/:id',
    authMiddleware,
    roleMiddleware('SuperAdmin'),
    adminController.deleteHomeowner
);

module.exports = router;
