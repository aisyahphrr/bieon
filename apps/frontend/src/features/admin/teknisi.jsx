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
    ShieldCheck,
    LogOut,
    Award,
    Briefcase,
    Clock,
    BookOpen,
    Calendar as CalendarIcon
} from 'lucide-react';

const SPECIFICATION_OPTIONS = [
    'IoT Systems',
    'Smart Home Integration',
    'Network Configuration',
    'Electrical Systems',
    'CCTV & Security',
    'Solar Energy',
    'System Architecture',
    'Repair & Maintenance'
];

const CITY_AREAS = {
    'Bandung': ['Bandung Kota', 'Bandung Timur', 'Bandung Barat', 'Bandung Selatan', 'Bandung Pusat', 'Cimahi', 'Kabupaten Bandung'],
    'Jakarta': ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Timur', 'Jakarta Barat'],
    'Surabaya': ['Surabaya Pusat', 'Surabaya Utara', 'Surabaya Timur', 'Surabaya Selatan', 'Surabaya Barat'],
    'Lainnya': ['Area Luar Kota', 'Nasional']
};

// Mock data teknisi
const mockTechnicians = [
    {
        id: 'TECH001',
        name: 'Budi Santoso',
        email: 'budi.santoso@bieon.id',
        phone: '+62 812-3456-7890',
        address: 'Jl. Sudirman No. 45, Jakarta Pusat',
        workArea: 'Bandung',
        status: 'aktif',
        clientsCount: 3,
        color: '#3b82f6', // blue
        clients: [
            { id: 'C001', name: 'Ahmad Fauzi', location: 'Bandung, Jawa Barat', lat: -6.9175, lng: 107.6191, bieonDevices: 4, smartDevices: 28, status: 'online' },
            { id: 'C003', name: 'Budi Santoso', location: 'Surabaya, Jawa Timur', lat: -7.2575, lng: 112.7521, bieonDevices: 5, smartDevices: 34, status: 'warning' },
            { id: 'C005', name: 'Rizki Pratama', location: 'Semarang, Jawa Tengah', lat: -6.9932, lng: 110.4203, bieonDevices: 3, smartDevices: 22, status: 'offline' },
        ],
        position: 'Senior Technician',
        experience: 8,
        specializations: ['Smart Automation', 'Industrial IoT', 'System Architecture'],
        coverageAreas: ['Bandung Pusat', 'Cimahi', 'Sumedang'],
        workSchedule: {
            'Senin': '08:00 - 17:00',
            'Selasa': '08:00 - 17:00',
            'Rabu': '08:00 - 17:00',
            'Kamis': '08:00 - 17:00',
            'Jumat': '08:00 - 17:00',
            'Sabtu': '09:00 - 14:00',
            'Minggu': 'Off'
        }
    },
    {
        id: 'TECH002',
        name: 'Andi Wijaya',
        email: 'andi.wijaya@bieon.id',
        phone: '+62 813-2456-8901',
        address: 'Jl. Gatot Subroto No. 88, Jakarta Selatan',
        workArea: 'Jakarta',
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
        workArea: 'Surabaya',
        status: 'nonaktif',
        clientsCount: 0,
        color: '#f59e0b', // yellow
        clients: []
    },
];

export function ManajemenTeknisiPage({ onNavigate }) {
    const [technicians, setTechnicians] = useState(mockTechnicians);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [mapFilterTech, setMapFilterTech] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        workArea: '',
        status: 'aktif',
        position: 'Senior Technician',
        experience: 5,
        workArea: 'Bandung',
        specializations: [],
        coverageAreas: [],
        workSchedule: {
            'Senin': '08:00 - 17:00',
            'Selasa': '08:00 - 17:00',
            'Rabu': '08:00 - 17:00',
            'Kamis': '08:00 - 17:00',
            'Jumat': '08:00 - 17:00',
            'Sabtu': '09:00 - 14:00',
            'Minggu': 'Off'
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCityChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            workArea: value,
            coverageAreas: [] // Reset sub-areas when city changes
        }));
    };

    const handleScheduleChange = (day, value) => {
        setFormData(prev => ({
            ...prev,
            workSchedule: {
                ...prev.workSchedule,
                [day]: value
            }
        }));
    };

    const toggleOption = (field, option) => {
        setFormData(prev => {
            const current = Array.isArray(prev[field]) ? prev[field] : [];
            const updated = current.includes(option)
                ? current.filter(item => item !== option)
                : [...current, option];
            return { ...prev, [field]: updated };
        });
    };

    const handleNavigate = (id) => {
        if (onNavigate) onNavigate(id);
    };

    // Filter technicians
    const filteredTechnicians = technicians.filter(tech => {
        const matchesSearch =
            tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tech.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tech.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tech.workArea && tech.workArea.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = filterStatus === 'all' || tech.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Calculate stats
    const totalTechnicians = technicians.length;
    const activeTechnicians = technicians.filter(t => t.status === 'aktif').length;
    const totalClients = technicians.reduce((sum, t) => sum + (t.clientsCount || 0), 0);
    const avgClientsPerTech = totalClients > 0 && activeTechnicians > 0 ? (totalClients / activeTechnicians).toFixed(1) : 0;

    const handleAddTechnician = () => {
        const newTech = {
            ...formData,
            id: `TECH${String(technicians.length + 1).padStart(3, '0')}`,
            clientsCount: 0,
            color: '#6366f1', // default indigo
            clients: []
        };
        
        setTechnicians(prev => [...prev, newTech]);
        setIsAddModalOpen(false);
        // Reset form data
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            password: '',
            status: 'aktif',
            position: 'Senior Technician',
            experience: 5,
            workArea: 'Bandung',
            specializations: [],
            coverageAreas: [],
            workSchedule: {
                'Senin': '08:00 - 17:00',
                'Selasa': '08:00 - 17:00',
                'Rabu': '08:00 - 17:00',
                'Kamis': '08:00 - 17:00',
                'Jumat': '08:00 - 17:00',
                'Sabtu': '09:00 - 14:00',
                'Minggu': 'Off'
            }
        });
    };

    const handleDeleteTechnician = (tech) => {
        setSelectedTechnician(tech);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteTechnician = () => {
        setTechnicians(prev => prev.filter(t => t.id !== selectedTechnician.id));
        setIsDeleteModalOpen(false);
        setDeleteReason('');
        setSelectedTechnician(null);
    };

    const handleViewDetail = (tech) => {
        setSelectedTechnician(tech);
        setIsDetailModalOpen(true);
    };

    const handleEditTechnician = (tech) => {
        setSelectedTechnician(tech);
        
        // Find a valid city key from CITY_AREAS that might be part of the tech.workArea string
        const validCities = Object.keys(CITY_AREAS);
        let mappedCity = validCities.find(city => tech.workArea.includes(city)) || 'Lainnya';
        
        setFormData({
            ...tech,
            workArea: mappedCity,
            specializations: Array.isArray(tech.specializations) ? tech.specializations : (tech.specializations ? tech.specializations.split(', ') : []),
            coverageAreas: Array.isArray(tech.coverageAreas) ? tech.coverageAreas : (tech.coverageAreas ? tech.coverageAreas.split(', ') : []),
            password: '' // Don't pre-fill password for editing
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = () => {
        setTechnicians(prev => prev.map(t => 
            t.id === selectedTechnician.id ? { ...t, ...formData } : t
        ));
        setIsEditModalOpen(false);
        setSelectedTechnician(null);
    };

    return (
        <SuperAdminLayout activeMenu="Teknisi" onNavigate={handleNavigate} title="Manajemen Teknisi">
            <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#2563eb] rounded-3xl p-6 shadow-xl shadow-blue-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{totalTechnicians}</span>
                                <p className="text-[11px] font-medium text-white mt-1">Total Teknisi</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#009b7c] rounded-3xl p-6 shadow-xl shadow-emerald-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{activeTechnicians}</span>
                                <p className="text-[11px] font-medium text-white mt-1">Teknisi Aktif</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#a855f7] rounded-3xl p-6 shadow-xl shadow-purple-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Home className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{totalClients}</span>
                                <p className="text-[11px] font-medium text-white mt-1">Total Pelanggan Ditangani</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#ff6600] rounded-3xl p-6 shadow-xl shadow-orange-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{avgClientsPerTech}</span>
                                <p className="text-[11px] font-medium text-white mt-1">Rata-rata Pelanggan/Teknisi</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Daftar Teknisi</h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative group">
                                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-all" />
                                    <input
                                        type="text"
                                        placeholder="Cari teknisi..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-56 pl-10 pr-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div className="relative">
                                    <Filter className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer transition-all hover:bg-gray-50 min-w-[150px]"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                <button
                                    onClick={() => setIsMapModalOpen(true)}
                                    className="px-5 py-2.5 mx-1 bg-[#1d4ed8] text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-all flex items-center gap-2 group"
                                >
                                    <MapIcon className="w-4 h-4" />
                                    Lihat Peta
                                </button>

                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-5 py-2.5 bg-[#009b7c] text-white rounded-xl text-sm font-semibold hover:bg-[#008268] transition-all flex items-center gap-2 group"
                                >
                                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                                    Tambah Teknisi
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead>
                                <tr className="bg-[#009b7c] text-white text-sm font-semibold text-left">
                                    <th className="px-8 py-4 rounded-tl-xl">ID Teknisi</th>
                                    <th className="px-8 py-4">Nama Teknisi</th>
                                    <th className="px-8 py-4">Lokasi Wilayah</th>
                                    <th className="px-8 py-4">Nomor Kontak</th>
                                    <th className="px-8 py-4 text-center">Jumlah Pelanggan</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4 text-center rounded-tr-xl">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTechnicians.map((tech) => (
                                    <tr key={tech.id} className="hover:bg-gray-50/50 transition-all group bg-white">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-800 text-sm">{tech.id}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{tech.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{tech.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm text-gray-600">{tech.workArea}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm text-gray-600">{tech.phone}</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-4 py-1.5 bg-purple-100 text-purple-600 rounded-full text-xs font-bold whitespace-nowrap">
                                                {tech.clientsCount} Pelanggan
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-2 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${tech.status === 'aktif' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${tech.status === 'aktif' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                                                {tech.status.charAt(0).toUpperCase() + tech.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(tech)}
                                                    className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditTechnician(tech)}
                                                    className="p-2 bg-emerald-50 text-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 rounded-lg transition-all"
                                                    title="Edit Data"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTechnician(tech)}
                                                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setMapFilterTech(tech.id);
                                                        setIsMapModalOpen(true);
                                                    }}
                                                    className="p-2 bg-cyan-50 text-cyan-500 hover:bg-cyan-100 hover:text-cyan-600 rounded-lg transition-all"
                                                >
                                                    <MapPin className="w-4 h-4" />
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
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-gray-50 rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-white/20 max-h-[90vh]">
                        <div className="px-6 py-5 bg-[#009b7c] text-white flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Plus className="w-6 h-6" /> Tambah Teknisi Baru
                            </h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 max-h-full">
                            {/* Section: Akun & Kontak */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Akun & Kontak</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Nama Teknisi <span className="text-red-500">*</span></label>
                                        <input 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all" 
                                            placeholder="Budi Santoso" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Email <span className="text-red-500">*</span></label>
                                        <input 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            type="email" 
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all" 
                                            placeholder="budi.santoso@bieon.id" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Nomor Telepon <span className="text-red-500">*</span></label>
                                        <input 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all" 
                                            placeholder="+62 812-3456-7890" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Password <span className="text-red-500">*</span></label>
                                        <input 
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            type="password" 
                                            placeholder="********" 
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all" 
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Alamat <span className="text-red-500">*</span></label>
                                        <textarea 
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="2" 
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all" 
                                            placeholder="Jl. Sudirman No. 45, Jakarta Pusat"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Informasi Profesional */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Informasi Profesional</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Posisi <span className="text-red-500">*</span></label>
                                        <input 
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all" 
                                            placeholder="Senior Technician" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Pengalaman (Tahun) <span className="text-red-500">*</span></label>
                                        <input 
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            type="number" 
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all" 
                                            placeholder="5" 
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Spesialisasi (Pilih yang sesuai) <span className="text-red-500">*</span></label>
                                        <div className="flex flex-wrap gap-2">
                                            {SPECIFICATION_OPTIONS.map(spec => {
                                                const isSelected = formData.specializations.includes(spec);
                                                return (
                                                    <button
                                                        key={spec}
                                                        type="button"
                                                        onClick={() => toggleOption('specializations', spec)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold ring-1 transition-all flex items-center gap-1.5 ${
                                                            isSelected 
                                                            ? 'bg-emerald-500 text-white ring-emerald-500 shadow-md shadow-emerald-100' 
                                                            : 'bg-white text-gray-500 ring-gray-200 hover:ring-emerald-300 hover:bg-emerald-50'
                                                        }`}
                                                    >
                                                        {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                                                        {spec}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Wilayah Kerja Standar <span className="text-red-500">*</span></label>
                                        <select 
                                            name="workArea"
                                            value={formData.workArea}
                                            onChange={handleCityChange}
                                            className="appearance-none w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#009b7c] transition-all cursor-pointer"
                                        >
                                            <option value="">Pilih Kota</option>
                                            {Object.keys(CITY_AREAS).map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-9 pointer-events-none" />
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Status Teknisi <span className="text-red-500">*</span></label>
                                        <select 
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="appearance-none w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#009b7c] transition-all cursor-pointer"
                                        >
                                            <option value="aktif">Aktif</option>
                                            <option value="nonaktif">Nonaktif</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-9 pointer-events-none" />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">
                                            Area Coverage Detail (Pilih Wilayah di {formData.workArea || 'Kota Selected'}) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.workArea ? (
                                                (CITY_AREAS[formData.workArea] || []).map(area => {
                                                    const isSelected = formData.coverageAreas.includes(area);
                                                    return (
                                                        <button
                                                            key={area}
                                                            type="button"
                                                            onClick={() => toggleOption('coverageAreas', area)}
                                                            className={`px-4 py-2 rounded-xl text-xs font-bold ring-1 transition-all flex items-center gap-1.5 ${
                                                                isSelected 
                                                                ? 'bg-blue-500 text-white ring-blue-500 shadow-md shadow-blue-100' 
                                                                : 'bg-white text-gray-500 ring-gray-200 hover:ring-blue-300 hover:bg-blue-50'
                                                            }`}
                                                        >
                                                            {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                                                            {area}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="w-full py-4 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-xs font-medium">
                                                    Silakan pilih Wilayah Kerja Standar terlebih dahulu
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Jadwal Kerja */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Jadwal Kerja</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                    {Object.entries(formData.workSchedule).map(([day, hours]) => (
                                        <div key={day} className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">{day}</label>
                                            <input 
                                                type="text" 
                                                value={hours}
                                                onChange={(e) => handleScheduleChange(day, e.target.value)}
                                                className="w-full px-2 py-1.5 bg-white border border-gray-100 rounded-lg text-[11px] focus:outline-none focus:border-purple-500 transition-all font-medium" 
                                                placeholder="08:00 - 17:00"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 shrink-0">
                                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">Batal</button>
                                <button onClick={handleAddTechnician} className="flex-1 py-3 bg-[#009b7c] text-white rounded-xl text-sm font-bold hover:bg-[#008268] transition-all shadow-md flex items-center justify-center gap-2 group">
                                    <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    Simpan Teknisi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isDetailModalOpen && selectedTechnician && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col overflow-hidden max-h-[95vh]">
                        
                        {/* Header */}
                        <div className="p-6 bg-[#009b7c] text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <UserCog className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedTechnician.name}</h2>
                                    <p className="text-xs font-medium text-teal-100 mt-0.5">ID: {selectedTechnician.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Body Container */}
                        <div className="p-8 overflow-y-auto space-y-8 bg-white">
                            
                            {/* Cards Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Informasi Teknisi */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Kontak & Alamat</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedTechnician.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Nomor Kontak</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedTechnician.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Alamat</p>
                                                <p className="text-sm font-semibold text-gray-800 leading-relaxed">{selectedTechnician.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Profesional */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Keahlian & Karir</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Award className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Posisi & Pengalaman</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedTechnician.position || 'Technician'} • {selectedTechnician.experience || 0} Tahun</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Zap className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Spesialisasi</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(selectedTechnician.specializations || []).map((s, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapIcon className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Area Coverage</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(selectedTechnician.coverageAreas || []).map((a, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{a}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Jadwal Kerja */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Jadwal Mingguan</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {Object.entries(selectedTechnician.workSchedule || {}).map(([day, hours]) => (
                                            <div key={day} className="flex flex-col">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">{day}</span>
                                                <span className={`text-[11px] font-bold ${hours === 'Off' ? 'text-red-400' : 'text-gray-700'}`}>{hours}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Table Pelanggan section */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">Daftar Pelanggan yang Ditangani</h3>
                                    <button 
                                        onClick={() => setIsAddClientModalOpen(true)}
                                        className="px-4 py-2 bg-[#009b7c] text-white rounded-lg text-sm font-semibold hover:bg-[#008268] transition-all flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tambah Pelanggan
                                    </button>
                                </div>
                                <div className="overflow-hidden rounded-xl border border-gray-200">
                                    <table className="w-full text-left table-auto bg-white">
                                        <thead>
                                            <tr className="bg-[#009b7c] text-white text-sm font-semibold">
                                                <th className="px-6 py-4">Nama Pelanggan</th>
                                                <th className="px-6 py-4">Lokasi</th>
                                                <th className="px-6 py-4">Jumlah BIEON</th>
                                                <th className="px-6 py-4">Jumlah Device</th>
                                                <th className="px-6 py-4">Status Sistem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedTechnician.clients && selectedTechnician.clients.length > 0 ? (
                                                selectedTechnician.clients.map(client => (
                                                    <tr key={client.id} className="hover:bg-gray-50 transition-all">
                                                        <td className="px-6 py-4">
                                                            <span className="font-bold text-gray-800 text-sm">{client.name}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-600">{client.location}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-800 font-medium">{client.bieonDevices}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-800 font-medium">{client.smartDevices}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap ${
                                                                client.status === 'online' ? 'bg-green-50 text-green-600' :
                                                                client.status === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                                                            }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                                    client.status === 'online' ? 'bg-green-600' :
                                                                    client.status === 'warning' ? 'bg-yellow-500' : 'bg-red-600'
                                                                }`}></span>
                                                                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm italic">
                                                        Tidak ada pelanggan yang ditangani saat ini.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Map Modal */}
            {isMapModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full flex flex-col overflow-hidden border border-white/20 h-[85vh]">
                        {/* Header */}
                        <div className="p-6 bg-[#2563eb] text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <MapIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Peta Lokasi Pelanggan per Teknisi</h2>
                                    <p className="text-xs font-medium text-blue-100 mt-1">Visualisasi distribusi pelanggan berdasarkan wilayah teknis</p>
                                </div>
                            </div>
                            <button onClick={() => setIsMapModalOpen(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Body / Map Container */}
                        <div className="p-6 flex flex-col flex-1 overflow-hidden bg-gray-50/50">
                            {/* Toolbar Map */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-gray-700">Filter Teknisi:</span>
                                    <select 
                                        className="py-1.5 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none"
                                        value={mapFilterTech}
                                        onChange={(e) => setMapFilterTech(e.target.value)}
                                    >
                                        <option value="all">Semua Teknisi</option>
                                        {mockTechnicians.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-sm font-bold text-gray-700">Legend:</span>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                                            <span className="text-sm text-gray-600">Budi Santoso</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                                            <span className="text-sm text-gray-600">Andi Wijaya</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                            <span className="text-sm text-gray-600">Siti Rahmawati</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Box Placeholder */}
                            <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100 flex items-center justify-center">
                                {/* Simulate Map Iframe */}
                                <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126907.01427506978!2d106.749001!3d-6.229728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x100c5c76da35150!2sJakarta%2C%20Daerah%2C%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sid!2sid!4v1703080000000!5m2!1sid!2sid" 
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    allowFullScreen="" 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                                
                                {/* Overlay mock markers */}
                                <div className="absolute top-[30%] left-[40%] flex flex-col items-center animate-bounce">
                                    <MapPin className="w-8 h-8 text-red-600 fill-white" />
                                </div>
                                <div className="absolute top-[45%] left-[55%] flex flex-col items-center">
                                    <MapPin className="w-8 h-8 text-emerald-600 fill-white" />
                                </div>
                                <div className="absolute top-[20%] left-[65%] flex flex-col items-center">
                                    <MapPin className="w-8 h-8 text-red-600 fill-white" />
                                </div>
                                <div className="absolute top-[60%] left-[30%] flex flex-col items-center">
                                    <MapPin className="w-8 h-8 text-emerald-600 fill-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Client To Technician Modal */}
            {isAddClientModalOpen && selectedTechnician && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[700] flex items-center justify-center p-6 animate-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/20 flex flex-col max-h-[80vh]">
                        <div className="p-6 bg-[#009b7c] text-white flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-bold">Pilih Pelanggan</h2>
                                <p className="text-xs font-medium text-teal-50 opacity-90 mt-1">Tambahkan pelanggan ke delegasi tugas teknisi</p>
                            </div>
                            <button onClick={() => setIsAddClientModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            <p className="text-sm font-bold text-gray-700">Pilih dari pelanggan yang tersedia (Homeowner):</p>
                            
                            <div className="space-y-3">
                                {[
                                    { id: 'C007', name: 'Budi Handoko', loc: 'Semarang, Jawa Tengah', status: 'Baru' },
                                    { id: 'C008', name: 'Zain Maulana', loc: 'Surabaya, Jawa Timur', status: 'Unassigned' },
                                    { id: 'C009', name: 'Rani Permata', loc: 'Jakarta Selatan', status: 'Perlu Teknisi' },
                                    { id: 'C010', name: 'Kelvin Yustanto', loc: 'Bandung, Jawa Barat', status: 'Unassigned' }
                                ].map((pelanggan, idx) => (
                                    <label key={idx} className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                        <input type="checkbox" className="w-5 h-5 mt-0.5 text-[#009b7c] border-gray-300 rounded focus:ring-[#009b7c]" />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-sm">{pelanggan.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">ID: {pelanggan.id} • {pelanggan.loc}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-md text-[10px] font-bold uppercase">{pelanggan.status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
                            <button 
                                onClick={() => setIsAddClientModalOpen(false)}
                                className="px-6 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all bg-white"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={() => {
                                    alert('Berhasil menyimpan tambahan pelanggan ke ' + selectedTechnician.name);
                                    setIsAddClientModalOpen(false);
                                }}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-[#009b7c] rounded-xl hover:bg-[#008268] transition-all shadow-md flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Simpan Penugasan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Reuse Add Modal UI) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-gray-50 rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-white/20 max-h-[90vh]">
                        <div className="px-6 py-5 bg-[#009b7c] text-white flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Edit3 className="w-6 h-6" /> Edit Data Teknisi
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 max-h-full">
                            {/* Section: Akun & Kontak */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Akun & Kontak</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Nama Teknisi</label>
                                        <input 
                                            name="name"
                                            value={formData.name}
                                            disabled={true}
                                            type="text" 
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none" 
                                            placeholder="Budi Santoso" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                                        <input 
                                            name="email"
                                            value={formData.email}
                                            disabled={true}
                                            type="email" 
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none" 
                                            placeholder="budi.santoso@bieon.id" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Nomor Telepon</label>
                                        <input 
                                            name="phone"
                                            value={formData.phone}
                                            disabled={true}
                                            type="text" 
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none" 
                                            placeholder="+62 812-3456-7890" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
                                        <input 
                                            name="password"
                                            value="••••••••"
                                            disabled={true}
                                            type="password" 
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed outline-none" 
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Alamat</label>
                                        <textarea 
                                            name="address"
                                            value={formData.address}
                                            disabled={true}
                                            rows="2" 
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none" 
                                            placeholder="Jl. Sudirman No. 45, Jakarta Pusat"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Informasi Profesional */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Informasi Profesional</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Posisi <span className="text-red-500">*</span></label>
                                        <input 
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            type="text" 
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all" 
                                            placeholder="Senior Technician" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Pengalaman (Tahun) <span className="text-red-500">*</span></label>
                                        <input 
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            type="number" 
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all" 
                                            placeholder="5" 
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Spesialisasi (Pilih yang sesuai) <span className="text-red-500">*</span></label>
                                        <div className="flex flex-wrap gap-2">
                                            {SPECIFICATION_OPTIONS.map(spec => {
                                                const isSelected = formData.specializations.includes(spec);
                                                return (
                                                    <button
                                                        key={spec}
                                                        type="button"
                                                        onClick={() => toggleOption('specializations', spec)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold ring-1 transition-all flex items-center gap-1.5 ${
                                                            isSelected 
                                                            ? 'bg-emerald-500 text-white ring-emerald-500 shadow-md shadow-emerald-100' 
                                                            : 'bg-white text-gray-500 ring-gray-200 hover:ring-emerald-300 hover:bg-emerald-50'
                                                        }`}
                                                    >
                                                        {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                                                        {spec}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Wilayah Kerja Standar <span className="text-red-500">*</span></label>
                                        <select 
                                            name="workArea"
                                            value={formData.workArea}
                                            onChange={handleCityChange}
                                            className="appearance-none w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#009b7c] transition-all cursor-pointer"
                                        >
                                            <option value="">Pilih Kota</option>
                                            {Object.keys(CITY_AREAS).map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-9 pointer-events-none" />
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Status Teknisi <span className="text-red-500">*</span></label>
                                        <select 
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="appearance-none w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#009b7c] transition-all cursor-pointer"
                                        >
                                            <option value="aktif">Aktif</option>
                                            <option value="nonaktif">Nonaktif</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-9 pointer-events-none" />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">
                                            Area Coverage Detail (Pilih Wilayah di {formData.workArea || 'Kota Selected'}) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.workArea ? (
                                                (CITY_AREAS[formData.workArea] || []).map(area => {
                                                    const isSelected = formData.coverageAreas.includes(area);
                                                    return (
                                                        <button
                                                            key={area}
                                                            type="button"
                                                            onClick={() => toggleOption('coverageAreas', area)}
                                                            className={`px-4 py-2 rounded-xl text-xs font-bold ring-1 transition-all flex items-center gap-1.5 ${
                                                                isSelected 
                                                                ? 'bg-blue-500 text-white ring-blue-500 shadow-md shadow-blue-100' 
                                                                : 'bg-white text-gray-500 ring-gray-200 hover:ring-blue-300 hover:bg-blue-50'
                                                            }`}
                                                        >
                                                            {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                                                            {area}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="w-full py-4 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-xs font-medium">
                                                    Silakan pilih Wilayah Kerja Standar terlebih dahulu
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Jadwal Kerja */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Jadwal Kerja</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                    {Object.entries(formData.workSchedule).map(([day, hours]) => (
                                        <div key={day} className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">{day}</label>
                                            <input 
                                                type="text" 
                                                value={hours}
                                                onChange={(e) => handleScheduleChange(day, e.target.value)}
                                                className="w-full px-2 py-1.5 bg-white border border-gray-100 rounded-lg text-[11px] focus:outline-none focus:border-purple-500 transition-all font-medium" 
                                                placeholder="08:00 - 17:00"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 shrink-0">
                                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">Batal</button>
                                <button onClick={handleSaveEdit} className="flex-1 py-3 bg-[#009b7c] text-white rounded-xl text-sm font-bold hover:bg-[#008268] transition-all shadow-md flex items-center justify-center gap-2 group">
                                    <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    Simpan Perubahan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Modal */}
            {isDeleteModalOpen && selectedTechnician && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[800] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
                        <div className="px-8 py-6 bg-[#dc2626] flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trash2 className="w-6 h-6" /> Hapus Teknisi
                            </h2>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto">
                            <div className="bg-red-50/50 p-5 rounded-2xl">
                                <p className="text-sm font-medium text-gray-600 mb-2">Anda akan menghapus teknisi/karyawan:</p>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedTechnician.name}</h3>
                                <p className="text-sm text-gray-500">ID: {selectedTechnician.id} • {selectedTechnician.email}</p>
                            </div>

                            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-red-600 mb-3">
                                    <AlertCircle className="w-5 h-5" /> Peringatan!
                                </h4>
                                <ul className="list-disc list-inside space-y-2 text-xs font-medium text-red-700/80 ml-1">
                                    <li>Setelah disetujui Project Owner, proses penghapusan bersifat final dan tidak dapat dibatalkan</li>
                                    <li>Seluruh jadwal delegasi pelanggan teknisi ini akan dialokasikan menjadi "Unassigned"</li>
                                    <li>Riwayat pekerjaan teknisi tetap disimpan secara historis dengan label "(Dihapus)"</li>
                                    <li>Akses teknisi ke aplikasi mobile BIEON akan ditutup sepenuhnya</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900">Alasan Penghapusan <span className="text-red-500">*</span></label>
                                <textarea 
                                    rows="3" 
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder="Masukkan alasan mengapa akun teknisi ini perlu dihapus..." 
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-500 transition-all shadow-sm"
                                ></textarea>
                            </div>

                            <p className="text-[11px] font-medium text-gray-500">
                                * Form ini akan dikirimkan ke Project Owner untuk persetujuan dan akan disimpan dalam laporan mutasi.
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
                                onClick={confirmDeleteTechnician}
                                disabled={!deleteReason.trim()}
                                className={`flex-1 py-3 text-white rounded-2xl text-sm font-bold transition-all shadow-lg ${
                                    deleteReason.trim() 
                                    ? 'bg-[#dc2626] hover:bg-[#b91c1c] shadow-red-100 cursor-pointer' 
                                    : 'bg-[#fca5a5] cursor-not-allowed shadow-none opacity-80'
                                }`}
                            >
                                Ya, Hapus Teknisi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}