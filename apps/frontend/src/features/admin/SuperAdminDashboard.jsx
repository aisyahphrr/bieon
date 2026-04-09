import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Box,
  Monitor,
  Clock,
  Zap,
  Activity,
  Search,
  Filter,
  Download,
  Bell,
  ChevronDown,
  Menu,
  ShieldCheck,
  MessageSquare,
  History,
  MoreVertical,
  X,
  Save,
  ChevronRight,
  TrendingUp,
  User,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

// --- MOCK DATA ---
const instalasiData = [
  { name: 'Jan', value: 8 }, { name: 'Feb', value: 12 }, { name: 'Mar', value: 15 },
  { name: 'Apr', value: 10 }, { name: 'Mei', value: 18 }, { name: 'Jun', value: 14 },
  { name: 'Jul', value: 20 }, { name: 'Agu', value: 16 }, { name: 'Sep', value: 22 },
  { name: 'Okt', value: 19 }, { name: 'Nov', value: 25 }, { name: 'Des', value: 21 }
];

const hubNodeData = [
  { name: 'Jan', value: 10 }, { name: 'Feb', value: 14 }, { name: 'Mar', value: 12 },
  { name: 'Apr', value: 16 }, { name: 'Mei', value: 15 }, { name: 'Jun', value: 18 },
  { name: 'Jul', value: 17 }, { name: 'Agu', value: 20 }, { name: 'Sep', value: 19 },
  { name: 'Okt', value: 22 }, { name: 'Nov', value: 21 }, { name: 'Des', value: 24 }
];

const smartDeviceTrend = [
  { name: 'Jan', value: 40 }, { name: 'Feb', value: 55 }, { name: 'Mar', value: 70 },
  { name: 'Apr', value: 85 }, { name: 'Mei', value: 100 }, { name: 'Jun', value: 120 },
  { name: 'Jul', value: 140 }, { name: 'Agu', value: 165 }, { name: 'Sep', value: 190 },
  { name: 'Okt', value: 220 }, { name: 'Nov', value: 255 }, { name: 'Des', value: 300 }
];

const pelangganTrend = [
  { name: 'Jan', value: 8 }, { name: 'Feb', value: 12 }, { name: 'Mar', value: 10 },
  { name: 'Apr', value: 15 }, { name: 'Mei', value: 11 }, { name: 'Jun', value: 9 },
  { name: 'Jul', value: 13 }, { name: 'Agu', value: 12 }, { name: 'Sep', value: 14 },
  { name: 'Okt', value: 11 }, { name: 'Nov', value: 13 }, { name: 'Des', value: 12 }
];

const teknisiTrend = [
  { name: 'Jan', value: 4 }, { name: 'Feb', value: 4 }, { name: 'Mar', value: 5 },
  { name: 'Apr', value: 6 }, { name: 'Mei', value: 7 }, { name: 'Jun', value: 7 },
  { name: 'Jul', value: 8 }, { name: 'Agu', value: 8 }, { name: 'Sep', value: 9 },
  { name: 'Okt', value: 9 }, { name: 'Nov', value: 10 }, { name: 'Des', value: 10 }
];

const pengaduanTrend = [
  { name: 'Jan', value: 5 }, { name: 'Feb', value: 8 }, { name: 'Mar', value: 6 },
  { name: 'Apr', value: 10 }, { name: 'Mei', value: 7 }, { name: 'Jun', value: 5 },
  { name: 'Jul', value: 9 }, { name: 'Agu', value: 8 }, { name: 'Sep', value: 10 },
  { name: 'Okt', value: 7 }, { name: 'Nov', value: 9 }, { name: 'Des', value: 8 }
];

const customers = [
  { id: 'USR001', name: 'Ahmad Fauzi', username: '@ahmad.fauzi', email: 'ahmad.fauzi@email.com', status: 'Aktif', bieon: 4, devices: 28, technician: 'Budi Santoso' },
  { id: 'USR002', name: 'Siti Nurhaliza', username: '@siti.nurhaliza', email: 'siti.nurhaliza@email.com', status: 'Aktif', bieon: 3, devices: 19, technician: 'Andi Wijaya' },
  { id: 'USR003', name: 'Budi Santoso', username: '@budi.santoso', email: 'budi.santoso@email.com', status: 'Warning', bieon: 5, devices: 34, technician: 'Budi Santoso' },
  { id: 'USR004', name: 'Dewi Lestari', username: '@dewi.lestari', email: 'dewi.lestari@email.com', status: 'Aktif', bieon: 2, devices: 15, technician: 'Andi Wijaya' },
  { id: 'USR005', name: 'Rizki Pratama', username: '@rizki.pratama', email: 'rizki.pratama@email.com', status: 'Nonaktif', bieon: 3, devices: 22, technician: 'Budi Santoso' },
  { id: 'USR006', name: 'Linda Wijaya', username: '@linda.wijaya', email: 'linda.wijaya@email.com', status: 'Aktif', bieon: 6, devices: 42, technician: 'Andi Wijaya' },
];

export default function SuperAdminDashboard({ onNavigate }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showPlnModal, setShowPlnModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [plnTariff, setPlnTariff] = useState(1495);
  const [newTariff, setNewTariff] = useState(1495);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, id: 'admin' },
    { name: 'Homeowner', icon: Users, id: 'admin' },
    { name: 'Teknisi', icon: User, id: 'admin' },
    { name: 'Pengaduan', icon: MessageSquare, id: 'admin-complaint' },
    { name: 'PLN Listrik', icon: Zap, id: 'admin' },
    { name: 'Riwayat', icon: History, id: 'admin-history' },
  ];

  const handleUpdateTariff = () => {
    setPlnTariff(newTariff);
    setShowPlnModal(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-sans text-[#111827]">
      {/* Sidebar */}
      <aside 
        className={`${sidebarExpanded ? 'w-56' : 'w-16'} bg-[#009b7c] text-white transition-all duration-300 fixed left-0 top-0 h-screen z-50 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {sidebarExpanded && <img src="/logo_bieon.png" alt="BIEON" className="h-8 object-contain" />}
          <button 
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors mx-auto lg:mx-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 py-10 px-3 space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                if (item.name === 'Dashboard') setActiveTab('Dashboard');
                else if (onNavigate) onNavigate(item.id);
              }}
              className={`w-full flex items-center ${sidebarExpanded ? 'px-4' : 'justify-center px-0'} py-3 rounded-2xl transition-all group ${
                activeTab === item.name ? 'bg-white text-[#009b7c] shadow-lg' : 'hover:bg-white/10 text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.name ? 'text-[#009b7c]' : 'text-white'}`} />
              {sidebarExpanded && (
                <span className="ml-4 font-bold text-xs tracking-wide">{item.name}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`${sidebarExpanded ? 'ml-56' : 'ml-16'} flex-1 flex flex-col transition-all duration-300`}>
        {/* Top Header */}
        <header className="bg-[#009b7c] text-white px-10 py-5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <h1 className="text-2xl font-black tracking-tight">Super Admin Dashboard</h1>
          
          <div className="flex items-center gap-6">
            <button className="relative w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-red-500 border-2 border-[#009b7c] rounded-full flex items-center justify-center text-[10px] font-black">3</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-1.5 pr-6 rounded-2xl transition-all border border-white/5"
              >
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-bold shadow-sm overflow-hidden">
                   <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-sm font-black leading-none mb-1">Super Admin</div>
                  <div className="text-[10px] font-bold opacity-60 leading-none">admin@bieon.id</div>
                </div>
                <ChevronDown className={`w-4 h-4 opacity-50 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 z-50 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Ganti Role (Demo)</div>
                  <button onClick={() => onNavigate && onNavigate("dashboard")} className="w-full text-left px-5 py-4 text-sm font-bold text-gray-700 hover:bg-[#F2F8F5] transition-colors flex items-center justify-between group">
                    <span>Homeowner</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                  <button onClick={() => onNavigate && onNavigate("teknisi")} className="w-full text-left px-5 py-4 text-sm font-bold text-gray-700 hover:bg-[#F2F8F5] transition-colors flex items-center justify-between group">
                    <span>Teknisi</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                  <button className="w-full text-left px-5 py-4 text-sm text-[#009b7c] bg-[#F2F8F5] font-black border-l-4 border-[#009b7c]">Super Admin</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8 pb-16 space-y-8">
          {/* Stats Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#3b82f6] rounded-[2.5rem] p-8 shadow-xl shadow-blue-200/50 relative overflow-hidden group hover:scale-[1.02] transition-all text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black leading-none tracking-tight">123</span>
                  <p className="text-[10px] font-black text-white/70 mt-1 uppercase tracking-widest">Total Pelanggan</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full inline-flex items-center gap-3 text-[10px] font-black uppercase">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-white rounded-full"></span> 4 Aktif</span>
                  <span className="opacity-40">|</span>
                  <span className="flex items-center gap-1.5 opacity-60"><span className="w-2 h-2 bg-white/40 rounded-full"></span> 1 Nonaktif</span>
                </div>
              </div>
            </div>

            <div className="bg-[#10b981] rounded-[2.5rem] p-8 shadow-xl shadow-emerald-200/50 relative overflow-hidden group hover:scale-[1.02] transition-all text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Box className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black leading-none tracking-tight">312</span>
                  <p className="text-[10px] font-black text-white/70 mt-1 uppercase tracking-widest">BIEON Nodes</p>
                </div>
              </div>
              <div className="mt-6">
                 <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5" /> +12% dari bulan lalu
                </div>
              </div>
            </div>

            <div className="bg-[#a855f7] rounded-[2.5rem] p-8 shadow-xl shadow-purple-200/50 relative overflow-hidden group hover:scale-[1.02] transition-all text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black leading-none tracking-tight">459</span>
                  <p className="text-[10px] font-black text-white/70 mt-1 uppercase tracking-widest">Smart Devices</p>
                </div>
              </div>
              <div className="mt-6">
                 <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5" /> +18% dari bulan lalu
                </div>
              </div>
            </div>

            <div className="bg-[#f97316] rounded-[2.5rem] p-8 shadow-xl shadow-orange-200/50 relative overflow-hidden group hover:scale-[1.02] transition-all text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black leading-none tracking-tight">15</span>
                  <p className="text-[10px] font-black text-white/70 mt-1 uppercase tracking-widest">Total Pengaduan</p>
                </div>
              </div>
              <div className="mt-6">
                 <div className="bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white">
                  <AlertCircle className="w-3.5 h-3.5" /> 1 sistem butuh perhatian
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-[#10b981]/10 rounded-2xl flex items-center justify-center text-[#10b981] group-hover:bg-[#10b981] group-hover:text-white transition-all">
                <User className="w-8 h-8" />
              </div>
              <div>
                <span className="text-4xl font-black text-gray-900 leading-none">10</span>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1.5">Total Teknisi Aktif</p>
                <div className="text-[11px] text-[#10b981] font-black flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3.5 h-3.5" /> +12% dari bulan lalu
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-lg transition-all">
              <div className="flex items-center gap-5 mb-5">
                <div className="w-14 h-14 bg-[#f97316] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-3xl font-black text-gray-900 tracking-tighter">Rp {plnTariff}</span>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1.5">Tarif PLN/kWh</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPlnModal(true)}
                className="w-full py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-black rounded-2xl text-[11px] flex items-center justify-center gap-2.5 shadow-lg shadow-orange-100 transition-all uppercase tracking-widest"
              >
                <Edit2 className="w-4 h-4" /> Update Tarif PLN
              </button>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-[#009b7c]/10 rounded-2xl flex items-center justify-center text-[#009b7c] group-hover:bg-[#009b7c] group-hover:text-white transition-all">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <span className="text-4xl font-black text-gray-900 leading-none">98.5%</span>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1.5">System Uptime</p>
                <div className="text-[11px] text-[#009b7c] font-black flex items-center gap-1 mt-2">
                  <Activity className="w-3.5 h-3.5" /> Real-time monitoring
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Chart 1: Bar */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
               <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">Jumlah Instalasi BIEON</h3>
                  <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Per bulan dalam 1 tahun</p>
                </div>
                <div className="w-12 h-12 bg-[#009b7c] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                   <Box className="w-6 h-6" />
                </div>
              </div>
              <div className="h-72 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={instalasiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <Tooltip cursor={{fill: '#f8fafc', radius: 8}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}} />
                    <Bar dataKey="value" fill="#009b7c" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Bar */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">Jumlah Hub Node</h3>
                  <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Per bulan dalam 1 tahun</p>
                </div>
                <div className="w-12 h-12 bg-[#009b7c] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                   <Activity className="w-6 h-6" />
                </div>
              </div>
              <div className="h-72 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hubNodeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <Tooltip cursor={{fill: '#f8fafc', radius: 8}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}} />
                    <Bar dataKey="value" fill="#009b7c" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Area */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">Jumlah Smart Device</h3>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>
              <div className="h-72 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={smartDeviceTrend}>
                    <defs>
                      <linearGradient id="colorDevice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#009b7c" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#009b7c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}} />
                    <Area type="monotone" dataKey="value" stroke="#009b7c" strokeWidth={4} fillOpacity={1} fill="url(#colorDevice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Line */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
               <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">Jumlah Pelanggan</h3>
                  <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Laporan per bulan</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                  <div className="w-12 h-12 bg-[#f97316] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-100">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="h-72 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pelangganTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}} />
                    <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={4} dot={{fill: '#f97316', strokeWidth: 3, r: 5, stroke: '#fff'}} activeDot={{r: 8, strokeWidth: 0}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 5: Line */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">Jumlah Teknisi</h3>
                  <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Laporan per bulan</p>
                </div>
                <div className="w-12 h-12 bg-[#a855f7] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-100">
                   <User className="w-6 h-6" />
                </div>
              </div>
              <div className="h-72 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={teknisiTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}} />
                    <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={4} dot={{fill: '#a855f7', strokeWidth: 3, r: 5, stroke: '#fff'}} activeDot={{r: 8, strokeWidth: 0}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 6: Line */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">Jumlah Pengaduan</h3>
                  <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Laporan per bulan</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                  <div className="w-12 h-12 bg-[#f97316] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-100">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="h-72 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pengaduanTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}} />
                    <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={4} dot={{fill: '#f97316', strokeWidth: 3, r: 5, stroke: '#fff'}} activeDot={{r: 8, strokeWidth: 0}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Customer Table Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <h3 className="text-xl font-bold text-gray-900">Daftar Pelanggan Terdaftar</h3>
               <div className="flex flex-wrap items-center gap-4">
                 <div className="relative group">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#009b7c] transition-colors" />
                   <input 
                     type="text" 
                     placeholder="Cari pelanggan..." 
                     className="pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009b7c] focus:bg-white text-xs w-64 transition-all"
                   />
                 </div>
                 <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-100 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all">
                   <Filter className="w-4 h-4" /> Semua Status <ChevronDown className="w-3 h-3" />
                 </button>
                 <button className="flex items-center gap-2 px-6 py-2.5 bg-[#009b7c] text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 hover:bg-[#008268] transition-all">
                   <Download className="w-4 h-4" /> Download Table
                 </button>
               </div>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-[#009b7c] text-white">
                   <tr>
                     <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest first:rounded-tl-lg">User ID</th>
                     <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest">Nama Lengkap</th>
                     <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest">Email</th>
                     <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest">Status</th>
                     <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-center">BIEON</th>
                     <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-center">Devices</th>
                     <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest">Teknisi</th>
                     <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-center last:rounded-tr-lg">Aksi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {customers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-[#F2F8F5]/30 transition-colors group">
                        <td className="px-8 py-6 text-xs font-black text-[#009b7c] font-mono">{cust.id}</td>
                        <td className="px-8 py-6">
                          <div>
                            <div className="text-sm font-black text-gray-900 leading-none mb-1.5">{cust.name}</div>
                            <div className="text-[10px] text-gray-400 font-bold tracking-wider">{cust.username}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-xs text-blue-500 font-black hover:underline cursor-pointer tracking-tight">{cust.email}</td>
                        <td className="px-8 py-6">
                           <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                             cust.status === 'Aktif' ? 'bg-[#EAFDF5] text-[#10b981]' :
                             cust.status === 'Warning' ? 'bg-[#FFF9E6] text-[#f59e0b]' :
                             'bg-[#FEEBEB] text-[#ef4444]'
                           }`}>
                             {cust.status === 'Aktif' ? <CheckCircle className="w-3.5 h-3.5" /> : 
                              cust.status === 'Warning' ? <AlertTriangle className="w-3.5 h-3.5" /> : 
                              <XCircle className="w-3.5 h-3.5" />}
                             {cust.status}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-xs font-black text-gray-700 text-center">{cust.bieon}</td>
                        <td className="px-8 py-6 text-xs font-black text-gray-700 text-center">{cust.devices}</td>
                        <td className="px-8 py-6 text-xs font-black text-gray-500 tracking-tight">{cust.technician}</td>
                        <td className="px-8 py-6 text-center">
                          <button 
                            onClick={() => onNavigate && onNavigate('admin-client-detail')}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-[#EAFDF3] text-[#009b7c] rounded-xl text-[10px] font-black hover:bg-[#009b7c] hover:text-white transition-all shadow-sm uppercase tracking-widest"
                          >
                             <span className="text-base leading-none">◉</span> Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>

              <div className="p-10 bg-gray-50/30 flex items-center justify-between">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Menampilkan 6 dari 6 Pelanggan</span>
                <div className="flex items-center gap-3">
                  <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 hover:bg-gray-100 transition-all uppercase tracking-widest">Prev</button>
                  <button className="w-10 h-10 bg-[#009b7c] text-white rounded-xl text-[10px] font-black shadow-lg shadow-emerald-100 flex items-center justify-center">1</button>
                  <button className="w-10 h-10 bg-white border border-gray-100 text-gray-400 rounded-xl text-[10px] font-black hover:bg-gray-50 flex items-center justify-center">2</button>
                  <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 hover:bg-gray-100 transition-all uppercase tracking-widest">Next</button>
                </div>
              </div>
          </div>
        </main>
      </div>

      {/* Update Tarif PLN Modal */}
      {showPlnModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPlnModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white relative">
               <button 
                onClick={() => setShowPlnModal(false)}
                className="absolute top-8 right-8 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
               >
                 <X className="w-5 h-5" />
               </button>
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                   <Zap className="w-7 h-7 text-white" />
                 </div>
                 <h2 className="text-3xl font-black">Update Tarif PLN</h2>
               </div>
            </div>

            {/* Modal Body */}
            <div className="p-10 space-y-8">
               <div className="space-y-4">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tarif Saat Ini</label>
                 <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
                    <div className="text-4xl font-black text-gray-900">Rp {plnTariff}</div>
                    <p className="text-xs text-gray-400 font-bold mt-1">per kWh</p>
                 </div>
               </div>

               <div className="space-y-4">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tarif Baru <span className="text-red-500">*</span></label>
                 <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg group-focus-within:text-[#009b7c]">Rp</span>
                    <input 
                      type="number" 
                      value={newTariff}
                      onChange={(e) => setNewTariff(e.target.value)}
                      className="w-full px-16 py-5 bg-white border-2 border-gray-100 rounded-2xl text-xl font-black text-gray-900 focus:outline-none focus:border-[#009b7c] transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400 tracking-tighter group-focus-within:text-[#009b7c]">/kWh</span>
                 </div>
                 <p className="text-[10px] text-gray-400 font-medium italic">
                   * Tarif akan diterapkan untuk perhitungan estimasi biaya energi semua pelanggan
                 </p>
               </div>

               <div className="flex gap-4 pt-4">
                 <button 
                  onClick={() => setShowPlnModal(false)}
                  className="flex-1 py-4 border-2 border-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
                 >
                   Batal
                 </button>
                 <button 
                  onClick={handleUpdateTariff}
                  className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black rounded-2xl shadow-xl shadow-orange-100 hover:shadow-orange-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                 >
                   <Save className="w-5 h-5" />
                   Simpan Perubahan
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
