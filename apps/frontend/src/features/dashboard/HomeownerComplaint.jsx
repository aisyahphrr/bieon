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
import HomeownerLayout from './HomeownerLayout';

export function HomeownerComplaint({ onNavigate }) {
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
        <HomeownerLayout
            currentPage="pengaduan"
            onNavigate={onNavigate}
            hideBottomNav={isFormOpen || !!selectedTicket || !!ratingTargetId}
        >
            <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-8">
                {/* Title Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-teal-800">Pusat Pengaduan</h1>
                        <p className="text-gray-500 mt-1">Lapor kendala pada perangkat BIEON Anda</p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="mt-4 md:mt-0 self-end md:self-auto flex items-center gap-2 px-6 py-3 bg-[#0F9E78] text-white rounded-xl font-bold hover:bg-[#0B8563] shadow-md transition-all"
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
                        <div className="flex flex-row items-center gap-2 md:gap-3 w-full lg:w-auto shrink-0">
                            <div className="relative flex-1 sm:w-auto md:w-64 group">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
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
                                            <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)}></div>
                                            <div className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
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
                                <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#E6F5F0] text-[#0F9E78] rounded-xl text-sm font-bold hover:bg-[#d6efe6] transition-colors shrink-0 shadow-sm border border-transparent">
                                    <Download className="w-4 h-4 shrink-0" />
                                    <span className="hidden sm:inline-block">Export</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block overflow-x-auto">
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

                    {/* Mobile Card List */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {currentComplaints.length > 0 ? (
                            currentComplaints.map(ticket => (
                                <div key={ticket.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md border border-teal-100">{ticket.id}</span>
                                        <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{ticket.date}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm mb-1">{ticket.topic}</h3>
                                    <div className="text-xs text-gray-500 mb-3 flex items-start gap-1">
                                        <Cpu className="w-3.5 h-3.5 mt-0.5 text-gray-400" />
                                        <span>{ticket.device}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                            </div>
                                            <div className="text-xs">
                                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Teknisi</div>
                                                <div className={`font-medium ${ticket.technician === 'Menunggu Teknisi' ? 'italic text-gray-500' : 'text-gray-900'}`}>{ticket.technician}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>{getStatusBadge(ticket.status)}</div>
                                        {ticket.status === 'Menunggu Konfirmasi' ? (
                                            <button
                                                onClick={() => setSelectedTicket(ticket)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F9E78] text-white rounded-lg text-xs font-bold hover:bg-[#0B8563] shadow-sm shadow-[#0F9E78]/20 transition-all shrink-0"
                                            >
                                                Selesai ✓
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedTicket(ticket)}
                                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0D9488] text-white rounded-lg text-xs font-bold hover:bg-[#0F766E] shadow-sm shadow-teal-500/20 active:scale-95 transition-all shrink-0"
                                            >
                                                Detail
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                <Search className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                Tidak ada pengaduan yang ditemukan.
                            </div>
                        )}
                    </div>

                    <div className="flex flex-row items-center justify-between mt-6 text-sm text-gray-500 pt-4 border-t border-gray-100 gap-2 sm:gap-4">
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

            {/* MODAL: FORM PENGADUAN BARU */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
                    <div className="relative bg-white/95 backdrop-blur-3xl rounded-[24px] sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,155,124,0.3)] w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-500 border border-white/50">
                        {/* Header Section */}
                        <div className="px-8 pt-10 pb-6 text-left shrink-0">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-teal-800">
                                        <FileText className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Buat Pengaduan Baru</h2>
                                        <p className="text-gray-500 font-medium mt-1">Ceritakan kendala perangkat Anda, teknisi kami siap membantu.</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                            <form id="complaintForm" onSubmit={handleSubmitComplaint} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Kategori <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                                className={`w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium transition-all ${showCategoryDropdown ? 'bg-white border-teal-500 ring-4 ring-teal-500/10' : 'hover:bg-gray-100'}`}
                                            >
                                                <span className={formData.category ? 'text-gray-900' : 'text-gray-400'}>
                                                    {formData.category || 'Pilih kategori pengaduan'}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showCategoryDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-[60]" onClick={() => setShowCategoryDropdown(false)}></div>
                                                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[210] animate-in fade-in zoom-in-95 duration-200 max-h-[250px] overflow-y-auto custom-scrollbar">
                                                        {['Energi & Kelistrikan', 'Kualitas Air', 'Keamanan', 'Kenyamanan & Udara', 'Perangkat Aktuator', 'Lainnya'].map((cat) => (
                                                            <button
                                                                key={cat}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, category: cat });
                                                                    setShowCategoryDropdown(false);
                                                                }}
                                                                className={`w-full text-left px-5 py-3 text-sm transition-colors ${formData.category === cat ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
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
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Ruangan & Perangkat <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
                                                className={`w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium transition-all ${showDeviceDropdown ? 'bg-white border-teal-500 ring-4 ring-teal-500/10' : 'hover:bg-gray-100'}`}
                                            >
                                                <span className={formData.device ? 'text-gray-900' : 'text-gray-400'}>
                                                    {formData.device || 'Pilih Ruangan & Perangkat'}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDeviceDropdown ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showDeviceDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-[60]" onClick={() => setShowDeviceDropdown(false)}></div>
                                                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[210] animate-in fade-in zoom-in-95 duration-200 max-h-[250px] overflow-y-auto custom-scrollbar">
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
                                                                className={`w-full text-left px-5 py-3 text-sm transition-colors ${formData.device === dev ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
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
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Topik Kendala <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        placeholder="Contoh: Sensor pH air tidak terbaca di dashboard"
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none font-medium transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Detail <span className="text-red-500">*</span></label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Jelaskan kronologi atau detail kendala yang Anda alami agar teknisi kami dapat menganalisis lebih cepat..."
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-teal-500 focus:outline-none font-medium transition-all resize-none placeholder:text-gray-400"
                                    />
                                </div>

                                {/* File Upload Section */}
                                <div>
                                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-white relative hover:border-teal-500 transition-all group">
                                        <input
                                            type="file"
                                            multiple
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                        <div className="flex flex-col items-center pointer-events-none">
                                            <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                                            <p className="text-sm font-medium text-gray-500 mb-4">Unggah foto alat yang bermasalah atau screenshot dashboard (Maks. 5MB)</p>
                                            <button type="button" className="px-6 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors pointer-events-auto">
                                                Choose Files
                                            </button>
                                        </div>

                                        {formFiles.length > 0 && (
                                            <div className="flex flex-wrap gap-4 mt-8 justify-center relative z-10">
                                                {formFiles.map((f, idx) => (
                                                    <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                                                        <img src={f.previewUrl} alt={f.name} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-500">
                                    <AlertCircle className="w-6 h-6 text-gray-400 shrink-0" />
                                    <p>Pastikan deskripsi dan foto yang dilampirkan sudah sesuai agar teknisi dapat menangani kendala Anda lebih cepat.</p>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-8 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                form="complaintForm"
                                type="submit"
                                className="flex-[2] py-3.5 bg-[#558580] text-white font-bold rounded-xl hover:opacity-90 transition-all active:scale-95"
                            >
                                Kirim Pengaduan
                            </button>
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
                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all hover:shadow-xl active:scale-95"
                            >
                                Selesaikan Tiket
                            </button>
                        </div>
                    )
                }
            />


            {/* MODAL: KONFIRMASI & BERI PENILAIAN (RATING) */}
            {ratingTargetId && (
                <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                    <div className="bg-[#489C74] rounded-[2.5rem] sm:rounded-[3rem] p-8 max-w-lg w-full text-center relative shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-y-auto max-h-[90vh] custom-scrollbar">
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8 sm:hidden" />

                        {/* Emoji Display Header */}
                        <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-5xl leading-none">😍</span>
                        </div>

                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Perbaikan Selesai!</h2>
                        <p className="text-emerald-50/80 text-sm mb-10 leading-relaxed font-bold italic">
                            Bantu kami menjaga kualitas layanan BIEON
                        </p>

                        <div className="flex justify-center gap-3 mb-10">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverStars(star)}
                                    onMouseLeave={() => setHoverStars(0)}
                                    onClick={() => setRatingStars(star)}
                                    className="focus:outline-none transition-transform hover:scale-125 duration-300"
                                >
                                    <Star
                                        className={`w-10 h-10 ${(hoverStars || ratingStars) >= star
                                            ? "fill-[#FCD34D] text-[#FCD34D]"
                                            : "fill-white/20 text-white/20"
                                            } drop-shadow-lg`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="text-left mb-10">
                            <label className="block text-white/60 text-[10px] font-black uppercase tracking-widest mb-3">Pesan untuk Teknisi</label>
                            <textarea
                                value={ratingReview}
                                onChange={(e) => setRatingReview(e.target.value)}
                                placeholder="Contoh: Sangat membantu, tepat waktu!"
                                className="w-full bg-white/10 border border-white/20 rounded-2xl p-6 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none h-32 text-sm font-bold"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => { setRatingTargetId(null); setRatingStars(0); setHoverStars(0); setRatingReview(''); }}
                                className="flex-1 py-4 text-white/60 font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={submitRating}
                                disabled={ratingStars === 0}
                                className={`flex-[2] py-4 bg-white text-[#489C74] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl ${ratingStars === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'}`}
                            >
                                Kirim Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </HomeownerLayout>
    );
}