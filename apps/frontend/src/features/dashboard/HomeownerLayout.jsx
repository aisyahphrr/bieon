import React, { useState, useEffect } from 'react';
import { Home, Zap, Clock, MessageSquare, Bell, ChevronDown } from 'lucide-react';
import NotificationPopup from '../../components/NotificationPopup';
import HomeownerProfilePopup from './components/HomeownerProfilePopup';

export default function HomeownerLayout({ children, currentPage, onNavigate, hideBottomNav }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  useEffect(() => {
    const handleOpenNotif = () => setShowNotif(true);
    window.addEventListener('open-notifications', handleOpenNotif);
    return () => window.removeEventListener('open-notifications', handleOpenNotif);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-teal-50/20 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm relative">
        <div className="max-w-[1900px] mx-auto px-4 sm:px-6 md:px-8 py-3 md:py-4 relative">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <img src="/logo_bieon.png" alt="BIEON" className="h-8 md:h-10 object-contain" />
            </div>

            {/* Desktop Navigation (Center Aligned via absolute positioning) */}
            <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 lg:gap-10">
              <button 
                onClick={() => onNavigate && onNavigate('dashboard')} 
                className={`font-semibold pb-1 border-b-2 transition-all ${currentPage === 'dashboard' ? 'text-teal-700 border-transparent cursor-default' : 'text-gray-500 border-transparent hover:text-teal-700 hover:border-teal-700'}`}
              >
                Beranda
              </button>
              <button 
                onClick={() => onNavigate && onNavigate('kendali')} 
                className={`font-semibold pb-1 border-b-2 transition-all ${currentPage === 'kendali' ? 'text-teal-700 border-transparent cursor-default' : 'text-gray-500 border-transparent hover:text-teal-700 hover:border-teal-700'}`}
              >
                Kendali Perangkat
              </button>
              <button 
                onClick={() => onNavigate && onNavigate('history')} 
                className={`font-semibold pb-1 border-b-2 transition-all ${currentPage === 'history' ? 'text-teal-700 border-transparent cursor-default' : 'text-gray-500 border-transparent hover:text-teal-700 hover:border-teal-700'}`}
              >
                Riwayat
              </button>
            </nav>

            {/* Actions (Desktop & Mobile combined) shrink-0 to prevent compression */}
            <div className="flex items-center gap-3 lg:gap-4 shrink-0">
              {/* Pengaduan Button (Responsive Text) */}
              <button
                onClick={() => onNavigate && onNavigate('pengaduan')}
                className="flex items-center justify-center p-2 lg:px-4 lg:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                title="Ajukan Pengaduan"
              >
                <MessageSquare className="w-5 h-5 lg:w-4 lg:h-4" />
                <span className="hidden xl:block ml-2">Ajukan Pengaduan</span>
                <span className="hidden lg:block xl:hidden ml-2">Pengaduan</span>
              </button>

              {/* Notification */}
              <div className="relative flex">
                <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
                <NotificationPopup isOpen={showNotif} onClose={() => setShowNotif(false)} role="homeowner" />
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-2 hover:bg-gray-50 p-1 md:p-1.5 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shrink-0"></div>
                  {/* Keep text hidden until xl screen if space is tight, else lg */}
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-semibold text-gray-900">Hi, Aisyah!</div>
                    <div className="text-xs text-gray-500">Homeowner</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 ml-1 hidden lg:block" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <button 
                       onClick={() => { setShowProfilePopup(true); setShowRoleDropdown(false); }} 
                       className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-bold transition-colors border-b border-gray-100 pb-3 mb-1"
                    >
                      Lihat Profil Saya
                    </button>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ganti Role (Demo)</div>
                    <button className="w-full text-left px-4 py-2 text-sm text-emerald-600 bg-emerald-50 font-medium transition-colors">Homeowner</button>
                    <button onClick={() => onNavigate && onNavigate('teknisi')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Teknisi</button>
                    <button onClick={() => onNavigate && onNavigate('admin')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Super Admin</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {/* pb-20 padding added for mobile so bottom nav doesn't cover content */}
      <main className={`flex-1 ${hideBottomNav ? '' : 'pb-20'} md:pb-0 relative`}>
        {children}
      </main>

      {/* Profile Popup - Placed at root of layout */}
      <HomeownerProfilePopup 
         isOpen={showProfilePopup} 
         onClose={() => setShowProfilePopup(false)} 
         onNavigate={onNavigate} 
      />

      {/* Mobile Bottom Navigation Bar */}
      {!hideBottomNav && (
        <nav className="md:hidden fixed bottom-1 left-4 right-4 bg-white/80 backdrop-blur-md border border-gray-100 z-[60] flex justify-between items-center px-6 py-2 shadow-xl pb-safe rounded-[2rem]">
          {[
            { id: 'dashboard', icon: Home, label: 'Beranda' },
            { id: 'kendali', icon: Zap, label: 'Kendali' },
            { id: 'pengaduan', icon: MessageSquare, label: 'Pengaduan' },
            { id: 'history', icon: Clock, label: 'Riwayat' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate && onNavigate(item.id)}
                className={`flex flex-col items-center justify-center min-w-[64px] transition-all duration-200 ${isActive ? 'text-teal-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className={`p-1.5 rounded-full mb-1 transition-all ${isActive ? 'bg-teal-50 shadow-inner' : 'bg-transparent'}`}>
                  <Icon className={`w-6 h-6 stroke-[2] ${isActive ? 'fill-teal-50' : ''}`} />
                </div>
                <span className={`text-[10px] sm:text-xs font-semibold ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Global CSS for safe area padding on mobile */}
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 12px); }
      `}</style>
    </div>
  );
}
