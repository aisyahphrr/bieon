const express = require('express');
const router = express.Router();
const irDatabaseController = require('../controllers/irDatabaseController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteksi seluruh route dengan authMiddleware
router.use(authMiddleware);

router.get('/categories', irDatabaseController.getCategories);
router.get('/brands', irDatabaseController.getBrands);
router.get('/keys', irDatabaseController.getKeys);

module.exports = router;
