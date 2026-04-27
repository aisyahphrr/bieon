import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SuperAdminLayout } from './SuperAdminLayout';
import { EmailApprovalTemplate } from './EmailApprovalTemplate';
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

// End of helpers

export function ManajemenAkunPage({ onNavigate }) {
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
    const [deleteReason, setDeleteReason] = useState('');

    // State untuk data dari API
    const [homeowners, setHomeowners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [selectedHomeownerHubs, setSelectedHomeownerHubs] = useState([]);
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
    }, [selectedHomeowner, activeDetailTab]);

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
        const doc = new jsPDF();
        doc.text(title, 14, 15);

        autoTable(doc, {
            head: [columns],
            body: data,
            startY: 20,
        });

        doc.save(`${filename}.pdf`);
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
                headers: { Authorization: `Bearer ${token}` },
            });

            const text = await res.text();
            let contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Respons bukan JSON. Ada masalah pada backend.");
            }
            
            const json = JSON.parse(text);

            if (res.ok) {
                alert('Homeowner berhasil dihapus!');
                // Refresh list
                setHomeowners(prev => prev.filter(h => h._id !== selectedHomeowner._id));
                setIsDeleteModalOpen(false);
            } else {
                alert('Gagal menghapus: ' + json.message);
            }
        } catch (err) {
            alert('Terjadi kesalahan saat menghapus data.');
            console.error(err);
        }
    };

    return (
        <SuperAdminLayout activeMenu="Homeowner" onNavigate={onNavigate} title="Manajemen Akun Homeowner">
            <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#3b82f6] rounded-[2rem] p-6 shadow-xl shadow-blue-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{totalHomeowners}</span>
                                <p className="text-xs font-medium text-white/80 mt-1">Total Klien</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#10b981] rounded-[2rem] p-6 shadow-xl shadow-emerald-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{activeHomeowners}</span>
                                <p className="text-xs font-medium text-white/80 mt-1">Status Aktif</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#f59e0b] rounded-[2rem] p-6 shadow-xl shadow-amber-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{warningHomeowners}</span>
                                <p className="text-xs font-medium text-white/80 mt-1">Peringatan</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#a855f7] rounded-[2rem] p-6 shadow-xl shadow-purple-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{totalDevices}</span>
                                <p className="text-xs font-medium text-white/80 mt-1">Total Node</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/30">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Daftar Akun Homeowner</h2>
                                <p className="text-sm font-medium text-gray-500 mt-1">Manajemen akun, monitoring konsumsi, dan kontrol akses klien BIEON</p>
                            </div>
                            <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-3 w-full lg:w-auto">
                                <div className="relative group col-span-2 lg:w-72">
                                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#009b7c] transition-all" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama, email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-[#009b7c] transition-all shadow-sm group-focus-within:bg-white"
                                    />
                                </div>

                                <div className="relative col-span-1">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="appearance-none flex items-center justify-between gap-8 px-4 py-2.5 w-full md:min-w-[150px] border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-colors text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="aktif">Aktif</option>
                                        <option value="warning">Warning</option>
                                        <option value="nonaktif">Nonaktif</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                <button
                                    onClick={() => handleDownloadPDF(
                                        "Daftar Akun Homeowner",
                                        ["ID", "Nama Lengkap", "Username", "Email", "Telepon", "Total Hub"],
                                        filteredHomeowners.map(h => [h._id, h.fullName, h.username || '-', h.email, h.phoneNumber || '-', h.totalHubs || 0]),
                                        "Homeowner_Report"
                                    )}
                                    className="px-5 py-2.5 bg-[#009b7c] text-white rounded-xl text-sm font-semibold hover:bg-[#008268] transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 group col-span-1"
                                >
                                    <Download className="w-4 h-4" /> Download
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* Loading & Error State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-16 gap-3 text-[#009b7c]">
                            <div className="w-6 h-6 border-2 border-[#009b7c] border-t-transparent rounded-full animate-spin"></div>
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
                                    <tr className="bg-[#009b7c] text-white text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-4">Identitas</th>
                                        <th className="px-6 py-4">Email & Kontak</th>
                                        <th className="px-6 py-4">Hub</th>
                                        <th className="px-6 py-4">Terdaftar</th>
                                        <th className="px-6 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredHomeowners.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">Tidak ada data homeowner yang ditemukan.</td></tr>
                                    ) : filteredHomeowners.map((ho) => (
                                        <tr key={ho._id} className="hover:bg-gray-50/50 transition-all group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-[#009b7c]/10 text-[#009b7c] rounded-xl flex items-center justify-center text-lg font-bold shrink-0">
                                                        {(ho.fullName || '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{ho.fullName}</p>
                                                        <p className="text-xs font-semibold text-[#009b7c]">@{ho.username || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-semibold text-gray-700">{ho.email}</p>
                                                    <p className="text-xs font-medium text-gray-500">{ho.phoneNumber || '-'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold border border-emerald-100">{ho.totalHubs || 0} Hub</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-semibold text-gray-600">{formatDate(ho.registrationDate)}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => { setSelectedHomeowner(ho); setIsDetailModalOpen(true); }}
                                                        className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-[#009b7c] hover:border-[#009b7c] hover:bg-emerald-50 rounded-xl transition-all shadow-sm"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteHomeowner(ho)}
                                                        className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm"
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
                                            <div className="w-10 h-10 bg-[#009b7c]/10 text-[#009b7c] rounded-xl flex items-center justify-center text-lg font-bold shrink-0">
                                                {(ho.fullName || '?').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{ho.fullName}</p>
                                                <p className="text-[11px] font-semibold text-[#009b7c]">@{ho.username || '-'}</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 bg-[#EAFDF5] text-[#10b981]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            Aktif
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 text-xs">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 font-medium mb-0.5">Email & Kontak</span>
                                            <span className="font-semibold text-gray-900 truncate">{ho.email}</span>
                                            <span className="font-semibold text-gray-900 mt-0.5">{ho.phoneNumber || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-xs border-y border-gray-50 py-3">
                                        <div>
                                            <span className="text-gray-500 font-medium block mb-1">Hub BIEON</span>
                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold border border-emerald-100">{ho.totalHubs || 0} Hub</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 font-medium block mb-1">Terdaftar</span>
                                            <span className="font-semibold text-gray-900">{formatDate(ho.registrationDate)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <button
                                            onClick={() => { setSelectedHomeowner(ho); setIsDetailModalOpen(true); }}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-[#009b7c] hover:border-[#009b7c] hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                        >
                                            <Eye className="w-4 h-4" /> Lihat Detail
                                        </button>
                                        <button
                                            onClick={() => handleDeleteHomeowner(ho)}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl text-xs font-bold transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" /> Hapus
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
                        <div className="px-8 py-6 bg-[#009b7c] text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                                    <Plus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">Tambah Homeowner</h2>
                                    <p className="text-white/80 text-xs font-medium mt-0.5">Pengaturan akun baru Sistem BIEON</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Nama Lengkap</label>
                                    <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-[#009b7c] transition-all shadow-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Email Klien</label>
                                    <input type="email" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-[#009b7c] transition-all shadow-sm" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Alamat Domisili</label>
                                <textarea rows="3" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-[#009b7c] transition-all shadow-sm"></textarea>
                            </div>

                            <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <ShieldCheck className="w-6 h-6 text-[#009b7c]" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-emerald-900 mb-0.5">Notifikasi Sistem</h4>
                                    <p className="text-xs font-medium text-emerald-700 opacity-80">Email selamat datang & kredensial login akan dikirim otomatis.</p>
                                </div>
                                <button
                                    onClick={() => setIsEmailPreviewOpen(true)}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold text-xs shadow-sm"
                                >
                                    Pratinjau Email
                                </button>
                            </div>
                        </div>

                        <div className="px-8 py-5 border-t border-gray-50 bg-gray-50 flex items-center justify-end gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-all hover:bg-gray-100 rounded-xl">Batal</button>
                            <button onClick={handleAddHomeowner} className="px-6 py-2.5 bg-[#009b7c] text-white rounded-xl font-semibold text-sm hover:bg-[#008268] transition-all shadow-md shadow-emerald-100 flex items-center gap-2 group">
                                Simpan Data Klien
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEmailPreviewOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden border border-white/20">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Pratinjau Notifikasi Email</h2>
                            <button onClick={() => setIsEmailPreviewOpen(false)} className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8">
                            <EmailApprovalTemplate type="welcome" data={{ fullName: 'Pengguna Baru BIEON', email: 'contoh@gmail.com', id: 'HO-007', username: 'pengguna.baru' }} />
                        </div>
                    </div>
                </div>
            )}

            {isDetailModalOpen && selectedHomeowner && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[700] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-5xl w-full flex flex-col overflow-hidden border border-white/20 max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 md:px-8 py-6 bg-[#009b7c] flex items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 sm:gap-5">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center backdrop-blur-md shadow-inner shrink-0">
                                    <UserCog className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <div className="text-white pr-2">
                                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight leading-tight">{selectedHomeowner.fullName}</h2>
                                    <p className="text-white/80 text-[11px] sm:text-sm font-medium mt-1 leading-snug">{selectedHomeowner.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all group shrink-0">
                                <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="px-8 bg-white border-b border-gray-100 flex items-center gap-8 shrink-0">
                            <button
                                onClick={() => setActiveDetailTab('info')}
                                className={`py-4 text-sm font-semibold border-b-2 transition-all ${activeDetailTab === 'info' ? 'border-[#009b7c] text-[#009b7c]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Informasi Pelanggan
                            </button>
                            <button
                                onClick={() => setActiveDetailTab('devices')}
                                className={`py-4 text-sm font-semibold border-b-2 transition-all ${activeDetailTab === 'devices' ? 'border-[#009b7c] text-[#009b7c]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Perangkat ({selectedHomeowner.totalHubs || 0})
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 bg-white">
                            {activeDetailTab === 'info' ? (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                                        <Users className="w-6 h-6 text-[#009b7c]" /> Informasi Pelanggan
                                    </h3>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Informasi Akun */}
                                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                                            <h4 className="font-bold text-gray-900 mb-6 text-lg">Informasi Akun</h4>
                                            <div className="space-y-5">
                                                <div className="flex items-start gap-4 text-sm">
                                                    <Users className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">Username</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.username}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <Mail className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">Email</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <Phone className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">No. Telepon</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.phoneNumber || '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">Alamat</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.address || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status & Aktivitas */}
                                        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50">
                                            <h4 className="font-bold text-gray-900 mb-6 text-lg">Status & Aktivitas</h4>
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between text-sm pb-4 border-b border-emerald-100/50">
                                                    <p className="text-gray-500 font-medium">Status Sistem</p>
                                                    <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase bg-[#009b7c] text-white">AKTIF</span>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <TrendingUp className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">Tanggal Registrasi</p>
                                                        <p className="font-bold text-gray-900">{formatDate(selectedHomeowner.registrationDate)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <Activity className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">ID BIEON</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.bieonId || '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <UserCog className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">Sistem</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.systemName || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                        {/* Statistik Perangkat */}
                                        <div className="bg-purple-50/50 p-6 rounded-3xl border border-purple-100/50">
                                            <h4 className="font-bold text-gray-900 mb-4">Statistik Perangkat</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-purple-50">
                                                    <Box className="w-6 h-6 text-purple-500 shrink-0" />
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 font-medium mb-0.5">Tarif PLN</p>
                                                        <p className="text-lg font-bold text-gray-900 leading-none">{selectedHomeowner.plnTariff || '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-purple-50">
                                                    <Cpu className="w-6 h-6 text-purple-500 shrink-0" />
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 font-medium mb-0.5">Total Hub</p>
                                                        <p className="text-lg font-bold text-gray-900 leading-none">{selectedHomeowner.totalHubs || 0}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-purple-50">
                                                    <Zap className="w-6 h-6 text-purple-500 shrink-0" />
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 font-medium mb-0.5">Status Akun</p>
                                                        <p className="text-lg font-bold text-gray-900 leading-none">Terverifikasi</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Perangkat */}
                                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 flex flex-col">
                                            <h4 className="font-bold text-gray-900 mb-4">Ringkasan Sistem</h4>
                                            <div className="space-y-3 flex-1 flex flex-col">
                                                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-blue-50">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-5 h-5 text-[#10b981]" />
                                                        <span className="text-sm font-semibold text-gray-700">Hardware Hub</span>
                                                    </div>
                                                    <span className="text-xl font-bold text-[#10b981]">{selectedHomeowner.totalHubs || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-blue-50">
                                                    <div className="flex items-center gap-2">
                                                        <TrendingUp className="w-5 h-5 text-blue-500" />
                                                        <span className="text-sm font-semibold text-gray-700">BIEON ID</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-blue-500">{selectedHomeowner.bieonId || '-'}</span>
                                                </div>
                                                <div className="mt-auto pt-2 flex items-center justify-between px-2">
                                                    <span className="text-sm font-semibold text-gray-500">Total Perangkat</span>
                                                    <span className="text-lg font-bold text-gray-900">{selectedHomeowner.totalHubs || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Konsumsi Energi */}
                                        <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50 flex flex-col">
                                            <h4 className="font-bold text-gray-900 mb-4">Monitoring Energi</h4>
                                            <div className="space-y-3 flex-1">
                                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 relative overflow-hidden h-[90px] flex flex-col justify-center">
                                                    <Zap className="w-16 h-16 text-orange-50 absolute -right-2 -bottom-2" />
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                                                            <Zap className="w-4 h-4" />
                                                            <span className="text-xs font-semibold">Nama Sistem</span>
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
                                                            <span className="text-xs font-semibold">Golongan Tarif PLN</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xl font-bold text-gray-900">{selectedHomeowner.plnTariff || '-'}</span>
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
                                            <Cpu className="w-6 h-6 text-[#009b7c]" /> Daftar Hub ({selectedHomeownerHubs.length})
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        {isLoadingHubs ? (
                                            <div className="py-12 text-center text-gray-500 text-sm font-medium">Memuat data perangkat...</div>
                                        ) : selectedHomeownerHubs.length > 0 ? (
                                            selectedHomeownerHubs.map((hub, idx) => (
                                                <div key={hub._id || idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600">
                                                            <Box className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{hub.name || 'Hub Node'}</p>
                                                            <p className="text-xs text-gray-500">ID BIEON: {hub.bieonId || '-'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1.5 justify-end mb-0.5">
                                                            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                                                            <span className="text-[10px] font-bold uppercase text-[#10b981]">Online</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400">Aktif</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center text-gray-500 text-sm font-medium">Tidak ada perangkat yang terhubung.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && selectedHomeowner && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
                        <div className="px-8 py-6 bg-[#dc2626] flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trash2 className="w-6 h-6" /> Hapus Pelanggan
                            </h2>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                            <div className="bg-red-50/50 p-5 rounded-2xl">
                                <p className="text-sm font-medium text-gray-600 mb-2">Anda akan menghapus pelanggan:</p>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedHomeowner.fullName}</h3>
                                <p className="text-sm text-gray-500">{selectedHomeowner.email}</p>
                            </div>

                            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-red-600 mb-3">
                                    <XCircle className="w-5 h-5" /> Peringatan!
                                </h4>
                                <ul className="list-disc list-inside space-y-2 text-xs font-medium text-red-700/80 ml-1">
                                    <li>Setelah disetujui Project Owner, proses penghapusan bersifat final dan tidak dapat dibatalkan</li>
                                    <li>Semua data akan hilang secara permanen dan tidak dapat dipulihkan</li>
                                    <li>Sistem tidak menyimpan cadangan (backup) untuk data yang telah dihapus</li>
                                    <li>Akses pengguna akan ditutup sepenuhnya tanpa pengecualian</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900">Alasan Penghapusan <span className="text-red-500">*</span></label>
                                <textarea
                                    rows="3"
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder="Masukkan alasan mengapa akun ini perlu dihapus..."
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-500 transition-all shadow-sm"
                                ></textarea>
                            </div>

                            <p className="text-[11px] font-medium text-gray-500">
                                * Form ini akan dikirimkan ke Project Owner untuk persetujuan dan akan disimpan dalam trash management.
                            </p>
                        </div>

                        <div className="px-8 py-5 border-t border-gray-50 bg-gray-50 flex items-center justify-between gap-4 shrink-0">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDeleteHomeowner}
                                disabled={!deleteReason.trim()}
                                className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm ${!deleteReason.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#dc2626] text-white hover:bg-red-700 shadow-lg shadow-red-200'}`}
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}