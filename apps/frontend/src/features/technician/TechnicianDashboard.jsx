import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Monitor,
  MessageSquare,
  Settings,
  History,
  User,
  Users,
  Cpu,
  HardDrive,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  X,
  Phone,
  MapPin,
  Package,
  Activity,
  CheckCircle2,
  FileDown,
  Radio,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MonitoringKlienPage } from './MonitoringKlienPage';
import { PengaduanKlienPage } from './PengaduanKlienPage';
import { KonfigurasiPerangkatPage } from './KonfigurasiPerangkatPage';
import { RiwayatPerbaikanPage } from './RiwayatPerbaikanPage';
import { TechnicianProfilePage } from './profileteknisi';
import TechnicianLayout from './TechnicianLayout';

// Refined Custom 3D Bar Component to match user's image exactly
const ThreeDBar = (props) => {
  const { x, y, width, height, fill } = props;
  if (!height || height <= 0) return null;

  const depth = 6; // Reduced depth for cleaner spacing

  return (
    <g>
      {/* Subtle Drop Shadow behind the bar */}
      <rect
        x={x + 3}
        y={y + height - depth}
        width={width + depth}
        height={depth}
        fill="rgba(0,0,0,0.1)"
        className="blur-[4px]"
      />

      {/* 3D Side Face (Right) - Darkened */}
      <path
        d={`M ${x + width} ${y} L ${x + width + depth} ${y - depth} L ${x + width + depth} ${y + height - depth} L ${x + width} ${y + height} Z`}
        fill={fill}
        style={{ filter: 'brightness(0.75)' }}
      />

      {/* 3D Top Face - Brightened */}
      <path
        d={`M ${x} ${y} L ${x + depth} ${y - depth} L ${x + width + depth} ${y - depth} L ${x + width} ${y} Z`}
        fill={fill}
        style={{ filter: 'brightness(1.25)' }}
      />

      {/* Front Face - Main bar with gradient handled by Recharts 'fill' */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
      />

      {/* Edge Highlight (Inner Top) */}
      <line
        x1={x} y1={y} x2={x + width} y2={y}
        stroke="rgba(255,255,255,0.3)" strokeWidth="1"
      />
    </g>
  );
};

const MENU_ITEMS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'monitoring', icon: Monitor, label: 'Monitoring Klien' },
  { id: 'pengaduan', icon: MessageSquare, label: 'Pengaduan Klien' },
  { id: 'konfigurasi', icon: Settings, label: 'Konfigurasi Perangkat' },
  { id: 'riwayat', icon: History, label: 'Riwayat Perbaikan' },
  { id: 'profile', icon: User, label: 'Profil Teknisi' },
];

function Toast({ message, type = 'success' }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] animate-in fade-in slide-in-from-top-4 duration-500">
      <div className={`px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 ${type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-gray-800/90 border-gray-700 text-white'
        }`}>
        {type === 'success' && <CheckCircle2 className="w-5 h-5" />}
        <span className="text-sm font-bold tracking-wide">{message}</span>
      </div>
    </div>
  );
}

export function TechnicianDashboard({ onNavigate }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [toast, setToast] = useState(null);
  const [inputToken, setInputToken] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    totalHubs: 0,
    totalDevices: 0,
    activeComplaints: 0
  });
  const [charts, setCharts] = useState({
    bieonPerMonth: [],
    klienPerMonth: [],
    pengaduanTrend: []
  });
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      try {
        const [metricsRes, chartsRes, clientsRes] = await Promise.all([
          fetch('/api/technician/dashboard/metrics', { headers }),
          fetch('/api/technician/dashboard/charts', { headers }),
          fetch('/api/technician/dashboard/clients', { headers })
        ]);

        const metricsData = await metricsRes.json();
        const chartsData = await chartsRes.json();
        const clientsData = await clientsRes.json();

        if (metricsData.success) setMetrics(metricsData.data);
        if (chartsData.success) setCharts(chartsData.data);
        if (clientsData.success) setClients(clientsData.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // triggerToast('Gagal memuat data dashboard', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredClients = (clients || []).filter(client =>
    (client.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.lokasi || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'monitoring':
        return <MonitoringKlienPage clients={clients} />;
      case 'pengaduan':
        return <PengaduanKlienPage />;
      case 'konfigurasi':
        return <KonfigurasiPerangkatPage clients={clients} onNavigate={onNavigate} triggerToast={triggerToast} />;
      case 'riwayat':
        return <RiwayatPerbaikanPage />;
      case 'profile':
        return <TechnicianProfilePage onNavigate={onNavigate} />;
      default:
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Teknisi</h1>
              <p className="text-gray-500">Monitoring &amp; Manajemen Sistem Pelanggan BIEON</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#A443FF] to-[#DB55FF] rounded-[2rem] p-6 shadow-md text-white transition-all transform hover:scale-[1.02]">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2">{metrics.totalClients}</h3>
                <p className="text-white/90 text-sm font-medium pt-2">Total Pelanggan Ditangani</p>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-[#00C698] to-[#00E5B1] rounded-[2rem] p-6 shadow-md text-white transition-all transform hover:scale-[1.02]">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2">{metrics.totalHubs}</h3>
                <p className="text-white/90 text-sm font-medium pt-2">Instalasi BIEON [2025]</p>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-[#5C6AFF] to-[#8F98FF] rounded-[2rem] p-6 shadow-md text-white transition-all transform hover:scale-[1.02]">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <HardDrive className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2">{metrics.totalDevices}</h3>
                <p className="text-white/90 text-sm font-medium pt-2">Smart Device Aktif</p>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-[#FF7A00] to-[#FF9E42] rounded-[2rem] p-6 shadow-md text-white transition-all transform hover:scale-[1.02]">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2">{metrics.activeComplaints}</h3>
                <p className="text-white/90 text-sm font-medium pt-2">Pengaduan Aktif</p>
              </div>
            </div>

            {/* Monitoring Status Klien Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Monitoring Status Pelanggan</h2>
                  <p className="text-gray-600 text-sm mt-1">Status Sistem Per Pelanggan</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari pelanggan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 text-sm transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-colors w-full sm:w-auto shadow-sm">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">Filter</span>
                    </button>
                    <button
                      onClick={() => triggerToast('Laporan monitoring sedang diproses...')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0F9E78] text-white hover:bg-[#0B8563] rounded-xl transition-colors shadow-sm shadow-[#0F9E78]/20 w-full sm:w-auto"
                    >
                      <FileDown className="w-4 h-4" />
                      <span className="text-sm font-semibold">Download</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nama Pelanggan</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Lokasi</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Status Sistem</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">BIEON</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Device</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {client.nama.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{client.nama}</p>
                              <p className="text-xs text-gray-500">{client.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{client.lokasi}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${client.status === 'online'
                            ? 'bg-green-100 text-green-700'
                            : client.status === 'offline'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {client.status === 'online' ? 'Online' : client.status === 'offline' ? 'Offline' : 'Warning'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg text-emerald-700 font-bold">
                            {client.jumlahBieon}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg text-teal-700 font-bold">
                            {client.jumlahDevice}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                          {client.statusSistem}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                          >
                            Detail
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden divide-y divide-gray-100">
                {filteredClients.map((client) => (
                  <div key={client.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm border border-emerald-200/50">
                          {client.nama.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-[15px]">{client.nama}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="truncate max-w-[130px]">{client.lokasi}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold ${client.status === 'online'
                        ? 'bg-green-100 border border-green-200 text-green-700'
                        : client.status === 'offline'
                          ? 'bg-red-100 border border-red-200 text-red-700'
                          : 'bg-yellow-100 border border-yellow-200 text-yellow-700'
                        }`}>
                        <Activity className="w-3 h-3 mr-1" />
                        {client.status === 'online' ? 'Online' : client.status === 'offline' ? 'Offline' : 'Warning'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100/50 flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-emerald-100/80 rounded-lg flex items-center justify-center shrink-0">
                          <Cpu className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">BIEON</p>
                          <p className="text-sm font-bold text-emerald-700">{client.jumlahBieon}</p>
                        </div>
                      </div>
                      <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-100/50 flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-teal-100/80 rounded-lg flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Device</p>
                          <p className="text-sm font-bold text-teal-700">{client.jumlahDevice}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${client.statusSistem === 'Normal' ? 'text-gray-700 bg-gray-100 border border-gray-200' : 'text-rose-700 bg-rose-50 border border-rose-100'}`}>
                        {client.statusSistem}
                      </div>
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-[#0D9488] text-white rounded-xl text-xs font-bold hover:bg-[#0F766E] transition-all shadow-sm shadow-teal-500/20 active:scale-95"
                      >
                        Detail <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredClients.length === 0 && (
                  <div className="py-12 text-center text-gray-500 text-sm">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    Tidak ada pelanggan yang ditemukan.
                  </div>
                )}
              </div>
            </div>

            {/* Visualisasi Data Sistem */}
            {/* Bar Charts - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Bar Chart BIEON Instalasi */}
              <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-3xl shadow-xl border border-emerald-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Instalasi BIEON (2025)</h3>
                    <p className="text-sm text-gray-600 mt-1">Per bulan dalam 1 tahun</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={charts.bieonPerMonth} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
                    <XAxis
                      dataKey="bulan"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#d1fae5' }}
                      padding={{ left: 0, right: 0 }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#d1fae5' }}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #d1fae5',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar
                      dataKey="jumlah"
                      fill="url(#colorBieon)"
                      shape={<ThreeDBar />}
                      barSize={30}
                      name="Instalasi BIEON"
                    />
                    <defs>
                      <linearGradient id="colorBieon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart Klien Ditangani */}
              <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-3xl shadow-xl border border-purple-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Jumlah Pelanggan</h3>
                    <p className="text-sm text-gray-600 mt-1">Jumlah Pelanggan yang ditangani oleh teknisi per bulan</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={charts.klienPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" vertical={false} />
                    <XAxis
                      dataKey="bulan"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e9d5ff' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e9d5ff' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e9d5ff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="jumlah"
                      stroke="url(#colorKlien)"
                      strokeWidth={3}
                      dot={{ fill: '#a855f7', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Total Klien"
                    />
                    <defs>
                      <linearGradient id="colorKlien" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                        <stop offset="100%" stopColor="#d946ef" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Charts - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tren Pengaduan */}
              <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-3xl shadow-xl border border-amber-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Jumlah Pengaduan Pelanggan</h3>
                    <p className="text-sm text-gray-600 mt-1">Laporan per bulan</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={charts.pengaduanTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" vertical={false} />
                    <XAxis
                      dataKey="bulan"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#fef3c7' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#fef3c7' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #fef3c7',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="jumlah"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Pengaduan"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Map Dummu */}
              <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl shadow-xl border border-blue-100 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Peta Persebaran Pelanggan</h3>
                    <p className="text-sm text-gray-600 mt-1">Visualisasi distribusi pelanggan berdasarkan wilayah teknisi</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 w-full bg-gray-100 rounded-2xl overflow-hidden mt-2 relative min-h-[250px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15865.116672332824!2d106.8239247!3d-6.2268712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e9a7e08927%3A0xe54e38e68dbb6db1!2sKuningan%2C%20Setia%20Budi%2C%20South%20Jakarta%20City%2C%20Jakarta!5e0!3m2!1sen!2sid!4v1714455823126!5m2!1sen!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <TechnicianLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu} onNavigate={onNavigate}>
      {/* Main Content Area */}
      <div className="max-w-[1900px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {renderContent()}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-3xl flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">Detail Pelanggan</h2>
                <p className="text-emerald-100">Informasi Lengkap Sistem Smart Home</p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="w-10 h-10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Client Header Info */}
              <div className="flex items-center gap-4 pb-6 border-b mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {selectedClient.nama.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">{selectedClient.nama}</h3>
                  <p className="text-gray-600 text-sm">{selectedClient.id}</p>
                </div>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${selectedClient.status === 'online'
                  ? 'bg-green-100 text-green-700'
                  : selectedClient.status === 'offline'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  <Activity className="w-4 h-4 mr-2" />
                  {selectedClient.status === 'online' ? 'Online' : selectedClient.status === 'offline' ? 'Offline' : 'Warning'}
                </span>
              </div>

              {/* Statistik Sistem - Grid Responsive */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-4 text-lg">Statistik Sistem</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Jumlah BIEON</p>
                        <p className="text-3xl font-bold text-gray-800">{selectedClient.jumlahBieon}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-5 border border-teal-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Total Perangkat</p>
                        <p className="text-3xl font-bold text-gray-800">{selectedClient.jumlahDevice}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Device Online</p>
                        <p className="text-3xl font-bold text-green-600">{selectedClient.devicesOnline || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border border-red-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Device Offline</p>
                        <p className="text-3xl font-bold text-red-600">{selectedClient.devicesOffline || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information & Additional Info - Responsive Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Left Column - Contact */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">Informasi Kontak</h4>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Nomor Telepon</p>
                        <p className="font-bold text-gray-800">{selectedClient.noTelp}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Email</p>
                        <p className="font-bold text-gray-800 break-words">{selectedClient.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Alamat Lengkap</p>
                        <p className="font-bold text-gray-800">{selectedClient.alamatLengkap}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Status & Dates */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">Status & Informasi</h4>
                  <div className={`rounded-xl p-5 border-2 ${selectedClient.adaPengaduan ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className={`w-6 h-6 ${selectedClient.adaPengaduan ? 'text-red-600' : 'text-green-600'}`} />
                      <p className="text-sm font-semibold text-gray-600">Status Pengaduan</p>
                    </div>
                    <p className={`text-xl font-bold ${selectedClient.adaPengaduan ? 'text-red-700' : 'text-green-700'}`}>
                      {selectedClient.statusPengaduan || 'Tidak ada'}
                    </p>
                  </div>

                  <div className={`rounded-xl p-5 border-2 ${selectedClient.status === 'online' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className={`w-6 h-6 ${selectedClient.status === 'online' ? 'text-green-600' : 'text-red-600'}`} />
                      <p className="text-sm font-semibold text-gray-600">System Active</p>
                    </div>
                    <p className={`text-xl font-bold ${selectedClient.status === 'online' ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedClient.status === 'online' ? 'Aktif' : selectedClient.status === 'offline' ? 'Tidak Aktif' : 'Masalah'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Tanggal Instalasi</p>
                      <p className="font-bold text-gray-800 text-sm">{selectedClient.tanggalInstalasi}</p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Update Terakhir</p>
                      <p className="font-bold text-gray-800 text-sm">{selectedClient.lastUpdate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </TechnicianLayout>
  );
}