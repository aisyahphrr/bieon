require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Complaint = require('../src/models/Complaint');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bieon_db';

const seedAlan = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Update/Create Alan Penggendong
        const alanData = {
            email: 'alan@bieon.id',
            fullName: 'Alan Penggendong',
            username: 'alan_pro',
            role: 'Technician',
            technicianId: 'TECH-001',
            nik: '3201234567890001',
            joinDate: new Date('2023-01-15'),
            position: 'Senior Field Engineer',
            experience: 5,
            specializations: ['Smart Home Automation', 'Electrical Safety', 'Solar Panel Maintenance'],
            assignedRegion: 'Jawa Barat',
            workArea: 'Bandung Raya',
            coverageAreas: ['Cibeunying', 'Coblong', 'Dago', 'Lembang'],
            workSchedule: {
                'Senin': '08:00 - 17:00',
                'Selasa': '08:00 - 17:00',
                'Rabu': '08:00 - 17:00',
                'Kamis': '08:00 - 17:00',
                'Jumat': '08:00 - 17:00',
                'Sabtu': '09:00 - 15:00',
                'Minggu': 'Off'
            },
            certifications: [
                {
                    name: 'Certified Smart Home Professional (CSHP)',
                    issuer: 'Global Tech Institute',
                    startDate: new Date('2023-05-01'),
                    endDate: new Date('2026-05-01')
                },
                {
                    name: 'K3 Listrik Industri',
                    issuer: 'BNSP',
                    startDate: new Date('2022-10-10'),
                    endDate: new Date('2025-10-10')
                }
            ],
            trainingHistory: [
                {
                    name: 'BIEON Masterclass: IoT Ecosystem',
                    instructor: 'Dr. Tech Guru',
                    endDate: new Date('2024-02-15')
                },
                {
                    name: 'Customer Service Excellence',
                    instructor: 'Susi Management',
                    endDate: new Date('2023-11-20')
                }
            ],
            status: 'aktif'
        };

        let alan = await User.findOne({ email: alanData.email });
        if (alan) {
            console.log('Updating existing Alan...');
            Object.assign(alan, alanData);
            await alan.save();
        } else {
            console.log('Creating new Alan...');
            alanData.password = 'password123'; // Default password
            alan = await User.create(alanData);
        }

        console.log('Alan Penggendong seeded successfully!');

        // 2. Buat Dummy Complaints agar statistik muncul
        const count = await Complaint.countDocuments({ technician: alan._id });
        if (count === 0) {
            console.log('Seeding dummy complaints for stats...');
            
            const dummyComplaints = [
                {
                    topic: 'Korsleting Listrik Ruang Tamu',
                    category: 'Keamanan',
                    device: 'BIEON Power Node',
                    desc: 'Ditemukan kabel terbakar karena beban berlebih.',
                    status: 'selesai',
                    homeowner: new mongoose.Types.ObjectId(), // Random ID
                    technician: alan._id,
                    responsePoints: 100,
                    repairPoints: 95,
                    rating: { stars: 5, review: 'Sangat cepat dan rapi!' },
                    createdAt: new Date('2024-04-01T08:00:00Z'),
                    completedAt: new Date('2024-04-01T10:00:00Z')
                },
                {
                    topic: 'Sensor Air Tidak Deteksi Kekeruhan',
                    category: 'Air Sanitasi',
                    device: 'Water Quality Sensor',
                    desc: 'Lensa sensor kotor, sudah dibersihkan.',
                    status: 'selesai',
                    homeowner: new mongoose.Types.ObjectId(),
                    technician: alan._id,
                    responsePoints: 90,
                    repairPoints: 85,
                    rating: { stars: 4, review: 'Bagus, teknisinya ramah.' },
                    createdAt: new Date('2024-04-05T09:00:00Z'),
                    completedAt: new Date('2024-04-05T13:00:00Z')
                }
            ];

            await Complaint.insertMany(dummyComplaints);
            console.log('Dummy complaints seeded!');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding Alan:', error);
        process.exit(1);
    }
};

seedAlan();
