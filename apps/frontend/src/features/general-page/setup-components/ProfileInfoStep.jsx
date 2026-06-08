import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, User, Phone, MapPin, AtSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FlagId = () => (
    <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-sm flex-shrink-0 border border-gray-200">
        <rect width="20" height="7" fill="#EE0000" />
        <rect y="7" width="20" height="7" fill="#FFFFFF" />
    </svg>
);

const ProfileInfoStep = ({
    formData,
    setFormData,
    selectedDate,
    setSelectedDate,
    showCalendar,
    setShowCalendar,
    monthNames,
    viewMonth,
    viewYear,
    setViewMonth,
    setViewYear,
    showYearDropdown,
    setShowYearDropdown,
    calendarDays,
    changeMonth,
    formatDate,
    isTermsAccepted,
    openTermsModal,
    onNext
}) => {
    const { t, i18n } = useTranslation();

    const localizedMonths = i18n.language?.startsWith('id')
        ? ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const localFormatDate = (dateObj) => {
        const { day, month, year } = dateObj;
        return `${day} ${localizedMonths[month]} ${year}`;
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-[22px] md:text-2xl font-black text-slate-800 mb-1 tracking-tight">{t('auth.setup.step1.title')}</h1>
            <p className="text-[13px] font-bold text-slate-500 mb-8 tracking-tight leading-relaxed w-full">{t('auth.setup.step1.subtitle')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700 pl-1">{t('auth.setup.step1.label_first_name')}</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009b7c] transition-colors">
                            <User className="w-4 h-4" />
                        </div>
                        <input 
                            type="text" 
                            placeholder={t('auth.setup.step1.placeholder_first_name')} 
                            value={formData.firstName} 
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[13px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all font-semibold shadow-sm" 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700 pl-1">{t('auth.setup.step1.label_last_name')}</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009b7c] transition-colors">
                            <User className="w-4 h-4" />
                        </div>
                        <input 
                            type="text" 
                            placeholder={t('auth.setup.step1.placeholder_last_name')} 
                            value={formData.lastName} 
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[13px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all font-semibold shadow-sm" 
                        />
                    </div>
                </div>
            </div>

            <div className="mb-4 space-y-2">
                <label className="block text-[13px] font-bold text-slate-700 pl-1">{t('auth.setup.step1.label_username')}</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009b7c] transition-colors">
                        <AtSign className="w-4 h-4" />
                    </div>
                    <input 
                        type="text" 
                        placeholder={t('auth.setup.step1.placeholder_username')} 
                        value={formData.username} 
                        onChange={(e) => setFormData({...formData, username: e.target.value})} 
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[13px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all font-semibold shadow-sm" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700 pl-1">{t('auth.setup.step1.label_phone')}</label>
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#009b7c] focus-within:ring-4 focus-within:ring-[#009b7c]/10 transition-all bg-slate-50/50 focus-within:bg-white shadow-sm">
                        <div className="bg-slate-100/80 flex items-center gap-1.5 px-3 border-r border-slate-200 text-[13px] text-slate-600 font-bold">
                            <FlagId />
                            +62
                        </div>
                        <input 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder={t('auth.setup.step1.placeholder_phone')} 
                            value={formData.phone} 
                            onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} 
                            className="flex-1 w-full bg-transparent px-4 py-3.5 text-[13px] text-slate-800 focus:outline-none placeholder-slate-400 font-semibold" 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700 pl-1">{t('auth.setup.step1.label_dob')}</label>
                    <div className="relative group">
                        <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 border rounded-xl text-sm font-semibold transition-all shadow-sm ${showCalendar ? 'border-[#009b7c] ring-4 ring-[#009b7c]/10 bg-white' : 'border-slate-200 bg-slate-50/50 hover:bg-white group-hover:border-[#009b7c]'}`}
                        >
                            <span className={selectedDate ? 'text-slate-800' : 'text-slate-400 text-[13px] font-semibold'}>
                                {selectedDate || t('auth.setup.step1.placeholder_dob')}
                            </span>
                            <Calendar className={`w-4 h-4 text-slate-400 transition-colors ${showCalendar ? 'text-[#009b7c]' : ''}`} />
                        </button>

                        {showCalendar && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowCalendar(false)}></div>
                                <div className="absolute top-full right-0 sm:left-0 mt-2 w-[300px] sm:w-[320px] bg-white border border-slate-100 rounded-2xl shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95 duration-200">
                                    {/* Calendar Header */}
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-800 tracking-tight">{localizedMonths[viewMonth]}</span>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowYearDropdown(!showYearDropdown)}
                                                    className="flex items-center gap-1 text-[11px] font-black text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5"
                                                >
                                                    {viewYear} <ChevronDown className={`w-3 h-3 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
                                                </button>

                                                {showYearDropdown && (
                                                    <>
                                                        <div className="fixed inset-0 z-[45]" onClick={() => setShowYearDropdown(false)}></div>
                                                        <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-[50] max-h-[160px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                                                            {Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                                <button
                                                                    key={year}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setViewYear(year);
                                                                        setShowYearDropdown(false);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${viewYear === year ? 'text-emerald-600 bg-emerald-50 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                                                >
                                                                    {year}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => changeMonth('prev')} className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                                <ChevronLeft className="w-4 h-4 text-slate-600" />
                                            </button>
                                            <button type="button" onClick={() => changeMonth('next')} className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                                <ChevronRight className="w-4 h-4 text-slate-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Week Days */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                            <span key={d} className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest">
                                                {t('calendar.days.' + d.toLowerCase(), d)}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Days Grid */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {calendarDays.map((d, i) => {
                                            const isSelected = selectedDate === localFormatDate(d);
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedDate(localFormatDate(d));
                                                        setShowCalendar(false);
                                                        setFormData({...formData, dob: localFormatDate(d)});
                                                    }}
                                                    className={`h-9 w-full flex items-center justify-center rounded-lg text-xs font-bold transition-all
                                                        ${!d.current ? 'text-slate-300' : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-600'}
                                                        ${isSelected ? 'bg-[#009b7c] text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600' : ''}
                                                    `}
                                                >
                                                    {d.day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-8 space-y-2">
                <label className="block text-[13px] font-bold text-slate-700 pl-1">{t('auth.setup.step1.label_address')}</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009b7c] transition-colors">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <input 
                        type="text" 
                        placeholder={t('auth.setup.step1.placeholder_address')} 
                        value={formData.address} 
                        onChange={(e) => setFormData({...formData, address: e.target.value})} 
                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-[13px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all shadow-sm font-semibold" 
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 mb-10 pl-1 group cursor-pointer" onClick={openTermsModal}>
                <div className={`w-[20px] h-[20px] rounded-md border-2 ${isTermsAccepted ? 'bg-[#009b7c] border-[#009b7c]' : 'bg-white border-slate-300 group-hover:border-[#009b7c]'} flex items-center justify-center transition-all shadow-sm`}>
                    {isTermsAccepted && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-900 cursor-pointer transition-colors leading-tight">
                    {t('auth.setup.step1.terms_checkbox')}
                </span>
            </div>

            <div className="flex justify-center">
                <button
                    disabled={!isTermsAccepted}
                    onClick={onNext}
                    className={`w-full font-bold py-4 px-8 rounded-2xl text-[14px] transition-all flex justify-center items-center gap-2 ${isTermsAccepted ? 'bg-[#009b7c] hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    {t('auth.setup.step1.btn_next')}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ProfileInfoStep;
