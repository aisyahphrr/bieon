import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  Edit2,
  Settings,
  Eye
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

import { SuperAdminLayout } from './SuperAdminLayout';

export default function SuperAdminDashboard({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [showPlnModal, setShowPlnModal] = useState(false);
  const [plnTariff, setPlnTariff] = useState(1445);
  const [newTariff, setNewTariff] = useState(plnTariff);

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

  const handleUpdateTariff = () => {
    setPlnTariff(newTariff);
    setShowPlnModal(false);
  };

  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Semua Status' || cust.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SuperAdminLayout activeMenu="Dashboard" onNavigate={onNavigate} title="Super Admin Dashboard">
      {/* Dashboard Content */}
      <main className="space-y-8">
        {/* Stats Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-[#A443FF] to-[#DB55FF] rounded-[2.5rem] p-8 shadow-xl shadow-purple-200/50 relative overflow-hidden group hover:scale-[1.02] transition-all text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2 ml-4">123</h3>
                <p className="text-white/90 text-sm font-medium">Total Pelanggan</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-xl inline-flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-white rounded-full"></span> 4 Aktif</span>
                <span className="opacity-60">|</span>
                <span className="flex items-center gap-1.5 opacity-80"><span className="w-2 h-2 bg-white/40 rounded-full"></span> 1 Nonaktif</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#00C698] to-[#00E5B1] rounded-[2.5rem] p-8 shadow-xl shadow-emerald-200/50 relative overflow-hidden group hover:scale-[1.02] transition-all text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Box className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2 ml-4">312</h3>
                <p className="text-white/90 text-sm font-medium">BIEON Nodes</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-xl inline-flex items-center gap-2 text-xs font-medium">
                <TrendingUp className="w-4 h-4" /> +12% dari bulan lalu
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#5C6AFF] to-[#8F98FF] rounded-[2.5rem] p-8 shadow-xl shadow-blue-200/50 relative overflow-hidden group hover:scale-[1.02] transition-all text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2 ml-4">459</h3>
                <p className="text-white/90 text-sm font-medium">Smart Devices</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-xl inline-flex items-center gap-2 text-xs font-medium">
                <TrendingUp className="w-4 h-4" /> +18% dari bulan lalu
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#FF7A00] to-[#FF9E42] rounded-[2.5rem] p-8 shadow-xl shadow-orange-200/50 relative overflow-hidden group hover:scale-[1.02] transition-all text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2 ml-4">15</h3>
                <p className="text-white/90 text-sm font-medium">Total Pengaduan</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-xl inline-flex items-center gap-2 text-xs font-medium text-white">
                <AlertCircle className="w-4 h-4" /> 1 sistem butuh perhatian
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
              <span className="text-3xl font-bold text-gray-900 leading-none">10</span>
              <p className="text-sm font-medium text-gray-500 mt-1">Total Teknisi Aktif</p>
              <div className="text-xs text-[#10b981] font-semibold flex items-center gap-1 mt-1.5">
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
                <span className="text-3xl font-bold text-gray-900">Rp {plnTariff}</span>
                <p className="text-sm font-medium text-gray-500 mt-1">Tarif PLN/kWh</p>
              </div>
            </div>
            <button
              onClick={() => setShowPlnModal(true)}
              className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Edit2 className="w-4 h-4" /> Update Tarif PLN
            </button>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-lg transition-all">
            <div className="w-16 h-16 bg-[#009b7c]/10 rounded-2xl flex items-center justify-center text-[#009b7c] group-hover:bg-[#009b7c] group-hover:text-white transition-all">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <span className="text-3xl font-bold text-gray-900 leading-none">98.5%</span>
              <p className="text-sm font-medium text-gray-500 mt-1">System Uptime</p>
              <div className="text-xs text-[#009b7c] font-semibold flex items-center gap-1 mt-1.5">
                <Activity className="w-3.5 h-3.5" /> Real-time monitoring
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Chart 1: Bar */}
          <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-[2.5rem] p-10 shadow-sm border border-emerald-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Jumlah Instalasi BIEON</h3>
                <p className="text-sm text-gray-600 mt-1">Per bulan dalam 1 tahun</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                <Box className="w-6 h-6" />
              </div>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={instalasiData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorBieonBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} padding={{ left: 0, right: 0 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} width={30} />
                  <Tooltip cursor={{ fill: '#f8fafc', radius: 8 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                  <Bar dataKey="value" fill="url(#colorBieonBar)" shape={<ThreeDBar />} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Bar */}
          <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-[2.5rem] p-10 shadow-sm border border-emerald-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Jumlah Hub Node</h3>
                <p className="text-sm text-gray-600 mt-1">Per bulan dalam 1 tahun</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hubNodeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorHubBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#0891b2" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} padding={{ left: 0, right: 0 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} width={30} />
                  <Tooltip cursor={{ fill: '#f8fafc', radius: 8 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                  <Bar dataKey="value" fill="url(#colorHubBar)" shape={<ThreeDBar />} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Area */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-[2.5rem] p-10 shadow-sm border border-blue-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Jumlah Smart Device</h3>
                <p className="text-sm text-gray-600 mt-1">Akumulasi pertumbuhan per bulan</p>
              </div>
              <button
                onClick={() => handleDownloadPDF(
                  "Laporan Jumlah Smart Device",
                  ["Bulan", "Jumlah Device"],
                  smartDeviceTrend.map(d => [d.name, d.value]),
                  "SmartDevice_Report"
                )}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={smartDeviceTrend}>
                  <defs>
                    <linearGradient id="colorDeviceBg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDeviceLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                  <Area type="monotone" dataKey="value" stroke="url(#colorDeviceLine)" strokeWidth={4} fillOpacity={1} fill="url(#colorDeviceBg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Line */}
          <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-[2.5rem] p-10 shadow-sm border border-purple-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Jumlah Pelanggan</h3>
                <p className="text-sm text-gray-600 mt-1">Laporan per bulan</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadPDF(
                    "Laporan Jumlah Pelanggan",
                    ["Bulan", "Jumlah Pelanggan"],
                    pelangganTrend.map(d => [d.name, d.value]),
                    "Pelanggan_Report"
                  )}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-100">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pelangganTrend}>
                  <defs>
                    <linearGradient id="colorPelangganLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                      <stop offset="100%" stopColor="#d946ef" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="url(#colorPelangganLine)" strokeWidth={4} dot={{ fill: '#a855f7', strokeWidth: 3, r: 5, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Line */}
          <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-[2.5rem] p-10 shadow-sm border border-orange-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Jumlah Teknisi</h3>
                <p className="text-sm text-gray-600 mt-1">Laporan per bulan</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-100">
                <User className="w-6 h-6" />
              </div>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={teknisiTrend}>
                  <defs>
                    <linearGradient id="colorTeknisiLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fb923c" stopOpacity={1} />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="url(#colorTeknisiLine)" strokeWidth={4} dot={{ fill: '#f97316', strokeWidth: 3, r: 5, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Line */}
          <div className="bg-gradient-to-br from-white to-amber-50/50 rounded-[2.5rem] p-10 shadow-sm border border-amber-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Jumlah Pengaduan Pelanggan</h3>
                <p className="text-sm text-gray-600 mt-1">Laporan per bulan</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownloadPDF(
                    "Laporan Pengaduan Pelanggan",
                    ["Bulan", "Jumlah Pengaduan"],
                    pengaduanTrend.map(d => [d.name, d.value]),
                    "Pengaduan_Report"
                  )}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  <Download className="w-4 h-4" /> Export
                </button>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-100">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pengaduanTrend}>
                  <defs>
                    <linearGradient id="colorPengaduanLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="url(#colorPengaduanLine)" strokeWidth={4} dot={{ fill: '#f59e0b', strokeWidth: 3, r: 5, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Customer Table Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-10 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800">Daftar Pelanggan Terdaftar</h2>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#009b7c] transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pelanggan..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#009b7c] focus:bg-white text-xs transition-all"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none px-4 py-3 min-w-[140px] border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-colors text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer"
                >
                  <option value="Semua Status">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Warning">Warning</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                onClick={() => handleDownloadPDF(
                  "Daftar Pelanggan Terdaftar BIEON",
                  ["User ID", "Nama", "Username", "Email", "Status", "BIEON", "Devices", "Teknisi"],
                  filteredCustomers.map(c => [c.id, c.name, c.username, c.email, c.status, c.bieon, c.devices, c.technician]),
                  "Daftar_Pelanggan"
                )}
                className="flex items-center gap-2 px-4 py-2 bg-[#009b7c] text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-[#008268] transition-all shrink-0"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-[#009b7c] text-white">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-left">User ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-left">Nama Lengkap</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-left">Email</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-center">BIEON</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-center">Devices</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-left">Teknisi</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-[#F2F8F5]/30 transition-colors group">
                      <td className="px-6 py-4 text-xs font-semibold text-[#009b7c]">{cust.id}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 mb-1">{cust.name}</div>
                          <div className="text-xs text-gray-500">{cust.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cust.email}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${cust.status === 'Aktif' ? 'bg-[#EAFDF5] text-[#10b981]' :
                            cust.status === 'Warning' ? 'bg-[#FFF9E6] text-[#f59e0b]' :
                              'bg-[#FEF2F2] text-[#ef4444]'
                            }`}>
                            <span className="w-2 h-2 rounded-full mr-2 bg-current"></span>
                            {cust.status}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-900">{cust.bieon}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-900">{cust.devices}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{cust.technician}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate('admin-pelanggan');
                              setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('openHomeownerDetail', { detail: cust.name }));
                              }, 100);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
                        >
                          <Eye className="w-4 h-4" /> Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 text-sm font-medium">
                      Tidak ada pelanggan yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-10 bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Menampilkan {filteredCustomers.length} dari {customers.length} Pelanggan
            </span>
            <div className="flex items-center gap-3">
              <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 hover:bg-gray-100 transition-all uppercase tracking-widest shadow-sm">Previous</button>
              <button className="w-12 h-12 bg-[#009b7c] text-white rounded-2xl text-[10px] font-black shadow-lg shadow-emerald-100 flex items-center justify-center">1</button>
              <button className="w-12 h-12 bg-white border border-gray-100 text-gray-400 rounded-2xl text-[10px] font-black hover:bg-gray-50 flex items-center justify-center">2</button>
              <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 hover:bg-gray-100 transition-all uppercase tracking-widest shadow-sm">Next</button>
            </div>
          </div>
        </div>
      </main>

      {/* Update Tarif PLN Modal */}
      {showPlnModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPlnModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6 text-white relative">
              <button
                onClick={() => setShowPlnModal(false)}
                className="absolute top-6 right-6 w-10 h-10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Update Tarif PLN</h2>
                  <p className="text-white/80 font-medium text-xs mt-1">Konfigurasi Parameter Sistem</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-7">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 ml-1">Tarif Saat Ini</label>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-baseline gap-3 shadow-sm">
                  <div className="text-4xl font-bold text-gray-900 leading-none">Rp {plnTariff}</div>
                  <p className="text-sm text-gray-500 font-medium">per kilowatt hour (kWh)</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 ml-1">Tarif Baru <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xl group-focus-within:text-orange-500 transition-colors">Rp</span>
                  <input
                    type="number"
                    value={newTariff}
                    onChange={(e) => setNewTariff(e.target.value)}
                    className="w-full pl-14 pr-20 py-4 bg-white border border-gray-200 rounded-2xl text-xl font-bold text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all shadow-sm"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-semibold text-gray-400 text-sm group-focus-within:text-orange-500 transition-colors">/ kWh</span>
                </div>
                <div className="flex items-start gap-2 px-1 pt-1">
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Tarif ini akan diterapkan secara global untuk perhitungan estimasi biaya energi pada seluruh dashboard pelanggan.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-50">
                <button
                  onClick={() => setShowPlnModal(false)}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateTariff}
                  className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}