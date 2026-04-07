import React, { useState } from 'react';
import LandingPage from './features/general-page/LandingPage';
import Login from './features/general-page/login';
import Signup from './features/general-page/signup';
import Setup from './features/general-page/setup';
import { HomeownerDashboard } from './features/dashboard/HomeownerDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  return (
    <>
      {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
      {currentPage === 'login' && <Login onNavigate={setCurrentPage} />}
      {currentPage === 'signup' && <Signup onNavigate={setCurrentPage} />}
      {currentPage === 'setup' && <Setup onNavigate={setCurrentPage} />}
      {currentPage === 'dashboard' && <HomeownerDashboard />}
    </>
  );
}

export default App;
