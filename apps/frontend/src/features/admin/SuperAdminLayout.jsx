import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';

export function SuperAdminLayout({ children, activeMenu, onNavigate, title = "Super Admin Dashboard" }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, id: 'admin' },
    { name: 'Homeowner', icon: Users, id: 'admin-pelanggan' },
    { name: 'Teknisi', icon: User, id: 'admin-teknisi' },
    { name: 'Pengaduan', icon: MessageSquare, id: 'admin-complaint' },
    { name: 'PLN Listrik', icon: Zap, id: 'admin-tariff' },
    { name: 'Riwayat', icon: History, id: 'admin-history' },
  ];

  const handleNavigate = (id) => {
    if (onNavigate) onNavigate(id);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-gray-900">
      {/* Sidebar - Green Aesthetic Theme */}
      <aside
        className={`${sidebarExpanded ? 'w-64' : 'w-20'} bg-[#009b7c] border-r border-white/10 shadow-2xl shadow-emerald-900/20 transition-all duration-300 fixed left-0 top-0 h-screen z-50 flex flex-col text-white`}
      >
        {/* Sidebar Header */}
        <div className="h-[72px] px-6 flex items-center justify-between border-b border-white/10">
          {sidebarExpanded && <img src="/logo_bieon.png" alt="BIEON" className="h-8 object-contain brightness-0 invert" />}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/70 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeMenu === item.name || (activeMenu?.toLowerCase() === item.id);
            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center ${sidebarExpanded ? 'px-4' : 'justify-center px-0'} py-3.5 rounded-2xl transition-all group relative overflow-hidden ${isActive
                    ? 'bg-white/20 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/20 backdrop-blur-md'
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                  }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-all ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`} />
                {sidebarExpanded && (
                  <span className={`ml-4 text-[13px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => handleNavigate('login')}
            className={`w-full flex items-center ${sidebarExpanded ? 'px-4' : 'justify-center'} py-3 rounded-2xl hover:bg-white/10 text-white/70 transition-all group font-medium`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 group-hover:text-red-300" />
            {sidebarExpanded && <span className="ml-4 text-sm group-hover:text-red-300">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`${sidebarExpanded ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-20 w-[calc(100%-5rem)]'} flex-1 min-w-0 flex flex-col transition-all duration-300 bg-[#F8FAFC]`}>
        {/* Top Header - Premium Green Style */}
        <header className="h-[72px] bg-[#009b7c] text-white border-b border-white/10 sticky top-0 z-40 flex items-center shadow-md shadow-emerald-900/10 backdrop-blur-md">
          <div className="w-full max-w-[1900px] mx-auto px-8 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight truncate">{title}</h1>

            <div className="flex items-center gap-5">
              <button className="relative p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all group border border-white/5">
                <Bell className="w-5 h-5 text-white/90 group-hover:text-white" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 border border-[#009b7c] rounded-full animate-pulse"></span>
              </button>

              <div className="relative z-50">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-1.5 pr-4 rounded-2xl transition-all border border-white/5"
                >
                  <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                     <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-bold text-white leading-none mb-1">Hi, Admin!</div>
                    <div className="text-[10px] text-white/70 font-bold uppercase tracking-widest leading-none">Super Admin</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 py-2 z-50 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="px-5 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Ganti Role (Demo)</div>
                    <button onClick={() => handleNavigate("dashboard")} className="w-full text-left px-5 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                      <span>Homeowner</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </button>
                    <button onClick={() => handleNavigate("teknisi")} className="w-full text-left px-5 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                      <span>Teknisi</span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </button>
                    <button className="w-full text-left px-5 py-3.5 text-sm text-teal-600 bg-teal-50 font-black border-l-4 border-teal-600">Super Admin</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
