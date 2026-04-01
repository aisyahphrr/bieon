import React from 'react';

const NotificationPanel = () => {
  const notifs = [
    { id: 1, title: 'Motion Detected', desc: 'Gerakan terdeteksi di Garasi Depan', time: 'Baru saja', type: 'warning', icon: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.3 1.5 1.5 2.5' },
    { id: 2, title: 'Sensor Anomaly', desc: 'Kelembapan Ruang Server > 80%', time: '10 menit lalu', type: 'danger', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
    { id: 3, title: 'Door Sensor', desc: 'Pintu Teras Terbuka', time: '1 jam lalu', type: 'warning', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
    { id: 4, title: 'System Info', desc: 'Pembaruan Firmware BIEON Hub Selesai', time: 'Kemarin', type: 'success', icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' },
  ];

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 className="card-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        Notification Panel
      </h3>
      
      <div className="notif-list" style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
        {notifs.map(n => (
          <div key={n.id} className={`notif-item ${n.type}`}>
            <div style={{ marginTop: '2px', color: n.type === 'danger' ? 'var(--accent-danger)' : n.type === 'warning' ? 'var(--accent-warning)' : 'var(--accent-green)'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={n.icon} />
                {n.type === 'success' && <path d="M22 4L12 14.01l-3-3" />}
                {n.type === 'danger' && <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />}
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>{n.desc}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '6px', opacity: 0.7 }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
