import { useState } from 'react';
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
  Bell,
  LogOut,
  Menu,
  X,
  Phone,
  MapPin,
  Package,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { MonitoringKlienPage } from './MonitoringKlienPage';
import { PengaduanKlienPage } from './PengaduanKlienPage';
import { KonfigurasiPerangkatPage } from './KonfigurasiPerangkatPage';
import { RiwayatPerbaikanPage } from './RiwayatPerbaikanPage';
import { TechnicianProfilePage } from './profileteknisi';

const mockClients = [
  {
    id: 'C001',
    nama: 'Ahmad Fauzi',
    lokasi: 'Bandung, Jawa Barat',
    status: 'online',
    jumlahBieon: 4,
    jumlahDevice: 28,
    statusSistem: 'Normal',
    alamatLengkap: 'Jl. Setiabudi No. 123, Bandung, Jawa Barat 40153',
    noTelp: '+62 812-3456-7890',
    email: 'ahmad.fauzi@email.com',
    tanggalInstalasi: '15 Januari 2024',
    lastUpdate: '2 menit lalu',
    adaPengaduan: false,
    statusPengaduan: 'Tidak ada',
    devicesOnline: 26,
    devicesOffline: 2
  },
  {
    id: 'C002',
    nama: 'Siti Nurhaliza',
    lokasi: 'Jakarta Selatan',
    status: 'online',
    jumlahBieon: 3,
    jumlahDevice: 19,
    statusSistem: 'Normal',
    alamatLengkap: 'Jl. Mampang Prapatan No. 45, Jakarta Selatan 12790',
    noTelp: '+62 813-2456-8901',
    email: 'siti.nurhaliza@email.com',
    tanggalInstalasi: '22 Februari 2024',
    lastUpdate: '5 menit lalu',
    adaPengaduan: false,
    statusPengaduan: 'Tidak ada',
    devicesOnline: 19,
    devicesOffline: 0
  },
  {
    id: 'C003',
    nama: 'Budi Santoso',
    lokasi: 'Surabaya, Jawa Timur',
    status: 'warning',
    jumlahBieon: 5,
    jumlahDevice: 34,
    statusSistem: 'Minor Issue',
    alamatLengkap: 'Jl. Darmo No. 67, Surabaya, Jawa Timur 60264',
    noTelp: '+62 815-3456-9012',
    email: 'budi.santoso@email.com',
    tanggalInstalasi: '10 Maret 2024',
    lastUpdate: '1 menit lalu',
    adaPengaduan: true,
    statusPengaduan: 'Ada (1 tiket aktif)',
    devicesOnline: 30,
    devicesOffline: 4
  },
  {
    id: 'C004',
    nama: 'Dewi Lestari',
    lokasi: 'Yogyakarta',
    status: 'online',
    jumlahBieon: 2,
    jumlahDevice: 15,
    statusSistem: 'Normal',
    alamatLengkap: 'Jl. Kaliurang KM 5, Yogyakarta 55281',
    noTelp: '+62 816-4567-0123',
    email: 'dewi.lestari@email.com',
    tanggalInstalasi: '5 April 2024',
    lastUpdate: '3 menit lalu',
    adaPengaduan: false,
    statusPengaduan: 'Tidak ada',
    devicesOnline: 15,
    devicesOffline: 0
  },
  {
    id: 'C005',
    nama: 'Rizki Pratama',
    lokasi: 'Semarang, Jawa Tengah',
    status: 'offline',
    jumlahBieon: 3,
    jumlahDevice: 22,
    statusSistem: 'Maintenance',
    alamatLengkap: 'Jl. Pemuda No. 89, Semarang, Jawa Tengah 50132',
    noTelp: '+62 817-5678-1234',
    email: 'rizki.pratama@email.com',
    tanggalInstalasi: '18 Mei 2024',
    lastUpdate: '2 jam lalu',
    adaPengaduan: true,
    statusPengaduan: 'Ada (1 tiket aktif)',
    devicesOnline: 0,
    devicesOffline: 22
  },
  {
    id: 'C006',
    nama: 'Linda Wijaya',
    lokasi: 'Tangerang, Banten',
    status: 'online',
    jumlahBieon: 4,
    jumlahDevice: 31,
    statusSistem: 'Normal',
    alamatLengkap: 'Jl. BSD Raya No. 234, Tangerang, Banten 15310',
    noTelp: '+62 818-6789-2345',
    email: 'linda.wijaya@email.com',
    tanggalInstalasi: '7 Juni 2024',
    lastUpdate: '4 menit lalu',
    adaPengaduan: false,
    statusPengaduan: 'Tidak ada',
    devicesOnline: 29,
    devicesOffline: 2
  },
  {
    id: 'C007',
    nama: 'Eko Prasetyo',
    lokasi: 'Malang, Jawa Timur',
    status: 'online',
    jumlahBieon: 3,
    jumlahDevice: 20,
    statusSistem: 'Normal',
    alamatLengkap: 'Jl. Ijen No. 56, Malang, Jawa Timur 65119',
    noTelp: '+62 819-7890-3456',
    email: 'eko.prasetyo@email.com',
    tanggalInstalasi: '20 Juli 2024',
    lastUpdate: '6 menit lalu',
    adaPengaduan: false,
    statusPengaduan: 'Tidak ada',
    devicesOnline: 20,
    devicesOffline: 0
  },
  {
    id: 'C008',
    nama: 'Maya Kusuma',
    lokasi: 'Bekasi, Jawa Barat',
    status: 'warning',
    jumlahBieon: 2,
    jumlahDevice: 14,
    statusSistem: 'Sensor Error',
    alamatLengkap: 'Jl. Ahmad Yani No. 78, Bekasi, Jawa Barat 17141',
    noTelp: '+62 821-8901-4567',
    email: 'maya.kusuma@email.com',
    tanggalInstalasi: '12 Agustus 2024',
    lastUpdate: '8 menit lalu',
    adaPengaduan: true,
    statusPengaduan: 'Ada (2 tiket aktif)',
    devicesOnline: 12,
    devicesOffline: 2
  },
  {
    id: 'C009',
    nama: 'Arif Rahman',
    lokasi: 'Depok, Jawa Barat',
    status: 'online',
    jumlahBieon: 5,
    jumlahDevice: 38,
    statusSistem: 'Normal',
    alamatLengkap: 'Jl. Margonda Raya No. 345, Depok, Jawa Barat 16424',
    noTelp: '+62 822-9012-5678',
    email: 'arif.rahman@email.com',
    tanggalInstalasi: '3 September 2024',
    lastUpdate: '1 menit lalu',
    adaPengaduan: false,
    statusPengaduan: 'Tidak ada',
    devicesOnline: 36,
    devicesOffline: 2
  },
  {
    id: 'C010',
    nama: 'Putri Ayu',
    lokasi: 'Bogor, Jawa Barat',
    status: 'online',
    jumlahBieon: 3,
    jumlahDevice: 25,
    statusSistem: 'Normal',
    alamatLengkap: 'Jl. Pajajaran No. 111, Bogor, Jawa Barat 16143',
    noTelp: '+62 823-0123-6789',
    email: 'putri.ayu@email.com',
    tanggalInstalasi: '25 Oktober 2024',
    lastUpdate: '3 menit lalu',
    adaPengaduan: false,
    statusPengaduan: 'Tidak ada',
    devicesOnline: 25,
    devicesOffline: 0
  }
];

// Data instalasi BIEON per bulan (12 bulan)
const bieonPerMonthData = [
  { bulan: 'Jan', jumlah: 8 },
  { bulan: 'Feb', jumlah: 12 },
  { bulan: 'Mar', jumlah: 15 },
  { bulan: 'Apr', jumlah: 10 },
  { bulan: 'Mei', jumlah: 18 },
  { bulan: 'Jun', jumlah: 14 },
  { bulan: 'Jul', jumlah: 20 },
  { bulan: 'Agu', jumlah: 16 },
  { bulan: 'Sep', jumlah: 22 },
  { bulan: 'Okt', jumlah: 19 },
  { bulan: 'Nov', jumlah: 25 },
  { bulan: 'Des', jumlah: 21 }
];

// Data pertumbuhan klien yang ditangani per bulan
const klienPerMonthData = [
  { bulan: 'Jan', jumlah: 145 },
  { bulan: 'Feb', jumlah: 152 },
  { bulan: 'Mar', jumlah: 158 },
  { bulan: 'Apr', jumlah: 163 },
  { bulan: 'Mei', jumlah: 171 },
  { bulan: 'Jun', jumlah: 178 },
  { bulan: 'Jul', jumlah: 186 },
  { bulan: 'Agu', jumlah: 193 },
  { bulan: 'Sep', jumlah: 201 },
  { bulan: 'Okt', jumlah: 208 },
  { bulan: 'Nov', jumlah: 215 },
  { bulan: 'Des', jumlah: 223 }
];

const pengaduanTrendData = [
  { bulan: 'Jan', jumlah: 8 },
  { bulan: 'Feb', jumlah: 12 },
  { bulan: 'Mar', jumlah: 7 },
  { bulan: 'Apr', jumlah: 15 },
  { bulan: 'Mei', jumlah: 10 },
  { bulan: 'Jun', jumlah: 6 },
  { bulan: 'Jul', jumlah: 9 },
  { bulan: 'Agu', jumlah: 14 },
  { bulan: 'Sep', jumlah: 11 },
  { bulan: 'Okt', jumlah: 8 },
  { bulan: 'Nov', jumlah: 13 },
  { bulan: 'Des', jumlah: 10 }
];

// Data tren status perangkat
const statusPerangkatTrendData = [
  { bulan: 'Jan', online: 195, offline: 18, error: 7 },
  { bulan: 'Feb', online: 203, offline: 15, error: 5 },
  { bulan: 'Mar', online: 210, offline: 12, error: 8 },
  { bulan: 'Apr', online: 218, offline: 22, error: 6 },
  { bulan: 'Mei', online: 225, offline: 19, error: 4 },
  { bulan: 'Jun', online: 218, offline: 22, error: 6 },
  { bulan: 'Jul', online: 232, offline: 16, error: 5 },
  { bulan: 'Agu', online: 238, offline: 20, error: 7 },
  { bulan: 'Sep', online: 245, offline: 18, error: 4 },
  { bulan: 'Okt', online: 251, offline: 15, error: 6 },
  { bulan: 'Nov', online: 258, offline: 21, error: 8 },
  { bulan: 'Des', online: 264, offline: 17, error: 5 }
];

const deviceStatusData = [
  { name: 'Online', value: 218, color: '#10b981' },
  { name: 'Offline', value: 22, color: '#ef4444' },
  { name: 'Error', value: 6, color: '#f59e0b' }
];

export function TechnicianDashboard({ onNavigate }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'monitoring', icon: Monitor, label: 'Monitoring Klien' },
    { id: 'pengaduan', icon: MessageSquare, label: 'Pengaduan Klien' },
    { id: 'konfigurasi', icon: Settings, label: 'Konfigurasi Perangkat' },
    { id: 'riwayat', icon: History, label: 'Riwayat Perbaikan' },
    { id: 'profil', icon: User, label: 'Profil Teknisi' }
  ];

  const filteredClients = mockClients.filter(client =>
    client.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'monitoring':
        return <MonitoringKlienPage clients={mockClients} />;
      case 'pengaduan':
        return <PengaduanKlienPage />;
      case 'konfigurasi':
        return <KonfigurasiPerangkatPage clients={mockClients} />;
      case 'riwayat':
        return <RiwayatPerbaikanPage />;
      case 'profile':
        return <TechnicianProfilePage />;
      default:
        return (
          <div className="py-8">
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
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2">223</h3>
                <p className="text-white/90 text-sm font-medium pt-2">Total Pelanggan Ditangani</p>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-[#00C698] to-[#00E5B1] rounded-[2rem] p-6 shadow-md text-white transition-all transform hover:scale-[1.02]">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2">200</h3>
                <p className="text-white/90 text-sm font-medium pt-2">Instalasi BIEON [2025]</p>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-[#5C6AFF] to-[#8F98FF] rounded-[2rem] p-6 shadow-md text-white transition-all transform hover:scale-[1.02]">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <HardDrive className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2">1.8K</h3>
                <p className="text-white/90 text-sm font-medium pt-2">Smart Device Aktif</p>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-[#FF7A00] to-[#FF9E42] rounded-[2rem] p-6 shadow-md text-white transition-all transform hover:scale-[1.02]">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2">12</h3>
                <p className="text-white/90 text-sm font-medium pt-2">Pengaduan Aktif</p>
              </div>
            </div>

            {/* Monitoring Status Klien Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Monitoring Status Pelanggan</h2>
                  <p className="text-gray-600 text-sm mt-1">Daftar Pelanggan dan status sistem mereka</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari pelanggan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border-2 border-gray-100 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-colors">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-semibold">Filter</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    <span className="text-sm font-semibold">Download PDF</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
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
                  <BarChart data={bieonPerMonthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
                    <XAxis
                      dataKey="bulan"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#d1fae5' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#d1fae5' }}
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
                      radius={[8, 8, 0, 0]}
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
                  <LineChart data={klienPerMonthData}>
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
                  <LineChart data={pengaduanTrendData}>
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
    <div className="min-h-screen bg-gradient-to-br from-[#F5FFFC] via-[#F5FFFC] to-[#F5FFFC] pb-20 font-sans">
      {/* Top Bar Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1900px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo_bieon.png" alt="BIEON" className="h-10 object-contain" />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              <button 
                onClick={() => setActiveMenu('dashboard')} 
                className={`font-semibold pb-1 border-b-2 transition-colors ${activeMenu === 'dashboard' ? 'text-teal-700 border-teal-700' : 'text-gray-500 border-transparent hover:text-teal-700 hover:border-teal-700'}`}>
                Beranda
              </button>
              <button 
                onClick={() => setActiveMenu('konfigurasi')} 
                className={`font-semibold pb-1 border-b-2 transition-colors ${activeMenu === 'konfigurasi' ? 'text-teal-700 border-teal-700' : 'text-gray-500 border-transparent hover:text-teal-700 hover:border-teal-700'}`}>
                Kendali Perangkat
              </button>
              <button 
                onClick={() => setActiveMenu('riwayat')} 
                className={`font-semibold pb-1 border-b-2 transition-colors ${activeMenu === 'riwayat' ? 'text-teal-700 border-teal-700' : 'text-gray-500 border-transparent hover:text-teal-700 hover:border-teal-700'}`}>
                Riwayat
              </button>
            </nav>

            {/* Profile & Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveMenu('pengaduan')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Pengaduan
              </button>
              
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    TB
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-semibold text-gray-900">Teknisi BPJS</div>
                    <div className="text-xs text-gray-500">Teknisi</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                </button>
                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <button 
                       onClick={() => { setActiveMenu('profile'); setShowRoleDropdown(false); }} 
                       className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-bold transition-colors border-b border-gray-100"
                    >
                      Lihat Profil Saya
                    </button>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Ganti Role (Demo)</div>
                    <button onClick={() => onNavigate && onNavigate("dashboard")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Homeowner</button>
                    <button className="w-full text-left px-4 py-2 text-sm text-emerald-600 bg-emerald-50 font-medium transition-colors">Teknisi</button>
                    <button onClick={() => onNavigate && onNavigate("admin")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Super Admin</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1900px] mx-auto px-8">
          {renderContent()}
        </main>

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

              {/* Statistik Sistem - Grid 4 Columns */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 mb-4 text-lg">Statistik Sistem</h4>
                <div className="grid grid-cols-4 gap-4">
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

              {/* Contact Information & Additional Info - 2 Columns */}
              <div className="grid grid-cols-2 gap-6 mb-6">
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

                  <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
}