import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Home,
  Zap,
  Bell,
  ChevronRight,
  ChevronDown,
  Download,
  Droplets,
  Thermometer,
  Wind,
  Activity,
  Eye,
  X,
  FileDown,
  Camera,
  Lock,
  Fan,
  AlertTriangle,
  TrendingUp,
  Clock,
  Calendar,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Settings,
  DoorOpen,
  DoorClosed,
  Beaker,
  ToggleRight,
  Power
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import NotificationPopup from '../../components/NotificationPopup';
import HomeownerLayout from './HomeownerLayout';
import { StatusBadge } from '../../shared/StatusBadge';

// ─────── Static mock data (outside component to avoid re-creation per render) ───────

const ROOMS = [
  { id: 'all', name: 'All Room', devices: 15 },
  { id: 'r1', name: 'R1 - Living Room', devices: 6 },
  { id: 'r2', name: 'R2 - Bedroom', devices: 4 },
  { id: 'r3', name: 'R3 - Kitchen', devices: 4 },
  { id: 'r4', name: 'R4 - Garage', devices: 3 },
];

const DEVICES_PER_ROOM = {
  all: [
    { name: 'CCTV Dapur', room: 'Kitchen', status: 'ON', power: 15, type: 'security' },
    { name: 'CCTV Depan', room: 'Garage', status: 'ON', power: 15, type: 'security' },
    { name: 'Lampu Tamu 1', room: 'Living Room', status: 'ON', power: 25, type: 'lighting' },
    { name: 'Lampu Tamu 2', room: 'Living Room', status: 'OFF', power: 0, type: 'lighting' },
    { name: 'AC Kamar', room: 'Bedroom', status: 'ON', power: 750, type: 'comfort' },
    { name: 'Kipas Produksi', room: 'Garage', status: 'OFF', power: 0, type: 'comfort' },
    { name: 'Lampu Kamar', room: 'Bedroom', status: 'ON', power: 20, type: 'lighting' },
    { name: 'Smart Plug Kitchen', room: 'Kitchen', status: 'ON', power: 100, type: 'appliance' },
    { name: 'Door Sensor Depan', room: 'Living Room', status: 'ON', power: 2, type: 'security' },
    { name: 'Wi-Fi Router', room: 'Living Room', status: 'ON', power: 12, type: 'network' },
    { name: 'Motion Sensor', room: 'Bedroom', status: 'ON', power: 3, type: 'security' },
    { name: 'Lampu Terrace', room: 'Terrace', status: 'ON', power: 15, type: 'lighting' },
    { name: 'Smart Plug Terrace', room: 'Terrace', status: 'ON', power: 50, type: 'appliance' },
    { name: 'Lampu Garage', room: 'Garage', status: 'OFF', power: 0, type: 'lighting' },
  ],
  r1: [
    { name: 'AC', room: 'Living Room', status: 'ON', power: 750, type: 'comfort' },
    { name: 'Lampu', room: 'Living Room', status: 'ON', power: 20, type: 'lighting' },
    { name: 'Lampu 2', room: 'Living Room', status: 'ON', power: 25, type: 'lighting' },
    { name: 'Motion Sensor', room: 'Living Room', status: 'OFF', power: 0, type: 'security' },
  ],
  r2: [
    { name: 'AC Kamar', room: 'Bedroom', status: 'ON', power: 750, type: 'comfort' },
    { name: 'Lampu Kamar', room: 'Bedroom', status: 'ON', power: 20, type: 'lighting' },
    { name: 'Motion Sensor', room: 'Bedroom', status: 'ON', power: 3, type: 'security' },
    { name: 'Kipas Angin', room: 'Bedroom', status: 'OFF', power: 0, type: 'comfort' },
  ],
  r3: [
    { name: 'CCTV Dapur', room: 'Kitchen', status: 'ON', power: 15, type: 'security' },
    { name: 'Smart Plug Kitchen', room: 'Kitchen', status: 'ON', power: 100, type: 'appliance' },
    { name: 'Lampu Dapur', room: 'Kitchen', status: 'ON', power: 30, type: 'lighting' },
  ],
  r4: [
    { name: 'CCTV Depan', room: 'Garage', status: 'ON', power: 15, type: 'security' },
    { name: 'Kipas Produksi', room: 'Garage', status: 'OFF', power: 0, type: 'comfort' },
    { name: 'Lampu Garage', room: 'Garage', status: 'OFF', power: 0, type: 'lighting' },
  ],
};

const ROOM_SENSORS = {
  all: {
    comfort: { temp: 26, humidity: 68, comfortLevel: 82 },
    waterQuality: { status: 'drinkable', ph: 7.2, turbidity: 2.1, tds: 78, temp: 24 },
    security: [
      { type: 'Door Sensor - Terrace', status: 'Closed', room: 'Terrace' },
      { type: 'Door Sensor - Garage', status: 'Closed', room: 'Garage' },
    ],
  },
  r1: {
    comfort: { temp: 26, humidity: 68, comfortLevel: 82 },
    security: [
      { type: 'Motion Sensor', status: 'Active', room: 'Bedroom' },
      { type: 'Door Sensor', status: 'Closed', room: 'Living Room' },
    ],
  },
  r2: { comfort: { temp: 26, humidity: 68, comfortLevel: 82 } },
  r3: {
    waterQuality: { status: 'drinkable', ph: 7.2, turbidity: 2.1, tds: 78, temp: 24 },
    security: [],
  },
  r4: {
    security: [
      { type: 'Door Sensor', status: 'Closed', room: 'Terrace' },
      { type: 'Door Sensor', status: 'Closed', room: 'Garage' },
    ],
  },
};

const DAILY_ENERGY_DATA = [
  { time: '00:00', kwh: 0.245, cost: 2450 },
  { time: '01:00', kwh: 0.198, cost: 1980 },
  { time: '02:00', kwh: 0.167, cost: 1670 },
  { time: '03:00', kwh: 0.189, cost: 1890 },
  { time: '04:00', kwh: 0.212, cost: 2120 },
  { time: '05:00', kwh: 0.312, cost: 3120 },
  { time: '06:00', kwh: 0.445, cost: 4450 },
  { time: '07:00', kwh: 0.523, cost: 5230 },
  { time: '08:00', kwh: 0.589, cost: 5890 },
  { time: '09:00', kwh: 0.612, cost: 6120 },
  { time: '10:00', kwh: 0.567, cost: 5670 },
  { time: '11:00', kwh: 0.634, cost: 6340 },
  { time: '12:00', kwh: 0.701, cost: 7010 },
  { time: '13:00', kwh: 0.678, cost: 6780 },
  { time: '14:00', kwh: 0.645, cost: 6450 },
  { time: '15:00', kwh: 0.598, cost: 5980 },
  { time: '16:00', kwh: 0.534, cost: 5340 },
];

const MONTHLY_ENERGY_DATA = [
  { month: 'Jan', kwh: 100, cost: 100000 },
  { month: 'Feb', kwh: 90, cost: 90000 },
  { month: 'Mar', kwh: 95, cost: 95000 },
  { month: 'Apr', kwh: 105, cost: 105000 },
  { month: 'Mei', kwh: 130, cost: 130000 },
  { month: 'Jun', kwh: 160, cost: 160000 },
  { month: 'Jul', kwh: 180, cost: 180000 },
  { month: 'Agt', kwh: 195, cost: 195000 },
  { month: 'Sep', kwh: 205, cost: 205000 },
  { month: 'Okt', kwh: 195, cost: 195000 },
  { month: 'Nov', kwh: 210, cost: 210000 },
  { month: 'Des', kwh: 230, cost: 230000 },
];

const NOTIFICATIONS = [
  { id: 1, title: 'Motion Detected', desc: 'Gerakan terdeteksi di ruang tamu', type: 'security', time: '2 min ago', icon: Activity },
  { id: 2, title: 'Suhu Tinggi - Kipas Auto ON', desc: 'Suhu ruang produksi 31°C, kipas otomatis menyala', type: 'auto', time: '5 min ago', icon: Fan },
  { id: 3, title: 'Door Sensor Alert', desc: 'Pintu depan terbuka tanpa otoritas', type: 'security', time: '15 min ago', icon: Lock },
  { id: 4, title: 'Peringatan Token PLN', desc: 'Sisa token PLN hampir habis (Rp 50.000)', type: 'warning', time: '1 hour ago', icon: Zap },
  { id: 5, title: 'Kualitas Udara Buruk', desc: 'CO₂ melebihi batas normal (1200 ppm)', type: 'warning', time: '2 hours ago', icon: Wind },
];

function Toast({ message, type = 'success', onClose }) {
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

function ComplaintModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    device: '',
    issue: '',
    description: '',
    priority: 'medium'
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Auto-close after 2 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ device: '', issue: '', description: '', priority: 'medium' });
      onClose();
    }, 2000);
  };

  // Inline success feedback instead of alert()
  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pengaduan Terkirim!</h3>
          <p className="text-gray-500 text-sm">Tim kami akan segera menindaklanjuti pengaduan Anda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 sm:px-8 py-4 sm:py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Form Pengaduan</h2>
                <p className="text-emerald-100 text-sm mt-1">Laporkan kendala atau gangguan perangkat BIEON</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8 overflow-y-auto flex-1">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Perangkat Bermasalah <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.device}
                onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Pilih perangkat...</option>
                <option>CCTV Dapur</option>
                <option>CCTV Depan</option>
                <option>Lampu Ruang Tamu</option>
                <option>AC Kamar</option>
                <option>Door Sensor</option>
                <option>Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jenis Masalah <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Pilih jenis masalah...</option>
                <option>Perangkat tidak merespon</option>
                <option>Sensor tidak akurat</option>
                <option>Koneksi terputus</option>
                <option>Kerusakan fisik</option>
                <option>Error response</option>
                <option>Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prioritas
              </label>
              <div className="flex gap-3">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: level })}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${formData.priority === level
                      ? level === 'high'
                        ? 'bg-red-600 text-white'
                        : level === 'medium'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {level === 'high' ? 'Tinggi' : level === 'medium' ? 'Sedang' : 'Rendah'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deskripsi Masalah <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                placeholder="Jelaskan masalah yang Anda alami secara detail..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Send className="w-5 h-5" />
              Kirim Pengaduan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DataModal({ isOpen, onClose, chartType, energySummary }) {
  if (!isOpen) return null;

  const data = chartType === 'daily' 
    ? (energySummary?.dailyData || []) 
    : (energySummary?.monthlyData || []);
    
  const title = chartType === 'daily' ? 'Data Energi Harian (Hari Berjalan)' : 'Data Energi Bulanan (1 Tahun Terakhir)';

  const totalKwh = data.reduce((acc, curr) => acc + (curr.kwh || 0), 0);
  const totalCost = data.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [chartType === 'daily' ? 'Jam' : 'Bulan', 'Konsumsi (kWh)', chartType === 'daily' ? 'Daya (Watt)' : '', 'Biaya (Rp)'].filter(Boolean);
    const tableRows = [];

    data.forEach(item => {
      const rowData = [
        'time' in item ? item.time : item.month,
        (item.kwh || 0).toFixed(3),
        chartType === 'daily' ? (item.kwh * 1000).toFixed(0) : undefined,
        `Rp ${(item.cost || 0).toLocaleString('id-ID')}`
      ].filter(val => val !== undefined);
      tableRows.push(rowData);
    });

    tableRows.push([
      'TOTAL',
      totalKwh.toFixed(3),
      chartType === 'daily' ? '-' : undefined,
      `Rp ${totalCost.toLocaleString('id-ID')}`
    ].filter(val => val !== undefined));

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [0, 166, 125], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [55, 65, 81], textColor: [255, 255, 255], fontStyle: 'bold' },
    });

    doc.save(`BIEON_Laporan_Energi_${chartType}_${new Date().getTime()}.pdf`);
  };

  const handleExportCSV = () => {
    const headers = [chartType === 'daily' ? 'Jam' : 'Bulan', 'Konsumsi (kWh)', chartType === 'daily' ? 'Daya (Watt)' : '', 'Biaya (Rp)'].filter(Boolean).join(',');
    const rows = data.map(item => {
      return [
        'time' in item ? item.time : item.month,
        (item.kwh || 0).toFixed(3),
        chartType === 'daily' ? (item.kwh * 1000).toFixed(0) : undefined,
        item.cost || 0
      ].filter(val => val !== undefined).join(',');
    });

    const totalRow = [
      'TOTAL',
      totalKwh.toFixed(3),
      chartType === 'daily' ? '-' : undefined,
      totalCost
    ].filter(val => val !== undefined).join(',');

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows, totalRow].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BIEON_Laporan_Energi_${chartType}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 sm:px-8 py-4 sm:py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-emerald-100 text-sm mt-1">
                {chartType === 'daily'
                  ? 'Data konsumsi energi per jam (00:00 - 23:59)'
                  : 'Data konsumsi energi 12 bulan terakhir (Bulan berjalan: akumulasi s/d hari ini)'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mb-4 sm:mb-6 flex gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleExportPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg text-sm sm:text-base"
            >
              <FileDown className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg text-sm sm:text-base"
            >
              <Download className="w-5 h-5" />
              Download CSV
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                  <th className="px-6 py-4 text-left font-bold">
                    {chartType === 'daily' ? 'Jam' : 'Bulan'}
                  </th>
                  <th className="px-6 py-4 text-left font-bold">Konsumsi (kWh)</th>
                  {chartType === 'daily' && <th className="px-6 py-4 text-left font-bold">Daya (Watt)</th>}
                  <th className="px-6 py-4 text-left font-bold">Biaya (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-emerald-50 transition-colors`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {'time' in item ? item.time : item.month}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {(item.kwh || 0).toFixed(3)} kWh
                    </td>
                    {chartType === 'daily' && (
                      <td className="px-6 py-4 text-gray-700">{(item.kwh * 1000).toFixed(0)} W</td>
                    )}
                    <td className="px-6 py-4 font-semibold text-emerald-700">
                      Rp {(item.cost || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold">
                  <td className="px-6 py-4">TOTAL</td>
                  <td className="px-6 py-4">{totalKwh.toFixed(3)} kWh</td>
                  {chartType === 'daily' && <td className="px-6 py-4">-</td>}
                  <td className="px-6 py-4 text-yellow-300">
                    Rp {totalCost.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarningLimitModal({ isOpen, onClose, limit, setLimit, deposit, setDeposit, onRefresh }) {
  const [inputLimit, setInputLimit] = useState(limit.toString());
  const [inputDeposit, setInputDeposit] = useState(deposit.toString());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setInputLimit(limit.toString());
    setInputDeposit(''); // Kosongkan agar user bisa langsung ketik nominal top-up
  }, [limit, deposit, isOpen]);

  if (!isOpen) return null;

  const totalTerpakai = window.totalCostToday || 0;
  const isKritis = deposit <= limit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedLimit = parseInt(inputLimit.replace(/[^0-9]/g, ''), 10);
    const parsedDeposit = parseInt(inputDeposit.replace(/[^0-9]/g, ''), 10);

    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      };

      if (!isNaN(parsedLimit) && parsedLimit !== limit) {
        const resThr = await fetch('/api/admin/tariffs/threshold', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ threshold: parsedLimit })
        });
        if (resThr.ok) setLimit(parsedLimit);
      }

      if (!isNaN(parsedDeposit) && parsedDeposit > 0) {
        const resTop = await fetch('/api/admin/tariffs/topup', {
          method: 'POST',
          headers,
          body: JSON.stringify({ amount: parsedDeposit })
        });
        if (resTop.ok) {
          const resData = await resTop.json();
          setDeposit(resData.tokenBalance);
          setInputDeposit('');
          if (onRefresh) onRefresh(); // Pemicu refresh instan
        }
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Gagal update pengaturan token:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        {/* Header with Gradient - User's Favorite */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 sm:px-8 py-6 text-white relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <Zap className="w-7 h-7 text-white fill-white/20" />
            </div>
            <div className="pr-8">
              <h2 className="text-xl font-bold leading-tight">Pengaturan Token Listrik</h2>
              <p className="text-amber-100 text-xs mt-1 font-medium opacity-90">Monitoring saldo & batas peringatan kritis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
          {/* Status Section */}
          <div className={`border rounded-2xl p-5 flex flex-col gap-3 mb-8 transition-colors ${isKritis ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
              <span>Saldo Saat Ini:</span>
              <span className="font-semibold text-gray-900">Rp {deposit.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
              <span>Konsumsi Hari Ini:</span>
              <span className="font-semibold text-gray-900">Rp {totalTerpakai.toLocaleString('id-ID')}</span>
            </div>
            <div className={`flex justify-between items-center text-sm font-semibold mt-1 pt-3 border-t ${isKritis ? 'border-red-200' : 'border-emerald-200'}`}>
              <span className={isKritis ? 'text-red-800' : 'text-emerald-800'}>Estimasi Sisa Saldo:</span>
              <span className={`text-xl font-bold ${isKritis ? 'text-red-600' : 'text-emerald-600'}`}>Rp {Math.max(0, deposit).toLocaleString('id-ID')}</span>
            </div>
            <div className={`flex justify-between items-center text-xs mt-1 p-2 rounded-lg font-semibold uppercase tracking-wider ${isKritis ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <span>Status:</span>
              <span className="flex items-center gap-1">
                {isKritis ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {isKritis ? 'Kritis' : 'Aman'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Batas Peringatan (Rp)</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[10000, 20000, 30000, 50000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setInputLimit(val.toString())}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all border ${inputLimit === val.toString()
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-100 bg-white text-gray-500 hover:border-amber-200'
                    }`}
                  >
                    Rp {val.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-300 group-focus-within:text-amber-500 transition-colors">Rp</div>
                <input
                  type="number"
                  value={inputLimit}
                  onChange={(e) => setInputLimit(e.target.value)}
                  placeholder="30000"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tambah Saldo Token (Top-up)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-300 group-focus-within:text-emerald-500 transition-colors">Rp</div>
                <input
                  type="number"
                  value={inputDeposit}
                  onChange={(e) => setInputDeposit(e.target.value)}
                  placeholder="Masukkan nominal (Contoh: 50000)"
                  required={!inputLimit}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitted}
              className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-[2px] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2
                ${submitted 
                  ? 'bg-emerald-500 text-white shadow-emerald-200' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl'
                }`}
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Saldo Berhasil Ditambah</span>
                </>
              ) : (
                'Simpan Pengaturan'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function HomeownerDashboard() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [chartType, setChartType] = useState('daily');
  const [showDataModal, setShowDataModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningLimit, setWarningLimit] = useState(30000);
  const [depositBalance, setDepositBalance] = useState(0);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);
  const [liveTemp, setLiveTemp] = useState(26);
  const [liveHumidity, setLiveHumidity] = useState(68);
  const [livePh, setLivePh] = useState(7.2);
  const [liveTurbidity, setLiveTurbidity] = useState(2.1);
  const [liveTds, setLiveTds] = useState(78);
  const [liveWaterTemp, setLiveWaterTemp] = useState(24);

  // States for real data
  const [realDevices, setRealDevices] = useState([]);
  const [realNotifications, setRealNotifications] = useState([]);
  const [realActivities, setRealActivities] = useState([]);
  const [energySummary, setEnergySummary] = useState(null);
  
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // 1. Fetch Devices (for devices count per room)
      const userId = localStorage.getItem('userId');
      if (userId) {
        const resDevices = await fetch(`/api/kendaliperangkat/my-devices`, { headers });
        if (resDevices.ok) setRealDevices(await resDevices.json());
      }
      
      // 2. Fetch Notifications
      const resAlerts = await fetch('/api/alerts', { headers });
      if (resAlerts.ok) {
          const data = await resAlerts.json();
          const mappedAlerts = (data.data || []).map(alert => {
            let iconType = Bell;
            let typeStr = 'info';
            
            if (alert.category === 'Keamanan' || alert.type === 'Danger' || alert.type === 'Bahaya') {
              iconType = Lock;
              typeStr = 'danger';
            } else if (alert.category === 'Energi' || alert.type === 'Warning' || alert.type === 'Waspada') {
              iconType = Zap;
              typeStr = 'warning';
            } else if (alert.type === 'Success' || alert.type === 'Berhasil') {
              iconType = CheckCircle2;
              typeStr = 'success';
            } else if (alert.category === 'Air Sanitasi') {
              iconType = Droplets;
              typeStr = 'info';
            }

            return {
              id: alert._id,
              type: typeStr,
              title: alert.title || (alert.category ? `Peringatan ${alert.category}` : 'Notifikasi'),
              desc: alert.message,
              time: new Date(alert.date || alert.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' lalu',
              icon: iconType,
              link: alert.link,
              metadata: alert.metadata // Sertakan metadata (scrollTarget/deviceId)
            };
          });
          setRealNotifications(mappedAlerts);
      }

      // 3. Fetch Energy Summary
      const resEnergy = await fetch('/api/history/energy-summary', { headers });
      if (resEnergy.ok) {
          const data = await resEnergy.json();
          setEnergySummary(data.data);
          if (data.data.tokenBalance !== undefined) setDepositBalance(data.data.tokenBalance);
          if (data.data.tokenThreshold !== undefined) setWarningLimit(data.data.tokenThreshold);
      }

      // 4. Fetch Activities
      const resActivities = await fetch('/api/history/activity', { headers });
      if (resActivities.ok) {
          const data = await resActivities.json();
          setRealActivities(data.data || []);
      }
    } catch (err) {
      console.error("Gagal fetch data dashboard real:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const dashboardInterval = setInterval(fetchDashboardData, 10000); 
    return () => clearInterval(dashboardInterval);
  }, []);

  // [ADD] HANDLE PENDING SCROLL FROM OTHER PAGES
  useEffect(() => {
    const pendingScroll = sessionStorage.getItem('pendingScroll');
    if (pendingScroll) {
      setTimeout(() => {
        const element = document.getElementById(pendingScroll);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          sessionStorage.removeItem('pendingScroll'); // Hapus setelah berhasil
        }
      }, 500); // Beri waktu dashboard untuk render sempurna
    }
  }, []);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const resTemp = await fetch('/api/sensors/suhu');
        if (resTemp.ok) {
          const data = await resTemp.json();
          if (data && data[0] && data[0].value !== null) setLiveTemp(data[0].value);
        }

        const resHum = await fetch('/api/sensors/kelembapan');
        if (resHum.ok) {
          const data = await resHum.json();
          if (data && data[0] && data[0].value !== null) setLiveHumidity(data[0].value);
        }

        const resPh = await fetch('/api/sensors/ph');
        if (resPh.ok) {
          const data = await resPh.json();
          if (data && data[0] && data[0].value !== null) setLivePh(data[0].value);
        }

        const resTurbidity = await fetch('/api/sensors/turbidity');
        if (resTurbidity.ok) {
          const data = await resTurbidity.json();
          if (data && data[0] && data[0].value !== null) setLiveTurbidity(data[0].value);
        }

        const resTds = await fetch('/api/sensors/tds');
        if (resTds.ok) {
          const data = await resTds.json();
          if (data && data[0] && data[0].value !== null) setLiveTds(data[0].value);
        }
      } catch (err) {
        console.error("Gagal fetch data sensor real-time:", err);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Derive current room data from real devices
  let rooms = [];
  if (realDevices && realDevices.length > 0) {
    const roomMap = new Map();
    realDevices.forEach(d => {
      const loc = d.location || 'Lainnya';
      if (!roomMap.has(loc)) {
        roomMap.set(loc, { id: loc.toLowerCase().replace(/\s+/g, '-'), name: loc, devices: 1 });
      } else {
        roomMap.get(loc).devices += 1;
      }
    });
    rooms = [{ id: 'all', name: 'Semua Ruangan', devices: realDevices.length }, ...Array.from(roomMap.values())];
  } else {
    // Jika benar-benar kosong (user baru), tampilkan state kosong yang rapi
    rooms = [{ id: 'all', name: 'Semua Ruangan', devices: 0 }];
  }
  
  let currentDevices = [];
  if (realDevices && realDevices.length > 0) {
    if (selectedRoom === 'all') {
      currentDevices = realDevices;
    } else {
      currentDevices = realDevices.filter(d => (d.location || 'Lainnya').toLowerCase().replace(/\s+/g, '-') === selectedRoom);
    }
  } else {
    // Kosongkan jika memang user tidak punya perangkat
    currentDevices = [];
  }

  // Menentukan kategori apa saja yang muncul berdasarkan perangkat yang dimiliki
  const hasComfort = currentDevices.some(d => d.environmentAspect === 'Kenyamanan' || (d.category === 'sensor' && ['Sensor Kenyamanan', 'Humidity Sensor', 'Temperature Sensor'].includes(d.type)));
  const hasSecurity = currentDevices.some(d => d.environmentAspect === 'Keamanan' || (d.category === 'sensor' && ['Sensor Keamanan', 'Door Sensor', 'Motion Sensor', 'CCTV'].some(t => d.type?.includes(t))));
  const hasWater = currentDevices.some(d => d.environmentAspect === 'Kualitas Air' || (d.category === 'sensor' && ['Sensor Kualitas Air', 'Water Sensor'].includes(d.type)));

  let currentSensors = {};
  // Gunakan data mock untuk visual, tapi hanya jika kategorinya relevan dengan perangkat user
  if (hasComfort) currentSensors.comfort = ROOM_SENSORS.all.comfort;
  if (hasSecurity) {
    // Ambil status asli dari perangkat security jika ada
    const securityDevices = currentDevices.filter(d => d.environmentAspect === 'Keamanan');
    if (securityDevices.length > 0) {
      currentSensors.security = securityDevices.map(d => ({
        type: d.name,
        status: d.status === '1' ? 'Active' : d.status === '0' ? 'Inactive' : d.status,
        room: d.location
      }));
    } else {
      currentSensors.security = ROOM_SENSORS.all.security;
    }
  }
  if (hasWater) currentSensors.waterQuality = ROOM_SENSORS.all.waterQuality;
  const dailyData = energySummary?.dailyData || DAILY_ENERGY_DATA;
  const monthlyData = energySummary?.monthlyData || MONTHLY_ENERGY_DATA;
  const notifications = realNotifications;
  
  const mappedActivities = realActivities.map(act => {
    const statusStr = String(act.status || '').toUpperCase();
    const icon = (statusStr === 'ON' || statusStr === '1') ? Power : Zap;
    const color = (statusStr === 'ON' || statusStr === '1') ? 'emerald' : 'gray';
    
    return {
      device: act.deviceName || act.actuator || 'Perangkat',
      action: act.action || ((statusStr === 'ON' || statusStr === '1') ? 'Menyalakan' : 'Mematikan'),
      trigger: act.trigger || 'Manual',
      time: act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--',
      icon,
      color
    };
  });



  return (
    <HomeownerLayout
      currentPage="dashboard"
      hideBottomNav={showComplaintModal || showDataModal || showWarningModal}
    >
      <div className="max-w-[1900px] mx-auto px-3 sm:px-4 md:px-8 py-4 md:py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Home className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900">Pilih Ruangan</h3>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 pb-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${selectedRoom === room.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {room.name} ({room.devices})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-9 space-y-6 md:space-y-8">
            {(currentSensors.comfort || (currentSensors.security && currentSensors.security.length > 0)) && (
              <div>
                <h2 id="section-kenyamanan" className="text-xl font-bold text-gray-900 mb-4">
                  {currentSensors.comfort && currentSensors.security && currentSensors.security.length > 0
                    ? 'Kenyamanan & Keamanan'
                    : currentSensors.comfort
                      ? 'Kenyamanan'
                      : 'Keamanan'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-flow-col gap-3 sm:gap-4 mb-6 lg:overflow-x-auto lg:pb-4 lg:scrollbar-none desktop-comfort-grid">
                  {currentSensors.comfort && (
                    <>
                      {currentSensors.comfort.humidity !== null && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-gray-900">Kelembapan</span>
                            <Droplets className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="mb-3">
                            <div className="text-4xl font-bold text-gray-900">{selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity}%</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {(selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity) < 50 ? 'Kering' : (selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity) <= 80 ? 'Nyaman' : 'Sangat Lembap'}
                            </div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-auto">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-600" style={{ width: `${selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity}%` }}></div>
                          </div>
                        </div>
                      )}

                      {currentSensors.comfort.temp && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-gray-900">Suhu</span>
                            <Thermometer className="w-5 h-5 text-orange-500" />
                          </div>
                          <div className="mb-3">
                            <div className="text-4xl font-bold text-gray-900">{selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp}°C</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {(selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp) < 20.5 ? 'Dingin' : (selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp) <= 27.1 ? 'Nyaman' : 'Panas'}
                            </div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-auto">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${((selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp) / 40) * 100}%` }}></div>
                          </div>
                        </div>
                      )}

                      <div className="row-span-2 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl shadow-xl p-5 text-white relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></div>
                        <div className="relative flex flex-col h-full">
                          <div className="mb-1">
                            <h3 className="text-2xl font-bold mb-1">Kenyamanan</h3>
                            <p className="text-cyan-100 text-sm">Berdasarkan: suhu & kelembapan</p>
                            <p className="text-emerald-100 text-xs mb-1">(Permenkes No. 2 Tahun 2023)</p>
                          </div>
                          <div className="flex-1 flex flex-col justify-center items-center text-center mt-1 mb-1 py-4 sm:py-0">
                            <div className="text-2xl font-bold mb-3 flex items-center gap-2">
                              {((selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp) >= 20.5 && (selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp) <= 27.1 &&
                                (selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity) >= 50 && (selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity) <= 80) ?
                                '😊 Nyaman' : '😕 Tidak Nyaman'}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-auto">
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                              <div className="text-[10px] mb-1">Suhu</div>
                              <div className="font-bold text-lg">{selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp}°C</div>
                            </div>
                            {currentSensors.comfort.humidity !== null && (
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                                <div className="text-[10px] mb-1">Kelembapan</div>
                                <div className="font-bold text-lg">{selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity}%</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {currentSensors.security && currentSensors.security.length > 0 && (
                    <div id="section-keamanan" className="contents">
                      {currentSensors.security.filter(s => s.type.includes('Motion')).map((sensor, idx) => (
                        <div key={'motion' + idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-gray-900">Motion</span>
                            <Activity className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="mb-3">
                            <div className="text-4xl font-bold text-gray-900">{sensor.status === 'No Motion' ? 'Aman' : 'Gerak'}</div>
                            <div className="text-xs text-gray-500 mt-1">{sensor.room}</div>
                          </div>
                          <div className={`mt-auto px-3 py-2 rounded-lg text-[10px] font-bold text-center ${sensor.status === 'No Motion' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {sensor.status === 'No Motion' ? '✓ STANDBY' : '👁️ DETECTED'}
                          </div>
                        </div>
                      ))}

                      {currentSensors.security.filter(s => s.type.includes('Door')).map((sensor, idx) => (
                        <div key={'door' + idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-gray-900">Door Sensor</span>
                            <Lock className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="mb-3">
                            <div className="text-4xl font-bold text-gray-900">{sensor.status === 'Closed' ? 'Tutup' : 'Buka'}</div>
                            <div className="text-xs text-gray-500 mt-1">{sensor.room}</div>
                          </div>
                          <div className={`mt-auto px-3 py-2 rounded-lg text-[10px] font-bold text-center ${sensor.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {sensor.status === 'Closed' ? '🔒 SECURE' : '🚪 OPEN'}
                          </div>
                        </div>
                      ))}

                      <div className="row-span-2 bg-gradient-to-br flex flex-col from-purple-500 to-indigo-600 rounded-2xl shadow-xl p-5 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></div>
                        <div className="relative flex flex-col h-full">
                          <div className="mb-1">
                            <h3 id="section-keamanan" className="text-2xl font-bold mb-1">Keamanan</h3>
                            <p className="text-purple-100 text-xs">{currentSensors.security.length} sensor aktif</p>
                          </div>
                          <div className="flex-1 flex flex-col justify-center items-center text-center py-4 sm:py-1">
                            <div className="text-[60px] font-bold leading-none mb-2">
                              {currentSensors.security.every(s =>
                                s.status === 'Normal' || s.status === 'Recording' || s.status === 'Closed' || s.status === 'No Motion'
                              ) ? '✓' : '⚠️'}
                            </div>
                            <div className="text-xl font-semibold mt-1">
                              {currentSensors.security.every(s =>
                                s.status === 'Normal' || s.status === 'Recording' || s.status === 'Closed' || s.status === 'No Motion'
                              ) ? '🔒 Semua Aman' : '⚠️ Perlu Perhatian'}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2 mt-auto">
                            {currentSensors.security.slice(0, 2).map((sensor, idx) => (
                              <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex justify-between items-center">
                                <div className="text-xs font-semibold">{sensor.type} - {sensor.room}</div>
                                <div className="text-xs font-bold">{sensor.status}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentSensors.waterQuality && (
              <div id="section-kualitas-air">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Kesehatan Air</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-flow-col gap-3 sm:gap-4 mb-6 lg:overflow-x-auto lg:pb-4 lg:scrollbar-none desktop-water-grid">
                  {/* pH */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">Tingkat Keasaman (pH)</span>
                      <Beaker className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div className="mb-3">
                      <div className="text-4xl font-bold text-gray-900">{selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph) >= 6.5 && (selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph) <= 8.5 ? 'Layak Pakai' : 'Tidak Layak Pakai'}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${((selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph) / 14) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Turbidity */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">Kekeruhan</span>
                      <Droplets className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="mb-3">
                      <div className="text-4xl font-bold text-gray-900">{selectedRoom === 'all' ? liveTurbidity : currentSensors.waterQuality.turbidity}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(selectedRoom === 'all' ? liveTurbidity : currentSensors.waterQuality.turbidity) <= 25 ? 'Layak Pakai' : 'Tidak Layak Pakai'}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500" style={{ width: `${Math.min(((selectedRoom === 'all' ? liveTurbidity : currentSensors.waterQuality.turbidity) / 10) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* TDS */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">Padatan Terlarut (TDS)</span>
                      <Wind className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="mb-3">
                      <div className="text-4xl font-bold text-gray-900">{selectedRoom === 'all' ? liveTds : currentSensors.waterQuality.tds}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(selectedRoom === 'all' ? liveTds : currentSensors.waterQuality.tds) <= 1000 ? 'Layak Pakai' : 'Tidak Layak Pakai'}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-600" style={{ width: `${Math.min(((selectedRoom === 'all' ? liveTds : currentSensors.waterQuality.tds) / 500) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Water Temperature */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">Suhu Air</span>
                      <Thermometer className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="mb-3">
                      <div className="text-4xl font-bold text-gray-900">{currentSensors.waterQuality.temp}°C</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {currentSensors.waterQuality.temp < 10 ? 'Dingin' : currentSensors.waterQuality.temp < 30 ? 'Normal' : 'Hangat'}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-gradient-to-r from-orange-400 to-red-500" style={{ width: `${(currentSensors.waterQuality.temp / 50) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Big Card - Water Status - row-span-2 */}
                  <div className="row-span-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl p-5 text-white relative overflow-hidden flex flex-col min-w-[280px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="relative h-full flex flex-col">
                      <div className="mb-1">
                        <h3 className="text-2xl font-bold mb-1 flex items-center gap-3">
                          <Beaker className="w-6 h-6" />
                          Status Air
                        </h3>
                        <p className="text-cyan-100 text-sm">Berdasarkan: pH, Turbidity, TDS, Suhu</p>
                        <p className="text-emerald-100 text-xs mb-1">(Permenkes No. 32 Tahun 2017)</p>
                      </div>

                      <div className="flex-1 flex flex-col justify-center items-center text-center mt-1 mb-1">
                        <div className="text-2xl font-semibold mb-3 flex items-center gap-2 text-white">
                          {(selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph) >= 6.5 && (selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph) <= 8.5 && (selectedRoom === 'all' ? liveTurbidity : currentSensors.waterQuality.turbidity) <= 25 && (selectedRoom === 'all' ? liveTds : currentSensors.waterQuality.tds) <= 1000 ? '💧 Layak Pakai' : '⚠️ Tidak Layak Pakai'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                          <div className="text-[10px] mb-1">Tingkat Keasaman (pH)</div>
                          <div className="font-bold text-lg">{selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph}</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                          <div className="text-[10px] mb-1">Suhu</div>
                          <div className="font-bold text-lg">{currentSensors.waterQuality.temp}°C</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div id="section-energi" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Konsumsi Energi</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {chartType === 'daily'
                      ? 'Update setiap jam | Hari berjalan 00:00-23:59'
                      : 'Update setiap bulan | Periode 1 tahun (Januari–Desember)'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowWarningModal(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-amber-600 transition-all shadow-md group"
                  >
                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">Atur Peringatan</span>
                    <span className="sm:hidden">Peringatan</span>
                  </button>
                  <button
                    onClick={() => setShowDataModal(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#00a67d] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-teal-700 transition-all shadow-md group"
                  >
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">Detail</span>
                    <ChevronRight className="w-4 h-4 hidden sm:inline" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-4 sm:p-6 bg-[#ebfbf5] rounded-[2rem] border border-[#bbf7d0] items-start">
                {/* Item 1 */}
                <div className="text-center px-2 flex flex-col items-center">
                  <div className="text-[10px] sm:text-[11px] text-emerald-600 font-extrabold mb-1 uppercase tracking-widest leading-snug h-[40px] flex items-center justify-center">
                    {chartType === 'daily' ? 'Konsumsi Beban Saat Ini' : 'Konsumsi Beban Bulan Ini'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#00a67d] flex items-baseline justify-center gap-1">
                    {energySummary?.currentLoad || 0} <span className="text-xs sm:text-sm font-semibold opacity-60">{chartType === 'daily' ? 'Watt' : 'kWh'}</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="text-center px-2 flex flex-col items-center">
                  <div className="text-[10px] sm:text-[11px] text-emerald-600 font-extrabold mb-1 uppercase tracking-widest leading-snug h-[40px] flex items-center justify-center">
                    {chartType === 'daily' ? 'Konsumsi Beban Berjalan' : 'Total Konsumsi Beban Tahun Ini'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#00a67d] flex items-baseline justify-center gap-1">
                    {chartType === 'daily' ? energySummary?.runningConsumption || 0 : (energySummary?.monthlyData?.reduce((acc, m) => acc + m.kwh, 0) || 0).toFixed(1)} <span className="text-xs sm:text-sm font-semibold opacity-60">kWh</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="text-center px-2 flex flex-col items-center">
                  <div className="text-[10px] sm:text-[11px] text-emerald-600 font-extrabold mb-1 uppercase tracking-widest leading-snug h-[40px] flex items-center justify-center">
                    {chartType === 'daily' ? 'Rata-rata beban /jam' : 'Rata-rata beban/bulan'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#00a67d] flex items-baseline justify-center gap-1">
                    {chartType === 'daily' 
                      ? (energySummary?.avgHourly || 0) 
                      : (energySummary?.monthlyData?.length > 0 
                          ? (energySummary.monthlyData.reduce((acc, m) => acc + m.kwh, 0) / energySummary.monthlyData.length).toFixed(1) 
                          : 0)
                    } <span className="text-xs sm:text-sm font-semibold opacity-60">kWh</span>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="text-center px-2 flex flex-col items-center">
                  <div className="text-[10px] sm:text-[11px] text-emerald-600 font-extrabold mb-1 uppercase tracking-widest leading-snug h-[40px] flex items-center justify-center">
                    Total Biaya Pemakaian Beban Berjalan (Rp)
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#00a67d] flex items-baseline justify-center gap-1">
                    <span className="text-sm sm:text-base font-semibold opacity-60">Rp</span> {
                      chartType === 'daily' 
                        ? (energySummary?.totalCost?.toLocaleString('id-ID') || '0')
                        : (energySummary?.monthlyData?.reduce((acc, m) => acc + (m.cost || 0), 0).toLocaleString('id-ID') || '0')
                    }
                    {/* Simpan ke window agar modal bisa baca tanpa prop drilling yang rumit */}
                    {(() => { window.totalCostToday = energySummary?.totalCost || 0; return null; })()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-6 sm:mb-8 bg-gray-50/50 p-1.5 rounded-[16px] border border-gray-100">
                <button
                  onClick={() => setChartType('daily')}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${chartType === 'daily' ? 'bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]' : 'text-gray-500 hover:bg-white/50'
                    }`}
                >
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Harian (Per Jam)</span>
                  <span className="sm:hidden">Harian</span>
                </button>
                <button
                  onClick={() => setChartType('monthly')}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${chartType === 'monthly' ? 'bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)]' : 'text-gray-500 hover:bg-white/50'
                    }`}
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Bulanan (1 Tahun)</span>
                  <span className="sm:hidden">Bulanan</span>
                </button>
              </div>

              <div className="h-[260px] sm:h-[340px] md:h-[400px]">
                {chartType === 'daily' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={dailyData} margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis
                        dataKey="time"
                        stroke="#9ca3af"
                        axisLine={{ stroke: '#9ca3af' }}
                        tickLine={false}
                        style={{ fontSize: '11px' }}
                        dy={10}
                        label={{ value: 'Waktu', position: 'insideBottom', offset: -15, fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        axisLine={{ stroke: '#9ca3af' }}
                        tickLine={false}
                        style={{ fontSize: '11px' }}
                        dx={-10}
                        label={{ value: 'Konsumsi (kWh)', angle: -90, position: 'insideLeft', offset: 0, fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value) => `${value} kWh`}
                      />
                      <Line
                        type="monotone"
                        dataKey="kwh"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                        name="Konsumsi (kWh)"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={monthlyData} margin={{ top: 30, right: 20, bottom: 30, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#9ca3af"
                        axisLine={{ stroke: '#9ca3af' }}
                        tickLine={false}
                        style={{ fontSize: '11px' }}
                        dy={10}
                        label={{ value: 'Waktu', position: 'insideBottom', offset: -15, fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        axisLine={{ stroke: '#9ca3af' }}
                        tickLine={false}
                        style={{ fontSize: '11px' }}
                        dx={-10}
                        label={{ value: 'Daya (kWh)', angle: -90, position: 'insideLeft', offset: -10, fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        domain={[0, 250]}
                        ticks={[0, 50, 100, 150, 200, 250]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => {
                          if (name === 'Biaya (Rp)') return `Rp ${value.toLocaleString('id-ID')}`;
                          return `${value} kWh`;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="kwh"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ fill: '#10b981', r: 5, strokeWidth: 0 }}
                        activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
                        name="Konsumsi (kWh)"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-600" />
                  Notifikasi & Alert
                </h3>
                <button onClick={() => setShowNotifications(true)} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">View All</button>
              </div>
              <div className="relative">
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar transition-all">
                {notifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (notif.link === 'pengaduan') navigate('/pengaduan');
                        else if (notif.link === 'kendali') {
                          if (notif.metadata?.deviceId) {
                             sessionStorage.setItem('pendingHighlight', notif.metadata.deviceId);
                          }
                          navigate('/kendali');
                        }
                        else if (notif.link === 'dashboard' || notif.link === 'history-energi') {
                          const target = notif.metadata?.scrollTarget || 'section-energi';
                          sessionStorage.setItem('pendingScroll', target);
                          navigate('/dashboard');
                          
                          setTimeout(() => {
                            const element = document.getElementById(target);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              sessionStorage.removeItem('pendingScroll');
                            }
                          }, 100);
                          
                          if (notif.link === 'history-energi') setShowDataModal(true);
                        }
                      }}
                      className={`p-3 sm:p-4 rounded-xl border border-gray-100 bg-white/40 hover:bg-gray-50/60 transition-all border-l-4 cursor-pointer active:scale-[0.98] ${notif.type === 'danger'
                        ? 'border-l-red-400/70'
                        : notif.type === 'warning'
                          ? 'border-l-amber-400/70'
                          : notif.type === 'security'
                            ? 'border-l-purple-400/70'
                            : notif.type === 'success'
                              ? 'border-l-emerald-400/70'
                              : 'border-l-blue-400/70'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${notif.type === 'danger' ? 'bg-red-50/50' : notif.type === 'warning' ? 'bg-amber-50/50' : notif.type === 'security' ? 'bg-purple-50/50' : 'bg-blue-50/50'
                          }`}>
                          <Icon className={`w-4 h-4 ${notif.type === 'danger' ? 'text-red-500/80' : notif.type === 'warning' ? 'text-amber-500/80' : notif.type === 'security' ? 'text-purple-500/80' : notif.type === 'success' ? 'text-emerald-500/80' : 'text-blue-500/80'
                            }`} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-800 leading-relaxed">{notif.desc}</div>
                          <div className="text-xs text-gray-400 mt-1">{notif.time}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Aktivitas Terbaru
              </h3>
              <div className="space-y-3">
                {mappedActivities.slice(0, 5).map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-[22px] transition-all duration-300 border hover:bg-white hover:scale-[1.02] hover:shadow-md active:scale-95 cursor-pointer group
                      ${activity.color === 'emerald' ? 'bg-emerald-50/40 border-emerald-100/50' : 'bg-gray-50/50 border-gray-100/50'}`}>
                      <div className={`w-10 h-10 rounded-2xl bg-${activity.color === 'emerald' ? 'emerald-50' : 'gray-100'} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`w-5 h-5 ${activity.color === 'emerald' ? 'text-emerald-600' : 'text-gray-400'}`} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-gray-900 leading-tight mb-0.5">{activity.device}</div>
                        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{activity.action} • {activity.trigger}</div>
                      </div>
                      <div className="text-[10px] font-semibold text-gray-400 bg-gray-100/50 px-2 py-1 rounded-lg">{activity.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <NotificationPopup 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
          role="homeowner" 
        />
        <DataModal isOpen={showDataModal} onClose={() => setShowDataModal(false)} chartType={chartType} energySummary={energySummary} />
        <WarningLimitModal isOpen={showWarningModal} onClose={() => setShowWarningModal(false)} limit={warningLimit} setLimit={setWarningLimit} deposit={depositBalance} setDeposit={setDepositBalance} onRefresh={fetchDashboardData} />
        <ComplaintModal isOpen={showComplaintModal} onClose={() => setShowComplaintModal(false)} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .desktop-comfort-grid {
            grid-template-rows: repeat(2, 180px);
            grid-auto-columns: minmax(200px, 1fr);
          }
          .desktop-water-grid {
            grid-template-rows: repeat(2, 180px);
            grid-auto-columns: minmax(200px, 1fr);
          }
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </HomeownerLayout>
  );
}

export default HomeownerDashboard;