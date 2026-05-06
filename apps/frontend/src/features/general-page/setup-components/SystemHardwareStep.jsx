import React from 'react';
import { ChevronDown } from 'lucide-react';

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
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-[22px] md:text-2xl font-bold text-[#111827] mb-1">Hubungkan Rumah Pintarmu 🔌</h1>
            <p className="text-[13px] font-bold text-gray-600 mb-10 tracking-tight leading-relaxed max-w-[340px]">
                Masukkan ID perangkat BIEON dan atur tarif listrik untuk mulai memantau pengeluaranmu
            </p>

            <div className="space-y-6 mb-12">
                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700">Nama Sistem / Rumah</label>
                    <input type="text" placeholder='misal "Rumah Utama" atau "Kontrakan"' value={formData.systemName} onChange={(e) => setFormData({...formData, systemName: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all font-medium shadow-sm" />
                </div>

                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700">ID BIEON</label>
                    <input type="text" placeholder="ID ini bisa dilihat di belakang perangkat Master BIEON kamu." value={formData.bieonId} onChange={(e) => setFormData({...formData, bieonId: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all font-medium shadow-sm" />
                </div>

                <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-700">Pilih Golongan Tarif PLN</label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowPlnDropdown(!showPlnDropdown)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 border rounded-xl text-sm font-medium transition-all shadow-sm ${showPlnDropdown ? 'border-[#009b7c] ring-4 ring-[#009b7c]/10 bg-white' : 'border-slate-200 bg-slate-50/50 hover:bg-white'}`}
                        >
                            <span className={selectedPln ? 'text-slate-800' : 'text-slate-400 text-[13px]'}>
                                {selectedPln || 'Pilih Tarif Listrik'}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-all ${showPlnDropdown ? 'rotate-180 text-[#009b7c]' : 'text-slate-400'}`} />
                        </button>

                        {showPlnDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowPlnDropdown(false)}></div>
                                <div className="absolute top-full mb-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200 max-h-[260px] overflow-y-auto custom-scrollbar">
                                    <div className="px-4 pb-2">
                                        <input
                                            type="text"
                                            value={plnSearch}
                                            onChange={(e) => setPlnSearch(e.target.value)}
                                            placeholder="Cari golongan (mis. R1, B-2, PJU...)"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-2 focus:ring-[#009b7c]/10 transition-all"
                                        />
                                    </div>

                                    {filteredPlnCategories.length === 0 && (
                                        <div className="px-5 py-4 text-[12px] text-slate-500 font-semibold">
                                            Tidak ada hasil untuk “{plnSearch}”
                                        </div>
                                    )}

                                    {PLN_SEGMENT_ORDER.filter((seg) => groupedPlnCategories[seg]?.length).map((seg) => (
                                        <div key={seg} className="pb-1">
                                            <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {seg}
                                            </div>
                                            {groupedPlnCategories[seg].map((cat) => (
                                                <button
                                                    key={cat.key || cat.label}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPln(cat.label);
                                                        setShowPlnDropdown(false);
                                                        setPlnSearch('');
                                                    }}
                                                    className={`w-full text-left px-5 py-3 text-[13px] transition-colors ${selectedPln === cat.label ? 'text-[#009b7c] bg-emerald-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    ))}

                                    {Object.keys(groupedPlnCategories).filter((seg) => !PLN_SEGMENT_ORDER.includes(seg)).map((seg) => (
                                        <div key={seg} className="pb-1">
                                            <div className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {seg}
                                            </div>
                                            {groupedPlnCategories[seg].map((cat) => (
                                                <button
                                                    key={cat.key || cat.label}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPln(cat.label);
                                                        setShowPlnDropdown(false);
                                                        setPlnSearch('');
                                                    }}
                                                    className={`w-full text-left px-5 py-3 text-[13px] transition-colors ${selectedPln === cat.label ? 'text-[#009b7c] bg-emerald-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 max-w-sm mx-auto md:ml-0">
                <button onClick={onBack} className="flex-1 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-xl text-[14px] transition-all flex justify-center items-center shadow-sm">
                    Kembali
                </button>
                <button onClick={onNext} className="flex-1 bg-[#009b7c] hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl text-[14px] transition-all flex justify-center items-center shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5">
                    Selanjutnya
                </button>
            </div>
        </div>
    );
};

export default SystemHardwareStep;
