import React, { useState, useMemo, useEffect, useRef } from 'react';
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

    const PLN_SEGMENT_ORDER = [
        'Subsidi Rumah Tangga',
        'Rumah Tangga',
        'Bisnis',
        'Industri',
        'Pemerintah & PJU',
        'Pelayanan Sosial'
    ];

    const makePlnKey = (label) => String(label || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const FALLBACK_PLN_CATEGORIES = [
        // Subsidi Rumah Tangga
        { label: 'R-1/TR - 450 VA (Subsidi)', segment: 'Subsidi Rumah Tangga', isShortcut: true },
        { label: 'R-1/TR - 900 VA (Subsidi)', segment: 'Subsidi Rumah Tangga', isShortcut: true },

        // Rumah Tangga
        { label: 'R-1/TR - 900 VA (Non-Subsidi)', segment: 'Rumah Tangga', isShortcut: true },
        { label: 'R-1/TR - 1.300 VA', segment: 'Rumah Tangga', isShortcut: true },
        { label: 'R-1/TR - 2.200 VA', segment: 'Rumah Tangga', isShortcut: true },
        { label: 'R-2/TR - 3.500-5.500 VA', segment: 'Rumah Tangga', isShortcut: true },
        { label: 'R-3/TR, TM - > 6.600 VA', segment: 'Rumah Tangga', isShortcut: true },

        // Bisnis
        { label: 'B-2/TR - 6.600 VA-200 kVA', segment: 'Bisnis', isShortcut: false },
        { label: 'B-3/TM, TT - > 200 kVA', segment: 'Bisnis', isShortcut: false },

        // Industri
        { label: 'I-3/TM - > 200 kVA', segment: 'Industri', isShortcut: false },
        { label: 'I-4/TT - > 30.000 kVA', segment: 'Industri', isShortcut: false },

        // Pemerintah & PJU
        { label: 'P-1/TR - 6.600 VA-200 kVA', segment: 'Pemerintah & PJU', isShortcut: false },
        { label: 'P-2/TM - > 200 kVA', segment: 'Pemerintah & PJU', isShortcut: false },
        { label: 'P-3/TR - Penerangan Jalan Umum', segment: 'Pemerintah & PJU', isShortcut: false },
        { label: 'L/TR, TM, TT', segment: 'Pemerintah & PJU', isShortcut: false },

        // Pelayanan Sosial
        { label: 'S-1/TR - 450 VA', segment: 'Pelayanan Sosial', isShortcut: false },
        { label: 'S-1/TR - 900 VA', segment: 'Pelayanan Sosial', isShortcut: false },
        { label: 'S-1/TR - 1.300 VA', segment: 'Pelayanan Sosial', isShortcut: false },
        { label: 'S-1/TR - 2.200 VA', segment: 'Pelayanan Sosial', isShortcut: false },
        { label: 'S-1/TR - 3.500 VA-200 kVA', segment: 'Pelayanan Sosial', isShortcut: false },
        { label: 'S-2/TM - > 200 kVA', segment: 'Pelayanan Sosial', isShortcut: false },
    ].map((c) => ({ ...c, key: makePlnKey(c.label) }));

    const [plnCategories, setPlnCategories] = useState(FALLBACK_PLN_CATEGORIES);
    const [plnCategoriesLoading, setPlnCategoriesLoading] = useState(true);

    // --- CAROUSEL STATES ---
    const [activeSlide, setActiveSlide] = useState(0);

    // --- API DATA STATES ---
    const [categoryStats, setCategoryStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dataErrors, setDataErrors] = useState({
        current: null,
        history: null,
        distribution: null,
        trend: null
    });

    const activeSegmentName = PLN_SEGMENT_ORDER[activeSlide] || PLN_SEGMENT_ORDER[0];

    const subCategoriesInSegment = useMemo(() => {
        return plnCategories.filter((c) => c.segment === activeSegmentName);
    }, [plnCategories, activeSegmentName]);

    const handleSegmentClick = (index) => {
        setActiveSlide(index);
    };

    // --- TABS SCROLL PROGRESS HANDLERS ---
    const tabsScrollRef = useRef(null);
    const [tabsScrollProgress, setTabsScrollProgress] = useState(0);

    const handleTabsScroll = () => {
        if (!tabsScrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = tabsScrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        if (maxScroll > 0) {
            setTabsScrollProgress((scrollLeft / maxScroll) * 100);
        } else {
            setTabsScrollProgress(0);
        }
    };

    const handleTabsRangeChange = (e) => {
        const val = e.target.value;
        setTabsScrollProgress(val);
        if (tabsScrollRef.current) {
            const { scrollWidth, clientWidth } = tabsScrollRef.current;
            const maxScroll = scrollWidth - clientWidth;
            tabsScrollRef.current.scrollLeft = (val / 100) * maxScroll;
        }
    };

    const scrollTabs = (dir) => {
        if (tabsScrollRef.current) {
            const amount = dir === 'left' ? -200 : 200;
            tabsScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };



    // --- Form States ---
    const [formGolongan, setFormGolongan] = useState('');
    const [showFormGolDropdown, setShowFormGolDropdown] = useState(false);
    const [formGolonganSearch, setFormGolonganSearch] = useState('');
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

    // --- Data Charts (Dynamic) ---
    const [multiLineChartData, setMultiLineChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const PIE_COLORS = ['#10B981', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

    // --- History Data (Dynamic) ---
    const [historyData, setHistoryData] = useState([]);

    // --- Fetch All Dashboard Data ---
    const fetchAllData = async () => {
        setIsLoading(true);
        setDataErrors({
            current: null,
            history: null,
            distribution: null,
            trend: null
        });
        try {
            const token = localStorage.getItem('bieon_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [currentRes, historyRes, distributionRes, trendRes] = await Promise.allSettled([
                fetch('/api/admin/tariffs/current?scope=all', { headers }),
                fetch('/api/admin/tariffs/history', { headers }),
                fetch('/api/admin/tariffs/distribution', { headers }),
                fetch('/api/admin/tariffs/trend', { headers })
            ]);

            const extractResponseData = async (result, key) => {
                if (result.status !== 'fulfilled') {
                    setDataErrors((prev) => ({ ...prev, [key]: 'Request gagal dikirim.' }));
                    return null;
                }

                if (!result.value.ok) {
                    setDataErrors((prev) => ({ ...prev, [key]: `HTTP ${result.value.status}` }));
                    return null;
                }

                const payload = await result.value.json();
                if (!payload?.success) {
                    setDataErrors((prev) => ({ ...prev, [key]: payload?.message || 'Data tidak valid.' }));
                    return null;
                }

                return payload.data;
            };

            const [currentData, nextHistoryData, distData, trendData] = await Promise.all([
                extractResponseData(currentRes, 'current'),
                extractResponseData(historyRes, 'history'),
                extractResponseData(distributionRes, 'distribution'),
                extractResponseData(trendRes, 'trend')
            ]);

            setCategoryStats(Array.isArray(currentData) ? currentData : []);
            setHistoryData(Array.isArray(nextHistoryData) ? nextHistoryData : []);
            setPieData(Array.isArray(distData) ? distData : []);
            setMultiLineChartData(Array.isArray(trendData) ? trendData : []);
        } catch (error) {
            console.error('Gagal mengambil data tarif:', error);
            setDataErrors({
                current: 'Terjadi kesalahan saat memuat data.',
                history: 'Terjadi kesalahan saat memuat data.',
                distribution: 'Terjadi kesalahan saat memuat data.',
                trend: 'Terjadi kesalahan saat memuat data.'
            });
            setCategoryStats([]);
            setHistoryData([]);
            setPieData([]);
            setMultiLineChartData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        const fetchPlnCategories = async () => {
            try {
                setPlnCategoriesLoading(true);
                const res = await fetch('/api/admin/tariffs/public/categories?scope=all');
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();
                if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                    setPlnCategories(data.data);
                } else {
                    setPlnCategories(FALLBACK_PLN_CATEGORIES);
                }
            } catch (err) {
                console.error('Gagal mengambil kategori PLN:', err);
                setPlnCategories(FALLBACK_PLN_CATEGORIES);
            } finally {
                setPlnCategoriesLoading(false);
            }
        };

        fetchPlnCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredFormCategories = useMemo(() => {
        const query = formGolonganSearch.trim().toLowerCase();
        if (!query) return plnCategories;
        return plnCategories.filter((c) => String(c.label || '').toLowerCase().includes(query));
    }, [plnCategories, formGolonganSearch]);

    const groupedFormCategories = useMemo(() => {
        const groups = {};
        filteredFormCategories.forEach((c) => {
            const seg = c.segment || 'Lainnya';
            if (!groups[seg]) groups[seg] = [];
            groups[seg].push(c);
        });
        return groups;
    }, [filteredFormCategories]);

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
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterGolongan, sortConfig]);

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

    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(sortedHistory.length / itemsPerPage));
    const paginatedHistory = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedHistory.slice(start, start + itemsPerPage);
    }, [sortedHistory, currentPage]);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-gray-400" /> : <ArrowDown className="w-3.5 h-3.5 text-gray-400" />;
    };

    const handleUpdateTariff = async () => {
        if (!formGolongan || !newTariff || !selectedDate) {
            showToast("Harap isi Golongan, Nominal Tarif, dan Tanggal Berlaku!");
            return;
        }

        try {
            const token = localStorage.getItem('bieon_token');

            // Convert selectedDate dari format Indonesia ke ISO
            const monthMap = { 'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11 };
            const parts = selectedDate.split(' ');
            const dateISO = new Date(parseInt(parts[2]), monthMap[parts[1]], parseInt(parts[0])).toISOString();

            const response = await fetch('/api/admin/tariffs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    category: formGolongan,
                    tariff: parseFloat(newTariff),
                    effectiveDate: dateISO,
                    note
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast(`Tarif untuk ${formGolongan} berhasil diperbarui!`);
                setNewTariff('');
                setSelectedDate('');
                setNote('');
                setFormGolongan('');
                // Refresh semua data
                await fetchAllData();
            } else {
                showToast(data.message || 'Gagal memperbarui tarif.');
            }
        } catch (error) {
            console.error('Error update tarif:', error);
            showToast('Terjadi kesalahan saat memperbarui tarif.');
        }
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

    const activeSubCategoryStats = useMemo(() => {
        return subCategoriesInSegment.map(sub => {
            const stat = categoryStats.find(s => s.name === sub.label) || {
                name: sub.label,
                currentTariff: 0,
                percentage: 0,
                effectiveDate: '-',
                skNo: '-',
                totalChanges: 0,
                lastChangeSince: '-'
            };
            return stat;
        });
    }, [subCategoriesInSegment, categoryStats]);

    // Aggregate Data for Cards
    const totalSubCategories = activeSubCategoryStats.length;
    
    // Calculate Min and Max Tariff instead of Average
    const tariffs = activeSubCategoryStats.map(s => s.currentTariff || 0).filter(t => t > 0);
    const minTariff = tariffs.length > 0 ? Math.min(...tariffs) : 0;
    const maxTariff = tariffs.length > 0 ? Math.max(...tariffs) : 0;
    const isSingleTariff = minTariff === maxTariff;

    const hasTrendData = multiLineChartData.length > 0;
    const hasPieData = pieData.length > 0;

    return (
        <SuperAdminLayout activeMenu="PLN Listrik" onNavigate={onNavigate} title="Manajemen Tarif Listrik">
            {/* Content Workspace */}
            <div className="flex-1 w-full max-w-[1900px] mx-auto pb-10">

                {/* CAROUSEL TABS (Pills) */}
                <div className="mb-6 flex flex-col items-center justify-center w-full gap-2">
                    <div 
                        id="tariff-tabs" 
                        ref={tabsScrollRef}
                        onScroll={handleTabsScroll}
                        className="flex gap-1.5 p-1.5 bg-gray-200/50 rounded-2xl w-full sm:max-w-max overflow-x-auto shadow-inner scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                        {PLN_SEGMENT_ORDER.map((opt, idx) => (
                            <button
                                key={opt}
                                onClick={() => handleSegmentClick(idx)}
                                className={`px-6 py-2.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all duration-300 ${activeSlide === idx
                                    ? 'bg-white text-[#009B7C] shadow-sm ring-1 ring-emerald-500/20'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    {/* Indikator Scroll Interaktif */}
                    <div className="md:hidden flex items-center justify-between w-full max-w-[90vw] px-2 py-0.5 mt-1">
                        <button 
                            onClick={() => scrollTabs('left')}
                            className="p-1 hover:bg-gray-50 rounded-full active:scale-95 transition-all text-gray-400 hover:text-[#009B7C]"
                            aria-label="Scroll Kiri"
                        >
                            <ChevronLeft className="w-4 h-4 font-bold" strokeWidth={3} />
                        </button>

                        <div className="flex-1 px-1.5 relative flex items-center">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={tabsScrollProgress}
                                onChange={handleTabsRangeChange}
                                className="w-full h-[6px] bg-gray-100 rounded-full appearance-none cursor-grab active:cursor-grabbing focus:outline-none"
                                style={{
                                    background: `linear-gradient(to right, #009B7C ${tabsScrollProgress}%, #F3F4F6 ${tabsScrollProgress}%)`
                                }}
                            />
                        </div>

                        <button 
                            onClick={() => scrollTabs('right')}
                            className="p-1 hover:bg-gray-50 rounded-full active:scale-95 transition-all text-gray-400 hover:text-[#009B7C]"
                            aria-label="Scroll Kanan"
                        >
                            <ChevronRight className="w-4 h-4 font-bold" strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* 2 ELONGATED CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 select-none">
                    {/* Card 1 - Info Golongan */}
                    <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-[1.25rem] shadow-md shadow-emerald-500/20 relative flex items-center text-white border-0 min-h-[120px] px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex-1">
                            <p className="text-[13px] font-semibold text-white/90 tracking-wide mb-1 uppercase">Informasi Golongan</p>
                            <h3 className="text-[28px] font-extrabold tracking-tight leading-none mb-2">{activeSegmentName}</h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-[12px] font-bold">{totalSubCategories} Sub-Golongan</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm hidden sm:block">
                            <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                    </div>

                    {/* Card 2 - Rentang Tarif */}
                    <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-[1.25rem] shadow-md shadow-orange-500/20 relative flex items-center text-white border-0 min-h-[120px] px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
                        <div className="flex-1">
                            <p className="text-[13px] font-semibold text-white/90 tracking-wide mb-1 uppercase">Rentang Tarif</p>
                            <h3 className="text-[24px] xl:text-[28px] font-extrabold tracking-tight leading-none mb-2">
                                {isSingleTariff ? `Rp ${minTariff.toFixed(2)}` : `Rp ${minTariff.toFixed(2)} - ${maxTariff.toFixed(2)}`}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Tipe Tarif Aktif</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm hidden sm:block">
                            <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* SUB-CATEGORIES MATRIX / TABLE */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">Matriks Sub-Golongan: {activeSegmentName}</h2>
                            <p className="text-xs text-gray-500 mt-1 italic">Rincian tarif untuk setiap jenis pelanggan pada golongan ini.</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar-x pb-4 px-4 pt-4">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-[#F8FAFB]/50 border-b border-gray-100 text-gray-500 select-none">
                                <tr>
                                    <th className="px-6 py-4 font-normal rounded-tl-xl w-2/5"><div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sub-Golongan & Status</div></th>
                                    <th className="px-6 py-4 font-normal w-1/5"><div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tarif Saat Ini</div></th>
                                    <th className="px-6 py-4 font-normal rounded-tr-xl text-right w-1/5"><div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Aksi</div></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {activeSubCategoryStats.map((stat, idx) => (
                                    <tr key={idx} className="hover:bg-[#F8FAFB]/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-between max-w-sm">
                                                <div className="text-sm font-bold text-gray-900">{stat.name}</div>
                                                {stat.percentage !== 0 ? (
                                                    <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${stat.percentage > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                        {stat.percentage > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                        {stat.percentage > 0 ? '+' : ''}{stat.percentage.toFixed(2)}%
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Tetap</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[#009B7C] text-[15px]">
                                                Rp {stat.currentTariff.toFixed(2)}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium">per kWh</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setFormGolongan(stat.name);
                                                    document.getElementById('update-form-section')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-[#E1F2EB] text-gray-600 hover:text-[#009B7C] rounded-lg text-xs font-bold transition-colors"
                                            >
                                                <Zap className="w-3.5 h-3.5" /> Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {activeSubCategoryStats.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center">
                                            <p className="text-sm font-semibold text-gray-500">Tidak ada data sub-golongan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DUAL CHARTS */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
                    {/* CHART 1: Multi-line / Tren Perubahan */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 xl:col-span-3">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">Tren Perubahan Tarif Listrik</h2>
                            <p className="text-xs text-gray-500 mt-1 italic">Komparasi nilai pergerakan tarif antar golongan di BIEON.</p>
                            {dataErrors.trend && (
                                <p className="text-[11px] text-amber-600 font-semibold mt-2">
                                    Data tren belum tersedia: {dataErrors.trend}
                                </p>
                            )}
                        </div>
                        {hasTrendData ? (
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
                        ) : (
                            <div className="h-[300px] w-full flex items-center justify-center text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm font-semibold text-gray-500">Data tren tarif belum tersedia.</p>
                            </div>
                        )}
                    </div>

                    {/* CHART 2: Sebaran Pelanggan (Pie) */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 xl:col-span-2">
                        <div className="mb-2">
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">Sebaran Konsumen BIEON</h2>
                            <p className="text-xs text-gray-500 mt-1 italic">Distribusi pelanggan aktif berdasarkan klasifikasi PLN.</p>
                            {dataErrors.distribution && (
                                <p className="text-[11px] text-amber-600 font-semibold mt-2">
                                    Data sebaran belum tersedia: {dataErrors.distribution}
                                </p>
                            )}
                        </div>
                        {hasPieData ? (
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
                        ) : (
                            <div className="h-[300px] w-full flex items-center justify-center text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm font-semibold text-gray-500">Data sebaran konsumen belum tersedia.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN TWO ROW STACK: FORM & HISTORY */}
                <div className="flex flex-col gap-8 pb-10">
                    {/* UPDATE FORM */}
                    <div id="update-form-section" className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 h-fit">
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
                                                    <div className="px-4 pb-2">
                                                        <input
                                                            type="text"
                                                            value={formGolonganSearch}
                                                            onChange={(e) => setFormGolonganSearch(e.target.value)}
                                                            placeholder="Cari golongan (mis. R1, B-2, PJU...)"
                                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[12px] font-bold text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                                        />
                                                    </div>

                                                    {plnCategoriesLoading && (
                                                        <div className="px-5 pb-2 text-[11px] font-bold text-gray-400">
                                                            Memuat kategori...
                                                        </div>
                                                    )}

                                                    {filteredFormCategories.length === 0 && (
                                                        <div className="px-5 py-3 text-[12px] font-bold text-gray-400">
                                                            Tidak ada hasil.
                                                        </div>
                                                    )}

                                                    {PLN_SEGMENT_ORDER.filter((seg) => groupedFormCategories[seg]?.length).map((seg) => (
                                                        <div key={seg} className="pb-1">
                                                            <div className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                {seg}
                                                            </div>
                                                            {groupedFormCategories[seg].map((cat) => (
                                                                <button
                                                                    key={cat.key || cat.label}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormGolongan(cat.label);
                                                                        setShowFormGolDropdown(false);
                                                                        setFormGolonganSearch('');
                                                                    }}
                                                                    className={`w-full text-left px-5 py-3 text-[12px] font-bold transition-colors ${formGolongan === cat.label ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-600 hover:bg-gray-50'}`}
                                                                >
                                                                    {cat.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ))}

                                                    {Object.keys(groupedFormCategories).filter((seg) => !PLN_SEGMENT_ORDER.includes(seg)).map((seg) => (
                                                        <div key={seg} className="pb-1">
                                                            <div className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                {seg}
                                                            </div>
                                                            {groupedFormCategories[seg].map((cat) => (
                                                                <button
                                                                    key={cat.key || cat.label}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormGolongan(cat.label);
                                                                        setShowFormGolDropdown(false);
                                                                        setFormGolonganSearch('');
                                                                    }}
                                                                    className={`w-full text-left px-5 py-3 text-[12px] font-bold transition-colors ${formGolongan === cat.label ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-600 hover:bg-gray-50'}`}
                                                                >
                                                                    {cat.label}
                                                                </button>
                                                            ))}
                                                        </div>
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
                            <div className="flex flex-col gap-3 w-full xl:w-auto">
                                {/* Baris 1: Pencarian */}
                                <div className="relative w-full xl:w-64">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari ID, Keterangan..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#009b7c] focus:ring-2 focus:ring-emerald-500/10 transition-all custom-scrollbar-hide h-9"
                                    />
                                </div>
                                {/* Baris 2: Filter & Export (Mobile & Tablet) */}
                                <div className="flex items-center gap-2 w-full xl:w-auto">
                                    <div className="relative flex-1 xl:flex-none">
                                        <button
                                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                            className={`flex items-center justify-center xl:justify-start gap-2 w-full px-4 py-2 bg-gray-50 border rounded-xl text-xs font-bold transition-all h-9 ${showFilterDropdown ? 'border-[#009b7c]' : 'border-gray-100 hover:bg-gray-100/50'}`}
                                        >
                                            <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                            <span className="text-gray-700 whitespace-nowrap truncate">{filterGolongan === 'All' ? 'Semua Golongan' : filterGolongan}</span>
                                        </button>
                                        {showFilterDropdown && (
                                            <>
                                                <div className="fixed inset-0 z-[35]" onClick={() => setShowFilterDropdown(false)}></div>
                                                <div className="absolute left-0 xl:right-0 xl:left-auto top-full mt-2 w-full xl:w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[40]">
                                                    <button
                                                        onClick={() => { setFilterGolongan('All'); setShowFilterDropdown(false); }}
                                                        className={`w-full text-left px-5 py-2.5 text-[11px] font-bold transition-colors ${filterGolongan === 'All' ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        Semua Golongan
                                                    </button>
                                                    {allGolonganOptions.map((opt) => (
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
                                        <Download className="w-3.5 h-3.5 shrink-0" /> <span className="whitespace-nowrap">Export PDF</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div 
                            className="overflow-x-auto custom-scrollbar-x scroll-smooth pb-4 px-4"
                        >
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
                                    {paginatedHistory.map((item) => (
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

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-[2rem]">
                                <span className="text-xs text-gray-500 font-medium">
                                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedHistory.length)} dari {sortedHistory.length} data
                                </span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs font-bold text-gray-700 mx-2">Halaman {currentPage} dari {totalPages}</span>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

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
                
                .custom-scrollbar-x::-webkit-scrollbar { height: 16px; }
                .custom-scrollbar-x::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
                .custom-scrollbar-x::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; border: 3px solid #f1f5f9; }
                .custom-scrollbar-x::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                .custom-scrollbar-x::-webkit-scrollbar-button:single-button { 
                    background-color: #f8fafc; 
                    display: block; 
                    border-radius: 6px; 
                    width: 32px;
                    height: 16px;
                }
                .custom-scrollbar-x::-webkit-scrollbar-button:horizontal:decrement { 
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='16 19 9 12 16 5'%3E%3C/polyline%3E%3C/svg%3E");
                    background-size: 10px 10px;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                .custom-scrollbar-x::-webkit-scrollbar-button:horizontal:decrement:hover { background-color: #f1f5f9; }
                .custom-scrollbar-x::-webkit-scrollbar-button:horizontal:increment { 
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='8 19 15 12 8 5'%3E%3C/polyline%3E%3C/svg%3E");
                    background-size: 10px 10px;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                .custom-scrollbar-x::-webkit-scrollbar-button:horizontal:increment:hover { background-color: #f1f5f9; }

                @media (max-width: 768px) {
                    .hide-scrollbar-on-mobile::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar-on-mobile {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                }
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
