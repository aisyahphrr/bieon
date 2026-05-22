import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { io } from 'socket.io-client';
import { useNavigate, useLocation } from 'react-router-dom';

const MAX_LOGS = 120;

const toLogTime = (value) => {
  if (!value) return new Date().toISOString().replace('T', ' ').substring(0, 23);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().replace('T', ' ').substring(0, 23);
};

const asText = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const buildLog = (time, tag, msg) => ({ time, tag, msg });

export function DataLogSistemPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [logs, setLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const customerName = location.state?.customerName || "Sistem Global";
  const ownerId = location.state?.homeownerId || location.state?.ownerId || location.state?.userId || '';
  const bieonId = location.state?.bieonId || location.state?.systemId || '';
  const streamingRef = useRef(isStreaming);

  useEffect(() => {
    streamingRef.current = isStreaming;
  }, [isStreaming]);

  const appendLogs = useCallback((entries) => {
    if (!streamingRef.current || !entries || entries.length === 0) return;
    setLogs(prev => [...entries, ...prev].slice(0, MAX_LOGS));
  }, []);

  const normalizeEnergyRows = (rows) => rows.map((item) => buildLog(
    toLogTime(item.date || item.timestamp || item.createdAt),
    'PDM',
    `PDM ${item.device?.name || item.device || item.name || 'Power Meter'} | ${asText(item.totalKwh ?? item.kwh ?? 0)} kWh | ${asText(item.voltage ?? '-') } V | ${asText(item.current ?? '-') } A | ${asText(item.power ?? '-') } W`
  ));

  const normalizeActivityRows = (rows) => rows.map((item) => buildLog(
    toLogTime(item.timestamp || item.date || item.createdAt),
    'CMD',
    `${item.actuator || item.device || 'Perangkat'} => ${item.status || '-'}${item.trigger ? ` | trigger: ${item.trigger}` : ''}${item.details ? ` | ${item.details}` : ''}`
  ));

  const normalizeAlertRows = (rows) => rows.map((item) => buildLog(
    toLogTime(item.date || item.timestamp || item.createdAt),
    (String(item.type || item.status || 'INFO').toUpperCase().includes('WARN') || String(item.type || item.status || '').toLowerCase().includes('alert')) ? 'WARN' : 'INFO',
    `${item.category || 'Alert'}: ${item.messageKey || item.message || item.rawMessage || item.title || 'Notification'}`
  ));

  const normalizeSecurityRows = (rows) => rows.map((item) => buildLog(
    toLogTime(item.date || item.timestamp || item.createdAt),
    String(item.status || 'Aman').toLowerCase().includes('bahaya') ? 'ERR' : 'SYS',
    `Security ${item.room || '-'} | door: ${item.door || '-'} | motion: ${item.motion || '-'} | status: ${item.status || '-'}`
  ));

  const normalizeEnvironmentRows = (rows) => rows.map((item) => buildLog(
    toLogTime(item.date || item.timestamp || item.createdAt),
    'DATA',
    `Environment ${item.room || item.device || '-'} | temp: ${asText(item.avgTemperature ?? item.temperature ?? '-')} | humidity: ${asText(item.avgHumidity ?? item.humidity ?? '-')}`
  ));

  const normalizeWaterRows = (rows) => rows.map((item) => buildLog(
    toLogTime(item.date || item.timestamp || item.createdAt),
    'DATA',
    `Water ${item.device?.name || item.device || '-'} | pH: ${asText(item.ph ?? '-')}, turbidity: ${asText(item.turbidity ?? '-')}, temp: ${asText(item.temperature ?? item.temp ?? '-')}, tds: ${asText(item.tds ?? '-')}`
  ));

  const fetchLiveSnapshot = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const query = new URLSearchParams();
      if (ownerId) query.set('homeownerId', ownerId);
      if (bieonId) query.set('bieonId', bieonId);
      const suffix = query.toString() ? `?${query.toString()}` : '';

      const endpoints = [
        ['/api/history/energy', normalizeEnergyRows],
        ['/api/history/activity', normalizeActivityRows],
        ['/api/history/alerts', normalizeAlertRows],
        ['/api/history/security', normalizeSecurityRows],
        ['/api/history/environment', normalizeEnvironmentRows],
        ['/api/history/water', normalizeWaterRows]
      ];

      const batches = await Promise.all(endpoints.map(async ([endpoint, mapper]) => {
        try {
          const res = await fetch(`${endpoint}${suffix}`, { headers });
          const json = await res.json();
          if (json?.success && Array.isArray(json.data)) {
            return mapper(json.data);
          }
        } catch (err) {
          console.warn('[DATALOG] fetch failed:', endpoint, err?.message || err);
        }
        return [];
      }));

      const merged = batches.flat().sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setLogs(merged.slice(0, MAX_LOGS));
    } finally {
      setIsLoading(false);
    }
  }, [ownerId, bieonId]);

  useEffect(() => {
    fetchLiveSnapshot();
    if (!isStreaming) return undefined;

    const interval = setInterval(fetchLiveSnapshot, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveSnapshot, isStreaming]);

  useEffect(() => {
    const socket = io('/', { transports: ['websocket'] });

    socket.on('connect', () => {
      appendLogs([buildLog(toLogTime(), 'SYS', `Socket connected ${socket.id || ''}`.trim())]);
    });

    socket.on('system_log', (payload) => {
      const message = payload?.payload?.message || payload?.payload?.status || payload?.payload?.event || asText(payload?.payload);
      const tag = String(payload?.payload?.type || payload?.payload?.status || 'SYS').toUpperCase().includes('WARN') ? 'WARN' : 'SYS';
      appendLogs([buildLog(toLogTime(), tag, `${payload?.bieonId || 'BIEON'} | ${message}`)]);
    });

    socket.on('join_state', (payload) => {
      appendLogs([buildLog(toLogTime(), 'INFO', `Join ${payload?.state || 'unknown'} | ${payload?.bieonId || 'BIEON'}${payload?.payload?.duration ? ` | duration ${payload.payload.duration}s` : ''}`)]);
    });

    socket.on('device_discovered', (payload) => {
      appendLogs([buildLog(toLogTime(), 'DATA', `Discovered ${payload?.raw?.device_id || payload?.raw?.name || payload?.raw?.device_ieee || 'device'} | claimed=${Boolean(payload?.claimed)}`)]);
    });

    socket.on('device_telemetry', (payload) => {
      const deviceKey = payload?.device_ieee || payload?._id || payload?.id || 'device';
      appendLogs([buildLog(toLogTime(), 'DATA', `Telemetry ${deviceKey} | ${asText(payload?.value ?? payload?.currentValues ?? payload?.raw)}`)]);
    });

    return () => {
      socket.disconnect();
    };
  }, [appendLogs]);

  const liveStatusText = useMemo(() => {
    if (isLoading) return 'Syncing live diagnostics...';
    if (!isStreaming) return 'Live stream paused';
    return 'Live data from backend + socket';
  }, [isLoading, isStreaming]);

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
            <div className="px-4 py-2 bg-gradient-to-r from-bieon-eco to-bieon-sense/10 border border-bieon-eco/20 rounded-xl">
              <span className="text-bieon-eco text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-bieon-eco to-bieon-sense rounded-full animate-pulse" />
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

          <div className="bg-gradient-to-br from-bieon-eco to-bieon-sense p-6 rounded-[2rem] shadow-xl shadow-bieon-eco/20 flex items-center gap-5 border border-bieon-eco/30 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/80 text-opacity-80 uppercase tracking-[0.2em] mb-1">Security</p>
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
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">{liveStatusText}</p>
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
                  ? 'bg-bieon-eco text-white shadow-lg shadow-bieon-eco/20' 
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
                  <span className="text-bieon-eco font-black select-none w-14 shrink-0 animate-pulse">[RECV]</span>
                  <span className="text-bieon-eco italic font-black animate-pulse flex items-center gap-2">
                    Inbound telemetry stream active...
                    <span className="w-1.5 h-4 bg-gradient-to-r from-bieon-eco to-bieon-sense animate-bounce" />
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
              <span className="flex items-center gap-2 text-bieon-eco">
                <div className="w-2 h-2 bg-gradient-to-r from-bieon-eco to-bieon-sense rounded-full" />
                BIEON_RT_ENGINE_LIVE
              </span>
              <span>Buffer: {Math.min(logs.length, MAX_LOGS)}/{MAX_LOGS}</span>
              <span>{isLoading ? 'Syncing...' : 'Live Ready'}</span>
            </div>
            <div className="flex gap-6">
              <span className="bg-gray-200 px-2 py-0.5 rounded">UTF-8</span>
              <span>BIEON_RT_ENGINE v2.5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
