import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Mail, ShieldCheck, XCircle } from 'lucide-react';

const apiBaseUrl = import.meta.env.VITE_API_URL || '';

const formatDateTime = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short',
    });
};

const toneClasses = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
};

export default function DeleteApprovalPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const initialAction = (searchParams.get('action') || '').toLowerCase();

    const [requestData, setRequestData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [resultMessage, setResultMessage] = useState('');
    const autoActionDoneRef = useRef(false);

    const statusTone = useMemo(() => {
        if (!requestData?.status) return 'pending';
        return requestData.status;
    }, [requestData]);

    const fetchRequest = async () => {
        if (!token) {
            setError('Token approval tidak ditemukan.');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`${apiBaseUrl}/api/admin/account-deletion-requests/${token}`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Gagal mengambil data approval.');
            }

            setRequestData(result.data);
            setError('');
        } catch (fetchError) {
            setError(fetchError.message || 'Terjadi kesalahan saat mengambil data approval.');
        } finally {
            setIsLoading(false);
        }
    };

    const submitDecision = async (action) => {
        if (!token || !action || isSubmitting) return;

        try {
            setIsSubmitting(true);
            setError('');

            const response = await fetch(`${apiBaseUrl}/api/admin/account-deletion-requests/${token}/decision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Gagal memproses keputusan.');
            }

            setRequestData(result.data);
            setResultMessage(result.message || 'Keputusan berhasil diproses.');
        } catch (submitError) {
            setError(submitError.message || 'Terjadi kesalahan saat memproses keputusan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchRequest();
    }, [token]);

    useEffect(() => {
        if (
            !requestData ||
            requestData.status !== 'pending' ||
            !['approve', 'reject'].includes(initialAction) ||
            autoActionDoneRef.current
        ) {
            return;
        }

        autoActionDoneRef.current = true;
        submitDecision(initialAction);
    }, [initialAction, requestData]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 w-full max-w-lg text-center">
                    <Loader2 className="w-10 h-10 mx-auto text-[#009b7c] animate-spin" />
                    <p className="mt-4 text-base font-bold text-slate-800">Memuat permintaan persetujuan...</p>
                </div>
            </div>
        );
    }

    if (error && !requestData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="bg-white border border-red-200 rounded-3xl shadow-xl p-8 w-full max-w-lg text-center">
                    <XCircle className="w-10 h-10 mx-auto text-red-500" />
                    <p className="mt-4 text-base font-bold text-slate-900">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-[28px] shadow-xl overflow-hidden">
                <div className="px-8 py-7 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#009b7c]/10 text-[#009b7c] flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">BIEON Approval Center</p>
                                <h1 className="text-2xl font-black text-slate-900">Persetujuan Penghapusan Akun</h1>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full border text-xs font-bold ${toneClasses[statusTone] || toneClasses.pending}`}>
                            {requestData?.status === 'approved' ? 'Disetujui' : requestData?.status === 'rejected' ? 'Ditolak' : 'Menunggu Keputusan'}
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {resultMessage && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                            {resultMessage}
                        </div>
                    )}

                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <p className="text-lg font-bold text-slate-900">Dear Project Owner,</p>
                        <p className="text-sm leading-7 text-slate-600">
                            Anda menerima permintaan penghapusan akun yang diajukan oleh Super Admin. Silakan tinjau detail di bawah ini sebelum mengambil keputusan.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-red-200 bg-red-50/70 p-6">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertCircle className="w-6 h-6" />
                            <h2 className="text-lg font-bold">Detail Akun yang Akan Dihapus</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div className="rounded-2xl bg-white border border-red-100 p-4">
                                <p className="text-xs font-bold uppercase text-slate-400">Nama Lengkap</p>
                                <p className="mt-2 font-bold text-slate-900">{requestData?.targetSnapshot?.fullName || '-'}</p>
                            </div>
                            <div className="rounded-2xl bg-white border border-red-100 p-4">
                                <p className="text-xs font-bold uppercase text-slate-400">Email</p>
                                <p className="mt-2 font-bold text-slate-900 break-all">{requestData?.targetSnapshot?.email || '-'}</p>
                            </div>
                            <div className="rounded-2xl bg-white border border-red-100 p-4">
                                <p className="text-xs font-bold uppercase text-slate-400">Role</p>
                                <p className="mt-2 font-bold text-slate-900">{requestData?.targetRole || '-'}</p>
                            </div>
                            <div className="rounded-2xl bg-white border border-red-100 p-4">
                                <p className="text-xs font-bold uppercase text-slate-400">Diajukan Oleh</p>
                                <p className="mt-2 font-bold text-slate-900">{requestData?.requestedBySnapshot?.fullName || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Mail className="w-5 h-5 text-slate-500" />
                            <h3 className="text-sm font-bold text-slate-700">Alasan Penghapusan</h3>
                        </div>
                        <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">{requestData?.reason || '-'}</p>
                    </div>

                    <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6">
                        <h3 className="text-sm font-bold text-amber-800 mb-2">Penting untuk Diperhatikan</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-amber-800">
                            <li>Jika disetujui, akun akan dihapus permanen dari sistem.</li>
                            <li>Pengguna target dan Super Admin pengaju akan menerima email hasil keputusan.</li>
                            <li>Jika ditolak, akun tetap aktif dan status penolakan akan terlihat di dashboard Super Admin.</li>
                        </ul>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-3">Ringkasan Status</h3>
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs font-bold uppercase text-slate-400">Diajukan Pada</p>
                                <p className="mt-1 font-semibold text-slate-800">{formatDateTime(requestData?.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase text-slate-400">Diputuskan Pada</p>
                                <p className="mt-1 font-semibold text-slate-800">{formatDateTime(requestData?.decidedAt)}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-xs font-bold uppercase text-slate-400">Catatan Keputusan</p>
                                <p className="mt-1 font-semibold text-slate-800">{requestData?.decisionNote || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {requestData?.status === 'pending' && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => submitDecision('approve')}
                                disabled={isSubmitting}
                                className="py-4 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting && initialAction === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Setujui Penghapusan
                            </button>
                            <button
                                type="button"
                                onClick={() => submitDecision('reject')}
                                disabled={isSubmitting}
                                className="py-4 rounded-2xl bg-slate-600 text-white font-bold hover:bg-slate-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting && initialAction === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                Tolak Permintaan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
