const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Field Umum
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Homeowner', 'Technician', 'SuperAdmin'], required: true, default: 'Homeowner' },
    fullName: { type: String, required: true },
    username: { type: String }, // Tambahan dari form registrasi
    dateOfBirth: { type: String }, // Tambahan dari form registrasi

    // Field Khusus Homeowner
    phoneNumber: { type: String },
    address: { type: String },
    systemName: { type: String }, // Nama Sistem / Rumah
    plnTariff: { type: String },  // Golongan Tarif PLN
    bieonId: { type: String },    // ID BIEON Master

    // Field Khusus Teknisi
    technicianId: { type: String },
    assignedRegion: { type: String }
}, { timestamps: true });

// Middleware: Enkripsi password otomatis setiap kali disave ke database
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);