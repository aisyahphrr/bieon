import React, { useState, useMemo } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarIcon = () => (
    <svg className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
    </svg>
);

const CheckBadgeIcon = () => (
    <div className="relative flex items-center justify-center w-full min-h-[160px] mb-6">
        {/* Background Glows & Particles */}
        <div className="absolute w-40 h-40 bg-emerald-50 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute w-32 h-32 bg-emerald-100/50 rounded-full"></div>

        {/* Floating Decorative Elements (Small Leaves/Dots) */}
        <div className="absolute top-2 right-[35%] w-3 h-3 bg-[#00B482]/30 rounded-full animate-bounce duration-1000"></div>
        <div className="absolute bottom-6 left-[30%] w-2 h-2 bg-[#7fc78d]/40 rounded-full animate-pulse"></div>
        <div className="absolute top-10 left-[35%] w-4 h-6 bg-[#00B482]/10 rounded-full rotate-45 scale-x-75"></div> {/* Mock Leaf */}
        <div className="absolute bottom-10 right-[32%] w-4 h-6 bg-[#00B482]/10 rounded-full -rotate-12 scale-x-75"></div> {/* Mock Leaf */}

        {/* Main Success Card Circle */}
        <div className="relative w-24 h-24 bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(0,180,130,0.3)] border-[6px] border-[#00B482] flex items-center justify-center transform transition-all duration-700 hover:scale-110 group">
            <svg
                width="42"
                height="42"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#00B482] animate-in zoom-in duration-500 delay-300"
            >
                <path
                    d="M5 13L9 17L19 7"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Inner Ring Detail */}
            <div className="absolute inset-1 border-2 border-dashed border-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    </div>
);

const ChevronDownIcon = () => (
    <svg className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-emerald-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const FlagId = () => (
    <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-sm flex-shrink-0 border border-gray-200">
        <rect width="20" height="7" fill="#EE0000" />
        <rect y="7" width="20" height="7" fill="#FFFFFF" />
    </svg>
)

import { useNavigate } from 'react-router-dom';

const Setup = ({ tempData }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        phone: '',
        address: '',
        systemName: '',
        bieonId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [modalCheckboxChecked, setModalCheckboxChecked] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [showPlnDropdown, setShowPlnDropdown] = useState(false);
    const [selectedPln, setSelectedPln] = useState('');
    const [plnOptions, setPlnOptions] = useState([]);

    // Fetch PLN options on mount
    useEffect(() => {
        const fetchPlnOptions = async () => {
            try {
                const response = await fetch('/api/admin/tariffs/public/categories');
                const data = await response.json();
                if (data.success) {
                    setPlnOptions(data.data.map(cat => cat.label));
                }
            } catch (error) {
                console.error('Failed to fetch PLN options:', error);
                // Fallback to basic residential
                setPlnOptions([
                    'R-1/TR - 450 VA (Subsidi)',
                    'R-1/TR - 900 VA (Subsidi)',
                    'R-1M/TR - 900 VA (Non-Subsidi)',
                    'R-1/TR - 1.300 VA',
                    'R-1/TR - 2.200 VA',
                    'R-2/TR - 3.500 VA s.d 5.500 VA',
                    'R-3/TR - 6.600 VA ke atas'
                ]);
            }
        };
        fetchPlnOptions();
    }, []);

    // Calendar States
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [showYearDropdown, setShowYearDropdown] = useState(false);

    // Month Names
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Calendar Generation Logic
    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const days = [];
        // Prev Month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: daysInPrevMonth - i, month: viewMonth - 1, year: viewYear, current: false });
        }
        // Current Month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, month: viewMonth, year: viewYear, current: true });
        }
        // Next Month days (Total 42 for 6 rows)
        const nextDays = 42 - days.length;
        for (let i = 1; i <= nextDays; i++) {
            days.push({ day: i, month: viewMonth + 1, year: viewYear, current: false });
        }
        return days;
    }, [viewMonth, viewYear]);

    const changeMonth = (dir) => {
        if (dir === 'prev') {
            if (viewMonth === 0) {
                setViewMonth(11);
                setViewYear(v => v - 1);
            } else {
                setViewMonth(v => v - 1);
            }
        } else {
            if (viewMonth === 11) {
                setViewMonth(0);
                setViewYear(v => v + 1);
            } else {
                setViewMonth(v => v + 1);
            }
        }
    };

    const formatDate = (dateObj) => {
        const { day, month, year } = dateObj;
        return `${day} ${monthNames[month]} ${year}`;
    };

    const handleRegister = async () => {
        if (!tempData?.email || !tempData?.password) {
            setError('Data email/password hilang. Harap ulangi dari halaman signup.');
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            // 1. Register User
            const registerRes = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: tempData.email,
                    password: tempData.password,
                    fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                    username: formData.username,
                    dateOfBirth: formData.dob,
                    phoneNumber: formData.phone,
                    address: formData.address,
                    systemName: formData.systemName,
                    plnTariff: selectedPln,
                    bieonId: formData.bieonId,
                    role: 'Homeowner' // Default Homeowner
                })
            });
            let registerData;
            if (registerRes.ok) {
                registerData = await registerRes.json();
            } else {
                const errText = await registerRes.text();
                try {
                    const errJson = JSON.parse(errText);
                    throw new Error(errJson.message || 'Gagal mendaftar');
                } catch(e) {
                    throw new Error(errText || 'Gagal mendaftar');
                }
            }

            // 2. Setup Hubs if bieonId is provided
            if (formData.bieonId) {
                const hubRes = await fetch('/api/hubs/setup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bieonId: formData.bieonId,
                        userId: registerData.user.id
                    })
                });
                if (!hubRes.ok) {
                    const hubErr = await hubRes.text();
                    console.error('Gagal setup hubs', hubErr);
                }
            }

            if (navigate) navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
        <div className="min-h-[100dvh] bg-slate-50 flex font-sans relative overflow-hidden selection:bg-[#009b7c] selection:text-white">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-emerald-300/40 rounded-full mix-blend-multiply filter blur-[120px] animate-[pulse_8s_ease-in-out_infinite] z-0 pointer-events-none"></div>

            {/* Left Pane - Setup Form */}
            <div className="flex-1 flex flex-col px-6 md:px-16 py-10 overflow-y-auto relative z-10 bg-white/60 backdrop-blur-xl">
                {/* Logo */}
                <div className="mb-14">
                    <img src="/logo_bieon.png" alt="BIEON" className="h-[30px] object-contain" />
                </div>

                <div className="w-full max-w-md mx-auto">
                    {/* Stepper */}
                    {/* Aligned to the center context somewhat */}
                    <div className="flex items-center ml-4 md:ml-12 max-w-[280px] mb-12">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === 1 ? 'bg-[#009b7c] text-white shadow-[0_0_15px_rgba(0,155,124,0.4)] scale-110' : 'bg-slate-200 text-transparent'}`}>{step === 1 ? '1' : ''}</div>
                        <div className="h-[2px] flex-1 bg-slate-200 mx-2 rounded-full"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === 2 ? 'bg-[#009b7c] text-white shadow-[0_0_15px_rgba(0,155,124,0.4)] scale-110' : 'bg-slate-200 text-transparent'}`}>{step === 2 ? '2' : ''}</div>
                        <div className="h-[2px] flex-1 bg-slate-200 mx-2 rounded-full"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === 3 ? 'bg-[#009b7c] text-white shadow-[0_0_15px_rgba(0,155,124,0.4)] scale-110' : 'bg-slate-200 text-transparent'}`}>{step === 3 ? '3' : ''}</div>
                    </div>

                    {/* Form Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {step === 1 && (
                            <>
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
                                        onClick={() => setStep(2)}
                                        className={`w-[200px] md:mx-auto font-bold py-3.5 px-6 rounded-xl text-[14px] transition-all flex justify-center items-center ${isTermsAccepted ? 'bg-[#009b7c] hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
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
                                                    <div className="absolute top-full mb-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200 max-h-[220px] overflow-y-auto custom-scrollbar">
                                                        {plnOptions.map((pln) => (
                                                            <button
                                                                key={pln}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedPln(pln);
                                                                    setShowPlnDropdown(false);
                                                                }}
                                                                className={`w-full text-left px-5 py-3 text-[13px] transition-colors ${selectedPln === pln ? 'text-[#009b7c] bg-emerald-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                            >
                                                                {pln}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 max-w-sm mx-auto md:ml-0">
                                    <button onClick={() => setStep(1)} className="flex-1 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-xl text-[14px] transition-all flex justify-center items-center shadow-sm">
                                        Kembali
                                    </button>
                                    <button onClick={() => setStep(3)} className="flex-1 bg-[#009b7c] hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl text-[14px] transition-all flex justify-center items-center shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5">
                                        Selanjutnya
                                    </button>
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col items-center justify-center text-center py-10 px-4">
                                <div className="mb-8">
                                    <CheckBadgeIcon />
                                </div>

                                <div className="space-y-4">
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight">
                                        Semua Sudah Siap! <span className="inline-block animate-bounce">🎉</span>
                                    </h1>

                                    <p className="text-[15px] text-gray-500 max-w-[380px] leading-relaxed mx-auto font-medium">
                                        Selamat, sistem <span className="text-[#00B482] font-bold">BIEON</span> berhasil terhubung. Yuk, mulai pantau gaya hidup cerdasmu sekarang!
                                    </p>
                                </div>

                                <div className="mt-12 w-full max-w-[280px]">
                                    <button
                                        onClick={handleRegister}
                                        disabled={loading}
                                        className="group relative w-full overflow-hidden rounded-xl bg-[#009b7c] p-4 text-sm font-bold text-white transition-all hover:bg-[#008268] disabled:bg-[#009b7c]/50 active:scale-95 shadow-lg shadow-emerald-200"
                                    >
                                        <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]"></div>
                                        <span className="relative flex items-center justify-center gap-2">
                                            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </button>
                                    {error && (
                                        <div className="mt-4 text-center text-[13px] font-bold text-red-500 bg-red-50 py-2.5 rounded-xl border border-red-100">
                                            {error}
                                        </div>
                                    )}
                                </div>
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
                            <h2 className="text-[22px] font-bold text-[#009b7c] mb-1">SYARAT DAN KETENTUAN PENGGUNAAN</h2>
                            <h3 className="text-[15px] font-bold text-[#111827]">Layanan BIEON-Smart Green Living Monitoring System</h3>
                        </div>

                        {/* Modal Body / Scrollable */}
                        <div
                            onScroll={handleScrollTerms}
                            className="px-8 py-5 overflow-y-auto flex-1 custom-scrollbar text-[13.5px] text-gray-600 leading-relaxed pr-6"
                        >
                            <p className="mb-6 text-[#009b7c] font-semibold">Date: 6 April 2026</p>
                            
                            <h4 className="font-bold text-gray-800 mb-1 mt-6">1. Pendahuluan</h4>
                            <p className="mb-4">Selamat datang di BIEON Smart Green Living Monitoring System. Syarat dan Ketentuan ini adalah hukum antara Anda (selanjutnya disebut "pengguna") dan PT Matra Kreasi Mandiri (selanjutnya disebut "perusahaan") selaku pengembang dan penyedia sistem BIEON.</p>
                            <p className="mb-4">Dengan mengakses dashboard web BIEON, mengunduh, dan menggunakan perangkat keras BIEON yang terpasang di properti Anda, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh isi syarat dan ketentuan ini. Jika Anda tidak setuju, Anda dilarang menggunakan layanan kami ini.</p>

                            <h4 className="font-bold text-gray-800 mb-2 mt-6">2. Definisi</h4>
                            <ul className="list-disc pl-5 mb-4 space-y-2">
                                <li><strong>BIEON:</strong> sistem integrasi Internet of Things (IoT) yang mencakup perangkat keras (Master, Hub-Node, Smart Device) dan perangkat lunak (Dashboard Web) untuk monitoring berbagai aspek.</li>
                                <li><strong>Pengguna (Homeowner):</strong> Individu sah yang memiliki akses ke dashboard BIEON untuk memantau dan mengontrol perangkat di rumah mereka.</li>
                                <li><strong>Teknisi:</strong> staf internal Perusahaan yang berwenang melakukan diagnostik, konfigurasi jarak jauh, dan penanganan keluhan pada sistem pengguna.</li>
                            </ul>

                            <h4 className="font-bold text-gray-800 mb-2 mt-6">3. Penggunaan Layanan dan Keamanan Akun</h4>
                            <ol className="list-[lower-alpha] pl-5 mb-4 space-y-2">
                                <li><strong>Akses akun:</strong> Pengguna wajib menjaga kerahasiaan username, kata sandi. Segala aktivitas aktuasi (seperti menyalakan/mematikan perangkat) yang dilakukan dari akun Pengguna adalah tanggung jawab penuh Pengguna.</li>
                                <li><strong>Penggunaan wajar:</strong> Layanan ini hanya boleh digunakan untuk tujuan pemantauan dan manajemen sistem cerdas secara wajar. Pengguna dilarang keras:
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>Melakukan rekayasa balik (reverse engineering) terhadap perangkat keras ESP32, jaringan lokal (ESP-NOW), atau protokol MQTT BIEON</li>
                                        <li>Mencoba membebani server atau mencari celah keamanan pada dashboard web BIEON</li>
                                        <li>Menggunakan perangkat BIEON untuk tujuan ilegal atau membahayakan pihak lain.</li>
                                    </ul>
                                </li>
                            </ol>

                            <h4 className="font-bold text-gray-800 mb-2 mt-6">4. Pengumpulan dan Penggunaan Data (Privasi)</h4>
                            <p className="mb-2">Untuk menjalankan fungsinya, sistem BIEON secara terus-menerus mengumpulkan dan memproses data dari properti Anda, yang meliputi namun tidak terbatas pada:</p>
                            <ul className="list-disc pl-5 mb-4 space-y-2">
                                <li><strong>Data Penggunaan Energi Listrik:</strong> Tegangan, arus, beban (Load), Konsumsi daya (kWh)</li>
                                <li><strong>Data Lingkungan:</strong> Kualitas udara (suhu, dan kelembapan), Kualitas air (pH, padatan terlarut, suhu air, kekeruhan).</li>
                                <li><strong>Data Keamanan & Log:</strong> status pintu terbuka/tertutup, pergerakan (motion), serta riwayat On/off alat. Data ini digunakan semata-mata untuk menampilkan grafik di dashboard Anda, perhitungan estimasi biaya, penanganan troubleshooting oleh Teknisi, dan peningkatan kinerja sistem.</li>
                            </ul>

                            <h4 className="font-bold text-gray-800 mb-2 mt-6">5. Batasan Tanggung Jawab</h4>
                            <p className="mb-2">Klausul berikut sangat penting untuk dipahami terkait sifat perangkat IoT:</p>
                            <ol className="list-[lower-alpha] pl-5 mb-4 space-y-2">
                                <li><strong>Ketergantungan Eksternal:</strong> Kinerja Layanan BIEON sangat bergantung pada pasokan listrik PLN, stabilitas koneksi Internet di area Anda, serta jangkauan router Wi-Fi lokal. Kami tidak bertanggung jawab atas keterlambatan notifikasi, hilangnya log data sensor, atau kegagalan aktuasi perangkat jika terjadi gangguan pada faktor-faktor eksternal tersebut.</li>
                                <li><strong>Bukan alat keselamatan Mutlak:</strong> Fitur peringatan keamanan BIEON (seperti sensor kebocoran gas dan intrusi pintu), dirancang sebagai system peringatan dini (early warning system), bukan sebagai pengganti layanan tanggap darurat professional (polisi, atau medis). Kami tidak memberikan jaminan mutlak bahwa layanan akan mencegah bahaya kebakaran, pencurian, atau kerusakan properti.</li>
                                <li><strong>Kerugian Materiil:</strong> PT Matra Kreasi Mandiri dibebaskan dari segala tuntutan ganti rugi atas hilangnya nyawa, cedera, atau kerusakan properti yang diakibatkan oleh gagal berfungsinya perangkat keras (hardware failure), gangguan server, atau kelalaian Pengguna dalam merespons sistem peringatan BIEON.</li>
                            </ol>

                            <h4 className="font-bold text-gray-800 mb-2 mt-6">6. Pemeliharaan dan Pengaduan</h4>
                            <ol className="list-[lower-alpha] pl-5 mb-4 space-y-2">
                                <li>Pengguna berhak mengajukan perbaikan melalui fitur Tiket Pengaduan di dashboard apabila mendapati status Offline atau anomali pembacaan sensor.</li>
                                <li>Kami berhak menugaskan Teknisi untuk melakukan pemeriksaan secara visual melalui dashboard global atau mengubah parameter kalibrasi jaringan klien guna keperluan troubleshooting, tanpa mengintervensi atau menyalakan/mematikan alat pribadi Pengguna tanpa izin.</li>
                                <li>Kami sewaktu-waktu dapat melakukan pemeliharaan (maintenance) server atau Over-The-Air (OTA) update pada perangkat lokal, yang mungkin mengakibatkan downtime sementara pada Layanan.</li>
                            </ol>

                            <h4 className="font-bold text-gray-800 mb-2 mt-6">7. Pemutusan Akses</h4>
                            <p className="mb-4">Kami, melalui Super Admin, berhak melakukan penangguhan atau pemutusan akses akun Pengguna secara sepihak dan tanpa pemberitahuan sebelumnya apabila ditemukan indikasi kuat pelanggaran terhadap Syarat dan Ketentuan ini.</p>

                            <h4 className="font-bold text-gray-800 mb-2 mt-6">8. Hukum yang Berlaku</h4>
                            <ul className="list-disc pl-5 mb-4 space-y-2">
                                <li>Keefektifan, penjelasan, perubahan, pelaksanaan, dan penyelesaian perselisihan dari Perjanjian tunduk pada hukum Indonesia. Jika tidak ada undang-undang dan peraturan yang relevan, referensi ke praktik bisnis internasional umum dan (atau) praktik industri harus dibuat.</li>
                                <li>Perselisihan yang timbul dari atau sehubungan dengan Perjanjian dapat diselesaikan oleh Anda dan PT Matra Kreasi Mandiri Smart Living melalui musyawarah atau jika tidak mencapai persetujuan, maka dapat diajukan ke Pengadilan Indonesia di mana Perjanjian ditandatangani untuk ajudikasi.</li>
                                <li>Ketika suatu ketentuan Perjanjian ini dinilai tidak sah oleh Pengadilan Indonesia, hal itu tidak akan mempengaruhi keefektifan ketentuan lain atau bagian apa pun darinya, Anda dan BIEON Smart Living akan melakukan ketentuan yang sah dengan itikad baik.</li>
                                <li>Perjanjian ini ditandatangani di Indonesia.</li>
                            </ul>

                            <p className="mb-4 pt-16 pb-4 text-center font-medium">Akhir dari Syarat dan Ketentuan.</p>
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
