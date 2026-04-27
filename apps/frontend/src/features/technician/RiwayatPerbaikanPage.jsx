import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Cpu,
  ArrowLeft,
  X,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ComplaintDetailModal } from '../complaints/ComplaintDetailModal';
import { TicketStatusBadge } from '../../shared/TicketStatusBadge';

// Helper function to calculate duration between ticket creation and completion
const calculateDuration = (start, end) => {
    if (!start || !end) return '-';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    if (diffMs < 0) return '0 Menit';
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    const remainingHours = diffHours % 24;
    const remainingMins = diffMins % 60;
    
    let result = '';
    if (diffDays > 0) result += `${diffDays} Hari `;
    if (remainingHours > 0) result += `${remainingHours} Jam `;
    if (remainingMins > 0 || result === '') result += `${remainingMins} Menit`;
    
    return result.trim();
};

export function RiwayatPerbaikanPage() {
    // States
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [showRowsDropdown, setShowRowsDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Custom Picker States (Setup-style)
  const [activePicker, setActivePicker] = useState(null); // 'start' | 'end' | null
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
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

  const handleSelectDate = (d) => {
    let year = d.year;
    let month = d.month;
    if (month < 0) { month = 11; year--; }
    if (month > 11) { month = 0; year++; }

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;

    if (activePicker === 'start') {
      setDateRange(prev => ({ ...prev, start: dateStr }));
    } else {
      setDateRange(prev => ({ ...prev, end: dateStr }));
    }
    setActivePicker(null);
    setCurrentPage(1);
  };

  const formatDateDisplay = (isoDate) => {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('/api/complaints/technician', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Filter ONLY 'selesai' status and MAP data
          const historyData = data
            .filter(item => item.status?.toLowerCase() === 'selesai')
            .map(item => {
              const safeId = item._id ? item._id.toString() : '';
              return {
                ...item,
                originalId: safeId,
                id: `TCK-${safeId.substring(Math.max(0, safeId.length - 6)).toUpperCase()}`,
                date: new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                finishedDate: new Date(item.completedAt || item.updatedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                client: item.homeowner?.fullName || 'Pelanggan Bieon',
                location: item.homeowner?.address || '-',
                duration: calculateDuration(item.createdAt, item.completedAt || item.updatedAt),
                rating: { 
                    stars: item.rating?.stars || 0, 
                    review: item.rating?.note || "Tidak ada ulasan." 
                },
                category: item.category || 'Umum',
                device: item.device_parameters?.[0]?.param_name || 'Perangkat Bieon'
              };
            });
          setComplaints(historyData);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const historyData = complaints;

  // Filter & Sort Logic
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filteredData = useMemo(() => {
    return historyData.filter(item => {
      const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua Kategori' || item.category === selectedCategory;

      // Date Range Filter
      let matchesDate = true;
      if (dateRange.start || dateRange.end) {
        const finishedDate = new Date(item.completedAt || item.updatedAt);
        if (finishedDate) {
          if (dateRange.start) {
            const start = new Date(dateRange.start);
            start.setHours(0, 0, 0, 0);
            if (finishedDate < start) matchesDate = false;
          }
          if (dateRange.end) {
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);
            if (finishedDate > end) matchesDate = false;
          }
        }
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [historyData, searchQuery, selectedCategory, dateRange]);

  const processedData = useMemo(() => {
    let filtered = [...filteredData];
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'stars') {
          aVal = a.rating.stars;
          bVal = b.rating.stars;
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [filteredData, sortConfig]);

  const totalItems = processedData.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = processedData.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-gray-600" /> : <ArrowDown className="w-3.5 h-3.5 text-gray-600" />;
  };

  // Standardized PDF Export Logic
  const handleExportPDF = () => {
    const doc = new jsPDF('portrait');

    // Header BIEON
    doc.setFontSize(18);
    doc.setTextColor(15, 158, 120); // #0F9E78 (BIEON Teal)
    doc.text('BIEON - Riwayat Aktivitas Teknisi', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);

    // Columns matching the UI table order
    const tableColumn = ["ID Tiket", "Dibuat", "Pelanggan", "Lokasi", "Topik Kendala", "Durasi", "Rating"];
    const tableRows = processedData.map(item => [
      item.id.replace('+P', '').trim(),
      item.finishedDate,
      item.client,
      item.location,
      item.topic.length > 40 ? item.topic.substring(0, 40) + '...' : item.topic,
      item.duration,
      `${item.rating.stars}/5`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [15, 158, 120], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 247] }
    });

    doc.save(`BIEON_Riwayat_Teknisi_${new Date().getTime()}.pdf`);
  };

  // Export Detail Single Ticket (PDF)
  const handleExportSingleDetailPDF = (ticket) => {
    if (!ticket) return;
    const doc = new jsPDF('portrait');
    const primaryColor = [15, 158, 120]; // BIEON Teal
    
    // Header & Logo Branding
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('LAPORAN DETAIL PERBAIKAN', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`ID TIKET: ${ticket.id.replace('+P', '')}`, 105, 30, { align: 'center' });

    // Section 1: Informasi Dasar
    doc.setTextColor(40);
    doc.setFontSize(14);
    doc.text('INFORMASI PENGADUAN', 14, 55);
    doc.setLineWidth(0.5);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(14, 58, 65, 58);

    doc.setFontSize(10);
    const infoData = [
        ['Nama Pelanggan', `: ${ticket.client}`],
        ['Alamat', `: ${ticket.location}`],
        ['Topik Kendala', `: ${ticket.topic}`],
        ['Kategori', `: ${ticket.category}`],
        ['Rating Layanan', `: ${ticket.rating?.stars !== '-' ? ticket.rating.stars + '/5' : 'Belum dinilai'}`],
        ['Deskripsi Masalah', `: ${ticket.desc || ticket.description || '-'}`],
        ['Waktu Dibuat', `: ${ticket.date}`],
        ['Waktu Selesai', `: ${ticket.finishedDate || '-'}`],
        ['Durasi Pengerjaan', `: ${ticket.duration || '-'}`]
    ];

    autoTable(doc, {
        startY: 65,
        body: infoData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 38 }, 1: { cellWidth: 'auto' } },
        margin: { bottom: 25 }
    });

    // Section 2: SLA Performance Metrics
    let currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('SLA PERFORMANCE', 14, currentY);
    doc.line(14, currentY + 3, 60, currentY + 3);

    const timeline = ticket.timeline || [];
    
    // Use pre-calculated durations from ticket if available
    const responseTime = ticket.responseDuration && ticket.responseDuration !== '00:00:00' 
        ? ticket.responseDuration 
        : '-';
    const repairTime = ticket.repairDuration && ticket.repairDuration !== '00:00:00' 
        ? ticket.repairDuration 
        : '-';

    // Calculate Points for Internal Status Logic
    const resPts = ticket.responsePoints || 0;
    const repPts = ticket.repairPoints || 0;
    const totalPts = resPts + repPts;
    let overallStatus = 'NEEDS IMPROVEMENT';
    if (totalPts >= 100) overallStatus = 'EXCELLENT';
    else if (totalPts >= 50) overallStatus = 'GOOD';

    const slaData = [
        ['Respon Teknisi', '15 Menit', responseTime, (responseTime !== '-' && (responseTime.includes('Hari') || parseInt(responseTime.split(':')[0]) > 0 || parseInt(responseTime.split(':')[1]) > 15)) ? 'OVERDUE' : 'SESUAI SLA'],
        ['Perbaikan Unit', '48 Jam', repairTime, (repairTime !== '-' && (repairTime.includes('Hari') || parseInt(repairTime.split(':')[0]) >= 48)) ? 'OVERDUE' : 'SESUAI SLA']
    ];

    autoTable(doc, {
        startY: currentY + 8,
        head: [['Aspek SLA', 'Target', 'Capaian', 'Status']],
        body: slaData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
        columnStyles: { 3: { fontStyle: 'bold' } },
        margin: { bottom: 25 },
        didParseCell: (data) => {
            if (data.column.index === 3 && data.cell.section === 'body') {
                if (data.cell.text[0] === 'OVERDUE') data.cell.styles.textColor = [220, 38, 38];
                if (data.cell.text[0] === 'SESUAI SLA') data.cell.styles.textColor = [16, 185, 129];
            }
        }
    });

    // Section Summary (Overall Status)
    currentY = doc.lastAutoTable.finalY + 4;
    doc.setFillColor(242, 248, 245);
    doc.rect(14, currentY, 182, 12, 'F');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`OVERALL PERFORMANCE STATUS: ${overallStatus}`, 105, currentY + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);

    // Section 3: Riwayat Progres Pengaduan
    currentY = currentY + 28;
    doc.setFontSize(14);
    doc.text('RIWAYAT PROGRES PENGADUAN', 14, currentY);
    doc.line(14, currentY + 3, 85, currentY + 3);

    const timelineData = timeline.length > 0 ? timeline.map(t => [
        t.time || '-',
        (t.status || 'UPDATE').toUpperCase(),
        (t.desc || t.note || t.notes || '-').replace(/\s*\((?=.*(Respons|Durasi|Poin|Rating)).*?\)/gi, '').trim()
    ]) : [['-', 'TIDAK ADA DATA PROGRES', '-']];

    autoTable(doc, {
        startY: currentY + 8,
        head: [['Tanggal & Waktu', 'Aktivitas', 'Catatan/Keterangan']],
        body: timelineData,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
        columnStyles: { 0: { width: 50 }, 1: { width: 45, fontStyle: 'bold' } },
        margin: { bottom: 25 }
    });

    // Footer & Page Numbers (Adopted from SA)
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Separator Line
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.2);
        doc.line(14, 282, 196, 282);

        doc.setFontSize(7);
        doc.setTextColor(180);
        doc.text('Dokumen ini dihasilkan secara otomatis oleh Sistem Monitoring BIEON Smart Green Living.', 105, 287, { align: 'center' });
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 292, { align: 'center' });
    }

    doc.save(`BIEON_Detail_Teknisi_${ticket.id.replace('+P', '')}.pdf`);
  };

  // getStatusBadge replaced by shared TicketStatusBadge component

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/10 to-teal-50/10 p-4 md:p-8">
      <div className="max-w-[1900px] mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#235C50] mb-8">Riwayat Aktivitas</h1>



        {/* FILTERS & ACTIONS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 w-full">
          <div className="flex flex-row w-full lg:w-auto mt-2 lg:mt-0 gap-2 items-center">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[100px] sm:w-[240px] group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
              <input
                type="text"
                placeholder="Cari Tiket..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 bg-white transition-all shadow-sm"
              />
            </div>
            
            {/* Kategori Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-white border rounded-xl text-[13px] font-medium transition-all shadow-sm group ${showCategoryDropdown ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <Filter className="w-4 h-4 text-gray-500 sm:hidden" />
                <span className={`hidden sm:inline-block ${selectedCategory !== 'Semua Kategori' ? 'text-gray-900' : 'text-gray-500'}`}>
                  {selectedCategory === 'Semua Kategori' ? 'Kategori' : selectedCategory}
                </span>
                <ChevronDown className={`hidden sm:block w-4 h-4 text-gray-400 transition-all ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showCategoryDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)}></div>
                  <div className="absolute top-full mt-2 right-0 sm:left-0 w-[220px] bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                    {['Semua Kategori', 'Energi & Kelistrikan', 'Kualitas Air', 'Keamanan', 'Kenyamanan & Udara', 'Perangkat Aktuator', 'Lainnya'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setShowCategoryDropdown(false); setCurrentPage(1); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedCategory === cat ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Rentang Waktu (Dropdown Aktif) */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-white border rounded-xl text-[13px] font-medium transition-all shadow-sm ${showDateDropdown || dateRange.start || dateRange.end ? 'border-teal-500 ring-4 ring-teal-500/10 text-[#235C50]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <Calendar className={`w-4 h-4 ${showDateDropdown || dateRange.start || dateRange.end ? 'text-teal-500' : 'text-gray-600 sm:hidden'}`} />
                <span className="hidden sm:inline-block">{dateRange.start || dateRange.end ? 'Rentang Aktif' : 'Rentang Waktu'}</span>
              </button>

              {showDateDropdown && (
                <>
                  <div className="fixed inset-0 z-[15]" onClick={() => { setShowDateDropdown(false); setActivePicker(null); }}></div>
                  <div className="absolute top-full mt-2 right-[-48px] sm:right-0 w-[calc(100vw-32px)] max-w-[320px] sm:w-[320px] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 sm:p-5 z-[20] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="space-y-5">
                      {/* Input Trigger Start */}
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Mulai Dari</label>
                        <button
                          onClick={() => setActivePicker(activePicker === 'start' ? null : 'start')}
                          className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium transition-all ${activePicker === 'start' ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-gray-200'}`}
                        >
                          <span className={dateRange.start ? 'text-gray-900' : 'text-gray-400'}>
                            {dateRange.start ? formatDateDisplay(dateRange.start) : 'Pilih Tanggal'}
                          </span>
                          <Calendar className={`w-4 h-4 text-gray-400 ${activePicker === 'start' ? 'text-teal-500' : ''}`} />
                        </button>
                      </div>

                      {/* Input Trigger End */}
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Sampai Dengan</label>
                        <button
                          onClick={() => setActivePicker(activePicker === 'end' ? null : 'end')}
                          className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium transition-all ${activePicker === 'end' ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-gray-200'}`}
                        >
                          <span className={dateRange.end ? 'text-gray-900' : 'text-gray-400'}>
                            {dateRange.end ? formatDateDisplay(dateRange.end) : 'Pilih Tanggal'}
                          </span>
                          <Calendar className={`w-4 h-4 text-gray-400 ${activePicker === 'end' ? 'text-teal-500' : ''}`} />
                        </button>
                      </div>

                      {/* Shared Interactive Calendar Picker */}
                      {activePicker && (
                        <div className="pt-2 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{monthNames[viewMonth]}</span>
                              <div className="relative">
                                <button
                                  onClick={() => setShowYearDropdown(!showYearDropdown)}
                                  className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-teal-600 transition-colors"
                                >
                                  {viewYear} <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showYearDropdown && (
                                  <>
                                    <div className="fixed inset-0 z-[25]" onClick={() => setShowYearDropdown(false)}></div>
                                    <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-[30] max-h-[160px] overflow-y-auto scrollbar-hide">
                                      {Array.from({ length: 11 }, (_, i) => 2026 - i).map(year => (
                                        <button
                                          key={year}
                                          onClick={() => { setViewYear(year); setShowYearDropdown(false); }}
                                          className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${viewYear === year ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
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
                              <button onClick={() => changeMonth('prev')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
                              <button onClick={() => changeMonth('next')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
                            </div>
                          </div>

                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                              <span key={d} className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-wider">{d}</span>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((d, i) => {
                              const isSelected = (activePicker === 'start' ? dateRange.start : dateRange.end) === `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
                              return (
                                <button
                                  key={i}
                                  onClick={() => handleSelectDate(d)}
                                  className={`h-9 w-full flex items-center justify-center rounded-lg text-xs transition-all
                                        ${!d.current ? 'text-gray-300' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'}
                                        ${isSelected ? 'bg-teal-500 text-white font-bold' : ''}
                                      `}
                                >
                                  {d.day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => { setDateRange({ start: '', end: '' }); setCurrentPage(1); setShowDateDropdown(false); setActivePicker(null); }}
                          className="flex-1 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Reset All
                        </button>
                        <button
                          onClick={() => { setShowDateDropdown(false); setActivePicker(null); }}
                          className="flex-1 py-2 bg-[#235C50] text-white rounded-lg text-xs font-bold hover:bg-teal-900 transition-all shadow-md"
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <button
                onClick={handleExportPDF}
                className="flex lg:hidden items-center justify-center px-3 sm:px-4 py-2.5 bg-[#235C50] text-white rounded-xl hover:bg-teal-900 transition-all shadow-sm active:scale-95 shrink-0"
            >
                <Download className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportPDF}
            className="hidden lg:flex items-center gap-2 px-6 py-2.5 bg-[#235C50] text-white rounded-xl font-bold text-sm hover:bg-teal-900 transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        <style>{`
          .custom-scrollbar-x::-webkit-scrollbar { height: 8px; }
          .custom-scrollbar-x::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
          .custom-scrollbar-x::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
          .custom-scrollbar-x::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}</style>

        {/* TABLE AREA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="hidden md:block w-full overflow-x-auto pb-4 custom-scrollbar-x">
            <table className="w-full text-left text-[14px] text-gray-700 table-auto min-w-max">
              <thead className="bg-white border-b border-gray-200 text-gray-500 select-none">
                <tr>
                  <th onClick={() => requestSort('id')} className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-1.5">ID Tiket {getSortIcon('id')}</div>
                  </th>
                  <th onClick={() => requestSort('finishedDate')} className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-1.5">Dibuat {getSortIcon('finishedDate')}</div>
                  </th>
                  <th onClick={() => requestSort('client')} className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-1.5">Pelanggan {getSortIcon('client')}</div>
                  </th>
                  <th onClick={() => requestSort('location')} className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-1.5">Lokasi {getSortIcon('location')}</div>
                  </th>
                  <th className="px-3 md:px-4 lg:px-6 py-4 font-normal whitespace-nowrap max-w-[400px]">
                    Topik Kendala
                  </th>
                  <th onClick={() => requestSort('duration')} className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-1.5">Durasi {getSortIcon('duration')}</div>
                  </th>
                  <th onClick={() => requestSort('stars')} className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-1.5">Rating {getSortIcon('stars')}</div>
                  </th>
                  <th className="px-3 md:px-4 lg:px-6 py-4 w-[120px] font-normal whitespace-nowrap text-center text-xs uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="px-3 md:px-4 lg:px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-gray-100 border-t-teal-500 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-gray-400">Memuat riwayat...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-3 md:px-4 lg:px-6 py-4 font-bold text-gray-900 tracking-tight whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="px-3 md:px-4 lg:px-6 py-4 text-gray-500 whitespace-nowrap">
                      {item.finishedDate}
                    </td>
                    <td className="px-3 md:px-4 lg:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {item.client}
                    </td>
                    <td className="px-3 md:px-4 lg:px-6 py-4 text-gray-500 whitespace-nowrap">
                      {item.location}
                    </td>
                    <td className="px-3 md:px-4 lg:px-6 py-4 text-gray-600 truncate max-w-[400px]" title={item.topic}>
                      {item.topic}
                    </td>
                    <td className="px-3 md:px-4 lg:px-6 py-4 text-gray-500 whitespace-nowrap">
                      {item.duration}
                    </td>
                    <td className="px-3 md:px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{item.rating.stars}/5</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 lg:px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTicket(item)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EDF5F1] text-[#235C50] border border-[#235C50]/10 rounded-lg text-xs font-bold hover:bg-[#235C50] hover:text-white transition-all active:scale-95"
                      >
                        Detail <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-3 md:px-4 lg:px-6 py-20 text-center text-gray-400 italic">
                      Tidak ada riwayat perbaikan yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-gray-100 pb-2">
            {isLoading ? (
              <div className="p-10 text-center">
                <div className="w-8 h-8 border-4 border-gray-100 border-t-teal-500 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-bold text-gray-400">Memuat riwayat...</p>
              </div>
            ) : paginatedData.map((item) => (
              <div key={item.id} className="p-5 active:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">{item.id}</span>
                  <span className="text-[11px] text-gray-400 font-bold">{item.finishedDate}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{item.client}</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-3">
                  <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{item.location}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">{item.topic}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-bold text-gray-500">
                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-600" /> <span className="truncate max-w-[80px] sm:max-w-none">{item.duration}</span></div>
                    <div className="flex items-center gap-1 text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-400" /> {item.rating.stars}/5</div>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0D9488] text-white rounded-lg text-xs font-bold hover:bg-[#0F766E] shadow-sm shadow-teal-500/20 active:scale-95 transition-all shrink-0"
                  >
                    Detail <ChevronRight className="w-3.5 h-3.5 hidden min-[360px]:block" />
                  </button>
                </div>
              </div>
            ))}
            {paginatedData.length === 0 && (
              <div className="p-10 text-center text-gray-400 font-medium text-sm">
                Tidak ada riwayat perbaikan yang ditemukan.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-row items-center justify-between text-sm text-gray-500 pt-4 p-6 border-t border-gray-100 gap-2 sm:gap-4 bg-[#FBFDFB]/50">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 font-medium">
              <span className="hidden sm:inline">Rows per page:</span>
              <div className="relative">
                <button
                  onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all shadow-sm"
                >
                  {rowsPerPage} <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showRowsDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowRowsDropdown(false)}></div>
                    <div className="absolute bottom-full left-0 mb-2 w-16 sm:w-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20 animate-in fade-in slide-in-from-bottom-2">
                      {[5, 10, 20].map(val => (
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

            <div className="text-xs sm:text-sm font-medium text-gray-600">
              {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || totalItems === 0}
                className="p-1.5 sm:px-4 sm:py-2 bg-white border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <span className="hidden sm:inline">Previous</span>
                <ChevronLeft className="w-4 h-4 sm:hidden" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalItems === 0}
                className="p-1.5 sm:px-4 sm:py-2 bg-white border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 sm:hidden" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: DETAIL PENGADUAN (Shared Component) */}
      <ComplaintDetailModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        role="technician"
        renderActions={
          <div className="bg-emerald-50 rounded-2xl p-6 shadow-sm border border-emerald-100 border-dashed text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-emerald-900 text-sm mb-1">Riwayat Selesai</p>
            <p className="text-xs text-emerald-700 leading-relaxed px-2">Tiket ini telah diselesaikan dan dikonfirmasi oleh pelanggan.</p>
            <button
              onClick={() => handleExportSingleDetailPDF(selectedTicket)}
              className="mt-4 w-full py-3 bg-white border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs hover:bg-emerald-50 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Ekspor Riwayat (PDF)
            </button>
          </div>
        }
      />
    </div>
  );
}
