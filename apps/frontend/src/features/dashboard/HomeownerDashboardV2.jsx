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
  Droplet,
  Thermometer,
  ThermometerSun,
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
  Power,
  Type,
  ShieldCheck,
  Coins
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
import { useTranslation } from 'react-i18next';
import {
  mockDevices,
  mockNotifications,
  mockEnergySummary,
  mockActivities,
  mockSensors
} from './homeownerMockData';

// Helper to decode JWT token safely in browser
function getEmailFromToken() {
  try {
    // 1. Coba ambil dari localStorage dulu sebagai fallback instan
    const localEmail = localStorage.getItem('email');
    if (localEmail) return localEmail;

    // 2. Coba decode JWT token
    const token = localStorage.getItem('token');
    if (!token) return '';
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload).email || '';
  } catch (err) {
    return '';
  }
}

// ─────── Utility Toast ───────
function Toast({ message, type = 'success', onClose }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] animate-in fade-in slide-in-from-top-4 duration-500">
      <div className={`px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 ${type === 'success' ? 'bg-eco border-eco/50 text-white' : 'bg-gray-800/90 border-gray-700 text-white'
        }`}>
        {type === 'success' && <CheckCircle2 className="w-5 h-5" />}
        <span className="text-sm font-bold tracking-wide">{message}</span>
      </div>
    </div>
  );
}

function ComplaintModal({ isOpen, onClose, realDevices = [] }) {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    device: '',
    issue: '',
    description: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: formData.issue,
          category: formData.priority === 'high' ? 'Danger' : formData.priority === 'medium' ? 'Warning' : 'Info',
          device: formData.device,
          desc: formData.description
        })
      });

      if (!response.ok) throw new Error('Gagal mengirim pengaduan');

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ device: '', issue: '', description: '', priority: 'medium' });
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim pengaduan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Inline success feedback instead of alert()
  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-xl max-w-md w-full p-10 text-center border border-slate-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-eco" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('dashboard.complaint_sent', 'Pengaduan Terkirim!')}</h3>
          <p className="text-gray-500 text-sm">{t('dashboard.complaint_sent_desc', 'Tim kami akan segera menindaklanjuti pengaduan Anda.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
        <div className="bg-white border-b border-slate-100 px-5 sm:px-8 py-4 sm:py-6 text-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-sense" strokeWidth={1.5} />
              <div>
                <h2 className="text-lg font-semibold text-text-headline">{t('dashboard.complaint_form_title', 'Form Pengaduan')}</h2>
                <p className="text-text-dim text-xs mt-0.5">{t('dashboard.complaint_form_desc', 'Laporkan kendala atau gangguan perangkat BIEON')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8 overflow-y-auto flex-1">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('dashboard.problem_device', 'Perangkat Bermasalah')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.device}
                onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sense/20 focus:border-sense"
              >
                <option value="">Pilih perangkat...</option>
                {realDevices.map(d => (
                  <option key={d._id} value={d.name}>{d.name} ({d.location})</option>
                ))}
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('dashboard.problem_type', 'Jenis Masalah')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sense/20 focus:border-sense"
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
                {t('dashboard.priority', 'Prioritas')}
              </label>
              <div className="flex gap-3">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: level })}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${formData.priority === level
                      ? level === 'high'
                        ? 'bg-alert-danger text-white hover:bg-alert-danger/90'
                        : level === 'medium'
                          ? 'bg-alert-warning text-white hover:bg-alert-warning/90'
                          : 'bg-alert-special text-white hover:bg-alert-special/90'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {level === 'high' ? t('dashboard.priority_high', 'Tinggi') : level === 'medium' ? t('dashboard.priority_medium', 'Sedang') : t('dashboard.priority_low', 'Rendah')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('dashboard.problem_desc', 'Deskripsi Masalah')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                placeholder="Jelaskan masalah yang Anda alami secara detail..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sense/20 focus:border-sense resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
            >
              {t('dashboard.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sense text-white rounded-xl font-semibold shadow-sm hover:bg-sense/90 hover:shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" strokeWidth={1.5} />
              )}
              {loading ? t('dashboard.sending', 'Mengirim...') : t('dashboard.send_complaint', 'Kirim Pengaduan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DataModal({ isOpen, onClose, chartType, energySummary }) {
  const { t, i18n } = useTranslation();
  if (!isOpen) return null;

  const data = chartType === 'daily'
    ? (energySummary?.dailyData || [])
    : (energySummary?.monthlyData || []);

  const title = chartType === 'daily' ? t('dashboard.energy_daily', 'Data Energi Harian (Hari Berjalan)') : t('dashboard.energy_monthly', 'Data Energi Bulanan (1 Tahun Terakhir)');

  const totalKwh = data.reduce((acc, curr) => acc + (curr.kwh || 0), 0);
  const totalCost = data.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      chartType === 'daily' ? t('dashboard.time_hour', 'Jam') : t('dashboard.time_month', 'Bulan'),
      t('dashboard.consumption', 'Konsumsi (kWh)'),
      chartType === 'daily' ? t('dashboard.power', 'Daya (Watt)') : '',
      t('dashboard.cost', 'Biaya (Rp)')
    ].filter(Boolean);
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
      t('dashboard.total', 'TOTAL'),
      totalKwh.toFixed(3),
      chartType === 'daily' ? '-' : undefined,
      `Rp ${(totalCost || 0).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US')}`
    ].filter(val => val !== undefined));

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`${t('history.export.print_date_label', 'Dicetak pada')}: ${new Date().toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US')}`, 14, 30);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [5, 155, 39], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [55, 65, 81], textColor: [255, 255, 255], fontStyle: 'bold' },
    });

    doc.save(`BIEON_Laporan_Energi_${chartType}_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in slide-in-from-bottom-10 duration-300">
        <div className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 sm:py-6 text-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-text-headline truncate">{title}</h2>
              <p className="text-text-dim text-[10px] sm:text-xs mt-0.5 truncate">
                {chartType === 'daily'
                  ? t('dashboard.energy_daily_desc', 'Data konsumsi energi per jam (00:00 - 23:59)')
                  : t('dashboard.energy_monthly_desc', 'Data konsumsi energi 12 bulan terakhir')}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <button
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-eco text-white rounded-xl font-bold hover:bg-eco/90 transition-all shadow-sm text-xs sm:text-sm"
              >
                <FileDown className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">{t('dashboard.download_pdf', 'Unduh PDF')}</span>
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto shadow-sm">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-700">
                  <th className="px-6 py-4 text-left font-semibold text-xs text-text-dim uppercase tracking-wider">
                    {chartType === 'daily' ? t('dashboard.time_hour', 'Jam') : t('dashboard.time_month', 'Bulan')}
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-xs text-text-dim uppercase tracking-wider">{t('dashboard.consumption', 'Konsumsi (kWh)')}</th>
                  {chartType === 'daily' && <th className="px-6 py-4 text-left font-semibold text-xs text-text-dim uppercase tracking-wider">{t('dashboard.power', 'Daya (Watt)')}</th>}
                  <th className="px-6 py-4 text-left font-semibold text-xs text-text-dim uppercase tracking-wider">{t('dashboard.cost', 'Biaya (Rp)')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50 transition-colors"
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
                    <td className="px-6 py-4 font-semibold text-eco">
                      Rp {(item.cost || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200 text-slate-800 font-bold">
                  <td className="px-6 py-4">{t('dashboard.total', 'TOTAL')}</td>
                  <td className="px-6 py-4">{totalKwh.toFixed(3)} kWh</td>
                  {chartType === 'daily' && <td className="px-6 py-4">-</td>}
                  <td className="px-6 py-4 text-eco">
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

function WarningLimitModal({ isOpen, onClose, limit, setLimit, deposit, setDeposit, onRefresh, energySummary }) {
  const { t, i18n } = useTranslation();
  const [inputLimit, setInputLimit] = useState(limit.toString());
  const [inputDeposit, setInputDeposit] = useState(deposit.toString());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setInputLimit(limit.toString());
    setInputDeposit(''); // Kosongkan agar user bisa langsung ketik nominal top-up
  }, [limit, deposit, isOpen]);

  if (!isOpen) return null;

  const totalTerpakai = energySummary?.monthlyData?.[new Date().getMonth()]?.cost || 0;
  const sisaAnggaran = deposit - totalTerpakai;
  const isOverBudget = sisaAnggaran <= 0;
  const isWaspada = sisaAnggaran <= limit && sisaAnggaran > 0;

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
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in slide-in-from-bottom-10 duration-300">
        {/* Header with White BG & Border, responsive padding */}
        <div className="bg-white border-b border-slate-100 px-5 sm:px-8 py-5 sm:py-6 text-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-eco/10 rounded-2xl flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-eco" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-text-headline leading-tight">{t('homeowner_qc.budget.title', 'Manajemen Anggaran Listrik')}</h2>
                <p className="text-text-dim text-[10px] sm:text-xs mt-0.5 font-medium opacity-90">{t('homeowner_qc.budget.subtitle', 'Monitoring anggaran & batas peringatan kritis')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all text-slate-500 hover:text-slate-800 shrink-0"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
          {/* Status Section */}
          <div className={`border rounded-2xl p-5 flex flex-col gap-3 mb-8 transition-colors ${isOverBudget ? 'bg-red-50 border-red-100 text-red-600' :
            isWaspada ? 'bg-amber-50 border-amber-100 text-amber-600' :
              'bg-green-50 border-green-100 text-green-700'
            }`}>
            <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
              <span>{t('dashboard.budget_this_month', 'Anggaran Bulan Ini:')}</span>
              <span className="font-semibold text-text-headline">Rp {deposit.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
              <span>{t('dashboard.used_this_month', 'Terpakai Bulan Ini:')}</span>
              <span className="font-semibold text-text-headline">Rp {totalTerpakai.toLocaleString('id-ID')}</span>
            </div>
            <div className={`flex justify-between items-center text-sm font-semibold mt-1 pt-3 border-t ${isOverBudget ? 'border-red-200' :
              isWaspada ? 'border-amber-200' :
                'border-green-200'
              }`}>
              <span className={isOverBudget ? 'text-red-600' : isWaspada ? 'text-amber-600' : 'text-green-900'}>{t('dashboard.remaining_budget', 'Sisa Anggaran:')}</span>
              <span className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : isWaspada ? 'text-amber-600' : 'text-green-600'}`}>Rp {Math.max(0, sisaAnggaran).toLocaleString('id-ID')}</span>
            </div>
            <div className={`flex justify-between items-center text-xs mt-1 p-2 rounded-lg font-semibold tracking-wide ${isOverBudget ? 'bg-red-100/50 text-red-700' :
              isWaspada ? 'bg-amber-100/50 text-amber-700' :
                'bg-green-100/50 text-green-800'
              }`}>
              <span>{t('dashboard.status', 'Status:')}</span>
              <span className="flex items-center gap-1">
                {isOverBudget ? <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} /> : isWaspada ? <Zap className="w-3.5 h-3.5" strokeWidth={1.5} /> : <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
                {isOverBudget ? t('dashboard.status_over_budget', 'Melebihi Anggaran') : isWaspada ? t('dashboard.status_budget_warning', 'Waspada') : t('dashboard.status_budget_safe', 'Aman')}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 ml-1">{t('dashboard.warning_limit', 'Batas Peringatan (Rp)')}</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[10000, 20000, 30000, 50000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setInputLimit(val.toString())}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all border ${inputLimit === val.toString()
                      ? 'border-eco bg-eco/5 text-eco'
                      : 'border-slate-100 bg-white text-text-dim hover:border-eco/30'
                      }`}
                  >
                    Rp {val.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-300 group-focus-within:text-eco transition-colors">Rp</div>
                <input
                  type="number"
                  value={inputLimit}
                  onChange={(e) => setInputLimit(e.target.value)}
                  placeholder="30000"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:border-eco focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 ml-1">{t('dashboard.set_budget', 'Atur Anggaran Bulanan (Rp)')}</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-300 group-focus-within:text-eco transition-colors">Rp</div>
                <input
                  type="number"
                  value={inputDeposit}
                  onChange={(e) => setInputDeposit(e.target.value)}
                  placeholder={t('homeowner_qc.budget.input_placeholder', 'Masukkan nominal (Contoh: 1000000)')}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:border-eco focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitted}
              className={`w-full py-4 rounded-2xl font-semibold text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2
                ${submitted
                  ? 'bg-eco text-white'
                  : 'bg-eco text-white hover:bg-eco/90 hover:shadow-md'
                }`}
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
                  <span>{t('homeowner_qc.budget.success_msg', 'Berhasil Disimpan')}</span>
                </>
              ) : (
                t('homeowner_qc.budget.btn_save', 'Simpan Pengaturan')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function HomeownerDashboard() {
  const { t, i18n } = useTranslation();
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

  // Sandbox Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTemp, setSimTemp] = useState(24.8);
  const [simHumidity, setSimHumidity] = useState(55);
  const [simSecurity, setSimSecurity] = useState([
    { type: 'Motion Sensor', status: 'No Motion', room: 'Ruang Tamu' },
    { type: 'Door Sensor', status: 'Closed', room: 'Dapur' },
    { type: 'Door Sensor', status: 'Closed', room: 'Garasi' }
  ]);
  const [simPh, setSimPh] = useState(7.25);
  const [simTurbidity, setSimTurbidity] = useState(2.1);
  const [simTds, setSimTds] = useState(78);
  const [simWaterTemp, setSimWaterTemp] = useState(24);
  const [masterCardMode, setMasterCardMode] = useState(() => localStorage.getItem('masterCardMode') || 'eco-solid');

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('masterCardMode', masterCardMode);
  }, [masterCardMode]);

  const getMasterCardStyles = (isSafe) => {
    if (masterCardMode === 'eco-solid') {
      return {
        cardClass: isSafe
          ? 'bg-[#E6F5E9] border border-[#E0F1E6] text-slate-800 shadow-sm'
          : 'bg-[#FEF9C3] border border-[#FEF3C7] text-slate-800 shadow-sm',
        headerClass: `text-center pb-3 border-b ${isSafe ? 'border-[#E0F1E6]' : 'border-[#FEF3C7]'}`,
        titleTextClass: 'text-center',
        dividerClass: isSafe ? 'border-[#E0F1E6]' : 'border-[#FEF3C7]',
        titleClass: 'text-slate-400',
        statusClass: isSafe
          ? 'text-[#059b27] font-extrabold text-xl md:text-2xl tracking-wide'
          : 'text-[#D97706] font-extrabold text-xl md:text-2xl tracking-wide',
        iconClass: 'w-14 h-14 text-white'
      };
    } else if (masterCardMode === 'eco-solid-soft') {
      return {
        cardClass: isSafe
          ? 'bg-[#E6F5E9] border border-[#c3e6cb] text-slate-800 shadow-sm'
          : 'bg-amber-50 border border-amber-200 text-slate-800 shadow-sm',
        headerClass: `text-center pb-3 border-b ${isSafe ? 'border-[#c3e6cb]' : 'border-amber-200'}`,
        titleTextClass: 'text-center',
        dividerClass: isSafe ? 'border-[#c3e6cb]' : 'border-amber-200',
        titleClass: 'text-slate-500',
        statusClass: 'text-slate-800 font-extrabold text-xl md:text-2xl tracking-wide',
        iconClass: isSafe ? 'w-14 h-14 text-eco drop-shadow-sm' : 'w-14 h-14 text-amber-500 drop-shadow-sm'
      };
    } else if (masterCardMode === 'eco-icon-soft') {
      return {
        cardClass: 'bg-slate-50 border border-slate-200/80 text-slate-800 shadow-md shadow-slate-200/60',
        headerClass: 'text-left pb-3',
        titleTextClass: 'text-left',
        dividerClass: 'border-slate-200',
        titleClass: 'text-slate-400',
        statusClass: 'text-text-headline font-extrabold text-xl md:text-2xl tracking-wide',
        iconClass: 'w-14 h-14 text-white'
      };
    } else {
      // 'eco-icon'
      return {
        cardClass: isSafe
          ? 'bg-white text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md'
          : 'bg-white text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md',
        headerClass: 'text-left pb-3',
        titleTextClass: 'text-left',
        dividerClass: isSafe ? 'border-eco/20' : 'border-amber-200',
        titleClass: 'text-slate-500',
        statusClass: isSafe
          ? 'text-slate-800 font-extrabold text-xl md:text-2xl tracking-wide'
          : 'text-slate-800 font-extrabold text-xl md:text-2xl tracking-wide',
        iconClass: isSafe ? 'w-14 h-14 text-eco drop-shadow-sm' : 'w-14 h-14 text-amber-500 drop-shadow-sm'
      };
    }
  };

  const renderCardIcon = (Icon, isSafe) => {
    if (isSafe) {
      if (masterCardMode === 'eco-solid' || masterCardMode === 'eco-icon-soft') {
        return (
          <div className="relative aspect-square h-full max-h-28 min-h-[4rem] rounded-full bg-[#059b27] border border-[#E0F1E6] flex items-center justify-center shadow-inner">
            <div className="absolute inset-[-8%] rounded-full border border-dashed border-[#059b27]/30 animate-spin-slow"></div>
            <Icon className="w-1/2 h-1/2 text-white drop-shadow-sm" strokeWidth={1.5} />
          </div>
        );
      } else if (masterCardMode === 'eco-solid-soft') {
        return (
          <div className="relative aspect-square h-full max-h-28 min-h-[4rem] rounded-full bg-white border border-[#c3e6cb] flex items-center justify-center shadow-sm">
            <div className="absolute inset-[-8%] rounded-full border border-dashed border-eco/30 animate-spin-slow"></div>
            <Icon className="w-1/2 h-1/2 text-eco drop-shadow-sm" strokeWidth={1.5} />
          </div>
        );
      } else { // eco-icon
        return (
          <div className="relative aspect-square h-full max-h-28 min-h-[4rem] rounded-full bg-eco flex items-center justify-center shadow-md">
            <div className="absolute inset-[-8%] rounded-full border border-dashed border-eco/30 animate-spin-slow"></div>
            <Icon className="w-1/2 h-1/2 text-white drop-shadow-sm" strokeWidth={1.5} />
          </div>
        );
      }
    } else {
      if (masterCardMode === 'eco-solid' || masterCardMode === 'eco-icon-soft') {
        return (
          <div className="relative aspect-square h-full max-h-28 min-h-[4rem] rounded-full bg-[#F49E0B] border border-[#FEF3C7] flex items-center justify-center shadow-inner">
            <div className="absolute inset-0 rounded-full bg-[#F49E0B]/10 animate-ping [animation-duration:2s]"></div>
            <div className="absolute inset-[-8%] rounded-full border border-dashed border-[#F49E0B]/40 animate-spin-fast"></div>
            <Icon className="w-1/2 h-1/2 text-white animate-pulse drop-shadow-sm" strokeWidth={1.5} />
          </div>
        );
      } else if (masterCardMode === 'eco-solid-soft') {
        return (
          <div className="relative aspect-square h-full max-h-28 min-h-[4rem] rounded-full bg-white border border-amber-200 flex items-center justify-center shadow-sm">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping [animation-duration:2s]"></div>
            <div className="absolute inset-[-8%] rounded-full border border-dashed border-amber-400/40 animate-spin-fast"></div>
            <Icon className="w-1/2 h-1/2 text-amber-500 animate-pulse drop-shadow-sm" strokeWidth={1.5} />
          </div>
        );
      } else { // eco-icon
        return (
          <div className="relative aspect-square h-full max-h-28 min-h-[4rem] rounded-full bg-amber-500 flex items-center justify-center shadow-md">
            <div className="absolute inset-0 rounded-full bg-amber-500/15 animate-ping [animation-duration:1.5s]"></div>
            <div className="absolute inset-[-8%] rounded-full border border-dashed border-amber-400/40 animate-spin-fast"></div>
            <Icon className="w-1/2 h-1/2 text-white animate-pulse drop-shadow-sm" strokeWidth={1.5} />
          </div>
        );
      }
    }
  };

  const handleSetSimSecurityCount = (count) => {
    const defaultSensors = [
      { type: 'Motion Sensor', status: 'No Motion', room: 'Ruang Tamu' },
      { type: 'Door Sensor', status: 'Closed', room: 'Dapur' },
      { type: 'Door Sensor', status: 'Closed', room: 'Garasi' },
      { type: 'Motion Sensor', status: 'No Motion', room: 'Kamar Utama' },
      { type: 'Door Sensor', status: 'Closed', room: 'Pintu Depan' },
      { type: 'Motion Sensor', status: 'No Motion', room: 'Halaman Belakang' },
      { type: 'Door Sensor', status: 'Closed', room: 'Jendela Samping' }
    ];
    setSimSecurity(defaultSensors.slice(0, count));
  };

  // States for real data
  const [realDevices, setRealDevices] = useState([]);
  const [realNotifications, setRealNotifications] = useState([]);
  const [realActivities, setRealActivities] = useState([]);
  const [energySummary, setEnergySummary] = useState(null);

  // ─────── Interactive Design System Theme Switcher ───────
  // Sandbox removed for visual cleanup
  const fetchDashboardData = async () => {
    // ─────── Dual-Powered Bypass Toggle (Limited to asrisaras17@gmail.com) ───────
    const userEmail = getEmailFromToken();
    const isTestAccount = userEmail === 'asrisaras17@gmail.com';

    if (isTestAccount && localStorage.getItem('USE_MOCK_DATA') !== 'true') {
      localStorage.setItem('USE_MOCK_DATA', 'true');
    }

    const USE_MOCK = isTestAccount && (import.meta.env.VITE_USE_MOCK_DATA === 'true' || localStorage.getItem('USE_MOCK_DATA') === 'true');

    if (USE_MOCK) {
      setRealDevices(mockDevices);

      const normalizedMock = mockNotifications.map(m => ({
        _id: m._id,
        title: m.title,
        category: m.category,
        message: m.message,
        type: m.type,
        isRead: m.isRead !== undefined ? m.isRead : (m.read !== undefined ? m.read : false),
        isSeen: m.isSeen !== undefined ? m.isSeen : true,
        date: m.createdAt || m.date || new Date().toISOString()
      }));
      setRealNotifications(normalizedMock);

      setEnergySummary(mockEnergySummary);
      if (mockEnergySummary.tokenBalance !== undefined) setDepositBalance(mockEnergySummary.tokenBalance);
      if (mockEnergySummary.tokenThreshold !== undefined) setWarningLimit(mockEnergySummary.tokenThreshold);
      setRealActivities(mockActivities);
      return;
    }

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
      let apiData = [];
      try {
        const resAlerts = await fetch('/api/alerts', { headers });
        if (resAlerts.ok) {
          const data = await resAlerts.json();
          apiData = data.data || [];
        }
      } catch (err) {
        console.error("Gagal fetch alerts real:", err);
      }

      const normalizedMock = mockNotifications.map(m => ({
        _id: m._id,
        title: m.title,
        category: m.category,
        message: m.message,
        type: m.type,
        isRead: m.isRead !== undefined ? m.isRead : (m.read !== undefined ? m.read : false),
        isSeen: m.isSeen !== undefined ? m.isSeen : true,
        date: m.createdAt || m.date || new Date().toISOString()
      }));

      const normalizedApi = apiData.map(a => ({
        _id: a._id,
        title: a.title,
        category: a.category,
        message: a.message,
        type: a.type,
        isRead: a.isRead !== undefined ? a.isRead : false,
        isSeen: a.isSeen !== undefined ? a.isSeen : false,
        date: a.date || a.createdAt || new Date().toISOString(),
        metadata: a.metadata,
        link: a.link
      }));

      const merged = [...normalizedApi];
      normalizedMock.forEach(mockItem => {
        const exists = merged.some(apiItem =>
          apiItem._id === mockItem._id ||
          ((apiItem.title || '').toString().toLowerCase().trim() === (mockItem.title || '').toString().toLowerCase().trim())
        );
        if (!exists) {
          merged.push(mockItem);
        }
      });

      merged.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRealNotifications(merged);

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
      // ─────── Dual-Powered Bypass Toggle (Limited to asrisaras17@gmail.com) ───────
      const userEmail = getEmailFromToken();
      const isTestAccount = userEmail === 'asrisaras17@gmail.com';

      if (isTestAccount && localStorage.getItem('USE_MOCK_DATA') !== 'true') {
        localStorage.setItem('USE_MOCK_DATA', 'true');
      }

      const USE_MOCK = isTestAccount && (import.meta.env.VITE_USE_MOCK_DATA === 'true' || localStorage.getItem('USE_MOCK_DATA') === 'true');

      if (USE_MOCK) {
        setLiveTemp(mockSensors.liveTemp);
        setLiveHumidity(mockSensors.liveHumidity);
        setLivePh(mockSensors.livePh);
        setLiveTurbidity(mockSensors.liveTurbidity);
        setLiveTds(mockSensors.liveTds);
        setLiveWaterTemp(mockSensors.liveWaterTemp);
        return;
      }

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

        const resWaterTemp = await fetch('/api/sensors/suhu-air');
        if (resWaterTemp.ok) {
          const data = await resWaterTemp.json();
          if (data && data[0] && data[0].value !== null) setLiveWaterTemp(data[0].value);
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
    rooms = [{ id: 'all', name: t('dashboard.all_rooms'), devices: realDevices.length }, ...Array.from(roomMap.values())];
  } else {
    // Jika benar-benar kosong (user baru), tampilkan state kosong yang rapi
    rooms = [{ id: 'all', name: t('dashboard.all_rooms'), devices: 0 }];
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
  const hasComfort = isSimulating || currentDevices.some(d => d.environmentAspect === 'Kenyamanan' || (d.category === 'sensor' && ['Sensor Kenyamanan', 'Humidity Sensor', 'Temperature Sensor'].includes(d.type)));
  const hasSecurity = isSimulating || currentDevices.some(d => d.environmentAspect === 'Keamanan' || (d.category === 'sensor' && ['Sensor Keamanan', 'Door Sensor', 'Motion Sensor'].some(t => d.type?.includes(t))));
  const hasWater = isSimulating || currentDevices.some(d => d.environmentAspect === 'Kualitas Air' || (d.category === 'sensor' && ['Sensor Kualitas Air', 'Water Sensor'].includes(d.type)));

  let currentSensors = {};
  // Gunakan data mock untuk visual, tapi hanya jika kategorinya relevan dengan perangkat user
  // Gunakan data real-time jika ada
  if (hasComfort) {
    currentSensors.comfort = {
      temp: isSimulating ? simTemp : liveTemp,
      humidity: isSimulating ? simHumidity : liveHumidity,
      comfortLevel: 82
    };
  }
  if (hasSecurity) {
    if (isSimulating) {
      currentSensors.security = simSecurity;
    } else {
      // Ambil status asli dari perangkat security jika ada
      const securityDevices = currentDevices.filter(d => d.environmentAspect === 'Keamanan');
      let securityList = [];
      if (securityDevices.length > 0) {
        securityList = securityDevices.map(d => ({
          type: d.name,
          status: d.status === '1' ? 'Active' : d.status === '0' ? 'Inactive' : d.status,
          room: d.location
        }));
      } else {
        // Safe fallback using mockDevices to prevent ROOM_SENSORS ReferenceError crash
        securityList = mockDevices.filter(d => d.environmentAspect === 'Keamanan').map(d => ({
          type: d.name,
          status: d.status,
          room: d.location
        }));
      }
      // Slice to 3 cards for normal condition (not simulating)
      currentSensors.security = securityList.slice(0, 3);
    }
  }
  if (hasWater) currentSensors.waterQuality = { status: 'drinkable', ph: isSimulating ? simPh : livePh, turbidity: isSimulating ? simTurbidity : liveTurbidity, tds: isSimulating ? simTds : liveTds, temp: isSimulating ? simWaterTemp : liveWaterTemp };
  const dailyData = energySummary?.dailyData || [];
  const monthlyData = energySummary?.monthlyData || [];
  const notifications = realNotifications;

  const getLocalizedAction = (action) => {
    if (!action) return action;
    const lower = action.toLowerCase();
    if (lower.includes('menyalakan') || lower === 'on') return t('dashboard.action_on', 'ON');
    if (lower.includes('mematikan') || lower === 'off') return t('dashboard.action_off', 'OFF');
    return action.toUpperCase();
  };

  const getLocalizedTrigger = (trigger) => {
    if (!trigger) return trigger;
    const lower = trigger.toLowerCase();
    if (lower.includes('manual')) return t('dashboard.trigger_manual', 'MANUAL');
    if (lower.includes('web')) return t('dashboard.trigger_web', 'WEB');
    return trigger.toUpperCase();
  };

  const mappedActivities = realActivities.map(act => {
    const statusStr = String(act.status || '').toUpperCase();
    const icon = (statusStr === 'ON' || statusStr === '1') ? Power : Zap;
    const color = (statusStr === 'ON' || statusStr === '1') ? 'emerald' : 'gray';

    return {
      device: act.deviceName || act.actuator || 'Perangkat',
      action: act.action || ((statusStr === 'ON' || statusStr === '1') ? 'ON' : 'OFF'),
      trigger: act.trigger || 'Manual',
      time: act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
      icon,
      color
    };
  });

  const getLocalizedCategory = (text) => {
    if (!text) return t('notification.ui.title', 'Notifikasi');
    const lower = text.toLowerCase();
    if (lower.includes('bahaya')) return t('notification.category.danger', 'Bahaya');
    if (lower.includes('waspada')) return t('notification.category.warning', 'Waspada');
    if (lower.includes('keamanan')) return t('notification.category.security', 'Keamanan');
    if (lower.includes('sistem') || lower.includes('hub') || lower.includes('kontrol')) return t('notification.category.system', 'Sistem');
    if (lower.includes('pengaduan') || lower.includes('tiket') || lower.includes('tugas') || lower.includes('perbaikan')) {
      return t('notification.category.complaint', 'Pengaduan');
    }
    if (lower.includes('kenyamanan')) return t('notification.category.comfort', 'Kenyamanan');
    if (lower.includes('energi') || lower.includes('anggaran') || lower.includes('tarif')) {
      return t('notification.category.energy', 'Energi');
    }
    if (lower.includes('air') || lower.includes('tandon') || lower.includes('ph')) {
      return t('notification.category.water', 'Air Sanitasi');
    }
    return text;
  };

  const getLocalizedTitle = (text, category) => {
    if (!text) return getLocalizedCategory(category);
    const lower = text.toLowerCase();
    if (lower.includes('terkirim')) return t('notification.title.complaint_sent', text);
    if (lower.includes('tiket pengaduan baru')) return t('notification.title.new_complaint_ticket', text);
    if (lower.includes('mulai memproses')) return t('notification.title.tech_processing', text);
    if (lower.includes('perbaikan selesai')) return t('notification.title.repair_finished', text);
    if (lower.includes('pekerjaan selesai')) return t('notification.title.job_finished', text);
    if (lower.includes('ditolak')) return t('notification.title.complaint_rejected', text);
    if (lower.includes('dibatalkan')) return t('notification.title.ticket_cancelled', text);
    if (lower.includes('update perbaikan')) return t('notification.title.repair_update', text);
    if (lower.includes('permintaan data log')) return t('notification.title.log_request', text);
    if (lower.includes('akses log diberikan')) return t('notification.title.log_granted', text);
    if (lower.includes('akses log ditolak')) return t('notification.title.log_denied', text);
    if (lower.includes('tugas perbaikan baru')) return t('notification.title.new_task', text);
    if (lower.includes('teknisi ditugaskan')) return t('notification.title.tech_assigned', text);
    if (lower.includes('overdue')) return t('notification.title.sla_overdue', text);
    if (lower.includes('anggaran diperbarui')) return t('notification.title.budget_updated', text);
    if (lower.includes('peringatan anggaran diperbarui')) return t('notification.title.threshold_updated', text);
    if (lower.includes('terlalu rendah')) return t('notification.title.low_budget', text);
    if (lower.includes('kontrol perangkat')) return t('notification.title.device_control', text);
    return getLocalizedCategory(category || text);
  };

  const handleReadNotification = async (notif) => {
    try {
      const id = notif._id;
      // Optimistic Update
      setRealNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

      // Handle Deep Linking
      if (notif.link) {
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
        } else {
          navigate(`/${notif.link}`);
        }
      }

      // Update to backend
      const token = localStorage.getItem('token');
      if (token && id && !id.startsWith('notif-')) {
        await fetch(`/api/alerts/${id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Gagal menandai baca:", error);
    }
  };



  return (
    <HomeownerLayout
      currentPage="dashboard"
      hideBottomNav={showComplaintModal || showDataModal || showWarningModal}
    >
      <div className="w-full bg-[#F8FAFC] min-h-screen">
        <div className="max-w-[1900px] mx-auto px-3 sm:px-4 md:px-8 py-4 md:py-8 font-sans">
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 mb-8">
            <div className="flex items-center gap-2.5 mb-4">
              <Home className="w-5 h-5 text-eco-500" strokeWidth={1.5} />
              <h3 className="font-semibold text-text-headline text-lg tracking-tight">{t('dashboard.select_room')}</h3>
            </div>
            <div className="flex flex-wrap gap-2.5 pb-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`px-5 py-2.5 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${selectedRoom === room.id
                    ? 'bg-eco text-white shadow-sm scale-[1.01]'
                    : 'bg-slate-50 text-text-dim hover:bg-slate-100 hover:text-text-headline border border-slate-100'
                    }`}
                >
                  {room.name} ({room.devices})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-9 space-y-6 md:space-y-8">
              {currentSensors.comfort && (
                <div className="mb-6">
                  <h2 id="section-kenyamanan" className="text-xl font-bold text-text-headline mb-4 tracking-tight">
                    {t('dashboard.comfort')}
                  </h2>

                  <div className="flex flex-col md:flex-row gap-4 w-full">
                    {/* Kiri (Master - Status) */}
                    <div className="w-full md:w-1/3">
                      {(() => {
                        const tempVal = selectedRoom === 'all' ? (isSimulating ? simTemp : liveTemp) : currentSensors.comfort.temp;
                        const humVal = selectedRoom === 'all' ? (isSimulating ? simHumidity : liveHumidity) : currentSensors.comfort.humidity;
                        const isComfortable = tempVal >= 18 && tempVal <= 30 && humVal >= 40 && humVal <= 60;

                        const styles = getMasterCardStyles(isComfortable);
                        const statusText = isComfortable ? t('dashboard.status_comfortable', 'Nyaman') : t('dashboard.status_comfort_bad_text', 'Tidak Nyaman');

                        return (
                          <div className={`${styles.cardClass} rounded-[24px] p-6 flex flex-col justify-between h-full min-h-[200px] transition-all duration-500 hover:scale-[1.01] relative overflow-hidden`}>
                            {/* 1. Judul Status */}
                            <div className={`${styles.headerClass} z-10`}>
                              <div className={`font-semibold text-sm text-text-headline ${styles.titleTextClass} tracking-tight`}>{t('dashboard.comfort_status', 'Status Kenyamanan')}</div>
                            </div>

                            {/* 2. Icon */}
                            <div className="flex-1 flex items-center justify-center text-center py-3 z-10">
                              {isComfortable ? renderCardIcon(ThermometerSun, true) : renderCardIcon(AlertTriangle, false)}
                            </div>

                            {/* 3. Input Statusnya */}
                            <div className="text-center z-10">
                              <span className={styles.statusClass}>
                                {statusText}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Kanan (Detail - Parameter) */}
                    <div className="w-full md:w-2/3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                        {currentSensors.comfort.temp != null && (() => {
                          const tempVal = selectedRoom === 'all' ? (isSimulating ? simTemp : liveTemp) : currentSensors.comfort.temp;
                          // Range for visual progress dot: 15°C to 35°C (20 units)
                          const tempPercent = (tempVal != null && !isNaN(tempVal)) ? Math.min(100, Math.max(0, ((tempVal - 15) / 20) * 100)) : 0;

                          // Status styling based on value
                          let statusLabel = '';
                          let textClass = '';
                          let borderClass = '';
                          let iconColorClass = 'text-eco';
                          let isPulse = false;
                          if (tempVal < 18) {
                            statusLabel = t('dashboard.status_cold', 'Dingin');
                            textClass = 'text-amber-600';
                            borderClass = 'border-amber-500/30';
                            iconColorClass = 'text-amber-500';
                          } else if (tempVal <= 30) {
                            statusLabel = t('dashboard.status_comfortable', 'Nyaman');
                            textClass = 'text-eco';
                            borderClass = 'border-eco-500/30';
                            iconColorClass = 'text-eco';
                          } else {
                            statusLabel = t('dashboard.status_hot', 'Panas');
                            textClass = 'text-amber-600';
                            borderClass = 'border-amber-500/30';
                            iconColorClass = 'text-amber-500';
                            isPulse = true;
                          }

                          return (
                            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-all p-5 flex flex-col justify-between h-full">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-sm text-text-headline tracking-tight">{t('dashboard.temperature')}</span>
                                <ThermometerSun className={`w-8 h-8 ${iconColorClass} ${isPulse ? 'animate-pulse' : ''}`} strokeWidth={1.5} />
                              </div>

                              <div className="flex-1 py-1">
                                <div className="text-3xl font-extrabold text-text-headline tracking-tight">
                                  {tempVal}°C
                                </div>
                              </div>

                              {/* Segmented Range Indicator */}
                              <div className="relative mt-auto pt-2">
                                {/* Opsi A: Floating Tooltip (Opaque) */}
                                <div
                                  className="absolute bottom-full mb-0.5 transform -translate-x-1/2 transition-all duration-500 flex flex-col items-center z-10"
                                  style={{ left: `${tempPercent}%` }}
                                >
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-md border bg-white ${textClass} ${borderClass}`}>
                                    {statusLabel}
                                  </span>
                                  <div className="w-1.5 h-1.5 bg-white rotate-45 -mt-1 border-r border-b border-slate-200"></div>
                                </div>

                                {/* Color zones bar */}
                                <div className="h-2.5 w-full rounded-full flex overflow-hidden bg-slate-100">
                                  <div className="h-full bg-amber-200" style={{ width: '15%' }} title={`${t('dashboard.status_cold', 'Dingin')} (<18°C)`}></div>
                                  <div className="h-full bg-emerald-400" style={{ width: '60%' }} title={`${t('dashboard.status_ideal', 'Ideal')} (18°C - 30°C)`}></div>
                                  <div className="h-full bg-amber-200" style={{ width: '25%' }} title={`${t('dashboard.status_hot', 'Panas')} (>30°C)`}></div>
                                </div>

                                {/* Indicator dot */}
                                <div
                                  className="absolute top-1.5 w-4 h-4 bg-white border-2 border-slate-700 rounded-full shadow-md transform -translate-x-1/2 transition-all duration-500 hover:scale-110 z-10"
                                  style={{ left: `${tempPercent}%` }}
                                ></div>

                                {/* Labels */}
                                <div className="relative text-[9px] text-text-dim font-bold mt-1.5 h-3">
                                  <span className="absolute -translate-x-1/2" style={{ left: '15%' }}>18°C</span>
                                  <span className="absolute -translate-x-1/2" style={{ left: '75%' }}>30°C</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {currentSensors.comfort.humidity != null && (() => {
                          const humVal = selectedRoom === 'all' ? (isSimulating ? simHumidity : liveHumidity) : currentSensors.comfort.humidity;
                          // Range for visual progress dot: 30% to 90% (60 units)
                          const humPercent = (humVal != null && !isNaN(humVal)) ? Math.min(100, Math.max(0, ((humVal - 30) / 60) * 100)) : 0;

                          // Status styling based on value
                          let statusLabel = '';
                          let textClass = '';
                          let borderClass = '';
                          let iconColorClass = 'text-eco';
                          if (humVal < 40) {
                            statusLabel = t('dashboard.status_humidity_dry', 'Kering');
                            textClass = 'text-amber-600';
                            borderClass = 'border-amber-500/30';
                            iconColorClass = 'text-amber-500';
                          } else if (humVal <= 60) {
                            statusLabel = t('dashboard.status_comfortable', 'Nyaman');
                            textClass = 'text-eco';
                            borderClass = 'border-eco-500/30';
                            iconColorClass = 'text-eco';
                          } else {
                            statusLabel = t('dashboard.status_humidity_humid', 'Lembap');
                            textClass = 'text-amber-600';
                            borderClass = 'border-amber-500/30';
                            iconColorClass = 'text-amber-500';
                          }

                          return (
                            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-all p-5 flex flex-col justify-between h-full">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-sm text-text-headline tracking-tight">{t('dashboard.humidity')}</span>
                                <Droplet className={`w-8 h-8 ${iconColorClass}`} strokeWidth={1.5} />
                              </div>

                              <div className="flex-1 py-1">
                                <div className="text-3xl font-extrabold text-text-headline tracking-tight">
                                  {humVal}%
                                </div>
                              </div>

                              {/* Segmented Range Indicator */}
                              <div className="relative mt-auto pt-2">
                                {/* Opsi A: Floating Tooltip (Opaque) */}
                                <div
                                  className="absolute bottom-full mb-0.5 transform -translate-x-1/2 transition-all duration-500 flex flex-col items-center z-10"
                                  style={{ left: `${humPercent}%` }}
                                >
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-md border bg-white ${textClass} ${borderClass}`}>
                                    {statusLabel}
                                  </span>
                                  <div className="w-1.5 h-1.5 bg-white rotate-45 -mt-1 border-r border-b border-slate-200"></div>
                                </div>

                                {/* Color zones bar */}
                                <div className="h-2.5 w-full rounded-full flex overflow-hidden bg-slate-100">
                                  <div className="h-full bg-amber-200" style={{ width: '16.67%' }} title={`${t('dashboard.status_humidity_dry', 'Kering')} (<40%)`}></div>
                                  <div className="h-full bg-emerald-400" style={{ width: '33.33%' }} title={`${t('dashboard.status_ideal', 'Ideal')} (40% - 60%)`}></div>
                                  <div className="h-full bg-amber-200" style={{ width: '50%' }} title={`${t('dashboard.status_humidity_humid_short', 'Lembap')} (>60%)`}></div>
                                </div>

                                {/* Indicator dot */}
                                <div
                                  className="absolute top-1.5 w-4 h-4 bg-white border-2 border-slate-700 rounded-full shadow-md transform -translate-x-1/2 transition-all duration-500 hover:scale-110 z-10"
                                  style={{ left: `${humPercent}%` }}
                                ></div>

                                {/* Labels */}
                                <div className="relative text-[9px] text-text-dim font-bold mt-1.5 h-3">
                                  <span className="absolute -translate-x-1/2" style={{ left: '16.67%' }}>40%</span>
                                  <span className="absolute -translate-x-1/2" style={{ left: '50%' }}>60%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentSensors.security && currentSensors.security.length > 0 && (() => {
                const getRowSizes = (n) => {
                  if (n <= 0) return [];
                  if (n === 1) return [1];
                  if (n === 2) return [2];
                  if (n === 3) return [3];
                  if (n === 4) return [2, 2];

                  const remainder = n % 3;
                  if (remainder === 0) {
                    return Array(n / 3).fill(3);
                  } else if (remainder === 1) {
                    const numThrees = Math.floor((n - 4) / 3);
                    return [...Array(numThrees).fill(3), 2, 2];
                  } else {
                    const numThrees = Math.floor((n - 2) / 3);
                    return [...Array(numThrees).fill(3), 2];
                  }
                };

                const rowSizes = getRowSizes(currentSensors.security.length);
                let currentIndex = 0;
                const rows = rowSizes.map(size => {
                  const rowItems = currentSensors.security.slice(currentIndex, currentIndex + size);
                  currentIndex += size;
                  return { size, items: rowItems };
                });

                return (
                  <div className="mb-6">
                    <h2 id="section-keamanan" className="text-xl font-bold text-text-headline mb-4 tracking-tight">
                      {t('dashboard.security')}
                    </h2>

                    <div className="flex flex-col md:flex-row gap-4 w-full items-stretch">
                      {/* Kiri (Master - Status) */}
                      <div className="w-full md:w-1/3">
                        {(() => {
                          const isAllSafe = currentSensors.security.every(s =>
                            s.status === 'Normal' || s.status === 'Closed' || s.status === 'No Motion'
                          );

                          const styles = getMasterCardStyles(isAllSafe);
                          const statusText = isAllSafe ? t('dashboard.status_all_safe_text', 'Semua Aman') : t('dashboard.status_needs_attention_text', 'Perlu Perhatian');

                          return (
                            <div className={`${styles.cardClass} rounded-[24px] p-6 flex flex-col justify-between h-full min-h-[200px] transition-all duration-500 hover:scale-[1.01] relative overflow-hidden`}>
                              {/* 1. Judul Status */}
                              <div className={`${styles.headerClass} z-10`}>
                                <div className={`font-semibold text-sm text-text-headline ${styles.titleTextClass} tracking-tight`}>{t('dashboard.security_status', 'Status Keamanan')}</div>
                              </div>

                              {/* 2. Icon */}
                              <div className="flex-1 flex items-center justify-center text-center py-3 z-10">
                                {isAllSafe ? renderCardIcon(ShieldCheck, true) : renderCardIcon(AlertTriangle, false)}
                              </div>

                              {/* 3. Input Statusnya */}
                              <div className="text-center z-10">
                                <span className={styles.statusClass}>
                                  {statusText}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Kanan (Detail - Sensor Dinamis) */}
                      <div className="w-full md:w-2/3 flex flex-col gap-4">
                        {rows.map((row, rIdx) => {
                          let gridClass = "grid gap-4 w-full";
                          if (row.size === 1) gridClass += " grid-cols-1";
                          else if (row.size === 2) gridClass += " grid-cols-1 sm:grid-cols-2";
                          else if (row.size === 3) gridClass += " grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

                          // If single row, use flex-1 to stretch the grid to match the master card height
                          const rowClass = rows.length === 1 ? `${gridClass} flex-1` : gridClass;

                          return (
                            <div key={rIdx} className={rowClass}>
                              {row.items.map((sensor, idx) => {
                                const sensorType = (sensor.type || '').toString().toLowerCase();
                                const isMotion = sensorType.includes('motion');
                                const isDoor = sensorType.includes('door');
                                const isSafe = isMotion
                                  ? sensor.status === 'No Motion'
                                  : sensor.status === 'Closed';

                                return (
                                  <div key={idx} className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-all p-5 flex flex-col justify-between h-full min-h-[140px]">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="font-semibold text-sm text-text-headline tracking-tight">
                                        {isMotion ? t('dashboard.motion_sensor', 'Sensor Gerak') : isDoor ? t('dashboard.door_sensor', 'Sensor Pintu') : sensor.type}
                                      </span>
                                      {isMotion ? (
                                        isSafe ? (
                                          <Activity className="w-8 h-8 text-eco" strokeWidth={1.5} />
                                        ) : (
                                          <Activity className="w-8 h-8 text-amber-500 animate-pulse" strokeWidth={1.5} />
                                        )
                                      ) : (
                                        isSafe ? (
                                          <DoorClosed className="w-8 h-8 text-eco" strokeWidth={1.5} />
                                        ) : (
                                          <DoorOpen className="w-8 h-8 text-amber-500 animate-pulse" strokeWidth={1.5} />
                                        )
                                      )}
                                    </div>

                                    <div className="flex-1 py-1 flex flex-col justify-between">
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-3xl font-extrabold text-text-headline tracking-tight">
                                          {isMotion
                                            ? (sensor.status === 'No Motion' ? t('dashboard.status_no_motion', 'Aman') : t('dashboard.status_motion', 'Gerak Terdeteksi'))
                                            : (sensor.status === 'Closed' ? t('dashboard.status_door_closed', 'Tertutup') : t('dashboard.status_door_open', 'Terbuka'))
                                          }
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between mt-2 w-full">
                                        <span className="text-[11px] text-text-dim font-bold tracking-tight">
                                          {sensor.room}
                                        </span>
                                        <span className="text-[10px] text-text-dim text-right font-medium mt-auto ml-auto">
                                          {t('dashboard.last_updated', 'Terakhir: 2 mnt lalu')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {currentSensors.waterQuality && (
                <div id="section-kualitas-air" className="mb-6">
                  <h2 className="text-xl font-bold text-text-headline mb-4 tracking-tight">
                    {t('dashboard.water_health')}
                  </h2>

                  <div className="flex flex-col md:flex-row gap-4 w-full items-stretch">
                    {/* Kiri (Master - Status Air) */}
                    <div className="w-full md:w-1/3">
                      {(() => {
                        const ph = selectedRoom === 'all' ? (isSimulating ? simPh : livePh) : currentSensors.waterQuality.ph;
                        const turbidity = selectedRoom === 'all' ? (isSimulating ? simTurbidity : liveTurbidity) : currentSensors.waterQuality.turbidity;
                        const tds = selectedRoom === 'all' ? (isSimulating ? simTds : liveTds) : currentSensors.waterQuality.tds;
                        const waterTemp = selectedRoom === 'all' ? (isSimulating ? simWaterTemp : liveWaterTemp) : currentSensors.waterQuality.temp;

                        const isWaterSafe = ph >= 6.5 && ph <= 8.5 && turbidity <= 25 && tds <= 1000 && waterTemp >= 10 && waterTemp <= 30;

                        const styles = getMasterCardStyles(isWaterSafe);
                        const statusText = isWaterSafe ? t('dashboard.status_water_ok', 'Layak Pakai') : t('dashboard.status_water_bad', 'Tidak Layak');

                        return (
                          <div className={`${styles.cardClass} rounded-[24px] p-6 flex flex-col justify-between h-full min-h-[200px] transition-all duration-500 hover:scale-[1.01] relative overflow-hidden`}>
                            {/* 1. Judul Status */}
                            <div className={`${styles.headerClass} z-10`}>
                              <div className={`font-semibold text-sm text-text-headline ${styles.titleTextClass} tracking-tight`}>{t('dashboard.water_status_title', 'Status Air')}</div>
                            </div>

                            {/* 2. Icon */}
                            <div className="flex-1 flex items-center justify-center text-center py-3 z-10">
                              {isWaterSafe ? renderCardIcon(Droplets, true) : renderCardIcon(AlertTriangle, false)}
                            </div>

                            {/* 3. Input Statusnya */}
                            <div className="text-center z-10 flex flex-col items-center">
                              <span className={styles.statusClass}>
                                {statusText}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Kanan (Detail - 4 Parameter Air) */}
                    <div className="w-full md:w-2/3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                        {/* pH */}
                        {(() => {
                          const phVal = selectedRoom === 'all' ? (isSimulating ? simPh : livePh) : currentSensors.waterQuality.ph;
                          const isPhSafe = phVal >= 6.5 && phVal <= 8.5;
                          const statusLabel = isPhSafe ? t('dashboard.status_water_usable', 'Layak Pakai') : t('dashboard.status_water_unusable', 'Tidak Layak');
                          const textClass = isPhSafe ? 'text-eco' : 'text-amber-600';
                          const iconColorClass = isPhSafe ? 'text-eco' : 'text-amber-500 animate-pulse';

                          return (
                            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-all p-5 flex flex-col justify-between h-full">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-sm text-text-headline tracking-tight">{t('dashboard.ph_level')}</span>
                                <Beaker className={`w-8 h-8 ${iconColorClass}`} strokeWidth={1.5} />
                              </div>
                              <div className="flex-1 py-1">
                                <div className="text-3xl font-extrabold text-text-headline tracking-tight">{phVal}</div>
                              </div>
                              <div className="mt-4 relative pt-1">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${isPhSafe ? 'bg-eco' : 'bg-amber-500'}`} style={{ width: `${(phVal / 14) * 100}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[9px] text-text-dim font-bold mt-1.5 px-0.5">
                                  <span>0</span>
                                  <span className={textClass}>{statusLabel}</span>
                                  <span>14</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Turbidity */}
                        {(() => {
                          const turbVal = selectedRoom === 'all' ? (isSimulating ? simTurbidity : liveTurbidity) : currentSensors.waterQuality.turbidity;
                          const isTurbSafe = turbVal <= 25;
                          const statusLabel = isTurbSafe ? t('dashboard.status_water_usable', 'Layak Pakai') : t('dashboard.status_water_unusable', 'Tidak Layak');
                          const textClass = isTurbSafe ? 'text-eco' : 'text-amber-600';
                          const iconColorClass = isTurbSafe ? 'text-eco' : 'text-amber-500 animate-pulse';

                          return (
                            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-all p-5 flex flex-col justify-between h-full">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-sm text-text-headline tracking-tight">{t('dashboard.turbidity')}</span>
                                <Droplets className={`w-8 h-8 ${iconColorClass}`} strokeWidth={1.5} />
                              </div>
                              <div className="flex-1 py-1">
                                <div className="text-3xl font-extrabold text-text-headline tracking-tight">{turbVal} NTU</div>
                              </div>
                              <div className="mt-4 relative pt-1">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${isTurbSafe ? 'bg-eco' : 'bg-amber-500'}`} style={{ width: `${Math.min((turbVal / 50) * 100, 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[9px] text-text-dim font-bold mt-1.5 px-0.5">
                                  <span>0 NTU</span>
                                  <span className={textClass}>{statusLabel}</span>
                                  <span>50 NTU</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* TDS */}
                        {(() => {
                          const tdsVal = selectedRoom === 'all' ? (isSimulating ? simTds : liveTds) : currentSensors.waterQuality.tds;
                          const isTdsSafe = tdsVal <= 1000;
                          const statusLabel = isTdsSafe ? t('dashboard.status_water_usable', 'Layak Pakai') : t('dashboard.status_water_unusable', 'Tidak Layak');
                          const textClass = isTdsSafe ? 'text-eco' : 'text-amber-600';
                          const iconColorClass = isTdsSafe ? 'text-eco' : 'text-amber-500 animate-pulse';

                          return (
                            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-all p-5 flex flex-col justify-between h-full">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-sm text-text-headline tracking-tight">{t('dashboard.tds')}</span>
                                <Wind className={`w-8 h-8 ${iconColorClass}`} strokeWidth={1.5} />
                              </div>
                              <div className="flex-1 py-1">
                                <div className="text-3xl font-extrabold text-text-headline tracking-tight">{tdsVal} ppm</div>
                              </div>
                              <div className="mt-4 relative pt-1">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${isTdsSafe ? 'bg-eco' : 'bg-amber-500'}`} style={{ width: `${Math.min((tdsVal / 1500) * 100, 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[9px] text-text-dim font-bold mt-1.5 px-0.5">
                                  <span>0 ppm</span>
                                  <span className={textClass}>{statusLabel}</span>
                                  <span>1500 ppm</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Water Temperature */}
                        {(() => {
                          const waterTempVal = selectedRoom === 'all' ? (isSimulating ? simWaterTemp : liveWaterTemp) : currentSensors.waterQuality.temp;
                          const isTempNormal = waterTempVal >= 10 && waterTempVal <= 30;
                          const statusLabel = isTempNormal ? t('dashboard.status_water_normal', 'Normal') : t('dashboard.status_water_not_normal', 'Tidak Normal');
                          const textClass = isTempNormal ? 'text-eco' : 'text-amber-600';
                          const iconColorClass = isTempNormal ? 'text-eco' : 'text-amber-500 animate-pulse';

                          return (
                            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-all p-5 flex flex-col justify-between h-full">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-sm text-text-headline tracking-tight">{t('dashboard.water_temperature')}</span>
                                <Thermometer className={`w-8 h-8 ${iconColorClass}`} strokeWidth={1.5} />
                              </div>
                              <div className="flex-1 py-1">
                                <div className="text-3xl font-extrabold text-text-headline tracking-tight">{waterTempVal}°C</div>
                              </div>
                              <div className="mt-4 relative pt-1">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${isTempNormal ? 'bg-eco' : 'bg-amber-500'}`} style={{ width: `${Math.min((waterTempVal / 50) * 100, 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[9px] text-text-dim font-bold mt-1.5 px-0.5">
                                  <span>0°C</span>
                                  <span className={textClass}>{statusLabel}</span>
                                  <span>50°C</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div id="section-energi" className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 sm:p-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-xl font-semibold text-text-headline tracking-tight truncate">{t('dashboard.energy_consumption')}</h3>
                    <p className="text-[10px] sm:text-xs text-text-dim mt-0.5 sm:mt-1 truncate sm:whitespace-normal">
                      {chartType === 'daily'
                        ? t('dashboard.energy_update_daily', 'Update setiap jam | Hari berjalan 00:00-23:59')
                        : t('dashboard.energy_update_monthly', 'Update setiap bulan | Periode 1 tahun (Januari–Desember)')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    <button
                      onClick={() => setShowWarningModal(true)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-4 sm:py-2.5 bg-eco text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-eco/90 transition-all active:scale-95 group shadow-sm hover:shadow-md"
                      title={t('dashboard.budget_management')}
                    >
                      <Zap className="w-4 h-4 text-white group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                      <span className="hidden sm:inline">{t('dashboard.budget_management')}</span>
                    </button>
                    <button
                      onClick={() => setShowDataModal(true)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-4 sm:py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-200 transition-all active:scale-95 group border border-slate-200/20 shadow-sm"
                      title={t('dashboard.view_details')}
                    >
                      <Eye className="w-4 h-4 text-slate-600 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                      <span className="hidden sm:inline">{t('dashboard.view_details')}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 hidden sm:inline" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 bg-slate-50 rounded-[24px] items-start">
                  {/* Item 1 */}
                  <div className="text-center px-2 flex flex-col items-center">
                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mb-1 uppercase tracking-wider leading-snug h-[40px] flex items-center justify-center">
                      {chartType === 'daily' ? t('dashboard.current_load') : t('dashboard.current_month_load')}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold flex items-baseline justify-center gap-1 text-eco">
                      {energySummary?.currentLoad || 0} <span className="text-xs sm:text-sm font-semibold opacity-60 text-text-dim">{chartType === 'daily' ? 'Watt' : 'kWh'}</span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="text-center px-2 flex flex-col items-center">
                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mb-1 uppercase tracking-wider leading-snug h-[40px] flex items-center justify-center">
                      {chartType === 'daily' ? t('dashboard.running_consumption') : t('dashboard.total_year_consumption')}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold flex items-baseline justify-center gap-1 text-eco">
                      {chartType === 'daily' ? energySummary?.runningConsumption || 0 : (energySummary?.monthlyData?.reduce((acc, m) => acc + m.kwh, 0) || 0).toFixed(1)} <span className="text-xs sm:text-sm font-semibold opacity-60 text-text-dim">kWh</span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="text-center px-2 flex flex-col items-center">
                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mb-1 uppercase tracking-wider leading-snug h-[40px] flex items-center justify-center">
                      {chartType === 'daily' ? t('dashboard.avg_hourly') : t('dashboard.avg_monthly')}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold flex items-baseline justify-center gap-1 text-eco">
                      {chartType === 'daily'
                        ? (energySummary?.avgHourly || 0)
                        : (energySummary?.monthlyData?.length > 0
                          ? (energySummary.monthlyData.reduce((acc, m) => acc + m.kwh, 0) / energySummary.monthlyData.length).toFixed(1)
                          : 0)
                      } <span className="text-xs sm:text-sm font-semibold opacity-60 text-text-dim">kWh</span>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="text-center px-2 flex flex-col items-center">
                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mb-1 uppercase tracking-wider leading-snug h-[40px] flex items-center justify-center">
                      {t('dashboard.est_cost')}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold flex items-baseline justify-center gap-1 text-eco">
                      <span className="text-sm sm:text-base font-semibold opacity-60 text-text-dim text-eco">Rp</span> {
                        chartType === 'daily'
                          ? (energySummary?.totalCost?.toLocaleString('id-ID') || '0')
                          : (energySummary?.monthlyData?.reduce((acc, m) => acc + (m.cost || 0), 0).toLocaleString('id-ID') || '0')
                      }
                      {/* Simpan ke window agar modal bisa baca tanpa prop drilling yang rumit */}
                      {(() => { window.totalCostToday = energySummary?.totalCost || 0; return null; })()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-6 sm:mb-8 bg-slate-50 p-1.5 rounded-[16px]">
                  <button
                    onClick={() => setChartType('daily')}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${chartType === 'daily' ? 'bg-white text-text-headline shadow-[0_2px_10px_rgba(0,0,0,0.06)]' : 'text-text-dim hover:bg-white/50'
                      }`}
                  >
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t('dashboard.daily_chart')}</span>
                    <span className="sm:hidden">{t('dashboard.daily_chart')}</span>
                  </button>
                  <button
                    onClick={() => setChartType('monthly')}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${chartType === 'monthly' ? 'bg-white text-text-headline shadow-[0_2px_10px_rgba(0,0,0,0.06)]' : 'text-text-dim hover:bg-white/50'
                      }`}
                  >
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t('dashboard.monthly_chart')}</span>
                    <span className="sm:hidden">{t('dashboard.monthly_chart')}</span>
                  </button>
                </div>

                <div className="h-[260px] sm:h-[340px] md:h-[400px]">
                  {chartType === 'daily' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={dailyData} margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis
                          dataKey="time"
                          stroke="#9ca3af"
                          axisLine={{ stroke: '#9ca3af' }}
                          tickLine={false}
                          style={{ fontSize: '11px' }}
                          dy={10}
                          label={{ value: t('dashboard.time_label', 'Waktu'), position: 'insideBottom', offset: -15, fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          axisLine={{ stroke: '#9ca3af' }}
                          tickLine={false}
                          style={{ fontSize: '11px' }}
                          dx={-10}
                          label={{ value: t('dashboard.energy_consumption_label', 'Konsumsi (kWh)'), angle: -90, position: 'insideLeft', offset: -10, fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        />
                        <Tooltip
                          labelFormatter={(val) => t(`dashboard.month_${val.toLowerCase()}`, val)}
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value, name) => {
                            if (name === t('dashboard.cost', 'Biaya (Rp)')) return `Rp ${value.toLocaleString('id-ID')}`;
                            return `${value} kWh`;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="kwh"
                          stroke="var(--color-eco-500)"
                          strokeWidth={2.5}
                          dot={{ fill: 'var(--color-eco-500)', r: 5, strokeWidth: 0 }}
                          activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
                          name={t('dashboard.energy_consumption_label', 'Konsumsi (kWh)')}
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
                          tickFormatter={(val) => t(`dashboard.month_${val.toLowerCase()}`, val)}
                          label={{ value: t('dashboard.time_label', 'Waktu'), position: 'insideBottom', offset: -15, fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          axisLine={{ stroke: '#9ca3af' }}
                          tickLine={false}
                          style={{ fontSize: '11px' }}
                          dx={-10}
                          label={{ value: t('dashboard.power_label', 'Daya (kWh)'), angle: -90, position: 'insideLeft', offset: -10, fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                          domain={[0, 250]}
                          ticks={[0, 50, 100, 150, 200, 250]}
                        />
                        <Tooltip
                          labelFormatter={(val) => t(`dashboard.month_${val.toLowerCase()}`, val)}
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value, name) => {
                            if (name === t('dashboard.cost', 'Biaya (Rp)')) return `Rp ${value.toLocaleString('id-ID')}`;
                            return `${value} kWh`;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="kwh"
                          stroke="var(--color-eco-500)"
                          strokeWidth={2.5}
                          dot={{ fill: 'var(--color-eco-500)', r: 5, strokeWidth: 0 }}
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
              {/* Widget Notifikasi disembunyikan di mobile, tampil di desktop saja */}
              <div className="hidden lg:block bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text-headline flex items-center gap-2 tracking-tight">
                    <Bell className="w-5 h-5 text-eco" strokeWidth={1.5} />
                    {t('dashboard.notifications')}
                  </h3>
                  <button onClick={() => setShowNotifications(true)} className="text-xs font-bold text-eco hover:text-eco/80 transition-colors">{t('dashboard.view_all')}</button>
                </div>
                <div className="relative">
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar transition-all">
                    {notifications.map((notif) => {
                      const msg = (notif.message + " " + notif.title + " " + (notif.category || '')).toLowerCase();
                      let resolvedType = 'info';
                      let Icon = Bell;

                      const category = notif.category?.toLowerCase();

                      // 1. Dynamic category and keyword to typeStyles mapping
                      if (category === 'keamanan') {
                        if (msg.includes('bahaya') || msg.includes('akses tidak sah') || msg.includes('terobos') || msg.includes('kebocoran') || msg.includes('critical')) {
                          resolvedType = 'danger';
                        } else if (msg.includes('gerak') || msg.includes('terbuka') || msg.includes('waspada') || msg.includes('warning') || msg.includes('anomaly')) {
                          resolvedType = 'warning';
                        } else {
                          resolvedType = 'success';
                        }
                      } else if (category === 'air sanitasi' || category === 'kualitas air') {
                        if (msg.includes('tidak layak') || msg.includes('kritis') || msg.includes('bahaya') || msg.includes('ph') || msg.includes('extreme') || msg.includes('danger')) {
                          resolvedType = 'danger';
                        } else if (msg.includes('waspada') || msg.includes('warning')) {
                          resolvedType = 'warning';
                        } else {
                          resolvedType = 'info';
                        }
                      } else if (category === 'kenyamanan') {
                        if (msg.includes('bahaya') || msg.includes('extreme') || msg.includes('panas')) {
                          resolvedType = 'danger';
                        } else if (msg.includes('waspada') || msg.includes('warning')) {
                          resolvedType = 'warning';
                        } else {
                          resolvedType = 'info';
                        }
                      } else if (category === 'energi') {
                        if (msg.includes('melebihi') || msg.includes('limit') || msg.includes('kritis') || msg.includes('habis') || msg.includes('over capacity')) {
                          resolvedType = 'danger';
                        } else if (msg.includes('lemah') || msg.includes('waspada') || msg.includes('warning') || msg.includes('terlalu rendah')) {
                          resolvedType = 'warning';
                        } else if (msg.includes('berhasil') || msg.includes('diperbarui') || msg.includes('success')) {
                          resolvedType = 'success';
                        } else {
                          resolvedType = 'info';
                        }
                      } else if (category === 'pengaduan') {
                        if (msg.includes('selesai') || msg.includes('rating') || msg.includes('berhasil') || msg.includes('ditutup')) {
                          resolvedType = 'success';
                        } else if (msg.includes('overdue') || msg.includes('sla') || msg.includes('warning') || msg.includes('menunggu konfirmasi')) {
                          resolvedType = 'warning';
                        } else if (msg.includes('ditolak') || msg.includes('dibatalkan')) {
                          resolvedType = 'danger';
                        } else {
                          resolvedType = 'info';
                        }
                      } else if (category === 'sistem') {
                        if (msg.includes('offline') || msg.includes('terputus') || msg.includes('critical') || msg.includes('danger')) {
                          resolvedType = 'danger';
                        } else if (msg.includes('lemah') || msg.includes('baterai') || msg.includes('warning') || msg.includes('waspada')) {
                          resolvedType = 'warning';
                        } else {
                          resolvedType = 'sistem';
                        }
                      } else {
                        // Fallback based on message keywords
                        if (msg.includes('bahaya') || msg.includes('gas') || msg.includes('melebihi') || msg.includes('critical') || msg.includes('offline') || msg.includes('terputus')) {
                          resolvedType = 'danger';
                        } else if (msg.includes('waspada') || msg.includes('token') || msg.includes('peringatan') || msg.includes('warning') || msg.includes('baterai')) {
                          resolvedType = 'warning';
                        } else if (msg.includes('berhasil') || msg.includes('selesai') || msg.includes('optimal') || msg.includes('aman') || msg.includes('success')) {
                          resolvedType = 'success';
                        } else if (msg.includes('sistem') || msg.includes('update') || msg.includes('firmware')) {
                          resolvedType = 'sistem';
                        } else {
                          resolvedType = 'info';
                        }
                      }

                      // 2. Dynamically assign tailored Lucide icons
                      if (category === 'keamanan') {
                        Icon = (resolvedType === 'danger' || resolvedType === 'warning') ? AlertTriangle : Lock;
                      } else if (category === 'air sanitasi' || category === 'kualitas air') {
                        Icon = Droplets;
                      } else if (category === 'kenyamanan') {
                        Icon = Fan;
                      } else if (category === 'energi') {
                        Icon = Zap;
                      } else if (category === 'pengaduan') {
                        Icon = (resolvedType === 'success') ? CheckCircle2 : MessageSquare;
                      } else if (category === 'sistem') {
                        Icon = (resolvedType === 'danger' || resolvedType === 'warning') ? AlertTriangle : Server;
                      } else {
                        if (resolvedType === 'danger') Icon = AlertTriangle;
                        else if (resolvedType === 'warning') Icon = Zap;
                        else if (resolvedType === 'success') Icon = CheckCircle2;
                        else if (resolvedType === 'sistem') Icon = Server;
                        else Icon = Bell;
                      }

                      // Left border mapping
                      const borderLeftClass = resolvedType === 'danger'
                        ? 'border-l-alert-danger'
                        : resolvedType === 'warning'
                          ? 'border-l-alert-warning'
                          : resolvedType === 'success'
                            ? 'border-l-eco'
                            : resolvedType === 'sistem'
                              ? 'border-l-slate-400'
                              : 'border-l-eco';

                      // Icon bg mapping — selalu aktif/berwarna (dashboard tidak punya state read)
                      const iconBgClass = resolvedType === 'danger'
                        ? 'bg-alert-danger/10 text-alert-danger'
                        : resolvedType === 'warning'
                          ? 'bg-alert-warning/10 text-alert-warning'
                          : resolvedType === 'success'
                            ? 'bg-eco/10 text-eco'
                            : resolvedType === 'sistem'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-eco/10 text-eco';

                      return (
                        <div
                          key={notif._id}
                          className={`p-3 sm:p-4 rounded-2xl border border-slate-100 border-l-4 bg-white ${borderLeftClass} overflow-hidden`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBgClass}`}>
                              <Icon className="w-4 h-4" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-gray-900 mb-0.5">
                                {(() => {
                                  const titleStr = (notif.title || "").toLowerCase();
                                  const msgStr = (notif.message || "").toLowerCase();
                                  let smartType = null;
                                  if (notif.type && !['info', 'danger', 'warning', 'success', 'sistem', 'pengaduan', 'purple', 'water', 'kenyamanan'].includes(notif.type.toLowerCase())) {
                                    smartType = notif.type.toUpperCase();
                                  } else {
                                    if (titleStr.includes('overdue') || titleStr.includes('sla') || msgStr.includes('melewati batas waktu')) smartType = 'SLA_OVERDUE';
                                    else if (titleStr.includes('ping') || titleStr.includes('teguran') || titleStr.includes('action required') || msgStr.includes('ping') || msgStr.includes('teguran')) smartType = 'ACTION_REQUIRED';
                                    else if (titleStr.includes('tugas perbaikan baru') || titleStr.includes('new task') || titleStr.includes('task assigned') || (msgStr.includes('tugas baru') || msgStr.includes('new task'))) smartType = 'NEW_TASK';
                                    else if (titleStr.includes('teknisi ditugaskan') || titleStr.includes('tech assigned') || titleStr.includes('technician assigned') || msgStr.includes('ditugaskan') || msgStr.includes('has been assigned')) smartType = 'TECH_ASSIGNED';
                                    else if (titleStr.includes('mulai memproses') || titleStr.includes('started processing') || titleStr.includes('technician started') || titleStr.includes('mengerjakan') || msgStr.includes('mulai memproses') || msgStr.includes('mulai mengerjakan') || msgStr.includes('started processing')) smartType = 'TECH_PROCESSING';
                                    else if (titleStr.includes('pengaduan baru') || titleStr.includes('new complaint') || msgStr.includes('pengaduan baru') || msgStr.includes('new complaint')) smartType = 'NEW_COMPLAINT_TICKET';
                                    else if (titleStr.includes('terkirim') || titleStr.includes('submitted') || titleStr.includes('complaint sent') || msgStr.includes('berhasil dibuat') || msgStr.includes('successfully created')) smartType = 'COMPLAINT_SENT';
                                    else if (titleStr.includes('selesai') || titleStr.includes('finished') || titleStr.includes('rating') || msgStr.includes('selesai dikerjakan') || msgStr.includes('perbaikan selesai')) smartType = 'REPAIR_FINISHED';
                                    else if (titleStr.includes('dibatalkan') || titleStr.includes('cancelled') || titleStr.includes('cancel') || msgStr.includes('dibatalkan')) smartType = 'TICKET_CANCELLED';
                                    else if (titleStr.includes('eskalasi') || titleStr.includes('escalated') || msgStr.includes('dieskalasi')) smartType = 'TICKET_ESCALATED';
                                  }
                                  const dynamicTitle = smartType && t(`notifications.dynamic.${smartType}.title`, { defaultValue: '' });
                                  return dynamicTitle || getLocalizedTitle(notif.title, notif.category);
                                })()}
                              </div>
                              <div className="text-[13px] leading-relaxed text-gray-600">
                                {(() => {
                                  const titleStr = (notif.title || "").toLowerCase();
                                  const msgStr = (notif.message || "").toLowerCase();
                                  let smartType = null;
                                  if (notif.type && !['info', 'danger', 'warning', 'success', 'sistem', 'pengaduan', 'purple', 'water', 'kenyamanan'].includes(notif.type.toLowerCase())) {
                                    smartType = notif.type.toUpperCase();
                                  } else {
                                    if (titleStr.includes('overdue') || titleStr.includes('sla') || msgStr.includes('melewati batas waktu')) smartType = 'SLA_OVERDUE';
                                    else if (titleStr.includes('ping') || titleStr.includes('teguran') || titleStr.includes('action required') || msgStr.includes('ping') || msgStr.includes('teguran')) smartType = 'ACTION_REQUIRED';
                                    else if (titleStr.includes('tugas perbaikan baru') || titleStr.includes('new task') || titleStr.includes('task assigned') || (msgStr.includes('tugas baru') || msgStr.includes('new task'))) smartType = 'NEW_TASK';
                                    else if (titleStr.includes('teknisi ditugaskan') || titleStr.includes('tech assigned') || titleStr.includes('technician assigned') || msgStr.includes('ditugaskan') || msgStr.includes('has been assigned')) smartType = 'TECH_ASSIGNED';
                                    else if (titleStr.includes('mulai memproses') || titleStr.includes('started processing') || titleStr.includes('technician started') || titleStr.includes('mengerjakan') || msgStr.includes('mulai memproses') || msgStr.includes('mulai mengerjakan') || msgStr.includes('started processing')) smartType = 'TECH_PROCESSING';
                                    else if (titleStr.includes('pengaduan baru') || titleStr.includes('new complaint') || msgStr.includes('pengaduan baru') || msgStr.includes('new complaint')) smartType = 'NEW_COMPLAINT_TICKET';
                                    else if (titleStr.includes('terkirim') || titleStr.includes('submitted') || titleStr.includes('complaint sent') || msgStr.includes('berhasil dibuat') || msgStr.includes('successfully created')) smartType = 'COMPLAINT_SENT';
                                    else if (titleStr.includes('selesai') || titleStr.includes('finished') || titleStr.includes('rating') || msgStr.includes('selesai dikerjakan') || msgStr.includes('perbaikan selesai')) smartType = 'REPAIR_FINISHED';
                                    else if (titleStr.includes('dibatalkan') || titleStr.includes('cancelled') || titleStr.includes('cancel') || msgStr.includes('dibatalkan')) smartType = 'TICKET_CANCELLED';
                                    else if (titleStr.includes('eskalasi') || titleStr.includes('escalated') || msgStr.includes('dieskalasi')) smartType = 'TICKET_ESCALATED';
                                  }

                                  const dynamicBodyKey = `notifications.dynamic.${smartType}.body`;
                                  const dynamicBody = smartType ? t(dynamicBodyKey, { defaultValue: '___MISSING___' }) : '___MISSING___';
                                  if (smartType && dynamicBody !== '___MISSING___') {
                                    const ticketMatch = notif.message.match(/"([^"]+)"/) || notif.message.match(/\b[a-z0-9]{8}\b/);
                                    const extractedTicket = notif.metadata?.ticketId || notif.metadata?.ticket || notif.metadata?.topic || (ticketMatch ? ticketMatch[1] || ticketMatch[0] : '');

                                    return t(dynamicBodyKey, {
                                      ...notif.metadata,
                                      ticket: extractedTicket,
                                      technician: notif.metadata?.technicianName || notif.metadata?.technician || notif.metadata?.senderName || '',
                                      topic: notif.metadata?.topic || '',
                                      name: notif.metadata?.senderName || notif.metadata?.name || '',
                                      hubId: notif.metadata?.hubId || '',
                                      deviceName: notif.metadata?.deviceName || '',
                                      status: notif.metadata?.status || '',
                                      location: notif.metadata?.location || '',
                                      percent: notif.metadata?.percent || ''
                                    });
                                  }
                                  return notif.messageKey ? t(notif.messageKey, notif.metadata || {}) : notif.message;
                                })()}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-1.5 font-medium flex items-center justify-between">
                                <span>
                                  {notif.date ? new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('notification.ui.just_now')}
                                </span>
                                {!notif.isRead && !notif.isSeen && (
                                  <span className="px-1.5 py-0.5 bg-eco/10 text-eco text-[9px] font-black rounded uppercase tracking-wider">
                                    {t('notification.ui.new', 'Baru')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                <h3 className="font-bold text-text-headline mb-4 flex items-center gap-2 tracking-tight">
                  <Activity className="w-5 h-5 text-eco-500" strokeWidth={1.5} />
                  {t('dashboard.recent_activities')}
                </h3>
                <div className="space-y-3">
                  {mappedActivities.slice(0, 5).map((activity, idx) => {
                    const Icon = activity.icon;
                    return (
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 border hover:bg-white hover:scale-[1.02] hover:shadow-md active:scale-95 cursor-pointer group
                      ${activity.color === 'emerald' ? 'bg-eco-50 border-eco-500/10' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${activity.color === 'emerald' ? 'bg-eco-50' : 'bg-slate-100'
                          }`}>
                          <Icon className={`w-5 h-5 ${activity.color === 'emerald' ? 'text-eco-500' : 'text-text-dim'}`} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-text-headline leading-tight mb-0.5">{activity.device}</div>
                          <div className="text-[10px] text-text-dim font-medium uppercase tracking-wider">{getLocalizedAction(activity.action)} • {getLocalizedTrigger(activity.trigger)}</div>
                        </div>
                        <div className="text-[10px] font-semibold text-text-dim bg-slate-100/50 px-2 py-1 rounded-lg">{activity.time}</div>
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
          <WarningLimitModal isOpen={showWarningModal} onClose={() => setShowWarningModal(false)} limit={warningLimit} setLimit={setWarningLimit} deposit={depositBalance} setDeposit={setDepositBalance} onRefresh={fetchDashboardData} energySummary={energySummary} />
          <ComplaintModal
            isOpen={showComplaintModal}
            onClose={() => setShowComplaintModal(false)}
            realDevices={realDevices}
          />
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

          {/* Floating Status Simulator Widget */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {!isSimulatorOpen ? (
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 flex items-center gap-2 border border-slate-700/50"
              >
                <span className="animate-pulse">🛠️</span> Status Simulator
              </button>
            ) : (
              <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-5 w-80 sm:w-96 max-h-[500px] overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="font-extrabold text-sm text-text-headline tracking-tight">🛠️ BIEON Status Simulator</span>
                  <button
                    onClick={() => setIsSimulatorOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-all text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Toggle Simulator */}
                <div className="flex items-center justify-between mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Aktifkan Simulasi</span>
                  <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isSimulating ? 'bg-eco' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isSimulating ? 'transform translate-x-6' : ''}`}></div>
                  </button>
                </div>

                {/* Master Card Mode Switcher */}
                <div className="mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Desain Master Card</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setMasterCardMode('eco-solid')}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border flex items-center justify-center gap-1 ${masterCardMode === 'eco-solid' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      <span>🌿</span> Eco Solid
                    </button>
                    <button
                      onClick={() => setMasterCardMode('eco-solid-soft')}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border flex items-center justify-center gap-1 ${masterCardMode === 'eco-solid-soft' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      <span>🌱</span> Eco Solid Soft
                    </button>
                    <button
                      onClick={() => setMasterCardMode('eco-icon')}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border flex items-center justify-center gap-1 ${masterCardMode === 'eco-icon' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      <span>🟢</span> Eco Icon
                    </button>
                    <button
                      onClick={() => setMasterCardMode('eco-icon-soft')}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all border flex items-center justify-center gap-1 ${masterCardMode === 'eco-icon-soft' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                      <span>❇️</span> Eco Icon Soft
                    </button>
                  </div>
                </div>


                {isSimulating && (
                  <div className="space-y-4">
                    {/* Temp Control */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">Suhu (Temperature)</span>
                        <span className="text-eco">{simTemp}°C</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="35"
                        step="0.5"
                        value={simTemp}
                        onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-eco"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400">
                        <span>15°C (Dingin)</span>
                        <span>24.8°C</span>
                        <span>35°C (Panas)</span>
                      </div>
                    </div>

                    {/* Humidity Control */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">Kelembapan (Humidity)</span>
                        <span className="text-eco">{simHumidity}%</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="90"
                        step="1"
                        value={simHumidity}
                        onChange={(e) => setSimHumidity(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-eco"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400">
                        <span>30% (Kering)</span>
                        <span>55%</span>
                        <span>90% (Lembap)</span>
                      </div>
                    </div>

                    {/* Water Quality Control Section */}
                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-xs font-bold text-slate-700 block mb-2">Simulasi Kualitas Air</span>

                      {/* pH Control */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">Derajat Keasaman (pH)</span>
                          <span className="text-eco">{simPh}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="14"
                          step="0.1"
                          value={simPh}
                          onChange={(e) => setSimPh(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-eco"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>0 (Asam)</span>
                          <span>7 (Netral)</span>
                          <span>14 (Basa)</span>
                        </div>
                      </div>

                      {/* Turbidity Control */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">Kekeruhan (Turbidity)</span>
                          <span className="text-eco">{simTurbidity} NTU</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="0.5"
                          value={simTurbidity}
                          onChange={(e) => setSimTurbidity(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-eco"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>0 NTU (Jernih)</span>
                          <span>25 NTU</span>
                          <span>50 NTU (Keruh)</span>
                        </div>
                      </div>

                      {/* TDS Control */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">Zat Terlarut (TDS)</span>
                          <span className="text-eco">{simTds} ppm</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1500"
                          step="10"
                          value={simTds}
                          onChange={(e) => setSimTds(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-eco"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>0 ppm</span>
                          <span>1000 ppm</span>
                          <span>1500 ppm</span>
                        </div>
                      </div>

                      {/* Water Temp Control */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">Suhu Air</span>
                          <span className="text-eco">{simWaterTemp}°C</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="0.5"
                          value={simWaterTemp}
                          onChange={(e) => setSimWaterTemp(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-eco"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>0°C (Dingin)</span>
                          <span>24°C</span>
                          <span>50°C (Panas)</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-xs font-bold text-slate-700 block mb-2">Simulasi Keamanan & Grid Layout</span>

                      {/* Security Count Select */}
                      <div className="space-y-1 mb-3">
                        <span className="text-[10px] font-bold text-slate-500">Jumlah Sensor (Uji Grid Layout)</span>
                        <div className="flex gap-1">
                          {[3, 4, 5, 6, 7].map((num) => (
                            <button
                              key={num}
                              onClick={() => handleSetSimSecurityCount(num)}
                              className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all border ${simSecurity.length === num ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Security States Toggles */}
                      <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                        {simSecurity.map((sensor, sIdx) => {
                          const isMotion = sensor.type.toLowerCase().includes('motion');
                          const isSafe = isMotion ? sensor.status === 'No Motion' : sensor.status === 'Closed';

                          return (
                            <div key={sIdx} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 text-[10px] font-bold">
                              <div className="flex flex-col">
                                <span className="text-slate-800">{isMotion ? 'Sensor Gerak' : 'Sensor Pintu'}</span>
                                <span className="text-slate-400 font-medium text-[9px]">{sensor.room}</span>
                              </div>

                              <button
                                onClick={() => {
                                  const updated = [...simSecurity];
                                  if (isMotion) {
                                    updated[sIdx].status = sensor.status === 'No Motion' ? 'Motion Detected' : 'No Motion';
                                  } else {
                                    updated[sIdx].status = sensor.status === 'Closed' ? 'Open' : 'Closed';
                                  }
                                  setSimSecurity(updated);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${isSafe ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                              >
                                {isMotion
                                  ? (sensor.status === 'No Motion' ? 'Aman' : 'Terdeteksi')
                                  : (sensor.status === 'Closed' ? 'Tertutup' : 'Terbuka')
                                }
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-fast {
          animation: spin-fast 1.5s linear infinite;
        }
      `}</style>
    </HomeownerLayout>
  );
}

export default HomeownerDashboard;