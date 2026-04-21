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
    FileDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
                                className={`px-4 py-2 rounded-lg text-[11px] font-extrabold shadow-sm active:scale-95 transition-all ${
                                    btn.variant === 'primary' ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]' : 'bg-gray-100 text-gray-400'
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

const TechnicianComplaintRow = ({ item, handleStartProcess, setSelectedTicket }) => {
    const { timer, timeElapsedMinutes } = useSLA(item.createdAt, item.assignedAt, item.processStartedAt, item.status);
    const displayStatus = formatStatusDisplay(item.status, 'technician');
    const actions = getActionButtons('technician', item.status, timeElapsedMinutes);

    return (
        <tr className="hover:bg-gray-50/50 transition-colors group">
            <td className="px-3 md:px-4 lg:px-6 py-3 lg:py-4 font-bold text-gray-900 tracking-tight whitespace-nowrap">{item.id}</td>
            <td className="px-3 md:px-4 lg:px-6 py-3 lg:py-4 text-gray-500 whitespace-nowrap">{item.date}</td>
            <td className="px-3 md:px-4 lg:px-6 py-3 lg:py-4 font-medium text-gray-900 whitespace-nowrap">{item.customer}</td>
            <td className="px-3 md:px-4 lg:px-6 py-3 lg:py-4 text-gray-500 whitespace-nowrap">{item.location}</td>
            <td className="px-3 md:px-4 lg:px-6 py-3 lg:py-4 text-gray-600 truncate max-w-[400px]" title={item.topic}>
                {item.topic}
            </td>
            <td className="px-3 md:px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                <div className="flex flex-col items-start gap-1">
                    <TicketStatusBadge 
                        status={item.status} 
                        rating={item.rating}
                        assignedAt={item.assignedAt}
                        processStartedAt={item.processStartedAt}
                    />
                </div>
            </td>
            <td className="px-3 md:px-4 lg:px-6 py-3 lg:py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                    {actions.map((btn, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (btn.action === 'process') handleStartProcess(item);
                                else setSelectedTicket(item);
                            }}
                            className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-all ${
                                btn.variant === 'primary' ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]' : 'bg-gray-100 text-gray-400'
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

// --- Dummy Data (Telah dibersihkan dan dipindah ke Database MongoDB Cloud via Seeder) ---

export function PengaduanKlienPage({ onNavigate }) {
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const [complaints, setComplaints] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- Fetch Logic ---
    const token = localStorage.getItem('bieon_token');

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/complaints/technician', {
                headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
                cache: 'no-store'
            });

            if (response.ok) {
                const data = await response.json();
                
                // Mapped structure for formatting UI
                const formattedComplaints = data.map(item => {
                    const safeId = item._id ? item._id.toString() : '';
                    return {
                        ...item,
                        originalId: item._id,
                        id: safeId ? `TCK-${safeId.substring(Math.max(0, safeId.length - 6)).toUpperCase()}` : 'TCK-000000',
                        date: item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':') : '-',
                        customer: item.homeowner?.fullName || 'Unknown User',
                        location: item.homeowner?.address || '-',
                        topic: item.topic || 'No Topic',
                        status: item.status?.toLowerCase() || 'unassigned',
                        clientInfo: item.homeowner ? {
                            name: item.homeowner.fullName,
                            email: item.homeowner.email,
                            phone: item.homeowner.phoneNumber,
                            address: item.homeowner.address,
                            idBieon: item.homeowner.bieonId
                        } : {},
                        technicianInfo: null
                    };
                });
                setComplaints(formattedComplaints);
            }
        } catch (error) {
            console.error("Gagal menarik data pengaduan teknisi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [logRequestText, setLogRequestText] = useState('');
    const [statusNoteText, setStatusNoteText] = useState('');
    const [updateTargetStatus, setUpdateTargetStatus] = useState('');

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

    const handleAction = async (actionType) => {
        if (!selectedTicket) return;

        try {
            if (actionType === 'request_log') {
                const response = await fetch(`/api/complaints/${selectedTicket.originalId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        logRequested: true,
                        logRequestedAt: new Date(),
                        logRequestNote: logRequestText
                    })
                });

                if (response.ok) {
                    showToast("Permintaan data log telah dikirim ke SuperAdmin.");
                    setIsLogModalOpen(false);
                    setLogRequestText('');
                    fetchData();
                }
            } else if (actionType === 'update_progress') {
                const response = await fetch(`/api/complaints/${selectedTicket.originalId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        status: updateTargetStatus,
                        note: statusNoteText
                    })
                });

                if (response.ok) {
                    showToast(`Tiket berhasil di-update ke status ${updateTargetStatus}.`);
                    setIsUpdateModalOpen(false);
                    setStatusNoteText('');
                    setSelectedTicket(null);
                    fetchData();
                }
            }
        } catch (error) {
            console.error("Error executing action:", error);
            showToast("Terjadi kesalahan sistem.");
        }
    };

    const stats = {
        waiting: complaints.filter(c => c.status === 'menunggu respons' || c.status === 'overdue respons').length,
        processing: complaints.filter(c => c.status === 'diproses' || c.status === 'overdue perbaikan').length,
        completed: complaints.filter(c => c.status === 'selesai' || c.status === 'menunggu konfirmasi').length,
        avgRating: 4.8
    };

    const processedData = useMemo(() => {
        let result = [...complaints];

        if (selectedStatusFilter) {
            result = result.filter(c => c.status === selectedStatusFilter.toLowerCase());
        }

        if (selectedCategoryFilter) {
            result = result.filter(c => c.category === selectedCategoryFilter);
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
                    aVal = new Date(aVal.replace(',', '')).getTime() || 0;
                    bVal = new Date(bVal.replace(',', '')).getTime() || 0;
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [complaints, searchQuery, selectedStatusFilter, selectedCategoryFilter, sortConfig]);

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
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full text-[9px] md:text-[10px] font-bold border border-red-100 whitespace-nowrap">
                                <AlertCircle className="w-2.5 h-2.5 md:w-3 md:h-3" /> Urgent
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-[9px] md:text-xs font-medium mb-0.5 md:mb-1 truncate">Menunggu Respons</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.waiting}</div>
                        </div>
                        <div className="mt-2 md:mt-4 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 w-1/3 rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-2 md:mb-4">
                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Clock className="w-3.5 h-3.5 md:w-5 md:h-5" />
                            </div>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] md:text-[10px] font-bold border border-blue-100 whitespace-nowrap">
                                <ArrowDown className="w-2.5 h-2.5 md:w-3 md:h-3" /> +1 Hari
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-[9px] md:text-xs font-medium mb-0.5 md:mb-1 truncate">Sedang Diproses</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.processing}</div>
                        </div>
                        <div className="mt-2 md:mt-4 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-1/2 rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-2 md:mb-4">
                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-3.5 h-3.5 md:w-5 md:h-5" />
                            </div>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] md:text-[10px] font-bold border border-emerald-100 whitespace-nowrap">
                                <ArrowUp className="w-2.5 h-2.5 md:w-3 md:h-3" /> +12%
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-[9px] md:text-xs font-medium mb-0.5 md:mb-1 truncate">Tiket Selesai</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.completed}</div>
                        </div>
                        <div className="mt-2 md:mt-4 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[80%] rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-2 md:mb-4">
                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                <Star className="w-3.5 h-3.5 md:w-5 md:h-5" />
                            </div>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[9px] md:text-[10px] font-bold border border-amber-100 whitespace-nowrap">
                                <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" /> 4.8/5
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-[9px] md:text-xs font-medium mb-0.5 md:mb-1 truncate">Rata-Rata Penilaian</div>
                            <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.avgRating}</div>
                        </div>
                        <div className="mt-2 md:mt-4 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 w-[95%] rounded-full"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Riwayat Pengaduan Saya</h2>
                                <p className="text-xs text-gray-500 mt-0.5 italic">Pantau status perbaikan Anda secara real-time. Jangan lupa konfirmasi jika tugas sudah selesai.</p>
                            </div>

                            <div className="flex flex-row items-center gap-2 md:gap-3 w-full lg:w-auto shrink-0">
                                <div className="relative flex-1 sm:w-auto md:w-64 group">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Cari Pelanggan atau ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 bg-white transition-all"
                                    />
                                </div>

                                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                            className={`flex items-center justify-center sm:justify-between gap-1.5 md:gap-3 px-3 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all shadow-sm group ${showStatusDropdown ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-1.5 md:gap-2.5 overflow-hidden">
                                                <Filter className={`w-4 h-4 shrink-0 transition-colors ${showStatusDropdown || selectedStatusFilter ? 'text-teal-500' : 'text-gray-400'}`} />
                                                <span className={`hidden sm:inline-block truncate ${selectedStatusFilter ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {selectedStatusFilter || 'Semua Status'}
                                                </span>
                                            </div>
                                            <ChevronDown className={`hidden sm:block w-4 h-4 shrink-0 text-gray-400 transition-all ${showStatusDropdown ? 'rotate-180 text-teal-500' : ''}`} />
                                        </button>
                                        {showStatusDropdown && (
                                            <>
                                                <div className="fixed inset-0 z-[10]" onClick={() => setShowStatusDropdown(false)}></div>
                                                <div className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-[20] animate-in fade-in zoom-in-95 duration-200">
                                                    {['', 'Menunggu Respons', 'Diproses', 'Menunggu Konfirmasi', 'Selesai'].map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => { setSelectedStatusFilter(s); setShowStatusDropdown(false); setCurrentPage(1); }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedStatusFilter === s ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                        >
                                                            {s || 'Semua Status'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => showToast("Mengekspor data pengaduan ke PDF...")}
                                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#E6F5F0] text-[#0F9E78] rounded-xl text-sm font-bold hover:bg-[#d6efe6] transition-colors shrink-0 shadow-sm border border-transparent"
                                    >
                                        <Download className="w-4 h-4 shrink-0" />
                                        <span className="hidden sm:inline-block">Export</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Table (Auto Width with Scroll) */}
                    <div className="hidden md:block w-full overflow-x-auto pb-4 custom-scrollbar-x">
                        <table className="w-full text-left text-[14px] text-gray-700 table-auto min-w-max">
                            <thead className="bg-white border-b border-gray-200 text-gray-500 select-none">
                                <tr>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap" onClick={() => requestSort('id')}>
                                        <div className="flex items-center gap-1.5">ID Tiket {getSortIcon('id')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap" onClick={() => requestSort('date')}>
                                        <div className="flex items-center gap-1.5">Dibuat {getSortIcon('date')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap" onClick={() => requestSort('customer')}>
                                        <div className="flex items-center gap-1.5">Pelanggan {getSortIcon('customer')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap" onClick={() => requestSort('location')}>
                                        <div className="flex items-center gap-1.5">Lokasi {getSortIcon('location')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap max-w-[400px]" onClick={() => requestSort('topic')}>
                                        <div className="flex items-center gap-1.5">Topik Kendala {getSortIcon('topic')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap" onClick={() => requestSort('status')}>
                                        <div className="flex items-center gap-1.5">Status {getSortIcon('status')}</div>
                                    </th>
                                    <th className="px-3 md:px-4 lg:px-6 py-4 w-[120px] font-normal whitespace-nowrap text-center text-xs uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="w-10 h-10 border-4 border-gray-100 border-t-[#0D9488] rounded-full animate-spin"></div>
                                                <p className="text-sm font-bold text-gray-500 animate-pulse">Menarik Tugas dari Server...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentData.length > 0 ? (
                                    currentData.map((item, idx) => (
                                        <TechnicianComplaintRow 
                                            key={idx} 
                                            item={item} 
                                            idx={idx}
                                            handleStartProcess={handleStartProcess}
                                            setSelectedTicket={setSelectedTicket}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="w-8 h-8 opacity-20" />
                                                <div>Belum ada tiket pengaduan yang ditugaskan ke Anda.</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>


                    {/* Mobile Card List */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <div className="w-10 h-10 border-4 border-gray-100 border-t-[#0D9488] rounded-full animate-spin"></div>
                                <p className="text-sm font-bold text-gray-500 animate-pulse">Menarik Tugas...</p>
                            </div>
                        ) : currentData.length > 0 ? (
                            currentData.map((item, idx) => (
                                <TechnicianComplaintCard 
                                    key={item.originalId || idx} 
                                    item={item} 
                                    idx={idx}
                                    handleStartProcess={handleStartProcess}
                                    setSelectedTicket={setSelectedTicket}
                                />
                            ))
                        ) : (
                            <div className="py-20 text-center text-gray-500">Tidak ada pengaduan.</div>
                        )}
                    </div>


                    {/* Pagination Footer */}
                    <div className="flex flex-row items-center justify-between text-sm text-gray-500 pt-4 p-6 border-t border-gray-100 gap-2 sm:gap-4 bg-[#FBFDFB]/50">
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
                                            {[5, 10, 20].map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => {
                                                        setRowsPerPage(val);
                                                        setCurrentPage(1);
                                                        setShowRowsDropdown(false);
                                                    }}
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
                                disabled={currentPage === 1 || totalItems === 0}
                                className="px-2 sm:px-4 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center font-bold text-gray-600 shadow-sm"
                            >
                                <span className="sm:hidden">&lt;</span>
                                <span className="hidden sm:inline">Previous</span>
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalItems === 0}
                                className="px-2 sm:px-4 py-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center font-bold text-gray-600 shadow-sm"
                            >
                                <span className="sm:hidden">&gt;</span>
                                <span className="hidden sm:inline">Next</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: DETAIL PENGADUAN (Shared Component) */}
            <ComplaintDetailModal
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                ticket={selectedTicket}
                renderActions={
                    <>
                        {selectedTicket?.status !== 'Selesai' && selectedTicket?.status !== 'Menunggu Konfirmasi' && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" /> Aksi Teknisi
                                </h3>

                                {!selectedTicket?.logConfirmed ? (
                                    <button
                                        onClick={() => setIsLogModalOpen(true)}
                                        disabled={selectedTicket?.logRequested}
                                        className={`w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all shadow-sm ${selectedTicket?.logRequested ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                    >
                                        {selectedTicket?.logRequested ? 'Log Diminta...' : 'Minta Data Log'}
                                    </button>
                                ) : (
                                    <button
                                        className="w-full py-3 bg-[#E1F2EB] text-[#1E4D40] font-bold rounded-xl text-xs hover:bg-[#d4ece3] transition-all shadow-sm flex items-center justify-center gap-2"
                                        onClick={() => { alert('Mengarahkan ke halaman data log...'); }}
                                    >
                                        Lihat Data Log <FileText className="w-3 h-3" />
                                    </button>
                                )}

                                <button
                                    onClick={() => { setUpdateTargetStatus(selectedTicket?.status); setIsUpdateModalOpen(true); }}
                                    className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 transition-all shadow-sm"
                                >
                                    Update Progress
                                </button>

                                <button
                                    onClick={() => { setUpdateTargetStatus('Menunggu Konfirmasi'); setStatusNoteText(''); setIsUpdateModalOpen(true); }}
                                    className="w-full py-3 bg-[#0D9488] text-white font-bold rounded-xl text-xs hover:bg-[#0F766E] shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
                                >
                                    Perbaikan Selesai
                                </button>
                            </div>
                        )}

                        {selectedTicket?.status === 'Menunggu Konfirmasi' && (
                            <div className="bg-orange-50 rounded-2xl p-6 shadow-sm border border-orange-100 border-dashed text-center">
                                <Clock className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                                <p className="font-bold text-orange-900 text-sm mb-1">Menunggu Konfirmasi</p>
                                <p className="text-xs text-orange-700 leading-relaxed px-2">Tiket akan otomatis selesai setelah Homeowner memberikan penilaian.</p>
                            </div>
                        )}

                        {selectedTicket?.status === 'Selesai' && (
                            <div className="bg-emerald-50 rounded-2xl p-6 shadow-sm border border-emerald-100 border-dashed text-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                                <p className="font-bold text-emerald-900 text-sm mb-1">Riwayat Selesai</p>
                                <p className="text-xs text-emerald-700 leading-relaxed px-2">Tiket ini telah diselesaikan dan dikonfirmasi oleh pelanggan.</p>
                                <button
                                    onClick={() => alert('Fitur Ekspor PDF Riwayat...')}
                                    className="mt-4 w-full py-3 bg-white border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs hover:bg-emerald-50 transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Ekspor Riwayat (PDF)
                                </button>
                            </div>
                        )}
                    </>
                }
            />

            {/* MODAL: MINTA DATA LOG */}
            {isLogModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Permintaan Data Log kepada SuperAdmin</h2>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">Sistem akan mengirimkan notifikasi permintaan akses data log historis kepada SuperAdmin.</p>

                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
                            <textarea
                                value={logRequestText}
                                onChange={(e) => setLogRequestText(e.target.value)}
                                placeholder="Tuliskan data spesifik yang dibutuhkan, misal: Log tegangan Master Node 3 hari terakhir."
                                className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400 resize-none h-32"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setIsLogModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">Batal</button>
                            <button
                                onClick={() => handleAction('request_log')}
                                disabled={!logRequestText.trim()}
                                className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                            >
                                Kirim Permintaan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: UPDATE PROGRESS */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 font-primary">Update Status</h2>

                        <div className="space-y-5 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Status</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUpdateStatusDropdown(!showUpdateStatusDropdown)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700"
                                    >
                                        {updateTargetStatus} <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUpdateStatusDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showUpdateStatusDropdown && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1.5 overflow-hidden">
                                            {['Baru', 'Diproses', 'Menunggu Konfirmasi'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => { setUpdateTargetStatus(s); setShowUpdateStatusDropdown(false); }}
                                                    className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${updateTargetStatus === s ? 'text-teal-600 font-bold bg-teal-50' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Status Note</label>
                                <textarea
                                    value={statusNoteText}
                                    onChange={(e) => setStatusNoteText(e.target.value)}
                                    placeholder="Add a note about the status change..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 text-sm h-32 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setIsUpdateModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all">Batal</button>
                            <button
                                onClick={() => handleAction('update_progress')}
                                className="flex-1 py-3.5 bg-[#0D9488] text-white font-bold rounded-xl hover:bg-[#0F766E] transition-all shadow-lg shadow-teal-500/20"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unified Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-[#1E293B] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700/50 backdrop-blur-md">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
