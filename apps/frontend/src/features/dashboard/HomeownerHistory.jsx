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

export function HomeownerHistory({ onNavigate }) {
    const [activeTab, setActiveTab] = useState('Kenyamanan');

    // Search, Filter, Pagination, Sort states
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoomFilter, setSelectedRoomFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);

    const tabs = [
        { id: 'Kenyamanan', full: 'Kenyamanan', short: 'Kenyamanan' },
        { id: 'Keamanan', full: 'Keamanan', short: 'Keamanan' },
        { id: 'Kualitas Air', full: 'Kualitas Air', short: 'Kualitas Air' },
        { id: 'Konsumsi Energi', full: 'Konsumsi Energi', short: 'Energi' },
        { id: 'Log Perangkat', full: 'Log Perangkat', short: 'Log Perangkat' },
        { id: 'Notifikasi & Alert', full: 'Notifikasi & Alert', short: 'Notifikasi' }
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
    }, [activeTab, searchQuery, selectedRoomFilter, sortConfig]);

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

    const getStatusBadge = (status) => {
        if (!status) return null;
        if (status === 'Nyaman' || status === 'Aman' || status === 'Layak Pakai' || status === 'ON') {
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-semibold bg-[#EAFDF3] text-[#169456]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#189F5A]"></span>
                    {status}
                </span>
            );
        }
        if (status === 'Tidak Nyaman' || status === 'Bahaya' || status === 'Tidak Layak' || status === 'OFF') {
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
        if (status === 'Info') {
            return (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[13px] font-semibold bg-[#EFF6FF] text-[#2563EB]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
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
        return <span>{status}</span>;
    };

    const colWidth = ['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? 'w-[14.2%]' : 'w-1/5';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-teal-50/20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[1900px] mx-auto px-8 py-4">
<<<<<<< HEAD
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">BIEON Homeowner</h1>
                        <p className="text-xs text-gray-500">Smart Green Home Monitoring</p>
                      </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-10">
                      <button onClick={() => onNavigate && onNavigate('dashboard')} className="text-teal-700 font-semibold hover:text-teal-900 transition-colors pb-1 border-b-2 border-transparent hover:border-teal-700">Beranda</button>
                      <button onClick={() => onNavigate && onNavigate('kendali')} className="text-teal-700 font-semibold hover:text-teal-900 transition-colors pb-1 border-b-2 border-transparent hover:border-teal-700">Kendali Perangkat</button>
                      <button onClick={() => onNavigate && onNavigate('history')} className="text-teal-700 font-semibold border-b-2 border-teal-700 pb-1">Riwayat</button>
                    </nav>

                    <div className="flex items-center gap-4">
                      <button onClick={() => onNavigate && onNavigate('pengaduan')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                        <MessageSquare className="w-4 h-4" />
                        Ajukan Pengaduan
                      </button>
                      <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                          className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-all"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full"></div>
                          <div className="text-left">
                            <div className="text-xs font-semibold text-gray-900">Hi, Aisyah!</div>
                            <div className="text-xs text-gray-500">Homeowner</div>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                        </button>
                        {showRoleDropdown && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ganti Role (Demo)</div>
                            <button className="w-full text-left px-4 py-2 text-sm text-emerald-600 bg-emerald-50 font-medium transition-colors">Homeowner</button>
                            <button onClick={() => onNavigate && onNavigate("teknisi")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Teknisi</button>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Super Admin</button>
                          </div>
                        )}
                      </div>
=======
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/logo_bieon.png" alt="BIEON" className="h-10 object-contain" />
                        </div>

                        <nav className="hidden md:flex items-center gap-10">
                            <button onClick={() => onNavigate && onNavigate('dashboard')} className="text-teal-700 font-semibold hover:text-teal-900 transition-colors pb-1 border-b-2 border-transparent hover:border-teal-700">Beranda</button>
                            <button onClick={() => onNavigate && onNavigate('kendali')} className="text-teal-700 font-semibold hover:text-teal-900 transition-colors pb-1 border-b-2 border-transparent hover:border-teal-700">Kendali Perangkat</button>
                            <button onClick={() => onNavigate && onNavigate('history')} className="text-teal-700 font-semibold border-b-2 border-teal-700 pb-1">Riwayat</button>
                        </nav>

                        <div className="flex items-center gap-4">
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Ajukan Pengaduan
                            </button>
                            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                    className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-all"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full"></div>
                                    <div className="text-left">
                                        <div className="text-xs font-semibold text-gray-900">Hi, Aisyah!</div>
                                        <div className="text-xs text-gray-500">Homeowner</div>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                                </button>
                                {showRoleDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ganti Role (Demo)</div>
                                        <button className="w-full text-left px-4 py-2 text-sm text-emerald-600 bg-emerald-50 font-medium transition-colors">Homeowner</button>
                                        <button onClick={() => onNavigate && onNavigate("teknisi")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Teknisi</button>
                                        <button onClick={() => onNavigate('admin')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium transition-colors">Super Admin</button>
                                    </div>
                                )}
                            </div>
                        </div>
>>>>>>> 6c0e3716914d4c1818421953ec2e52f4063fa589
                    </div>
                  </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-[1900px] mx-auto px-8 py-8">
                <h1 className="text-4xl font-bold text-center text-[#235C50] mb-8">Riwayat Aktivitas</h1>

                {/* Export Button Area */}
                <div className="flex justify-end mb-4">
                    <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-[#235C50] text-white rounded-lg hover:bg-teal-900 transition-colors shadow-sm font-medium text-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>

                {/* Tabs and Filters Row */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 w-full">
                    {/* Tabs Container */}
                    <div className="flex bg-white rounded-xl border border-gray-200 overflow-x-auto w-full lg:w-auto lg:max-w-[60%] xl:max-w-[65%] shrink shadow-sm scrollbar-hide">
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
                        <div className="relative w-full sm:w-[100px] md:w-[220px] shrink-0">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search data..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                disabled={availableFilters.length === 0}
                            />
                        </div>

                        {/* Filters Dropdown */}
                        <div className="relative w-full sm:w-[180px] md:w-[200px] shrink-0">
                            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <select
                                value={selectedRoomFilter}
                                onChange={(e) => { setSelectedRoomFilter(e.target.value); setCurrentPage(1); }}
                                disabled={availableFilters.length === 0}
                                className="appearance-none w-full pl-9 pr-8 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {['Kualitas Air', 'Konsumsi Energi'].includes(activeTab) ? 'Semua Perangkat' : 'Semua Ruangan'}
                                </option>
                                {availableFilters.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto min-h-[400px]">
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
                                                        {getStatusBadge(item.status)}
                                                    </td>
                                                )}

                                                {activeTab === 'Log Perangkat' && (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(item.status)}
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{item.trigger}</td>
                                                    </>
                                                )}

                                                {activeTab === 'Notifikasi & Alert' && (
                                                    <>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(item.status)}
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
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Rows per page:</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={(e) => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border border-gray-200 rounded-md py-1 px-2 bg-transparent font-medium text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                                >
                                    {[5, 10, 15, 20, 30, 50, 100].map(val => (
                                        <option key={val} value={val}>{val}</option>
                                    ))}
                                </select>
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
        </div>
    );
}
