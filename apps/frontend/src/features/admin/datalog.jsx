import { useMemo, useState } from 'react';
import { SuperAdminLayout } from './SuperAdminLayout';
import TechnicianLayout from '../technician/TechnicianLayout';
import {
  Database,
  Search,
  Calendar,
  Download,
  Thermometer,
  Droplets,
  Wind,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Package,
  TrendingUp,
  Activity,
  Network,
  FileText,
  Brain,
  Sparkles,
  ArrowRight,
  Server,
  Radio,
  CircleDot,
  Eye,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock historical data for mini chart
const mockHistoricalData = [
  { time: '10:00', value: 23 },
  { time: '10:15', value: 24 },
  { time: '10:30', value: 26 },
  { time: '10:45', value: 28 },
  { time: '11:00', value: 32 },
  { time: '11:15', value: 35 },
  { time: '11:30', value: 33 },
];

// Mock data logs
const mockLogs = [
  {
    id: 'LOG001',
    timestamp: '31 Mar 2026 14:30:45',
    client: 'Ahmad Fauzi',
    device: 'Smart Thermostat',
    hubNode: 'Hub Node R1 (HN001)',
    dataType: 'Temperature',
    sensorValue: '26.5°C',
    systemStatus: 'Normal',
    location: 'Living Room',
    description: 'Temperature reading within normal range'
  },
  {
    id: 'LOG002',
    timestamp: '31 Mar 2026 14:30:30',
    client: 'Ahmad Fauzi',
    device: 'Humidity Sensor',
    hubNode: 'Hub Node R1 (HN001)',
    dataType: 'Humidity',
    sensorValue: '65%',
    systemStatus: 'Normal',
    location: 'Living Room',
    description: 'Humidity level stable'
  },
  {
    id: 'LOG003',
    timestamp: '31 Mar 2026 14:30:15',
    client: 'Siti Nurhaliza',
    device: 'Air Quality Monitor',
    hubNode: 'Hub Node R2 (HN005)',
    dataType: 'Air Quality',
    sensorValue: '85 AQI',
    systemStatus: 'Normal',
    location: 'Bedroom',
    description: 'Air quality good'
  },
  {
    id: 'LOG004',
    timestamp: '31 Mar 2026 14:30:00',
    client: 'Ahmad Fauzi',
    device: 'Energy Meter',
    hubNode: 'Hub Node R2 (HN002)',
    dataType: 'Energy Usage',
    sensorValue: '2.3 kWh',
    systemStatus: 'Normal',
    location: 'Bedroom',
    description: 'Energy consumption normal'
  },
  {
    id: 'LOG005',
    timestamp: '31 Mar 2026 14:29:45',
    client: 'Budi Santoso',
    device: 'Smart Thermostat',
    hubNode: 'Hub Node R1 (HN007)',
    dataType: 'Temperature',
    sensorValue: '35.5°C',
    systemStatus: 'Warning',
    location: 'Kitchen',
    description: 'Temperature spike detected - possible cooking activity'
  },
  {
    id: 'LOG006',
    timestamp: '31 Mar 2026 14:29:30',
    client: 'Dewi Lestari',
    device: 'Humidity Sensor',
    hubNode: 'Hub Node R1 (HN013)',
    dataType: 'Humidity',
    sensorValue: '70%',
    systemStatus: 'Normal',
    location: 'Bathroom',
    description: 'Humidity within acceptable range'
  },
  {
    id: 'LOG007',
    timestamp: '31 Mar 2026 14:29:15',
    client: 'Linda Wijaya',
    device: 'Air Quality Monitor',
    hubNode: 'Hub Node R3 (HN018)',
    dataType: 'Air Quality',
    sensorValue: '120 AQI',
    systemStatus: 'Warning',
    location: 'Garage',
    description: 'Elevated particle levels - ventilation recommended'
  },
  {
    id: 'LOG008',
    timestamp: '31 Mar 2026 14:29:00',
    client: 'Siti Nurhaliza',
    device: 'Energy Meter',
    hubNode: 'Hub Node R2 (HN005)',
    dataType: 'Energy Usage',
    sensorValue: '1.8 kWh',
    systemStatus: 'Normal',
    location: 'Living Room',
    description: 'Power consumption stable'
  },
  {
    id: 'LOG009',
    timestamp: '31 Mar 2026 14:28:45',
    client: 'Budi Santoso',
    device: 'Smart Thermostat',
    hubNode: 'Hub Node R2 (HN008)',
    dataType: 'Temperature',
    sensorValue: 'N/A',
    systemStatus: 'Critical',
    location: 'Bedroom',
    description: 'Device not responding - connection timeout after 3 minutes'
  },
  {
    id: 'LOG010',
    timestamp: '31 Mar 2026 14:28:30',
    client: 'Ahmad Fauzi',
    device: 'Humidity Sensor',
    hubNode: 'Hub Node R3 (HN003)',
    dataType: 'Humidity',
    sensorValue: '63%',
    systemStatus: 'Normal',
    location: 'Office',
    description: 'Humidity optimal for electronics'
  },
  {
    id: 'LOG011',
    timestamp: '31 Mar 2026 14:28:15',
    client: 'Linda Wijaya',
    device: 'Air Quality Monitor',
    hubNode: 'Hub Node R2 (HN019)',
    dataType: 'Air Quality',
    sensorValue: '88 AQI',
    systemStatus: 'Normal',
    location: 'Living Room',
    description: 'Air quality satisfactory'
  },
  {
    id: 'LOG012',
    timestamp: '31 Mar 2026 14:28:00',
    client: 'Dewi Lestari',
    device: 'Energy Meter',
    hubNode: 'Hub Node R1 (HN013)',
    dataType: 'Energy Usage',
    sensorValue: '4.5 kWh',
    systemStatus: 'Warning',
    location: 'Kitchen',
    description: 'Unusual power spike - multiple appliances detected'
  },
  {
    id: 'LOG013',
    timestamp: '31 Mar 2026 14:27:45',
    client: 'Rizki Pratama',
    device: 'Smart Thermostat',
    hubNode: 'Hub Node R1 (HN011)',
    dataType: 'Temperature',
    sensorValue: 'N/A',
    systemStatus: 'Critical',
    location: 'Garage',
    description: 'Communication error - Hub Node connectivity unstable'
  },
  {
    id: 'LOG014',
    timestamp: '31 Mar 2026 14:27:30',
    client: 'Ahmad Fauzi',
    device: 'Humidity Sensor',
    hubNode: 'Hub Node R4 (HN004)',
    dataType: 'Humidity',
    sensorValue: '61%',
    systemStatus: 'Normal',
    location: 'Bedroom',
    description: 'Comfort level maintained'
  },
  {
    id: 'LOG015',
    timestamp: '31 Mar 2026 14:27:15',
    client: 'Siti Nurhaliza',
    device: 'Air Quality Monitor',
    hubNode: 'Hub Node R2 (HN006)',
    dataType: 'Air Quality',
    sensorValue: '86 AQI',
    systemStatus: 'Normal',
    location: 'Bedroom',
    description: 'Air circulation adequate'
  },
];

export function DataLogSistemPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = (() => {
    if (!token) return localStorage.getItem('role');
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload?.role || localStorage.getItem('role');
    } catch {
      return localStorage.getItem('role');
    }
  })();
  const isTechnician = role === 'Technician';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDevice, setFilterDevice] = useState('All');
  const [filterHub, setFilterHub] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState('Today');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'anomaly' | 'critical'
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleNavigate = (menuId) => {
    const routes = {
      dashboard: '/admin',
      akun: '/admin-pelanggan',
      teknisi: '/admin-teknisi',
      pengaduan: '/admin-complaint',
      tarif: '/admin-tariff',
      datalog: '/admin-datalog',
      history: '/admin-history',
      settings: '/admin',
    };
    navigate(routes[menuId] || '/admin');
  };

  const handleTechnicianMenuNavigate = () => {
    navigate('/teknisi');
  };

  // Filter data
  const filteredLogs = useMemo(() => mockLogs.filter((log) => {
    const matchesSearch =
      log.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.hubNode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDevice = filterDevice === 'All' || log.device === filterDevice;
    const matchesHub = filterHub === 'All' || log.hubNode === filterHub;
    
    const matchesMode = 
      filterMode === 'all' ? true :
      filterMode === 'anomaly' ? log.systemStatus === 'Warning' || log.systemStatus === 'Critical' :
      filterMode === 'critical' ? log.systemStatus === 'Critical' : true;
    
    return matchesSearch && matchesDevice && matchesHub && matchesMode;
  }), [searchQuery, filterDevice, filterHub, filterMode]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Get unique devices and hubs
  const uniqueDevices = useMemo(() => ['All', ...Array.from(new Set(mockLogs.map(l => l.device)))], []);
  const uniqueHubs = useMemo(() => ['All', ...Array.from(new Set(mockLogs.map(l => l.hubNode)))], []);

  // Stats
  const stats = useMemo(() => {
    const totalToday = mockLogs.length;
    const totalAnomalies = mockLogs.filter(l => l.systemStatus === 'Warning' || l.systemStatus === 'Critical').length;
    const criticalCount = mockLogs.filter(l => l.systemStatus === 'Critical').length;
    const warningCount = mockLogs.filter(l => l.systemStatus === 'Warning').length;
    const devicesIssues = new Set(mockLogs.filter(l => l.systemStatus === 'Critical').map(l => l.device)).size;
    const systemStatus = criticalCount > 0 ? 'Critical' : warningCount > 2 ? 'Warning' : 'Normal';
    return { totalToday, totalAnomalies, devicesIssues, systemStatus };
  }, []);

  const getDataTypeIcon = (dataType) => {
    switch (dataType) {
      case 'Temperature':
        return <Thermometer className="w-4 h-4 text-orange-600" />;
      case 'Humidity':
        return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'Air Quality':
        return <Wind className="w-4 h-4 text-green-600" />;
      case 'Energy Usage':
        return <Zap className="w-4 h-4 text-purple-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAIInsight = (log) => {
    if (log.systemStatus === 'Critical' && log.sensorValue === 'N/A') {
      return {
        title: 'Connection Failure Detected',
        insights: [
          '🔴 Device not responding for 3+ minutes',
          '⚠️ Hub Node connectivity may be unstable',
          '💡 Recommended: Check network connection and device power'
        ],
        severity: 'high'
      };
    } else if (log.systemStatus === 'Warning' && log.dataType === 'Temperature') {
      return {
        title: 'Temperature Anomaly',
        insights: [
          '🟡 Temperature 20% above normal baseline',
          '📊 Pattern suggests temporary environmental change',
          '💡 Monitoring for 15 minutes before alert escalation'
        ],
        severity: 'medium'
      };
    } else if (log.systemStatus === 'Warning' && log.dataType === 'Energy Usage') {
      return {
        title: 'Power Consumption Spike',
        insights: [
          '🟡 Energy usage 50% higher than average',
          '🔌 Multiple high-power devices detected',
          '💡 Consider load balancing or staggered operation'
        ],
        severity: 'medium'
      };
    }
    return {
      title: 'System Operating Normally',
      insights: [
        '✅ All parameters within expected range',
        '📈 Performance stable over last 24 hours',
        '💡 No action required'
      ],
      severity: 'low'
    };
  };

  const pageContent = (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Data Log & Diagnostics</h1>
                  <p className="text-gray-400 text-sm mt-1">Monitoring aktivitas sistem, deteksi anomali, dan analisis perangkat secara real-time</p>
                </div>
              </div>
              
              {/* Badges */}
              <div className="flex gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-sm font-semibold">Real-time Monitoring</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-sm font-semibold">AI Insight Enabled</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg">
                <FileText className="w-5 h-5" />
                Export PDF
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-xl text-white rounded-xl font-semibold transition-all shadow-lg">
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="col-span-2 relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="w-full pl-12 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
              >
                {uniqueDevices.map(device => (
                  <option key={device} value={device}>{device === 'All' ? 'All Devices' : device}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 relative">
              <Network className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterHub}
                onChange={(e) => setFilterHub(e.target.value)}
                className="w-full pl-12 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
              >
                {uniqueHubs.map(hub => (
                  <option key={hub} value={hub}>{hub === 'All' ? 'All Hub Nodes' : hub}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="w-full pl-12 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="Today">Today</option>
                <option value="7 Days">Last 7 Days</option>
                <option value="30 Days">Last 30 Days</option>
                <option value="3 Months">Last 3 Months</option>
              </select>
            </div>
            <div className="col-span-3 flex gap-2 bg-gray-800/50 border border-gray-700 rounded-xl p-1">
              <button
                onClick={() => setFilterMode('all')}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterMode === 'all' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                All Data
              </button>
              <button
                onClick={() => setFilterMode('anomaly')}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterMode === 'anomaly' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Anomaly
              </button>
              <button
                onClick={() => setFilterMode('critical')}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterMode === 'critical' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Critical
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl border border-blue-500/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-300" />
              </div>
              <p className="text-blue-200 text-sm mb-1">Total Logs Hari Ini</p>
              <p className="text-4xl font-bold">{stats.totalToday}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-6 text-white shadow-xl border border-amber-500/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <Activity className="w-5 h-5 text-amber-300" />
              </div>
              <p className="text-amber-200 text-sm mb-1">Total Anomali</p>
              <p className="text-4xl font-bold">{stats.totalAnomalies}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-xl border border-red-500/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <Package className="w-5 h-5 text-red-300" />
              </div>
              <p className="text-red-200 text-sm mb-1">Device Bermasalah</p>
              <p className="text-4xl font-bold">{stats.devicesIssues}</p>
            </div>
          </div>

          <div className={`bg-gradient-to-br rounded-2xl p-6 text-white shadow-xl border relative overflow-hidden ${
            stats.systemStatus === 'Critical' ? 'from-red-600 to-red-700 border-red-500/50' :
            stats.systemStatus === 'Warning' ? 'from-yellow-600 to-yellow-700 border-yellow-500/50' :
            'from-emerald-600 to-emerald-700 border-emerald-500/50'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {stats.systemStatus === 'Critical' ? <XCircle className="w-6 h-6" /> :
                   stats.systemStatus === 'Warning' ? <AlertTriangle className="w-6 h-6" /> :
                   <CheckCircle className="w-6 h-6" />}
                </div>
                <Sparkles className={`w-5 h-5 ${
                  stats.systemStatus === 'Critical' ? 'text-red-300' :
                  stats.systemStatus === 'Warning' ? 'text-yellow-300' :
                  'text-emerald-300'
                }`} />
              </div>
              <p className={`text-sm mb-1 ${
                stats.systemStatus === 'Critical' ? 'text-red-200' :
                stats.systemStatus === 'Warning' ? 'text-yellow-200' :
                'text-emerald-200'
              }`}>Status Sistem</p>
              <p className="text-4xl font-bold">{stats.systemStatus}</p>
            </div>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT: Log Table (70%) */}
          <div className="col-span-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">System Logs Timeline</h3>
                  <p className="text-sm text-gray-600 mt-1">Real-time activity monitoring from all IoT devices</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-xl">
                  <CircleDot className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-700">Live</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Device</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hub Node</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Value</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className={`hover:bg-emerald-50 transition-all cursor-pointer ${
                        log.systemStatus === 'Critical' ? 'bg-red-50 border-l-4 border-l-red-500' :
                        log.systemStatus === 'Warning' ? 'bg-yellow-50 border-l-4 border-l-yellow-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-mono">{log.timestamp}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getDataTypeIcon(log.dataType)}
                          <span className="text-sm font-semibold text-gray-800">{log.device}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-600">{log.hubNode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-800">{log.sensorValue}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          log.systemStatus === 'Normal'
                            ? 'bg-emerald-100 text-emerald-700'
                            : log.systemStatus === 'Warning'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {log.systemStatus === 'Normal' ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : log.systemStatus === 'Warning' ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {log.systemStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{startIndex + 1}</span> - {' '}
                <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredLogs.length)}</span> of{' '}
                <span className="font-semibold">{filteredLogs.length}</span> logs
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-all font-semibold text-sm ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Detail Panel (30%) */}
          <div className="col-span-4 space-y-6">
            {selectedLog ? (
              <>
                {/* Detail Information */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-emerald-600" />
                    Detail Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Device Name</p>
                      <p className="text-sm font-bold text-gray-900">{selectedLog.device}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Location</p>
                      <p className="text-sm font-bold text-gray-900">{selectedLog.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Hub Node</p>
                      <p className="text-sm font-bold text-gray-900">{selectedLog.hubNode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status Terakhir</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        selectedLog.systemStatus === 'Normal'
                          ? 'bg-emerald-100 text-emerald-700'
                          : selectedLog.systemStatus === 'Warning'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {selectedLog.systemStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Description</p>
                      <p className="text-sm text-gray-700">{selectedLog.description}</p>
                    </div>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    Sensor History
                  </h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={mockHistoricalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* AI Insight */}
                <div className={`rounded-2xl shadow-xl border p-6 ${
                  getAIInsight(selectedLog).severity === 'high' ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' :
                  getAIInsight(selectedLog).severity === 'medium' ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200' :
                  'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
                }`}>
                  <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    getAIInsight(selectedLog).severity === 'high' ? 'text-red-900' :
                    getAIInsight(selectedLog).severity === 'medium' ? 'text-yellow-900' :
                    'text-emerald-900'
                  }`}>
                    <Brain className="w-5 h-5" />
                    System Insight
                  </h3>
                  <p className={`font-bold mb-3 ${
                    getAIInsight(selectedLog).severity === 'high' ? 'text-red-800' :
                    getAIInsight(selectedLog).severity === 'medium' ? 'text-yellow-800' :
                    'text-emerald-800'
                  }`}>{getAIInsight(selectedLog).title}</p>
                  <div className="space-y-2">
                    {getAIInsight(selectedLog).insights.map((insight, idx) => (
                      <div key={idx} className={`text-sm ${
                        getAIInsight(selectedLog).severity === 'high' ? 'text-red-700' :
                        getAIInsight(selectedLog).severity === 'medium' ? 'text-yellow-700' :
                        'text-emerald-700'
                      }`}>
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Dependency */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Network className="w-5 h-5 text-emerald-400" />
                    Device Hierarchy
                  </h3>
                  <div className="space-y-4">
                    {/* Master BIEON */}
                    <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <Server className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Master BIEON</p>
                        <p className="text-gray-400 text-xs">Main Controller</p>
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ArrowRight className="w-6 h-6 text-gray-600 rotate-90" />
                    </div>

                    {/* Hub Node */}
                    <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Radio className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{selectedLog.hubNode}</p>
                        <p className="text-gray-400 text-xs">Hub Node</p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ArrowRight className="w-6 h-6 text-gray-600 rotate-90" />
                    </div>

                    {/* Smart Device */}
                    <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                        {getDataTypeIcon(selectedLog.dataType)}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{selectedLog.device}</p>
                        <p className="text-gray-400 text-xs">Smart Device</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-900 font-bold text-lg mb-2">Select a Log Entry</p>
                <p className="text-gray-500 text-sm">Click on any log entry in the table to view detailed information and insights</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );

  if (isTechnician) {
    return (
      <TechnicianLayout
        activeMenu="pengaduan"
        setActiveMenu={handleTechnicianMenuNavigate}
        onNavigate={handleTechnicianMenuNavigate}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {pageContent}
        </div>
      </TechnicianLayout>
    );
  }

  return (
    <SuperAdminLayout activeMenu="datalog" onNavigate={handleNavigate}>
      {pageContent}
    </SuperAdminLayout>
  );
}
