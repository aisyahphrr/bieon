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
  ChevronLeft,
  Menu,
  ShieldCheck,
  MessageSquare,
  History,
  MoreVertical,
  X,
  Save,
  ChevronRight,
  TrendingUp,
  TrendingDown,
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
  const s = status?.toLowerCase() || 'aktif';
  if (s === 'nonaktif') return 'Nonaktif';
  if (s === 'warning') return 'Perhatian';
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
    totalHubs: 0,
    hubTrend: 0,
    totalDevices: 0,
    deviceTrend: 0,
    totalComplaints: 0,
    pendingComplaints: 0,
    totalTechnicians: 0,
    activeTechnicians: 0,
    activeHomeowners: 0,
    inactiveHomeowners: 0,
    warningHomeowners: 0,
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
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPlnModal, setShowPlnModal] = useState(false);
  const [plnTariff, setPlnTariff] = useState(1445);
  const [newTariff, setNewTariff] = useState(plnTariff);
  const [plnCategories, setPlnCategories] = useState([]);
  const [plnCategoriesLoading, setPlnCategoriesLoading] = useState(true);
  const [plnSummary, setPlnSummary] = useState(null);
  const [plnSummaryLoading, setPlnSummaryLoading] = useState(true);
  const [plnCurrentTariffs, setPlnCurrentTariffs] = useState({});
  const [showPlnCategoriesModal, setShowPlnCategoriesModal] = useState(false);
  const [homeowners, setHomeowners] = useState([]);
  const [homeownersLoading, setHomeownersLoading] = useState(true);
  const [homeownersError, setHomeownersError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showRowsDropdown, setShowRowsDropdown] = useState(false);

  // Fetch dashboard metrics from API
  const fetchDashboardMetrics = async () => {
    try {
      setMetricsError(null);
      const token = localStorage.getItem('token');

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
      const token = localStorage.getItem('token');

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
          bieonId: homeowner.bieonId || '-',
          totalHubs: homeowner.totalHubs || 0,
          devices: homeowner.totalDevices || 0,
          technician: homeowner.technicianName || '-',
          fieldTeam: homeowner.fieldTeam || [], // New data from backend
        })));
        setHomeownersLoading(false);
      }
    } catch (error) {
      console.error('Error fetching homeowners:', error);
      setHomeownersError(error.message);
      setHomeownersLoading(false);
    }
  };

  const fetchPlnCategories = async () => {
    try {
      setPlnCategoriesLoading(true);
      const response = await fetch('/api/admin/tariffs/public/categories?scope=all');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setPlnCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching PLN categories:', error);
    } finally {
      setPlnCategoriesLoading(false);
    }
  };

  const fetchPlnSummary = async () => {
    try {
      setPlnSummaryLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/tariffs/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPlnSummary(data.data);
      }
    } catch (error) {
      console.error('Error fetching PLN summary:', error);
    } finally {
      setPlnSummaryLoading(false);
    }
  };

  const fetchPlnCurrentTariffs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/tariffs/current?scope=all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const map = {};
        json.data.forEach((it) => { map[it.name] = it.currentTariff; });
        setPlnCurrentTariffs(map);
      }
    } catch (err) {
      console.error('Error fetching current PLN tariffs:', err);
    }
  };

  useEffect(() => {
    // Fetch immediately on mount.
    fetchDashboardMetrics();
    fetchHomeowners();
    fetchPlnCategories();
    fetchPlnSummary();
    fetchPlnCurrentTariffs();

    // Poll metrics periodically to keep dashboard counters/charts updated.
    const pollingInterval = setInterval(() => {
      fetchDashboardMetrics();
    }, 10000);

    return () => clearInterval(pollingInterval);
  }, []);

  const handleDownloadPDF = (title, columns, data, filename) => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(title, 14, 15);

    // Calculate total if the data is numeric monthly series
    let total = 0;
    const isNumericData = data.length > 0 && typeof data[0][1] === 'number';

    if (isNumericData) {
      total = data.reduce((acc, row) => acc + (row[1] || 0), 0);
    }

    autoTable(doc, {
      head: [columns],
      body: data,
      foot: isNumericData ? [['TOTAL KESELURUHAN', total]] : null,
      startY: 25,
      styles: { fontSize: 9 },
      headStyles: { fillStyle: 'f', fillColor: [0, 155, 124], textColor: 255 },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
    });

    doc.save(`${filename}.pdf`);
  };

  const handleUpdateTariff = () => {
    setPlnTariff(newTariff);
    setShowPlnModal(false);
  };

  const PLN_SEGMENT_ORDER = [
    'Subsidi Rumah Tangga',
    'Rumah Tangga',
    'Bisnis',
    'Industri',
    'Pemerintah & PJU',
    'Pelayanan Sosial'
  ];
  const plnSegmentCounts = plnCategories.reduce((acc, c) => {
    const seg = c.segment || 'Lainnya';
    acc[seg] = (acc[seg] || 0) + 1;
    return acc;
  }, {});
  const plnSegmentSummary = PLN_SEGMENT_ORDER
    .filter((seg) => plnSegmentCounts[seg])
    .map((seg) => `${seg}: ${plnSegmentCounts[seg]}`)
    .join(' • ');
  const plnCategoriesGrouped = plnCategories.reduce((acc, c) => {
    const seg = c.segment || 'Lainnya';
    if (!acc[seg]) acc[seg] = [];
    acc[seg].push(c);
    return acc;
  }, {});

  const filteredCustomers = homeowners.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Semua Status' || cust.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + rowsPerPage);

  const instalasiChartData = createMonthlyChartData(metrics.monthlyInstalasi);
  const hubNodeChartData = createMonthlyChartData(metrics.monthlyHubs);
  const smartDeviceChartData = createMonthlyChartData(metrics.monthlyDevices);
  const pelangganChartData = createMonthlyChartData(metrics.monthlyPelanggan);
  const teknisiChartData = createMonthlyChartData(metrics.monthlyTechnicians);
  const pengaduanChartData = createMonthlyChartData(metrics.monthlyComplaints);

  // Derive counts from homeowners list to ensure consistency
  const activeHomeownersCount = homeowners.filter(h => h.status === 'Aktif').length;
  const warningHomeownersCount = homeowners.filter(h => h.status === 'Perhatian').length;
  const inactiveHomeownersCount = homeowners.filter(h => h.status === 'Nonaktif').length;
  const totalHomeownersCount = homeowners.length;

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
                  {homeownersLoading ? '-' : totalHomeownersCount}
                </h3>
                <p className="text-white/90 text-sm font-medium">Total Pelanggan</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 grid grid-cols-3 gap-2">
                <div className="text-center border-r border-white/10 last:border-0">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter mb-0.5">Aktif</p>
                  <p className="text-sm font-black text-white">{homeownersLoading ? '-' : activeHomeownersCount}</p>
                </div>
                <div className="text-center border-r border-white/10 last:border-0">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter mb-0.5">Perhatian</p>
                  <p className="text-sm font-black text-yellow-300">{homeownersLoading ? '-' : warningHomeownersCount}</p>
                </div>
                <div className="text-center last:border-0">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter mb-0.5">Nonaktif</p>
                  <p className="text-sm font-black text-red-300">{homeownersLoading ? '-' : inactiveHomeownersCount}</p>
                </div>
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
                {metrics.hubTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {metrics.hubTrend >= 0 ? '+' : ''}{metrics.hubTrend}% dari bulan lalu
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
                {metrics.deviceTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {metrics.deviceTrend >= 0 ? '+' : ''}{metrics.deviceTrend}% dari bulan lalu
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
                <AlertCircle className="w-4 h-4" /> {metricsLoading ? '-' : metrics.pendingComplaints} sistem butuh perhatian
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Technician Overview Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 relative">
                <User className="w-7 h-7" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full animate-pulse"></span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Live</p>
                <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs justify-end">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Online
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-4xl font-black text-gray-900 tracking-tight">
                {metricsLoading ? '-' : metrics.activeTechnicians || 0}
              </h3>
              <p className="text-sm font-bold text-gray-500 mt-1">Teknisi Aktif</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl w-fit">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                {metricsLoading ? '-' : `TOTAL ${metrics.totalTechnicians || 0}`}
              </div>
            </div>

            <button
              onClick={() => onNavigate && onNavigate('admin-teknisi')}
              className="mt-8 w-full py-3 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 font-bold rounded-2xl text-xs transition-all border border-transparent hover:border-emerald-100 flex items-center justify-center gap-2"
            >
              Manajemen Teknisi <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* PLN Tariff Management Center */}
          <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-orange-500 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-orange-100">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Sistem Tarif PLN</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-medium text-gray-500">Monitoring kategori golongan listrik</p>
                    {plnSummary?.latestUpdate && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">
                        <CheckCircle className="w-3 h-3" /> Updated: {plnSummary.latestUpdate.date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-1 rounded-2xl shadow-xl">
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">Total Kategori</p>
                    <p className="text-2xl font-black text-white leading-none">
                      {plnCategoriesLoading ? '-' : plnCategories.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Filter className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {PLN_SEGMENT_ORDER.map((seg) => (
                <div key={seg} className="relative group/item">
                  <div className="h-full flex flex-col bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-orange-200 rounded-2xl p-5 transition-all hover:shadow-md">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 line-clamp-2 min-h-[2.5em]">
                      {seg}
                    </p>
                    <div className="flex items-baseline gap-1 mt-auto">
                      <span className="text-2xl font-black text-gray-800">{plnSegmentCounts[seg] || 0}</span>
                      <span className="text-[10px] font-bold text-gray-400">GOLONGAN</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-gray-50 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowPlnCategoriesModal(true)}
                className="px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl text-sm flex items-center justify-center gap-3 transition-all border border-gray-200 hover:border-gray-300"
              >
                <Eye className="w-5 h-5 text-gray-400" /> Lihat Struktur Golongan
              </button>
              <button
                onClick={() => onNavigate && onNavigate('admin-tariff')}
                className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-3 shadow-xl shadow-orange-100 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    <span>Kelola Tarif & Golongan</span>
                  </div>
                  {plnSummary?.latestUpdate && (
                    <span className="text-[9px] opacity-70 font-medium mt-0.5">
                      Terakhir: {plnSummary.latestUpdate.category} (Rp {plnSummary.latestUpdate.tariff})
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Chart 1: Bar */}
          <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-[2.5rem] p-10 shadow-sm border border-emerald-100 relative overflow-hidden">
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00C698] to-[#00E5B1] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100 shrink-0">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Jumlah Instalasi BIEON</h3>
                  <p className="text-sm text-gray-600 mt-1">Per bulan dalam 1 tahun</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF("Laporan Instalasi BIEON", ["Bulan", "Jumlah"], metrics.monthlyInstalasi.map((v, i) => [MONTH_LABELS[i], v]), "Instalasi_BIEON")}
                className="p-3 bg-white border border-emerald-100 text-[#009b7c] hover:bg-emerald-50 rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
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
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100 shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Jumlah Hub Node</h3>
                  <p className="text-sm text-gray-600 mt-1">Per bulan dalam 1 tahun</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF("Laporan Hub Node BIEON", ["Bulan", "Jumlah"], metrics.monthlyHubs.map((v, i) => [MONTH_LABELS[i], v]), "Hub_Node_BIEON")}
                className="p-3 bg-white border border-teal-100 text-teal-600 hover:bg-teal-50 rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
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
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
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
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF("Laporan Smart Device BIEON", ["Bulan", "Jumlah"], metrics.monthlyDevices.map((v, i) => [MONTH_LABELS[i], v]), "Smart_Device_BIEON")}
                className="p-3 bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
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
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF("Laporan Pertumbuhan Pelanggan", ["Bulan", "Jumlah"], metrics.monthlyPelanggan.map((v, i) => [MONTH_LABELS[i], v]), "Data_Pelanggan")}
                className="p-3 bg-white border border-purple-100 text-purple-600 hover:bg-purple-50 rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-100 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Jumlah Teknisi</h3>
                  <p className="text-sm text-gray-600 mt-1">Laporan per bulan</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF("Laporan Penambahan Teknisi", ["Bulan", "Jumlah"], metrics.monthlyTechnicians.map((v, i) => [MONTH_LABELS[i], v]), "Data_Teknisi")}
                className="p-3 bg-white border border-orange-100 text-orange-600 hover:bg-orange-50 rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
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
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Jumlah Pengaduan Pelanggan</h3>
                  <p className="text-sm text-gray-600 mt-1">Laporan per bulan</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF("Laporan Pengaduan Pelanggan", ["Bulan", "Jumlah"], metrics.monthlyComplaints.map((v, i) => [MONTH_LABELS[i], v]), "Data_Pengaduan")}
                className="p-3 bg-white border border-red-100 text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
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

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-10 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Daftar Pelanggan Terdaftar</h2>
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
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center justify-between w-full md:w-auto min-w-[160px] px-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-600 hover:border-[#009b7c] hover:bg-emerald-50/30 transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#009b7c]" />
                    <span>{statusFilter}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showStatusDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-white rounded-2xl shadow-2xl border border-gray-50 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {['Semua Status', 'Aktif', 'Warning', 'Nonaktif'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setShowStatusDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${statusFilter === status
                            ? 'bg-[#009b7c] text-white shadow-lg shadow-emerald-100'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          {status}
                          {statusFilter === status && <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => handleDownloadPDF(
                  "Daftar Pelanggan Terdaftar BIEON",
                  ["User ID", "Nama", "Username", "Email", "Status", "BIEON", "Devices", "Teknisi"],
                  filteredCustomers.map(c => [c.id, c.name, c.username, c.email, c.status, c.bieonId, c.devices, c.technician]),
                  "Daftar_Pelanggan"
                )}
                className="flex items-center justify-center col-span-1 gap-2 px-6 py-3 bg-gradient-to-r from-[#009b7c] to-[#00c698] text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 uppercase tracking-widest"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gray-50/80 text-gray-500">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-left w-[25%]">Pelanggan</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-center w-[15%]">ID BIEON</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-center w-[15%]">Status Sistem</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-center w-[15%]">Nodes / Devices</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase tracking-widest text-left w-[20%]">Teknisi PJ</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center w-[10%]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-gray-50/50 transition-colors group border-b border-gray-50 last:border-0">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#009b7c] flex items-center justify-center font-black text-xs shadow-inner shrink-0">
                            {cust.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-[#009b7c] transition-colors truncate">{cust.name}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter truncate">{cust.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className="text-[11px] font-black text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm whitespace-nowrap">
                          {cust.bieonId}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-center">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black tracking-tight ${cust.status === 'Aktif' ? 'bg-[#EAFDF5] text-[#10b981] border border-[#10b981]/20' :
                            cust.status === 'Perhatian' ? 'bg-[#FFF9E6] text-[#f59e0b] border border-[#f59e0b]/20' :
                              'bg-[#FEF2F2] text-[#ef4444] border border-[#ef4444]/20'
                            }`}>
                            <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current animate-pulse"></span>
                            {cust.status === 'Perhatian' ? 'PERHATIAN' : cust.status.toUpperCase()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className="text-xs font-black text-gray-900">{cust.totalHubs} Hub / {cust.devices} Dev</span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <span className="text-[11px] font-bold text-gray-700 truncate max-w-[120px]">{cust.technician}</span>
                          </div>
                          {cust.fieldTeam && cust.fieldTeam.length > 0 && (
                            <div className="relative group/team inline-block w-fit">
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black tracking-tighter border border-blue-100 cursor-help transition-all hover:bg-blue-100">
                                <Users className="w-2.5 h-2.5" />
                                <span>+ {cust.fieldTeam.length} TIM LAPANGAN</span>
                              </div>
                              {/* Tooltip on Hover */}
                              <div className="absolute bottom-full left-0 mb-2 w-max max-w-[200px] bg-gray-900 text-white text-[9px] p-2 rounded-lg opacity-0 invisible group-hover/team:opacity-100 group-hover/team:visible transition-all z-50 shadow-xl pointer-events-none">
                                <p className="font-black border-b border-white/10 pb-1 mb-1 text-blue-400 uppercase tracking-widest">Tim Penanganan Aktif:</p>
                                <div className="space-y-1">
                                  {cust.fieldTeam.map((name, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                      {name}
                                    </div>
                                  ))}
                                </div>
                                <div className="absolute top-full left-4 -translate-y-1/2 border-8 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate('admin-pelanggan');
                              setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('openHomeownerDetail', { detail: cust.name }));
                              }, 100);
                            }
                          }}
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-[#009b7c] hover:bg-emerald-50 rounded-xl transition-all mx-auto"
                        >
                          <ChevronRight className="w-5 h-5" />
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
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((cust) => (
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
                      <p className="text-gray-500 mb-0.5">ID BIEON / Email</p>
                      <p className="font-semibold text-gray-900 truncate">{cust.bieonId} • {cust.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Nodes / Devices</p>
                      <p className="font-semibold text-gray-900">{cust.totalHubs} Hub / {cust.devices} Dev</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">Teknisi PJ</p>
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

          <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-100">
            {/* Rows Per Page - Left */}
            <div className="flex items-center gap-3 order-2 md:order-1">
              <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Rows:</span>
              <div className="relative">
                <button
                  onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold text-xs shadow-sm hover:border-[#009b7c]/30 transition-all"
                >
                  {rowsPerPage} <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showRowsDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowRowsDropdown(false)}></div>
                    <div className="absolute bottom-full left-0 mb-2 w-20 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-bottom-2">
                      {[5, 10, 30, 50].map(val => (
                        <button
                          key={val}
                          onClick={() => { setRowsPerPage(val); setShowRowsDropdown(false); setCurrentPage(1); }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold ${rowsPerPage === val ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Page Info - Center */}
            <div className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-center whitespace-nowrap order-1 md:order-2">
              <span className="md:hidden">rows </span>{totalItems > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems}<span className="hidden sm:inline"> items</span>
            </div>

            {/* Pagination Controls - Right */}
            <div className="flex items-center gap-2 md:gap-3 order-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 md:px-5 lg:px-6 md:py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] md:text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center min-w-[36px]"
              >
                <ChevronLeft className="w-4 h-4 md:hidden" />
                <span className="hidden md:inline lg:hidden">Prev</span>
                <span className="hidden lg:inline">Previous</span>
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 md:px-5 lg:px-6 md:py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] md:text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center min-w-[36px]"
              >
                <span className="hidden lg:inline">Next</span>
                <span className="hidden md:inline lg:hidden">Next</span>
                <ChevronRight className="w-4 h-4 md:hidden" />
              </button>
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

      {/* PLN Categories Modal */}
      {showPlnCategoriesModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPlnCategoriesModal(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="bg-gradient-to-r from-emerald-600 to-[#009b7c] px-8 py-6 text-white relative">
              <button
                onClick={() => setShowPlnCategoriesModal(false)}
                className="absolute top-6 right-6 w-10 h-10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                  <Filter className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Daftar Golongan PLN</h2>
                  <p className="text-white/80 font-medium text-xs mt-1">
                    {plnCategoriesLoading
                      ? 'Memuat...'
                      : `${plnCategories.length} kategori tersedia`}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto modal-custom-scrollbar">
              {PLN_SEGMENT_ORDER.filter((seg) => plnCategoriesGrouped[seg]?.length).map((seg) => (
                <div key={seg} className="mb-6">
                  <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    {seg} ({plnCategoriesGrouped[seg].length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plnCategoriesGrouped[seg].map((cat) => (
                      <div key={cat.key || cat.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                        <div className="text-sm font-extrabold text-gray-800 leading-snug">
                          {cat.label}
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {cat.segment || 'Lainnya'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(plnCategoriesGrouped).filter((seg) => !PLN_SEGMENT_ORDER.includes(seg)).map((seg) => (
                <div key={seg} className="mb-6">
                  <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    {seg} ({plnCategoriesGrouped[seg].length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plnCategoriesGrouped[seg].map((cat) => (
                      <div key={cat.key || cat.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                        <div className="text-sm font-extrabold text-gray-800 leading-snug">
                          {cat.label}
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {cat.segment || 'Lainnya'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-50 flex justify-end">
              <button
                onClick={() => setShowPlnCategoriesModal(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
