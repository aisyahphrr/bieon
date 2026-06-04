import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SLATimer from './SLATimer';

/**
 * TicketStatusBadge — Shared badge for ticket/complaint statuses.
 * 
 * Props:
 *  - status: string (e.g. 'unassigned', 'menunggu respons', etc.)
 *  - sla: string | null (legacy, replaced by real-time timer)
 *  - rating: number | object | null
 *  - assignedAt: ISO date
 *  - processStartedAt: ISO date
 */
export function TicketStatusBadge({ status, rating, assignedAt, processStartedAt, isEscalated, role, className }) {
  const { t } = useTranslation();
  const s = status?.toLowerCase();

  const getStyles = () => {
    switch (s) {
      case 'unassigned':
        return { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400', label: role === 'homeowner' ? t('complaint.status_baru', 'Baru') : t('complaint.status_unassigned', 'Belum Ditugaskan') };
      
      case 'menunggu respons':
      case 'overdue respons':
        return { 
          bg: (s === 'overdue respons' && role !== 'homeowner') ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100', 
          text: (s === 'overdue respons' && role !== 'homeowner') ? 'text-red-600' : 'text-amber-600', 
          dot: (s === 'overdue respons' && role !== 'homeowner') ? 'bg-red-500' : 'bg-amber-500', 
          label: (s === 'overdue respons' && role !== 'homeowner') ? t('complaint.status_overdue_respons', 'Overdue Respons') : t('complaint.status_menunggu_respons', 'Menunggu Respons'),
          timerStart: assignedAt
        };

      case 'diproses':
      case 'overdue perbaikan':
        return { 
          bg: (s === 'overdue perbaikan' && role !== 'homeowner') ? 'bg-red-50 border border-red-100' : 'bg-cyan-50 border border-cyan-100', 
          text: (s === 'overdue perbaikan' && role !== 'homeowner') ? 'text-red-600' : 'text-cyan-900', 
          dot: (s === 'overdue perbaikan' && role !== 'homeowner') ? 'bg-red-500' : 'bg-sense', 
          label: (s === 'overdue perbaikan' && role !== 'homeowner') ? t('complaint.status_overdue_perbaikan', 'Overdue Perbaikan') : t('complaint.status_diproses', 'Diproses'),
          timerStart: processStartedAt
        };

      case 'menunggu konfirmasi pelanggan':
        return { bg: 'bg-indigo-50 border border-indigo-100', text: 'text-indigo-600', dot: 'bg-indigo-600', label: t('complaint.status_menunggu_konfirmasi_pelanggan', 'Menunggu Konfirmasi Pelanggan') };

      case 'selesai':
        return { bg: 'bg-green-50 border border-green-200', text: 'text-green-900', dot: 'bg-eco', label: t('complaint.status_selesai', 'Selesai') };

      case 'ditolak':
        return { bg: 'bg-red-50 border border-red-100', text: 'text-red-600', dot: 'bg-red-500', label: t('complaint.status_ditolak', 'Ditolak') };

      default:
        return { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400', label: status };
    }
  };

  const style = getStyles();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${style.bg} ${style.text} ${className || 'whitespace-nowrap'} transition-all`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${['overdue respons', 'overdue perbaikan'].includes(s) || (style.text.includes('amber') && role !== 'homeowner') ? 'animate-pulse scale-125' : ''}`} />
      {style.label}
      
      {/* PING Indicator - Visual Warning */}
      {(style.text.includes('amber') || style.text.includes('red')) && role === 'technician' && (
        <span className="ml-1 animate-bounce text-[10px]">⚠️</span>
      )}
      
      {isEscalated && !['selesai', 'ditolak'].includes(s) && role !== 'homeowner' && (
        <span className="ml-1 bg-red-600 text-white w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-black animate-pulse shadow-sm shadow-red-500/50" title={t('complaint.escalation_priority_title', 'Eskalasi / Prioritas Tinggi')}>!</span>
      )}
      
      {style.timerStart && role !== 'homeowner' && (
        <SLATimer 
          startTime={style.timerStart} 
          status={status} 
          type={s === 'diproses' || s === 'overdue perbaikan' ? 'Repair' : 'Response'} 
        />
      )}

      {status?.toLowerCase() === 'selesai' && rating && (
        <span className="inline-flex items-center gap-1 ml-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" strokeWidth={1.5} />
          <span className="font-bold">{(rating.stars || rating)}/5</span>
        </span>
      )}
    </span>
  );
}
