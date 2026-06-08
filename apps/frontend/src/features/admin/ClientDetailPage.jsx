import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SuperAdminLayout } from './SuperAdminLayout';
import { useTranslation } from 'react-i18next';

export default function ClientDetailPage({ onNavigate }) {
  const { t } = useTranslation();
  return (
    <SuperAdminLayout activeMenu="Homeowner" onNavigate={onNavigate} title={t('tooltip.view_detail')}>
      <div className="flex flex-col items-center justify-center p-8 h-full min-h-[500px]">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-bieon-eco/20">
          <div className="w-20 h-20 bg-bieon-eco/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-10 h-10 border-4 border-bieon-eco border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('client_detail.page_title')}</h1>
          <p className="text-bieon-eco font-semibold mb-8 italic">"{t('client_detail.in_development')}"</p>
          <p className="text-gray-500 mb-10 leading-relaxed text-sm">
            {t('client_detail.in_development_desc')}
          </p>
          <button
            onClick={() => onNavigate && onNavigate('admin-pelanggan')}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-bieon-eco to-bieon-sense hover:brightness-105 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-bieon-eco/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('client_detail.back_to_management')}</span>
          </button>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
