import React from 'react';
import { Mail, ShieldCheck, CheckCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function EmailApprovalTemplate({ type = 'welcome', data = {} }) {
  const { t } = useTranslation();
  const isDeletion = type === 'delete';

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden font-sans">
      {/* Email Header */}
      <div className="bg-gradient-to-r from-bieon-eco to-bieon-sense p-6 text-white text-center">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black tracking-tight uppercase">{t('admin_homeowner.email_preview.header')}</h3>
      </div>

      {/* Email Body */}
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-3 text-gray-400">
           <Mail className="w-4 h-4" />
           <span className="text-xs font-bold uppercase tracking-wider">{t('admin_homeowner.email_preview.to', { name: data.fullName || t('admin_homeowner.email_preview.salutation_default', 'Pelanggan'), email: data.email || 'email@contoh.com' })}</span>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-gray-800">
            {isDeletion ? t('admin_homeowner.email_preview.title_delete') : t('admin_homeowner.email_preview.title')}
          </h2>
          
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            {t('admin_homeowner.email_preview.salutation', { name: data.fullName || 'Pengguna' })}
            <br /><br />
            {isDeletion ? t('admin_homeowner.email_preview.body_delete') : t('admin_homeowner.email_preview.body')}
          </p>

          <div className="bg-white border border-gray-100 p-4 rounded-xl space-y-3 shadow-sm">
             <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                <span className="text-gray-400 font-bold uppercase">{t('admin_homeowner.email_preview.lbl_id')}</span>
                <span className="text-gray-800 font-black">{data.id || 'HO-XXXX'}</span>
             </div>
             <div className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                <span className="text-gray-400 font-bold uppercase">{t('admin_homeowner.email_preview.lbl_status')}</span>
                <span className={`font-black ${isDeletion ? 'text-red-500' : 'text-bieon-eco'}`}>
                    {isDeletion ? t('admin_homeowner.email_preview.status_deleted') : t('admin_homeowner.email_preview.status_active')}
                </span>
             </div>
             {!isDeletion && (
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-bold uppercase">{t('admin_homeowner.email_preview.lbl_username')}</span>
                    <span className="text-gray-800 font-black">@{data.username || 'username'}</span>
                </div>
             )}
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
             <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
             <p className="text-[10px] text-blue-700 font-bold leading-normal italic">
                {isDeletion 
                  ? t('admin_homeowner.email_preview.footer_note_delete')
                  : t('admin_homeowner.email_preview.footer_note')}
             </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-bieon-eco to-bieon-sense rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{t('admin_homeowner.email_preview.footer_system')}</span>
            </div>
            <img src="/logo_bieon.png" alt="BIEON" className="h-4 opacity-50 grayscale" />
        </div>
      </div>
    </div>
  );
}
