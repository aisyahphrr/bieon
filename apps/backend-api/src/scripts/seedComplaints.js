require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const dns = require('dns');

// Paksa Node.js gunakan DNS Google/Cloudflare agar menembus blokir DNS WiFi kantor/ISP
// Ini memperbaiki error querySrv ECONNREFUSED
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    const months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    try {
        const [datePart, timePart] = dateStr.split(', ');
        const [day, monthStr, year] = datePart.split(' ');
        const [hours, minutes] = timePart.split(':');
        return new Date(parseInt(year), months[monthStr], parseInt(day), parseInt(hours), parseInt(minutes));
    } catch (err) {
        return new Date();
    }
};

const initialComplaints = [
    // --- SKENARIO TEST SLA & BUTTON AKSI ---
    {
        id: 'TCK-SLA-01',
        topic: 'Status Baru (Tanpa Teknisi)',
        device: 'Gateway Utama',
        technicianName: null,
        status: 'unassigned',
        category: 'Konektivitas',
        description: 'Menampilkan tombol [Tugaskan, Tolak].',
        timeline: [{ time: 'Dynamic', desc: 'Laporan dibuat.', status: 'unassigned' }]
    },
    {
        id: 'TCK-SLA-02',
        topic: 'Respons Aman (8 Menit)',
        device: 'Smart Plug',
        technicianName: 'AlanPenggendong',
        status: 'menunggu respons',
        category: 'Energi',
        description: 'Timer > 00:00. Tombol: [Detail].',
        dynamicDates: { assignedAtOffset: 8 * 60 * 1000 },
        timeline: [{ time: 'Dynamic', desc: 'Tiket ditugaskan.', status: 'menunggu respons' }]
    },
    {
        id: 'TCK-SLA-03',
        topic: 'Respons Warning (20 Menit)',
        device: 'Power Meter',
        technicianName: 'AlanPenggendong',
        status: 'menunggu respons',
        category: 'Energi',
        description: 'Timer <= 00:00 (Mundur). Tombol: [Ping]. Warna Ambar.',
        dynamicDates: { assignedAtOffset: 20 * 60 * 1000 },
        timeline: [{ time: 'Dynamic', desc: 'Tiket ditugaskan.', status: 'menunggu respons' }]
    },
    {
        id: 'TCK-SLA-04',
        topic: 'Respons Kritis (35 Menit)',
        device: 'Water Leak',
        technicianName: 'AlanPenggendong',
        status: 'menunggu respons',
        category: 'Keamanan',
        description: 'Timer <= -15:00. Tombol: [Alihkan]. Label: Overdue Respons. Warna Merah.',
        dynamicDates: { assignedAtOffset: 35 * 60 * 1000 },
        timeline: [{ time: 'Dynamic', desc: 'Tiket ditugaskan.', status: 'menunggu respons' }]
    },
    {
        id: 'TCK-SLA-05',
        topic: 'Perbaikan Aman (10 Jam)',
        device: 'Air Nodes',
        technicianName: 'AlanPenggendong',
        status: 'diproses',
        category: 'Lingkungan',
        description: 'Timer > 00:00. Tombol: [Detail].',
        dynamicDates: { processStartedAtOffset: 10 * 60 * 60 * 1000 },
        timeline: [{ time: 'Dynamic', desc: 'Mulai diagnosa.', status: 'diproses' }]
    },
    {
        id: 'TCK-SLA-06',
        topic: 'Perbaikan Warning (50 Jam)',
        device: 'Gas Detector',
        technicianName: 'AlanPenggendong',
        status: 'diproses',
        category: 'Keamanan',
        description: 'Timer <= 00:00. Tombol: [Ping]. Warna Ambar.',
        dynamicDates: { processStartedAtOffset: 50 * 60 * 60 * 1000 },
        timeline: [{ time: 'Dynamic', desc: 'Mulai diagnosa.', status: 'diproses' }]
    },
    {
        id: 'TCK-SLA-07',
        topic: 'Perbaikan Kritis (65 Jam)',
        device: 'Smart Door Lock',
        technicianName: 'AlanPenggendong',
        status: 'diproses',
        category: 'Keamanan',
        description: 'Timer <= -08:00. Tombol: [Alihkan]. Label: Overdue Perbaikan. Warna Merah.',
        dynamicDates: { processStartedAtOffset: 65 * 60 * 60 * 1000 },
        timeline: [{ time: 'Dynamic', desc: 'Mulai diagnosa.', status: 'diproses' }]
    },
    // --- DATA HISTORIS ---
    {
        id: 'TCK-0105',
        topic: 'Smart Plug kipas exhaust tidak bisa di-ON-kan via web',
        device: 'Smart Plug (Exhaust) - R3 Kitchen',
        technicianName: null,
        status: 'unassigned',
        category: 'Energi & Kelistrikan',
        description: 'Saya sudah mencoba menyalakan kipas exhaust melalui web dashboard tapi tidak ada respons.',
        timeline: [{ time: '26 Feb 2026, 08:15', desc: 'Laporan pengaduan berhasil dibuat.', status: 'unassigned' }]
    }
];

const seedDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bieon_db';
        await mongoose.connect(uri);
        console.log('Berhasil terhubung ke MongoDB');

        await Complaint.deleteMany({});
        console.log('Menghapus data pengaduan lama...');

        // 1. Homeowner (Pelanggan)
        let owner = await User.findOne({ email: 'akuntest1@example.com' });
        if (owner) {
            owner.password = '1234';
            owner.role = 'Homeowner';
            await owner.save();
        } else {
            owner = new User({ fullName: 'Akun Test 1', email: 'akuntest1@example.com', password: '1234', role: 'Homeowner', phoneNumber: '+62 856-890-689', address: 'Kartika Wanasari', bieonId: 'BIEON-001' });
            await owner.save();
        }

        // 2. SuperAdmin
        let admin = await User.findOne({ email: 'superadmin@bieon.com' });
        if (admin) {
            admin.password = 'superadmin123';
            admin.role = 'SuperAdmin';
            await admin.save();
        } else {
            admin = new User({ fullName: 'Super Admin BIEON', email: 'superadmin@bieon.com', password: 'superadmin123', role: 'SuperAdmin', phoneNumber: '+62 800-000-000' });
            await admin.save();
        }

        // 3. Technician (Alan)
        let techAlan = await User.findOne({ email: 'agalagan@example.com' });
        if (techAlan) {
            techAlan.fullName = 'AlanPenggendong';
            techAlan.password = 'alansukapisang';
            techAlan.role = 'Technician';
            await techAlan.save();
        } else {
            techAlan = new User({ fullName: 'AlanPenggendong', email: 'agalagan@example.com', password: 'alansukapisang', role: 'Technician', phoneNumber: '+62 812-345-678' });
            await techAlan.save();
        }

        const seedData = initialComplaints.map(item => {
            let techId = null;
            if (item.technicianName === 'AlanPenggendong') techId = techAlan._id;

            let createdAt = new Date();
            let assignedAt = null;
            let processStartedAt = null;

            if (item.dynamicDates) {
                const now = Date.now();
                if (item.dynamicDates.assignedAtOffset) {
                    assignedAt = new Date(now - item.dynamicDates.assignedAtOffset);
                    createdAt = new Date(assignedAt.getTime() - 15 * 60 * 1000); // 15m before assigned
                }
                if (item.dynamicDates.processStartedAtOffset) {
                    processStartedAt = new Date(now - item.dynamicDates.processStartedAtOffset);
                    assignedAt = new Date(processStartedAt.getTime() - 30 * 60 * 1000); // 30m before process
                    createdAt = new Date(assignedAt.getTime() - 15 * 60 * 1000);
                }
            } else {
                const createdAtEntry = item.timeline.find(t => t.desc.toLowerCase().includes('dibuat'));
                createdAt = createdAtEntry ? parseDateString(createdAtEntry.time) : new Date();

                const assignedEntry = item.timeline.find(t => t.desc.toLowerCase().includes('diterima') || t.desc.toLowerCase().includes('ditugaskan'));
                assignedAt = assignedEntry ? parseDateString(assignedEntry.time) : null;

                const progressEntry = item.timeline.find(t => t.desc.toLowerCase().includes('diagnosa') || t.desc.toLowerCase().includes('pengecekan') || t.desc.toLowerCase().includes('tiba'));
                processStartedAt = progressEntry ? parseDateString(progressEntry.time) : null;
            }

            return {
                topic: item.topic,
                category: item.category,
                device: item.device,
                desc: item.description || item.desc,
                status: item.status.toLowerCase(),
                homeowner: owner._id,
                technician: techId,
                timeline: item.timeline.map(t => ({
                    ...t,
                    time: t.time === 'Dynamic' ? createdAt.toLocaleString() : t.time,
                    status: t.status ? t.status.toLowerCase() : undefined
                })),
                files: item.files || [],
                rating: item.rating ? item.rating : undefined,
                createdAt: createdAt,
                updatedAt: createdAt,
                assignedAt: assignedAt,
                processStartedAt: processStartedAt
            };
        });

        await Complaint.insertMany(seedData);
        console.log(`Berhasil seeding ${seedData.length} data dengan skenario SLA dinamis!`);
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error saat seeding:', error);
        process.exit(1);
    }
};

seedDB();
