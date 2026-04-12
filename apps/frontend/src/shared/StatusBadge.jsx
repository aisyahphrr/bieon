/**
 * StatusBadge — Shared badge component used across Dashboard, History, etc.
 * Renders colored pill badge based on a status string.
 */
export function StatusBadge({ status }) {
  if (!status) return null;

  if (['Nyaman', 'Aman', 'Layak Pakai', 'ON'].includes(status)) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-semibold bg-[#EAFDF3] text-[#169456]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#189F5A]" />
        {status}
      </span>
    );
  }
  if (['Tidak Nyaman', 'Bahaya', 'Tidak Layak', 'OFF'].includes(status)) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-semibold bg-[#FDEAEB] text-[#D83C43]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D83C43]" />
        {status}
      </span>
    );
  }
  if (status === 'Waspada') {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-semibold bg-[#FEF9C3] text-[#D97706]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
        {status}
      </span>
    );
  }
  if (status === 'Info') {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-semibold bg-[#EFF6FF] text-[#2563EB]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
        {status}
      </span>
    );
  }
  if (status === 'Out of Range') {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-semibold bg-[#2B323D] text-white">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        {status}
      </span>
    );
  }

  return <span className="text-sm text-gray-600">{status}</span>;
}
