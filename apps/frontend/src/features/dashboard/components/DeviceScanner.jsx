import React, { useState } from 'react';
import { X, QrCode, ScanLine, Camera } from 'lucide-react';

export default function DeviceScanner({ onCancel, onScanSuccess }) {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
      <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <QrCode className="w-5 h-5" /> Scan Perangkat
        </h3>
        <button onClick={onCancel} className="p-1 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6">
        {/* Mock Camera View */}
        <div className="relative aspect-square bg-gray-100 rounded-2xl mb-6 overflow-hidden flex flex-col items-center justify-center border-2 border-gray-200 border-dashed">
          {isScanning ? (
            <>
              <ScanLine className="w-12 h-12 text-emerald-500 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-gray-500 text-center px-4">
                Arahkan kamera ke QR Code<br />di perangkat BIEON Anda
              </p>
              {/* Scanning Animation Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
            </>
          ) : (
            <>
              <Camera className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">Kamera dinonaktifkan</p>
            </>
          )}
        </div>

        <div className="text-center mb-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">- ATAU -</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Input Serial Number Manual</label>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Contoh: BIEON-DEV-001"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm font-semibold transition-all uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={!manualCode.trim()}
            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Proses Perangkat
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(300px); }
        }
      `}} />
    </div>
  );
}
