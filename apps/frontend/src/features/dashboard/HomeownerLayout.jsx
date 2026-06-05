import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Zap, Clock, MessageSquare, Bell, ChevronDown, ShieldAlert, CheckCircle2, SlidersHorizontal, History } from 'lucide-react';
import NotificationPopup from '../../components/NotificationPopup';
import HomeownerProfilePopup from './components/HomeownerProfilePopup';
import { useTranslation } from 'react-i18next';

function TechReportModal({ isOpen, onClose, onSubmit }) {
  const { t } = useTranslation();
  const [report, setReport] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-t-[32px] sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full p-6 sm:p-8 flex flex-col border-0 animate-in slide-in-from-bottom-10 duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('nav.tech_mode')}</h3>
        <p className="text-gray-500 text-sm mb-4">{t('nav.warning_tech_mode')}</p>
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder={t('technician.exit_session_placeholder')}
          className="w-full bg-slate-50 border-0 rounded-xl p-4 focus:outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/15 min-h-[120px] mb-4 text-sm resize-none transition-all placeholder:text-gray-400"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-500 font-semibold hover:bg-gray-100">{t('dashboard.cancel')}</button>
          <button
            onClick={() => onSubmit(report)}
            disabled={!report.trim()}
            className="px-6 py-2 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('nav.exit_tech_mode')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Nav items shared between desktop navbar and mobile bottom nav
const NAV_ITEMS = [
  { id: 'dashboard', labelKey: 'nav.dashboard', mobileIcon: Home },
  { id: 'kendali', labelKey: 'nav.kendali', mobileIcon: SlidersHorizontal },
  { id: 'pengaduan', labelKey: 'nav.complaint_tab', mobileIcon: MessageSquare },
  { id: 'history', labelKey: 'nav.history', mobileIcon: History },
];

export default function HomeownerLayout({ children, currentPage, onNavigate, hideBottomNav }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isTechnicianMode, setIsTechnicianMode] = useState(false);
  const [showTechReportModal, setShowTechReportModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);

  const currentLang = i18n.language?.startsWith('id') ? 'id' : 'en';

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('bieon_language', lang);
  };

  useEffect(() => {
    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Gagal mengambil profil:', error);
      }
    };

    const fetchUnreadStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch('/api/alerts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          const unread = result.data?.some(n => !n.isRead && !n.isSeen);
          setHasUnread(unread);
        }
      } catch (error) {
        console.error("Gagal cek unread:", error);
      }
    };

    fetchProfile();
    fetchUnreadStatus();

    // Re-check unread every 30 seconds
    const interval = setInterval(fetchUnreadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const techAccess = localStorage.getItem('bieon_tech_access');
    const techExpiry = localStorage.getItem('bieon_tech_access_expiry');

    if (techAccess === 'true') {
      const checkExpiry = () => {
        if (techExpiry && Date.now() > parseInt(techExpiry)) {
          alert("Sesi Teknisi Anda telah berakhir (30 menit). Anda telah di-logout otomatis.");
          localStorage.removeItem('bieon_tech_access');
          localStorage.removeItem('bieon_tech_access_expiry');
          setIsTechnicianMode(false);
          navigate('/teknisi');
          return true;
        }
        return false;
      };

      if (!checkExpiry()) {
        setIsTechnicianMode(true);
        const interval = setInterval(() => {
          if (checkExpiry()) clearInterval(interval);
        }, 5000);
        return () => clearInterval(interval);
      }
    } else {
      setIsTechnicianMode(false);
    }
  }, [userProfile, navigate]);

  // Route Guard for Technicians
  useEffect(() => {
    if (isTechnicianMode && currentPage && currentPage !== 'kendali') {
      console.warn("Technician attempted to access forbidden page:", currentPage);
      if (onNavigate) {
        onNavigate('kendali');
      } else {
        navigate('/kendali');
      }
    }
  }, [isTechnicianMode, currentPage, navigate, onNavigate]);

  const handleTechReportSubmit = async (reportContent) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/technician-access/submit-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          report: reportContent
        })
      });

      const data = await response.json();
      if (!response.ok) {
        alert("Gagal mengirim laporan: " + data.message);
        return;
      }

      // Mengirim ke notifikasi via custom event (simulasi laporan ke super admin)
      const newNotif = {
        id: Date.now(),
        type: 'info',
        title: 'Laporan Konfigurasi Teknisi Baru',
        message: `Laporan: "${reportContent}"`,
        time: 'Baru saja',
        icon: CheckCircle2,
      };
      window.dispatchEvent(new CustomEvent('add-notification', { detail: newNotif }));

      // Keluar dari sesi teknisi
      localStorage.removeItem('bieon_tech_access');
      localStorage.removeItem('bieon_tech_access_expiry');
      setIsTechnicianMode(false);
      setShowTechReportModal(false);
      navigate('/teknisi');
    } catch (error) {
      console.error("Error submit report:", error);
      alert("Terjadi kesalahan teknis saat mengirim laporan.");
    }
  };

  const handleExitTechnicianMode = () => {
    setShowTechReportModal(true);
  };

  const filteredNavItems = isTechnicianMode
    ? NAV_ITEMS.filter(item => item.id === 'kendali')
    : NAV_ITEMS;


  const handleNotificationNavigate = (menuId) => {
    if (menuId === 'pengaduan') {
      navigate('/pengaduan');
    } else if (onNavigate) {
      onNavigate(menuId);
    }
    setShowNotif(false);
  };

  useEffect(() => {
    const handleOpenNotif = () => setShowNotif(true);
    window.addEventListener('open-notifications', handleOpenNotif);
    return () => window.removeEventListener('open-notifications', handleOpenNotif);
  }, []);

  return (
    <div className="min-h-screen bg-surface-main flex flex-col font-sans">

      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border-0 relative">
        <div className="max-w-[1900px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between gap-4">

            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <img src="/logo_bieon.png" alt="BIEON" className="h-8 md:h-10 object-contain" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 lg:gap-10">
              {filteredNavItems.filter(item => item.id !== 'pengaduan').map(({ id, labelKey }) => (
                <button
                  key={id}
                  onClick={() => navigate(`/${id}`)}
                  className={`font-semibold pb-1 border-b-2 transition-all text-sm ${currentPage === id
                    ? 'text-[#0F172A] border-eco cursor-default font-bold'
                    : 'text-[#0F172A]/70 border-transparent hover:text-[#0F172A] hover:border-eco'
                    }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 lg:gap-4 shrink-0">


              {!isTechnicianMode && (
                <button
                  onClick={() => navigate('/pengaduan')}
                  className="hidden md:flex relative p-[1.5px] bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-95 group font-bold"
                  title={t('nav.complaint')}
                >
                  <div className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-transparent text-white rounded-[10px] group-hover:bg-white group-hover:text-amber-600 transition-all duration-300 text-xs">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('nav.complaint')}</span>
                  </div>
                </button>
              )}



              {!isTechnicianMode && (
                <div className="relative flex">
                  <button
                    onClick={() => setShowNotif(!showNotif)}
                    className="relative p-2 text-eco hover:bg-eco/10 rounded-lg transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    {hasUnread && <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                  </button>
                  <NotificationPopup
                    isOpen={showNotif}
                    onClose={() => setShowNotif(false)}
                    role="homeowner"
                    onNavigate={handleNotificationNavigate}
                    onUnreadChange={setHasUnread}
                  />
                </div>
              )}

              {/* Premium Language Pill Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] shrink-0 select-none">
                <button
                  onClick={() => handleLanguageChange('id')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all duration-300 ${currentLang === 'id'
                    ? 'bg-white text-eco shadow-sm border-0 scale-100'
                    : 'text-slate-400 hover:text-eco bg-transparent'
                    }`}
                  title="Bahasa Indonesia"
                >
                  ID
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all duration-300 ${currentLang === 'en'
                    ? 'bg-white text-eco shadow-sm border-0 scale-100'
                    : 'text-slate-400 hover:text-eco bg-transparent'
                    }`}
                  title="English"
                >
                  EN
                </button>
              </div>

              {/* Profile Button (Direct to Popup) */}
              <div className="relative">
                <button
                  onClick={() => !isTechnicianMode && setShowProfilePopup(true)}
                  className={`flex items-center gap-2 p-1 md:p-1.5 rounded-lg transition-all ${isTechnicianMode ? 'cursor-not-allowed opacity-80' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-eco to-green-600 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold font-sans shadow-inner">
                    {isTechnicianMode
                      ? (localStorage.getItem('bieon_active_homeowner_name') || 'HO').substring(0, 2).toUpperCase()
                      : (userProfile?.fullName || 'US').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-semibold text-gray-900">
                      Hi, {isTechnicianMode
                        ? (localStorage.getItem('bieon_active_homeowner_name')?.split(' ')[0] || 'Homeowner')
                        : (userProfile?.fullName?.split(' ')[0] || 'User')}!
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium">
                      {isTechnicianMode ? t('role.homeowner') : (userProfile?.role?.toLowerCase() === 'homeowner' || !userProfile?.role ? t('role.homeowner') : userProfile.role)}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Technician Limited Access Banner */}
      {isTechnicianMode && (
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-2 px-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-lg sticky top-0 z-[100]">
          {t('technician.control_warning')}
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${hideBottomNav ? '' : 'pb-20'} md:pb-0 relative`}>
        {isTechnicianMode && (
          <div className="max-w-[1900px] mx-auto px-4 sm:px-6 md:px-8 mt-6">
            <div className="bg-orange-600 rounded-[24px] p-4 text-white flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-pulse border-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wide">{t('nav.tech_mode')}</h3>
                  <p className="text-xs text-orange-100 italic">{t('nav.warning_tech_mode')}</p>
                </div>
              </div>
              <button
                onClick={handleExitTechnicianMode}
                className="px-4 py-2 bg-white text-orange-600 font-bold rounded-xl text-sm hover:bg-orange-50 transition-colors shadow-sm whitespace-nowrap"
              >
                {t('nav.exit_tech_mode')}
              </button>
            </div>
          </div>
        )}
        {children}
      </main>

      {/* Mobile Bottom Nav: docked directly at the bottom with safe area padding */}
      {!hideBottomNav && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-0 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around h-16 px-4">
            {filteredNavItems.map(({ id, labelKey, mobileIcon: Icon }) => (
              <button
                key={id}
                onClick={() => navigate(`/${id}`)}
                className={`flex-1 flex flex-col items-center justify-center h-full transition-colors duration-200 ${
                  currentPage === id ? 'text-[#0F172A]' : 'text-gray-400 hover:text-slate-600'
                }`}
              >
                <Icon 
                  className="w-5.5 h-5.5 transition-all duration-200" 
                  strokeWidth={currentPage === id ? 2.2 : 1.8} 
                />
                <span className={`text-[9px] sm:text-[10px] font-semibold mt-1 transition-colors duration-200 ${
                  currentPage === id ? 'text-[#0F172A] font-bold' : 'text-gray-400'
                }`}>
                  {t(labelKey)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popups & Modals */}
      <HomeownerProfilePopup isOpen={showProfilePopup} onClose={() => setShowProfilePopup(false)} userProfile={userProfile} onNavigate={onNavigate} />
      <TechReportModal
        isOpen={showTechReportModal}
        onClose={() => setShowTechReportModal(false)}
        onSubmit={handleTechReportSubmit}
      />
    </div>
  );
}
