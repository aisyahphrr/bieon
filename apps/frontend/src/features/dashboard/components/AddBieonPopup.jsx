import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AddBieonPopup({ isOpen, onClose, onSuccess, userId }) {
  const { t } = useTranslation();
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
          totalHubs: 3, 
          userId: userId
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || t('homeowner_qc.add_bieon.error_failed'));
      }

      if (onSuccess) onSuccess(data.system);
      handleClose();
      // Using a silent success or we could add a toast. Alert is okay for now as requested or replace with visual.
      // But user didn't ask to remove alert, just translate.
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

  const modalContent = (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-300 border border-eco/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{t('homeowner_qc.add_bieon.title')}</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">{t('homeowner_qc.add_bieon.subtitle')}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold animate-in shake duration-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">
              {t('homeowner_qc.add_bieon.label_id')} <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={bieonId}
              onChange={(e) => setBieonId(e.target.value.toUpperCase())}
              placeholder={t('homeowner_qc.add_bieon.placeholder_id')}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-eco focus:bg-white font-bold text-slate-700 transition-all shadow-sm"
            />
            <p className="text-[11px] text-slate-400 mt-2 font-medium italic pl-1">
              {t('homeowner_qc.add_bieon.demo_tip')}
            </p>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all text-sm"
            >
              {t('homeowner_qc.add_bieon.btn_cancel')}
            </button>
            <button
              disabled={isLoading || !bieonId.trim()}
              type="submit"
              className="flex-1 px-6 py-4 bg-eco hover:bg-eco/90 text-white rounded-2xl font-bold shadow-lg shadow-eco/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('homeowner_qc.add_bieon.btn_submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

