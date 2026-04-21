/**
 * Helpers for Complaint Status and Action Logic
 */

export const formatStatusDisplay = (status, role, timeElapsedMinutes = 0) => {
    const s = status?.toLowerCase();
    
    // Dynamic Overdue Label Logic (Frontend-side transformation)
    let displayStatus = s;
    if (s === 'menunggu respons' && timeElapsedMinutes > 30) displayStatus = 'overdue respons';
    if (s === 'diproses' && timeElapsedMinutes > 3360) displayStatus = 'overdue perbaikan';

    // Role-based aliasing
    if (role === 'homeowner') {
        if (displayStatus === 'unassigned') return 'Baru';
        if (displayStatus === 'overdue respons' || displayStatus === 'menunggu respons') return 'Menunggu Respons';
        if (displayStatus === 'overdue perbaikan' || displayStatus === 'diproses') return 'Diproses';
    }
    
    if (role === 'technician') {
        if (displayStatus === 'overdue respons' || displayStatus === 'menunggu respons') return 'Menunggu Respons';
        if (displayStatus === 'overdue perbaikan' || displayStatus === 'diproses') return 'Diproses';
    }

    // Default mapping for display
    const mapping = {
        'unassigned': 'Baru',
        'menunggu respons': 'Menunggu Respons',
        'diproses': 'Diproses',
        'menunggu konfirmasi': 'Menunggu Konfirmasi',
        'selesai': 'Selesai',
        'overdue respons': 'Overdue Respons',
        'overdue perbaikan': 'Overdue Perbaikan',
        'ditolak': 'Ditolak'
    };

    return mapping[displayStatus] || status;
};

export const getActionButtons = (role, status, timeElapsedMinutes = 0) => {
    const s = status?.toLowerCase();

    if (role === 'admin' || role === 'superadmin') {
        // PERATURAN BARU: Semua aksi isi 1 button KECUALI di status Baru
        if (s === 'unassigned') {
            return [
                { action: 'assign', label: 'Tugaskan', variant: 'primary' },
                { action: 'reject', label: 'Tolak', variant: 'danger' }
            ];
        }
        
        // --- Respons Logic (15m Ping, 30m Alihkan) ---
        if (s === 'menunggu respons' || s === 'overdue respons') {
            if (timeElapsedMinutes > 30) {
                return [{ action: 'reassign', label: 'Alihkan', variant: 'primary' }];
            }
            if (timeElapsedMinutes >= 15) {
                return [{ action: 'ping', label: 'Ping', variant: 'secondary' }];
            }
            return [{ action: 'detail', label: 'Detail', variant: 'info' }];
        }

        // --- Perbaikan Logic (48h/2880m Ping, 56h/3360m Alihkan) ---
        if (s === 'diproses' || s === 'overdue perbaikan') {
            if (timeElapsedMinutes > 3360) {
                return [{ action: 'reassign', label: 'Alihkan', variant: 'primary' }];
            }
            if (timeElapsedMinutes >= 2880) {
                return [{ action: 'ping', label: 'Ping', variant: 'secondary' }];
            }
            return [{ action: 'detail', label: 'Detail', variant: 'info' }];
        }

        // Default all others to Detail
        return [{ action: 'detail', label: 'Detail', variant: 'info' }];
    }

    if (role === 'technician') {
        if (['menunggu respons', 'overdue respons'].includes(s)) {
            return [{ action: 'process', label: 'Terima & Proses', variant: 'primary' }];
        }
        if (['diproses', 'overdue perbaikan'].includes(s)) {
            return [{ action: 'finish', label: 'Selesaikan', variant: 'primary' }];
        }
    }

    if (role === 'homeowner') {
        if (s === 'menunggu konfirmasi') {
            return [{ action: 'confirm', label: 'Konfirmasi Selesai', variant: 'success' }];
        }
    }

    return [{ action: 'detail', label: 'Detail', variant: 'info' }];
};

export const getPerformanceIndicator = (points) => {
    if (points >= 90) return { icon: '🟢', label: 'Bagus', color: 'text-green-600', bg: 'bg-green-50' };
    if (points >= 70) return { icon: '🟡', label: 'Standar', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { icon: '🔴', label: 'Butuh Training', color: 'text-red-600', bg: 'bg-red-50' };
};
