import React from 'react';
import { Mail, ShieldCheck, CheckCircle, Info } from 'lucide-react';

export function EmailApprovalTemplate({ type = 'welcome', data = {} }) {
  const isDeletion = type === 'delete';

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden font-sans">
      {/* Email Header */}
      <div className="bg-[#009b7c] p-6 text-white text-center">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black tracking-tight uppercase">BIEON Official Notification</h3>
      </div>

      {/* Email Body */}
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-3 text-gray-400">
           <Mail className="w-4 h-4" />
           <span className="text-xs font-bold uppercase tracking-wider">Kepada: {data.fullName || 'Pelanggan'} ({data.email || 'email@contoh.com'})</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-800">
            {isDeletion ? 'Pemberitahuan Penonaktifan Akun' : 'Selamat Datang di Ekosistem BIEON'}
          </h2>
          
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            Halo {data.fullName || 'Pengguna'},
            <br /><br />
            {isDeletion ? (
              <>Kami memberitahukan bahwa permintaan penghapusan/penonaktifan akun BIEON Anda telah diproses. Berikut adalah detail konfirmasi:</>
            ) : (
              <>Akun Homeowner BIEON Anda telah berhasil dibuat oleh Super Admin. Anda kini dapat memantau penggunaan energi dan kesehatan air hunian Anda secara real-time.</>
            )}
          </p>

          <div className="bg-white border border-gray-100 p-4 rounded-xl space-y-3 shadow-sm">
             <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                <span className="text-gray-400 font-bold uppercase">ID Akun</span>
                <span className="text-gray-800 font-black">{data.id || 'HO-XXXX'}</span>
             </div>
             <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                <span className="text-gray-400 font-bold uppercase">Status Akun</span>
                <span className={`font-black ${isDeletion ? 'text-red-500' : 'text-[#009b7c]'}`}>
                    {isDeletion ? 'Dihapus/Nonaktif' : 'Aktif'}
                </span>
             </div>
             {!isDeletion && (
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-bold uppercase">Username</span>
                    <span className="text-gray-800 font-black">@{data.username || 'username'}</span>
                </div>
             )}
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
             <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
             <p className="text-[10px] text-blue-700 font-bold leading-normal italic">
                {isDeletion 
                  ? 'Data Anda akan disimpan dalam sistem arsip kami selama 30 hari sebelum dihapus secara permanen sesuai kebijakan privasi BIEON.'
                  : 'Gunakan username di atas untuk login pertama kali. Kami menyarankan Anda segera mengubah password pada menu Pengaturan Akun.'}
             </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#009b7c] rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Automated System Email</span>
            </div>
            <img src="/logo_bieon.png" alt="BIEON" className="h-4 opacity-50 grayscale" />
        </div>
      </div>
    </div>
  );
}
