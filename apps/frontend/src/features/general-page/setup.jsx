import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Import Sub-components
import ProfileInfoStep from './setup-components/ProfileInfoStep';
import SystemHardwareStep from './setup-components/SystemHardwareStep';
import SuccessStep from './setup-components/SuccessStep';
import TermsModal from './setup-components/TermsModal';

const PLN_SEGMENT_ORDER = [
    'Subsidi Rumah Tangga',
    'Rumah Tangga',
    'Bisnis',
    'Industri',
    'Pemerintah & PJU',
    'Pelayanan Sosial'
];

const makePlnKey = (label) => String(label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const FALLBACK_PLN_CATEGORIES = [
    { label: 'R-1/TR - 450 VA (Subsidi)', segment: 'Subsidi Rumah Tangga', isShortcut: true },
    { label: 'R-1/TR - 900 VA (Subsidi)', segment: 'Subsidi Rumah Tangga', isShortcut: true },
    { label: 'R-1/TR - 900 VA (Non-Subsidi)', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R-1/TR - 1.300 VA', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R-1/TR - 2.200 VA', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R-2/TR - 3.500-5.500 VA', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'R-3/TR, TM - > 6.600 VA', segment: 'Rumah Tangga', isShortcut: true },
    { label: 'B-1/TR - 450-5.500 VA', segment: 'Bisnis', isShortcut: false },
    { label: 'B-2/TR - 6.600 VA-200 kVA', segment: 'Bisnis', isShortcut: false },
    { label: 'B-3/TM, TT - > 200 kVA', segment: 'Bisnis', isShortcut: false },
    { label: 'I-1/TR - 450-5.500 VA', segment: 'Industri', isShortcut: false },
    { label: 'I-2/TM - 6.600 VA-200 kVA', segment: 'Industri', isShortcut: false },
    { label: 'I-3/TM - > 200 kVA', segment: 'Industri', isShortcut: false },
    { label: 'I-4/TT - > 30.000 kVA', segment: 'Industri', isShortcut: false },
    { label: 'P-1/TR - 6.600 VA-200 kVA', segment: 'Pemerintah & PJU', isShortcut: false },
    { label: 'P-2/TM - > 200 kVA', segment: 'Pemerintah & PJU', isShortcut: false },
    { label: 'P-3/TR - Penerangan Jalan Umum', segment: 'Pemerintah & PJU', isShortcut: false },
    { label: 'L/TR, TM, TT', segment: 'Pemerintah & PJU', isShortcut: false },
    { label: 'S-1/TR - 450 VA', segment: 'Pelayanan Sosial', isShortcut: false },
    { label: 'S-1/TR - 900 VA', segment: 'Pelayanan Sosial', isShortcut: false },
    { label: 'S-1/TR - 1.300 VA', segment: 'Pelayanan Sosial', isShortcut: false },
    { label: 'S-1/TR - 2.200 VA', segment: 'Pelayanan Sosial', isShortcut: false },
    { label: 'S-1/TR - 3.500 VA-200 kVA', segment: 'Pelayanan Sosial', isShortcut: false },
    { label: 'S-2/TM - > 200 kVA', segment: 'Pelayanan Sosial', isShortcut: false },
].map((c) => ({ ...c, key: makePlnKey(c.label) }));

const Setup = ({ tempData }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: tempData?.firstName || tempData?.fullName?.split(' ')[0] || '',
        lastName: tempData?.lastName || tempData?.fullName?.split(' ').slice(1).join(' ') || '',
        username: '',
        phone: '',
        address: '',
        dob: '',
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
    const [plnCategories, setPlnCategories] = useState([]);
    const [plnSearch, setPlnSearch] = useState('');

    // Calendar States
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [showYearDropdown, setShowYearDropdown] = useState(false);

    const currentLang = i18n.language?.startsWith('id') ? 'id' : 'en';

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('bieon_language', lang);
    };

    // Month Names
    const monthNames = i18n.language?.startsWith('id')
        ? ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Fetch PLN options on mount
    useEffect(() => {
        const fetchPlnOptions = async () => {
            try {
                const response = await fetch('/api/admin/tariffs/public/categories?scope=all');
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    setPlnCategories(data.data);
                    return;
                }
            } catch (error) {
                console.error('Failed to fetch PLN options:', error);
            }
            setPlnCategories(FALLBACK_PLN_CATEGORIES);
        };
        fetchPlnOptions();
    }, []);

    const filteredPlnCategories = useMemo(() => {
        const query = plnSearch.trim().toLowerCase();
        if (!query) return plnCategories;
        return plnCategories.filter((c) => String(c.label || '').toLowerCase().includes(query));
    }, [plnCategories, plnSearch]);

    const groupedPlnCategories = useMemo(() => {
        const groups = {};
        filteredPlnCategories.forEach((c) => {
            const seg = c.segment || 'Lainnya';
            if (!groups[seg]) groups[seg] = [];
            groups[seg].push(c);
        });
        return groups;
    }, [filteredPlnCategories]);

    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const days = [];
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: daysInPrevMonth - i, month: viewMonth - 1, year: viewYear, current: false });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, month: viewMonth, year: viewYear, current: true });
        }
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
        if (!tempData?.email || (!tempData?.password && !tempData?.isGoogle)) {
            setError(t('auth.errors.registration_missing'));
            return;
        }

        setLoading(true);
        setError('');
        try {
            let userId = null;
            let finalFullName = `${formData.firstName} ${formData.lastName}`.trim();

            if (tempData.isGoogle) {
                // Untuk user Google, akun sudah dibuat di backend (firebase-login)
                // Kita hanya perlu melengkapi datanya via updateSettings
                const token = localStorage.getItem('token');
                const updateRes = await fetch('/api/auth/settings', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        fullName: finalFullName,
                        username: formData.username,
                        dob: formData.dob,
                        phoneNo: formData.phone,
                        address: formData.address,
                        systemName: formData.systemName,
                        plnTariff: selectedPln,
                        bieonId: formData.bieonId
                    })
                });

                if (!updateRes.ok) {
                    const errJson = await updateRes.json();
                    throw new Error(errJson.message || t('auth.errors.profile_failed'));
                }

                const updateData = await updateRes.json();
                userId = updateData.user._id;

                // Update localStorage with final data
                localStorage.setItem('userId', userId);
                localStorage.setItem('role', updateData.user.role);
                localStorage.setItem('fullName', updateData.user.fullName);

            } else {
                // Registrasi standar (Email/Password)
                const registerRes = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: tempData.email,
                        password: tempData.password,
                        fullName: finalFullName,
                        username: formData.username,
                        dateOfBirth: formData.dob,
                        phoneNumber: formData.phone,
                        address: formData.address,
                        systemName: formData.systemName,
                        plnTariff: selectedPln,
                        bieonId: formData.bieonId,
                        role: 'Homeowner'
                    })
                });

                if (!registerRes.ok) {
                    const errJson = await registerRes.json();
                    throw new Error(errJson.message || t('auth.errors.registration_failed'));
                }

                const registerData = await registerRes.json();
                userId = registerData.user.id;

                // Login otomatis setelah registrasi
                const loginRes = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: tempData.email, password: tempData.password })
                });

                if (!loginRes.ok) throw new Error(t('auth.errors.auto_login_failed'));

                const loginData = await loginRes.json();
                localStorage.setItem('token', loginData.token);
                localStorage.setItem('userId', loginData.user.id);
                localStorage.setItem('role', loginData.user.role);
                localStorage.setItem('fullName', loginData.user.fullName);
            }

            // Setup Hub jika ada bieonId
            if (formData.bieonId && userId) {
                await fetch('/api/hubs/setup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        bieonId: formData.bieonId,
                        userId: userId
                    })
                });
            }

            navigate('/dashboard');
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
        <div className="h-[100dvh] bg-white flex font-sans relative overflow-hidden selection:bg-[#009b7c] selection:text-white">
            {/* Floating Language Switcher */}
            <div className="absolute top-6 right-6 z-50">
                <div className="flex items-center bg-white/40 backdrop-blur-md p-0.5 rounded-xl border border-white/40 shadow-sm select-none">
                    <button
                        onClick={() => handleLanguageChange('id')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all duration-300 ${
                            currentLang === 'id'
                                ? 'bg-white text-[#009b7c] shadow-sm scale-100'
                                : 'text-slate-500 hover:text-[#009b7c] bg-transparent'
                        }`}
                        title="Bahasa Indonesia"
                    >
                        ID
                    </button>
                    <button
                        onClick={() => handleLanguageChange('en')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all duration-300 ${
                            currentLang === 'en'
                                ? 'bg-white text-[#009b7c] shadow-sm scale-100'
                                : 'text-slate-500 hover:text-[#009b7c] bg-transparent'
                        }`}
                        title="English"
                    >
                        EN
                    </button>
                </div>
            </div>

            {/* Multi-layered Ambient Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-emerald-200/30 rounded-full mix-blend-multiply filter blur-[120px] animate-[pulse_10s_ease-in-out_infinite] z-0 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[45%] bg-blue-200/20 rounded-full mix-blend-multiply filter blur-[100px] animate-[pulse_12s_ease-in-out_infinite] delay-1000 z-0 pointer-events-none"></div>
            <div className="absolute top-[20%] right-[10%] w-[25%] h-[30%] bg-emerald-100/20 rounded-full mix-blend-multiply filter blur-[80px] animate-[pulse_15s_ease-in-out_infinite] delay-2000 z-0 pointer-events-none"></div>

            <div className="flex-1 flex flex-col px-6 md:px-16 py-6 overflow-hidden relative z-10 bg-white/70 backdrop-blur-2xl">
                <div className="mb-6">
                    <img src="/logo_bieon.png" alt="BIEON" className="h-[28px] object-contain" />
                </div>

                <div className="w-full max-w-md mx-auto">
                    {/* High-end Stepper UI */}
                    <div className="mb-8 relative px-2">
                        <div className="flex items-center justify-between relative z-10">
                            {[1, 2, 3].map((num) => (
                                <div key={num} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-500 border-2 ${step === num
                                            ? 'bg-[#009b7c] text-white border-[#009b7c] shadow-[0_8px_20px_rgba(0,155,124,0.3)] scale-110 -translate-y-1'
                                            : step > num
                                                ? 'bg-emerald-50 text-[#009b7c] border-emerald-200'
                                                : 'bg-white text-slate-300 border-slate-100 shadow-sm'
                                        }`}>
                                        {step > num ? (
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        ) : num}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest mt-3 transition-colors duration-300 ${step === num ? 'text-slate-800' : 'text-slate-400'}`}>
                                        {num === 1 ? t('auth.setup.stepper.profile') : num === 2 ? t('auth.setup.stepper.system') : t('auth.setup.stepper.finish')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {/* Progress Line */}
                        <div className="absolute top-5 left-10 right-10 h-[2px] bg-slate-100 -z-0">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-[#009b7c] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,155,124,0.3)]"
                                style={{ width: `${(step - 1) * 50}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="transition-all duration-500">
                        {step === 1 && (
                            <ProfileInfoStep
                                formData={formData} setFormData={setFormData}
                                selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                                showCalendar={showCalendar} setShowCalendar={setShowCalendar}
                                monthNames={monthNames} viewMonth={viewMonth} viewYear={viewYear}
                                setViewMonth={setViewMonth} setViewYear={setViewYear}
                                showYearDropdown={showYearDropdown} setShowYearDropdown={setShowYearDropdown}
                                calendarDays={calendarDays} changeMonth={changeMonth} formatDate={formatDate}
                                isTermsAccepted={isTermsAccepted} openTermsModal={openTermsModal}
                                onNext={() => setStep(2)}
                            />
                        )}

                        {step === 2 && (
                            <SystemHardwareStep
                                formData={formData} setFormData={setFormData}
                                selectedPln={selectedPln} setSelectedPln={setSelectedPln}
                                showPlnDropdown={showPlnDropdown} setShowPlnDropdown={setShowPlnDropdown}
                                plnSearch={plnSearch} setPlnSearch={setPlnSearch}
                                filteredPlnCategories={filteredPlnCategories}
                                groupedPlnCategories={groupedPlnCategories}
                                PLN_SEGMENT_ORDER={PLN_SEGMENT_ORDER}
                                onBack={() => setStep(1)} onNext={() => setStep(3)}
                            />
                        )}

                        {step === 3 && (
                            <SuccessStep
                                loading={loading} error={error}
                                handleRegister={handleRegister}
                                formData={formData}
                                selectedPln={selectedPln}
                            />
                        )}
                    </div>
                </div>
            </div>

            <TermsModal
                show={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                onAccept={() => { setIsTermsAccepted(true); setShowTermsModal(false); }}
                modalCheckboxChecked={modalCheckboxChecked}
                setModalCheckboxChecked={setModalCheckboxChecked}
                hasScrolledToBottom={hasScrolledToBottom}
                handleScrollTerms={handleScrollTerms}
            />

            <div className="hidden lg:block w-[45%] xl:w-[50%] p-4 pl-0">
                {step === 2 || step === 3 ? (
                    <div className="w-full h-full flex items-center justify-center bg-transparent">
                        <img
                            key={step}
                            src={step === 2 ? '/gambar235.png' : '/gambar3.png'}
                            alt={`BIEON Setup Step ${step}`}
                            className="max-h-full max-w-full object-contain rounded-[2.5rem] transition-all duration-700 ease-in-out animate-in fade-in zoom-in-95"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative shadow-md bg-slate-100">
                        <img
                            key={step}
                            src={`/gambar${step}.png`}
                            alt={`BIEON Setup Step ${step}`}
                            className="w-full h-full object-center object-cover p-0 transition-all duration-700 ease-in-out animate-in fade-in zoom-in-95"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent mix-blend-overlay pointer-events-none"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Setup;
