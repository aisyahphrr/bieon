import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

// Mock Data Harian (00:00 - 23:00)
const dailyData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i < 10 ? '0' : ''}${i}:00`,
  kWh: Number((Math.random() * 2 + 0.5).toFixed(2))
}));

// Mock Data Bulanan
const monthlyData = [
  { month: 'Jan', kWh: 420 }, { month: 'Feb', kWh: 380 },
  { month: 'Mar', kWh: 450 }, { month: 'Apr', kWh: 510 },
  { month: 'May', kWh: 490 }, { month: 'Jun', kWh: 550 },
  { month: 'Jul', kWh: 600 }, { month: 'Aug', kWh: 580 },
  { month: 'Sep', kWh: 520 }, { month: 'Oct', kWh: 470 },
  { month: 'Nov', kWh: 410 }, { month: 'Dec', kWh: 440 },
];

const EnergyChart = () => {
  const [view, setView] = useState('daily'); // 'daily' | 'monthly'

  const totalToday = dailyData.reduce((acc, curr) => acc + curr.kWh, 0).toFixed(1);
  const estCost = (totalToday * 1444.70).toLocaleString('id-ID'); // Asumsi tarif dasar listrik

  return (
    <div className="glass-card h-full">
      <div className="flex-between">
        <h3 className="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          Konsumsi Energi
        </h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button 
            onClick={() => setView('daily')}
            style={{ 
              background: view === 'daily' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: view === 'daily' ? '#10b981' : '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '4px 12px', borderRadius: '16px', cursor: 'pointer'
            }}
          >Harian</button>
          <button 
            onClick={() => setView('monthly')}
            style={{ 
              background: view === 'monthly' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: view === 'monthly' ? '#10b981' : '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '4px 12px', borderRadius: '16px', cursor: 'pointer'
            }}
          >Bulanan</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 4px 0' }}>Total (Hari Ini)</p>
          <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--accent-cyan)' }}>{totalToday} <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>kWh</span></h2>
        </div>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 4px 0' }}>Estimasi Biaya</p>
          <h2 style={{ margin: 0, fontSize: '2rem' }}>Rp {estCost}</h2>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          {view === 'daily' ? (
            <LineChart data={dailyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Line type="monotone" dataKey="kWh" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          ) : (
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickMargin={10} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="kWh" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyChart;
