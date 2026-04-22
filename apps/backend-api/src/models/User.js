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
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referensi ke Teknisi yang menangani

    // Field Khusus Teknisi
    technicianId: { type: String },
    assignedRegion: { type: String },
    position: { type: String },
    experience: { type: Number, default: 0 },
    specializations: [{ type: String }],
    workArea: { type: String },
    coverageAreas: [{ type: String }],
    workSchedule: { type: Map, of: String },
    status: { type: String, enum: ['aktif', 'nonaktif'], default: 'aktif' }
}, { timestamps: true });

// Unik untuk ID teknisi jika digunakan; sparse agar role lain tidak terdampak
userSchema.index({ technicianId: 1 }, { unique: true, sparse: true });

// Middleware: Enkripsi password otomatis setiap kali disave ke database
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);