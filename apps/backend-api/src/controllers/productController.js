const RegisteredProduct = require('../models/RegisteredProduct');

// 1. Registrasi Produk di Awal (Sebelum masuk kategori)
exports.registerProduct = async (req, res) => {
    try {
        const { productId, productName, category, aspect } = req.body;
        const ownerId = req.user.userId; // Ambil dari token login
        
        // Cek jika ID sudah ada
        const existing = await RegisteredProduct.findOne({ productId });
        if (existing) {
            return res.status(400).json({ message: 'ID Produk sudah terdaftar di sistem.' });
        }

        const newProduct = new RegisteredProduct({ 
            productId, 
            productName, 
            category, 
            aspect: aspect || 'none',
            owner: ownerId // SIMPAN PEMILIK
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
        const ownerId = req.user.userId;
        const products = await RegisteredProduct.find({ 
            owner: ownerId, // FILTER MILIK SENDIRI
            isUsed: false 
        }); 
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil daftar produk', error: error.message });
    }
};

// 2. Validasi ID saat Scan (Digunakan di DeviceScanner)
exports.validateProductId = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.userId;
        const product = await RegisteredProduct.findOne({ productId: id, owner: ownerId });

        if (!product) {
            return res.status(404).json({ isValid: false, message: 'ID Produk tidak ditemukan atau bukan milik Anda.' });
        }

        res.status(200).json({ 
            isValid: true, 
            productName: product.productName 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error validasi', error: error.message });
    }
};

// 3. Hapus Produk Terdaftar (Hanya jika belum digunakan/isUsed: false)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const ownerId = req.user.userId;
        const product = await RegisteredProduct.findOne({ productId: id, owner: ownerId });

        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan atau Anda tidak berwenang.' });
        }

        if (product.isUsed) {
            return res.status(400).json({ message: 'Produk sudah digunakan dan tidak bisa dihapus.' });
        }

        await RegisteredProduct.deleteOne({ productId: id });
        res.status(200).json({ message: 'Produk berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus produk', error: error.message });
    }
};
