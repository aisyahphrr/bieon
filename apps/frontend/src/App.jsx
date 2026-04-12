import React, { useState, lazy, Suspense } from 'react';

// Lazy loading for feature modules
const LandingPage = lazy(() => import('./features/general-page/LandingPage'));
const Login = lazy(() => import('./features/general-page/login'));
const Signup = lazy(() => import('./features/general-page/signup'));
const Setup = lazy(() => import('./features/general-page/setup'));
const HomeownerDashboard = lazy(() => import('./features/dashboard/HomeownerDashboard').then(module => ({ default: module.HomeownerDashboard })));
const HomeownerHistory = lazy(() => import('./features/dashboard/HomeownerHistory').then(module => ({ default: module.HomeownerHistory })));
const DeviceControlPage = lazy(() => import('./features/dashboard/kendali').then(module => ({ default: module.DeviceControlPage })));
const TechnicianDashboard = lazy(() => import('./features/technician/TechnicianDashboard').then(module => ({ default: module.TechnicianDashboard })));
const HomeownerComplaint = lazy(() => import('./features/dashboard/HomeownerComplaint').then(module => ({ default: module.HomeownerComplaint })));
const SuperAdminDashboard = lazy(() => import('./features/admin/SuperAdminDashboard'));
const ClientDetailPage = lazy(() => import('./features/admin/ClientDetailPage'));
const AdminHistory = lazy(() => import('./features/admin/AdminHistory'));
const AdminComplaint = lazy(() => import('./features/admin/AdminComplaint'));
const ManajemenAkunPage = lazy(() => import('./features/admin/pelanggan').then(module => ({ default: module.ManajemenAkunPage })));
const ManajemenTeknisiPage = lazy(() => import('./features/admin/teknisi').then(module => ({ default: module.ManajemenTeknisiPage })));
const AdminTariff = lazy(() => import('./features/admin/AdminTariff'));

// Loading Screen - Premium Green
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 border-4 border-[#009b7c]/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[#009b7c] rounded-full border-t-transparent animate-spin"></div>
        <img src="/logo_bieon.png" alt="BIEON" className="absolute inset-4 object-contain opacity-50 grayscale" />
      </div>
      <div className="text-xl font-bold text-[#235C50] animate-pulse">Memuat Pengalaman Premium...</div>
      <p className="text-gray-400 text-sm mt-2">BIEON Smart Green Living</p>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <Suspense fallback={<LoadingScreen />}>
      {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
      {currentPage === 'login' && <Login onNavigate={setCurrentPage} />}
      {currentPage === 'signup' && <Signup onNavigate={setCurrentPage} />}
      {currentPage === 'setup' && <Setup onNavigate={setCurrentPage} />}
      {currentPage === 'dashboard' && <HomeownerDashboard onNavigate={setCurrentPage} />}
      {currentPage === 'history' && <HomeownerHistory onNavigate={setCurrentPage} />}
      {currentPage === 'kendali' && <DeviceControlPage onNavigate={setCurrentPage} />}
      {currentPage === 'teknisi' && <TechnicianDashboard onNavigate={setCurrentPage} />}
      {currentPage === 'pengaduan' && <HomeownerComplaint onNavigate={setCurrentPage} />}
      {currentPage === 'admin' && <SuperAdminDashboard onNavigate={setCurrentPage} />}
      {currentPage === 'admin-pelanggan' && <ManajemenAkunPage onNavigate={setCurrentPage} />}
      {currentPage === 'admin-client-detail' && <ClientDetailPage onNavigate={setCurrentPage} />}
      {currentPage === 'admin-history' && <AdminHistory onNavigate={setCurrentPage} />}
      {currentPage === 'admin-complaint' && <AdminComplaint onNavigate={setCurrentPage} />}
      {currentPage === 'admin-teknisi' && <ManajemenTeknisiPage onNavigate={setCurrentPage} />}
      {currentPage === 'admin-tariff' && <AdminTariff onNavigate={setCurrentPage} />}
    </Suspense>
  );
}

export default App;
