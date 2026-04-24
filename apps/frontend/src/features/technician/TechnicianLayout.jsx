import React, { useState, useEffect, useRef } from 'react';
import { Home, Settings, Clock, MessageSquare, Bell, ChevronDown } from 'lucide-react';
import NotificationPopup from '../../components/NotificationPopup';

// Navigation items for bottom tab bar
const NAV_ITEMS = [
  { id: 'dashboard', icon: Home,         label: 'Beranda'   },
  { id: 'konfigurasi', icon: Settings,   label: 'Kendali'   },
  { id: 'pengaduan', icon: MessageSquare, label: 'Pengaduan' },
  { id: 'riwayat', icon: Clock,          label: 'Riwayat'   },
];

export default function TechnicianLayout({ children, activeMenu, setActiveMenu, onNavigate }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
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

    fetchUnreadStatus();
    const interval = setInterval(fetchUnreadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Open notification from external event (e.g. bell icon in child page)
  useEffect(() => {
    const handleOpenNotif = () => setShowNotif(true);
    window.addEventListener('open-notifications', handleOpenNotif);
    return () => window.removeEventListener('open-notifications', handleOpenNotif);
  }, []);

  // Click-outside handler for profile dropdown
  useEffect(() => {
    if (!showRoleDropdown) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRoleDropdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5FFFC] via-[#F5FFFC] to-[#F5FFFC] flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative">
        <div className="max-w-[1900px] mx-auto px-4 sm:px-6 md:px-8 py-3 md:py-4 relative">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <img src="/logo_bieon.png" alt="BIEON" className="h-8 md:h-10 object-contain" />
            </div>

            {/* Desktop Navigation (Center Aligned via absolute positioning) */}
            <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 lg:gap-10">
              {[
                { id: 'dashboard',   label: 'Beranda'          },
                { id: 'konfigurasi', label: 'Kendali Perangkat' },
                { id: 'riwayat',     label: 'Riwayat'          },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveMenu(id)}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeMenu === id
                      ? 'text-teal-700 border-teal-700'
                      : 'text-gray-500 border-transparent hover:text-teal-700 hover:border-teal-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 lg:gap-4 shrink-0">
              {/* Pengaduan Button */}
              <button
                onClick={() => setActiveMenu('pengaduan')}
                className="flex items-center justify-center p-2 lg:px-4 lg:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                title="Pengaduan"
              >
                <MessageSquare className="w-5 h-5 lg:w-4 lg:h-4" />
                <span className="hidden lg:block ml-2">Pengaduan</span>
              </button>

              {/* Notification */}
              <div className="relative flex">
                <button
                  onClick={() => setShowNotif(!showNotif)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {hasUnread && <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </button>
                <NotificationPopup 
                  isOpen={showNotif} 
                  onClose={() => setShowNotif(false)} 
                  role="technician" 
                  onNavigate={setActiveMenu}
                />
              </div>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-2 hover:bg-gray-50 p-1 md:p-1.5 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                    TB
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-semibold text-gray-900">Teknisi BPJS</div>
                    <div className="text-xs text-gray-500">Teknisi</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 ml-1 hidden lg:block" />
                </button>
                
                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <button
                      onClick={() => { setActiveMenu('profile'); setShowRoleDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-bold transition-colors border-b border-gray-100 pb-3 mb-1"
                    >
                      Lihat Profil Saya
                    </button>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Ganti Role (Demo)</div>
                    <button onClick={() => onNavigate && onNavigate('dashboard')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Homeowner</button>
                    <button className="w-full text-left px-4 py-2 text-sm text-emerald-600 bg-emerald-50 font-medium transition-colors">Teknisi</button>
                    <button onClick={() => onNavigate && onNavigate('admin')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Super Admin</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0 relative">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar - Floating Pill Design */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-gray-200/50 z-[60] flex justify-between items-center px-2 py-2 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] rounded-[2.5rem] pb-safe">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`flex-1 flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'text-[#009270] scale-105' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`p-2 rounded-2xl mb-1 transition-all duration-300 ${isActive ? 'bg-[#009270]/10 shadow-sm' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 stroke-[2.5] ${isActive ? 'text-[#009270]' : ''}`} />
              </div>
              <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-[#009270]' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
