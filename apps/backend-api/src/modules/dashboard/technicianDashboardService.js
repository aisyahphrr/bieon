const User = require('../../models/User');
const Hub = require('../../models/Hub');
const Device = require('../../models/Device');
const Complaint = require('../../models/Complaint');
const KendaliPerangkat = require('../../models/KendaliPerangkat');
const TechnicianAccess = require('../../models/TechnicianAccess');

/**
 * Mendapatkan metrik ringkasan untuk dashboard teknisi
 */
exports.getMetrics = async (technicianId) => {
    const mongoose = require('mongoose');
    const techObjectId = new mongoose.Types.ObjectId(technicianId);

    // 1. Total Pelanggan Ditangani
    const clients = await User.find({ assignedTechnician: techObjectId, role: 'Homeowner' }).select('_id');
    const clientIds = clients.map(c => c._id);
    const totalClients = clients.length;

    // 2. Akses Kendali Perangkat (Total Access Codes)
    const totalAccessCodes = await TechnicianAccess.countDocuments({ technicianId: techObjectId });

    // 3. Smart Device Aktif (Total Devices dari KendaliPerangkat)
    const totalDevices = await KendaliPerangkat.countDocuments({ 
        owner: { $in: clientIds }
    });

    // 4. Pengaduan Aktif
    const activeComplaints = await Complaint.countDocuments({ 
        homeowner: { $in: clientIds },
        status: { $nin: ['selesai', 'ditolak'] }
    });

    return {
        totalClients,
        totalAccessCodes,
        totalDevices,
        activeComplaints
    };
};

/**
 * Mendapatkan data grafik untuk dashboard teknisi
 */
exports.getCharts = async (technicianId, year = new Date().getFullYear()) => {
    const mongoose = require('mongoose');
    const techObjectId = new mongoose.Types.ObjectId(technicianId);
    
    const clients = await User.find({ assignedTechnician: techObjectId, role: 'Homeowner' }).select('_id');
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

    const bieonPerMonth = await months.map(async (m, i) => {
        const result = await TechnicianAccess.aggregate([
            {
                $match: {
                    technicianId: techObjectId,
                    createdAt: { 
                        $gte: new Date(year, i, 1), 
                        $lte: new Date(year, i, 31, 23, 59, 59) 
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ]);
        return { bulan: m, jumlah: result.length > 0 ? result[0].count : 0 };
    });
    
    const bieonPerMonthResolved = await Promise.all(bieonPerMonth);
    
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
        bieonPerMonth: bieonPerMonthResolved,
        klienPerMonth,
        pengaduanTrend
    };
};

/**
 * Mendapatkan daftar monitoring pelanggan untuk teknisi
 */
exports.getClientMonitoring = async (technicianId) => {
    // Explicitly cast to ObjectId to avoid any string vs ObjectId matching issues
    const mongoose = require('mongoose');
    const techObjectId = new mongoose.Types.ObjectId(technicianId);

    const clients = await User.find({ assignedTechnician: techObjectId, role: 'Homeowner' })
        .select('fullName technicianId address createdAt status systemName bieonId phoneNumber email currentLocation')
        .lean();

    const formattedClients = await Promise.all(clients.map(async (client) => {
        const hubs = await Hub.find({ owner: client._id }).lean();
        const devices = await KendaliPerangkat.find({ owner: client._id }).lean();
        
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

        // Hitung status perangkat secara spesifik (Active, 1, 0 dianggap Online)
        const devicesOnline = devices.filter(d => ['Active', '1', '0'].includes(d.status)).length;
        const devicesOffline = devices.length - devicesOnline;

        // Cek pengaduan aktif
        const activeComplaintsCount = await Complaint.countDocuments({
            homeowner: client._id,
            status: { $nin: ['selesai', 'ditolak'] }
        });
        const adaPengaduan = activeComplaintsCount > 0;
        const statusPengaduan = adaPengaduan ? `Ada (${activeComplaintsCount} tiket aktif)` : 'Tidak ada';

        // Extract location or use a mock fallback for demonstration if empty
        // In real app, coordinates should be set during registration/installation
        let lat = client.currentLocation?.lat;
        let lng = client.currentLocation?.lng;

        // Fallback: Generate simulated coordinates around Jakarta if missing
        // so the user can see "titik BIEON" on the map
        if (!lat || !lng) {
            // Jakarta center roughly: -6.2088, 106.8456
            const offsetLat = (Math.random() - 0.5) * 0.1; // +/- 0.05 deg
            const offsetLng = (Math.random() - 0.5) * 0.1; 
            lat = -6.2088 + offsetLat;
            lng = 106.8456 + offsetLng;
        }

        return {
            id: client.technicianId || `C-${client._id.toString().slice(-4).toUpperCase()}`,
            nama: client.fullName,
            lokasi: client.address || 'Unknown',
            lat,
            lng,
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
