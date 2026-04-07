import React, { useState } from 'react';
import LandingPage from './features/general-page/LandingPage';
import Login from './features/general-page/login';
import Signup from './features/general-page/signup';
import Setup from './features/general-page/setup';
import { HomeownerDashboard } from './features/dashboard/HomeownerDashboard';
import { HomeownerHistory } from './features/dashboard/HomeownerHistory';
import { DeviceControlPage } from './features/dashboard/kendali';
import { TechnicianDashboard } from './features/technician/TechnicianDashboard';
<<<<<<< HEAD
import { HomeownerComplaint } from './features/dashboard/HomeownerComplaint';
=======
import SuperAdminDashboard from './features/admin/SuperAdminDashboard';
import ClientDetailPage from './features/admin/ClientDetailPage';
>>>>>>> 6c0e3716914d4c1818421953ec2e52f4063fa589


function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <>
      {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
      {currentPage === 'login' && <Login onNavigate={setCurrentPage} />}
      {currentPage === 'signup' && <Signup onNavigate={setCurrentPage} />}
      {currentPage === 'setup' && <Setup onNavigate={setCurrentPage} />}
      {currentPage === 'dashboard' && <HomeownerDashboard onNavigate={setCurrentPage} />}
      {currentPage === 'history' && <HomeownerHistory onNavigate={setCurrentPage} />}
      {currentPage === 'kendali' && <DeviceControlPage onNavigate={setCurrentPage} />}
      {currentPage === 'teknisi' && <TechnicianDashboard onNavigate={setCurrentPage} />}
<<<<<<< HEAD
      {currentPage === 'pengaduan' && <HomeownerComplaint onNavigate={setCurrentPage} />}
=======
      {currentPage === 'admin' && <SuperAdminDashboard onNavigate={setCurrentPage} />}
      {currentPage === 'admin-client-detail' && <ClientDetailPage onNavigate={setCurrentPage} />}


>>>>>>> 6c0e3716914d4c1818421953ec2e52f4063fa589
    </>

  );
}

export default App;
