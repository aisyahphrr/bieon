import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('bieon_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function AppContent() {
  const navigate = useNavigate();
  const [tempData, setTempData] = useState(() => {
    const saved = sessionStorage.getItem('bieon_temp_data');
    return saved ? JSON.parse(saved) : {};
  });

  // Simpan data sementara ke sessionStorage setiap kali berubah
  React.useEffect(() => {
    sessionStorage.setItem('bieon_temp_data', JSON.stringify(tempData));
  }, [tempData]);

  const handleNavigate = (path) => {
    navigate(`/${path}`);
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup setTempData={setTempData} />} />
        <Route path="/setup" element={<Setup tempData={tempData} />} />

        {/* Homeowner Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><HomeownerDashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HomeownerHistory /></ProtectedRoute>} />
        <Route path="/kendali" element={<ProtectedRoute><DeviceControlPage /></ProtectedRoute>} />
        <Route path="/pengaduan" element={<ProtectedRoute><HomeownerComplaint /></ProtectedRoute>} />

        {/* Technician Routes */}
        <Route path="/teknisi" element={<ProtectedRoute><TechnicianDashboard /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><SuperAdminDashboard onNavigate={handleNavigate} /></ProtectedRoute>} />
        <Route path="/admin-pelanggan" element={<ProtectedRoute><ManajemenAkunPage onNavigate={handleNavigate} /></ProtectedRoute>} />
        <Route path="/admin-client-detail" element={<ProtectedRoute><ClientDetailPage onNavigate={handleNavigate} /></ProtectedRoute>} />
        <Route path="/admin-history" element={<ProtectedRoute><AdminHistory onNavigate={handleNavigate} /></ProtectedRoute>} />
        <Route path="/admin-complaint" element={<ProtectedRoute><AdminComplaint onNavigate={handleNavigate} /></ProtectedRoute>} />
        <Route path="/admin-teknisi" element={<ProtectedRoute><ManajemenTeknisiPage onNavigate={handleNavigate} /></ProtectedRoute>} />
        <Route path="/admin-tariff" element={<ProtectedRoute><AdminTariff onNavigate={handleNavigate} /></ProtectedRoute>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
