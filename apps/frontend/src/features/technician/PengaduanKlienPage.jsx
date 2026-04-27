import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    ChevronDown,
    ArrowUpDown,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Cpu,
    Star,
    FileText,
    ArrowUp,
    ArrowDown,
    X,
    FileDown,
    MessageSquare
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ComplaintDetailModal } from '../complaints/ComplaintDetailModal';
import { TicketStatusBadge } from '../../shared/TicketStatusBadge';
import { useSLA } from '../../hooks/useSLA';
import { formatStatusDisplay, getActionButtons } from '../../utils/complaintHelpers';

const TechnicianComplaintCard = ({ item, handleStartProcess, setSelectedTicket }) => {
    const { timer, timeElapsedMinutes } = useSLA(item.createdAt, item.assignedAt, item.processStartedAt, item.status);
    const displayStatus = formatStatusDisplay(item.status, 'technician');
    const actions = getActionButtons('technician', item.status, timeElapsedMinutes);

    return (
        <div className="p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500">{item.id}</span>
                <span className="text-[10px] text-gray-400 font-medium">{item.date}</span>
            </div>
            <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{item.customer}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{item.location}</span>
                </div>
            </div>
            <div className="bg-[#f8fafc] p-3 rounded-xl border border-gray-100 mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Topik Kendala</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">{item.topic}</p>
                <div className="flex justify-between items-center mt-2">
                    <div>
                        <TicketStatusBadge
                            status={item.status}
                            rating={item.rating}
                            assignedAt={item.assignedAt}
                            processStartedAt={item.processStartedAt}
                            isEscalated={item.isEscalated}
                        />
                    </div>
                    <div className="flex gap-2">
                        {actions.map((btn, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (btn.action === 'process') handleStartProcess(item);
                                    else setSelectedTicket(item);
                                }}
                                className={`px-4 py-2 rounded-lg text-[11px] font-extrabold shadow-sm active:scale-95 transition-all ${btn.variant === 'primary' ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]' : 'bg-gray-100 text-gray-400'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
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

const TechnicianComplaintRow = ({ item, handleStartProcess, setSelectedTicket }) => {
    const { timer, timeElapsedMinutes } = useSLA(item.createdAt, item.assignedAt, item.processStartedAt, item.status);
    const displayStatus = formatStatusDisplay(item.status, 'technician');
    const actions = getActionButtons('technician', item.status, timeElapsedMinutes);

    return (
        <tr className="hover:bg-gray-50/50 transition-colors group border-b border-gray-50">
            <td className="px-6 py-4 font-bold text-gray-900 tracking-tight whitespace-nowrap">{item.id}</td>
            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{item.date}</td>
            <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap" title={item.topic}>
                <div className="flex flex-col gap-1">
                    <span className="truncate">{item.topic}</span>
                    <UrgencyBadge level={item.urgencyLevel} pingCount={item.pingCount} />
                </div>
            </td>
            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.customer}</td>
            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{item.location}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <TicketStatusBadge
                    status={item.status}
                    rating={item.rating}
                    assignedAt={item.assignedAt}
                    processStartedAt={item.processStartedAt}
                    isEscalated={item.isEscalated}
                    role="technician"
                />
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center justify-start gap-2" onClick={e => e.stopPropagation()}>
                    {actions.map((btn, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (btn.action === 'process') handleStartProcess(item);
                                else setSelectedTicket(item);
                            }}
                            className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all ${btn.variant === 'primary' ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]' : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            {btn.label} {btn.action !== 'process' && <ChevronRight className="w-3 h-3" />}
                        </button>
                    ))}
                </div>
            </td>
        </tr>
    );
};

export function PengaduanKlienPage({ onNavigate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null); // Menangkap error API
    const [toast, setToast] = useState({ show: false, message: '' });

    const token = localStorage.getItem('token');

    const handleExport = () => {
        const doc = new jsPDF('portrait');
        
        // Header PDF
        doc.setFontSize(18);
        doc.setTextColor(15, 158, 120); // Teal BIEON
        doc.text('Laporan Pengaduan BIEON - Taskboard Teknisi', 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);

        // Definisi Kolom sesuai urutan tabel: ID, Tanggal, Topik, Pelanggan, Lokasi, Status
        const tableColumn = ["ID Tiket", "Tanggal", "Topik Kendala", "Pelanggan", "Lokasi", "Status"];
        const tableRows = [];

        // Isi Data dari State processedData (data yang sedang terfilter)
        processedData.forEach(ticket => {
            const ticketData = [
                ticket.id,
                ticket.date,
                ticket.topic,
                ticket.customer,
                ticket.location,
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
            headStyles: { fillColor: [15, 158, 120], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2 }, // Perkecil font sedikit untuk portrait
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Download
        doc.save(`BIEON_Laporan_Teknisi_${new Date().getTime()}.pdf`);
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setApiError(null);
            const response = await fetch('/api/complaints/technician', {
                headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
                cache: 'no-store'
            });

            if (response.ok) {
                const data = await response.json();
                const formattedComplaints = data.map(item => {
                    const safeId = item._id ? item._id.toString() : '';
                    return {
                        ...item,
                        originalId: item._id,
                        id: safeId ? `TCK-${safeId.substring(Math.max(0, safeId.length - 6)).toUpperCase()}` : 'TCK-000000',
                        date: item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':') : '-',
                        customer: item.homeowner?.fullName || 'Unknown User',
                        location: item.homeowner?.address || '-',
                        topic: item.topic || 'No Topic',
                        description: item.desc || 'Tidak ada deskripsi.',
                        status: item.status?.toLowerCase() || 'unassigned',
                        clientInfo: item.homeowner ? {
                            name: item.homeowner.fullName,
                            email: item.homeowner.email,
                            phone: item.homeowner.phoneNumber,
                            address: item.homeowner.address,
                            idBieon: item.homeowner.bieonId
                        } : null,
                        technicianInfo: item.technician ? {
                            id: item.technician._id,
                            name: item.technician.fullName,
                            phone: item.technician.phoneNumber,
                            targetDate: item.assignedAt ? new Date(new Date(item.assignedAt).getTime() + (48 * 60 * 60 * 1000)).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA'
                        } : null,
                        logRequestStatus: item.logRequestStatus || 'none',
                        logReason: item.logReason || '',
                        urgencyLevel: item.urgencyLevel || 'low',
                        pingCount: item.pingCount || 0,
                        rating: item.rating?.stars || '-'
                    };
                });
                setComplaints(formattedComplaints);

                // Sinkronisasi selectedTicket jika sedang dibuka di modal
                if (selectedTicket) {
                    const refreshedTicket = formattedComplaints.find(c => c.originalId === selectedTicket.originalId);
                    if (refreshedTicket) {
                        setSelectedTicket(refreshedTicket);
                    }
                }
            } else {
                const errJson = await response.json().catch(() => ({}));
                setApiError((errJson.message || `Error ${response.status}`) + (errJson.error ? `: ${errJson.error}` : ""));
            }
        } catch (error) {
            console.error("Gagal menarik data pengaduan teknisi:", error);
            setApiError("Koneksi gagal atau server tidak merespons.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleStartProcess = async (ticket) => {
        try {
            const response = await fetch(`/api/complaints/${ticket.originalId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'diproses',
                    note: 'Teknisi menyetujui tiket dan mulai melakukan perbaikan.'
                })
            });

            if (response.ok) {
                showToast("Tiket berhasil diterima & proses pemeriksaan dimulai.");
                fetchData();
            } else {
                showToast("Gagal memulai proses perbaikan.");
            }
        } catch (error) {
            console.error("Error starting process:", error);
        }
    };

    const stats = useMemo(() => {
        const waitingCount = complaints.filter(c => ['menunggu respons', 'overdue respons'].includes(c.status?.toLowerCase())).length;
        const hasOverdueWaiting = complaints.some(c => c.status?.toLowerCase() === 'overdue respons');
        const processingCount = complaints.filter(c => ['diproses', 'overdue perbaikan'].includes(c.status?.toLowerCase())).length;
        const completedCount = complaints.filter(c => c.status?.toLowerCase() === 'selesai').length;
        
        // Calculate Technician's average rating
        const ratedTickets = complaints.filter(c => typeof c.rating === 'number');
        const avg = ratedTickets.length > 0
            ? (ratedTickets.reduce((acc, curr) => acc + curr.rating, 0) / ratedTickets.length).toFixed(1)
            : '0.0';

        return { 
            waiting: waitingCount, 
            hasOverdue: hasOverdueWaiting,
            processing: processingCount, 
            completed: completedCount, 
            avgRating: avg 
        };
    }, [complaints]);

    const processedData = useMemo(() => {
        let result = [...complaints];
        if (selectedStatusFilter) {
            const filter = selectedStatusFilter.toLowerCase();
            result = result.filter(c => {
                const s = c.status?.toLowerCase();
                if (filter === 'menunggu respons') return s === 'menunggu respons' || s === 'overdue respons';
                if (filter === 'diproses') return s === 'diproses' || s === 'overdue perbaikan';
                return s === filter;
            });
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.id.toLowerCase().includes(q) ||
                c.customer.toLowerCase().includes(q) ||
                c.topic.toLowerCase().includes(q) ||
                c.location.toLowerCase().includes(q)
            );
        }
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                if (sortConfig.key === 'date') {
                    aVal = new Date(aVal).getTime() || 0;
                    bVal = new Date(bVal).getTime() || 0;
                }
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [complaints, searchQuery, selectedStatusFilter, sortConfig]);

    const totalItems = processedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = processedData.slice(startIndex, startIndex + rowsPerPage);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-gray-600" /> : <ArrowDown className="w-3.5 h-3.5 text-gray-600" />;
    };

    return (
        <div className="w-full">
            <style>{`
                .custom-scrollbar-x::-webkit-scrollbar { height: 8px; }
                .custom-scrollbar-x::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
                .custom-scrollbar-x::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
                .custom-scrollbar-x::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
            <div className="py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#1E4D40] mb-2 text-center sm:text-left">Taskboard Teknisi - Pusat Pengaduan</h1>
                    <p className="text-gray-500 text-sm max-w-2xl text-center sm:text-left">Pantau dan selesaikan tiket pengaduan Pelanggan yang ditugaskan kepada Anda. Perhatikan batas waktu SLA untuk setiap tiket.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-2 md:mb-4">
                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                <FileText className="w-3.5 h-3.5 md:w-5 md:h-5" />
                            </div>
                            {stats.hasOverdue && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full text-[9px] md:text-[10px] font-bold border border-red-100 whitespace-nowrap animate-pulse">
                                    <AlertCircle className="w-2.5 h-2.5 md:w-3 md:h-3" /> Urgent
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="text-gray-500 text-[9px] md:text-xs font-medium mb-0.5 md:mb-1 truncate">Menunggu Respons</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.waiting}</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-2 md:mb-4">
                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Clock className="w-3.5 h-3.5 md:w-5 md:h-5" />
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-[9px] md:text-xs font-medium mb-0.5 md:mb-1 truncate">Sedang Diproses</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.processing}</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-2 md:mb-4">
                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-3.5 h-3.5 md:w-5 md:h-5" />
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-[9px] md:text-xs font-medium mb-0.5 md:mb-1 truncate">Tiket Selesai</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.completed}</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-2 md:mb-4">
                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                <Star className="w-3.5 h-3.5 md:w-5 md:h-5" />
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-[9px] md:text-xs font-medium mb-0.5 md:mb-1 truncate">Rata-Rata Penilaian</div>
                            <div className="flex items-baseline gap-1">
                                <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.avgRating}</div>
                                <Star className="w-4 h-4 md:w-5 md:h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] transition-transform group-hover:rotate-[15deg]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Riwayat Pengaduan Saya</h2>
                                <p className="text-xs text-gray-500 mt-0.5 italic">Pantau status perbaikan Anda secara real-time.</p>
                            </div>

                            <div className="flex flex-row items-center gap-2 md:gap-3 w-full lg:w-auto shrink-0">
                                <div className="relative flex-1 sm:w-auto md:w-64 group">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Cari Pelanggan..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 bg-white transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        className={`flex items-center justify-center sm:justify-between gap-1.5 md:gap-3 px-3 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all shadow-sm group ${showStatusDropdown ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <Filter className={`w-4 h-4 transition-colors ${selectedStatusFilter ? 'text-teal-500' : 'text-gray-400'}`} />
                                        <span className="hidden sm:inline-block">{selectedStatusFilter || 'Semua Status'}</span>
                                        <ChevronDown className={`hidden sm:block w-4 h-4 transition-all ${showStatusDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showStatusDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-[10]" onClick={() => setShowStatusDropdown(false)}></div>
                                            <div className="absolute top-full right-0 mt-2 min-w-[200px] bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-[20]">
                                                {['', 'Menunggu Respons', 'Diproses', 'Menunggu Konfirmasi Pelanggan', 'Selesai'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => { setSelectedStatusFilter(s); setShowStatusDropdown(false); setCurrentPage(1); }}
                                                        className={`w-full text-left px-4 py-2 text-sm ${selectedStatusFilter === s ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        {s || 'Semua Status'}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#E6F5F0] text-[#0F9E78] rounded-xl text-sm font-bold hover:bg-[#d6efe6] transition-colors shrink-0 shadow-sm border border-transparent">
                                    <Download className="w-4 h-4 shrink-0" />
                                    <span className="hidden sm:inline-block">Export</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block w-full overflow-x-auto pb-4 custom-scrollbar-x">
                        <table className="w-full text-left text-[14px] text-gray-700 table-auto min-w-max">
                            <thead className="bg-[#F8FAFB]/50 border-b border-gray-100 text-gray-400 select-none">
                                <tr>
                                    <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('id')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">ID Tiket {getSortIcon('id')}</div>
                                    </th>
                                    <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('date')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Dibuat {getSortIcon('date')}</div>
                                    </th>
                                    <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('topic')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Topik Kendala {getSortIcon('topic')}</div>
                                    </th>
                                    <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('customer')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Pelanggan {getSortIcon('customer')}</div>
                                    </th>
                                    <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('location')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Lokasi {getSortIcon('location')}</div>
                                    </th>
                                    <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('status')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Status {getSortIcon('status')}</div>
                                    </th>
                                    <th className="px-6 py-4 font-normal whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Aksi</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-500 animate-pulse font-bold">Memuat Tugas...</td></tr>
                                ) : apiError ? (
                                    <tr><td colSpan={6} className="px-6 py-20 text-center text-red-500 font-bold bg-red-50">{apiError}</td></tr>
                                ) : currentData.length > 0 ? (
                                    currentData.map((item, idx) => (
                                        <TechnicianComplaintRow key={idx} item={item} handleStartProcess={handleStartProcess} setSelectedTicket={setSelectedTicket} />
                                    ))
                                ) : (
                                    <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-500 italic">Belum ada tiket pengaduan untuk akun ini.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden divide-y divide-gray-100">
                        {currentData.map((item, idx) => (
                            <TechnicianComplaintCard key={idx} item={item} handleStartProcess={handleStartProcess} setSelectedTicket={setSelectedTicket} />
                        ))}
                    </div>

                    <div className="flex flex-row items-center justify-between p-6 text-sm text-gray-500 border-t border-gray-100 bg-white gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 font-medium">
                            <span className="hidden sm:inline">Rows per page:</span>
                            <div className="relative">
                                <button
                                    onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all shadow-sm"
                                >
                                    {rowsPerPage} <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showRowsDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowRowsDropdown(false)}></div>
                                        <div className="absolute bottom-full left-0 mb-2 w-16 sm:w-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20 animate-in fade-in slide-in-from-bottom-2">
                                            {[5, 10, 20, 50].map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => { setRowsPerPage(val); setCurrentPage(1); setShowRowsDropdown(false); }}
                                                    className={`w-full text-left px-3 sm:px-4 py-1.5 text-xs sm:text-sm transition-colors ${rowsPerPage === val ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="text-xs sm:text-sm font-medium">
                            {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems} <span className="hidden sm:inline">items</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-2 sm:px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center font-bold text-gray-600"
                            >
                                <span className="sm:hidden">&lt;</span>
                                <span className="hidden sm:inline">Previous</span>
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-2 sm:px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center font-bold text-gray-600"
                            >
                                <span className="sm:hidden">&gt;</span>
                                <span className="hidden sm:inline">Next</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ComplaintDetailModal
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                ticket={selectedTicket}
                role="technician"
                onActionSuccess={fetchData}
            />

            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-[#1E293B] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700/50 backdrop-blur-md">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
