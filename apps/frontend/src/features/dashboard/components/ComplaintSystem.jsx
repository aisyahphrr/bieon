import React, { useState } from 'react';

const ComplaintSystem = () => {
  const [formData, setFormData] = useState({ title: '', room: '', desc: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setFormData({ title: '', room: '', desc: '' });
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <div className="glass-card">
      <h3 className="card-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        Complaint / Ticketing
      </h3>

      {status === 'success' ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <svg width="48" height="48" style={{ color: 'var(--accent-green)', marginBottom: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path>
          </svg>
          <h4>Tiket Dibuat!</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Teknisi akan segera meninjau laporan Anda.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Judul Kendala</label>
            <input 
              required
              type="text" 
              className="form-control" 
              placeholder="Contoh: AC Bocor"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Lokasi / Ruangan</label>
            <select className="form-control" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} required>
              <option value="">Pilih Area</option>
              <option value="R1">Ruang Tamu (R1)</option>
              <option value="R2">Kamar Utama (R2)</option>
              <option value="Outdoor">Outdoor / Taman</option>
            </select>
          </div>
          <div className="form-group">
            <label>Deskripsi</label>
            <textarea 
              required
              className="form-control" 
              rows="3" 
              placeholder="Jelaskan kendala secara singkat..."
              value={formData.desc}
              onChange={e => setFormData({...formData, desc: e.target.value})}
            ></textarea>
          </div>
          <button type="submit" className="btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Mengirim...' : 'Buat Tiket Baru'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ComplaintSystem;
