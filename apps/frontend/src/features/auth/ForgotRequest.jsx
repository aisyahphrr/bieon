import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ForgotRequest() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!identifier) return setError(t('auth.forgot.err_identifier_required', 'Email atau nomor telepon wajib diisi'));
    setLoading(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || t('auth.forgot.err_request_failed', 'Gagal mengirim permintaan'));
      }

      // always show generic message and navigate to verify step
      setInfo(t('auth.forgot.info_otp_sent', 'Jika akun terdaftar, OTP telah dikirim. Silakan cek email atau WhatsApp Anda.'));
      const encoded = encodeURIComponent(identifier);
      navigate(`/forgot/verify?identifier=${encoded}`);
    } catch (err) {
      console.error(err);
      setError(err.message || t('auth.forgot.err_request_failed', 'Gagal mengirim permintaan'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">{t('auth.forgot.request_title', 'Lupa Password')}</h2>
        <p className="text-sm text-gray-600 mb-4">{t('auth.forgot.request_subtitle', 'Masukkan email atau nomor telepon yang terdaftar. Kami akan mengirim OTP ke email/WA jika akun terdaftar.')}</p>

        {error && <div className="mb-3 text-red-600">{error}</div>}
        {info && <div className="mb-3 text-green-600">{info}</div>}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium mb-2">{t('auth.forgot.lbl_identifier', 'Email atau No. Telepon (+62...)')}</label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
            placeholder={t('auth.forgot.ph_identifier', 'contoh: user@example.com atau +628123...')}
          />

          <div className="flex items-center gap-2">
            <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded">
              {loading ? t('auth.forgot.btn_sending', 'Mengirim...') : t('auth.forgot.btn_send_otp', 'Kirim OTP')}
            </button>
            <button type="button" onClick={() => navigate('/login')} className="text-sm text-gray-600 underline">
              {t('auth.forgot.btn_cancel', 'Batal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
