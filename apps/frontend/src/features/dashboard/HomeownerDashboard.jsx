import React from 'react';
import './dashboard.css';

// Components
import EnergyChart from './components/EnergyChart';
import DeviceCard from './components/DeviceCard';
import EnvironmentCard from './components/EnvironmentCard';
import NotificationPanel from './components/NotificationPanel';
import ControlPanel from './components/ControlPanel';
import ComplaintSystem from './components/ComplaintSystem';

const HomeownerDashboard = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Welcome home, Aisyah 👋</h1>
          <p>Sistem BIEON Anda berfungsi normal hari ini.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="badge success" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            Hub: ONLINE
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', fontSize: '0.875rem' }}>
            Homeowner Role
          </span>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Kolom Kiri - Utama */}
        <div className="col-span-8">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Baris 1: Energi (Besar) */}
            <div style={{ height: '480px' }}>
              <EnergyChart />
            </div>
            
            {/* Baris 2: Device & Lingkungan (Sejajar) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              <EnvironmentCard />
              <DeviceCard />
            </div>
          </div>
        </div>

        {/* Kolom Kanan - Notif & Kontrol */}
        <div className="col-span-4">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
            
            <ControlPanel />
            
            <div style={{ flex: 1, maxHeight: '400px' }}>
              <NotificationPanel />
            </div>

            <ComplaintSystem />
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeownerDashboard;
