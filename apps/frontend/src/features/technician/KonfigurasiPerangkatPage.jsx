import React, { useState } from 'react';
import { ShieldCheck, Radio, AlertCircle, Info, ChevronRight } from 'lucide-react';

export function KonfigurasiPerangkatPage({ onNavigate, triggerToast }) {
  const [inputToken, setInputToken] = useState("");
  const [tokenError, setTokenError] = useState("");

  const handleVerifyToken = (e) => {
    e.preventDefault();
    if (!inputToken) {
      setTokenError("Silakan masukkan kode akses.");
      return;
    }

    const activeToken = localStorage.getItem('bieon_active_token');
    
    // For demo/prototype purposes, we verify against localStorage
    if (inputToken === activeToken && activeToken !== null) {
      localStorage.setItem('bieon_tech_access', 'true');
      localStorage.removeItem('bieon_active_token'); // One-time use
      
      if (triggerToast) {
        triggerToast("Akses Diterima! Mengalihkan ke sistem Homeowner...");
      }
      
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('kendali');
        }
      }, 1500);
    } else {
      setTokenError("Token tidak valid atau sudah kedaluwarsa. Mohon minta token baru dari homeowner.");
      if (triggerToast) {
        triggerToast("Gagal memproses token!", "error");
      }
    }
  };

  return (
    <div className="py-8 w-full max-w-4xl mx-auto px-4">
      {/* Page Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Konfigurasi Perangkat</h1>
        <p className="text-gray-500 mt-2 font-medium">Masuk ke sistem Homeowner untuk pendaftaran perangkat baru</p>
      </div>

      {/* Info Alert Box - Premium Styled */}
      <div className="bg-gradient-to-r from-[#FFFDF4] to-[#FFF9E6] border border-[#FBE6A2] rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-10 shadow-sm">
        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
          <Info className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-base mb-1">Penting: Akses Teknisi Terbatas</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Sesuai kebijakan keamanan BIEON, teknisi memerlukan **Token Akses** dari Homeowner untuk masuk. 
            Dalam mode ini, Anda **HANYA** diizinkan untuk menambahkan perangkat baru tanpa hak akses konfigurasi mendalam atau kontrol operasional.
          </p>
        </div>
      </div>

      {/* Token Verification Portal */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#009270] via-emerald-400 to-[#009270] bg-[length:200%_auto] animate-gradient-x"></div>
        
        <div className="p-8 sm:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-10 border border-emerald-100/50 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="w-12 h-12 text-emerald-600" />
            </div>

            <form onSubmit={handleVerifyToken} className="w-full max-w-md space-y-8">
              <div className="space-y-4">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2rem]">Kode Akses Homeowner</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="XXXXXX"
                    value={inputToken}
                    onChange={(e) => {
                      setInputToken(e.target.value.toUpperCase());
                      setTokenError("");
                    }}
                    className={`w-full text-center text-5xl font-black tracking-[1rem] py-8 border-3 rounded-[2rem] focus:outline-none transition-all duration-300 ${
                      tokenError 
                        ? 'border-red-200 bg-red-50 text-red-600 shake' 
                        : 'border-gray-100 bg-gray-50/50 text-emerald-700 focus:border-emerald-500 focus:bg-white focus:shadow-xl'
                    }`}
                  />
                  {inputToken && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-6">
                      <Radio className="w-6 h-6 text-emerald-500 animate-pulse" />
                    </div>
                  )}
                </div>
                {tokenError && (
                  <div className="flex items-center justify-center gap-2 text-red-500 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm font-bold">{tokenError}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="group relative w-full py-6 bg-gray-900 overflow-hidden rounded-[1.5rem] font-bold text-white transition-all hover:bg-black active:scale-[0.98] shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-center gap-3 text-lg">
                  <span>Verifikasi & Ambil Akses</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </form>

            <div className="mt-12 flex items-center gap-6 py-4 px-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 text-left font-medium max-w-[200px]">
                Keamanan enkripsi berlapis BIEON aktif memantau sesi ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}
