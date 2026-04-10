import { useState } from 'react';
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
    ChevronDown,
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
    const [deleteReason, setDeleteReason] = useState('');

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

    const handleEditHomeowner = () => {
        alert('Data homeowner berhasil diupdate!');
        setIsEditModalOpen(false);
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
                                
                                <button 
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-5 py-2.5 bg-[#009b7c] text-white rounded-xl text-sm font-semibold hover:bg-[#008268] transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 group"
                                >
                                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                                    Tambah Homeowner
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
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-2 w-fit ${
                                                ho.status === 'aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                ho.status === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                                <span className={`w-2 h-2 rounded-full ${
                                                    ho.status === 'aktif' ? 'bg-emerald-600' :
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
                                                    className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-amber-500 hover:border-amber-500 hover:bg-amber-50 rounded-xl transition-all shadow-sm group/btn"
                                                >
                                                    <Edit3 className="w-4 h-4 transition-transform" />
                                                </button>
                                                <button 
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
        </SuperAdminLayout>
    );
}