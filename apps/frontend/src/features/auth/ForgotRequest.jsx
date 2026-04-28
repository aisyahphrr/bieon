import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotRequest() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!identifier) return setError('Email atau nomor telepon wajib diisi');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengirim permintaan');
      }

      // always show generic message and navigate to verify step
      setInfo('Jika akun terdaftar, OTP telah dikirim. Silakan cek email atau WhatsApp Anda.');
      const encoded = encodeURIComponent(identifier);
      navigate(`/forgot/verify?identifier=${encoded}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Gagal mengirim permintaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Lupa Password</h2>
        <p className="text-sm text-gray-600 mb-4">Masukkan email atau nomor telepon yang terdaftar. Kami akan mengirim OTP ke email/WA jika akun terdaftar.</p>

        {error && <div className="mb-3 text-red-600">{error}</div>}
        {info && <div className="mb-3 text-green-600">{info}</div>}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium mb-2">Email atau No. Telepon (+62...)</label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
            placeholder="contoh: user@example.com atau +628123..."
          />

          <div className="flex items-center gap-2">
            <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded">
              {loading ? 'Mengirim...' : 'Kirim OTP'}
            </button>
            <button type="button" onClick={() => navigate('/login')} className="text-sm text-gray-600 underline">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
