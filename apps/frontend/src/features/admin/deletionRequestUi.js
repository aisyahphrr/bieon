export const getDeletionRequestStatusMeta = (request) => {
    if (!request) {
        return {
            label: 'Aktif',
            tone: 'success',
            note: '',
        };
    }

    if (request.status === 'pending') {
        return {
            label: 'Menunggu Persetujuan',
            tone: 'warning',
            note: 'Menunggu keputusan Project Owner.',
        };
    }

    if (request.status === 'rejected') {
        return {
            label: 'Aktif',
            tone: 'success',
            note: request.decisionNote || 'Permintaan penghapusan ditolak. Akun masih aktif.',
        };
    }

    if (request.status === 'approved') {
        return {
            label: 'Disetujui',
            tone: 'neutral',
            note: request.decisionNote || 'Permintaan penghapusan disetujui.',
        };
    }

    return {
        label: request.status,
        tone: 'neutral',
        note: request.decisionNote || '',
    };
};

export const getDeletionRequestBadgeClass = (tone) => {
    if (tone === 'warning') {
        return 'bg-amber-50 text-amber-700';
    }

    if (tone === 'danger') {
        return 'bg-red-50 text-red-600';
    }

    if (tone === 'neutral') {
        return 'bg-slate-100 text-slate-700';
    }

    return 'bg-emerald-50 text-emerald-600';
};
