import React from 'react';
import {
    ArrowLeft,
    User,
    Cpu,
    Clock,
    Star,
    CheckCircle2,
    Bell,
    FileText,
    Mail,
    Phone,
    MapPin,
    AlertCircle,
    MessageSquare,
    X,
    RefreshCw,
    ShieldCheck,
    Activity,
    Users,
    XCircle,
    Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { formatStatusDisplay, getPerformanceIndicator } from '../../utils/complaintHelpers';
import { useSLA } from '../../hooks/useSLA';
import { useTranslation } from 'react-i18next';

/**
 * Standard BIEON Component for Complaint Details
 * Shared between Homeowner, Technician, and Superadmin roles.
 */
export function ComplaintDetailModal({
    isOpen,
    onClose,
    ticket,
    renderActions,
    role,
    isHistoryView = false,
    title = "Detail Pengaduan",
    onActionSuccess
}) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [localTicket, setLocalTicket] = React.useState(null);
    const [isProgressModalOpen, setIsProgressModalOpen] = React.useState(false);
    const [isRatingModalOpen, setIsRatingModalOpen] = React.useState(false);
    const [ratingStars, setRatingStars] = React.useState(0);
    const [hoverStars, setHoverStars] = React.useState(0);
    const [ratingReview, setRatingReview] = React.useState('');
    const [progressOption, setProgressOption] = React.useState('');
    const [progressNote, setProgressNote] = React.useState('');
    const [showProgressDropdown, setShowProgressDropdown] = React.useState(false);
    const [isLogReasonModalOpen, setIsLogReasonModalOpen] = React.useState(false);
    const [logReason, setLogReason] = React.useState('');

    // --- DATE & TIME HELPERS ---
    const parseDate = (str) => {
        if (!str) return null;
        // Handle ISO String format
        if (typeof str === 'string' && (str.includes('T') || str.match(/^\d{4}-/))) {
            return new Date(str);
        }
        if (str instanceof Date) return str;
        
        // Format Indo Legacy: "22 Apr 2026, 17:00:00"
        const parts = String(str).match(/(\d+)\s+(\w+)\s+(\d+),\s+(\d+):(\d+):(\d+)/);
        if (!parts) return null;
        const monthMap = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5, 'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11 };
        return new Date(parts[3], monthMap[parts[2]], parts[1], parts[4], parts[5], parts[6]);
    };

    const formatDisplayTime = (str) => {
        if (!str) return '-';
        // If it's already a well-formatted string with seconds, return it
        if (typeof str === 'string' && str.match(/\d+:\d+:\d+/) && str.includes(',')) return str;
        
        const date = new Date(str);
        if (isNaN(date.getTime())) return str; // Fallback to original string

        return date.toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(/\./g, ':');
    };

    const formatDiff = (ms) => {
        if (ms < 0) ms = 0;
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // Determine export button visibility dynamically based on page context and role
    const activeRole = role || localStorage.getItem('role') || 'admin';
    const shouldShowPdfExport = React.useMemo(() => {
        if (!localTicket) return false;
        const status = localTicket.status?.toLowerCase();
        const isFinishedOrRejected = ['selesai', 'ditolak'].includes(status);
        
        if (activeRole === 'technician') {
            return isFinishedOrRejected && (isHistoryView || !!renderActions);
        } else if (['superadmin', 'admin'].includes(activeRole.toLowerCase())) {
            return isFinishedOrRejected;
        } else if (activeRole === 'homeowner') {
            return status === 'selesai';
        }
        return false;
    }, [activeRole, isHistoryView, renderActions, localTicket]);

    // Sync local state when ticket prop changes
    React.useEffect(() => {
        if (ticket) {
            setLocalTicket(ticket);
        }
    }, [ticket]);

    if (!isOpen || !localTicket) return null;

    const token = localStorage.getItem('token');

    // API Handlers
    const fetchComplaintDetail = async () => {
        try {
            setIsRefreshing(true);
            const response = await fetch(`/api/complaints/${localTicket._id || localTicket.originalId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Gagal mengambil data terbaru');
            const data = await response.json();
            
            // Map display ID if needed (consistent with frontend logic)
            const updatedData = {
                ...data,
                id: data.id || `TCK-${data._id ? data._id.substring(data._id.length - 6).toUpperCase() : '000000'}`,
                date: data.createdAt ? new Date(data.createdAt).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'
            };
            
            setLocalTicket(updatedData);
        } catch (error) {
            console.error('Error refreshing ticket:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleStatusUpdate = async (newStatus, note = '', rating = null) => {
        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/complaints/${localTicket._id || localTicket.originalId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus, note, rating })
            });
            if (!response.ok) throw new Error('Gagal memperbarui status');
            
            // Refresh data first to update timeline before closing/notifying
            await fetchComplaintDetail();
            
            setIsRatingModalOpen(false); // Close rating modal if open
            if (onActionSuccess) onActionSuccess();
            
            // For 'selesai', we might close the modal, for others we stay
            if (newStatus === 'selesai' || newStatus === 'ditolak') {
                onClose();
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateProgress = async () => {
        if (!progressOption) return;
        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/complaints/${localTicket._id || localTicket.originalId}/progress`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    desc: t(`complaint.action.technician.${progressOption}`), 
                    note: progressNote 
                })
            });
            if (!response.ok) throw new Error('Gagal memperbarui progres');
            
            // Refresh data to show new timeline entry immediately
            await fetchComplaintDetail();
            
            setIsProgressModalOpen(false);
            setProgressNote(''); // Clear note
            if (onActionSuccess) onActionSuccess();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogAction = async (action, reason = '') => {
        try {
            setIsSubmitting(true);
            const endpoint = action === 'request' ? 'request-log' : 'grant-log';
            const response = await fetch(`/api/complaints/${localTicket._id || localTicket.originalId}/${endpoint}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ reason })
            });
            if (!response.ok) throw new Error('Gagal memproses data log');
            
            // Refresh data
            await fetchComplaintDetail();
            
            setIsLogReasonModalOpen(false);
            setLogReason('');
            if (onActionSuccess) onActionSuccess();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPerformanceIndicator = (points) => {
        if (points >= 95) return { label: t('complaint.perf.good', 'Bagus'), bg: 'bg-emerald-50', color: 'text-emerald-600' };
        if (points >= 75) return { label: t('complaint.perf.standard', 'Standar'), bg: 'bg-amber-50', color: 'text-amber-600' };
        return { label: t('complaint.perf.danger', 'Bahaya'), bg: 'bg-red-50', color: 'text-red-600' };
    };

    // --- FALLBACK DURATION CALCULATION ---
    const getDurationFromTimeline = (type) => {
        if (!localTicket?.timeline || localTicket.timeline.length === 0) return '00:00:00';



        if (type === 'response') {
            if (localTicket.responseDuration && localTicket.responseDuration !== '00:00:00') return localTicket.responseDuration;
            const processEntry = [...localTicket.timeline].reverse().find(t => t.status?.toLowerCase() === 'diproses');
            if (!processEntry || !localTicket.assignedAt) return '00:00:00';
            const start = new Date(localTicket.assignedAt);
            const end = parseDate(processEntry.time);
            return end ? formatDiff(end - start) : '00:00:00';
        }

        if (type === 'repair') {
            if (localTicket.repairDuration && localTicket.repairDuration !== '00:00:00') return localTicket.repairDuration;
            const entries = [...localTicket.timeline].reverse();
            const startEntry = entries.find(t => t.status?.toLowerCase() === 'diproses');
            const endEntry = entries.find(t => ['menunggu konfirmasi pelanggan', 'selesai'].includes(t.status?.toLowerCase()));
            if (!startEntry || !endEntry) return '00:00:00';
            const start = parseDate(startEntry.time);
            const end = parseDate(endEntry.time);
            return (start && end) ? formatDiff(end - start) : '00:00:00';
        }

        return '00:00:00';
    };

    // Helper Parser: Map string database log progres ke i18n
    const getLocalizedTimelineDesc = (desc) => {
        if (!desc) return '';
        
        // Clean up potentially messy strings
        const cleaned = desc.trim();
        
        // Basic Patterns (Synchronized with Backend & Admin)
        if (cleaned.includes('Laporan pengaduan berhasil dibuat') || cleaned.includes('Complaint report successfully created')) {
            return t('complaint.timeline_events.created', 'Laporan pengaduan berhasil dibuat. Menunggu penugasan teknisi.');
        }
        if (cleaned.includes('Tiket dialihkan dari') || cleaned.includes('Ticket reassigned from')) {
            const match = cleaned.match(/(?:dari|from)\s+(.*?)\s+(?:ke|to)\s+(.*?)\s+(?:karena|due to)/i);
            const oldTech = match ? match[1].trim() : '-';
            const newTech = match ? match[2].trim() : '-';
            return t('complaint.timeline_events.reassigned_from_to', 'Tiket dialihkan dari {{oldTech}} ke {{newTech}} karena melewati batas waktu.', { oldTech, newTech });
        }
        if (cleaned.includes('Tiket telah ditugaskan ke teknisi') || cleaned.includes('Ticket has been assigned to technician')) {
            const match = cleaned.match(/(?:teknisi|technician):\s*(.*?)\.\s*(?:Menunggu|Waiting)/i);
            const techName = match ? match[1].trim() : cleaned.split(':')[1]?.split('.')[0]?.trim() || '-';
            return t('complaint.timeline_events.assigned', 'Tiket telah ditugaskan ke teknisi: {{tech}}. Menunggu respon teknisi.', { tech: techName });
        }
        if (cleaned.includes('Teknisi mulai memproses pengaduan') || cleaned.includes('Technician started processing')) {
            return t('complaint.timeline_events.process_started', 'Teknisi mulai memproses pengaduan.');
        }
        
        // Progress options from Technician dropdown
        if (cleaned.startsWith('Sedang Menuju Lokasi') || cleaned.startsWith('On the way to location')) {
            const notes = cleaned.replace(/Sedang Menuju Lokasi|On the way to location/gi, '').trim();
            return t('complaint.timeline_events.prog_heading_location', 'Sedang Menuju Lokasi{{notes}}', { notes: notes ? ` ${notes}` : '' });
        }
        if (cleaned.startsWith('Mendiagnosa Masalah') || cleaned.startsWith('Diagnosing problem')) {
            const notes = cleaned.replace(/Mendiagnosa Masalah|Diagnosing problem/gi, '').trim();
            return t('complaint.timeline_events.prog_diagnosing', 'Mendiagnosa Masalah{{notes}}', { notes: notes ? ` ${notes}` : '' });
        }
        if (cleaned.startsWith('Menunggu Suku Cadang') || cleaned.startsWith('Waiting for spare parts')) {
            const notes = cleaned.replace(/Menunggu Suku Cadang|Waiting for spare parts/gi, '').trim();
            return t('complaint.timeline_events.prog_waiting_parts', 'Menunggu Suku Cadang{{notes}}', { notes: notes ? ` ${notes}` : '' });
        }
        if (cleaned.startsWith('Proses Perbaikan') || cleaned.startsWith('Repair in progress')) {
            const notes = cleaned.replace(/Proses Perbaikan|Repair in progress/gi, '').trim();
            return t('complaint.timeline_events.prog_repairing', 'Proses Perbaikan{{notes}}', { notes: notes ? ` ${notes}` : '' });
        }
        
        // Log Access
        if (cleaned.includes('Teknisi meminta akses data log') || cleaned.includes('Technician requested log data access')) {
            const reasonMatch = cleaned.match(/(?:Alasan|Reason):\s*(.*)/i);
            const reason = reasonMatch ? reasonMatch[1].trim() : '';
            return t('complaint.timeline_events.log_requested', 'Teknisi meminta akses data log perangkat.{{reason}}', { reason: reason ? ` Alasan: ${reason}` : '' });
        }
        if (cleaned.includes('SuperAdmin memberikan izin akses data log') || cleaned.includes('SuperAdmin granted log data access')) {
            return t('complaint.timeline_events.log_approved', 'SuperAdmin memberikan izin akses data log perangkat.');
        }
        if (cleaned.includes('SuperAdmin menolak akses data log') || cleaned.includes('SuperAdmin denied log data access')) {
            return t('complaint.timeline_events.log_rejected', 'SuperAdmin menolak akses data log perangkat.');
        }
        
        // PING
        if (cleaned.includes('SuperAdmin mengirimkan PING') || cleaned.includes('SuperAdmin sent a PING')) {
            const matchCount = cleaned.match(/(?:Teguran ke-|Warning #)(\d+)/i);
            const count = matchCount ? matchCount[1] : '1';
            const matchUrg = cleaned.match(/(?:menjadi|to):\s*(.*)/i);
            const urgency = matchUrg ? matchUrg[1].replace(/\.$/, '').trim() : 'MEDIUM';
            return t('complaint.timeline_events.ping_sent', 'SuperAdmin mengirimkan PING (Teguran ke-{{count}}). Urgensi ditingkatkan menjadi: {{urgency}}.', { count, urgency });
        }
        
        // Completing & Rejection
        if (cleaned.includes('Teknisi menyatakan perbaikan selesai') || cleaned.includes('Technician declared repair complete')) {
            return t('complaint.timeline_events.tech_completed', 'Teknisi menyatakan perbaikan selesai.');
        }
        if (cleaned.includes('Homeowner telah mengonfirmasi tiket selesai') || cleaned.includes('Customer confirmed ticket completion')) {
            const ratingMatch = cleaned.match(/\(Rating:\s*(\d+)(?:&|\*)?\)/i);
            const ratingScore = ratingMatch ? ratingMatch[1] : '';
            const ratingStr = ratingScore ? ` (Rating: ${ratingScore}*)` : '';
            return t('complaint.timeline_events.homeowner_confirmed', 'Homeowner telah mengonfirmasi tiket selesai{{rating}}.', { rating: ratingStr });
        }
        if (cleaned.includes('Tiket ditolak oleh SuperAdmin') || cleaned.includes('Ticket rejected by SuperAdmin')) {
            return t('complaint.timeline_events.rejected', 'Tiket ditolak oleh SuperAdmin.');
        }
        
        // Overdues
        if (cleaned.includes('Batas waktu respon terlampaui') || cleaned.includes('Response deadline exceeded')) {
            return t('complaint.timeline_events.response_overdue', 'Batas waktu respon terlampaui (30 menit). Status otomatis berubah menjadi Overdue Respons.');
        }
        if (cleaned.includes('Batas waktu perbaikan terlampaui') || cleaned.includes('Repair deadline exceeded')) {
            return t('complaint.timeline_events.repair_overdue', 'Batas waktu perbaikan terlampaui (56 jam). Status otomatis berubah menjadi Overdue Perbaikan.');
        }
        
        // Fallback status/note matching
        if (cleaned.includes('Status diperbarui menjadi') || cleaned.includes('Status updated to')) {
            const statusStr = cleaned.split(/(?:menjadi|to)\s+/i)[1]?.replace(/\.$/, '').trim() || '';
            return t('complaint.timeline_events.status_updated_to', 'Status diperbarui menjadi {{status}}.', { status: statusStr });
        }

        return cleaned;
    };

    // --- PDF EXPORT HANDLER ---
    const handleExportDetail = () => {
        const doc = new jsPDF();
        const primaryGreen = [0, 155, 124]; // BIEON Green
        const secondaryGreen = [225, 242, 235]; // BIEON Light Green
        
        // 1. FULL WIDTH GREEN HEADER
        doc.setFillColor(...primaryGreen);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('complaint.detail_box.ticket_id', 'ID Tiket').toUpperCase()}: ${localTicket.id}`, 105, 13, { align: 'center' });

        // 2. SECTION: INFORMASI PENGADUAN
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(16);
        doc.text(t('export.section_info', 'INFORMASI PENGADUAN'), 14, 45);
        doc.setDrawColor(...primaryGreen);
        doc.setLineWidth(1);
        doc.line(14, 48, 65, 48);

        // Data Rows for Info
        const infoData = [
            [t('export.row_technician', 'Teknisi'), `: ${localTicket.technicianInfo?.name || localTicket.technician?.fullName || '-'}` + (localTicket.technicianInfo?.phone ? ` (${localTicket.technicianInfo.phone})` : '')],
            [t('export.row_tech_rating', 'Rating Teknisi'), `: ${localTicket.rating?.stars || localTicket.rating || '-'} / 5`],
            [t('export.row_customer_name', 'Nama Pelanggan'), `: ${localTicket.clientInfo?.name || localTicket.client || localTicket.homeowner?.fullName || '-'}`],
            [t('export.row_address', 'Alamat'), `: ${localTicket.clientInfo?.address || localTicket.homeowner?.address || '-'}`],
            [t('export.row_topic', 'Topik Kendala'), `: ${localTicket.topic || '-'}`],
            [t('export.row_category', 'Kategori'), `: ${localTicket.category || '-'}`],
            [t('complaint.detail_box.status_label', 'Status'), `: ${formatStatusDisplay(localTicket.status, activeRole).toUpperCase()}`],
            [t('export.row_desc', 'Deskripsi Masalah'), `: ${localTicket.description || localTicket.desc || '-'}`],
            [t('export.row_photos', 'Lampiran Foto'), `: ${localTicket.files && localTicket.files.length > 0 ? t('export.val_photos_count_short', '{{count}} Foto', { count: localTicket.files.length }) : t('export.val_no_photos', 'Tidak ada foto')}`],
            [t('export.row_created_at', 'Waktu Dibuat'), `: ${formatDisplayTime(localTicket.createdAt)}`],
            [t('export.row_completed_at', 'Waktu Selesai'), `: ${['selesai', 'completed'].includes(localTicket.status?.toLowerCase()) ? formatDisplayTime(localTicket.updatedAt) : '-'}`],
            [t('export.row_duration', 'Durasi Pengerjaan'), `: ${getDurationFromTimeline('repair')}`]
        ];

        let currentY = 65;
        doc.setFontSize(10);
        infoData.forEach(row => {
            doc.setFont('helvetica', 'bold');
            doc.text(row[0], 18, currentY);
            doc.setFont('helvetica', 'normal');
            doc.text(row[1], 80, currentY);
            currentY += 10;
        });

        // 3. SECTION: SLA PERFORMANCE & POINTS
        currentY += 10;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(t('export.section_sla', 'SLA PERFORMANCE & POINTS'), 14, currentY);
        doc.setLineWidth(1);
        doc.line(14, currentY + 3, 85, currentY + 3);
        currentY += 10;

        const statusOntime = t('export.status_ontime', 'SESUAI SLA');
        const statusLate = t('export.status_late', 'TERLAMBAT');

        const slaBody = [
            [t('export.sla_response', 'Respon Teknisi'), '15 Min', getDurationFromTimeline('response'), 
             localTicket.responsePoints >= 100 ? statusOntime : statusLate, `${localTicket.responsePoints || 0} Pts`],
            [t('export.sla_repair', 'Perbaikan Unit'), '48 Hours', getDurationFromTimeline('repair'), 
             localTicket.repairPoints >= 100 ? statusOntime : statusLate, `${localTicket.repairPoints || 0} Pts`]
        ];

        autoTable(doc, {
            startY: currentY,
            head: [[t('export.col_sla_aspect', 'Aspek SLA'), t('export.col_target', 'Target'), t('export.col_achieved', 'Capaian'), t('export.col_status', 'Status'), t('export.col_points', 'Points')]],
            body: slaBody,
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 5 },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 3) {
                    const statusText = data.cell.raw;
                    if (statusText === statusOntime) doc.setTextColor(0, 155, 124);
                    else doc.setTextColor(239, 68, 68);
                    doc.setFont('helvetica', 'bold');
                }
                if (data.section === 'body' && data.column.index === 4) {
                    doc.setFont('helvetica', 'bold');
                }
            }
        });

        // Overall Performance Box
        const finalY_SLA = doc.lastAutoTable.finalY + 10;
        const totalPoints = (localTicket.responsePoints || 0) + (localTicket.repairPoints || 0);
        const perfStatus = totalPoints >= 200 ? t('export.perf_excellent', 'EXCELLENT') : totalPoints >= 150 ? t('export.perf_good', 'GOOD') : t('export.perf_needs_improvement', 'NEEDS IMPROVEMENT');
        
        doc.setFillColor(...secondaryGreen);
        doc.rect(14, finalY_SLA, 182, 10, 'F');
        doc.setTextColor(...primaryGreen);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(t('export.overall_perf', 'OVERALL PERFORMANCE: {{points}} POINTS - {{status}}', { points: totalPoints, status: perfStatus }), 105, finalY_SLA + 6.5, { align: 'center' });

        // 4. SECTION: RIWAYAT PROGRES PENGADUAN
        currentY = finalY_SLA + 30;
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(16);
        doc.text(t('export.section_timeline', 'RIWAYAT PROGRES PENGADUAN'), 14, currentY);
        doc.setLineWidth(1);
        doc.line(14, currentY + 3, 90, currentY + 3);
        currentY += 10;

        autoTable(doc, {
            startY: currentY,
            head: [[t('export.col_date_time', 'Tanggal & Waktu'), t('export.col_activity', 'Aktivitas'), t('export.col_notes', 'Catatan/Keterangan')]],
            body: localTicket.timeline?.map(tItem => [
                formatDisplayTime(tItem.time),
                formatStatusDisplay(tItem.status, activeRole).toUpperCase(),
                getLocalizedTimelineDesc(tItem.desc)
            ]) || [],
            theme: 'striped',
            headStyles: { fillColor: primaryGreen, textColor: 255, fontStyle: 'bold' },
            styles: { 
                fontSize: 8, 
                cellPadding: 3,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 35 }, // Date column
                1: { cellWidth: 40 }, // Activity column
                2: { cellWidth: 'auto' } // Notes column (flexible)
            },
            margin: { left: 14, right: 14 }
        });

        // Save
        doc.save(`BIEON_DETAIL_${localTicket.id}.pdf`);
    };

    // Helper: Badge Status Standard
    const StatusBadge = ({ ticket: badgeTicket }) => {
        const baseClasses = "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all";
        const { level, isOverdue, type } = useSLA(badgeTicket.createdAt, badgeTicket.assignedAt, badgeTicket.processStartedAt, badgeTicket.status);
        const displayStatus = formatStatusDisplay(badgeTicket.status);

        const colors = {
            'unassigned': 'bg-gray-50 text-gray-400 border-gray-100',
            'menunggu respons': 'bg-blue-50 text-blue-600 border-blue-100',
            'diproses': 'bg-teal-50 text-teal-600 border-teal-100',
            'overdue respons': 'bg-red-50 text-red-600 border-red-100',
            'overdue perbaikan': 'bg-red-50 text-red-600 border-red-100',
            'menunggu konfirmasi pelanggan': 'bg-indigo-50 text-indigo-600 border-indigo-100',
            'selesai': 'bg-[#E1F2EB] text-[#1E4D40] border-[#BEE3D1]',
            'ditolak': 'bg-red-50 text-red-600 border-red-100'
        };

        const slaTimer = (role !== 'homeowner' && (ticket.status?.toLowerCase() === 'diproses' || ticket.status?.toLowerCase() === 'menunggu respons' || isOverdue)) ? (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ml-2 ${level === 'red' ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' :
                    level === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-teal-50 text-teal-600 border-teal-100'
                }`}>
                SLA: {type} {isOverdue ? 'OVERDUE' : ''}
            </span>
        ) : null;

        const cleanStatus = badgeTicket.status?.toLowerCase() || '';
        const badgeClass = colors[cleanStatus] || 'bg-gray-50 text-gray-500 border-gray-100';

        return (
            <div className="flex items-center gap-2">
                <span className={`${baseClasses} ${badgeClass}`}>
                    {displayStatus}
                </span>
                {badgeTicket.isEscalated && !['selesai', 'ditolak'].includes(badgeTicket.status?.toLowerCase()) && (
                    <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-[0_2px_4px_rgba(239,68,68,0.3)] flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-2.5 h-2.5" /> PRIORITAS
                    </span>
                )}
                {slaTimer}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <div className="w-full max-w-[1200px] h-full max-h-[95vh] flex flex-col relative animate-in fade-in zoom-in duration-300">

                {/* HEADER AREA */}
                <div className="flex items-center gap-4 mb-8 shrink-0 mt-4 px-2 lg:px-4 hidden md:flex">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        {title}
                        {isRefreshing && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                                <RefreshCw className="w-3 h-3 text-white animate-spin" />
                                <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Memperbarui...</span>
                            </div>
                        )}
                    </h2>
                </div>

                {/* MOBILE HEADER */}
                <div className="flex justify-between items-center mb-6 shrink-0 md:hidden px-2">
                    <button onClick={onClose} className="flex items-center gap-2 text-white font-bold">
                        <ArrowLeft className="w-5 h-5" /> Kembali
                    </button>
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                </div>

                <style>{`
                    .modal-custom-scrollbar::-webkit-scrollbar { width: 8px; }
                    .modal-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .modal-custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.4); border-radius: 9999px; }
                    .modal-custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.7); }
                `}</style>

                {/* MAIN CONTENT AREA (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto pb-8 modal-custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-1 lg:px-4">

                        {/* MOBILE ONLY: ROLE ACTIONS SLOT (At the very top) */}
                        {!(role === 'homeowner' && localTicket.status.toLowerCase() !== 'menunggu konfirmasi pelanggan') && (
                            <div className="lg:hidden bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    {t('complaint.detail_box.available_actions', 'Aksi Tersedia')}
                                </h3>
                                <div className="space-y-3">
                                    {renderActions ? renderActions : (
                                        <div className="space-y-3">
                                            {role === 'homeowner' && localTicket.status.toLowerCase() === 'menunggu konfirmasi pelanggan' && (
                                                <button
                                                    onClick={() => setIsRatingModalOpen(true)}
                                                    className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                                                >
                                                    {t('complaint.action.homeowner.confirm_btn', 'Konfirmasi & Nilai')}
                                                </button>
                                            )}
                                            
                                            {/* Shared: Export PDF Button (Mobile) */}
                                            {shouldShowPdfExport && (
                                                <button
                                                    onClick={handleExportDetail}
                                                    className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                                                >
                                                    <Download className="w-4 h-4 text-gray-400" /> {t('complaint.detail_box.export_pdf', 'Ekspor Detail Pengaduan (PDF)')}
                                                </button>
                                            )}

                                            {role !== 'homeowner' && (
                                                <p className="text-[10px] text-gray-400 italic text-center">Aksi tersedia dapat dilihat di panel bawah pada desktop atau scroll ke bawah.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* LEFT COLUMN (2/3) - Main Ticket Details */}
                        <div className="lg:col-span-2 space-y-6">

                            <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-100 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 pb-4 border-b border-gray-100">
                                    <div className="text-start">
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{localTicket.topic}</h3>
                                        <p className="text-[11px] text-gray-500 font-medium">{t('complaint.detail_box.ticket_id', 'ID Tiket')}: {localTicket.id}</p>
                                    </div>
                                    <div className="shrink-0">
                                        <StatusBadge ticket={localTicket} />
                                    </div>
                                </div>

                                <div className="space-y-6 text-start">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-[10px] mb-2 uppercase tracking-wider">
                                            {t('complaint.detail_box.desc', 'Deskripsi Pengaduan')}
                                        </h4>
                                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {localTicket.description || localTicket.desc}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 pb-6 border-b border-gray-50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{t('complaint.detail_box.category', 'Kategori')}</p>
                                            <p className="font-semibold text-sm text-gray-800">{localTicket.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{t('complaint.detail_box.device', 'Ruangan & Perangkat')}</p>
                                            <p className="font-semibold text-sm text-gray-800">{localTicket.device}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{t('complaint.detail_box.date_in', 'Tanggal Masuk')}</p>
                                                {formatDisplayTime(localTicket.timeline?.[localTicket.timeline.length - 1]?.time || localTicket.createdAt)}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">{t('complaint.detail_box.last_update', 'Terakhir Update')}</p>
                                                {formatDisplayTime(localTicket.timeline?.[0]?.time || localTicket.updatedAt || localTicket.createdAt)}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-gray-800 text-[11px] mb-4 uppercase tracking-wider">
                                            {t('complaint.detail_box.upload_files', 'Lampiran File')}
                                        </h4>
                                        {localTicket.files && localTicket.files.length > 0 ? (
                                            <div className="flex flex-wrap gap-4">
                                                {localTicket.files.map((file, idx) => (
                                                    <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">{t('complaint.detail_box.no_files', 'Tidak ada lampiran file.')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* BOX: RIWAYAT PROGRESS */}
                            <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-100 shadow-sm text-start mb-6">
                                <h3 className="font-bold text-base text-gray-900 mb-6 flex items-center gap-3">
                                    {t('complaint.detail_box.timeline_title', 'Riwayat Progres Pengaduan')}
                                </h3>
                                <div className="space-y-6 pl-1">
                                    {localTicket.timeline && localTicket.timeline.map((step, idx) => (
                                        <div key={idx} className="relative flex gap-5">
                                            {idx !== localTicket.timeline.length - 1 && (
                                                <div className="absolute left-[7px] top-6 bottom-[-28px] w-[1px] bg-gray-200"></div>
                                            )}
                                            <div className="relative z-10 shrink-0 mt-1">
                                                <div className={`w-3.5 h-3.5 rounded-full ring-4 ring-white ${idx === 0 ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-400 mb-1">{formatDisplayTime(step.time)}</div>
                                                <div className={`text-sm font-medium leading-relaxed ${step.desc?.toLowerCase().includes('ping') ? 'text-amber-700 font-bold' : 'text-gray-800'}`}>
                                                    {step.desc?.toLowerCase().includes('ping') && <AlertCircle className="w-3.5 h-3.5 inline mr-1 text-amber-500 mb-0.5" />}
                                                    {getLocalizedTimelineDesc(step.desc)}
                                                </div>
                                                {step.status && (
                                                    <div className={`text-[9px] font-bold mt-1.5 inline-block px-1.5 py-0.5 rounded border tracking-wide ${step.desc?.toLowerCase().includes('ping') ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
                                                        {formatStatusDisplay(step.status.replace('Status: ', ''), role)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* BOX: HASIL PENILAIAN (If available) */}
                            {localTicket.status?.toLowerCase() === 'selesai' && localTicket.rating && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                                                <User className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <div className="text-start">
                                                <h4 className="font-bold text-gray-900 text-sm leading-tight">{localTicket.technicianInfo?.name || localTicket.technician?.fullName || 'Teknisi'}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{t('complaint.detail_box.rating_label', 'Nilai')}: {localTicket.rating.stars || localTicket.rating}/5</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star 
                                                    key={s} 
                                                    className={`w-5 h-5 ${s <= (localTicket.rating.stars || localTicket.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-6 text-start bg-gray-50/30">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('complaint.detail_box.review_label', 'Ulasan')}</h5>
                                        <p className="text-xs text-gray-600 leading-relaxed italic">
                                            "{localTicket.rating.review || t('complaint.detail_box.no_review', 'Tidak ada ulasan tertulis.')}"
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN (1/3) - Sidebar Information */}
                        <div className="lg:col-span-1 space-y-6 text-start">

                            {/* BOX: INFORMASI CLIENT */}
                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-xs font-bold text-darkgrey-400 uppercase tracking-wider mb-6 pb-2 border-b border-gray-50 flex items-center justify-between">
                                    {t('complaint.detail_box.customer_info', 'Informasi Pelanggan')}
                                    <User className="w-4 h-4 text-blue-500" />
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-blue-600 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('complaint.customer_info.name', 'Nama Pelanggan')}</p>
                                            <p className="text-sm font-semibold text-gray-900">{localTicket.clientInfo?.name || localTicket.client || localTicket.homeowner?.fullName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('complaint.customer_info.email', 'Email')}</p>
                                            <span className="text-sm font-medium text-gray-700">{localTicket.clientInfo?.email || localTicket.homeowner?.email || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('complaint.customer_info.phone', 'No. Handphone')}</p>
                                            <span className="text-sm font-medium text-gray-700">{localTicket.clientInfo?.phone || localTicket.homeowner?.phoneNumber || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('complaint.customer_info.address', 'Alamat')}</p>
                                            <p className="text-sm font-medium text-gray-700 leading-relaxed">{localTicket.clientInfo?.address || localTicket.homeowner?.address || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BOX: INFORMASI TEKNISI */}
                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-xs font-bold text-darkgrey-400 uppercase tracking-wider mb-6 pb-2 border-b border-gray-50 flex items-center justify-between">
                                    {t('complaint.detail_box.technician_info', 'Informasi Teknisi')}
                                    <Cpu className="w-4 h-4 text-purple-600" />
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-purple-600 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('complaint.technician_info.name', 'Nama Teknisi')}</p>
                                            <p className={`text-sm ${(localTicket.technicianInfo?.name || localTicket.technician?.fullName) ? 'font-black text-gray-900' : 'font-medium text-gray-400'}`}>
                                                {localTicket.technicianInfo?.name || localTicket.technician?.fullName || t('complaint.waiting_technician', 'Menunggu Teknisi')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{t('complaint.technician_info.phone', 'No. Handphone')}</p>
                                            <p className={`text-sm ${(localTicket.technicianInfo?.name || localTicket.technician?.fullName) ? 'font-bold text-gray-800' : 'font-medium text-gray-400'}`}>
                                                {localTicket.technicianInfo?.phone || localTicket.technician?.phoneNumber || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* SLA PERFORMANCE SECTION (Internal Only) */}
                                    {role?.toLowerCase() !== 'homeowner' && localTicket.technician && (
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{t('complaint.sla.performance', 'SLA Performance')}</p>
 
                                                {/* Overall Assessment - Compact */}
                                                {(localTicket.responsePoints > 0 || localTicket.repairPoints > 0) && (
                                                    <div className={`px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${(localTicket.responsePoints + localTicket.repairPoints) / (localTicket.repairPoints > 0 ? 2 : 1) >= 70
                                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                                            : 'bg-red-50 border-red-100 text-red-700'
                                                        }`}>
                                                        <span className="text-[9px] font-black uppercase">
                                                            {(localTicket.responsePoints + localTicket.repairPoints) / (localTicket.repairPoints > 0 ? 2 : 1) >= 70 ? t('complaint.perf.safe', 'Aman') : t('complaint.perf.danger', 'Bahaya')}
                                                            {['admin', 'superadmin'].includes(role?.toLowerCase()) && ` • ${Math.round((localTicket.responsePoints + localTicket.repairPoints) / (localTicket.repairPoints > 0 ? 2 : 1))}`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {/* Response Box */}
                                                <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-1.5">
                                                    <p className="text-[8px] text-gray-400 font-bold uppercase">{t('complaint.sla_response', 'SLA Respons')}</p>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="text-[10px] font-mono font-bold text-gray-700 shrink-0">
                                                            {getDurationFromTimeline('response')}
                                                        </span>
 
                                                        {localTicket.responsePoints > 0 && (
                                                            <>
                                                                {['admin', 'superadmin'].includes(role?.toLowerCase()) && (
                                                                    <span className={`w-5 h-5 flex items-center justify-center bg-white border-2 text-[8px] font-black rounded-full shrink-0 ${getPerformanceIndicator(localTicket.responsePoints).color.replace('text-', 'border-').replace('600', '500')} ${getPerformanceIndicator(localTicket.responsePoints).color}`}>
                                                                        {localTicket.responsePoints}
                                                                    </span>
                                                                )}
                                                                <span className={`px-1 rounded text-[7px] font-bold uppercase whitespace-nowrap ${getPerformanceIndicator(localTicket.responsePoints).bg} ${getPerformanceIndicator(localTicket.responsePoints).color} shrink-0`}>
                                                                    {getPerformanceIndicator(localTicket.responsePoints).label}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Repair Box */}
                                                <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex flex-col gap-1.5">
                                                    <p className="text-[8px] text-gray-400 font-bold uppercase">{t('complaint.sla_repair', 'SLA Perbaikan')}</p>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="text-[10px] font-mono font-bold text-gray-700 shrink-0">
                                                            {getDurationFromTimeline('repair')}
                                                        </span>
 
                                                        {localTicket.repairPoints > 0 && (
                                                            <>
                                                                {['admin', 'superadmin'].includes(role?.toLowerCase()) && (
                                                                    <span className={`w-5 h-5 flex items-center justify-center bg-white border-2 text-[8px] font-black rounded-full shrink-0 ${getPerformanceIndicator(localTicket.repairPoints).color.replace('text-', 'border-').replace('600', '500')} ${getPerformanceIndicator(localTicket.repairPoints).color}`}>
                                                                        {localTicket.repairPoints}
                                                                    </span>
                                                                )}
                                                                <span className={`px-1 rounded text-[7px] font-bold uppercase whitespace-nowrap ${getPerformanceIndicator(localTicket.repairPoints).bg} ${getPerformanceIndicator(localTicket.repairPoints).color} shrink-0`}>
                                                                    {getPerformanceIndicator(localTicket.repairPoints).label}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BOX: ROLE ACTIONS SLOT (DESKTOP) */}
                            {!(role === 'homeowner' && localTicket.status.toLowerCase() !== 'menunggu konfirmasi pelanggan') && (
                                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                        {t('complaint.detail_box.available_actions', 'Aksi Tersedia')}
                                    </h3>
                                    <div className="space-y-3">
                                        {renderActions ? renderActions : (
                                            <div className="space-y-3">
                                                {role === 'homeowner' && localTicket.status.toLowerCase() === 'menunggu konfirmasi pelanggan' && (
                                                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center shadow-sm animate-pulse">
                                                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-100">
                                                            <CheckCircle2 className="w-6 h-6" />
                                                        </div>
                                                        <h4 className="text-sm font-bold text-emerald-900 mb-2">{t('complaint.action.homeowner.ticket_finished_title', 'Tiket Selesai Dikerjakan')}</h4>
                                                        <p className="text-[10px] text-emerald-600 mb-6 leading-relaxed">{t('complaint.action.homeowner.ticket_finished_desc', 'Teknisi telah menyelesaikan perbaikan. Mohon konfirmasi dan berikan penilaian Anda.')}</p>
                                                        <button
                                                            onClick={() => setIsRatingModalOpen(true)}
                                                            className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                                                        >
                                                            {t('complaint.action.homeowner.confirm_btn', 'Konfirmasi & Nilai')}
                                                        </button>
                                                    </div>
                                                )}
                                                {role === 'technician' && (
                                                    <div className="space-y-3 pt-2">
                                                        {/* Active Management Buttons (Only for non-closed statuses) */}
                                                        {!['selesai', 'menunggu konfirmasi pelanggan'].includes(localTicket.status.toLowerCase()) && (
                                                            <>
                                                                <button
                                                                    onClick={() => setIsProgressModalOpen(true)}
                                                                    className="w-full py-3 bg-white border border-teal-500 text-teal-700 rounded-xl font-bold hover:bg-teal-50 transition-all shadow-sm flex items-center justify-center gap-2 text-xs"
                                                                >
                                                                    <RefreshCw className="w-4 h-4 text-teal-600" /> {t('complaint.action.technician.update_progress', 'Update Progres')}
                                                                </button>

                                                                <button
                                                                    disabled={!localTicket.hasStartedRepair}
                                                                    onClick={() => handleStatusUpdate('menunggu konfirmasi pelanggan')}
                                                                    className={`w-full py-3 border rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs ${localTicket.hasStartedRepair
                                                                            ? 'bg-[#009B7C] text-white border-transparent hover:bg-[#00856a] shadow-lg shadow-emerald-100'
                                                                            : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                                                                        }`}
                                                                >
                                                                    <CheckCircle2 className={`w-4 h-4 ${localTicket.hasStartedRepair ? 'text-white' : 'text-gray-200'}`} /> {t('complaint.action.technician.finish_repair', 'Perbaikan Selesai')}
                                                                </button>
                                                            </>
                                                        )}

                                                        {/* DATA LOG ACCESS SYSTEM (Refined Visibility Logic) */}
                                                        <div className="space-y-3 pt-1">
                                                            {/* Initial Request Button: Only show if status is 'diproses' and no request made yet */}
                                                            {(!localTicket.logRequestStatus || localTicket.logRequestStatus === 'none') && 
                                                             localTicket.status.toLowerCase() === 'diproses' && (
                                                                <button
                                                                    onClick={() => setIsLogReasonModalOpen(true)}
                                                                    className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-red-200"
                                                                >
                                                                    <FileText className="w-4 h-4" /> {t('complaint.action.technician.request_log', 'Minta Akses Log')}
                                                                </button>
                                                            )}

                                                            {/* Pending/Requested State: Show ALWAYS once initiated */}
                                                            {(localTicket.logRequestStatus === 'pending' || localTicket.logRequestStatus === 'requested') && (
                                                                <button
                                                                    disabled
                                                                    className="w-full py-3 bg-red-50 text-red-400 border border-red-100 rounded-xl font-bold flex items-center justify-center gap-2 text-xs cursor-not-allowed"
                                                                >
                                                                    <Clock className="w-4 h-4" /> {t('complaint.action.technician.log_status_pending', 'Menunggu Konfirmasi SA')}
                                                                </button>
                                                            )}

                                                            {/* Rejected State: Show ALWAYS once rejected */}
                                                            {localTicket.logRequestStatus === 'rejected' && (
                                                                <button
                                                                    disabled
                                                                    className="w-full py-3 bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold flex items-center justify-center gap-2 text-xs opacity-80"
                                                                >
                                                                    <AlertCircle className="w-4 h-4" /> {t('complaint.action.technician.log_status_rejected', 'Akses Log Ditolak')}
                                                                </button>
                                                            )}

                                                            {/* Granted State: Show ALWAYS once granted */}
                                                            {localTicket.logRequestStatus === 'granted' && (
                                                                <button
                                                                    onClick={() => {
                                                                        const returnTicketId = localTicket?.originalId || localTicket?._id || null;
                                                                        const customerName = localTicket?.clientInfo?.name || localTicket?.client || localTicket?.homeowner?.fullName || '';
                                                                        onClose?.();
                                                                        navigate('/admin-datalog', {
                                                                            state: {
                                                                                sourceRole: role,
                                                                                returnTicketId,
                                                                                customerName
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-teal-200"
                                                                >
                                                                    <FileText className="w-4 h-4" /> {t('complaint.action.technician.log_status_accepted', 'Akses Log Diterima')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Shared: Export PDF Button (Desktop) */}
                                                {shouldShowPdfExport && (
                                                    <div className="pt-2">
                                                        <button
                                                            onClick={handleExportDetail}
                                                            className="w-full py-3 bg-white border border-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider group"
                                                        >
                                                            <Download className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" /> {t('complaint.detail_box.export_pdf', 'Ekspor Detail Pengaduan (PDF)')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: UPDATE PROGRESS (Technician) */}
            {isProgressModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('complaint.action.technician.update_popup_title', 'Update Progres')}</h2>
                        <div className="space-y-4 mb-8">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">{t('complaint.action.technician.select_progress_label', 'Pilih Status Progres')}</label>
                            <div className="relative">
                                <button onClick={() => setShowProgressDropdown(!showProgressDropdown)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700">
                                    {progressOption ? t(`complaint.action.technician.${progressOption}`) : t('complaint.action.technician.select_option', 'Pilih Opsi...')} <AlertCircle className={`w-4 h-4 text-gray-400 transition-transform ${showProgressDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showProgressDropdown && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1.5 overflow-hidden">
                                        {['prog_heading_location', 'prog_diagnosing', 'prog_waiting_parts', 'prog_repairing'].map(key => (
                                            <button 
                                                key={key} 
                                                onClick={() => { setProgressOption(key); setShowProgressDropdown(false); }} 
                                                className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${progressOption === key ? 'text-teal-600 font-bold bg-teal-50' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {t(`complaint.action.technician.${key}`)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4 mb-8 text-start">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">{t('complaint.action.technician.optional_note', 'Catatan Tambahan (Opsional)')}</label>
                            <textarea value={progressNote} onChange={(e) => setProgressNote(e.target.value)} placeholder={t('complaint.action.technician.progress_input_placeholder', 'Catatan teknisi...')} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-700 h-24" />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setIsProgressModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">{t('common.cancel', 'Batal')}</button>
                            <button onClick={handleUpdateProgress} disabled={!progressOption || isSubmitting} className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl">{t('complaint.action.technician.submit_progress', 'Simpan Progres')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: RATING (Homeowner) */}
            {isRatingModalOpen && (
                <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#489C74] rounded-[2.5rem] p-8 max-w-lg w-full text-center relative shadow-2xl animate-in zoom-in duration-300">
                        <button onClick={() => setIsRatingModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-8xl drop-shadow-2xl animate-bounce">
                            {ratingStars >= 5 ? '🤩' : ratingStars >= 4 ? '😊' : ratingStars >= 3 ? '😐' : ratingStars >= 1 ? '🙁' : '😍'}
                        </div>
                        <div className="pt-12">
                            <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">{t('complaint.action.homeowner.rating_popup_title', 'Beri Penilaian Perbaikan')}</h2>
                            <p className="text-white/80 text-sm mb-8 leading-relaxed font-medium">{t('complaint.action.homeowner.rating_popup_desc', 'Silakan beri bintang dan ulasan untuk teknisi kami yang menangani masalah Anda.')}</p>
                            <div className="flex justify-center gap-3 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onMouseEnter={() => setHoverStars(star)} onMouseLeave={() => setHoverStars(0)} onClick={() => setRatingStars(star)} className="transition-all hover:scale-125 active:scale-95">
                                        <Star className={`w-12 h-12 ${(hoverStars || ratingStars) >= star ? "fill-amber-300 text-amber-300" : "fill-white/20 text-white/20"} transition-colors duration-200`} />
                                    </button>
                                ))}
                            </div>
                            <div className="bg-white/10 rounded-3xl p-1 mb-8 border border-white/10">
                                <textarea value={ratingReview} onChange={(e) => setRatingReview(e.target.value)} placeholder={t('complaint.action.homeowner.rating_placeholder', 'Tulis pengalaman Anda tentang perbaikan ini...')} className="w-full bg-transparent border-none rounded-2xl p-5 text-white text-sm h-32 focus:ring-0 placeholder:text-white/40" />
                            </div>
                            <button 
                                onClick={() => handleStatusUpdate('selesai', '', { stars: ratingStars, review: ratingReview })} 
                                disabled={ratingStars === 0 || isSubmitting} 
                                className="w-full py-4 bg-white text-[#489C74] font-black rounded-2xl shadow-xl hover:bg-emerald-50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-xs"
                            >
                                {isSubmitting ? t('complaint.detail_box.sending', 'Mengirim...') : t('complaint.action.homeowner.submit_rating', 'Kirim Penilaian')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL: LOG REASON (Technician) */}
            {isLogReasonModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('complaint.action.technician.request_log_title', 'Permintaan Akses Data Log')}</h2>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{t('complaint.action.technician.request_log_desc', 'Kirim permintaan kepada Super Admin untuk mengakses log historis sensor dan kendali perangkat guna diagnosis lebih mendalam.')}</p>
                        
                        <div className="space-y-4 mb-8 text-start">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">{t('complaint.action.technician.request_reason_label', 'Alasan / Data yang Dibutuhkan')}</label>
                            <textarea 
                                value={logReason} 
                                onChange={(e) => setLogReason(e.target.value)} 
                                placeholder={t('complaint.action.technician.request_reason_placeholder', 'Tulis alasan mengapa Anda memerlukan akses data log ini...')} 
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-700 h-32 focus:outline-none focus:border-red-500 transition-all" 
                            />
                        </div>
                        
                        <div className="flex gap-4">
                            <button onClick={() => setIsLogReasonModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl">{t('common.cancel', 'Batal')}</button>
                            <button 
                                onClick={() => handleLogAction('request', logReason)} 
                                disabled={!logReason.trim() || isSubmitting} 
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {t('complaint.action.technician.submit_request_log', 'Kirim Permintaan')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
