const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteksi semua route produk
router.use(authMiddleware);

router.post('/register', productController.registerProduct);
router.get('/validate/:id', productController.validateProductId);
router.get('/list', productController.getProductsByCategory);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
