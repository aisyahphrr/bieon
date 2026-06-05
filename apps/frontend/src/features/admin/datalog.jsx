import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('id') ? 'id' : 'en';
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('bieon_language', lang);
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [logs, setLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const customerName = location.state?.customerName || t('datalog.global_system', 'Sistem Global');
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
    if (isLoading) return t('datalog.status.syncing', 'Syncing live diagnostics...');
    if (!isStreaming) return t('datalog.status.paused', 'Live stream paused');
    return t('datalog.status.live', 'Live data from backend + socket');
  }, [isLoading, isStreaming, t]);

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
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="flex flex-row items-center justify-between w-full md:w-auto">
            <button
              onClick={() => {
                if (location.state?.returnTicketId) {
                  const role = location.state.sourceRole;
                  const targetPath = role === 'technician' ? '/technician-dashboard' : '/admin-complaint';
                  navigate(targetPath, { state: { openComplaintId: location.state.returnTicketId } });
                } else {
                  navigate(-1);
                }
              }}
              className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-bieon-eco transition-all shadow-sm group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-3 ml-4 md:hidden">
              <div className="px-4 py-2 bg-white border-2 border-bieon-eco/20 shadow-sm rounded-xl">
                <span className="text-bieon-eco text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 bg-bieon-eco rounded-full animate-pulse shadow-[0_0_8px_rgba(5,155,39,0.6)]" />
                  {t('datalog.live_monitoring_short', 'Live:')} {customerName}
                </span>
              </div>
              {/* Premium Language Pill Toggle Mobile */}
              <div className="flex items-center bg-bieon-eco/5 p-0.5 rounded-xl border border-bieon-eco/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] shrink-0 select-none">
                <button
                  onClick={() => handleLanguageChange('id')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all duration-300 ${
                    currentLang === 'id'
                      ? 'bg-white text-bieon-eco shadow-sm border border-bieon-eco/10 scale-100'
                      : 'text-slate-400 hover:text-bieon-eco bg-transparent'
                  }`}
                  title="Bahasa Indonesia"
                >
                  ID
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all duration-300 ${
                    currentLang === 'en'
                      ? 'bg-white text-bieon-eco shadow-sm border border-bieon-eco/10 scale-100'
                      : 'text-slate-400 hover:text-bieon-eco bg-transparent'
                  }`}
                  title="English"
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-[#235C50] tracking-tight">{t('datalog.title', 'Data Log & Diagnostics')}</h1>
            <p className="text-gray-500 text-sm font-medium">{t('datalog.subtitle', 'Monitoring Real-time Gateway Telemetry')}</p>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white border-2 border-bieon-eco/20 shadow-sm rounded-xl">
                <span className="text-bieon-eco text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 bg-bieon-eco rounded-full animate-pulse shadow-[0_0_8px_rgba(5,155,39,0.6)]" />
                  {t('datalog.live_monitoring', 'Live Monitoring:')} {customerName}
                </span>
              </div>
              {/* Premium Language Pill Toggle */}
              <div className="flex items-center bg-bieon-eco/5 p-0.5 rounded-xl border border-bieon-eco/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] shrink-0 select-none">
                <button
                  onClick={() => handleLanguageChange('id')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all duration-300 ${
                    currentLang === 'id'
                      ? 'bg-white text-bieon-eco shadow-sm border border-bieon-eco/10 scale-100'
                      : 'text-slate-400 hover:text-bieon-eco bg-transparent'
                  }`}
                  title="Bahasa Indonesia"
                >
                  ID
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all duration-300 ${
                    currentLang === 'en'
                      ? 'bg-white text-bieon-eco shadow-sm border border-bieon-eco/10 scale-100'
                      : 'text-slate-400 hover:text-bieon-eco bg-transparent'
                  }`}
                  title="English"
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-white p-3 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm border border-blue-100/50 flex items-center gap-3 md:gap-5 hover:shadow-md transition-all group">
            <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors rounded-xl md:rounded-2xl flex items-center justify-center border border-blue-100">
              <Activity className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0.5 truncate">{t('datalog.stats.uptime', 'Sistem Aktif')}</p>
              <p className="text-lg md:text-2xl font-black text-gray-900 leading-none">99.98%</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white p-3 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm border border-purple-100/50 flex items-center gap-3 md:gap-5 hover:shadow-md transition-all group">
            <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors rounded-xl md:rounded-2xl flex items-center justify-center border border-purple-100">
              <Cpu className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] md:text-[10px] font-black text-purple-500 uppercase tracking-widest mb-0.5 truncate">{t('datalog.stats.cpu_load', 'Beban CPU')}</p>
              <p className="text-lg md:text-2xl font-black text-gray-900 leading-none">12.4%</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-bieon-eco/5 to-white p-3 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm border border-bieon-eco/10 flex items-center gap-3 md:gap-5 hover:shadow-md transition-all group">
            <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 bg-bieon-eco/10 text-bieon-eco group-hover:bg-bieon-eco group-hover:text-white transition-colors rounded-xl md:rounded-2xl flex items-center justify-center border border-bieon-eco/20">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] md:text-[10px] font-black text-bieon-eco uppercase tracking-widest mb-0.5 truncate">{t('datalog.stats.security', 'Keamanan')}</p>
              <p className="text-lg md:text-2xl font-black text-gray-900 leading-none">WPA3-Enc</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50/50 to-white p-3 md:p-5 rounded-2xl md:rounded-[2rem] shadow-sm border border-amber-100/50 flex items-center gap-3 md:gap-5 hover:shadow-md transition-all group">
            <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors rounded-xl md:rounded-2xl flex items-center justify-center border border-amber-100">
              <Server className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest mb-0.5 truncate">{t('datalog.stats.node_status', 'Status Node')}</p>
              <p className="text-lg md:text-2xl font-black text-gray-900 leading-none">14 {t('history.status.aktif', 'Active')}</p>
            </div>
          </div>
        </div>

        {/* Main Console Box (LIGHT MODE TERMINAL) */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-200 overflow-hidden flex flex-col h-[650px] relative">
          {/* Toolbar */}
          <div className="px-6 md:px-8 py-4 md:py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/80 backdrop-blur-sm">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <Terminal className="w-5 h-5 text-bieon-eco" />
              </div>
              {!showSearch ? (
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-gray-800 font-mono tracking-wider truncate max-w-[200px] sm:max-w-none">BIEON_GATEWAY_V2.log</h3>
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter truncate">{liveStatusText}</p>
                </div>
              ) : (
                <div className="flex-1 max-w-md animate-in slide-in-from-left-4 duration-300 min-w-0">
                  <input
                    autoFocus
                    type="text"
                    placeholder={t('datalog.search_placeholder', 'Cari log (tipe atau kategori)...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-mono font-bold text-gray-800 outline-none focus:border-bieon-eco focus:ring-2 focus:ring-bieon-eco/20 transition-all placeholder:text-gray-400"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => setIsStreaming(!isStreaming)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                  isStreaming 
                  ? 'bg-bieon-eco text-white shadow-md shadow-bieon-eco/20' 
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}
              >
                {isStreaming ? t('datalog.live_streaming_btn', 'LIVE_STREAMING') : t('datalog.paused_btn', 'PAUSED')}
              </button>
              <div className="h-8 w-px bg-gray-200 mx-2" />
              <button 
                onClick={() => {
                  setShowSearch(!showSearch);
                  if (showSearch) setSearchTerm("");
                }}
                className={`p-2.5 rounded-xl transition-all border ${showSearch ? 'bg-gray-100 text-gray-800 border-gray-200' : 'border-transparent hover:bg-gray-100 hover:border-gray-200 text-gray-500'}`}
              >
                <Search className="w-4 h-4" />
              </button>
              <button 
                onClick={handleDownloadTxt}
                className="p-2.5 hover:bg-gray-100 hover:border-gray-200 border border-transparent rounded-xl transition-all text-gray-500"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Console Content (LIGHT BG) */}
          <div className="flex-1 p-4 md:p-10 overflow-y-auto font-mono text-[13px] leading-relaxed bg-white text-gray-700 selection:bg-bieon-eco/20 selection:text-bieon-eco custom-scrollbar">
            <div className="space-y-1.5 w-full overflow-x-auto custom-scrollbar-x pb-4">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, i) => (
                  <div key={i} className="flex gap-8 group hover:bg-gray-50 px-2 -mx-2 rounded transition-colors whitespace-nowrap">
                    <span className="text-gray-400 font-medium select-none w-48 shrink-0">{log.time}</span>
                    <span className={`font-black select-none w-14 shrink-0 ${
                      log.tag === 'DATA' ? 'text-blue-600' :
                      log.tag === 'ERR' ? 'text-red-600' :
                      log.tag === 'WARN' ? 'text-amber-600' :
                      log.tag === 'CMD' ? 'text-purple-600' :
                      'text-gray-500'
                    }`}>[{log.tag}]</span>
                    <span className="flex-1 text-gray-800 font-medium break-all">{log.msg}</span>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-gray-400 italic">
                    {t('datalog.no_logs_match', 'Tidak ada log yang cocok dengan pencarian Anda: "{{search}}"', { search: searchTerm })}
                  </p>
                </div>
              )}
              
              {isStreaming && !searchTerm && (
                <div className="flex gap-8 pt-4 pb-20 whitespace-nowrap">
                  <span className="text-gray-400 font-medium select-none w-48 shrink-0">
                    {new Date().toISOString().replace('T', ' ').substring(0, 23)}
                  </span>
                  <span className="text-bieon-eco font-black select-none w-14 shrink-0 animate-pulse">[RECV]</span>
                  <span className="text-bieon-eco/80 italic font-medium animate-pulse flex items-center gap-2">
                    {t('datalog.stream_active', 'Aliran telemetri masuk aktif...')}
                    <span className="w-1.5 h-4 bg-bieon-eco animate-bounce" />
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Console Overlay Bottom Fade */}
          <div className="absolute bottom-12 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />

          {/* Console Footer */}
          <div className="h-auto min-h-fit px-6 md:px-8 py-3 md:py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 font-mono text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-widest relative z-10">
            <div className="flex flex-wrap gap-x-6 gap-y-1.5">
              <span className="flex items-center gap-2 text-bieon-eco">
                <div className="w-2 h-2 bg-bieon-eco rounded-full shadow-[0_0_8px_rgba(5,155,39,0.4)] animate-pulse" />
                BIEON_RT_ENGINE_LIVE
              </span>
              <span>{t('datalog.stats.buffer', 'Buffer:')} {Math.min(logs.length, MAX_LOGS)}/{MAX_LOGS}</span>
              <span>{isLoading ? t('history.loading', 'Syncing...') : t('datalog.live_ready', 'Live Ready')}</span>
            </div>
            <div className="flex gap-6 shrink-0">
              <span className="bg-white text-gray-600 px-2 py-0.5 rounded border border-gray-200">UTF-8</span>
              <span>BIEON_RT_ENGINE v2.5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
