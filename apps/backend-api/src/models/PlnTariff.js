const mongoose = require('mongoose');

const plnTariffSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: [
            'R1 - 450 VA (Subsidi)',
            'R1 - 900 VA (Subsidi)',
            'R1M - 900 VA (Non-Subsidi)',
            'R1 - 1300 VA',
            'R1 - 2200 VA',
            'R2 - 3500 s.d 5500 VA',
            'R3 - 6600 VA ke atas'
        ]
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
