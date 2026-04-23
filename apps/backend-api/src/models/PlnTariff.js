const mongoose = require('mongoose');
const { isValidPlnTariffCategoryLabel } = require('../constants/plnTariffCategories');

const plnTariffSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        validate: {
            validator: (value) => isValidPlnTariffCategoryLabel(value),
            message: (props) => `Kategori PLN tidak valid: ${props.value}`
        }
    },
    tariff: { type: Number, required: true },           // Rp per kWh
    effectiveDate: { type: Date, required: true },       // Tanggal mulai berlaku
    note: { type: String, default: '' },                 // Keterangan/dasar hukum
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // SuperAdmin
    percentage: { type: Number, default: 0 }             // % perubahan dari tarif sebelumnya
}, { timestamps: true });

// Index untuk query tarif terbaru per golongan secara efisien
plnTariffSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('PlnTariff', plnTariffSchema);
