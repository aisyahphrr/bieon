import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  FileText,
  Radio,
  ShieldCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import { formatStatusDisplay } from '../../utils/complaintHelpers';

// Helper to load Leaflet assets dynamically
const loadLeafletAssets = async () => {
  if (window.L) return window.L;

  if (!document.querySelector('link[data-leaflet-css="true"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.dataset.leafletCss = 'true';
    document.head.appendChild(link);
  }

  await new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-leaflet-js="true"]');
    if (existingScript && window.L) {
      resolve();
      return;
    }
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.dataset.leafletJs = 'true';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return window.L;
};

// Internal Map Component for Clients
function ClientLiveMap({ clients, isLoading }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    const initMap = async () => {
      if (!containerRef.current) return;
      const L = await loadLeafletAssets();
      if (disposed || !containerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView([-6.2, 106.816666], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);

        layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
      }

      const map = mapRef.current;
      const group = layerGroupRef.current;
      group.clearLayers();

      const validClients = (clients || []).filter(c => c.lat && c.lng);

      if (!validClients.length) {
        map.setView([-6.2, 106.816666], 10);
        setTimeout(() => map.invalidateSize(), 0);
        return;
      }

      const bounds = [];
      validClients.forEach((client) => {
        const { lat, lng } = client;
        bounds.push([lat, lng]);

        const statusColor = client.status === 'online' ? '#059b27' : client.status === 'warning' ? '#f59e0b' : '#ef4444';
        
        const markerHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-6px);">
            <div style="
              background:white;
              color:#1f2937;
              font-weight:700;
              font-size:11px;
              padding:4px 10px;
              border-radius:999px;
              margin-bottom:6px;
              box-shadow:0 8px 20px rgba(15,23,42,0.18);
              white-space:nowrap;
              border:2px solid ${statusColor};
            ">
              ${client.nama}
            </div>
            <div style="
              width:18px;
              height:18px;
              border-radius:999px;
              background:${statusColor};
              border:3px solid white;
              box-shadow:0 8px 20px rgba(15,23,42,0.18);
            "></div>
          </div>
        `;

        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            html: markerHtml,
            className: 'bieon-client-marker',
            iconSize: [120, 48],
            iconAnchor: [60, 44],
          }),
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 5px; min-width: 150px;">
            <strong style="color: #059b27; font-size: 14px; display: block; margin-bottom: 4px;">${client.nama}</strong>
            <span style="font-size: 12px; color: #6b7280; display: block; line-height: 1.4;">${client.alamatLengkap}</span>
            <div style="margin-top: 12px; display: flex; justify-content: space-between; border-top: 1px solid #f3f4f6; pt-2;">
              <div style="text-align: center;">
                <div style="font-weight: bold; color: #1f2937; font-size: 14px;">${client.jumlahBieon}</div>
                <div style="font-size: 9px; color: #9ca3af; text-transform: uppercase;">Hub</div>
              </div>
              <div style="text-align: center;">
                <div style="font-weight: bold; color: #1f2937; font-size: 14px;">${client.jumlahDevice}</div>
                <div style="font-size: 9px; color: #9ca3af; text-transform: uppercase;">Node</div>
              </div>
              <div style="text-align: center;">
                <div style="font-weight: bold; color: ${statusColor}; font-size: 11px;">${client.statusSistem}</div>
                <div style="font-size: 9px; color: #9ca3af; text-transform: uppercase;">Status</div>
              </div>
            </div>
          </div>
        `);
        
        marker.addTo(group);
      });

      if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      setTimeout(() => map.invalidateSize(), 0);
    };

    initMap().catch(console.error);

    return () => { disposed = true; };
  }, [clients]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
      <div ref={containerRef} className="absolute inset-0" />
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-eco border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-gray-700 tracking-tight">Menyiapkan Data Peta...</span>
          </div>
        </div>
      )}
    </div>
  );
}


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
      <div className={`px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 ${type === 'success' ? 'bg-eco/50/90 border-eco/60 text-white' : 'bg-gray-800/90 border-gray-700 text-white'
        }`}>
        {type === 'success' && <CheckCircle2 className="w-5 h-5" />}
        <span className="text-sm font-bold tracking-wide">{message}</span>
      </div>
    </div>
  );
}

export function TechnicianDashboard({ onNavigate }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [returnTicketId, setReturnTicketId] = useState(location.state?.openComplaintId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [toast, setToast] = useState(null);
  const [inputToken, setInputToken] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    totalAccessCodes: 0,
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
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (location.state?.openComplaintId) {
      setReturnTicketId(location.state.openComplaintId);
      setActiveMenu('pengaduan');
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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

    // Auto Online: Pastikan status teknisi menjadi 'aktif' saat membuka dashboard
    const setAutoOnline = async () => {
      if (!token || !userId) return;
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/technician/profile/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'aktif' })
        });
      } catch (err) {
        console.error('Gagal mengaktifkan status online otomatis:', err);
      }
    };
    setAutoOnline();
  }, [userId]);

  const filteredClients = (clients || []).filter(client => {
    const matchesSearch = (client.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (client.lokasi || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    // Header
    doc.setFontSize(22);
    doc.setTextColor(5, 155, 39); // BIEON Teal
    doc.text('BIEON', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Smart Green Living Monitoring System', 14, 28);
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(t('tech_dashboard.table.title', 'Laporan Monitoring Status Pelanggan'), 14, 40);

    doc.setFontSize(10);
    doc.text(`${t('complaint.pdf_printed_date', 'Tanggal Cetak:')} ${today}`, 14, 48);
    doc.text(`${t('tech_dashboard.metrics.total_clients', 'Total Pelanggan Ditangani')}: ${filteredClients.length}`, 14, 54);

    try {
      // Summary Box
      doc.setDrawColor(200);
      doc.rect(14, 60, 182, 25);
      doc.setFontSize(9);
      doc.text(t('complaint.summary_metrics', 'RINGKASAN METRIK (FILTER SAAT INI)'), 18, 66);
      doc.setFontSize(11);
      doc.text(`${t('tech_dashboard.charts.clients_title', 'Jumlah Pelanggan')}: ${filteredClients.length}`, 18, 75);
      doc.text(`BIEON Hub: ${filteredClients.reduce((acc, c) => acc + c.jumlahBieon, 0)}`, 80, 75);
      doc.text(`Device: ${filteredClients.reduce((acc, c) => acc + c.jumlahDevice, 0)}`, 140, 75);

      // Table
      const tableData = filteredClients.map(c => [
        c.nama,
        c.lokasi,
        formatStatusDisplay(c.status, 'technician').toUpperCase(),
        c.jumlahBieon,
        c.jumlahDevice,
        c.statusSistem === 'No BIEON Installed' ? t('tech_dashboard.table.no_bieon', 'Belum Ada BIEON Terpasang') : c.statusSistem
      ]);

      autoTable(doc, {
        startY: 95,
        head: [[
          t('tech_dashboard.table.col_client_name', 'Nama Pelanggan'),
          t('tech_dashboard.table.col_location', 'Lokasi'),
          t('tech_dashboard.table.col_status', 'Status'),
          t('tech_dashboard.table.col_bieon', 'BIEON'),
          t('tech_dashboard.table.col_device', 'Device'),
          t('tech_dashboard.table.col_sys_status', 'Status Sistem')
        ]],
        body: tableData,
        headStyles: { fillColor: [5, 155, 39] },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`${t('table.page', 'Halaman')} ${i} ${t('table.of', 'dari')} ${pageCount} - BIEON Technician Dashboard`, 14, doc.internal.pageSize.height - 10);
      }

      doc.save(`Laporan_Monitoring_BIEON_${new Date().getTime()}.pdf`);
      triggerToast(t('complaint.pdf_success', 'Laporan PDF berhasil diunduh'));
    } catch (error) {
      console.error('PDF Export Error:', error);
      triggerToast(t('complaint.pdf_error', 'Gagal mengekspor PDF. Silakan coba lagi.'), 'error');
    }
  };

  const getLocalizedMonthLabel = (monthInput, currentLang) => {
    if (!monthInput) return '';
    try {
      const isNumber = !isNaN(monthInput);
      const monthIndex = isNumber 
        ? parseInt(monthInput, 10) - 1 
        : new Date(`${monthInput} 1, 2026`).getMonth();
        
      const dateObj = new Date(2026, monthIndex >= 0 && monthIndex <= 11 ? monthIndex : 0, 1);
      return new Intl.DateTimeFormat(currentLang === 'id' ? 'id-ID' : 'en-US', { 
        month: 'short' 
      }).format(dateObj);
    } catch (e) {
      return monthInput;
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'monitoring':
        return <MonitoringKlienPage clients={clients} />;
      case 'pengaduan':
        return (
          <PengaduanKlienPage
            returnTicketId={returnTicketId}
            onReturnTicketHandled={() => setReturnTicketId(null)}
          />
        );
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
              <h1 className="text-2xl font-bold text-gray-900">{t('tech_dashboard.metrics.title', 'Dashboard Teknisi')}</h1>
              <p className="text-gray-500">{t('tech_dashboard.metrics.subtitle', 'Monitoring & Manajemen Sistem Pelanggan BIEON')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Card 1: Total Pelanggan */}
              <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-400/20 blur-3xl group-hover:bg-blue-400/30 transition-colors"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-50 to-white border border-white/60 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-blue-600 drop-shadow-sm" />
                </div>
                <h3 className="text-[2.5rem] leading-none font-black text-gray-900 mb-2 relative z-10">{metrics.totalClients}</h3>
                <p className="text-gray-500 text-sm font-bold pt-1 relative z-10">{t('tech_dashboard.metrics.total_clients', 'Total Pelanggan Ditangani')}</p>
              </div>

              {/* Card 2: Akses Kendali Perangkat */}
              <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(5,155,39,0.15)] hover:-translate-y-1 group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-eco/20 blur-3xl group-hover:bg-eco/30 transition-colors"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-eco/5 to-white border border-white/60 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-7 h-7 text-eco drop-shadow-sm" />
                </div>
                <h3 className="text-[2.5rem] leading-none font-black text-gray-900 mb-2 relative z-10">{metrics.totalAccessCodes || 0}</h3>
                <p className="text-gray-500 text-sm font-bold pt-1 relative z-10">{t('tech_dashboard.metrics.access_codes', 'Akses Kendali Perangkat')}</p>
              </div>

              {/* Card 3: Smart Device Aktif */}
              <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(18,156,192,0.15)] hover:-translate-y-1 group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-sense/20 blur-3xl group-hover:bg-sense/30 transition-colors"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-sense/5 to-white border border-white/60 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <HardDrive className="w-7 h-7 text-sense drop-shadow-sm" />
                </div>
                <h3 className="text-[2.5rem] leading-none font-black text-gray-900 mb-2 relative z-10">{metrics.totalDevices}</h3>
                <p className="text-gray-500 text-sm font-bold pt-1 relative z-10">{t('tech_dashboard.metrics.active_devices', 'Smart Device Aktif')}</p>
              </div>

              {/* Card 4: Pengaduan Aktif */}
              <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)] hover:-translate-y-1 group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-red-400/20 blur-3xl group-hover:bg-red-400/30 transition-colors"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-red-50 to-white border border-white/60 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="w-7 h-7 text-red-500 drop-shadow-sm" />
                </div>
                <h3 className="text-[2.5rem] leading-none font-black text-gray-900 mb-2 relative z-10">{metrics.activeComplaints}</h3>
                <p className="text-gray-500 text-sm font-bold pt-1 relative z-10">{t('tech_dashboard.metrics.active_complaints', 'Pengaduan Aktif')}</p>
              </div>
            </div>

            {/* Monitoring Status Klien Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{t('tech_dashboard.table.title', 'Monitoring Status Pelanggan')}</h2>
                  <p className="text-gray-600 text-sm mt-1">{t('tech_dashboard.table.subtitle', 'Status Sistem Per Pelanggan')}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('table.search_placeholder', 'Cari No. Tiket, Nama Pelanggan, atau Topik...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-sense/100 focus:ring-4 focus:ring-sense/20 bg-white transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="relative w-full sm:w-auto">
                      <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-all w-full sm:w-auto shadow-sm"
                      >
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {statusFilter === 'all' ? t('tech_dashboard.table.filter_all', 'Semua Status Sistem') : 
                           statusFilter === 'online' ? t('tech_dashboard.table.status_online', 'Online') : 
                           statusFilter === 'offline' ? t('tech_dashboard.table.status_offline', 'Offline') : t('tech_dashboard.table.status_warning', 'Warning')}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isFilterOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                          <div className="py-1">
                            {[
                              { id: 'all', label: t('tech_dashboard.table.filter_all', 'Semua Status Sistem') },
                              { id: 'online', label: t('tech_dashboard.table.status_online', 'Online') },
                              { id: 'offline', label: t('tech_dashboard.table.status_offline', 'Offline') },
                              { id: 'warning', label: t('tech_dashboard.table.status_warning', 'Warning') }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  setStatusFilter(opt.id);
                                  setIsFilterOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-sense/5 ${statusFilter === opt.id ? 'text-sense bg-sense/5' : 'text-gray-600'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-eco text-white hover:bg-green-700 rounded-xl transition-colors shadow-sm shadow-eco/20 w-full sm:w-auto"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-semibold">{t('table.export', 'Export')}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{t('tech_dashboard.table.col_client_name', 'Nama Pelanggan')}</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{t('tech_dashboard.table.col_location', 'Lokasi')}</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{t('tech_dashboard.table.col_sys_status', 'Status Sistem')}</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{t('tech_dashboard.table.col_bieon', 'BIEON')}</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{t('tech_dashboard.table.col_device', 'Device')}</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{t('tech_dashboard.table.col_status', 'Status')}</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">{t('tech_dashboard.table.col_action', 'Aksi')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100/50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-100">
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
                            {client.status === 'online' ? t('tech_dashboard.table.status_online', 'Online') : 
                             client.status === 'offline' ? t('tech_dashboard.table.status_offline', 'Offline') : 
                             t('tech_dashboard.table.status_warning', 'Warning')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 bg-eco/10 rounded-lg text-green-700 font-bold">
                            {client.jumlahBieon}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 bg-sense/10 rounded-lg text-sky-700 font-bold">
                            {client.jumlahDevice}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                          {client.statusSistem === 'No BIEON Installed' ? t('tech_dashboard.table.no_bieon', 'Belum Ada BIEON Terpasang') : client.statusSistem}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-sense/10 text-sense hover:bg-sense hover:text-white rounded-lg transition-all text-sm font-semibold"
                          >
                            {t('tech_dashboard.table.btn_detail', 'Detail')}
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
                        <div className="w-10 h-10 bg-blue-100/50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 shadow-sm border border-blue-100">
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
                      <div className="bg-eco/5 p-2.5 rounded-xl border border-eco/10 flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-eco/10 rounded-lg flex items-center justify-center shrink-0">
                          <Cpu className="w-4 h-4 text-eco" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">BIEON</p>
                          <p className="text-sm font-bold text-green-700">{client.jumlahBieon}</p>
                        </div>
                      </div>
                      <div className="bg-sense/5 p-2.5 rounded-xl border border-sense/10 flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-sense/10 rounded-lg flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-sense" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Device</p>
                          <p className="text-sm font-bold text-sky-700">{client.jumlahDevice}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${client.statusSistem === 'Normal' ? 'text-gray-700 bg-gray-100 border border-gray-200' : 'text-rose-700 bg-rose-50 border border-rose-100'}`}>
                        {client.statusSistem === 'No BIEON Installed' ? t('tech_dashboard.table.no_bieon', 'Belum Ada BIEON Terpasang') : client.statusSistem}
                      </div>
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-sense text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-all shadow-sm shadow-sense/20 active:scale-95"
                      >
                        {t('tech_dashboard.table.btn_detail', 'Detail')} <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredClients.length === 0 && (
                  <div className="py-12 text-center text-gray-500 text-sm">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    {t('tech_dashboard.table.no_clients', 'Tidak ada pelanggan yang ditemukan.')}
                  </div>
                )}
              </div>
            </div>

            {/* Visualisasi Data Sistem */}
            {/* Bar Charts - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Bar Chart BIEON Instalasi */}
              <div className="bg-gradient-to-br from-white to-eco/5 rounded-3xl shadow-sm border border-eco/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{t('tech_dashboard.charts.token_access_title', 'Layanan Akses Kendali Perangkat')}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t('tech_dashboard.charts.token_access_sub', 'Frekuensi akses token per bulan')}</p>
                  </div>
                  <div className="w-12 h-12 bg-eco/10 rounded-2xl flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-eco" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={charts.bieonPerMonth} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
                    <XAxis
                      dataKey="bulan"
                      tickFormatter={(value) => getLocalizedMonthLabel(value, i18n.language)}
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
                      name="Akses Token"
                    />
                    <defs>
                      <linearGradient id="colorBieon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-eco)" stopOpacity={1} />
                        <stop offset="100%" stopColor="var(--color-sense)" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart Klien Ditangani */}
              <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl shadow-sm border border-blue-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{t('tech_dashboard.charts.clients_title', 'Pertumbuhan Pelanggan BIEON')}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t('tech_dashboard.charts.clients_sub', 'Jumlah klien baru per bulan')}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100/50 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={charts.klienPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9d5ff" vertical={false} />
                    <XAxis
                      dataKey="bulan"
                      tickFormatter={(value) => getLocalizedMonthLabel(value, i18n.language)}
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
                      stroke="#a855f7"
                      strokeWidth={3}
                      dot={{ fill: '#a855f7', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Total Klien"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Charts - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tren Pengaduan */}
              <div className="bg-gradient-to-br from-white to-red-50/50 rounded-3xl shadow-sm border border-red-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{t('tech_dashboard.charts.complaints_title', 'Tren Pengaduan Pelanggan')}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t('tech_dashboard.charts.complaints_sub', 'Intensitas aduan per bulan')}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100/50 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={charts.pengaduanTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" vertical={false} />
                    <XAxis
                      dataKey="bulan"
                      tickFormatter={(value) => getLocalizedMonthLabel(value, i18n.language)}
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
              <div className="bg-gradient-to-br from-white to-sense/5 rounded-3xl shadow-sm border border-sense/10 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{t('tech_dashboard.charts.map_title', 'Live Monitoring Area BIEON')}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t('tech_dashboard.charts.map_sub', 'Distribusi lokasi klien aktif')}</p>
                  </div>
                  <div className="w-12 h-12 bg-sense/10 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-sense" />
                  </div>
                </div>
                <div className="flex-1 w-full rounded-2xl overflow-hidden mt-2 relative min-h-[300px]">
                  <ClientLiveMap clients={clients} isLoading={isLoading} />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderComplaintStatus = (client) => {
    if (!client.statusPengaduan || client.statusPengaduan === 'Tidak ada') {
      return t('tech_dashboard.client_modal.no_tickets', 'Tidak ada');
    }
    const match = client.statusPengaduan.match(/\d+/);
    if (match) {
      return t('tech_dashboard.client_modal.active_tickets', { count: parseInt(match[0], 10) });
    }
    return client.statusPengaduan;
  };

  const renderInstallDate = (client) => {
    if (client.createdAtRaw) {
      try {
        return new Intl.DateTimeFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(new Date(client.createdAtRaw));
      } catch (e) {
        // fallback below
      }
    }
    if (client.tanggalInstalasi && client.tanggalInstalasi !== '-') {
      if (i18n.language === 'en') {
        const parts = client.tanggalInstalasi.split(' ');
        if (parts.length === 3) {
          const monthsId = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
          const mIndex = monthsId.findIndex(m => m.toLowerCase().startsWith(parts[1].toLowerCase()));
          if (mIndex !== -1) {
            const dObj = new Date(parseInt(parts[2], 10), mIndex, parseInt(parts[0], 10));
            return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(dObj);
          }
        }
      }
      return client.tanggalInstalasi;
    }
    return '-';
  };

  const renderLastUpdate = (client) => {
    if (client.lastUpdateRaw) {
      try {
        return new Intl.DateTimeFormat(i18n.language === 'id' ? 'id-ID' : 'en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(client.lastUpdateRaw));
      } catch (e) {
        // fallback below
      }
    }
    return client.lastUpdate || '-';
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
            <div className="sticky top-0 bg-gradient-to-r from-eco to-sense text-white p-6 rounded-t-3xl flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{t('tech_dashboard.client_modal.title', 'Detail Pelanggan')}</h2>
                <p className="text-eco/50">{t('tech_dashboard.client_modal.subtitle', 'Informasi Lengkap Sistem Smart Home')}</p>
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
                <div className="w-16 h-16 bg-gradient-to-br from-eco/50 to-sense rounded-full flex items-center justify-center text-white font-bold text-xl">
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
                <h4 className="font-bold text-gray-800 mb-4 text-lg">{t('tech_dashboard.client_modal.section_stats', 'Statistik Sistem')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-eco/5 to-sense/10 rounded-2xl p-5 border border-eco/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-eco/50 to-sense rounded-xl flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">{t('tech_dashboard.client_modal.total_bieon', 'Jumlah BIEON')}</p>
                        <p className="text-3xl font-bold text-gray-800">{selectedClient.jumlahBieon}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-sense/5 to-cyan-50 rounded-2xl p-5 border border-sense/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-sense/50 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">{t('tech_dashboard.client_modal.total_devices', 'Total Perangkat')}</p>
                        <p className="text-3xl font-bold text-gray-800">{selectedClient.jumlahDevice}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-eco/10 rounded-2xl p-5 border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-eco rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">{t('tech_dashboard.client_modal.device_online', 'Device Online')}</p>
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
                        <p className="text-xs text-gray-600 font-semibold">{t('tech_dashboard.client_modal.device_offline', 'Device Offline')}</p>
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
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">{t('tech_dashboard.client_modal.section_contact', 'Informasi Kontak')}</h4>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 mb-1">{t('tech_dashboard.client_modal.phone', 'Nomor Telepon')}</p>
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
                        <p className="text-xs font-semibold text-gray-600 mb-1">{t('tech_dashboard.client_modal.email', 'Email')}</p>
                        <p className="font-bold text-gray-800 break-words">{selectedClient.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-eco/5 to-sense/10 rounded-xl p-4 border border-eco/20">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-eco flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 mb-1">{t('tech_dashboard.client_modal.address', 'Alamat Lengkap')}</p>
                        <p className="font-bold text-gray-800">{selectedClient.alamatLengkap}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Status & Dates */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">{t('tech_dashboard.client_modal.section_info', 'Status & Informasi')}</h4>
                  <div className={`rounded-xl p-5 border-2 ${selectedClient.adaPengaduan ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200' : 'bg-gradient-to-br from-green-50 to-eco/10 border-green-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className={`w-6 h-6 ${selectedClient.adaPengaduan ? 'text-red-600' : 'text-green-600'}`} />
                      <p className="text-sm font-semibold text-gray-600">{t('tech_dashboard.client_modal.complaint_status', 'Status Pengaduan')}</p>
                    </div>
                    <p className={`text-xl font-bold ${selectedClient.adaPengaduan ? 'text-red-700' : 'text-green-700'}`}>
                      {renderComplaintStatus(selectedClient)}
                    </p>
                  </div>

                  <div className={`rounded-xl p-5 border-2 ${selectedClient.status === 'online' ? 'bg-gradient-to-br from-green-50 to-eco/10 border-green-200' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className={`w-6 h-6 ${selectedClient.status === 'online' ? 'text-green-600' : 'text-red-600'}`} />
                      <p className="text-sm font-semibold text-gray-600">{t('tech_dashboard.client_modal.system_active', 'System Active')}</p>
                    </div>
                    <p className={`text-xl font-bold ${selectedClient.status === 'online' ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedClient.status === 'online' ? t('tech_dashboard.client_modal.status_active', 'Aktif') : selectedClient.status === 'offline' ? t('tech_dashboard.client_modal.status_inactive', 'Tidak Aktif') : t('tech_dashboard.client_modal.status_issue', 'Masalah')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                      <p className="text-xs font-semibold text-gray-600 mb-1">{t('tech_dashboard.client_modal.install_date', 'Tanggal Instalasi')}</p>
                      <p className="font-bold text-gray-800 text-sm">{renderInstallDate(selectedClient)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
                      <p className="text-xs font-semibold text-gray-600 mb-1">{t('tech_dashboard.client_modal.last_update', 'Update Terakhir')}</p>
                      <p className="font-bold text-gray-800 text-sm">{renderLastUpdate(selectedClient)}</p>
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