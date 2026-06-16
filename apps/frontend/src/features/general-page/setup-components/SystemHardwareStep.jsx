import React from 'react';
import { ChevronDown, Home, Cpu, Zap, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SystemHardwareStep = ({
    formData,
    setFormData,
    selectedPln,
    setSelectedPln,
    showPlnDropdown,
    setShowPlnDropdown,
    plnSearch,
    setPlnSearch,
    filteredPlnCategories,
    groupedPlnCategories,
    PLN_SEGMENT_ORDER,
    onBack,
    onNext
}) => {
    const { t } = useTranslation();

    const makeSegmentKey = (label) => String(label || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-[22px] md:text-2xl font-black text-slate-800 mb-1 tracking-tight">{t('auth.setup.step2.title')}</h1>
            <p className="text-[13px] font-bold text-slate-500 mb-6 tracking-tight leading-relaxed w-full">
                {t('auth.setup.step2.subtitle')}
            </p>

            <div className="space-y-5 mb-6">
                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700 pl-1">{t('auth.setup.step2.label_system_name')}</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009b7c] transition-colors">
                            <Home className="w-4 h-4" />
                        </div>
                        <input 
                            type="text" 
                            placeholder={t('auth.setup.step2.placeholder_system_name')} 
                            value={formData.systemName} 
                            onChange={(e) => setFormData({...formData, systemName: e.target.value})} 
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all font-semibold shadow-sm" 
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700 pl-1">{t('auth.setup.step2.label_bieon_id')}</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009b7c] transition-colors">
                            <Cpu className="w-4 h-4" />
                        </div>
                        <input 
                            type="text" 
                            placeholder={t('auth.setup.step2.placeholder_bieon_id')} 
                            value={formData.bieonId} 
                            onChange={(e) => setFormData({...formData, bieonId: e.target.value.toUpperCase()})} 
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all font-semibold shadow-sm" 
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700 pl-1">{t('auth.setup.step2.label_pln')}</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009b7c] transition-colors z-10 pointer-events-none">
                            <Zap className="w-4 h-4" />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPlnDropdown(!showPlnDropdown)}
                            className={`w-full flex items-center justify-between pl-11 pr-4 py-3.5 border rounded-xl text-sm font-semibold transition-all shadow-sm ${showPlnDropdown ? 'border-[#009b7c] ring-4 ring-[#009b7c]/10 bg-white' : 'border-slate-200 bg-slate-50/50 hover:bg-white group-hover:border-[#009b7c]'}`}
                        >
                            <span className={selectedPln ? 'text-slate-800' : 'text-slate-400 text-[13px] font-semibold'}>
                                {selectedPln || t('auth.setup.step2.placeholder_pln')}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-all ${showPlnDropdown ? 'rotate-180 text-[#009b7c]' : 'text-slate-400'}`} />
                        </button>

                        {showPlnDropdown && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setShowPlnDropdown(false)}></div>
                                <div className="absolute top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl py-3 z-30 animate-in fade-in zoom-in-95 duration-200 max-h-[300px] overflow-hidden flex flex-col">
                                    <div className="px-4 pb-3">
                                        <div className="relative group/search">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within/search:text-emerald-500 transition-colors" />
                                            <input
                                                type="text"
                                                value={plnSearch}
                                                onChange={(e) => setPlnSearch(e.target.value)}
                                                placeholder={t('auth.setup.step2.search_pln')}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-[12px] font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
                                        {filteredPlnCategories.length === 0 && (
                                            <div className="px-5 py-8 text-center">
                                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <Search className="w-4 h-4 text-slate-300" />
                                                </div>
                                                <p className="text-[12px] text-slate-500 font-bold">
                                                    {t('auth.setup.step2.search_empty', { query: plnSearch })}
                                                </p>
                                            </div>
                                        )}

                                        {PLN_SEGMENT_ORDER.filter((seg) => groupedPlnCategories[seg]?.length).map((seg) => {
                                            const segKey = makeSegmentKey(seg);
                                            return (
                                                <div key={seg} className="pb-2">
                                                    <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 sticky top-0 z-10">
                                                        {t(`auth.setup.step2.segments.${segKey}`, seg)}
                                                    </div>
                                                    <div className="space-y-0.5 mt-1">
                                                        {groupedPlnCategories[seg].map((cat) => (
                                                            <button
                                                                key={cat.key || cat.label}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedPln(cat.label);
                                                                    setShowPlnDropdown(false);
                                                                    setPlnSearch('');
                                                                }}
                                                                className={`w-full text-left px-4 py-3 text-[13px] transition-all rounded-lg mx-1 w-[calc(100%-8px)] ${selectedPln === cat.label ? 'text-[#009b7c] bg-emerald-50 font-black' : 'text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900'}`}
                                                            >
                                                                {cat.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {Object.keys(groupedPlnCategories).filter((seg) => !PLN_SEGMENT_ORDER.includes(seg)).map((seg) => {
                                            const segKey = makeSegmentKey(seg);
                                            return (
                                                <div key={seg} className="pb-2">
                                                    <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 sticky top-0 z-10">
                                                        {t(`auth.setup.step2.segments.${segKey}`, seg)}
                                                    </div>
                                                    <div className="space-y-0.5 mt-1">
                                                        {groupedPlnCategories[seg].map((cat) => (
                                                            <button
                                                                key={cat.key || cat.label}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedPln(cat.label);
                                                                    setShowPlnDropdown(false);
                                                                    setPlnSearch('');
                                                                }}
                                                                className={`w-full text-left px-4 py-3 text-[13px] transition-all rounded-lg mx-1 w-[calc(100%-8px)] ${selectedPln === cat.label ? 'text-[#009b7c] bg-emerald-50 font-black' : 'text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900'}`}
                                                            >
                                                                {cat.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={onBack} 
                    className="flex-1 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-2xl text-[14px] transition-all flex justify-center items-center gap-2 shadow-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {t('auth.setup.step2.btn_back')}
                </button>
                <button 
                    onClick={onNext} 
                    className="flex-[2] bg-[#009b7c] hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-2xl text-[14px] transition-all flex justify-center items-center gap-2 shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:-translate-y-1"
                >
                    {t('auth.setup.step2.btn_next')}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default SystemHardwareStep;
