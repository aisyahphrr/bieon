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
  Eye,
  Coins,
  Home,
  Briefcase,
  Factory,
  Building2,
  Heart
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

  const calculateTrend = (dataArray) => {
    if (!dataArray || dataArray.length < 2) return 0;
    const current = dataArray[dataArray.length - 1];
    const previous = dataArray[dataArray.length - 2];
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const ShimmerSkeleton = ({ className = "h-8 w-16" }) => (
    <div className={`animate-pulse bg-slate-200/60 rounded-lg ${className}`}></div>
  );

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
    'from-bieon-sense/15 to-white border-bieon-sense/25 text-bieon-sense',
    'from-bieon-eco/15 to-white border-bieon-eco/25 text-bieon-eco',
    'from-bieon-sense/10 to-white border-bieon-sense/20 text-bieon-sense/90',
    'from-bieon-eco/10 to-white border-bieon-eco/20 text-bieon-eco/90',
    'from-bieon-sense/5 to-white border-bieon-sense/15 text-bieon-sense/80',
    'from-bieon-eco/5 to-white border-bieon-eco/15 text-bieon-eco/80',
  ];

  const getSegmentIconConfig = (seg) => {
    switch (seg) {
      case 'Subsidi Rumah Tangga':
        return {
          icon: <Coins className="w-5 h-5" />,
          style: 'bg-bieon-eco/10 border-bieon-eco/20 text-bieon-eco'
        };
      case 'Rumah Tangga':
        return {
          icon: <Home className="w-5 h-5" />,
          style: 'bg-bieon-sense/10 border-bieon-sense/20 text-bieon-sense'
        };
      case 'Bisnis':
        return {
          icon: <Briefcase className="w-5 h-5" />,
          style: 'bg-bieon-eco/10 border-bieon-eco/20 text-bieon-eco'
        };
      case 'Industri':
        return {
          icon: <Factory className="w-5 h-5" />,
          style: 'bg-bieon-sense/10 border-bieon-sense/20 text-bieon-sense'
        };
      case 'Pemerintah & PJU':
        return {
          icon: <Building2 className="w-5 h-5" />,
          style: 'bg-bieon-eco/10 border-bieon-eco/20 text-bieon-eco'
        };
      case 'Pelayanan Sosial':
        return {
          icon: <Heart className="w-5 h-5" />,
          style: 'bg-bieon-sense/10 border-bieon-sense/20 text-bieon-sense'
        };
      default:
        return {
          icon: <Zap className="w-5 h-5" />,
          style: 'bg-slate-100 border-slate-200 text-slate-500'
        };
    }
  };

  return (
    <SuperAdminLayout activeMenu="Dashboard" onNavigate={onNavigate} title="Super Admin Dashboard">
      {/* Dynamic styling for premium fadeInUp animation and glow utilities */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* Modern Gradient Borders */

        
        .border-gradient-eco::before,
        .border-gradient-sense::before,
        .border-gradient-rose::before,
        .border-gradient-ecosense::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 2rem;
          padding: 1.5px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .border-gradient-eco::before {
          background: linear-gradient(135deg, rgba(5, 155, 39, 0.8) 0%, rgba(255, 255, 255, 0) 50%, rgba(5, 155, 39, 0.4) 100%);
        }
        .border-gradient-sense::before {
          background: linear-gradient(135deg, rgba(18, 156, 192, 0.8) 0%, rgba(255, 255, 255, 0) 50%, rgba(18, 156, 192, 0.4) 100%);
        }
        .border-gradient-rose::before {
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.8) 0%, rgba(255, 255, 255, 0) 50%, rgba(244, 63, 94, 0.4) 100%);
        }
        .border-gradient-ecosense::before {
          background: linear-gradient(135deg, rgba(5, 155, 39, 0.7) 0%, rgba(18, 156, 192, 0.7) 100%);
        }
  `}</style>

      {/* Dashboard Content */}
      {/* Ambient Background Glow (SaaS Modern Touch) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,_rgba(18,156,192,0.15),_transparent_70%)] blur-3xl rounded-full mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,_rgba(5,155,39,0.1),_transparent_70%)] blur-3xl rounded-full mix-blend-multiply animate-[pulse_12s_ease-in-out_infinite]"></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-[radial-gradient(circle_at_center,_rgba(244,63,94,0.05),_transparent_70%)] blur-3xl rounded-full mix-blend-multiply animate-[pulse_15s_ease-in-out_infinite]"></div>
      </div>

      {/* Dashboard Content */}
      <main className="space-y-12 animate-fade-in-up relative z-10">
        {/* Stats Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Card 1 (Total Pelanggan) */}
            <div className="bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/80 border border-emerald-100 shadow-sm rounded-[1.5rem] p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
              {/* Corner Aesthetic Ornament */}
              <div className="absolute right-0 bottom-0 w-28 h-28 text-bieon-sense/[0.1] pointer-events-none translate-x-4 translate-y-4 transition-transform duration-700 group-hover:scale-110 z-0">
                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                  <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </div>

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-white text-bieon-sense rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                  <Users className="w-6 h-6 group-hover:-rotate-6 transition-transform" />
                </div>
                <div className="text-right">
                  <h3 className="text-3xl font-bold text-slate-800 leading-none mb-0.5">
                    {homeownersLoading ? <ShimmerSkeleton className="h-8 w-16 ml-auto" /> : totalHomeownersCount}
                  </h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{t('admin_dashboard.metrics.total_customers')}</p>
                </div>
              </div>
              
              <div className="mt-auto relative z-10 pt-3 border-t border-slate-300/20">
                <div className="flex items-center justify-between text-center gap-2">
                  <div className="flex-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('admin_dashboard.metrics.active')}</p>
                    <div className="text-[13px] font-bold text-slate-800">{homeownersLoading ? <ShimmerSkeleton className="h-4 w-8 mx-auto mt-0.5" /> : activeHomeownersCount}</div>
                  </div>
                  <div className="w-px h-5 bg-slate-300/30"></div>
                  <div className="flex-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('admin_dashboard.metrics.warning')}</p>
                    <div className="text-[13px] font-bold text-amber-600">{homeownersLoading ? <ShimmerSkeleton className="h-4 w-8 mx-auto mt-0.5" /> : warningHomeownersCount}</div>
                  </div>
                  <div className="w-px h-5 bg-slate-300/30"></div>
                  <div className="flex-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('admin_dashboard.metrics.inactive')}</p>
                    <div className="text-[13px] font-bold text-rose-600">{homeownersLoading ? <ShimmerSkeleton className="h-4 w-8 mx-auto mt-0.5" /> : inactiveHomeownersCount}</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-5 left-1/2 -translate-x-1/2">
                <div className="bg-emerald-50/80 border border-emerald-100 px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                   {calculateTrend(metrics.monthlyPelanggan) >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-600" /> : <TrendingDown className="w-3 h-3 text-rose-600" />}
                   <span className={`text-[9px] font-bold ${calculateTrend(metrics.monthlyPelanggan) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{calculateTrend(metrics.monthlyPelanggan) >= 0 ? '+' : ''}{calculateTrend(metrics.monthlyPelanggan)}%</span>
                </div>
              </div>
            </div>
  
            {/* Card 2 (BIEON Nodes) */}
            <div className="bg-gradient-to-br from-sky-100/80 via-white to-emerald-100/80 border border-sky-100 shadow-sm rounded-[1.5rem] p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 w-28 h-28 text-bieon-eco/[0.1] pointer-events-none translate-x-4 translate-y-4 transition-transform duration-700 group-hover:scale-110 z-0">
                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="20" width="60" height="60" rx="12" stroke="currentColor" strokeWidth="2" fill="none" />
                  <rect x="35" y="35" width="30" height="30" rx="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                </svg>
              </div>

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-white text-bieon-eco rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                  <Box className="w-6 h-6 group-hover:rotate-6 transition-transform" />
                </div>
                <div className="text-right">
                  <h3 className="text-3xl font-bold text-slate-800 leading-none mb-0.5">
                    {metricsLoading ? <ShimmerSkeleton className="h-8 w-16 ml-auto" /> : metrics.totalHubs}
                  </h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{t('admin_dashboard.metrics.bieon_nodes')}</p>
                </div>
              </div>
              
              <div className="mt-auto relative z-10 pt-1 text-right flex justify-end">
                <div className="bg-emerald-50/80 border border-emerald-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 shadow-sm">
                  {metrics.hubTrend >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-600" />}
                  {metrics.hubTrend >= 0 ? '+' : ''}{t('admin_dashboard.metrics.trend_monthly', { percent: metrics.hubTrend })}
                </div>
              </div>
            </div>
  
            {/* Card 3 (Smart Devices) */}
            <div className="bg-gradient-to-br from-sky-100/80 via-white to-emerald-100/80 border border-sky-100 shadow-sm rounded-[1.5rem] p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 w-28 h-28 text-bieon-sense/[0.1] pointer-events-none translate-x-4 translate-y-4 transition-transform duration-700 group-hover:scale-110 z-0">
                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 90 Q 50 10, 90 90" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M20 90 Q 50 30, 80 90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                </svg>
              </div>

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-white text-bieon-sense rounded-xl flex items-center justify-center shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
                  <Monitor className="w-6 h-6 group-hover:-rotate-6 transition-transform" />
                </div>
                <div className="text-right">
                  <h3 className="text-3xl font-bold text-slate-800 leading-none mb-0.5">
                    {metricsLoading ? <ShimmerSkeleton className="h-8 w-16 ml-auto" /> : metrics.totalDevices}
                  </h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{t('admin_dashboard.metrics.smart_devices')}</p>
                </div>
              </div>
              
              <div className="mt-auto relative z-10 pt-1 text-right flex justify-end">
                <div className="bg-emerald-50/80 border border-emerald-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 shadow-sm">
                  {metrics.deviceTrend >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-600" />}
                  {metrics.deviceTrend >= 0 ? '+' : ''}{t('admin_dashboard.metrics.trend_monthly', { percent: metrics.deviceTrend })}
                </div>
              </div>
            </div>
  
            {/* Card 4 (Total Pengaduan) */}
            <div className="bg-gradient-to-br from-white via-rose-50/80 to-rose-100 border border-rose-100 shadow-sm rounded-[1.5rem] p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 w-28 h-28 text-rose-500/[0.08] pointer-events-none translate-x-4 translate-y-4 transition-transform duration-700 group-hover:scale-110 z-0">
                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 50 C 30 10, 70 90, 90 50" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M20 50 C 40 20, 60 80, 80 50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                </svg>
              </div>

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-white text-rose-500 rounded-xl flex items-center justify-center shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
                  <AlertTriangle className="w-6 h-6 group-hover:rotate-6 transition-transform" />
                </div>
                <div className="text-right">
                  <h3 className="text-3xl font-bold text-slate-800 leading-none mb-0.5">
                    {metricsLoading ? <ShimmerSkeleton className="h-8 w-16 ml-auto" /> : metrics.totalComplaints}
                  </h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{t('admin_dashboard.metrics.total_complaints')}</p>
                </div>
              </div>
              <div className="absolute top-5 left-1/2 -translate-x-1/2">
                <div className="bg-rose-50/80 border border-rose-100 px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                   {calculateTrend(metrics.monthlyComplaints) >= 0 ? <TrendingUp className="w-3 h-3 text-rose-600" /> : <TrendingDown className="w-3 h-3 text-emerald-600" />}
                   <span className={`text-[9px] font-bold ${calculateTrend(metrics.monthlyComplaints) >= 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{calculateTrend(metrics.monthlyComplaints) >= 0 ? '+' : ''}{calculateTrend(metrics.monthlyComplaints)}%</span>
                </div>
              </div>
              
              <div className="mt-auto relative z-10 pt-1 text-right flex justify-end">
                <div className="bg-rose-50/80 border border-rose-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-700 shadow-sm">
                  <AlertCircle className="w-3.5 h-3.5" /> {t('admin_dashboard.metrics.pending_alert', { count: metricsLoading ? '-' : metrics.pendingComplaints })}
                </div>
              </div>
            </div>
          </div>

        {/* Stats Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Technician Overview Card */}
          <div className="bg-white border border-emerald-100 shadow-sm rounded-[1.5rem] p-6 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 relative overflow-hidden group">
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-bieon-eco shadow-sm border border-emerald-100 group-hover:scale-105 transition-transform duration-500 relative">
                <User className="w-7 h-7 group-hover:-rotate-6 transition-transform duration-500" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full shadow-sm animate-pulse"></span>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-2 py-1 rounded-md inline-block mb-1">{t('admin_dashboard.metrics.live_status')}</p>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] justify-end">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div> {t('admin_dashboard.metrics.online')}
                </div>
              </div>
            </div>

            <div className="flex-1 relative z-10">
              <h3 className="text-4xl font-bold text-slate-800 tracking-tight leading-none mb-2 drop-shadow-sm">
                {metricsLoading ? <ShimmerSkeleton className="h-10 w-20" /> : metrics.activeTechnicians || 0}
              </h3>
              <p className="text-[13px] font-semibold text-slate-500">{t('admin_dashboard.metrics.active_technicians')}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                {metricsLoading ? <ShimmerSkeleton className="h-4 w-12" /> : t('admin_dashboard.metrics.total_count', { count: metrics.totalTechnicians || 0 })}
              </div>
            </div>

            <button
              onClick={() => onNavigate && onNavigate('admin-teknisi')}
              className="mt-8 w-full py-3.5 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-all border border-slate-200 shadow-sm flex items-center justify-center gap-2 hover:border-bieon-eco/30 hover:text-bieon-eco"
            >
              <span className="relative z-10 flex items-center gap-2">{t('admin_dashboard.metrics.btn_manage_tech')} <ChevronRight className="w-4 h-4" /></span>
            </button>
          </div>

          {/* PLN Tariff Management Center */}
          <div className="lg:col-span-3 bg-white border border-sky-100 shadow-sm rounded-[1.5rem] p-6 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:border-sky-200 transition-all duration-300 relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center text-bieon-sense shadow-sm border border-sky-100 shrink-0 group-hover:scale-105 transition-transform">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{t('admin_dashboard.tariff_summary.title')}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[12px] text-slate-500 font-medium">{t('admin_dashboard.tariff_summary.subtitle')}</p>
                    {plnSummary?.latestUpdate && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100/50 text-[10px] font-bold rounded-md">
                        <CheckCircle className="w-3 h-3" /> {t('admin_dashboard.tariff_summary.updated', { date: plnSummary.latestUpdate.date })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">TOTAL KATEGORI</p>
                  <p className="text-2xl font-bold text-slate-800 leading-none">
                    {plnCategoriesLoading ? '-' : plnCategories.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <Filter className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Clean List for Segments */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-6 mb-6 mt-2 relative z-10 flex-1">
              {PLN_SEGMENT_ORDER.map((seg) => {
                const iconConfig = getSegmentIconConfig(seg);
                const isEco = iconConfig.style.includes('bieon-eco');
                const themeColorClass = isEco ? 'text-bieon-eco' : 'text-bieon-sense';
                const themeBgClass = isEco ? 'bg-emerald-50/80 border border-emerald-100' : 'bg-sky-50/80 border border-sky-100';
                
                return (
                  <div key={seg} className="flex items-center gap-3.5 group/item cursor-default">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${themeBgClass} ${themeColorClass} group-hover/item:scale-110 transition-transform`}>
                      {iconConfig.icon}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-700 leading-tight">
                        {seg === 'Subsidi Rumah Tangga' ? t('admin_dashboard.pln_segments.subsidy') :
                          seg === 'Rumah Tangga' ? t('admin_dashboard.pln_segments.residential') :
                            seg === 'Bisnis' ? t('admin_dashboard.pln_segments.business') :
                              seg === 'Industri' ? t('admin_dashboard.pln_segments.industrial') :
                                seg === 'Pemerintah & PJU' ? t('admin_dashboard.pln_segments.government') :
                                  seg === 'Pelayanan Sosial' ? t('admin_dashboard.pln_segments.social') : seg}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{plnSegmentCounts[seg] || 0} Golongan</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100/60 flex items-stretch justify-end gap-4 relative z-10 w-full">
              <button
                onClick={() => setShowPlnCategoriesModal(true)}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-600 font-semibold rounded-xl text-xs transition-colors border border-slate-200 flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
              >
                <Eye className="w-4 h-4" /> Lihat Struktur Golongan
              </button>
              <button
                onClick={() => onNavigate && onNavigate('admin-tariff')}
                className="w-full max-w-[300px] py-3.5 bg-[#1194b6] hover:bg-[#0e80a0] text-white font-semibold rounded-xl text-xs transition-colors flex flex-col items-center justify-center gap-1 shadow-md hover:shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>{t('admin_dashboard.tariff_summary.btn_manage_tariff')}</span>
                </div>
                {plnSummary?.latestUpdate && (
                  <span className="text-[10px] font-medium opacity-80 mt-0.5">
                    Terakhir: {plnSummary.latestUpdate.category} (Rp {plnSummary.latestUpdate.tariff})
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>


        {/* Charts Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
          {/* Chart 1: Bar */}
          <div className="bg-white border border-emerald-100 hover:border-emerald-200 shadow-sm rounded-3xl p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white text-bieon-eco rounded-[1.25rem] flex items-center justify-center shadow-sm border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <Box className="w-7 h-7 group-hover:-rotate-3 transition-transform" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t('admin_dashboard.charts.bieon_installation_title')}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{t('admin_dashboard.charts.bieon_installation_sub')}</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF(t('admin_dashboard.charts.bieon_installation_title'), [t('admin_dashboard.export.col_month'), t('admin_dashboard.export.col_amount')], metrics.monthlyInstalasi.map((v, i) => [MONTH_LABELS[i], v]), t('admin_dashboard.export.filename_installation'))}
                className="p-3.5 bg-white border border-slate-100 text-slate-400 hover:text-bieon-eco hover:border-bieon-eco/30 rounded-2xl transition-all shadow-sm group/btn active:scale-95"
              >
                <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
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
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }} padding={{ left: 0, right: 0 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} width={30} />
                  <Tooltip cursor={{ fill: '#f8fafc', radius: 8 }} contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 'bold', fontSize: '12px' }} />
                  <Bar dataKey="value" fill="url(#colorBieonBar)" shape={<ThreeDBar />} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Bar */}
          <div className="bg-white border border-sky-100 hover:border-sky-200 shadow-sm rounded-3xl p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white text-bieon-sense rounded-[1.25rem] flex items-center justify-center shadow-sm border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <Activity className="w-7 h-7 group-hover:rotate-3 transition-transform" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t('admin_dashboard.charts.hub_node_title')}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{t('admin_dashboard.charts.hub_node_sub')}</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF(t('admin_dashboard.charts.hub_node_title'), [t('admin_dashboard.export.col_month'), t('admin_dashboard.export.col_amount')], metrics.monthlyHubs.map((v, i) => [MONTH_LABELS[i], v]), t('admin_dashboard.export.filename_hub'))}
                className="p-3.5 bg-white border border-slate-100 text-slate-400 hover:text-bieon-sense hover:border-bieon-sense/30 rounded-2xl transition-all shadow-sm group/btn active:scale-95"
              >
                <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hubNodeChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorHubBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#129cc0" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059b27" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }} padding={{ left: 0, right: 0 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} width={30} />
                  <Tooltip cursor={{ fill: '#f8fafc', radius: 8 }} contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 'bold', fontSize: '12px' }} />
                  <Bar dataKey="value" fill="url(#colorHubBar)" shape={<ThreeDBar />} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Area */}
          <div className="bg-white border border-sky-100 hover:border-sky-200 shadow-sm rounded-3xl p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white text-bieon-sense rounded-[1.25rem] flex items-center justify-center shadow-sm border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <Monitor className="w-7 h-7 group-hover:-rotate-3 transition-transform" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t('admin_dashboard.charts.smart_device_title')}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{t('admin_dashboard.charts.smart_device_sub')}</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF(t('admin_dashboard.charts.smart_device_title'), [t('admin_dashboard.export.col_month'), t('admin_dashboard.export.col_amount')], metrics.monthlyDevices.map((v, i) => [MONTH_LABELS[i], v]), t('admin_dashboard.export.filename_device'))}
                className="p-3.5 bg-white border border-slate-100 text-slate-400 hover:text-bieon-sense hover:border-bieon-sense/30 rounded-2xl transition-all shadow-sm group/btn active:scale-95"
              >
                <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={smartDeviceChartData}>
                  <defs>
                    <linearGradient id="colorDeviceBg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#129cc0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#129cc0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDeviceLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#059b27" stopOpacity={1} />
                      <stop offset="100%" stopColor="#129cc0" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} width={30} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 'bold', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="value" stroke="url(#colorDeviceLine)" strokeWidth={4} fillOpacity={1} fill="url(#colorDeviceBg)" dot={{ fill: '#129cc0', strokeWidth: 3, r: 5, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#059b27' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Line */}
          <div className="bg-white border border-emerald-100 hover:border-emerald-200 shadow-sm rounded-3xl p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white text-bieon-eco rounded-[1.25rem] flex items-center justify-center shadow-sm border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <Users className="w-7 h-7 group-hover:rotate-3 transition-transform" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t('admin_dashboard.charts.customer_growth_title')}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{t('admin_dashboard.charts.customer_growth_sub')}</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF(t('admin_dashboard.charts.customer_growth_title'), [t('admin_dashboard.export.col_month'), t('admin_dashboard.export.col_amount')], metrics.monthlyPelanggan.map((v, i) => [MONTH_LABELS[i], v]), t('admin_dashboard.export.filename_customer'))}
                className="p-3.5 bg-white border border-slate-100 text-slate-400 hover:text-bieon-eco hover:border-bieon-eco/30 rounded-2xl transition-all shadow-sm group/btn active:scale-95"
              >
                <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
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
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} width={30} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 'bold', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="url(#colorPelangganLine)" strokeWidth={4} dot={{ fill: '#129cc0', strokeWidth: 3, r: 5, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#059b27' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 5: Line */}
          <div className="bg-white border border-emerald-100 hover:border-emerald-200 shadow-sm rounded-3xl p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white text-bieon-eco rounded-[1.25rem] flex items-center justify-center shadow-sm border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <User className="w-7 h-7 group-hover:rotate-3 transition-transform" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t('admin_dashboard.charts.tech_growth_title')}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{t('admin_dashboard.charts.tech_growth_sub')}</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF(t('admin_dashboard.charts.tech_growth_title'), [t('admin_dashboard.export.col_month'), t('admin_dashboard.export.col_amount')], metrics.monthlyTechnicians.map((v, i) => [MONTH_LABELS[i], v]), t('admin_dashboard.export.filename_tech'))}
                className="p-3.5 bg-white border border-slate-100 text-slate-400 hover:text-bieon-eco hover:border-bieon-eco/30 rounded-2xl transition-all shadow-sm group/btn active:scale-95"
              >
                <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
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
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} width={30} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 'bold', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="url(#colorTeknisiLine)" strokeWidth={4} dot={{ fill: '#059b27', strokeWidth: 3, r: 5, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#129cc0' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 6: Line */}
          <div className="bg-white border border-rose-100 hover:border-rose-200 shadow-sm rounded-3xl p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            
            <div className="flex items-center justify-between w-full relative z-10 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white text-rose-500 rounded-[1.25rem] flex items-center justify-center shadow-sm border border-slate-100 shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <AlertTriangle className="w-7 h-7 group-hover:rotate-3 transition-transform" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t('admin_dashboard.charts.complaint_growth_title')}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">{t('admin_dashboard.charts.complaint_growth_sub')}</p>
                </div>
              </div>
              <button
                type="button"
                title="Export PDF"
                onClick={() => handleDownloadPDF(t('admin_dashboard.charts.complaint_growth_title'), [t('admin_dashboard.export.col_month'), t('admin_dashboard.export.col_amount')], metrics.monthlyComplaints.map((v, i) => [MONTH_LABELS[i], v]), t('admin_dashboard.export.filename_complaint'))}
                className="p-3.5 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-500/30 rounded-2xl transition-all shadow-sm group/btn active:scale-95"
              >
                <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
            <div className="h-72 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pengaduanChartData}>
                  <defs>
                    <linearGradient id="colorPengaduanLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} width={30} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 'bold', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="url(#colorPengaduanLine)" strokeWidth={4} dot={{ fill: '#f43f5e', strokeWidth: 3, r: 5, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative z-10">
          {/* Ambient Inner Glow */}
          
          
          {/* SVG Background Ornament */}
          
          
          <div className="p-6 md:p-10 border-b border-slate-100/60 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-30">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-bieon-sense mb-2 inline-block bg-bieon-sense/10 px-2 py-0.5 rounded-md">ECO SENSE</p>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">{t('admin_dashboard.table.title')}</h2>
            </div>
            <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative group col-span-2 md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-bieon-eco transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('admin_dashboard.table.search_placeholder')}
                  className="w-full pl-11 pr-4 py-3 bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-[1.25rem] focus:outline-none focus:ring-2 focus:ring-bieon-eco/50 focus:border-bieon-eco focus:bg-white text-xs transition-all shadow-sm group-hover:border-slate-300"
                />
              </div>
              <div className="relative col-span-1">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center justify-between w-full md:w-auto min-w-[160px] px-5 py-3 bg-white border border-slate-200/80 rounded-[1.25rem] text-xs font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400 group-hover:text-bieon-eco transition-colors" />
                    <span>
                      {statusFilter === 'all' ? t('admin_dashboard.table.filter_all') :
                        statusFilter === 'aktif' ? t('admin_dashboard.table.filter_active') :
                          statusFilter === 'warning' ? t('admin_dashboard.table.filter_warning') :
                            t('admin_dashboard.table.filter_inactive')}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showStatusDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)}></div>
                    <div className="absolute top-full right-0 mt-3 w-full min-w-[180px] bg-white/95 backdrop-blur-xl rounded-[1.25rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-white p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
                          className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${statusFilter === status.key
                            ? 'bg-bieon-eco text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-50'
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
                className="flex items-center justify-center col-span-1 gap-2 px-6 py-3 bg-gradient-to-r from-bieon-eco to-[#048722] hover:from-[#048722] hover:to-[#03701b] text-white rounded-[1.25rem] text-xs font-bold shadow-[0_4px_15px_rgba(5,155,39,0.3)] hover:shadow-[0_6px_20px_rgba(5,155,39,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 uppercase tracking-widest relative overflow-hidden group/export"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/export:translate-x-[100%] transition-transform duration-700"></div>
                <Download className="w-4 h-4 relative z-10" /> <span className="relative z-10">{t('admin_dashboard.table.btn_export')}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto hidden md:block relative z-10 px-6 pb-6">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gradient-to-r from-emerald-50/80 to-sky-50/80 border-b border-emerald-100/60">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 w-auto">{t('admin_dashboard.table.col_customer')}</th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 text-center w-[15%] whitespace-nowrap">{t('admin_dashboard.table.col_bieon_id')}</th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 text-center w-[12%] whitespace-nowrap">{t('admin_dashboard.table.col_status')}</th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 text-center w-[15%] whitespace-nowrap">{t('admin_dashboard.table.col_nodes_devices')}</th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 text-left w-[12%] whitespace-nowrap">{t('admin_dashboard.table.col_tech')}</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-600 text-center w-[8%] whitespace-nowrap">{t('admin_dashboard.table.col_action')}</th>
                </tr>
              </thead>
              <tbody>
                {homeownersLoading ? (
                  Array(5).fill(0).map((_, idx) => (
                    <tr key={`skel-${idx}`} className="border-b border-slate-100">
                      <td className="px-6 py-4"><ShimmerSkeleton className="h-10 w-full max-w-[200px]" /></td>
                      <td className="px-4 py-4"><ShimmerSkeleton className="h-6 w-16 mx-auto" /></td>
                      <td className="px-4 py-4"><ShimmerSkeleton className="h-6 w-20 mx-auto rounded-full" /></td>
                      <td className="px-4 py-4"><ShimmerSkeleton className="h-6 w-16 mx-auto" /></td>
                      <td className="px-4 py-4"><ShimmerSkeleton className="h-8 w-32" /></td>
                      <td className="px-6 py-4"><ShimmerSkeleton className="h-8 w-8 mx-auto" /></td>
                    </tr>
                  ))
                ) : paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((cust) => (
                    <tr key={cust.id} className="bg-white hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[14px] shrink-0 border border-slate-200/60 shadow-sm group-hover:bg-bieon-eco/10 group-hover:text-bieon-eco transition-all">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[14px] font-bold text-slate-800 group-hover:text-bieon-eco transition-colors truncate">{cust.name}</div>
                            <div className="text-[12px] text-slate-500 font-medium truncate mt-0.5">{cust.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[12px] font-semibold text-slate-600">
                          {cust.bieonId}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${cust.rawStatus === 'aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                            cust.rawStatus === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                              'bg-rose-50 text-rose-700 border border-rose-200/60'
                            }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {cust.status}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-[12px] font-semibold text-slate-700">{t('admin_dashboard.table.val_format', { hub: cust.totalHubs, dev: cust.devices })}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <span className="text-[12px] font-medium text-slate-700 truncate max-w-[150px]">{cust.technician}</span>
                          </div>
                          {cust.fieldTeam && cust.fieldTeam.length > 0 && (
                            <div className="relative group/team inline-block w-fit">
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-500 bg-slate-100 cursor-help transition-all hover:bg-slate-200">
                                <Users className="w-3 h-3" />
                                <span>+ {cust.fieldTeam.length}</span>
                              </div>
                              <div className="absolute bottom-full left-0 mb-2 w-max max-w-[200px] bg-slate-800 text-white text-[11px] p-2.5 rounded-lg opacity-0 invisible group-hover/team:opacity-100 group-hover/team:visible transition-all z-50 shadow-xl">
                                <p className="font-bold border-b border-slate-600 pb-1.5 mb-1.5">{t('admin_dashboard.modals.sec_field_team')}</p>
                                <div className="space-y-1">
                                  {cust.fieldTeam.map((name, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <span className="text-slate-200">{name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Quick Actions */}
                          <button
                            title="Pause/Suspend"
                            className="inline-flex w-8 h-8 items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-2 group-hover:translate-x-0"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                          
                          {/* Primary Action */}
                          <button
                            onClick={() => {
                              if (onNavigate) {
                                onNavigate('admin-pelanggan');
                                setTimeout(() => {
                                  window.dispatchEvent(new CustomEvent('openHomeownerDetail', { detail: cust.name }));
                                }, 100);
                              }
                            }}
                            title="Detail"
                            className="inline-flex w-8 h-8 items-center justify-center text-slate-400 hover:text-bieon-eco hover:bg-bieon-eco/10 rounded-lg transition-all active:scale-95 z-10"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 mb-6 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100/50 shadow-inner">
                           <Users className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">Belum Ada Pelanggan</h3>
                        <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">Tidak ada data pelanggan yang cocok dengan status atau pencarian ini.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4 p-4 relative z-10">
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((cust) => (
                <div key={cust.id} className="bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-slate-100/60 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-slate-100/50 rounded-bl-full pointer-events-none"></div>
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bieon-eco/10 to-transparent text-bieon-eco flex items-center justify-center font-bold text-xs shrink-0 border border-bieon-eco/20 shadow-sm">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{cust.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400">{cust.username}</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${cust.rawStatus === 'aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' :
                      cust.rawStatus === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100/50' :
                        'bg-rose-50 text-rose-700 border border-rose-100/50'
                      }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]"></span>
                      {cust.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100/50">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('admin_dashboard.table.col_bieon_id')}</p>
                      <p className="text-[11px] font-bold text-slate-700">{cust.bieonId}</p>
                    </div>
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100/50">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('admin_dashboard.table.col_nodes_devices')}</p>
                      <p className="text-[11px] font-bold text-slate-700">{t('admin_dashboard.table.val_format', { hub: cust.totalHubs, dev: cust.devices })}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/60 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-bieon-eco/10 border border-bieon-eco/10 flex items-center justify-center shrink-0">
                        <User className="w-3 h-3 text-bieon-eco" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">{cust.technician}</span>
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
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-bieon-eco hover:bg-bieon-eco/10 rounded-lg transition-all shadow-sm border border-transparent bg-white active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white/50 rounded-2xl border border-slate-100 border-dashed">
                <Search className="w-6 h-6 mx-auto mb-2 opacity-20 text-slate-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('admin_dashboard.table.empty_msg')}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-t border-slate-100/60 bg-white/40 backdrop-blur-md relative z-10">
            <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('admin_dashboard.table.show')}</span>
              <div className="relative">
                <button
                  onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                  className="flex items-center justify-between w-[70px] px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:border-bieon-eco/50 transition-all shadow-sm"
                >
                  <span>{rowsPerPage}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {showRowsDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowRowsDropdown(false)}></div>
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in slide-in-from-bottom-2">
                      {[5, 10, 20, 50].map((num) => (
                        <button
                          key={num}
                          onClick={() => {
                            setRowsPerPage(num);
                            setCurrentPage(1);
                            setShowRowsDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-slate-50 transition-colors ${rowsPerPage === num ? 'text-bieon-eco' : 'text-slate-600'}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {t('admin_dashboard.table.pagination_info', {
                  start: totalItems === 0 ? 0 : startIndex + 1,
                  end: Math.min(startIndex + rowsPerPage, totalItems),
                  total: totalItems
                })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50/80 p-1.5 rounded-xl border border-slate-100/80">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-bieon-eco hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all font-bold text-xs shadow-sm hover:shadow-md disabled:shadow-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1 px-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Show current page, first, last, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all shadow-sm ${
                          currentPage === pageNumber
                            ? 'bg-gradient-to-br from-bieon-eco to-[#048722] text-white shadow-[0_2px_8px_rgba(5,155,39,0.3)]'
                            : 'text-slate-500 hover:text-bieon-eco hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="w-4 text-center text-slate-400 text-xs font-bold">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-bieon-eco hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all font-bold text-xs shadow-sm hover:shadow-md disabled:shadow-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal rendering preserved below */}

      </main>

      {showPlnModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-md" onClick={() => setShowPlnModal(false)}></div>
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-white hover:shadow-[0_24px_60px_-15px_rgba(5,155,39,0.15)] transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-white via-white to-bieon-eco/[0.03] border-b border-slate-100 px-8 py-6 text-slate-900 relative">
              <button
                onClick={() => setShowPlnModal(false)}
                className="absolute top-6 right-6 w-10 h-10 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-all text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-bieon-eco/10 text-bieon-eco rounded-2xl flex items-center justify-center shadow-inner">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{t('admin_dashboard.modals.update_tariff_title')}</h2>
                  <p className="text-slate-500 font-medium text-xs mt-1">{t('admin_dashboard.modals.update_tariff_desc')}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-7 relative">
              {/* Decorative Background SVG */}
              <div className="absolute right-0 bottom-24 text-bieon-eco/[0.03] pointer-events-none">
                <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 20 L 70 20 L 45 50 L 75 50 L 35 90 Z" fill="currentColor" />
                </svg>
              </div>

              <div className="space-y-3 relative z-10">
                <label className="text-sm font-semibold text-slate-700 ml-1">{t('admin_dashboard.modals.lbl_current')}</label>
                <div className="bg-gradient-to-br from-slate-50 to-bieon-eco/[0.02] rounded-2xl p-6 border border-slate-100 flex items-baseline gap-3 shadow-sm">
                  <div className="text-4xl font-bold text-slate-900 leading-none">Rp {plnTariff}</div>
                  <p className="text-sm text-slate-500 font-bold">{t('admin_dashboard.modals.lbl_per_kwh')}</p>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <label className="text-sm font-semibold text-slate-700 ml-1">{t('admin_dashboard.modals.lbl_new')} <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xl group-focus-within:text-bieon-eco transition-colors">Rp</span>
                  <input
                    type="number"
                    value={newTariff}
                    onChange={(e) => setNewTariff(e.target.value)}
                    className="w-full pl-14 pr-20 py-4 bg-white border border-slate-200 rounded-2xl text-xl font-bold text-slate-900 focus:outline-none focus:border-bieon-eco focus:ring-4 focus:ring-bieon-eco/10 transition-all shadow-sm"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm group-focus-within:text-bieon-sense transition-colors">/ kWh</span>
                </div>
                <div className="flex items-start gap-2 px-1 pt-1">
                  <AlertCircle className="w-4 h-4 text-bieon-sense flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    {t('admin_dashboard.modals.help_tariff')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-slate-100 relative z-10">
                <button
                  onClick={() => setShowPlnModal(false)}
                  className="w-full sm:flex-1 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                >
                  {t('admin_homeowner.form_modal.btn_cancel')}
                </button>
                <button
                  onClick={handleUpdateTariff}
                  className="w-full sm:flex-1 py-4 bg-gradient-to-r from-bieon-eco to-[#048722] hover:from-[#048722] hover:to-[#03701b] text-white font-bold rounded-2xl shadow-[0_4px_12px_rgba(5,155,39,0.2)] hover:shadow-[0_6px_20px_rgba(5,155,39,0.35)] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
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
          <div className="absolute inset-0 bg-black/45 backdrop-blur-md" onClick={() => setShowPlnCategoriesModal(false)}></div>
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-white hover:shadow-[0_24px_60px_-15px_rgba(18,156,192,0.15)] transition-all">
            <div className="bg-gradient-to-r from-white via-white to-bieon-sense/[0.03] border-b border-slate-100 px-8 py-6 text-slate-900 relative">
              <button
                onClick={() => setShowPlnCategoriesModal(false)}
                className="absolute top-6 right-6 w-10 h-10 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-all text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-bieon-sense/10 rounded-2xl flex items-center justify-center text-bieon-sense shadow-inner">
                  <Filter className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{t('admin_dashboard.modals.cat_list_title')}</h2>
                  <p className="text-slate-500 font-bold text-xs mt-1">
                    {plnCategoriesLoading
                      ? '...'
                      : t('admin_dashboard.modals.cat_list_count', { count: plnCategories.length })}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto modal-custom-scrollbar space-y-6">
              {PLN_SEGMENT_ORDER.filter((seg) => plnCategoriesGrouped[seg]?.length).map((seg) => {
                const localizedSeg =
                  seg === 'Subsidi Rumah Tangga' ? t('admin_dashboard.pln_segments.subsidy') :
                    seg === 'Rumah Tangga' ? t('admin_dashboard.pln_segments.residential') :
                      seg === 'Bisnis' ? t('admin_dashboard.pln_segments.business') :
                        seg === 'Industri' ? t('admin_dashboard.pln_segments.industrial') :
                          seg === 'Pemerintah & PJU' ? t('admin_dashboard.pln_segments.government') :
                            seg === 'Pelayanan Sosial' ? t('admin_dashboard.pln_segments.social') : seg;

                return (
                  <div key={seg} className="mb-6 last:mb-0">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-l-2 border-bieon-sense pl-2">
                      {localizedSeg} ({plnCategoriesGrouped[seg].length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plnCategoriesGrouped[seg].map((cat) => (
                        <div key={cat.key || cat.label} className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-bieon-sense/15 transition-all">
                          <div className="text-sm font-bold text-slate-800 leading-snug">
                            {cat.label}
                          </div>
                          <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {localizedSeg || t('admin_dashboard.pln_segments.others')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {Object.keys(plnCategoriesGrouped).filter((seg) => !PLN_SEGMENT_ORDER.includes(seg)).map((seg) => (
                <div key={seg} className="mb-6 last:mb-0">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-l-2 border-bieon-eco pl-2">
                    {seg} ({plnCategoriesGrouped[seg].length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plnCategoriesGrouped[seg].map((cat) => (
                      <div key={cat.key || cat.label} className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-bieon-eco/15 transition-all">
                        <div className="text-sm font-bold text-slate-800 leading-snug">
                          {cat.label}
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {seg || t('admin_dashboard.pln_segments.others')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                onClick={() => setShowPlnCategoriesModal(false)}
                className="px-6 py-3 bg-gradient-to-r from-bieon-eco to-[#048722] hover:from-[#048722] hover:to-[#03701b] text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(5,155,39,0.2)] hover:shadow-[0_6px_20px_rgba(5,155,39,0.35)] transition-all text-xs uppercase tracking-widest"
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
