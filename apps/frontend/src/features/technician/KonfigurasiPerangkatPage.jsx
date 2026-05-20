import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Radio, AlertCircle, Info, ChevronRight } from 'lucide-react';

export function KonfigurasiPerangkatPage({ onNavigate, triggerToast }) {
  const { t } = useTranslation();
  const [inputToken, setInputToken] = useState("");
  const [tokenError, setTokenError] = useState("");
  const navigate = useNavigate();

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    if (!inputToken) {
      setTokenError(t('tech_device_control.verification.error_empty'));
      return;
    }

    try {
      const technicianId = localStorage.getItem('userId'); // Konsisten dengan TechnicianProfilePage
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
          triggerToast(t('tech_device_control.notifications.access_granted'));
        }
        
        // Redirect fisik ke halaman kendali sistem homeowner
        setTimeout(() => {
          navigate('/kendali');
        }, 1500);
      } else {
        setTokenError(data.message || t('tech_device_control.notifications.invalid_token'));
        if (triggerToast) {
          triggerToast(t('tech_device_control.notifications.process_failed'), "error");
        }
      }
    } catch (error) {
      console.error("error verify token:", error);
      setTokenError(t('tech_device_control.notifications.technical_error'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-eco to-sense p-8 text-white relative">
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <ShieldCheck className="w-10 h-10" />
              {t('tech_device_control.verification.title')}
            </h1>
            <p className="text-white/70 font-medium">{t('tech_device_control.verification.subtitle')}</p>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Radio className="w-32 h-32 rotate-12" />
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-6">
              <div className="bg-sense/10 border border-sense/20 rounded-2xl p-6 flex items-start gap-4">
                <Info className="w-6 h-6 text-sense shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-sense mb-1">{t('tech_device_control.verification.instr_title')}</h3>
                  <p className="text-sm text-sense/90 leading-relaxed">
                    <Trans i18nKey="tech_device_control.verification.instr_text">
                      Minta <strong>kode akses 6-karakter</strong> dari homeowner. Kode ini hanya berlaku sekali pakai dan akan kedaluwarsa dalam 5 menit setelah dibuat.
                    </Trans>
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyToken} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    {t('tech_device_control.verification.input_placeholder')}
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      maxLength={6}
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                      placeholder={t('tech_device_control.verification.placeholder_example')}
                      className={`w-full px-6 py-5 bg-gray-50 border-2 rounded-2xl text-2xl font-mono font-black tracking-[0.5rem] focus:outline-none transition-all text-center ${
                        tokenError 
                        ? 'border-red-300 focus:border-red-500 text-red-600 bg-red-50' 
                        : 'border-gray-200 focus:border-eco focus:bg-white group-hover:border-gray-300'
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
                  className="w-full py-5 bg-eco text-white rounded-2xl font-black text-lg shadow-xl shadow-eco/30 hover:bg-eco/90 hover:shadow-eco/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-8"
                >
                  <ShieldCheck className="w-6 h-6" />
                  {t('tech_device_control.verification.btn_submit')}
                </button>
              </form>
            </div>

            <div className="w-full md:w-72 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-eco" />
                {t('tech_device_control.security_rules.title')}
              </h4>
              <ul className="space-y-4 text-xs font-medium text-gray-600">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-eco mt-1.5 shrink-0" />
                  {t('tech_device_control.security_rules.rule_1')}
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-eco mt-1.5 shrink-0" />
                  {t('tech_device_control.security_rules.rule_2')}
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-eco mt-1.5 shrink-0" />
                  {t('tech_device_control.security_rules.rule_3')}
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-eco mt-1.5 shrink-0" />
                  {t('tech_device_control.security_rules.rule_4')}
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-eco mt-1.5 shrink-0" />
                  {t('tech_device_control.security_rules.rule_5')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
