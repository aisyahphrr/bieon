import React, { useState } from 'react';

const CalendarIcon = () => (
    <svg className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
    </svg>
);

const CheckBadgeIcon = () => (
    <svg width="100" height="100" viewBox="0 0 24 24" fill="#00B482" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-md">
        <path d="M12 1L14.7 3.51L18.33 3.55L19.5 7L22.61 8.89L21.6 12.33L23.68 15.24L20.65 17.51L19.98 21.05L16.48 20.62L13.1 23L10.05 20.89L6.46 21.02L5.43 17.58L2.24 15.54L4.04 12.3L2.83 9.02L6.14 7L7.02 3.61L10.63 3.91L12 1Z" />
        <path d="M10.5 15.5L7 12L8.41 10.59L10.5 12.67L15.59 7.58L17 9L10.5 15.5Z" fill="white" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const FlagId = () => (
    <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-sm flex-shrink-0 border border-gray-200">
        <rect width="20" height="7" fill="#EE0000" />
        <rect y="7" width="20" height="7" fill="#FFFFFF" />
    </svg>
)

const Setup = ({ onNavigate }) => {
    const [step, setStep] = useState(1);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [modalCheckboxChecked, setModalCheckboxChecked] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

    const handleScrollTerms = (e) => {
        const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 2;
        if (bottom && !hasScrolledToBottom) {
            setHasScrolledToBottom(true);
        }
    };

    const openTermsModal = (e) => {
        e.preventDefault();
        if (!isTermsAccepted) {
            setShowTermsModal(true);
            setModalCheckboxChecked(false);
            setHasScrolledToBottom(false);
        } else {
            setIsTermsAccepted(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex font-sans">

            {/* Left Pane - Setup Form */}
            <div className="flex-1 flex flex-col px-6 md:px-16 py-10 overflow-y-auto">
                {/* Logo */}
                <div className="mb-14">
                    <img src="/logo_bieon.png" alt="BIEON" className="h-[30px] object-contain" />
                </div>

                <div className="w-full max-w-md mx-auto">
                    {/* Stepper */}
                    {/* Aligned to the center context somewhat */}
                    <div className="flex items-center ml-4 md:ml-12 max-w-[280px] mb-12">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === 1 ? 'bg-[#7fc78d] text-white' : 'bg-[#b8dfc1] text-transparent'}`}>{step === 1 ? '1' : ''}</div>
                        <div className="h-[1px] flex-1 bg-gray-300 mx-2"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === 2 ? 'bg-[#7fc78d] text-white' : 'bg-[#b8dfc1] text-transparent'}`}>{step === 2 ? '2' : ''}</div>
                        <div className="h-[1px] flex-1 bg-gray-300 mx-2"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === 3 ? 'bg-[#7fc78d] text-white' : 'bg-[#b8dfc1] text-transparent'}`}>{step === 3 ? '3' : ''}</div>
                    </div>

                    {/* Form Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {step === 1 && (
                            <>
                                <h1 className="text-[22px] md:text-2xl font-bold text-[#111827] mb-1">Halo! Selamat datang di BIEON</h1>
                                <p className="text-[13px] font-bold text-gray-600 mb-8 tracking-tight">Sebelum mulai memonitor rumahmu, yuk lengkapi data berikut!</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-bold text-[#111827]">First</label>
                                        <input type="text" placeholder="Asri" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#00B482] focus:ring-1 focus:ring-[#00B482] transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-bold text-[#111827]">Last</label>
                                        <input type="text" placeholder="Aisah" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#00B482] focus:ring-1 focus:ring-[#00B482] transition-colors" />
                                    </div>
                                </div>

                                <div className="mb-4 space-y-2">
                                    <label className="block text-[13px] font-bold text-[#111827]">Username</label>
                                    <input type="text" placeholder="asrisarassufi" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#00B482] focus:ring-1 focus:ring-[#00B482] transition-colors" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-bold text-[#111827]">Phone no</label>
                                        <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#00B482] focus-within:ring-1 focus-within:ring-[#00B482] transition-all bg-white">
                                            <div className="bg-[#FAFBFB] flex items-center gap-1.5 px-3 border-r border-gray-200 text-[13px] text-gray-600">
                                                <FlagId />
                                                +62 <ChevronDownIcon /> {/* Reusing chevron but static here intentionally for mock */}
                                                <svg className="w-3 h-3 text-gray-400 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </div>
                                            <input type="text" placeholder="812345678" className="flex-1 w-full px-3 py-3 text-[13px] text-gray-700 focus:outline-none placeholder-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-bold text-[#111827]">Date of birth</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-10 text-[13px] text-gray-700 focus:outline-none focus:border-[#00B482] focus:ring-1 focus:ring-[#00B482] transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-10"
                                            />
                                            <CalendarIcon />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-10 space-y-2">
                                    <label className="block text-[13px] font-bold text-[#111827]">Address</label>
                                    <input type="text" placeholder="Masukkan Alamat Lengkap disini" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#00B482] focus:ring-1 focus:ring-[#00B482] transition-colors" />
                                </div>

                                <div className="flex items-center gap-3 mb-10 pl-1">
                                    <input
                                        type="checkbox"
                                        checked={isTermsAccepted}
                                        onChange={openTermsModal}
                                        className="w-[18px] h-[18px] rounded-sm border-gray-300 text-[#00B482] focus:ring-[#00B482] cursor-pointer"
                                    />
                                    <span onClick={openTermsModal} className="text-[12px] font-medium text-[#111827] cursor-pointer hover:underline">
                                        I have read and accept BIEON's Terms and Conditions
                                    </span>
                                </div>

                                <div className="flex justify-center md:justify-start">
                                    <button
                                        disabled={!isTermsAccepted}
                                        onClick={() => setStep(2)}
                                        className={`w-[200px] md:mx-auto font-bold py-3 px-6 rounded-lg text-sm transition-colors flex justify-center items-center ${isTermsAccepted ? 'bg-[#009b7c] hover:bg-[#008268] text-white' : 'bg-[#009b7c]/50 text-white cursor-not-allowed'}`}>
                                        Selanjutnya
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h1 className="text-[22px] md:text-2xl font-bold text-[#111827] mb-1">Hubungkan Rumah Pintarmu 🔌</h1>
                                <p className="text-[13px] font-bold text-gray-600 mb-10 tracking-tight leading-relaxed max-w-[340px]">
                                    Masukkan ID perangkat BIEON dan atur tarif listrik untuk mulai memantau pengeluaranmu
                                </p>

                                <div className="space-y-6 mb-12">
                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-bold text-[#111827]">Nama Sistem / Rumah</label>
                                        <input type="text" placeholder='misal "Rumah Utama" atau "Kontrakan"' className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#00B482] focus:ring-1 focus:ring-[#00B482] transition-colors" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-bold text-[#111827]">ID BIEON</label>
                                        <input type="text" placeholder="ID ini bisa dilihat di belakang perangkat Master BIEON kamu." className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#00B482] focus:ring-1 focus:ring-[#00B482] transition-colors" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-[13px] font-bold text-[#111827]">Pilih Golongan Tarif PLN</label>
                                        <div className="relative">
                                            <select className="w-full appearance-none bg-[#F8FAFC] border border-gray-200 rounded-lg px-4 py-3.5 text-[13px] text-gray-500 focus:outline-none focus:border-[#00B482] focus:ring-1 focus:ring-[#00B482] transition-colors cursor-pointer">
                                                <option>Pilih Tarif Listrik</option>
                                                <option>R1 - 450 VA (Subsidi)</option>
                                                <option>R1 - 900 VA (Subsidi)</option>
                                                <option>R1M - 900 VA (Non-Subsidi)</option>
                                                <option>R1 - 1300 VA</option>
                                                <option>R1 - 2200 VA</option>
                                                <option>R2 - 3500 s.d 5500 VA</option>
                                                <option>R3 - 6600 VA ke atas</option>
                                            </select>
                                            <ChevronDownIcon />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 max-w-sm ml-4 md:ml-10">
                                    <button onClick={() => setStep(1)} className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 font-bold py-3 px-6 rounded-lg text-sm transition-colors flex justify-center items-center">
                                        Kembali
                                    </button>
                                    <button onClick={() => setStep(3)} className="flex-1 bg-[#009b7c] hover:bg-[#008268] text-white font-bold py-3 px-6 rounded-lg text-sm transition-colors flex justify-center items-center">
                                        Selanjutnya
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col items-center justify-center text-center py-6 mt-4">
                                <CheckBadgeIcon />

                                <h1 className="text-[22px] md:text-2xl font-bold text-[#111827] mt-8 mb-2">
                                    Semua Sudah Siap! <span className="inline-block transform origin-bottom hover:rotate-12 transition-transform">🎉</span>
                                </h1>

                                <p className="text-[13px] text-gray-600 max-w-[340px] leading-relaxed mx-auto mb-10 font-medium">
                                    Selamat, sistem BIEON berhasil terhubung. Yuk, mulai pantau efisiensi energi dan kesehatan lingkungan rumahmu sekarang.
                                </p>

                                <button onClick={() => onNavigate && onNavigate('dashboard')} className="bg-[#009b7c] hover:bg-[#008268] text-white font-bold py-3 px-10 rounded-lg text-[13px] transition-all transform hover:scale-105 shadow-sm">
                                    Masuk ke Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Terms Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-8 pt-8 pb-4 border-b border-gray-100">
                            <h2 className="text-[22px] font-bold text-[#009b7c] mb-3">Terms and Conditions</h2>
                            <h3 className="text-[15px] font-bold text-[#111827]">Your Agreement</h3>
                        </div>

                        {/* Modal Body / Scrollable */}
                        <div
                            onScroll={handleScrollTerms}
                            className="px-8 py-5 overflow-y-auto flex-1 custom-scrollbar text-[13.5px] text-gray-500 leading-relaxed pr-6"
                        >
                            <p className="mb-2">Last Revised: December 16, 2013</p>
                            <p className="mb-4">Welcome to www.lorem-ipsum.info. This site is provided as a service to our visitors and may be used for informational purposes only. Because the Terms and Conditions contain legal obligations, please read them carefully.</p>

                            <h4 className="font-semibold text-gray-700 mb-1 mt-6">1. YOUR AGREEMENT</h4>
                            <p className="mb-4">By using this Site, you agree to be bound by, and to comply with, these Terms and Conditions. If you do not agree to these Terms and Conditions, please do not use this site.</p>
                            <p className="mb-4">PLEASE NOTE: We reserve the right, at our sole discretion, to change, modify or otherwise alter these Terms and Conditions at any time. Unless otherwise indicated, amendments will become effective immediately. Please review these Terms and Conditions periodically. Your continued use of the Site following the posting of changes and/or modifications will constitute your acceptance of the revised Terms and Conditions and the reasonableness of these standards for notice of changes. For your information, this page was last updated as of the date at the top of these terms and conditions.</p>

                            <h4 className="font-semibold text-gray-700 mb-1 mt-6">2. PRIVACY</h4>
                            <p className="mb-4">Please review our Privacy Policy, which also governs your visit to this Site, to understand our practices.</p>

                            <h4 className="font-semibold text-gray-700 mb-1 mt-6">3. LINKED SITES</h4>
                            <p className="mb-4">This Site may contain links to other independent third-party Web sites ("Linked Sites"). These Linked Sites are provided solely as a convenience to our visitors. Such Linked Sites are not under our control, and we are not responsible for and does not endorse the content of such Linked Sites, including any information or materials contained on such Linked Sites.</p>
                            <p className="mb-4 pt-8">You will need to make your own independent judgment regarding your interaction with these Linked Sites. Keep scrolling to finish reading the agreement.</p>
                            <p className="mb-4 pt-32 pb-4 text-center">End of Terms and Conditions.</p>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 rounded-b-xl">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={modalCheckboxChecked}
                                    onChange={(e) => setModalCheckboxChecked(e.target.checked)}
                                    disabled={!hasScrolledToBottom}
                                    className="w-[18px] h-[18px] rounded-sm border-gray-300 text-[#009b7c] focus:ring-[#009b7c] disabled:opacity-50 transition-colors"
                                />
                                <span className={`text-[13px] font-bold transition-colors ${hasScrolledToBottom ? 'text-[#111827] group-hover:text-[#009b7c]' : 'text-gray-400'}`}>
                                    I confirm that I have read and accept the terms and conditions.
                                </span>
                            </label>

                            <div className="flex gap-2 shrink-0 mt-4 sm:mt-0">
                                <button
                                    onClick={() => setShowTermsModal(false)}
                                    className="px-6 py-2.5 text-[#009b7c] font-bold text-[13.5px] bg-transparent hover:bg-[#009b7c]/10 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!modalCheckboxChecked || !hasScrolledToBottom}
                                    onClick={() => {
                                        setIsTermsAccepted(true);
                                        setShowTermsModal(false);
                                    }}
                                    className={`px-8 py-2.5 rounded-lg font-bold text-[13.5px] transition-all ${modalCheckboxChecked && hasScrolledToBottom
                                        ? 'bg-[#009b7c] hover:bg-[#008268] text-white shadow-sm'
                                        : 'bg-[#009b7c]/40 text-white cursor-not-allowed'
                                        }`}
                                >
                                    Accept
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Right Pane - Image Cover */}
            <div className="hidden lg:block w-[45%] xl:w-[50%] p-4 pl-0">
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative shadow-md">
                    {/* Fallback mockup image link from high-quality source representing greenhouse technology */}
                    <img
                        src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=1200"
                        alt="Greenhouse Monitoring Tech"
                        className="w-full h-full object-cover object-center"
                    />
                    {/* Subtle gradient overlay to make it pop like the mockup */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent mix-blend-overlay"></div>
                </div>
            </div>

        </div>
    );
};

export default Setup;
