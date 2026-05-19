import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Download,
    Zap,
    Bell,
    MessageSquare,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
    FileText,
    ClipboardList
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import NotificationPopup from '../../components/NotificationPopup';
import HomeownerLayout from './HomeownerLayout';
import { StatusBadge } from '../../shared/StatusBadge';
import { useTranslation } from 'react-i18next';
import i18n_core from 'i18next';

export function HomeownerHistory({ onNavigate }) {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('Kenyamanan');
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExportingAll, setIsExportingAll] = useState(false);
    const [error, setError] = useState(null);

    // Search, Filter, Pagination, Sort states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoomFilter, setSelectedRoomFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const tabs = [
        { id: 'Kenyamanan', full: t('history.comfort'), short: t('history.comfort'), endpoint: '/api/history/environment' },
        { id: 'Keamanan', full: t('history.security'), short: t('history.security'), endpoint: '/api/history/security' },
        { id: 'Kualitas Air', full: t('history.water_quality'), short: t('history.water_quality'), endpoint: '/api/history/water' },
        { id: 'Konsumsi Energi', full: t('history.energy'), short: t('history.energy'), endpoint: '/api/history/energy' },
        { id: 'Log Perangkat', full: t('history.device_logs'), short: t('history.device_logs'), endpoint: '/api/history/activity' },
        { id: 'Notifikasi & Alert', full: t('history.notifications'), short: t('history.notifications'), endpoint: '/api/history/alerts' }
    ];

    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const localizeStatus = (s) => {
        if (!s) return s;
        const key = s.toLowerCase().replace(/\s+/g, '_');
        return t(`history.status.${key}`, s);
    };

    const localizeTrigger = (trig) => {
        if (!trig) return trig;
        const key = trig.toLowerCase();
        return t(`history.trigger.${key}`, trig);
    };

    const mapItemData = (tabId, item, index) => {
        const rawTime = item.date || item.timestamp || item.createdAt;
        const base = {
            id: item._id || index,
            rawTime: rawTime
        };

        if (tabId === 'Kenyamanan') {
            return { ...base, room: item.room, temp: item.avgTemperature, humidity: item.avgHumidity, rawStatus: item.status };
        }
        if (tabId === 'Keamanan') {
            return { ...base, room: item.room, rawDoor: item.door, rawMotion: item.motion, rawStatus: item.status };
        }
        if (tabId === 'Kualitas Air') {
            return { ...base, device: item.device, ph: item.ph, turbidity: item.turbidity, temp: item.temperature, tds: item.tds, rawStatus: item.status };
        }
        if (tabId === 'Konsumsi Energi') {
            return {
                ...base,
                device: item.device?.name || item.device || t('history.columns.power_meter_main', 'Power Meter Utama'),
                kwh: item.totalKwh + ' kWh',
                voltage: item.voltage + ' V',
                current: item.current + ' A',
                power: item.power + ' W',
                pf: item.pf + ' PF'
            };
        }
        if (tabId === 'Log Perangkat') {
            return { ...base, room: item.room, actuator: item.actuator, rawStatus: item.status, trigger: item.trigger };
        }
        if (tabId === 'Notifikasi & Alert') {
            return { 
                ...base, 
                device: item.room || item.deviceName || t('history.general', 'Umum'),
                rawCategory: item.category, 
                rawStatus: item.status || item.type, 
                messageKey: item.messageKey,
                metadata: item.metadata,
                rawMessage: item.message 
            };
        }
        return item;
    };

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const currentTabConfig = tabs.find(t => t.id === activeTab);
            let url = currentTabConfig.endpoint;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Gagal mengambil data riwayat');

            const result = await response.json();
            const mappedData = result.data.map((item, index) => mapItemData(activeTab, item, index));
            setHistoryData(mappedData);
        } catch (err) {
            console.error('FETCH ERROR:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const processedData = useMemo(() => {
        let filtered = [...historyData];

        if (selectedRoomFilter) {
            filtered = filtered.filter(item => {
                if (['Kualitas Air', 'Konsumsi Energi'].includes(activeTab)) return item.device === selectedRoomFilter;
                if (activeTab === 'Notifikasi & Alert') return item.category === selectedRoomFilter;
                return item.room === selectedRoomFilter;
            });
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(item => {
                const timeStr = item.time.toLowerCase();
                const statusStr = item.status ? item.status.toLowerCase() : '';

                if (activeTab === 'Kenyamanan') {
                    return timeStr.includes(q) || item.room.toLowerCase().includes(q) || statusStr.includes(q) ||
                        item.temp.toString().toLowerCase().includes(q) || item.humidity.toLowerCase().includes(q);
                } else if (activeTab === 'Keamanan') {
                    return timeStr.includes(q) || item.room.toLowerCase().includes(q) || statusStr.includes(q) ||
                        item.door.toLowerCase().includes(q) || item.motion.toLowerCase().includes(q);
                } else if (activeTab === 'Kualitas Air') {
                    return timeStr.includes(q) || item.device.toLowerCase().includes(q) || statusStr.includes(q) ||
                        item.ph.toString().toLowerCase().includes(q) || item.turbidity.toLowerCase().includes(q) ||
                        item.temp.toLowerCase().includes(q) || item.tds.toLowerCase().includes(q);
                } else if (activeTab === 'Konsumsi Energi') {
                    return timeStr.includes(q) || item.device.toLowerCase().includes(q) ||
                        item.kwh.toLowerCase().includes(q) || item.voltage.toLowerCase().includes(q) ||
                        item.current.toLowerCase().includes(q) || item.power.toLowerCase().includes(q) || item.pf.toLowerCase().includes(q);
                } else if (activeTab === 'Log Perangkat') {
                    return timeStr.includes(q) || item.room.toLowerCase().includes(q) || statusStr.includes(q) ||
                        item.actuator.toLowerCase().includes(q) || item.trigger.toLowerCase().includes(q);
                } else if (activeTab === 'Notifikasi & Alert') {
                    return timeStr.includes(q) || item.rawCategory?.toLowerCase().includes(q) ||
                        statusStr.includes(q) || (item.messageKey ? t(item.messageKey, item.metadata) : item.rawMessage || '').toLowerCase().includes(q);
                }
                return false;
            });
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'temp' && activeTab === 'Kenyamanan') {
                    aVal = parseFloat(aVal);
                    bVal = parseFloat(bVal);
                } else if (sortConfig.key === 'temp' && activeTab === 'Kualitas Air') {
                    aVal = parseFloat(aVal.toString().replace('°C', ''));
                    bVal = parseFloat(bVal.toString().replace('°C', ''));
                } else if (sortConfig.key === 'humidity' || sortConfig.key === 'turbidity' || sortConfig.key === 'tds') {
                    aVal = parseFloat(aVal.toString().replace(/[^0-9.]/g, ''));
                    bVal = parseFloat(bVal.toString().replace(/[^0-9.]/g, ''));
                } else if (sortConfig.key === 'ph') {
                    aVal = parseFloat(aVal.toString().replace('+', ''));
                    bVal = parseFloat(bVal.toString().replace('+', ''));
                } else if (['kwh', 'voltage', 'current', 'power', 'pf'].includes(sortConfig.key)) {
                    aVal = parseFloat(aVal.toString().replace(/[^0-9.]/g, ''));
                    bVal = parseFloat(bVal.toString().replace(/[^0-9.]/g, ''));
                } else if (sortConfig.key === 'time') {
                    aVal = new Date(a.rawTime).getTime();
                    bVal = new Date(b.rawTime).getTime();
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [activeTab, historyData, searchQuery, selectedRoomFilter, sortConfig]);

    const availableFilters = useMemo(() => {
        if (['Kualitas Air', 'Konsumsi Energi'].includes(activeTab)) {
            return Array.from(new Set(historyData.map(d => d.device))).filter(Boolean);
        }
        if (activeTab === 'Notifikasi & Alert') {
            return Array.from(new Set(historyData.map(d => d.rawCategory))).filter(Boolean);
        }
        return Array.from(new Set(historyData.map(d => d.room))).filter(Boolean);
    }, [activeTab, historyData]);

    const activeTabsConfigured = ['Kenyamanan', 'Keamanan', 'Kualitas Air', 'Konsumsi Energi', 'Log Perangkat', 'Notifikasi & Alert'];

    const totalItems = processedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = processedData.slice(startIndex, startIndex + rowsPerPage);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const generateTableConfig = (tabId, data) => {
        let headers = [];
        let body = [];

        if (tabId === 'Kenyamanan') {
            headers = [[t('history.columns.time'), t('history.columns.room'), t('history.columns.temperature'), t('history.columns.humidity'), t('history.columns.status')]];
            body = data.map(e => [formatDateTime(e.rawTime), e.room, `${e.temp}°C`, e.humidity, localizeStatus(e.rawStatus)]);
        } else if (tabId === 'Keamanan') {
            headers = [[t('history.columns.time'), t('history.columns.room'), t('history.columns.door_sensor'), t('history.columns.motion_sensor'), t('history.columns.status')]];
            body = data.map(e => [formatDateTime(e.rawTime), e.room, localizeStatus(e.rawDoor), localizeStatus(e.rawMotion), localizeStatus(e.rawStatus)]);
        } else if (tabId === 'Kualitas Air') {
            headers = [[t('history.columns.time'), t('history.columns.device'), t('history.columns.ph'), t('history.columns.turbidity'), t('history.columns.temperature'), t('history.columns.tds'), t('history.columns.status')]];
            body = data.map(e => [formatDateTime(e.rawTime), e.device, e.ph, e.turbidity, e.temp, e.tds, localizeStatus(e.rawStatus)]);
        } else if (tabId === 'Konsumsi Energi') {
            headers = [[t('history.columns.time'), t('history.columns.device'), t('history.columns.energy'), t('history.columns.voltage'), t('history.columns.current'), t('history.columns.power_load'), t('history.columns.power_factor')]];
            body = data.map(e => [formatDateTime(e.rawTime), e.device, e.kwh, e.voltage, e.current, e.power, e.pf]);
        } else if (tabId === 'Log Perangkat') {
            headers = [[t('history.columns.time'), t('history.columns.room'), t('history.columns.actuator'), t('history.columns.status'), t('history.columns.trigger')]];
            body = data.map(e => [formatDateTime(e.rawTime), e.room, e.actuator, localizeStatus(e.rawStatus), localizeTrigger(e.trigger)]);
        } else if (tabId === 'Notifikasi & Alert') {
            headers = [[t('history.columns.time'), t('history.columns.category'), t('history.columns.status'), t('history.columns.message_detail')]];
            body = data.map(e => {
                const titleStr = (e.rawStatus || "").toLowerCase();
                const msgStr = (e.rawMessage || "").toLowerCase();
                let smartType = null;
                
                // Detection Logic (Check Title first, then Message)
                if (titleStr.includes('overdue') || titleStr.includes('sla') || msgStr.includes('melewati batas waktu')) smartType = 'SLA_OVERDUE';
                else if (titleStr.includes('ping') || titleStr.includes('teguran') || titleStr.includes('action required') || msgStr.includes('ping') || msgStr.includes('teguran')) smartType = 'ACTION_REQUIRED';
                else if (titleStr.includes('tugas perbaikan baru') || titleStr.includes('new task') || titleStr.includes('task assigned') || (msgStr.includes('tugas baru') || msgStr.includes('new task'))) smartType = 'NEW_TASK';
                else if (titleStr.includes('teknisi ditugaskan') || titleStr.includes('tech assigned') || titleStr.includes('technician assigned') || msgStr.includes('ditugaskan') || msgStr.includes('has been assigned')) smartType = 'TECH_ASSIGNED';
                else if (titleStr.includes('mulai memproses') || titleStr.includes('started processing') || titleStr.includes('technician started') || titleStr.includes('mengerjakan') || msgStr.includes('mulai memproses') || msgStr.includes('mulai mengerjakan') || msgStr.includes('started processing')) smartType = 'TECH_PROCESSING';
                else if (titleStr.includes('pengaduan baru') || titleStr.includes('new complaint') || msgStr.includes('pengaduan baru') || msgStr.includes('new complaint')) smartType = 'NEW_COMPLAINT_TICKET';
                else if (titleStr.includes('terkirim') || titleStr.includes('submitted') || titleStr.includes('complaint sent') || msgStr.includes('berhasil dibuat') || msgStr.includes('successfully created')) smartType = 'COMPLAINT_SENT';
                else if (titleStr.includes('selesai') || titleStr.includes('finished') || titleStr.includes('rating') || msgStr.includes('selesai dikerjakan') || msgStr.includes('perbaikan selesai')) smartType = 'REPAIR_FINISHED';
                else if (titleStr.includes('dibatalkan') || titleStr.includes('cancelled') || titleStr.includes('cancel') || msgStr.includes('dibatalkan')) smartType = 'TICKET_CANCELLED';
                else if (titleStr.includes('eskalasi') || titleStr.includes('escalated') || msgStr.includes('dieskalasi')) smartType = 'TICKET_ESCALATED';

                let localizedMsg = e.messageKey ? t(e.messageKey, e.metadata) : e.rawMessage;
                const dynamicBodyKey = `notifications.dynamic.${smartType}.body`;
                const dynamicBody = smartType ? t(dynamicBodyKey, { defaultValue: '___MISSING___' }) : '___MISSING___';

                if (smartType && dynamicBody !== '___MISSING___') {
                    // Regex to find ticket ID in quotes or 8-char alphanumeric
                    const ticketMatch = e.rawMessage.match(/"([^"]+)"/) || e.rawMessage.match(/\b[a-z0-9]{8}\b/);
                    const extractedTicket = e.metadata?.ticketId || e.metadata?.ticket || e.metadata?.topic || (ticketMatch ? ticketMatch[1] || ticketMatch[0] : '');
                    
                    localizedMsg = t(dynamicBodyKey, { 
                        ...e.metadata,
                        ticket: extractedTicket,
                        technician: e.metadata?.technicianName || e.metadata?.technician || e.metadata?.senderName || '',
                        topic: e.metadata?.topic || '',
                        name: e.metadata?.senderName || e.metadata?.name || '',
                        hubId: e.metadata?.hubId || '',
                        deviceName: e.metadata?.deviceName || '',
                        status: e.metadata?.status || '',
                        location: e.metadata?.location || '',
                        percent: e.metadata?.percent || ''
                    });
                }
                
                return [
                    formatDateTime(e.rawTime), 
                    t(`notification.category.${e.rawCategory?.toLowerCase().replace(/\s+/g, '_')}`, e.rawCategory), 
                    localizeStatus(e.rawStatus), 
                    localizedMsg
                ];
            });
        }
        return { headers, body };
    };

    const handleExportPDF = () => {
        if (!processedData || processedData.length === 0) return alert(t('history.export.alert_no_data'));

        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.width;

            doc.setFontSize(22);
            doc.setTextColor(35, 92, 80);
            doc.text(t('history.export.pdf_header', { tab: activeTab }), 15, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(t('history.export.system_name', 'BIEON Monitoring System'), 15, 28);
            doc.text(t('history.export.print_date', { date: formatDateTime(new Date()) }), 15, 33);
            doc.line(15, 38, pageWidth - 15, 38);

            const { headers, body } = generateTableConfig(activeTab, processedData);

            autoTable(doc, {
                startY: 45,
                head: headers,
                body: body,
                theme: 'striped',
                headStyles: { fillColor: [35, 92, 80], textColor: [255, 255, 255], fontSize: 10, halign: 'center' },
                bodyStyles: { fontSize: 9, halign: 'center' },
                margin: { left: 15, right: 15 }
            });

            doc.save(`${t('history.export.filename_prefix', 'BIEON_History')}_${activeTab}_${new Date().getTime()}.pdf`);
        } catch (pdfError) {
            console.error('PDF ERROR:', pdfError);
            alert("Gagal membuat PDF.");
        }
    };

    const handleExportAllPDF = async () => {
        setIsExportingAll(true);
        try {
            const token = localStorage.getItem('token');
            const doc = new jsPDF('l', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.width;

            // --- COVER PAGE ---
            doc.setFontSize(28);
            doc.setTextColor(35, 92, 80);
            doc.text(t('history.export.audit_report_title', 'LAPORAN AUDIT SISTEM BIEON'), pageWidth / 2, 80, { align: 'center' });

            doc.setFontSize(14);
            doc.setTextColor(100);
            doc.text(t('history.export.system_tagline', 'Smart Green Living Monitoring System'), pageWidth / 2, 92, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`${t('history.export.report_period', 'Periode Laporan')}: ${new Date().toLocaleDateString(i18n_core.language === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })}`, pageWidth / 2, 110, { align: 'center' });
            doc.text(t('history.export.print_date', { date: formatDateTime(new Date()) }), pageWidth / 2, 118, { align: 'center' });

            doc.setDrawColor(35, 92, 80);
            doc.setLineWidth(1);
            doc.line(pageWidth / 2 - 30, 125, pageWidth / 2 + 30, 125);

            // Fetch and Append each tab as a new page
            for (let i = 0; i < tabs.length; i++) {
                try {
                    const tab = tabs[i];
                    const res = await fetch(tab.endpoint, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (!res.ok) continue;

                    const result = await res.json();
                    if (!result.success || !result.data || result.data.length === 0) continue;

                    const mapped = result.data.map((item, idx) => mapItemData(tab.id, item, idx));

                    doc.addPage();
                    doc.setFontSize(18);
                    doc.setTextColor(35, 92, 80);
                    doc.text(`${t('history.export.category_label', 'Kategori')}: ${tab.full}`, 15, 20);
                    doc.line(15, 25, pageWidth - 15, 25);

                    const { headers, body } = generateTableConfig(tab.id, mapped);
                    autoTable(doc, {
                        startY: 32,
                        head: headers,
                        body: body,
                        theme: 'striped',
                        headStyles: { fillColor: [35, 92, 80] },
                        margin: { left: 15, right: 15 }
                    });
                } catch (tabErr) {
                    console.error(`Error exporting tab ${i}:`, tabErr);
                }
            }

            doc.save(`${t('history.export.filename_prefix', 'BIEON_Full_Report')}_${new Date().getTime()}.pdf`);
        } catch (err) {
            console.error('EXPORT ALL ERROR:', err);
            alert("Gagal mengekspor laporan lengkap.");
        } finally {
            setIsExportingAll(false);
        }
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-gray-600" /> : <ArrowDown className="w-3.5 h-3.5 text-gray-600" />;
    };

    return (
        <HomeownerLayout
            currentPage="history"
            onNavigate={onNavigate}
            hideBottomNav={false}
        >
            <div className="max-w-[1900px] mx-auto px-4 sm:px-8 py-6 md:py-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-center text-[#235C50] mb-6 sm:mb-8">{t('history.title')}</h1>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 w-full">
                    <div className="w-full lg:w-auto overflow-hidden">
                        <style>{`
                            .tabs-scroll-container::-webkit-scrollbar { display: none; }
                            .tabs-scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
                        `}</style>
                        <div className="flex bg-white rounded-xl border-t border-l border-gray-200 w-full lg:w-auto shadow-sm overflow-x-auto tabs-scroll-container flex-nowrap">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setCurrentPage(1);
                                        setSearchQuery('');
                                        setSelectedRoomFilter('');
                                        setSortConfig({ key: 'time', direction: 'desc' });
                                    }}
                                    className={`px-4 sm:px-6 py-3.5 text-[11px] sm:text-[13px] font-bold transition-all border-b border-r border-gray-200 shrink-0 whitespace-nowrap flex items-center justify-center ${activeTab === tab.id
                                        ? 'bg-[#EDF5F1] text-[#235C50] border-b-2 border-b-[#235C50]'
                                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="hidden xl:inline">{tab.full}</span>
                                    <span className="inline xl:hidden">{tab.short}</span>
                                </button>

                            ))}
                        </div>
                    </div>


                    <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto mt-2 lg:mt-0 shrink-0">
                        <div className="relative w-full sm:w-[150px] md:w-[220px] shrink group">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder={t('history.search')}
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 bg-white transition-all"
                            />
                        </div>

                        <div className="relative shrink-0">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className={`flex items-center justify-center gap-2 sm:px-4 py-2.5 w-10 sm:w-auto bg-white border rounded-xl text-sm font-medium transition-all shadow-sm group ${showFilterDropdown ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <Filter className={`w-4 h-4 transition-colors ${showFilterDropdown || selectedRoomFilter ? 'text-teal-500' : 'text-gray-400'}`} />
                                <span className={`hidden sm:inline ${selectedRoomFilter ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {selectedRoomFilter ? (activeTab === 'Notifikasi & Alert' ? t(`notification.category.${selectedRoomFilter?.toLowerCase().replace(/\s+/g, '_')}`, selectedRoomFilter) : selectedRoomFilter) : (
                                        ['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) 
                                            ? t('history.all_devices') 
                                            : activeTab === 'Notifikasi & Alert' 
                                                ? t('history.all_categories') 
                                                : t('history.all_rooms')
                                    )}
                                </span>
                                <ChevronDown className={`hidden sm:block w-4 h-4 text-gray-400 transition-all ${showFilterDropdown ? 'rotate-180 text-teal-500' : ''}`} />
                            </button>

                            {showFilterDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)}></div>
                                    <div className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200 min-w-[200px]">
                                        <button
                                            onClick={() => {
                                                setSelectedRoomFilter('');
                                                setCurrentPage(1);
                                                setShowFilterDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedRoomFilter === '' ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) 
                                                ? t('history.all_devices') 
                                                : activeTab === 'Notifikasi & Alert' 
                                                    ? t('history.all_categories') 
                                                    : t('history.all_rooms')}
                                        </button>
                                        {availableFilters.map(r => (
                                            <button
                                                key={r}
                                                onClick={() => {
                                                    setSelectedRoomFilter(r);
                                                    setCurrentPage(1);
                                                    setShowFilterDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-1.5 text-sm transition-colors ${selectedRoomFilter === r ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {activeTab === 'Notifikasi & Alert' ? t(`notification.category.${r?.toLowerCase().replace(/\s+/g, '_')}`, r) : r}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Compact Export Tab Button */}
                        <button
                            onClick={handleExportPDF}
                            title={`Export PDF Tab ${activeTab}`}
                            className="shrink-0 flex items-center justify-center w-10 h-10 bg-white border border-gray-200 text-[#235C50] rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <Download className="w-5 h-5" />
                        </button>

                        {/* Premium Laporan Lengkap Button */}
                        <button
                            onClick={handleExportAllPDF}
                            disabled={isExportingAll}
                            className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#235C50] text-white rounded-xl hover:bg-teal-900 transition-all shadow-md font-semibold text-sm disabled:opacity-70 disabled:cursor-wait group"
                        >
                            {isExportingAll ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ClipboardList className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            )}
                            <span className="hidden sm:inline">{t('history.full_report')}</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-30 flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-3" />
                            <p className="text-gray-500 font-medium animate-pulse">{t('history.loading')}</p>
                        </div>
                    )}

                    <div className="overflow-x-auto custom-scrollbar pb-2">
                        <table className="w-full text-left text-[13px] sm:text-[14px] text-gray-700 table-auto min-w-[600px] lg:min-w-[1000px]">
                            <thead className="bg-white border-b border-gray-200 text-gray-500 select-none">
                                <tr>
                                    <th onClick={() => requestSort('time')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                        <div className="flex items-center gap-1">{t('history.columns.time')} {getSortIcon('time')}</div>
                                    </th>

                                    {activeTab === 'Notifikasi & Alert' && (
                                        <th onClick={() => requestSort('category')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                            <div className="flex items-center gap-1">{t('history.columns.category')} {getSortIcon('category')}</div>
                                        </th>
                                    )}

                                    {['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? (
                                        <th onClick={() => requestSort('device')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                            <div className="flex items-center gap-1">{t('history.columns.device')} {getSortIcon('device')}</div>
                                        </th>
                                    ) : activeTab === 'Notifikasi & Alert' ? null : (
                                        <th onClick={() => requestSort('room')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                            <div className="flex items-center gap-1">{t('history.columns.room')} {getSortIcon('room')}</div>
                                        </th>
                                    )}

                                    {activeTab === 'Log Perangkat' && (
                                        <th onClick={() => requestSort('actuator')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                            <div className="flex items-center gap-1">{t('history.columns.actuator')} {getSortIcon('actuator')}</div>
                                        </th>
                                    )}

                                    {activeTab === 'Kenyamanan' && (
                                        <>
                                            <th onClick={() => requestSort('temp')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.temperature')} {getSortIcon('temp')}</div>
                                            </th>
                                            <th onClick={() => requestSort('humidity')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.humidity')} {getSortIcon('humidity')}</div>
                                            </th>
                                        </>
                                    )}

                                    {activeTab === 'Keamanan' && (
                                        <>
                                            <th onClick={() => requestSort('door')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.door_sensor')} {getSortIcon('door')}</div>
                                            </th>
                                            <th onClick={() => requestSort('motion')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.motion_sensor')} {getSortIcon('motion')}</div>
                                            </th>
                                        </>
                                    )}

                                    {activeTab === 'Kualitas Air' && (
                                        <>
                                            <th onClick={() => requestSort('ph')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.ph')} {getSortIcon('ph')}</div>
                                            </th>
                                            <th onClick={() => requestSort('turbidity')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.turbidity')} {getSortIcon('turbidity')}</div>
                                            </th>
                                            <th onClick={() => requestSort('temp')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.temperature')} {getSortIcon('temp')}</div>
                                            </th>
                                            <th onClick={() => requestSort('tds')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.tds')} {getSortIcon('tds')}</div>
                                            </th>
                                        </>
                                    )}

                                    {activeTab === 'Konsumsi Energi' && (
                                        <>
                                            <th onClick={() => requestSort('kwh')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.energy')} {getSortIcon('kwh')}</div>
                                            </th>
                                            <th onClick={() => requestSort('voltage')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.voltage')} {getSortIcon('voltage')}</div>
                                            </th>
                                            <th onClick={() => requestSort('current')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.current')} {getSortIcon('current')}</div>
                                            </th>
                                            <th onClick={() => requestSort('power')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.power_load')} {getSortIcon('power')}</div>
                                            </th>
                                            <th onClick={() => requestSort('pf')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.power_factor')} {getSortIcon('pf')}</div>
                                            </th>
                                        </>
                                    )}

                                    {activeTab !== 'Konsumsi Energi' && activeTab !== 'Log Perangkat' && activeTab !== 'Notifikasi & Alert' && (
                                        <th onClick={() => requestSort('status')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                            <div className="flex items-center gap-1">{t('history.columns.status')} {getSortIcon('status')}</div>
                                        </th>
                                    )}

                                    {activeTab === 'Log Perangkat' && (
                                        <>
                                            <th onClick={() => requestSort('status')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.status')} {getSortIcon('status')}</div>
                                            </th>
                                            <th onClick={() => requestSort('trigger')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.trigger')} {getSortIcon('trigger')}</div>
                                            </th>
                                        </>
                                    )}

                                    {activeTab === 'Notifikasi & Alert' && (
                                        <>
                                            <th onClick={() => requestSort('status')} className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">{t('history.columns.danger_level')} {getSortIcon('status')}</div>
                                            </th>
                                            <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-normal whitespace-nowrap">
                                                {t('history.columns.message_detail')}
                                            </th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeTabsConfigured.includes(activeTab) ? (
                                    currentData.length > 0 ? (
                                        currentData.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-medium text-gray-900 whitespace-nowrap">{formatDateTime(item.rawTime)}</td>

                                                {activeTab === 'Notifikasi & Alert' && (
                                                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{t(`notification.category.${item.rawCategory?.toLowerCase().replace(/\s+/g, '_')}`, item.rawCategory)}</td>
                                                )}

                                                {['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? (
                                                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.device}</td>
                                                ) : activeTab === 'Notifikasi & Alert' ? null : (
                                                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.room}</td>
                                                )}

                                                {activeTab === 'Kenyamanan' && (
                                                    <>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{Number(item.temp).toFixed(1)} °C</td>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.humidity}</td>
                                                    </>
                                                )}

                                                {activeTab === 'Keamanan' && (
                                                    <>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{localizeStatus(item.rawDoor)}</td>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{localizeStatus(item.rawMotion)}</td>
                                                    </>
                                                )}

                                                {activeTab === 'Kualitas Air' && (
                                                    <>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.ph}</td>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.turbidity}</td>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.temp}</td>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.tds}</td>
                                                    </>
                                                )}

                                                {activeTab === 'Konsumsi Energi' && (
                                                    <>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.kwh}</td>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.voltage}</td>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.current}</td>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.power}</td>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.pf}</td>
                                                    </>
                                                )}

                                                {activeTab === 'Log Perangkat' && (
                                                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{item.actuator}</td>
                                                )}

                                                {activeTab !== 'Konsumsi Energi' && activeTab !== 'Log Perangkat' && activeTab !== 'Notifikasi & Alert' && (
                                                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                        <StatusBadge status={localizeStatus(item.rawStatus)} />
                                                    </td>
                                                )}

                                                {activeTab === 'Log Perangkat' && (
                                                    <>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                            <StatusBadge status={localizeStatus(item.rawStatus)} />
                                                        </td>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{localizeTrigger(item.trigger)}</td>
                                                    </>
                                                )}

                                                {activeTab === 'Notifikasi & Alert' && (
                                                    <>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                            <StatusBadge status={localizeStatus(item.rawStatus)} />
                                                        </td>
                                                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-gray-600 min-w-[280px]">
                                                            {(() => {
                                                                const titleStr = (item.rawStatus || "").toLowerCase();
                                                                const msgStr = (item.rawMessage || "").toLowerCase();
                                                                let smartType = null;
                                                                
                                                                // Detection Logic (Check Title first, then Message)
                                                                if (titleStr.includes('overdue') || titleStr.includes('sla') || msgStr.includes('melewati batas waktu')) smartType = 'SLA_OVERDUE';
                                                                else if (titleStr.includes('ping') || titleStr.includes('teguran') || titleStr.includes('action required') || msgStr.includes('ping') || msgStr.includes('teguran')) smartType = 'ACTION_REQUIRED';
                                                                else if (titleStr.includes('tugas perbaikan baru') || titleStr.includes('new task') || titleStr.includes('task assigned') || (msgStr.includes('tugas baru') || msgStr.includes('new task'))) smartType = 'NEW_TASK';
                                                                else if (titleStr.includes('teknisi ditugaskan') || titleStr.includes('tech assigned') || titleStr.includes('technician assigned') || msgStr.includes('ditugaskan') || msgStr.includes('has been assigned')) smartType = 'TECH_ASSIGNED';
                                                                else if (titleStr.includes('mulai memproses') || titleStr.includes('started processing') || titleStr.includes('technician started') || titleStr.includes('mengerjakan') || msgStr.includes('mulai memproses') || msgStr.includes('mulai mengerjakan') || msgStr.includes('started processing')) smartType = 'TECH_PROCESSING';
                                                                else if (titleStr.includes('pengaduan baru') || titleStr.includes('new complaint') || msgStr.includes('pengaduan baru') || msgStr.includes('new complaint')) smartType = 'NEW_COMPLAINT_TICKET';
                                                                else if (titleStr.includes('terkirim') || titleStr.includes('submitted') || titleStr.includes('complaint sent') || msgStr.includes('berhasil dibuat') || msgStr.includes('successfully created')) smartType = 'COMPLAINT_SENT';
                                                                else if (titleStr.includes('selesai') || titleStr.includes('finished') || titleStr.includes('rating') || msgStr.includes('selesai dikerjakan') || msgStr.includes('perbaikan selesai')) smartType = 'REPAIR_FINISHED';
                                                                else if (titleStr.includes('dibatalkan') || titleStr.includes('cancelled') || titleStr.includes('cancel') || msgStr.includes('dibatalkan')) smartType = 'TICKET_CANCELLED';
                                                                else if (titleStr.includes('eskalasi') || titleStr.includes('escalated') || msgStr.includes('dieskalasi')) smartType = 'TICKET_ESCALATED';

                                                                const dynamicBodyKey = `notifications.dynamic.${smartType}.body`;
                                                                const dynamicBody = smartType ? t(dynamicBodyKey, { defaultValue: '___MISSING___' }) : '___MISSING___';

                                                                if (smartType && dynamicBody !== '___MISSING___') {
                                                                    // Regex to find ticket ID in quotes or 8-char alphanumeric
                                                                    const ticketMatch = item.rawMessage.match(/"([^"]+)"/) || item.rawMessage.match(/\b[a-z0-9]{8}\b/);
                                                                    const extractedTicket = item.metadata?.ticketId || item.metadata?.ticket || item.metadata?.topic || (ticketMatch ? ticketMatch[1] || ticketMatch[0] : '');
                                                                    
                                                                    return t(dynamicBodyKey, { 
                                                                        ...item.metadata,
                                                                        ticket: extractedTicket,
                                                                        technician: item.metadata?.technicianName || item.metadata?.technician || item.metadata?.senderName || '',
                                                                        topic: item.metadata?.topic || '',
                                                                        name: item.metadata?.senderName || item.metadata?.name || '',
                                                                        hubId: item.metadata?.hubId || '',
                                                                        deviceName: item.metadata?.deviceName || '',
                                                                        status: item.metadata?.status || '',
                                                                        location: item.metadata?.location || '',
                                                                        percent: item.metadata?.percent || ''
                                                                    });
                                                                }
                                                                return item.messageKey ? t(item.messageKey, item.metadata) : item.rawMessage;
                                                            })()}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={(['Kualitas Air', 'Konsumsi Energi'].includes(activeTab)) ? 7 : 5} className="px-6 py-20 text-center text-gray-500">
                                                {isLoading ? t('history.loading_data') : (error ? `Error: ${error}` : t('history.no_data'))}
                                                {!isLoading && !error && <p className="text-[11px] text-gray-400 mt-2">{t('history.no_data_desc')}</p>}
                                            </td>
                                        </tr>
                                    )
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    {totalItems > 0 && (
                        <div className="flex flex-row items-center justify-between px-3 sm:px-6 py-3 border-t border-gray-200 gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                                <span className="hidden sm:inline">{t('history.rows_per_page')}</span>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                                    >
                                        {rowsPerPage} <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showRowsDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowRowsDropdown(false)}></div>
                                            <div className="absolute bottom-full left-0 mb-2 w-16 sm:w-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20 animate-in fade-in slide-in-from-bottom-2">
                                                {[5, 10, 20, 50].map(val => (
                                                    <button
                                                        key={val}
                                                        onClick={() => {
                                                            setRowsPerPage(val);
                                                            setCurrentPage(1);
                                                            setShowRowsDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-1.5 text-sm transition-colors ${rowsPerPage === val ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                                {t('history.page_info', { 
                                    current: totalItems > 0 ? startIndex + 1 : 0, 
                                    last: Math.min(startIndex + rowsPerPage, totalItems), 
                                    total: totalItems 
                                })}
                            </div>

                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-2 sm:px-4 py-1 sm:py-1.5 border border-gray-200 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:text-gray-400 disabled:hover:bg-white disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <ChevronLeft className="w-4 h-4 sm:hidden" />
                                    <span className="hidden sm:inline">{t('history.previous')}</span>
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-2 sm:px-4 py-1 sm:py-1.5 border border-gray-200 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:text-gray-400 disabled:hover:bg-white disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <span className="hidden sm:inline">{t('history.next')}</span>
                                    <ChevronRight className="w-4 h-4 sm:hidden" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </HomeownerLayout>
    );
}
