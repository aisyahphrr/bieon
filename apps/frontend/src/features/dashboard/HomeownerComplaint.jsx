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
import { useTranslation } from 'react-i18next';
import { ComplaintDetailModal } from '../complaints/ComplaintDetailModal';
import NotificationPopup from '../../components/NotificationPopup';
import HomeownerLayout from './HomeownerLayout';
import { formatStatusDisplay, getActionButtons, localizeTopic } from '../../utils/complaintHelpers';
import { TicketStatusBadge } from '../../shared/TicketStatusBadge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { mockComplaints, mockDevices, mockHubs } from './homeownerMockData';

export function HomeownerComplaint({ onNavigate }) {
    const { t, i18n } = useTranslation();
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
        hubId: '',
        bieonId: '',
        files: []
    });

    const [formFiles, setFormFiles] = useState([]);
    const fileInputRef = useRef(null);

    // Fetch and loading state
    const [complaints, setComplaints] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [userDevices, setUserDevices] = useState([]);
    const [userHubs, setUserHubs] = useState([]);
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

    const checkMock = () => {
        const token = localStorage.getItem('token');
        let email = localStorage.getItem('email') || '';
        if (token) {
            const payload = decodeJwtPayload(token);
            if (payload && payload.email) email = payload.email;
        }
        const isTestAccount = email === 'asrisaras17@gmail.com';
        return isTestAccount && (import.meta.env.VITE_USE_MOCK_DATA === 'true' || localStorage.getItem('USE_MOCK_DATA') === 'true');
    };

    const fetchUserSystems = async (userId) => {
        if (checkMock()) {
            setUserHubs(mockHubs);
            if (mockHubs.length === 1) {
                setFormData(prev => ({ ...prev, hubId: mockHubs[0]._id, bieonId: mockHubs[0].bieonId }));
            }
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/hubs/owner/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUserHubs(Array.isArray(data) ? data : []);
                
                // If only one hub, pre-select it
                if (data.length === 1) {
                    setFormData(prev => ({ ...prev, hubId: data[0]._id, bieonId: data[0].bieonId }));
                }
            }
        } catch (err) {
            console.error("Gagal mengambil data sistem BIEON:", err);
        }
    };

    const fetchUserDevices = async (userId) => {
        if (checkMock()) {
            setUserDevices(mockDevices);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/kendaliperangkat/my-devices`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUserDevices(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Gagal mengambil data perangkat:", err);
        }
    };

    const fetchComplaints = async (userId) => {
        const idToUse = userId || currentUserId;
        try {
            setIsLoading(true);

            if (checkMock()) {
                const data = mockComplaints;
                const mappedData = data.map(item => {
                    const safeId = item._id ? item._id.toString() : '';
                    return {
                        ...item,
                        originalId: safeId, // Save DB ID to hit PUT endpoints
                        id: safeId ? `TCK-${safeId.substring(Math.max(0, safeId.length - 6)).toUpperCase()}` : 'TCK-000000',
                        description: item.desc || t('complaint.no_description', 'Tidak ada deskripsi.'),
                        createdAt: item.createdAt,
                        date: new Date(item.createdAt).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'),
                        technician: item.technician ? item.technician.fullName : 'Menunggu Teknisi',
                        status: item.status?.toLowerCase() || 'unassigned',
                        customer: item.homeowner?.fullName || 'Unknown User',
                        clientInfo: item.homeowner ? {
                            name: item.homeowner.fullName,
                            email: item.homeowner.email,
                            phone: item.homeowner.phoneNumber,
                            address: item.homeowner.address
                        } : null
                    };
                });
                setComplaints(mappedData);
                setIsLoading(false);
                return;
            }

            const token = localStorage.getItem('token');
            if (!token || !idToUse) {
                setIsLoading(false);
                return;
            }

            const res = await fetch(`/api/complaints/owner/${idToUse}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Gagal memuat data');
            const rawData = await res.json();
            const data = Array.isArray(rawData) ? rawData : (rawData.data || []);
            
            const mappedData = data.map(item => {
                const safeId = item._id ? item._id.toString() : '';
                return {
                    ...item,
                    originalId: safeId, // Save DB ID to hit PUT endpoints
                    id: safeId ? `TCK-${safeId.substring(Math.max(0, safeId.length - 6)).toUpperCase()}` : 'TCK-000000',
                    description: item.desc || t('complaint.no_description', 'Tidak ada deskripsi.'),
                    createdAt: item.createdAt,
                    date: new Date(item.createdAt).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'),
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
                        targetDate: item.assignedAt ? new Date(new Date(item.assignedAt).getTime() + (48 * 60 * 60 * 1000)).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA'
                    } : null,
                    isEscalated: item.isEscalated || false,
                    completedAt: item.completedAt || null,
                    updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':') : '-',
                    duration: (item.status === 'selesai' && item.processStartedAt) 
                        ? (() => {
                            const end = item.completedAt ? new Date(item.completedAt) : new Date(item.updatedAt);
                            const diff = end - new Date(item.processStartedAt);
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            return hours > 0 ? t('complaint.duration_format_hours_mins', '{{hours}}j {{minutes}}m', { hours, minutes }) : t('complaint.duration_format_mins', '{{minutes}}m', { minutes });
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
                    fetchUserSystems(userId);
                }
            }
        }
    }, []);



    const getStatusBadge = (ticket, customClassName) => {
        return <TicketStatusBadge 
            status={ticket.status} 
            rating={ticket.rating}
            assignedAt={ticket.assignedAt}
            processStartedAt={ticket.processStartedAt}
            isEscalated={ticket.isEscalated}
            role="homeowner"
            className={customClassName}
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
        doc.setFont('helvetica');
        
        // Header PDF
        doc.setFontSize(18);
        doc.setTextColor(5, 155, 39); // Eco BIEON
        doc.text(t('history.export.detail_report_title', 'LAPORAN DETAIL PENGADUAN'), 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`${t('history.export.print_date_label', 'Dihasilkan Pada')}: ${new Date().toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US')}`, 14, 30);

        // Definisi Kolom sesuai urutan tabel: ID, Tanggal, Topik, Perangkat, Teknisi, Status
        const tableColumn = [
            t('complaint.col_ticket_id', 'ID Tiket'), 
            t('complaint.col_date_created', 'Tanggal'), 
            t('complaint.col_problem_topic', 'Topik Kendala'), 
            t('complaint.col_device_room', 'Perangkat'), 
            t('complaint.col_technician', 'Teknisi'), 
            t('complaint.col_status', 'Status')
        ];
        const tableRows = [];

        // Isi Data dari State filteredComplaints (data yang sedang terfilter)
        filteredComplaints.forEach(ticket => {
            const ticketData = [
                ticket.id,
                ticket.date,
                localizeTopic(ticket.topic, t),
                ticket.device,
                ticket.technician === 'Menunggu Teknisi' ? t('complaint.waiting_technician', 'Menunggu Teknisi') : ticket.technician,
                formatStatusDisplay(ticket.status, 'homeowner').toUpperCase()
            ];
            tableRows.push(ticketData);
        });

        // Generate Tabel
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [5, 155, 39], textColor: [255, 255, 255], fontStyle: 'bold', font: 'helvetica' },
            bodyStyles: { font: 'helvetica' },
            footStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold', font: 'helvetica' },
            styles: { fontSize: 8, cellPadding: 2, font: 'helvetica' },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Download
        const fileName = i18n.language === 'en' ? `BIEON_Complaint_History_${new Date().getTime()}.pdf` : `BIEON_Riwayat_Pengaduan_${new Date().getTime()}.pdf`;
        doc.save(fileName);
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
                alert(t('complaint.alerts.read_file_failed', 'Gagal membaca file gambar.'));
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
            alert(t('complaint.alerts.fill_required', 'Harap lengkapi semua field yang ditandai bintang (*).'));
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
                    hubId: formData.hubId,
                    bieonId: formData.bieonId,
                    files: uploadedFiles
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || t('complaint.form.error_submit', 'Gagal mengajukan pengaduan'));

            setSubmitSuccess(t('complaint.form.success_submit', 'Pengaduan berhasil diajukan! Teknisi akan segera memproses laporan Anda.'));
            setFormData({ category: '', device: '', topic: '', description: '', hubId: '', bieonId: '', files: [] });
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
                alert(t('complaint.alerts.thank_you_completed', 'Terima kasih! Tiket telah diselesaikan dan ulasan Anda telah disimpan.'));
            } else {
                alert(t('complaint.alerts.send_rating_failed', 'Gagal mengirimkan penilaian.'));
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            alert(t('complaint.alerts.send_rating_error', 'Terjadi kesalahan saat mengirim penilaian.'));
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
            <div className="font-sans">
                <div className="max-w-[1900px] mx-auto px-4 md:px-8 py-8">
                {/* Title Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-headline">{t('complaint.title', 'Pusat Pengaduan')}</h1>
                        <p className="text-gray-500 mt-1">{t('complaint.subtitle', 'Lapor kendala pada perangkat BIEON Anda')}</p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="mt-4 md:mt-0 self-end md:self-auto flex items-center gap-2 px-6 py-3 bg-eco text-white rounded-xl font-bold hover:bg-eco/90 shadow-md shadow-eco/20 transition-all"
                    >
                        <span className="text-lg leading-none">+</span> {t('complaint.send_complaint', 'Kirim Pengaduan')}
                    </button>
                </div>

                {/* Info Cards Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 items-stretch">
                    {/* Card 1: Alur */}
                    <div className="bg-white rounded-[24px] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 lg:col-span-2 flex flex-col h-full">
                        <div className="flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-gray-600" />
                                {t('complaint.flow_title', 'Alur Pengaduan')}
                            </h3>
                            <div className="flex-1 flex flex-col justify-between space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-eco/5 text-eco border border-eco/20 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{t('complaint.flow_1_title', 'Buat Laporan')}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{t('complaint.flow_1_desc', 'Isi formulir pengaduan dengan detail kendala dan pilih perangkat yang bermasalah')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-eco/5 text-eco border border-eco/20 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{t('complaint.flow_2_title', 'Respons Cepat')}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{t('complaint.flow_2_desc', 'Laporan Anda akan langsung diterima. Teknisi kami akan merespons dalam waktu maksimal 15 menit.')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-eco/5 text-eco border border-eco/20 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{t('complaint.flow_3_title', 'Proses Perbaikan')}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{t('complaint.flow_3_desc', 'Teknisi melakukan perbaikan via remote atau kunjungan ke lokasi Anda (maksimal 2x24 jam)')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-eco/5 text-eco border border-eco/20 flex items-center justify-center font-bold text-sm shrink-0">4</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{t('complaint.flow_4_title', 'Konfirmasi Selesai')}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{t('complaint.flow_4_desc', 'Jika kendala sudah teratasi, tekan tombol Selesaikan Tiket pada daftar di bawah untuk menutup laporan')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: FAQ */}
                    <div className="bg-white rounded-[24px] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 lg:col-span-1 flex flex-col h-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 shrink-0">
                            <MessageSquare className="w-5 h-5 text-gray-600" />
                            {t('complaint.faq_title', 'FAQ')}
                        </h3>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">{t('complaint.faq_1_q', 'Berapa lama di proses?')}</h4>
                                <p className="text-xs text-gray-500 mt-1">{t('complaint.faq_1_a', 'Rata-rata 1-2 hari kerja tergantung kategori')}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">{t('complaint.faq_2_q', 'Apakah ada biaya pengaduan?')}</h4>
                                <p className="text-xs text-gray-500 mt-1">{t('complaint.faq_2_a', 'Tidak, semua layanan pengaduan gratis jika masih bergaransi')}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">{t('complaint.faq_3_q', 'Cek status laporan?')}</h4>
                                <p className="text-xs text-gray-500 mt-1">{t('complaint.faq_3_a', 'Status real-time ada di tabel di bawah')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Kontak Darurat */}
                    <div className="bg-white rounded-[24px] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 lg:col-span-1 flex flex-col h-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 shrink-0">
                            <Phone className="w-5 h-5 text-gray-600" /> {t('complaint.contact_title', 'Kontak Darurat')}
                        </h3>
                        <div className="flex-1 flex flex-col justify-between space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border-0">
                                <Phone className="w-4 h-4 text-eco" /> +62 857-579-785
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border-0">
                                <Phone className="w-4 h-4 text-eco" /> +62 857-579-785
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border-0">
                                <Mail className="w-4 h-4 text-eco" /> bieon@gmail.com
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Riwayat Pengaduan */}
                <div className="bg-white rounded-[24px] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{t('complaint.history_title', 'Riwayat Pengaduan Saya')}</h2>
                            <p className="text-sm text-gray-500">{t('complaint.history_desc', 'Pantau status perbaikan perangkat Anda secara real-time. Jangan lupa untuk mengonfirmasi tiket yang sudah selesai diperbaiki oleh teknisi.')}</p>
                        </div>
                        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
                            <div className="relative flex-1 min-w-0 group">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-eco transition-colors" />
                                <input
                                    type="text"
                                    placeholder={t('history.search', 'Cari...')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-eco focus:ring-4 focus:ring-eco/15 transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                        className={`flex items-center justify-center sm:justify-between gap-1.5 md:gap-3 px-3 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all shadow-sm group ${showStatusDropdown ? 'border-eco ring-4 ring-eco/15' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className="flex items-center gap-1.5 md:gap-2.5 overflow-hidden">
                                            <Filter className={`w-4 h-4 shrink-0 transition-colors ${showStatusDropdown || selectedStatusFilter ? 'text-eco' : 'text-gray-400'}`} />
                                            <span className={`hidden sm:inline-block truncate ${selectedStatusFilter ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {selectedStatusFilter ? t(`complaint.status_${selectedStatusFilter.toLowerCase().replace(/\s+/g, '_')}`, selectedStatusFilter) : t('complaint.status_all', 'Semua Status')}
                                            </span>
                                        </div>
                                        <ChevronDown className={`hidden sm:block w-4 h-4 shrink-0 text-gray-400 transition-all ${showStatusDropdown ? 'rotate-180 text-eco' : ''}`} />
                                    </button>

                                    {showStatusDropdown && (
                                        <>
                                            {/* Desktop dropdown */}
                                            <div className="hidden sm:block fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)}></div>
                                            <div className="hidden sm:block absolute top-full right-0 sm:right-auto sm:left-0 mt-2 min-w-[220px] bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                                {['', 'Baru', 'Menunggu Respons', 'Diproses', 'Menunggu Konfirmasi Pelanggan', 'Selesai', 'Ditolak'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => {
                                                            setSelectedStatusFilter(status);
                                                            setCurrentPage(1);
                                                            setShowStatusDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedStatusFilter === status ? 'text-eco bg-eco/5 font-black' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        {status ? t(`complaint.status_${status.toLowerCase().replace(/\s+/g, '_')}`, status) : t('complaint.status_all', 'Semua Status')}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Mobile bottom sheet */}
                                            <div className="sm:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={() => setShowStatusDropdown(false)}></div>
                                            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
                                                <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-gray-100">
                                                    <span className="text-sm font-bold text-gray-900">{t('complaint.filter_status', 'Filter Status')}</span>
                                                    <button onClick={() => setShowStatusDropdown(false)} className="p-1 rounded-full hover:bg-gray-100">
                                                        <X className="w-5 h-5 text-gray-400" />
                                                    </button>
                                                </div>
                                                <div className="py-2 max-h-[50vh] overflow-y-auto">
                                                    {['', 'Baru', 'Menunggu Respons', 'Diproses', 'Menunggu Konfirmasi Pelanggan', 'Selesai', 'Ditolak'].map((status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => {
                                                                setSelectedStatusFilter(status);
                                                                setCurrentPage(1);
                                                                setShowStatusDropdown(false);
                                                            }}
                                                            className={`w-full text-left px-5 py-3.5 text-sm transition-colors ${selectedStatusFilter === status ? 'text-eco bg-eco/5 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                        >
                                                            {status ? t(`complaint.status_${status.toLowerCase().replace(/\s+/g, '_')}`, status) : t('complaint.status_all', 'Semua Status')}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="p-4 border-t border-gray-100 safe-area-bottom"></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-eco/10 text-eco rounded-xl text-sm font-bold hover:bg-eco/15 transition-colors shrink-0 shadow-sm border border-transparent">
                                    <Download className="w-4 h-4 shrink-0" />
                                    <span className="hidden sm:inline-block">{t('complaint.export', 'Export')}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block w-full overflow-x-auto pb-1 custom-scrollbar-x">
                        <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap min-w-max">
                            <thead className="text-gray-500 border-b border-gray-100">
                                <tr>
                                    <th className="font-medium pb-4 pr-2 md:pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('id')}>
                                        <div className="flex items-center gap-1">{t('complaint.col_ticket_id', 'ID Tiket')} {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-2 md:pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('date')}>
                                        <div className="flex items-center gap-1">{t('complaint.col_date_created', 'Tanggal Dibuat')} {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-2 md:pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('topic')}>
                                        <div className="flex items-center gap-1">{t('complaint.col_problem_topic', 'Topik Kendala')} {sortConfig.key === 'topic' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-2 md:pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('device')}>
                                        <div className="flex items-center gap-1">{t('complaint.col_device_room', 'Perangkat & Ruangan')} {sortConfig.key === 'device' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-2 md:pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('technician')}>
                                        <div className="flex items-center gap-1">{t('complaint.col_technician', 'Teknisi')} {sortConfig.key === 'technician' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 pr-2 md:pr-4 cursor-pointer hover:text-gray-800" onClick={() => requestSort('status')}>
                                        <div className="flex items-center gap-1">{t('complaint.col_status', 'Status')} {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}</div>
                                    </th>
                                    <th className="font-medium pb-4 text-center">{t('complaint.col_action', 'Aksi')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <div className="w-6 h-6 border-2 border-eco border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm">{t('history.loading_data', 'Memuat data pengaduan...')}</span>
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
                                            <td className="py-3 md:py-4 pr-2 md:pr-4 truncate max-w-[200px]" title={localizeTopic(ticket.topic, t)}>{localizeTopic(ticket.topic, t)}</td>
                                            <td className="py-3 md:py-4 pr-2 md:pr-4">{ticket.device}</td>
                                            <td className={`py-3 md:py-4 pr-2 md:pr-4 ${ticket.technician === 'Menunggu Teknisi' ? 'italic text-gray-500' : 'font-medium text-gray-900'}`}>
                                                {ticket.technician === 'Menunggu Teknisi' ? t('complaint.waiting_technician', 'Menunggu Teknisi') : ticket.technician}
                                            </td>
                                            <td className="py-3 md:py-4 pr-2 md:pr-4">{getStatusBadge(ticket)}</td>
                                            <td className="py-3 md:py-4 text-center">
                                                {getActionButtons('homeowner', ticket.status, 0, t).map((btn, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => btn.action === 'confirm' ? handleSelesaikanTiket(ticket.originalId || ticket._id) : setSelectedTicket(ticket)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-eco text-white hover:bg-eco/90 shadow shadow-eco/20 border border-transparent"
                                                    >
                                                        {btn.label} {btn.action === 'confirm' ? '✓' : <span className="text-[10px]">›</span>}
                                                    </button>
                                                ))}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-500">{t('complaint.no_complaint', 'Tidak ada pengaduan yang ditemukan.')}</td>
                                    </tr>
                                )
                                }
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {isLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                                <div className="w-6 h-6 border-2 border-eco border-t-transparent rounded-full animate-spin mb-2"></div>
                                <span className="text-sm">{t('history.loading_data', 'Memuat data pengaduan...')}</span>
                            </div>
                        ) : currentComplaints.length > 0 ? (
                            currentComplaints.map(ticket => (
                                <div key={ticket.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[11px] font-bold text-eco bg-eco/5 px-2 py-1 rounded-md border border-eco/20">
                                            {ticket.id}
                                        </span>
                                        <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{ticket.date}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm mb-1">{localizeTopic(ticket.topic, t)}</h3>
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
                                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">{t('complaint.col_technician', 'Teknisi')}</div>
                                                <div className={`font-medium ${ticket.technician === 'Menunggu Teknisi' ? 'italic text-gray-500' : 'text-gray-900'}`}>
                                                    {ticket.technician === 'Menunggu Teknisi' ? t('complaint.waiting_technician', 'Menunggu Teknisi') : ticket.technician}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="whitespace-normal line-clamp-2 text-xs leading-tight flex-1 min-w-0 pr-2">
                                            {getStatusBadge(ticket, "whitespace-normal line-clamp-2 text-xs leading-tight flex-1")}
                                        </div>
                                        <div className="flex gap-2 shrink-0 ml-2">
                                            {getActionButtons('homeowner', ticket.status, 0, t).map((btn, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => btn.action === 'confirm' ? handleSelesaikanTiket(ticket.originalId || ticket._id) : setSelectedTicket(ticket)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0 bg-eco text-white hover:bg-eco/90 border border-transparent"
                                                >
                                                    {btn.label} {btn.action === 'confirm' ? '✓' : <span className="text-[10px]">›</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                <Search className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                {t('complaint.no_complaint', 'Tidak ada pengaduan yang ditemukan.')}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-row items-center justify-between mt-1 text-sm text-gray-500 pt-3 border-t border-gray-100 gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 font-medium">
                            <span className="hidden sm:inline">{t('history.rows_per_page', 'Rows per page:')}</span>
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
                                                    className={`w-full text-left px-3 sm:px-4 py-1.5 text-xs sm:text-sm transition-colors ${rowsPerPage === val ? 'text-eco bg-eco/5 font-black' : 'text-gray-600 hover:bg-gray-50'}`}
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
                            {t('history.pagination_info', '{{start}} dari {{total}} item', { start: `${totalItems === 0 ? 0 : startIndex + 1}-${Math.min(startIndex + rowsPerPage, totalItems)}`, total: totalItems })}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-2 sm:px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center font-bold text-gray-600"
                            >
                                <span className="sm:hidden">&lt;</span>
                                <span className="hidden sm:inline">{t('history.previous', 'Previous')}</span>
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-2 sm:px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center font-bold text-gray-600"
                            >
                                <span className="sm:hidden">&gt;</span>
                                <span className="hidden sm:inline">{t('history.next', 'Next')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: FORM PENGADUAN BARU */}
            {isFormOpen && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-0 sm:p-4">
                    <div className="relative bg-white/95 backdrop-blur-3xl rounded-t-[32px] sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border-0">
                        {/* Header Section */}
                        <div className="px-8 pt-10 pb-6 text-left shrink-0">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-eco">
                                        <FileText className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{t('complaint.new_complaint_title', 'Buat Pengaduan Baru')}</h2>
                                        <p className="text-gray-500 font-medium mt-1">{t('complaint.new_complaint_desc', 'Ceritakan kendala perangkat Anda, teknisi kami siap membantu.')}</p>
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
                                <div className="mb-6 p-4 bg-alert-danger/10 border border-alert-danger/20 text-alert-danger rounded-xl text-sm font-medium flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {submitError}
                                </div>
                            )}
                            {submitSuccess && (
                                <div className="mb-6 p-4 bg-eco/5 border border-eco/20 text-eco rounded-xl text-sm font-medium flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    {submitSuccess}
                                </div>
                            )}
                            <form id="complaintForm" onSubmit={handleSubmitComplaint} className="space-y-8">
                                {/* BIEON System Selection (Only if multiple) */}
                                {userHubs.length > 1 && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 italic">{t('complaint.select_bieon_system', 'Pilih Sistem BIEON')} <span className="text-red-500">*</span></label>
                                        <div className="flex flex-wrap gap-3">
                                            {userHubs.map(hub => (
                                                <button
                                                    key={hub._id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, hubId: hub._id, bieonId: hub.bieonId, device: '', category: '' })}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${formData.hubId === hub._id ? 'bg-eco/5 border-eco text-eco' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                                                >
                                                    {hub.name} ({hub.bieonId})
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('complaint.category', 'Kategori')} <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                                className={`w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium transition-all ${showCategoryDropdown ? 'bg-white border-eco ring-4 ring-eco/15' : 'hover:bg-gray-100'}`}
                                            >
                                                <span className={formData.category ? 'text-gray-900' : 'text-gray-400'}>
                                                    {formData.category ? t(`complaint.category_${formData.category.toLowerCase().replace(/\s+/g, '_')}`, formData.category) : t('complaint.select_category', 'Pilih kategori pengaduan')}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showCategoryDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-[60]" onClick={() => setShowCategoryDropdown(false)}></div>
                                                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[210] animate-in fade-in zoom-in-95 duration-200 max-h-[250px] overflow-y-auto custom-scrollbar">
                                                        {(() => {
                                                            const filteredDevices = userDevices.filter(d => !formData.hubId || d.hubId === formData.hubId);
                                                            const dbCategories = filteredDevices.length > 0 
                                                                ? [...new Set(filteredDevices.map(d => d.category))].filter(Boolean)
                                                                : [];
                                                            const finalCategories = dbCategories.length > 0 
                                                                ? [...dbCategories, 'Lainnya']
                                                                : ['Energi', 'Keamanan', 'Kualitas Air', 'Lingkungan', 'Sistem', 'Sensor', 'Control Actuator System', 'Lainnya'];
                                                            
                                                            return finalCategories.map((cat) => (
                                                                <button
                                                                    key={cat}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, category: cat, device: '' });
                                                                        setShowCategoryDropdown(false);
                                                                    }}
                                                                    className={`w-full text-left px-5 py-3 text-sm transition-colors ${formData.category === cat ? 'text-eco bg-eco/5 font-black' : 'text-gray-600 hover:bg-gray-50'}`}
                                                                >
                                                                    {t(`complaint.category_${cat.toLowerCase().replace(/\s+/g, '_')}`, cat)}
                                                                </button>
                                                            ));
                                                        })()}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('complaint.room_device', 'Ruangan & Perangkat')} <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowDeviceDropdown(!showDeviceDropdown)}
                                                className={`w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium transition-all ${showDeviceDropdown ? 'bg-white border-eco ring-4 ring-eco/15' : 'hover:bg-gray-100'}`}
                                            >
                                                <span className={formData.device ? 'text-gray-900' : 'text-gray-400'}>
                                                    {formData.device || t('complaint.room_device', 'Ruangan & Perangkat')}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDeviceDropdown ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showDeviceDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-[60]" onClick={() => setShowDeviceDropdown(false)}></div>
                                                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[210] animate-in fade-in zoom-in-95 duration-200 max-h-[250px] overflow-y-auto custom-scrollbar">
                                                        {userDevices.length > 0 ? (
                                                            (() => {
                                                                const filtered = userDevices.filter((dev) => {
                                                                    const matchCategory = !formData.category || dev.category === formData.category;
                                                                    const matchHub = !formData.hubId || dev.hubId === formData.hubId;
                                                                    return matchCategory && matchHub;
                                                                 });
                                                                
                                                                if (filtered.length === 0) {
                                                                    return <div className="px-5 py-3 text-sm text-gray-400 italic">{t('complaint.no_device_match', 'Tidak ada perangkat yang sesuai')}</div>;
                                                                }

                                                                return filtered.map((dev) => {
                                                                    const label = `${dev.location || 'Tanpa Lokasi'} - ${dev.name}`;
                                                                    return (
                                                                        <button
                                                                            key={dev._id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setFormData({ 
                                                                                    ...formData, 
                                                                                    device: label,
                                                                                    hubId: dev.hubId,
                                                                                    bieonId: userHubs.find(h => h._id === dev.hubId)?.bieonId || formData.bieonId
                                                                                });
                                                                                setShowDeviceDropdown(false);
                                                                            }}
                                                                            className={`w-full text-left px-5 py-3 text-sm transition-colors ${formData.device === label ? 'text-eco bg-eco/5 font-black' : 'text-gray-600 hover:bg-gray-50'}`}
                                                                        >
                                                                            {label}
                                                                        </button>
                                                                    );
                                                                });
                                                            })()
                                                        ) : (
                                                            <div className="px-5 py-3 text-sm text-gray-400 italic">{t('complaint.fail_load_device', 'Gagal memuat data perangkat')}</div>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({ ...formData, device: 'Perangkat Lainnya' });
                                                                setShowDeviceDropdown(false);
                                                            }}
                                                            className={`w-full text-left px-5 py-3 text-sm transition-colors ${formData.device === 'Perangkat Lainnya' ? 'text-eco bg-eco/5 font-black' : 'text-gray-600 hover:bg-gray-100 border-t border-gray-50'}`}
                                                        >
                                                            {t('complaint.other_device', '+ Perangkat Lainnya')}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('complaint.problem_topic', 'Topik Kendala')} <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        placeholder={t('complaint.problem_topic_placeholder', 'Contoh: Sensor pH air tidak terbaca di dashboard')}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-eco focus:outline-none font-medium transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('complaint.detail_desc', 'Deskripsi Detail')} <span className="text-red-500">*</span></label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder={t('complaint.detail_desc_placeholder', 'Jelaskan kronologi atau detail kendala yang Anda alami agar teknisi kami dapat menganalisis lebih cepat...')}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-eco focus:outline-none font-medium transition-all resize-none placeholder:text-gray-400"
                                    />
                                </div>

                                {/* File Upload Section */}
                                <div>
                                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-white relative hover:border-eco transition-all group">
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
                                            <p className="text-sm font-medium text-gray-500 mb-4">{t('complaint.upload_desc', 'Unggah foto alat yang bermasalah atau screenshot dashboard (Maks. 5MB)')}</p>
                                            <button type="button" className="px-6 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors pointer-events-auto">
                                                {t('complaint.choose_files', 'Pilih File')}
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
                                                            title={t('complaint.delete_photo', 'Hapus foto')}
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
                                    <p>{t('complaint.submit_note', 'Pastikan deskripsi dan foto yang dilampirkan sudah sesuai agar teknisi dapat menangani kendala Anda lebih cepat.')}</p>
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
                                {t('dashboard.cancel', 'Batal')}
                            </button>
                            <button
                                form="complaintForm"
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] py-3.5 bg-eco text-white font-bold rounded-xl hover:bg-eco/90 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-400"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        {t('dashboard.sending', 'Memproses...')}
                                    </>
                                ) : (
                                    <>{t('complaint.send_complaint', 'Kirim Pengaduan')}</>
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
                <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-300">
                    <div className="bg-eco-50 rounded-t-[32px] sm:rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-h-[90vh] flex flex-col border-0 animate-in slide-in-from-bottom-10 duration-300">
                        <button
                            onClick={() => setRatingTargetId(null)}
                            className="absolute top-4 right-4 text-text-dim hover:text-text-headline transition-colors p-1"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        {/* Floating Emoji Badge */}
                        <div className="absolute -top-16 sm:-top-24 left-1/2 -translate-x-1/2">
                            <div className="w-32 h-32 sm:w-44 sm:h-44 bg-eco/5 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border-4 border-eco/20 relative group transition-transform hover:scale-105 duration-500">
                                <div className="absolute inset-0 bg-eco/5 rounded-full animate-pulse"></div>
                                <span className="text-7xl sm:text-8xl drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] animate-bounce-slow relative z-10">
                                    {ratingStars >= 5 ? '🤩' : ratingStars >= 4 ? '😊' : ratingStars >= 3 ? '😐' : ratingStars >= 1 ? '🙁' : '🤩'}
                                </span>
                            </div>
                        </div>

                        {/* Added large top padding to prevent the emoji from covering the text */}
                        <div className="pt-20 sm:pt-28 overflow-y-auto custom-scrollbar pr-2">
                            <h2 className="text-lg sm:text-xl font-bold text-text-headline mb-2 sm:mb-3 tracking-tight leading-tight">{t('complaint.confirm_rating_title', 'Konfirmasi & Beri Penilaian')}</h2>
                            <p className="text-text-dim text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed font-medium px-1 sm:px-2">
                                {t('complaint.confirm_rating_desc', 'Bagaimana hasil perbaikan dari teknisi kami? Penilaian Anda sangat membantu kami dalam menjaga kualitas layanan PT Matra.')}
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
                                                ? "fill-alert-warning text-alert-warning"
                                                : "fill-slate-200 text-slate-200"
                                            } drop-shadow-sm`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <p className="text-text-dim text-[10px] sm:text-xs mb-4 sm:mb-5 leading-relaxed px-2 sm:px-4 italic">
                                {t('complaint.rating_note', '"Penilaian Anda mencakup keseluruhan dari kecepatan respons, kecepatan perbaikan, komunikasi dan keramahan teknisi kami."')}
                            </p>

                            <div className="text-left mb-4 sm:mb-6">
                                <label className="block text-text-headline text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ml-1">{t('complaint.write_review', 'Tuliskan Ulasan Anda')}</label>
                                <textarea
                                    value={ratingReview}
                                    onChange={(e) => setRatingReview(e.target.value)}
                                    placeholder={t('complaint.review_placeholder', 'Contoh: Teknisi datang tepat waktu, masalah kipas exhaust sudah beres dan berfungsi normal.')}
                                    className="w-full bg-white border-0 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-text-headline placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-eco/15 resize-none h-20 sm:h-24 text-[11px] sm:text-xs transition-all shadow-sm"
                                />
                            </div>

                            <button
                                onClick={submitRating}
                                disabled={ratingStars === 0}
                                className={`w-40 sm:w-48 mx-auto py-3 sm:py-3.5 bg-eco hover:bg-eco/90 text-white font-bold text-base sm:text-[17px] rounded-full transition-all shadow-xl block ${ratingStars === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-2xl hover:-translate-y-0.5 active:scale-95'}`}
                            >
                                {t('profile.save_changes', 'Simpan')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </HomeownerLayout>
    );
}