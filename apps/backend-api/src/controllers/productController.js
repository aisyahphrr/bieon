const RegisteredProduct = require('../models/RegisteredProduct');

// 1. Registrasi Produk di Awal (Sebelum masuk kategori)
exports.registerProduct = async (req, res) => {
    try {
        const { productId, productName, category, aspect } = req.body;
        
        // Cek jika ID sudah ada
        const existing = await RegisteredProduct.findOne({ productId });
        if (existing) {
            return res.status(400).json({ message: 'ID Produk sudah terdaftar di sistem.' });
        }

        const newProduct = new RegisteredProduct({ 
            productId, 
            productName, 
            category, 
            aspect: aspect || 'none' 
        });
        await newProduct.save();

        res.status(201).json({ 
            message: 'Registrasi Produk Berhasil!', 
            product: newProduct 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal registrasi produk', error: error.message });
    }
};

exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await RegisteredProduct.find({ isUsed: false }); // Hanya yang belum dipasangkan
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil daftar produk', error: error.message });
    }
};

// 2. Validasi ID saat Scan (Digunakan di DeviceScanner)
exports.validateProductId = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await RegisteredProduct.findOne({ productId: id });

        if (!product) {
            return res.status(404).json({ isValid: false, message: 'ID Produk tidak ditemukan / tidak valid.' });
        }

        res.status(200).json({ 
            isValid: true, 
            productName: product.productName 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error validasi', error: error.message });
    }
};
