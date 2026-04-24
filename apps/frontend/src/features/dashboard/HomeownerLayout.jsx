import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Zap, Clock, MessageSquare, Bell, ChevronDown, ShieldAlert, CheckCircle2 } from 'lucide-react';
import NotificationPopup from '../../components/NotificationPopup';
import HomeownerProfilePopup from './components/HomeownerProfilePopup';

function TechReportModal({ isOpen, onClose, onSubmit }) {
  const [report, setReport] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Laporan Teknisi</h3>
        <p className="text-gray-500 text-sm mb-4">Silakan catat aktivitas sinkronisasi atau masalah kendali perangkat yang baru saja dilakukan. Laporan akan otomatis diteruskan ke Super Admin.</p>
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder="Tuliskan aktivitas dan status perangkat yang dikonfigurasi..."
          className="w-full border-2 border-gray-300 rounded-xl p-4 focus:outline-none focus:border-orange-500 min-h-[120px] mb-4 text-sm"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-500 font-semibold hover:bg-gray-100">Batal</button>
          <button
            onClick={() => onSubmit(report)}
            disabled={!report.trim()}
            className="px-6 py-2 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kirim & Keluar
          </button>
        </div>
      </div>
    </div>
  );
}

// Nav items shared between desktop navbar and mobile bottom nav
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Beranda', mobileIcon: Home },
  { id: 'kendali', label: 'Kendali Perangkat', mobileIcon: Zap },
  { id: 'history', label: 'Riwayat', mobileIcon: Clock },
];

export default function HomeownerLayout({ children, currentPage, onNavigate, hideBottomNav }) {
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isTechnicianMode, setIsTechnicianMode] = useState(false);
  const [showTechReportModal, setShowTechReportModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);
  const roleDropdownRef = useRef(null);

  useEffect(() => {
    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('bieon_token');
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
        const token = localStorage.getItem('bieon_token');
        if (!token) return;
        const response = await fetch('/api/history/alerts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          const unread = result.data?.some(n => !n.isRead);
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
      const token = localStorage.getItem('bieon_token');
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

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    };
    if (showRoleDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRoleDropdown]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-teal-50/20 flex flex-col font-sans">

      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm relative">
        <div className="max-w-[1900px] mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex h-16 md:h-20 items-center justify-between gap-4">

            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <img src="/logo_bieon.png" alt="BIEON" className="h-8 md:h-10 object-contain" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 lg:gap-10">
              {filteredNavItems.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => navigate(`/${id}`)}
                  className={`font-semibold pb-1 border-b-2 transition-all ${currentPage === id
                      ? 'text-teal-700 border-teal-700 cursor-default'
                      : 'text-gray-500 border-transparent hover:text-teal-700 hover:border-teal-700'
                    }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 lg:gap-4 shrink-0">
              {!isTechnicianMode && (
                <button
                  onClick={() => navigate('/pengaduan')}
                  className="flex items-center justify-center p-2 lg:px-4 lg:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  title="Ajukan Pengaduan"
                >
                  <MessageSquare className="w-5 h-5 lg:w-4 lg:h-4" />
                  <span className="hidden xl:block ml-2">Ajukan Pengaduan</span>
                </button>
              )}

              {!isTechnicianMode && (
                <div className="relative flex">
                  <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {hasUnread && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                  </button>
                  <NotificationPopup 
                    isOpen={showNotif} 
                    onClose={() => setShowNotif(false)} 
                    role="homeowner" 
                    onNavigate={handleNotificationNavigate}
                  />
                </div>
              )}

              {/* Profile Dropdown */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => !isTechnicianMode && setShowRoleDropdown(!showRoleDropdown)}
                  className={`flex items-center gap-2 p-1 md:p-1.5 rounded-lg transition-all ${isTechnicianMode ? 'cursor-not-allowed opacity-80' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold font-accent shadow-inner">
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
                      {isTechnicianMode ? 'Homeowner' : (userProfile?.role || 'Homeowner')}
                    </div>
                  </div>
                  {!isTechnicianMode && <ChevronDown className="w-4 h-4 text-gray-400 ml-1 hidden lg:block" />}
                </button>

                {showRoleDropdown && !isTechnicianMode && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <button
                      disabled={isTechnicianMode}
                      onClick={() => { setShowProfilePopup(true); setShowRoleDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm font-bold transition-colors border-b border-gray-100 pb-3 mb-1 ${isTechnicianMode ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Profil Saya
                    </button>
                    {!isTechnicianMode && (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ganti Role (Demo)</div>
                        <button onClick={() => navigate('/dashboard')} className="w-full text-left px-4 py-2 text-sm text-emerald-600 bg-emerald-50 font-medium transition-colors">Homeowner</button>
                        <button onClick={() => navigate('/teknisi')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Teknisi</button>
                        <button onClick={() => navigate('/admin')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Super Admin</button>
                      </>
                    )}
                    <button
                      onClick={() => { if (isTechnicianMode) handleExitTechnicianMode(); else navigate('/login'); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 font-bold transition-colors"
                    >
                      {isTechnicianMode ? 'Keluar Sesi Teknisi' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Technician Limited Access Banner */}
      {isTechnicianMode && (
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-2 px-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-lg sticky top-0 z-[100]">
          ⚠️ PERHATIAN: Harap hati-hati karena sedang di halaman Homeowner! ⚠️
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${hideBottomNav ? '' : 'pb-20'} md:pb-0 relative`}>
        {isTechnicianMode && (
          <div className="max-w-[1900px] mx-auto px-4 sm:px-6 md:px-8 mt-6">
            <div className="bg-orange-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg animate-pulse border-b-4 border-orange-800">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wide">Mode Teknisi — Akses Berbasis Token</h3>
                  <p className="text-xs text-orange-100 italic">Harap hati-hati karena sedang di halaman Homeowner. Akses Anda hanya dibatasi pada halaman Kendali Perangkat saja tanpa pengaturan otomatis/jadwal.</p>
                </div>
              </div>
              <button
                onClick={handleExitTechnicianMode}
                className="px-4 py-2 bg-white text-orange-600 font-bold rounded-xl text-sm hover:bg-orange-50 transition-colors shadow-sm whitespace-nowrap"
              >
                KELUAR SESI
              </button>
            </div>
          </div>
        )}
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {!hideBottomNav && (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
          <div className="bg-white/90 backdrop-blur-lg border border-emerald-100 shadow-2xl rounded-2xl flex items-center justify-around h-16 p-2 ring-4 ring-emerald-500/10">
            {filteredNavItems.map(({ id, label, mobileIcon: Icon }) => (
              <button
                key={id}
                onClick={() => navigate(`/${id}`)}
                className={`flex flex-col items-center justify-center transition-all ${currentPage === id ? 'text-teal-600 scale-110' : 'text-gray-400 hover:text-teal-400'
                  }`}
              >
                <Icon className={`w-6 h-6 ${currentPage === id ? 'fill-teal-600/10' : ''}`} strokeWidth={currentPage === id ? 2.5 : 2} />
                <span className={`text-[10px] sm:text-xs font-bold mt-1 ${currentPage === id ? '' : 'text-gray-400'}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popups & Modals */}
      <HomeownerProfilePopup isOpen={showProfilePopup} onClose={() => setShowProfilePopup(false)} userProfile={userProfile} />
      <TechReportModal
        isOpen={showTechReportModal}
        onClose={() => setShowTechReportModal(false)}
        onSubmit={handleTechReportSubmit}
      />
    </div>
  );
}
