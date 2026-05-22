import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    ChevronDown,
    Search,
    Filter,
    Download,
    Calendar,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ClipboardList,
    User as UserIcon,
    Cpu,
    Clock,
    X,
    AlertCircle,
    Eye,
    Star
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SuperAdminLayout } from './SuperAdminLayout';
import { StatusBadge } from '../../shared/StatusBadge';
import { TicketStatusBadge } from '../../shared/TicketStatusBadge';
import { ComplaintDetailModal } from '../complaints/ComplaintDetailModal';

export default function AdminHistory({ onNavigate }) {
    const { t, i18n } = useTranslation();

    const UrgencyBadge = ({ level, pingCount }) => {
        if ((!level || level === 'low') && !pingCount) return null;

        const mainBadgeStyles = {
            high: 'bg-red-50 text-red-600 border-red-100',
            critical: 'bg-red-900 text-white border-red-900 animate-pulse'
        };

        const mainLabels = {
            high: `🔥 ${t('history.columns.priority')} (Alihan)`,
            critical: `🚨 ${t('history.status.critical')}`
        };

        return (
            <div className="flex flex-wrap gap-1 items-center">
                {Array.from({ length: pingCount || 0 }).map((_, i) => (
                    <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 text-[8px] font-black uppercase shadow-sm">
                        ⚠️ {t('history.ping', 'Ping')}
                    </span>
                ))}
                {(level === 'high' || level === 'critical') && (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase border ${mainBadgeStyles[level]}`}>
                        {mainLabels[level]}
                    </span>
                )}
            </div>
        );
    };
    // --- Data Master States ---
    const [activeTab, setActiveTab] = useState('Kenyamanan');
    const [historyData, setHistoryData] = useState([]);
    const [allHomeowners, setAllHomeowners] = useState([]); // Master list
    const [allBieonSystems, setAllBieonSystems] = useState([]); // Master list of {bieonId, owner}
    
    // --- Selection States ---
    const [selectedHomeowner, setSelectedHomeowner] = useState(null);
    const [selectedBieon, setSelectedBieon] = useState('');
    
    // --- Loading & Error States ---
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHomeowners, setIsLoadingHomeowners] = useState(true);
    const [isLoadingBieon, setIsLoadingBieon] = useState(true);
    const [isExportingAll, setIsExportingAll] = useState(false);
    const [apiError, setApiError] = useState(null);

    // --- Detail Modal States ---
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    // --- Filter & Pagination States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoomFilter, setSelectedRoomFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    
    // --- Dropdown States ---
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showBieonDropdown, setShowBieonDropdown] = useState(false);
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);

    // --- Custom Calendar States ---
    const [activePicker, setActivePicker] = useState(null);
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const monthNames = [
        t('dashboard.month_jan'), t('dashboard.month_feb'), t('dashboard.month_mar'), t('dashboard.month_apr'),
        t('dashboard.month_may'), t('dashboard.month_jun'), t('dashboard.month_jul'), t('dashboard.month_aug'),
        t('dashboard.month_sep'), t('dashboard.month_oct'), t('dashboard.month_nov'), t('dashboard.month_dec')
    ];

    // ========================================================
    // BIDIRECTIONAL FILTERING LOGIC
    // ========================================================
    
    // 1. Dropdown Pelanggan yang akan ditampilkan
    const displayHomeowners = useMemo(() => {
        if (!selectedBieon) return allHomeowners;
        
        // Cari owner-owner yang memiliki ID BIEON terpilih ini
        const ownerIdsForThisBieon = allBieonSystems
            .filter(h => h.bieonId === selectedBieon)
            .map(h => h.owner);
            
        return allHomeowners.filter(h => ownerIdsForThisBieon.includes(h._id));
    }, [allHomeowners, allBieonSystems, selectedBieon]);

    // 2. Dropdown ID BIEON yang akan ditampilkan
    const displayBieonSystems = useMemo(() => {
        if (!selectedHomeowner) {
            // Jika tidak ada pelanggan terpilih, tampilkan semua ID unik
            const uniqueIds = Array.from(new Set(allBieonSystems.map(h => h.bieonId)));
            return uniqueIds.map(id => ({ bieonId: id }));
        }
        
        // Jika pelanggan dipilih, hanya tampilkan BIEON miliknya
        return allBieonSystems.filter(h => h.owner === selectedHomeowner._id);
    }, [allBieonSystems, selectedHomeowner]);

    // Handler saat milih Pelanggan
    const handleSelectHomeowner = (h) => {
        setSelectedHomeowner(h);
        setShowCustomerDropdown(false);
        setCurrentPage(1);
        
        // Reset BIEON jika BIEON yang sekarang tidak dimiliki oleh user baru ini
        if (selectedBieon) {
            const isOwned = allBieonSystems.some(sys => sys.bieonId === selectedBieon && sys.owner === h._id);
            if (!isOwned) setSelectedBieon('');
        }
    };

    // Handler saat milih BIEON
    const handleSelectBieon = (bieonId) => {
        setSelectedBieon(bieonId);
        setShowBieonDropdown(false);
        setCurrentPage(1);
        
        if (bieonId) {
            // Cari siapa pemilik BIEON ini
            const owners = allBieonSystems.filter(h => h.bieonId === bieonId).map(h => h.owner);
            if (owners.length > 0) {
                // Jika pemiliknya hanya satu dan bukan pemilik saat ini, otomatis ganti pelanggannya
                if (owners.length === 1 && selectedHomeowner?._id !== owners[0]) {
                    const ownerObj = allHomeowners.find(u => u._id === owners[0]);
                    if (ownerObj) setSelectedHomeowner(ownerObj);
                }
            }
        }
    };

    // ========================================================
    // CALENDAR LOGIC
    // ========================================================
    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const days = [];
        for (let i = firstDay - 1; i >= 0; i--) { days.push({ day: daysInPrevMonth - i, month: viewMonth - 1, year: viewYear, current: false }); }
        for (let i = 1; i <= daysInMonth; i++) { days.push({ day: i, month: viewMonth, year: viewYear, current: true }); }
        const nextDays = 42 - days.length;
        for (let i = 1; i <= nextDays; i++) { days.push({ day: i, month: viewMonth + 1, year: viewYear, current: false }); }
        return days;
    }, [viewMonth, viewYear]);

    const handleSelectDate = (d) => {
        let year = d.year;
        let month = d.month;
        if (month < 0) { month = 11; year--; }
        if (month > 11) { month = 0; year++; }
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
        if (activePicker === 'start') setDateRange(prev => ({ ...prev, start: dateStr }));
        else setDateRange(prev => ({ ...prev, end: dateStr }));
        setActivePicker(null);
        setCurrentPage(1);
    };

    const changeMonth = (dir) => {
        if (dir === 'prev') {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1); }
            else setViewMonth(v => v - 1);
        } else {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1); }
            else setViewMonth(v => v + 1);
        }
    };

    const tabs = [
        { id: 'Kenyamanan',       full: t('history.comfort'),       short: t('history.comfort'), endpoint: '/api/history/environment' },
        { id: 'Keamanan',         full: t('history.security'),         short: t('history.security'), endpoint: '/api/history/security' },
        { id: 'Kualitas Air',     full: t('history.water_quality'),     short: t('history.water_quality'), endpoint: '/api/history/water' },
        { id: 'Konsumsi Energi',  full: t('history.energy'),  short: t('history.energy'), endpoint: '/api/history/energy' },
        { id: 'Log Perangkat',    full: t('history.device_logs'),    short: t('history.device_logs'), endpoint: '/api/history/activity' },
        { id: 'Notifikasi & Alert', full: t('history.notifications'), short: t('history.notifications'), endpoint: '/api/history/alerts' },
        { id: 'Pengaduan',        full: t('history.complaints'),        short: t('history.complaints'), endpoint: '/api/complaints' }
    ];

    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const formatDateDisplay = (isoDate) => {
        if (!isoDate) return '';
        const d = new Date(isoDate);
        return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    };

    const cleanValue = (val) => {
        if (val === null || val === undefined) return '';
        return String(val).replace(/ NTU| ppm|°C| V| A| W| kWh/gi, '').trim();
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
        const rawDate = item.date || item.timestamp || item.createdAt;
        const base = {
            id: item._id || index,
            rawTime: rawDate,
            timestamp: new Date(rawDate).getTime(),
            room: item.room || '-',
            device: item.device?.name || item.device || '-',
        };

        if (tabId === 'Kenyamanan') return { ...base, room: item.room, temp: item.avgTemperature, humidity: item.avgHumidity, rawStatus: item.status };
        if (tabId === 'Keamanan') return { ...base, room: item.room, rawDoor: item.door, rawMotion: item.motion, rawStatus: item.status };
        if (tabId === 'Kualitas Air') return { ...base, device: item.device?.name || item.device || t('history.columns.water_sensor', 'Sensor Air'), ph: item.ph, turbidity: cleanValue(item.turbidity), temp: cleanValue(item.temperature), tds: cleanValue(item.tds), rawStatus: item.status };
        if (tabId === 'Konsumsi Energi') return { ...base, device: item.device?.name || item.device || t('history.columns.power_meter', 'Power Meter'), kwh: cleanValue(item.totalKwh), voltage: cleanValue(item.voltage), current: cleanValue(item.current), power: cleanValue(item.power), pf: item.pf + ' PF' };
        if (tabId === 'Log Perangkat') return { ...base, room: item.room, actuator: item.actuator, rawStatus: item.status, trigger: item.trigger };
        if (tabId === 'Notifikasi & Alert') return { 
            ...base, 
            rawStatus: item.type || item.status || 'Normal', 
            rawCategory: item.category, 
            messageKey: item.messageKey,
            metadata: item.metadata,
            rawMessage: item.message, 
            isRead: item.isRead 
        };
        if (tabId === 'Pengaduan') return { 
            ...base, 
            id: item._id ? `TCK-${item._id.substring(item._id.length - 6).toUpperCase()}` : base.id, 
            customer: item.homeowner?.fullName || t('history.unknown_user', 'Unknown User'),
            rawCategory: item.category,
            topic: item.topic, 
            device: item.device || item.hub?.name || t('history.general', 'General'), 
            technician: item.technician?.fullName || t('complaint.status_unassigned'), 
            rating: item.rating?.stars || '-',
            status: item.status,
            rawItem: item // Original data for modal
        };
        return item;
    };

    const fetchHomeowners = async () => {
        setIsLoadingHomeowners(true);
        setApiError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/homeowners', { headers: { 'Authorization': `Bearer ${token}` } });
            const result = await response.json();
            if (result.success && result.data) {
                setAllHomeowners(result.data);
            } else { setApiError(result.message); }
        } catch (err) { setApiError(t('history.connection_failed', 'Koneksi gagal.')); }
        finally { setIsLoadingHomeowners(false); }
    };

    const fetchAllBieonSystems = async () => {
        setIsLoadingBieon(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/all-bieon-systems', { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            const result = await response.json();
            if (result.success) setAllBieonSystems(result.data || []);
        } catch (err) { 
            console.error("Gagal memuat daftar BIEON:", err); 
        } finally { 
            setIsLoadingBieon(false); 
        }
    };

    useEffect(() => { 
        fetchHomeowners(); 
        fetchAllBieonSystems();
    }, []);

    const fetchHistory = useCallback(async () => {
        if (!selectedHomeowner) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const currentTabConfig = tabs.find(t => t.id === activeTab);
            let query = `homeownerId=${selectedHomeowner._id}`;
            if (selectedBieon) query += `&bieonId=${selectedBieon}`;
            if (dateRange.start) query += `&startDate=${dateRange.start}`;
            if (dateRange.end) query += `&endDate=${dateRange.end}`;
            if (activeTab === 'Pengaduan') query += `&isHistory=true`;
            
            const response = await fetch(`${currentTabConfig.endpoint}?${query}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const result = await response.json();
            if (result.success && result.data) setHistoryData(result.data.map((item, index) => mapItemData(activeTab, item, index)));
            else setHistoryData([]);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    }, [activeTab, selectedHomeowner, selectedBieon, dateRange]);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const processedData = useMemo(() => {
        let filtered = [...historyData];
        if (selectedRoomFilter) {
            if (['Notifikasi & Alert', 'Pengaduan'].includes(activeTab)) filtered = filtered.filter(item => item.rawCategory === selectedRoomFilter);
            else if (['Kualitas Air', 'Konsumsi Energi'].includes(activeTab)) filtered = filtered.filter(item => item.device === selectedRoomFilter);
            else filtered = filtered.filter(item => item.room === selectedRoomFilter);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(item => {
                const timeStr = formatDateTime(item.rawTime).toLowerCase();
                const statusStr = localizeStatus(item.rawStatus || item.status).toLowerCase();
                const q = searchQuery.toLowerCase();

                if (activeTab === 'Notifikasi & Alert') {
                    const msg = (item.messageKey ? t(item.messageKey, item.metadata) : item.rawMessage || '').toLowerCase();
                    const cat = t(`notification.category.${item.rawCategory?.toLowerCase().replace(/\s+/g, '_')}`, item.rawCategory).toLowerCase();
                    return timeStr.includes(q) || statusStr.includes(q) || msg.includes(q) || cat.includes(q);
                }
                
                const baseStr = `${timeStr} ${statusStr} ${item.room || item.device || ''}`.toLowerCase();
                return baseStr.includes(q);
            });
        }
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aVal = a[sortConfig.key], bVal = b[sortConfig.key];
                if (sortConfig.key === 'time') { aVal = a.timestamp; bVal = b.timestamp; }
                else if (typeof aVal === 'string' && !isNaN(parseFloat(aVal.replace(/[^0-9.-]/g, '')))) {
                    aVal = parseFloat(aVal.replace(/[^0-9.-]/g, ''));
                    bVal = parseFloat(bVal.replace(/[^0-9.-]/g, ''));
                }
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [activeTab, historyData, searchQuery, selectedRoomFilter, sortConfig]);

    const availableFilters = useMemo(() => {
        if (['Notifikasi & Alert', 'Pengaduan'].includes(activeTab)) return Array.from(new Set(historyData.map(d => d.rawCategory))).filter(Boolean);
        return Array.from(new Set(historyData.map(d => d.room || d.device))).filter(Boolean);
    }, [historyData, activeTab]);
    const totalItems = processedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = processedData.slice(startIndex, startIndex + rowsPerPage);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-bieon-eco" /> : <ArrowDown className="w-3.5 h-3.5 text-bieon-eco" />;
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const handleExportPDF = () => {
        if (processedData.length === 0) return alert(t('history.export.alert_no_data'));
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFontSize(20); doc.setTextColor(5, 155, 39);
        doc.text(t('history.export.pdf_header', { tab: activeTab }), 15, 20);
        const { headers, body } = generateTableConfig(activeTab, processedData);
        autoTable(doc, { startY: 38, head: headers, body: body, theme: 'striped', headStyles: { fillColor: [5, 155, 39] } });
        doc.save(`${t('history.export.filename_prefix', 'Laporan_Riwayat_BIEON')}_${activeTab}.pdf`);
    };

    const handleExportAllPDF = async () => {
        if (!selectedHomeowner) return;
        setIsExportingAll(true);
        try {
            const token = localStorage.getItem('token');
            const doc = new jsPDF('l', 'mm', 'a4'); // Full Landscape
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            
            // --- COVER PAGE DESIGN (LANDSCAPE OPTIMIZED) ---
            doc.setFillColor(242, 248, 245);
            doc.rect(0, 0, pageWidth, 45, 'F');
            
            doc.setFontSize(32);
            doc.setTextColor(5, 155, 39);
            doc.setFont("helvetica", "bold");
            doc.text(t('history.export.system_name', 'BIEON SMART SYSTEM'), pageWidth / 2, 85, { align: 'center' });
            
            doc.setFontSize(20);
            doc.setTextColor(60, 60, 60);
            doc.text(t('history.title').toUpperCase(), pageWidth / 2, 98, { align: 'center' });
            
            doc.setDrawColor(5, 155, 39);
            doc.setLineWidth(1);
            doc.line(60, 110, pageWidth - 60, 110);
            
            doc.setFontSize(13);
            doc.setTextColor(100, 100, 100);
            const startY = 130;
            const lineSpacing = 11;
            const leftCol = 85;
            const valCol = 140;

            const addDetail = (label, value, y) => {
                doc.setFont("helvetica", "bold");
                doc.text(label + ":", leftCol, y);
                doc.setFont("helvetica", "normal");
                doc.text(String(value), valCol, y);
            };

            addDetail(t('history.columns.customer'), selectedHomeowner.fullName || selectedHomeowner.name, startY);
            addDetail(t('profile.address', 'Alamat'), selectedHomeowner.address || "-", startY + lineSpacing);
            addDetail("ID BIEON", selectedBieon || t('history.filters.all_bieon'), startY + lineSpacing * 2);
            
            const startRange = dateRange.start ? formatDateDisplay(dateRange.start) : t('history.filters.start_date_null', 'Awal Waktu');
            const endRange = dateRange.end ? formatDateDisplay(dateRange.end) : t('history.filters.end_date_null', 'Sekarang');
            addDetail(t('history.filters.date_range'), `${startRange} - ${endRange}`, startY + lineSpacing * 3);
            addDetail(t('history.export.print_date_label', 'Dihasilkan Pada'), formatDateTime(new Date()), startY + lineSpacing * 4);

            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(t('history.export.auto_generated_note', 'Dokumen ini dihasilkan secara otomatis oleh Sistem Monitoring BIEON.'), pageWidth / 2, pageHeight - 25, { align: 'center' });
            doc.text("© 2026 BPJS - BIEON Project", pageWidth / 2, pageHeight - 19, { align: 'center' });

            // --- DATA PAGES ---
            let queryParams = `homeownerId=${selectedHomeowner._id}`;
            if (selectedBieon) queryParams += `&bieonId=${selectedBieon}`;
            if (dateRange.start) queryParams += `&startDate=${dateRange.start}`;
            if (dateRange.end) queryParams += `&endDate=${dateRange.end}`;

            for (let tab of tabs) {
                try {
                    let tabUrl = `${tab.endpoint}?${queryParams}`;
                    if (tab.id === 'Pengaduan') tabUrl += '&isHistory=true';

                    const res = await fetch(tabUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                    const result = await res.json();
                    
                    if (result.success && result.data && result.data.length > 0) {
                        doc.addPage(); 
                        doc.setFontSize(18);
                        doc.setTextColor(5, 155, 39);
                        doc.text(`${t('history.columns.category')}: ${tab.full}`, 15, 18);
                        
                        const mappedData = result.data.map((item, idx) => mapItemData(tab.id, item, idx));
                        const { headers, body } = generateTableConfig(tab.id, mappedData);
                        
                        autoTable(doc, { 
                            startY: 25, 
                            head: headers, 
                            body: body, 
                            theme: 'striped', 
                            headStyles: { fillColor: [5, 155, 39], fontSize: 10, halign: 'center' },
                            bodyStyles: { fontSize: 9, halign: 'center' },
                            margin: { top: 25, bottom: 20 }
                        });
                    }
                } catch (tabErr) {
                    console.error(`Error exporting tab ${tab.id}:`, tabErr);
                }
            }
            
            doc.save(`Laporan_BIEON_${selectedHomeowner.fullName || 'User'}.pdf`);
        } catch (err) { 
            console.error(err); 
        } finally { 
            setIsExportingAll(false); 
        }
    };

    const generateTableConfig = (tabId, data) => {
        let headers = [], body = [];
        if (tabId === 'Kenyamanan') { 
            headers = [[t('history.columns.time'), t('history.columns.device'), t('history.columns.temperature'), t('history.columns.humidity')]]; 
            body = data.map(e => [formatDateTime(e.rawTime), e.device, `${e.temp}°C`, `${e.humidity}%`]); 
        }
        else if (tabId === 'Keamanan') { 
            headers = [[t('history.columns.time'), t('history.columns.device'), t('history.columns.door_sensor'), t('history.columns.motion_sensor')]]; 
            body = data.map(e => [formatDateTime(e.rawTime), e.device, localizeStatus(e.rawDoor), localizeStatus(e.rawMotion)]); 
        }
        else if (tabId === 'Kualitas Air') { 
            headers = [[t('history.columns.time'), t('history.columns.device'), t('history.columns.ph'), t('history.columns.turbidity'), t('history.columns.tds')]]; 
            body = data.map(e => [formatDateTime(e.rawTime), e.device, e.ph, `${e.turbidity} NTU`, `${e.tds} ppm`]); 
        }
        else if (tabId === 'Konsumsi Energi') { 
            headers = [[t('history.columns.time'), t('history.columns.device'), t('history.columns.energy'), t('history.columns.voltage'), t('history.columns.current'), t('history.columns.power_load'), t('history.columns.power_factor')]]; 
            body = data.map(e => [formatDateTime(e.rawTime), e.device, `${e.kwh} kWh`, `${e.voltage} V`, `${e.current} A`, `${e.power} W`, e.pf]); 
        }
        else if (tabId === 'Log Perangkat') { 
            headers = [[t('history.columns.time'), t('history.columns.device'), t('history.columns.actuator'), t('history.columns.status'), t('history.columns.trigger')]]; 
            body = data.map(e => [formatDateTime(e.rawTime), e.device, e.actuator, localizeStatus(e.rawStatus), localizeTrigger(e.trigger)]); 
        }
        else if (tabId === 'Notifikasi & Alert') { 
            headers = [[t('history.columns.time'), t('history.columns.category'), t('history.columns.status'), t('history.columns.message_detail')]]; 
            body = data.map(e => [formatDateTime(e.rawTime), t(`notification.category.${e.rawCategory?.toLowerCase().replace(/\s+/g, '_') || 'unknown'}`, e.rawCategory), localizeStatus(e.rawStatus), e.messageKey ? t(e.messageKey, e.metadata) : e.rawMessage]); 
        }
        else if (tabId === 'Pengaduan') { 
            headers = [[t('history.columns.time'), t('history.columns.ticket_id'), t('history.columns.customer'), t('history.columns.category'), t('history.columns.topic'), t('history.columns.technician'), t('history.columns.rating'), t('history.columns.status')]]; 
            body = data.map(e => [formatDateTime(e.rawTime), e.id, e.customer, t(`notification.category.${e.rawCategory?.toLowerCase().replace(/\s+/g, '_') || 'unknown'}`, e.rawCategory), e.topic, e.technician, e.rating, localizeStatus(e.status)]); 
        }
        return { headers, body };
    };

    return (
        <SuperAdminLayout activeMenu={t('nav.history')} onNavigate={onNavigate} title={t('history.title')}>
            <div className="space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex flex-wrap items-end gap-4 w-full">
                        
                        {/* Pilih Pelanggan (With Dynamic Filtering) */}
                        <div className="space-y-2 relative flex-1 min-w-[240px]">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block ml-1">{t('history.filters.select_customer')}</label>
                            <button onClick={() => setShowCustomerDropdown(!showCustomerDropdown)} className={`w-full h-[54px] flex items-center justify-between px-5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] text-[13px] font-bold transition-all ${showCustomerDropdown ? 'border-bieon-eco ring-4 ring-bieon-eco/10 bg-white' : 'hover:bg-white hover:border-bieon-eco/30 text-gray-700'}`}>
                                <div className="flex items-center gap-2 truncate">
                                    <UserIcon className="w-4 h-4 text-bieon-eco" />
                                    <span className="truncate">{isLoadingHomeowners ? t('history.loading') : (selectedHomeowner?.fullName || selectedHomeowner?.name || t('history.filters.select_customer'))}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCustomerDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showCustomerDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowCustomerDropdown(false)}></div>
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-[50] max-h-64 overflow-y-auto custom-scrollbar">
                                        {/* Jika BIEON terpilih, tampilkan opsi "Semua Pelanggan" untuk mereset BIEON */}
                                        {selectedBieon && (
                                            <button onClick={() => { setSelectedBieon(''); setCurrentPage(1); }} className="w-full text-center py-2 text-[10px] font-black text-bieon-eco border-b border-gray-50 bg-bieon-eco/5 hover:bg-bieon-eco/5 transition-colors uppercase tracking-widest">{t('history.filters.all_customers', 'Tampilkan Semua Pelanggan')}</button>
                                        )}
                                        {displayHomeowners.length > 0 ? displayHomeowners.map(h => (
                                            <button key={h._id} onClick={() => handleSelectHomeowner(h)} className={`w-full text-left px-5 py-3 text-[13px] ${selectedHomeowner?._id === h._id ? 'text-bieon-eco bg-bieon-eco/5 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>{h.fullName || h.name}</button>
                                        )) : <div className="px-5 py-4 text-center text-xs text-gray-400 font-bold italic">{t('history.filters.no_customers', 'Tidak ada pelanggan untuk filter ini')}</div>}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Pilih BIEON (With Dynamic Filtering) */}
                        <div className="space-y-2 relative flex-1 min-w-[180px]">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block ml-1">{t('history.filters.select_bieon')}</label>
                            <button onClick={() => setShowBieonDropdown(!showBieonDropdown)} className={`w-full h-[54px] flex items-center justify-between px-5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] text-[13px] font-bold transition-all ${showBieonDropdown ? 'border-bieon-eco ring-4 ring-bieon-eco/10 bg-white' : 'hover:bg-white hover:border-bieon-eco/30 text-gray-700'}`}>
                                <div className="flex items-center gap-2 truncate">
                                    <Cpu className="w-4 h-4 text-bieon-eco" />
                                    <span className="truncate">{isLoadingBieon ? '...' : (selectedBieon || t('history.filters.select_bieon'))}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showBieonDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showBieonDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowBieonDropdown(false)}></div>
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-[50] max-h-60 overflow-y-auto custom-scrollbar">
                                        <button onClick={() => handleSelectBieon('')} className={`w-full text-left px-5 py-3 text-[13px] ${!selectedBieon ? 'text-bieon-eco bg-bieon-eco/5 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>{t('history.filters.all_bieon')}</button>
                                        {displayBieonSystems.map((sys, idx) => (
                                            <button key={idx} onClick={() => handleSelectBieon(sys.bieonId)} className={`w-full text-left px-5 py-3 text-[13px] ${selectedBieon === sys.bieonId ? 'text-bieon-eco bg-bieon-eco/5 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>{sys.bieonId}</button>
                                        ))}
                                        {displayBieonSystems.length === 0 && <div className="px-5 py-4 text-center text-xs text-gray-400 font-bold italic">{t('history.filters.no_bieon', 'Tidak ada BIEON untuk pelanggan ini')}</div>}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Rentang Waktu */}
                        <div className="space-y-2 relative flex-1 min-w-[240px]">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block ml-1">{t('history.filters.date_range')}</label>
                            <button onClick={() => setShowDateDropdown(!showDateDropdown)} className={`w-full h-[54px] flex items-center justify-between px-5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] text-[13px] font-bold transition-all ${dateRange.start || dateRange.end ? 'border-bieon-eco text-bieon-eco bg-bieon-eco/5' : 'hover:bg-white hover:border-bieon-eco/30 text-gray-500'}`}>
                                <div className="flex items-center gap-2 truncate">
                                    <Calendar className="w-4 h-4" />
                                    <span className="truncate">{dateRange.start || dateRange.end ? `${formatDateDisplay(dateRange.start)} - ${formatDateDisplay(dateRange.end)}` : t('history.filters.date_range')}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showDateDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => { setShowDateDropdown(false); setActivePicker(null); }}></div>
                                    <div className="absolute top-full left-0 sm:right-0 mt-2 w-[340px] bg-white border border-gray-100 rounded-[2rem] shadow-2xl p-6 z-[50] animate-in fade-in zoom-in-95 duration-200">
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                                                <Calendar className="w-5 h-5 text-bieon-eco" />
                                                <h3 className="text-[12px] font-black text-gray-700 uppercase tracking-widest">{t('history.filters.custom_range', 'Kustom Rentang')}</h3>
                                            </div>
                                            <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">{t('history.filters.from_date')}</label><button onClick={() => setActivePicker(activePicker === 'start' ? null : 'start')} className={`w-full h-[46px] flex items-center justify-between px-4 bg-gray-50 border rounded-xl text-xs font-bold transition-all ${activePicker === 'start' ? 'border-bieon-eco ring-4 ring-bieon-eco/10' : 'border-gray-100 text-gray-900'}`}><span>{dateRange.start ? formatDateDisplay(dateRange.start) : t('history.filters.from_date')}</span><Calendar className={`w-4 h-4 text-gray-400 ${activePicker === 'start' ? 'text-bieon-eco' : ''}`} /></button></div>
                                            <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">{t('history.filters.to_date')}</label><button onClick={() => setActivePicker(activePicker === 'end' ? null : 'end')} className={`w-full h-[46px] flex items-center justify-between px-4 bg-gray-50 border rounded-xl text-xs font-bold transition-all ${activePicker === 'end' ? 'border-bieon-eco ring-4 ring-bieon-eco/10' : 'border-gray-100 text-gray-900'}`}><span>{dateRange.end ? formatDateDisplay(dateRange.end) : t('history.filters.to_date')}</span><Calendar className={`w-4 h-4 text-gray-400 ${activePicker === 'end' ? 'text-bieon-eco' : ''}`} /></button></div>
                                            {activePicker && (
                                                <div className="pt-2 border-t border-gray-50 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="flex items-center justify-between mb-4"><div className="flex flex-col"><span className="text-xs font-black text-gray-900 uppercase tracking-tight">{monthNames[viewMonth]}</span><div className="relative"><button onClick={() => setShowYearDropdown(!showYearDropdown)} className="flex items-center gap-1 text-[10px] font-black text-bieon-eco uppercase tracking-widest">{viewYear} <ChevronDown className={`w-3 h-3 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} /></button>{showYearDropdown && (<><div className="fixed inset-0 z-[60]" onClick={() => setShowYearDropdown(false)}></div><div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[70] max-h-40 overflow-y-auto custom-scrollbar">{Array.from({ length: 11 }, (_, i) => 2026 - i).map(y => (<button key={y} onClick={() => { setViewYear(y); setShowYearDropdown(false); }} className={`w-full text-left px-4 py-2 text-[10px] font-bold ${viewYear === y ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-600 hover:bg-gray-50'}`}>{y}</button>))}</div></>)}</div></div><div className="flex items-center gap-1"><button onClick={() => changeMonth('prev')} className="p-2 hover:bg-gray-50 rounded-lg"><ChevronLeft className="w-4 h-4 text-gray-400" /></button><button onClick={() => changeMonth('next')} className="p-2 hover:bg-gray-50 rounded-lg"><ChevronRight className="w-4 h-4 text-gray-400" /></button></div></div>
                                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                                        {['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'].map(d => (
                                                            <span key={d} className="text-[9px] font-black text-gray-300 text-center uppercase tracking-widest">
                                                                {t(`calendar.days.${d}`)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-7 gap-1">{calendarDays.map((d, i) => { const currentVal = `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`; const isSelected = (activePicker === 'start' ? dateRange.start : dateRange.end) === currentVal; return (<button key={i} onClick={() => handleSelectDate(d)} className={`h-8 w-full flex items-center justify-center rounded-lg text-[11px] font-bold transition-all ${!d.current ? 'text-gray-200' : isSelected ? 'bg-gradient-to-r from-bieon-eco to-bieon-sense text-white' : 'text-gray-600 hover:bg-bieon-eco/5 hover:text-bieon-eco'}`}>{d.day}</button>); })}</div>
                                                </div>
                                            )}
                                            <div className="flex gap-3 pt-2">
                                                <button onClick={() => { setDateRange({start:'', end:''}); setShowDateDropdown(false); setActivePicker(null); setCurrentPage(1); }} className="flex-1 h-[46px] text-[11px] font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest border border-gray-50 rounded-xl hover:bg-gray-50">{t('history.filters.reset_all')}</button>
                                                <button onClick={() => { setShowDateDropdown(false); setActivePicker(null); }} className="flex-1 h-[46px] bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl text-[11px] font-black hover:brightness-105 transition-all shadow-lg shadow-bieon-eco/20 uppercase tracking-widest">{t('history.filters.apply')}</button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button onClick={handleExportPDF} title={t('history.export.button_tab')} className="flex items-center justify-center w-[54px] h-[54px] bg-white border border-gray-100 text-bieon-eco rounded-[1.1rem] hover:bg-gray-50 transition-all shadow-sm active:scale-95 shrink-0"><Download className="w-5 h-5" /></button>
                        <button onClick={handleExportAllPDF} disabled={isExportingAll} className="flex items-center justify-center gap-3 px-8 h-[54px] bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-[1.25rem] font-black text-[11px] uppercase tracking-widest hover:brightness-105 transition-all shadow-lg active:scale-95 disabled:opacity-50 shrink-0">{isExportingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}<span className="whitespace-nowrap">{t('history.full_report')}</span></button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        {/* Tab Scroll Area */}
                        <div className="flex-1 min-w-0 overflow-x-auto tabs-scroll-container">
                            <style>{`
                                .tabs-scroll-container::-webkit-scrollbar { display: none; }
                                .tabs-scroll-container { 
                                    -ms-overflow-style: none; 
                                    scrollbar-width: none; 
                                    -webkit-overflow-scrolling: touch;
                                }
                            `}</style>
                            <div className="inline-flex items-center p-1.5 bg-gray-100/80 rounded-2xl gap-1 shadow-inner w-fit">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setSelectedRoomFilter(''); }}
                                        className={`px-4 sm:px-5 py-2.5 rounded-[0.95rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 flex items-center justify-center ${activeTab === tab.id ? 'bg-gradient-to-r from-bieon-eco to-bieon-sense text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        <span className="hidden xl:inline">{tab.full}</span>
                                        <span className="inline xl:hidden">{tab.short}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        
                        {/* Search & Filter Area - Locked Right */}
                        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 lg:ml-auto">
                            <div className="relative flex-1 lg:w-56 xl:w-64">
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder={t('history.search_placeholder')} 
                                    value={searchQuery} 
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-bieon-eco/10 shadow-sm" 
                                />
                            </div>


                                <div className="relative">
                                    <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className={`flex items-center justify-between gap-3 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-[13px] font-bold shadow-sm ${selectedRoomFilter ? 'text-bieon-eco border-bieon-eco' : 'text-gray-500'}`}>
                                        <Filter className="w-4 h-4" />
                                        <span>{selectedRoomFilter ? (['Notifikasi & Alert', 'Pengaduan'].includes(activeTab) ? t(`notification.category.${selectedRoomFilter?.toLowerCase().replace(/\s+/g, '_')}`, selectedRoomFilter) : selectedRoomFilter) : (['Notifikasi & Alert', 'Pengaduan'].includes(activeTab) ? t('history.all_categories') : t('history.all_rooms'))}</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    {showFilterDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setShowFilterDropdown(false)}></div>
                                            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-30">
                                                <button onClick={() => { setSelectedRoomFilter(''); setShowFilterDropdown(false); }} className={`w-full text-left px-5 py-2.5 text-xs font-bold ${!selectedRoomFilter ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-600'}`}>{['Notifikasi & Alert', 'Pengaduan'].includes(activeTab) ? t('history.all_categories') : t('history.all_rooms')}</button>
                                                {availableFilters.map(f => <button key={f} onClick={() => { setSelectedRoomFilter(f); setShowFilterDropdown(false); }} className={`w-full text-left px-5 py-2.5 text-xs font-bold ${selectedRoomFilter === f ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-600'}`}>{['Notifikasi & Alert', 'Pengaduan'].includes(activeTab) ? t(`notification.category.${f?.toLowerCase().replace(/\s+/g, '_')}`, f) : f}</button>)}
                                            </div>
                                        </>
                                    )}
                                </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
                        {isLoading && <div className="absolute inset-0 bg-white/60 z-30 flex flex-col items-center justify-center"><Loader2 className="w-10 h-10 text-bieon-eco animate-spin mb-3" /><p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{t('history.loading')}</p></div>}
                        <div className="overflow-x-auto pb-2 custom-scrollbar-x">
                            <table className="w-full text-left text-[14px] text-gray-700 table-auto min-w-max">
                                <thead className="bg-white border-b border-gray-200 text-gray-500">
                                    <tr className="bg-[#F8FAFB]/50 border-b border-gray-100 text-gray-500 select-none">
                                        <th onClick={() => requestSort('time')} className="px-6 py-4 uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-1.5">{t('history.columns.time')} {getSortIcon('time')}</div></th>
                                        {activeTab === 'Notifikasi & Alert' && <th onClick={() => requestSort('category')} className="px-6 py-4 uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-1.5">{t('history.columns.category')} {getSortIcon('category')}</div></th>}
                                        {!['Notifikasi & Alert', 'Pengaduan'].includes(activeTab) && (
                                            <th onClick={() => requestSort(['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? 'device' : 'room')} className="px-6 py-4 uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    {['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? t('history.columns.device') : t('history.columns.room')} {getSortIcon(['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? 'device' : 'room')}
                                                </div>
                                            </th>
                                        )}
                                        {activeTab === 'Kenyamanan' && (
                                            <>
                                                <th onClick={() => requestSort('temp')} className="px-6 py-4 text-center uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-1.5">{t('history.columns.temperature')} {getSortIcon('temp')}</div></th>
                                                <th onClick={() => requestSort('humidity')} className="px-6 py-4 text-center uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-1.5">{t('history.columns.humidity')} {getSortIcon('humidity')}</div></th>
                                            </>
                                        )}
                                        {activeTab === 'Keamanan' && (
                                            <>
                                                <th onClick={() => requestSort('door')} className="px-6 py-4 text-center uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-1.5">{t('history.columns.door_sensor')} {getSortIcon('door')}</div></th>
                                                <th onClick={() => requestSort('motion')} className="px-6 py-4 text-center uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-1.5">{t('history.columns.motion_sensor')} {getSortIcon('motion')}</div></th>
                                            </>
                                        )}
                                        {activeTab === 'Kualitas Air' && (
                                            <>
                                                <th onClick={() => requestSort('ph')} className="px-6 py-4 text-center uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-1.5">{t('history.columns.ph')} {getSortIcon('ph')}</div></th>
                                                <th onClick={() => requestSort('turbidity')} className="px-6 py-4 text-center uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-1.5">{t('history.columns.turbidity')} {getSortIcon('turbidity')}</div></th>
                                                <th onClick={() => requestSort('temp')} className="px-6 py-4 text-center uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-1.5">{t('history.columns.temperature')} {getSortIcon('temp')}</div></th>
                                                <th onClick={() => requestSort('tds')} className="px-6 py-4 text-center uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-1.5">{t('history.columns.tds')} {getSortIcon('tds')}</div></th>
                                            </>
                                        )}
                                        {activeTab === 'Konsumsi Energi' && (
                                            <>
                                                <th onClick={() => requestSort('kwh')} className="px-6 py-5 text-center text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">{t('history.columns.energy')} {getSortIcon('kwh')}</div></th>
                                                <th onClick={() => requestSort('voltage')} className="px-6 py-5 text-center text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">{t('history.columns.voltage')} {getSortIcon('voltage')}</div></th>
                                                <th onClick={() => requestSort('current')} className="px-6 py-5 text-center text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">{t('history.columns.current')} {getSortIcon('current')}</div></th>
                                                <th onClick={() => requestSort('power')} className="px-6 py-5 text-center text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">{t('history.columns.power_load')} {getSortIcon('power')}</div></th>
                                                <th onClick={() => requestSort('pf')} className="px-6 py-5 text-center text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">{t('history.columns.power_factor')} {getSortIcon('pf')}</div></th>
                                            </>
                                        )}
                                        {activeTab === 'Log Perangkat' && <th onClick={() => requestSort('actuator')} className="px-6 py-5 text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-2">{t('history.columns.actuator')} {getSortIcon('actuator')}</div></th>}
                                        {activeTab === 'Pengaduan' && (
                                            <>
                                                <th onClick={() => requestSort('id')} className="px-6 py-4 uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-1.5">{t('history.columns.ticket_id')} {getSortIcon('id')}</div></th>
                                                <th onClick={() => requestSort('customer')} className="px-6 py-4 uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-1.5">{t('history.columns.customer')} {getSortIcon('customer')}</div></th>
                                                <th onClick={() => requestSort('category')} className="px-6 py-4 uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-1.5">{t('history.columns.category')} {getSortIcon('category')}</div></th>
                                                <th className="px-6 py-4 uppercase tracking-wider text-[12px] font-black whitespace-nowrap">{t('history.columns.topic')}</th>
                                                <th onClick={() => requestSort('technician')} className="px-6 py-4 uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-1.5">{t('history.columns.technician')} {getSortIcon('technician')}</div></th>
                                                <th onClick={() => requestSort('rating')} className="px-6 py-4 text-center uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-1.5">{t('history.columns.rating')} {getSortIcon('rating')}</div></th>
                                            </>
                                        )}
                                        {activeTab !== 'Konsumsi Energi' && <th onClick={() => requestSort('status')} className="px-6 py-4 text-center uppercase tracking-wider text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-1.5">{activeTab === 'Notifikasi & Alert' ? t('history.columns.danger_level') : t('history.columns.status')} {getSortIcon('status')}</div></th>}
                                        {activeTab === 'Pengaduan' && <th className="px-6 py-4 uppercase tracking-wider text-[12px] font-black whitespace-nowrap">{t('history.columns.action')}</th>}
                                        {activeTab === 'Log Perangkat' && <th onClick={() => requestSort('trigger')} className="px-6 py-5 text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-2">{t('history.columns.trigger')} {getSortIcon('trigger')}</div></th>}
                                        {activeTab === 'Notifikasi & Alert' && <th onClick={() => requestSort('message')} className="px-6 py-5 text-[12px] font-black cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-2">{t('history.columns.message_detail')} {getSortIcon('message')}</div></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((item) => (
                                            <tr key={item.id} className="hover:bg-[#F8FAFB]/50 transition-colors group text-[#374151]">
                                                <td className="px-6 py-4 text-[13px] font-medium text-gray-500 whitespace-nowrap">{formatDateTime(item.rawTime)}</td>
                                                {activeTab === 'Notifikasi & Alert' && <td className="px-6 py-4 text-[13px] font-bold text-gray-800">{t(`notification.category.${item.rawCategory?.toLowerCase().replace(/\s+/g, '_')}`, item.rawCategory)}</td>}
                                                {!['Notifikasi & Alert', 'Pengaduan'].includes(activeTab) && <td className="px-6 py-4 text-[13px] font-bold text-gray-800">{item.room || item.device}</td>}
                                                {activeTab === 'Kenyamanan' && (<><td className="px-6 py-4 text-center">{Number(item.temp).toFixed(1)}°C</td><td className="px-6 py-4 text-center">{item.humidity}%</td></>)}
                                                {activeTab === 'Keamanan' && (<><td className="px-6 py-4 text-center">{localizeStatus(item.rawDoor)}</td><td className="px-6 py-4 text-center">{localizeStatus(item.rawMotion)}</td></>)}
                                                {activeTab === 'Kualitas Air' && (<><td className="px-6 py-4 text-center">{item.ph}</td><td className="px-6 py-4 text-center">{item.turbidity} NTU</td><td className="px-6 py-4 text-center">{item.temp}°C</td><td className="px-6 py-4 text-center">{item.tds} ppm</td></>)}
                                                {activeTab === 'Konsumsi Energi' && (<><td className="px-6 py-4 text-center">{Number(item.kwh).toFixed(2)} kWh</td><td className="px-6 py-4 text-center">{item.voltage} V</td><td className="px-6 py-4 text-center">{item.current} A</td><td className="px-6 py-4 text-center">{item.power} W</td><td className="px-6 py-4 text-center">{item.pf}</td></>)}
                                                {activeTab === 'Log Perangkat' && <td className="px-6 py-4">{item.actuator}</td>}
                                                {activeTab === 'Pengaduan' && (
                                                    <>
                                                        <td className="px-6 py-4 text-[13px] font-bold text-gray-900 whitespace-nowrap">{item.id}</td>
                                                        <td className="px-6 py-4 text-[13px] font-bold text-gray-800 whitespace-nowrap">{item.customer}</td>
                                                        <td className="px-6 py-4 text-[13px] font-medium text-gray-900">{t(`notification.category.${item.rawCategory?.toLowerCase().replace(/\s+/g, '_') || 'unknown'}`, item.rawCategory)}</td>
                                                        <td className="px-6 py-4 text-[13px] font-medium text-gray-900 max-w-[300px] truncate" title={item.topic}>{item.topic}</td>
                                                        <td className="px-6 py-4 text-[13px]">
                                                            <span className={item.technician === t('complaint.status_unassigned') ? 'text-gray-400 italic font-medium' : 'text-gray-700 font-bold'}>
                                                                {item.technician}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {item.status === 'selesai' && item.rating !== '-' ? (
                                                                <div className="inline-flex items-center gap-1 font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                                    <Star className="w-3 h-3 fill-amber-500" />
                                                                    {item.rating}/5
                                                                </div>
                                                            ) : <span className="text-gray-300 font-bold">—</span>}
                                                        </td>
                                                    </>
                                                )}
                                                {activeTab !== 'Konsumsi Energi' && (
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center">
                                                            {activeTab === 'Pengaduan' ? (
                                                                <TicketStatusBadge status={item.status} rating={item.rating} />
                                                            ) : (
                                                                <StatusBadge status={localizeStatus(item.rawStatus)} isRead={item.isRead} />
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                                {activeTab === 'Pengaduan' && (
                                                    <td className="px-6 py-4">
                                                        <button 
                                                            onClick={() => { setSelectedTicket(item.rawItem); setIsDetailModalOpen(true); }}
                                                            className="flex items-center gap-2 px-4 py-2.5 bg-[#e8f9fb] text-[#1E4D40] rounded-2xl text-[11px] font-bold hover:bg-[#d4ece3] transition-all shadow-sm shrink-0 group relative"
                                                        >
                                                            <Eye className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                                                            <span>{t('history.columns.action_detail', 'Detail')}</span>
                                                        </button>
                                                    </td>
                                                )}
                                                {activeTab === 'Log Perangkat' && <td className="px-6 py-4">{localizeTrigger(item.trigger)}</td>}
                                                {activeTab === 'Notifikasi & Alert' && <td className="px-6 py-4 text-xs text-gray-500 max-w-md">{item.messageKey ? t(item.messageKey, item.metadata) : item.rawMessage}</td>}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center opacity-40">
                                                    <AlertCircle className="w-12 h-12 mb-4 text-gray-300" />
                                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">{t('history.no_data')}</p>
                                                    <p className="text-[11px] font-bold text-gray-400 mt-2">{t('history.no_data_desc', 'Data untuk filter ini belum tersedia atau belum sinkron.')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-between px-6 py-6 border-t border-gray-100 bg-gray-50/50 rounded-b-[2rem] gap-6">
                            {/* Rows Per Page - Left */}
                            <div className="flex items-center gap-3 order-2 md:order-1">
                                <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{t('history.rows_per_page', 'Rows')}</span>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowRowsDropdown(!showRowsDropdown)} 
                                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold text-xs shadow-sm hover:border-bieon-eco/30 transition-all"
                                    >
                                        {rowsPerPage} <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showRowsDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-30" onClick={() => setShowRowsDropdown(false)}></div>
                                            <div className="absolute bottom-full left-0 mb-2 w-20 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-bottom-2">
                                                {[5, 10, 30, 50].map(val => (
                                                    <button 
                                                        key={val} 
                                                        onClick={() => { setRowsPerPage(val); setShowRowsDropdown(false); setCurrentPage(1); }} 
                                                        className={`w-full text-left px-4 py-2 text-xs font-bold ${rowsPerPage === val ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-500 hover:bg-gray-50'}`}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Page Info - Center */}
                            <div className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-center whitespace-nowrap order-1 md:order-2">
                                {t('history.page_info', { 
                                    current: totalItems > 0 ? startIndex + 1 : 0, 
                                    last: Math.min(startIndex + rowsPerPage, totalItems), 
                                    total: totalItems 
                                })}
                            </div>

                            {/* Pagination Controls - Right */}
                            <div className="flex items-center gap-2 md:gap-3 order-3">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    className="p-2 md:px-5 lg:px-6 md:py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] md:text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center min-w-[36px]"
                                >
                                    <ChevronLeft className="w-4 h-4 md:hidden" />
                                    <span className="hidden md:inline">{t('history.previous')}</span>
                                </button>
                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    className="p-2 md:px-5 lg:px-6 md:py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] md:text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center min-w-[36px]"
                                >
                                    <span className="hidden md:inline">{t('history.next')}</span>
                                    <ChevronRight className="w-4 h-4 md:hidden" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isDetailModalOpen && selectedTicket && (
                <ComplaintDetailModal 
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    ticket={selectedTicket}
                    role="admin"
                    isHistoryView={true}
                />
            )}
        </SuperAdminLayout>
    );
}
