import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SuperAdminLayout } from './SuperAdminLayout';
import { EmailApprovalTemplate } from './EmailApprovalTemplate';
import { getDeletionRequestBadgeClass, getDeletionRequestStatusMeta } from './deletionRequestUi';
import {
    Users,
    Search,
    Filter,
    Plus,
    Edit3,
    Trash2,
    Key,
    Home,
    CheckCircle,
    XCircle,
    Eye,
    X,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Save,
    AlertCircle,
    UserCog,
    Activity,
    TrendingUp,
    Monitor,
    Zap,
    Box,
    Cpu,
    ChevronDown,
    Download,
    BarChart3,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';

// Helper: format tanggal ISO ke string lokal
const formatDate = (iso) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Helper: translate PLN Category to English if language is EN
const translatePlnCategory = (label, i18n) => {
    if (!label || i18n.language !== 'en') return label;
    const l = label.toLowerCase();
    if (l.includes('subsidi')) return label.replace(/subsidi/gi, 'Subsidized');
    if (l.includes('rumah tangga')) return label.replace(/rumah tangga/gi, 'Residential');
    if (l.includes('bisnis')) return label.replace(/bisnis/gi, 'Business');
    if (l.includes('industri')) return label.replace(/industri/gi, 'Industrial');
    if (l.includes('pemerintah')) return label.replace(/pemerintah/gi, 'Government');
    if (l.includes('sosial')) return label.replace(/sosial/gi, 'Social');
    return label;
};

// End of helpers

export function ManajemenAkunPage({ onNavigate }) {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('accounts');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
    const [selectedHomeowner, setSelectedHomeowner] = useState(null);
    const [activeDetailTab, setActiveDetailTab] = useState('info');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');

    // State untuk data dari API
    const [homeowners, setHomeowners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedHomeownerHubs, setSelectedHomeownerHubs] = useState([]);
    const [selectedHomeownerDevices, setSelectedHomeownerDevices] = useState([]);
    const [isLoadingHubs, setIsLoadingHubs] = useState(false);

    // Fetch data homeowner dari backend
    useEffect(() => {
        const fetchHomeowners = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/homeowners`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (!res.ok) {
                    const text = await res.text();
                    let errMsg = `Error ${res.status}`;
                    try { const errJson = JSON.parse(text); errMsg = errJson.message || errMsg; } catch(e) {}
                    throw new Error(errMsg);
                }
                
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Target endpoint tidak ditemukan atau backend belum berjalan (menerima HTML).");
                }
                
                const json = await res.json();
                setHomeowners(json.data || []);
            } catch (err) {
                setFetchError('Gagal memuat data homeowner: ' + err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHomeowners();
    }, []);

    // Fetch Hubs untuk homeowner yang dipilih
    useEffect(() => {
        if (selectedHomeowner && activeDetailTab === 'devices') {
            const fetchHubs = async () => {
                setIsLoadingHubs(true);
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/homeowners/${selectedHomeowner._id}/stats`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    
                    if (!res.ok) {
                        const text = await res.text();
                        let errMsg = `Gagal ${res.status}`;
                        try { const errJson = JSON.parse(text); errMsg = errJson.message || errMsg; } catch(e) {}
                        throw new Error(errMsg);
                    }
                    
                    const contentType = res.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) {
                        throw new Error("Target endpoint invalid (HTML diterima)");
                    }
                    
                    const json = await res.json();
                    
                    // Kita asumsikan selectedHomeownerHubs jadi simpan summary hubnya
                    // Hub endpoint GET /api/hubs/user/:id aslinya mereturn array hub. 
                    // Kita bisa ambil array hub dulu lalu statsnya.
                    
                    // Fetch hubs (existing logic)
                    const hubsRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/hubs/user/${selectedHomeowner._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (hubsRes.ok && hubsRes.headers.get("content-type")?.includes("application/json")) {
                        const hubsJson = await hubsRes.json();
                        setSelectedHomeownerHubs(hubsJson);
                    }

                    // Fetch real devices from KendaliPerangkat (Dashboard Data)
                    // URL must be /api/kendaliperangkat (no hyphen) to match existing routes
                    const devicesRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/kendaliperangkat/my-devices?ownerId=${selectedHomeowner._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (devicesRes.ok && devicesRes.headers.get("content-type")?.includes("application/json")) {
                        const devicesJson = await devicesRes.json();
                        setSelectedHomeownerDevices(Array.isArray(devicesJson) ? devicesJson : []);
                    } else {
                        setSelectedHomeownerDevices([]);
                    }
                    
                    // Kita tambahkan update stats ke selectedHomeowner local jika diperlukan
                    if(json.success && json.data) {
                        setSelectedHomeowner(prev => ({
                            ...prev,
                            totalDevicesDetails: json.data.totalDevices,
                            totalHubsDetails: json.data.totalHubs
                        }));
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsLoadingHubs(false);
                }
            };
            fetchHubs();
        }
    }, [selectedHomeowner?._id, activeDetailTab]);

    // Event listener dari halaman lain (misal: SuperAdminDashboard)
    useEffect(() => {
        const handleOpenDetail = (e) => {
            const customerName = e.detail;
            const ho = homeowners.find(h => h.fullName === customerName);
            if (ho) {
                setSelectedHomeowner(ho);
                setActiveDetailTab('info');
                setIsDetailModalOpen(true);
            }
        };
        window.addEventListener('openHomeownerDetail', handleOpenDetail);
        return () => window.removeEventListener('openHomeownerDetail', handleOpenDetail);
    }, [homeowners]);

    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        status: 'aktif'
    });

    // Filter homeowners dari state API
    const filteredHomeowners = homeowners.filter(ho => {
        const matchesSearch =
            (ho.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ho.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ho.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (ho._id || '').toLowerCase().includes(searchQuery.toLowerCase());
        // Tidak ada field 'status' dari API saat ini, tampilkan semua
        return matchesSearch;
    });

    // Stats
    const totalHomeowners = homeowners.length;
    const activeHomeowners = homeowners.length; // semua dianggap aktif jika belum ada field status
    const warningHomeowners = 0;
    const totalDevices = homeowners.reduce((sum, h) => sum + (h.totalHubs || 0), 0);

    const handleAddHomeowner = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/homeowners`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    phoneNumber: formData.phone || '',
                    address: formData.address || '',
                    username: formData.username || ''
                })
            });

            const text = await res.text();
            
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Target endpoint tidak tersedia atau ada kesalahan server (HTML diterima).");
            }
            
            const json = JSON.parse(text);

            if (!res.ok) {
                throw new Error(json.message || 'Gagal menambah homeowner');
            }

            alert('Homeowner berhasil ditambahkan!');
            setIsAddModalOpen(false);
            setHomeowners(prev => [json.data, ...prev]); // update state tanpa reload
        } catch (error) {
            alert('Kesalahan sewaktu menambah data: ' + error.message);
            console.error(error);
        }
    };

    const handleDownloadPDF = (title, columns, data, filename) => {
        const doc = new jsPDF('l', 'mm', 'a4');
        const isEn = i18n.language === 'en';
        const primaryColor = [0, 155, 124]; // BIEON Teal
        
        // Header Branding
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 297, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), 148.5, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(isEn ? `BIEON SMART GREEN LIVING - CUSTOMER AUDIT REPORT` : `BIEON SMART GREEN LIVING - LAPORAN AUDIT PELANGGAN`, 148.5, 30, { align: 'center' });

        // Info bar
        doc.setTextColor(100);
        doc.setFontSize(9);
        const printedAt = isEn ? `Printed at: ${new Date().toLocaleString('en-US')}` : `Dicetak pada: ${new Date().toLocaleString('id-ID')}`;
        doc.text(printedAt, 14, 48);

        autoTable(doc, {
            head: [columns],
            body: data,
            startY: 52,
            theme: 'striped',
            headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9, cellPadding: 4 },
            alternateRowStyles: { fillColor: [245, 248, 247] },
            margin: { left: 14, right: 14 }
        });

        doc.save(`${filename}_${new Date().getTime()}.pdf`);
    };

    const handleEditHomeowner = async () => {
        if (!selectedHomeowner) return;

        try {
            const token = localStorage.getItem('token');
            const payload = {
                fullName: formData.fullName,
                email: formData.email,
                phoneNumber: formData.phone || '',
                address: formData.address || '',
                username: formData.username || ''
            };
            if (formData.password) payload.password = formData.password;

            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/homeowners/${selectedHomeowner._id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const text = await res.text();
            
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Target endpoint tidak tersedia atau ada kesalahan server (HTML diterima).");
            }
            
            const json = JSON.parse(text);

            if (!res.ok) {
                throw new Error(json.message || 'Gagal mengubah homeowner');
            }

            alert('Data homeowner berhasil diupdate!');
            setIsEditModalOpen(false);
            setHomeowners(prev => prev.map(h => h._id === selectedHomeowner._id ? { ...h, ...json.data } : h));
        } catch (error) {
            alert('Kesalahan sewaktu update data: ' + error.message);
            console.error(error);
        }
    };

    const handleDeleteHomeowner = (ho) => {
        setSelectedHomeowner(ho);
        setDeleteReason('');
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteHomeowner = async () => {
        if (!deleteReason.trim()) {
            alert('Silakan masukkan alasan penghapusan.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/homeowners/${selectedHomeowner._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: deleteReason.trim() }),
            });

            const text = await res.text();
            let contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Respons bukan JSON. Ada masalah pada backend.");
            }
            
            const json = JSON.parse(text);

            if (res.ok) {
                const deletionRequest = json.data?.deletionRequest || null;
                setSuccessMessage(json.message || 'Permintaan penghapusan homeowner berhasil dibuat.');
                setHomeowners(prev => prev.map(h => (
                    h._id === selectedHomeowner._id
                        ? { ...h, deletionRequest }
                        : h
                )));
                setSelectedHomeowner(prev => prev ? { ...prev, deletionRequest } : prev);
                setIsDeleteModalOpen(false);
                setDeleteReason('');
            } else {
                alert('Gagal menghapus: ' + json.message);
            }
        } catch (err) {
            alert('Terjadi kesalahan saat menghapus data.');
            console.error(err);
        }
    };

    return (
        <SuperAdminLayout activeMenu="Homeowner" onNavigate={onNavigate} title={t('admin_homeowner.table.title')}>
            <div className="space-y-8">
                {successMessage && (
                    <div className="rounded-2xl border border-bieon-sense/25 bg-bieon-eco/10 px-4 py-3 text-sm font-semibold text-bieon-eco">
                        {successMessage}
                    </div>
                )}
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-[#129cc0] via-[#0f92b4] to-[#0b7f9d] rounded-[2rem] p-6 shadow-[0_18px_38px_-18px_rgba(18,156,192,0.55)] text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2),transparent_42%,rgba(255,255,255,0.08))] opacity-70"></div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{totalHomeowners}</span>
                                <p className="text-xs font-medium text-white/80 mt-1">{t('admin_homeowner.cards.total_clients')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#059b27] via-[#05a936] to-[#04b84a] rounded-[2rem] p-6 shadow-[0_18px_38px_-18px_rgba(5,155,39,0.55)] text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2),transparent_42%,rgba(255,255,255,0.08))] opacity-70"></div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{activeHomeowners}</span>
                                <p className="text-xs font-medium text-white/80 mt-1">{t('admin_homeowner.cards.active_status')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#129cc0] via-[#0f92b4] to-[#0b7f9d] rounded-[2rem] p-6 shadow-[0_18px_38px_-18px_rgba(18,156,192,0.55)] text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2),transparent_42%,rgba(255,255,255,0.08))] opacity-70"></div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{warningHomeowners}</span>
                                <p className="text-xs font-medium text-white/80 mt-1">{t('admin_homeowner.cards.warnings')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#059b27] via-[#05a936] to-[#04b84a] rounded-[2rem] p-6 shadow-[0_18px_38px_-18px_rgba(5,155,39,0.55)] text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2),transparent_42%,rgba(255,255,255,0.08))] opacity-70"></div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{totalDevices}</span>
                                <p className="text-xs font-medium text-white/80 mt-1">{t('admin_homeowner.cards.total_nodes')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/30">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t('admin_homeowner.table.title')}</h2>
                                <p className="text-sm font-medium text-gray-500 mt-1">{t('admin_homeowner.table.desc')}</p>
                            </div>
                            <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-3 w-full lg:w-auto">
                                <div className="relative group col-span-2 lg:w-72">
                                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bieon-eco transition-all" />
                                    <input
                                        type="text"
                                        placeholder={t('admin_homeowner.table.search_placeholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bieon-eco/10 focus:border-bieon-eco transition-all shadow-sm group-focus-within:bg-white"
                                    />
                                </div>

                                <div className="relative col-span-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                        className="flex items-center justify-between gap-4 px-4 py-2.5 w-full md:min-w-[160px] border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-all text-sm font-semibold text-gray-600 focus:outline-none focus:ring-4 focus:ring-bieon-eco/10"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-bieon-eco" />
                                            <span className="capitalize">{filterStatus === 'all' ? t('admin_homeowner.table.filter_all') : t(`admin_homeowner.table.status_${filterStatus}`)}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isFilterDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsFilterDropdownOpen(false)}></div>
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl bg-white/95">
                                                {['all', 'aktif', 'warning', 'nonaktif'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => {
                                                            setFilterStatus(status);
                                                            setIsFilterDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-between ${filterStatus === status ? 'bg-bieon-eco/10 text-bieon-eco' : 'text-gray-600 hover:bg-gray-50 hover:pl-6'}`}
                                                    >
                                                        <span className="capitalize">{status === 'all' ? t('admin_homeowner.table.filter_all') : t(`admin_homeowner.table.status_${status}`)}</span>
                                                        {filterStatus === status && <CheckCircle className="w-4 h-4 text-bieon-eco" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleDownloadPDF(
                                        t('admin_homeowner.table.title'),
                                        [
                                            "ID", 
                                            t('admin_homeowner.form_modal.lbl_fullname'), 
                                            t('admin_homeowner.form_modal.lbl_username'), 
                                            t('admin_homeowner.form_modal.lbl_email'), 
                                            t('admin_homeowner.form_modal.lbl_phone'), 
                                            t('admin_homeowner.table.col_hub')
                                        ],
                                        filteredHomeowners.map(h => [h._id, h.fullName, h.username || '-', h.email, h.phoneNumber || '-', h.totalHubs || 0]),
                                        i18n.language === 'en' ? "Customer_Report" : "Laporan_Pelanggan"
                                    )}
                                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2 group col-span-1 relative z-10"
                                >
                                    <Download className="w-4 h-4" /> {t('admin_homeowner.table.btn_export')}
                                </button>

                                <button
                                    onClick={() => {
                                        setFormData({
                                            username: '',
                                            fullName: '',
                                            email: '',
                                            phone: '',
                                            address: '',
                                            password: '',
                                            status: 'aktif'
                                        });
                                        setIsAddModalOpen(true);
                                    }}
                                    className="px-5 py-2.5 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl text-sm font-semibold hover:brightness-105 transition-all shadow-lg shadow-bieon-eco/15 flex items-center justify-center gap-2 group col-span-1 relative z-10"
                                >
                                    <Plus className="w-4 h-4" /> {t('admin_homeowner.table.btn_add_client')}
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* Loading & Error State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-16 gap-3 text-bieon-eco">
                            <div className="w-6 h-6 border-2 border-bieon-eco border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-semibold text-gray-500">Memuat data homeowner...</span>
                        </div>
                    )}
                    {fetchError && !isLoading && (
                        <div className="flex items-center justify-center py-16 gap-3 text-red-500">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm font-semibold">{fetchError}</span>
                        </div>
                    )}
                    {!isLoading && !fetchError && (
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-left table-auto min-w-[900px]">
                                <thead>
                                    <tr className="bg-gradient-to-r from-bieon-eco to-bieon-sense text-white text-[12px] font-black uppercase tracking-widest">
                                        <th className="px-6 py-4">{t('admin_homeowner.table.col_identity')}</th>
                                        <th className="px-6 py-4">{t('admin_homeowner.table.col_contact')}</th>
                                        <th className="px-6 py-4">{t('admin_homeowner.table.col_hub')}</th>
                                        <th className="px-6 py-4">{t('admin_homeowner.table.col_registered')}</th>
                                        <th className="px-6 py-4 text-center">{t('admin_homeowner.table.col_action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredHomeowners.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">{t('common.no_data', 'Tidak ada data yang ditemukan.')}</td></tr>
                                    ) : filteredHomeowners.map((ho) => (
                                        <tr key={ho._id} className="hover:bg-gray-50/50 transition-all group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 bg-gradient-to-br from-bieon-eco to-bieon-sense text-white rounded-2xl flex items-center justify-center text-lg font-black shrink-0 shadow-lg shadow-bieon-sense/15 ring-1 ring-white">
                                                        {(ho.fullName || '?').charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900">{ho.fullName}</p>
                                                        <p className="mt-1 inline-flex max-w-[180px] items-center rounded-lg border border-bieon-sense/15 bg-bieon-sense/5 px-2 py-0.5 text-[11px] font-bold text-bieon-sense truncate">@{ho.username || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                              <td className="px-6 py-5">
                                                  <div className="space-y-0.5">
                                                      <p className="text-sm font-semibold text-gray-700">{ho.email}</p>
                                                      <p className="text-xs font-medium text-gray-500">{ho.phoneNumber || '-'}</p>
                                                      {ho.deletionRequest && (
                                                          <div className={`mt-2 inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${getDeletionRequestBadgeClass(getDeletionRequestStatusMeta(ho.deletionRequest, t).tone)}`}>
                                                              {getDeletionRequestStatusMeta(ho.deletionRequest, t).label}
                                                          </div>
                                                      )}
                                                      {ho.deletionRequest && (
                                                          <p className="text-[11px] font-medium text-amber-700">{getDeletionRequestStatusMeta(ho.deletionRequest, t).note}</p>
                                                      )}
                                                  </div>
                                              </td>
                                            <td className="px-6 py-5">
                                                <span className="px-2.5 py-1 bg-bieon-eco/10 text-bieon-eco rounded-lg text-[10px] font-bold border border-bieon-eco/20">{t('admin_homeowner.table.hub_format', { count: ho.totalHubs || 0 })}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-semibold text-gray-600">{formatDate(ho.registrationDate)}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => { setSelectedHomeowner(ho); setIsDetailModalOpen(true); }}
                                                        className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-bieon-eco hover:border-bieon-eco hover:bg-bieon-eco/10 rounded-xl transition-all shadow-sm"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteHomeowner(ho)}
                                                        className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                                                        title="Hapus Klien"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Mobile View - Cards */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {filteredHomeowners.length > 0 ? (
                            filteredHomeowners.map((ho) => (
                                <div key={ho._id} className="p-5 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-gradient-to-br from-bieon-eco to-bieon-sense text-white rounded-2xl flex items-center justify-center text-lg font-black shrink-0 shadow-lg shadow-bieon-sense/15 ring-1 ring-white">
                                                {(ho.fullName || '?').charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 leading-tight">{ho.fullName}</p>
                                                <p className="mt-1 inline-flex max-w-[160px] items-center rounded-lg border border-bieon-sense/15 bg-bieon-sense/5 px-2 py-0.5 text-[11px] font-bold text-bieon-sense truncate">@{ho.username || '-'}</p>
                                            </div>
                                        </div>
                                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${getDeletionRequestBadgeClass(getDeletionRequestStatusMeta(ho.deletionRequest, t).tone)}`}>
                                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                              {getDeletionRequestStatusMeta(ho.deletionRequest, t).label}
                                          </span>
                                      </div>

                                      <div className="grid grid-cols-1 gap-2 text-xs">
                                          <div className="flex flex-col">
                                              <span className="text-gray-500 font-medium mb-0.5">{t('admin_homeowner.table.col_contact')}</span>
                                              <span className="font-semibold text-gray-900 truncate">{ho.email}</span>
                                              <span className="font-semibold text-gray-900 mt-0.5">{ho.phoneNumber || '-'}</span>
                                              {ho.deletionRequest && (
                                                  <span className="mt-1 text-[11px] font-medium text-amber-700">{getDeletionRequestStatusMeta(ho.deletionRequest, t).note}</span>
                                              )}
                                          </div>
                                      </div>

                                    <div className="grid grid-cols-2 gap-4 text-xs border-y border-gray-50 py-3">
                                        <div>
                                            <span className="text-gray-500 font-medium block mb-1">{t('admin_homeowner.table.col_hub')}</span>
                                            <span className="px-2 py-0.5 bg-bieon-eco/10 text-bieon-eco rounded-md text-[10px] font-bold border border-bieon-eco/20">{t('admin_homeowner.table.hub_format', { count: ho.totalHubs || 0 })}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 font-medium block mb-1">{t('admin_homeowner.table.col_registered')}</span>
                                            <span className="font-semibold text-gray-900">{formatDate(ho.registrationDate)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-1">
                                        <button
                                            onClick={() => { setSelectedHomeowner(ho); setIsDetailModalOpen(true); }}
                                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gradient-to-r from-bieon-eco to-bieon-sense hover:border-bieon-eco hover:text-white rounded-xl text-[10px] font-bold transition-all shadow-sm"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Detail
                                        </button>
                                        <button
                                            onClick={() => handleDeleteHomeowner(ho)}
                                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl text-[10px] font-bold transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-12 text-center text-gray-500 text-sm font-medium">
                                Tidak ada data yang ditemukan.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
                        <div className="px-8 py-6 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                                    <Plus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">{t('admin_homeowner.form_modal.title_add')}</h2>
                                    <p className="text-white/80 text-xs font-medium mt-0.5">{t('admin_homeowner.form_modal.desc_add')}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_username')}</label>
                                    <input 
                                        type="text" 
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        placeholder={t('admin_homeowner.form_modal.ph_username')}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bieon-eco/10 focus:border-bieon-eco transition-all shadow-sm" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_fullname')}</label>
                                    <input 
                                        type="text" 
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        placeholder={t('admin_homeowner.form_modal.ph_fullname')}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bieon-eco/10 focus:border-bieon-eco transition-all shadow-sm" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_email')}</label>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder={t('admin_homeowner.form_modal.ph_email')}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bieon-eco/10 focus:border-bieon-eco transition-all shadow-sm" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_phone')}</label>
                                    <input 
                                        type="text" 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        placeholder={t('admin_homeowner.form_modal.ph_phone')}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bieon-eco/10 focus:border-bieon-eco transition-all shadow-sm" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_password')}</label>
                                    <input 
                                        type="password" 
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder={t('admin_homeowner.form_modal.ph_password')}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bieon-eco/10 focus:border-bieon-eco transition-all shadow-sm" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_status')}</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bieon-eco/10 focus:border-bieon-eco transition-all shadow-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${formData.status === 'aktif' ? 'bg-bieon-eco' : formData.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                                <span className="capitalize">{formData.status}</span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isStatusDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setIsStatusDropdownOpen(false)}></div>
                                                <div className="absolute left-0 bottom-full mb-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 backdrop-blur-xl bg-white/95">
                                                    {['aktif', 'warning', 'nonaktif'].map((st) => (
                                                        <button
                                                            key={st}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({...formData, status: st});
                                                                setIsStatusDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-between ${formData.status === st ? 'bg-bieon-eco/10 text-bieon-eco' : 'text-gray-600 hover:bg-gray-50'}`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${st === 'aktif' ? 'bg-bieon-eco' : st === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                                                <span className="capitalize">{st}</span>
                                                            </div>
                                                            {formData.status === st && <CheckCircle className="w-4 h-4 text-bieon-eco" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_address')}</label>
                                <textarea 
                                    rows="3" 
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    placeholder={t('admin_homeowner.form_modal.ph_address')}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bieon-eco/10 focus:border-bieon-eco transition-all shadow-sm"
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-4 p-5 bg-bieon-eco/10 border border-bieon-eco/20 rounded-2xl">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <ShieldCheck className="w-6 h-6 text-bieon-eco" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-bieon-eco mb-0.5">{t('admin_homeowner.form_modal.notif_title')}</h4>
                                    <p className="text-xs font-medium text-bieon-eco opacity-80">{t('admin_homeowner.form_modal.notif_desc')}</p>
                                </div>
                                <button
                                    onClick={() => setIsEmailPreviewOpen(true)}
                                    className="px-4 py-2 bg-bieon-eco text-white rounded-lg hover:bg-bieon-eco transition-all font-semibold text-xs shadow-sm"
                                >
                                    {t('admin_homeowner.form_modal.btn_preview')}
                                </button>
                            </div>
                        </div>

                        <div className="px-8 py-5 border-t border-gray-50 bg-gray-50 flex items-center justify-end gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-all hover:bg-gray-100 rounded-xl">{t('admin_homeowner.form_modal.btn_cancel')}</button>
                            <button onClick={handleAddHomeowner} className="px-6 py-2.5 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl font-semibold text-sm hover:brightness-105 transition-all shadow-md shadow-bieon-eco/15 flex items-center gap-2 group">
                                {t('admin_homeowner.form_modal.btn_save_new')}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEmailPreviewOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden border border-white/20 max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between shrink-0">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{t('admin_homeowner.form_modal.btn_preview')}</h2>
                            <button onClick={() => setIsEmailPreviewOpen(false)} className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center transition-all shrink-0">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto">
                            <EmailApprovalTemplate type="welcome" data={{ fullName: 'Nama Lengkap Pelanggan', email: 'pelanggan@email.com', id: 'HO-007', username: 'pelanggan.bieon' }} />
                        </div>
                    </div>
                </div>
            )}

            {isDetailModalOpen && selectedHomeowner && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[700] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-5xl w-full flex flex-col overflow-hidden border border-white/20 max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 md:px-8 py-6 bg-gradient-to-r from-bieon-eco to-bieon-sense flex items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 sm:gap-5">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center backdrop-blur-md shadow-inner shrink-0">
                                    <UserCog className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                  <div className="text-white pr-2">
                                      <h2 className="text-lg sm:text-2xl font-bold tracking-tight leading-tight">{selectedHomeowner.fullName}</h2>
                                      <p className="text-white/80 text-[11px] sm:text-sm font-medium mt-1 leading-snug">{selectedHomeowner.email}</p>
                                      {selectedHomeowner.deletionRequest && (
                                          <div className={`mt-3 inline-flex px-3 py-1.5 rounded-full text-[11px] font-bold ${getDeletionRequestBadgeClass(getDeletionRequestStatusMeta(selectedHomeowner.deletionRequest, t).tone)}`}>
                                              {getDeletionRequestStatusMeta(selectedHomeowner.deletionRequest, t).label}
                                          </div>
                                      )}
                                  </div>
                              </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => {
                                        setFormData({
                                            fullName: selectedHomeowner.fullName,
                                            email: selectedHomeowner.email,
                                            username: selectedHomeowner.username || '',
                                            phone: selectedHomeowner.phoneNumber || '',
                                            address: selectedHomeowner.address || '',
                                            status: selectedHomeowner.status || 'aktif',
                                            password: ''
                                        });
                                        setIsDetailModalOpen(false);
                                        setTimeout(() => setIsEditModalOpen(true), 100);
                                    }}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-all backdrop-blur-sm border border-white/10"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t('admin_homeowner.detail_modal.btn_edit')}</span>
                                </button>
                                <button onClick={() => setIsDetailModalOpen(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all group shrink-0">
                                    <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="px-8 bg-white border-b border-gray-100 flex items-center gap-8 shrink-0">
                            <button
                                onClick={() => setActiveDetailTab('info')}
                                className={`py-4 text-sm font-semibold border-b-2 transition-all ${activeDetailTab === 'info' ? 'border-bieon-eco text-bieon-eco' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                {t('admin_homeowner.detail_modal.tab_info')}
                            </button>
                            <button
                                onClick={() => setActiveDetailTab('devices')}
                                className={`py-4 text-sm font-semibold border-b-2 transition-all ${activeDetailTab === 'devices' ? 'border-bieon-eco text-bieon-eco' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                {t('admin_homeowner.detail_modal.tab_devices', { count: selectedHomeowner.totalHubs || 0 })}
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white">
                            {activeDetailTab === 'info' ? (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                                        <Users className="w-6 h-6 text-bieon-eco" /> {t('admin_homeowner.detail_modal.tab_info')}
                                    </h3>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Informasi Akun */}
                                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                                            <h4 className="font-bold text-gray-900 mb-6 text-lg">{t('admin_homeowner.detail_modal.sec_account')}</h4>
                                            <div className="space-y-5">
                                                <div className="flex items-start gap-4 text-sm">
                                                    <Users className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">{t('admin_homeowner.form_modal.lbl_username')}</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.username}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <Mail className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                                      <div>
                                                          <p className="text-gray-500 font-medium mb-0.5">{t('admin_homeowner.form_modal.lbl_email')}</p>
                                                          <p className="font-bold text-gray-900">{selectedHomeowner.email}</p>
                                                          {selectedHomeowner.deletionRequest && (
                                                              <p className="mt-1 text-xs font-medium text-amber-700">{getDeletionRequestStatusMeta(selectedHomeowner.deletionRequest, t).note}</p>
                                                          )}
                                                      </div>
                                                  </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <Phone className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">{t('admin_homeowner.form_modal.lbl_phone')}</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.phoneNumber || '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">{t('admin_homeowner.detail_modal.lbl_address', t('admin_homeowner.form_modal.lbl_address'))}</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.address || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status & Aktivitas */}
                                        <div className="bg-bieon-eco/10 p-6 rounded-3xl border border-bieon-eco/20">
                                            <h4 className="font-bold text-gray-900 mb-6 text-lg">{t('admin_homeowner.detail_modal.sec_status')}</h4>
                                            <div className="space-y-6">
                                                  <div className="flex items-center justify-between text-sm pb-4 border-b border-bieon-eco/20">
                                                      <p className="text-gray-500 font-medium">{t('admin_homeowner.detail_modal.lbl_status_verified', 'Status Sistem')}</p>
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${getDeletionRequestBadgeClass(getDeletionRequestStatusMeta(selectedHomeowner.deletionRequest, t).tone)}`}>
                                                        {getDeletionRequestStatusMeta(selectedHomeowner.deletionRequest, t).label}
                                                    </span>
                                                  </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <TrendingUp className="w-5 h-5 text-bieon-eco mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">{t('admin_homeowner.detail_modal.lbl_reg_date')}</p>
                                                        <p className="font-bold text-gray-900">{formatDate(selectedHomeowner.registrationDate)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <Activity className="w-5 h-5 text-bieon-eco mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">{t('admin_homeowner.detail_modal.lbl_bieon_id')}</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.bieonId || '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <UserCog className="w-5 h-5 text-bieon-eco mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">{t('admin_homeowner.detail_modal.lbl_system')}</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.systemName || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                        {/* Statistik Perangkat */}
                                        <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100/50">
                                            <h4 className="font-bold text-gray-900 mb-4">{t('admin_homeowner.detail_modal.sec_stats')}</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-purple-50">
                                                    <Box className="w-6 h-6 text-purple-500 shrink-0" />
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 font-medium mb-0.5">{t('admin_homeowner.detail_modal.lbl_tariff')}</p>
                                                        <p className="text-lg font-bold text-gray-900 leading-none">{translatePlnCategory(selectedHomeowner.plnTariff, i18n) || '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-purple-50">
                                                    <Cpu className="w-6 h-6 text-purple-500 shrink-0" />
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 font-medium mb-0.5">{t('admin_homeowner.detail_modal.lbl_total_hub')}</p>
                                                        <p className="text-lg font-bold text-gray-900 leading-none">{selectedHomeowner.totalHubs || 0}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-purple-50">
                                                    <Zap className="w-6 h-6 text-purple-500 shrink-0" />
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 font-medium mb-0.5">{t('admin_homeowner.form_modal.lbl_status')}</p>
                                                        <p className="text-lg font-bold text-gray-900 leading-none">{t('admin_homeowner.detail_modal.lbl_status_verified')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Perangkat */}
                                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 flex flex-col">
                                            <h4 className="font-bold text-gray-900 mb-4">{t('admin_homeowner.detail_modal.sec_summary')}</h4>
                                            <div className="space-y-3 flex-1 flex flex-col">
                                                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-blue-50">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-5 h-5 text-bieon-eco" />
                                                        <span className="text-sm font-semibold text-gray-700">{t('admin_homeowner.detail_modal.lbl_hardware')}</span>
                                                    </div>
                                                    <span className="text-xl font-bold text-bieon-eco">{selectedHomeowner.totalHubs || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-blue-50">
                                                    <div className="flex items-center gap-2">
                                                        <TrendingUp className="w-5 h-5 text-blue-500" />
                                                        <span className="text-sm font-semibold text-gray-700">BIEON ID</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-blue-500">{selectedHomeowner.bieonId || '-'}</span>
                                                </div>
                                                <div className="mt-auto pt-2 flex items-center justify-between px-2">
                                                    <span className="text-sm font-semibold text-gray-500">{t('admin_homeowner.detail_modal.lbl_total_devices')}</span>
                                                    <span className="text-lg font-bold text-gray-900">{selectedHomeowner.totalHubs || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Konsumsi Energi */}
                                        <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50 flex flex-col">
                                            <h4 className="font-bold text-gray-900 mb-4">{t('admin_homeowner.detail_modal.sec_energy')}</h4>
                                            <div className="space-y-3 flex-1">
                                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 relative overflow-hidden h-[90px] flex flex-col justify-center">
                                                    <Zap className="w-16 h-16 text-orange-50 absolute -right-2 -bottom-2" />
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                                                            <Zap className="w-4 h-4" />
                                                            <span className="text-xs font-semibold">{t('admin_homeowner.detail_modal.lbl_system_name')}</span>
                                                        </div>
                                                        <div className="flex items-end gap-1">
                                                            <span className="text-lg font-bold text-gray-900 truncate w-full">{selectedHomeowner.systemName || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 relative overflow-hidden h-[90px] flex flex-col justify-center">
                                                    <Box className="w-16 h-16 text-orange-50 absolute -right-2 -bottom-2 opacity-50" />
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                                                            <span className="text-xs font-semibold">{t('admin_homeowner.detail_modal.lbl_tariff_group')}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xl font-bold text-gray-900">{translatePlnCategory(selectedHomeowner.plnTariff, i18n) || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <Monitor className="w-6 h-6 text-bieon-eco" /> {t('admin_homeowner.detail_modal.eco_title', { hub: selectedHomeownerHubs.length, device: selectedHomeownerDevices.length })}
                                        </h3>
                                    </div>

                                    <div className="space-y-6">
                                        {isLoadingHubs ? (
                                            <div className="py-12 flex flex-col items-center justify-center gap-3">
                                                <div className="w-10 h-10 border-4 border-bieon-eco border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-sm font-medium text-gray-500 text-center">{t('admin_homeowner.detail_modal.sync_data', 'Sinkronisasi data perangkat...')}</p>
                                            </div>
                                        ) : selectedHomeownerHubs.length > 0 ? (
                                            selectedHomeownerHubs.map((hub, idx) => {
                                                const hubIdStr = String(hub._id || hub.id);
                                                const hubDevices = selectedHomeownerDevices.filter(d => 
                                                    String(d.hubId?._id || d.hubId) === hubIdStr
                                                );
                                                return (
                                                    <div key={hubIdStr || idx} className="bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                        <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${hub.status === 'Online' ? 'bg-bieon-eco/10 text-bieon-eco' : 'bg-gray-100 text-gray-400'}`}>
                                                                    <Cpu className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{hub.name || 'BIEON Hub'}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className="text-xs text-gray-500 font-medium">BIEON ID: {hub.bieonId || '-'}</span>
                                                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                        <span className="text-xs text-gray-500 font-medium">{hubDevices.length} {t('admin_homeowner.detail_modal.lbl_devices_connected', 'Perangkat Terhubung')}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${hub.status === 'Online' ? 'bg-bieon-eco/15 text-bieon-eco' : 'bg-gray-100 text-gray-500'}`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${hub.status === 'Online' ? 'bg-bieon-eco' : 'bg-gray-400'}`}></div>
                                                                    {hub.status || 'Offline'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {hubDevices.length > 0 ? (
                                                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                {hubDevices.map((device) => (
                                                                    <div key={device._id} className="flex items-center gap-4 p-3.5 bg-white rounded-2xl border border-gray-100/50 shadow-sm hover:border-bieon-sense/25 transition-all group">
                                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-bieon-eco/10 group-hover:text-bieon-eco transition-all">
                                                                            <Box className="w-5 h-5" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-bold text-gray-900 truncate">{device.name}</p>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{device.type}</span>
                                                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                                <span className={`text-[10px] font-bold ${device.status === 'ONLINE' ? 'text-bieon-eco' : 'text-red-400'}`}>{device.status}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="p-8 text-center bg-white/50">
                                                                <p className="text-xs font-medium text-gray-400 italic">{t('admin_homeowner.detail_modal.no_devices_hub', 'Belum ada perangkat yang terpasang pada hub ini.')}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                                    <Cpu className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900">{t('admin_homeowner.detail_modal.empty_devices_title')}</h4>
                                                <p className="text-sm text-gray-500 max-w-xs mt-2">{t('admin_homeowner.detail_modal.empty_devices_desc')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && selectedHomeowner && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
                        <div className="px-8 py-6 bg-blue-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                                    <Edit3 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">{t('admin_homeowner.form_modal.title_edit')}</h2>
                                    <p className="text-white/80 text-xs font-medium mt-0.5">{t('admin_homeowner.form_modal.desc_edit')}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_username')}</label>
                                    <input 
                                        type="text" 
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_fullname')}</label>
                                    <input 
                                        type="text" 
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_email')}</label>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_phone')}</label>
                                    <input 
                                        type="text" 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_password_opt')}</label>
                                    <input 
                                        type="password" 
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder={t('admin_homeowner.form_modal.ph_password')}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_status')}</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${formData.status === 'aktif' ? 'bg-bieon-eco' : formData.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                                <span className="capitalize">{t(`admin_homeowner.table.status_${formData.status}`)}</span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isStatusDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setIsStatusDropdownOpen(false)}></div>
                                                <div className="absolute left-0 bottom-full mb-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 backdrop-blur-xl bg-white/95 text-gray-800">
                                                    {['aktif', 'warning', 'nonaktif'].map((st) => (
                                                        <button
                                                            key={st}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({...formData, status: st});
                                                                setIsStatusDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-between ${formData.status === st ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${st === 'aktif' ? 'bg-bieon-eco' : st === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                                                                <span className="capitalize">{t(`admin_homeowner.table.status_${st}`)}</span>
                                                            </div>
                                                            {formData.status === st && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_homeowner.form_modal.lbl_address')}</label>
                                <textarea 
                                    rows="3" 
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    placeholder={t('admin_homeowner.form_modal.ph_address')}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm"
                                ></textarea>
                            </div>
                        </div>

                        <div className="px-8 py-5 border-t border-gray-50 bg-gray-50 flex items-center justify-end gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-all hover:bg-gray-100 rounded-xl">{t('admin_homeowner.form_modal.btn_cancel')}</button>
                            <button onClick={handleEditHomeowner} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2 group">
                                {t('admin_homeowner.form_modal.btn_save_edit')}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && selectedHomeowner && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
                        <div className="px-8 py-6 bg-[#dc2626] flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trash2 className="w-6 h-6" /> {t('admin_homeowner.delete_modal.title')}
                            </h2>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                              <div className="bg-red-50/50 p-5 rounded-2xl">
                                  <p className="text-sm font-medium text-gray-600 mb-2">{t('admin_homeowner.delete_modal.desc_start')}</p>
                                  <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedHomeowner.fullName}</h3>
                                  <p className="text-sm text-gray-500">{selectedHomeowner.email}</p>
                                  {selectedHomeowner.deletionRequest?.status === 'pending' && (
                                      <p className="mt-2 text-xs font-semibold text-amber-700">Akun ini sudah memiliki request approval yang masih menunggu keputusan Project Owner.</p>
                                  )}
                              </div>

                            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-red-600 mb-3">
                                    <XCircle className="w-5 h-5" /> {t('admin_homeowner.delete_modal.warn_title')}
                                </h4>
                                <ul className="list-disc list-inside space-y-2 text-xs font-medium text-red-700/80 ml-1">
                                    <li>{t('admin_homeowner.delete_modal.warn_point_1')}</li>
                                    <li>{t('admin_homeowner.delete_modal.warn_point_2')}</li>
                                    <li>{t('admin_homeowner.delete_modal.warn_point_3')}</li>
                                    <li>{t('admin_homeowner.delete_modal.warn_point_4')}</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900">{t('admin_homeowner.delete_modal.lbl_reason')} <span className="text-red-500">*</span></label>
                                <textarea
                                    rows="3"
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder={t('admin_homeowner.delete_modal.ph_reason')}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-500 transition-all shadow-sm"
                                ></textarea>
                            </div>

                            <p className="text-[11px] font-medium text-gray-500">
                                {t('admin_homeowner.delete_modal.help_text')}
                            </p>
                        </div>

                        <div className="px-8 py-5 border-t border-gray-50 bg-gray-50 flex items-center justify-between gap-4 shrink-0">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                            >
                                {t('admin_homeowner.form_modal.btn_cancel')}
                            </button>
                            <button
                                onClick={confirmDeleteHomeowner}
                                disabled={!deleteReason.trim()}
                                className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm ${!deleteReason.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#dc2626] text-white hover:bg-red-700 shadow-lg shadow-red-200'}`}
                            >
                                {t('admin_homeowner.delete_modal.btn_confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
