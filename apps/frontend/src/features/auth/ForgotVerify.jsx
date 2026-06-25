import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ForgotVerify() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useQuery();
  const identifier = query.get('identifier') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const masked = (id) => {
    if (!id) return '';
    if (id.includes('@')) {
      const parts = id.split('@');
      const name = parts[0];
      const domain = parts[1];
      return name[0] + '***' + '@' + domain.replace(/(.{3}).+/, '$1...');
    }
    // phone
    return id.replace(/(.{4}).+(.{3})/, '$1***$2');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!otp) return setError(t('auth.forgot.err_otp_required', 'OTP wajib diisi'));
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t('auth.forgot.err_otp_invalid', 'OTP tidak valid'));

      const resetToken = data.resetToken;
      const tokenEncoded = encodeURIComponent(resetToken);
      navigate(`/forgot/reset?token=${tokenEncoded}`);
    } catch (err) {
      console.error(err);
      setError(err.message || t('auth.forgot.err_verify_failed', 'Gagal memverifikasi OTP'));
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      if (!res.ok) throw new Error(t('auth.forgot.err_resend_failed', 'Gagal mengirim ulang OTP'));
      setInfo(t('auth.forgot.info_otp_resent', 'OTP terkirim ulang. Silakan cek email/WA Anda.'));
    } catch (err) {
      setError(err.message || t('auth.forgot.err_resend_failed', 'Gagal mengirim ulang OTP'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">{t('auth.forgot.verify_title', 'Verifikasi OTP')}</h2>
        <p className="text-sm text-gray-600 mb-4">{t('auth.forgot.verify_subtitle', 'Masukkan kode OTP yang telah dikirim ke')} <strong>{masked(identifier)}</strong></p>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        {info && <div className="mb-3 text-green-600">{info}</div>}

        <form onSubmit={handleVerify}>
          <input value={otp} onChange={(e)=>setOtp(e.target.value)} placeholder={t('auth.forgot.ph_otp', 'Masukkan OTP')} className="w-full border rounded px-3 py-2 mb-4" />
          <div className="flex items-center gap-2">
            <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded">{t('auth.forgot.btn_verify', 'Verifikasi')}</button>
            <button type="button" onClick={handleResend} className="text-sm text-gray-600 underline">{t('auth.forgot.btn_resend_otp', 'Kirim ulang OTP')}</button>
            <button type="button" onClick={()=>navigate('/forgot')} className="text-sm text-gray-600">{t('auth.forgot.btn_change_address', 'Ubah alamat')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
