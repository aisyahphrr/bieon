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
    AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SuperAdminLayout } from './SuperAdminLayout';
import { StatusBadge } from '../../shared/StatusBadge';

export default function AdminHistory({ onNavigate }) {
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

    // --- Filter & Pagination States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoomFilter, setSelectedRoomFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });
    const [rowsPerPage, setRowsPerPage] = useState(10);
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
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
        { id: 'Kenyamanan',       full: 'Kenyamanan',       short: 'Nyaman', endpoint: '/api/history/environment' },
        { id: 'Keamanan',         full: 'Keamanan',         short: 'Aman', endpoint: '/api/history/security' },
        { id: 'Kualitas Air',     full: 'Kualitas Air',     short: 'Air', endpoint: '/api/history/water' },
        { id: 'Konsumsi Energi',  full: 'Konsumsi Energi',  short: 'Energi', endpoint: '/api/history/energy' },
        { id: 'Log Perangkat',    full: 'Log Perangkat',    short: 'Log', endpoint: '/api/history/activity' },
        { id: 'Notifikasi & Alert', full: 'Notifikasi & Alert', short: 'Alert', endpoint: '/api/history/alerts' }
    ];

    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', {
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

    const mapItemData = (tabId, item, index) => {
        const rawDate = item.date || item.timestamp || item.createdAt;
        const base = {
            id: item._id || index,
            time: formatDateTime(rawDate),
            timestamp: new Date(rawDate).getTime(),
            status: item.status || item.type || 'Normal'
        };
        if (tabId === 'Kenyamanan') return { ...base, room: item.room, temp: item.avgTemperature, humidity: item.avgHumidity };
        if (tabId === 'Keamanan') return { ...base, room: item.room, door: item.door, motion: item.motion };
        if (tabId === 'Kualitas Air') return { ...base, device: item.device?.name || item.device || 'Sensor Air', ph: item.ph, turbidity: cleanValue(item.turbidity), temp: cleanValue(item.temperature), tds: cleanValue(item.tds) };
        if (tabId === 'Konsumsi Energi') return { ...base, device: item.device?.name || item.device || 'Power Meter', kwh: cleanValue(item.totalKwh), voltage: cleanValue(item.voltage), current: cleanValue(item.current), power: cleanValue(item.power), pf: item.pf + ' PF' };
        if (tabId === 'Log Perangkat') return { ...base, room: item.room, actuator: item.actuator, trigger: item.trigger };
        if (tabId === 'Notifikasi & Alert') return { ...base, status: item.type || item.status || 'Normal', category: item.category, room: item.room, message: item.message, isRead: item.isRead };
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
                const defaultCustomer = result.data.find(h => (h.fullName || h.name || '').toLowerCase().includes('testingakun'));
                if (defaultCustomer) setSelectedHomeowner(defaultCustomer);
                else if (result.data.length > 0) setSelectedHomeowner(result.data[0]);
            } else { setApiError(result.message); }
        } catch (err) { setApiError("Koneksi gagal."); }
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
        if (selectedRoomFilter) filtered = filtered.filter(item => (['Kualitas Air', 'Konsumsi Energi'].includes(activeTab)) ? item.device === selectedRoomFilter : item.room === selectedRoomFilter);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(item => `${item.time} ${item.room || item.device} ${item.status || ''} ${item.message || ''}`.toLowerCase().includes(q));
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

    const availableFilters = useMemo(() => Array.from(new Set(historyData.map(d => d.room || d.device))), [historyData]);
    const totalItems = processedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = processedData.slice(startIndex, startIndex + rowsPerPage);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#009b7c]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#009b7c]" />;
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const handleExportPDF = () => {
        if (processedData.length === 0) return;
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFontSize(20); doc.setTextColor(0, 155, 124);
        doc.text(`Laporan: ${activeTab}`, 15, 20);
        const { headers, body } = generateTableConfig(activeTab, processedData);
        autoTable(doc, { startY: 38, head: headers, body: body, theme: 'striped', headStyles: { fillColor: [0, 155, 124] } });
        doc.save(`BIEON_${activeTab}.pdf`);
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
            doc.setTextColor(0, 155, 124);
            doc.setFont("helvetica", "bold");
            doc.text("BIEON SMART SYSTEM", pageWidth / 2, 85, { align: 'center' });
            
            doc.setFontSize(20);
            doc.setTextColor(60, 60, 60);
            doc.text("LAPORAN RIWAYAT AKTIVITAS", pageWidth / 2, 98, { align: 'center' });
            
            doc.setDrawColor(0, 155, 124);
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

            addDetail("Nama Pelanggan", selectedHomeowner.fullName || selectedHomeowner.name, startY);
            addDetail("Alamat", selectedHomeowner.address || "-", startY + lineSpacing);
            addDetail("ID BIEON", selectedBieon || "Semua Perangkat", startY + lineSpacing * 2);
            
            const startRange = dateRange.start ? formatDateDisplay(dateRange.start) : 'Awal Waktu';
            const endRange = dateRange.end ? formatDateDisplay(dateRange.end) : 'Sekarang';
            addDetail("Periode Laporan", `${startRange} - ${endRange}`, startY + lineSpacing * 3);
            addDetail("Dihasilkan Pada", formatDateTime(new Date()), startY + lineSpacing * 4);

            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text("Dokumen ini dihasilkan secara otomatis oleh Sistem Monitoring BIEON.", pageWidth / 2, pageHeight - 25, { align: 'center' });
            doc.text("© 2026 BPJS - BIEON Project", pageWidth / 2, pageHeight - 19, { align: 'center' });

            // --- DATA PAGES ---
            let queryParams = `homeownerId=${selectedHomeowner._id}`;
            if (selectedBieon) queryParams += `&bieonId=${selectedBieon}`;
            if (dateRange.start) queryParams += `&startDate=${dateRange.start}`;
            if (dateRange.end) queryParams += `&endDate=${dateRange.end}`;

            for (let tab of tabs) {
                const res = await fetch(`${tab.endpoint}?${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } });
                const result = await res.json();
                
                if (result.success && result.data && result.data.length > 0) {
                    doc.addPage(); 
                    doc.setFontSize(18);
                    doc.setTextColor(0, 155, 124);
                    doc.text(`Kategori: ${tab.full}`, 15, 18);
                    
                    const { headers, body } = generateTableConfig(tab.id, result.data.map((item, idx) => mapItemData(tab.id, item, idx)));
                    
                    autoTable(doc, { 
                        startY: 25, 
                        head: headers, 
                        body: body, 
                        theme: 'striped', 
                        headStyles: { fillColor: [0, 155, 124], fontSize: 10, halign: 'center' },
                        bodyStyles: { fontSize: 9, halign: 'center' },
                        columnStyles: { 0: { halign: 'left' }, 1: { halign: 'left' } }, // Waktu & Ruangan left aligned
                        margin: { top: 25, bottom: 20 }
                    });
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
        if (tabId === 'Kenyamanan') { headers = [["Waktu", "Ruangan", "Suhu", "Kelembapan", "Status"]]; body = data.map(e => [e.time, e.room, `${e.temp}°C`, e.humidity, e.status]); }
        else if (tabId === 'Keamanan') { headers = [["Waktu", "Ruangan", "Pintu", "Gerak", "Status"]]; body = data.map(e => [e.time, e.room, e.door, e.motion, e.status]); }
        else if (tabId === 'Kualitas Air') { headers = [["Waktu", "Perangkat", "pH", "Kekeruhan", "Suhu", "TDS", "Status"]]; body = data.map(e => [e.time, e.device, e.ph, `${e.turbidity} NTU`, `${e.temp}°C`, `${e.tds} ppm`, e.status]); }
        else if (tabId === 'Konsumsi Energi') { headers = [["Waktu", "Perangkat", "Energy", "Voltase", "Arus", "Beban", "PF"]]; body = data.map(e => [e.time, e.device, `${e.kwh} kWh`, `${e.voltage} V`, `${e.current} A`, `${e.power} W`, e.pf]); }
        else if (tabId === 'Log Perangkat') { headers = [["Waktu", "Ruangan", "Perangkat", "Status", "Pemicu"]]; body = data.map(e => [e.time, e.room, e.actuator, e.status, e.trigger]); }
        else if (tabId === 'Notifikasi & Alert') { headers = [["Waktu", "Kategori", "Ruangan", "Level", "Pesan"]]; body = data.map(e => [e.time, e.category, e.room, e.status, e.message]); }
        return { headers, body };
    };

    return (
        <SuperAdminLayout activeMenu="Riwayat" onNavigate={onNavigate} title="Riwayat Aktivitas">
            <div className="space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex flex-wrap items-end gap-4 w-full">
                        
                        {/* Pilih Pelanggan (With Dynamic Filtering) */}
                        <div className="space-y-2 relative flex-1 min-w-[240px]">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block ml-1">Pilih Pelanggan</label>
                            <button onClick={() => setShowCustomerDropdown(!showCustomerDropdown)} className={`w-full h-[54px] flex items-center justify-between px-5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] text-[13px] font-bold transition-all ${showCustomerDropdown ? 'border-[#009b7c] ring-4 ring-[#009b7c]/5 bg-white' : 'hover:bg-white hover:border-[#009b7c]/30 text-gray-700'}`}>
                                <div className="flex items-center gap-2 truncate">
                                    <UserIcon className="w-4 h-4 text-[#009b7c]" />
                                    <span className="truncate">{isLoadingHomeowners ? 'Memuat...' : (selectedHomeowner?.fullName || selectedHomeowner?.name || 'Pilih Pelanggan')}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCustomerDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showCustomerDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowCustomerDropdown(false)}></div>
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-[50] max-h-64 overflow-y-auto custom-scrollbar">
                                        {/* Jika BIEON terpilih, tampilkan opsi "Semua Pelanggan" untuk mereset BIEON */}
                                        {selectedBieon && (
                                            <button onClick={() => { setSelectedBieon(''); setCurrentPage(1); }} className="w-full text-center py-2 text-[10px] font-black text-[#009b7c] border-b border-gray-50 bg-[#F2F8F5]/50 hover:bg-[#F2F8F5] transition-colors uppercase tracking-widest">Tampilkan Semua Pelanggan</button>
                                        )}
                                        {displayHomeowners.length > 0 ? displayHomeowners.map(h => (
                                            <button key={h._id} onClick={() => handleSelectHomeowner(h)} className={`w-full text-left px-5 py-3 text-[13px] ${selectedHomeowner?._id === h._id ? 'text-[#009b7c] bg-[#F2F8F5] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>{h.fullName || h.name}</button>
                                        )) : <div className="px-5 py-4 text-center text-xs text-gray-400 font-bold italic">Tidak ada pelanggan untuk filter ini</div>}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Pilih BIEON (With Dynamic Filtering) */}
                        <div className="space-y-2 relative flex-1 min-w-[180px]">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block ml-1">Pilih BIEON</label>
                            <button onClick={() => setShowBieonDropdown(!showBieonDropdown)} className={`w-full h-[54px] flex items-center justify-between px-5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] text-[13px] font-bold transition-all ${showBieonDropdown ? 'border-[#009b7c] ring-4 ring-[#009b7c]/5 bg-white' : 'hover:bg-white hover:border-[#009b7c]/30 text-gray-700'}`}>
                                <div className="flex items-center gap-2 truncate">
                                    <Cpu className="w-4 h-4 text-[#009b7c]" />
                                    <span className="truncate">{isLoadingBieon ? '...' : (selectedBieon || 'Pilih BIEON')}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showBieonDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showBieonDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowBieonDropdown(false)}></div>
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-[50] max-h-60 overflow-y-auto custom-scrollbar">
                                        <button onClick={() => handleSelectBieon('')} className={`w-full text-left px-5 py-3 text-[13px] ${!selectedBieon ? 'text-[#009b7c] bg-[#F2F8F5] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>Semua BIEON</button>
                                        {displayBieonSystems.map((sys, idx) => (
                                            <button key={idx} onClick={() => handleSelectBieon(sys.bieonId)} className={`w-full text-left px-5 py-3 text-[13px] ${selectedBieon === sys.bieonId ? 'text-[#009b7c] bg-[#F2F8F5] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>{sys.bieonId}</button>
                                        ))}
                                        {displayBieonSystems.length === 0 && <div className="px-5 py-4 text-center text-xs text-gray-400 font-bold italic">Tidak ada BIEON untuk pelanggan ini</div>}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Rentang Waktu */}
                        <div className="space-y-2 relative flex-1 min-w-[240px]">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block ml-1">Rentang Waktu</label>
                            <button onClick={() => setShowDateDropdown(!showDateDropdown)} className={`w-full h-[54px] flex items-center justify-between px-5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] text-[13px] font-bold transition-all ${dateRange.start || dateRange.end ? 'border-[#009b7c] text-[#009b7c] bg-[#F2F8F5]' : 'hover:bg-white hover:border-[#009b7c]/30 text-gray-500'}`}>
                                <div className="flex items-center gap-2 truncate">
                                    <Calendar className="w-4 h-4" />
                                    <span className="truncate">{dateRange.start || dateRange.end ? `${formatDateDisplay(dateRange.start)} - ${formatDateDisplay(dateRange.end)}` : 'Pilih Rentang Waktu'}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showDateDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => { setShowDateDropdown(false); setActivePicker(null); }}></div>
                                    <div className="absolute top-full left-0 sm:right-0 mt-2 w-[340px] bg-white border border-gray-100 rounded-[2rem] shadow-2xl p-6 z-[50] animate-in fade-in zoom-in-95 duration-200">
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                                                <Calendar className="w-5 h-5 text-[#009b7c]" />
                                                <h3 className="text-[12px] font-black text-gray-700 uppercase tracking-widest">Kustom Rentang</h3>
                                            </div>
                                            <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Dari Tanggal</label><button onClick={() => setActivePicker(activePicker === 'start' ? null : 'start')} className={`w-full h-[46px] flex items-center justify-between px-4 bg-gray-50 border rounded-xl text-xs font-bold transition-all ${activePicker === 'start' ? 'border-[#009b7c] ring-4 ring-[#009b7c]/5' : 'border-gray-100 text-gray-900'}`}><span>{dateRange.start ? formatDateDisplay(dateRange.start) : 'Pilih Tanggal'}</span><Calendar className={`w-4 h-4 text-gray-400 ${activePicker === 'start' ? 'text-[#009b7c]' : ''}`} /></button></div>
                                            <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Sampai Tanggal</label><button onClick={() => setActivePicker(activePicker === 'end' ? null : 'end')} className={`w-full h-[46px] flex items-center justify-between px-4 bg-gray-50 border rounded-xl text-xs font-bold transition-all ${activePicker === 'end' ? 'border-[#009b7c] ring-4 ring-[#009b7c]/5' : 'border-gray-100 text-gray-900'}`}><span>{dateRange.end ? formatDateDisplay(dateRange.end) : 'Pilih Tanggal'}</span><Calendar className={`w-4 h-4 text-gray-400 ${activePicker === 'end' ? 'text-[#009b7c]' : ''}`} /></button></div>
                                            {activePicker && (
                                                <div className="pt-2 border-t border-gray-50 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="flex items-center justify-between mb-4"><div className="flex flex-col"><span className="text-xs font-black text-gray-900 uppercase tracking-tight">{monthNames[viewMonth]}</span><div className="relative"><button onClick={() => setShowYearDropdown(!showYearDropdown)} className="flex items-center gap-1 text-[10px] font-black text-[#009b7c] uppercase tracking-widest">{viewYear} <ChevronDown className={`w-3 h-3 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} /></button>{showYearDropdown && (<><div className="fixed inset-0 z-[60]" onClick={() => setShowYearDropdown(false)}></div><div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[70] max-h-40 overflow-y-auto custom-scrollbar">{Array.from({ length: 11 }, (_, i) => 2026 - i).map(y => (<button key={y} onClick={() => { setViewYear(y); setShowYearDropdown(false); }} className={`w-full text-left px-4 py-2 text-[10px] font-bold ${viewYear === y ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-600 hover:bg-gray-50'}`}>{y}</button>))}</div></>)}</div></div><div className="flex items-center gap-1"><button onClick={() => changeMonth('prev')} className="p-2 hover:bg-gray-50 rounded-lg"><ChevronLeft className="w-4 h-4 text-gray-400" /></button><button onClick={() => changeMonth('next')} className="p-2 hover:bg-gray-50 rounded-lg"><ChevronRight className="w-4 h-4 text-gray-400" /></button></div></div>
                                                    <div className="grid grid-cols-7 gap-1 mb-2">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="text-[9px] font-black text-gray-300 text-center uppercase tracking-widest">{d}</span>)}</div>
                                                    <div className="grid grid-cols-7 gap-1">{calendarDays.map((d, i) => { const currentVal = `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`; const isSelected = (activePicker === 'start' ? dateRange.start : dateRange.end) === currentVal; return (<button key={i} onClick={() => handleSelectDate(d)} className={`h-8 w-full flex items-center justify-center rounded-lg text-[11px] font-bold transition-all ${!d.current ? 'text-gray-200' : isSelected ? 'bg-[#009b7c] text-white' : 'text-gray-600 hover:bg-[#F2F8F5] hover:text-[#009b7c]'}`}>{d.day}</button>); })}</div>
                                                </div>
                                            )}
                                            <div className="flex gap-3 pt-2">
                                                <button onClick={() => { setDateRange({start:'', end:''}); setShowDateDropdown(false); setActivePicker(null); setCurrentPage(1); }} className="flex-1 h-[46px] text-[11px] font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest border border-gray-50 rounded-xl hover:bg-gray-50">Reset All</button>
                                                <button onClick={() => { setShowDateDropdown(false); setActivePicker(null); }} className="flex-1 h-[46px] bg-[#009b7c] text-white rounded-xl text-[11px] font-black hover:bg-[#008268] transition-all shadow-lg shadow-[#009b7c]/20 uppercase tracking-widest">Terapkan</button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button onClick={handleExportPDF} title="Export Tab Ini" className="flex items-center justify-center w-[54px] h-[54px] bg-white border border-gray-100 text-[#009b7c] rounded-[1.1rem] hover:bg-gray-50 transition-all shadow-sm active:scale-95 shrink-0"><Download className="w-5 h-5" /></button>
                        <button onClick={handleExportAllPDF} disabled={isExportingAll} className="flex items-center justify-center gap-3 px-8 h-[54px] bg-[#009b7c] text-white rounded-[1.25rem] font-black text-[11px] uppercase tracking-widest hover:bg-[#008268] transition-all shadow-lg active:scale-95 disabled:opacity-50 shrink-0">{isExportingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />}<span className="whitespace-nowrap">Laporan Lengkap</span></button>
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
                                        className={`px-4 sm:px-5 py-2.5 rounded-[0.95rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 flex items-center justify-center ${activeTab === tab.id ? 'bg-[#009b7c] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
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
                                    placeholder="Cari data..." 
                                    value={searchQuery} 
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-[#009b7c]/10 shadow-sm" 
                                />
                            </div>


                                <div className="relative">
                                    <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className={`flex items-center justify-between gap-3 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-[13px] font-bold shadow-sm ${selectedRoomFilter ? 'text-[#009b7c] border-[#009b7c]' : 'text-gray-500'}`}>
                                        <Filter className="w-4 h-4" />
                                        <span>{selectedRoomFilter || 'Semua'}</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    {showFilterDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setShowFilterDropdown(false)}></div>
                                            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-30">
                                                <button onClick={() => { setSelectedRoomFilter(''); setShowFilterDropdown(false); }} className={`w-full text-left px-5 py-2.5 text-xs font-bold ${!selectedRoomFilter ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-600'}`}>Semua</button>
                                                {availableFilters.map(f => <button key={f} onClick={() => { setSelectedRoomFilter(f); setShowFilterDropdown(false); }} className={`w-full text-left px-5 py-2.5 text-xs font-bold ${selectedRoomFilter === f ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-600'}`}>{f}</button>)}
                                            </div>
                                        </>
                                    )}
                                </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
                        {isLoading && <div className="absolute inset-0 bg-white/60 z-30 flex flex-col items-center justify-center"><Loader2 className="w-10 h-10 text-[#009b7c] animate-spin mb-3" /><p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Sinkronisasi...</p></div>}
                        <div className="overflow-x-auto pb-2 custom-scrollbar-x">
                            <table className="w-full text-left text-[14px] text-gray-700 table-auto min-w-max">
                                <thead className="bg-white border-b border-gray-200 text-gray-500">
                                    <tr>
                                        <th onClick={() => requestSort('time')} className="px-6 py-5 font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-2">Waktu {getSortIcon('time')}</div></th>
                                        {activeTab === 'Notifikasi & Alert' && <th onClick={() => requestSort('category')} className="px-6 py-5 font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-2">Kategori {getSortIcon('category')}</div></th>}
                                        <th onClick={() => requestSort(['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? 'device' : 'room')} className="px-6 py-5 font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-2">{['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? 'Perangkat' : 'Ruangan'} {getSortIcon(['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? 'device' : 'room')}</div></th>
                                        {activeTab === 'Kenyamanan' && (
                                            <>
                                                <th onClick={() => requestSort('temp')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">Suhu {getSortIcon('temp')}</div></th>
                                                <th onClick={() => requestSort('humidity')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">Kelembapan {getSortIcon('humidity')}</div></th>
                                            </>
                                        )}
                                        {activeTab === 'Keamanan' && (
                                            <>
                                                <th onClick={() => requestSort('door')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">Pintu {getSortIcon('door')}</div></th>
                                                <th onClick={() => requestSort('motion')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">Gerak {getSortIcon('motion')}</div></th>
                                            </>
                                        )}
                                        {activeTab === 'Kualitas Air' && (
                                            <>
                                                <th onClick={() => requestSort('ph')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">pH {getSortIcon('ph')}</div></th>
                                                <th onClick={() => requestSort('turbidity')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">Kekeruhan {getSortIcon('turbidity')}</div></th>
                                                <th onClick={() => requestSort('temp')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">Suhu {getSortIcon('temp')}</div></th>
                                                <th onClick={() => requestSort('tds')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">Padatan Terlarut (TDS) {getSortIcon('tds')}</div></th>
                                            </>
                                        )}
                                        {activeTab === 'Konsumsi Energi' && (
                                            <>
                                                <th onClick={() => requestSort('kwh')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">kWh {getSortIcon('kwh')}</div></th>
                                                <th onClick={() => requestSort('voltage')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">Voltase {getSortIcon('voltage')}</div></th>
                                                <th onClick={() => requestSort('current')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">Arus {getSortIcon('current')}</div></th>
                                                <th onClick={() => requestSort('power')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">Beban Daya {getSortIcon('power')}</div></th>
                                                <th onClick={() => requestSort('pf')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">Power Factor {getSortIcon('pf')}</div></th>
                                            </>
                                        )}
                                        {activeTab === 'Log Perangkat' && <th onClick={() => requestSort('actuator')} className="px-6 py-5 font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-2">Perangkat (Aktuator) {getSortIcon('actuator')}</div></th>}
                                        {activeTab !== 'Konsumsi Energi' && <th onClick={() => requestSort('status')} className="px-6 py-5 text-center font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center justify-center gap-2">{activeTab === 'Notifikasi & Alert' ? 'Tingkat Bahaya' : 'Status'} {getSortIcon('status')}</div></th>}
                                        {activeTab === 'Log Perangkat' && <th onClick={() => requestSort('trigger')} className="px-6 py-5 font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-2">Pemicu (Trigger) {getSortIcon('trigger')}</div></th>}
                                        {activeTab === 'Notifikasi & Alert' && <th onClick={() => requestSort('message')} className="px-6 py-5 font-bold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap"><div className="flex items-center gap-2">Pesan Detail Alert {getSortIcon('message')}</div></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-[13px] font-bold text-gray-900">{item.time}</td>
                                            {activeTab === 'Notifikasi & Alert' && <td className="px-6 py-4 text-[13px] text-gray-600 font-bold">{item.category}</td>}
                                            <td className="px-6 py-4 text-[13px] text-gray-600 font-bold">{item.room || item.device}</td>
                                            {activeTab === 'Kenyamanan' && (<><td className="px-6 py-4 text-center">{Number(item.temp).toFixed(1)}°C</td><td className="px-6 py-4 text-center">{item.humidity}%</td></>)}
                                            {activeTab === 'Keamanan' && (<><td className="px-6 py-4 text-center">{item.door}</td><td className="px-6 py-4 text-center">{item.motion}</td></>)}
                                            {activeTab === 'Kualitas Air' && (<><td className="px-6 py-4 text-center">{item.ph}</td><td className="px-6 py-4 text-center">{item.turbidity} NTU</td><td className="px-6 py-4 text-center">{item.temp}°C</td><td className="px-6 py-4 text-center">{item.tds} ppm</td></>)}
                                            {activeTab === 'Konsumsi Energi' && (<><td className="px-6 py-4 text-center">{Number(item.kwh).toFixed(2)} kWh</td><td className="px-6 py-4 text-center">{item.voltage} V</td><td className="px-6 py-4 text-center">{item.current} A</td><td className="px-6 py-4 text-center">{item.power} W</td><td className="px-6 py-4 text-center">{item.pf}</td></>)}
                                            {activeTab === 'Log Perangkat' && <td className="px-6 py-4">{item.actuator}</td>}
                                            {activeTab !== 'Konsumsi Energi' && <td className="px-6 py-4 text-center"><div className="flex justify-center"><StatusBadge status={item.status} isRead={item.isRead} /></div></td>}
                                            {activeTab === 'Log Perangkat' && <td className="px-6 py-4">{item.trigger}</td>}
                                            {activeTab === 'Notifikasi & Alert' && <td className="px-6 py-4 text-xs text-gray-500 max-w-md">{item.message}</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-row items-center justify-between px-6 py-6 border-t border-gray-100 bg-gray-50/30">
                            <div className="flex items-center gap-3"><span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Rows:</span><div className="relative"><button onClick={() => setShowRowsDropdown(!showRowsDropdown)} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold text-xs shadow-sm">{rowsPerPage} <ChevronDown className="w-3 h-3 text-gray-400" /></button>{showRowsDropdown && (<><div className="fixed inset-0 z-10" onClick={() => setShowRowsDropdown(false)}></div><div className="absolute bottom-full left-0 mb-2 w-16 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-20">{[5, 10, 20, 50].map(val => (<button key={val} onClick={() => { setRowsPerPage(val); setCurrentPage(1); setShowRowsDropdown(false); }} className={`w-full text-left px-4 py-1.5 text-xs ${rowsPerPage === val ? 'text-[#009b7c] bg-[#F2F8F5] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>{val}</button>))}</div></>)}</div></div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{totalItems > 0 ? `${startIndex + 1}-${Math.min(startIndex + rowsPerPage, totalItems)} OF ${totalItems}` : '0 OF 0'}</div>
                            <div className="flex items-center gap-2"><button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40"><ChevronLeft className="w-5 h-5 text-gray-600" /></button><button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40"><ChevronRight className="w-5 h-5 text-gray-600" /></button></div>
                        </div>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
