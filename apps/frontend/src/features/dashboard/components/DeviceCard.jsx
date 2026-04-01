import React, { useState } from 'react';

const initialDevices = [
  { id: 1, name: 'Lampu R. Tamu', room: 'R1', isOn: true, type: 'light' },
  { id: 2, name: 'AC Master Bed', room: 'R2', isOn: true, type: 'ac' },
  { id: 3, name: 'Smart TV', room: 'R1', isOn: false, type: 'tv' },
  { id: 4, name: 'Water Pump', room: 'Yard', isOn: false, type: 'pump' },
];

const DeviceCard = () => {
  const [devices, setDevices] = useState(initialDevices);

  const toggleDevice = (id) => {
    setDevices(prev => 
      prev.map(dev => dev.id === id ? { ...dev, isOn: !dev.isOn } : dev)
    );
  };

  const activeCount = devices.filter(d => d.isOn).length;

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className="card-title" style={{ margin: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          Device Overview
        </h3>
        <span className="badge success">{activeCount} Aktif / {devices.length} Total</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {devices.map(device => (
          <div key={device.id} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
            border: device.isOn ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', 
                background: device.isOn ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: device.isOn ? '#10b981' : '#94a3b8'
              }}>
                {device.type === 'light' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>}
                {device.type === 'ac' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                {device.type === 'tv' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>}
                {device.type === 'pump' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{device.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room: {device.room}</div>
              </div>
            </div>

            <label className="toggle-switch">
              <input type="checkbox" checked={device.isOn} onChange={() => toggleDevice(device.id)} />
              <span className="slider"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceCard;
