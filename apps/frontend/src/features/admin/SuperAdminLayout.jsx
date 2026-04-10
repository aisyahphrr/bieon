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
    { name: 'PLN Listrik', icon: Zap, id: 'admin' },
    { name: 'Riwayat', icon: History, id: 'admin-history' },
  ];

  const handleNavigate = (id) => {
    if (onNavigate) onNavigate(id);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-gray-900">
      {/* Sidebar - Restored Dark Theme */}
      <aside
        className={`${sidebarExpanded ? 'w-64' : 'w-20'} bg-[#0f172a] transition-all duration-300 fixed left-0 top-0 h-screen z-50 flex flex-col shadow-2xl`}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          {sidebarExpanded && <img src="/logo_bieon.png" alt="BIEON" className="h-9 object-contain brightness-0 invert" />}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
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
                className={`w-full flex items-center ${sidebarExpanded ? 'px-4' : 'justify-center px-0'} py-3.5 rounded-2xl transition-all group ${isActive
                    ? 'bg-white/10 text-emerald-400 shadow-lg shadow-black/20'
                    : 'hover:bg-white/5 text-slate-400 hover:text-white'
                  }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {sidebarExpanded && (
                  <span className={`ml-4 text-[11px] uppercase tracking-widest ${isActive ? 'font-black' : 'font-bold'}`}>{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => handleNavigate('login')}
            className={`w-full flex items-center ${sidebarExpanded ? 'px-4' : 'justify-center'} py-3 rounded-2xl hover:bg-red-500/10 text-red-400 transition-all group`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 opacity-60 group-hover:opacity-100" />
            {sidebarExpanded && <span className="ml-4 text-xs font-bold uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`${sidebarExpanded ? 'ml-64' : 'ml-20'} flex-1 flex flex-col transition-all duration-300`}>
        {/* Top Header - Consistent with Homeowner/Technician */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-[1900px] mx-auto px-8 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-sm"></div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-semibold text-gray-900 leading-none mb-1">Hi, Admin!</div>
                    <div className="text-xs text-gray-500 leading-none">Super Admin</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
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
