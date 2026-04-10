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

// Mock data homeowners
const mockHomeowners = [
    {
        id: 'HO001',
        username: 'ahmad.fauzi',
        fullName: 'Ahmad Fauzi',
        email: 'ahmad.fauzi@email.com',
        phone: '+62 812-3456-7890',
        address: 'Jl. Merdeka No. 123, Bandung, Jawa Barat',
        status: 'aktif',
        registrationDate: '15 Jan 2024',
        lastActive: '2 menit lalu',
        totalBieonDevices: 4,
        totalSmartDevices: 28,
        assignedTechnician: 'Budi Santoso',
        monthlyConsumption: 245.5,
        monthlyBill: 368250
    },
    {
        id: 'HO002',
        username: 'siti.nurhaliza',
        fullName: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@email.com',
        phone: '+62 813-2456-8901',
        address: 'Jl. Sudirman No. 45, Jakarta Selatan',
        status: 'aktif',
        registrationDate: '22 Feb 2024',
        lastActive: '5 menit lalu',
        totalBieonDevices: 3,
        totalSmartDevices: 19,
        assignedTechnician: 'Andi Wijaya',
        monthlyConsumption: 189.3,
        monthlyBill: 283950
    },
    {
        id: 'HO003',
        username: 'budi.santoso',
        fullName: 'Budi Santoso',
        email: 'budi.santoso@email.com',
        phone: '+62 815-3456-9012',
        address: 'Jl. Gatot Subroto No. 88, Surabaya, Jawa Timur',
        status: 'warning',
        registrationDate: '10 Mar 2024',
        lastActive: '2 jam lalu',
        totalBieonDevices: 5,
        totalSmartDevices: 34,
        assignedTechnician: 'Budi Santoso',
        monthlyConsumption: 312.7,
        monthlyBill: 469050
    },
    {
        id: 'HO004',
        username: 'dewi.lestari',
        fullName: 'Dewi Lestari',
        email: 'dewi.lestari@email.com',
        phone: '+62 817-4567-0123',
        address: 'Jl. Malioboro No. 56, Yogyakarta',
        status: 'aktif',
        registrationDate: '5 Apr 2024',
        lastActive: '10 menit lalu',
        totalBieonDevices: 2,
        totalSmartDevices: 15,
        assignedTechnician: 'Andi Wijaya',
        monthlyConsumption: 156.2,
        monthlyBill: 234300
    },
    {
        id: 'HO005',
        username: 'rizki.pratama',
        fullName: 'Rizki Pratama',
        email: 'rizki.pratama@email.com',
        phone: '+62 819-5678-1234',
        address: 'Jl. Pemuda No. 99, Semarang, Jawa Tengah',
        status: 'nonaktif',
        registrationDate: '18 May 2024',
        lastActive: '2 hari lalu',
        totalBieonDevices: 3,
        totalSmartDevices: 22,
        assignedTechnician: 'Budi Santoso',
        monthlyConsumption: 0,
        monthlyBill: 0
    },
    {
        id: 'HO006',
        username: 'linda.wijaya',
        fullName: 'Linda Wijaya',
        email: 'linda.wijaya@email.com',
        phone: '+62 821-6789-2345',
        address: 'Jl. Asia Afrika No. 77, Jakarta Pusat',
        status: 'aktif',
        registrationDate: '12 Jun 2024',
        lastActive: '1 menit lalu',
        totalBieonDevices: 6,
        totalSmartDevices: 42,
        assignedTechnician: 'Andi Wijaya',
        monthlyConsumption: 421.8,
        monthlyBill: 632700
    },
];

const energyTrendData = [
    { month: 'Jan', consumption: 1245 },
    { month: 'Feb', consumption: 1389 },
    { month: 'Mar', consumption: 1521 },
    { month: 'Apr', consumption: 1456 },
    { month: 'May', consumption: 1678 },
    { month: 'Jun', consumption: 1815 },
];

const deviceStatusData = [
    { name: 'Online', value: 156, color: '#10b981' },
    { name: 'Offline', value: 24, color: '#ef4444' },
    { name: 'Warning', value: 12, color: '#f59e0b' },
];

const technicianDistributionData = [
    { name: 'Budi Santoso', clients: 3, color: '#3b82f6' },
    { name: 'Andi Wijaya', clients: 3, color: '#10b981' },
];

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

    useEffect(() => {
        const handleOpenDetail = (e) => {
            const customerName = e.detail;
            const ho = mockHomeowners.find(h => h.fullName === customerName);
            if (ho) {
                setSelectedHomeowner(ho);
                setActiveDetailTab('info');
                setIsDetailModalOpen(true);
            }
        };
        window.addEventListener('openHomeownerDetail', handleOpenDetail);
        return () => window.removeEventListener('openHomeownerDetail', handleOpenDetail);
    }, []);

    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        status: 'aktif'
    });

    // Filter homeowners
    const filteredHomeowners = mockHomeowners.filter(ho => {
        const matchesSearch =
            ho.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ho.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ho.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ho.id.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' || ho.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Stats
    const totalHomeowners = mockHomeowners.length;
    const activeHomeowners = mockHomeowners.filter(h => h.status === 'aktif').length;
    const warningHomeowners = mockHomeowners.filter(h => h.status === 'warning').length;
    const totalDevices = mockHomeowners.reduce((sum, h) => sum + h.totalSmartDevices, 0);

    const handleAddHomeowner = () => {
        alert('Homeowner berhasil ditambahkan!');
        setIsAddModalOpen(false);
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

    const handleEditHomeowner = () => {
        alert('Data homeowner berhasil diupdate!');
        setIsEditModalOpen(false);
    };

    const handleDeleteHomeowner = (ho) => {
        setSelectedHomeowner(ho);
        setDeleteReason('');
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteHomeowner = () => {
        if (!deleteReason.trim()) {
            alert('Silakan masukkan alasan penghapusan.');
            return;
        }
        alert('Homeowner berhasil dihapus!');
        setIsDeleteModalOpen(false);
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
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative group flex-1 lg:w-72">
                                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#009b7c] transition-all" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama, email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-[#009b7c] transition-all shadow-sm group-focus-within:bg-white"
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="appearance-none flex items-center justify-between gap-8 px-4 py-2.5 min-w-[150px] border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-colors text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer"
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
                                        ["ID", "Nama Lengkap", "Username", "Email", "Telepon", "Status", "Teknisi"],
                                        filteredHomeowners.map(h => [h.id, h.fullName, h.username, h.email, h.phone, h.status.toUpperCase(), h.assignedTechnician]),
                                        "Homeowner_Report"
                                    )}
                                    className="px-5 py-2.5 bg-[#009b7c] text-white rounded-xl text-sm font-semibold hover:bg-[#008268] transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 group"
                                >
                                    <Download className="w-4 h-4" /> Download
                                </button>

                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead>
                                <tr className="bg-[#009b7c] text-white text-xs font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4">Identitas</th>
                                    <th className="px-6 py-4">Email & Kontak</th>
                                    <th className="px-6 py-4">Hardware</th>
                                    <th className="px-6 py-4">Teknisi</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredHomeowners.map((ho) => (
                                    <tr key={ho.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#009b7c]/10 text-[#009b7c] rounded-xl flex items-center justify-center text-lg font-bold">
                                                    {ho.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{ho.fullName}</p>
                                                    <p className="text-xs font-semibold text-[#009b7c]">ID: {ho.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold text-gray-700">{ho.email}</p>
                                                <p className="text-xs font-medium text-gray-500">{ho.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold border border-emerald-100">{ho.totalBieonDevices} Hub</span>
                                                <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-semibold border border-purple-100">{ho.totalSmartDevices} Node</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <UserCog className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">{ho.assignedTechnician}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-2 w-fit ${ho.status === 'aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    ho.status === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${ho.status === 'aktif' ? 'bg-emerald-600' :
                                                        ho.status === 'warning' ? 'bg-amber-600' :
                                                            'bg-red-600'
                                                    }`}></span>
                                                {ho.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => { setSelectedHomeowner(ho); setIsDetailModalOpen(true); }}
                                                    className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-[#009b7c] hover:border-[#009b7c] hover:bg-emerald-50 rounded-xl transition-all shadow-sm group/btn"
                                                >
                                                    <Eye className="w-4 h-4 transition-transform gap-2" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteHomeowner(ho)}
                                                    className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm group/btn"
                                                >
                                                    <Trash2 className="w-4 h-4 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                            <div className="grid grid-cols-2 gap-6">
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
                        <div className="px-8 py-6 bg-[#009b7c] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-white/20 rounded-[1.25rem] flex items-center justify-center backdrop-blur-md shadow-inner">
                                    <UserCog className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-white">
                                    <h2 className="text-2xl font-bold tracking-tight">{selectedHomeowner.fullName}</h2>
                                    <p className="text-white/80 text-sm font-medium mt-1">ID: {selectedHomeowner.id} • {selectedHomeowner.email}</p>
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
                                Perangkat (10)
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
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">Alamat</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.address}</p>
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
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${selectedHomeowner.status === 'aktif' ? 'bg-[#009b7c] text-white' :
                                                            selectedHomeowner.status === 'warning' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                                                        }`}>{selectedHomeowner.status}</span>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <TrendingUp className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">Tanggal Registrasi</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.registrationDate}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <Activity className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">Terakhir Aktif</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.lastActive}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm">
                                                    <UserCog className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-gray-500 font-medium mb-0.5">Teknisi</p>
                                                        <p className="font-bold text-gray-900">{selectedHomeowner.assignedTechnician}</p>
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
                                                        <p className="text-[11px] text-gray-500 font-medium mb-0.5">BIEON Nodes</p>
                                                        <p className="text-lg font-bold text-gray-900 leading-none">1</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-purple-50">
                                                    <Cpu className="w-6 h-6 text-purple-500 shrink-0" />
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 font-medium mb-0.5">Hub Nodes</p>
                                                        <p className="text-lg font-bold text-gray-900 leading-none">{selectedHomeowner.totalBieonDevices}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-purple-50">
                                                    <Zap className="w-6 h-6 text-purple-500 shrink-0" />
                                                    <div>
                                                        <p className="text-[11px] text-gray-500 font-medium mb-0.5">Smart Devices</p>
                                                        <p className="text-lg font-bold text-gray-900 leading-none">{selectedHomeowner.totalSmartDevices}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Perangkat */}
                                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50 flex flex-col">
                                            <h4 className="font-bold text-gray-900 mb-4">Status Perangkat</h4>
                                            <div className="space-y-3 flex-1 flex flex-col">
                                                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-blue-50">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-5 h-5 text-[#10b981]" />
                                                        <span className="text-sm font-semibold text-gray-700">Online</span>
                                                    </div>
                                                    <span className="text-xl font-bold text-[#10b981]">{selectedHomeowner.totalSmartDevices + selectedHomeowner.totalBieonDevices - 1}</span>
                                                </div>
                                                <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-blue-50">
                                                    <div className="flex items-center gap-2">
                                                        <X className="w-5 h-5 text-red-500 p-0.5 bg-red-100 rounded-full" />
                                                        <span className="text-sm font-semibold text-gray-700">Offline</span>
                                                    </div>
                                                    <span className="text-xl font-bold text-red-500">1</span>
                                                </div>
                                                <div className="mt-auto pt-2 flex items-center justify-between px-2">
                                                    <span className="text-sm font-semibold text-gray-500">Total</span>
                                                    <span className="text-lg font-bold text-gray-900">{selectedHomeowner.totalSmartDevices + selectedHomeowner.totalBieonDevices}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Konsumsi Energi */}
                                        <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50 flex flex-col">
                                            <h4 className="font-bold text-gray-900 mb-4">Konsumsi Energi</h4>
                                            <div className="space-y-3 flex-1">
                                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 relative overflow-hidden h-[90px] flex flex-col justify-center">
                                                    <Zap className="w-16 h-16 text-orange-50 absolute -right-2 -bottom-2" />
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                                                            <Zap className="w-4 h-4" />
                                                            <span className="text-xs font-semibold">Konsumsi Bulanan</span>
                                                        </div>
                                                        <div className="flex items-end gap-1">
                                                            <span className="text-2xl font-bold text-gray-900">{selectedHomeowner.monthlyConsumption}</span>
                                                            <span className="text-sm text-gray-500 font-medium mb-1">kWh</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 relative overflow-hidden h-[90px] flex flex-col justify-center">
                                                    <Box className="w-16 h-16 text-orange-50 absolute -right-2 -bottom-2 opacity-50" />
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                                                            <span className="text-xs font-semibold">Rp Estimasi Tagihan</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-2xl font-bold text-gray-900">Rp {selectedHomeowner.monthlyBill.toLocaleString('id-ID')}</span>
                                                            <span className="text-[10px] text-gray-500 font-medium">per bulan</span>
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
                                            <Cpu className="w-6 h-6 text-[#009b7c]" /> Daftar Perangkat (10)
                                        </h3>
                                        <button className="px-4 py-2 bg-[#009b7c] hover:bg-[#008268] text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-all">
                                            <TrendingUp className="w-4 h-4" /> Export Data
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { icon: Box, name: 'BIEON System', detail: 'BIEON Node • Living Room', status: 'Online', time: '1 min ago', bg: 'bg-[#009b7c]/10 text-[#009b7c]' },
                                            { icon: Activity, name: 'Hub Node 1', detail: 'Hub Node • Living Room', status: 'Online', time: '1 min ago', bg: 'bg-emerald-100 text-emerald-600' },
                                            { icon: Activity, name: 'Hub Node 2', detail: 'Hub Node • Bedroom 1', status: 'Online', time: '2 min ago', bg: 'bg-emerald-100 text-emerald-600' },
                                            { icon: Zap, name: 'Smart Plug', detail: 'SP-001', status: 'Online', time: '1 min ago', bg: 'bg-blue-100 text-blue-500' },
                                            { icon: Zap, name: 'Smart Plug', detail: 'SP-002', status: 'Online', time: '1 min ago', bg: 'bg-blue-100 text-blue-500' },
                                            { icon: Zap, name: 'Smart Switch', detail: 'SW-001', status: 'Online', time: '1 min ago', bg: 'bg-blue-100 text-blue-500' },
                                            { icon: Zap, name: 'Smart Bulb', detail: 'SB-001', status: 'Online', time: '2 min ago', bg: 'bg-blue-100 text-blue-500' },
                                            { icon: Monitor, name: 'Smart Camera', detail: 'SC-001', status: 'Offline', time: '15 min ago', bg: 'bg-red-100 text-red-500' },
                                            { icon: ShieldCheck, name: 'Smart Door Lock', detail: 'SDL-001', status: 'Online', time: '5 min ago', bg: 'bg-blue-100 text-blue-500' },
                                            { icon: Zap, name: 'Smart Thermostat', detail: 'ST-001', status: 'Online', time: '3 min ago', bg: 'bg-blue-100 text-blue-500' },
                                        ].map((device, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.bg}`}>
                                                        <device.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{device.name}</p>
                                                        <p className="text-xs text-gray-500">{device.detail}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1.5 justify-end mb-0.5">
                                                        <span className={`w-2 h-2 rounded-full ${device.status === 'Online' ? 'bg-[#10b981]' : 'bg-red-500'}`}></span>
                                                        <span className={`text-[10px] font-bold uppercase ${device.status === 'Online' ? 'text-[#10b981]' : 'text-red-500'}`}>{device.status}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400">{device.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Modal */}
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
                        <div className="p-8 space-y-6 overflow-y-auto">
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
                                className={`flex-1 py-3 text-white rounded-2xl text-sm font-bold transition-all shadow-lg ${
                                    deleteReason.trim() 
                                    ? 'bg-[#dc2626] hover:bg-[#b91c1c] shadow-red-100 cursor-pointer' 
                                    : 'bg-[#fca5a5] cursor-not-allowed shadow-none opacity-80'
                                }`}
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