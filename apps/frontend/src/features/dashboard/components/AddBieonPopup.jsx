import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export default function AddBieonPopup({ isOpen, onClose, onSuccess, userId }) {
  const [bieonId, setBieonId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bieonId.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hubs/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bieonId: bieonId.trim(),
          totalHubs: 3, // Default consistent with kendali.jsx
          userId: userId
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal menambahkan BIEON ID');
      }

      if (onSuccess) onSuccess(data.system);
      handleClose();
      alert("Sistem BIEON berhasil ditambahkan!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setBieonId('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[400] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tambah BIEON</h2>
            <p className="text-sm text-gray-600 mt-1 font-medium">Masukkan ID BIEON Anda</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ID BIEON <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={bieonId}
              onChange={(e) => setBieonId(e.target.value.toUpperCase())}
              placeholder="Contoh: BIEON-001"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
            />
            <p className="text-xs text-gray-500 mt-2 font-medium">
              Demo: Coba BIEON-001, BIEON-002, BIEON-003, atau BIEON-004
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
            <button
              disabled={isLoading || !bieonId.trim()}
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
