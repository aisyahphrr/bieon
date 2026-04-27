import { useState, useEffect } from 'react';
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
  Beaker
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

function DataModal({ isOpen, onClose, chartType }) {
  if (!isOpen) return null;

  const dailyData = [
    { time: '00:00', kwh: 0.245, watt: 245, cost: 2450 },
    { time: '01:00', kwh: 0.198, watt: 198, cost: 1980 },
    { time: '02:00', kwh: 0.167, watt: 167, cost: 1670 },
    { time: '03:00', kwh: 0.189, watt: 189, cost: 1890 },
    { time: '04:00', kwh: 0.212, watt: 212, cost: 2120 },
    { time: '05:00', kwh: 0.312, watt: 312, cost: 3120 },
    { time: '06:00', kwh: 0.445, watt: 445, cost: 4450 },
    { time: '07:00', kwh: 0.523, watt: 523, cost: 5230 },
    { time: '08:00', kwh: 0.589, watt: 589, cost: 5890 },
    { time: '09:00', kwh: 0.612, watt: 612, cost: 6120 },
    { time: '10:00', kwh: 0.567, watt: 567, cost: 5670 },
    { time: '11:00', kwh: 0.634, watt: 634, cost: 6340 },
    { time: '12:00', kwh: 0.701, watt: 701, cost: 7010 },
    { time: '13:00', kwh: 0.678, watt: 678, cost: 6780 },
    { time: '14:00', kwh: 0.645, watt: 645, cost: 6450 },
    { time: '15:00', kwh: 0.598, watt: 598, cost: 5980 },
    { time: '16:00', kwh: 0.534, watt: 534, cost: 5340 },
    { time: '17:00', kwh: 0.489, watt: 489, cost: 4890 },
    { time: '18:00', kwh: 0.567, watt: 567, cost: 5670 },
    { time: '19:00', kwh: 0.623, watt: 623, cost: 6230 },
    { time: '20:00', kwh: 0.678, watt: 678, cost: 6780 },
    { time: '21:00', kwh: 0.598, watt: 598, cost: 5980 },
    { time: '22:00', kwh: 0.445, watt: 445, cost: 4450 },
    { time: '23:00', kwh: 0.334, watt: 334, cost: 3340 },
  ];

  const monthlyData = [
    { month: 'Jan 2025', kwh: 345.5, cost: 345500 },
    { month: 'Feb 2025', kwh: 298.3, cost: 298300 },
    { month: 'Mar 2025', kwh: 412.7, cost: 412700 },
    { month: 'Apr 2025', kwh: 389.4, cost: 389400 },
    { month: 'May 2025', kwh: 434.2, cost: 434200 },
    { month: 'Jun 2025', kwh: 398.6, cost: 398600 },
    { month: 'Jul 2025', kwh: 456.8, cost: 456800 },
    { month: 'Aug 2025', kwh: 478.9, cost: 478900 },
    { month: 'Sep 2025', kwh: 398.5, cost: 398500 },
    { month: 'Oct 2025', kwh: 412.4, cost: 412400 },
    { month: 'Nov 2025', kwh: 389.7, cost: 389700 },
    { month: 'Dec 2025', kwh: 234.1, cost: 234100 },
  ];

  const data = chartType === 'daily' ? dailyData : monthlyData;
  const title = chartType === 'daily' ? 'Data Energi Harian (Hari Berjalan)' : 'Data Energi Bulanan (1 Tahun Terakhir)';

  const totalKwh = data.reduce((acc, curr) => acc + ('kwh' in curr ? curr.kwh : 0), 0);
  const totalCost = data.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
              onClick={() => triggerToast('Laporan PDF sedang dikumpulkan...')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-lg text-sm sm:text-base"
            >
              <FileDown className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={() => triggerToast('Laporan Excel sedang diproses...')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg text-sm sm:text-base"
            >
              <Download className="w-5 h-5" />
              Download Excel
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
                      {item.kwh.toFixed(3)} kWh
                    </td>
                    {chartType === 'daily' && 'watt' in item && (
                      <td className="px-6 py-4 text-gray-700">{item.watt} W</td>
                    )}
                    <td className="px-6 py-4 font-semibold text-emerald-700">
                      Rp {item.cost.toLocaleString('id-ID')}
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

function WarningLimitModal({ isOpen, onClose, limit, setLimit, deposit, setDeposit }) {
  const [inputLimit, setInputLimit] = useState(limit ? limit.toString() : '');
  const [inputDeposit, setInputDeposit] = useState(deposit ? deposit.toString() : '');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const totalTerpakai = 78490;
  const sisaDaya = deposit - totalTerpakai;
  const isKritis = sisaDaya <= limit;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedLimit = parseInt(inputLimit.replace(/[^0-9]/g, ''), 10);
    const parsedDeposit = parseInt(inputDeposit.replace(/[^0-9]/g, ''), 10);

    let updatedDeposit = deposit;
    let updatedLimit = limit;

    if (!isNaN(parsedLimit) && parsedLimit >= 0) {
      setLimit(parsedLimit);
      updatedLimit = parsedLimit;
    }
    if (!isNaN(parsedDeposit) && parsedDeposit >= 0) {
      setDeposit(parsedDeposit);
      updatedDeposit = parsedDeposit;
    }

    // Trigger notification immediately if critical after input
    const newSisaDaya = updatedDeposit - totalTerpakai;
    if (newSisaDaya <= updatedLimit) {
      const newNotif = {
        id: Date.now(),
        type: 'warning',
        title: 'Status: Peringatan Daya Kritis!',
        message: `Sisa saldo listrik Anda (Rp ${newSisaDaya.toLocaleString('id-ID')}) berada di bawah atau mendekati batas peringatan (Rp ${updatedLimit.toLocaleString('id-ID')}). Segera isi ulang!`,
        time: 'Baru saja',
        icon: AlertTriangle,
      };
      window.dispatchEvent(new CustomEvent('add-notification', { detail: newNotif }));
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pengaturan Disimpan!</h3>
          <p className="text-gray-500 text-sm">Pengaturan token dan batas peringatan Anda telah diperbarui.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 sm:px-8 py-4 sm:py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Pengaturan Token Listrik</h2>
                <p className="text-amber-100 text-sm mt-1">Atur batas minimum saldo agar Anda mendapat peringatan sebelum listrik habis</p>
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

        <div className="p-5 sm:p-8 overflow-y-auto flex-1">
          <div className={`border rounded-xl p-4 flex flex-col gap-2 mb-6 transition-colors ${isKritis ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-gray-700">Total Isi Token:</span>
              <span className="font-bold text-gray-900">Rp {deposit.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-gray-700">Total Pemakaian:</span>
              <span className="font-bold text-gray-600">Rp {totalTerpakai.toLocaleString('id-ID')}</span>
            </div>
            <div className={`flex justify-between items-center text-sm font-semibold mt-1 pt-2 border-t ${isKritis ? 'border-red-200' : 'border-emerald-200'}`}>
              <span className={isKritis ? 'text-red-800' : 'text-emerald-800'}>Sisa Saldo Token:</span>
              <span className={`text-lg font-bold ${isKritis ? 'text-red-600' : 'text-emerald-600'}`}>Rp {sisaDaya.toLocaleString('id-ID')}</span>
            </div>
            <div className={`flex justify-between items-center text-xs mt-3 p-2 rounded-lg font-bold uppercase tracking-wider ${isKritis ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <span>Status:</span>
              <span className="flex items-center gap-1">
                {isKritis ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {isKritis ? 'Saldo Hampir Habis' : 'Aman'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deposit Token Anda (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={inputDeposit}
                onChange={(e) => setInputDeposit(e.target.value)}
                placeholder="Masukkan nominal deposit (misal 150000)"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Batas Peringatan (Rp) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[10000, 20000, 30000, 50000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setInputLimit(val.toString())}
                    className={`py-2 rounded-xl text-sm font-semibold transition-all border ${inputLimit === val.toString()
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
                      }`}
                  >
                    Rp {val.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={inputLimit}
                onChange={(e) => setInputLimit(e.target.value)}
                placeholder="Nominal peringatan lainnya (Rp)"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Simpan Pengaturan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function HomeownerDashboard({ onNavigate }) {
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [chartType, setChartType] = useState('daily');
  const [showDataModal, setShowDataModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningLimit, setWarningLimit] = useState(30000);
  const [depositBalance, setDepositBalance] = useState(100000);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);
  const [liveTemp, setLiveTemp] = useState(26);

  useEffect(() => {
    const fetchTemp = async () => {
      try {
        // Menggunakan endpoint dari microservices/api-services via proxy /api-sensor
        const res = await fetch('/api-sensor/sensors/suhu');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        if (data && data.length > 0) {
          console.log("🌡️ Data suhu diterima dari database:", data[0].value);
          setLiveTemp(data[0].value);
        }
      } catch (err) {
        console.error("Gagal fetch suhu real-time:", err);
      }
    };

    fetchTemp();
    const interval = setInterval(fetchTemp, 2000); // Polling setiap 2 detik sesuai permintaan
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Derive current room data from static constants (no re-creation per render)
  const rooms = ROOMS;
  const currentDevices = DEVICES_PER_ROOM[selectedRoom] || DEVICES_PER_ROOM.all;
  const currentSensors = ROOM_SENSORS[selectedRoom] || ROOM_SENSORS.all;
  const dailyData = DAILY_ENERGY_DATA;
  const monthlyData = MONTHLY_ENERGY_DATA;
  const notifications = NOTIFICATIONS;



  return (
    <HomeownerLayout
      currentPage="dashboard"
      onNavigate={onNavigate}
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
                <h2 className="text-xl font-bold text-gray-900 mb-4">
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
                            <div className="text-4xl font-bold text-gray-900">{currentSensors.comfort.humidity}%</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {currentSensors.comfort.humidity < 50 ? 'Kering' : currentSensors.comfort.humidity <= 80 ? 'Nyaman' : 'Sangat Lembap'}
                            </div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-auto">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-600" style={{ width: `${currentSensors.comfort.humidity}%` }}></div>
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
                              {currentSensors.comfort.temp >= 20.5 && currentSensors.comfort.temp <= 27.1 &&
                                currentSensors.comfort.humidity >= 50 && currentSensors.comfort.humidity <= 80 ?
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
                                <div className="font-bold text-lg">{currentSensors.comfort.humidity}%</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {currentSensors.security && currentSensors.security.length > 0 && (
                    <>
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
                            <h3 className="text-2xl font-bold mb-1">Keamanan</h3>
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
                    </>
                  )}
                </div>
              </div>
            )}

            {currentSensors.waterQuality && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Kesehatan Air</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-flow-col gap-3 sm:gap-4 mb-6 lg:overflow-x-auto lg:pb-4 lg:scrollbar-none desktop-water-grid">
                  {/* pH */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">Tingkat Keasaman (pH)</span>
                      <Beaker className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div className="mb-3">
                      <div className="text-4xl font-bold text-gray-900">{currentSensors.waterQuality.ph}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {currentSensors.waterQuality.ph < 6.5 ? 'Asam' : currentSensors.waterQuality.ph <= 8.5 ? 'Normal (Aman)' : 'Basa'}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${(currentSensors.waterQuality.ph / 14) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Turbidity */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">Kekeruhan</span>
                      <Droplets className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="mb-3">
                      <div className="text-4xl font-bold text-gray-900">{currentSensors.waterQuality.turbidity}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {currentSensors.waterQuality.turbidity <= 25 ? 'Normal (NTU)' : 'Keruh'}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500" style={{ width: `${Math.min((currentSensors.waterQuality.turbidity / 10) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* TDS */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900">Padatan Terlarut (TDS)</span>
                      <Wind className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="mb-3">
                      <div className="text-4xl font-bold text-gray-900">{currentSensors.waterQuality.tds}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {currentSensors.waterQuality.tds <= 1000 ? 'Normal (mg/L)' : 'TDS Tinggi'}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-600" style={{ width: `${Math.min((currentSensors.waterQuality.tds / 500) * 100, 100)}%` }}></div>
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
                        <p className="text-emerald-100 text-xs mb-1">(Permenkes No. 2 Tahun 2023)</p>
                      </div>

                      <div className="flex-1 flex flex-col justify-center items-center text-center mt-1 mb-1">
                        <div className="text-2xl font-semibold mb-3 flex items-center gap-2 text-white">
                          {currentSensors.waterQuality.ph >= 6.5 && currentSensors.waterQuality.ph <= 8.5 && currentSensors.waterQuality.turbidity <= 25 && currentSensors.waterQuality.tds <= 1000 ? '💧 Layak Pakai' : '⚠️ Tidak Layak'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                          <div className="text-[10px] mb-1">Tingkat Keasaman (pH)</div>
                          <div className="font-bold text-lg">{currentSensors.waterQuality.ph}</div>
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

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8">
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
                    947 <span className="text-xs sm:text-sm font-semibold opacity-60">kWh</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="text-center px-2 flex flex-col items-center">
                  <div className="text-[10px] sm:text-[11px] text-emerald-600 font-extrabold mb-1 uppercase tracking-widest leading-snug h-[40px] flex items-center justify-center">
                    {chartType === 'daily' ? 'Konsumsi Beban Berjalan' : 'Total Konsumsi Beban Tahun Ini'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#00a67d] flex items-baseline justify-center gap-1">
                    7.85 <span className="text-xs sm:text-sm font-semibold opacity-60">kWh</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="text-center px-2 flex flex-col items-center">
                  <div className="text-[10px] sm:text-[11px] text-emerald-600 font-extrabold mb-1 uppercase tracking-widest leading-snug h-[40px] flex items-center justify-center">
                    {chartType === 'daily' ? 'Rata-rata beban /jam' : 'Rata-rata beban/bulan'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#00a67d] flex items-baseline justify-center gap-1">
                    0.462 <span className="text-xs sm:text-sm font-semibold opacity-60">kWh</span>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="text-center px-2 flex flex-col items-center">
                  <div className="text-[10px] sm:text-[11px] text-emerald-600 font-extrabold mb-1 uppercase tracking-widest leading-snug h-[40px] flex items-center justify-center">
                    Total Biaya Pemakaian Beban Berjalan (Rp)
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#00a67d] flex items-baseline justify-center gap-1">
                    <span className="text-sm sm:text-base font-semibold opacity-60">Rp</span> 78.490
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
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {notifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-xl border-l-4 ${notif.type === 'danger'
                        ? 'bg-red-50 border-red-500'
                        : notif.type === 'warning'
                          ? 'bg-amber-50 border-amber-500'
                          : notif.type === 'security'
                            ? 'bg-purple-50 border-purple-500'
                            : 'bg-blue-50 border-blue-500'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${notif.type === 'danger' ? 'bg-red-100' : notif.type === 'warning' ? 'bg-amber-100' : notif.type === 'security' ? 'bg-purple-100' : 'bg-blue-100'
                          }`}>
                          <Icon className={`w-4 h-4 ${notif.type === 'danger' ? 'text-red-600' : notif.type === 'warning' ? 'text-amber-600' : notif.type === 'security' ? 'text-purple-600' : 'text-blue-600'
                            }`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-gray-900">{notif.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{notif.desc}</div>
                          <div className="text-xs text-gray-400 mt-2">{notif.time}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Aktivitas Terbaru
              </h3>
              <div className="space-y-3">
                {[
                  { device: 'AC Kamar', action: 'turned ON', time: '5 min', icon: CheckCircle2, color: 'emerald' },
                  { device: 'Lampu Tamu 2', action: 'turned OFF', time: '12 min', icon: XCircle, color: 'gray' },
                  { device: 'CCTV Dapur', action: 'recording', time: '25 min', icon: Camera, color: 'blue' },
                  { device: 'Kipas', action: 'auto ON', time: '30 min', icon: Fan, color: 'teal' },
                ].map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Icon className={`w-5 h-5 text-${activity.color}-600`} />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{activity.device}</div>
                        <div className="text-xs text-gray-500">{activity.action}</div>
                      </div>
                      <div className="text-xs text-gray-400">{activity.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <NotificationPopup isOpen={showNotifications} onClose={() => setShowNotifications(false)} role="homeowner" />
        <DataModal isOpen={showDataModal} onClose={() => setShowDataModal(false)} chartType={chartType} />
        <WarningLimitModal isOpen={showWarningModal} onClose={() => setShowWarningModal(false)} limit={warningLimit} setLimit={setWarningLimit} deposit={depositBalance} setDeposit={setDepositBalance} />
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
      `}</style>
    </HomeownerLayout>
  );
}

export default HomeownerDashboard;