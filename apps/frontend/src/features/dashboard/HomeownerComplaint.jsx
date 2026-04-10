import React, { useState, useMemo, useRef } from 'react';
import {
    Bell,
    ChevronDown,
    MessageSquare,
    Zap,
    Search,
    Filter,
    Download,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowRight,
    UploadCloud,
    X,
    FileText,
    Phone,
    Mail,
    ArrowLeft,
    Image as ImageIcon,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Star,
    User,
    Cpu
} from 'lucide-react';
import { ComplaintDetailModal } from '../complaints/ComplaintDetailModal';
import NotificationPopup from '../../components/NotificationPopup';

export function HomeownerComplaint({ onNavigate }) {
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);

    // Filter, Sort, Pagination State
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);

    // Rating State
    const [ratingTargetId, setRatingTargetId] = useState(null);
    const [ratingStars, setRatingStars] = useState(0);
    const [hoverStars, setHoverStars] = useState(0);
    const [ratingReview, setRatingReview] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        category: '',
        device: '',
        topic: '',
        description: '',
        files: []
    });

    const [formFiles, setFormFiles] = useState([]);
    const fileInputRef = useRef(null);

    // Dummy Data
    const initialComplaints = [
        {
            id: 'TCK-0105',
            date: '26 Feb 2026, 08:15',
            topic: 'Smart Plug kipas exhaust tidak bisa di-ON-kan via web',
            device: 'Smart Plug (Exhaust) - R3 Kitchen',
            technician: 'Menunggu Teknisi',
            status: 'Menunggu Respons',
            category: 'Energi & Kelistrikan',
            description: 'Saya sudah mencoba menyalakan kipas exhaust melalui web dashboard tapi tidak ada respons, padahal icon menunjukkan status loading tapi akhirnya kembali OFF.',
            clientInfo: {
                name: 'Aisyah',
                email: 'aisyah@gmail.com',
                phone: '+62 856-890-689',
                address: 'Kartika Wanasari Blok A1 No. 5',
                idBieon: 'BIEON-001'
            },
            technicianInfo: null,
            timeline: [
                { time: '26 Feb 2026, 08:15', desc: 'Laporan pengaduan berhasil dibuat.', status: 'Status: Menunggu Respons', isDone: true }
            ],
            files: []
        },
        {
            id: 'TCK-0102',
            date: '25 Feb 2026, 14:30',
            topic: 'Angka PM2.5 udara selalu stuck di angka 0',
            device: 'Node Udara - R2 Bedroom',
            technician: 'Budi Santoso',
            status: 'Diproses Teknisi',
            category: 'Kesehatan & Lingkungan',
            description: 'Sejak pemadaman listrik kemarin, sensor PM2.5 tidak pernah berubah dari angka 0.',
            clientInfo: {
                name: 'Aisyah',
                email: 'aisyah@gmail.com',
                phone: '+62 856-890-689',
                address: 'Kartika Wanasari Blok A1 No. 5',
                idBieon: 'BIEON-001'
            },
            technicianInfo: {
                name: 'Budi Santoso',
                phone: '+62 811-222-333',
                targetDate: 'Maks. 27 Feb 2026, 14:30 WIB'
            },
            timeline: [
                { time: '25 Feb 2026, 15:00', desc: 'Teknisi Budi Santoso sedang melakukan diagnosa remote.', status: 'Status: Diproses', isDone: true },
                { time: '25 Feb 2026, 14:45', desc: 'Tiket diterima oleh Teknisi Budi Santoso.', isDone: true },
                { time: '25 Feb 2026, 14:30', desc: 'Laporan pengaduan berhasil dibuat.', status: 'Status: Menunggu Respons', isDone: true }
            ],
            files: []
        },
        {
            id: 'TCK-0098',
            date: '24 Feb 2026, 10:00',
            topic: 'Nilai tegangan Power Meter tiba-tiba hilang',
            device: 'Power Meter Utama - Master Node',
            technician: 'Andi Pratama',
            status: 'Menunggu Konfirmasi',
            category: 'Energi & Kelistrikan',
            description: 'Sejak tadi malam sekitar pukul 19.00 WIB, grafik tegangan (Voltage) dan arus (Current) dari Power Meter di dashboard tiba-tiba menunjukkan angka 0 atau blank sama sekali. Anehnya, listrik di rumah menyala normal dan total akumulasi kWh masih bertambah. Mohon dicek apakah ada kabel sensor Modbus RTU yang kendur di box panel utama.',
            clientInfo: {
                name: 'Aisyah',
                email: 'aisyah@gmail.com',
                phone: '+62 856-890-689',
                address: 'Kartika Wanasari Blok A1 No. 5',
                idBieon: 'BIEON-001'
            },
            technicianInfo: {
                name: 'Andi Pratama',
                phone: '+62 812-456-789',
                targetDate: 'Maks. 26 Feb 2026, 10:00 WIB'
            },
            timeline: [
                { time: '25 Feb 2026, 15:30', desc: 'Teknisi mengonfirmasi perbaikan fisik telah selesai.', status: 'Status: Menunggu Konfirmasi Homeowner', isDone: true },
                { time: '25 Feb 2026, 11:00', desc: 'Teknisi Andi Pratama tiba di lokasi dan melakukan pengecekan kabel Modbus RTU.', status: 'Status: Diproses', isDone: true },
                { time: '24 Feb 2026, 10:15', desc: 'Tiket diterima oleh Teknisi Andi Pratama.', isDone: true },
                { time: '24 Feb 2026, 10:00', desc: 'Laporan pengaduan berhasil dibuat.', status: 'Status: Menunggu Respons', isDone: true }
            ],
            files: [
                { name: 'bukti_1.jpg', url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=200&q=80' },
                { name: 'dashboard_error.png', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80' },
                { name: 'panel_listrik.jpg', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=200&q=80' }
            ]
        },
        {
            id: 'TCK-0085',
            date: '20 Feb 2026, 09:15',
            topic: 'Notifikasi Door Sensor sering telat masuk',
            device: 'Door Sensor - R1 Living',
            technician: 'Budi Santoso',
            status: 'Selesai',
            category: 'Keamanan',
            description: 'Notifikasi masuk terlambat sekitar 5 menit setelah pintu dibuka.',
            clientInfo: {
                name: 'Aisyah',
                email: 'aisyah@gmail.com',
                phone: '+62 856-890-689',
                address: 'Kartika Wanasari Blok A1 No. 5',
                idBieon: 'BIEON-001'
            },
            technicianInfo: {
                name: 'Budi Santoso',
                phone: '+62 811-222-333',
                targetDate: 'Maks. 22 Feb 2026, 09:15 WIB'
            },
            timeline: [
                { time: '21 Feb 2026, 10:00', desc: 'Homeowner telah mengonfirmasi tiket selesai dan memberikan penilaian.', status: 'Selesai', isDone: true },
                { time: '21 Feb 2026, 09:00', desc: 'Teknisi mengonfirmasi perbaikan (Restart Gateway & Update Firmware) selesai.', status: 'Status: Menunggu Konfirmasi Homeowner', isDone: true },
                { time: '20 Feb 2026, 09:15', desc: 'Laporan pengaduan berhasil dibuat.', isDone: true }
            ],
            rating: {
                stars: 4,
                review: 'Respon teknisi cepat, tapi butuh waktu sedikit lama untuk sinkronisasi gateway. Overall oke!'
            },
            files: []
        },
        {
            id: 'TCK-0070',
            date: '15 Feb 2026, 16:45',
            topic: 'Ingin memindahkan posisi sensor gas agak ke kanan',
            device: 'Gas Detector - R3 Kitchen',
            technician: 'Sistem',
            status: 'Ditolak',
            category: 'Keamanan',
            description: 'Saya ingin memindahkan letak sensor gas 1 meter ke kanan agar lebih pas dengan kabinet baru.',
            clientInfo: {
                name: 'Aisyah',
                email: 'aisyah@gmail.com',
                phone: '+62 856-890-689',
                address: 'Kartika Wanasari Blok A1 No. 5',
                idBieon: 'BIEON-001'
            },
            technicianInfo: null,
            timeline: [
                { time: '16 Feb 2026, 08:00', desc: 'Pengaduan ditolak karena request pemindahan instalasi di luar cakupan garansi pengaduan. Silakan ajukan melalui layanan relokasi berbayar.', status: 'Ditolak', isDone: true },
                { time: '15 Feb 2026, 16:45', desc: 'Laporan pengaduan berhasil dibuat.', isDone: true }
            ],
            files: []
        },
        {
            id: 'TCK-0045',
            date: '02 Feb 2026, 11:00',
            topic: 'Pembacaan pH air toren fluktuatif parah',
            device: 'Node Air Toren - R3 Kitchen',
            technician: 'Andi Pratama',
            status: 'Selesai',
            category: 'Kualitas Air',
            description: 'Sensor pH naik turun sangat cepat (antara 5 sampai 9) dalam satu menit.',
            clientInfo: {
                name: 'Aisyah',
                email: 'aisyah@gmail.com',
                phone: '+62 856-890-689',
                address: 'Kartika Wanasari Blok A1 No. 5',
                idBieon: 'BIEON-001'
            },
            technicianInfo: {
                name: 'Andi Pratama',
                phone: '+62 812-456-789',
                targetDate: 'Maks. 04 Feb 2026, 11:00 WIB'
            },
            timeline: [
                { time: '04 Feb 2026, 10:00', desc: 'Homeowner telah mengonfirmasi tiket selesai dan memberikan penilaian.', status: 'Selesai', isDone: true },
                { time: '03 Feb 2026, 15:00', desc: 'Kalibrasi ulang sensor selesai dilakukan.', status: 'Menunggu Konfirmasi', isDone: true },
                { time: '02 Feb 2026, 11:00', desc: 'Laporan pengaduan berhasil dibuat.', isDone: true }
            ],
            rating: {
                stars: 5,
                review: 'Pelayanan sangat cepat! Mas Andi datang tepat waktu dan memperbaiki sensor dengan kalibrasi ulang, sekarang pembacaan normal. Mantap PT Matra!'
            },
            files: []
        }
    ];

    const [complaints, setComplaints] = useState(initialComplaints);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Menunggu Respons':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706]"><span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>{status}</span>;
            case 'Diproses Teknisi':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DBEAFE] text-[#2563EB]"><span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>{status}</span>;
            case 'Menunggu Konfirmasi':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF9C3] text-[#CA8A04]"><span className="w-1.5 h-1.5 rounded-full bg-[#CA8A04]"></span>{status}</span>;
            case 'Selesai':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#059669]"><span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>{status}</span>;
            case 'Ditolak':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626]"><span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>{status}</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const filteredComplaints = useMemo(() => {
        let result = complaints;

        if (selectedStatusFilter) {
            result = result.filter(c => c.status === selectedStatusFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.id.toLowerCase().includes(q) ||
                c.topic.toLowerCase().includes(q) ||
                c.device.toLowerCase().includes(q) ||
                c.technician.toLowerCase().includes(q)
            );
        }

        if (sortConfig.key) {
            result = [...result].sort((a, b) => {
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
    }, [complaints, searchQuery, selectedStatusFilter, sortConfig]);

    // Pagination logic
    const totalItems = filteredComplaints.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentComplaints = filteredComplaints.slice(startIndex, startIndex + rowsPerPage);

    const handleExport = () => {
        alert("Exporting data to CSV...");
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => {
                return {
                    file,
                    previewUrl: URL.createObjectURL(file), // create temporary URL for preview
                    name: file.name
                };
            });
            setFormFiles([...formFiles, ...newFiles]);
        }
    };

    const removeFile = (index) => {
        const updated = [...formFiles];
        updated.splice(index, 1);
        setFormFiles(updated);
    };

    const handleSubmitComplaint = (e) => {
        e.preventDefault();
        if (!formData.category || !formData.device || !formData.topic || !formData.description) {
            alert("Harap lengkapi semua field yang ditandai bintang (*).");
            return;
        }

        // Convert preview URLs to our dummy structure
        const uploadedFiles = formFiles.map(f => ({
            name: f.name,
            url: f.previewUrl
        }));

        const newTicket = {
            id: `TCK-010${complaints.length + 6}`,
            date: new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
            topic: formData.topic,
            device: formData.device,
            technician: 'Menunggu Teknisi',
            status: 'Menunggu Respons',
            category: formData.category,
            description: formData.description,
            clientInfo: {
                name: 'Aisyah',
                email: 'aisyah@gmail.com',
                phone: '+62 856-890-689',
                address: 'Kartika Wanasari Blok A1 No. 5',
                idBieon: 'BIEON-001'
            },
            technicianInfo: null,
            timeline: [
                { time: new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':'), desc: 'Laporan pengaduan berhasil dibuat.', status: 'Status: Menunggu Respons', isDone: true }
            ],
            files: uploadedFiles
        };

        setComplaints([newTicket, ...complaints]);
        setIsFormOpen(false);

        // reset form
        setFormData({ category: '', device: '', topic: '', description: '', files: [] });
        setFormFiles([]);
        alert("Pengaduan berhasil diajukan! Teknisi kami akan merespons dalam waktu SLA.");
    };

    const handleSelesaikanTiket = (ticketId) => {
        setRatingTargetId(ticketId);
    };

    const submitRating = () => {
        if (ratingStars === 0) return;

        const now = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':');
        
        const updated = complaints.map(c => {
            if (c.id === ratingTargetId) {
                const updatedTicket = {
                    ...c,
                    status: 'Selesai',
                    timeline: [
                        { time: now, desc: 'Homeowner telah mengonfirmasi tiket selesai dan memberikan penilaian.', status: 'Selesai', isDone: true },
                        ...c.timeline
                    ],
                    rating: {
                        stars: ratingStars,
                        review: ratingReview
                    }
                };
                if (selectedTicket && selectedTicket.id === ratingTargetId) {
                    setSelectedTicket(updatedTicket);
                }
                return updatedTicket;
            }
            return c;
        });

        setComplaints(updated);
        setRatingTargetId(null);
        setRatingStars(0);
        setRatingReview('');
        setHoverStars(0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-teal-50/20 pb-20">
            {/* Header Navigasi */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[1900px] mx-auto px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/logo_bieon.png" alt="BIEON" className="h-10 object-contain" />
                        </div>

                        <nav className="hidden md:flex items-center gap-10">
                            <button onClick={() => onNavigate && onNavigate('dashboard')} className="text-teal-700 font-semibold hover:text-teal-900 transition-colors pb-1 border-b-2 border-transparent hover:border-teal-700">Beranda</button>
                            <button onClick={() => onNavigate && onNavigate('kendali')} className="text-teal-700 font-semibold hover:text-teal-900 transition-colors pb-1 border-b-2 border-transparent hover:border-teal-700">Kendali Perangkat</button>
                            <button onClick={() => onNavigate && onNavigate('history')} className="text-teal-700 font-semibold hover:text-teal-900 transition-colors pb-1 border-b-2 border-transparent hover:border-teal-700">Riwayat</button>
                        </nav>

                        <div className="flex items-center gap-4">
                            <button onClick={() => onNavigate && onNavigate('pengaduan')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                                <MessageSquare className="w-4 h-4" />
                                Ajukan Pengaduan
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Bell className="w-5 h-5 text-gray-600" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                </button>
                                <NotificationPopup 
                                    isOpen={showNotifications} 
                                    onClose={() => setShowNotifications(false)} 
                                    role="homeowner" 
                                />
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                    className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-all"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full"></div>
                                    <div className="text-left">
                                        <div className="text-xs font-semibold text-gray-900">Hi, Aisyah!</div>
                                        <div className="text-xs text-gray-500">Homeowner</div>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                                </button>
                                {showRoleDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ganti Role (Demo)</div>
                                        <button className="w-full text-left px-4 py-2 text-sm text-emerald-600 bg-emerald-50 font-medium transition-colors">Homeowner</button>
                                        <button onClick={() => onNavigate && onNavigate("teknisi")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Teknisi</button>
                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Super Admin</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-8">
                {/* Title Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-teal-800">Pusat Pengaduan</h1>
                        <p className="text-gray-500 mt-1">Lapor kendala pada perangkat BIEON Anda</p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 bg-[#0F9E78] text-white rounded-xl font-bold hover:bg-[#0B8563] shadow-md transition-all"
                    >
                        <span className="text-lg leading-none">+</span> Kirim Pengaduan
                    </button>
                </div>

                {/* Info Cards Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 items-stretch">
                    {/* Card 1: Alur */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:col-span-2 flex flex-col h-full">
                        <div className="flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-gray-600" />
                                Alur Pengaduan
                            </h3>
                            <div className="flex-1 flex flex-col justify-between space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Buat Laporan</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">Isi formulir pengaduan dengan detail kendala dan pilih perangkat yang bermasalah</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Respons Cepat</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">Laporan Anda akan langsung diterima. Teknisi kami akan merespons dalam waktu maksimal 15 menit.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Proses Perbaikan</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">Teknisi melakukan perbaikan via remote atau kunjungan ke lokasi Anda (maksimal 2x24 jam)</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">4</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Konfirmasi Selesai</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">Jika kendala sudah teratasi, tekan tombol Selesaikan Tiket pada daftar di bawah untuk menutup laporan</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: FAQ */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:col-span-1 flex flex-col h-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 shrink-0">
                            <MessageSquare className="w-5 h-5 text-gray-600" />
                            FAQ
                        </h3>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">Berapa lama di proses?</h4>
                                <p className="text-xs text-gray-500 mt-1">Rata-rata 1-2 hari kerja tergantung kategori</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">Apakah ada biaya pengaduan?</h4>
                                <p className="text-xs text-gray-500 mt-1">Tidak, semua layanan pengaduan gratis jika masih bergaransi</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">Cek status laporan?</h4>
                                <p className="text-xs text-gray-500 mt-1">Status real-time ada di tabel di bawah</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Kontak Darurat */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:col-span-1 flex flex-col h-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 shrink-0">
                            <Phone className="w-5 h-5 text-gray-600" /> Kontak Darurat
                        </h3>
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <Phone className="w-4 h-4 text-emerald-600" /> +62 857-579-785
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <Phone className="w-4 h-4 text-emerald-600" /> +62 857-579-785
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <Mail className="w-4 h-4 text-emerald-600" /> bieon@gmail.com
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Riwayat Pengaduan */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Riwayat Pengaduan Saya</h2>
                            <p className="text-sm text-gray-500">Pantau status perbaikan perangkat Anda secara real-time. Jangan lupa untuk mengonfirmasi tiket yang sudah selesai diperbaiki oleh teknisi.</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                            <div className="relative flex-1 md:w-64 group">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
                                />
                            </div>
                            <div className="relative min-w-[180px]">
                                <button
                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all shadow-sm group ${showStatusDropdown ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Filter className={`w-4 h-4 transition-colors ${showStatusDropdown || selectedStatusFilter ? 'text-teal-500' : 'text-gray-400'}`} />
                                        <span className={selectedStatusFilter ? 'text-gray-900' : 'text-gray-500'}>
                                            {selectedStatusFilter || 'Semua Status'}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-all ${showStatusDropdown ? 'rotate-180 text-teal-500' : ''}`} />
                                </button>

                                {showStatusDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)}></div>
                                        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                            {['', 'Menunggu Respons', 'Diproses Teknisi', 'Menunggu Konfirmasi', 'Selesai', 'Ditolak'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        setSelectedStatusFilter(status);
                                                        setCurrentPage(1);
                                                        setShowStatusDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedStatusFilter === status ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    {status || 'Semua Status'}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-[#E6F5F0] text-[#0F9E78] rounded-lg text-sm font-bold hover:bg-[#d6efe6] transition-colors shrink-0">
                                <Download className="w-4 h-4" /> Export
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap min-w-[1000px]">
                            <thead className="text-gray-500 border-b border-gray-100">
                                <tr>
                                    <th className="font-medium pb-4 pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('id')}>
                                        <div className="flex items-center gap-1">ID Tiket {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('date')}>
                                        <div className="flex items-center gap-1">Tanggal Dibuat {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('topic')}>
                                        <div className="flex items-center gap-1">Topik Kendala {sortConfig.key === 'topic' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('device')}>
                                        <div className="flex items-center gap-1">Perangkat & Ruangan {sortConfig.key === 'device' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('technician')}>
                                        <div className="flex items-center gap-1">Teknisi {sortConfig.key === 'technician' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('status')}>
                                        <div className="flex items-center gap-1">Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentComplaints.length > 0 ? (
                                    currentComplaints.map(ticket => (
                                        <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 pr-4 font-bold text-gray-900">{ticket.id}</td>
                                            <td className="py-4 pr-4">{ticket.date}</td>
                                            <td className="py-4 pr-4 truncate max-w-[200px]" title={ticket.topic}>{ticket.topic}</td>
                                            <td className="py-4 pr-4">{ticket.device}</td>
                                            <td className={`py-4 pr-4 ${ticket.technician === 'Menunggu Teknisi' ? 'italic text-gray-500' : 'font-medium text-gray-900'}`}>{ticket.technician}</td>
                                            <td className="py-4 pr-4">{getStatusBadge(ticket.status)}</td>
                                            <td className="py-4 text-center">
                                                {ticket.status === 'Menunggu Konfirmasi' ? (
                                                    <button
                                                        onClick={() => setSelectedTicket(ticket)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0F9E78] text-white rounded-lg text-xs font-bold hover:bg-[#0B8563] shadow shadow-[#0F9E78]/20 transition-all"
                                                    >
                                                        Selesai ✓
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setSelectedTicket(ticket)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow shadow-emerald-600/20 transition-all"
                                                    >
                                                        Detail <span className="text-[10px]">›</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-500">Tidak ada pengaduan yang ditemukan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-sm text-gray-500 pt-4 border-t border-gray-100 gap-4">
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <span>Rows per page:</span>
                            <div className="relative">
                                <button 
                                    onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all shadow-sm"
                                >
                                    {rowsPerPage} <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {showRowsDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowRowsDropdown(false)}></div>
                                        <div className="absolute bottom-full left-0 mb-2 w-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20 animate-in fade-in slide-in-from-bottom-2">
                                            {[5, 10, 15, 20].map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => {
                                                        setRowsPerPage(val);
                                                        setCurrentPage(1);
                                                        setShowRowsDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-1.5 text-sm transition-colors ${rowsPerPage === val ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>{totalItems === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems} items</div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >Previous</button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: FORM PENGADUAN BARU */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Buat Pengaduan Baru
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Ceritakan kendala perangkat Anda, teknisi kami siap membantu.</p>
                        </div>

                        <div className="p-8 flex-1 overflow-y-auto">
                            <form onSubmit={handleSubmitComplaint} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2.5">Kategori <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                                className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium transition-all ${showCategoryDropdown ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-gray-200'}`}
                                            >
                                                <span className={formData.category ? 'text-gray-900' : 'text-gray-400'}>
                                                    {formData.category || 'Pilih kategori pengaduan'}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180 text-emerald-500' : ''}`} />
                                            </button>

                                            {showCategoryDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-[60]" onClick={() => setShowCategoryDropdown(false)}></div>
                                                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[70] animate-in fade-in zoom-in-95 duration-200 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                        {['Energi & Kelistrikan', 'Kualitas Air', 'Keamanan', 'Kenyamanan & Udara', 'Perangkat Aktuator', 'Lainnya'].map((cat) => (
                                                            <button
                                                                key={cat}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, category: cat });
                                                                    setShowCategoryDropdown(false);
                                                                }}
                                                                className={`w-full text-left px-5 py-3 text-sm transition-colors ${formData.category === cat ? 'text-emerald-600 bg-emerald-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                            >
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2.5">Pilih Ruangan & Perangkat <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
                                                className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium transition-all ${showDeviceDropdown ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-gray-200'}`}
                                            >
                                                <span className={formData.device ? 'text-gray-900' : 'text-gray-400'}>
                                                    {formData.device || 'Pilih Ruangan & Perangkat'}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDeviceDropdown ? 'rotate-180 text-emerald-500' : ''}`} />
                                            </button>

                                            {showDeviceDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-[60]" onClick={() => setShowDeviceDropdown(false)}></div>
                                                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[70] animate-in fade-in zoom-in-95 duration-200 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                        {[
                                                            'R3 Kitchen - Smart Plug (Exhaust)',
                                                            'R3 Kitchen - Gas Detector',
                                                            'R1 Living - Door Sensor',
                                                            'Master Node - Power Meter Utama',
                                                            'R2 Bedroom - Node Udara'
                                                        ].map((dev) => (
                                                            <button
                                                                key={dev}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, device: dev });
                                                                    setShowDeviceDropdown(false);
                                                                }}
                                                                className={`w-full text-left px-5 py-3 text-sm transition-colors ${formData.device === dev ? 'text-emerald-600 bg-emerald-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                            >
                                                                {dev}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Topik Kendala <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        placeholder="Contoh: Sensor pH air tidak terbaca di dashboard"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-800 mb-2">Deskripsi Detail <span className="text-red-500">*</span></label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Jelaskan kronologi atau detail kendala yang Anda alami agar teknisi kami dapat menganalisis lebih cepat..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                                    />
                                </div>

                                {/* File Upload / Drag Drop */}
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 relative hover:bg-gray-100 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        disabled
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        title="Preview sementara menggunakan tombol di bawahnya"
                                    />
                                    <UploadCloud className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-500 mb-4">Unggah foto alat yang bermasalah atau screenshot dashboard (Maks. 5MB)</p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 z-10 relative cursor-pointer"
                                    >
                                        Choose Files
                                    </button>

                                    {/* Preview Thumbnails */}
                                    {formFiles.length > 0 && (
                                        <div className="flex flex-wrap gap-3 mt-6 justify-center">
                                            {formFiles.map((f, idx) => (
                                                <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 shadow-sm z-20">
                                                    <img src={f.previewUrl} alt={f.name} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => removeFile(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md w-5 h-5 flex items-center justify-center">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Info Warning */}
                                <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-600">
                                    <AlertCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                    <p>Pastikan deskripsi dan foto yang dilampirkan sudah sesuai agar teknisi dapat menangani kendala Anda lebih cepat.</p>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3.5 bg-[#4B8378] text-white font-bold rounded-xl hover:bg-[#3d6b62] transition-colors shadow-md"
                                    >
                                        Kirim Pengajuan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: DETAIL PENGADUAN (Shared Component) */}
            <ComplaintDetailModal 
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                ticket={selectedTicket}
                renderActions={
                    selectedTicket?.status === 'Menunggu Konfirmasi' && (
                        <div className="space-y-4">
                            <div className="text-center mb-4">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                <p className="font-bold text-emerald-900 text-sm mb-1">Perlu Konfirmasi Anda</p>
                                <p className="text-xs text-emerald-700">Teknisi menyatakan bahwa kendala sudah teratasi. Anda wajib mengonfirmasi untuk menyelesaikan tiket ini.</p>
                            </div>
                            <button
                                onClick={() => handleSelesaikanTiket(selectedTicket.id)}
                                className="w-full py-3.5 bg-[#4B8378] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-[#3d6b62] transition-all hover:shadow-xl active:scale-95"
                            >
                                Selesaikan Tiket
                            </button>
                        </div>
                    )
                }
            />


            {/* MODAL: KONFIRMASI & BERI PENILAIAN (RATING) */}
            {ratingTargetId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-[#489C74] rounded-[2rem] p-8 max-w-lg w-full text-center relative mt-16 shadow-2xl">
                        {/* Emoji Display Header */}
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 flex items-center justify-center">
                            <span className="text-[6rem] leading-none drop-shadow-xl" style={{ textShadow: "0 10px 15px rgba(0,0,0,0.2)" }}>😍</span>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-white mt-8 mb-3">Konfirmasi & Beri Penilaian</h2>
                        <p className="text-white/90 text-sm mb-8 leading-relaxed px-4">
                            Bagaimana hasil perbaikan dari teknisi kami? Penilaian Anda sangat membantu kami dalam menjaga kualitas layanan PT Matra.
                        </p>

                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverStars(star)}
                                    onMouseLeave={() => setHoverStars(0)}
                                    onClick={() => setRatingStars(star)}
                                    className="focus:outline-none transition-transform hover:scale-110 p-1"
                                >
                                    <Star 
                                        className={`w-12 h-12 ${
                                            (hoverStars || ratingStars) >= star 
                                                ? "fill-[#FCD34D] text-[#FCD34D]" 
                                                : "fill-gray-300 text-gray-300 opacity-50"
                                        } drop-shadow-md`} 
                                    />
                                </button>
                            ))}
                        </div>

                        <p className="text-white/80 text-xs italic mb-6 px-6">
                            "Penilaian Anda mencakup keseluruhan dari kecepatan respons, kecepatan perbaikan, komunikasi dan keramahan teknisi kami."
                        </p>

                        <div className="text-left mb-6">
                            <label className="block text-white text-sm font-medium mb-2">Tuliskan Ulasan Anda</label>
                            <textarea
                                value={ratingReview}
                                onChange={(e) => setRatingReview(e.target.value)}
                                placeholder="Contoh: Teknisi datang tepat waktu, masalah kipas exhaust sudah beres dan berfungsi normal."
                                className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none h-28 text-sm"
                            />
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => { setRatingTargetId(null); setRatingStars(0); setHoverStars(0); setRatingReview(''); }}
                                className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl w-full max-w-[120px] hover:bg-white/20 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={submitRating}
                                disabled={ratingStars === 0}
                                className={`px-6 py-3 bg-white text-[#489C74] font-bold rounded-xl w-full max-w-[150px] transition-all shadow-lg ${ratingStars === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:shadow-xl'}`}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
