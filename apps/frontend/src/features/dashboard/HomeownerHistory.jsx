import React, { useState, useMemo } from 'react';
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
    ChevronDown
} from 'lucide-react';
import NotificationPopup from '../../components/NotificationPopup';
import HomeownerLayout from './HomeownerLayout';
import { StatusBadge } from '../../shared/StatusBadge';

// ─── Static data outside component — prevents re-creation on every render ───

const BASE_COMFORT_DATA = [
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
const COMFORT_HISTORY_DATA = [
    ...BASE_COMFORT_DATA.map((d, i) => ({ ...d, id: i + 1 })),
    ...BASE_COMFORT_DATA.map((d, i) => ({ ...d, id: i + 15, time: `25 Feb 2026, ${d.time.split(', ')[1]}` })),
    ...BASE_COMFORT_DATA.map((d, i) => ({ ...d, id: i + 29, time: `24 Feb 2026, ${d.time.split(', ')[1]}` })),
];

const BASE_SECURITY_DATA = [
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
const SECURITY_HISTORY_DATA = [
    ...BASE_SECURITY_DATA.map((d, i) => ({ ...d, id: i + 1 })),
    ...BASE_SECURITY_DATA.map((d, i) => ({ ...d, id: i + 15, time: `25 Feb 2026, ${d.time.split(', ')[1]}` })),
    ...BASE_SECURITY_DATA.map((d, i) => ({ ...d, id: i + 29, time: `24 Feb 2026, ${d.time.split(', ')[1]}` })),
];

const BASE_WATER_DATA = [
    { time: '26 Feb 2026, 11:30:00', device: 'Toren Air', ph: 7.2, turbidity: '2 NTU', temp: '24.0°C', tds: '150 ppm', status: 'Layak Pakai' },
    { time: '26 Feb 2026, 11:15:00', device: 'Pipa Distribusi', ph: 7.1, turbidity: '1 NTU', temp: '24.0°C', tds: '148 ppm', status: 'Layak Pakai' },
    { time: '26 Feb 2026, 10:45:00', device: 'Toren Air', ph: 7.0, turbidity: '4 NTU', temp: '24.0°C', tds: '160 ppm', status: 'Tidak Layak' },
    { time: '26 Feb 2026, 10:15:00', device: 'Toren Air', ph: 6.0, turbidity: '2 NTU', temp: '25.0°C', tds: '150 ppm', status: 'Tidak Layak' },
    { time: '26 Feb 2026, 10:00:00', device: 'Toren Air', ph: 6.5, turbidity: '5 NTU', temp: '25.0°C', tds: '310 ppm', status: 'Tidak Layak' },
    { time: '26 Feb 2026, 09:45:00', device: 'Pipa Distribusi', ph: 7.0, turbidity: '1 NTU', temp: '23.5°C', tds: '125 ppm', status: 'Layak Pakai' },
    { time: '26 Feb 2026, 09:30:00', device: 'Toren Air', ph: 8.8, turbidity: '2 NTU', temp: '24.0°C', tds: '160 ppm', status: 'Tidak Layak' },
    { time: '26 Feb 2026, 08:15:00', device: 'Pipa Distribusi', ph: '14+', turbidity: '2 NTU', temp: '24.0°C', tds: '145 ppm', status: 'Out of Range' },
];
const WATER_HISTORY_DATA = [
    ...BASE_WATER_DATA.map((d, i) => ({ ...d, id: i + 1 })),
    ...BASE_WATER_DATA.map((d, i) => ({ ...d, id: i + 9, time: `25 Feb 2026, ${d.time.split(', ')[1]}` })),
    ...BASE_WATER_DATA.map((d, i) => ({ ...d, id: i + 17, time: `24 Feb 2026, ${d.time.split(', ')[1]}` })),
];

const BASE_ENERGY_DATA = [
    { time: '26 Feb 2026, 11:30:00', device: 'Power Meter Utama', kwh: '1455.10 kWh', voltage: '220.5 V', current: '4.0 A', power: '850 W', pf: '0.96' },
    { time: '26 Feb 2026, 11:15:00', device: 'Power Meter Utama', kwh: '1454.67 kWh', voltage: '220.5 V', current: '3.9 A', power: '845 W', pf: '0.95' },
    { time: '26 Feb 2026, 11:00:00', device: 'Power Meter Utama', kwh: '1454.25 kWh', voltage: '221.0 V', current: '2.1 A', power: '450 W', pf: '0.97' },
    { time: '26 Feb 2026, 10:45:00', device: 'Power Meter Utama', kwh: '1454.02 kWh', voltage: '220.2 V', current: '2.0 A', power: '440 W', pf: '0.96' },
    { time: '26 Feb 2026, 09:00:00', device: 'Power Meter Utama', kwh: '1452.71 kWh', voltage: '222.2 V', current: '1.3 A', power: '280 W', pf: '0.91' },
    { time: '26 Feb 2026, 08:15:00', device: 'Power Meter Utama', kwh: '1452.32 kWh', voltage: '221.9 V', current: '1.1 A', power: '230 W', pf: '0.89' },
];
const ENERGY_HISTORY_DATA = [
    ...BASE_ENERGY_DATA.map((d, i) => ({ ...d, id: i + 1 })),
    ...BASE_ENERGY_DATA.map((d, i) => ({ ...d, id: i + 7, time: `25 Feb 2026, ${d.time.split(', ')[1]}` })),
    ...BASE_ENERGY_DATA.map((d, i) => ({ ...d, id: i + 13, time: `24 Feb 2026, ${d.time.split(', ')[1]}` })),
];

const BASE_DEVICE_LOG_DATA = [
    { time: '26 Feb 2026, 11:30:00', room: 'R1 - Ruang Keluarga', actuator: 'Smart TV', status: 'OFF', trigger: 'Manual (Web)' },
    { time: '26 Feb 2026, 11:15:00', room: 'R3 - Dapur', actuator: 'Smart Plug (Kulkas)', status: 'ON', trigger: 'Jadwal Otomatis' },
    { time: '26 Feb 2026, 10:45:00', room: 'R5 - Ruang Produksi', actuator: 'Kipas Exhaust', status: 'OFF', trigger: 'Otomasi (Suhu 24°C)' },
    { time: '26 Feb 2026, 10:30:00', room: 'R2 - Kamar Tidur', actuator: 'AC Split', status: 'OFF', trigger: 'Manual (Web)' },
    { time: '26 Feb 2026, 09:45:00', room: 'R5 - Ruang Produksi', actuator: 'Kipas Exhaust', status: 'ON', trigger: 'Otomasi (Suhu > 31°C)' },
    { time: '26 Feb 2026, 08:15:00', room: 'R3 - Dapur', actuator: 'Coffee Maker', status: 'ON', trigger: 'Jadwal Otomatis' },
];
const DEVICE_LOG_HISTORY_DATA = [
    ...BASE_DEVICE_LOG_DATA.map((d, i) => ({ ...d, id: i + 1 })),
    ...BASE_DEVICE_LOG_DATA.map((d, i) => ({ ...d, id: i + 7, time: `25 Feb 2026, ${d.time.split(', ')[1]}` })),
    ...BASE_DEVICE_LOG_DATA.map((d, i) => ({ ...d, id: i + 13, time: `24 Feb 2026, ${d.time.split(', ')[1]}` })),
];

const BASE_ALERT_DATA = [
    { time: '26 Feb 2026, 11:30:00', category: 'Keamanan', room: 'R1 - Pintu Utama', status: 'Waspada', message: 'Pintu utama dibuka menggunakan akses PIN.' },
    { time: '26 Feb 2026, 11:15:00', category: 'Keamanan', room: 'R4 - Garasi', status: 'Bahaya', message: 'Terdeteksi pergerakan tidak wajar di area garasi!' },
    { time: '26 Feb 2026, 10:45:00', category: 'Air Sanitasi', room: 'Toren Air', status: 'Bahaya', message: 'Kekeruhan air meningkat drastis (18 NTU). Status: Tidak Layak.' },
    { time: '26 Feb 2026, 10:15:00', category: 'Energi', room: 'Power Meter Utama', status: 'Waspada', message: 'Beban daya melebihi 1000 W. Mendekati batas limit harian.' },
    { time: '26 Feb 2026, 09:15:00', category: 'Gas', room: 'R3 - Dapur', status: 'Bahaya', message: 'Terdeteksi peningkatan kadar gas. Kualitas udara memburuk.' },
    { time: '26 Feb 2026, 08:15:00', category: 'Air Sanitasi', room: 'Toren Air', status: 'Info', message: 'Siklus pembersihan filter air otomatis selesai.' },
];
const ALERT_HISTORY_DATA = [
    ...BASE_ALERT_DATA.map((d, i) => ({ ...d, id: i + 1 })),
    ...BASE_ALERT_DATA.map((d, i) => ({ ...d, id: i + 7, time: `25 Feb 2026, ${d.time.split(', ')[1]}` })),
    ...BASE_ALERT_DATA.map((d, i) => ({ ...d, id: i + 13, time: `24 Feb 2026, ${d.time.split(', ')[1]}` })),
];

export function HomeownerHistory({ onNavigate }) {
    const [activeTab, setActiveTab] = useState('Kenyamanan');
    const [showNotifications, setShowNotifications] = useState(false);

    // Search, Filter, Pagination, Sort states
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoomFilter, setSelectedRoomFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const tabs = [
        { id: 'Kenyamanan',       full: 'Kenyamanan',       short: 'Kenyamanan' },
        { id: 'Keamanan',         full: 'Keamanan',         short: 'Keamanan' },
        { id: 'Kualitas Air',     full: 'Kualitas Air',     short: 'Kualitas Air' },
        { id: 'Konsumsi Energi',  full: 'Konsumsi Energi',  short: 'Energi' },
        { id: 'Log Perangkat',    full: 'Log Perangkat',    short: 'Log Perangkat' },
        { id: 'Notifikasi & Alert', full: 'Notifikasi & Alert', short: 'Notifikasi' }
    ];

    // Reference module-level constants (no re-creation per render)
    const comfortHistoryData    = COMFORT_HISTORY_DATA;
    const securityHistoryData   = SECURITY_HISTORY_DATA;
    const waterHistoryData      = WATER_HISTORY_DATA;
    const energyHistoryData     = ENERGY_HISTORY_DATA;
    const deviceLogHistoryData  = DEVICE_LOG_HISTORY_DATA;
    const alertHistoryData      = ALERT_HISTORY_DATA;

    // Logic to process data based on Search, Filter, and Sort
    const processedData = useMemo(() => {
        let sourceData = [];
        if (activeTab === 'Kenyamanan') sourceData = comfortHistoryData;
        else if (activeTab === 'Keamanan') sourceData = securityHistoryData;
        else if (activeTab === 'Kualitas Air') sourceData = waterHistoryData;
        else if (activeTab === 'Konsumsi Energi') sourceData = energyHistoryData;
        else if (activeTab === 'Log Perangkat') sourceData = deviceLogHistoryData;
        else if (activeTab === 'Notifikasi & Alert') sourceData = alertHistoryData;
        else return [];

        let filtered = [...sourceData];

        // Apply Filter by Room or Device
        if (selectedRoomFilter) {
            filtered = filtered.filter(item => {
                if (['Kualitas Air', 'Konsumsi Energi'].includes(activeTab)) return item.device === selectedRoomFilter;
                return item.room === selectedRoomFilter;
            });
        }

        // Apply Search
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
                    return timeStr.includes(q) || item.category.toLowerCase().includes(q) || item.room.toLowerCase().includes(q) ||
                        statusStr.includes(q) || item.message.toLowerCase().includes(q);
                }
                return false;
            });
        }

        // Apply Sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Custom sort for numeric values
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
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [activeTab, searchQuery, selectedRoomFilter, sortConfig,
        comfortHistoryData, securityHistoryData, waterHistoryData,
        energyHistoryData, deviceLogHistoryData, alertHistoryData]);

    // Available rooms/devices for filter dropdown
    const availableFilters = useMemo(() => {
        if (activeTab === 'Kenyamanan') return Array.from(new Set(comfortHistoryData.map(d => d.room)));
        if (activeTab === 'Keamanan') return Array.from(new Set(securityHistoryData.map(d => d.room)));
        if (activeTab === 'Kualitas Air') return Array.from(new Set(waterHistoryData.map(d => d.device)));
        if (activeTab === 'Konsumsi Energi') return Array.from(new Set(energyHistoryData.map(d => d.device)));
        if (activeTab === 'Log Perangkat') return Array.from(new Set(deviceLogHistoryData.map(d => d.room)));
        if (activeTab === 'Notifikasi & Alert') return Array.from(new Set(alertHistoryData.map(d => d.room)));
        return [];
    }, [activeTab]);

    const activeTabsConfigured = ['Kenyamanan', 'Keamanan', 'Kualitas Air', 'Konsumsi Energi', 'Log Perangkat', 'Notifikasi & Alert'];

    // Pagination bounds
    const totalItems = processedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = processedData.slice(startIndex, startIndex + rowsPerPage);

    // Helper functions
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const handleExport = () => {
        if (processedData.length === 0) return alert("Tidak ada data untuk diekspor!");
        let headers = [];
        let csvMapper;

        if (activeTab === 'Kenyamanan') {
            headers = ["Waktu", "Ruangan", "Suhu(°C)", "Kelembapan", "Status"];
            csvMapper = (e) => `"${e.time}","${e.room}","${e.temp}","${e.humidity}","${e.status}"`;
        } else if (activeTab === 'Keamanan') {
            headers = ["Waktu", "Ruangan", "Sensor Pintu", "Sensor Gerak", "Status"];
            csvMapper = (e) => `"${e.time}","${e.room}","${e.door}","${e.motion}","${e.status}"`;
        } else if (activeTab === 'Kualitas Air') {
            headers = ["Waktu", "Perangkat", "pH", "Kekeruhan", "Suhu", "Padatan Terlarut (TDS)", "Status"];
            csvMapper = (e) => `"${e.time}","${e.device}","${e.ph}","${e.turbidity}","${e.temp}","${e.tds}","${e.status}"`;
        } else if (activeTab === 'Konsumsi Energi') {
            headers = ["Waktu", "Perangkat", "kWh Kumulatif", "Voltase", "Arus", "Beban Daya (W)", "Power Factor"];
            csvMapper = (e) => `"${e.time}","${e.device}","${e.kwh}","${e.voltage}","${e.current}","${e.power}","${e.pf}"`;
        } else if (activeTab === 'Log Perangkat') {
            headers = ["Waktu", "Ruangan", "Perangkat (Aktuator)", "Status", "Pemicu (Trigger)"];
            csvMapper = (e) => `"${e.time}","${e.room}","${e.actuator}","${e.status}","${e.trigger}"`;
        } else if (activeTab === 'Notifikasi & Alert') {
            headers = ["Waktu", "Kategori", "Ruangan", "Tingkat Bahaya", "Pesan Detail Alert"];
            csvMapper = (e) => `"${e.time}","${e.category}","${e.room}","${e.status}","${e.message}"`;
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + processedData.map(csvMapper).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `BIEON_${activeTab}_History.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-gray-600" /> : <ArrowDown className="w-3.5 h-3.5 text-gray-600" />;
    };

    // getStatusBadge is now handled by the shared <StatusBadge> component

    return (
        <HomeownerLayout
            currentPage="history"
            onNavigate={onNavigate}
            hideBottomNav={false}
        >
            {/* Main Content */}
            <div className="max-w-[1900px] mx-auto px-4 sm:px-8 py-6 md:py-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-center text-[#235C50] mb-6 sm:mb-8">Riwayat Aktivitas</h1>

                {/* Export Button Area */}
                <div className="flex justify-end mb-4">
                    <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-[#235C50] text-white rounded-lg hover:bg-teal-900 transition-colors shadow-sm font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>

                {/* Tabs and Filters Row */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 w-full">
                    {/* Tabs Container — scrollbar-none for clean mobile experience */}
                    <div className="flex bg-white rounded-xl border border-gray-200 overflow-x-auto w-full lg:w-auto lg:max-w-[60%] xl:max-w-[65%] shrink shadow-sm scrollbar-none">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setCurrentPage(1);
                                    setSearchQuery('');
                                    setSelectedRoomFilter('');
                                    setSortConfig({ key: null, direction: 'asc' });
                                }}
                                className={`whitespace-nowrap px-3 md:px-4 lg:px-4 xl:px-5 py-2 md:py-2.5 text-xs md:text-[13px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 ${activeTab === tab.id
                                    ? 'bg-[#EDF5F1] text-[#235C50]'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="hidden xl:inline">{tab.full}</span>
                                <span className="inline xl:hidden">{tab.short}</span>
                            </button>
                        ))}
                    </div>


                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0 shrink-0">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-[100px] md:w-[220px] shrink-0 group">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search data..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 bg-white transition-all"
                                disabled={availableFilters.length === 0}
                            />
                        </div>

                        <div className="relative w-full sm:w-[180px] md:w-[220px] shrink-0">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                disabled={availableFilters.length === 0}
                                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all shadow-sm group ${showFilterDropdown ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-gray-200 hover:bg-gray-50'} ${availableFilters.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Filter className={`w-4 h-4 transition-colors ${showFilterDropdown || selectedRoomFilter ? 'text-teal-500' : 'text-gray-400'}`} />
                                    <span className={selectedRoomFilter ? 'text-gray-900' : 'text-gray-500'}>
                                        {selectedRoomFilter || (['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? 'Semua Perangkat' : 'Semua Ruangan')}
                                    </span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-all ${showFilterDropdown ? 'rotate-180 text-teal-500' : ''}`} />
                            </button>

                            {showFilterDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowFilterDropdown(false)}></div>
                                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200 min-w-[200px]">
                                        <button
                                            onClick={() => {
                                                setSelectedRoomFilter('');
                                                setCurrentPage(1);
                                                setShowFilterDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedRoomFilter === '' ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? 'Semua Perangkat' : 'Semua Ruangan'}
                                        </button>
                                        {availableFilters.map(r => (
                                            <button
                                                key={r}
                                                onClick={() => {
                                                    setSelectedRoomFilter(r);
                                                    setCurrentPage(1);
                                                    setShowFilterDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedRoomFilter === r ? 'text-teal-600 bg-teal-50 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[14px] text-gray-700 table-auto min-w-[1000px]">
                            <thead className="bg-white border-b border-gray-200 text-gray-500 select-none">
                                <tr>
                                    <th onClick={() => requestSort('time')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                        <div className="flex items-center gap-1">Waktu {getSortIcon('time')}</div>
                                    </th>

                                    {activeTab === 'Notifikasi & Alert' && (
                                        <th onClick={() => requestSort('category')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                            <div className="flex items-center gap-1">Kategori {getSortIcon('category')}</div>
                                        </th>
                                    )}

                                    {['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? (
                                        <th onClick={() => requestSort('device')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                            <div className="flex items-center gap-1">Perangkat {getSortIcon('device')}</div>
                                        </th>
                                    ) : (
                                        <th onClick={() => requestSort('room')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                            <div className="flex items-center gap-1">Ruangan {getSortIcon('room')}</div>
                                        </th>
                                    )}

                                    {activeTab === 'Log Perangkat' && (
                                        <th onClick={() => requestSort('actuator')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                            <div className="flex items-center gap-1">Perangkat (Aktuator) {getSortIcon('actuator')}</div>
                                        </th>
                                    )}

                                    {activeTab === 'Kenyamanan' && (
                                        <>
                                            <th onClick={() => requestSort('temp')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Suhu {getSortIcon('temp')}</div>
                                            </th>
                                            <th onClick={() => requestSort('humidity')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Kelembapan {getSortIcon('humidity')}</div>
                                            </th>
                                        </>
                                    )}

                                    {activeTab === 'Keamanan' && (
                                        <>
                                            <th onClick={() => requestSort('door')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Sensor Pintu {getSortIcon('door')}</div>
                                            </th>
                                            <th onClick={() => requestSort('motion')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Sensor Gerak {getSortIcon('motion')}</div>
                                            </th>
                                        </>
                                    )}

                                    {activeTab === 'Kualitas Air' && (
                                        <>
                                            <th onClick={() => requestSort('ph')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">pH {getSortIcon('ph')}</div>
                                            </th>
                                            <th onClick={() => requestSort('turbidity')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Kekeruhan {getSortIcon('turbidity')}</div>
                                            </th>
                                            <th onClick={() => requestSort('temp')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Suhu {getSortIcon('temp')}</div>
                                            </th>
                                            <th onClick={() => requestSort('tds')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Padatan Terlarut (TDS) {getSortIcon('tds')}</div>
                                            </th>
                                        </>
                                    )}

                                    {activeTab === 'Konsumsi Energi' && (
                                        <>
                                            <th onClick={() => requestSort('kwh')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">kWh Kumulatif {getSortIcon('kwh')}</div>
                                            </th>
                                            <th onClick={() => requestSort('voltage')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Voltase {getSortIcon('voltage')}</div>
                                            </th>
                                            <th onClick={() => requestSort('current')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Arus {getSortIcon('current')}</div>
                                            </th>
                                            <th onClick={() => requestSort('power')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Beban Daya (W) {getSortIcon('power')}</div>
                                            </th>
                                            <th onClick={() => requestSort('pf')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Power Factor {getSortIcon('pf')}</div>
                                            </th>
                                        </>
                                    )}

                                    {(!activeTabsConfigured.includes(activeTab)) && (
                                        <>
                                            <th className="px-6 py-4 font-normal whitespace-nowrap">Kolom 1</th>
                                            <th className="px-6 py-4 font-normal whitespace-nowrap">Kolom 2</th>
                                        </>
                                    )}

                                    {activeTab !== 'Konsumsi Energi' && activeTab !== 'Log Perangkat' && activeTab !== 'Notifikasi & Alert' && (
                                        <th onClick={() => requestSort('status')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                            <div className="flex items-center gap-1">Status {getSortIcon('status')}</div>
                                        </th>
                                    )}

                                    {activeTab === 'Log Perangkat' && (
                                        <>
                                            <th onClick={() => requestSort('status')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Status {getSortIcon('status')}</div>
                                            </th>
                                            <th onClick={() => requestSort('trigger')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Pemicu (Trigger) {getSortIcon('trigger')}</div>
                                            </th>
                                        </>
                                    )}

                                    {activeTab === 'Notifikasi & Alert' && (
                                        <>
                                            <th onClick={() => requestSort('status')} className="px-6 py-4 font-normal cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                <div className="flex items-center gap-1">Tingkat Bahaya {getSortIcon('status')}</div>
                                            </th>
                                            <th className="px-6 py-4 font-normal whitespace-nowrap">
                                                Pesan Detail Alert
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
                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.time}</td>

                                                {activeTab === 'Notifikasi & Alert' && (
                                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.category}</td>
                                                )}

                                                {['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? (
                                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.device}</td>
                                                ) : (
                                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.room}</td>
                                                )}

                                                {activeTab === 'Kenyamanan' && (
                                                    <>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{Number(item.temp).toFixed(1)} °C</td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.humidity}</td>
                                                    </>
                                                )}

                                                {activeTab === 'Keamanan' && (
                                                    <>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.door}</td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.motion}</td>
                                                    </>
                                                )}

                                                {activeTab === 'Kualitas Air' && (
                                                    <>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.ph}</td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.turbidity}</td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.temp}</td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.tds}</td>
                                                    </>
                                                )}

                                                {activeTab === 'Konsumsi Energi' && (
                                                    <>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.kwh}</td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.voltage}</td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.current}</td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.power}</td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.pf}</td>
                                                    </>
                                                )}

                                                {activeTab === 'Log Perangkat' && (
                                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.actuator}</td>
                                                )}

                                                {activeTab !== 'Konsumsi Energi' && activeTab !== 'Log Perangkat' && activeTab !== 'Notifikasi & Alert' && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <StatusBadge status={item.status} />
                                                    </td>
                                                )}

                                                {activeTab === 'Log Perangkat' && (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <StatusBadge status={item.status} />
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.trigger}</td>
                                                    </>
                                                )}

                                                {activeTab === 'Notifikasi & Alert' && (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <StatusBadge status={item.status} />
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 min-w-[280px]">
                                                            {item.message}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={(['Kualitas Air', 'Konsumsi Energi'].includes(activeTab)) ? 7 : 5} className="px-6 py-20 text-center text-gray-500">
                                                Tidak ada data yang cocok dengan pencarian Anda.
                                            </td>
                                        </tr>
                                    )
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="text-lg font-medium mb-1">Tidak ada data</div>
                                                <div className="text-sm">Data belum tersedia untuk tab {activeTab}.</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {activeTabsConfigured.includes(activeTab) && (
                        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>Rows per page:</span>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-all"
                                    >
                                        {rowsPerPage} <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showRowsDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {showRowsDropdown && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowRowsDropdown(false)}></div>
                                            <div className="absolute bottom-full left-0 mb-2 w-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20 animate-in fade-in slide-in-from-bottom-2">
                                                {[5, 10, 15, 20, 30, 50].map(val => (
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

                            <div className="text-sm font-medium text-gray-600">
                                {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + rowsPerPage, totalItems)} of {totalItems} items
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || totalItems === 0}
                                    className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:text-gray-400 disabled:hover:bg-white disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalItems === 0}
                                    className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:text-gray-400 disabled:hover:bg-white disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </HomeownerLayout>
    );
}
