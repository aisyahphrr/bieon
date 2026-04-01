import React from 'react';

const EnvironmentCard = () => {
  // Mock Data
  const envData = {
    temp: { value: 24.5, unit: '°C', status: 'good' },
    humidity: { value: 65, unit: '%', status: 'good' },
    co2: { value: 850, unit: 'ppm', status: 'warning' },
    waterPh: { value: 7.2, unit: 'pH', status: 'good' },
  };

  const renderStatus = (status) => {
    switch(status) {
      case 'good': return <span className="status-good">Normal</span>;
      case 'warning': return <span className="status-warning">Waspada</span>;
      case 'bad': return <span className="status-bad">Buruk</span>;
      default: return null;
    }
  };

  return (
    <div className="glass-card">
      <h3 className="card-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Environment Monitor
      </h3>

      <div className="env-grid">
        <div className="env-item">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Suhu Udara</div>
          <div className="env-value">{envData.temp.value}<span style={{fontSize: '1rem'}}>{envData.temp.unit}</span></div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{renderStatus(envData.temp.status)}</div>
        </div>
        
        <div className="env-item">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Kelembapan</div>
          <div className="env-value">{envData.humidity.value}<span style={{fontSize: '1rem'}}>{envData.humidity.unit}</span></div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{renderStatus(envData.humidity.status)}</div>
        </div>

        <div className="env-item">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Level CO2</div>
          <div className="env-value" style={{ color: 'var(--accent-warning)' }}>{envData.co2.value}<span style={{fontSize: '1rem', color: 'var(--text-main)'}}>{envData.co2.unit}</span></div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{renderStatus(envData.co2.status)}</div>
        </div>

        <div className="env-item">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>pH Air</div>
          <div className="env-value">{envData.waterPh.value}<span style={{fontSize: '1rem'}}>{envData.waterPh.unit}</span></div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{renderStatus(envData.waterPh.status)}</div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentCard;
