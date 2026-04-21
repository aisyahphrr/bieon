import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Radio, AlertCircle, Info, ChevronRight } from 'lucide-react';

export function KonfigurasiPerangkatPage({ onNavigate, triggerToast }) {
  const [inputToken, setInputToken] = useState("");
  const [tokenError, setTokenError] = useState("");
  const navigate = useNavigate();

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    if (!inputToken) {
      setTokenError("Silakan masukkan kode akses.");
      return;
    }

    try {
      const technicianId = localStorage.getItem('bieon_user_id'); // Pastikan ID teknisi tersimpan saat login
      const response = await fetch('/api/technician-access/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: inputToken,
          technicianId: technicianId
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Simpan data sesi keamanan
        localStorage.setItem('bieon_tech_access', 'true');
        localStorage.setItem('bieon_active_homeowner_id', data.session.homeownerId);
        localStorage.setItem('bieon_tech_session_id', data.session._id);
        localStorage.setItem('bieon_tech_access_expiry', (Date.now() + 30 * 60 * 1000).toString());
        
        if (data.homeownerName) {
          localStorage.setItem('bieon_active_homeowner_name', data.homeownerName);
        }
        
        if (triggerToast) {
          triggerToast("Akses Diterima! Mengalihkan ke sistem Homeowner...");
        }
        
        // Redirect fisik ke halaman kendali sistem homeowner
        setTimeout(() => {
          navigate('/kendali');
        }, 1500);
      } else {
        setTokenError(data.message || "Token tidak valid atau sudah kedaluwarsa.");
        if (triggerToast) {
          triggerToast("Gagal memproses token!", "error");
        }
      }
    } catch (error) {
      console.error("error verify token:", error);
      setTokenError("Terjadi kesalahan teknis. Pastikan server aktif.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-[#009b7c] to-[#235C50] p-8 text-white relative">
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <ShieldCheck className="w-10 h-10" />
              Verifikasi Akses
            </h1>
            <p className="text-emerald-100 font-medium">BIEON Technician Management System</p>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Radio className="w-32 h-32 rotate-12" />
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">Cara Mengambil Akses</h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Minta **kode akses 6-karakter** dari homeowner. Kode ini hanya berlaku sekali pakai dan akan kedaluwarsa dalam 5 menit setelah dibuat.
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyToken} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Masukkan Kode Akses Alphanumeric
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      maxLength={6}
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                      placeholder="CONTOH: 4X29B1"
                      className={`w-full px-6 py-5 bg-gray-50 border-2 rounded-2xl text-2xl font-mono font-black tracking-[0.5rem] focus:outline-none transition-all text-center ${
                        tokenError 
                        ? 'border-red-300 focus:border-red-500 text-red-600 bg-red-50' 
                        : 'border-gray-200 focus:border-[#009b7c] focus:bg-white group-hover:border-gray-300'
                      }`}
                    />
                    {tokenError && (
                      <div className="absolute top-full left-0 mt-2 flex items-center gap-2 text-red-600 font-bold text-sm animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-4 h-4" />
                        {tokenError}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-[#009b7c] text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 hover:bg-[#007b63] hover:shadow-emerald-300 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-8"
                >
                  <ShieldCheck className="w-6 h-6" />
                  VERIFIKASI & AMBIL AKSES
                </button>
              </form>
            </div>

            <div className="w-full md:w-72 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#009b7c]" />
                Keamanan & Batasan
              </h4>
              <ul className="space-y-4 text-xs font-medium text-gray-600">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#009b7c] mt-1.5 shrink-0" />
                  Durasi akses maksimal 30 menit per sesi.
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#009b7c] mt-1.5 shrink-0" />
                  Akses hanya berlaku untuk halaman Kendali Perangkat.
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#009b7c] mt-1.5 shrink-0" />
                  Anda hanya diizinkan menambahkan perangkat baru.
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#009b7c] mt-1.5 shrink-0" />
                  Fitur edit, hapus, dan jadwal otomatis dinonaktifkan.
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#009b7c] mt-1.5 shrink-0" />
                  Laporan hasil konfigurasi wajib dikirim di akhir sesi.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
