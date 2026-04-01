import React, { useState } from 'react';

const ControlPanel = () => {
  const [acTemp, setAcTemp] = useState(24);
  const [autoOverride, setAutoOverride] = useState(true);

  return (
    <div className="glass-card">
      <h3 className="card-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        Manual Control Override
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Automation Engine</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>BIEON AI Smart Logic</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={autoOverride} onChange={() => setAutoOverride(!autoOverride)} />
            <span className="slider"></span>
          </label>
        </div>

        <hr style={{ borderColor: 'var(--border-light)', margin: 0 }} />

        <div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>Suhu AC Master Bed</span>
            <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{acTemp}°C</span>
          </div>
          <input 
            type="range" 
            min="16" max="30" 
            value={acTemp} 
            onChange={(e) => setAcTemp(parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-cyan)' }}
          />
        </div>
        
      </div>
    </div>
  );
};

export default ControlPanel;
