import { useState } from 'react';
import { SuperAdminLayout } from './SuperAdminLayout';
import {
    Users,
    UserCheck,
    Home,
    TrendingUp,
    Search,
    Filter,
    Plus,
    Eye,
    Edit3,
    Trash2,
    MapPin,
    Phone,
    Mail,
    X,
    Save,
    ChevronDown,
    AlertCircle,
    Map as MapIcon,
    UserCog,
    CheckCircle,
    Zap,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';

// Mock data teknisi
const mockTechnicians = [
    {
        id: 'TECH001',
        name: 'Budi Santoso',
        email: 'budi.santoso@bieon.id',
        phone: '+62 812-3456-7890',
        address: 'Jl. Sudirman No. 45, Jakarta Pusat',
        workArea: 'Jakarta & Bandung',
        status: 'aktif',
        clientsCount: 3,
        color: '#3b82f6', // blue
        clients: [
            { id: 'C001', name: 'Ahmad Fauzi', location: 'Bandung, Jawa Barat', lat: -6.9175, lng: 107.6191, bieonDevices: 4, smartDevices: 28, status: 'online' },
            { id: 'C003', name: 'Budi Santoso', location: 'Surabaya, Jawa Timur', lat: -7.2575, lng: 112.7521, bieonDevices: 5, smartDevices: 34, status: 'warning' },
            { id: 'C005', name: 'Rizki Pratama', location: 'Semarang, Jawa Tengah', lat: -6.9932, lng: 110.4203, bieonDevices: 3, smartDevices: 22, status: 'offline' },
        ]
    },
    {
        id: 'TECH002',
        name: 'Andi Wijaya',
        email: 'andi.wijaya@bieon.id',
        phone: '+62 813-2456-8901',
        address: 'Jl. Gatot Subroto No. 88, Jakarta Selatan',
        workArea: 'Jakarta & Yogyakarta',
        status: 'aktif',
        clientsCount: 3,
        color: '#10b981', // green
        clients: [
            { id: 'C002', name: 'Siti Nurhaliza', location: 'Jakarta Selatan', lat: -6.2088, lng: 106.8456, bieonDevices: 3, smartDevices: 19, status: 'online' },
            { id: 'C004', name: 'Dewi Lestari', location: 'Yogyakarta', lat: -7.7956, lng: 110.3695, bieonDevices: 2, smartDevices: 15, status: 'online' },
            { id: 'C006', name: 'Linda Wijaya', location: 'Jakarta Pusat', lat: -6.1751, lng: 106.8650, bieonDevices: 6, smartDevices: 42, status: 'online' },
        ]
    },
    {
        id: 'TECH003',
        name: 'Siti Rahmawati',
        email: 'siti.rahmawati@bieon.id',
        phone: '+62 815-3456-9012',
        address: 'Jl. Ahmad Yani No. 123, Surabaya',
        workArea: 'Surabaya & Malang',
        status: 'nonaktif',
        clientsCount: 0,
        color: '#f59e0b', // yellow
        clients: []
    },
];

export function ManajemenTeknisiPage({ onNavigate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [mapFilterTech, setMapFilterTech] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        workArea: '',
        status: 'aktif'
    });

    const handleNavigate = (id) => {
        if (onNavigate) onNavigate(id);
    };

    // Filter technicians
    const filteredTechnicians = mockTechnicians.filter(tech => {
        const matchesSearch =
            tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tech.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tech.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tech.workArea.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' || tech.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Calculate stats
    const totalTechnicians = mockTechnicians.length;
    const activeTechnicians = mockTechnicians.filter(t => t.status === 'aktif').length;
    const totalClients = mockTechnicians.reduce((sum, t) => sum + t.clientsCount, 0);
    const avgClientsPerTech = totalClients > 0 ? (totalClients / activeTechnicians).toFixed(1) : 0;

    const handleAddTechnician = () => {
        alert('Teknisi berhasil ditambahkan!');
        setIsAddModalOpen(false);
    };

    const handleDeleteTechnician = (tech) => {
        if (confirm(`Apakah Anda yakin ingin menghapus teknisi ${tech.name}?`)) {
            alert('Teknisi berhasil dihapus!');
        }
    };

    const handleViewDetail = (tech) => {
        setSelectedTechnician(tech);
        setIsDetailModalOpen(true);
    };

    return (
        <SuperAdminLayout activeMenu="Teknisi" onNavigate={handleNavigate} title="Manajemen Teknisi">
            <div className="space-y-8">
                {/* Stats Cards - Restored to Colorful Designs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#3b82f6] rounded-[2.5rem] p-8 shadow-xl shadow-blue-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                             <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Users className="w-8 h-8" />
                             </div>
                             <div className="text-right">
                                <span className="text-5xl font-black">{totalTechnicians}</span>
                                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-1">Total Teknisi</p>
                             </div>
                        </div>
                    </div>

                    <div className="bg-[#10b981] rounded-[2.5rem] p-8 shadow-xl shadow-emerald-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                             <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <CheckCircle className="w-8 h-8" />
                             </div>
                             <div className="text-right">
                                <span className="text-5xl font-black">{activeTechnicians}</span>
                                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-1">Teknisi Aktif</p>
                             </div>
                        </div>
                    </div>

                    <div className="bg-[#f59e0b] rounded-[2.5rem] p-8 shadow-xl shadow-amber-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                             <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Home className="w-8 h-8" />
                             </div>
                             <div className="text-right">
                                <span className="text-5xl font-black">{totalClients}</span>
                                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-1">Klien Tercover</p>
                             </div>
                        </div>
                    </div>

                    <div className="bg-[#a855f7] rounded-[2.5rem] p-8 shadow-xl shadow-purple-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                             <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-8 h-8" />
                             </div>
                             <div className="text-right">
                                <span className="text-5xl font-black">{avgClientsPerTech}</span>
                                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-1">Avg. Beban</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Daftar Akun Teknisi</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic italic">Kelola registrasi, wilayah kerja, dan penugasan teknisi lapangan</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative group flex-1 lg:w-72">
                                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#009b7c] transition-all" />
                                    <input 
                                        type="text" 
                                        placeholder="Cari nama, wilayah, atau ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#009b7c] transition-all shadow-sm"
                                    />
                                </div>
                                
                                <button 
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-6 py-3 bg-[#009b7c] text-white rounded-2xl text-[10px] font-black hover:bg-[#008268] transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 group uppercase tracking-widest"
                                >
                                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                                    TAMBAH TEKNISI
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead>
                                <tr className="bg-[#009b7c] text-white text-[10px] font-black uppercase tracking-widest text-center">
                                    <th className="px-8 py-5 text-left">Teknisi</th>
                                    <th className="px-8 py-5 text-left">Wilayah Kerja</th>
                                    <th className="px-8 py-5">Kontak</th>
                                    <th className="px-8 py-5">Load</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTechnicians.map((tech) => (
                                    <tr key={tech.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-teal-600 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-teal-100">
                                                    {tech.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900">{tech.name}</p>
                                                    <p className="text-[10px] font-black text-[#009b7c] uppercase tracking-tighter italic">ID: {tech.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-emerald-500" />
                                                <p className="text-sm font-bold text-gray-700">{tech.workArea}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-700">{tech.email}</p>
                                                <p className="text-xs font-medium text-gray-400">{tech.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black border border-purple-100">
                                                {tech.clientsCount} LOKASI
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border inline-flex items-center gap-2 ${
                                                tech.status === 'aktif' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                                <span className={`w-2 h-2 rounded-full ${tech.status === 'aktif' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                                                {tech.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleViewDetail(tech)}
                                                    className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-[#3b82f6] hover:border-[#3b82f6] rounded-2xl transition-all shadow-sm group/btn"
                                                >
                                                    <Eye className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                                                </button>
                                                <button 
                                                    className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-amber-500 hover:border-amber-500 rounded-2xl transition-all shadow-sm group/btn"
                                                >
                                                    <Edit3 className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteTechnician(tech)}
                                                    className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-500 rounded-2xl transition-all shadow-sm group/btn"
                                                >
                                                    <Trash2 className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
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
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
                        <div className="p-8 bg-gradient-to-r from-[#009b7c] to-teal-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Tambah Teknisi</h2>
                                    <p className="text-teal-50 text-[10px] font-black tracking-widest uppercase opacity-70">Registrasi Akun Tenaga Ahli BIEON</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-10 overflow-y-auto space-y-8">
                             <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                                    <input type="text" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#009b7c] transition-all" placeholder="Contoh: Budi Santoso" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Resmi</label>
                                    <input type="email" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#009b7c] transition-all" placeholder="budi@bieon.id" />
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Wilayah Kerja</label>
                                    <input type="text" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#009b7c] transition-all" placeholder="Jakarta & Bandung" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
                                    <input type="password" placeholder="********" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-[#009b7c] transition-all" />
                                </div>
                             </div>

                             <div className="flex items-center gap-4 p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem]">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
                                    <ShieldCheck className="w-8 h-8 text-[#009b7c]" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h4 className="text-sm font-black text-emerald-900 leading-none mb-1 uppercase">Otomatisasi Kredensial</h4>
                                    <p className="text-[10px] font-black text-emerald-700 opacity-60 uppercase tracking-tighter">Sistem akan memverifikasi area kerja dan memberikan akses teknisi ke data IoT klien terkait secara real-time.</p>
                                </div>
                             </div>
                        </div>

                        <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex items-center justify-end gap-4">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-8 py-4 text-sm font-black text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest">Batal</button>
                            <button onClick={handleAddTechnician} className="px-10 py-4 bg-[#009b7c] text-white rounded-2xl font-black text-sm hover:bg-[#008268] transition-all shadow-xl shadow-emerald-100 flex items-center gap-3 group">
                                REGISTRASI TEKNISI
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDetailModalOpen && selectedTechnician && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[500] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-3xl w-full border border-white/20 overflow-hidden">
                        <div className="p-10 bg-gradient-to-br from-[#009b7c] to-teal-700 text-white flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center backdrop-blur-md border border-white/10">
                                    <UserCog className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight uppercase">{selectedTechnician.name}</h2>
                                    <p className="text-teal-50 text-[10px] font-black tracking-widest uppercase opacity-80 mt-1 italic italic">Tenaga Ahli - ID: {selectedTechnician.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-3xl flex items-center justify-center transition-all border border-white/10">
                                <X className="w-7 h-7" />
                            </button>
                        </div>
                        <div className="p-12 space-y-8 text-left">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Info Kontak</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <Mail className="w-5 h-5 text-[#009b7c]" />
                                            <p className="text-sm font-bold text-gray-700">{selectedTechnician.email}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Phone className="w-5 h-5 text-[#009b7c]" />
                                            <p className="text-sm font-bold text-gray-700">{selectedTechnician.phone}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Detail Tugas</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <MapPin className="w-5 h-5 text-[#009b7c]" />
                                            <p className="text-sm font-bold text-gray-700">{selectedTechnician.workArea}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Users className="w-5 h-5 text-[#009b7c]" />
                                            <p className="text-sm font-bold text-gray-700">{selectedTechnician.clientsCount} Lokasi Binaan</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-[#009b7c]/5 p-8 rounded-[2.5rem] border border-[#009b7c]/10 relative">
                                <Activity className="w-20 h-20 text-[#009b7c]/5 absolute right-8 bottom-8" />
                                <h3 className="text-lg font-black text-[#009b7c] uppercase mb-4 tracking-tight">Status Operasional</h3>
                                <div className="flex items-center gap-3">
                                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                                        selectedTechnician.status === 'aktif' ? 'bg-[#10b981] text-white' : 'bg-red-500 text-white'
                                    }`}>
                                        {selectedTechnician.status}
                                    </span>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight italic italic">Verifikasi Terakhir: Sistem Sinkron</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}