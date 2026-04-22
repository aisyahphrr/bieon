import { Star } from 'lucide-react';
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
export function TicketStatusBadge({ status, rating, assignedAt, processStartedAt, isEscalated, role }) {
  const s = status?.toLowerCase();

  const getStyles = () => {
    switch (s) {
      case 'unassigned':
        return { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Baru' };
      
      case 'menunggu respons':
      case 'overdue respons':
        return { 
          bg: 'bg-amber-50', 
          text: (s === 'overdue respons' && role !== 'homeowner') ? 'text-red-600' : 'text-amber-600', 
          dot: (s === 'overdue respons' && role !== 'homeowner') ? 'bg-red-500' : 'bg-amber-500', 
          label: (s === 'overdue respons' && role !== 'homeowner') ? 'Overdue Respons' : 'Menunggu Respons',
          timerStart: assignedAt
        };

      case 'diproses':
      case 'overdue perbaikan':
        return { 
          bg: 'bg-blue-50', 
          text: (s === 'overdue perbaikan' && role !== 'homeowner') ? 'text-red-600' : 'text-blue-600', 
          dot: (s === 'overdue perbaikan' && role !== 'homeowner') ? 'bg-red-500' : 'bg-blue-500', 
          label: (s === 'overdue perbaikan' && role !== 'homeowner') ? 'Overdue Perbaikan' : 'Diproses',
          timerStart: processStartedAt
        };

      case 'menunggu konfirmasi pelanggan':
        return { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-600', label: 'Menunggu Konfirmasi Pelanggan' };

      case 'selesai':
        return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-600', label: 'Selesai' };

      case 'ditolak':
        return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Ditolak' };

      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', label: status };
    }
  };

  const style = getStyles();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${style.bg} ${style.text} whitespace-nowrap transition-all`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${['overdue respons', 'overdue perbaikan'].includes(s) || (style.text.includes('amber') && role !== 'homeowner') ? 'animate-pulse scale-125' : ''}`} />
      {style.label}
      
      {/* PING Indicator - Visual Warning */}
      {(style.text.includes('amber') || style.text.includes('red')) && role === 'technician' && (
        <span className="ml-1 animate-bounce text-[10px]">⚠️</span>
      )}
      
      {isEscalated && !['selesai', 'ditolak'].includes(s) && (
        <span className="ml-1 bg-red-600 text-white w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-black animate-pulse shadow-sm shadow-red-500/50" title="Eskalasi / Prioritas Tinggi">!</span>
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
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold">{(rating.stars || rating)}/5</span>
        </span>
      )}
    </span>
  );
}
