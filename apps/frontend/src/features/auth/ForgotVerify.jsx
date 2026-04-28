import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ForgotVerify() {
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
    if (!otp) return setError('OTP wajib diisi');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP tidak valid');

      const resetToken = data.resetToken;
      const tokenEncoded = encodeURIComponent(resetToken);
      navigate(`/forgot/reset?token=${tokenEncoded}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Gagal memverifikasi OTP');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      const res = await fetch('/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      if (!res.ok) throw new Error('Gagal mengirim ulang OTP');
      setInfo('OTP terkirim ulang. Silakan cek email/WA Anda.');
    } catch (err) {
      setError(err.message || 'Gagal mengirim ulang OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-2">Verifikasi OTP</h2>
        <p className="text-sm text-gray-600 mb-4">Masukkan kode OTP yang telah dikirim ke <strong>{masked(identifier)}</strong></p>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        {info && <div className="mb-3 text-green-600">{info}</div>}

        <form onSubmit={handleVerify}>
          <input value={otp} onChange={(e)=>setOtp(e.target.value)} placeholder="Masukkan OTP" className="w-full border rounded px-3 py-2 mb-4" />
          <div className="flex items-center gap-2">
            <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded">Verifikasi</button>
            <button type="button" onClick={handleResend} className="text-sm text-gray-600 underline">Kirim ulang OTP</button>
            <button type="button" onClick={()=>navigate('/forgot')} className="text-sm text-gray-600">Ubah alamat</button>
          </div>
        </form>
      </div>
    </div>
  );
}
