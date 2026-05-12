import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  ArrowLeft, 
  Terminal,
  Activity,
  Cpu,
  ShieldCheck,
  Server
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MOCK_RAW_LOGS = [
  { time: '2026-05-08 16:30:01.002', tag: 'SYS', msg: 'Kernel initialization complete. BIEON_CORE_RT_OS v2.4.1 loaded.' },
  { time: '2026-05-08 16:30:01.045', tag: 'NET', msg: 'Network stack UP. Local IP: 192.168.1.104. Gateway: 192.168.1.1' },
  { time: '2026-05-08 16:30:01.080', tag: 'MQTT', msg: 'Connected to broker: mqtt://bieon-prod-01.cloud (Auth: SUCCESS)' },
  { time: '2026-05-08 16:30:02.112', tag: 'DATA', msg: 'RX: {"hub":"HN001", "node":"R1", "type":"TEMP", "val":26.4, "u":"C"}' },
  { time: '2026-05-08 16:30:02.450', tag: 'DATA', msg: 'RX: {"hub":"HN001", "node":"R1", "type":"HUM", "val":65.2, "u":"%"}' },
  { time: '2026-05-08 16:30:03.900', tag: 'WARN', msg: 'Node HN005 reporting high noise level on Zigbee channel 11. Rerouting...' },
  { time: '2026-05-08 16:30:04.120', tag: 'DATA', msg: 'RX: {"hub":"HN002", "node":"R2", "type":"PLUG", "st":1, "load":45.2, "v":220}' },
  { time: '2026-05-08 16:30:05.667', tag: 'SYS', msg: 'Health Check: 14/14 nodes responding. System Latency: 42ms' },
  { time: '2026-05-08 16:30:06.001', tag: 'DATA', msg: 'RX: {"hub":"HN001", "node":"R1", "type":"TEMP", "val":26.5, "u":"C"}' },
  { time: '2026-05-08 16:30:07.234', tag: 'CMD', msg: 'TX: {"id":"9821", "t":"PLUG_02", "p":{"state":0}, "sig":"2f91a"}' },
  { time: '2026-05-08 16:30:07.450', tag: 'ACK', msg: 'RX: {"id":"9821", "res":"SUCCESS", "ts":1715124307}' },
  { time: '2026-05-08 16:30:08.112', tag: 'INFO', msg: 'Auto-balancing energy distribution for Cluster_A (Priority: BALANCED)' },
  { time: '2026-05-08 16:30:09.900', tag: 'DATA', msg: 'RX: {"hub":"HN005", "node":"R2", "type":"AIR", "aqi":42, "pm25":11}' },
  { time: '2026-05-08 16:30:10.450', tag: 'DATA', msg: 'RX: {"hub":"HN001", "node":"R1", "type":"TEMP", "val":26.5, "u":"C"}' },
  { time: '2026-05-08 16:30:11.230', tag: 'ERR', msg: 'FAILED_TO_SYNC: Node HN008 handshake timeout. Retrying in 5s...' },
  { time: '2026-05-08 16:30:12.120', tag: 'DATA', msg: 'RX: {"hub":"HN001", "node":"R1", "type":"HUM", "val":64.9, "u":"%"}' },
  { time: '2026-05-08 16:30:13.450', tag: 'SYS', msg: 'Syncing Real-Time Clock with NTP server (id.pool.ntp.org)... OK.' },
  { time: '2026-05-08 16:30:14.900', tag: 'DATA', msg: 'RX: {"hub":"HN002", "node":"R2", "type":"PLUG", "st":1, "load":44.8, "v":221}' },
  { time: '2026-05-08 16:30:15.667', tag: 'DATA', msg: 'RX: {"hub":"HN001", "node":"R1", "type":"TEMP", "val":26.6, "u":"C"}' },
  { time: '2026-05-08 16:30:16.234', tag: 'WARN', msg: 'Battery low (12%) on Node HN004 (Leak Sensor). Notify user.' },
  { time: '2026-05-08 16:30:17.450', tag: 'DATA', msg: 'RX: {"hub":"HN003", "node":"R3", "type":"PLUG", "st":0}' },
  { time: '2026-05-08 16:30:18.112', tag: 'SYS', msg: 'Memory Management: Allocated 128MB buffer for batch data stream.' },
  { time: '2026-05-08 16:30:19.900', tag: 'DATA', msg: 'RX: {"hub":"HN005", "node":"R2", "type":"AIR", "aqi":41, "pm25":10}' },
  { time: '2026-05-08 16:30:21.000', tag: 'DATA', msg: 'RX: {"hub":"HN001", "node":"R1", "type":"TEMP", "val":26.6, "u":"C"}' },
];

export function DataLogSistemPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [logs, setLogs] = useState(MOCK_RAW_LOGS);
  const [isStreaming, setIsStreaming] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const customerName = location.state?.customerName || "Sistem Global";

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      // Simulate real-time updates
      const newLog = {
        time: new Date().toISOString().replace('T', ' ').substring(0, 23),
        tag: Math.random() > 0.8 ? 'WARN' : 'DATA',
        msg: `RX: {"hub":"HN001", "node":"R1", "type":"TELEMETRY", "ts":${Date.now()}}`
      };
      setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50
    }, 2000);
    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleDownloadTxt = () => {
    const header = `BIEON SMART GATEWAY LOG\n` +
                 `========================\n` +
                 `Client: ${customerName}\n` +
                 `Generated: ${new Date().toLocaleString()}\n` +
                 `------------------------\n\n`;
    
    const logContent = logs.map(l => `${l.time} [${l.tag}] ${l.msg}`).join('\n');
    const blob = new Blob([header + logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bieon_log_${customerName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => 
    log.msg.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.time.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-[#235C50] tracking-tight">Data Log & Diagnostics</h1>
              <p className="text-gray-500 text-sm font-medium">Monitoring Real-time Gateway Telemetry</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-[#009b7c]/10 border border-[#009b7c]/20 rounded-xl">
              <span className="text-[#009b7c] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-[#009b7c] rounded-full animate-pulse" />
                Live Monitoring: {customerName}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-[2rem] shadow-xl shadow-blue-200/50 flex items-center gap-5 border border-blue-400/30 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-1">Uptime</p>
              <p className="text-2xl font-black text-white leading-none">99.98%</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-[2rem] shadow-xl shadow-purple-200/50 flex items-center gap-5 border border-purple-400/30 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Cpu className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-purple-100 uppercase tracking-[0.2em] mb-1">CPU Load</p>
              <p className="text-2xl font-black text-white leading-none">12.4%</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#009b7c] to-[#007d64] p-6 rounded-[2rem] shadow-xl shadow-emerald-200/50 flex items-center gap-5 border border-[#009b7c]/30 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-50 text-opacity-80 uppercase tracking-[0.2em] mb-1">Security</p>
              <p className="text-2xl font-black text-white leading-none">WPA3-Enc</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-[2rem] shadow-xl shadow-amber-200/50 flex items-center gap-5 border border-amber-400/30 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Server className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-50 text-opacity-80 uppercase tracking-[0.2em] mb-1">Node Status</p>
              <p className="text-2xl font-black text-white leading-none">14 Active</p>
            </div>
          </div>
        </div>

        {/* Main Console Box (TXT STYLE) */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-gray-100 overflow-hidden flex flex-col h-[650px] relative">
          {/* Toolbar */}
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              {!showSearch ? (
                <div>
                  <h3 className="text-sm font-black text-gray-900 font-mono">BIEON_GATEWAY_V2.log</h3>
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">Connected via MQTT @ 192.168.1.45</p>
                </div>
              ) : (
                <div className="flex-1 max-w-md animate-in slide-in-from-left-4 duration-300">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search logs (type or category)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-2 text-xs font-mono font-bold outline-none focus:border-black transition-all"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsStreaming(!isStreaming)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                  isStreaming 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                  : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isStreaming ? 'LIVE_STREAMING' : 'PAUSED'}
              </button>
              <div className="h-8 w-px bg-gray-200 mx-2" />
              <button 
                onClick={() => {
                  setShowSearch(!showSearch);
                  if (showSearch) setSearchTerm("");
                }}
                className={`p-2.5 rounded-xl transition-all ${showSearch ? 'bg-black text-white' : 'hover:bg-white hover:shadow-md text-gray-400'}`}
              >
                <Search className="w-4 h-4" />
              </button>
              <button 
                onClick={handleDownloadTxt}
                className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-400"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Console Content (WHITE BG, BLACK TEXT) */}
          <div className="flex-1 p-10 overflow-y-auto font-mono text-[13px] leading-relaxed bg-white text-black selection:bg-black selection:text-white scrollbar-hide">
            <div className="space-y-1.5">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, i) => (
                  <div key={i} className="flex gap-8 group hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                    <span className="text-gray-600 font-medium select-none w-48 shrink-0">{log.time}</span>
                    <span className={`font-black select-none w-14 shrink-0 ${
                      log.tag === 'DATA' ? 'text-blue-700' :
                      log.tag === 'ERR' ? 'text-red-700' :
                      log.tag === 'WARN' ? 'text-amber-700' :
                      log.tag === 'CMD' ? 'text-purple-700' :
                      'text-gray-700'
                    }`}>[{log.tag}]</span>
                    <span className="flex-1 text-gray-900 font-semibold break-all">{log.msg}</span>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-gray-400 italic">No logs match your search: "{searchTerm}"</p>
                </div>
              )}
              
              {isStreaming && !searchTerm && (
                <div className="flex gap-8 pt-4 pb-20">
                  <span className="text-gray-600 font-medium select-none w-48 shrink-0">
                    {new Date().toISOString().replace('T', ' ').substring(0, 23)}
                  </span>
                  <span className="text-[#009b7c] font-black select-none w-14 shrink-0 animate-pulse">[RECV]</span>
                  <span className="text-[#009b7c] italic font-black animate-pulse flex items-center gap-2">
                    Inbound telemetry stream active...
                    <span className="w-1.5 h-4 bg-[#009b7c] animate-bounce" />
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Console Overlay Bottom Fade */}
          <div className="absolute bottom-16 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />

          {/* Console Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between font-mono text-[10px] text-black font-black uppercase tracking-widest">
            <div className="flex gap-10">
              <span className="flex items-center gap-2 text-[#009b7c]">
                <div className="w-2 h-2 bg-[#009b7c] rounded-full" />
                BIEON_RT_ENGINE_STABLE
              </span>
              <span>Buffer: 1024KB / 4096KB</span>
              <span>Latency: 12.4ms</span>
            </div>
            <div className="flex gap-6">
              <span className="bg-gray-200 px-2 py-0.5 rounded">UTF-8</span>
              <span>BIEON_RT_ENGINE v2.4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
