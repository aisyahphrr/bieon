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
import { useTranslation } from 'react-i18next';
import { SuperAdminLayout } from './SuperAdminLayout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminTariff({ onNavigate }) {
    const { t, i18n } = useTranslation();

    const getSegmentKey = (seg) => {
        switch(seg) {
            case 'Subsidi Rumah Tangga': return 'subsidi';
            case 'Rumah Tangga': return 'rumah_tangga';
            case 'Bisnis': return 'bisnis';
            case 'Industri': return 'industri';
            case 'Pemerintah & PJU': return 'pemerintah_pju';
            case 'Pelayanan Sosial': return 'sosial';
            default: return seg;
        }
    };

    const translatePlnCategory = (label) => {
        if (!label) return '-';
        if (i18n.language !== 'en') return label;
        return label
            .replace('(Subsidi)', '(Subsidized)')
            .replace('(Non-Subsidi)', '(Non-Subsidized)')
            .replace('Rumah Tangga', 'Household')
            .replace('Bisnis', 'Business')
            .replace('Industri', 'Industry')
            .replace('Pemerintah', 'Government')
            .replace('Sosial', 'Social')
            .replace('Pelayanan', 'Service')
            .replace('Lainnya', 'Others')
            .replace('Penerangan Jalan Umum', 'Street Lighting');
    };

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
        { label: 'B-1/TR - 450-5.500 VA', segment: 'Bisnis', isShortcut: false },
        { label: 'B-2/TR - 6.600 VA-200 kVA', segment: 'Bisnis', isShortcut: false },
        { label: 'B-3/TM, TT - > 200 kVA', segment: 'Bisnis', isShortcut: false },

        // Industri
        { label: 'I-1/TR - 450-5.500 VA', segment: 'Industri', isShortcut: false },
        { label: 'I-2/TM - 6.600 VA-200 kVA', segment: 'Industri', isShortcut: false },
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

    const monthNames = i18n.language === 'id' 
        ? ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
        
        if (i18n.language === 'en') {
            return `${monthNames[actualMonth]} ${day}, ${actualYear}`;
        }
        return `${day} ${monthNames[actualMonth]} ${actualYear}`;
    };

    // --- Data Charts (Dynamic) ---
    const [multiLineChartData, setMultiLineChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const PIE_COLORS = ['#059b27', '#129cc0', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

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
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [currentRes, historyRes, distributionRes, trendRes] = await Promise.allSettled([
                fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/tariffs/current?scope=all', { headers }),
                fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/tariffs/history', { headers }),
                fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/tariffs/distribution', { headers }),
                fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/tariffs/trend', { headers })
            ]);

            const extractResponseData = async (result, key) => {
                if (result.status !== 'fulfilled') {
                    setDataErrors((prev) => ({ ...prev, [key]: t('admin_tariff.messages.fail_request', 'Request gagal dikirim.') }));
                    return null;
                }

                if (!result.value.ok) {
                    setDataErrors((prev) => ({ ...prev, [key]: `HTTP ${result.value.status}` }));
                    return null;
                }

                const payload = await result.value.json();
                if (!payload?.success) {
                    setDataErrors((prev) => ({ ...prev, [key]: payload?.message || t('admin_tariff.charts.error_default', 'Data tidak valid.') }));
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
            setPieData(Array.isArray(distData) ? distData.map(d => ({ ...d, name: translatePlnCategory(d.name) })) : []);
            setMultiLineChartData(Array.isArray(trendData) ? trendData : []);
        } catch (error) {
            console.error('Gagal mengambil data tarif:', error);
            setDataErrors({
                current: t('admin_tariff.messages.error_update', 'Terjadi kesalahan saat memuat data.'),
                history: t('admin_tariff.messages.error_update', 'Terjadi kesalahan saat memuat data.'),
                distribution: t('admin_tariff.messages.error_update', 'Terjadi kesalahan saat memuat data.'),
                trend: t('admin_tariff.messages.error_update', 'Terjadi kesalahan saat memuat data.')
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
                const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/tariffs/public/categories?scope=all');
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
        if (category.includes('R1 - 450')) return 'bg-bieon-eco/15 text-bieon-eco border border-bieon-sense/25';
        if (category.includes('R1 - 900')) return 'bg-bieon-sense/10 text-bieon-sense border border-bieon-sense/25';
        if (category.includes('R1M')) return 'bg-bieon-sense/15 text-bieon-sense border border-bieon-sense/25';
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
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);

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
                if (sortConfig.key === 'date' || sortConfig.key === 'timestamp') {
                    const timeA = new Date(a.rawDate || a.createdAt || 0).getTime();
                    const timeB = new Date(b.rawDate || b.createdAt || 0).getTime();
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

    const allGolonganOptions = useMemo(() => {
        const categories = new Set();
        historyData.forEach(item => {
            if (item.category) categories.add(item.category);
        });
        return Array.from(categories).sort();
    }, [historyData]);

    const handleExportPDF = () => {
        if (sortedHistory.length === 0) {
            showToast(t('history.export.alert_no_data', 'Tidak ada data untuk diekspor'));
            return;
        }

        const doc = new jsPDF('l', 'mm', 'a4');
        const isEn = i18n.language === 'en';
        
        // Header
        doc.setFontSize(18);
        doc.setTextColor(5, 155, 39);
        doc.text(isEn ? "BIEON - Electricity Tariff History Report" : "BIEON - Laporan Riwayat Tarif Listrik", 15, 20);
        
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(isEn ? `Generated on: ${new Date().toLocaleString()}` : `Dihasilkan pada: ${new Date().toLocaleString()}`, 15, 28);

        const tableColumn = [
            t('admin_tariff.history.col_category', 'GOLONGAN PLN'),
            t('admin_tariff.history.col_tariff', 'TARIF (RP/KWH)'),
            t('admin_tariff.history.col_date', 'TANGGAL BERLAKU'),
            t('admin_tariff.history.col_author', 'DIUPDATE OLEH'),
            t('admin_tariff.history.col_note', 'KETERANGAN')
        ];

        const tableRows = sortedHistory.map(item => [
            translatePlnCategory(item.category),
            `Rp ${item.tariff.toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US')}`,
            item.date,
            item.author,
            item.note
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [5, 155, 39], fontSize: 10, halign: 'center' },
            bodyStyles: { fontSize: 9, halign: 'center' },
            styles: { overflow: 'linebreak' },
            pageBreak: 'auto',
            rowPageBreak: 'avoid',
            margin: { top: 35 }
        });

        const fileName = i18n.language === 'en' ? `BIEON_Tariff_History_${new Date().getTime()}.pdf` : `BIEON_Riwayat_Tarif_${new Date().getTime()}.pdf`;
        doc.save(fileName);
    };

    const totalPages = Math.max(1, Math.ceil(sortedHistory.length / rowsPerPage));
    const paginatedHistory = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return sortedHistory.slice(start, start + rowsPerPage);
    }, [sortedHistory, currentPage, rowsPerPage]);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const totalItems = sortedHistory.length;

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-gray-400" /> : <ArrowDown className="w-3.5 h-3.5 text-gray-400" />;
    };

    const handleUpdateTariff = async () => {
        if (!formGolongan || !newTariff || !selectedDate) {
            showToast(t('admin_tariff.messages.validation_required', 'Harap isi Golongan, Nominal Tarif, dan Tanggal Berlaku!'));
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // Convert selectedDate dari format Indonesia ke ISO
            const monthMapID = { 'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11 };
            const monthMapEN = { 'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5, 'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11 };
            const monthMap = i18n.language === 'id' ? monthMapID : monthMapEN;

            const parts = selectedDate.replace(',', '').split(' ');
            let day, monthStr, year;
            
            if (i18n.language === 'en') {
                // Format: "Month Day, Year"
                monthStr = parts[0];
                day = parseInt(parts[1]);
                year = parseInt(parts[2]);
            } else {
                // Format: "Day Month Year"
                day = parseInt(parts[0]);
                monthStr = parts[1];
                year = parseInt(parts[2]);
            }

            const dateISO = new Date(year, monthMap[monthStr], day).toISOString();

            const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/admin/tariffs', {
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
                showToast(t('admin_tariff.messages.success_update', { category: formGolongan, defaultValue: 'Tarif untuk {{category}} berhasil diperbarui!' }));
                setNewTariff('');
                setSelectedDate('');
                setNote('');
                setFormGolongan('');
                // Refresh semua data
                await fetchAllData();
            } else {
                showToast(data.message || t('admin_tariff.messages.fail_update', 'Gagal memperbarui tarif.'));
            }
        } catch (error) {
            console.error('Error update tarif:', error);
            showToast(t('admin_tariff.messages.error_update', 'Terjadi kesalahan saat memperbarui tarif.'));
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
                            <p className="text-[12px] font-black text-gray-700">
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
        <SuperAdminLayout activeMenu={t('admin_tariff.header.menu_label', 'PLN Listrik')} onNavigate={onNavigate} title={t('admin_tariff.header.title', 'Manajemen Tarif Listrik')}>
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
                                    ? 'bg-white text-bieon-eco shadow-sm ring-1 ring-bieon-eco/20'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                    }`}
                            >
                                {t('admin_tariff.categories.' + getSegmentKey(opt), opt)}
                            </button>
                        ))}
                    </div>

                    {/* Indikator Scroll Interaktif */}
                    <div className="md:hidden flex items-center justify-between w-full max-w-[90vw] px-2 py-0.5 mt-1">
                        <button 
                            onClick={() => scrollTabs('left')}
                            className="p-1 hover:bg-gray-50 rounded-full active:scale-95 transition-all text-gray-400 hover:text-bieon-eco"
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
                                    background: `linear-gradient(to right, #059b27 ${tabsScrollProgress}%, #F3F4F6 ${tabsScrollProgress}%)`
                                }}
                            />
                        </div>

                        <button 
                            onClick={() => scrollTabs('right')}
                            className="p-1 hover:bg-gray-50 rounded-full active:scale-95 transition-all text-gray-400 hover:text-bieon-eco"
                            aria-label="Scroll Kanan"
                        >
                            <ChevronRight className="w-4 h-4 font-bold" strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* 2 ELONGATED CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 select-none">
                    {/* Card 1 - Info Golongan */}
                    <div className="bg-gradient-to-r from-white via-emerald-50/50 to-emerald-100/80 rounded-[1.25rem] shadow-sm border border-emerald-100/50 relative flex items-center text-gray-900 min-h-[120px] px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden group">
                        {/* Soft geometric accent */}
                        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700"></div>
                        <div className="absolute left-1/2 bottom-0 w-24 h-24 bg-emerald-300/10 rounded-full blur-xl translate-y-1/2"></div>
                        <div className="flex-1 relative z-10">
                            <p className="text-[13px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">{t('admin_tariff.cards.info_title', 'Informasi Golongan')}</p>
                            <h3 className="text-[26px] xl:text-[28px] font-extrabold tracking-tight leading-none mb-3 text-gray-900">{t('admin_tariff.categories.' + getSegmentKey(activeSegmentName), activeSegmentName)}</h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-emerald-100/80 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm">{t('admin_tariff.cards.sub_count', { count: totalSubCategories, defaultValue: '{{count}} Sub-Golongan' })}</span>
                            </div>
                        </div>
                        <div className="relative z-10 hidden sm:block">
                            <div className="p-4 rounded-2xl bg-white shadow-md shadow-emerald-200/40 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-emerald-200/60 transition-all duration-300 border border-emerald-50 relative">
                                <Zap className="w-8 h-8 text-emerald-500" strokeWidth={2.5} />
                                <div className="absolute inset-0 border border-emerald-400/20 rounded-2xl animate-[spin_4s_linear_infinite]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 - Rentang Tarif */}
                    <div className="bg-gradient-to-r from-white via-amber-50/50 to-amber-100/80 rounded-[1.25rem] shadow-sm border border-amber-100/50 relative flex items-center text-gray-900 min-h-[120px] px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75 overflow-hidden group">
                        {/* Soft geometric accent */}
                        <div className="absolute right-0 top-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700"></div>
                        <div className="absolute left-1/2 bottom-0 w-24 h-24 bg-amber-300/10 rounded-full blur-xl translate-y-1/2"></div>
                        <div className="flex-1 relative z-10">
                            <p className="text-[13px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">{t('admin_tariff.cards.range_title', 'Rentang Tarif')}</p>
                            <h3 className="text-[24px] xl:text-[28px] font-extrabold tracking-tight leading-none mb-3 text-gray-900">
                                {isSingleTariff ? `Rp ${minTariff.toFixed(2)}` : `Rp ${minTariff.toFixed(2)} - ${maxTariff.toFixed(2)}`}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="bg-amber-100/80 text-amber-700 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1.5"><Zap className="w-3 h-3" /> {t('admin_tariff.cards.active_type', 'Tipe Tarif Aktif')}</span>
                            </div>
                        </div>
                        <div className="relative z-10 hidden sm:block">
                            <div className="p-4 rounded-2xl bg-white shadow-md shadow-amber-200/40 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-amber-200/60 transition-all duration-300 border border-amber-50 relative">
                                <TrendingUp className="w-8 h-8 text-amber-500" strokeWidth={2.5} />
                                <div className="absolute inset-0 border border-amber-400/20 rounded-2xl animate-[spin_4s_linear_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUB-CATEGORIES MATRIX / TABLE */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">{t('admin_tariff.matrix.title', { segment: t('admin_tariff.categories.' + getSegmentKey(activeSegmentName), activeSegmentName), defaultValue: 'Matriks Sub-Golongan: {{segment}}' })}</h2>
                            <p className="text-xs text-gray-500 mt-1 italic">{t('admin_tariff.matrix.subtitle', 'Rincian tarif untuk setiap jenis pelanggan pada golongan ini.')}</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar-x pb-4 px-4 pt-4">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gradient-to-r from-emerald-50/80 to-sky-50/80 border-b border-emerald-100/60 text-slate-600 select-none">
                                <tr>
                                    <th className="px-6 py-4 font-normal rounded-tl-xl w-2/5"><div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('admin_tariff.matrix.col_category', 'Sub-Golongan & Status')}</div></th>
                                    <th className="px-6 py-4 font-normal w-1/5"><div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('admin_tariff.matrix.col_tariff', 'Tarif Saat Ini')}</div></th>
                                    <th className="px-6 py-4 font-normal rounded-tr-xl text-right w-1/5"><div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('admin_tariff.matrix.col_action', 'Aksi')}</div></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {activeSubCategoryStats.map((stat, idx) => (
                                    <tr key={idx} className="hover:bg-[#F8FAFB]/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-between max-w-sm">
                                                <div className="text-sm font-bold text-gray-900">{stat.name}</div>
                                                {stat.percentage !== 0 ? (
                                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${stat.percentage > 0 ? 'bg-red-50 text-red-600' : 'bg-bieon-eco/10 text-bieon-eco'}`}>
                                                        {stat.percentage > 0 ? t('admin_tariff.matrix.status_up', 'Naik') : t('admin_tariff.matrix.status_down', 'Turun')} ({stat.percentage > 0 ? '+' : ''}{stat.percentage.toFixed(2)}%)
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{t('admin_tariff.matrix.status_unchanged', 'Tetap')}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-bieon-eco text-[15px]">
                                                Rp {stat.currentTariff.toFixed(2)}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium">{t('admin_tariff.matrix.unit', 'per kWh')}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setFormGolongan(stat.name);
                                                    document.getElementById('update-form-section')?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 hover:bg-bieon-eco/10 text-slate-600 hover:text-bieon-eco border border-slate-200 hover:border-bieon-eco/30 rounded-xl text-[11px] font-bold transition-all shadow-sm"
                                            >
                                                <Zap className="w-3 h-3" /> {t('admin_tariff.matrix.btn_update', 'Update')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {activeSubCategoryStats.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center">
                                            <p className="text-sm font-semibold text-gray-500">{t('admin_tariff.matrix.empty', 'Tidak ada data sub-golongan.')}</p>
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
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">{t('admin_tariff.charts.trend_title', 'Tren Perubahan Tarif Listrik')}</h2>
                            <p className="text-xs text-gray-500 mt-1 italic">{t('admin_tariff.charts.trend_desc', 'Komparasi nilai pergerakan tarif antar golongan di BIEON.')}</p>
                            {dataErrors.trend && (
                                <p className="text-[11px] text-amber-600 font-semibold mt-2">
                                    {t('admin_tariff.charts.trend_error', { error: dataErrors.trend, defaultValue: 'Data tren belum tersedia: {{error}}' })}
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
                                        <Line type="monotone" dataKey="r1" name="R1" stroke="#059b27" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="r2" name="R2" stroke="#129cc0" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="r3" name="R3" stroke="#A855F7" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[300px] w-full flex items-center justify-center text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm font-semibold text-gray-500">{t('admin_tariff.charts.trend_empty', 'Data tren tarif belum tersedia.')}</p>
                            </div>
                        )}
                    </div>

                    {/* CHART 2: Sebaran Pelanggan (Pie) */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 xl:col-span-2">
                        <div className="mb-2">
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">{t('admin_tariff.charts.pie_title', 'Sebaran Konsumen BIEON')}</h2>
                            <p className="text-xs text-gray-500 mt-1 italic">{t('admin_tariff.charts.pie_desc', 'Distribusi pelanggan aktif berdasarkan klasifikasi PLN.')}</p>
                            {dataErrors.distribution && (
                                <p className="text-[11px] text-amber-600 font-semibold mt-2">
                                    {t('admin_tariff.charts.pie_error', { error: dataErrors.distribution, defaultValue: 'Data sebaran belum tersedia: {{error}}' })}
                                </p>
                            )}
                        </div>
                        {hasPieData ? (
                            <div className="h-[300px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <defs>
                                            <linearGradient id="pieGrad0" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#34D399" />
                                                <stop offset="100%" stopColor="#059b27" />
                                            </linearGradient>
                                            <linearGradient id="pieGrad1" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#60A5FA" />
                                                <stop offset="100%" stopColor="#129cc0" />
                                            </linearGradient>
                                            <linearGradient id="pieGrad2" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#A78BFA" />
                                                <stop offset="100%" stopColor="#8B5CF6" />
                                            </linearGradient>
                                            <linearGradient id="pieGrad3" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#FBBF24" />
                                                <stop offset="100%" stopColor="#D97706" />
                                            </linearGradient>
                                            <linearGradient id="pieGrad4" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#F87171" />
                                                <stop offset="100%" stopColor="#DC2626" />
                                            </linearGradient>
                                        </defs>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`url(#pieGrad${index % 5})`} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const colorVal = payload[0].payload.fill;
                                                    // Since fill is now a URL like url(#pieGrad0), we should probably just use a solid fallback color for tooltip text, or gray.
                                                    return (
                                                        <div className="bg-white border p-3 rounded-xl shadow-lg">
                                                            <p className="text-[12px] font-black text-gray-700">{translatePlnCategory(payload[0].name)}</p>
                                                            <p className="text-sm font-bold mt-1 text-gray-800">
                                                                {payload[0].value}{t('admin_tariff.charts.pie_unit', '% Pengguna')}
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
                                <p className="text-sm font-semibold text-gray-500">{t('admin_tariff.charts.pie_empty', 'Data sebaran konsumen belum tersedia.')}</p>
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
                                <Zap className="w-5 h-5 text-bieon-eco" /> {t('admin_tariff.form.title', 'Update Tarif Listrik PLN')}
                            </h2>
                            <p className="text-sm text-gray-500">{t('admin_tariff.form.subtitle', 'Perbarui tarif listrik sesuai dengan kebijakan terbaru PLN.')}</p>
                        </div>

                        <div className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-2xl p-5 mb-8 text-blue-800">
                            <h4 className="flex items-center gap-2 font-bold mb-2 text-sm"><Info className="w-5 h-5" /> {t('admin_tariff.form.note_title', 'Catatan Penting:')}</h4>
                            <ul className="list-disc pl-6 text-xs space-y-1.5 font-medium opacity-90">
                                <li>{t('admin_tariff.form.note_p1', 'Perubahan tarif akan mempengaruhi perhitungan biaya energi untuk semua pelanggan')}</li>
                                <li>{t('admin_tariff.form.note_p2', 'Pastikan tarif yang dimasukkan sesuai dengan SK resmi dari PLN/Kementerian ESDM')}</li>
                                <li>{t('admin_tariff.form.note_p3', 'Sistem akan otomatis menghitung ulang estimasi biaya berdasarkan tarif baru')}</li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* GOLONGAN DROPDOWN */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-700">{t('admin_tariff.form.lbl_category', 'Target Golongan')} <span className="text-red-500">*</span></label>
                                    <div className="relative z-30">
                                        <button
                                            type="button"
                                            onClick={() => setShowFormGolDropdown(!showFormGolDropdown)}
                                            className={`w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 border rounded-2xl text-sm font-bold transition-all ${showFormGolDropdown ? 'border-bieon-eco bg-white ring-4 ring-bieon-eco/10' : 'border-gray-100 hover:bg-gray-100/50'}`}
                                        >
                                            <span className={formGolongan ? 'text-gray-900' : 'text-gray-400'}>
                                                {formGolongan || t('admin_tariff.form.ph_category', 'Pilih Golongan PLN')}
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
                                                            placeholder={t('admin_tariff.form.search_category', 'Cari golongan (mis. R1, B-2, PJU...)')}
                                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[12px] font-bold text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-bieon-eco focus:ring-2 focus:ring-bieon-eco/10 transition-all"
                                                        />
                                                    </div>

                                                    {plnCategoriesLoading && (
                                                        <div className="px-5 pb-2 text-[12px] font-black text-gray-400">
                                                            {t('admin_tariff.form.loading_category', 'Memuat kategori...')}
                                                        </div>
                                                    )}

                                                    {filteredFormCategories.length === 0 && (
                                                        <div className="px-5 py-3 text-[12px] font-bold text-gray-400">
                                                            {t('admin_tariff.form.empty_category', 'Tidak ada hasil.')}
                                                        </div>
                                                    )}

                                                    {PLN_SEGMENT_ORDER.filter((seg) => groupedFormCategories[seg]?.length).map((seg) => (
                                                        <div key={seg} className="pb-1">
                                                            <div className="px-5 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                {t('admin_tariff.categories.' + getSegmentKey(seg), seg)}
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
                                                                    className={`w-full text-left px-5 py-3 text-[12px] font-bold transition-colors ${formGolongan === cat.label ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-600 hover:bg-gray-50'}`}
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
                                                                    className={`w-full text-left px-5 py-3 text-[12px] font-bold transition-colors ${formGolongan === cat.label ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-600 hover:bg-gray-50'}`}
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
                                    <label className="block text-xs font-bold text-gray-700">{t('admin_tariff.form.lbl_tariff', 'Tarif Listrik Baru (per kWh)')} <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">Rp</span>
                                        <input
                                            type="number"
                                            value={newTariff}
                                            onChange={(e) => setNewTariff(e.target.value)}
                                            placeholder={t('admin_tariff.form.ph_tariff', 'Contoh: 1495')}
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:border-bieon-eco focus:bg-white focus:ring-4 focus:ring-bieon-eco/10 transition-all custom-scrollbar-hide"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400">{t('admin_tariff.form.hint_tariff', 'Masukkan tarif dalam Rupiah (Rp)')}</p>
                                </div>

                                {/* Custom Date Picker */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-700">{t('admin_tariff.form.lbl_date', 'Tanggal Berlaku')} <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowCalendar(!showCalendar)}
                                            className={`w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 border rounded-2xl text-sm font-bold transition-all ${showCalendar ? 'border-bieon-eco bg-white ring-4 ring-bieon-eco/10' : 'border-gray-100 hover:bg-gray-100/50'}`}
                                        >
                                            <span className={selectedDate ? 'text-gray-900' : 'text-gray-400'}>
                                                {selectedDate || t('admin_tariff.form.ph_date', 'Pilih Tanggal')}
                                            </span>
                                            <Calendar className={`w-4 h-4 text-gray-400 transition-colors ${showCalendar ? 'text-bieon-eco' : ''}`} />
                                        </button>

                                        {showCalendar && (
                                            <>
                                                <div className="fixed inset-0 z-[60]" onClick={() => setShowCalendar(false)}></div>
                                                <div className="absolute bottom-full mb-2 right-0 w-full sm:w-[320px] bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl p-5 z-[70] animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[15px] font-bold text-gray-900">{monthNames[viewMonth]}</span>
                                                            <div className="relative">
                                                                <button type="button" onClick={() => setShowYearDropdown(!showYearDropdown)} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-bieon-eco transition-colors">
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
                                                                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${viewYear === year ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-600 hover:bg-gray-50'}`}
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
                                                                            ${!d.current ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-bieon-eco/10 hover:text-bieon-eco'}
                                                                            ${isSelected ? 'bg-gradient-to-r from-bieon-eco to-bieon-sense text-white hover:brightness-105 hover:text-white shadow-md shadow-bieon-eco/15' : ''}
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
                                    <p className="text-[10px] text-gray-400">{t('admin_tariff.form.hint_date', 'Tentukan kapan tarif baru mulai berlaku')}</p>
                                </div>
                            </div>

                            {/* Textarea Keterangan */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-700">{t('admin_tariff.form.lbl_note', 'Catatan/Keterangan')} <span className="text-red-500">*</span></label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder={t('admin_tariff.form.ph_note', 'Contoh: Penyesuaian tarif PLN sesuai SK Menteri ESDM No. 28/2026')}
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:border-bieon-eco focus:bg-white focus:ring-4 focus:ring-bieon-eco/10 transition-all min-h-[100px] resize-none"
                                />
                                <p className="text-[10px] text-gray-400">{t('admin_tariff.form.hint_note', 'Jelaskan alasan/dasar hukum perubahan tarif')}</p>
                            </div>

                            <button
                                onClick={handleUpdateTariff}
                                className="w-full py-4 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white font-bold rounded-2xl text-sm hover:brightness-105 transition-all shadow-lg shadow-bieon-eco/30 flex justify-center items-center gap-2 group mt-4"
                            >
                                <Zap className="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" /> {t('admin_tariff.form.btn_submit', 'Update Tarif Listrik')}
                            </button>
                        </div>
                    </div>

                    {/* HISTORY TABLE */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-fit">
                        <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="shrink-0">
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">{t('admin_tariff.history.title', 'Riwayat Perubahan Tarif')}</h2>
                                <p className="text-xs text-gray-500 mt-1 italic">{t('admin_tariff.history.subtitle', 'Log jejak rekam penyesuaian semua golongan.')}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                                {/* Pencarian */}
                                <div className="relative w-full sm:w-64">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('admin_tariff.history.search_ph', 'Cari Keterangan...')}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-bieon-eco focus:ring-2 focus:ring-bieon-eco/10 transition-all custom-scrollbar-hide h-10"
                                    />
                                </div>
                                {/* Filter */}
                                <div className="relative w-full sm:w-48">
                                    <button
                                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                        className={`flex items-center justify-start gap-2 w-full px-4 py-2 bg-gray-50 border rounded-xl text-xs font-bold transition-all h-10 ${showFilterDropdown ? 'border-bieon-eco' : 'border-gray-100 hover:bg-gray-100/50'}`}
                                    >
                                        <Filter className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                        <span className="text-gray-700 whitespace-nowrap truncate">{filterGolongan === 'All' ? t('admin_tariff.history.filter_all', 'Semua Golongan') : translatePlnCategory(filterGolongan)}</span>
                                    </button>
                                    {showFilterDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-[35]" onClick={() => setShowFilterDropdown(false)}></div>
                                            <div className="absolute right-0 top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[40] max-h-[240px] overflow-y-auto modal-custom-scrollbar">
                                                <button
                                                    onClick={() => { setFilterGolongan('All'); setShowFilterDropdown(false); }}
                                                    className={`w-full text-left px-5 py-2.5 text-[12px] font-black transition-colors ${filterGolongan === 'All' ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    {t('admin_tariff.history.filter_all', 'Semua Golongan')}
                                                </button>
                                                {allGolonganOptions.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => { setFilterGolongan(opt); setShowFilterDropdown(false); }}
                                                        className={`w-full text-left px-5 py-2.5 text-[12px] font-black transition-colors ${filterGolongan === opt ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {/* Export Button */}
                                <button
                                    onClick={handleExportPDF}
                                    className="flex items-center justify-center gap-2 px-6 py-2 h-10 bg-bieon-eco/10 text-bieon-eco rounded-xl text-[11px] font-bold hover:bg-bieon-eco/20 border border-bieon-eco/20 transition-all shadow-sm w-full sm:w-auto shrink-0 uppercase tracking-wide"
                                >
                                    <Download className="w-3.5 h-3.5 shrink-0" /> <span className="whitespace-nowrap">{t('admin_tariff.history.btn_export', 'Export')}</span>
                                </button>
                            </div>
                        </div>

                        <div 
                            className="overflow-x-auto custom-scrollbar-x scroll-smooth pb-4 px-4"
                        >
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-gradient-to-r from-emerald-50/80 to-sky-50/80 border-b border-emerald-100/60 text-slate-600 select-none">
                                    <tr>
                                        <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('category')}>
                                            <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold whitespace-nowrap">{t('admin_tariff.history.col_category', 'GOLONGAN PLN')} {getSortIcon('category')}</div>
                                        </th>
                                        <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('tariff')}>
                                            <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold whitespace-nowrap">{t('admin_tariff.history.col_tariff', 'TARIF (RP/KWH)')} {getSortIcon('tariff')}</div>
                                        </th>
                                        <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('date')}>
                                            <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold whitespace-nowrap">{t('admin_tariff.history.col_date', 'TANGGAL BERLAKU')} {getSortIcon('date')}</div>
                                        </th>
                                        <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none" onClick={() => requestSort('timestamp')}>
                                            <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold whitespace-nowrap">{t('admin_tariff.history.col_author', 'DIUPDATE OLEH')} {getSortIcon('timestamp')}</div>
                                        </th>
                                        <th className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors outline-none min-w-[280px] hidden xl:table-cell" onClick={() => requestSort('note')}>
                                            <div className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold whitespace-nowrap">{t('admin_tariff.history.col_note', 'KETERANGAN')} {getSortIcon('note')}</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#F8FAFB]/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                {/* COLOR CODED BADGE DEPENDING ON CATEGORY */}
                                                <span className={`inline-flex px-3 py-1.5 rounded-xl font-bold text-[10px] ${getBadgeStyle(item.category)}`}>
                                                    {translatePlnCategory(item.category)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 text-sm">
                                                    Rp {item.tariff.toFixed(2)}
                                                </div>
                                                {item.percentage !== 0 ? (
                                                    <div className={`flex items-center gap-0.5 text-[10px] font-bold mt-1 ${item.percentage > 0 ? 'text-red-500' : 'text-bieon-eco'}`}>
                                                        {item.percentage > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                        {item.percentage > 0 ? t('admin_tariff.matrix.status_up', 'Naik') : t('admin_tariff.matrix.status_down', 'Turun')} ({item.percentage > 0 ? '+' : ''}{item.percentage}%)
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] text-gray-400 font-medium mt-1">{t('admin_tariff.history.base_tariff', 'Tarif Dasar')}</div>
                                                )}
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

                        {/* Standardized Pagination UI (AdminComplaint Style) */}
                        <div className="bg-gray-50/50 px-5 md:px-8 py-4 md:py-6 border-t border-gray-100 flex flex-row items-center justify-between gap-2 rounded-b-[2rem]">
                            {/* Rows per page - Left */}
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">{t('admin_tariff.pagination.rows', 'Baris')}:</span>
                                <div className="relative">
                                    <button onClick={() => setShowRowsDropdown(!showRowsDropdown)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-100 rounded-xl text-[10px] md:text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all min-w-[50px] md:min-w-[70px] justify-between">
                                        {rowsPerPage} <ChevronDown className={`w-3 h-3 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showRowsDropdown && (
                                        <div className="absolute bottom-full left-0 mb-2 w-20 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-bottom-2">
                                            {[5, 10, 30, 50].map(val => (
                                                <button key={val} onClick={() => { setRowsPerPage(val); setShowRowsDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${rowsPerPage === val ? 'text-bieon-eco bg-bieon-eco/5' : 'text-gray-500 hover:bg-gray-50'}`}>{val}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Page Info - Center */}
                            <div className="text-[10px] md:text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-center whitespace-nowrap">
                                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalItems)} {t('admin_tariff.pagination.of', 'dari')} {totalItems} {t('admin_tariff.pagination.items', 'item')}
                            </div>

                            {/* Pagination Controls - Right */}
                            <div className="flex items-center gap-1.5 md:gap-3">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="p-2 md:px-5 lg:px-6 md:py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] md:text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center min-w-[36px]"
                                >
                                    <ChevronLeft className="w-4 h-4 md:hidden" />
                                    <span className="hidden md:inline lg:hidden">{t('admin_tariff.pagination.prev', 'Sebelumnya').slice(0, 4)}</span>
                                    <span className="hidden lg:inline">{t('admin_tariff.pagination.prev', 'Sebelumnya')}</span>
                                </button>
                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-2 md:px-5 lg:px-6 md:py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] md:text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm flex items-center justify-center min-w-[36px]"
                                >
                                    <span className="hidden lg:inline">{t('admin_tariff.pagination.next', 'Selanjutnya')}</span>
                                    <span className="hidden md:inline lg:hidden">{t('admin_tariff.pagination.next', 'Selanjutnya').slice(0, 4)}</span>
                                    <ChevronRight className="w-4 h-4 md:hidden" />
                                </button>
                            </div>
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
                        <div className="w-8 h-8 bg-bieon-eco/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-bieon-sense" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">{toast.message}</span>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
