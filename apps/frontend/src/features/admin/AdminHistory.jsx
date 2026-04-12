import React, { useState, useMemo, useEffect } from 'react';
import {
    ChevronDown,
    ShieldCheck,
    ChevronRight,
    Search,
    Filter,
    Download,
    Calendar,
    Star,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    ChevronLeft,
    MessageSquare,
    CheckCircle2
} from 'lucide-react';
import { SuperAdminLayout } from './SuperAdminLayout';

export default function AdminHistory({ onNavigate }) {
    // --- Filter & Pagination States ---
    const [activeTab, setActiveTab] = useState('Kenyamanan');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('Semua Pelanggan');
    const [selectedHub, setSelectedHub] = useState('Semua Hub');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRoomFilter, setSelectedRoomFilter] = useState('');

    // --- Dropdown States ---
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showHubDropdown, setShowHubDropdown] = useState(false);
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);
    
    // --- Toast States ---
    const [toast, setToast] = useState({ show: false, message: '' });

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // --- Date Picker States (Synced with RiwayatPerbaikanPage) ---
    const [activePicker, setActivePicker] = useState(null); // 'start' | 'end' | null
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [showYearDropdown, setShowYearDropdown] = useState(false);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // --- Dummy Data ---
    const customers = ['Semua Pelanggan', 'Aisyah', 'Ahmad Fauzi', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Lestari'];
    const hubs = ['Semua Hub', 'BIEON-001', 'BIEON-002', 'BIE-10294', 'BIE-88392'];

    const tabs = [
        { id: 'Kenyamanan', full: 'Kenyamanan', short: 'Kenyamanan' },
        { id: 'Keamanan', full: 'Keamanan', short: 'Keamanan' },
        { id: 'Kualitas Air', full: 'Kualitas Air', short: 'Air' },
        { id: 'Konsumsi Energi', full: 'Konsumsi Energi', short: 'Energi' },
        { id: 'Log Perangkat', full: 'Log Perangkat', short: 'Log' },
        { id: 'Notifikasi & Alert', full: 'Notifikasi & Alert', short: 'Alert' }
    ];

    const baseComfortData = [
        { time: '26 Feb 2026, 11:30:00', room: 'R5 - Ruang Produksi', temp: 24.0, humidity: '55%', status: 'Nyaman' },
        { time: '26 Feb 2026, 11:15:00', room: 'R1 - Ruang Keluarga', temp: 25.5, humidity: '60%', status: 'Nyaman' },
        { time: '26 Feb 2026, 11:00:00', room: 'R2 - Kamar Tidur', temp: 23.0, humidity: '50%', status: 'Nyaman' },
        { time: '26 Feb 2026, 10:45:00', room: 'R5 - Ruang Produksi', temp: 24.5, humidity: '58%', status: 'Nyaman' },
        { time: '26 Feb 2026, 10:30:00', room: 'R5 - Ruang Produksi', temp: 24.0, humidity: '55%', status: 'Nyaman' },
        { time: '26 Feb 2026, 10:15:00', room: 'R1 - Ruang Keluarga', temp: 26.0, humidity: '65%', status: 'Tidak Nyaman' },
        { time: '26 Feb 2026, 10:00:00', room: 'R5 - Ruang Produksi', temp: 27.5, humidity: '55%', status: 'Nyaman' },
        { time: '26 Feb 2026, 09:45:00', room: 'R3 - Dapur', temp: 30.5, humidity: '70%', status: 'Tidak Nyaman' },
        { time: '26 Feb 2026, 09:30:00', room: 'R5 - Ruang Produksi', temp: 31.5, humidity: '65%', status: 'Tidak Nyaman' },
        { time: '26 Feb 2026, 09:15:00', room: 'R2 - Kamar Tidur', temp: 24.0, humidity: '55%', status: 'Nyaman' },
        { time: '26 Feb 2026, 09:00:00', room: 'R5 - Ruang Produksi', temp: 28.5, humidity: '58%', status: 'Nyaman' },
        { time: '26 Feb 2026, 08:45:00', room: 'R4 - Garasi', temp: 32.0, humidity: '75%', status: 'Tidak Nyaman' },
        { time: '26 Feb 2026, 08:30:00', room: 'R1 - Ruang Keluarga', temp: 24.5, humidity: '55%', status: 'Nyaman' },
        { time: '26 Feb 2026, 08:15:00', room: 'R2 - Kamar Tidur', temp: 25.0, humidity: '100%+', status: 'Out of Range' },
    ];

    const comfortHistoryData = [
        ...baseComfortData.map((d, i) => ({ ...d, id: i + 1 })),
        ...baseComfortData.map((d, i) => ({ ...d, id: i + 15, time: `25 Feb 2026, ${d.time.split(', ')[1]}` })),
        ...baseComfortData.map((d, i) => ({ ...d, id: i + 29, time: `24 Feb 2026, ${d.time.split(', ')[1]}` }))
    ];

    const baseSecurityData = [
        { time: '26 Feb 2026, 11:30:00', room: 'R5 - Ruang Produksi', door: 'Tertutup', motion: 'Tidak Ada Gerak', status: 'Aman' },
        { time: '26 Feb 2026, 11:15:00', room: 'R1 - Pintu Utama', door: 'Terbuka', motion: 'Terdeteksi Gerak', status: 'Waspada' },
        { time: '26 Feb 2026, 11:00:00', room: 'R4 - Garasi', door: 'Tertutup', motion: 'Terdeteksi Gerak', status: 'Bahaya' },
        { time: '26 Feb 2026, 10:45:00', room: 'R1 - Pintu Utama', door: 'Tertutup', motion: 'Tidak Ada Gerak', status: 'Aman' },
        { time: '26 Feb 2026, 10:30:00', room: 'R2 - Jendela Kamar', door: 'Terbuka', motion: 'Tidak Ada Gerak', status: 'Waspada' },
        { time: '26 Feb 2026, 10:15:00', room: 'R5 - Ruang Produksi', door: 'Tertutup', motion: 'Terdeteksi Gerak', status: 'Bahaya' },
        { time: '26 Feb 2026, 10:00:00', room: 'R1 - Pintu Utama', door: 'Terbuka (>10 mnt)', motion: 'Tidak Ada Gerak', status: 'Aman' },
        { time: '26 Feb 2026, 09:45:00', room: 'R3 - Dapur', door: 'Tertutup', motion: 'Terdeteksi Gerak', status: 'Aman' },
        { time: '26 Feb 2026, 09:30:00', room: 'R4 - Garasi', door: 'Tertutup', motion: 'Tidak Ada Gerak', status: 'Aman' },
        { time: '26 Feb 2026, 09:15:00', room: 'R1 - Jendela Living', door: 'Tertutup', motion: 'Tidak Ada Gerak', status: 'Waspada' },
        { time: '26 Feb 2026, 09:00:00', room: 'R1 - Pintu Utama', door: 'Terbuka', motion: 'Terdeteksi Gerak', status: 'Aman' },
        { time: '26 Feb 2026, 08:45:00', room: 'R1 - Pintu Belakang', door: 'Tertutup', motion: 'Tidak Ada Gerak', status: 'Waspada' },
        { time: '26 Feb 2026, 08:30:00', room: 'R5 - Ruang Produksi', door: 'Tertutup', motion: 'Terdeteksi Gerak', status: 'Aman' },
        { time: '26 Feb 2026, 08:15:00', room: 'R4 - Garasi', door: 'Tertutup', motion: 'Tidak Ada Gerak', status: 'Waspada' },
    ];

    const securityHistoryData = [
        ...baseSecurityData.map((d, i) => ({ ...d, id: i + 1 })),
        ...baseSecurityData.map((d, i) => ({ ...d, id: i + 15, time: `25 Feb 2026, ${d.time.split(', ')[1]}` })),
        ...baseSecurityData.map((d, i) => ({ ...d, id: i + 29, time: `24 Feb 2026, ${d.time.split(', ')[1]}` }))
    ];

    const baseWaterData = [
        { time: '26 Feb 2026, 11:30:00', device: 'Toren Air', ph: 7.2, turbidity: '2 NTU', temp: '24.0°C', tds: '150 ppm', status: 'Layak Pakai' },
        { time: '26 Feb 2026, 11:15:00', device: 'Pipa Distribusi', ph: 7.1, turbidity: '1 NTU', temp: '24.0°C', tds: '148 ppm', status: 'Layak Pakai' },
        { time: '26 Feb 2026, 11:00:00', device: 'Toren Air', ph: 7.2, turbidity: '2 NTU', temp: '24.5°C', tds: '152 ppm', status: 'Layak Pakai' },
        { time: '26 Feb 2026, 10:45:00', device: 'Toren Air', ph: 7.0, turbidity: '4 NTU', temp: '24.0°C', tds: '160 ppm', status: 'Tidak Layak' },
        { time: '26 Feb 2026, 10:30:00', device: 'Pipa Distribusi', ph: 7.1, turbidity: '2 NTU', temp: '24.5°C', tds: '155 ppm', status: 'Layak Pakai' },
        { time: '26 Feb 2026, 10:15:00', device: 'Toren Air', ph: 6.0, turbidity: '2 NTU', temp: '25.0°C', tds: '150 ppm', status: 'Tidak Layak' },
        { time: '26 Feb 2026, 10:00:00', device: 'Toren Air', ph: 6.5, turbidity: '5 NTU', temp: '25.0°C', tds: '310 ppm', status: 'Tidak Layak' },
        { time: '26 Feb 2026, 09:45:00', device: 'Pipa Distribusi', ph: 7.0, turbidity: '1 NTU', temp: '23.5°C', tds: '125 ppm', status: 'Layak Pakai' },
        { time: '26 Feb 2026, 09:30:00', device: 'Toren Air', ph: 8.8, turbidity: '2 NTU', temp: '24.0°C', tds: '160 ppm', status: 'Tidak Layak' },
        { time: '26 Feb 2026, 09:15:00', device: 'Toren Air', ph: 7.1, turbidity: '2 NTU', temp: '24.0°C', tds: '155 ppm', status: 'Layak Pakai' },
        { time: '26 Feb 2026, 09:00:00', device: 'Pipa Distribusi', ph: 7.2, turbidity: '2 NTU', temp: '24.5°C', tds: '150 ppm', status: 'Layak Pakai' },
        { time: '26 Feb 2026, 08:45:00', device: 'Toren Air', ph: 7.0, turbidity: '1 NTU', temp: '23.5°C', tds: '145 ppm', status: 'Layak Pakai' },
        { time: '26 Feb 2026, 08:30:00', device: 'Toren Air', ph: 7.2, turbidity: '2 NTU', temp: '24.0°C', tds: '145 ppm', status: 'Layak Pakai' },
        { time: '26 Feb 2026, 08:15:00', device: 'Pipa Distribusi', ph: '14+', turbidity: '2 NTU', temp: '24.0°C', tds: '145 ppm', status: 'Out of Range' },
    ];

    const waterHistoryData = [
        ...baseWaterData.map((d, i) => ({ ...d, id: i + 1 })),
        ...baseWaterData.map((d, i) => ({ ...d, id: i + 15, time: `25 Feb 2026, ${d.time.split(', ')[1]}` })),
        ...baseWaterData.map((d, i) => ({ ...d, id: i + 29, time: `24 Feb 2026, ${d.time.split(', ')[1]}` }))
    ];

    const baseEnergyData = [
        { time: '26 Feb 2026, 11:30:00', device: 'Power Meter Utama', kwh: '1455.10 kWh', voltage: '220.5 V', current: '4.0 A', power: '850 W', pf: '0.96' },
        { time: '26 Feb 2026, 11:15:00', device: 'Power Meter Utama', kwh: '1454.67 kWh', voltage: '220.5 V', current: '3.9 A', power: '845 W', pf: '0.95' },
        { time: '26 Feb 2026, 11:00:00', device: 'Power Meter Utama', kwh: '1454.25 kWh', voltage: '221.0 V', current: '2.1 A', power: '450 W', pf: '0.97' },
        { time: '26 Feb 2026, 10:45:00', device: 'Power Meter Utama', kwh: '1454.02 kWh', voltage: '220.2 V', current: '2.0 A', power: '440 W', pf: '0.96' },
        { time: '26 Feb 2026, 10:30:00', device: 'Power Meter Utama', kwh: '1453.80 kWh', voltage: '219.5 V', current: '1.9 A', power: '420 W', pf: '0.95' },
        { time: '26 Feb 2026, 10:15:00', device: 'Power Meter Utama', kwh: '1453.59 kWh', voltage: '221.1 V', current: '1.8 A', power: '390 W', pf: '0.94' },
        { time: '26 Feb 2026, 10:00:00', device: 'Power Meter Utama', kwh: '1453.39 kWh', voltage: '220.8 V', current: '1.7 A', power: '380 W', pf: '0.95' },
        { time: '26 Feb 2026, 09:45:00', device: 'Power Meter Utama', kwh: '1453.20 kWh', voltage: '221.5 V', current: '1.6 A', power: '350 W', pf: '0.93' },
        { time: '26 Feb 2026, 09:30:00', device: 'Power Meter Utama', kwh: '1453.02 kWh', voltage: '222.0 V', current: '1.4 A', power: '310 W', pf: '0.92' },
        { time: '26 Feb 2026, 09:15:00', device: 'Power Meter Utama', kwh: '1452.86 kWh', voltage: '221.8 V', current: '1.4 A', power: '300 W', pf: '0.92' },
        { time: '26 Feb 2026, 09:00:00', device: 'Power Meter Utama', kwh: '1452.71 kWh', voltage: '222.2 V', current: '1.3 A', power: '280 W', pf: '0.91' },
        { time: '26 Feb 2026, 08:45:00', device: 'Power Meter Utama', kwh: '1452.57 kWh', voltage: '222.5 V', current: '1.2 A', power: '250 W', pf: '0.90' },
        { time: '26 Feb 2026, 08:30:00', device: 'Power Meter Utama', kwh: '1452.44 kWh', voltage: '222.1 V', current: '1.1 A', power: '240 W', pf: '0.90' },
        { time: '26 Feb 2026, 08:15:00', device: 'Power Meter Utama', kwh: '1452.32 kWh', voltage: '221.9 V', current: '1.1 A', power: '230 W', pf: '0.89' },
    ];

    const energyHistoryData = [
        ...baseEnergyData.map((d, i) => ({ ...d, id: i + 1 })),
        ...baseEnergyData.map((d, i) => ({ ...d, id: i + 15, time: `25 Feb 2026, ${d.time.split(', ')[1]}` })),
        ...baseEnergyData.map((d, i) => ({ ...d, id: i + 29, time: `24 Feb 2026, ${d.time.split(', ')[1]}` }))
    ];

    const baseDeviceLogData = [
        { time: '26 Feb 2026, 11:30:00', room: 'R1 - Ruang Keluarga', actuator: 'Smart TV', status: 'OFF', trigger: 'Manual (Web)' },
        { time: '26 Feb 2026, 11:15:00', room: 'R3 - Dapur', actuator: 'Smart Plug (Kulkas)', status: 'ON', trigger: 'Jadwal Otomatis' },
        { time: '26 Feb 2026, 11:00:00', room: 'R5 - Ruang Produksi', actuator: 'Lampu Utama', status: 'OFF', trigger: 'Manual (Web)' },
        { time: '26 Feb 2026, 10:45:00', room: 'R5 - Ruang Produksi', actuator: 'Kipas Exhaust', status: 'OFF', trigger: 'Otomasi (Suhu 24°C)' },
        { time: '26 Feb 2026, 10:30:00', room: 'R2 - Kamar Tidur', actuator: 'AC Split', status: 'OFF', trigger: 'Manual (Web)' },
        { time: '26 Feb 2026, 10:15:00', room: 'Toren Air', actuator: 'Pompa Air', status: 'ON', trigger: 'Otomasi (Level Air Rendah)' },
        { time: '26 Feb 2026, 10:00:00', room: 'R3 - Dapur', actuator: 'Smart Plug (Microwave)', status: 'ON', trigger: 'Manual (Fisik)' },
        { time: '26 Feb 2026, 09:45:00', room: 'R5 - Ruang Produksi', actuator: 'Kipas Exhaust', status: 'ON', trigger: 'Otomasi (Suhu > 31°C)' },
        { time: '26 Feb 2026, 09:30:00', room: 'R4 - Garasi', actuator: 'Lampu Garasi', status: 'OFF', trigger: 'Jadwal Otomatis' },
        { time: '26 Feb 2026, 09:15:00', room: 'R4 - Teras', actuator: 'Lampu Taman', status: 'OFF', trigger: 'Sensor Cahaya' },
        { time: '26 Feb 2026, 09:00:00', room: 'R2 - Kamar Tidur', actuator: 'Lampu Kamar', status: 'ON', trigger: 'Jadwal Otomatis' },
        { time: '26 Feb 2026, 08:45:00', room: 'R5 - Ruang Produksi', actuator: 'Mesin Sterilisasi', status: 'ON', trigger: 'Manual (Web)' },
        { time: '26 Feb 2026, 08:30:00', room: 'R1 - Ruang Keluarga', actuator: 'AC Split', status: 'ON', trigger: 'Manual (Web)' },
        { time: '26 Feb 2026, 08:15:00', room: 'R3 - Dapur', actuator: 'Coffee Maker', status: 'ON', trigger: 'Jadwal Otomatis' },
    ];

    const deviceLogHistoryData = [
        ...baseDeviceLogData.map((d, i) => ({ ...d, id: i + 1 })),
        ...baseDeviceLogData.map((d, i) => ({ ...d, id: i + 15, time: `25 Feb 2026, ${d.time.split(', ')[1]}` })),
        ...baseDeviceLogData.map((d, i) => ({ ...d, id: i + 29, time: `24 Feb 2026, ${d.time.split(', ')[1]}` }))
    ];

    const baseAlertData = [
        { time: '26 Feb 2026, 11:30:00', category: 'Keamanan', room: 'R1 - Pintu Utama', status: 'Waspada', message: 'Pintu utama dibuka menggunakan akses PIN.' },
        { time: '26 Feb 2026, 11:15:00', category: 'Keamanan', room: 'R4 - Garasi', status: 'Bahaya', message: 'Terdeteksi pergerakan tidak wajar di area garasi!' },
        { time: '26 Feb 2026, 11:00:00', category: 'Suhu', room: 'R5 - Ruang Produksi', status: 'Info', message: 'Suhu stabil di 24°C. Kipas Exhaust otomatis dimatikan.' },
        { time: '26 Feb 2026, 10:45:00', category: 'Air Sanitasi', room: 'Toren Air', status: 'Bahaya', message: 'Kekeruhan air meningkat drastis (18 NTU). Status: Tidak Layak.' },
        { time: '26 Feb 2026, 10:30:00', category: 'Keamanan', room: 'R1 - Pintu Utama', status: 'Bahaya', message: 'Pintu utama dibiarkan terbuka lebih dari 10 menit!' },
        { time: '26 Feb 2026, 10:15:00', category: 'Energi', room: 'Power Meter Utama', status: 'Waspada', message: 'Beban daya melebihi 1000 W. Mendekati batas limit harian.' },
        { time: '26 Feb 2026, 10:00:00', category: 'Suhu', room: 'R5 - Ruang Produksi', status: 'Bahaya', message: 'Suhu mencapai 31.5°C! Kipas Exhaust otomatis dihidupkan.' },
        { time: '26 Feb 2026, 09:45:00', category: 'Keamanan', room: 'R1 - Pintu Utama', status: 'Waspada', message: 'Pintu utama dibuka tanpa jadwal (Akses Manual).' },
        { time: '26 Feb 2026, 09:30:00', category: 'Token PLN', room: 'Power Meter Utama', status: 'Bahaya', message: 'Peringatan: Estimasi sisa Token PLN tersisa kurang dari Rp 20.000.' },
        { time: '26 Feb 2026, 09:15:00', category: 'Gas', room: 'R3 - Dapur', status: 'Bahaya', message: 'Terdeteksi peningkatan kadar gas. Kualitas udara memburuk.' },
        { time: '26 Feb 2026, 09:00:00', category: 'Sistem', room: 'Hub Node', status: 'Info', message: 'Sistem BIEON berhasil melakukan restart harian otomatis.' },
        { time: '26 Feb 2026, 08:45:00', category: 'Keamanan', room: 'R1 - Pintu Belakang', status: 'Waspada', message: 'Pintu belakang dibuka tanpa otoritas (Akses Manual).' },
        { time: '26 Feb 2026, 08:30:00', category: 'Gas', room: 'R3 - Dapur', status: 'Info', message: 'Status detektor gas kembali normal. Tidak ada kebocoran.' },
        { time: '26 Feb 2026, 08:15:00', category: 'Air Sanitasi', room: 'Toren Air', status: 'Info', message: 'Siklus pembersihan filter air otomatis selesai.' },
    ];

    const alertHistoryData = [
        ...baseAlertData.map((d, i) => ({ ...d, id: i + 1 })),
        ...baseAlertData.map((d, i) => ({ ...d, id: i + 15, time: `25 Feb 2026, ${d.time.split(', ')[1]}` })),
        ...baseAlertData.map((d, i) => ({ ...d, id: i + 29, time: `24 Feb 2026, ${d.time.split(', ')[1]}` }))
    ];

    // --- Date Picker Logic (Restore from previous Turn) ---
    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

        const days = [];
        // Previous Month Days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: prevMonthDays - i, month: viewMonth - 1, year: viewYear, current: false });
        }
        // Current Month Days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, month: viewMonth, year: viewYear, current: true });
        }
        // Next Month Days
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, month: viewMonth + 1, year: viewYear, current: false });
        }
        return days;
    }, [viewMonth, viewYear]);

    const changeMonth = (dir) => {
        if (dir === 'next') {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
            else setViewMonth(viewMonth + 1);
        } else {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
            else setViewMonth(viewMonth - 1);
        }
    };

    const handleSelectDate = (d) => {
        if (!d.current) return;
        const dateStr = `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
        if (activePicker === 'start') setDateRange({ ...dateRange, start: dateStr });
        else setDateRange({ ...dateRange, end: dateStr });
        setActivePicker(null);
    };

    // --- Filtering & Sorting Logic ---
    const processedData = useMemo(() => {
        let sourceData = [];
        if (activeTab === 'Kenyamanan') sourceData = comfortHistoryData;
        else if (activeTab === 'Keamanan') sourceData = securityHistoryData;
        else if (activeTab === 'Kualitas Air') sourceData = waterHistoryData;
        else if (activeTab === 'Konsumsi Energi') sourceData = energyHistoryData;
        else if (activeTab === 'Log Perangkat') sourceData = deviceLogHistoryData;
        else if (activeTab === 'Notifikasi & Alert') sourceData = alertHistoryData;

        let filtered = [...sourceData];

        // Filter by Customer
        if (selectedCustomer !== 'Semua Pelanggan') {
            // In a real app, we would filter by customer ID. 
            // For now, we'll just simulate by keeping some data.
        }

        // Filter by Hub ID
        if (selectedHub !== 'Semua Hub') {
            // Simulate Hub filtering.
        }

        // Filter by Room/Device
        if (selectedRoomFilter) {
            filtered = filtered.filter(item => {
                if (['Kualitas Air', 'Konsumsi Energi'].includes(activeTab)) return item.device === selectedRoomFilter;
                return item.room === selectedRoomFilter;
            });
        }

        // Filter by Date Range
        if (dateRange.start || dateRange.end) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.time.split(', ')[0]);
                if (dateRange.start && itemDate < new Date(dateRange.start)) return false;
                if (dateRange.end && itemDate > new Date(dateRange.end)) return false;
                return true;
            });
        }

        // Filter by Search Query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(item => {
                const timeStr = item.time.toLowerCase();
                const statusStr = item.status ? item.status.toLowerCase() : '';
                const roomDeviceStr = (item.room || item.device || '').toLowerCase();

                if (activeTab === 'Kenyamanan') {
                    return timeStr.includes(q) || roomDeviceStr.includes(q) || statusStr.includes(q) ||
                        item.temp.toString().toLowerCase().includes(q) || item.humidity.toLowerCase().includes(q);
                } else if (activeTab === 'Keamanan') {
                    return timeStr.includes(q) || roomDeviceStr.includes(q) || statusStr.includes(q) ||
                        item.door.toLowerCase().includes(q) || item.motion.toLowerCase().includes(q);
                } else if (activeTab === 'Kualitas Air') {
                    return timeStr.includes(q) || roomDeviceStr.includes(q) || statusStr.includes(q) ||
                        item.ph.toString().toLowerCase().includes(q) || item.turbidity.toLowerCase().includes(q) ||
                        item.temp.toLowerCase().includes(q) || item.tds.toLowerCase().includes(q);
                } else if (activeTab === 'Konsumsi Energi') {
                    return timeStr.includes(q) || roomDeviceStr.includes(q) ||
                        item.kwh.toLowerCase().includes(q) || item.voltage.toLowerCase().includes(q) ||
                        item.current.toLowerCase().includes(q) || item.power.toLowerCase().includes(q) || item.pf.toLowerCase().includes(q);
                } else if (activeTab === 'Log Perangkat') {
                    return timeStr.includes(q) || roomDeviceStr.includes(q) || statusStr.includes(q) ||
                        item.actuator.toLowerCase().includes(q) || item.trigger.toLowerCase().includes(q);
                } else if (activeTab === 'Notifikasi & Alert') {
                    return timeStr.includes(q) || item.category.toLowerCase().includes(q) || roomDeviceStr.includes(q) ||
                        statusStr.includes(q) || item.message.toLowerCase().includes(q);
                }
                return false;
            });
        }

        // Sorting Logic
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Numeric sorting helpers
                if (sortConfig.key === 'time') {
                    aVal = new Date(a.time).getTime();
                    bVal = new Date(b.time).getTime();
                } else if (sortConfig.key === 'temp' && activeTab === 'Kenyamanan') {
                    aVal = parseFloat(aVal);
                    bVal = parseFloat(bVal);
                } else if (sortConfig.key === 'temp' && activeTab === 'Kualitas Air') {
                    aVal = parseFloat(aVal.toString().replace('°C', ''));
                    bVal = parseFloat(bVal.toString().replace('°C', ''));
                } else if (sortConfig.key === 'humidity' || sortConfig.key === 'turbidity' || sortConfig.key === 'tds' || ['kwh', 'voltage', 'current', 'power', 'pf'].includes(sortConfig.key)) {
                    aVal = parseFloat(aVal?.toString().replace(/[^0-9.]/g, '') || 0);
                    bVal = parseFloat(bVal?.toString().replace(/[^0-9.]/g, '') || 0);
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [activeTab, searchQuery, sortConfig, selectedRoomFilter, dateRange, selectedCustomer, selectedHub]);

    const availableFilters = useMemo(() => {
        if (activeTab === 'Kenyamanan') return Array.from(new Set(comfortHistoryData.map(d => d.room)));
        if (activeTab === 'Keamanan') return Array.from(new Set(securityHistoryData.map(d => d.room)));
        if (activeTab === 'Kualitas Air') return Array.from(new Set(waterHistoryData.map(d => d.device)));
        if (activeTab === 'Konsumsi Energi') return Array.from(new Set(energyHistoryData.map(d => d.device)));
        if (activeTab === 'Log Perangkat') return Array.from(new Set(deviceLogHistoryData.map(d => d.room)));
        if (activeTab === 'Notifikasi & Alert') return Array.from(new Set(alertHistoryData.map(d => d.room)));
        return [];
    }, [activeTab]);

    const totalItems = processedData.length;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = processedData.slice(startIndex, startIndex + rowsPerPage);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-gray-400" /> : <ArrowDown className="w-3.5 h-3.5 text-gray-400" />;
    };

    // --- Status Badge Component ---
    const StatusBadge = ({ status }) => {
        if (!status) return null;
        if (['Nyaman', 'Aman', 'Layak Pakai', 'ON', 'Info'].includes(status)) {
            const colors = {
                'Nyaman': 'bg-[#EAFDF3] text-[#169456]',
                'Aman': 'bg-[#EAFDF3] text-[#169456]',
                'Layak Pakai': 'bg-[#EAFDF3] text-[#169456]',
                'ON': 'bg-[#EAFDF3] text-[#169456]',
                'Info': 'bg-[#EFF6FF] text-[#2563EB]'
            };
            const dotColors = {
                'Nyaman': 'bg-[#189F5A]',
                'Aman': 'bg-[#189F5A]',
                'Layak Pakai': 'bg-[#189F5A]',
                'ON': 'bg-[#189F5A]',
                'Info': 'bg-[#3B82F6]'
            };
            return (
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-semibold ${colors[status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]}`}></span>
                    {status}
                </span>
            );
        }
        if (['Tidak Nyaman', 'Bahaya', 'Tidak Layak', 'OFF'].includes(status)) {
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-semibold bg-[#FDEAEB] text-[#D83C43]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D83C43]"></span>
                    {status}
                </span>
            );
        }
        if (status === 'Waspada') {
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-semibold bg-[#FEF9C3] text-[#D97706]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                    {status}
                </span>
            );
        }
        if (status === 'Out of Range') {
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-semibold bg-[#2B323D] text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    {status}
                </span>
            );
        }
        return <span className="text-[13px] font-semibold">{status}</span>;
    };

    return (
        <SuperAdminLayout activeMenu="Riwayat" onNavigate={onNavigate} title="Riwayat Aktivitas">
            <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-visible">
                        <div className="flex items-center gap-3 mb-6">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Global Filter Bar</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            {/* Pilih Pelanggan */}
                            <div className="space-y-2 relative">
                                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Pilih Pelanggan / Homeowner</label>
                                <button
                                    onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                                    className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all group"
                                >
                                    <span>{selectedCustomer}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCustomerDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showCustomerDropdown && (
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-[70]">
                                        {customers.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); setCurrentPage(1); }}
                                                className={`w-full text-left px-5 py-3 text-sm transition-colors ${selectedCustomer === c ? 'text-[#009b7c] bg-[#F2F8F5] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pilih ID BIEON */}
                            <div className="space-y-2 relative">
                                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Pilih ID BIEON / Hub</label>
                                <button
                                    onClick={() => setShowHubDropdown(!showHubDropdown)}
                                    className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all group"
                                >
                                    <span>{selectedHub}</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showHubDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showHubDropdown && (
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-[70]">
                                        {hubs.map(h => (
                                            <button
                                                key={h}
                                                onClick={() => { setSelectedHub(h); setShowHubDropdown(false); setCurrentPage(1); }}
                                                className={`w-full text-left px-5 py-3 text-sm transition-colors ${selectedHub === h ? 'text-[#009b7c] bg-[#F2F8F5] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Date Filter */}
                            <div className="space-y-2 relative">
                                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Pilih Rentang Waktu</label>
                                <button
                                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                                    className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all group"
                                >
                                    <span className={dateRange.start || dateRange.end ? 'text-[#009b7c]' : ''}>{dateRange.start || dateRange.end ? 'Rentang Aktif' : 'Semua Waktu'}</span>
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                </button>
                                {showDateDropdown && (
                                    <div className="absolute top-full left-0 mt-2 w-[320px] bg-white border border-gray-100 rounded-[2rem] shadow-2xl p-6 z-[70]">
                                        <div className="space-y-5">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Mulai Dari</label>
                                                <button onClick={() => setActivePicker(activePicker === 'start' ? null : 'start')} className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-2 rounded-xl text-sm font-bold transition-all ${activePicker === 'start' ? 'border-[#009b7c] bg-white' : 'border-transparent'}`}>
                                                    <span className={dateRange.start ? 'text-gray-900' : 'text-gray-400'}>{dateRange.start ? formatDateDisplay(dateRange.start) : 'Pilih Tanggal'}</span>
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Sampai Dengan</label>
                                                <button onClick={() => setActivePicker(activePicker === 'end' ? null : 'end')} className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-2 rounded-xl text-sm font-bold transition-all ${activePicker === 'end' ? 'border-[#009b7c] bg-white' : 'border-transparent'}`}>
                                                    <span className={dateRange.end ? 'text-gray-900' : 'text-gray-400'}>{dateRange.end ? formatDateDisplay(dateRange.end) : 'Pilih Tanggal'}</span>
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </div>
                                            {activePicker && (
                                                <div className="pt-2 border-t border-gray-50">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <span className="text-sm font-bold text-gray-900">{monthNames[viewMonth]}</span>
                                                            <div className="relative inline-block ml-2">
                                                                <button onClick={() => setShowYearDropdown(!showYearDropdown)} className="text-[10px] font-bold text-[#009b7c] flex items-center gap-1">{viewYear} <ChevronDown className="w-2.5 h-2.5" /></button>
                                                                {showYearDropdown && (
                                                                    <div className="absolute top-full left-0 mt-1 w-20 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-20 max-h-40 overflow-y-auto custom-scrollbar">
                                                                        {[2023, 2024, 2025, 2026, 2027].map(yr => (
                                                                            <button key={yr} onClick={() => { setViewYear(yr); setShowYearDropdown(false); }} className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-gray-500 hover:bg-gray-50">{yr}</button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => changeMonth('prev')} className="p-1 hover:bg-gray-50 rounded"><ChevronLeft className="w-4 h-4" /></button>
                                                            <button onClick={() => changeMonth('next')} className="p-1 hover:bg-gray-50 rounded"><ChevronRight className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-7 gap-1">
                                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="text-[10px] font-bold text-gray-400 text-center">{d}</span>)}
                                                        {calendarDays.map((d, i) => (
                                                            <button key={i} onClick={() => handleSelectDate(d)} className={`h-8 flex items-center justify-center rounded-lg text-xs font-bold ${!d.current ? 'text-gray-200' : 'text-gray-700 hover:bg-[#F2F8F5] hover:text-[#009b7c]'} ${(activePicker === 'start' ? dateRange.start : dateRange.end) === `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}` ? 'bg-[#009b7c] text-white' : ''}`}>
                                                                {d.day}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex gap-3">
                                                <button onClick={() => { setDateRange({ start: '', end: '' }); setShowDateDropdown(false); setActivePicker(null); }} className="flex-1 py-2 text-xs font-bold text-gray-400 uppercase">Reset</button>
                                                <button onClick={() => { setShowDateDropdown(false); setActivePicker(null); }} className="flex-1 py-2 bg-[#009b7c] text-white rounded-xl text-xs font-bold uppercase">Apply</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Export Data */}
                            <div className="space-y-2 lg:pt-6">
                                <button
                                    onClick={() => showToast("Mengekspor data riwayat ke format Excel/PDF...")}
                                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-[#009b7c] text-white rounded-2xl text-sm font-bold hover:bg-[#008268] transition-all shadow-lg shadow-emerald-100 group"
                                >
                                    <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                                    <span>Export</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            {/* Tabs */}
                            <div className="flex bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm w-full lg:w-auto overflow-hidden">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setSelectedRoomFilter(''); }}
                                        className={`flex-1 lg:flex-none px-3 md:px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap overflow-hidden text-ellipsis ${activeTab === tab.id ? 'bg-[#009b7c] text-white shadow-md shadow-emerald-100' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                            }`}
                                        title={tab.full}
                                    >
                                        {/* Priority: Konsumsi Energi & Notifikasi shorten first, then others, then ellipsis */}
                                        {tab.id === 'Konsumsi Energi' ? (
                                            <>
                                                <span className="hidden xl:inline">{tab.full}</span>
                                                <span className="inline xl:hidden">{tab.short}</span>
                                            </>
                                        ) : tab.id === 'Notifikasi & Alert' ? (
                                            <>
                                                <span className="hidden lg:inline">{tab.full}</span>
                                                <span className="inline lg:hidden">{tab.short}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="hidden md:inline">{tab.full}</span>
                                                <span className="inline md:hidden">{tab.short}</span>
                                            </>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Sub-filters and Search */}
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <div className="relative flex-1 lg:w-80">
                                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search data..."
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#009b7c]/20"
                                    />
                                </div>
                                <div className="relative">
                                    <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className={`flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl text-[13px] font-medium ${selectedRoomFilter ? 'text-[#009b7c] border-[#009b7c]' : 'text-gray-500'}`}>
                                        <Filter className="w-4 h-4" />
                                        {selectedRoomFilter || (['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? 'Perangkat' : 'Ruangan')}
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    {showFilterDropdown && (
                                        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-30">
                                            <button onClick={() => { setSelectedRoomFilter(''); setShowFilterDropdown(false); }} className={`w-full text-left px-5 py-2.5 text-xs font-semibold ${!selectedRoomFilter ? 'bg-[#F2F8F5] text-[#009b7c]' : 'text-gray-600 hover:bg-gray-50'}`}>Semua</button>
                                            {availableFilters.map(f => (
                                                <button key={f} onClick={() => { setSelectedRoomFilter(f); setShowFilterDropdown(false); }} className={`w-full text-left px-5 py-2.5 text-xs font-semibold ${selectedRoomFilter === f ? 'bg-[#F2F8F5] text-[#009b7c]' : 'text-gray-600 hover:bg-gray-50'}`}>{f}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Table */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] font-normal tracking-widest">
                                            <th onClick={() => requestSort('time')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-2 font-normal">Waktu {getSortIcon('time')}</div>
                                            </th>
                                            {activeTab === 'Notifikasi & Alert' && (
                                                <th onClick={() => requestSort('category')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                    <div className="flex items-center gap-2 font-normal">Kategori {getSortIcon('category')}</div>
                                                </th>
                                            )}
                                            {['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? (
                                                <th onClick={() => requestSort('device')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                    <div className="flex items-center gap-2 font-normal">Perangkat {getSortIcon('device')}</div>
                                                </th>
                                            ) : (
                                                <th onClick={() => requestSort('room')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                    <div className="flex items-center gap-2 font-normal">Ruangan {getSortIcon('room')}</div>
                                                </th>
                                            )}
                                            {activeTab === 'Log Perangkat' && (
                                                <>
                                                    <th onClick={() => requestSort('actuator')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Perangkat (Aktuator) {getSortIcon('actuator')}</div>
                                                    </th>
                                                    <th onClick={() => requestSort('status')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Status {getSortIcon('status')}</div>
                                                    </th>
                                                    <th onClick={() => requestSort('trigger')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Pemicu (Trigger) {getSortIcon('trigger')}</div>
                                                    </th>
                                                </>
                                            )}
                                            {activeTab === 'Kenyamanan' && (
                                                <>
                                                    <th onClick={() => requestSort('temp')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Suhu {getSortIcon('temp')}</div>
                                                    </th>
                                                    <th onClick={() => requestSort('humidity')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Kelembapan {getSortIcon('humidity')}</div>
                                                    </th>
                                                </>
                                            )}
                                            {activeTab === 'Keamanan' && (
                                                <>
                                                    <th onClick={() => requestSort('door')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Pintu {getSortIcon('door')}</div>
                                                    </th>
                                                    <th onClick={() => requestSort('motion')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Gerak {getSortIcon('motion')}</div>
                                                    </th>
                                                </>
                                            )}
                                            {activeTab === 'Kualitas Air' && (
                                                <>
                                                    <th onClick={() => requestSort('ph')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">pH {getSortIcon('ph')}</div>
                                                    </th>
                                                    <th onClick={() => requestSort('turbidity')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Kekeruhan {getSortIcon('turbidity')}</div>
                                                    </th>
                                                    <th onClick={() => requestSort('temp')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Suhu {getSortIcon('temp')}</div>
                                                    </th>
                                                    <th onClick={() => requestSort('tds')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Padatan Terlarut (TDS) {getSortIcon('tds')}</div>
                                                    </th>
                                                </>
                                            )}
                                            {activeTab === 'Konsumsi Energi' && (
                                                <>
                                                    <th onClick={() => requestSort('kwh')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">kWh Kumulatif {getSortIcon('kwh')}</div>
                                                    </th>
                                                    <th onClick={() => requestSort('voltage')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Voltase {getSortIcon('voltage')}</div>
                                                    </th>
                                                    <th onClick={() => requestSort('current')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Arus {getSortIcon('current')}</div>
                                                    </th>
                                                    <th onClick={() => requestSort('power')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                        <div className="flex items-center gap-2 font-normal">Beban Daya (W) {getSortIcon('power')}</div>
                                                    </th>
                                                </>
                                            )}
                                            {activeTab !== 'Konsumsi Energi' && activeTab !== 'Log Perangkat' && (
                                                <th onClick={() => requestSort('status')} className="px-8 py-5 cursor-pointer hover:bg-gray-100/50 transition-colors whitespace-nowrap">
                                                    <div className="flex items-center gap-2 font-normal">
                                                        {activeTab === 'Notifikasi & Alert' ? 'Tingkat Bahaya' : 'Status'} {getSortIcon('status')}
                                                    </div>
                                                </th>
                                            )}
                                            {activeTab === 'Notifikasi & Alert' && <th className="px-8 py-5 whitespace-nowrap font-normal">Pesan Detail Alert</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50/50">
                                        {paginatedData.length > 0 ? paginatedData.map((item) => (
                                            <tr key={item.id} className="hover:bg-[#F2F8F5]/30 transition-colors group text-[#374151]">
                                                <td className="px-8 py-5 text-[13px] font-medium text-gray-900 whitespace-nowrap">{item.time}</td>
                                                {activeTab === 'Notifikasi & Alert' && <td className="px-8 py-5 text-[13px] text-gray-600 font-normal">{item.category}</td>}
                                                <td className="px-8 py-5 text-[13px] text-gray-600 font-normal">{item.room || item.device}</td>
                                                {activeTab === 'Log Perangkat' && (
                                                    <>
                                                        <td className="px-8 py-5 text-[13px] text-gray-600 font-normal">{item.actuator}</td>
                                                        <td className="px-8 py-5">
                                                            <StatusBadge status={item.status} />
                                                        </td>
                                                        <td className="px-8 py-5 text-[13px] text-gray-600 font-normal">{item.trigger}</td>
                                                    </>
                                                )}
                                                {activeTab === 'Kenyamanan' && (
                                                    <>
                                                        <td className="px-8 py-5 text-[13px] text-gray-600 font-normal">{item.temp.toFixed(1)} °C</td>
                                                        <td className="px-8 py-5 text-[13px] text-gray-500 font-normal">{item.humidity}</td>
                                                    </>
                                                )}
                                                {activeTab === 'Keamanan' && (
                                                    <>
                                                        <td className="px-8 py-5 text-[13px] text-gray-600 font-normal">{item.door}</td>
                                                        <td className="px-8 py-5 text-[13px] text-gray-500 font-normal">{item.motion}</td>
                                                    </>
                                                )}
                                                {activeTab === 'Kualitas Air' && (
                                                    <>
                                                        <td className="px-8 py-5 text-[13px] text-gray-600 font-normal">{item.ph}</td>
                                                        <td className="px-8 py-5 text-[13px] text-gray-500 font-normal">{item.turbidity}</td>
                                                        <td className="px-8 py-5 text-[13px] text-gray-500 font-normal">{item.temp}</td>
                                                        <td className="px-8 py-5 text-[13px] text-gray-500 font-normal">{item.tds}</td>
                                                    </>
                                                )}
                                                {activeTab === 'Konsumsi Energi' && (
                                                    <>
                                                        <td className="px-8 py-5 text-[13px] text-gray-600 font-normal">{item.kwh}</td>
                                                        <td className="px-8 py-5 text-[13px] text-gray-500 font-normal">{item.voltage}</td>
                                                        <td className="px-8 py-5 text-[13px] text-gray-500 font-normal">{item.current}</td>
                                                        <td className="px-8 py-5 text-[13px] text-gray-500 font-normal">{item.power}</td>
                                                    </>
                                                )}
                                                {activeTab !== 'Konsumsi Energi' && activeTab !== 'Log Perangkat' && (
                                                    <td className="px-8 py-5">
                                                        <StatusBadge status={item.status} />
                                                    </td>
                                                )}
                                                {activeTab === 'Notifikasi & Alert' && <td className="px-8 py-5 text-[13px] font-normal text-gray-500 max-w-[450px] whitespace-normal leading-relaxed">{item.message}</td>}
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={10} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <Activity className="w-12 h-12 text-gray-100" />
                                                        <div className="space-y-1">
                                                            <p className="text-lg font-bold text-gray-900">Tidak ada data ditemukan</p>
                                                            <p className="text-sm font-semibold text-gray-400">Coba ubah filter atau kata kunci pencarian Anda</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-[10px]">Rows per page:</span>
                                    <div className="relative">
                                        <button onClick={() => setShowRowsDropdown(!showRowsDropdown)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                                            {rowsPerPage} <ChevronDown className={`w-3 h-3 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                                        </button>
                                        {showRowsDropdown && (
                                            <div className="absolute bottom-full left-0 mb-2 w-20 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-40">
                                                {[5, 10, 15, 20, 30, 50].map(val => (
                                                    <button key={val} onClick={() => { setRowsPerPage(val); setShowRowsDropdown(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${rowsPerPage === val ? 'text-[#009b7c] bg-[#F2F8F5]' : 'text-gray-500 hover:bg-gray-50'}`}>{val}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm">Previous</button>
                                    <button disabled={currentPage >= Math.ceil(totalItems / rowsPerPage)} onClick={() => setCurrentPage(currentPage + 1)} className="px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all uppercase tracking-widest shadow-sm">Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>

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
