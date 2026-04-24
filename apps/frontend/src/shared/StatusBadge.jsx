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
    // SUCCESS / NORMAL (GREEN)
    success: { bg: 'bg-[#EAFDF3]', text: 'text-[#169456]', dot: 'bg-[#189F5A]' },
    normal: { bg: 'bg-[#EAFDF3]', text: 'text-[#169456]', dot: 'bg-[#189F5A]' },
    aman: { bg: 'bg-[#EAFDF3]', text: 'text-[#169456]', dot: 'bg-[#189F5A]' },
    nyaman: { bg: 'bg-[#EAFDF3]', text: 'text-[#169456]', dot: 'bg-[#189F5A]' },
    'layak pakai': { bg: 'bg-[#EAFDF3]', text: 'text-[#169456]', dot: 'bg-[#189F5A]' },
    on: { bg: 'bg-[#EAFDF3]', text: 'text-[#169456]', dot: 'bg-[#189F5A]' },

    // DANGER / CRITICAL (RED)
    danger: { bg: 'bg-[#FDEAEB]', text: 'text-[#D83C43]', dot: 'bg-[#D83C43]' },
    bahaya: { bg: 'bg-[#FDEAEB]', text: 'text-[#D83C43]', dot: 'bg-[#D83C43]' },
    'tidak nyaman': { bg: 'bg-[#FDEAEB]', text: 'text-[#D83C43]', dot: 'bg-[#D83C43]' },
    'tidak layak': { bg: 'bg-[#FDEAEB]', text: 'text-[#D83C43]', dot: 'bg-[#D83C43]' },
    off: { bg: 'bg-[#FDEAEB]', text: 'text-[#D83C43]', dot: 'bg-[#D83C43]' },

    // WARNING / ALERT (YELLOW/ORANGE)
    warning: { bg: 'bg-[#FEF9C3]', text: 'text-[#D97706]', dot: 'bg-[#F59E0B]' },
    waspada: { bg: 'bg-[#FEF9C3]', text: 'text-[#D97706]', dot: 'bg-[#F59E0B]' },

    // SECURITY / MONITORING (PURPLE)
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
    keamanan: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },

    // INFO / SYSTEM (BLUE)
    info: { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]', dot: 'bg-[#3B82F6]' },
    sistem: { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]', dot: 'bg-[#3B82F6]' },

    // ARCHIVED / READ (GRAY)
    read: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' }
  };

  const style = isRead ? config.read : (config[s] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-300' });

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-bold whitespace-nowrap transition-all ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
