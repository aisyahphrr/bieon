import i18n from '../lib/i18n';

/**
 * Helpers for Complaint Status and Action Logic
 */

export const getRawDisplayStatus = (status, role, timeElapsedMinutes = 0) => {
    if (!status) return '-';
    const s = status.toLowerCase();
    
    let displayStatus = s;
    if (s === 'menunggu respons' && timeElapsedMinutes > 15) displayStatus = 'overdue respons';
    if (s === 'diproses' && timeElapsedMinutes > 2880) displayStatus = 'overdue perbaikan';

    if (role === 'homeowner') {
        if (displayStatus === 'unassigned' || displayStatus === 'baru') displayStatus = 'unassigned_homeowner';
    }
    
    return displayStatus;
};

export const formatStatusDisplay = (status, role, timeElapsedMinutes = 0) => {
    const displayStatus = getRawDisplayStatus(status, role, timeElapsedMinutes);
    if (displayStatus === '-') return '-';
    
    // Normalize to match i18n key format (lowercase, spaces to underscores)
    const sanitizedStatus = displayStatus.replace(/\s+/g, '_');
    
    // Use i18n to get the translation
    const translationKey = `complaint.status.${sanitizedStatus}`;
    const translated = i18n.t(translationKey);
    
    // Fallback to original status if translation is missing
    return translated !== translationKey ? translated : status;
};

export const getActionButtons = (role, status, timeElapsedMinutes = 0, t = (k, f) => f) => {
    const s = status?.toLowerCase();

    if (role === 'admin' || role === 'superadmin') {
        const isUnassigned = s === 'unassigned' || s === 'baru';
        const isClosed = ['selesai', 'ditolak'].includes(s);

        if (isUnassigned) {
            return [
                { action: 'assign', label: t('complaint.action.admin.assign_tech', 'Tugaskan'), variant: 'primary' },
                { action: 'reject', label: t('complaint.action.admin.reject_complaint', 'Tolak'), variant: 'danger' }
            ];
        }

        if (isClosed) {
            return [{ action: 'detail', label: 'Detail', variant: 'info' }];
        }

        // Logic for active tickets (Menunggu Respons or Diproses)
        if (s.includes('respons')) {
            const btns = [{ action: 'detail', label: 'Detail', variant: 'info' }];
            // ONLY show 'Alihkan' if status is already overdue (mapped in backend or helpers)
            if (s === 'overdue respons' || timeElapsedMinutes >= 15) { 
                btns.unshift({ action: 'reassign', label: t('complaint.action.admin.reassign_tech', 'Alihkan'), variant: 'primary' });
            } else if (timeElapsedMinutes >= 8) {
                btns.unshift({ action: 'ping', label: t('complaint.action.admin.ping', 'Ping Teknisi'), variant: 'danger' });
            }
            return btns;
        }

        if (s.includes('proses') || s.includes('perbaikan')) {
            const btns = [{ action: 'detail', label: 'Detail', variant: 'info' }];
            // ONLY show 'Alihkan' if status is already overdue
            if (s === 'overdue perbaikan' || timeElapsedMinutes >= 2880) {
                btns.unshift({ action: 'reassign', label: t('complaint.action.admin.reassign_tech', 'Alihkan'), variant: 'primary' });
            } else if (timeElapsedMinutes >= 1440) {
                btns.unshift({ action: 'ping', label: t('complaint.action.admin.ping', 'Ping Teknisi'), variant: 'danger' });
            }
            return btns;
        }

        return [{ action: 'detail', label: 'Detail', variant: 'info' }];
    }

    if (role === 'technician') {
        if (['menunggu respons', 'overdue respons'].includes(s)) {
            return [{ action: 'process', label: t('complaint.action.technician.start_process', 'Terima & Proses'), variant: 'primary' }];
        }
        if (['diproses', 'overdue perbaikan'].includes(s)) {
            return [{ action: 'finish', label: t('complaint.action.technician.finish_repair', 'Selesaikan'), variant: 'primary' }];
        }
    }

    if (role === 'homeowner') {
        if (s === 'menunggu konfirmasi pelanggan') {
            return [{ action: 'confirm', label: t('complaint.action.homeowner.confirm_done', 'Konfirmasi Selesai'), variant: 'success' }];
        }
    }

    return [{ action: 'detail', label: 'Detail', variant: 'info' }];
};

export const getPerformanceIndicator = (points) => {
    if (points >= 90) return { icon: '🟢', label: i18n.t('export.perf_excellent', 'Bagus'), color: 'text-green-600', bg: 'bg-green-50' };
    if (points >= 70) return { icon: '🟡', label: i18n.t('export.perf_good', 'Standar'), color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { icon: '🔴', label: i18n.t('export.perf_needs_improvement', 'Butuh Training'), color: 'text-red-600', bg: 'bg-red-50' };
};

export const localizeTopic = (topic, t = (k, f) => f) => {
    if (!topic) return '';
    const key = `complaint.topic.${topic.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
    const translated = t(key);
    return translated !== key ? translated : topic;
};
