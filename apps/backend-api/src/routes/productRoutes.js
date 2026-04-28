const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/register', productController.registerProduct);
router.get('/validate/:id', productController.validateProductId);
router.get('/list', productController.getProductsByCategory);

module.exports = router;
