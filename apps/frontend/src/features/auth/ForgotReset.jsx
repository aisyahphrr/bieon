import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ForgotReset(){
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token') || '';

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!pw || !pw2) return setError(t('auth.forgot.err_all_fields_required', 'Isi semua field'));
    if (pw !== pw2) return setError(t('auth.forgot.err_passwords_dont_match', 'Password tidak cocok'));
    setLoading(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: token, newPassword: pw })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t('auth.forgot.err_reset_failed', 'Gagal mereset password'));
      // success
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || t('auth.forgot.err_reset_failed', 'Gagal mereset password'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">{t('auth.forgot.reset_title', 'Reset Password')}</h2>
        <p className="text-sm text-gray-600 mb-4">{t('auth.forgot.reset_subtitle', 'Masukkan password baru Anda.')}</p>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="password" value={pw} onChange={(e)=>setPw(e.target.value)} placeholder={t('auth.forgot.ph_new_password', 'Password baru')} className="w-full border rounded px-3 py-2 mb-3" />
          <input type="password" value={pw2} onChange={(e)=>setPw2(e.target.value)} placeholder={t('auth.forgot.ph_confirm_password', 'Konfirmasi password')} className="w-full border rounded px-3 py-2 mb-4" />
          <div className="flex items-center gap-2">
            <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded">{t('auth.forgot.btn_reset', 'Reset')}</button>
            <button type="button" onClick={()=>navigate('/login')} className="text-sm text-gray-600">{t('auth.forgot.btn_cancel', 'Batal')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
