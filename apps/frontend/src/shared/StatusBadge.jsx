/**
 * StatusBadge — Shared badge component used across Dashboard, History, etc.
 * Renders colored pill badge based on a status string.
 */
export function StatusBadge({ status, isRead = false }) {
  if (!status) return null;

  // Normalizing status for comparison
  const s = status.toLowerCase();

  // Mapping for consistent colors across all roles
  const config = {
    // SUCCESS / NORMAL (GREEN - ECO)
    success: { bg: 'bg-green-50 border border-green-200', text: 'text-green-900', dot: 'bg-eco' },
    sukses: { bg: 'bg-green-50 border border-green-200', text: 'text-green-900', dot: 'bg-eco' },
    berhasil: { bg: 'bg-green-50 border border-green-200', text: 'text-green-900', dot: 'bg-eco' },
    normal: { bg: 'bg-green-50 border border-green-200', text: 'text-green-900', dot: 'bg-eco' },
    aman: { bg: 'bg-green-50 border border-green-200', text: 'text-green-900', dot: 'bg-eco' },
    nyaman: { bg: 'bg-green-50 border border-green-200', text: 'text-green-900', dot: 'bg-eco' },
    'layak pakai': { bg: 'bg-green-50 border border-green-200', text: 'text-green-900', dot: 'bg-eco' },
    on: { bg: 'bg-green-50 border border-green-200', text: 'text-green-900', dot: 'bg-eco' },

    // DANGER / CRITICAL (RED - DANGER)
    danger: { bg: 'bg-red-50 border border-red-100', text: 'text-red-600', dot: 'bg-red-55 bg-red-500' },
    bahaya: { bg: 'bg-red-50 border border-red-100', text: 'text-red-600', dot: 'bg-red-55 bg-red-500' },
    'tidak nyaman': { bg: 'bg-red-50 border border-red-100', text: 'text-red-600', dot: 'bg-red-55 bg-red-500' },
    'tidak layak': { bg: 'bg-red-50 border border-red-100', text: 'text-red-600', dot: 'bg-red-55 bg-red-500' },
    off: { bg: 'bg-red-50 border border-red-100', text: 'text-red-600', dot: 'bg-red-55 bg-red-500' },

    // WARNING / ALERT (YELLOW/ORANGE - WARNING)
    warning: { bg: 'bg-amber-50 border border-amber-100', text: 'text-amber-600', dot: 'bg-amber-500' },
    waspada: { bg: 'bg-amber-50 border border-amber-100', text: 'text-amber-600', dot: 'bg-amber-500' },

    // SECURITY / MONITORING (PURPLE/INDIGO - SPECIAL)
    purple: { bg: 'bg-indigo-50 border border-indigo-100', text: 'text-indigo-600', dot: 'bg-indigo-500' },
    keamanan: { bg: 'bg-indigo-50 border border-indigo-100', text: 'text-indigo-600', dot: 'bg-indigo-500' },

    // INFO / SYSTEM (BLUE - SENSE)
    info: { bg: 'bg-cyan-50 border border-cyan-100', text: 'text-cyan-900', dot: 'bg-sense' },
    sistem: { bg: 'bg-cyan-50 border border-cyan-100', text: 'text-cyan-900', dot: 'bg-sense' },

    // ARCHIVED / READ (GRAY - NEUTRAL)
    read: { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400' },

    // COMPLAINT SPECIFIC
    selesai: { bg: 'bg-green-50 border border-green-200', text: 'text-green-900', dot: 'bg-eco' },
    ditolak: { bg: 'bg-red-50 border border-red-100', text: 'text-red-600', dot: 'bg-red-55 bg-red-500' },
    batal: { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400' },
    cancelled: { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400' }
  };

  const style = isRead ? config.read : (config[s] || { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-600', dot: 'bg-slate-300' });

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-bold whitespace-nowrap transition-all ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

