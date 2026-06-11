const fs = require('fs');
const path = require('path');

const IR_DB_DIR = path.join(__dirname, '../constants/ir-database');

// Helper to list all JSON files in the ir-database directory
const getIrDbFiles = () => {
    try {
        if (!fs.existsSync(IR_DB_DIR)) {
            return [];
        }
        return fs.readdirSync(IR_DB_DIR).filter(file => file.endsWith('.json'));
    } catch (err) {
        console.error('Error reading IR database directory:', err);
        return [];
    }
};

// 1. Get unique list of categories (e.g. ["TV", "AC"])
exports.getCategories = (req, res) => {
    try {
        const files = getIrDbFiles();
        const categories = new Set();
        
        files.forEach(file => {
            const parts = file.replace('.json', '').split('_');
            if (parts.length >= 1) {
                categories.add(parts[0].toUpperCase());
            }
        });
        
        res.status(200).json(Array.from(categories));
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil kategori IR', error: error.message });
    }
};

// 2. Get brands for a specific category (e.g. category=TV -> ["LG", "Samsung"])
exports.getBrands = (req, res) => {
    try {
        const { category } = req.query;
        if (!category) {
            return res.status(400).json({ message: 'Parameter category wajib dikirim' });
        }
        
        const targetCategory = category.toLowerCase();
        const files = getIrDbFiles();
        const brands = [];
        
        files.forEach(file => {
            const parts = file.replace('.json', '').split('_');
            if (parts.length >= 2 && parts[0].toLowerCase() === targetCategory) {
                // Capitalize the brand nicely
                const brand = parts.slice(1).join('_');
                brands.push(brand.charAt(0).toUpperCase() + brand.slice(1));
            }
        });
        
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil merk IR', error: error.message });
    }
};

// 3. Get keymap / full configuration for a specific category and brand
exports.getKeys = (req, res) => {
    try {
        const { category, brand } = req.query;
        if (!category || !brand) {
            return res.status(400).json({ message: 'Parameter category dan brand wajib dikirim' });
        }
        
        const fileName = `${category.toLowerCase()}_${brand.toLowerCase()}.json`;
        const filePath = path.join(IR_DB_DIR, fileName);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Kombinasi kategori dan brand tidak ditemukan' });
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        const config = JSON.parse(data);
        
        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil kode kunci IR', error: error.message });
    }
};
