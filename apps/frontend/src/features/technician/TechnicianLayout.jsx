import { Home, Settings, Clock, MessageSquare, Bell, ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import NotificationPopup from '../../components/NotificationPopup';

// Navigation items for bottom tab bar
const NAV_ITEMS = [
  { id: 'dashboard', icon: Home,         label: 'Beranda',   tKey: 'nav.dashboard' },
  { id: 'konfigurasi', icon: Settings,   label: 'Kendali',   tKey: 'nav.kendali_short' },
  { id: 'pengaduan', icon: MessageSquare, label: 'Pengaduan', tKey: 'nav.complaint_tab' },
  { id: 'riwayat', icon: Clock,          label: 'Riwayat',   tKey: 'nav.history' },
];

export default function TechnicianLayout({ children, activeMenu, setActiveMenu, onNavigate }) {
  const { t, i18n } = useTranslation();
  const [showNotif, setShowNotif] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const currentLang = i18n.language?.startsWith('id') ? 'id' : 'en';

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('bieon_language', lang);
  };

  const lastLocationSentRef = useRef({ lat: null, lng: null, sentAt: 0 });
  const watchIdRef = useRef(null);

  useEffect(() => {
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'Technician' || !navigator.geolocation) {
      return undefined;
    }

    const sendLocation = async (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const now = Date.now();
      const previous = lastLocationSentRef.current;
      const latDiff = previous.lat === null ? Infinity : Math.abs(latitude - previous.lat);
      const lngDiff = previous.lng === null ? Infinity : Math.abs(longitude - previous.lng);
      const hasMovedEnough = latDiff > 0.00015 || lngDiff > 0.00015;
      const isStale = now - previous.sentAt > 60000;

      if (!hasMovedEnough && !isStale) {
        return;
      }

      try {
        await fetch('/api/technician/location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            lat: latitude,
            lng: longitude,
            accuracy,
            source: 'browser',
            capturedAt: new Date(position.timestamp || now).toISOString(),
          }),
        });

        lastLocationSentRef.current = {
          lat: latitude,
          lng: longitude,
          sentAt: now,
        };
      } catch (error) {
        console.error('Gagal mengirim lokasi teknisi:', error);
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      sendLocation,
      (error) => {
        console.error('Gagal membaca lokasi teknisi:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 15000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);


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
                { id: 'dashboard',   label: 'Beranda',           tKey: 'nav.dashboard' },
                { id: 'konfigurasi', label: 'Kendali Perangkat', tKey: 'nav.kendali' },
                { id: 'riwayat',     label: 'Riwayat',           tKey: 'nav.history' },
              ].map(({ id, label, tKey }) => (
                <button
                  key={id}
                  onClick={() => setActiveMenu(id)}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeMenu === id
                      ? 'text-sense border-sense'
                      : 'text-gray-500 border-transparent hover:text-sense hover:border-sense'
                  }`}
                >
                  {t(tKey, label)}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 lg:gap-4 shrink-0">
              {/* Pengaduan Button */}
              <button
                onClick={() => setActiveMenu('pengaduan')}
                className="hidden md:flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition-all border border-red-100"
                title={t('nav.complaint_tab', 'Pengaduan')}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t('nav.complaint_tab', 'Pengaduan')}</span>
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
                  onUnreadChange={setHasUnread}
                />
              </div>
              
              {/* Premium Language Pill Toggle */}
              <div className="flex items-center bg-sense/5 p-0.5 rounded-xl border border-sense/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] shrink-0 select-none">
                <button
                  onClick={() => handleLanguageChange('id')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all duration-300 ${
                    currentLang === 'id'
                      ? 'bg-white text-sense shadow-sm border border-sense/10 scale-100'
                      : 'text-slate-400 hover:text-sense bg-transparent'
                  }`}
                  title="Bahasa Indonesia"
                >
                  ID
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all duration-300 ${
                    currentLang === 'en'
                      ? 'bg-white text-sense shadow-sm border border-sense/10 scale-100'
                      : 'text-slate-400 hover:text-sense bg-transparent'
                  }`}
                  title="English"
                >
                  EN
                </button>
              </div>
              
              {/* Profile - Direct Navigation */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu('profile')}
                  className="flex items-center gap-2 hover:bg-gray-50 p-1 md:p-1.5 rounded-xl transition-all border border-transparent hover:border-sense/20"
                >
                  <div className="w-9 h-9 bg-sense/10 border border-sense/20 rounded-full flex items-center justify-center text-sense font-bold text-xs shrink-0 shadow-sm">
                    {(localStorage.getItem('fullName') || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-bold text-gray-900 leading-tight">
                      {localStorage.getItem('fullName') || 'Teknisi BPJS'}
                    </div>
                    <div className="text-[10px] text-sense font-semibold uppercase tracking-wider">
                      {localStorage.getItem('role') || 'Teknisi'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0 relative">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar: docked directly at the bottom with safe area padding */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-0 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`flex-1 flex flex-col items-center justify-center h-full transition-colors duration-200 ${
                  isActive ? 'text-eco' : 'text-gray-400 hover:text-slate-600'
                }`}
              >
                <Icon 
                  className="w-5.5 h-5.5 transition-all duration-200" 
                  strokeWidth={isActive ? 2.2 : 1.8} 
                />
                <span className={`text-[9px] sm:text-[10px] font-semibold mt-1 transition-colors duration-200 ${
                  isActive ? 'text-eco font-bold' : 'text-gray-400'
                }`}>
                  {t(item.tKey, item.label)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
