import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Users,
    Zap,
    Bell,
    ChevronDown,
    ShieldCheck,
    Search,
    Filter,
    Calendar,
    Star,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    AlertCircle,
    Clock,
    CheckCircle2,
    X,
    FileText,
    MoreVertical,
    Send,
    Phone,
    XCircle,
    Activity,
    Download
} from 'lucide-react';
import { ComplaintDetailModal } from '../complaints/ComplaintDetailModal';
import { SuperAdminLayout } from './SuperAdminLayout';
import { useSLA } from '../../hooks/useSLA';
import { TicketStatusBadge } from '../../shared/TicketStatusBadge';
import { formatStatusDisplay, getRawDisplayStatus, getActionButtons, getPerformanceIndicator } from '../../utils/complaintHelpers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SLADisplay = ({ createdAt, assignedAt, processStartedAt, status }) => {
    const { timer, points, level, isOverdue, type } = useSLA(createdAt, assignedAt, processStartedAt, status);

    if (!timer) return null;

    const colors = {
        emerald: 'bg-bieon-eco/10 text-bieon-eco border-bieon-eco/20',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        red: 'bg-red-50 text-red-600 border-red-100'
    };

    const dotColors = {
        emerald: 'bg-bieon-eco',
        amber: 'bg-amber-400',
        red: 'bg-red-500'
    };

    return (
        <div className="mt-1 inline-flex flex-col gap-0.5">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold ${colors[level]} ${isOverdue ? 'animate-pulse-red shadow-[0_0_8px_rgba(239,68,68,0.3)]' : ''}`}>
                <Clock className="w-2.5 h-2.5" />
                <span>{timer}</span>
                <span className="opacity-60 font-medium">({type})</span>
            </div>
            <div className="flex items-center gap-1 px-1">
                <div className={`w-1 h-1 rounded-full ${dotColors[level]}`}></div>
                <span className="text-[9px] font-bold text-gray-400">{points} Poin</span>
            </div>
        </div>
    );
};

const UrgencyBadge = ({ level, pingCount }) => {
    if ((!level || level === 'low') && !pingCount) return null;

    const mainBadgeStyles = {
        high: 'bg-red-50 text-red-600 border-red-100',
        critical: 'bg-red-900 text-white border-red-900 animate-pulse'
    };

    const { t } = useTranslation();
    const mainLabels = {
        high: `🔥 ${t('complaint.urgency_alihan', 'Prioritas (Alihan)')}`,
        critical: `🚨 ${t('complaint.urgency_critical', 'KRITIS')}`
    };

    return (
        <div className="flex flex-wrap gap-1 items-center">
            {/* Render Kotak Ping (Max 3) */}
            {Array.from({ length: pingCount || 0 }).map((_, i) => (
                <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 text-[8px] font-black uppercase shadow-sm">
                    ⚠️ {t('complaint.ping_badge', 'Ping')}
                </span>
            ))}
            
            {/* Render Badge Status Utama (High/Critical) */}
            {(level === 'high' || level === 'critical') && (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase border ${mainBadgeStyles[level]}`}>
                    {mainLabels[level]}
                </span>
            )}
        </div>
    );
};

// Sub-component for individual table rows to handle SLA hooks correctly
const AdminComplaintRow = ({ item, getStatusBadge, handleDetail, handleAssign, handlePing, handleReject, handleTransfer }) => {
    const { t } = useTranslation();
    const { timer, points, isOverdue, timeElapsedMinutes } = useSLA(item.createdAt, item.assignedAt, item.processStartedAt, item.status);
    
    const displayStatus = getRawDisplayStatus(item.status, 'admin', timeElapsedMinutes);
    const actions = getActionButtons('admin', item.status, timeElapsedMinutes, t);

    return (
        <tr className="hover:bg-[#F8FAFB]/50 transition-colors group text-[#374151]">
            <td className="px-3 md:px-4 lg:px-6 py-4 text-[13px] font-bold text-gray-900 whitespace-nowrap">{item.id}</td>
            <td className="px-3 md:px-4 lg:px-6 py-4 text-[13px] text-gray-500 font-medium whitespace-nowrap">{item.date}</td>
            <td className="px-3 md:px-4 lg:px-6 py-4 text-[13px] font-bold text-gray-800 whitespace-nowrap">{item.customer}</td>
            <td className="px-3 md:px-4 lg:px-6 py-4 text-[13px] font-medium text-gray-900 max-w-[300px]" title={item.topic}>
                <div className="flex flex-col gap-1">
                    <span className="truncate">{item.topic}</span>
                    <UrgencyBadge level={item.urgencyLevel} pingCount={item.pingCount} />
                </div>
            </td>
            <td className="px-3 md:px-4 lg:px-6 py-4 whitespace-nowrap">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                    {item.category ? t(`complaint.category_${item.category.toLowerCase().replace(/\s+/g, '_')}`, item.category) : t('history.category_others', 'Lainnya')}
                </span>
            </td>
            <td className="px-3 md:px-4 lg:px-6 py-4 text-[13px]">
                <span className={item.technician === 'Unassigned' ? 'text-gray-400 italic font-medium' : 'text-gray-700 font-bold'}>
                    {item.technician === 'Unassigned' ? t('complaint.table_col.waiting_tech', 'Menunggu Teknisi') : item.technician}
                </span>
            </td>
            <td className="px-3 md:px-4 lg:px-6 py-4 text-[13px] text-center">
                {item.status === 'selesai' && item.rating !== '-' ? (
                    <div className="inline-flex items-center gap-1 font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {item.rating}/5
                    </div>
                ) : <span className="text-gray-300 font-bold">—</span>}
            </td>
            <td className="px-3 md:px-4 lg:px-6 py-4 text-[13px]">
                <div className="flex flex-col items-start gap-1">
                    <TicketStatusBadge 
                        status={displayStatus} 
                        rating={item.rating} 
                        assignedAt={item.assignedAt}
                        processStartedAt={item.processStartedAt}
                        isEscalated={item.isEscalated}
                        role="admin"
                    />
                </div>
            </td>
            <td className="px-3 md:px-4 lg:px-6 py-4 text-[13px]">
                <div className="flex items-center justify-start gap-2">
                    {actions
                        .filter(btn => {
                            // Sembunyikan Detail jika ada tombol aksi utama (Ping, Alihkan, Tugaskan, Tolak)
                            const hasMainAction = actions.some(b => ['assign', 'ping', 'reassign', 'reject'].includes(b.action));
                            if (hasMainAction && btn.action === 'detail') return false;
                            return true;
                        })
                        .map((btn, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (btn.action === 'detail') handleDetail(item);
                                if (btn.action === 'assign') handleAssign(item);
                                if (btn.action === 'ping') handlePing(item);
                                if (btn.action === 'reject') handleReject(item);
                                if (btn.action === 'reassign') handleTransfer(item);
                            }}
                            className={`px-4 py-2.5 rounded-xl text-[11px] font-bold hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap ${
                                btn.action === 'detail' ? 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100' :
                                btn.action === 'reject' ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' :
                                btn.action === 'ping' ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100' :
                                btn.variant === 'primary' ? 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100' :
                                btn.variant === 'secondary' ? 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100' :
                                'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            {btn.label} {btn.action === 'detail' && <ChevronRight className="w-3 h-3" />}
                        </button>
                    ))}
                </div>
            </td>
        </tr>
    );
};

// Dummy data array has been moved directly to MongoDB via the Seed script!

export default function AdminComplaint({ onNavigate }) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    // --- Filter & Pagination States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- Modal States ---
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isPingModalOpen, setIsPingModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
    const [selectedPingType, setSelectedPingType] = useState('');

    // --- Fetch Logic ---
    const token = localStorage.getItem('token');

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Fetch tickets using parallel promise
            const [complaintsRes, techsRes] = await Promise.all([
                fetch('/api/complaints', {
                    headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
                    cache: 'no-store'
                }),
                fetch('/api/admin/technicians', {
                    headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
                    cache: 'no-store'
                })
            ]);

            if (complaintsRes.ok) {
                const result = await complaintsRes.json();
                const complaintList = result.data || [];

                // Mapped structure for frontend compatibility
                const formattedComplaints = complaintList.map(item => ({
                    ...item,
                    originalId: item._id, // Save DB ID to hit PUT endpoints
                    id: `TCK-${item._id ? item._id.substring(item._id.length - 6).toUpperCase() : '000000'}`,
                    description: item.desc, // Map from DB
                    createdAt: item.createdAt, // Raw date for dynamic formatting
                    date: new Date(item.createdAt).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'),
                    customer: item.homeowner?.fullName || 'Unknown User',
                    location: item.homeowner?.address || '-',
                    clientInfo: item.homeowner ? {
                        name: item.homeowner.fullName,
                        email: item.homeowner.email,
                        phone: item.homeowner.phoneNumber,
                        address: item.homeowner.address,
                        idBieon: item.homeowner.bieonId
                    } : {},
                    rating: item.rating?.stars || '-',
                    technician: item.technician?.fullName || 'Unassigned',
                    technicianInfo: item.technician ? {
                        id: item.technician._id,
                        name: item.technician.fullName,
                        phone: item.technician.phoneNumber,
                        targetDate: item.assignedAt ? new Date(new Date(item.assignedAt).getTime() + (48 * 60 * 60 * 1000)).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA',
                        responsePoints: item.responsePoints || 0,
                        repairPoints: item.repairPoints || 0,
                    } : null,
                    duration: (item.status === 'selesai' && item.processStartedAt) 
                        ? (() => {
                            const end = item.completedAt ? new Date(item.completedAt) : new Date(item.updatedAt);
                            const diff = end - new Date(item.processStartedAt);
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            return hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;
                          })()
                        : null,
                    isEscalated: item.isEscalated || false,
                    completedAt: item.completedAt || null,
                    logRequestStatus: item.logRequestStatus || 'none',
                    logReason: item.logReason || '',
                    urgencyLevel: item.urgencyLevel || 'low',
                    pingCount: item.pingCount || 0,
                    updatedAt: new Date(item.updatedAt).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')
                }));
                setComplaints(formattedComplaints);
                
                // Keep selectedTicket synchronized if it's currently being viewed in modal
                if (selectedTicket) {
                    const refreshedTicket = formattedComplaints.find(c => c.originalId === selectedTicket.originalId);
                    if (refreshedTicket) {
                        setSelectedTicket(refreshedTicket);
                    }
                }
            } else {
                const errJson = await complaintsRes.json().catch(() => ({}));
                setComplaints([{ id: 'ERR-API', topic: `API Error: ${complaintsRes.status} - ${errJson.message || 'Unknown'}`, status: 'unassigned' }]);
            }

            if (techsRes.ok) {
                const techsData = await techsRes.json();
                const techList = Array.isArray(techsData.data) ? techsData.data : (Array.isArray(techsData) ? techsData : []);
                setTechnicians(techList);
            }
        } catch (error) {
            console.error("Gagal menarik data pengaduan:", error);
            setComplaints([{ id: 'ERR-JS', topic: `JS Exception: ${error.message}`, status: 'unassigned' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        const doc = new jsPDF('portrait');
        
        // Header PDF
        doc.setFontSize(18);
        doc.setTextColor(5, 155, 39); // Admin Teal #059b27
        doc.text(t('export.admin_report_title', 'BIEON - Laporan Pengaduan Pelanggan'), 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`${t('export.printed_at', 'Dicetak pada')}: ${new Date().toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US')}`, 14, 30);

        const tableColumn = [
            t('complaint.detail_box.ticket_id', "ID Tiket"), 
            t('complaint.detail_box.date_in', "Tanggal"), 
            t('complaint.detail_box.customer_info', "Customer"), 
            t('complaint.detail_box.desc', "Topik Kendala"), 
            t('complaint.detail_box.technician_info', "Teknisi"), 
            t('table.all_status', "Status").replace('Semua ', '').replace('All ', '') // Just simple 'Status'
        ];
        const tableRows = [];

        // Isi Data dari State processedData (data yang sedang terfilter)
        processedData.forEach(ticket => {
            const ticketData = [
                ticket.id,
                ticket.date,
                ticket.customer,
                ticket.topic,
                ticket.technician,
                formatStatusDisplay(ticket.status, 'admin').toUpperCase()
            ];
            tableRows.push(ticketData);
        });

        // Generate Tabel
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [5, 155, 39], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2 },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Download
        doc.save(`BIEON_Laporan_Admin_${new Date().getTime()}.pdf`);
    };

    // Helper to calculate duration for PDF
    const calculateDuration = (start, end) => {
        if (!start || !end) return '-';
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate - startDate;
        if (diffMs < 0) return '0 Menit';
        
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        const remainingHours = diffHours % 24;
        const remainingMins = diffMins % 60;
        
        let result = '';
        if (diffDays > 0) result += `${diffDays} Hari `;
        if (remainingHours > 0) result += `${remainingHours} Jam `;
        if (remainingMins > 0 || result === '') result += `${remainingMins} Menit`;
        
        return result.trim();
    };

    // Helper Parser: Map string database log progres ke i18n
    const getLocalizedTimelineDesc = (textStr) => {
        if (!textStr) return '';
        let cleaned = textStr.replace(/\s*\(Respons:.*?, Poin:.*?\)/gi, '').replace(/\s*\(Durasi:.*?, Poin:.*?\)/gi, '').trim();
        
        // Cek pola kalimat ID dari database
        if (cleaned.includes('Laporan pengaduan berhasil dibuat')) {
            return t('complaint.timeline_events.created', 'Laporan pengaduan berhasil dibuat. Menunggu penugasan teknisi.');
        }
        if (cleaned.includes('Tiket dialihkan dari')) {
            const match = cleaned.match(/dari\s+(.*?)\s+ke\s+(.*?)\s+karena/i);
            const oldTech = match ? match[1].trim() : '-';
            const newTech = match ? match[2].trim() : '-';
            return t('complaint.timeline_events.reassigned_from_to', 'Tiket dialihkan dari {{oldTech}} ke {{newTech}} karena melewati batas waktu.', { oldTech, newTech });
        }
        if (cleaned.includes('Tiket telah ditugaskan ke teknisi')) {
            const match = cleaned.match(/teknisi:\s*(.*?)\.\s*Menunggu/i);
            const techName = match ? match[1].trim() : cleaned.replace('Tiket telah ditugaskan ke teknisi:', '').split('.')[0].trim();
            return t('complaint.timeline_events.assigned', 'Tiket telah ditugaskan ke teknisi: {{tech}}. Menunggu respon teknisi.', { tech: techName });
        }
        if (cleaned.includes('Teknisi mulai memproses pengaduan')) {
            return t('complaint.timeline_events.process_started', 'Teknisi mulai memproses pengaduan.');
        }
        
        // Progress options from Technician dropdown
        if (cleaned.startsWith('Sedang Menuju Lokasi')) {
            const notes = cleaned.replace('Sedang Menuju Lokasi', '').trim();
            return t('complaint.timeline_events.prog_heading_location', 'Sedang Menuju Lokasi{{notes}}', { notes: notes ? ` ${notes}` : '' });
        }
        if (cleaned.startsWith('Mendiagnosa Masalah')) {
            const notes = cleaned.replace('Mendiagnosa Masalah', '').trim();
            return t('complaint.timeline_events.prog_diagnosing', 'Mendiagnosa Masalah{{notes}}', { notes: notes ? ` ${notes}` : '' });
        }
        if (cleaned.startsWith('Menunggu Suku Cadang')) {
            const notes = cleaned.replace('Menunggu Suku Cadang', '').trim();
            return t('complaint.timeline_events.prog_waiting_parts', 'Menunggu Suku Cadang{{notes}}', { notes: notes ? ` ${notes}` : '' });
        }
        if (cleaned.startsWith('Proses Perbaikan')) {
            const notes = cleaned.replace('Proses Perbaikan', '').trim();
            return t('complaint.timeline_events.prog_repairing', 'Proses Perbaikan{{notes}}', { notes: notes ? ` ${notes}` : '' });
        }
        
        // Log Access
        if (cleaned.includes('Teknisi meminta akses data log')) {
            const reasonMatch = cleaned.match(/Alasan:\s*(.*)/i);
            const reason = reasonMatch ? reasonMatch[1].trim() : '';
            return t('complaint.timeline_events.log_requested', 'Teknisi meminta akses data log perangkat.{{reason}}', { reason: reason ? ` Alasan: ${reason}` : '' });
        }
        if (cleaned.includes('SuperAdmin memberikan izin akses data log')) {
            return t('complaint.timeline_events.log_approved', 'SuperAdmin memberikan izin akses data log perangkat.');
        }
        if (cleaned.includes('SuperAdmin menolak akses data log')) {
            return t('complaint.timeline_events.log_rejected', 'SuperAdmin menolak akses data log perangkat.');
        }
        
        // PING
        if (cleaned.includes('SuperAdmin mengirimkan PING')) {
            const matchCount = cleaned.match(/Teguran ke-(\d+)/i);
            const count = matchCount ? matchCount[1] : '1';
            const matchUrg = cleaned.match(/menjadi:\s*(.*)/i);
            const urgency = matchUrg ? matchUrg[1].replace(/\.$/, '').trim() : 'MEDIUM';
            return t('complaint.timeline_events.ping_sent', 'SuperAdmin mengirimkan PING (Teguran ke-{{count}}). Urgensi ditingkatkan menjadi: {{urgency}}.', { count, urgency });
        }
        
        // Completing & Rejection
        if (cleaned.includes('Teknisi menyatakan perbaikan selesai')) {
            return t('complaint.timeline_events.tech_completed', 'Teknisi menyatakan perbaikan selesai.');
        }
        if (cleaned.includes('Homeowner telah mengonfirmasi tiket selesai')) {
            const ratingMatch = cleaned.match(/\(Rating:\s*(.*?)\)/i);
            const rating = ratingMatch ? ratingMatch[0] : '';
            return t('complaint.timeline_events.homeowner_confirmed', 'Homeowner telah mengonfirmasi tiket selesai{{rating}}.', { rating: rating ? ` ${rating}` : '' });
        }
        if (cleaned.includes('Tiket ditolak oleh SuperAdmin')) {
            return t('complaint.timeline_events.rejected', 'Tiket ditolak oleh SuperAdmin.');
        }
        if (cleaned.includes('Menunggu konfirmasi')) {
            return t('complaint.timeline_events.awaiting_confirmation', 'Menunggu konfirmasi pelanggan.');
        }
        if (cleaned.includes('Teknisi menuju lokasi')) {
            return t('complaint.timeline_events.prog_heading_location', 'Teknisi sedang menuju lokasi.');
        }
        
        // Overdues
        if (cleaned.includes('Batas waktu respon terlampaui')) {
            return t('complaint.timeline_events.response_overdue', 'Batas waktu respon terlampaui (30 menit). Status otomatis berubah menjadi Overdue Respons.');
        }
        if (cleaned.includes('Batas waktu perbaikan terlampaui')) {
            return t('complaint.timeline_events.repair_overdue', 'Batas waktu perbaikan terlampaui (56 jam). Status otomatis berubah menjadi Overdue Perbaikan.');
        }
        
        // Fallback status/note matching
        if (cleaned.startsWith('Status diperbarui menjadi')) {
            const statusStr = cleaned.replace('Status diperbarui menjadi', '').replace(/\.$/, '').trim();
            return t('complaint.timeline_events.status_updated_to', 'Status diperbarui menjadi {{status}}.', { status: statusStr });
        }

        return cleaned;
    };

    const handleExportSingleDetailPDF = (ticket) => {
        if (!ticket) return;
        const doc = new jsPDF('portrait');
        const primaryColor = [5, 155, 39]; // Admin Teal #059b27
        
        // Header & Logo Branding
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text(t('export.header_title', 'LAPORAN DETAIL PENGADUAN'), 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`${t('complaint.detail_box.ticket_id', 'ID Tiket').toUpperCase()}: ${ticket.id.replace('+P', '')}`, 105, 30, { align: 'center' });

        // Section 1: Informasi Dasar
        doc.setTextColor(40);
        doc.setFontSize(14);
        doc.text(t('export.section_info', 'INFORMASI PENGADUAN'), 14, 55);
        doc.setLineWidth(0.5);
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.line(14, 58, 65, 58);

        doc.setFontSize(10);
        const infoData = [
            [t('export.row_technician', 'Teknisi'), `: ${ticket.technician} (${ticket.technicianInfo?.phone || '-'})`],
            [t('export.row_tech_rating', 'Rating Teknisi'), `: ${ticket.rating !== '-' ? ticket.rating + '/5' : t('export.val_not_rated', 'Belum dinilai')}`],
            [t('export.row_customer_name', 'Nama Pelanggan'), `: ${ticket.customer}`],
            [t('export.row_address', 'Alamat'), `: ${ticket.location}`],
            [t('export.row_topic', 'Topik Kendala'), `: ${ticket.topic || '-'}`],
            [t('export.row_category', 'Kategori'), `: ${ticket.category || 'Umum'}`],
            [t('export.row_desc', 'Deskripsi Masalah'), `: ${ticket.description || '-'}`],
            [t('export.row_photos', 'Lampiran Foto'), `: ${ticket.photos && ticket.photos.length > 0 ? t('export.val_photos_count', '{{count}} Foto (Tersedia di Dashboard)', { count: ticket.photos.length }) : t('export.val_no_photos', 'Tidak ada foto')}`],
            [t('export.row_created_at', 'Waktu Dibuat'), `: ${new Date(ticket.createdAt).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`],
            [t('export.row_completed_at', 'Waktu Selesai'), `: ${ticket.completedAt ? new Date(ticket.completedAt).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}`],
            [t('export.row_duration', 'Durasi Pengerjaan'), `: ${ticket.duration || '-'}`]
        ];

        autoTable(doc, {
            startY: 65,
            body: infoData,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', width: 40 }, 1: { cellWidth: 'auto' } },
            margin: { bottom: 25 }
        });

        // Section 2: SLA Performance Metrics
        let currentY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text(t('export.section_sla', 'SLA PERFORMANCE & POINTS'), 14, currentY);
        doc.line(14, currentY + 3, 75, currentY + 3);

        const timeline = ticket.timeline || [];
        
        // Use pre-calculated durations from ticket if available
        const responseTime = ticket.responseDuration && ticket.responseDuration !== '00:00:00' 
            ? ticket.responseDuration 
            : '-';
        const repairTime = ticket.repairDuration && ticket.repairDuration !== '00:00:00' 
            ? ticket.repairDuration 
            : '-';

        const resPts = ticket.technicianInfo?.responsePoints || ticket.responsePoints || 0;
        const repPts = ticket.technicianInfo?.repairPoints || ticket.repairPoints || 0;
        const totalPts = resPts + repPts;

        let overallStatus = t('export.perf_needs_improvement', 'NEEDS IMPROVEMENT');
        if (totalPts >= 100) overallStatus = t('export.perf_excellent', 'EXCELLENT');
        else if (totalPts >= 50) overallStatus = t('export.perf_good', 'GOOD');

        const statusOntime = t('export.status_ontime', 'SESUAI SLA');
        const statusOverdue = t('export.status_overdue', 'OVERDUE');

        const slaData = [
            [t('export.sla_response', 'Respon Teknisi'), '15 Menit', responseTime, (responseTime !== '-' && (responseTime.includes('Hari') || parseInt(responseTime.split(':')[0]) > 0 || parseInt(responseTime.split(':')[1]) > 15)) ? statusOverdue : statusOntime, `${resPts} Pts`],
            [t('export.sla_repair', 'Perbaikan Unit'), '48 Jam', repairTime, (repairTime !== '-' && (repairTime.includes('Hari') || parseInt(repairTime.split(':')[0]) >= 48)) ? statusOverdue : statusOntime, `${repPts} Pts`]
        ];

        autoTable(doc, {
            startY: currentY + 8,
            head: [[t('export.col_sla_aspect', 'Aspek SLA'), t('export.col_target', 'Target'), t('export.col_achieved', 'Capaian'), t('export.col_status', 'Status'), t('export.col_points', 'Poin')]],
            body: slaData,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
            columnStyles: { 3: { fontStyle: 'bold' }, 4: { fontStyle: 'bold', halign: 'center' } },
            margin: { bottom: 25 },
            didParseCell: (data) => {
                if (data.column.index === 3 && data.cell.section === 'body') {
                    if (data.cell.text[0] === statusOverdue) data.cell.styles.textColor = [220, 38, 38];
                    if (data.cell.text[0] === statusOntime) data.cell.styles.textColor = [16, 185, 129];
                }
            }
        });

        // Section Summary
        currentY = doc.lastAutoTable.finalY + 4;
        doc.setFillColor(242, 248, 245);
        doc.rect(14, currentY, 182, 12, 'F');
        doc.setFontSize(10);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(t('export.overall_perf', 'OVERALL PERFORMANCE: {{points}} POINTS - {{status}}', { points: totalPts, status: overallStatus }), 105, currentY + 8, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40);

        // Section 3: Riwayat Progres
        currentY = currentY + 28;
        doc.setFontSize(14);
        doc.text(t('export.section_timeline', 'RIWAYAT PROGRES PENGADUAN'), 14, currentY);
        doc.line(14, currentY + 3, 85, currentY + 3);

        const timelineData = timeline.length > 0 ? timeline.map(tItem => [
            tItem.time ? new Date(tItem.time).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
            t('complaint.status.' + (tItem.status || 'BARU').toLowerCase(), formatStatusDisplay(tItem.status, 'admin')).toUpperCase(),
            getLocalizedTimelineDesc(tItem.desc || tItem.note || tItem.notes || '-')
        ]) : [['-', t('export.val_no_data_progress', 'TIDAK ADA DATA PROGRES'), '-']];

        autoTable(doc, {
            startY: currentY + 8,
            head: [[t('export.col_date_time', 'Tanggal & Waktu'), t('export.col_activity', 'Aktivitas'), t('export.col_notes', 'Catatan/Keterangan')]],
            body: timelineData,
            theme: 'striped',
            styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
            headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
            columnStyles: { 
                0: { cellWidth: 45, halign: 'left' }, 
                1: { cellWidth: 35, fontStyle: 'bold', halign: 'left' },
                2: { cellWidth: 'auto', halign: 'left' }
            },
            margin: { bottom: 25 }
        });

        // Footer & Page Numbers
        const pageCount = doc.internal.getNumberOfPages();
        const footerNote = t('export.auto_generated_note', 'Dokumen ini dihasilkan secara otomatis oleh Sistem Monitoring BIEON Smart Green Living.');
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Separator Line
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.2);
            doc.line(14, 282, 196, 282);

            doc.setFontSize(7);
            doc.setTextColor(180);
            doc.text(footerNote, 105, 287, { align: 'center' });
            doc.text(t('export.page_indicator', 'Halaman {{current}} dari {{total}}', { current: i, total: pageCount }), 105, 292, { align: 'center' });
        }

        doc.save(`BIEON_SA_Detail_${ticket.id.replace('+P', '')}.pdf`);
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    useEffect(() => {
        if (location.state?.openComplaintId && complaints.length > 0) {
            const ticketToOpen = complaints.find(c => c.originalId === location.state.openComplaintId);
            if (ticketToOpen) {
                setSelectedTicket(ticketToOpen);
                setIsDetailModalOpen(true);
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [location.state, complaints, navigate, location.pathname]);

    const statsMetrics = useMemo(() => {
        const active = complaints.filter(c => !['selesai', 'ditolak'].includes(c.status?.toLowerCase())).length;
        const overdue = complaints.filter(c => ['overdue respons', 'overdue perbaikan'].includes(c.status?.toLowerCase())).length;
        const finished = complaints.filter(c => c.status?.toLowerCase() === 'selesai').length;
        
        // Calculate {t('complaint.admin_dashboard.global_csat', 'Global CSAT')} from tickets with rating
        const ratedTickets = complaints.filter(c => c.status?.toLowerCase() === 'selesai' && typeof c.rating === 'number');
        const avg = ratedTickets.length > 0 
            ? (ratedTickets.reduce((acc, curr) => acc + curr.rating, 0) / ratedTickets.length).toFixed(1)
            : '0.0';

        return { active, overdue, finished, avg };
    }, [complaints]);

    const stats = [
        { label: t('complaint.admin_dashboard.total_active', 'Total Tiket Aktif (BIEON)'), value: statsMetrics.active, trend: t('complaint.admin_dashboard.total_active_desc', 'Tiket sedang berjalan'), color: 'blue', icon: Activity },
        { label: t('complaint.admin_dashboard.total_overdue', 'Tiket Overdue (Batas SLA)'), value: statsMetrics.overdue, trend: statsMetrics.overdue > 0 ? t('complaint.admin_dashboard.total_overdue_desc', 'Perlu tindakan segera') : 'Sesuai target SLA', color: 'red', icon: AlertCircle },
        { label: t('complaint.admin_dashboard.total_resolved', 'Total Diselesaikan'), value: statsMetrics.finished, trend: t('complaint.admin_dashboard.total_resolved_desc', 'Tiket status selesai'), color: 'emerald', icon: CheckCircle2 },
        { label: t('complaint.admin_dashboard.global_csat', 'Global CSAT'), value: statsMetrics.avg, trend: t('complaint.admin_dashboard.global_csat_desc', 'Rata-rata kepuasan'), color: 'amber', icon: Star, isRating: true }
    ];

    const processedData = useMemo(() => {
        // Secara default, sembunyikan yang sudah 'selesai' atau 'ditolak' dari tabel dashboard utama
        // agar "pindah" ke Riwayat. Namun, jika user sedang mencari (searchQuery) 
        // atau memfilter status secara eksplisit, maka tampilkan.
        let filtered = complaints.filter(c => {
            const s = c.status?.toLowerCase();
            const isFinished = ['selesai', 'ditolak', 'batal', 'cancelled'].includes(s);
            
            // Jika ada filter status aktif, biarkan filter status yang bekerja
            if (selectedStatusFilter) return true;
            
            // Jika ada pencarian, biarkan pencarian yang bekerja (mungkin user cari tiket lama)
            if (searchQuery) return true;

            // Default: sembunyikan yang sudah selesai dari dashboard utama
            return !isFinished;
        });
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.id?.toLowerCase().includes(q) ||
                item.customer?.toLowerCase().includes(q) ||
                item.topic?.toLowerCase().includes(q) ||
                item.device?.toLowerCase().includes(q) ||
                item.technician?.toLowerCase().includes(q) ||
                (item.clientInfo?.idBieon && item.clientInfo.idBieon.toLowerCase().includes(q))
            );
        }
        if (selectedStatusFilter) {
            filtered = filtered.filter(item => {
                const s = item.status?.toLowerCase();
                if (selectedStatusFilter === 'unassigned') {
                    return s === 'unassigned' || s === 'baru';
                }
                
                if (selectedStatusFilter === 'Overdue Respons') {
                    return s === 'overdue respons';
                }

                if (selectedStatusFilter === 'Overdue Perbaikan') {
                    return s === 'overdue perbaikan';
                }

                // Default matching
                return s === selectedStatusFilter.toLowerCase();
            });
        }
        if (selectedCategoryFilter) {
            filtered = filtered.filter(item => {
                const cat = (item.category || 'Lainnya').toLowerCase();
                return cat === selectedCategoryFilter.toLowerCase();
            });
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'rating') {
                    aVal = aVal === '-' ? -1 : parseFloat(aVal);
                    bVal = bVal === '-' ? -1 : parseFloat(bVal);
                } else if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [complaints, searchQuery, selectedStatusFilter, sortConfig]);

    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = processedData.slice(startIndex, startIndex + rowsPerPage);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-gray-400" /> : <ArrowDown className="w-3.5 h-3.5 text-gray-400" />;
    };

    const getStatusStyle = (status) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'baru':
            case 'unassigned': return 'bg-gray-100 text-gray-500 border-gray-100';
            case 'menunggu respons': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'overdue respons': return 'bg-amber-50 text-red-600 border-amber-200 font-bold';
            case 'diproses': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'overdue perbaikan': return 'bg-blue-50 text-red-600 border-blue-200 font-bold';
            case 'menunggu konfirmasi pelanggan': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'selesai': return 'bg-bieon-eco/10 text-bieon-eco border-bieon-eco/20';
            case 'ditolak': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const getStatusDotColor = (status) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'unassigned':
            case 'baru': return 'bg-gray-400';
            case 'menunggu respons': return 'bg-amber-400';
            case 'overdue respons': return 'bg-red-500';
            case 'diproses': return 'bg-blue-500';
            case 'overdue perbaikan': return 'bg-red-500';
            case 'menunggu konfirmasi pelanggan': return 'bg-indigo-500';
            case 'selesai': return 'bg-bieon-eco';
            case 'ditolak': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    const getStatusBadge = (status, sla) => {
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${getStatusStyle(status)} border whitespace-nowrap`}>
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(status?.toLowerCase())}`}></span>
                {status}
                {sla && status !== 'Selesai' && (
                    <span className="font-normal opacity-90 ml-0.5">({sla})</span>
                )}
            </span>
        );
    };

    const handleDetail = (ticket) => {
        setSelectedTicket(ticket);
        setIsDetailModalOpen(true);
    };

    const handleAssign = (ticket) => {
        setSelectedTicket(ticket);
        setIsAssignModalOpen(true);
    };

    const handlePing = (ticket) => {
        setSelectedTicket(ticket);
        setIsPingModalOpen(true);
    };

    const handleReject = async (ticket) => {
        if (!window.confirm(t('complaint.confirm_reject', 'Apakah Anda yakin ingin menolak tiket {{id}}?', { id: ticket.id }))) return;
        
        try {
            const response = await fetch(`/api/complaints/${ticket.originalId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    status: 'ditolak',
                    note: 'Tiket ditolak oleh SuperAdmin.'
                })
            });

            if (response.ok) {
                fetchData();
            } else {
                alert(t('complaint.fail_reject', "Gagal menolak tiket."));
            }
        } catch (error) {
            console.error("Error rejecting ticket:", error);
        }
    };

    const confirmAssign = async () => {
        if (!selectedTechnicianId) return;

        try {
            const response = await fetch(`/api/complaints/${selectedTicket.originalId}/assign`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ technicianId: selectedTechnicianId })
            });

            if (response.ok) {
                setIsAssignModalOpen(false);
                setSelectedTechnicianId('');
                fetchData();
            } else {
                const err = await response.json();
                alert(`${t('complaint.alert_assign_failed', 'Gagal menugaskan teknisi')}: ${err.message}`);
            }
        } catch (error) {
            alert(`${t('complaint.alert_server_error', 'Terjadi kesalahan server')}: ${error.message}`);
        }
    };

    const confirmPing = async () => {
        try {
            const response = await fetch(`/api/complaints/${selectedTicket.originalId}/ping`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const resData = await response.json();
                alert(t('complaint.ping_success', 'Ping Berhasil! Urgensi tiket kini menjadi: {{level}}', { level: resData.urgencyLevel.toUpperCase() }));
                setIsPingModalOpen(false);
                setSelectedPingType('');
                fetchData();
            } else {
                alert(t('complaint.ping_fail', "Gagal mengirimkan PING."));
            }
        } catch (error) {
            console.error("Error sending ping:", error);
        }
    };

    const handleLogAction = async (ticketId, isApproved) => {
        try {
            const newStatus = isApproved ? 'granted' : 'rejected';
            
            // API Call
            const ticket = complaints.find(c => c.id === ticketId);
            const response = await fetch(`/api/complaints/${ticket.originalId}/grant-log`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ isApproved })
            });

            if (!response.ok) throw new Error(t('complaint.err_log_access_server', 'Gagal memproses akses log di server'));

            // Update local state for optimistic UI
            setComplaints(prev => prev.map(c => {
                if (c.id === ticketId) {
                    return {
                        ...c,
                        logRequestStatus: newStatus,
                        logConfirmed: true,
                        logApproved: isApproved
                    };
                }
                return c;
            }));

            if (selectedTicket && selectedTicket.id === ticketId) {
                setSelectedTicket(prev => ({
                    ...prev,
                    logRequestStatus: newStatus,
                    logConfirmed: true,
                    logApproved: isApproved
                }));
            }
        } catch (error) {
            alert(error.message);
        }
    };


    return (
        <SuperAdminLayout activeMenu="Pengaduan" onNavigate={onNavigate} title="Manajemen Pengaduan">
            <style>
                {`
                .custom-scrollbar-x::-webkit-scrollbar { height: 10px; }
                .custom-scrollbar-x::-webkit-scrollbar-track { background: #f8fafc; border-radius: 4px; }
                .custom-scrollbar-x::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar-x::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .custom-scrollbar-x::-webkit-scrollbar-button:single-button { background-color: #f1f5f9; display: block; border-radius: 4px; width: 16px; }
                .custom-scrollbar-x::-webkit-scrollbar-button:single-button:horizontal:decrement { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' fill='%2364748b'%3E%3Cpolygon points='8,2 2,5 8,8'/%3E%3C/svg%3E"); background-size: 8px; background-position: center; background-repeat: no-repeat; }
                .custom-scrollbar-x::-webkit-scrollbar-button:single-button:horizontal:decrement:hover { background-color: #e2e8f0; }
                .custom-scrollbar-x::-webkit-scrollbar-button:single-button:horizontal:increment { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' fill='%2364748b'%3E%3Cpolygon points='2,2 8,5 2,8'/%3E%3C/svg%3E"); background-size: 8px; background-position: center; background-repeat: no-repeat; }
                .custom-scrollbar-x::-webkit-scrollbar-button:single-button:horizontal:increment:hover { background-color: #e2e8f0; }
                
                @keyframes pulse-red {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(0.98); background-color: #fee2e2; }
                }
                .animate-pulse-red {
                    animation: pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                `}
            </style>
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Active Tickets */}
                    <div className="bg-gradient-to-br from-white via-sky-50/50 to-sky-100/80 border border-sky-100 shadow-sm rounded-[1.5rem] p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 w-28 h-28 text-sky-500/[0.1] pointer-events-none translate-x-4 translate-y-4 transition-transform duration-700 group-hover:scale-110 z-0">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
                                <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                            </svg>
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 bg-white text-sky-500 rounded-xl flex items-center justify-center shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
                                <Activity className="w-6 h-6 group-hover:rotate-6 transition-transform" />
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-slate-800 leading-none">{statsMetrics.active}</span>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('complaint.admin_dashboard.total_active', 'Total Tiket Aktif (BIEON)')}</p>
                            </div>
                        </div>
                        <div className="relative z-10 mt-auto">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border bg-sky-50 text-sky-600 border-sky-100">
                                {t('complaint.admin_dashboard.total_active_desc', 'Tiket sedang berjalan')}
                            </div>
                        </div>
                    </div>

                    {/* Overdue Tickets */}
                    <div className="bg-gradient-to-br from-white via-rose-50/50 to-rose-100/80 border border-rose-100 shadow-sm rounded-[1.5rem] p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 w-28 h-28 text-rose-500/[0.1] pointer-events-none translate-x-4 translate-y-4 transition-transform duration-700 group-hover:scale-110 z-0">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M50 10 L90 50 L50 90 L10 50 Z" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M50 25 L75 50 L50 75 L25 50 Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                            </svg>
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 bg-white text-rose-500 rounded-xl flex items-center justify-center shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
                                <AlertCircle className="w-6 h-6 group-hover:-rotate-6 transition-transform" />
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-slate-800 leading-none">{statsMetrics.overdue}</span>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('complaint.admin_dashboard.total_overdue', 'Tiket Overdue (Batas SLA)')}</p>
                            </div>
                        </div>
                        <div className="relative z-10 mt-auto">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border bg-rose-50 text-rose-600 border-rose-100">
                                {statsMetrics.overdue > 0 ? t('complaint.admin_dashboard.total_overdue_desc', 'Perlu tindakan segera') : 'Sesuai target SLA'}
                            </div>
                        </div>
                    </div>

                    {/* Finished Tickets */}
                    <div className="bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/80 border border-emerald-100 shadow-sm rounded-[1.5rem] p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 w-28 h-28 text-bieon-eco/[0.1] pointer-events-none translate-x-4 translate-y-4 transition-transform duration-700 group-hover:scale-110 z-0">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="20" y="20" width="60" height="60" rx="10" stroke="currentColor" strokeWidth="2" fill="none" transform="rotate(15 50 50)" />
                                <rect x="30" y="30" width="40" height="40" rx="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" transform="rotate(30 50 50)" />
                            </svg>
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 bg-white text-bieon-eco rounded-xl flex items-center justify-center shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
                                <CheckCircle2 className="w-6 h-6 group-hover:rotate-6 transition-transform" />
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-slate-800 leading-none">{statsMetrics.finished}</span>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('complaint.admin_dashboard.total_resolved', 'Total Diselesaikan')}</p>
                            </div>
                        </div>
                        <div className="relative z-10 mt-auto">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border bg-emerald-50 text-bieon-eco border-emerald-100">
                                {t('complaint.admin_dashboard.total_resolved_desc', 'Tiket status selesai')}
                            </div>
                        </div>
                    </div>

                    {/* Global CSAT */}
                    <div className="bg-gradient-to-br from-white via-amber-50/50 to-amber-100/80 border border-amber-100 shadow-sm rounded-[1.5rem] p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 w-28 h-28 text-amber-500/[0.1] pointer-events-none translate-x-4 translate-y-4 transition-transform duration-700 group-hover:scale-110 z-0">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M50 15 L61 38 L85 41 L67 58 L72 82 L50 70 L28 82 L33 58 L15 41 L39 38 Z" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 bg-white text-amber-500 rounded-xl flex items-center justify-center shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
                                <Star className="w-6 h-6 fill-amber-400 group-hover:rotate-6 transition-transform" />
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <h3 className="text-3xl font-bold text-slate-800 leading-none flex items-baseline gap-1">
                                    {statsMetrics.avg}
                                    <Star className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                                </h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('complaint.admin_dashboard.global_csat', 'Global CSAT')}</p>
                            </div>
                        </div>
                        <div className="relative z-10 mt-auto">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-600 border-amber-100">
                                {t('complaint.admin_dashboard.global_csat_desc', 'Rata-rata kepuasan')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-5 md:p-8 border-b border-gray-50">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">{t('complaint.admin_dashboard.header_title', 'Daftar Pengaduan Masuk')}</h2>
                                <p className="text-xs text-gray-500 mt-1 italic leading-relaxed">{t('complaint.admin_dashboard.header_desc', 'Pantau status laporan serta penugasan teknisi BIEON Smart Monitoring secara real-time.')}</p>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 group min-w-0">
                                    <Search className="w-4 h-4 md:w-4 md:h-4 absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bieon-eco transition-colors" />
                                    <input
                                        type="text"
                                        placeholder={t('table.search_placeholder', 'Cari tiket...')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 md:pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-800 placeholder:font-medium placeholder:text-gray-400 focus:outline-none focus:border-bieon-eco focus:bg-white focus:ring-4 focus:ring-bieon-eco/10 transition-all truncate"
                                    />
                                </div>

                                <div className="relative shrink-0">
                                    <button
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        className={`flex items-center justify-center gap-2 px-3.5 md:px-5 py-3.5 bg-white border rounded-2xl text-sm font-medium transition-all shadow-sm ${showStatusDropdown ? 'border-bieon-eco ring-4 ring-bieon-eco/10' : 'border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <Filter className="w-4 h-4 text-gray-400" />
                                        <span className="hidden md:block">{selectedStatusFilter ? formatStatusDisplay(selectedStatusFilter, 'admin') : t('table.all_status', 'Semua Status')}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 hidden md:block transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />

                                        {selectedStatusFilter && (
                                            <span className="md:hidden absolute top-2.5 right-2 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
                                        )}
                                    </button>

                                    {showStatusDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)}></div>
                                            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-[1.5rem] shadow-xl py-2 z-20">
                                                {['', 'unassigned', 'Menunggu Respons', 'Diproses', 'Menunggu Konfirmasi Pelanggan', 'Selesai', 'Overdue Respons', 'Overdue Perbaikan', 'Ditolak'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => { setSelectedStatusFilter(s); setShowStatusDropdown(false); setCurrentPage(1); }}
                                                        className={`w-full text-left px-5 py-2.5 text-xs font-bold transition-colors ${selectedStatusFilter === s ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-400 hover:bg-gray-50'}`}
                                                    >
                                                        {s ? formatStatusDisplay(s, 'admin') : t('table.all_status', 'Semua Status')}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="relative shrink-0">
                                    <button
                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                        className={`flex items-center justify-center gap-2 px-3.5 md:px-5 py-3.5 bg-white border rounded-2xl text-sm font-medium transition-all shadow-sm ${showCategoryDropdown ? 'border-bieon-eco ring-4 ring-bieon-eco/10' : 'border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <Activity className="w-4 h-4 text-gray-400" />
                                        <span className="hidden md:block">{selectedCategoryFilter ? t(`complaint.category_${selectedCategoryFilter.toLowerCase().replace(/\s+/g, '_')}`, selectedCategoryFilter) : t('history.all_categories', 'Semua Kategori')}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 hidden md:block transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />

                                        {selectedCategoryFilter && (
                                            <span className="md:hidden absolute top-2.5 right-2 w-2 h-2 bg-gradient-to-r from-bieon-eco to-bieon-sense rounded-full border border-white"></span>
                                        )}
                                    </button>

                                    {showCategoryDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)}></div>
                                            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-[1.5rem] shadow-xl py-2 z-20">
                                                {['', 'Sensor', 'Control Actuator System', 'Lainnya'].map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => { setSelectedCategoryFilter(cat); setShowCategoryDropdown(false); setCurrentPage(1); }}
                                                        className={`w-full text-left px-5 py-2.5 text-xs font-bold transition-colors ${selectedCategoryFilter === cat ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-400 hover:bg-gray-50'}`}
                                                    >
                                                        {cat ? t(`complaint.category_${cat.toLowerCase().replace(/\s+/g, '_')}`, cat) : t('history.all_categories', 'Semua Kategori')}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={handleExport}
                                    className="flex items-center justify-center gap-2 px-3.5 md:px-6 py-3.5 bg-slate-800 text-white rounded-2xl text-sm font-bold hover:bg-slate-700 transition-all shadow-md shrink-0 group relative"
                                >
                                    <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                                    <span className="hidden md:block">{t('table.export', 'Ekspor')}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar-x pb-2 min-h-[400px]">
                        <table className="w-full text-left min-w-[1000px] table-auto">
                             <thead className="bg-gradient-to-r from-emerald-50/80 to-sky-50/80 border-b border-emerald-100/60 text-slate-600 select-none">
                                <tr>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('id')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">{t('complaint.table_col.ticket_id', 'ID Tiket')} {getSortIcon('id')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('date')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">{t('complaint.table_col.date', 'Tanggal')} {getSortIcon('date')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('customer')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">{t('complaint.table_col.customer', 'Pelanggan')} {getSortIcon('customer')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal whitespace-nowrap outline-none">
                                        <div className="uppercase tracking-wider text-[11px] font-bold">{t('complaint.table_col.topic', 'Topik Kendala')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('category')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">{t('complaint.detail_box.category', 'Kategori')} {getSortIcon('category')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('technician')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">{t('complaint.table_col.technician', 'Teknisi')} {getSortIcon('technician')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors text-center outline-none" onClick={() => requestSort('rating')}>
                                        <div className="flex items-center justify-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">{t('complaint.table_col.rating', 'Rating')} {getSortIcon('rating')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('status')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">{t('complaint.table_col.status', 'Status')} {getSortIcon('status')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal whitespace-nowrap text-left text-[11px] font-bold uppercase tracking-wider">{t('complaint.table_col.action', 'Aksi')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="w-10 h-10 border-4 border-gray-100 border-t-bieon-eco rounded-full animate-spin"></div>
                                                <p className="text-sm font-bold text-gray-500 animate-pulse">{t('complaint.loading_db', 'Menarik Data dari Database...')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <AdminComplaintRow 
                                            key={item.id} 
                                            item={item} 
                                            getStatusBadge={getStatusBadge}
                                            handleDetail={handleDetail}
                                            handleAssign={handleAssign}
                                            handlePing={handlePing}
                                            handleReject={handleReject}
                                            handleTransfer={handleAssign}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Activity className="w-12 h-12 text-gray-100" />
                                                <div className="space-y-1">
                                                    <p className="text-lg font-bold text-gray-900">{t('complaint.no_complaints_found', 'Tidak ada pengaduan ditemukan')}</p>
                                                    <p className="text-sm font-semibold text-gray-400">{t('complaint.no_complaints_desc', 'Belum ada pengaduan di database server.')}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="bg-gray-50/50 px-5 md:px-8 py-4 md:py-6 border-t border-gray-100 flex flex-row items-center justify-between gap-2">
                        {/* Rows per page - Left: hanya kotak di HP, + label di desktop */}
                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">{t('table.rows_per_page', 'Baris per halaman:')}</span>
                            <div className="relative">
                                <button onClick={() => setShowRowsDropdown(!showRowsDropdown)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-100 rounded-xl text-[10px] md:text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all min-w-[50px] md:min-w-[70px] justify-between">
                                    {rowsPerPage} <ChevronDown className={`w-3 h-3 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showRowsDropdown && (
                                    <div className="absolute bottom-full left-0 mb-2 w-20 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-bottom-2">
                                    {[5, 10, 30, 50].map(val => (
                                            <button key={val} onClick={() => { setRowsPerPage(val); setShowRowsDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${rowsPerPage === val ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-500 hover:bg-gray-50'}`}>{val}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Page Info - Center: selalu tampil "X-Y of Z", "items" disembunyikan di HP */}
                        <div className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-center whitespace-nowrap">
                            {t('table.pagination_info', '{{start}}-{{end}} dari {{total}} item', { start: startIndex + 1, end: Math.min(startIndex + rowsPerPage, totalItems), total: totalItems })}
                        </div>

                        {/* Pagination Controls - Right */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className="p-2 md:px-5 lg:px-6 md:py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] md:text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center min-w-[36px]"
                            >
                                <ChevronLeft className="w-4 h-4 md:hidden" />
                                <span className="hidden md:inline">{t('history.previous')}</span>
                            </button>
                            <button
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className="p-2 md:px-5 lg:px-6 md:py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] md:text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center min-w-[36px]"
                            >
                                <span className="hidden md:inline">{t('history.next')}</span>
                                <ChevronRight className="w-4 h-4 md:hidden" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SHARED DETAIL MODAL */}
            <ComplaintDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                ticket={selectedTicket}
                role="admin"
                renderActions={
                    <div className="space-y-4">
                        {/* KONFIRMASI LOG DATA (Khusus jika ada permintaan dari teknisi) */}
                        {(selectedTicket?.logRequestStatus === 'pending' || selectedTicket?.logRequestStatus === 'requested') && (
                            <div className="space-y-3 p-5 rounded-2xl border border-dashed bg-blue-50/50 border-blue-200 transition-all duration-300">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-blue-600">
                                    <FileText className="w-3 h-3" /> {t('complaint.action.admin.log_access_title', 'Teknisi Meminta Data Log')}
                                </h4>
                                
                                {selectedTicket?.logReason && (
                                    <div className="bg-white/60 p-3 rounded-xl border border-blue-100/50">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{t('complaint.action.technician.request_reason_label', 'Alasan Permintaan:')}</p>
                                        <p className="text-xs text-gray-700 italic leading-relaxed">"{selectedTicket.logReason}"</p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 py-3 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white font-bold rounded-xl text-[10px] uppercase tracking-wider hover:brightness-105 transition-all shadow-md shadow-bieon-eco/15 flex items-center justify-center gap-2"
                                        onClick={() => handleLogAction(selectedTicket.id, true)}
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5" /> {t('complaint.action.admin.accept_access', 'Terima Akses')}
                                    </button>
                                    <button
                                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl text-[10px] uppercase tracking-wider hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                        onClick={() => handleLogAction(selectedTicket.id, false)}
                                    >
                                        <XCircle className="w-3.5 h-3.5 text-red-500" /> {t('complaint.action.admin.reject_access', 'Tolak Akses')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedTicket?.logRequestStatus === 'granted' && (
                            <button
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    navigate('/admin-datalog', {
                                        state: {
                                            returnTicketId: selectedTicket.originalId,
                                            customerName: selectedTicket.customer
                                        }
                                    });
                                }}
                                className="w-full py-3 bg-white border border-bieon-sense/25 text-bieon-eco font-bold rounded-xl text-[10px] uppercase tracking-wider hover:bg-bieon-eco/10 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Activity className="w-3.5 h-3.5" /> {t('complaint.action.technician.log_status_accepted', 'Lihat Data Log')}
                            </button>
                        )}
                        {selectedTicket?.logRequestStatus === 'rejected' && (
                            <div className="flex items-center gap-2 text-[10px] text-red-400 font-medium italic">
                                <AlertCircle className="w-3 h-3" /> {t('complaint.action.admin.reject_log', 'Anda menolak permintaan ini. Teknisi tidak dapat melihat log.')}
                            </div>
                        )}

                        {/* ALIKHAN & PING TEKNISI (Selalu ada kecuali status tertentu) */}
                        {!['selesai', 'ditolak', 'menunggu konfirmasi pelanggan'].includes(selectedTicket?.status?.toLowerCase()) && (
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        handleAssign(selectedTicket);
                                        setIsDetailModalOpen(false);
                                    }}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                                >
                                    <Users className="w-3.5 h-3.5" /> {t('complaint.action.admin.reassign_tech', 'Alihkan Teknisi')}
                                </button>
                                
                                {selectedTicket?.status?.toLowerCase() !== 'unassigned' && (
                                    <button
                                        onClick={() => {
                                            handlePing(selectedTicket);
                                            setIsDetailModalOpen(false);
                                        }}
                                        className="w-full py-3 bg-red-500 text-white font-bold rounded-xl text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                                    >
                                        <Bell className="w-3.5 h-3.5" /> {t('complaint.action.admin.ping_tech', 'Kirim Ping Ke Teknisi')}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* DEFAULT ACTIONS */}
                        <div className="pt-2 space-y-3">
                            {selectedTicket?.technicianInfo?.phone && (
                                <button
                                    onClick={() => {
                                        window.open(`https://wa.me/62${selectedTicket.technicianInfo.phone.replace(/^0/, '')}`, '_blank');
                                    }}
                                    className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-3.5 h-3.5 text-bieon-eco" /> {t('complaint.action.admin.chat_tech', 'Chat Teknisi')} (WA)
                                </button>
                            )}

                            {/* EXPORT DETAIL ACTION (Khusus SA jika status Selesai / Ditolak) */}
                            {['selesai', 'ditolak'].includes(selectedTicket?.status?.toLowerCase()) && (
                                <button
                                    onClick={() => handleExportSingleDetailPDF(selectedTicket)}
                                    className="w-full py-4 bg-white border-2 border-bieon-eco/20 text-bieon-eco font-bold rounded-2xl text-[11px] uppercase tracking-wider hover:bg-bieon-eco/10 transition-all shadow-sm flex items-center justify-center gap-2 group active:scale-95"
                                >
                                    <Download className="w-4 h-4 group-hover:animate-bounce" /> {t('complaint.detail_box.export_pdf', 'Ekspor Detail Pengaduan (PDF)')}
                                </button>
                            )}
                        </div>
                    </div>
                }
            />

            <style>{`
                .modal-custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .modal-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .modal-custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 999px; }
                .modal-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }

                /* Hide default scrollbar on mobile so our custom one shines */
                @media (max-width: 768px) {
                    .hide-scrollbar-on-mobile::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar-on-mobile {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                }

                /* Custom Range Slider Styling for Table Scroller */
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 8px;
                    width: 24px;
                    border-radius: 999px;
                    background: #059b27;
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0,0,0,0.2);
                    transition: all 0.1s;
                }
                input[type=range]:active::-webkit-slider-thumb {
                    transform: scale(1.1);
                    background: #00876b;
                }
            `}</style>

            {/* MODAL: ALIHKAN / TUGASKAN TEKNISI */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-6 animate-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-white/20 flex flex-col max-h-[80vh]">
                        <div className="px-6 md:px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 border border-blue-100 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-tight">{t('complaint.action.admin.reassign_popup_title', 'Alihkan Teknisi')}</h2>
                                    <p className="text-slate-500 text-[11px] sm:text-xs font-medium mt-1 leading-snug">{t('complaint.action.admin.assign_popup_desc', 'Pilih teknisi yang tersedia untuk menangani tiket pengaduan ini.')} <span className="font-bold text-slate-700">#{selectedTicket?.id}</span>.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAssignModalOpen(false)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl flex items-center justify-center transition-all group shrink-0">
                                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-6 md:p-8 space-y-6 overflow-y-auto modal-custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">{t('complaint.action.admin.select_tech_placeholder', 'Pilih Teknisi...').replace('...', '')}</label>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 modal-custom-scrollbar">
                                    {technicians.length > 0 ? technicians.map(tech => (
                                        <button
                                            key={tech._id}
                                            onClick={() => setSelectedTechnicianId(tech._id)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedTechnicianId === tech._id ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/10' : 'border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500 text-xs">
                                                    {(tech?.fullName || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-gray-800">{tech?.fullName || t('complaint.no_name', 'Tanpa Nama')}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{tech?.position || 'Teknisi BIEON'}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2 py-0.5 rounded text-[9px] font-bold border ${tech.status === 'aktif' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    {tech.status === 'aktif' ? t('complaint.status_standby', 'Standby') : t('complaint.status_busy', 'Sibuk')}
                                                </div>
                                        </button>
                                    )) : (
                                        <div className="text-center py-4 text-xs font-bold text-gray-400">{t('complaint.detail_box.no_technician', 'Belum ada teknisi yang ditugaskan')}</div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={confirmAssign}
                                    disabled={!selectedTechnicianId}
                                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none"
                                >
                                    {t('complaint.action.admin.submit_assign', 'Tugaskan')}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAssignModalOpen(false);
                                        handleDetail(selectedTicket);
                                    }}
                                    className="w-full py-3 bg-white border border-gray-100 text-gray-500 font-bold rounded-2xl text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-3.5 h-3.5" /> {t('complaint.detail_box.title_info', 'Informasi Pengaduan')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: PING TEKNISI */}
            {isPingModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-6 animate-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-white/20 flex flex-col max-h-[80vh]">
                        <div className="px-6 md:px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                    <Bell className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-tight">{t('complaint.action.admin.ping_popup_title', 'Kirim Peringatan PING!')}</h2>
                                    <p className="text-slate-500 text-[11px] sm:text-xs font-medium mt-1 leading-snug">{t('complaint.action.admin.ping_popup_desc', 'Kirim notifikasi PING! kepada teknisi untuk mengingatkan batas waktu SLA.')}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsPingModalOpen(false)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl flex items-center justify-center transition-all group shrink-0">
                                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-6 md:p-8 space-y-6 overflow-y-auto modal-custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">{t('complaint.action.admin.ping_reasons_label', 'Alasan Peringatan (SLA)')}</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { 
                                            id: 'sla-15', 
                                            label: t('complaint.action.admin.ping_reason_15m_label', 'Peringatan Respon (15 Menit)'), 
                                            desc: t('complaint.action.admin.ping_reason_15m_desc', 'Teknisi belum memberikan respon awal sejak tiket masuk.') 
                                        },
                                        { 
                                            id: 'sla-48', 
                                            label: t('complaint.action.admin.ping_reason_48h_label', 'Peringatan Perbaikan (48 Jam)'), 
                                            desc: t('complaint.action.admin.ping_reason_48h_desc', 'Tiket belum terselesaikan dalam batas waktu 48 jam.') 
                                        },
                                        { 
                                            id: 'urgent', 
                                            label: t('complaint.action.admin.ping_reason_urgent_label', 'Urgent Follow-up'), 
                                            desc: t('complaint.action.admin.ping_reason_urgent_desc', 'Permintaan eskalasi dari customer yang mendesak.') 
                                        }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedPingType(type.label)}
                                            className={`w-full flex flex-col items-start p-4 rounded-2xl border transition-all ${selectedPingType === type.label ? 'border-red-500 bg-red-50/30' : 'border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            <p className="text-sm font-bold text-gray-800">{type.label}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{type.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={confirmPing}
                                    disabled={!selectedPingType}
                                    className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-100 disabled:opacity-50 disabled:shadow-none"
                                >
                                    {t('complaint.action.admin.submit_ping', 'Kirim PING')}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsPingModalOpen(false);
                                        handleDetail(selectedTicket);
                                    }}
                                    className="w-full py-3 bg-white border border-gray-100 text-gray-500 font-bold rounded-2xl text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-3.5 h-3.5" /> {t('complaint.detail_box.title_info', 'Informasi Pengaduan')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
