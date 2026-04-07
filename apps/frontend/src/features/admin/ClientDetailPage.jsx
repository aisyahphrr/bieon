import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function ClientDetailPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-emerald-100">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Halaman Detail Pelanggan</h1>
        <p className="text-emerald-600 font-semibold mb-8 italic">"Dalam Pengembangan"</p>
        <p className="text-gray-500 mb-10 leading-relaxed text-sm">
          Kami sedang menyiapkan desain terbaik untuk memudahkan pemantauan detail pelanggan Anda secara mendalam. Pantau terus update selanjutnya!
        </p>
        <button
          onClick={() => onNavigate && onNavigate('admin')}
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#009b7c] hover:bg-[#008268] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Admin</span>
        </button>
      </div>
    </div>
  );
}
