import React, { useState, useMemo } from 'react';
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

// Module-level constant — avoids re-creation on every render
const INITIAL_COMPLAINTS_DATA = [

        {
            id: 'TCK-0105',
            date: '28 Feb 2026, 08:15',
            customer: 'Asri Sarassufi',
            location: 'Kartika Wanasari',
            topic: 'Smart Plug kipas exhaust tidak bisa di-ON-kan via web',
            status: 'Baru',
            sla: '5 Menit',
            urgency: 'High',
            category: 'Energi & Kelistrikan',
            device: 'Smart Plug (Exhaust) - R3 Kitchen',
            description: 'Saya sudah mencoba menyalakan kipas exhaust melalui web dashboard tapi tidak ada respons, padahal icon menunjukkan status loading tapi akhirnya kembali OFF.',
            clientInfo: {
                name: 'Asri Sarassufi',
                email: 'asri@gmail.com',
                phone: '+62 856-890-689',
                address: 'Kartika Wanasari Blok Dbdw gcwk wkhclwd chow',
                idBieon: 'TCK-0045'
            },
            technicianInfo: {
                name: 'Asri Sarassufi',
                phone: '+62 856-890-689',
                targetDate: 'Maksimal 28 Feb 2026, 08:15 WIB'
            },
            timeline: [
                { time: '28 Feb 2026, 08:15', desc: 'Laporan pengaduan berhasil dibuat.', status: 'Status: Menunggu Respons' }
            ],
            files: [
                { name: 'bukti_1.jpg', url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=200&q=80' },
                { name: 'dashboard.png', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80' },
                { name: 'panel.jpg', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=200&q=80' }
            ],
            logRequested: false,
            logConfirmed: false,
            progressNotes: []
        },
        {
            id: 'TCK-0102',
            date: '28 Feb 2026, 10:00',
            customer: 'Asri Sarassufi',
            location: 'Jl. Melati Bogor',
            topic: 'Angka PM2.5 udara selalu stuck di angka 0',
            status: 'Diproses',
            sla: '10 Menit',
            urgency: 'High',
            category: 'Kenyamanan & Udara',
            device: 'R2 Bedroom - Node Udara',
            description: 'Sensor kualitas udara di kamar tidur utama sepertinya mengalami error atau nge-hang. Indikator suhu dan kelembapan terbaca dengan normal, tetapi nilai partikel debu PM2.5 dan PM10 terus menerus menunjukkan angka 0 µg/m³ selama 3 hari terakhir.',
            clientInfo: {
                name: 'Asri Sarassufi',
                email: 'asri@gmail.com',
                phone: '+62 856-890-689',
                address: 'Jl. Melati No. 12, Kel. Menteng, Bogor',
                idBieon: 'TCK-0045'
            },
            technicianInfo: {
                name: 'Asri Sarassufi',
                phone: '+62 856-890-689',
                targetDate: 'Maksimal 02 Mar 2026, 10:00 WIB'
            },
            timeline: [
                { time: '28 Feb 2026, 15:30', desc: 'Teknisi meminta data log historis dari SuperAdmin untuk dikaji.' },
                { time: '28 Feb 2026, 10:15', desc: 'Laporan diterima. Teknisi akan melakukan troubleshooting via remote terlebih dahulu.' },
                { time: '28 Feb 2026, 10:00', desc: 'Laporan pengaduan berhasil dibuat.', status: 'Status: Menunggu Respons' }
            ],
            files: [],
            logRequested: true,
            logConfirmed: true,
            progressNotes: []
        },
        {
            id: 'TCK-0098',
            date: '27 Feb 2026, 15:30',
            customer: 'Bpk. Budi',
            location: 'Perum Dramaga',
            topic: 'Nilai tegangan Power Meter tiba-tiba hilang',
            status: 'Diproses',
            sla: '45 Jam',
            urgency: 'Medium',
            category: 'Energi & Kelistrikan',
            device: 'Master Node - Power Meter Utama',
            description: 'Sejak tadi malam sekitar pukul 19.00 WIB, grafik tegangan (Voltage) dan arus (Current) dari Power Meter di dashboard tiba-tiba menunjukkan angka 0.',
            clientInfo: {
                name: 'Bpk. Budi',
                email: 'budi@gmail.com',
                phone: '+62 812-333-444',
                address: 'Perum Dramaga Blok B No. 12, Bogor',
                idBieon: 'BIEON-012'
            },
            technicianInfo: {
                name: 'Asri Sarassufi',
                phone: '+62 856-890-689',
                targetDate: 'Maksimal 01 Mar 2026, 15:30 WIB'
            },
            timeline: [
                { time: '27 Feb 2026, 16:00', desc: 'Teknisi sedang melakukan pengecekan koneksi Modbus.' },
                { time: '27 Feb 2026, 15:30', desc: 'Laporan pengaduan berhasil dibuat.' }
            ],
            files: [],
            logRequested: false,
            logConfirmed: false,
            progressNotes: []
        },
        {
            id: 'TCK-0085',
            date: '20 Feb 2026, 09:15',
            customer: 'Ibu Rina',
            location: 'Jl. Melati Bogor',
            topic: 'Notifikasi Door Sensor sering telat masuk',
            status: 'Selesai',
            sla: null,
            urgency: 'Medium',
            category: 'Keamanan',
            rating: 5,
            device: 'R1 Living - Door Sensor',
            description: 'Notifikasi pintu terbuka/tertutup terlambat masuk ke HP sekitar 5-10 menit.',
            clientInfo: {
                name: 'Ibu Rina',
                email: 'rina@gmail.com',
                phone: '+62 877-666-555',
                address: 'Sentul City, Cluster Pine Forest No. 45',
                idBieon: 'BIEON-045'
            },
            technicianInfo: {
                name: 'Asri Sarassufi',
                phone: '+62 856-890-689',
                targetDate: 'Selesai'
            },
            timeline: [
                { time: '21 Feb 2026, 10:00', desc: 'Homeowner mengonfirmasi perbaikan selesai.', status: 'Status: Selesai' },
                { time: '20 Feb 2026, 14:00', desc: 'Update firmware gateway selesai.' },
                { time: '20 Feb 2026, 09:15', desc: 'Laporan pengaduan berhasil dibuat.' }
            ],
            files: [],
            logRequested: false,
            logConfirmed: false,
            progressNotes: []
        }
];

export function PengaduanKlienPage({ onNavigate }) {
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS_DATA);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // --- Toast States ---
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    // New States for Detail & Action Modals
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [logRequestText, setLogRequestText] = useState('');
    const [statusNoteText, setStatusNoteText] = useState('');
    const [updateTargetStatus, setUpdateTargetStatus] = useState('');
    const [showUpdateStatusDropdown, setShowUpdateStatusDropdown] = useState(false);

    // Summary Stats
    const stats = {
        waiting: complaints.filter(c => c.status === 'Baru').length,
        processing: complaints.filter(c => c.status === 'Diproses').length,
        completed: complaints.filter(c => c.status === 'Selesai').length,
        avgRating: 4.8
    };

    // Filter & Sort Logic
    const processedData = useMemo(() => {
        let result = [...complaints];

        if (selectedStatusFilter) {
            result = result.filter(c => c.status === selectedStatusFilter);
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

    // Pagination
    const totalItems = processedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = processedData.slice(startIndex, startIndex + rowsPerPage);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');

        // Header
        doc.setFontSize(18);
        doc.text('BIEON - Laporan Pengaduan Teknisi', 14, 20);
        doc.setFontSize(10);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 28);

        // Table
        const tableData = processedData.map(c => [
            c.id,
            c.date,
            c.customer,
            c.location,
            c.topic,
            c.status,
            c.sla || '-'
        ]);

        doc.autoTable({
            startY: 35,
            head: [['ID Tiket', 'Tanggal', 'Pelanggan', 'Lokasi', 'Topik Kendala', 'Status', 'SLA']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [43, 92, 80], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { top: 35 },
            styles: { fontSize: 8, cellPadding: 3 }
        });

        doc.save(`BIEON_Taskboard_Export_${new Date().getTime()}.pdf`);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-gray-600" /> : <ArrowDown className="w-3.5 h-3.5 text-gray-600" />;
    };

    // getStatusBadge replaced by shared <TicketStatusBadge> component

    const handleAction = (type) => {
        if (!selectedTicket) return;

        const now = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        if (type === 'request_log') {
            const updatedComplaints = complaints.map(c => {
                if (c.id === selectedTicket.id) {
                    return {
                        ...c,
                        logRequested: true,
                        timeline: [
                            { time: now, desc: `Teknisi meminta data log: "${logRequestText}"` },
                            ...c.timeline
                        ]
                    };
                }
                return c;
            });
            setComplaints(updatedComplaints);
            setSelectedTicket({ ...selectedTicket, logRequested: true, timeline: [{ time: now, desc: `Teknisi meminta data log: "${logRequestText}"` }, ...selectedTicket.timeline] });
            setIsLogModalOpen(false);
            setLogRequestText('');
            // Auto-confirm after 2s to simulate SuperAdmin response (demo)
            setTimeout(() => {
                setComplaints(prev => prev.map(c => c.id === selectedTicket.id ? { ...c, logConfirmed: true } : c));
            }, 2000);
        }

        if (type === 'update_progress') {
            const updatedComplaints = complaints.map(c => {
                if (c.id === selectedTicket.id) {
                    return {
                        ...c,
                        status: updateTargetStatus,
                        timeline: [
                            { time: now, desc: statusNoteText || `Status diperbarui menjadi ${updateTargetStatus}`, status: `Status: ${updateTargetStatus}` },
                            ...c.timeline
                        ]
                    };
                }
                return c;
            });
            setComplaints(updatedComplaints);
            setSelectedTicket({
                ...selectedTicket,
                status: updateTargetStatus,
                timeline: [{ time: now, desc: statusNoteText || `Status diperbarui menjadi ${updateTargetStatus}`, status: `Status: ${updateTargetStatus}` }, ...selectedTicket.timeline]
            });
            setIsUpdateModalOpen(false);
            setStatusNoteText('');
        }

        if (type === 'selesai') {
            const now = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const updatedComplaints = complaints.map(c => {
                if (c.id === selectedTicket.id) {
                    return {
                        ...c,
                        status: 'Menunggu Konfirmasi',
                        timeline: [
                            { time: now, desc: 'Teknisi menyatakan perbaikan telah selesai. Menunggu konfirmasi dari pelanggan.', status: 'Status: Menunggu Konfirmasi' },
                            ...c.timeline
                        ]
                    };
                }
                return c;
            });
            setComplaints(updatedComplaints);
            setSelectedTicket({
                ...selectedTicket,
                status: 'Menunggu Konfirmasi',
                timeline: [{ time: now, desc: 'Teknisi menyatakan perbaikan telah selesai. Menunggu konfirmasi dari pelanggan.', status: 'Status: Menunggu Konfirmasi' }, ...selectedTicket.timeline]
            });
            // Tiket otomatis berpindah ke tab 'Menunggu Konfirmasi' di list
        }
    };

    return (
        <div className="w-full">
            {/* Main Content Area */}
            <div className="py-8">
                {/* Title Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#1E4D40] mb-2 text-center sm:text-left">Taskboard Teknisi - Pusat Pengaduan</h1>
                    <p className="text-gray-500 text-sm max-w-2xl text-center sm:text-left">Pantau dan selesaikan tiket pengaduan Pelanggan yang ditugaskan kepada Anda. Perhatikan batas waktu SLA untuk setiap tiket.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Card 1: Waiting */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold border border-red-100">
                                <AlertCircle className="w-3 h-3" /> Urgent
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-medium mb-1 truncate">Menunggu Respons (&lt; 15 menit)</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.waiting}</div>
                        </div>
                        <div className="mt-4 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 w-1/3 rounded-full"></div>
                        </div>
                    </div>

                    {/* Card 2: Processing */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100">
                                <ArrowDown className="w-3 h-3" /> +1 Hari
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-medium mb-1 truncate">Sedang Diproses (&lt; 48 jam)</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.processing}</div>
                        </div>
                        <div className="mt-4 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-1/2 rounded-full"></div>
                        </div>
                    </div>

                    {/* Card 3: Completed */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
                                <ArrowUp className="w-3 h-3" /> +12%
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-medium mb-1 truncate">Tiket Selesai (Minggu Ini)</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                        </div>
                        <div className="mt-4 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[80%] rounded-full"></div>
                        </div>
                    </div>

                    {/* Card 4: Rating */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                <Star className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100">
                                <Star className="w-3 h-3 fill-current" /> 4.8/5
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-medium mb-1 truncate">Rata-Rata Penilaian</div>
                            <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">{stats.avgRating}</div>
                        </div>
                        <div className="mt-4 w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 w-[95%] rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Data Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Riwayat Pengaduan Saya</h2>
                                <p className="text-xs text-gray-500 mt-0.5 italic">Pantau status perbaikan Anda secara real-time. Jangan lupa konfirmasi jika tugas sudah selesai.</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                {/* Search */}
                                <div className="relative flex-1 md:w-64 group">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Cari Pelanggan atau ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 bg-white transition-all"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all shadow-sm ${showStatusDropdown ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <Filter className="w-4 h-4 text-gray-400" />
                                        {selectedStatusFilter || 'Semua Status'}
                                        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showStatusDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)}></div>
                                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-20">
                                                {['', 'Baru', 'Diproses', 'Menunggu Konfirmasi', 'Selesai'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => { setSelectedStatusFilter(s); setShowStatusDropdown(false); setCurrentPage(1); }}
                                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedStatusFilter === s ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        {s || 'Semua Status'}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Export */}
                                <button
                                    onClick={() => showToast("Mengekspor data pengaduan ke PDF...")}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#E1F2EB] text-[#1E4D40] rounded-lg text-sm font-bold hover:bg-[#d4ece3] transition-colors shadow-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Table (Auto Width with Scroll) */}
                    <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        <table className="w-full text-left text-[14px] text-gray-700 table-auto min-w-[1000px]">
                            <thead className="bg-white border-b border-gray-200 text-gray-500 select-none">
                                <tr>
                                    <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap" onClick={() => requestSort('id')}>
                                        <div className="flex items-center gap-1.5">ID Tiket {getSortIcon('id')}</div>
                                    </th>
                                    <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap" onClick={() => requestSort('date')}>
                                        <div className="flex items-center gap-1.5">Dibuat {getSortIcon('date')}</div>
                                    </th>
                                    <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap" onClick={() => requestSort('customer')}>
                                        <div className="flex items-center gap-1.5">Pelanggan {getSortIcon('customer')}</div>
                                    </th>
                                    <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap" onClick={() => requestSort('location')}>
                                        <div className="flex items-center gap-1.5">Lokasi {getSortIcon('location')}</div>
                                    </th>
                                    <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap max-w-[400px]" onClick={() => requestSort('topic')}>
                                        <div className="flex items-center gap-1.5">Topik Kendala {getSortIcon('topic')}</div>
                                    </th>
                                    <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap" onClick={() => requestSort('status')}>
                                        <div className="flex items-center gap-1.5">Status {getSortIcon('status')}</div>
                                    </th>
                                    <th className="px-6 py-4 w-[120px] font-normal whitespace-nowrap text-center text-xs uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentData.length > 0 ? (
                                    currentData.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-gray-900 tracking-tight whitespace-nowrap">{item.id}</td>
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{item.date}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.customer}</td>
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{item.location}</td>
                                            <td className="px-6 py-4 text-gray-600 truncate max-w-[400px]" title={item.topic}>
                                                {item.topic}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <TicketStatusBadge status={item.status} sla={item.sla} rating={item.rating} />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedTicket(item)}
                                                    className="inline-flex items-center gap-1 px-4 py-1.5 bg-[#0D9488] text-white rounded-lg text-xs font-bold hover:bg-[#0F766E] shadow-sm shadow-teal-500/20 active:scale-95 transition-all"
                                                >
                                                    Detail <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search className="w-8 h-8 opacity-20" />
                                                <div>Tidak ada data pengaduan yang ditemukan.</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {currentData.length > 0 ? (
                            currentData.map((item, idx) => (
                                <div key={idx} className="p-5 active:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">{item.id}</span>
                                        <span className="text-[11px] text-gray-400">{item.date}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">{item.customer}</h3>
                                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-3">
                                        <AlertCircle className="w-3 h-3" /> {item.location}
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">{item.topic}</p>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="shrink-0">
                                            <TicketStatusBadge status={item.status} sla={item.sla} rating={item.rating} />
                                        </div>
                                        <button
                                            onClick={() => setSelectedTicket(item)}
                                            className="grow inline-flex items-center justify-center gap-1 px-4 py-2 bg-[#0D9488] text-white rounded-lg text-xs font-bold hover:bg-[#0F766E] shadow-sm shadow-teal-500/20 active:scale-95 transition-all"
                                        >
                                            Lihat Detail <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center text-gray-500">Tidak ada pengaduan.</div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-6 border-t border-gray-100 bg-[#FBFDFB]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>Rows per page:</span>
                            <div className="relative">
                                <button
                                    onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                                >
                                    {rowsPerPage} <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showRowsDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowRowsDropdown(false)}></div>
                                        <div className="absolute bottom-full left-0 mb-2 w-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20 animate-in fade-in slide-in-from-bottom-2">
                                            {[5, 10, 15, 20, 30, 50].map(v => (
                                                <button key={v} onClick={() => { setRowsPerPage(v); setShowRowsDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-1.5 text-sm transition-colors ${rowsPerPage === v ? 'bg-teal-50 text-teal-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>{v}</button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="text-sm font-medium text-gray-600">
                            {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems} items
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || totalItems === 0}
                                className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm text-sm"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalItems === 0}
                                className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm text-sm"
                            >
                                Next
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
                                    onClick={() => handleAction('selesai')}
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
