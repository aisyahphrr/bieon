import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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



const createCustomerStatusLabel = (status, t) => {
  const s = status?.toLowerCase() || 'aktif';
  if (s === 'nonaktif') return t('admin_dashboard.metrics.inactive');
  if (s === 'warning') return t('admin_dashboard.metrics.warning');
  return t('admin_dashboard.metrics.active');
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
  const { t, i18n } = useTranslation();

  // Dynamic month labels based on current language
  const MONTH_LABELS = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      return new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(new Date(2024, i, 1));
    });
  }, [i18n.language]);

  const createMonthlyChartData = (values = []) => MONTH_LABELS.map((name, index) => ({
    name,
    value: values?.[index] || 0,
  }));

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
  const [statusFilter, setStatusFilter] = useState('all'); // Store key instead of string
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
          rawStatus: homeowner.status?.toLowerCase() || 'aktif',
          status: createCustomerStatusLabel(homeowner.status, t),
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
      foot: isNumericData ? [[t('admin_dashboard.export.footer_total'), total]] : null,
      startY: 25,
      styles: { fontSize: 9 },
      headStyles: { fillStyle: 'f', fillColor: [5, 155, 39], textColor: 255 },
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

  const filteredCustomers = useMemo(() => {
    return homeowners.filter(cust => {
      const matchesSearch =
        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.bieonId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'aktif' && cust.rawStatus === 'aktif') ||
        (statusFilter === 'warning' && cust.rawStatus === 'warning') ||
        (statusFilter === 'nonaktif' && cust.rawStatus === 'nonaktif');

      return matchesSearch && matchesStatus;
    });
  }, [homeowners, searchQuery, statusFilter]);

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
  const plnSegmentThemes = [
    'from-bieon-sense/15 to-white border-bieon-sense/20 text-bieon-sense',
    'from-bieon-eco/15 to-white border-bieon-eco/20 text-bieon-eco',
    'from-cyan-100/70 to-white border-cyan-200/70 text-cyan-700',
    'from-bieon-eco/10 to-white border-bieon-sense/25 text-bieon-eco',
    'from-sky-100/70 to-white border-sky-200/70 text-sky-700',
    'from-lime-100/70 to-white border-lime-200/70 text-lime-700',
  ];

  return (
    <SuperAdminLayout activeMenu="Dashboard" onNavigate={onNavigate} title="Super Admin Dashboard">
      {/* Dashboard Content */}
      <main className="space-y-8">
        {/* Stats Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-[#129cc0] via-[#0f92b4] to-[#0b7f9d] rounded-[2.5rem] p-6 shadow-[0_18px_38px_-18px_rgba(18,156,192,0.55)] relative overflow-hidden group hover:scale-[1.02] transition-all text-white min-h-[215px] flex flex-col justify-between">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.22),transparent_42%,rgba(255,255,255,0.08))] opacity-70"></div>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2 ml-4">
                  {homeownersLoading ? '-' : totalHomeownersCount}
                </h3>
                <p className="text-white/90 text-sm font-medium">{t('admin_dashboard.metrics.total_customers')}</p>
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 grid grid-cols-3 gap-2">
                <div className="text-center border-r border-white/10 last:border-0">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter mb-0.5">{t('admin_dashboard.metrics.active')}</p>
                  <p className="text-sm font-black text-white">{homeownersLoading ? '-' : activeHomeownersCount}</p>
                </div>
                <div className="text-center border-r border-white/10 last:border-0">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter mb-0.5">{t('admin_dashboard.metrics.warning')}</p>
                  <p className="text-sm font-black text-yellow-300">{homeownersLoading ? '-' : warningHomeownersCount}</p>
                </div>
                <div className="text-center last:border-0">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter mb-0.5">{t('admin_dashboard.metrics.inactive')}</p>
                  <p className="text-sm font-black text-red-300">{homeownersLoading ? '-' : inactiveHomeownersCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#059b27] via-[#05a936] to-[#04b84a] rounded-[2.5rem] p-6 shadow-[0_18px_38px_-18px_rgba(5,155,39,0.55)] relative overflow-hidden group hover:scale-[1.02] transition-all text-white min-h-[215px] flex flex-col justify-between">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.22),transparent_42%,rgba(255,255,255,0.08))] opacity-70"></div>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Box className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2 ml-4">
                  {metricsLoading ? '-' : metrics.totalHubs}
                </h3>
                <p className="text-white/90 text-sm font-medium">{t('admin_dashboard.metrics.bieon_nodes')}</p>
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-xl inline-flex items-center gap-2 text-xs font-medium">
                {metrics.hubTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {metrics.hubTrend >= 0 ? '+' : ''}{t('admin_dashboard.metrics.trend_monthly', { percent: metrics.hubTrend })}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#129cc0] via-[#0f92b4] to-[#0b7f9d] rounded-[2.5rem] p-6 shadow-[0_18px_38px_-18px_rgba(18,156,192,0.55)] relative overflow-hidden group hover:scale-[1.02] transition-all text-white min-h-[215px] flex flex-col justify-between">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.22),transparent_42%,rgba(255,255,255,0.08))] opacity-70"></div>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2 ml-4">
                  {metricsLoading ? '-' : metrics.totalDevices}
                </h3>
                <p className="text-white/90 text-sm font-medium">{t('admin_dashboard.metrics.smart_devices')}</p>
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-xl inline-flex items-center gap-2 text-xs font-medium">
                {metrics.deviceTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {metrics.deviceTrend >= 0 ? '+' : ''}{t('admin_dashboard.metrics.trend_monthly', { percent: metrics.deviceTrend })}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#059b27] via-[#05a936] to-[#04b84a] rounded-[2.5rem] p-6 shadow-[0_18px_38px_-18px_rgba(5,155,39,0.55)] relative overflow-hidden group hover:scale-[1.02] transition-all text-white min-h-[215px] flex flex-col justify-between">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.22),transparent_42%,rgba(255,255,255,0.08))] opacity-70"></div>
            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-[2.5rem] leading-none font-bold text-white mb-2 ml-4">
                  {metricsLoading ? '-' : metrics.totalComplaints}
                </h3>
                <p className="text-white/90 text-sm font-medium">{t('admin_dashboard.metrics.total_complaints')}</p>
              </div>
            </div>
            <div className="mt-4 relative z-10">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-xl inline-flex items-center gap-2 text-xs font-medium text-white">
                <AlertCircle className="w-4 h-4" /> {t('admin_dashboard.metrics.pending_alert', { count: metricsLoading ? '-' : metrics.pendingComplaints })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Technician Overview Card */}
          <div className="bg-gradient-to-br from-white via-bieon-eco/5 to-bieon-sense/10 rounded-[2.5rem] p-8 shadow-sm shadow-bieon-sense/10 border border-bieon-eco/15 flex flex-col hover:shadow-xl hover:shadow-bieon-sense/15 transition-all group relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-bieon-eco to-bieon-sense"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-bieon-eco/15 to-bieon-sense/15 rounded-2xl flex items-center justify-center text-bieon-eco relative shadow-inner border border-white/70">
                <User className="w-7 h-7" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-bieon-sense border-4 border-white rounded-full animate-pulse"></span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('admin_dashboard.metrics.live_status')}</p>
                <div className="flex items-center gap-1 text-bieon-eco font-bold text-xs justify-end">
                  <div className="w-1.5 h-1.5 bg-bieon-sense rounded-full"></div> {t('admin_dashboard.metrics.online')}
                </div>
              </div>
            </div>

            <div className="flex-1 relative z-10">
              <h3 className="text-4xl font-black text-gray-900 tracking-tight">
                {metricsLoading ? '-' : metrics.activeTechnicians || 0}
              </h3>
              <p className="text-sm font-bold text-gray-500 mt-1">{t('admin_dashboard.metrics.active_technicians')}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-500 bg-bieon-eco/5 px-3 py-1.5 rounded-xl w-fit">
                <TrendingUp className="w-3 h-3 text-bieon-eco" />
                {metricsLoading ? '-' : t('admin_dashboard.metrics.total_count', { count: metrics.totalTechnicians || 0 })}
              </div>
            </div>

            <button
              onClick={() => onNavigate && onNavigate('admin-teknisi')}
              className="mt-8 w-full py-3 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white font-bold rounded-2xl text-xs transition-all border border-transparent flex items-center justify-center gap-2 shadow-lg shadow-bieon-sense/15 hover:shadow-bieon-sense/25"
            >
              {t('admin_dashboard.metrics.btn_manage_tech')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* PLN Tariff Management Center */}
          <div className="lg:col-span-3 bg-gradient-to-br from-white via-bieon-sense/5 to-bieon-eco/10 rounded-[2.5rem] p-8 shadow-sm shadow-bieon-eco/10 border border-bieon-sense/15 flex flex-col hover:shadow-xl hover:shadow-bieon-eco/15 transition-all relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-bieon-sense via-bieon-eco to-bieon-sense"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-bieon-eco to-bieon-sense rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-bieon-sense/25">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{t('admin_dashboard.tariff_summary.title')}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-medium text-gray-500">{t('admin_dashboard.tariff_summary.subtitle')}</p>
                    {plnSummary?.latestUpdate && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-bieon-eco/10 text-bieon-eco text-[10px] font-bold rounded-full border border-bieon-sense/20">
                        <CheckCircle className="w-3 h-3" /> {t('admin_dashboard.tariff_summary.updated', { date: plnSummary.latestUpdate.date })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-bieon-eco to-bieon-sense p-1 rounded-2xl shadow-xl shadow-bieon-sense/20">
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">{t('admin_dashboard.tariff_summary.total_categories')}</p>
                    <p className="text-2xl font-black text-white leading-none">
                      {plnCategoriesLoading ? '-' : plnCategories.length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 relative z-10">
              {PLN_SEGMENT_ORDER.map((seg, index) => (
                <div key={seg} className={`bg-gradient-to-br ${plnSegmentThemes[index % plnSegmentThemes.length]} rounded-3xl p-6 border shadow-sm hover:shadow-lg transition-all flex flex-col min-h-[160px] relative overflow-hidden`}>
                  <div className="absolute inset-x-0 top-0 h-1 bg-current opacity-70"></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 line-clamp-2 min-h-[2.5em]">
                      {seg === 'Subsidi Rumah Tangga' ? t('admin_dashboard.pln_segments.subsidy') :
                        seg === 'Rumah Tangga' ? t('admin_dashboard.pln_segments.residential') :
                          seg === 'Bisnis' ? t('admin_dashboard.pln_segments.business') :
                            seg === 'Industri' ? t('admin_dashboard.pln_segments.industrial') :
                              seg === 'Pemerintah & PJU' ? t('admin_dashboard.pln_segments.government') :
                                seg === 'Pelayanan Sosial' ? t('admin_dashboard.pln_segments.social') : seg}
                    </p>
                    <div className="flex items-baseline gap-1 mt-auto">
                      <span className="text-2xl font-black text-gray-900">{plnSegmentCounts[seg] || 0}</span>
                      <span className="text-[10px] font-bold text-gray-400">{t('admin_dashboard.tariff_summary.group_suffix', { count: '' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-white/70 flex flex-col sm:flex-row gap-4 relative z-10">
              <button
                onClick={() => setShowPlnCategoriesModal(true)}
                className="px-6 py-4 bg-white hover:bg-bieon-eco/5 text-bieon-eco font-bold rounded-2xl text-sm flex items-center justify-center gap-3 transition-all border border-bieon-eco/15 hover:border-bieon-sense/40"
              >
                <Eye className="w-5 h-5 text-bieon-eco" /> {t('admin_dashboard.tariff_summary.btn_view_structure')}
              </button>
              <button
                onClick={() => onNavigate && onNavigate('admin-tariff')}
                className="flex-1 py-4 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-3 shadow-xl shadow-bieon-sense/15 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    <span>{t('admin_dashboard.tariff_summary.btn_manage_tariff')}</span>
                  </div>
                  {plnSummary?.latestUpdate && (
                    <span className="text-[9px] opacity-70 font-medium mt-0.5">
                      {t('admin_dashboard.tariff_summary.last_update', { type: plnSummary.latestUpdate.category, price: `Rp ${plnSummary.latestUpdate.tariff}` })}
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
          <div className="bg-gradient-to-br from-white via-bieon-eco/5 to-bieon-sense/10 rounded-[2.5rem] p-10 shadow-sm shadow-bieon-eco/10 border border-bieon-eco/15 relative overflow-hidden hover:shadow-xl hover:shadow-bieon-eco/10 transition-all">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-bieon-eco to-bieon-sense"></div>
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-bieon-eco to-bieon-sense rounded-2xl flex items-center justify-center text-white shadow-xl shadow-bieon-sense/25 shrink-0">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{t('admin_dashboard.charts.bieon_installation_title')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('admin_dashboard.charts.bieon_installation_sub')}</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF(t('admin_dashboard.charts.bieon_installation_title'), [t('admin_dashboard.export.col_month'), t('admin_dashboard.export.col_amount')], metrics.monthlyInstalasi.map((v, i) => [MONTH_LABELS[i], v]), t('admin_dashboard.export.filename_installation'))}
                className="p-3 bg-white border border-bieon-eco/15 text-bieon-eco hover:bg-bieon-eco/5 rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={instalasiChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorBieonBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059b27" stopOpacity={1} />
                      <stop offset="100%" stopColor="#129cc0" stopOpacity={0.8} />
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
          <div className="bg-gradient-to-br from-white via-bieon-sense/5 to-cyan-100/50 rounded-[2.5rem] p-10 shadow-sm shadow-bieon-sense/10 border border-bieon-sense/15 relative overflow-hidden hover:shadow-xl hover:shadow-bieon-sense/10 transition-all">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-bieon-sense to-cyan-300"></div>
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-bieon-eco to-bieon-sense rounded-2xl flex items-center justify-center text-white shadow-xl shadow-bieon-sense/25 shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{t('admin_dashboard.charts.hub_node_title')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('admin_dashboard.charts.hub_node_sub')}</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF(t('admin_dashboard.charts.hub_node_title'), [t('admin_dashboard.export.col_month'), t('admin_dashboard.export.col_amount')], metrics.monthlyHubs.map((v, i) => [MONTH_LABELS[i], v]), t('admin_dashboard.export.filename_hub'))}
                className="p-3 bg-white border border-bieon-sense/15 text-bieon-sense hover:bg-bieon-sense/5 rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hubNodeChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorHubBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059b27" stopOpacity={1} />
                      <stop offset="100%" stopColor="#129cc0" stopOpacity={0.8} />
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
          <div className="bg-gradient-to-br from-white via-bieon-eco/5 to-bieon-eco/10 rounded-[2.5rem] p-10 shadow-sm shadow-bieon-eco/10 border border-bieon-eco/15 relative overflow-hidden hover:shadow-xl hover:shadow-bieon-eco/10 transition-all">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-bieon-eco to-bieon-eco"></div>
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-bieon-eco to-bieon-sense rounded-2xl flex items-center justify-center text-white shadow-xl shadow-bieon-sense/25 shrink-0">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{t('admin_dashboard.charts.smart_device_title')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('admin_dashboard.charts.smart_device_sub')}</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF(t('admin_dashboard.charts.smart_device_title'), [t('admin_dashboard.export.col_month'), t('admin_dashboard.export.col_amount')], metrics.monthlyDevices.map((v, i) => [MONTH_LABELS[i], v]), t('admin_dashboard.export.filename_device'))}
                className="p-3 bg-white border border-bieon-eco/15 text-bieon-eco hover:bg-bieon-eco/5 rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={smartDeviceChartData}>
                  <defs>
                    <linearGradient id="colorDeviceBg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#129cc0" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#129cc0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDeviceLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#059b27" stopOpacity={1} />
                      <stop offset="100%" stopColor="#129cc0" stopOpacity={1} />
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
          <div className="bg-gradient-to-br from-white via-bieon-sense/5 to-sky-100/50 rounded-[2.5rem] p-10 shadow-sm shadow-bieon-sense/10 border border-bieon-sense/15 relative overflow-hidden hover:shadow-xl hover:shadow-bieon-sense/10 transition-all">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-bieon-sense to-sky-300"></div>
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-bieon-eco to-bieon-sense rounded-2xl flex items-center justify-center text-white shadow-xl shadow-bieon-sense/20 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{t('admin_dashboard.charts.customer_growth_title')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('admin_dashboard.charts.customer_growth_sub')}</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF(t('admin_dashboard.charts.customer_growth_title'), [t('admin_dashboard.export.col_month'), t('admin_dashboard.export.col_amount')], metrics.monthlyPelanggan.map((v, i) => [MONTH_LABELS[i], v]), t('admin_dashboard.export.filename_customer'))}
                className="p-3 bg-white border border-bieon-sense/15 text-bieon-sense hover:bg-bieon-sense/5 rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pelangganChartData}>
                  <defs>
                    <linearGradient id="colorPelangganLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#059b27" stopOpacity={1} />
                      <stop offset="100%" stopColor="#129cc0" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="url(#colorPelangganLine)" strokeWidth={4} dot={{ fill: '#129cc0', strokeWidth: 3, r: 5, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Line */}
          <div className="bg-gradient-to-br from-white via-bieon-eco/5 to-lime-100/50 rounded-[2.5rem] p-10 shadow-sm shadow-bieon-eco/10 border border-bieon-eco/15 relative overflow-hidden hover:shadow-xl hover:shadow-bieon-eco/10 transition-all">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-bieon-eco to-lime-300"></div>
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-bieon-eco to-bieon-sense rounded-2xl flex items-center justify-center text-white shadow-xl shadow-bieon-eco/20 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{t('admin_dashboard.charts.tech_growth_title')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('admin_dashboard.charts.tech_growth_sub')}</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF(t('admin_dashboard.charts.tech_growth_title'), [t('admin_dashboard.export.col_month'), t('admin_dashboard.export.col_amount')], metrics.monthlyTechnicians.map((v, i) => [MONTH_LABELS[i], v]), t('admin_dashboard.export.filename_tech'))}
                className="p-3 bg-white border border-bieon-eco/15 text-bieon-eco hover:bg-bieon-eco/5 rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={teknisiChartData}>
                  <defs>
                    <linearGradient id="colorTeknisiLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#059b27" stopOpacity={1} />
                      <stop offset="100%" stopColor="#129cc0" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="url(#colorTeknisiLine)" strokeWidth={4} dot={{ fill: '#059b27', strokeWidth: 3, r: 5, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Line */}
          <div className="bg-gradient-to-br from-white via-bieon-sense/5 to-bieon-sense/10 rounded-[2.5rem] p-10 shadow-sm shadow-bieon-sense/10 border border-bieon-sense/15 relative overflow-hidden hover:shadow-xl hover:shadow-bieon-sense/10 transition-all">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-bieon-sense to-bieon-sense"></div>
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-bieon-eco to-bieon-sense rounded-2xl flex items-center justify-center text-white shadow-xl shadow-bieon-sense/20 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{t('admin_dashboard.charts.complaint_growth_title')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('admin_dashboard.charts.complaint_growth_sub')}</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF(t('admin_dashboard.charts.complaint_growth_title'), [t('admin_dashboard.export.col_month'), t('admin_dashboard.export.col_amount')], metrics.monthlyComplaints.map((v, i) => [MONTH_LABELS[i], v]), t('admin_dashboard.export.filename_complaint'))}
                className="p-3 bg-white border border-bieon-sense/15 text-bieon-sense hover:bg-bieon-sense/5 rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pengaduanChartData}>
                  <defs>
                    <linearGradient id="colorPengaduanLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#059b27" stopOpacity={1} />
                      <stop offset="100%" stopColor="#129cc0" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="url(#colorPengaduanLine)" strokeWidth={4} dot={{ fill: '#129cc0', strokeWidth: 3, r: 5, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white via-bieon-sense/5 to-bieon-eco/5 rounded-[2.5rem] shadow-sm shadow-bieon-sense/10 border border-bieon-sense/15 overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-bieon-sense via-bieon-eco to-bieon-sense"></div>
          <div className="p-6 md:p-10 border-b border-white/70 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-bieon-sense mb-2">ECO SENSE</p>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">{t('admin_dashboard.table.title')}</h2>
            </div>
            <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative group col-span-2 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-bieon-eco transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('admin_dashboard.table.search_placeholder')}
                  className="w-full pl-11 pr-4 py-3 bg-white/80 border border-bieon-eco/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bieon-eco focus:bg-white text-xs transition-all shadow-sm"
                />
              </div>
              <div className="relative col-span-1">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center justify-between w-full md:w-auto min-w-[160px] px-5 py-3 bg-white border border-bieon-eco/15 rounded-2xl text-xs font-black text-gray-600 hover:border-bieon-eco hover:bg-bieon-eco/5 transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-gray-400 group-hover:text-bieon-eco" />
                    <span>
                      {statusFilter === 'all' ? t('admin_dashboard.table.filter_all') :
                        statusFilter === 'aktif' ? t('admin_dashboard.table.filter_active') :
                          statusFilter === 'warning' ? t('admin_dashboard.table.filter_warning') :
                            t('admin_dashboard.table.filter_inactive')}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showStatusDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-white rounded-2xl shadow-2xl border border-gray-50 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {[
                        { key: 'all', label: t('admin_dashboard.table.filter_all') },
                        { key: 'aktif', label: t('admin_dashboard.table.filter_active') },
                        { key: 'warning', label: t('admin_dashboard.table.filter_warning') },
                        { key: 'nonaktif', label: t('admin_dashboard.table.filter_inactive') }
                      ].map((status) => (
                        <button
                          key={status.key}
                          onClick={() => {
                            setStatusFilter(status.key);
                            setShowStatusDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${statusFilter === status.key
                            ? 'bg-gradient-to-r from-bieon-eco to-bieon-sense text-white shadow-lg shadow-bieon-sense/15'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          {status.label}
                          {statusFilter === status.key && <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => handleDownloadPDF(
                  t('admin_dashboard.export.title_table'),
                  [t('admin_dashboard.export.col_userid'), t('admin_dashboard.export.col_name'), t('admin_dashboard.export.col_username'), t('admin_dashboard.export.col_email'), t('admin_dashboard.export.col_status'), t('admin_dashboard.export.col_bieon'), t('admin_dashboard.export.col_devices'), t('admin_dashboard.export.col_technician')],
                  filteredCustomers.map(c => [c.id, c.name, c.username, c.email, c.status, c.bieonId, c.devices, c.technician]),
                  t('admin_dashboard.export.filename_table')
                )}
                className="flex items-center justify-center col-span-1 gap-2 px-6 py-3 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-2xl text-xs font-black shadow-lg shadow-bieon-sense/15 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 uppercase tracking-widest"
              >
                <Download className="w-4 h-4" /> {t('admin_dashboard.table.btn_export')}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto hidden md:block relative z-10">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gradient-to-r from-bieon-sense/10 via-white to-bieon-eco/10 text-gray-600">
                <tr>
                  <th className="px-8 py-5 text-[12px] font-black uppercase tracking-widest text-left w-[25%]">{t('admin_dashboard.table.col_customer')}</th>
                  <th className="px-4 py-5 text-[12px] font-black uppercase tracking-widest text-center w-[15%]">{t('admin_dashboard.table.col_bieon_id')}</th>
                  <th className="px-4 py-5 text-[12px] font-black uppercase tracking-widest text-center w-[15%]">{t('admin_dashboard.table.col_status')}</th>
                  <th className="px-4 py-5 text-[12px] font-black uppercase tracking-widest text-center w-[15%]">{t('admin_dashboard.table.col_nodes_devices')}</th>
                  <th className="px-4 py-5 text-[12px] font-black uppercase tracking-widest text-left w-[20%]">{t('admin_dashboard.table.col_tech')}</th>
                  <th className="px-8 py-5 text-[12px] font-black uppercase tracking-widest text-center w-[10%]">{t('admin_dashboard.table.col_action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-white/80 transition-colors group border-b border-white/70 last:border-0">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-bieon-eco/15 to-bieon-sense/15 text-bieon-eco flex items-center justify-center font-black text-xs shadow-inner shrink-0 border border-white">
                            {cust.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-bieon-eco transition-colors truncate">{cust.name}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter truncate">{cust.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className="text-[11px] font-black text-slate-600 bg-white/80 px-3.5 py-2 rounded-xl border border-bieon-sense/10 shadow-sm whitespace-nowrap">
                          {cust.bieonId}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-center">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black tracking-tight ${cust.rawStatus === 'aktif' ? 'bg-bieon-eco/10 text-bieon-eco border border-bieon-sense/20' :
                            cust.rawStatus === 'warning' ? 'bg-[#FFF9E6] text-[#f59e0b] border border-[#f59e0b]/20' :
                              'bg-[#FEF2F2] text-[#ef4444] border border-[#ef4444]/20'
                            }`}>
                            <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current animate-pulse"></span>
                            {cust.status.toUpperCase()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className="text-xs font-black text-gray-900">{t('admin_dashboard.table.val_format', { hub: cust.totalHubs, dev: cust.devices })}</span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-bieon-eco/15 to-bieon-sense/15 flex items-center justify-center shrink-0">
                              <User className="w-3.5 h-3.5 text-bieon-eco" />
                            </div>
                            <span className="text-[11px] font-bold text-gray-700 truncate max-w-[120px]">{cust.technician}</span>
                          </div>
                          {cust.fieldTeam && cust.fieldTeam.length > 0 && (
                            <div className="relative group/team inline-block w-fit">
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-bieon-eco/10 text-bieon-eco rounded-md text-[9px] font-black tracking-tighter border border-bieon-eco/15 cursor-help transition-all hover:bg-bieon-eco/15">
                                <Users className="w-2.5 h-2.5" />
                                <span>+ {cust.fieldTeam.length} {t('admin_dashboard.modals.sec_field_team').toUpperCase().replace(':', '')}</span>
                              </div>
                              {/* Tooltip on Hover */}
                              <div className="absolute bottom-full left-0 mb-2 w-max max-w-[200px] bg-gray-900 text-white text-[9px] p-2 rounded-lg opacity-0 invisible group-hover/team:opacity-100 group-hover/team:visible transition-all z-50 shadow-xl pointer-events-none">
                                <p className="font-black border-b border-white/10 pb-1 mb-1 text-bieon-sense uppercase tracking-widest">{t('admin_dashboard.modals.sec_field_team')}</p>
                                <div className="space-y-1">
                                  {cust.fieldTeam.map((name, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                      <div className="w-1 h-1 bg-bieon-sense rounded-full"></div>
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
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-bieon-eco hover:bg-bieon-eco/10 rounded-xl transition-all mx-auto"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 text-sm font-medium">
                      {t('admin_dashboard.table.empty_msg')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden divide-y divide-white/70 relative z-10">
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((cust) => (
                <div key={cust.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{cust.name}</h3>
                      <p className="text-xs text-gray-500">{cust.username}</p>
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${cust.rawStatus === 'aktif' ? 'bg-bieon-eco/10 text-bieon-eco' :
                      cust.rawStatus === 'warning' ? 'bg-[#FFF9E6] text-[#f59e0b]' :
                        'bg-[#FEF2F2] text-[#ef4444]'
                      }`}>
                      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"></span>
                      {cust.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs border-y border-gray-50 py-3">
                    <div>
                      <p className="text-gray-500 mb-0.5">{t('admin_dashboard.export.col_userid')}</p>
                      <p className="font-semibold text-gray-900">{cust.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">{t('admin_dashboard.table.col_bieon_id')} / Email</p>
                      <p className="font-semibold text-gray-900 truncate">{cust.bieonId} • {cust.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">{t('admin_dashboard.table.col_nodes_devices')}</p>
                      <p className="font-semibold text-gray-900">{t('admin_dashboard.table.val_format', { hub: cust.totalHubs, dev: cust.devices })}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-0.5">{t('admin_dashboard.table.col_tech')}</p>
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    <Eye className="w-4 h-4" /> {t('admin_homeowner.table.btn_detail', 'Detail Pelanggan')}
                  </button>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500 text-sm font-medium">
                {t('admin_dashboard.table.empty_msg')}
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 bg-gradient-to-r from-bieon-sense/5 to-bieon-eco/5 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/70 relative z-10">
            {/* Rows Per Page - Left */}
            <div className="flex items-center gap-3 order-2 md:order-1">
              <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{t('admin_dashboard.table.rows_per_page')}</span>
              <div className="relative">
                <button
                  onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold text-xs shadow-sm hover:border-bieon-eco/30 transition-all"
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
                          className={`w-full text-left px-4 py-2 text-xs font-bold ${rowsPerPage === val ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-500 hover:bg-gray-50'}`}
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
              <span className="md:hidden">rows </span>{totalItems > 0 ? t('admin_dashboard.table.pagination_info', { start: startIndex + 1, end: Math.min(startIndex + rowsPerPage, totalItems), total: totalItems }) : 0}
            </div>

            {/* Pagination Controls - Right */}
            <div className="flex items-center gap-2 md:gap-3 order-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 md:px-5 lg:px-6 md:py-2.5 bg-white border border-bieon-sense/10 rounded-xl text-[10px] md:text-[11px] font-black text-gray-700 hover:bg-bieon-sense/5 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center min-w-[36px]"
              >
                <ChevronLeft className="w-4 h-4 md:hidden" />
                <span className="hidden md:inline lg:hidden">{t('history.previous', 'Sebelumnya')}</span>
                <span className="hidden lg:inline">{t('history.previous', 'Sebelumnya')}</span>
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 md:px-5 lg:px-6 md:py-2.5 bg-white border border-bieon-eco/10 rounded-xl text-[10px] md:text-[11px] font-black text-gray-700 hover:bg-bieon-eco/5 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center min-w-[36px]"
              >
                <span className="hidden lg:inline">{t('history.next', 'Selanjutnya')}</span>
                <span className="hidden md:inline lg:hidden">{t('history.next', 'Selanjutnya')}</span>
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
            <div className="bg-gradient-to-r from-bieon-eco to-bieon-sense px-8 py-6 text-white relative">
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
                  <h2 className="text-2xl font-bold tracking-tight">{t('admin_dashboard.modals.update_tariff_title')}</h2>
                  <p className="text-white/80 font-medium text-xs mt-1">{t('admin_dashboard.modals.update_tariff_desc')}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-7">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_dashboard.modals.lbl_current')}</label>
                <div className="bg-gradient-to-r from-bieon-sense/5 to-bieon-eco/5 rounded-2xl p-6 border border-bieon-sense/10 flex items-baseline gap-3 shadow-sm">
                  <div className="text-4xl font-bold text-gray-900 leading-none">Rp {plnTariff}</div>
                  <p className="text-sm text-gray-500 font-medium">{t('admin_dashboard.modals.lbl_per_kwh')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 ml-1">{t('admin_dashboard.modals.lbl_new')} <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xl group-focus-within:text-bieon-eco transition-colors">Rp</span>
                  <input
                    type="number"
                    value={newTariff}
                    onChange={(e) => setNewTariff(e.target.value)}
                    className="w-full pl-14 pr-20 py-4 bg-white border border-gray-200 rounded-2xl text-xl font-bold text-gray-900 focus:outline-none focus:border-bieon-eco focus:ring-4 focus:ring-bieon-eco/10 transition-all shadow-sm"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-semibold text-gray-400 text-sm group-focus-within:text-bieon-sense transition-colors">/ kWh</span>
                </div>
                <div className="flex items-start gap-2 px-1 pt-1">
                  <AlertCircle className="w-4 h-4 text-bieon-sense flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {t('admin_dashboard.modals.help_tariff')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-50">
                <button
                  onClick={() => setShowPlnModal(false)}
                  className="w-full sm:flex-1 py-3.5 border border-bieon-sense/15 text-gray-600 font-semibold rounded-xl hover:bg-bieon-sense/5 transition-all"
                >
                  {t('admin_homeowner.form_modal.btn_cancel')}
                </button>
                <button
                  onClick={handleUpdateTariff}
                  className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white font-semibold rounded-xl shadow-lg shadow-bieon-sense/20 hover:shadow-bieon-sense/30 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t('admin_dashboard.modals.btn_save')}</span>
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
            <div className="bg-gradient-to-r from-bieon-eco to-bieon-sense px-8 py-6 text-white relative">
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
                  <h2 className="text-2xl font-bold tracking-tight">{t('admin_dashboard.modals.cat_list_title')}</h2>
                  <p className="text-white/80 font-medium text-xs mt-1">
                    {plnCategoriesLoading
                      ? '...'
                      : t('admin_dashboard.modals.cat_list_count', { count: plnCategories.length })}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto modal-custom-scrollbar">
              {PLN_SEGMENT_ORDER.filter((seg) => plnCategoriesGrouped[seg]?.length).map((seg) => {
                const localizedSeg =
                  seg === 'Subsidi Rumah Tangga' ? t('admin_dashboard.pln_segments.subsidy') :
                    seg === 'Rumah Tangga' ? t('admin_dashboard.pln_segments.residential') :
                      seg === 'Bisnis' ? t('admin_dashboard.pln_segments.business') :
                        seg === 'Industri' ? t('admin_dashboard.pln_segments.industrial') :
                          seg === 'Pemerintah & PJU' ? t('admin_dashboard.pln_segments.government') :
                            seg === 'Pelayanan Sosial' ? t('admin_dashboard.pln_segments.social') : seg;

                return (
                  <div key={seg} className="mb-6">
                    <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                      {localizedSeg} ({plnCategoriesGrouped[seg].length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plnCategoriesGrouped[seg].map((cat) => (
                        <div key={cat.key || cat.label} className="bg-gradient-to-br from-white to-bieon-sense/5 border border-bieon-sense/10 rounded-2xl p-4 shadow-sm">
                          <div className="text-sm font-extrabold text-gray-800 leading-snug">
                            {cat.label}
                          </div>
                          <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {localizedSeg || t('admin_dashboard.pln_segments.others')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {Object.keys(plnCategoriesGrouped).filter((seg) => !PLN_SEGMENT_ORDER.includes(seg)).map((seg) => (
                <div key={seg} className="mb-6">
                  <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    {seg} ({plnCategoriesGrouped[seg].length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plnCategoriesGrouped[seg].map((cat) => (
                      <div key={cat.key || cat.label} className="bg-gradient-to-br from-white to-bieon-eco/5 border border-bieon-eco/10 rounded-2xl p-4 shadow-sm">
                        <div className="text-sm font-extrabold text-gray-800 leading-snug">
                          {cat.label}
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {seg || t('admin_dashboard.pln_segments.others')}
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
                className="px-5 py-2.5 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white font-bold rounded-xl hover:shadow-lg hover:shadow-bieon-sense/20 transition-all"
              >
                {t('admin_dashboard.modals.btn_close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
