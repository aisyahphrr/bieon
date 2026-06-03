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
    tokenBalance: { type: Number, default: 0 }, // Akan digunakan sebagai Anggaran Bulanan (Rp)
    tokenThreshold: { type: Number, default: 50000 }, // Ambang batas peringatan anggaran menipis (Rp)
    lastBudgetReset: { type: Date, default: Date.now }, // Tanggal terakhir anggaran di-reset
    bieonId: { type: String },    // ID BIEON Master
    tenantId: { type: String },   // ID Tenant (tenant_001, tenant_002, dst)
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referensi ke Teknisi yang menangani

    // Pelacakan Penggunaan Data (Memory Allocation)
    totalDataUsageBytes: { type: Number, default: 0 }, // Total ukuran semua data dari semua koleksi

    // Field Khusus Teknisi
    technicianId: { type: String },
    nik: { type: String, sparse: true },
    joinDate: { type: Date },
    assignedRegion: { type: String },
    position: { type: String },
    experience: { type: Number, default: 0 },
    specializations: [{ type: String }],
    workArea: { type: String },
    coverageAreas: [{ type: String }],
    workSchedule: { type: Map, of: String },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
        accuracy: { type: Number },
        source: { type: String, enum: ['browser', 'device', 'manual'], default: 'browser' },
        capturedAt: { type: Date },
        label: { type: String }
    },
    certifications: [{
        name: { type: String },
        issuer: { type: String },
        startDate: { type: Date },
        endDate: { type: Date }
    }],
    trainingHistory: [{
        name: { type: String },
        instructor: { type: String },
        endDate: { type: Date }
    }],
    profileImage: { type: String }, // Base64 or URL
    status: { type: String, enum: ['aktif', 'nonaktif', 'warning'], default: 'aktif' }
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
