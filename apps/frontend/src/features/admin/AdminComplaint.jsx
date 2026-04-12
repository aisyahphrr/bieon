import React, { useState, useMemo } from 'react';
import {
    Users,
    Zap,
    Bell,
    ChevronDown,
    ShieldCheck,
    Search,
    Filter,
    Download,
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
    Activity
} from 'lucide-react';
import { ComplaintDetailModal } from '../complaints/ComplaintDetailModal';
import { SuperAdminLayout } from './SuperAdminLayout';

// --- Dummy Data (Moved outside to avoid ReferenceError in state initialization) ---
const initialComplaints = [
    {
        id: 'TCK-0105',
        date: '28 Feb 2026, 08:15',
        customer: 'Asri Sarassufi',
        location: 'Kartika Wanasari',
        topic: 'Smart Plug kipas exhaust tidak bisa di-ON-kan via web',
        device: 'Smart Plug (Exhaust) - R3 Kitchen',
        technician: 'Unassigned',
        status: 'Menunggu Respons',
        sla: '5 Menit',
        urgency: 'High',
        category: 'Energi & Kelistrikan',
        description: 'Saya sudah mencoba menyalakan kipas exhaust melalui web dashboard tapi tidak ada respons, padahal icon menunjukkan status loading tapi akhirnya kembali OFF.',
        clientInfo: {
            name: 'Asri Sarassufi',
            email: 'asri@gmail.com',
            phone: '+62 856-890-689',
            address: 'Kartika Wanasari Blok Dbdw gcwk wkhclwd chow',
            idBieon: 'BIEON-001'
        },
        technicianInfo: null,
        timeline: [
            { time: '28 Feb 2026, 08:15', desc: 'Laporan pengaduan berhasil dibuat.', status: 'Status: Menunggu Respons' }
        ],
        files: [],
        rating: '-',
        logRequested: false,
        logConfirmed: false
    },
    {
        id: 'TCK-0102',
        date: '28 Feb 2026, 10:00',
        customer: 'Ahmad Fauzi',
        location: 'Jl. Melati Bogor',
        topic: 'Angka PM2.5 udara selalu stuck di angka 0',
        device: 'R2 Bedroom - Node Udara',
        technician: 'Budi Santoso',
        status: 'Overdue Respons',
        sla: 'Lewat 15 menit',
        urgency: 'High',
        category: 'Kenyamanan & Udara',
        description: 'Sensor kualitas udara di kamar tidur utama sepertinya mengalami error atau nge-hang. Indikator suhu dan kelembapan terbaca dengan normal, tetapi nilai partikel debu PM2.5 dan PM10 terus menerus menunjukkan angka 0 µg/m³ selama 3 hari terakhir.',
        clientInfo: {
            name: 'Ahmad Fauzi',
            email: 'fauzi@gmail.com',
            phone: '+62 811-999-888',
            address: 'Jl. Melati No. 12, Kel. Menteng, Bogor',
            idBieon: 'BIEON-002'
        },
        technicianInfo: {
            name: 'Budi Santoso',
            phone: '+62 812-444-555',
            targetDate: '02 Mar 2026, 10:00 WIB'
        },
        timeline: [
            { time: '28 Feb 2026, 15:30', desc: 'Teknisi meminta data log historis dari SuperAdmin untuk dikaji.' },
            { time: '28 Feb 2026, 10:15', desc: 'Laporan diterima. Teknisi akan melakukan troubleshooting via remote terlebih dahulu.' },
            { time: '28 Feb 2026, 10:00', desc: 'Laporan pengaduan berhasil dibuat.', status: 'Status: Menunggu Respons' }
        ],
        files: [],
        rating: '-',
        logRequested: true,
        logConfirmed: false
    },
    {
        id: 'TCK-0098',
        date: '27 Feb 2026, 15:30',
        customer: 'Bpk. Budi',
        location: 'Perum Dramaga',
        topic: 'Nilai tegangan Power Meter tiba-tiba hilang',
        device: 'Master Node - Power Meter Utama',
        technician: 'Andi Pratama',
        status: 'Diproses',
        sla: '45 Jam',
        urgency: 'Medium',
        category: 'Energi & Kelistrikan',
        description: 'Sejak tadi malam sekitar pukul 19.00 WIB, grafik tegangan (Voltage) dan arus (Current) dari Power Meter di dashboard tiba-tiba menunjukkan angka 0.',
        clientInfo: {
            name: 'Bpk. Budi',
            email: 'budi@gmail.com',
            phone: '+62 812-333-444',
            address: 'Perum Dramaga Blok B No. 12, Bogor',
            idBieon: 'BIEON-012'
        },
        technicianInfo: {
            name: 'Andi Pratama',
            phone: '+62 855-666-777',
            targetDate: '01 Mar 2026, 15:30 WIB'
        },
        timeline: [
            { time: '27 Feb 2026, 16:00', desc: 'Teknisi sedang melakukan pengecekan koneksi Modbus.' },
            { time: '27 Feb 2026, 15:30', desc: 'Laporan pengaduan berhasil dibuat.' }
        ],
        files: [],
        rating: '-'
    },
    {
        id: 'TCK-0110',
        date: '27 Feb 2026, 09:00',
        customer: 'Budi Hartono',
        location: 'Sentul City',
        topic: 'Kebocoran pada pipa distribusi utama',
        device: 'Pipa Air Utama',
        technician: 'Joko Widodo',
        status: 'Overdue Perbaikan',
        sla: 'Lewat 2 jam',
        urgency: 'High',
        category: 'Air Sanitasi',
        description: 'Ada rembesan air di dekat meteran air utama.',
        clientInfo: {
            name: 'Budi Hartono',
            email: 'hartono@gmail.com',
            phone: '+62 822-111-222',
            address: 'Sentul City Blok A No. 5',
            idBieon: 'BIEON-101'
        },
        technicianInfo: {
            name: 'Joko Widodo',
            phone: '+62 899-777-666',
            targetDate: '28 Feb 2026, 09:00 WIB'
        },
        timeline: [
            { time: '27 Feb 2026, 09:00', desc: 'Laporan pengaduan berhasil dibuat.' }
        ],
        files: [],
        rating: '-'
    },
    {
        id: 'TCK-0085',
        date: '20 Feb 2026, 09:15',
        customer: 'Ibu Rina',
        location: 'Sentul City',
        topic: 'Notifikasi Door Sensor sering telat masuk',
        device: 'R1 Living - Door Sensor',
        technician: 'Budi Santoso',
        status: 'Selesai',
        sla: 'Selesai',
        urgency: 'Medium',
        category: 'Keamanan',
        description: 'Notifikasi pintu terbuka/tertutup terlambat masuk ke HP sekitar 5-10 menit.',
        clientInfo: {
            name: 'Ibu Rina',
            email: 'rina@gmail.com',
            phone: '+62 877-666-555',
            address: 'Sentul City, Cluster Pine Forest No. 45',
            idBieon: 'BIEON-045'
        },
        technicianInfo: {
            name: 'Budi Santoso',
            phone: '+62 812-444-555',
            targetDate: 'Selesai'
        },
        timeline: [
            { time: '21 Feb 2026, 10:00', desc: 'Homeowner mengonfirmasi perbaikan selesai.', status: 'Status: Selesai' }
        ],
        files: [],
        rating: 5,
        logRequested: false,
        logConfirmed: false
    }
];

export default function AdminComplaint({ onNavigate }) {
    // --- Filter & Pagination States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);
    const [complaints, setComplaints] = useState(initialComplaints);

    // --- Modal States ---
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isPingModalOpen, setIsPingModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isLogConfirmOpen, setIsLogConfirmOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const [selectedPingType, setSelectedPingType] = useState('');

    // --- Dummy Data ---
    const technicians = [
        { id: 'TECH-001', name: 'Budi Santoso', status: 'Standby', activeTickets: 2 },
        { id: 'TECH-002', name: 'Andi Pratama', status: 'On Tasks', activeTickets: 5 },
        { id: 'TECH-003', name: 'Siti Aminah', status: 'Standby', activeTickets: 1 },
        { id: 'TECH-004', name: 'Joko Widodo', status: 'Standby', activeTickets: 0 },
    ];

    const stats = [
        { label: 'Total Tiket Aktif (BIEON)', value: '12', trend: '↑ 5% dari minggu lalu', color: 'blue', icon: Activity },
        { label: 'Tiket Overdue (Batas SLA)', value: '1', trend: '↑ Naik 1 kasus', color: 'red', icon: AlertCircle },
        { label: 'Total Diselesaikan', value: '142', trend: 'Rata-rata 24 jam', color: 'emerald', icon: CheckCircle2 },
        { label: 'Global CSAT', value: '4.6', trend: '↓ Turun 0.1 poin', color: 'amber', icon: Star, isRating: true }
    ];

    // --- Filtering Logic ---
    const processedData = useMemo(() => {
        let filtered = [...complaints];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.id.toLowerCase().includes(q) ||
                item.customer.toLowerCase().includes(q) ||
                item.topic.toLowerCase().includes(q) ||
                item.device.toLowerCase().includes(q) ||
                item.technician.toLowerCase().includes(q) ||
                (item.clientInfo?.idBieon && item.clientInfo.idBieon.toLowerCase().includes(q))
            );
        }
        if (selectedStatusFilter) {
            if (selectedStatusFilter === 'Unassigned') {
                filtered = filtered.filter(item => item.technician === 'Unassigned');
            } else {
                filtered = filtered.filter(item => item.status === selectedStatusFilter);
            }
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Ensure rating is handled as a number
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
    }, [searchQuery, selectedStatusFilter, selectedCategoryFilter, sortConfig]);

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
        switch (status) {
            case 'Menunggu Respons':
            case 'Baru': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Overdue Respons':
            case 'Overdue Perbaikan': return 'bg-red-50 text-red-600 border-red-100 font-bold';
            case 'Sedang Diperbaiki':
            case 'Diproses': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Waiting Feedback':
            case 'Menunggu Konfirmasi': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Selesai': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const getStatusDotColor = (status) => {
        switch (status) {
            case 'Menunggu Respons':
            case 'Baru': return 'bg-amber-400';
            case 'Overdue Respons':
            case 'Overdue Perbaikan': return 'bg-red-500';
            case 'Sedang Diperbaiki':
            case 'Diproses': return 'bg-blue-500';
            case 'Waiting Feedback':
            case 'Menunggu Konfirmasi': return 'bg-purple-500';
            case 'Selesai': return 'bg-emerald-500';
            default: return 'bg-gray-400';
        }
    };

    const getStatusBadge = (status, sla, rating) => {
        const style = { bg: getStatusStyle(status), dot: getStatusDotColor(status) };
        const label = status === 'Baru' ? 'Menunggu Respons' : status;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${getStatusStyle(status)} border whitespace-nowrap`}>
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(status)}`}></span>
                {label}
                {sla && status !== 'Selesai' && (
                    <span className="font-normal opacity-90 ml-0.5">({sla})</span>
                )}
            </span>
        );
    };

    // --- Action Handlers ---
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

    const handleTransfer = (ticket) => {
        setSelectedTicket(ticket);
        setIsTransferModalOpen(true);
    };

    const confirmAssign = () => {
        alert(`Teknisi ${selectedTechnician} telah ditugaskan ke tiket ${selectedTicket.id}`);
        setIsAssignModalOpen(false);
        setSelectedTechnician('');
    };

    const confirmPing = () => {
        alert(`Peringatan "${selectedPingType}" telah dikirim ke teknisi ${selectedTicket.technician}`);
        setIsPingModalOpen(false);
        setSelectedPingType('');
    };

    const handleLogAction = (ticketId, isApproved) => {
        setComplaints(prev => prev.map(c => {
            if (c.id === ticketId) {
                return {
                    ...c,
                    logConfirmed: true,
                    logApproved: isApproved
                };
            }
            return c;
        }));

        // Update selectedTicket so the modal UI updates immediately
        if (selectedTicket && selectedTicket.id === ticketId) {
            setSelectedTicket(prev => ({
                ...prev,
                logConfirmed: true,
                logApproved: isApproved
            }));
        }
    };

    return (
        <SuperAdminLayout activeMenu="Pengaduan" onNavigate={onNavigate} title="Manajemen Pengaduan">
            <div className="space-y-6">
                {/* Stats Cards - REVISED PER USER REQUEST */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`bg-white p-6 rounded-[2rem] border transition-all hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-between min-h-[160px] ${stat.color === 'red' ? 'border-red-100 shadow-red-50/50' : 'border-gray-100 shadow-sm'}`}>
                            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${stat.color === 'red' ? 'bg-red-500' : stat.color === 'emerald' ? 'bg-emerald-500' : stat.color === 'blue' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>

                            <div className="relative z-10 space-y-4">
                                {/* Simbol di Paling Atas Kiri */}
                                <div className={`p-3 rounded-2xl w-fit ${stat.color === 'red' ? 'bg-red-50 text-red-600' : stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>

                                {/* Judul di bawahnya ada spasi */}
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                            </div>

                            <div className="relative z-10 flex items-end justify-between mt-auto">
                                {/* Angka di Bawah Judul */}
                                <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{stat.value}{stat.isRating && <span className="text-2xl ml-1 text-amber-400">★</span>}</h3>

                                {/* Tren di Samping Angka (Kanan Bawah) */}
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${stat.color === 'red' ? 'bg-red-50 text-red-600 border-red-100' : stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : stat.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    {stat.trend}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table Control & Table Area - FLATTENED */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
                    {/* Header & Controls inside the same box */}
                    <div className="p-8 border-b border-gray-50">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">Daftar Pengaduan Masuk</h2>
                                <p className="text-xs text-gray-500 mt-1 italic leading-relaxed">Pantau status laporan serta penugasan teknisi BIEON Smart Monitoring secara real-time.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                {/* Search */}
                                <div className="relative flex-1 lg:w-72 group">
                                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#009B7C] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Cari Tiket, Hub, atau Kendala..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#009B7C] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-semibold"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        className={`flex items-center gap-2 px-5 py-3.5 bg-white border rounded-2xl text-sm font-medium transition-all shadow-sm ${showStatusDropdown ? 'border-[#009B7C] ring-4 ring-emerald-500/10' : 'border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <Filter className="w-4 h-4 text-gray-400" />
                                        {selectedStatusFilter || 'Semua Status'}
                                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showStatusDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)}></div>
                                            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-[1.5rem] shadow-xl py-2 z-20">
                                                {['', 'Menunggu Respons', 'Unassigned', 'Diproses', 'Selesai', 'Overdue Respons', 'Overdue Perbaikan'].map(s => (
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

                                {/* Export Data */}
                                <button
                                    onClick={() => alert("Eksport PDF...")}
                                    className="flex items-center gap-3 px-6 py-3.5 bg-[#E1F2EB] text-[#1E4D40] rounded-2xl text-sm font-bold hover:bg-[#d4ece3] transition-all shadow-sm group"
                                >
                                    <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                                    <span>Export</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        <table className="w-full text-left min-w-[1000px] table-auto">
                            <thead className="bg-[#F8FAFB]/50 border-b border-gray-100 text-gray-500 select-none">
                                <tr>
                                    <th className="px-8 py-5 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('id')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">ID Tiket {getSortIcon('id')}</div>
                                    </th>
                                    <th className="px-8 py-5 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('date')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Tanggal Dibuat {getSortIcon('date')}</div>
                                    </th>
                                    <th className="px-8 py-5 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap outline-none" onClick={() => requestSort('customer')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Pelanggan {getSortIcon('customer')}</div>
                                    </th>
                                    <th className="px-8 py-5 font-normal whitespace-nowrap outline-none">
                                        <div className="uppercase tracking-wider text-[11px] font-bold">Topik Kendala</div>
                                    </th>
                                    <th className="px-8 py-5 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('technician')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Teknisi {getSortIcon('technician')}</div>
                                    </th>
                                    <th className="px-8 py-5 font-normal cursor-pointer hover:bg-gray-50 transition-colors text-center outline-none" onClick={() => requestSort('rating')}>
                                        <div className="flex items-center justify-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Rating {getSortIcon('rating')}</div>
                                    </th>
                                    <th className="px-8 py-5 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('status')}>
                                        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-bold">Status {getSortIcon('status')}</div>
                                    </th>
                                    <th className="px-8 py-5 w-[140px] font-normal whitespace-nowrap text-center text-[11px] font-bold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#F8FAFB]/50 transition-colors group text-[#374151]">
                                            <td className="px-8 py-5 text-[13px] font-bold text-gray-900 whitespace-nowrap">{item.id}</td>
                                            <td className="px-8 py-5 text-[13px] text-gray-500 font-medium whitespace-nowrap">{item.date}</td>
                                            <td className="px-8 py-5 text-[13px] font-bold text-gray-800 whitespace-nowrap">{item.customer}</td>
                                            <td className="px-8 py-5 text-[13px] font-medium text-gray-900 max-w-[300px] truncate" title={item.topic}>{item.topic}</td>
                                            <td className="px-8 py-5 text-[13px]">
                                                <span className={item.technician === 'Unassigned' ? 'text-gray-400 italic font-medium' : 'text-gray-700 font-bold'}>
                                                    {item.technician === 'Unassigned' ? 'Menunggu Teknisi' : item.technician}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-[13px] text-center">
                                                {item.status === 'Selesai' && item.rating !== '-' ? (
                                                    <div className="inline-flex items-center gap-1 font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                        <Star className="w-3 h-3 fill-amber-500" />
                                                        {item.rating}/5
                                                    </div>
                                                ) : <span className="text-gray-300 font-bold">0/0</span>}
                                            </td>
                                            <td className="px-8 py-5 text-[13px]">
                                                {getStatusBadge(item.status, item.sla)}
                                            </td>
                                            <td className="px-8 py-5 text-[13px]">
                                                <div className="flex items-center justify-center gap-2">
                                                    {item.status.includes('Overdue') ? (
                                                        <button
                                                            onClick={() => handlePing(item)}
                                                            className="px-4 py-2 bg-[#F98C12] text-white rounded-lg text-[11px] font-bold hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                                                        >
                                                            Ping Teknisi
                                                        </button>
                                                    ) : (item.status === 'Menunggu Respons' || item.technician === 'Unassigned') ? (
                                                        <button
                                                            onClick={() => handleAssign(item)}
                                                            className="px-4 py-2 bg-[#1076E5] text-white rounded-lg text-[11px] font-bold hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                                                        >
                                                            Alihkan Teknisi
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDetail(item)}
                                                            className="px-4 py-2 bg-[#009B7C] text-white rounded-lg text-[11px] font-bold hover:shadow-lg transition-all active:scale-95 flex items-center gap-1 whitespace-nowrap"
                                                        >
                                                            Detail <ChevronRight className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Activity className="w-12 h-12 text-gray-100" />
                                                <div className="space-y-1">
                                                    <p className="text-lg font-bold text-gray-900">Tidak ada pengaduan ditemukan</p>
                                                    <p className="text-sm font-semibold text-gray-400">Coba ubah filter atau kata kunci pencarian Anda</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer - SYNCED WITH ADMIN HISTORY */}
                    <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-[10px]">Rows per page:</span>
                            <div className="relative">
                                <button onClick={() => setShowRowsDropdown(!showRowsDropdown)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                                    {rowsPerPage} <ChevronDown className={`w-3 h-3 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showRowsDropdown && (
                                    <div className="absolute bottom-full left-0 mb-2 w-20 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-bottom-2">
                                        {[5, 10, 15, 20, 30, 50].map(val => (
                                            <button key={val} onClick={() => { setRowsPerPage(val); setShowRowsDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${rowsPerPage === val ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-500 hover:bg-gray-50'}`}>{val}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems}
                        </div>
                        <div className="flex items-center gap-3">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm">Previous</button>
                            <button disabled={currentPage >= Math.ceil(totalItems / rowsPerPage)} onClick={() => setCurrentPage(currentPage + 1)} className="px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm">Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SHARED DETAIL MODAL */}
            <ComplaintDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                ticket={selectedTicket}
                renderActions={
                    <div className="space-y-4">
                        {/* KONFIRMASI LOG DATA (Khusus jika ada permintaan dari teknisi) */}
                        {selectedTicket?.logRequested && (
                            <div className={`space-y-3 p-4 rounded-2xl border border-dashed transition-all duration-300 ${!selectedTicket?.logConfirmed ? 'bg-blue-50/50 border-blue-100' : selectedTicket?.logApproved ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                                <h4 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${!selectedTicket?.logConfirmed ? 'text-blue-600' : selectedTicket?.logApproved ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {!selectedTicket?.logConfirmed ? (
                                        <><FileText className="w-3 h-3" /> Teknisi Meminta Data Log</>
                                    ) : selectedTicket?.logApproved ? (
                                        <><ShieldCheck className="w-3 h-3" /> Laporan Log Disetujui</>
                                    ) : (
                                        <><XCircle className="w-3 h-3" /> Akses Log Ditolak</>
                                    )}
                                </h4>

                                {!selectedTicket?.logConfirmed ? (
                                    <div className="flex gap-2">
                                        <button
                                            className="flex-1 py-2.5 bg-[#009B7C] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider hover:bg-[#008268] transition-all shadow-sm flex items-center justify-center gap-2"
                                            onClick={() => handleLogAction(selectedTicket.id, true)}
                                        >
                                            <ShieldCheck className="w-3 h-3" /> Setujui
                                        </button>
                                        <button
                                            className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl text-[10px] uppercase tracking-wider hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                            onClick={() => handleLogAction(selectedTicket.id, false)}
                                        >
                                            <XCircle className="w-3 h-3 text-red-100" /> Tolak
                                        </button>
                                    </div>
                                ) : selectedTicket?.logApproved ? (
                                    <button
                                        onClick={() => alert('Membuka Viewer Data Log BIEON...')}
                                        className="w-full py-2.5 bg-white border border-emerald-100 text-emerald-700 font-bold rounded-xl text-[10px] uppercase tracking-wider hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Activity className="w-3 h-3" /> Lihat Data Log
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 text-[10px] text-red-400 font-medium italic">
                                        <AlertCircle className="w-3 h-3" /> Anda menolak permintaan ini. Teknisi tidak dapat melihat log.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ALIKHAN TEKNISI */}
                        {(selectedTicket?.status === 'Menunggu Respons' || selectedTicket?.technician === 'Unassigned') && (
                            <button
                                onClick={() => {
                                    handleAssign(selectedTicket);
                                    setIsDetailModalOpen(false);
                                }}
                                className="w-full py-3 bg-[#009B7C] text-white font-bold rounded-xl text-xs hover:bg-[#008268] transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                            >
                                <Users className="w-3.5 h-3.5" /> Konfirmasi Alihkan Teknisi
                            </button>
                        )}

                        {/* PING TEKNISI (Hanya jika Overdue) */}
                        {selectedTicket?.status?.includes('Overdue') && (
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

                        {/* DEFAULT ACTIONS (Agar tidak kosong seperti di screenshot) */}
                        <div className="pt-2 space-y-3">
                            <button
                                onClick={() => alert('Membuka Chat dengan Teknisi...')}
                                className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-3.5 h-3.5 text-[#009B7C]" /> Chat Teknisi
                            </button>
                            <button
                                onClick={() => alert('Menghubungi Homeowner via sistem...')}
                                className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Phone className="w-3.5 h-3.5 text-blue-500" /> Hubungi Homeowner
                            </button>
                        </div>
                    </div>
                }
            />

            <style>{`
                .modal-custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .modal-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .modal-custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 999px; }
                .modal-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
            `}</style>

            {/* MODAL: ALIHKAN / TUGASKAN TEKNISI */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-50">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-50 text-[#009B7C] rounded-2xl">
                                    <Users className="w-6 h-6" />
                                </div>
                                <button onClick={() => setIsAssignModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">Alihkan / Tugas Teknisi</h3>
                            <p className="text-xs text-gray-500 mt-2">Pilih teknisi yang tersedia untuk menangani tiket <span className="font-bold text-gray-700">#{selectedTicket?.id}</span>.</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Pilih Teknisi</label>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 modal-custom-scrollbar">
                                    {technicians.map(tech => (
                                        <button
                                            key={tech.id}
                                            onClick={() => setSelectedTechnician(tech.name)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedTechnician === tech.name ? 'border-[#009B7C] bg-emerald-50/50 ring-2 ring-emerald-500/10' : 'border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500 text-xs">{tech.name.charAt(0)}</div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-gray-800">{tech.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{tech.activeTickets} Tiket Aktif</p>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-0.5 rounded text-[9px] font-bold border ${tech.status === 'Standby' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                {tech.status}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={confirmAssign}
                                    disabled={!selectedTechnician}
                                    className="w-full py-4 bg-[#009B7C] text-white font-bold rounded-2xl text-sm hover:bg-[#008268] transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:shadow-none"
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
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-50">
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
                        <div className="p-8 space-y-6">
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
