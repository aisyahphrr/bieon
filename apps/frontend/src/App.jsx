import React, { useState } from 'react';
import LandingPage from './features/general-page/LandingPage';
import Login from './features/general-page/login';
import Signup from './features/general-page/signup';
import Setup from './features/general-page/setup';
import { HomeownerDashboard } from './features/dashboard/HomeownerDashboard';
import { HomeownerHistory } from './features/dashboard/HomeownerHistory';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <>
      {currentPage === 'landing' && <LandingPage onNavigate={setCurrentPage} />}
      {currentPage === 'login' && <Login onNavigate={setCurrentPage} />}
      {currentPage === 'signup' && <Signup onNavigate={setCurrentPage} />}
      {currentPage === 'setup' && <Setup onNavigate={setCurrentPage} />}
      {currentPage === 'dashboard' && <HomeownerDashboard onNavigate={setCurrentPage} />}
      {currentPage === 'history' && <HomeownerHistory onNavigate={setCurrentPage} />}
    </>
  );
}

export default App;
