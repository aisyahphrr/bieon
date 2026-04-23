const Complaint = require('../models/Complaint');
const User = require('../models/User');

// [Homeowner] CREATE COMPLAINT
exports.createComplaint = async (req, res) => {
    try {
        const { topic, category, device, desc, files } = req.body;
        const userId = req.user.userId;

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
        }
        // 4. Status Lainnya (Ditolak, Cancelled, dll)
        else {
            complaint.timeline.unshift({
                time: nowStr,
                desc: note || `Status diperbarui menjadi ${status}.`,
                status: status
            });
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
    
    // 1. Check Overdue Respons (assignedAt > 30 mins ago)
    const overdueResponsTime = new Date(now.getTime() - (30 * 60 * 1000));
    await Complaint.updateMany(
        { 
            status: 'menunggu respons', 
            assignedAt: { $lt: overdueResponsTime }
        },
        { 
            $set: { status: 'overdue respons' },
            $push: { 
                timeline: {
                    $each: [{
                        time: now.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'),
                        desc: 'Batas waktu respon terlampaui (30 menit). Status otomatis berubah menjadi Overdue Respons.',
                        status: 'overdue respons',
                        visibility: 'internal'
                    }],
                    $position: 0
                }
            }
        }
    );

    // 2. Check Overdue Perbaikan (processStartedAt > 56 hours ago)
    const overdueRepairTime = new Date(now.getTime() - (56 * 60 * 60 * 1000));
    await Complaint.updateMany(
        { 
            status: 'diproses', 
            processStartedAt: { $lt: overdueRepairTime }
        },
        { 
            $set: { status: 'overdue perbaikan' },
            $push: { 
                timeline: {
                    $each: [{
                        time: now.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'),
                        desc: 'Batas waktu perbaikan terlampaui (56 jam). Status otomatis berubah menjadi Overdue Perbaikan.',
                        status: 'overdue perbaikan',
                        visibility: 'internal'
                    }],
                    $position: 0
                }
            }
        }
    );

    // 3. Migration for legacy 'Baru' status to 'unassigned'
    await Complaint.updateMany({ status: 'Baru' }, { $set: { status: 'unassigned' } });

    // 4. Migration for legacy 'requested' logRequestStatus to 'pending'
    await Complaint.updateMany({ logRequestStatus: 'requested' }, { $set: { logRequestStatus: 'pending' } });
}
