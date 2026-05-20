import React, { useState, useMemo } from 'react';
import { 
    Search, 
    Filter, 
    ShieldCheck, 
    Activity, 
    Cpu, 
    Package, 
    ChevronRight, 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    MapPin,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';

export function MonitoringKlienPage({ clients = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');
    const [sortConfig, setSortConfig] = useState({ key: 'nama', direction: 'asc' });

    // Filter Logic
    const filteredClients = useMemo(() => {
        return (clients || []).filter(client => {
            const matchesSearch = 
                client.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.lokasi?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = 
                statusFilter === 'Semua' || 
                (statusFilter === 'Online' && client.status === 'online') ||
                (statusFilter === 'Offline' && client.status === 'offline') ||
                (statusFilter === 'Warning' && client.status === 'warning');

            return matchesSearch && matchesStatus;
        }).sort((a, b) => {
            if (!sortConfig.key) return 0;
            const aVal = a[sortConfig.key] || '';
            const bVal = b[sortConfig.key] || '';
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [clients, searchQuery, statusFilter, sortConfig]);

    const stats = useMemo(() => {
        return {
            total: (clients || []).length,
            online: (clients || []).filter(c => c.status === 'online').length,
            offline: (clients || []).filter(c => c.status === 'offline').length,
            warning: (clients || []).filter(c => c.status === 'warning').length
        };
    }, [clients]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-eco" /> : <ArrowDown className="w-3.5 h-3.5 text-eco" />;
    };

    return (
        <div className="w-full pb-10 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-eco/10 rounded-xl flex items-center justify-center text-eco">
                        <Activity className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Monitoring Kesehatan Sistem</h1>
                </div>
                <p className="text-gray-500 text-sm">Pantau status konektivitas Hub dan Perangkat seluruh pelanggan secara real-time.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Klien</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-black text-gray-900">{stats.total}</h3>
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                            <Package className="w-4 h-4" />
                        </div>
                    </div>
                </div>
                <div className="bg-emerald-50/50 rounded-[2rem] p-5 shadow-sm border border-emerald-100 transition-all hover:shadow-md">
                    <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mb-1">Sistem Normal</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-black text-emerald-700">{stats.online}</h3>
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                </div>
                <div className="bg-rose-50/50 rounded-[2rem] p-5 shadow-sm border border-rose-100 transition-all hover:shadow-md">
                    <p className="text-[10px] font-bold text-rose-600/60 uppercase tracking-widest mb-1">System Down</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-black text-rose-700">{stats.offline}</h3>
                        <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 animate-pulse">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                    </div>
                </div>
                <div className="bg-amber-50/50 rounded-[2rem] p-5 shadow-sm border border-amber-100 transition-all hover:shadow-md">
                    <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest mb-1">Peringatan</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-black text-amber-700">{stats.warning}</h3>
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar: Search & Filter */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-20">
                <div className="relative w-full md:w-96 group">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Cari ID, Nama, atau Lokasi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['Semua', 'Online', 'Warning', 'Offline'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                statusFilter === status 
                                ? 'bg-eco text-white shadow-lg shadow-eco/20' 
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Monitoring Table */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th onClick={() => handleSort('nama')} className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest cursor-pointer group">
                                    <div className="flex items-center gap-2">
                                        Data Pelanggan
                                        {getSortIcon('nama')}
                                    </div>
                                </th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Infrastruktur</th>
                                <th onClick={() => handleSort('status')} className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center cursor-pointer">
                                    <div className="flex items-center justify-center gap-2">
                                        Kesehatan Sistem
                                        {getSortIcon('status')}
                                    </div>
                                </th>
                                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Detail Status</th>
                                <th className="px-8 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-emerald-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-inner ${
                                                client.status === 'online' ? 'bg-gradient-to-br from-eco to-sense' :
                                                client.status === 'warning' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                                                'bg-gradient-to-br from-rose-500 to-red-600'
                                            }`}>
                                                {client.nama?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 leading-tight mb-1">{client.nama}</p>
                                                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold">
                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">{client.id}</span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {client.lokasi}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-1.5 bg-eco/10 text-eco px-2 py-1 rounded-lg border border-eco/20 mb-1">
                                                    <Cpu className="w-3 h-3" />
                                                    <span className="text-xs font-black">{client.jumlahBieon}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">Hubs</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-2 py-1 rounded-lg border border-teal-100 mb-1">
                                                    <Package className="w-3 h-3" />
                                                    <span className="text-xs font-black">{client.jumlahDevice}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">Devices</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex justify-center">
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-black text-[11px] uppercase tracking-wider ${
                                                client.status === 'online' ? 'bg-eco/10 text-eco border-eco/20 shadow-sm shadow-eco/10' :
                                                client.status === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-100' :
                                                'bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-100 animate-pulse'
                                            }`}>
                                                <div className={`w-2 h-2 rounded-full ${
                                                    client.status === 'online' ? 'bg-eco' :
                                                    client.status === 'warning' ? 'bg-amber-500' :
                                                    'bg-rose-500'
                                                }`} />
                                                {client.status === 'online' ? 'System Normal' :
                                                 client.status === 'warning' ? 'Warning Alert' :
                                                 'System Down'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="max-w-[200px]">
                                            <p className="text-xs font-bold text-gray-700 mb-1 truncate">{client.statusSistem}</p>
                                            <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase">
                                                <span className="text-eco">{client.devicesOnline} ON</span>
                                                <span className="text-rose-400">{client.devicesOffline} OFF</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-eco hover:text-white transition-all active:scale-90 shadow-sm">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredClients.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1">Hasil Tidak Ditemukan</h4>
                        <p className="text-gray-500 text-sm">Coba gunakan kata kunci lain atau filter status yang berbeda.</p>
                    </div>
                )}

                <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400">
                        Menampilkan <span className="text-gray-900">{filteredClients.length}</span> dari {clients.length} pelanggan ditangani
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-eco" />
                            <span className="text-[10px] font-black text-gray-600 uppercase">Live Sync Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

