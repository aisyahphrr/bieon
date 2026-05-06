import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

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
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-[22px] md:text-2xl font-bold text-[#111827] mb-1">Halo! Selamat datang di BIEON</h1>
            <p className="text-[13px] font-bold text-gray-600 mb-8 tracking-tight">Sebelum mulai memonitor rumahmu, yuk lengkapi data berikut!</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700">First Name</label>
                    <input type="text" placeholder="Asri" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-[13px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all font-medium shadow-sm" />
                </div>
                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700">Last Name</label>
                    <input type="text" placeholder="Aisah" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-[13px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all font-medium shadow-sm" />
                </div>
            </div>

            <div className="mb-4 space-y-2">
                <label className="block text-[13px] font-bold text-slate-700">Username</label>
                <input type="text" placeholder="asrisarassufi" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-[13px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all font-medium shadow-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700">Phone no</label>
                    <div className="flex border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#009b7c] focus-within:ring-4 focus-within:ring-[#009b7c]/10 transition-all bg-slate-50/50 focus-within:bg-white shadow-sm">
                        <div className="bg-slate-100 flex items-center gap-1.5 px-3 border-r border-slate-200 text-[13px] text-slate-600 font-medium">
                            <FlagId />
                            +62
                            <svg className="w-3 h-3 text-slate-400 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <input type="text" placeholder="812345678" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="flex-1 w-full bg-transparent px-4 py-3.5 text-[13px] text-slate-800 focus:outline-none placeholder-slate-400 font-medium" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700">Date of birth</label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowCalendar(!showCalendar)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 border rounded-xl text-sm font-medium transition-all shadow-sm ${showCalendar ? 'border-[#009b7c] ring-4 ring-[#009b7c]/10 bg-white' : 'border-slate-200 bg-slate-50/50 hover:bg-white'}`}
                        >
                            <span className={selectedDate ? 'text-slate-800' : 'text-slate-400 text-[13px]'}>
                                {selectedDate || 'Select Date of Birth'}
                            </span>
                            <Calendar className={`w-4 h-4 text-slate-400 transition-colors ${showCalendar ? 'text-[#009b7c]' : ''}`} />
                        </button>

                        {showCalendar && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowCalendar(false)}></div>
                                <div className="absolute top-full mt-2 w-full sm:w-[320px] bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95 duration-200">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{monthNames[viewMonth]}</span>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowYearDropdown(!showYearDropdown)}
                                                    className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors bg-transparent outline-none py-0.5"
                                                >
                                                    {viewYear} <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
                                                </button>

                                                {showYearDropdown && (
                                                    <>
                                                        <div className="fixed inset-0 z-[45]" onClick={() => setShowYearDropdown(false)}></div>
                                                        <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[50] max-h-[160px] overflow-y-auto scrollbar-hide animate-in fade-in slide-in-from-top-2 duration-200">
                                                            {Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                                <button
                                                                    key={year}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setViewYear(year);
                                                                        setShowYearDropdown(false);
                                                                    }}
                                                                    className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${viewYear === year ? 'text-emerald-600 bg-emerald-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
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
                                            <button type="button" onClick={() => changeMonth('prev')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                <ChevronLeft className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <button type="button" onClick={() => changeMonth('next')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                <ChevronRight className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Week Days */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                            <span key={d} className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-wider">{d}</span>
                                        ))}
                                    </div>

                                    {/* Days Grid */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {calendarDays.map((d, i) => {
                                            const isSelected = selectedDate === formatDate(d);
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedDate(formatDate(d));
                                                        setShowCalendar(false);
                                                        setFormData({...formData, dob: formatDate(d)});
                                                    }}
                                                    className={`h-9 w-full flex items-center justify-center rounded-lg text-xs transition-all
                                                        ${!d.current ? 'text-gray-300' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'}
                                                        ${isSelected ? 'bg-emerald-500 text-white font-bold hover:bg-emerald-600 hover:text-white' : ''}
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

            <div className="mb-10 space-y-2">
                <label className="block text-[13px] font-bold text-slate-700">Address</label>
                <input type="text" placeholder="Masukkan Alamat Lengkap disini" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-[13px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all shadow-sm font-medium" />
            </div>

            <div className="flex items-center gap-3 mb-10 pl-1 group cursor-pointer" onClick={openTermsModal}>
                <div className={`w-[18px] h-[18px] rounded-[4px] border ${isTermsAccepted ? 'bg-[#009b7c] border-[#009b7c]' : 'bg-white border-slate-300 group-hover:border-[#009b7c]'} flex items-center justify-center transition-colors shadow-sm`}>
                    {isTermsAccepted && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <span className="text-[13px] font-bold text-slate-700 group-hover:text-[#009b7c] cursor-pointer transition-colors">
                    I have read and accept BIEON's Terms and Conditions
                </span>
            </div>

            <div className="flex justify-center md:justify-start">
                <button
                    disabled={!isTermsAccepted}
                    onClick={onNext}
                    className={`w-[200px] md:mx-auto font-bold py-3.5 px-6 rounded-xl text-[14px] transition-all flex justify-center items-center ${isTermsAccepted ? 'bg-[#009b7c] hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    Selanjutnya
                </button>
            </div>
        </div>
    );
};

export default ProfileInfoStep;
