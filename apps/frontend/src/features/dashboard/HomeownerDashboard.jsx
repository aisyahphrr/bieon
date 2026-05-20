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
        <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-eco-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-eco-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('dashboard.complaint_sent', 'Pengaduan Terkirim!')}</h3>
          <p className="text-gray-500 text-sm">{t('dashboard.complaint_sent_desc', 'Tim kami akan segera menindaklanjuti pengaduan Anda.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-eco-500 to-sense-500 px-5 sm:px-8 py-4 sm:py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">{t('dashboard.complaint_form_title', 'Form Pengaduan')}</h2>
                <p className="text-eco-50 text-sm mt-1">{t('dashboard.complaint_form_desc', 'Laporkan kendala atau gangguan perangkat BIEON')}</p>
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
                {t('dashboard.problem_device', 'Perangkat Bermasalah')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.device}
                onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500"
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500"
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              {t('dashboard.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-eco-500 to-sense-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
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

  const handleExportCSV = () => {
    const headers = [
      chartType === 'daily' ? t('dashboard.time_hour', 'Jam') : t('dashboard.time_month', 'Bulan'),
      t('dashboard.consumption', 'Konsumsi (kWh)'),
      chartType === 'daily' ? t('dashboard.power', 'Daya (Watt)') : '',
      t('dashboard.cost', 'Biaya (Rp)')
    ].filter(Boolean).join(',');
    const rows = data.map(item => {
      return [
        'time' in item ? item.time : item.month,
        (item.kwh || 0).toFixed(3),
        chartType === 'daily' ? (item.kwh * 1000).toFixed(0) : undefined,
        item.cost || 0
      ].filter(val => val !== undefined).join(',');
    });

    const totalRow = [
      t('dashboard.total', 'TOTAL'),
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
        <div className="bg-gradient-to-r from-eco-500 to-sense-500 px-4 sm:px-8 py-4 sm:py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-eco-50 text-sm mt-1">
                {chartType === 'daily'
                  ? t('dashboard.energy_daily_desc', 'Data konsumsi energi per jam (00:00 - 23:59)')
                  : t('dashboard.energy_monthly_desc', 'Data konsumsi energi 12 bulan terakhir')}
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
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-alert-danger text-white rounded-xl font-semibold hover:bg-alert-danger/90 transition-all shadow-lg text-sm sm:text-base"
            >
              <FileDown className="w-5 h-5" />
              {t('dashboard.download_pdf', 'Unduh PDF')}
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-eco-500 text-white rounded-xl font-semibold hover:bg-eco-900 transition-all shadow-lg text-sm sm:text-base"
            >
              <Download className="w-5 h-5" />
              {t('dashboard.download_csv', 'Unduh CSV')}
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="bg-gradient-to-r from-eco-500 to-sense-500 text-white">
                  <th className="px-6 py-4 text-left font-bold">
                    {chartType === 'daily' ? t('dashboard.time_hour', 'Jam') : t('dashboard.time_month', 'Bulan')}
                  </th>
                  <th className="px-6 py-4 text-left font-bold">{t('dashboard.consumption', 'Konsumsi (kWh)')}</th>
                  {chartType === 'daily' && <th className="px-6 py-4 text-left font-bold">{t('dashboard.power', 'Daya (Watt)')}</th>}
                  <th className="px-6 py-4 text-left font-bold">{t('dashboard.cost', 'Biaya (Rp)')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-eco-50 transition-colors`}
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
                    <td className="px-6 py-4 font-semibold text-eco-900">
                      Rp {(item.cost || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold">
                  <td className="px-6 py-4">{t('dashboard.total', 'TOTAL')}</td>
                  <td className="px-6 py-4">{totalKwh.toFixed(3)} kWh</td>
                  {chartType === 'daily' && <td className="px-6 py-4">-</td>}
                  <td className="px-6 py-4 text-alert-warning">
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
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        {/* Header with Gradient - Aligned Theme */}
        <div className="bg-gradient-to-r from-alert-warning to-[#d97706] px-6 sm:px-8 py-6 text-white relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <Zap className="w-7 h-7 text-white fill-white/20" />
            </div>
            <div className="pr-8">
              <h2 className="text-xl font-bold leading-tight">{t('homeowner_qc.budget.title', 'Manajemen Anggaran Listrik')}</h2>
              <p className="text-amber-50 text-xs mt-1 font-medium opacity-90">{t('homeowner_qc.budget.subtitle', 'Monitoring anggaran & batas peringatan kritis')}</p>
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
          <div className={`border rounded-2xl p-5 flex flex-col gap-3 mb-8 transition-colors ${
            isOverBudget ? 'bg-alert-danger/10 border-alert-danger/20 text-alert-danger' : 
            isWaspada ? 'bg-alert-warning/10 border-alert-warning/20 text-alert-warning' : 
            'bg-eco-50 border-eco-500/10'
          }`}>
            <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
              <span>{t('dashboard.budget_this_month', 'Anggaran Bulan Ini:')}</span>
              <span className="font-semibold text-text-headline">Rp {deposit.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
              <span>{t('dashboard.used_this_month', 'Terpakai Bulan Ini:')}</span>
              <span className="font-semibold text-text-headline">Rp {totalTerpakai.toLocaleString('id-ID')}</span>
            </div>
            <div className={`flex justify-between items-center text-sm font-semibold mt-1 pt-3 border-t ${
              isOverBudget ? 'border-alert-danger/25' : 
              isWaspada ? 'border-alert-warning/25' : 
              'border-eco-500/25'
            }`}>
              <span className={isOverBudget ? 'text-alert-danger' : isWaspada ? 'text-alert-warning' : 'text-eco-900'}>{t('dashboard.remaining_budget', 'Sisa Anggaran:')}</span>
              <span className={`text-xl font-bold ${isOverBudget ? 'text-alert-danger' : isWaspada ? 'text-alert-warning' : 'text-eco-500'}`}>Rp {Math.max(0, sisaAnggaran).toLocaleString('id-ID')}</span>
            </div>
            <div className={`flex justify-between items-center text-xs mt-1 p-2 rounded-lg font-semibold tracking-wide ${
              isOverBudget ? 'bg-alert-danger/10 text-alert-danger' : 
              isWaspada ? 'bg-alert-warning/10 text-alert-warning' : 
              'bg-eco-50 text-eco-900'
            }`}>
              <span>{t('dashboard.status', 'Status:')}</span>
              <span className="flex items-center gap-1">
                {isOverBudget ? <AlertTriangle className="w-3.5 h-3.5" /> : isWaspada ? <Zap className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
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
                      ? 'border-alert-warning bg-alert-warning/10 text-alert-warning'
                      : 'border-slate-100 bg-white text-text-dim hover:border-alert-warning/50'
                    }`}
                  >
                    Rp {val.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-300 group-focus-within:text-alert-warning transition-colors">Rp</div>
                <input
                  type="number"
                  value={inputLimit}
                  onChange={(e) => setInputLimit(e.target.value)}
                  placeholder="30000"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:border-alert-warning focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 ml-1">{t('dashboard.set_budget', 'Atur Anggaran Bulanan (Rp)')}</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-300 group-focus-within:text-eco-500 transition-colors">Rp</div>
                <input
                  type="number"
                  value={inputDeposit}
                  onChange={(e) => setInputDeposit(e.target.value)}
                  placeholder={t('homeowner_qc.budget.input_placeholder', 'Masukkan nominal (Contoh: 1000000)')}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:border-eco-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitted}
              className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-[2px] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2
                ${submitted 
                  ? 'bg-eco-500 text-white shadow-eco-500/20' 
                  : 'bg-gradient-to-r from-alert-warning to-[#d97706] text-white hover:shadow-xl'
                }`}
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
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

  // States for real data
  const [realDevices, setRealDevices] = useState([]);
  const [realNotifications, setRealNotifications] = useState([]);
  const [realActivities, setRealActivities] = useState([]);
  const [energySummary, setEnergySummary] = useState(null);

  // ─────── Interactive Design System Theme Switcher ───────
  const [cardTheme, setCardTheme] = useState(() => localStorage.getItem('bieon_card_theme') || 'brand');

  const getCardStyles = (theme) => {
    switch (theme) {
      case 'monochrome':
        return {
          comfort: 'from-eco-500 to-emerald-600',
          comfortDeco: 'bg-white/20',
          security: 'from-eco-500 to-emerald-600',
          securityDeco: 'bg-white/20',
          water: 'from-eco-500 to-emerald-600',
          waterDeco: 'bg-white/20',
        };
      case 'legacy':
        return {
          comfort: 'from-eco-500 to-emerald-600',
          comfortDeco: 'bg-white/20',
          security: 'from-indigo-600 to-purple-600',
          securityDeco: 'bg-white/20',
          water: 'from-sense-500 to-cyan-600',
          waterDeco: 'bg-white/20',
        };
      case 'modern':
        return {
          comfort: 'from-eco-500 to-emerald-600',
          comfortDeco: 'bg-white/20',
          security: 'from-amber-500 to-orange-600',
          securityDeco: 'bg-white/20',
          water: 'from-sense-500 to-cyan-600',
          waterDeco: 'bg-white/20',
        };
      case 'duotone':
        return {
          comfort: 'from-eco-500 to-emerald-600',
          comfortDeco: 'bg-gradient-to-br from-sense-500/35 to-sense-900/10',
          security: 'from-eco-500 to-emerald-600',
          securityDeco: 'bg-gradient-to-br from-sense-500/35 to-sense-900/10',
          water: 'from-eco-500 to-emerald-600',
          waterDeco: 'bg-gradient-to-br from-sense-500/35 to-sense-900/10',
        };
      case 'brand':
      default:
        return {
          comfort: 'from-eco-500 to-emerald-600',
          comfortDeco: 'bg-white/20',
          security: 'from-eco-500 to-sense-500',
          securityDeco: 'bg-white/20',
          water: 'from-sense-500 to-cyan-600',
          waterDeco: 'bg-white/20',
        };
    }
  };

  const cardStyles = getCardStyles(cardTheme);
  const fetchDashboardData = async () => {
    // ─────── Dual-Powered Bypass Toggle (Limited to asrisaras17@gmail.com) ───────
    const userEmail = getEmailFromToken();
    const isTestAccount = userEmail === 'asrisaras17@gmail.com';
    const USE_MOCK = isTestAccount && (import.meta.env.VITE_USE_MOCK_DATA === 'true' || localStorage.getItem('USE_MOCK_DATA') === 'true');

    if (USE_MOCK) {
      setRealDevices(mockDevices);
      
      const mappedAlerts = mockNotifications.map(alert => {
        let iconType = Bell;
        let typeStr = 'info';
        
        const category = alert.category || '';
        const msg = (alert.message || '').toLowerCase();
        const type = alert.type || '';

        if (category === 'Keamanan' || type === 'Danger' || type === 'Bahaya') {
          iconType = Lock;
          typeStr = 'danger';
        } else if (category === 'Energi' || type === 'Warning' || type === 'Waspada') {
          iconType = Zap;
          typeStr = 'warning';
        } else if (type === 'Success' || type === 'Berhasil' || msg.includes('berhasil') || msg.includes('selesai')) {
          iconType = CheckCircle2;
          typeStr = 'success';
        } else if (category === 'Air Sanitasi' || category === 'Kualitas Air') {
          iconType = Droplets;
          typeStr = 'info';
        }

        return {
          id: alert._id,
          type: typeStr,
          title: alert.title,
          category: alert.category,
          messageKey: alert.messageKey,
          metadata: alert.metadata,
          message: alert.message,
          date: alert.createdAt,
          icon: iconType,
          link: alert.link
        };
      });
      
      setRealNotifications(mappedAlerts);
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
      const resAlerts = await fetch('/api/alerts', { headers });
      if (resAlerts.ok) {
        const data = await resAlerts.json();
        const mappedAlerts = (data.data || []).map(alert => {
          let iconType = Bell;
          let typeStr = 'info';

          const category = alert.category || '';
          const msg = (alert.message || '').toLowerCase();
          const type = alert.type || '';

          if (category === 'Keamanan' || type === 'Danger' || type === 'Bahaya') {
            iconType = Lock;
            typeStr = 'danger';
          } else if (category === 'Energi' || type === 'Warning' || type === 'Waspada') {
            iconType = Zap;
            typeStr = 'warning';
          } else if (type === 'Success' || type === 'Berhasil' || msg.includes('berhasil') || msg.includes('selesai')) {
            iconType = CheckCircle2;
            typeStr = 'success';
          } else if (category === 'Air Sanitasi' || category === 'Kualitas Air') {
            iconType = Droplets;
            typeStr = 'info';
          }

          return {
            id: alert._id,
            type: typeStr,
            title: alert.title,
            category: alert.category,
            messageKey: alert.messageKey,
            metadata: alert.metadata,
            message: alert.message,
            date: alert.date || alert.createdAt,
            icon: iconType,
            link: alert.link
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
      // ─────── Dual-Powered Bypass Toggle (Limited to asrisaras17@gmail.com) ───────
      const userEmail = getEmailFromToken();
      const isTestAccount = userEmail === 'asrisaras17@gmail.com';
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
  const hasComfort = currentDevices.some(d => d.environmentAspect === 'Kenyamanan' || (d.category === 'sensor' && ['Sensor Kenyamanan', 'Humidity Sensor', 'Temperature Sensor'].includes(d.type)));
  const hasSecurity = currentDevices.some(d => d.environmentAspect === 'Keamanan' || (d.category === 'sensor' && ['Sensor Keamanan', 'Door Sensor', 'Motion Sensor', 'CCTV'].some(t => d.type?.includes(t))));
  const hasWater = currentDevices.some(d => d.environmentAspect === 'Kualitas Air' || (d.category === 'sensor' && ['Sensor Kualitas Air', 'Water Sensor'].includes(d.type)));

  let currentSensors = {};
  // Gunakan data mock untuk visual, tapi hanya jika kategorinya relevan dengan perangkat user
  // Gunakan data real-time jika ada
  if (hasComfort) currentSensors.comfort = { temp: liveTemp, humidity: liveHumidity, comfortLevel: 82 };
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
  if (hasWater) currentSensors.waterQuality = { status: 'drinkable', ph: livePh, turbidity: liveTurbidity, tds: liveTds, temp: liveWaterTemp };
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



  return (
    <HomeownerLayout
      currentPage="dashboard"
      hideBottomNav={showComplaintModal || showDataModal || showWarningModal}
    >
      <div className="max-w-[1900px] mx-auto px-3 sm:px-4 md:px-8 py-4 md:py-8">
        {/* Sandbox Visual Switcher - Presentation Helper */}
        <div className="bg-surface-card/90 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-50 flex items-center justify-center border border-eco-100/50">
              <Settings className="w-5 h-5 text-eco-500 animate-[spin_8s_linear_infinite]" />
            </div>
            <div>
              <h4 className="font-bold text-text-headline text-sm tracking-tight">Interactive Visual Sandbox</h4>
              <p className="text-xs text-text-dim mt-0.5">Bandingkan 4 opsi warna dasbor secara real-time untuk presentasi</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => { setCardTheme('brand'); localStorage.setItem('bieon_card_theme', 'brand'); }}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${cardTheme === 'brand' ? 'bg-gradient-to-r from-eco-500 to-sense-500 text-white border-transparent shadow-sm shadow-eco-500/20' : 'bg-slate-50 text-text-dim border-slate-100 hover:bg-slate-100'}`}
            >
              Brand (Eco & Sense)
            </button>
            <button
              onClick={() => { setCardTheme('monochrome'); localStorage.setItem('bieon_card_theme', 'monochrome'); }}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${cardTheme === 'monochrome' ? 'bg-eco-500 text-white border-transparent shadow-sm shadow-eco-500/20' : 'bg-slate-50 text-text-dim border-slate-100 hover:bg-slate-100'}`}
            >
              Opsi 1: Semua Hijau
            </button>
            <button
              onClick={() => { setCardTheme('legacy'); localStorage.setItem('bieon_card_theme', 'legacy'); }}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${cardTheme === 'legacy' ? 'bg-indigo-600 text-white border-transparent shadow-sm shadow-indigo-600/20' : 'bg-slate-50 text-text-dim border-slate-100 hover:bg-slate-100'}`}
            >
              Opsi 2: Klasik (Hijau-Ungu-Biru)
            </button>
            <button
              onClick={() => { setCardTheme('modern'); localStorage.setItem('bieon_card_theme', 'modern'); }}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${cardTheme === 'modern' ? 'bg-amber-500 text-white border-transparent shadow-sm shadow-amber-500/20' : 'bg-slate-50 text-text-dim border-slate-100 hover:bg-slate-100'}`}
            >
              Opsi 3: Jingga Modern
            </button>
            <button
              onClick={() => { setCardTheme('duotone'); localStorage.setItem('bieon_card_theme', 'duotone'); }}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${cardTheme === 'duotone' ? 'bg-gradient-to-r from-eco-500 to-sense-500 text-white border-transparent shadow-sm shadow-eco-500/20' : 'bg-slate-50 text-text-dim border-slate-100 hover:bg-slate-100'}`}
            >
              Opsi 4: Duotone (Eco & Sense)
            </button>
          </div>
        </div>

        <div className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm p-5 mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <Home className="w-5 h-5 text-eco-500" />
            <h3 className="font-bold text-text-headline text-lg tracking-tight">{t('dashboard.select_room')}</h3>
          </div>
          <div className="flex flex-wrap gap-2.5 pb-1">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`px-5 py-2.5 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${selectedRoom === room.id
                  ? 'bg-gradient-to-r from-eco-500 to-sense-500 text-white shadow-md hover:shadow-lg scale-[1.02]'
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
            {(currentSensors.comfort || (currentSensors.security && currentSensors.security.length > 0)) && (
              <div>
                <h2 id="section-kenyamanan" className="text-xl font-bold text-text-headline mb-4 tracking-tight">
                  {currentSensors.comfort && currentSensors.security && currentSensors.security.length > 0
                    ? t('dashboard.comfort_security')
                    : currentSensors.comfort
                      ? t('dashboard.comfort')
                      : t('dashboard.security')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-flow-col gap-3 sm:gap-4 mb-6 lg:overflow-x-auto lg:pb-4 lg:scrollbar-none desktop-comfort-grid">
                  {currentSensors.comfort && (
                    <>
                      {currentSensors.comfort.humidity !== null && (
                        <div className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-text-headline">{t('dashboard.humidity')}</span>
                            <Droplets className="w-5 h-5 text-sense-500" />
                          </div>
                          <div className="mb-3">
                            <div className="text-4xl font-bold text-text-headline tracking-tight">{selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity}%</div>
                            <div className="text-xs text-text-dim mt-1 font-medium">
                              {(selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity) < 50 ? t('dashboard.status_humidity_dry', 'Kering') : (selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity) <= 80 ? t('dashboard.status_comfortable', 'Nyaman') : t('dashboard.status_humidity_humid', 'Sangat Lembap')}
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-auto">
                            <div className="h-full bg-gradient-to-r from-sense-500 to-[#06b6d4]" style={{ width: `${selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity}%` }}></div>
                          </div>
                        </div>
                      )}

                      {currentSensors.comfort.temp && (
                        <div className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-text-headline">{t('dashboard.temperature')}</span>
                            <Thermometer className="w-5 h-5 text-alert-warning" />
                          </div>
                          <div className="mb-3">
                            <div className="text-4xl font-bold text-text-headline tracking-tight">{selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp}°C</div>
                            <div className="text-xs text-text-dim mt-1 font-medium">
                              {(selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp) < 20.5 ? t('dashboard.status_cold', 'Dingin') : (selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp) <= 27.1 ? t('dashboard.status_comfortable', 'Nyaman') : t('dashboard.status_hot', 'Panas')}
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-auto">
                            <div className="h-full bg-gradient-to-r from-alert-warning to-alert-danger" style={{ width: `${((selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp) / 40) * 100}%` }}></div>
                          </div>
                        </div>
                      )}

                      <div className={`row-span-2 bg-gradient-to-br ${cardStyles.comfort} rounded-2xl shadow-xl p-5 text-white relative overflow-hidden flex flex-col`}>
                        <div className={`absolute top-0 right-0 w-48 h-48 ${cardStyles.comfortDeco} rounded-full -mr-24 -mt-24`}></div>
                        <div className="relative flex flex-col h-full">
                          <div className="mb-1">
                            <h3 className="text-2xl font-bold mb-1 tracking-tight text-white">{t('dashboard.comfort')}</h3>
                            <p className="text-eco-100 text-sm">{t('dashboard.comfort_ref', 'Berdasarkan: suhu & kelembapan')}</p>
                            <p className="text-eco-100/70 text-xs mb-1">{t('dashboard.comfort_std', '(Permenkes No. 2 Tahun 2023)')}</p>
                          </div>
                          <div className="flex-1 flex flex-col justify-center items-center text-center mt-1 mb-1 py-4 sm:py-0">
                            <div className="text-2xl font-bold mb-3 flex items-center gap-2">
                              {((selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp) >= 20.5 && (selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp) <= 27.1 &&
                                (selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity) >= 50 && (selectedRoom === 'all' ? liveHumidity : currentSensors.comfort.humidity) <= 80) ?
                                t('dashboard.status_comfort_ok', '😊 Nyaman') : t('dashboard.status_comfort_bad', '😕 Tidak Nyaman')}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-auto">
                            <div className="bg-white/10 border border-white/5 backdrop-blur-sm rounded-lg p-3 text-center">
                              <div className="text-[10px] mb-1">{t('dashboard.temperature')}</div>
                              <div className="font-bold text-lg">{selectedRoom === 'all' ? liveTemp : currentSensors.comfort.temp}°C</div>
                            </div>
                            {currentSensors.comfort.humidity !== null && (
                              <div className="bg-white/10 border border-white/5 backdrop-blur-sm rounded-lg p-3 text-center">
                                <div className="text-[10px] mb-1">{t('dashboard.humidity')}</div>
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
                        <div key={'motion' + idx} className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-text-headline">Motion</span>
                            <Activity className="w-5 h-5 text-alert-special" />
                          </div>
                          <div className="mb-3">
                            <div className="text-4xl font-bold text-text-headline tracking-tight">{sensor.status === 'No Motion' ? t('dashboard.status_no_motion', 'Aman') : t('dashboard.status_motion', 'Gerak Terdeteksi')}</div>
                            <div className="text-xs text-text-dim mt-1 font-medium">{sensor.room}</div>
                          </div>
                          <div className={`mt-auto px-3 py-2 rounded-lg text-[10px] font-bold text-center ${sensor.status === 'No Motion' ? 'bg-eco-55 text-eco-900 bg-eco-50' : 'bg-alert-warning/10 text-alert-warning'}`}>
                            {sensor.status === 'No Motion' ? '✓ STANDBY' : '👁️ DETECTED'}
                          </div>
                        </div>
                      ))}

                      {currentSensors.security.filter(s => s.type.includes('Door')).map((sensor, idx) => (
                        <div key={'door' + idx} className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-text-headline">Door Sensor</span>
                            <Lock className="w-5 h-5 text-alert-special" />
                          </div>
                          <div className="mb-3">
                            <div className="text-4xl font-bold text-text-headline tracking-tight">{sensor.status === 'Closed' ? t('dashboard.status_door_closed', 'Tertutup') : t('dashboard.status_door_open', 'Terbuka')}</div>
                            <div className="text-xs text-text-dim mt-1 font-medium">{sensor.room}</div>
                          </div>
                          <div className={`mt-auto px-3 py-2 rounded-lg text-[10px] font-bold text-center ${sensor.status === 'Closed' ? 'bg-eco-55 text-eco-900 bg-eco-50' : 'bg-alert-danger/10 text-alert-danger'}`}>
                            {sensor.status === 'Closed' ? '🔒 SECURE' : '🚪 OPEN'}
                          </div>
                        </div>
                      ))}

                      <div className={`row-span-2 bg-gradient-to-br flex flex-col ${cardStyles.security} rounded-2xl shadow-xl p-5 text-white relative overflow-hidden`}>
                        <div className={`absolute top-0 right-0 w-48 h-48 ${cardStyles.securityDeco} rounded-full -mr-24 -mt-24`}></div>
                        <div className="relative flex flex-col h-full">
                          <div className="mb-1">
                            <h3 id="section-keamanan" className="text-2xl font-bold mb-1 tracking-tight text-white">{t('dashboard.security')}</h3>
                            <p className="text-eco-100 text-xs">{currentSensors.security.length} sensor aktif</p>
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
                              ) ? t('dashboard.status_all_safe', '🔒 Semua Aman') : t('dashboard.status_needs_attention', '⚠️ Perlu Perhatian')}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2 mt-auto">
                            {currentSensors.security.slice(0, 2).map((sensor, idx) => (
                              <div key={idx} className="bg-white/10 border border-white/5 backdrop-blur-sm rounded-lg p-3 flex justify-between items-center">
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
                <h2 className="text-xl font-bold text-text-headline mb-4 tracking-tight">{t('dashboard.water_health')}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-flow-col gap-3 sm:gap-4 mb-6 lg:overflow-x-auto lg:pb-4 lg:scrollbar-none desktop-water-grid">
                  {/* pH */}
                  <div className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-text-headline">{t('dashboard.ph_level')}</span>
                      <Beaker className="w-5 h-5 text-sense-500" />
                    </div>
                    <div className="mb-3">
                      <div className="text-4xl font-bold text-text-headline tracking-tight">{selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph}</div>
                      <div className="text-xs text-text-dim mt-1 font-medium">
                        {(selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph) >= 6.5 && (selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph) <= 8.5 ? t('dashboard.status_water_usable', 'Layak Pakai') : t('dashboard.status_water_unusable', 'Tidak Layak Pakai')}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-gradient-to-r from-sense-500 to-[#06b6d4]" style={{ width: `${((selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph) / 14) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Turbidity */}
                  <div className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-text-headline">{t('dashboard.turbidity')}</span>
                      <Droplets className="w-5 h-5 text-sense-500" />
                    </div>
                    <div className="mb-3">
                      <div className="text-4xl font-bold text-text-headline tracking-tight">{selectedRoom === 'all' ? liveTurbidity : currentSensors.waterQuality.turbidity}</div>
                      <div className="text-xs text-text-dim mt-1 font-medium">
                        {(selectedRoom === 'all' ? liveTurbidity : currentSensors.waterQuality.turbidity) <= 25 ? t('dashboard.status_water_usable', 'Layak Pakai') : t('dashboard.status_water_unusable', 'Tidak Layak Pakai')}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-gradient-to-r from-sense-500 to-[#06b6d4]" style={{ width: `${Math.min(((selectedRoom === 'all' ? liveTurbidity : currentSensors.waterQuality.turbidity) / 10) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* TDS */}
                  <div className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-text-headline">{t('dashboard.tds')}</span>
                      <Wind className="w-5 h-5 text-eco-500" />
                    </div>
                    <div className="mb-3">
                      <div className="text-4xl font-bold text-text-headline tracking-tight">{selectedRoom === 'all' ? liveTds : currentSensors.waterQuality.tds}</div>
                      <div className="text-xs text-text-dim mt-1 font-medium">
                        {(selectedRoom === 'all' ? liveTds : currentSensors.waterQuality.tds) <= 1000 ? t('dashboard.status_water_usable', 'Layak Pakai') : t('dashboard.status_water_unusable', 'Tidak Layak Pakai')}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-gradient-to-r from-eco-500 to-eco-900" style={{ width: `${Math.min(((selectedRoom === 'all' ? liveTds : currentSensors.waterQuality.tds) / 500) * 100, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Water Temperature */}
                  <div className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-text-headline">{t('dashboard.water_temperature')}</span>
                      <Thermometer className="w-5 h-5 text-alert-warning" />
                    </div>
                    <div className="mb-3">
                      <div className="text-4xl font-bold text-text-headline tracking-tight">{selectedRoom === 'all' ? liveWaterTemp : currentSensors.waterQuality.temp}°C</div>
                      <div className="text-xs text-text-dim mt-1 font-medium">
                        {(selectedRoom === 'all' ? liveWaterTemp : currentSensors.waterQuality.temp) < 10 ? t('dashboard.status_water_cold', 'Dingin') : (selectedRoom === 'all' ? liveWaterTemp : currentSensors.waterQuality.temp) < 30 ? t('dashboard.status_water_normal', 'Normal') : t('dashboard.status_water_warm', 'Hangat')}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-auto">
                      <div className="h-full bg-gradient-to-r from-alert-warning to-alert-danger" style={{ width: `${((selectedRoom === 'all' ? liveWaterTemp : currentSensors.waterQuality.temp) / 50) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Big Card - Water Status - row-span-2 */}
                  <div className={`row-span-2 bg-gradient-to-br ${cardStyles.water} rounded-2xl shadow-xl p-5 text-white relative overflow-hidden flex flex-col min-w-[280px]`}>
                    <div className={`absolute top-0 right-0 w-64 h-64 ${cardStyles.waterDeco} rounded-full -mr-32 -mt-32`}></div>
                    <div className="relative h-full flex flex-col">
                      <div className="mb-1">
                        <h3 className="text-2xl font-bold mb-1 flex items-center gap-3 tracking-tight text-white">
                          <Beaker className="w-6 h-6" />
                          {t('dashboard.water_status_title', 'Status Air')}
                        </h3>
                        <p className="text-eco-100 text-sm">{t('dashboard.water_ref', 'Berdasarkan: pH, Turbidity, TDS, Suhu')}</p>
                        <p className="text-eco-100/70 text-xs mb-1">{t('dashboard.water_std', '(Permenkes No. 32 Tahun 2017)')}</p>
                      </div>

                      <div className="flex-1 flex flex-col justify-center items-center text-center mt-1 mb-1">
                        <div className="text-2xl font-semibold mb-3 flex items-center gap-2 text-white">
                          {(selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph) >= 6.5 && (selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph) <= 8.5 && (selectedRoom === 'all' ? liveTurbidity : currentSensors.waterQuality.turbidity) <= 25 && (selectedRoom === 'all' ? liveTds : currentSensors.waterQuality.tds) <= 1000 ? t('dashboard.status_water_ok', '💧 Layak Pakai') : t('dashboard.status_water_bad', '⚠️ Tidak Layak Pakai')}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <div className="bg-white/10 border border-white/5 backdrop-blur-sm rounded-lg p-3 text-center">
                          <div className="text-[10px] mb-1">{t('dashboard.ph_level')}</div>
                          <div className="font-bold text-lg">{selectedRoom === 'all' ? livePh : currentSensors.waterQuality.ph}</div>
                        </div>
                        <div className="bg-white/10 border border-white/5 backdrop-blur-sm rounded-lg p-3 text-center">
                          <div className="text-[10px] mb-1">{t('dashboard.water_temperature')}</div>
                          <div className="font-bold text-lg">{selectedRoom === 'all' ? liveWaterTemp : currentSensors.waterQuality.temp}°C</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div id="section-energi" className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-text-headline tracking-tight">{t('dashboard.energy_consumption')}</h3>
                  <p className="text-xs text-text-dim mt-1">
                    {chartType === 'daily'
                      ? t('dashboard.energy_update_daily', 'Update setiap jam | Hari berjalan 00:00-23:59')
                      : t('dashboard.energy_update_monthly', 'Update setiap bulan | Periode 1 tahun (Januari–Desember)')}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setShowWarningModal(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 bg-alert-warning text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-alert-warning/90 transition-all hover:shadow-md active:scale-95 group"
                  >
                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{t('dashboard.budget_management')}</span>
                  </button>
                  <button
                    onClick={() => setShowDataModal(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 bg-eco-500 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-eco-900 transition-all hover:shadow-md active:scale-95 group"
                  >
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{t('dashboard.view_details')}</span>
                    <ChevronRight className="w-4 h-4 hidden sm:inline" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 bg-eco-50 rounded-2xl border border-eco-500/10 items-start">
                {/* Item 1 */}
                <div className="text-center px-2 flex flex-col items-center">
                  <div className="text-[10px] sm:text-[11px] text-eco-900 font-bold mb-1 uppercase tracking-wider leading-snug h-[40px] flex items-center justify-center">
                    {chartType === 'daily' ? t('dashboard.current_load') : t('dashboard.current_month_load')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-eco-500 flex items-baseline justify-center gap-1">
                    {energySummary?.currentLoad || 0} <span className="text-xs sm:text-sm font-semibold opacity-60">{chartType === 'daily' ? 'Watt' : 'kWh'}</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="text-center px-2 flex flex-col items-center">
                  <div className="text-[10px] sm:text-[11px] text-eco-900 font-bold mb-1 uppercase tracking-wider leading-snug h-[40px] flex items-center justify-center">
                    {chartType === 'daily' ? t('dashboard.running_consumption') : t('dashboard.total_year_consumption')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-eco-500 flex items-baseline justify-center gap-1">
                    {chartType === 'daily' ? energySummary?.runningConsumption || 0 : (energySummary?.monthlyData?.reduce((acc, m) => acc + m.kwh, 0) || 0).toFixed(1)} <span className="text-xs sm:text-sm font-semibold opacity-60">kWh</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="text-center px-2 flex flex-col items-center">
                  <div className="text-[10px] sm:text-[11px] text-eco-900 font-bold mb-1 uppercase tracking-wider leading-snug h-[40px] flex items-center justify-center">
                    {chartType === 'daily' ? t('dashboard.avg_hourly') : t('dashboard.avg_monthly')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-eco-500 flex items-baseline justify-center gap-1">
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
                  <div className="text-[10px] sm:text-[11px] text-eco-900 font-bold mb-1 uppercase tracking-wider leading-snug h-[40px] flex items-center justify-center">
                    {t('dashboard.est_cost')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-eco-500 flex items-baseline justify-center gap-1">
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

              <div className="flex gap-2 mb-6 sm:mb-8 bg-slate-50 p-1.5 rounded-[16px] border border-slate-100">
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
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
                        label={{ value: t('dashboard.energy_consumption_label', 'Konsumsi (kWh)'), angle: -90, position: 'insideLeft', offset: 0, fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
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
                        formatter={(value) => `${value} kWh`}
                      />
                      <Line
                        type="monotone"
                        dataKey="kwh"
                        stroke="var(--color-eco-500)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--color-eco-500)', r: 4, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
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
            <div className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-headline flex items-center gap-2 tracking-tight">
                  <Bell className="w-5 h-5 text-sense-500" />
                  {t('dashboard.notifications')}
                </h3>
                <button onClick={() => setShowNotifications(true)} className="text-xs font-bold text-sense-500 hover:text-sense-900 transition-colors">{t('dashboard.view_all')}</button>
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
                      className={`p-3 sm:p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-all border-l-4 cursor-pointer active:scale-[0.98] ${notif.type === 'danger'
                        ? 'border-l-alert-danger'
                        : notif.type === 'warning'
                          ? 'border-l-alert-warning'
                          : notif.type === 'security'
                            ? 'border-l-alert-special'
                            : notif.type === 'success'
                              ? 'border-l-eco-500'
                              : 'border-l-sense-500'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          notif.type === 'danger' ? 'bg-alert-danger/10' : 
                          notif.type === 'warning' ? 'bg-alert-warning/10' : 
                          notif.type === 'security' ? 'bg-alert-special/10' : 
                          notif.type === 'success' ? 'bg-eco-50' : 'bg-sense-50'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            notif.type === 'danger' ? 'text-alert-danger' : 
                            notif.type === 'warning' ? 'text-alert-warning' : 
                            notif.type === 'security' ? 'text-alert-special' : 
                            notif.type === 'success' ? 'text-eco-500' : 'text-sense-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
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
                          <div className="text-sm text-gray-800 leading-relaxed">
                            {(() => {
                              const titleStr = (notif.title || "").toLowerCase();
                              const msgStr = (notif.message || "").toLowerCase();
                              let smartType = null;
                              if (notif.type && !['info', 'danger', 'warning', 'success', 'sistem', 'pengaduan', 'purple', 'water', 'kenyamanan'].includes(notif.type.toLowerCase())) {
                                smartType = notif.type.toUpperCase();
                              } else {
                                // Detection Logic (Check Title first, then Message)
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
                                  // Regex to find ticket ID in quotes or 8-char alphanumeric
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
                            <div className="text-[10px] text-gray-400 mt-1.5 font-medium">
                              {notif.date ? new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('notification.ui.just_now')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-surface-card rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-text-headline mb-4 flex items-center gap-2 tracking-tight">
                <Activity className="w-5 h-5 text-eco-500" />
                {t('dashboard.recent_activities')}
              </h3>
              <div className="space-y-3">
                {mappedActivities.slice(0, 5).map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 border hover:bg-white hover:scale-[1.02] hover:shadow-md active:scale-95 cursor-pointer group
                      ${activity.color === 'emerald' ? 'bg-eco-50 border-eco-500/10' : 'bg-slate-50 border-slate-100'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                        activity.color === 'emerald' ? 'bg-eco-50' : 'bg-slate-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${activity.color === 'emerald' ? 'text-eco-500' : 'text-text-dim'}`} strokeWidth={2.5} />
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