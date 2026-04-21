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
export function TicketStatusBadge({ status, rating, assignedAt, processStartedAt }) {
  const s = status?.toLowerCase();

  const getStyles = () => {
    switch (s) {
      case 'unassigned':
        return { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Baru' };
      
      case 'menunggu respons':
      case 'overdue respons':
        return { 
          bg: 'bg-amber-50', 
          text: s === 'overdue respons' ? 'text-red-600' : 'text-amber-600', 
          dot: s === 'overdue respons' ? 'bg-red-500' : 'bg-amber-500', 
          label: s === 'overdue respons' ? 'Overdue Respons' : 'Menunggu Respons',
          timerStart: assignedAt
        };

      case 'diproses':
      case 'overdue perbaikan':
        return { 
          bg: 'bg-blue-50', 
          text: s === 'overdue perbaikan' ? 'text-red-600' : 'text-blue-600', 
          dot: s === 'overdue perbaikan' ? 'bg-red-500' : 'bg-blue-500', 
          label: s === 'overdue perbaikan' ? 'Overdue Perbaikan' : 'Diproses',
          timerStart: processStartedAt
        };

      case 'menunggu konfirmasi':
        return { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-600', label: 'Menunggu Konfirmasi' };

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
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
      
      {style.timerStart && (
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
