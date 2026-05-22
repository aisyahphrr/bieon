import React from 'react';
import { CheckCircle2, User, Home, Zap, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SuccessStep = ({ loading, error, handleRegister, formData, selectedPln }) => {
    const { t } = useTranslation();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center text-center mb-5">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100 shadow-sm relative">
                    <CheckCircle2 className="w-8 h-8 text-[#009b7c]" />
                    <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
                </div>
                <h1 className="text-[22px] md:text-2xl font-black text-slate-800 mb-1 tracking-tight">{t('auth.setup.step3.title')}</h1>
                <p className="text-[13px] font-bold text-slate-500 tracking-tight leading-relaxed max-w-[300px]">
                    {t('auth.setup.step3.subtitle')}
                </p>
            </div>

            {/* Summary Card */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-[2rem] p-5 mb-6 space-y-4 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <CheckCircle2 className="w-24 h-24 rotate-12" />
                </div>

                <div className="flex items-start gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm text-slate-400">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('auth.setup.step3.card_owner')}</p>
                        <p className="text-[14px] font-black text-slate-800 leading-tight">
                            {formData.firstName} {formData.lastName}
                        </p>
                        <p className="text-[12px] font-bold text-slate-500 mt-1">@{formData.username || 'username'}</p>
                    </div>
                </div>

                <div className="h-px bg-slate-200/60 w-full"></div>

                <div className="flex items-start gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm text-slate-400">
                        <Home className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('auth.setup.step3.card_system')}</p>
                        <p className="text-[14px] font-black text-slate-800 leading-tight">
                            {formData.systemName || "Rumah BIEON Utama"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                ID: {formData.bieonId || "BN-7RRQ-XXXX"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-200/60 w-full"></div>

                <div className="flex items-start gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm text-slate-400">
                        <Zap className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('auth.setup.step3.card_tariff')}</p>
                        <p className="text-[13px] font-black text-slate-800">
                            {selectedPln || t('auth.setup.step3.card_tariff_empty')}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-red-600">{error}</p>
                </div>
            )}

            <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-[#009b7c] hover:bg-emerald-600 disabled:bg-slate-200 text-white font-black py-3.5 px-6 rounded-2xl text-[15px] transition-all flex justify-center items-center gap-3 shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:-translate-y-1 active:scale-95 group"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('auth.setup.step3.btn_loading')}
                    </>
                ) : (
                    <>
                        {t('auth.setup.step3.btn_finish')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
            <p className="text-center mt-4 text-[11px] font-bold text-slate-400">
                {t('auth.setup.step3.security_text')}
            </p>
        </div>
    );
};

export default SuccessStep;
