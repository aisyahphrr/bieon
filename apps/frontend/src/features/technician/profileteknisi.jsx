import { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Award,
    Briefcase,
    Clock,
    Star,
    TrendingUp,
    Shield,
    Edit3,
    Save,
    X,
    Camera,
    Lock,
    CheckCircle,
    Users,
    Wrench,
    Target,
    Activity,
    BookOpen,
    MapPinned,
    LogOut
} from 'lucide-react';



const mockProfile = {
    id: 'TECH001',
    username: 'budi.santoso',
    fullName: 'Budi Santoso, S.T.',
    email: 'budi.santoso@bieon.id',
    phone: '+62 812-3456-7890',
    address: 'Jl. Sudirman No. 45, Bandung, Jawa Barat 40123',
    dateJoined: '15 Januari 2023',
    nik: '3273012345678901',
    birthDate: '12 Maret 1995',
    photoUrl: '',
    position: 'Senior Technician',
    specialization: ['IoT Systems', 'Smart Home Integration', 'Network Configuration', 'Electrical Systems'],
    experienceYears: 5,
    employeeId: 'BIEON-TECH-001',
    certifications: [
        {
            name: 'Certified IoT Professional (CIoTP)',
            issuer: 'IoT Council International',
            date: '10 Juni 2023',
            validUntil: '10 Juni 2026'
        },
        {
            name: 'Smart Home Installation Expert',
            issuer: 'BIEON Academy',
            date: '20 Februari 2023',
            validUntil: 'Seumur Hidup'
        },
        {
            name: 'Electrical Installation Certified',
            issuer: 'Kementerian ESDM',
            date: '05 Januari 2022',
            validUntil: '05 Januari 2027'
        },
        {
            name: 'Network Security Fundamentals',
            issuer: 'Cisco Networking Academy',
            date: '15 Agustus 2022',
            validUntil: 'Seumur Hidup'
        }
    ],
    totalInstallations: 156,
    totalRepairs: 89,
    averageRating: 4.8,
    totalReviews: 134,
    averageCompletionTime: '2.5 jam',
    clientSatisfaction: 96,
    workSchedule: [
        { day: 'Senin', hours: '08:00 - 17:00' },
        { day: 'Selasa', hours: '08:00 - 17:00' },
        { day: 'Rabu', hours: '08:00 - 17:00' },
        { day: 'Kamis', hours: '08:00 - 17:00' },
        { day: 'Jumat', hours: '08:00 - 17:00' },
        { day: 'Sabtu', hours: '09:00 - 14:00' },
        { day: 'Minggu', hours: 'Off' }
    ],
    coverageAreas: ['Bandung Kota', 'Bandung Timur', 'Cimahi', 'Bandung Barat'],
    availabilityStatus: 'Available',
    skills: [
        { name: 'Kecepatan Respons', level: 5 },
        { name: 'Kecepatan Perbaikan', level: 4 },
        { name: 'Keramahan & Komunikasi', level: 5 }
    ],
    trainings: [
        {
            name: 'Advanced BIEON System Integration',
            completedDate: '10 Januari 2025',
            instructor: 'Ir. Ahmad Ridwan'
        },
        {
            name: 'Customer Relationship Management',
            completedDate: '15 Desember 2024',
            instructor: 'Siti Nurhaliza, M.M.'
        }
    ],
    recentWork: [
        {
            id: 'W001',
            type: 'Installation',
            clientName: 'Ahmad Fauzi',
            location: 'Jl. Setiabudi, Bandung',
            date: '05 Maret 2026',
            status: 'Completed',
            rating: 5
        },
        {
            id: 'W002',
            type: 'Repair',
            clientName: 'Siti Nurhaliza',
            location: 'Jl. Mampang, Jakarta',
            date: '03 Maret 2026',
            status: 'Completed',
            rating: 5
        },
        {
            id: 'W003',
            type: 'Maintenance',
            clientName: 'Budi Prasetyo',
            location: 'Jl. Dago, Bandung',
            date: '01 Maret 2026',
            status: 'Completed',
            rating: 4
        },
        {
            id: 'W004',
            type: 'Configuration',
            clientName: 'Dewi Kusuma',
            location: 'Jl. Cihampelas, Bandung',
            date: '28 Februari 2026',
            status: 'Completed',
            rating: 5
        },
        {
            id: 'W005',
            type: 'Installation',
            clientName: 'Rizky Firmansyah',
            location: 'Jl. Riau, Bandung',
            date: '25 Februari 2026',
            status: 'Completed',
            rating: 5
        }
    ]
};

export function TechnicianProfilePage({ onNavigate }) {
    const [profile, setProfile] = useState(mockProfile);
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [isEditingCertifications, setIsEditingCertifications] = useState(false);
    const [isEditingTrainings, setIsEditingTrainings] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [editedProfile, setEditedProfile] = useState(profile);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSavePersonal = () => {
        setProfile(editedProfile);
        setIsEditingPersonal(false);
    };

    const handleCancelPersonal = () => {
        setEditedProfile(profile);
        setIsEditingPersonal(false);
    };



    const handleSaveCertifications = () => {
        setProfile(editedProfile);
        setIsEditingCertifications(false);
    };

    const handleCancelCertifications = () => {
        setEditedProfile(profile);
        setIsEditingCertifications(false);
    };

    const handleSaveTrainings = () => {
        setProfile(editedProfile);
        setIsEditingTrainings(false);
    };

    const handleCancelTrainings = () => {
        setEditedProfile(profile);
        setIsEditingTrainings(false);
    };





    const handleChangePassword = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Password baru dan konfirmasi password tidak cocok!');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            alert('Password minimal 8 karakter!');
            return;
        }
        alert('Password berhasil diubah!');
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setIsChangingPassword(false);
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8">
            <div className="w-full">
                {/* Header with Cover Photo */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl shadow-xl mb-6 overflow-hidden relative h-32 sm:h-48">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl shadow-xl -mt-16 sm:-mt-24 mb-6 relative z-10">
                    <div className="p-5 sm:p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                            {/* Photo */}
                            <div className="relative group -mt-10 md:mt-0">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-white shadow-2xl border-4 border-white overflow-hidden">
                                    {profile.photoUrl ? (
                                        <img src={profile.photoUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-5xl sm:text-6xl font-bold">BSS</span>
                                    )}
                                </div>
                                <button className="absolute bottom-2 right-2 w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>

                            {/* Basic Info */}
                            <div className="flex-1 w-full">
                                <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-4 gap-3">
                                    <div className="flex flex-col items-center md:items-start">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{profile.fullName}</h1>
                                        <p className="text-base sm:text-lg text-emerald-600 font-semibold mb-2">{profile.position}</p>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <span className="text-sm">@{profile.username}</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-sm">{profile.employeeId}</span>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${profile.availabilityStatus === 'Available'
                                            ? 'bg-green-50 text-green-600'
                                            : profile.availabilityStatus === 'On Task'
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {profile.availabilityStatus}
                                    </div>
                                </div>


                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Star className="w-4 h-4 text-amber-500" />
                                            <span className="text-2xl font-bold text-gray-900">{profile.averageRating}</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Rating</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Wrench className="w-4 h-4 text-blue-500" />
                                            <span className="text-2xl font-bold text-gray-900">{profile.totalInstallations}</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Instalasi</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="w-4 h-4 text-purple-500" />
                                            <span className="text-2xl font-bold text-gray-900">{profile.totalReviews}</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Review</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-4 h-4 text-orange-500" />
                                            <span className="text-2xl font-bold text-gray-900">{profile.clientSatisfaction}%</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Kepuasan</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Informasi Personal</h2>
                                        <p className="text-sm text-gray-600">Data pribadi teknisi</p>
                                    </div>
                                </div>
                                {!isEditingPersonal ? (
                                    <button
                                        onClick={() => setIsEditingPersonal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span className="text-sm font-semibold">Edit</span>
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSavePersonal}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Simpan</span>
                                        </button>
                                        <button
                                            onClick={handleCancelPersonal}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Batal</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                                    {isEditingPersonal ? (
                                        <input
                                            type="text"
                                            value={editedProfile.username}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">@{profile.username}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                                    {isEditingPersonal ? (
                                        <input
                                            type="text"
                                            value={editedProfile.fullName}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{profile.fullName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">NIK</label>
                                    {isEditingPersonal ? (
                                        <input
                                            type="text"
                                            value={editedProfile.nik}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, nik: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{profile.nik}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir</label>
                                    {isEditingPersonal ? (
                                        <input
                                            type="text"
                                            value={editedProfile.birthDate}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, birthDate: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{profile.birthDate}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    {isEditingPersonal ? (
                                        <input
                                            type="email"
                                            value={editedProfile.email}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            {profile.email}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon</label>
                                    {isEditingPersonal ? (
                                        <input
                                            type="tel"
                                            value={editedProfile.phone}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            {profile.phone}
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
                                    {isEditingPersonal ? (
                                        <textarea
                                            value={editedProfile.address}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                                            rows={2}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <div className="flex items-start gap-2 text-gray-900 font-medium">
                                            <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                            {profile.address}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Bergabung</label>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        {profile.dateJoined}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ID Karyawan</label>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Shield className="w-4 h-4 text-gray-500" />
                                        {profile.employeeId}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                                        <Briefcase className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Informasi Profesional</h2>
                                        <p className="text-sm text-gray-600">Data karir dan keahlian</p>
                                    </div>
                                </div>

                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Posisi</label>
                                        <p className="text-gray-900 font-medium">{profile.position}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Pengalaman (Tahun)</label>
                                        <p className="text-gray-900 font-medium">{profile.experienceYears} tahun</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Spesialisasi (Pisahkan dengan koma)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.specialization.map((spec, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-xl text-sm font-semibold"
                                                >
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Area Coverage (Pisahkan dengan koma)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.coverageAreas.map((area, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2"
                                                >
                                                    <MapPinned className="w-4 h-4" />
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Statistics */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Statistik Performa</h2>
                                    <p className="text-sm text-gray-600">Pencapaian dan metrik kerja</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-[#EBFFF9] rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Wrench className="w-5 h-5 text-emerald-600" />
                                        <span className="text-sm font-semibold text-gray-700">Total Instalasi</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{profile.totalInstallations}</p>
                                </div>

                                <div className="bg-[#F0F7FF] rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Target className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-700">Total Perbaikan</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{profile.totalRepairs}</p>
                                </div>

                                <div className="bg-[#FFF9EA] rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Star className="w-5 h-5 text-amber-500" />
                                        <span className="text-sm font-semibold text-gray-700">Rating</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{profile.averageRating} / 5.0</p>
                                    <p className="text-[10px] text-gray-500 mt-1">dari {profile.totalReviews} review</p>
                                </div>

                                <div className="bg-[#FAF5FF] rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Target className="w-5 h-5 text-purple-600" />
                                        <span className="text-sm font-semibold text-gray-700">Tingkat Kepatuhan SLA</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{profile.clientSatisfaction}%</p>
                                </div>

                                <div className="bg-[#F0F7FF] rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-700">Avg. Completion</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{profile.averageCompletionTime}</p>
                                </div>

                                <div className="bg-[#FFF5F5] rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle className="w-5 h-5 text-rose-500" />
                                        <span className="text-sm font-semibold text-gray-700">Total Pekerjaan</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{profile.totalInstallations + profile.totalRepairs}</p>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Skill & Kompetensi</h2>
                                        <p className="text-sm text-gray-600">Tingkat keahlian teknis</p>
                                    </div>
                                </div>

                            </div>

                            <div className="space-y-4">
                                        {profile.skills.map((skill, index) => (
                                            <div key={index}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-semibold text-gray-700">{skill.name}</span>
                                                    <span className="text-sm font-bold text-emerald-600">{skill.level}/5</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#009270] rounded-full transition-all"
                                                        style={{ width: `${(skill.level / 5) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                            </div>
                        </div>

                        {/* Recent Work History */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Riwayat Pekerjaan Terbaru</h2>
                                    <p className="text-sm text-gray-600">5 pekerjaan terakhir</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {profile.recentWork.map((work) => (
                                    <div
                                        key={work.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors gap-4"
                                    >
                                        <div className="flex items-start sm:items-center gap-4">
                                            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${work.type === 'Installation'
                                                    ? 'bg-emerald-100'
                                                    : work.type === 'Repair'
                                                        ? 'bg-orange-100'
                                                        : work.type === 'Maintenance'
                                                            ? 'bg-blue-100'
                                                            : 'bg-purple-100'
                                                }`}>
                                                <Wrench className={`w-6 h-6 ${work.type === 'Installation'
                                                        ? 'text-emerald-600'
                                                        : work.type === 'Repair'
                                                            ? 'text-orange-600'
                                                            : work.type === 'Maintenance'
                                                                ? 'text-blue-600'
                                                                : 'text-purple-600'
                                                    }`} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{work.clientName}</p>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600 mt-1">
                                                    <span className="font-medium text-emerald-600">{work.type}</span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="line-clamp-1">{work.location}</span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="whitespace-nowrap">{work.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0 pl-16 sm:pl-0">
                                            {work.rating && (
                                                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-lg">
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    <span className="text-sm font-bold text-amber-700">{work.rating}</span>
                                                </div>
                                            )}
                                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${work.status === 'Completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {work.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Security Settings */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Keamanan</h2>
                                    <p className="text-sm text-gray-600">Password & akun</p>
                                </div>
                            </div>

                            {!isChangingPassword ? (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl transition-colors font-semibold"
                                >
                                    <Lock className="w-5 h-5" />
                                    <span>Ganti Password</span>
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password Lama</label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Masukkan password lama"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password Baru</label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Masukkan password baru"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Konfirmasi password baru"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleChangePassword}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl transition-colors font-semibold"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>Simpan</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsChangingPassword(false);
                                                setPasswordData({
                                                    currentPassword: '',
                                                    newPassword: '',
                                                    confirmPassword: ''
                                                });
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors font-semibold"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Batal</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Work Schedule */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Jadwal Kerja</h2>
                                        <p className="text-sm text-gray-600">Jam operasional</p>
                                    </div>
                                </div>

                            </div>

                            <div className="space-y-2">
                                        {profile.workSchedule.map((schedule, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center justify-between p-3 rounded-xl ${schedule.hours === 'Off'
                                                        ? 'bg-gray-100'
                                                        : 'bg-gradient-to-r from-indigo-50 to-purple-50'
                                                    }`}
                                            >
                                                <span className="font-semibold text-gray-700">{schedule.day}</span>
                                                <span className={`text-sm font-medium ${schedule.hours === 'Off' ? 'text-gray-500' : 'text-indigo-600'
                                                    }`}>
                                                    {schedule.hours}
                                                </span>
                                            </div>
                                        ))}
                            </div>
                        </div>

                        {/* Certifications */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Sertifikasi</h2>
                                        <p className="text-sm text-gray-600">{profile.certifications.length} sertifikat</p>
                                    </div>
                                </div>
                                {!isEditingCertifications ? (
                                    <button
                                        onClick={() => setIsEditingCertifications(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span className="text-sm font-semibold">Edit</span>
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveCertifications}
                                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Simpan</span>
                                        </button>
                                        <button
                                            onClick={handleCancelCertifications}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Batal</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {isEditingCertifications ? (
                                    <>
                                        {editedProfile.certifications.map((cert, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 relative group">
                                                <button 
                                                    onClick={() => {
                                                        const newCerts = editedProfile.certifications.filter((_, i) => i !== index);
                                                        setEditedProfile({ ...editedProfile, certifications: newCerts });
                                                    }}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nama Sertifikat</label>
                                                        <input 
                                                            type="text" 
                                                            value={cert.name} 
                                                            onChange={(e) => {
                                                                const newCerts = [...editedProfile.certifications];
                                                                newCerts[index].name = e.target.value;
                                                                setEditedProfile({ ...editedProfile, certifications: newCerts });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Penerbit</label>
                                                        <input 
                                                            type="text" 
                                                            value={cert.issuer} 
                                                            onChange={(e) => {
                                                                const newCerts = [...editedProfile.certifications];
                                                                newCerts[index].issuer = e.target.value;
                                                                setEditedProfile({ ...editedProfile, certifications: newCerts });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tgl Perolehan</label>
                                                            <input 
                                                                type="text" 
                                                                value={cert.date} 
                                                                onChange={(e) => {
                                                                    const newCerts = [...editedProfile.certifications];
                                                                    newCerts[index].date = e.target.value;
                                                                    setEditedProfile({ ...editedProfile, certifications: newCerts });
                                                                }}
                                                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Berlaku S/D</label>
                                                            <input 
                                                                type="text" 
                                                                value={cert.validUntil} 
                                                                onChange={(e) => {
                                                                    const newCerts = [...editedProfile.certifications];
                                                                    newCerts[index].validUntil = e.target.value;
                                                                    setEditedProfile({ ...editedProfile, certifications: newCerts });
                                                                }}
                                                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => {
                                                setEditedProfile({ 
                                                    ...editedProfile, 
                                                    certifications: [...editedProfile.certifications, { name: '', issuer: '', date: '', validUntil: '' }] 
                                                });
                                            }}
                                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-amber-500 hover:text-amber-500 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>Tambah Sertifikat Baru</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {profile.certifications.map((cert, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <Award className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 mb-1">{cert.name}</h4>
                                                        <p className="text-sm text-gray-600 mb-2">{cert.issuer}</p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span>{cert.date}</span>
                                                            <span>•</span>
                                                            <span>Berlaku s/d: {cert.validUntil}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Training History */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Riwayat Training</h2>
                                        <p className="text-sm text-gray-600">{profile.trainings.length} training</p>
                                    </div>
                                </div>
                                {!isEditingTrainings ? (
                                    <button
                                        onClick={() => setIsEditingTrainings(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span className="text-sm font-semibold">Edit</span>
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveTrainings}
                                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Simpan</span>
                                        </button>
                                        <button
                                            onClick={handleCancelTrainings}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Batal</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {isEditingTrainings ? (
                                    <>
                                        {editedProfile.trainings.map((training, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 relative group">
                                                <button 
                                                    onClick={() => {
                                                        const newTrainings = editedProfile.trainings.filter((_, i) => i !== index);
                                                        setEditedProfile({ ...editedProfile, trainings: newTrainings });
                                                    }}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nama Training</label>
                                                        <input 
                                                            type="text" 
                                                            value={training.name} 
                                                            onChange={(e) => {
                                                                const newTrainings = [...editedProfile.trainings];
                                                                newTrainings[index].name = e.target.value;
                                                                setEditedProfile({ ...editedProfile, trainings: newTrainings });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Instruktur</label>
                                                        <input 
                                                            type="text" 
                                                            value={training.instructor} 
                                                            onChange={(e) => {
                                                                const newTrainings = [...editedProfile.trainings];
                                                                newTrainings[index].instructor = e.target.value;
                                                                setEditedProfile({ ...editedProfile, trainings: newTrainings });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tgl Selesai</label>
                                                        <input 
                                                            type="text" 
                                                            value={training.completedDate} 
                                                            onChange={(e) => {
                                                                const newTrainings = [...editedProfile.trainings];
                                                                newTrainings[index].completedDate = e.target.value;
                                                                setEditedProfile({ ...editedProfile, trainings: newTrainings });
                                                            }}
                                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => {
                                                setEditedProfile({ 
                                                    ...editedProfile, 
                                                    trainings: [...editedProfile.trainings, { name: '', instructor: '', completedDate: '' }] 
                                                });
                                            }}
                                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-teal-500 hover:text-teal-500 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>Tambah Training Baru</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {profile.trainings.map((training, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-200"
                                            >
                                                <h4 className="font-bold text-gray-900 mb-1">{training.name}</h4>
                                                <p className="text-sm text-gray-600 mb-1">Instruktur: {training.instructor}</p>
                                                <div className="flex items-center gap-2 text-xs text-teal-600 font-semibold">
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span>Selesai: {training.completedDate}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Account Actions Section */}
                        <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-red-50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                                    <LogOut className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Akun</h2>
                                    <p className="text-sm text-gray-600">Manajemen sesi</p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (onNavigate) {
                                        onNavigate('landing');
                                        setTimeout(() => {
                                            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                                        }, 0);
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all duration-300 font-bold group shadow-sm hover:shadow-red-200"
                            >
                                <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                <span>Logout dari Sistem</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
