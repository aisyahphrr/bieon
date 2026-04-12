import { Star } from 'lucide-react';

/**
 * TicketStatusBadge — Shared badge for ticket/complaint statuses.
 * Used in PengaduanKlienPage and RiwayatPerbaikanPage.
 *
 * Props:
 *  - status: string  (e.g. 'Baru', 'Diproses', 'Selesai', etc.)
 *  - sla: string | null  (optional remaining SLA time, shown when not Selesai)
 *  - rating: number | null  (shown when status === 'Selesai')
 */
export function TicketStatusBadge({ status, sla, rating }) {
  const getStyles = () => {
    switch (status) {
      case 'Baru':
      case 'Menunggu Respons':
        return { bg: 'bg-red-50', text: 'text-[#D83C43]', dot: 'bg-[#D83C43]', label: 'Baru' };
      case 'Diproses':
      case 'Sedang Diproses':
      case 'Diproses Teknisi':
        return { bg: 'bg-blue-50', text: 'text-[#2563EB]', dot: 'bg-[#2563EB]', label: 'Diproses' };
      case 'Menunggu Konfirmasi':
        return { bg: 'bg-amber-50', text: 'text-[#D97706]', dot: 'bg-[#D97706]', label: 'Menunggu Konfirmasi' };
      case 'Selesai':
        return { bg: 'bg-emerald-50', text: 'text-[#169456]', dot: 'bg-[#169456]', label: 'Selesai' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', label: status };
    }
  };

  const style = getStyles();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${style.bg} ${style.text} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
      {sla && status !== 'Selesai' && (
        <span className="font-normal opacity-90 ml-0.5">(Sisa: {sla})</span>
      )}
      {status === 'Selesai' && rating && (
        <span className="inline-flex items-center gap-1 ml-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold">{rating}/5</span>
        </span>
      )}
    </span>
  );
}
