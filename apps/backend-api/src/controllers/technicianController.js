const User = require('../models/User');
const Complaint = require('../models/Complaint');
const mongoose = require('mongoose');

/**
 * Mendapatkan Profil Lengkap Teknisi & Kalkulasi Performa Dinamis
 */
exports.getTechnicianProfile = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching profile for technician ID:', id);

        // 1. Validasi ID
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
             console.log('Invalid Technician ID format:', id);
             return res.status(400).json({ success: false, message: 'Format ID Teknisi tidak valid' });
        }

        // 2. Ambil data dasar teknisi
        const technician = await User.findById(id).select('-password');
        if (!technician) {
            console.log('Technician not found for ID:', id);
            return res.status(404).json({ success: false, message: 'Teknisi tidak ditemukan' });
        }

        // 2. Kalkulasi Performa dari Model Complaint
        console.log('Step 2: Fetching finished tickets...');
        const finishedTickets = await Complaint.find({ 
            technician: id, 
            status: 'selesai' 
        });
        console.log(`Found ${finishedTickets.length} finished tickets`);

        // Statistik Utama
        const totalPekerjaan = finishedTickets.length;
        
        // Hitung Rating Rata-rata
        console.log('Step 3: Calculating rating...');
        const ticketsWithRating = finishedTickets.filter(t => t.rating && typeof t.rating.stars === 'number');
        const avgRating = ticketsWithRating.length > 0 
            ? (ticketsWithRating.reduce((sum, t) => sum + t.rating.stars, 0) / ticketsWithRating.length).toFixed(1)
            : 0;

        // Kecepatan Respons & Perbaikan (Skala 5)
        console.log('Step 4: Calculating speeds...');
        const avgResponsePoints = finishedTickets.length > 0
            ? finishedTickets.reduce((sum, t) => sum + (Number(t.responsePoints) || 0), 0) / finishedTickets.length
            : 0;
        const avgRepairPoints = finishedTickets.length > 0
            ? finishedTickets.reduce((sum, t) => sum + (Number(t.repairPoints) || 0), 0) / finishedTickets.length
            : 0;

        const responseSpeedScale = (avgResponsePoints / 20).toFixed(1);
        const repairSpeedScale = (avgRepairPoints / 20).toFixed(1);

        // Tingkat Kepatuhan SLA (%)
        console.log('Step 5: Calculating compliance...');
        const compliantTickets = finishedTickets.filter(t => (Number(t.responsePoints) >= 100 && Number(t.repairPoints) >= 100)).length;
        const complianceRate = totalPekerjaan > 0 
            ? Math.round((compliantTickets / totalPekerjaan) * 100) 
            : 100;

        // Rata-rata Waktu Penyelesaian (Avg. Completion)
        console.log('Step 6: Calculating completion time...');
        const durations = finishedTickets
            .filter(t => t.completedAt && t.createdAt)
            .map(t => new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime());
        
        const avgCompletionMs = durations.length > 0 
            ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
            : 0;
        
        const avgCompletionHours = (avgCompletionMs / (1000 * 60 * 60)).toFixed(1);

        // 3. Riwayat Pekerjaan Terbaru (5 Terakhir)
        console.log('Step 7: Fetching recent work...');
        const recentWork = await Complaint.find({ technician: id, status: 'selesai' })
            .populate('homeowner', 'fullName address') // Restore populate safely
            .sort({ completedAt: -1 })
            .limit(5);
        
        console.log('Step 8: Sending response');

        // Hitung Berdasarkan Kategori
        const totalInstalasi = finishedTickets.filter(t => t.category?.toLowerCase().includes('instalasi')).length;
        const totalRepairs = totalPekerjaan - totalInstalasi;

        res.status(200).json({
            success: true,
            data: {
                profile: technician,
                stats: {
                    totalPekerjaan,
                    totalRepairs,
                    totalInstalasi,
                    avgRating: parseFloat(avgRating),
                    responseSpeed: parseFloat(responseSpeedScale),
                    repairSpeed: parseFloat(repairSpeedScale),
                    complianceRate,
                    avgCompletionHours: parseFloat(avgCompletionHours)
                },
                recentWork
            }
        });
    } catch (error) {
        console.error('Error fetching technician profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error',
            debug: error.message,
            stack: error.stack
        });
    }
};

/**
 * Update Data Profil Teknisi
 */
exports.updateTechnicianProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Proteksi: Jangan biarkan ganti password lewat sini
        delete updateData.password;
        delete updateData.role;
        delete updateData.email;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Teknisi tidak ditemukan' });
        }

        res.status(200).json({
            success: true,
            message: 'Profil berhasil diperbarui',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating technician profile:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui profil' });
    }
};
