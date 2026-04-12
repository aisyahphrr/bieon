import React, { useState, useMemo, useEffect } from 'react';
import {
    Zap,
    ChevronDown,
    ShieldCheck,
    Calendar,
    Download,
    TrendingUp,
    TrendingDown,
    Info,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Search,
    Filter,
    History,
    CheckCircle2
} from 'lucide-react';
import {
    LineChart, Line, PieChart, Pie, Cell, Legend,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { SuperAdminLayout } from './SuperAdminLayout';

export default function AdminTariff({ onNavigate }) {

    const golonganOptions = [
        'R1 - 450 VA (Subsidi)',
        'R1 - 900 VA (Subsidi)',
        'R1M - 900 VA (Non-Subsidi)',
        'R1 - 1300 VA',
        'R1 - 2200 VA',
        'R2 - 3500 s.d 5500 VA',
        'R3 - 6600 VA ke atas'
    ];

    // --- CAROUSEL STATES ---
    const [activeSlide, setActiveSlide] = useState(0);
    const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);

    const categoryStats = useMemo(() => {
        return golonganOptions.map((gol, i) => {
            const baseTarif = 1300 + (i * 150.25);
            return {
                name: gol,
                currentTariff: baseTarif,
                percentage: (i % 2 === 0 ? 1 : -1) * (1.2 + i * 0.4),
                effectiveDate: `1 ${i % 2 === 0 ? 'Januari' : 'Juli'} 2026`,
                skNo: `SK Menteri ESDM No. ${15 + i}/2026`,
                totalChanges: 3 + i,
                lastChangeSince: `Jan ${2024 + (i % 2)}`
            };
        });
    }, []);

    useEffect(() => {
        if (!isAutoPlayEnabled) return;
        const interval = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % golonganOptions.length);
        }, 7000); // 7s auto scroll
        return () => clearInterval(interval);
    }, [isAutoPlayEnabled]);

    const handleManualSlide = (index) => {
        setActiveSlide(index);
        setIsAutoPlayEnabled(false); // Pause auto-play if user manually clicks
    };

    // --- Drag/Swipe Event Handlers for Carousel ---
    const [dragStartX, setDragStartX] = useState(null);

    const onDragStart = (clientX) => {
        setDragStartX(clientX);
    };

    const onDragEnd = (clientX) => {
        if (dragStartX === null) return;
        const dragDistance = clientX - dragStartX;
        if (dragDistance > 50) {
            // Swiped Right -> Prev
            setActiveSlide(prev => (prev - 1 + golonganOptions.length) % golonganOptions.length);
            setIsAutoPlayEnabled(false);
        } else if (dragDistance < -50) {
            // Swiped Left -> Next
            setActiveSlide(prev => (prev + 1) % golonganOptions.length);
            setIsAutoPlayEnabled(false);
        }
        setDragStartX(null);
    };

    // --- Form States ---
    const [formGolongan, setFormGolongan] = useState('');
    const [showFormGolDropdown, setShowFormGolDropdown] = useState(false);
    const [newTariff, setNewTariff] = useState('');
    const [note, setNote] = useState('');

    // --- Calendar States (from Setup) ---
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    
    // --- Toast States ---
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

        const days = [];
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: daysInPrevMonth - i, month: viewMonth - 1, year: viewYear, current: false });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, month: viewMonth, year: viewYear, current: true });
        }
        const nextDays = 42 - days.length;
        for (let i = 1; i <= nextDays; i++) {
            days.push({ day: i, month: viewMonth + 1, year: viewYear, current: false });
        }
        return days;
    }, [viewMonth, viewYear]);

    const changeMonth = (dir) => {
        if (dir === 'prev') {
            if (viewMonth === 0) {
                setViewMonth(11);
                setViewYear(v => v - 1);
            } else {
                setViewMonth(v => v - 1);
            }
        } else {
            if (viewMonth === 11) {
                setViewMonth(0);
                setViewYear(v => v + 1);
            } else {
                setViewMonth(v => v + 1);
            }
        }
    };

    const formatDate = (dateObj) => {
        const { day, month, year } = dateObj;
        let actualMonth = month;
        let actualYear = year;
        if (month < 0) { actualMonth = 11; actualYear -= 1; }
        if (month > 11) { actualMonth = 0; actualYear += 1; }
        return `${day} ${monthNames[actualMonth]} ${actualYear}`;
    };

    // --- Data Charts ---
    const multiLineChartData = [
        { name: 'Q1 (2025)', r1: 1300, r2: 1450, r3: 1600 },
        { name: 'Q2 (2025)', r1: 1330, r2: 1480, r3: 1620 },
        { name: 'Q3 (2025)', r1: 1315, r2: 1460, r3: 1610 },
        { name: 'Q4 (2025)', r1: 1350, r2: 1500, r3: 1640 },
        { name: 'Q1 (2026)', r1: 1340, r2: 1520, r3: 1670 }
    ];

    const pieData = [
        { name: 'R1 - 450 VA', value: 35 },
        { name: 'R1 - 900 VA', value: 45 },
        { name: 'R2 (3500+ VA)', value: 15 },
        { name: 'R3 (6600+ VA)', value: 5 },
    ];
    const PIE_COLORS = ['#10B981', '#3B82F6', '#A855F7', '#F59E0B'];

    // --- Dummy Data Table ---
    const [historyData, setHistoryData] = useState([
        { id: 'TRF-104', tariff: 1444.70, date: '1 April 2026', author: 'Super Admin', timestamp: '01 Apr 2026, 08:00', note: 'Penyesuaian tarif kuartal', percentage: -2.38, category: 'R1 - 900 VA (Subsidi)' },
        { id: 'TRF-103', tariff: 1680.00, date: '1 Januari 2026', author: 'Super Admin', timestamp: '02 Jan 2026, 09:15', note: 'Kenaikan inflasi tahunan', percentage: 4.21, category: 'R3 - 6600 VA ke atas' },
        { id: 'TRF-102', tariff: 1420.20, date: '1 Oktober 2025', author: 'Super Admin', timestamp: '01 Okt 2025, 08:30', note: 'Penyesuaian daya nasional', percentage: -1.41, category: 'R1 - 450 VA (Subsidi)' },
        { id: 'TRF-101', tariff: 1540.50, date: '1 Juli 2025', author: 'Super Admin', timestamp: '05 Jul 2025, 14:20', note: 'Penetapan tarif dasar', percentage: 0, category: 'R2 - 3500 s.d 5500 VA' },
    ]);

    // Badge styling mapping
    const getBadgeStyle = (category) => {
        if (category.includes('R1 - 450')) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
        if (category.includes('R1 - 900')) return 'bg-teal-100 text-teal-700 border border-teal-200';
        if (category.includes('R1M')) return 'bg-cyan-100 text-cyan-700 border border-cyan-200';
        if (category.includes('R2')) return 'bg-blue-100 text-blue-700 border border-blue-200';
        if (category.includes('R3')) return 'bg-purple-100 text-purple-700 border border-purple-200';
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    };

    // Sorting & Filtering Logic for Table
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGolongan, setFilterGolongan] = useState('All');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const sortedHistory = useMemo(() => {
        let sortableItems = historyData.filter(item => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = item.id.toLowerCase().includes(searchLower) ||
                item.note.toLowerCase().includes(searchLower);
            const matchesFilter = filterGolongan === 'All' || item.category === filterGolongan;
            return matchesSearch && matchesFilter;
        });

        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (sortConfig.key === 'timestamp' || sortConfig.key === 'date') {
                    const parseIDDate = (str) => {
                        if (!str) return 0;
                        const monthMap = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'Mei': '05', 'Jun': '06', 'Jul': '07', 'Ags': '08', 'Sep': '09', 'Okt': '10', 'Nov': '11', 'Des': '12', 'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04', 'Juni': '06', 'Juli': '07', 'Agustus': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12' };
                        const parts = str.replace(',', '').split(' ');
                        if (parts.length >= 3) {
                            const d = parts[0].padStart(2, '0');
                            const mItem = Object.keys(monthMap).find(k => parts[1].includes(k));
                            const m = mItem ? monthMap[mItem] : '01';
                            const y = parts[2];
                            const t = parts[3] ? parts[3] : '00:00';
                            return new Date(`${y}-${m}-${d}T${t}`).getTime();
                        }
                        return 0;
                    };
                    const timeA = parseIDDate(a[sortConfig.key]);
                    const timeB = parseIDDate(b[sortConfig.key]);
                    return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
                }

                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [historyData, sortConfig, searchQuery, filterGolongan]);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-gray-400" /> : <ArrowDown className="w-3.5 h-3.5 text-gray-400" />;
    };

    const handleUpdateTariff = () => {
        if (!formGolongan || !newTariff || !selectedDate) {
            showToast("Harap isi Golongan, Nominal Tarif, dan Tanggal Berlaku!");
            return;
        }
        showToast(`Tarif untuk ${formGolongan} berhasil diupdate!`);
        setNewTariff('');
        setSelectedDate('');
        setNote('');
        setFormGolongan('');
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-xl">
                    <p className="text-xs font-bold text-gray-500 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <p className="text-[11px] font-bold text-gray-700">
                                {entry.name.toUpperCase()}: <span style={{ color: entry.color }}>Rp {entry.value.toFixed(2)}</span>
                            </p>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const activeData = categoryStats[activeSlide];

    return (
        <SuperAdminLayout activeMenu="PLN Listrik" onNavigate={onNavigate} title="Manajemen Tarif Listrik">
            {/* Content Workspace */}
            <div className="flex-1 w-full max-w-[1900px] mx-auto pb-10">

                    {/* CAROUSEL TABS (Pills) */}
                    <div className="mb-6 flex justify-center w-full">
                        <div className="flex gap-2 p-1.5 bg-gray-200/50 rounded-[1.25rem] max-w-full overflow-x-auto custom-scrollbar shadow-inner">
                            {golonganOptions.map((opt, idx) => (
                                <button
                                    key={opt}
                                    onClick={() => handleManualSlide(idx)}
                                    className={`px-5 py-2.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all duration-300 ${activeSlide === idx
                                        ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CAROUSEL SLIDE (The 3 Cards) */}
                    <div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 select-none"
                        key={activeSlide}
                        onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
                        onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
                        onMouseDown={(e) => onDragStart(e.clientX)}
                        onMouseUp={(e) => onDragEnd(e.clientX)}
                        onMouseLeave={(e) => {
                            if (dragStartX !== null) onDragEnd(e.clientX);
                        }}
                    >
                        {/* Card 1 - Current Tarif (Green) */}
                        <div className="bg-[#10B981] rounded-[1.25rem] shadow-md shadow-emerald-500/20 relative flex flex-col justify-between text-white border-0 min-h-[160px] cursor-grab active:cursor-grabbing animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-5 flex-1 flex flex-col justify-center pt-6">
                                <p className="text-[12px] font-semibold text-white/90 tracking-wide mb-1">Tarif Saat Ini</p>
                                <h3 className="text-[34px] font-extrabold tracking-tight leading-none mb-1">
                                    Rp {activeData.currentTariff.toFixed(2)}
                                </h3>
                                <p className="text-[11px] font-medium text-white/80">per kWh</p>
                            </div>
                            <div className="absolute top-5 right-5 p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="mx-5 mb-5 bg-black/20 rounded-[0.5rem] px-4 py-2.5 flex items-center gap-2">
                                {activeData.percentage > 0 ? (
                                    <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                ) : (
                                    <TrendingDown className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                )}
                                <span className="text-[11px] font-bold text-white">
                                    {activeData.percentage > 0 ? '+' : ''}{activeData.percentage.toFixed(2)}% dari periode sebelumnya
                                </span>
                            </div>
                        </div>

                        {/* Card 2 - Effective Date (Blue) */}
                        <div className="bg-[#3B82F6] rounded-[1.25rem] shadow-md shadow-blue-500/20 relative flex flex-col justify-between text-white border-0 min-h-[160px] cursor-grab active:cursor-grabbing animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
                            <div className="p-5 flex-1 flex flex-col justify-center pt-6">
                                <p className="text-[12px] font-semibold text-white/90 tracking-wide mb-1">Berlaku Sejak</p>
                                <h3 className="text-[34px] font-extrabold tracking-tight leading-none">{activeData.effectiveDate}</h3>
                            </div>
                            <div className="absolute top-5 right-5 p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Calendar className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="mx-5 mb-5 opacity-90 px-1 py-2.5 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-white" strokeWidth={2.5} />
                                <span className="text-[11px] font-medium text-white">{activeData.skNo}</span>
                            </div>
                        </div>

                        {/* Card 3 - Total Changes (Purple) */}
                        <div className="bg-[#A855F7] rounded-[1.25rem] shadow-md shadow-purple-500/20 relative flex flex-col justify-between text-white border-0 min-h-[160px] cursor-grab active:cursor-grabbing animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                            <div className="p-5 flex-1 flex flex-col justify-center pt-6">
                                <p className="text-[12px] font-semibold text-white/90 tracking-wide mb-1">Total Perubahan</p>
                                <h3 className="text-[34px] font-extrabold tracking-tight leading-none">{activeData.totalChanges}</h3>
                            </div>
                            <div className="absolute top-5 right-5 p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                                <History className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="mx-5 mb-5 opacity-90 px-1 py-2.5 flex items-center gap-2">
                                <span className="text-[11px] font-medium text-white">sejak {activeData.lastChangeSince}</span>
                            </div>
                        </div>
                    </div>

                    {/* DUAL CHARTS */}
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
                        {/* CHART 1: Multi-line / Tren Perubahan */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 xl:col-span-3">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">Tren Perubahan Tarif Listrik</h2>
                                <p className="text-xs text-gray-500 mt-1 italic">Komparasi nilai pergerakan tarif antar golongan di BIEON.</p>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={multiLineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#9CA3AF' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#9CA3AF' }} domain={['dataMin - 50', 'dataMax + 50']} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} />
                                        <Line type="monotone" dataKey="r1" name="R1" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="r2" name="R2" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="r3" name="R3" stroke="#A855F7" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* CHART 2: Sebaran Pelanggan (Pie) */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 xl:col-span-2">
                            <div className="mb-2">
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">Sebaran Konsumen BIEON</h2>
                                <p className="text-xs text-gray-500 mt-1 italic">Distribusi pelanggan aktif berdasarkan klasifikasi PLN.</p>
                            </div>
                            <div className="h-[300px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white border p-3 rounded-xl shadow-lg">
                                                            <p className="text-xs font-bold text-gray-700">{payload[0].name}</p>
                                                            <p className="text-sm font-bold mt-1" style={{ color: payload[0].payload.fill }}>
                                                                {payload[0].value}% Pengguna
                                                            </p>
                                                        </div>
                                                    )
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* MAIN TWO ROW STACK: FORM & HISTORY */}
                    <div className="flex flex-col gap-8 pb-10">
                        {/* UPDATE FORM */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 h-fit">
                            <div className="mb-6 border-b border-gray-100 pb-4">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 leading-tight mb-2">
                                    <Zap className="w-5 h-5 text-[#009b7c]" /> Update Tarif Listrik PLN
                                </h2>
                                <p className="text-sm text-gray-500">Perbarui tarif listrik sesuai dengan kebijakan terbaru PLN.</p>
                            </div>

                            <div className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-2xl p-5 mb-8 text-blue-800">
                                <h4 className="flex items-center gap-2 font-bold mb-2 text-sm"><Info className="w-5 h-5" /> Catatan Penting:</h4>
                                <ul className="list-disc pl-6 text-xs space-y-1.5 font-medium opacity-90">
                                    <li>Perubahan tarif akan mempengaruhi perhitungan biaya energi untuk semua pelanggan</li>
                                    <li>Pastikan tarif yang dimasukkan sesuai dengan SK resmi dari PLN/Kementerian ESDM</li>
                                    <li>Sistem akan otomatis menghitung ulang estimasi biaya berdasarkan tarif baru</li>
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* GOLONGAN DROPDOWN */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-700">Target Golongan <span className="text-red-500">*</span></label>
                                        <div className="relative z-30">
                                            <button
                                                type="button"
                                                onClick={() => setShowFormGolDropdown(!showFormGolDropdown)}
                                                className={`w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 border rounded-2xl text-sm font-bold transition-all ${showFormGolDropdown ? 'border-[#009b7c] bg-white ring-4 ring-emerald-500/10' : 'border-gray-100 hover:bg-gray-100/50'}`}
                                            >
                                                <span className={formGolongan ? 'text-gray-900' : 'text-gray-400'}>
                                                    {formGolongan || 'Pilih Golongan PLN'}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFormGolDropdown ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showFormGolDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-[35]" onClick={() => setShowFormGolDropdown(false)}></div>
                                                    <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[40] max-h-[200px] overflow-y-auto modal-custom-scrollbar">
                                                        {golonganOptions.map((opt) => (
                                                            <button
                                                                key={opt}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormGolongan(opt);
                                                                    setShowFormGolDropdown(false);
                                                                }}
                                                                className={`w-full text-left px-5 py-3 text-[12px] font-bold transition-colors ${formGolongan === opt ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-600 hover:bg-gray-50'}`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Input Nominal */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-700">Tarif Listrik Baru (per kWh) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">Rp</span>
                                            <input
                                                type="number"
                                                value={newTariff}
                                                onChange={(e) => setNewTariff(e.target.value)}
                                                placeholder="Contoh: 1495"
                                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:border-[#009b7c] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all custom-scrollbar-hide"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400">Masukkan tarif dalam Rupiah (Rp)</p>
                                    </div>

                                    {/* Custom Date Picker */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-700">Tanggal Berlaku <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowCalendar(!showCalendar)}
                                                className={`w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 border rounded-2xl text-sm font-bold transition-all ${showCalendar ? 'border-[#009b7c] bg-white ring-4 ring-emerald-500/10' : 'border-gray-100 hover:bg-gray-100/50'}`}
                                            >
                                                <span className={selectedDate ? 'text-gray-900' : 'text-gray-400'}>
                                                    {selectedDate || 'Pilih Tanggal'}
                                                </span>
                                                <Calendar className={`w-4 h-4 text-gray-400 transition-colors ${showCalendar ? 'text-[#009b7c]' : ''}`} />
                                            </button>

                                            {showCalendar && (
                                                <>
                                                    <div className="fixed inset-0 z-[60]" onClick={() => setShowCalendar(false)}></div>
                                                    <div className="absolute bottom-full mb-2 right-0 w-full sm:w-[320px] bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl p-5 z-[70] animate-in fade-in zoom-in-95 duration-200">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[15px] font-bold text-gray-900">{monthNames[viewMonth]}</span>
                                                                <div className="relative">
                                                                    <button type="button" onClick={() => setShowYearDropdown(!showYearDropdown)} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-[#009b7c] transition-colors">
                                                                        {viewYear} <ChevronDown className={`w-3 h-3 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
                                                                    </button>
                                                                    {showYearDropdown && (
                                                                        <>
                                                                            <div className="fixed inset-0 z-[75]" onClick={() => setShowYearDropdown(false)}></div>
                                                                            <div className="absolute top-full left-0 mt-2 w-24 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[80] max-h-[160px] overflow-y-auto modal-custom-scrollbar">
                                                                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 2 - i).map(year => (
                                                                                    <button
                                                                                        key={year}
                                                                                        type="button"
                                                                                        onClick={() => { setViewYear(year); setShowYearDropdown(false); }}
                                                                                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${viewYear === year ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-600 hover:bg-gray-50'}`}
                                                                                    >
                                                                                        {year}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button type="button" onClick={() => changeMonth('prev')} className="p-2 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                                                                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                                                                </button>
                                                                <button type="button" onClick={() => changeMonth('next')} className="p-2 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                                                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-1 mb-2">
                                                            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                                                                <span key={d} className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-wider">{d}</span>
                                                            ))}
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-1">
                                                            {calendarDays.map((d, i) => {
                                                                const isSelected = selectedDate === formatDate(d);
                                                                return (
                                                                    <button
                                                                        key={i}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (d.current) {
                                                                                setSelectedDate(formatDate(d));
                                                                                setShowCalendar(false);
                                                                            }
                                                                        }}
                                                                        className={`h-9 w-full flex items-center justify-center rounded-xl text-xs font-bold transition-all
                                                                            ${!d.current ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'}
                                                                            ${isSelected ? 'bg-[#009b7c] text-white hover:bg-[#008268] hover:text-white shadow-md shadow-emerald-100' : ''}
                                                                        `}
                                                                    >
                                                                        {d.day}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-400">Tentukan kapan tarif baru mulai berlaku</p>
                                    </div>
                                </div>

                                {/* Textarea Keterangan */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-700">Catatan/Keterangan <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Contoh: Penyesuaian tarif PLN sesuai SK Menteri ESDM No. 28/2026"
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#009b7c] focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[100px] resize-none"
                                    />
                                    <p className="text-[10px] text-gray-400">Jelaskan alasan/dasar hukum perubahan tarif</p>
                                </div>

                                <button
                                    onClick={handleUpdateTariff}
                                    className="w-full py-4 bg-[#009B7C] text-white font-bold rounded-2xl text-sm hover:bg-[#008268] transition-all shadow-lg flex justify-center items-center gap-2 group mt-4"
                                >
                                    <Zap className="w-4 h-4 opacity-80" /> Update Tarif Listrik
                                </button>
                            </div>
                        </div>

                        {/* HISTORY TABLE */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-fit">
                            <div className="p-8 border-b border-gray-50 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight">Riwayat Perubahan Tarif</h2>
                                    <p className="text-xs text-gray-500 mt-1 italic">Log jejak rekam penyesuaian semua golongan.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                                    <div className="relative flex-1 xl:w-64">
                                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Cari ID, Keterangan..."
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#009b7c] focus:ring-2 focus:ring-emerald-500/10 transition-all custom-scrollbar-hide"
                                        />
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                            className={`flex items-center gap-2 px-4 py-2 bg-gray-50 border rounded-xl text-xs font-bold transition-all h-9 ${showFilterDropdown ? 'border-[#009b7c]' : 'border-gray-100 hover:bg-gray-100/50'}`}
                                        >
                                            <Filter className="w-3.5 h-3.5 text-gray-500" />
                                            <span className="text-gray-700 whitespace-nowrap">{filterGolongan === 'All' ? 'Semua Golongan' : filterGolongan}</span>
                                        </button>
                                        {showFilterDropdown && (
                                            <>
                                                <div className="fixed inset-0 z-[35]" onClick={() => setShowFilterDropdown(false)}></div>
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[40]">
                                                    <button
                                                        onClick={() => { setFilterGolongan('All'); setShowFilterDropdown(false); }}
                                                        className={`w-full text-left px-5 py-2.5 text-[11px] font-bold transition-colors ${filterGolongan === 'All' ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        Semua Golongan
                                                    </button>
                                                    {golonganOptions.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => { setFilterGolongan(opt); setShowFilterDropdown(false); }}
                                                            className={`w-full text-left px-5 py-2.5 text-[11px] font-bold transition-colors ${filterGolongan === opt ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-600 hover:bg-gray-50'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => showToast("Mengekspor Riwayat Tarif ke PDF...")}
                                        className="flex items-center justify-center gap-2 px-5 py-2 h-9 bg-[#E1F2EB] text-[#1E4D40] rounded-xl text-xs font-bold hover:bg-[#d4ece3] transition-all shadow-sm shrink-0"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Export PDF
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-[#F8FAFB]/50 border-b border-gray-100 text-gray-500 select-none">
                                        <tr>
                                            <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('id')}>
                                                <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold whitespace-nowrap">ID PERUBAHAN {getSortIcon('id')}</div>
                                            </th>
                                            <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('tariff')}>
                                                <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold whitespace-nowrap">TARIF (RP/KWH) {getSortIcon('tariff')}</div>
                                            </th>
                                            <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('category')}>
                                                <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold whitespace-nowrap">GOLONGAN PLN {getSortIcon('category')}</div>
                                            </th>
                                            <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('date')}>
                                                <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold whitespace-nowrap">TANGGAL BERLAKU {getSortIcon('date')}</div>
                                            </th>
                                            <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('timestamp')}>
                                                <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold whitespace-nowrap">DIUPDATE OLEH {getSortIcon('timestamp')}</div>
                                            </th>
                                            <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none min-w-[280px] hidden xl:table-cell" onClick={() => requestSort('note')}>
                                                <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold whitespace-nowrap">KETERANGAN {getSortIcon('note')}</div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sortedHistory.map((item) => (
                                            <tr key={item.id} className="hover:bg-[#F8FAFB]/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">{item.id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 text-sm">
                                                        Rp {item.tariff.toFixed(2)}
                                                    </div>
                                                    {item.percentage !== 0 ? (
                                                        <div className={`flex items-center gap-0.5 text-[10px] font-bold mt-1 ${item.percentage > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                            {item.percentage > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                            {item.percentage > 0 ? '+' : ''}{item.percentage}%
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] text-gray-400 font-medium mt-1">Tarif Dasar</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {/* COLOR CODED BADGE DEPENDING ON CATEGORY */}
                                                    <span className={`inline-flex px-3 py-1.5 rounded-xl font-bold text-[10px] ${getBadgeStyle(item.category)}`}>
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[13px] font-bold text-gray-800">{item.date}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[12px] font-bold text-gray-700">{item.author}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium">{item.timestamp}</div>
                                                </td>
                                                <td className="px-6 py-4 hidden xl:table-cell">
                                                    <div className="text-xs text-gray-500 font-medium max-w-[280px] leading-relaxed" title={item.note}>{item.note}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>

            <style>{`
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                .modal-custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .modal-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .modal-custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 999px; }
                .modal-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 999px; }
            `}</style>
            
            {/* Unified Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-[#1E293B] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700/50 backdrop-blur-md">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">{toast.message}</span>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
