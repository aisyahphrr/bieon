const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Alert = require('../models/Alert');

// [Homeowner] CREATE COMPLAINT
exports.createComplaint = async (req, res) => {
    try {
        const { topic, category, device, desc, files } = req.body;
        const userId = req.user.userId;

        // Get user info for notification details
        const sender = await User.findById(userId);

        const now = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

        const newComplaint = new Complaint({
            topic,
            category,
            device,
            desc,
            status: 'unassigned',
            homeowner: userId,
            files: files || [],
            timeline: [{
                time: now,
                desc: 'Laporan pengaduan berhasil dibuat. Menunggu penugasan teknisi.',
                status: 'Baru'
            }]
        });

        await newComplaint.save();

        // --- NOTIFIKASI OTOMATIS ---
        
        // 1. Notif untuk Homeowner (Konfirmasi)
        await Alert.create({
            owner: userId,
            category: 'Sistem',
            title: 'Pengaduan Terkirim',
            message: `Tiket pengaduan "${topic}" Anda berhasil dibuat. Mohon tunggu respon admin.`,
            type: 'Info',
            link: 'pengaduan'
        });

        // 2. Notif untuk Semua Admin (Cari yang mengandung kata 'admin' secara case-insensitive)
        const admins = await User.find({ role: { $regex: /admin/i } });
        const adminAlerts = admins.map(admin => ({
            owner: admin._id,
            category: 'Sistem',
            title: 'Tiket Pengaduan Baru',
            message: `Ada pengaduan baru dari ${sender?.fullName || 'User'} (${sender?.bieonId || 'BIEON ID'}). Topik: ${topic}`,
            type: 'Warning',
            link: 'admin-complaint'
        }));
        
        if (adminAlerts.length > 0) {
            await Alert.insertMany(adminAlerts);
        }

        res.status(201).json({ message: 'Tiket pengaduan berhasil dibuat!', complaint: newComplaint });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat pengaduan', error: error.message });
    }
};

// [Homeowner] GET COMPLAINTS BY OWNER
exports.getComplaintsByOwner = async (req, res) => {
    try {
        await checkAndUpdateSLAStatuses(); // Pastikan status SLA terbaru (overdue, dll) sebelum fetch
        const complaints = await Complaint.find({ homeowner: req.params.userId })
            .populate('homeowner', 'fullName email phoneNumber address bieonId')
            .populate('technician', 'fullName phoneNumber')
            .sort({ createdAt: -1 });

        // Filter timeline for homeowners
        const formattedComplaints = complaints.map(c => {
            const complaintObj = c.toObject();
            if (req.user.role?.toLowerCase() === 'homeowner') {
                complaintObj.timeline = complaintObj.timeline.filter(item => item.visibility !== 'internal');
            }
            return complaintObj;
        });

        res.status(200).json(formattedComplaints);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pengaduan', error: error.message });
    }
};

// [SuperAdmin] GET ALL COMPLAINTS
exports.getAllComplaints = async (req, res) => {
    try {
        await checkAndUpdateSLAStatuses(); // Auto-update overdue statuses before fetch
        const complaints = await Complaint.find()
            .populate('homeowner', 'fullName email phoneNumber address bieonId')
            .populate('technician', 'fullName phoneNumber')
            .sort({ createdAt: -1 });
        // Filter timeline for homeowners
        const formattedComplaints = complaints.map(c => {
            const complaintObj = c.toObject();
            if (req.user.role?.toLowerCase() === 'homeowner') {
                complaintObj.timeline = complaintObj.timeline.filter(item => item.visibility !== 'internal');
            }
            return complaintObj;
        });

        res.status(200).json(formattedComplaints);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil semua data pengaduan', error: error.message });
    }
};

// [Public/Authenticated] GET COMPLAINT BY ID
exports.getComplaintById = async (req, res) => {
    try {
        await checkAndUpdateSLAStatuses();
        const complaint = await Complaint.findById(req.params.id)
            .populate('homeowner', 'fullName email phoneNumber address bieonId')
            .populate('technician', 'fullName phoneNumber');
        
        if (!complaint) return res.status(404).json({ message: 'Tiket tidak ditemukan' });

        // Filter timeline based on role
        const complaintObj = complaint.toObject();
        if (req.user.role?.toLowerCase() === 'homeowner') {
            complaintObj.timeline = complaintObj.timeline.filter(item => item.visibility !== 'internal');
        }

        res.status(200).json(complaintObj);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data pengaduan', error: error.message });
    }
};

// [Technician] GET COMPLAINTS BY TECHNICIAN
exports.getComplaintsByTechnician = async (req, res) => {
    try {
        try {
            await checkAndUpdateSLAStatuses();
        } catch (slaError) {
            console.error("SLA Auto-update failed:", slaError);
        }
        const techId = req.user.userId;
        const complaints = await Complaint.find({ technician: techId })
            .populate('homeowner', 'fullName email phoneNumber address bieonId')
            .populate('technician', 'fullName phoneNumber')
            .sort({ createdAt: -1 });
        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pengaduan teknisi', error: error.message });
    }
};

// [Technician] UPDATE COMPLAINT STATUS
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note, rating } = req.body;

        const complaint = await Complaint.findById(id);
        if (!complaint) return res.status(404).json({ message: 'Tiket tidak ditemukan' });

        const nowTime = new Date();
        const nowStr = nowTime.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
        
        // --- LOGIKA SLA BARU ---
        
        // 1. Teknisi Klik "Proses" -> Selesaikan SLA Respons, Mulai SLA Perbaikan
        if (status === 'diproses' && complaint.assignedAt) {
            const assignedAt = new Date(complaint.assignedAt);
            const diffMinutes = Math.floor((nowTime - assignedAt) / (1000 * 60));
            const diffSeconds = Math.floor((nowTime - assignedAt) / 1000) % 60;
            const hours = Math.floor(diffMinutes / 60);
            const mins = diffMinutes % 60;
            const durationStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')}`;

            let resPts = 0;
            if (diffMinutes <= 5) resPts = 100;
            else if (diffMinutes <= 10) resPts = 95;
            else if (diffMinutes <= 15) resPts = 90;
            else if (diffMinutes <= 20) resPts = 85;
            else if (diffMinutes <= 25) resPts = 80;
            else if (diffMinutes <= 30) resPts = 70;
            else resPts = 0;

            complaint.responsePoints = resPts;
            complaint.responseDuration = durationStr;
            complaint.processStartedAt = nowTime;
            
            complaint.timeline.unshift({
                time: nowStr,
                desc: `Teknisi mulai memproses pengaduan.`,
                status: 'diproses'
            });

            // Notif untuk Admin (Teknisi mulai kerja)
            const tech = await User.findById(complaint.technician);
            const admins = await User.find({ role: { $regex: /admin/i } });
            const adminAlerts = admins.map(admin => ({
                owner: admin._id,
                category: 'Sistem',
                title: 'Teknisi Mulai Memproses',
                message: `Teknisi ${tech?.fullName || 'Teknisi'} telah mulai mengerjakan tiket "${complaint.topic}".`,
                type: 'Info',
                link: 'admin-complaint'
            }));
            if (adminAlerts.length > 0) await Alert.insertMany(adminAlerts);
        }
        // 2. Teknisi Klik "Selesai" (Update Status ke Menunggu Konfirmasi Pelanggan) -> Selesaikan SLA Perbaikan
        else if (status === 'menunggu konfirmasi pelanggan' && complaint.processStartedAt) {
            const processStartedAt = new Date(complaint.processStartedAt);
            const diffHours = Math.floor((nowTime - processStartedAt) / (1000 * 60 * 60));
            const diffMinutesTotal = Math.floor((nowTime - processStartedAt) / (1000 * 60));
            const h = Math.floor(diffMinutesTotal / 60);
            const m = diffMinutesTotal % 60;
            const s = Math.floor((nowTime - processStartedAt) / 1000) % 60;
            const durationStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            
            let repPts = 0;
            if (diffHours <= 24) repPts = 100;
            else if (diffHours <= 46) repPts = 95;
            else if (diffHours <= 48) repPts = 90;
            else if (diffHours <= 50) repPts = 85;
            else if (diffHours <= 52) repPts = 80;
            else if (diffHours <= 54) repPts = 70;
            else if (diffHours <= 56) repPts = 60;
            else repPts = 0;
            
            complaint.repairPoints = repPts;
            complaint.repairDuration = durationStr;
            complaint.timeline.unshift({
                time: nowStr,
                desc: `Teknisi menyatakan perbaikan selesai.`,
                status: 'menunggu konfirmasi pelanggan'
            });

            // Notif untuk Homeowner (Konfirmasi Selesai)
            await Alert.create({
                owner: complaint.homeowner,
                category: 'Sistem',
                title: 'Perbaikan Selesai',
                message: `Teknisi telah menyelesaikan perbaikan tiket "${complaint.topic}". Silakan konfirmasi dan beri penilaian.`,
                type: 'Success',
                link: 'pengaduan'
            });
        }
        // 3. Homeowner Konfirmasi Selesai & Beri Rating
        else if (status === 'selesai') {
            if (rating) {
                complaint.rating = {
                    stars: rating.stars,
                    review: rating.review
                };
            }
            complaint.timeline.unshift({
                time: nowStr,
                desc: `Homeowner telah mengonfirmasi tiket selesai${rating ? ` (Rating: ${rating.stars}★)` : ''}.`,
                status: 'selesai'
            });
            complaint.completedAt = nowTime;

            // Notif untuk Teknisi (Pekerjaan Selesai & Rating)
            if (complaint.technician) {
                await Alert.create({
                    owner: complaint.technician,
                    category: 'Sistem',
                    title: 'Pekerjaan Selesai',
                    message: `Tiket "${complaint.topic}" telah selesai. Anda mendapat rating ${rating?.stars || 0}★.`,
                    type: 'Success',
                    link: 'pengaduan'
                });
            }

            // Notif untuk Admin (Tiket Selesai & Feedback)
            const admins = await User.find({ role: { $regex: /admin/i } });
            const adminAlerts = admins.map(admin => ({
                owner: admin._id,
                category: 'Sistem',
                title: 'Tiket Selesai (Feedback)',
                message: `Tiket "${complaint.topic}" selesai. Rating: ${rating?.stars || 0}★. Ulasan: ${rating?.review || '-'}`,
                type: 'Info',
                link: 'admin-complaint'
            }));
            if (adminAlerts.length > 0) await Alert.insertMany(adminAlerts);
        }
        // 4. Status Lainnya (Ditolak, Cancelled, dll)
        else {
            complaint.timeline.unshift({
                time: nowStr,
                desc: note || `Status diperbarui menjadi ${status}.`,
                status: status
            });

            // Notif KHUSUS jika DITOLAK
            if (status === 'ditolak') {
                await Alert.create({
                    owner: complaint.homeowner,
                    category: 'Sistem',
                    title: 'Pengaduan Ditolak',
                    message: `Maaf, pengaduan "${complaint.topic}" Anda ditolak. Alasan: ${note || 'Tidak disebutkan.'}`,
                    type: 'Danger',
                    link: 'pengaduan'
                });
            }

            // Notif KHUSUS jika DIBATALKAN (oleh Homeowner)
            if (status === 'batal' || status === 'cancelled') {
                // Notif ke Admin
                const admins = await User.find({ role: { $regex: /admin/i } });
                const adminAlerts = admins.map(admin => ({
                    owner: admin._id,
                    category: 'Sistem',
                    title: 'Tiket Dibatalkan',
                    message: `Tiket "${complaint.topic}" telah dibatalkan oleh pelanggan.`,
                    type: 'Info',
                    link: 'admin-complaint'
                }));
                if (adminAlerts.length > 0) await Alert.insertMany(adminAlerts);

                // Notif ke Teknisi (jika sudah ada yang ditugaskan)
                if (complaint.technician) {
                    await Alert.create({
                        owner: complaint.technician,
                        category: 'Sistem',
                        title: 'Tiket Dibatalkan',
                        message: `Tiket "${complaint.topic}" yang Anda tangani telah dibatalkan oleh pelanggan.`,
                        type: 'Warning',
                        link: 'pengaduan'
                    });
                }
            }
        }

        complaint.status = status || complaint.status;
        await complaint.save();
        res.status(200).json({ message: `Status tiket berhasil diupdate menjadi ${status}`, complaint });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate status tiket', error: error.message });
    }
};

// [Technician] UPDATE PROGRESS (Without changing status)
exports.updateProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { desc, note } = req.body;

        const complaint = await Complaint.findById(id);
        if (!complaint) return res.status(404).json({ message: 'Tiket tidak ditemukan' });

        const nowStr = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

        // Set flag if it's repair progress
        if (desc.toLowerCase().includes('proses perbaikan')) {
            complaint.hasStartedRepair = true;
        }

        complaint.timeline.unshift({
            time: nowStr,
            desc: note ? `${desc}: ${note}` : desc,
            status: complaint.status // Keep current status
        });

        await complaint.save();

        // Notif untuk Homeowner (Update Progres)
        await Alert.create({
            owner: complaint.homeowner,
            category: 'Sistem',
            title: 'Update Perbaikan',
            message: `Teknisi memperbarui progres: "${desc}".`,
            type: 'Info',
            link: 'pengaduan'
        });

        res.status(200).json({ message: 'Progres berhasil diperbarui', complaint });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui progres', error: error.message });
    }
};

// [Technician] REQUEST DATA LOG
exports.requestDataLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const complaint = await Complaint.findById(id);
        if (!complaint) return res.status(404).json({ message: 'Tiket tidak ditemukan' });

        complaint.logRequestStatus = 'pending';
        complaint.logReason = reason || '';
        
        const nowStr = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
        complaint.timeline.unshift({
            time: nowStr,
            desc: `Teknisi meminta akses data log perangkat.${reason ? ` Alasan: ${reason}` : ''}`,
            status: complaint.status
        });

        await complaint.save();

        // Notif untuk Semua Admin (Minta Akses Log)
        const admins = await User.find({ role: { $regex: /admin/i } });
        const adminAlerts = admins.map(admin => ({
            owner: admin._id,
            category: 'Sistem',
            title: 'Permintaan Data Log',
            message: `Teknisi meminta akses log untuk tiket ${complaint.topic}. Alasan: ${reason || '-'}`,
            type: 'Warning',
            link: 'admin-complaint'
        }));
        if (adminAlerts.length > 0) await Alert.insertMany(adminAlerts);

        res.status(200).json({ message: 'Permintaan data log dikirim', complaint });
    } catch (error) {
        res.status(500).json({ message: 'Gagal meminta data log', error: error.message });
    }
};

// [SuperAdmin] GRANT DATA LOG
exports.grantDataLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // Can accept action to approve/reject
        const complaint = await Complaint.findById(id);
        if (!complaint) return res.status(404).json({ message: 'Tiket tidak ditemukan' });

        // If action is provided (boolean true/false), use it. Otherwise default to granted for backward compatibility
        const isApproved = req.body.isApproved !== undefined ? req.body.isApproved : true;
        complaint.logRequestStatus = isApproved ? 'granted' : 'rejected';
        
        const nowStr = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
        complaint.timeline.unshift({
            time: nowStr,
            desc: isApproved ? 'SuperAdmin memberikan izin akses data log perangkat.' : 'SuperAdmin menolak akses data log perangkat.',
            status: complaint.status
        });

        await complaint.save();

        // Notif untuk Teknisi (Izin Log)
        await Alert.create({
            owner: complaint.technician,
            category: 'Sistem',
            title: isApproved ? 'Akses Log Diberikan' : 'Akses Log Ditolak',
            message: isApproved ? `SuperAdmin menyetujui akses data log untuk tiket ${complaint.topic}.` : `Maaf, akses data log untuk tiket ${complaint.topic} ditolak oleh SuperAdmin.`,
            type: isApproved ? 'Success' : 'Danger',
            link: 'pengaduan'
        });

        res.status(200).json({ message: isApproved ? 'Akses data log diberikan' : 'Akses data log ditolak', complaint });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memproses akses data log', error: error.message });
    }
};

// [SuperAdmin] ASSIGN TECHNICIAN (Supports initial assign and re-assign)
exports.assignTechnician = async (req, res) => {
    try {
        const { id } = req.params;
        const { technicianId } = req.body;

        const complaint = await Complaint.findById(id).populate('technician', 'fullName');
        if (!complaint) return res.status(404).json({ message: 'Tiket tidak ditemukan' });

        const newTech = await User.findById(technicianId);
        if (!newTech) return res.status(404).json({ message: 'Teknisi tidak valid' });

        const nowTime = new Date();
        const nowStr = nowTime.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

        let timelineMsg = '';
        const oldTechName = complaint.technician ? complaint.technician.fullName : null;

        if (oldTechName) {
            // LOGIKA ALIHKAN (RE-ASSIGN)
            timelineMsg = `Tiket dialihkan dari ${oldTechName} ke ${newTech.fullName} karena melewati batas waktu.`;
            complaint.isEscalated = true; // Mark as priority
            complaint.urgencyLevel = 'high'; // SET KE HIGH SAAT DIALIHKAN
        } else {
            // LOGIKA PENUGASAN BARU
            timelineMsg = `Tiket telah ditugaskan ke teknisi: ${newTech.fullName}. Menunggu respon teknisi.`;
            complaint.urgencyLevel = 'low'; // Initial assign is low
        }

        // RESET SLA
        // Update data dasar
        complaint.technician = technicianId;
        complaint.assignedAt = nowTime;
        complaint.processStartedAt = null; // Reset perbaikan jika ada (untuk re-assign)
        complaint.status = 'menunggu respons';
        
        // Push ke timeline
        complaint.timeline.unshift({
            time: nowStr,
            desc: timelineMsg,
            status: 'menunggu respons',
            visibility: oldTechName ? 'internal' : 'public'
        });

        await complaint.save();

        // --- NOTIFIKASI PENUGASAN (DENGAN DE-DUPLIKASI) ---
        const tenSecondsAgo = new Date(Date.now() - 10000);
        
        // 1. Notif untuk Teknisi
        const existingTechAlert = await Alert.findOne({
            owner: technicianId,
            title: 'Tugas Perbaikan Baru',
            createdAt: { $gt: tenSecondsAgo }
        });

        if (!existingTechAlert) {
            await Alert.create({
                owner: technicianId,
                category: 'Sistem',
                title: 'Tugas Perbaikan Baru',
                message: `Anda ditugaskan untuk menangani pengaduan: "${complaint.topic}". Segera cek detail tugas.`,
                type: 'Info',
                link: 'pengaduan'
            });
        }

        // 2. Notif untuk Homeowner
        const existingHomeownerAlert = await Alert.findOne({
            owner: complaint.homeowner,
            title: 'Teknisi Ditugaskan',
            createdAt: { $gt: tenSecondsAgo }
        });

        if (!existingHomeownerAlert) {
            await Alert.create({
                owner: complaint.homeowner,
                category: 'Sistem',
                title: 'Teknisi Ditugaskan',
                message: `Teknisi ${newTech.fullName} telah ditugaskan untuk menangani pengaduan Anda.`,
                type: 'Success',
                link: 'pengaduan'
            });
        }

        // Ambil data terbaru yang sudah di-populate untuk respons
        const updatedComplaint = await Complaint.findById(id)
            .populate('homeowner', 'fullName email phoneNumber address bieonId')
            .populate('technician', 'fullName phoneNumber');

        res.status(200).json({ 
            message: oldTechName ? 'Teknisi berhasil dialihkan' : 'Teknisi berhasil ditugaskan', 
            complaint: updatedComplaint 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengassign teknisi', error: error.message });
    }
};

// [SuperAdmin] PING TECHNICIAN
exports.pingComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint.findById(id);
        if (!complaint) return res.status(404).json({ message: 'Tiket tidak ditemukan' });

        const currentUrgency = complaint.urgencyLevel || 'low';
        const currentPingCount = complaint.pingCount || 0;
        let newUrgency = currentUrgency;

        if (currentUrgency === 'low') {
            newUrgency = 'medium';
        } else if (currentUrgency === 'high') {
            newUrgency = 'critical';
        }

        complaint.urgencyLevel = newUrgency;
        complaint.pingCount = Math.min(currentPingCount + 1, 3); // MAKSIMAL 3 KOTAK PING

        const nowStr = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
        
        complaint.timeline.unshift({
            time: nowStr,
            desc: `SuperAdmin mengirimkan PING (Teguran ke-${complaint.pingCount}). Urgensi ditingkatkan menjadi: ${newUrgency.toUpperCase()}.`,
            status: complaint.status,
            visibility: 'internal'
        });

        await complaint.save();

        // Notif untuk Teknisi (PING!)
        if (complaint.technician) {
            await Alert.create({
                owner: complaint.technician,
                category: 'Sistem',
                title: `TEGURAN PING #${complaint.pingCount}`,
                message: `Admin mengirimkan PING! Segera selesaikan tiket ${complaint.topic}. Status urgensi: ${newUrgency.toUpperCase()}`,
                type: 'Danger',
                link: 'pengaduan'
            });
        }

        res.status(200).json({ 
            message: 'Berhasil mengirimkan PING', 
            urgencyLevel: newUrgency, 
            pingCount: complaint.pingCount,
            complaint 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengirimkan PING', error: error.message });
    }
};

// --- SLA AUTO-CHECK HELPER ---
async function checkAndUpdateSLAStatuses() {
    const now = new Date();
    const nowStr = now.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
    
    // 1. Check Overdue Respons (assignedAt > 30 mins ago)
    const overdueResponsTime = new Date(now.getTime() - (30 * 60 * 1000));
    const pendingRespons = await Complaint.find({ 
        status: 'menunggu respons', 
        assignedAt: { $lt: overdueResponsTime }
    }).populate('homeowner', 'bieonId');

    for (const comp of pendingRespons) {
        // Update Status & Timeline
        comp.status = 'overdue respons';
        comp.timeline.unshift({
            time: nowStr,
            desc: 'Batas waktu respon terlampaui (30 menit). Status otomatis berubah menjadi Overdue Respons.',
            status: 'overdue respons',
            visibility: 'internal'
        });
        await comp.save();

        // Kirim Notif ke Teknisi
        await Alert.create({
            owner: comp.technician,
            category: 'Sistem',
            title: 'SLA Overdue Respons',
            message: `Peringatan: Tiket ${comp.topic} telah melewati batas waktu respon 30 menit!`,
            type: 'Danger',
            link: 'pengaduan'
        });

        // Kirim Notif ke Semua Admin
        const admins = await User.find({ role: { $regex: /admin/i } });
        const adminAlerts = admins.map(admin => ({
            owner: admin._id,
            category: 'Sistem',
            title: 'KRITIS: SLA Overdue',
            message: `Tiket dari ${comp.homeowner?.bieonId || 'User'} Overdue Respons! Segera alihkan teknisi.`,
            type: 'Danger',
            link: 'admin-complaint'
        }));
        if (adminAlerts.length > 0) await Alert.insertMany(adminAlerts);
    }

    // 2. Check Overdue Perbaikan (processStartedAt > 56 hours ago)
    const overdueRepairTime = new Date(now.getTime() - (56 * 60 * 60 * 1000));
    const pendingRepair = await Complaint.find({ 
        status: 'diproses', 
        processStartedAt: { $lt: overdueRepairTime }
    }).populate('homeowner', 'bieonId');

    for (const comp of pendingRepair) {
        comp.status = 'overdue perbaikan';
        comp.timeline.unshift({
            time: nowStr,
            desc: 'Batas waktu perbaikan terlampaui (56 jam). Status otomatis berubah menjadi Overdue Perbaikan.',
            status: 'overdue perbaikan',
            visibility: 'internal'
        });
        await comp.save();

        // Notif Teknisi
        await Alert.create({
            owner: comp.technician,
            category: 'Sistem',
            title: 'SLA Overdue Perbaikan',
            message: `Peringatan: Perbaikan tiket ${comp.topic} telah melewati batas 56 jam!`,
            type: 'Danger',
            link: 'pengaduan'
        });

        // Notif Admin
        const admins = await User.find({ role: { $regex: /admin/i } });
        const adminAlerts = admins.map(admin => ({
            owner: admin._id,
            category: 'Sistem',
            title: 'SLA Overdue Perbaikan',
            message: `Tiket ${comp.homeowner?.bieonId || 'User'} telah melewati batas waktu perbaikan.`,
            type: 'Warning',
            link: 'admin-complaint'
        }));
        if (adminAlerts.length > 0) await Alert.insertMany(adminAlerts);
    }

    // 3. Migration for legacy 'Baru' status to 'unassigned'
    await Complaint.updateMany({ status: 'Baru' }, { $set: { status: 'unassigned' } });

    // 4. Migration for legacy 'requested' logRequestStatus to 'pending'
    await Complaint.updateMany({ logRequestStatus: 'requested' }, { $set: { logRequestStatus: 'pending' } });
}
