import React, { useState, useMemo, useEffect } from 'react';
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
import { formatStatusDisplay, getActionButtons, getPerformanceIndicator } from '../../utils/complaintHelpers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SLADisplay = ({ createdAt, assignedAt, processStartedAt, status }) => {
    const { timer, points, level, isOverdue, type } = useSLA(createdAt, assignedAt, processStartedAt, status);

    if (!timer) return null;

    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        red: 'bg-red-50 text-red-600 border-red-100'
    };

    const dotColors = {
        emerald: 'bg-emerald-500',
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

    const mainLabels = {
        high: '🔥 Prioritas (Alihan)',
        critical: '🚨 KRITIS'
    };

    return (
        <div className="flex flex-wrap gap-1 items-center">
            {/* Render Kotak Ping (Max 3) */}
            {Array.from({ length: pingCount || 0 }).map((_, i) => (
                <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 text-[8px] font-black uppercase shadow-sm">
                    ⚠️ Ping
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
    const { timer, points, isOverdue, timeElapsedMinutes } = useSLA(item.createdAt, item.assignedAt, item.processStartedAt, item.status);
    
    const displayStatus = formatStatusDisplay(item.status, 'admin', timeElapsedMinutes);
    const actions = getActionButtons('admin', item.status, timeElapsedMinutes);

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
            <td className="px-3 md:px-4 lg:px-6 py-4 text-[13px]">
                <span className={item.technician === 'Unassigned' ? 'text-gray-400 italic font-medium' : 'text-gray-700 font-bold'}>
                    {item.technician === 'Unassigned' ? 'Menunggu Teknisi' : item.technician}
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
                            className={`px-4 py-2 rounded-lg text-[11px] font-bold hover:shadow-lg transition-all active:scale-95 flex items-center gap-1 whitespace-nowrap ${
                                btn.action === 'detail' ? 'bg-[#009B7C] text-white' :
                                btn.action === 'reject' ? 'bg-red-50 text-red-600 border border-red-100' :
                                btn.action === 'ping' ? 'bg-red-500 text-white shadow-lg shadow-red-100' :
                                btn.variant === 'primary' ? 'bg-blue-600 text-white' :
                                btn.variant === 'secondary' ? 'bg-blue-500 text-white' :
                                'bg-blue-600 text-white'
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
    const token = localStorage.getItem('bieon_token');

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
                const data = await complaintsRes.json();

                // Mapped structure for frontend compatibility
                const formattedComplaints = data.map(item => ({
                    ...item,
                    originalId: item._id, // Save DB ID to hit PUT endpoints
                    id: `TCK-${item._id ? item._id.substring(item._id.length - 6).toUpperCase() : '000000'}`,
                    description: item.desc, // Map from DB
                    date: new Date(item.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'),
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
                    updatedAt: new Date(item.updatedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')
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
        doc.setTextColor(0, 155, 124); // Admin Teal #009B7C
        doc.text('BIEON - Laporan Pengaduan Pelanggan', 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);

        // Definisi Kolom sesuai urutan tabel: ID, Tanggal, Customer, Topik, Teknisi, Status
        const tableColumn = ["ID Tiket", "Tanggal", "Customer", "Topik Kendala", "Teknisi", "Status"];
        const tableRows = [];

        // Isi Data dari State processedData (data yang sedang terfilter)
        processedData.forEach(ticket => {
            const ticketData = [
                ticket.id,
                ticket.date,
                ticket.customer,
                ticket.topic,
                ticket.technician,
                ticket.status.toUpperCase()
            ];
            tableRows.push(ticketData);
        });

        // Generate Tabel
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [0, 155, 124], textColor: [255, 255, 255], fontStyle: 'bold' },
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

    const handleExportSingleDetailPDF = (ticket) => {
        if (!ticket) return;
        const doc = new jsPDF('portrait');
        const primaryColor = [0, 155, 124]; // Admin Teal #009B7C
        
        // Header & Logo Branding
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('LAPORAN DETAIL PENGADUAN', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`ID TIKET: ${ticket.id.replace('+P', '')}`, 105, 30, { align: 'center' });

        // Section 1: Informasi Dasar
        doc.setTextColor(40);
        doc.setFontSize(14);
        doc.text('INFORMASI PENGADUAN', 14, 55);
        doc.setLineWidth(0.5);
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.line(14, 58, 65, 58);

        doc.setFontSize(10);
        const infoData = [
            ['Teknisi', `: ${ticket.technician} (${ticket.technicianInfo?.phone || '-'})`],
            ['Rating Teknisi', `: ${ticket.rating !== '-' ? ticket.rating + '/5' : 'Belum dinilai'}`],
            ['Nama Pelanggan', `: ${ticket.customer}`],
            ['Alamat', `: ${ticket.location}`],
            ['Topik Kendala', `: ${ticket.topic || '-'}`],
            ['Kategori', `: ${ticket.category || 'Umum'}`],
            ['Deskripsi Masalah', `: ${ticket.description || '-'}`],
            ['Lampiran Foto', `: ${ticket.photos && ticket.photos.length > 0 ? ticket.photos.length + ' Foto (Tersedia di Dashboard)' : 'Tidak ada foto'}`],
            ['Waktu Dibuat', `: ${ticket.date}`],
            ['Waktu Selesai', `: ${ticket.completedAt ? new Date(ticket.completedAt).toLocaleString('id-ID') : '-'}`],
            ['Durasi Pengerjaan', `: ${ticket.duration || '-'}`]
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
        doc.text('SLA PERFORMANCE & POINTS', 14, currentY);
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

        let overallStatus = 'NEEDS IMPROVEMENT';
        if (totalPts >= 100) overallStatus = 'EXCELLENT';
        else if (totalPts >= 50) overallStatus = 'GOOD';

        const slaData = [
            ['Respon Teknisi', '15 Menit', responseTime, (responseTime !== '-' && (responseTime.includes('Hari') || parseInt(responseTime.split(':')[0]) > 0 || parseInt(responseTime.split(':')[1]) > 15)) ? 'OVERDUE' : 'SESUAI SLA', `${resPts} Pts`],
            ['Perbaikan Unit', '48 Jam', repairTime, (repairTime !== '-' && (repairTime.includes('Hari') || parseInt(repairTime.split(':')[0]) >= 48)) ? 'OVERDUE' : 'SESUAI SLA', `${repPts} Pts`]
        ];

        autoTable(doc, {
            startY: currentY + 8,
            head: [['Aspek SLA', 'Target', 'Capaian', 'Status', 'Poin']],
            body: slaData,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
            columnStyles: { 3: { fontStyle: 'bold' }, 4: { fontStyle: 'bold', halign: 'center' } },
            margin: { bottom: 25 },
            didParseCell: (data) => {
                if (data.column.index === 3 && data.cell.section === 'body') {
                    if (data.cell.text[0] === 'OVERDUE') data.cell.styles.textColor = [220, 38, 38];
                    if (data.cell.text[0] === 'SESUAI SLA') data.cell.styles.textColor = [16, 185, 129];
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
        doc.text(`OVERALL PERFORMANCE: ${totalPts} POINTS - ${overallStatus}`, 105, currentY + 8, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40);

        // Section 3: Riwayat Progres
        currentY = currentY + 28;
        doc.setFontSize(14);
        doc.text('RIWAYAT PROGRES PENGADUAN', 14, currentY);
        doc.line(14, currentY + 3, 85, currentY + 3);

        const timelineData = timeline.length > 0 ? timeline.map(t => [
            t.time || '-',
            (t.status || 'UPDATE').toUpperCase(),
            (t.desc || t.note || t.notes || '-').replace(/\s*\((?=.*(Respons|Durasi|Poin|Rating)).*?\)/gi, '').trim()
        ]) : [['-', 'TIDAK ADA DATA PROGRES', '-']];

        autoTable(doc, {
            startY: currentY + 8,
            head: [['Tanggal & Waktu', 'Aktivitas', 'Catatan/Keterangan']],
            body: timelineData,
            theme: 'striped',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
            columnStyles: { 0: { width: 50 }, 1: { width: 45, fontStyle: 'bold' } },
            margin: { bottom: 25 }
        });

        // Footer & Page Numbers
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Separator Line
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.2);
            doc.line(14, 282, 196, 282);

            doc.setFontSize(7);
            doc.setTextColor(180);
            doc.text('Dokumen ini dihasilkan secara otomatis oleh Sistem Monitoring BIEON Smart Green Living.', 105, 287, { align: 'center' });
            doc.text(`Halaman ${i} dari ${pageCount}`, 105, 292, { align: 'center' });
        }

        doc.save(`BIEON_SA_Detail_${ticket.id.replace('+P', '')}.pdf`);
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const statsMetrics = useMemo(() => {
        const active = complaints.filter(c => !['selesai', 'ditolak'].includes(c.status?.toLowerCase())).length;
        const overdue = complaints.filter(c => ['overdue respons', 'overdue perbaikan'].includes(c.status?.toLowerCase())).length;
        const finished = complaints.filter(c => c.status?.toLowerCase() === 'selesai').length;
        
        // Calculate Global CSAT from tickets with rating
        const ratedTickets = complaints.filter(c => c.status?.toLowerCase() === 'selesai' && typeof c.rating === 'number');
        const avg = ratedTickets.length > 0 
            ? (ratedTickets.reduce((acc, curr) => acc + curr.rating, 0) / ratedTickets.length).toFixed(1)
            : '0.0';

        return { active, overdue, finished, avg };
    }, [complaints]);

    const stats = [
        { label: 'Total Tiket Aktif (BIEON)', value: statsMetrics.active, trend: 'Tiket sedang berjalan', color: 'blue', icon: Activity },
        { label: 'Tiket Overdue (Batas SLA)', value: statsMetrics.overdue, trend: statsMetrics.overdue > 0 ? 'Perlu tindakan segera' : 'Sesuai target SLA', color: 'red', icon: AlertCircle },
        { label: 'Total Diselesaikan', value: statsMetrics.finished, trend: 'Tiket status selesai', color: 'emerald', icon: CheckCircle2 },
        { label: 'Global CSAT', value: statsMetrics.avg, trend: 'Rata-rata kepuasan', color: 'amber', icon: Star, isRating: true }
    ];

    const processedData = useMemo(() => {
        let filtered = [...complaints];
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
                if (selectedStatusFilter === 'Baru') {
                    return (s === 'unassigned' || item.technician === 'Unassigned') && s !== 'ditolak';
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
            case 'selesai': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
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
            case 'selesai': return 'bg-emerald-500';
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
        if (!window.confirm(`Apakah Anda yakin ingin menolak tiket ${ticket.id}?`)) return;
        
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
                alert("Gagal menolak tiket.");
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
                alert(`Gagal menugaskan teknisi: ${err.message}`);
            }
        } catch (error) {
            alert(`Terjadi kesalahan server: ${error.message}`);
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
                alert(`Ping Berhasil! Urgensi tiket kini menjadi: ${resData.urgencyLevel.toUpperCase()}`);
                setIsPingModalOpen(false);
                setSelectedPingType('');
                fetchData();
            } else {
                alert("Gagal mengirimkan PING.");
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

            if (!response.ok) throw new Error('Gagal memproses akses log di server');

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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-between min-h-[110px] md:min-h-[140px] ${stat.color === 'red' ? 'border-red-100 shadow-red-50/50' : 'border-gray-100 shadow-sm'}`}>
                            <div className={`absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 blur-2xl md:blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${stat.color === 'red' ? 'bg-red-500' : stat.color === 'emerald' ? 'bg-emerald-500' : stat.color === 'blue' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>

                            <div className="relative z-10 flex items-center gap-2 md:gap-3 mb-2 md:mb-0">
                                <div className={`p-2 md:p-2.5 rounded-lg md:rounded-xl shrink-0 ${stat.color === 'red' ? 'bg-red-50 text-red-600' : stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
                                </div>

                                <p className="text-[9px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                            </div>

                            <div className="relative z-10 flex flex-col items-start md:flex-row md:items-end md:justify-between mt-auto gap-1 md:gap-0 mt-3 md:mt-0">
                                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-none flex items-baseline gap-1">
                                    {stat.value}
                                    {stat.isRating && (
                                        <Star className="w-5 h-5 md:w-6 md:h-6 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] transition-transform group-hover:rotate-[15deg]" />
                                    )}
                                </h3>

                                <div className={`inline-flex items-center gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold border transition-colors whitespace-nowrap mt-1 md:mt-0 ${stat.color === 'red' ? 'bg-red-50 text-red-600 border-red-100' : stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : stat.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    {stat.trend}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-5 md:p-8 border-b border-gray-50">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">Daftar Pengaduan Masuk</h2>
                                <p className="text-xs text-gray-500 mt-1 italic leading-relaxed">Pantau status laporan serta penugasan teknisi BIEON Smart Monitoring secara real-time.</p>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 group min-w-0">
                                    <Search className="w-4 h-4 md:w-4 md:h-4 absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#009B7C] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Cari Tiket, Hub..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 md:pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-800 placeholder:font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#009B7C] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all truncate"
                                    />
                                </div>

                                <div className="relative shrink-0">
                                    <button
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        className={`flex items-center justify-center gap-2 px-3.5 md:px-5 py-3.5 bg-white border rounded-2xl text-sm font-medium transition-all shadow-sm ${showStatusDropdown ? 'border-[#009B7C] ring-4 ring-emerald-500/10' : 'border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <Filter className="w-4 h-4 text-gray-400" />
                                        <span className="hidden md:block">{selectedStatusFilter || 'Semua Status'}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 hidden md:block transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />

                                        {selectedStatusFilter && (
                                            <span className="md:hidden absolute top-2.5 right-2 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
                                        )}
                                    </button>

                                    {showStatusDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)}></div>
                                            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-[1.5rem] shadow-xl py-2 z-20">
                                                {['', 'Baru', 'Menunggu Respons', 'Diproses', 'Menunggu Konfirmasi Pelanggan', 'Selesai', 'Overdue Respons', 'Overdue Perbaikan', 'Ditolak'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => { setSelectedStatusFilter(s); setShowStatusDropdown(false); setCurrentPage(1); }}
                                                        className={`w-full text-left px-5 py-2.5 text-xs font-bold transition-colors ${selectedStatusFilter === s ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-500 hover:bg-gray-50'}`}
                                                    >
                                                        {s || 'Semua Status'}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={handleExport}
                                    className="flex items-center justify-center gap-2 px-3.5 md:px-6 py-3.5 bg-[#E1F2EB] text-[#1E4D40] rounded-2xl text-sm font-bold hover:bg-[#d4ece3] transition-all shadow-sm shrink-0 group relative"
                                >
                                    <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                                    <span className="hidden md:block">Export</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar-x pb-2 min-h-[400px]">
                        <table className="w-full text-left min-w-[1000px] table-auto">
                            <thead className="bg-[#F8FAFB]/50 border-b border-gray-100 text-gray-500 select-none">
                                <tr>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('id')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">ID Tiket {getSortIcon('id')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('date')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Tanggal {getSortIcon('date')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('customer')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Pelanggan {getSortIcon('customer')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal whitespace-nowrap outline-none">
                                        <div className="uppercase tracking-wider text-[11px] font-bold">Topik Kendala</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('technician')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Teknisi {getSortIcon('technician')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors text-center outline-none" onClick={() => requestSort('rating')}>
                                        <div className="flex items-center justify-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Rating {getSortIcon('rating')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('status')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Status {getSortIcon('status')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal whitespace-nowrap text-left text-[11px] font-bold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="w-10 h-10 border-4 border-gray-100 border-t-[#009B7C] rounded-full animate-spin"></div>
                                                <p className="text-sm font-bold text-gray-500 animate-pulse">Menarik Data dari Database...</p>
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
                                                    <p className="text-lg font-bold text-gray-900">Tidak ada pengaduan ditemukan</p>
                                                    <p className="text-sm font-semibold text-gray-400">Belum ada pengaduan di database server.</p>
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
                            <span className="hidden sm:inline text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Rows per page:</span>
                            <div className="relative">
                                <button onClick={() => setShowRowsDropdown(!showRowsDropdown)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-100 rounded-xl text-[10px] md:text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all min-w-[50px] md:min-w-[70px] justify-between">
                                    {rowsPerPage} <ChevronDown className={`w-3 h-3 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showRowsDropdown && (
                                    <div className="absolute bottom-full left-0 mb-2 w-20 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-bottom-2">
                                        {[5, 10, 20].map(val => (
                                            <button key={val} onClick={() => { setRowsPerPage(val); setShowRowsDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${rowsPerPage === val ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-500 hover:bg-gray-50'}`}>{val}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Page Info - Center: selalu tampil "X-Y of Z", "items" disembunyikan di HP */}
                        <div className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-center whitespace-nowrap">
                            {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems}<span className="hidden sm:inline"> items</span>
                        </div>

                        {/* Pagination Controls - Right: ikon di HP, teks di desktop */}
                        <div className="flex items-center gap-1.5 md:gap-3">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className="p-2 md:px-6 md:py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] md:text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center min-w-[36px]"
                            >
                                <ChevronLeft className="w-4 h-4 md:hidden" />
                                <span className="hidden md:inline">Prev</span>
                            </button>
                            <button
                                disabled={currentPage >= Math.ceil(totalItems / rowsPerPage)}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className="p-2 md:px-6 md:py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] md:text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center min-w-[36px]"
                            >
                                <span className="hidden md:inline">Next</span>
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
                                    <FileText className="w-3 h-3" /> Teknisi Meminta Data Log
                                </h4>
                                
                                {selectedTicket?.logReason && (
                                    <div className="bg-white/60 p-3 rounded-xl border border-blue-100/50">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Alasan Permintaan:</p>
                                        <p className="text-xs text-gray-700 italic leading-relaxed">"{selectedTicket.logReason}"</p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 py-3 bg-[#009B7C] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider hover:bg-[#008268] transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
                                        onClick={() => handleLogAction(selectedTicket.id, true)}
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5" /> Setujui
                                    </button>
                                    <button
                                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl text-[10px] uppercase tracking-wider hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                        onClick={() => handleLogAction(selectedTicket.id, false)}
                                    >
                                        <XCircle className="w-3.5 h-3.5 text-red-500" /> Tolak
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedTicket?.logRequestStatus === 'granted' && (
                            <button
                                onClick={() => alert('Membuka Viewer Data Log BIEON...')}
                                className="w-full py-3 bg-white border border-emerald-200 text-emerald-700 font-bold rounded-xl text-[10px] uppercase tracking-wider hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Activity className="w-3.5 h-3.5" /> Lihat Data Log
                            </button>
                        )}
                        {selectedTicket?.logRequestStatus === 'rejected' && (
                            <div className="flex items-center gap-2 text-[10px] text-red-400 font-medium italic">
                                <AlertCircle className="w-3 h-3" /> Anda menolak permintaan ini. Teknisi tidak dapat melihat log.
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
                                    <Users className="w-3.5 h-3.5" /> Alihkan Teknisi
                                </button>
                                
                                {selectedTicket?.status?.toLowerCase() !== 'unassigned' && (
                                    <button
                                        onClick={() => {
                                            handlePing(selectedTicket);
                                            setIsDetailModalOpen(false);
                                        }}
                                        className="w-full py-3 bg-red-500 text-white font-bold rounded-xl text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                                    >
                                        <Bell className="w-3.5 h-3.5" /> Kirim Ping Ke Teknisi
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
                                    <MessageSquare className="w-3.5 h-3.5 text-[#009B7C]" /> Chat Teknisi (WA)
                                </button>
                            )}

                            {/* EXPORT DETAIL ACTION (Khusus SA jika status Selesai) */}
                            {selectedTicket?.status?.toLowerCase() === 'selesai' && (
                                <button
                                    onClick={() => handleExportSingleDetailPDF(selectedTicket)}
                                    className="w-full py-4 bg-white border-2 border-emerald-100 text-emerald-700 font-bold rounded-2xl text-[11px] uppercase tracking-wider hover:bg-emerald-50 transition-all shadow-sm flex items-center justify-center gap-2 group active:scale-95"
                                >
                                    <Download className="w-4 h-4 group-hover:animate-bounce" /> Ekspor Detail Pengaduan (PDF)
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
                    background: #009B7C;
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                        <div className="p-6 md:p-8 border-b border-gray-50 shrink-0">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Users className="w-6 h-6" />
                                </div>
                                <button onClick={() => setIsAssignModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">Alihkan Teknisi</h3>
                            <p className="text-xs text-gray-500 mt-2">Pilih teknisi yang tersedia untuk menangani tiket <span className="font-bold text-gray-700">#{selectedTicket?.id}</span>.</p>
                        </div>
                        <div className="p-6 md:p-8 space-y-6 overflow-y-auto modal-custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Pilih Teknisi</label>
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
                                                    <p className="text-sm font-bold text-gray-800">{tech?.fullName || 'Tanpa Nama'}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{tech?.position || 'Teknisi BIEON'}</p>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-0.5 rounded text-[9px] font-bold border ${tech.status === 'aktif' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                {tech.status === 'aktif' ? 'Standby' : 'Sibuk'}
                                            </div>
                                        </button>
                                    )) : (
                                        <div className="text-center py-4 text-xs font-bold text-gray-400">Tidak ada teknisi tersedia</div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={confirmAssign}
                                    disabled={!selectedTechnicianId}
                                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none"
                                >
                                    Konfirmasi Penugasan
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAssignModalOpen(false);
                                        handleDetail(selectedTicket);
                                    }}
                                    className="w-full py-3 bg-white border border-gray-100 text-gray-500 font-bold rounded-2xl text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-3.5 h-3.5" /> Detail Pengaduan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: PING TEKNISI */}
            {isPingModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                        <div className="p-6 md:p-8 border-b border-gray-50 shrink-0">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                                    <Bell className="w-6 h-6" />
                                </div>
                                <button onClick={() => setIsPingModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">Kirim Peringatan (Ping)</h3>
                            <p className="text-xs text-gray-500 mt-2">Kirim notifikasi urgent ke <span className="font-bold text-gray-700">{selectedTicket?.technician}</span> terkait keterlambatan respon.</p>
                        </div>
                        <div className="p-6 md:p-8 space-y-6 overflow-y-auto modal-custom-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Alasan Peringatan (SLA)</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { id: 'sla-15', label: 'Peringatan Respon (15 Menit)', desc: 'Teknisi belum memberikan respon awal sejak tiket masuk.' },
                                        { id: 'sla-48', label: 'Peringatan Perbaikan (48 Jam)', desc: 'Tiket belum terselesaikan dalam batas waktu 48 jam.' },
                                        { id: 'urgent', label: 'Urgent Follow-up', desc: 'Permintaan eskalasi dari customer yang mendesak.' }
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
                                    Kirim Peringatan
                                </button>
                                <button
                                    onClick={() => {
                                        setIsPingModalOpen(false);
                                        handleDetail(selectedTicket);
                                    }}
                                    className="w-full py-3 bg-white border border-gray-100 text-gray-500 font-bold rounded-2xl text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-3.5 h-3.5" /> Detail Pengaduan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
