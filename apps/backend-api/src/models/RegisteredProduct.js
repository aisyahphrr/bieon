const mongoose = require('mongoose');

const registeredProductSchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true }, // ID di stiker produk
    productName: { type: String, required: true }, // Nama di stiker produk
    category: { type: String, enum: ['sensor', 'control'], required: true }, // Jenis: Sensor atau Control
    aspect: { type: String, enum: ['kenyamanan', 'air', 'keamanan', 'none', 'smart-switch', 'smart-plug', 'remote'], default: 'none' }, // Aspek Sensor/Control
    isUsed: { type: Boolean, default: false },
    registeredAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('RegisteredProduct', registeredProductSchema);
