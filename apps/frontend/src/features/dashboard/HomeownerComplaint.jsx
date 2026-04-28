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
import { formatStatusDisplay, getActionButtons } from '../../utils/complaintHelpers';
import { TicketStatusBadge } from '../../shared/TicketStatusBadge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    // Fetch and loading state
    const [complaints, setComplaints] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [userDevices, setUserDevices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');

    const decodeJwtPayload = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        } catch (e) {
            return null;
        }
    };

    const fetchUserDevices = async (userId) => {
        try {
            console.log("🔍 FETCHING DEVICES FOR USER:", userId);
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/kendaliperangkat/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log("📡 API RESPONSE STATUS:", res.status);
            if (res.ok) {
                const data = await res.json();
                console.log("📦 DEVICE DATA RECEIVED:", data);
                setUserDevices(Array.isArray(data) ? data : []);
            } else {
                const errText = await res.text();
                console.error("❌ API ERROR RESPONSE:", errText);
            }
        } catch (err) {
            console.error("💥 FETCH ERROR:", err);
        }
    };

    const fetchComplaints = async (userId) => {
        const idToUse = userId || currentUserId;
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (!token || !idToUse) {
                setIsLoading(false);
                return;
            }

            const res = await fetch(`/api/complaints/owner/${idToUse}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Gagal memuat data');
            const data = await res.json();
            
            const mappedData = data.map(item => {
                const safeId = item._id ? item._id.toString() : '';
                return {
                    ...item,
                    originalId: safeId, // Save DB ID to hit PUT endpoints
                    id: safeId ? `TCK-${safeId.substring(Math.max(0, safeId.length - 6)).toUpperCase()}` : 'TCK-000000',
                    description: item.desc || 'No Description',
                    date: new Date(item.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'),
                    technician: item.technician ? item.technician.fullName : 'Menunggu Teknisi',
                    status: item.status?.toLowerCase() || 'unassigned',
                    customer: item.homeowner?.fullName || 'Unknown User',
                    clientInfo: item.homeowner ? {
                        name: item.homeowner.fullName,
                        email: item.homeowner.email,
                        phone: item.homeowner.phoneNumber,
                        address: item.homeowner.address,
                        idBieon: item.homeowner.bieonId
                    } : {},
                    technicianInfo: item.technician ? {
                        id: item.technician._id,
                        name: item.technician.fullName,
                        phone: item.technician.phoneNumber,
                        targetDate: item.assignedAt ? new Date(new Date(item.assignedAt).getTime() + (48 * 60 * 60 * 1000)).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA'
                    } : null,
                    isEscalated: item.isEscalated || false,
                    completedAt: item.completedAt || null,
                    updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':') : '-',
                    duration: (item.status === 'selesai' && item.processStartedAt) 
                        ? (() => {
                            const end = item.completedAt ? new Date(item.completedAt) : new Date(item.updatedAt);
                            const diff = end - new Date(item.processStartedAt);
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            return hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;
                          })()
                        : null
                };
            });

            setComplaints(mappedData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload) {
                const userId = payload.id || payload.userId || payload._id;
                if (userId) {
                    setCurrentUserId(userId);
                    fetchComplaints(userId);
                    fetchUserDevices(userId);
                }
            }
        }
    }, []);



    const getStatusBadge = (ticket) => {
        return <TicketStatusBadge 
            status={ticket.status} 
            rating={ticket.rating}
            assignedAt={ticket.assignedAt}
            processStartedAt={ticket.processStartedAt}
            isEscalated={ticket.isEscalated}
            role="homeowner"
        />;
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const filteredComplaints = useMemo(() => {
        let result = complaints;

        if (selectedStatusFilter) {
            result = result.filter(c => c.status === selectedStatusFilter.toLowerCase());
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
        const doc = new jsPDF('portrait');
        
        // Header PDF
        doc.setFontSize(18);
        doc.setTextColor(15, 158, 120); // Teal BIEON
        doc.text('Laporan Pengaduan BIEON - Riwayat Saya', 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);

        // Definisi Kolom sesuai urutan tabel: ID, Tanggal, Topik, Perangkat, Teknisi, Status
        const tableColumn = ["ID Tiket", "Tanggal", "Topik Kendala", "Perangkat", "Teknisi", "Status"];
        const tableRows = [];

        // Isi Data dari State filteredComplaints (data yang sedang terfilter)
        filteredComplaints.forEach(ticket => {
            const ticketData = [
                ticket.id,
                ticket.date,
                ticket.topic,
                ticket.device,
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
            headStyles: { fillColor: [15, 158, 120], textColor: [255, 255, 255], fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2 },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Download
        doc.save(`BIEON_Riwayat_Pengaduan_${new Date().getTime()}.pdf`);
    };

    const handleFileChange = async (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            
            const filePromises = filesArray.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        resolve({
                            file,
                            previewUrl: event.target.result, // Base64 Data URL
                            name: file.name
                        });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            try {
                const newFiles = await Promise.all(filePromises);
                setFormFiles(prev => [...prev, ...newFiles]);
            } catch (error) {
                alert("Gagal membaca file gambar.");
            }
        }
    };

    const removeFile = (index) => {
        setFormFiles(prev => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleSubmitComplaint = async (e) => {
        e.preventDefault();
        if (!formData.category || !formData.device || !formData.topic || !formData.description) {
            alert("Harap lengkapi semua field yang ditandai bintang (*).");
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');
        setSubmitSuccess('');

        try {
            const token = localStorage.getItem('token');
            const uploadedFiles = formFiles.map(f => ({ name: f.name, url: f.previewUrl }));

            const response = await fetch('/api/complaints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic: formData.topic,
                    category: formData.category,
                    device: formData.device,
                    desc: formData.description,
                    files: uploadedFiles
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal mengajukan pengaduan');

            setSubmitSuccess('Pengaduan berhasil diajukan! Teknisi akan segera memproses laporan Anda.');
            setFormData({ category: '', device: '', topic: '', description: '', files: [] });
            setFormFiles([]);
            
            // Re-fetch data untuk mendapatkan baris tabel terbaru
            await fetchComplaints(currentUserId);

            setTimeout(() => {
                setIsFormOpen(false);
                setSubmitSuccess('');
            }, 1000);

        } catch (error) {
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelesaikanTiket = (ticketId) => {
        setRatingTargetId(ticketId);
    };

    const submitRating = async () => {
        if (ratingStars === 0) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/complaints/${ratingTargetId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'selesai',
                    rating: {
                        stars: ratingStars,
                        review: ratingReview
                    }
                })
            });

            if (response.ok) {
                setRatingTargetId(null);
                setRatingStars(0);
                setRatingReview('');
                setHoverStars(0);
                // Refresh data
                await fetchComplaints();
                alert("Terima kasih! Tiket telah diselesaikan dan ulasan Anda telah disimpan.");
            } else {
                alert("Gagal mengirimkan penilaian.");
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            alert("Terjadi kesalahan saat mengirim penilaian.");
        }
    };

    return (
        <HomeownerLayout
            currentPage="pengaduan"
            onNavigate={onNavigate}
            hideBottomNav={isFormOpen || !!selectedTicket || !!ratingTargetId}
        >
            <style>{`
                .custom-scrollbar-x::-webkit-scrollbar { height: 8px; }
                .custom-scrollbar-x::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
                .custom-scrollbar-x::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
                .custom-scrollbar-x::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
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
                                            <div className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 min-w-[220px] bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                                {['', 'Menunggu Respons', 'Diproses', 'Menunggu Konfirmasi Pelanggan', 'Selesai', 'Ditolak'].map((status) => (
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

                    <div className="hidden md:block w-full overflow-x-auto pb-4 custom-scrollbar-x">
                        <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap min-w-max">
                            <thead className="text-gray-500 border-b border-gray-100">
                                <tr>
                                    <th className="font-medium pb-4 pr-2 md:pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('id')}>
                                        <div className="flex items-center gap-1">ID Tiket {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-2 md:pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('date')}>
                                        <div className="flex items-center gap-1">Tanggal Dibuat {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-2 md:pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('topic')}>
                                        <div className="flex items-center gap-1">Topik Kendala {sortConfig.key === 'topic' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-2 md:pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('device')}>
                                        <div className="flex items-center gap-1">Perangkat & Ruangan {sortConfig.key === 'device' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-2 md:pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('technician')}>
                                        <div className="flex items-center gap-1">Teknisi {sortConfig.key === 'technician' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-2 md:pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('status')}>
                                        <div className="flex items-center gap-1">Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm">Memuat data pengaduan...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentComplaints.length > 0 ? (
                                    currentComplaints.map(ticket => (
                                        <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 md:py-4 pr-2 md:pr-4 font-bold text-gray-900">
                                                {ticket.id}
                                            </td>
                                            <td className="py-3 md:py-4 pr-2 md:pr-4">{ticket.date}</td>
                                            <td className="py-3 md:py-4 pr-2 md:pr-4 truncate max-w-[200px]" title={ticket.topic}>{ticket.topic}</td>
                                            <td className="py-3 md:py-4 pr-2 md:pr-4">{ticket.device}</td>
                                            <td className={`py-3 md:py-4 pr-2 md:pr-4 ${ticket.technician === 'Menunggu Teknisi' ? 'italic text-gray-500' : 'font-medium text-gray-900'}`}>{ticket.technician}</td>
                                            <td className="py-3 md:py-4 pr-2 md:pr-4">{getStatusBadge(ticket)}</td>
                                            <td className="py-3 md:py-4 text-center">
                                                {getActionButtons('homeowner', ticket.status).map((btn, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedTicket(ticket)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                            btn.variant === 'primary' ? 'bg-[#0F9E78] text-white hover:bg-[#0B8563] shadow shadow-[#0F9E78]/20' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow shadow-emerald-600/20'
                                                        }`}
                                                    >
                                                        {btn.label} {btn.action === 'confirm' ? '✓' : <span className="text-[10px]">›</span>}
                                                    </button>
                                                ))}
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
                        {isLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <span className="text-sm">Memuat data pengaduan...</span>
                            </div>
                        ) : currentComplaints.length > 0 ? (
                            currentComplaints.map(ticket => (
                                <div key={ticket.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md border border-teal-100">
                                            {ticket.id}
                                        </span>
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
                                        <div>{getStatusBadge(ticket)}</div>
                                        <div className="flex gap-2">
                                            {getActionButtons('homeowner', ticket.status).map((btn, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedTicket(ticket)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0 ${
                                                        btn.variant === 'primary' ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]' : 'bg-[#0F9E78] text-white hover:bg-[#0B8563]'
                                                    }`}
                                                >
                                                    {btn.label} {btn.action === 'confirm' && '✓'}
                                                </button>
                                            ))}
                                        </div>
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
                            {submitError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {submitError}
                                </div>
                            )}
                            {submitSuccess && (
                                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    {submitSuccess}
                                </div>
                            )}
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
                                                        {(userDevices.length > 0 ? [...new Set(userDevices.map(d => d.category))] : ['Energi & Kelistrikan', 'Kualitas Air', 'Keamanan', 'Kenyamanan & Udara', 'Perangkat Aktuator', 'Lainnya']).map((cat) => (
                                                            <button
                                                                key={cat}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, category: cat, device: '' });
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
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Ruangan & Perangkat <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
                                                className={`w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium transition-all ${showDeviceDropdown ? 'bg-white border-teal-500 ring-4 ring-teal-500/10' : 'hover:bg-gray-100'}`}
                                            >
                                                <span className={formData.device ? 'text-gray-900' : 'text-gray-400'}>
                                                    {formData.device || 'Ruangan & Perangkat'}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDeviceDropdown ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showDeviceDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-[60]" onClick={() => setShowDeviceDropdown(false)}></div>
                                                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[210] animate-in fade-in zoom-in-95 duration-200 max-h-[250px] overflow-y-auto custom-scrollbar">
                                                        {userDevices.length > 0 ? (
                                                            userDevices
                                                                .filter((dev) => !formData.category || dev.category === formData.category)
                                                                .map((dev) => {
                                                                const label = `${dev.location || 'Tanpa Lokasi'} - ${dev.name}`;
                                                                return (
                                                                    <button
                                                                        key={dev._id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData({ ...formData, device: label });
                                                                            setShowDeviceDropdown(false);
                                                                        }}
                                                                        className={`w-full text-left px-5 py-3 text-sm transition-colors ${formData.device === label ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                                    >
                                                                        {label}
                                                                    </button>
                                                                );
                                                            })
                                                        ) : (
                                                            ['R3 Kitchen - Smart Plug', 'R3 Kitchen - Gas Detector', 'R1 Living - Door Sensor', 'Master Node - Power Meter', 'R2 Bedroom - Node Udara'].map((dev) => (
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
                                                            ))
                                                        )}
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
                                            className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${formFiles.length > 0 ? 'z-0' : 'z-20'}`}
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
                                                    <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg group">
                                                        <img src={f.previewUrl} alt={f.name} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { 
                                                                e.preventDefault();
                                                                e.stopPropagation(); 
                                                                removeFile(idx); 
                                                            }}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-all z-30"
                                                            title="Hapus foto"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none"></div>
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
                                disabled={isSubmitting}
                                onClick={() => setIsFormOpen(false)}
                                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                form="complaintForm"
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] py-3.5 bg-[#558580] text-white font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-400"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Memproses...
                                    </>
                                ) : (
                                    <>Kirim Pengaduan</>
                                )}
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
                role="homeowner"
                onActionSuccess={() => fetchComplaints(currentUserId)}
            />

            {/* MODAL: KONFIRMASI & BERI PENILAIAN (RATING) */}
            {ratingTargetId && (
                <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 pb-12 overflow-y-auto animate-in fade-in duration-300">
                    <div className="bg-[#489C74] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full text-center relative shadow-2xl animate-in zoom-in duration-500 max-h-[90vh] flex flex-col border border-white/10">
                        <button
                            onClick={() => setRatingTargetId(null)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        {/* Floating Emoji Badge */}
                        <div className="absolute -top-16 sm:-top-24 left-1/2 -translate-x-1/2">
                            <div className="w-32 h-32 sm:w-44 sm:h-44 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 relative group transition-transform hover:scale-105 duration-500">
                                <div className="absolute inset-0 bg-white/5 rounded-full animate-pulse"></div>
                                <span className="text-7xl sm:text-8xl drop-shadow-[0_20px_20px_rgba(0,0,0,0.4)] animate-bounce-slow relative z-10">🤩</span>
                            </div>
                        </div>

                        <div className="pt-8 sm:pt-14 overflow-y-auto custom-scrollbar pr-2">
                            <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 tracking-tight leading-tight">Konfirmasi & Beri Penilaian</h2>
                            <p className="text-white/90 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed font-medium px-1 sm:px-2">
                                Bagaimana hasil perbaikan dari teknisi kami? Penilaian Anda sangat membantu kami dalam menjaga kualitas layanan PT Matra.
                            </p>

                            <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHoverStars(star)}
                                        onMouseLeave={() => setHoverStars(0)}
                                        onClick={() => setRatingStars(star)}
                                        className="focus:outline-none transition-transform hover:scale-110 duration-300"
                                    >
                                        <Star
                                            className={`w-8 h-8 sm:w-10 sm:h-10 ${(hoverStars || ratingStars) >= star
                                                ? "fill-[#FCD34D] text-[#FCD34D]"
                                                : "fill-white/30 text-white/30"
                                            } drop-shadow-md`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <p className="text-white/80 text-[10px] sm:text-xs mb-4 sm:mb-5 leading-relaxed px-2 sm:px-4 italic">
                                "Penilaian Anda mencakup keseluruhan dari kecepatan respons, kecepatan perbaikan, komunikasi dan keramahan teknisi kami."
                            </p>

                            <div className="text-left mb-4 sm:mb-6">
                                <label className="block text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ml-1">Tuliskan Ulasan Anda</label>
                                <textarea
                                    value={ratingReview}
                                    onChange={(e) => setRatingReview(e.target.value)}
                                    placeholder="Contoh: Teknisi datang tepat waktu, masalah kipas exhaust sudah beres dan berfungsi normal."
                                    className="w-full bg-transparent border border-white/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white placeholder-white/60 focus:outline-none focus:border-white resize-none h-20 sm:h-24 text-[11px] sm:text-xs transition-all"
                                />
                            </div>

                            <button
                                onClick={submitRating}
                                disabled={ratingStars === 0}
                                className={`w-40 sm:w-48 mx-auto py-3 sm:py-3.5 bg-white text-[#489C74] font-bold text-base sm:text-[17px] rounded-full transition-all shadow-xl block ${ratingStars === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl hover:-translate-y-0.5 active:scale-95'}`}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </HomeownerLayout>
    );
}