export const getDeletionRequestStatusMeta = (request, t) => {
    if (!request) {
        return {
            label: t ? t('admin_homeowner.deletion_request.status_active') : 'Aktif',
            tone: 'success',
            note: '',
        };
    }

    if (request.status === 'pending') {
        return {
            label: t ? t('admin_homeowner.deletion_request.status_pending') : 'Menunggu Persetujuan',
            tone: 'warning',
            note: t ? t('admin_homeowner.deletion_request.note_pending') : 'Menunggu keputusan Project Owner.',
        };
    }

    if (request.status === 'rejected') {
        return {
            label: t ? t('admin_homeowner.deletion_request.status_active') : 'Aktif',
            tone: 'success',
            note: request.decisionNote || (t ? t('admin_homeowner.deletion_request.note_rejected') : 'Permintaan penghapusan ditolak. Akun masih aktif.'),
        };
    }

    if (request.status === 'approved') {
        return {
            label: t ? t('admin_homeowner.deletion_request.status_approved') : 'Disetujui',
            tone: 'neutral',
            note: request.decisionNote || (t ? t('admin_homeowner.deletion_request.note_approved') : 'Permintaan penghapusan disetujui.'),
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
