import React, { useState, useEffect } from 'react';
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

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const createMonthlyChartData = (values = []) => MONTH_LABELS.map((name, index) => ({
  name,
  value: values?.[index] || 0,
}));

const createCustomerStatusLabel = (status) => {
  if (!status) return 'Aktif';
  if (status.toLowerCase() === 'nonaktif') return 'Nonaktif';
  return 'Aktif';
};

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
  // Dashboard metrics states
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalHubs: 0,
    totalDevices: 0,
    totalComplaints: 0,
    totalTechnicians: 0,
    activeTechnicians: 0,
    monthlyInstalasi: Array(12).fill(0),
    monthlyHubs: Array(12).fill(0),
    monthlyPelanggan: Array(12).fill(0),
    monthlyTechnicians: Array(12).fill(0),
    monthlyDevices: Array(12).fill(0),
    monthlyComplaints: Array(12).fill(0)
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  // Other states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [showPlnModal, setShowPlnModal] = useState(false);
  const [plnTariff, setPlnTariff] = useState(1445);
  const [newTariff, setNewTariff] = useState(plnTariff);
  const [homeowners, setHomeowners] = useState([]);
  const [homeownersLoading, setHomeownersLoading] = useState(true);
  const [homeownersError, setHomeownersError] = useState(null);

  // Fetch dashboard metrics from API
  const fetchDashboardMetrics = async () => {
    try {
      setMetricsError(null);
      const token = localStorage.getItem('bieon_token');

      const response = await fetch('/api/admin/dashboard/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setMetrics((prev) => ({
          ...prev,
          ...data.data,
          monthlyInstalasi: data.data.monthlyInstalasi || prev.monthlyInstalasi,
          monthlyHubs: data.data.monthlyHubs || prev.monthlyHubs,
          monthlyPelanggan: data.data.monthlyPelanggan || prev.monthlyPelanggan,
          monthlyTechnicians: data.data.monthlyTechnicians || prev.monthlyTechnicians,
          monthlyDevices: data.data.monthlyDevices || prev.monthlyDevices,
          monthlyComplaints: data.data.monthlyComplaints || prev.monthlyComplaints,
        }));
        setMetricsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      setMetricsError(error.message);
      setMetricsLoading(false);
    }
  };

  const fetchHomeowners = async () => {
    try {
      setHomeownersError(null);
      const token = localStorage.getItem('bieon_token');

      const response = await fetch('/api/admin/homeowners', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch homeowners: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setHomeowners(data.data.map((homeowner) => ({
          id: homeowner._id,
          name: homeowner.fullName,
          username: homeowner.username || '-',
          email: homeowner.email,
          status: createCustomerStatusLabel(homeowner.status),
          bieon: homeowner.totalHubs || 0,
          devices: homeowner.totalDevices || 0,
          technician: '-',
        })));
        setHomeownersLoading(false);
      }
    } catch (error) {
      console.error('Error fetching homeowners:', error);
      setHomeownersError(error.message);
      setHomeownersLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately on mount.
    fetchDashboardMetrics();
    fetchHomeowners();

    // Poll metrics periodically to keep dashboard counters/charts updated.
    const pollingInterval = setInterval(() => {
      fetchDashboardMetrics();
    }, 10000);

    return () => clearInterval(pollingInterval);
  }, []);

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

  const filteredCustomers = homeowners.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Semua Status' || cust.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const instalasiChartData = createMonthlyChartData(metrics.monthlyInstalasi);
  const hubNodeChartData = createMonthlyChartData(metrics.monthlyHubs);
  const smartDeviceChartData = createMonthlyChartData(metrics.monthlyDevices);
  const pelangganChartData = createMonthlyChartData(metrics.monthlyPelanggan);
  const teknisiChartData = createMonthlyChartData(metrics.monthlyTechnicians);
  const pengaduanChartData = createMonthlyChartData(metrics.monthlyComplaints);

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
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2 ml-4">
                  {metricsLoading ? '-' : metrics.totalUsers}
                </h3>
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
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2 ml-4">
                  {metricsLoading ? '-' : metrics.totalHubs}
                </h3>
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
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2 ml-4">
                  {metricsLoading ? '-' : metrics.totalDevices}
                </h3>
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
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2 ml-4">
                  {metricsLoading ? '-' : metrics.totalComplaints}
                </h3>
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
              <span className="text-3xl font-bold text-gray-900 leading-none">{metricsLoading ? '-' : metrics.activeTechnicians || 0}</span>
              <p className="text-sm font-medium text-gray-500 mt-1">Total Teknisi Aktif</p>
              <div className="text-xs text-[#10b981] font-semibold flex items-center gap-1 mt-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> {metricsLoading ? '-' : `Total teknisi ${metrics.totalTechnicians || 0}`}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-lg transition-all">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-14 h-14 bg-[#f97316] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-3xl font-bold text-gray-900">7 Golongan</span>
                <p className="text-sm font-medium text-gray-500 mt-1">Tarif Aktif</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('admin-tarif');
              }}
              className="w-full py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Settings className="w-4 h-4" /> Kelola Golongan Tarif
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100 shrink-0">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Jumlah Instalasi BIEON</h3>
                  <p className="text-sm text-gray-600 mt-1">Per bulan dalam 1 tahun</p>
                </div>
              </div>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={instalasiChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100 shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Jumlah Hub Node</h3>
                  <p className="text-sm text-gray-600 mt-1">Per bulan dalam 1 tahun</p>
                </div>
              </div>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hubNodeChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 shrink-0">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Jumlah Smart Device</h3>
                  <p className="text-sm text-gray-600 mt-1">per bulan dalam 1 tahun</p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadPDF(
                  "Laporan Jumlah Smart Device",
                  ["Bulan", "Jumlah Device"],
                  smartDeviceChartData.map(d => [d.name, d.value]),
                  "SmartDevice_Report"
                )}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all self-end sm:self-auto"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={smartDeviceChartData}>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-100 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Jumlah Pelanggan</h3>
                  <p className="text-sm text-gray-600 mt-1">Laporan per bulan</p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadPDF(
                  "Laporan Jumlah Pelanggan",
                  ["Bulan", "Jumlah Pelanggan"],
                  pelangganChartData.map(d => [d.name, d.value]),
                  "Pelanggan_Report"
                )}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all self-end sm:self-auto"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pelangganChartData}>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-100 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Jumlah Teknisi</h3>
                  <p className="text-sm text-gray-600 mt-1">Laporan per bulan</p>
                </div>
              </div>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={teknisiChartData}>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-100 shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Jumlah Pengaduan Pelanggan</h3>
                  <p className="text-sm text-gray-600 mt-1">Laporan per bulan</p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadPDF(
                  "Laporan Pengaduan Pelanggan",
                  ["Bulan", "Jumlah Pengaduan"],
                  pengaduanChartData.map(d => [d.name, d.value]),
                  "Pengaduan_Report"
                )}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all self-end sm:self-auto"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pengaduanChartData}>
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
            <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative group col-span-2 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#009b7c] transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pelanggan..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#009b7c] focus:bg-white text-xs transition-all"
                />
              </div>
              <div className="relative col-span-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full md:w-auto px-4 py-3 min-w-[140px] border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-colors text-sm font-semibold text-gray-600 focus:outline-none cursor-pointer"
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
                className="flex items-center justify-center col-span-1 gap-2 px-4 py-3 md:py-2 bg-[#009b7c] text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-[#008268] transition-all shrink-0"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>

          <div className="overflow-x-auto hidden md:block">
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

          {/* Mobile View - Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((cust) => (
                <div key={cust.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{cust.name}</h3>
                      <p className="text-xs text-gray-500">{cust.username}</p>
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${cust.status === 'Aktif' ? 'bg-[#EAFDF5] text-[#10b981]' :
                      cust.status === 'Warning' ? 'bg-[#FFF9E6] text-[#f59e0b]' :
                        'bg-[#FEF2F2] text-[#ef4444]'
                      }`}>
                      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"></span>
                      {cust.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs border-y border-gray-50 py-3">
                    <div>
                      <p className="text-gray-500 mb-0.5">User ID</p>
                      <p className="font-semibold text-gray-900">{cust.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Email</p>
                      <p className="font-semibold text-gray-900 truncate">{cust.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">BIEON / Devices</p>
                      <p className="font-semibold text-gray-900">{cust.bieon} / {cust.devices}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Teknisi</p>
                      <p className="font-semibold text-gray-900 truncate">{cust.technician}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('admin-pelanggan');
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('openHomeownerDetail', { detail: cust.name }));
                        }, 100);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    <Eye className="w-4 h-4" /> Detail Pelanggan
                  </button>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500 text-sm font-medium">
                Tidak ada pelanggan yang cocok dengan pencarian Anda.
              </div>
            )}
          </div>

          <div className="p-6 md:p-10 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">
              Menampilkan {filteredCustomers.length} dari {homeowners.length} Pelanggan
            </span>
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
              <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 hover:bg-gray-100 transition-all uppercase tracking-widest shadow-sm">Prev</button>
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

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-50">
                <button
                  onClick={() => setShowPlnModal(false)}
                  className="w-full sm:flex-1 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateTariff}
                  className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}