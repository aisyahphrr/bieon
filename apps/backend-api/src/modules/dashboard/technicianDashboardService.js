const User = require('../../models/User');
const Hub = require('../../models/Hub');
const Device = require('../../models/Device');
const Complaint = require('../../models/Complaint');

/**
 * Mendapatkan metrik ringkasan untuk dashboard teknisi
 */
exports.getMetrics = async (technicianId) => {
    // 1. Total Pelanggan Ditangani
    const clients = await User.find({ assignedTechnician: technicianId, role: 'Homeowner' }).select('_id');
    const clientIds = clients.map(c => c._id);
    const totalClients = clients.length;

    // 2. Instalasi BIEON (Total Hubs)
    const totalHubs = await Hub.countDocuments({ owner: { $in: clientIds } });

    // 3. Smart Device Aktif (Total Devices)
    const totalDevices = await Device.countDocuments({ owner: { $in: clientIds } });

    // 4. Pengaduan Aktif
    const activeComplaints = await Complaint.countDocuments({ 
        homeowner: { $in: clientIds },
        status: { $nin: ['selesai', 'ditolak'] }
    });

    return {
        totalClients,
        totalHubs,
        totalDevices,
        activeComplaints
    };
};

/**
 * Mendapatkan data grafik untuk dashboard teknisi
 */
exports.getCharts = async (technicianId, year = new Date().getFullYear()) => {
    const clients = await User.find({ assignedTechnician: technicianId, role: 'Homeowner' }).select('_id');
    const clientIds = clients.map(c => c._id);

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    // Monthly data aggregation helper
    const aggregateMonthly = async (Model, matchField) => {
        const result = await Model.aggregate([
            {
                $match: {
                    [matchField]: { $in: clientIds },
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        return months.map((m, i) => {
            const found = result.find(r => r._id === i + 1);
            return { bulan: m, jumlah: found ? found.count : 0 };
        });
    };

    const bieonPerMonth = await aggregateMonthly(Hub, 'owner');
    
    // For clients growth, use User model
    const resultKlien = await User.aggregate([
        {
            $match: {
                _id: { $in: clientIds },
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);
    const klienPerMonth = months.map((m, i) => {
        const found = resultKlien.find(r => r._id === i + 1);
        return { bulan: m, jumlah: found ? found.count : 0 };
    });

    const pengaduanTrend = await aggregateMonthly(Complaint, 'homeowner');

    return {
        bieonPerMonth,
        klienPerMonth,
        pengaduanTrend
    };
};

/**
 * Mendapatkan daftar monitoring pelanggan untuk teknisi
 */
exports.getClientMonitoring = async (technicianId) => {
    const clients = await User.find({ assignedTechnician: technicianId, role: 'Homeowner' })
        .select('fullName technicianId address createdAt status systemName bieonId phoneNumber email')
        .lean();

    const formattedClients = await Promise.all(clients.map(async (client) => {
        const hubs = await Hub.find({ owner: client._id }).lean();
        const devices = await Device.find({ owner: client._id }).lean();
        
        const hubsCount = hubs.length;
        const devicesCount = devices.length;
        
        let systemStatus = 'Normal';
        let statusColor = 'online';
        
        if (hubsCount > 0) {
            const offlineHubs = hubs.filter(h => h.status === 'Offline').length;
            if (offlineHubs === hubsCount) {
                systemStatus = 'System Down';
                statusColor = 'offline';
            } else if (offlineHubs > 0) {
                systemStatus = 'Warning';
                statusColor = 'warning';
            }
        } else {
            systemStatus = 'No BIEON Installed';
            statusColor = 'warning';
        }

        // Hitung status perangkat secara spesifik
        const devicesOnline = devices.filter(d => d.status === 'ON' || d.status === 'OFF').length;
        const devicesOffline = devices.filter(d => d.status === 'OFFLINE').length;

        // Cek pengaduan aktif
        const activeComplaintsCount = await Complaint.countDocuments({
            homeowner: client._id,
            status: { $nin: ['selesai', 'ditolak'] }
        });
        const adaPengaduan = activeComplaintsCount > 0;
        const statusPengaduan = adaPengaduan ? `Ada (${activeComplaintsCount} tiket aktif)` : 'Tidak ada';

        return {
            id: client.technicianId || `C-${client._id.toString().slice(-4).toUpperCase()}`,
            nama: client.fullName,
            lokasi: client.address || 'Unknown',
            status: statusColor,
            jumlahBieon: hubsCount,
            jumlahDevice: devicesCount,
            statusSistem: systemStatus,
            alamatLengkap: client.address || '-',
            noTelp: client.phoneNumber || '-',
            email: client.email || '-',
            tanggalInstalasi: client.createdAt ? client.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-',
            lastUpdate: 'Terbaru',
            adaPengaduan,
            statusPengaduan,
            devicesOnline,
            devicesOffline
        };
    }));

    return formattedClients;
};
