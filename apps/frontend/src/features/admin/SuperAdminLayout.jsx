import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Box,
  Monitor,
  Zap,
  Bell,
  ChevronDown,
  Menu,
  ShieldCheck,
  MessageSquare,
  History,
  ChevronRight,
  User,
  LogOut,
  Settings,
  X,
  AlertTriangle,
  Hourglass,
  ArrowLeft,
  Database,
  Globe
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import NotificationPopup from '../../components/NotificationPopup';

export function SuperAdminLayout({ children, activeMenu, onNavigate, title = "Super Admin Dashboard" }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const currentLang = i18n.language?.startsWith('id') ? 'id' : 'en';

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('bieon_language', lang);
  };

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

  const menuItems = [
    { name: t('admin_nav.dashboard'), icon: LayoutDashboard, id: 'admin', path: '/admin', activePaths: ['/admin'] },
    { name: t('admin_nav.homeowner'), icon: Users, id: 'admin-pelanggan', path: '/admin-pelanggan', activePaths: ['/admin-pelanggan', '/admin-client-detail'] },
    { name: t('admin_nav.technician'), icon: User, id: 'admin-teknisi', path: '/admin-teknisi', activePaths: ['/admin-teknisi'] },
    { name: t('admin_nav.complaint'), icon: MessageSquare, id: 'admin-complaint', path: '/admin-complaint', activePaths: ['/admin-complaint'] },
    { name: t('admin_nav.tariff'), icon: Zap, id: 'admin-tariff', path: '/admin-tariff', activePaths: ['/admin-tariff'] },
    { name: t('admin_nav.history'), icon: History, id: 'admin-history', path: '/admin-history', activePaths: ['/admin-history'] },
  ];

  const resolvePath = (target) => {
    const routeMap = {
      landing: '/',
      login: '/login',
      admin: '/admin',
      'admin-pelanggan': '/admin-pelanggan',
      'admin-teknisi': '/admin-teknisi',
      'admin-complaint': '/admin-complaint',
      'admin-tariff': '/admin-tariff',
      'admin-history': '/admin-history',
      dashboard: '/dashboard',
      teknisi: '/teknisi',
      pengaduan: '/pengaduan',
      history: '/history',
      kendali: '/kendali',
    };

    if (!target) return null;
    if (String(target).startsWith('/')) return target;
    return routeMap[target] || null;
  };

  const handleNavigate = (target, options = {}) => {
    const resolvedPath = resolvePath(target);

    if (options.logout) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('bieon_temp_data');
    }

    if (resolvedPath) {
      navigate(resolvedPath);
      return;
    }

    if (onNavigate) onNavigate(target);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-gray-900 overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Gradasi EcoSense Hijau-Biru */}
      <aside
        className={`fixed left-0 top-0 h-screen z-[60] flex flex-col text-white bg-gradient-to-b from-sense to-eco transition-all duration-300 
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'} 
          ${sidebarExpanded ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-[72px] px-6 flex items-center justify-between shrink-0">
          <img src="/logo_bieon.png" alt="BIEON" className={`h-8 object-contain brightness-0 invert transition-all drop-shadow-sm duration-300 ${sidebarExpanded || isMobileMenuOpen ? 'opacity-100' : 'opacity-0 hidden lg:block lg:w-0'}`} />
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="hidden lg:flex p-2 hover:bg-black/10 rounded-full transition-all text-white/80 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Mobile close button inside sidebar */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-all text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = item.activePaths.includes(location.pathname) || activeMenu === item.name || (activeMenu?.toLowerCase() === item.id);
            return (
              <button
                key={item.name}
                onClick={() => {
                  handleNavigate(item.path);
                  if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center ${(sidebarExpanded || isMobileMenuOpen) ? 'px-4' : 'justify-center px-0'} py-3.5 rounded-[1.25rem] transition-all group relative overflow-hidden ${isActive
                  ? 'bg-white/20 text-white font-bold shadow-inner border border-white/10 backdrop-blur-sm'
                  : 'hover:bg-white/10 text-white/75 hover:text-white'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-white rounded-r-[1.25rem]" />
                )}
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-all ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                {(sidebarExpanded || isMobileMenuOpen) && (
                  <span className={`ml-4 text-[15px] font-medium tracking-wide whitespace-nowrap`}>{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={() => handleNavigate('landing', { logout: true })}
            className={`w-full flex items-center ${(sidebarExpanded || isMobileMenuOpen) ? 'px-4' : 'justify-center'} py-3 rounded-[1.25rem] hover:bg-rose-500/20 text-white/80 hover:text-rose-100 transition-all group font-bold hover:border-rose-500/30`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
            {(sidebarExpanded || isMobileMenuOpen) && <span className="ml-4 text-[15px] whitespace-nowrap">{t('admin_nav.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 min-w-0 flex flex-col h-screen transition-all duration-300 bg-[#F8FAFC] w-full max-w-full ${sidebarExpanded ? 'lg:ml-64 lg:w-[calc(100%-16rem)]' : 'lg:ml-20 lg:w-[calc(100%-5rem)]'}`}>
        {/* Top Header - Gradasi EcoSense Hijau-Biru secara horizontal */}
        <header className="h-[72px] shrink-0 bg-gradient-to-r from-sense to-eco text-white sticky top-0 z-40 flex items-center shadow-md">
          <div className="w-full max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 hover:bg-white/10 rounded-xl transition-all text-white/80 shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white truncate" title={title}>{title}</h1>
            </div>

            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
              {/* Premium Language Pill Toggle */}
              <div className="flex items-center bg-black/20 p-0.5 rounded-full border border-white/10 shadow-inner shrink-0 select-none">
                <button
                  onClick={() => handleLanguageChange('id')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                    currentLang === 'id'
                      ? 'bg-white text-sense shadow-md scale-100'
                      : 'text-white/60 hover:text-white bg-transparent'
                  }`}
                  title="Bahasa Indonesia"
                >
                  ID
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                    currentLang === 'en'
                      ? 'bg-white text-sense shadow-md scale-100'
                      : 'text-white/60 hover:text-white bg-transparent'
                  }`}
                  title="English"
                >
                  EN
                </button>
              </div>

              <div className="relative z-50">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all group border border-white/10 shadow-sm hover:shadow"
                >
                  <Bell className="w-5 h-5 text-white/80 group-hover:text-white" />
                  {hasUnread && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border border-white rounded-full animate-pulse"></span>}
                </button>

                <NotificationPopup 
                  isOpen={showNotifications} 
                  onClose={() => setShowNotifications(false)} 
                  role="admin"
                  onNavigate={handleNavigate}
                  onUnreadChange={setHasUnread}
                />
              </div>

              <div className="relative z-50">
                <div className="flex items-center gap-2 sm:gap-3 bg-white/10 p-1.5 pr-3 sm:pr-4 rounded-full border border-white/10 shadow-sm">
                  <div className="w-9 h-9 bg-white/20 rounded-full border border-white/20 flex items-center justify-center shadow-inner shrink-0">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-bold text-white leading-none mb-1">{t('admin_nav.greeting')}</div>
                    <div className="text-[10px] text-white/70 font-bold uppercase tracking-widest leading-none">{t('admin_nav.role_display')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-y-auto pb-4 lg:pb-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
