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
import { useTranslation } from 'react-i18next';

// Helper function to calculate duration between ticket creation and completion
const calculateDuration = (start, end, t) => {
  if (!start || !end) return '-';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate - startDate;
  if (diffMs < 0) return `0 ${t ? t('time.minutes', 'Menit') : 'Menit'}`;

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const remainingHours = diffHours % 24;
  const remainingMins = diffMins % 60;

  let result = '';
  const hari = t ? t('time.days', 'Hari') : 'Hari';
  const jam = t ? t('time.hours', 'Jam') : 'Jam';
  const menit = t ? t('time.minutes', 'Menit') : 'Menit';

  if (diffDays > 0) result += `${diffDays} ${hari} `;
  if (remainingHours > 0) result += `${remainingHours} ${jam} `;
  if (remainingMins > 0 || result === '') result += `${remainingMins} ${menit}`;

  return result.trim();
};

export const getLocalizedTopic = (topic, t) => {
  if (!topic || !t) return topic || '-';
  const tLower = topic.toLowerCase();
  if (tLower.includes('tidak merespon') || tLower.includes('not responding')) return t('dashboard.issue_not_responding', topic);
  if (tLower.includes('tidak akurat') || tLower.includes('inaccurate')) return t('dashboard.issue_inaccurate', topic);
  if (tLower.includes('koneksi terputus') || tLower.includes('disconnected')) return t('dashboard.issue_disconnected', topic);
  if (tLower.includes('kerusakan fisik') || tLower.includes('physical damage')) return t('dashboard.issue_physical_damage', topic);
  if (tLower.includes('error response')) return t('dashboard.issue_error_response', topic);
  return topic;
};

export function RiwayatPerbaikanPage() {
  const { t, i18n } = useTranslation();
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

  const monthNames = [
    t('dashboard.month_jan'), t('dashboard.month_feb'), t('dashboard.month_mar'), t('dashboard.month_apr'),
    t('dashboard.month_may'), t('dashboard.month_jun'), t('dashboard.month_jul'), t('dashboard.month_aug'),
    t('dashboard.month_sep'), t('dashboard.month_oct'), t('dashboard.month_nov'), t('dashboard.month_dec')
  ];

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
        const response = await fetch(import.meta.env.VITE_API_URL + '/api/complaints/technician?isHistory=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.data || [];

          // Filter 'selesai' and 'ditolak' statuses
          const historyData = data
            .filter(item => ['selesai', 'ditolak'].includes(item.status?.toLowerCase()))
            .map(item => {
              const safeId = item._id ? item._id.toString() : '';
              return {
                ...item,
                originalId: safeId,
                id: `TCK-${safeId.substring(Math.max(0, safeId.length - 6)).toUpperCase()}`,
                date: new Date(item.createdAt).toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
                finishedDate: (() => {
                  const formatted = new Date(item.completedAt || item.updatedAt).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                  return i18n.language === 'id' ? formatted.replace(/\./g, ':') : formatted;
                })(),
                client: item.homeowner?.fullName || 'Pelanggan Bieon',
                location: item.homeowner?.address || '-',
                duration: calculateDuration(item.createdAt, item.completedAt || item.updatedAt, t),
                rating: {
                  stars: item.rating?.stars || 0,
                  review: item.rating?.note || "Tidak ada ulasan."
                },
                category: item.category || 'Umum',
                device: item.device || 'Perangkat Bieon',
                topic: getLocalizedTopic(item.topic, t)
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
  }, [t]);

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
    doc.setTextColor(5, 155, 39); // #059b27 (BIEON Eco)
    doc.text(t('export.history_tech_title', 'Riwayat Aktivitas Teknisi'), 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`${t('export.printed_at', 'Dicetak pada')}: ${(() => {
      const formatted = new Date().toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US');
      return i18n.language === 'id' ? formatted.replace(/\./g, ':') : formatted;
    })()}`, 14, 30);

    // Columns matching the UI table order
    const tableColumn = [
      t('export.col_ticket_id', 'ID Tiket'),
      t('export.col_created', 'Dibuat'),
      t('export.col_customer', 'Pelanggan'),
      t('export.col_location', 'Lokasi'),
      t('export.col_topic', 'Topik Kendala'),
      t('export.col_duration', 'Durasi'),
      t('export.col_rating', 'Rating')
    ];
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
      headStyles: { fillColor: [5, 155, 39], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 247] }
    });

    doc.save(`BIEON_Riwayat_Teknisi_${new Date().getTime()}.pdf`);
  };

  // Helper Parser: Map string database log progres ke i18n
  const getLocalizedTimelineDesc = (desc) => {
    if (!desc) return '';

    // Clean up potentially messy strings
    const cleaned = desc.trim();

    // Basic Patterns (Synchronized with Backend & Admin)
    if (cleaned.includes('Laporan pengaduan berhasil dibuat') || cleaned.includes('Complaint report successfully created')) {
      return t('complaint.timeline_events.created', 'Laporan pengaduan berhasil dibuat. Menunggu penugasan teknisi.');
    }
    if (cleaned.includes('Tiket dialihkan dari') || cleaned.includes('Ticket reassigned from')) {
      const match = cleaned.match(/(?:dari|from)\s+(.*?)\s+(?:ke|to)\s+(.*?)\s+(?:karena|due to)/i);
      const oldTech = match ? match[1].trim() : '-';
      const newTech = match ? match[2].trim() : '-';
      return t('complaint.timeline_events.reassigned_from_to', 'Tiket dialihkan dari {{oldTech}} ke {{newTech}} karena melewati batas waktu.', { oldTech, newTech });
    }
    if (cleaned.includes('Tiket telah ditugaskan ke teknisi') || cleaned.includes('Ticket has been assigned to technician')) {
      const match = cleaned.match(/(?:teknisi|technician):\s*(.*?)\.\s*(?:Menunggu|Waiting)/i);
      const techName = match ? match[1].trim() : cleaned.split(':')[1]?.split('.')[0]?.trim() || '-';
      return t('complaint.timeline_events.assigned', 'Tiket telah ditugaskan ke teknisi: {{tech}}. Menunggu respon teknisi.', { tech: techName });
    }
    if (cleaned.includes('Teknisi mulai memproses pengaduan') || cleaned.includes('Technician started processing')) {
      return t('complaint.timeline_events.process_started', 'Teknisi mulai memproses pengaduan.');
    }

    // Progress options from Technician dropdown
    if (cleaned.startsWith('Sedang Menuju Lokasi') || cleaned.startsWith('On the way to location')) {
      const notes = cleaned.replace(/Sedang Menuju Lokasi|On the way to location/gi, '').trim();
      return t('complaint.timeline_events.prog_heading_location', 'Sedang Menuju Lokasi{{notes}}', { notes: notes ? ` ${notes}` : '' });
    }
    if (cleaned.startsWith('Mendiagnosa Masalah') || cleaned.startsWith('Diagnosing problem')) {
      const notes = cleaned.replace(/Mendiagnosa Masalah|Diagnosing problem/gi, '').trim();
      return t('complaint.timeline_events.prog_diagnosing', 'Mendiagnosa Masalah{{notes}}', { notes: notes ? ` ${notes}` : '' });
    }
    if (cleaned.startsWith('Menunggu Suku Cadang') || cleaned.startsWith('Waiting for spare parts')) {
      const notes = cleaned.replace(/Menunggu Suku Cadang|Waiting for spare parts/gi, '').trim();
      return t('complaint.timeline_events.prog_waiting_parts', 'Menunggu Suku Cadang{{notes}}', { notes: notes ? ` ${notes}` : '' });
    }
    if (cleaned.startsWith('Proses Perbaikan') || cleaned.startsWith('Repair in progress')) {
      const notes = cleaned.replace(/Proses Perbaikan|Repair in progress/gi, '').trim();
      return t('complaint.timeline_events.prog_repairing', 'Proses Perbaikan{{notes}}', { notes: notes ? ` ${notes}` : '' });
    }

    // Log Access
    if (cleaned.includes('Teknisi meminta akses data log') || cleaned.includes('Technician requested log data access')) {
      const reasonMatch = cleaned.match(/(?:Alasan|Reason):\s*(.*)/i);
      const reason = reasonMatch ? reasonMatch[1].trim() : '';
      return t('complaint.timeline_events.log_requested', 'Teknisi meminta akses data log perangkat.{{reason}}', { reason: reason ? ` Alasan: ${reason}` : '' });
    }
    if (cleaned.includes('SuperAdmin memberikan izin akses data log') || cleaned.includes('SuperAdmin granted log data access')) {
      return t('complaint.timeline_events.log_approved', 'SuperAdmin memberikan izin akses data log perangkat.');
    }
    if (cleaned.includes('SuperAdmin menolak akses data log') || cleaned.includes('SuperAdmin denied log data access')) {
      return t('complaint.timeline_events.log_rejected', 'SuperAdmin menolak akses data log perangkat.');
    }

    // PING
    if (cleaned.includes('SuperAdmin mengirimkan PING') || cleaned.includes('SuperAdmin sent a PING')) {
      const matchCount = cleaned.match(/(?:Teguran ke-|Warning #)(\d+)/i);
      const count = matchCount ? matchCount[1] : '1';
      const matchUrg = cleaned.match(/(?:menjadi|to):\s*(.*)/i);
      const urgency = matchUrg ? matchUrg[1].replace(/\.$/, '').trim() : 'MEDIUM';
      return t('complaint.timeline_events.ping_sent', 'SuperAdmin mengirimkan PING (Teguran ke-{{count}}). Urgensi ditingkatkan menjadi: {{urgency}}.', { count, urgency });
    }

    // Completing & Rejection
    if (cleaned.includes('Teknisi menyatakan perbaikan selesai') || cleaned.includes('Technician declared repair complete')) {
      return t('complaint.timeline_events.tech_completed', 'Teknisi menyatakan perbaikan selesai.');
    }
    if (cleaned.includes('Homeowner telah mengonfirmasi tiket selesai') || cleaned.includes('Customer confirmed ticket completion')) {
      const ratingMatch = cleaned.match(/\(Rating:\s*(\d+)(?:&|\*)?\)/i);
      const ratingScore = ratingMatch ? ratingMatch[1] : '';
      const ratingStr = ratingScore ? ` (Rating: ${ratingScore}*)` : '';
      return t('complaint.timeline_events.homeowner_confirmed', 'Homeowner telah mengonfirmasi tiket selesai{{rating}}.', { rating: ratingStr });
    }
    if (cleaned.includes('Tiket ditolak oleh SuperAdmin') || cleaned.includes('Ticket rejected by SuperAdmin')) {
      return t('complaint.timeline_events.rejected', 'Tiket ditolak oleh SuperAdmin.');
    }

    // Overdues
    if (cleaned.includes('Batas waktu respon terlampaui') || cleaned.includes('Response deadline exceeded')) {
      return t('complaint.timeline_events.response_overdue', 'Batas waktu respon terlampaui (30 menit). Status otomatis berubah menjadi Overdue Respons.');
    }
    if (cleaned.includes('Batas waktu perbaikan terlampaui') || cleaned.includes('Repair deadline exceeded')) {
      return t('complaint.timeline_events.repair_overdue', 'Batas waktu perbaikan terlampaui (56 jam). Status otomatis berubah menjadi Overdue Perbaikan.');
    }

    // Fallback status/note matching
    if (cleaned.includes('Status diperbarui menjadi') || cleaned.includes('Status updated to')) {
      const statusStr = cleaned.split(/(?:menjadi|to)\s+/i)[1]?.replace(/\.$/, '').trim() || '';
      return t('complaint.timeline_events.status_updated_to', 'Status diperbarui menjadi {{status}}.', { status: statusStr });
    }

    return cleaned;
  };

  // Export Detail Single Ticket (PDF)
  const handleExportSingleDetailPDF = (ticket) => {
    if (!ticket) return;
    const doc = new jsPDF('portrait');
    const primaryColor = [5, 155, 39]; // BIEON Teal

    // Header & Logo Branding
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(t('export.header_title', 'LAPORAN DETAIL PERBAIKAN'), 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`${t('complaint.detail_box.ticket_id', 'ID Tiket').toUpperCase()}: ${ticket.id.replace('+P', '')}`, 105, 30, { align: 'center' });

    // Section 1: Informasi Dasar
    doc.setTextColor(40);
    doc.setFontSize(14);
    doc.text(t('export.section_info', 'INFORMASI PENGADUAN'), 14, 55);
    doc.setLineWidth(0.5);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(14, 58, 65, 58);

    doc.setFontSize(10);
    const infoData = [
      [t('export.row_customer_name', 'Nama Pelanggan'), `: ${ticket.client}`],
      [t('export.row_address', 'Alamat'), `: ${ticket.location}`],
      [t('export.row_topic', 'Topik Kendala'), `: ${ticket.topic}`],
      [t('export.row_category', 'Kategori'), `: ${ticket.category}`],
      [t('export.row_tech_rating', 'Rating Layanan'), `: ${ticket.rating?.stars !== '-' ? ticket.rating.stars + '/5' : t('export.val_no_rating', 'Belum dinilai')}`],
      [t('export.row_desc', 'Deskripsi Masalah'), `: ${ticket.desc || ticket.description || '-'}`],
      [t('export.row_created_at', 'Waktu Dibuat'), `: ${ticket.date}`],
      [t('export.row_completed_at', 'Waktu Selesai'), `: ${ticket.finishedDate || '-'}`],
      [t('export.row_duration', 'Durasi Pengerjaan'), `: ${ticket.duration || '-'}`]
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
    doc.text(t('export.section_sla', 'SLA PERFORMANCE'), 14, currentY);
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
    let overallStatus = t('export.perf_needs_improvement', 'NEEDS IMPROVEMENT');
    if (totalPts >= 100) overallStatus = t('export.perf_excellent', 'EXCELLENT');
    else if (totalPts >= 50) overallStatus = t('export.perf_good', 'GOOD');

    const statusOverdue = t('export.status_overdue', 'OVERDUE');
    const statusOntime = t('export.status_ontime', 'SESUAI SLA');

    const targetResponseVal = i18n.language === 'id' ? '15 Menit' : '15 Minutes';
    const targetRepairVal = i18n.language === 'id' ? '48 Jam' : '48 Hours';

    const slaData = [
      [t('export.sla_response', 'Respon Teknisi'), targetResponseVal, responseTime, (responseTime !== '-' && (responseTime.includes('Hari') || responseTime.includes('Days') || parseInt(responseTime.split(':')[0]) > 0 || parseInt(responseTime.split(':')[1]) > 15)) ? statusOverdue : statusOntime],
      [t('export.sla_repair', 'Perbaikan Unit'), targetRepairVal, repairTime, (repairTime !== '-' && (repairTime.includes('Hari') || repairTime.includes('Days') || parseInt(repairTime.split(':')[0]) >= 48)) ? statusOverdue : statusOntime]
    ];

    autoTable(doc, {
      startY: currentY + 8,
      head: [[t('export.col_sla_aspect', 'Aspek SLA'), t('export.col_target', 'Target'), t('export.col_achieved', 'Capaian'), t('export.col_status', 'Status')]],
      body: slaData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
      columnStyles: { 3: { fontStyle: 'bold' } },
      margin: { bottom: 25 },
      didParseCell: (data) => {
        if (data.column.index === 3 && data.cell.section === 'body') {
          if (data.cell.text[0] === statusOverdue) data.cell.styles.textColor = [220, 38, 38];
          if (data.cell.text[0] === statusOntime) data.cell.styles.textColor = [16, 185, 129];
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
    doc.text(t('export.overall_perf', 'OVERALL PERFORMANCE STATUS: {{status}}', { status: overallStatus }), 105, currentY + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);

    // Section 3: Riwayat Progres Pengaduan
    currentY = currentY + 28;
    doc.setFontSize(14);
    doc.text(t('export.section_timeline', 'RIWAYAT PROGRES PENGADUAN'), 14, currentY);
    doc.line(14, currentY + 3, 85, currentY + 3);

    const timelineData = timeline.length > 0 ? timeline.map(t => [
      t.time || '-',
      (t.status || 'UPDATE').toUpperCase(),
      getLocalizedTimelineDesc(t.desc || t.note || t.notes || '-')
    ]) : [['-', t('export.val_no_data_progress', 'TIDAK ADA DATA PROGRES'), '-']];

    autoTable(doc, {
      startY: currentY + 8,
      head: [[t('export.col_date_time', 'Tanggal & Waktu'), t('export.col_activity', 'Aktivitas'), t('export.col_notes', 'Catatan/Keterangan')]],
      body: timelineData,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle'
      },
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 40, fontStyle: 'bold' },
        2: { cellWidth: 'auto' }
      },
      margin: { bottom: 25, left: 14, right: 14 }
    });

    // Footer & Page Numbers (Adopted from SA)
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Separator Line
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.line(14, 282, 196, 282);

      doc.setFontSize(7);
      doc.setTextColor(180);
      doc.text(t('export.auto_generated_note', 'Dokumen ini dihasilkan secara otomatis oleh Sistem Monitoring BIEON Smart Green Living.'), 105, 287, { align: 'center' });
      doc.text(t('export.page_indicator', 'Halaman {{current}} dari {{total}}', { current: i, total: pageCount }), 105, 292, { align: 'center' });
    }

    doc.save(`BIEON_Detail_Teknisi_${ticket.id.replace('+P', '')}.pdf`);
  };

  // getStatusBadge replaced by shared TicketStatusBadge component

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans">
      <div className="max-w-[1900px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 w-full mb-6">
          {/* Judul */}
          <div>
            <h1 className="text-3xl font-bold text-green-900">{t('history.title', 'Riwayat Aktivitas')}</h1>
            <p className="text-gray-500 mt-1">{t('history.subtitle', 'Pantau log, aktivitas, dan riwayat perbaikan pelanggan')}</p>
          </div>

          <div className="flex flex-row items-center justify-between gap-2 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0 md:w-[250px] md:shrink-0 group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sense/500 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder={t('table.search_placeholder', 'Cari tiket...')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-sense/100 focus:ring-4 focus:ring-sense/20 bg-white transition-all shadow-sm"
              />
            </div>

            {/* Kategori Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={`flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border rounded-xl text-[13px] font-medium transition-all shadow-sm group ${showCategoryDropdown ? 'border-sense/100 ring-4 ring-sense/20' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <Filter className={`w-4 h-4 pointer-events-none transition-colors ${selectedCategory !== 'Semua Kategori' ? 'text-sense/500' : 'text-gray-400'}`} />
                <span className={`hidden sm:inline ml-1 ${selectedCategory !== 'Semua Kategori' ? 'text-gray-900' : 'text-gray-500'}`}>
                  {selectedCategory === 'Semua Kategori' ? t('history.filters.category', 'Kategori') : selectedCategory}
                </span>
                <ChevronDown className={`hidden sm:block w-4 h-4 pointer-events-none text-gray-400 transition-all ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showCategoryDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)}></div>
                  <div className="fixed sm:absolute top-[180px] sm:top-full left-4 right-4 sm:left-auto sm:right-0 mt-0 sm:mt-2 w-auto sm:w-[280px] bg-white border border-gray-100 sm:border-0 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-top-2 max-h-[60vh] sm:max-h-none overflow-y-auto custom-scrollbar-y">
                    {['', 'Sensor', 'Control Actuator System', 'Lainnya'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat === '' ? 'Semua Kategori' : cat); setShowCategoryDropdown(false); setCurrentPage(1); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedCategory === (cat === '' ? 'Semua Kategori' : cat) ? 'text-sense bg-sense/5 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {cat ? t(`complaint.category_${cat.toLowerCase().replace(/\s+/g, '_')}`, cat) : t('history.all_categories', 'Semua Kategori')}
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
                className={`flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border rounded-xl text-[13px] font-medium transition-all shadow-sm group ${showDateDropdown || dateRange.start || dateRange.end ? 'border-sense/100 ring-4 ring-sense/20' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                <Calendar className={`w-4 h-4 pointer-events-none transition-colors ${dateRange.start || dateRange.end ? 'text-sense/500' : 'text-gray-400'}`} />
                <span className={`hidden sm:inline ml-1 ${dateRange.start || dateRange.end ? 'text-gray-900' : 'text-gray-500'}`}>
                  {dateRange.start || dateRange.end ? `${formatDateDisplay(dateRange.start)} - ${formatDateDisplay(dateRange.end)}` : t('history.filters.date_range', 'Rentang Tanggal')}
                </span>
                <ChevronDown className={`hidden sm:block w-4 h-4 pointer-events-none text-gray-400 transition-all ${showDateDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDateDropdown && (
                <>
                  <div className="fixed inset-0 z-[15]" onClick={() => { setShowDateDropdown(false); setActivePicker(null); }}></div>
                  <div className="fixed sm:absolute top-[180px] sm:top-full left-4 right-4 sm:left-auto sm:right-0 mt-0 sm:mt-2 w-auto sm:w-[320px] bg-white border border-gray-100 sm:border-0 rounded-2xl shadow-2xl p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-top-2 max-h-[70vh] sm:max-h-none overflow-y-auto custom-scrollbar-y">
                    <div className="space-y-5">
                      {/* Input Trigger Start */}
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">{t('history.filters.from_date')}</label>
                        <button
                          onClick={() => setActivePicker(activePicker === 'start' ? null : 'start')}
                          className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium transition-all ${activePicker === 'start' ? 'border-sense/100 ring-4 ring-sense/20' : 'border-gray-200'}`}
                        >
                          <span className={dateRange.start ? 'text-gray-900' : 'text-gray-400'}>
                            {dateRange.start ? formatDateDisplay(dateRange.start) : t('history.select_date', 'Pilih Tanggal')}
                          </span>
                          <Calendar className={`w-4 h-4 text-gray-400 ${activePicker === 'start' ? 'text-sense/500' : ''}`} />
                        </button>
                      </div>

                      {/* Input Trigger End */}
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">{t('history.filters.to_date')}</label>
                        <button
                          onClick={() => setActivePicker(activePicker === 'end' ? null : 'end')}
                          className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium transition-all ${activePicker === 'end' ? 'border-sense/100 ring-4 ring-sense/20' : 'border-gray-200'}`}
                        >
                          <span className={dateRange.end ? 'text-gray-900' : 'text-gray-400'}>
                            {dateRange.end ? formatDateDisplay(dateRange.end) : t('history.select_date', 'Pilih Tanggal')}
                          </span>
                          <Calendar className={`w-4 h-4 text-gray-400 ${activePicker === 'end' ? 'text-sense/500' : ''}`} />
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
                                  className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-sense transition-colors"
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
                                          className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${viewYear === year ? 'text-sense bg-sense/5 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
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
                            {['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'].map(d => (
                              <span key={d} className="text-[9px] font-black text-gray-300 text-center uppercase tracking-widest">
                                {t(`calendar.days.${d}`)}
                              </span>
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
                                        ${!d.current ? 'text-gray-300' : 'text-gray-700 hover:bg-sense/5 hover:text-sense'}
                                        ${isSelected ? 'bg-sense/50 text-white font-bold' : ''}
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
                          {t('history.filters.reset_all')}
                        </button>
                        <button
                          onClick={() => { setShowDateDropdown(false); setActivePicker(null); }}
                          className="flex-1 py-2 bg-eco text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all shadow-md"
                        >
                          {t('history.filters.apply')}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleExportPDF}
              className="flex lg:hidden items-center justify-center px-3 sm:px-4 py-2.5 bg-eco text-white rounded-xl hover:bg-green-700 transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportPDF}
              className="hidden lg:flex items-center gap-2 px-6 py-2.5 bg-eco text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Download className="w-4 h-4" /> {t('table.export', 'Export')}
            </button>
          </div>
        </div>

        <style>{`
          .custom-scrollbar-x::-webkit-scrollbar { height: 8px; }
          .custom-scrollbar-x::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
          .custom-scrollbar-x::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
          .custom-scrollbar-x::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          .custom-scrollbar-y::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar-y::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 6px; }
          .custom-scrollbar-y::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
          .custom-scrollbar-y::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}</style>

        {/* TABLE AREA */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-0 overflow-hidden">
          <div className="hidden md:block w-full overflow-x-auto pb-4 custom-scrollbar-x">
            <table className="w-full text-left text-[14px] text-gray-700 table-auto min-w-max">
              <thead className="bg-white border-b border-gray-200 text-gray-500 select-none">
                <tr>
                  <th onClick={() => requestSort('id')} className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-1.5">{t('complaint.table_col.ticket_id', 'ID Tiket')} {getSortIcon('id')}</div>
                  </th>
                  <th onClick={() => requestSort('finishedDate')} className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-1.5">{t('complaint.table_col.date', 'Tanggal')} {getSortIcon('finishedDate')}</div>
                  </th>
                  <th onClick={() => requestSort('client')} className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-1.5">{t('complaint.table_col.customer', 'Pelanggan')} {getSortIcon('client')}</div>
                  </th>
                  <th onClick={() => requestSort('location')} className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-1.5">{t('complaint.table_col.location', 'Lokasi')} {getSortIcon('location')}</div>
                  </th>
                  <th className="px-3 md:px-4 lg:px-6 py-4 font-normal whitespace-nowrap max-w-[400px]">
                    {t('complaint.table_col.topic', 'Topik Kendala')}
                  </th>
                  <th onClick={() => requestSort('duration')} className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-1.5">{t('complaint.table_col.duration', 'Durasi')} {getSortIcon('duration')}</div>
                  </th>
                  <th onClick={() => requestSort('stars')} className="px-3 md:px-4 lg:px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <div className="flex items-center gap-1.5">{t('complaint.table_col.rating', 'Rating')} {getSortIcon('stars')}</div>
                  </th>
                  <th className="px-3 md:px-4 lg:px-6 py-4 w-[120px] font-normal whitespace-nowrap text-center text-xs uppercase tracking-wider">{t('complaint.table_col.action', 'Aksi')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="px-3 md:px-4 lg:px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-gray-100 border-t-sense rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-gray-400">{t('notification.ui.loading', 'Memuat riwayat...')}</p>
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
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-eco/10 text-eco border border-eco/20 rounded-lg text-xs font-bold hover:bg-eco hover:text-white transition-all active:scale-95"
                      >
                        Detail <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-3 md:px-4 lg:px-6 py-20 text-center text-gray-400 italic">
                      {t('complaint.no_complaint', 'Tidak ada riwayat perbaikan yang ditemukan.')}
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
                <div className="w-8 h-8 border-4 border-gray-100 border-t-sense rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-bold text-gray-400">{t('notification.ui.loading', 'Memuat riwayat...')}</p>
              </div>
            ) : paginatedData.map((item) => (
              <div key={item.id} className="p-5 active:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-sense bg-sense/5 px-2.5 py-1 rounded-md border border-sense/20">{item.id}</span>
                  <span className="text-[11px] text-gray-400 font-bold">{item.finishedDate}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{item.client}</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-3">
                  <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{item.location}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">{item.topic}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-bold text-gray-500">
                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-sense" /> <span className="truncate max-w-[80px] sm:max-w-none">{item.duration}</span></div>
                    <div className="flex items-center gap-1 text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-400" /> {item.rating.stars}/5</div>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-sense text-white rounded-lg text-xs font-bold hover:bg-sky-700 shadow-sm shadow-sense/20 active:scale-95 transition-all shrink-0"
                  >
                    Detail <ChevronRight className="w-3.5 h-3.5 hidden min-[360px]:block" />
                  </button>
                </div>
              </div>
            ))}
            {paginatedData.length === 0 && (
              <div className="p-10 text-center text-gray-400 font-medium text-sm">
                {t('complaint.no_complaint', 'Tidak ada riwayat perbaikan yang ditemukan.')}
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-row items-center justify-between text-sm text-gray-500 pt-4 p-6 border-t border-gray-100 gap-2 sm:gap-4 bg-[#FBFDFB]/50">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 font-medium">
              <span className="hidden sm:inline">{t('table.rows_per_page', 'Baris per halaman:')}</span>
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
                          className={`w-full text-left px-4 py-1.5 text-sm transition-colors ${rowsPerPage === val ? 'text-sense bg-sense/5 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
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
              {t('table.pagination_info', '{{start}}-{{end}} dari {{total}} item', {
                start: totalItems === 0 ? 0 : startIndex + 1,
                end: Math.min(startIndex + rowsPerPage, totalItems),
                total: totalItems
              })}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || totalItems === 0}
                className="p-1.5 sm:px-4 sm:py-2 bg-white border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <span className="hidden sm:inline">{t('table.previous', 'Previous')}</span>
                <ChevronLeft className="w-4 h-4 sm:hidden" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalItems === 0}
                className="p-1.5 sm:px-4 sm:py-2 bg-white border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <span className="hidden sm:inline">{t('table.next', 'Next')}</span>
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
        isHistoryView={true}
        renderActions={
          <div className="bg-eco/5 rounded-2xl p-6 shadow-sm border border-eco/20 border-dashed text-center">
            <CheckCircle2 className="w-8 h-8 text-eco/500 mx-auto mb-3" />
            <p className="font-bold text-emerald-900 text-sm mb-1">{t('complaint.action.history.finished_title', 'Riwayat Selesai')}</p>
            <p className="text-xs text-green-700 leading-relaxed px-2">{t('complaint.action.history.finished_desc', 'Tiket ini telah diselesaikan dan dikonfirmasi oleh pelanggan.')}</p>
            <button
              onClick={() => handleExportSingleDetailPDF(selectedTicket)}
              className="mt-4 w-full py-3 bg-white border border-eco/30 text-green-700 font-bold rounded-xl text-xs hover:bg-eco/5 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> {t('complaint.action.history.export_pdf', 'Ekspor Riwayat (PDF)')}
            </button>
          </div>
        }
      />
    </div>
  );
}
