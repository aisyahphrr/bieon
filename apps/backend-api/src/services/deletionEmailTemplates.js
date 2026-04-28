const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDateTime = (value) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
    }).format(new Date(value));
};

const renderCardRow = (label, value) => `
    <div style="padding:12px 0;border-bottom:1px solid #eef2f7;">
        <div style="font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">${escapeHtml(label)}</div>
        <div style="font-size:14px;color:#0f172a;font-weight:700;margin-top:4px;">${escapeHtml(value || '-')}</div>
    </div>
`;

const renderEmailShell = ({ eyebrow, title, intro, body, footer }) => `
    <div style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
        <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;">
            <div style="padding:24px 28px;border-bottom:1px solid #e2e8f0;background:linear-gradient(135deg,#ffffff 0%,#f8fafc 100%);">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
                    <div style="font-size:28px;font-weight:900;letter-spacing:.04em;color:#0f172a;">BIEON</div>
                    <div style="background:#fee2e2;color:#b91c1c;padding:8px 12px;border-radius:999px;font-size:11px;font-weight:800;">${escapeHtml(eyebrow)}</div>
                </div>
                <div style="margin-top:16px;font-size:13px;color:#475569;line-height:1.7;">
                    <div><strong>Subject:</strong> ${escapeHtml(title)}</div>
                    <div><strong>Date:</strong> ${escapeHtml(formatDateTime(new Date()))}</div>
                </div>
            </div>
            <div style="padding:32px 28px;">
                <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">${escapeHtml(title)}</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#334155;">${intro}</p>
                ${body}
                <div style="margin-top:28px;font-size:12px;color:#64748b;line-height:1.8;">${footer}</div>
            </div>
            <div style="height:12px;background:#009b7c;"></div>
        </div>
    </div>
`;

const renderProjectOwnerApprovalEmail = ({ request, approveUrl, rejectUrl }) => {
    const target = request.targetSnapshot;
    const requester = request.requestedBySnapshot;

    return {
        subject: `Permintaan Persetujuan Penghapusan Akun - ${target.fullName}`,
        html: renderEmailShell({
            eyebrow: 'URGENT: Perlu Approval',
            title: `Permintaan Persetujuan Penghapusan Akun - ${target.fullName}`,
            intro: 'Anda menerima email ini karena ada permintaan penghapusan akun yang memerlukan persetujuan Anda sebagai Project Owner.',
            body: `
                <div style="background:#fff5f5;border:1px solid #fecaca;border-radius:18px;padding:20px;">
                    <div style="font-size:18px;font-weight:800;color:#b91c1c;margin-bottom:12px;">Detail Akun yang Akan Dihapus</div>
                    <div style="background:#ffffff;border:1px solid #fee2e2;border-radius:16px;padding:0 16px;">
                        ${renderCardRow('Nama Lengkap', target.fullName)}
                        ${renderCardRow('Email', target.email)}
                        ${renderCardRow('Role', request.targetRole)}
                        ${renderCardRow('Diajukan Oleh', requester.fullName)}
                    </div>
                </div>
                <div style="margin-top:20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:20px;">
                    <div style="font-size:14px;font-weight:800;color:#334155;margin-bottom:8px;">Alasan Penghapusan</div>
                    <div style="font-size:14px;line-height:1.8;color:#334155;">${escapeHtml(request.reason)}</div>
                </div>
                <div style="margin-top:20px;background:#fffbeb;border:1px solid #fcd34d;border-radius:18px;padding:20px;">
                    <div style="font-size:14px;font-weight:800;color:#92400e;margin-bottom:8px;">Penting untuk Diperhatikan</div>
                    <ul style="margin:0;padding-left:18px;color:#92400e;font-size:13px;line-height:1.8;">
                        <li>Setelah disetujui, akun akan dihapus secara permanen.</li>
                        <li>Pengguna target akan menerima email pemberitahuan.</li>
                        <li>Super Admin pengaju juga akan menerima status keputusan Anda.</li>
                    </ul>
                </div>
                <div style="margin-top:24px;text-align:center;">
                    <div style="font-size:14px;font-weight:700;color:#475569;margin-bottom:14px;">Silakan pilih tindakan Anda:</div>
                    <a href="${approveUrl}" style="display:inline-block;background:#e11d48;color:#ffffff;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:14px;margin-right:8px;">Setujui Penghapusan</a>
                    <a href="${rejectUrl}" style="display:inline-block;background:#475569;color:#ffffff;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:14px;">Tolak Permintaan</a>
                </div>
            `,
            footer: 'Email ini dikirim otomatis oleh BIEON Smart Green Living Monitoring System. Mohon tidak membalas email ini.',
        }),
        text: `Permintaan persetujuan penghapusan akun ${target.fullName}. Approve: ${approveUrl} Reject: ${rejectUrl}`,
    };
};

const renderRequesterDecisionEmail = ({ request }) => {
    const target = request.targetSnapshot;
    const isApproved = request.status === 'approved';

    return {
        subject: isApproved
            ? `Permintaan penghapusan disetujui - ${target.fullName}`
            : `Permintaan penghapusan ditolak - ${target.fullName}`,
        html: renderEmailShell({
            eyebrow: isApproved ? 'Approved' : 'Rejected',
            title: isApproved
                ? `Penghapusan akun ${target.fullName} telah disetujui`
                : `Penghapusan akun ${target.fullName} ditolak`,
            intro: isApproved
                ? 'Project Owner telah menyetujui permintaan penghapusan akun ini. Sistem sudah mengeksekusi proses penghapusan.'
                : 'Project Owner menolak permintaan penghapusan akun ini. Akun tetap aktif sampai ada keputusan baru.',
            body: `
                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:0 18px;">
                    ${renderCardRow('Nama Akun', target.fullName)}
                    ${renderCardRow('Email', target.email)}
                    ${renderCardRow('Role', request.targetRole)}
                    ${renderCardRow('Status Keputusan', isApproved ? 'Disetujui dan dihapus' : 'Ditolak')}
                </div>
                <div style="margin-top:20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:18px;">
                    <div style="font-size:14px;font-weight:800;color:#334155;margin-bottom:8px;">Catatan Keputusan</div>
                    <div style="font-size:14px;line-height:1.8;color:#334155;">${escapeHtml(request.decisionNote || '-')}</div>
                </div>
            `,
            footer: 'Status ini juga tercermin di dashboard Super Admin BIEON.',
        }),
        text: `${target.fullName} - status keputusan: ${isApproved ? 'disetujui' : 'ditolak'}.`,
    };
};

const renderTargetDeletedEmail = ({ request }) => {
    const target = request.targetSnapshot;

    return {
        subject: `Pemberitahuan Penonaktifan Akun BIEON - ${target.fullName}`,
        html: renderEmailShell({
            eyebrow: 'Account Expired',
            title: 'Pemberitahuan Penonaktifan Akun BIEON',
            intro: `Halo ${escapeHtml(target.fullName)}, akun BIEON Anda telah dihapus dan dinonaktifkan oleh sistem.`,
            body: `
                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:0 18px;">
                    ${renderCardRow('Nama Akun', target.fullName)}
                    ${renderCardRow('Email', target.email)}
                    ${renderCardRow('Role', request.targetRole)}
                    ${renderCardRow('Status', 'Akun dihapus / expired')}
                </div>
                <div style="margin-top:20px;background:#fff5f5;border:1px solid #fecaca;border-radius:18px;padding:18px;">
                    <div style="font-size:14px;font-weight:800;color:#b91c1c;margin-bottom:8px;">Informasi Tambahan</div>
                    <div style="font-size:14px;line-height:1.8;color:#7f1d1d;">Jika Anda merasa keputusan ini tidak sesuai, silakan hubungi tim BIEON atau Project Owner untuk klarifikasi lebih lanjut.</div>
                </div>
            `,
            footer: 'Email ini dikirim otomatis oleh sistem BIEON, Harap tidak membalas',
        }),
        text: `Akun BIEON ${target.fullName} telah dihapus / expired.`,
    };
};

module.exports = {
    renderProjectOwnerApprovalEmail,
    renderRequesterDecisionEmail,
    renderTargetDeletedEmail,
};
