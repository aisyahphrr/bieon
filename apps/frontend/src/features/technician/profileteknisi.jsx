import { useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, Calendar, Award, Briefcase, Clock, Star, TrendingUp,
    Shield, Edit3, Save, X, Camera, Lock, CheckCircle, Users, Wrench, Target,
    Activity, BookOpen, MapPinned, LogOut
} from 'lucide-react';

export function TechnicianProfilePage({ onNavigate }) {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentWork, setRecentWork] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errorData, setErrorData] = useState(null);

    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [isEditingCertifications, setIsEditingCertifications] = useState(false);
    const [isEditingTrainings, setIsEditingTrainings] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [editedProfile, setEditedProfile] = useState(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        if (!userId || !token) {
            setError('Sesi login berakhir. Silakan login kembali.');
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/technician/profile/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            
            if (result.success) {
                setProfile(result.data.profile);
                setStats(result.data.stats);
                setRecentWork(result.data.recentWork);
                setEditedProfile(result.data.profile);
                setError(null);
                setErrorData(null);
            } else {
                setError(result.message);
                setErrorData({ debug: result.debug, stack: result.stack });
            }
        } catch (err) {
            setError('Gagal memuat profil. Silakan coba lagi nanti.');
            setErrorData({ debug: err.message, stack: err.stack });
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (dataToUpdate) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/technician/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToUpdate)
            });
            const result = await response.json();
            if (result.success) {
                setProfile(result.data);
                alert('Profil berhasil diperbarui!');
                fetchProfile(); // Refresh for latest data
            } else {
                alert('Gagal update: ' + result.message);
            }
        } catch (err) {
            console.error('Update error:', err);
            alert('Terjadi kesalahan saat memperbarui profil.');
        }
    };

    const handleSavePersonal = () => {
        handleUpdateProfile({
            username: editedProfile.username,
            fullName: editedProfile.fullName,
            nik: editedProfile.nik,
            phoneNumber: editedProfile.phoneNumber,
            address: editedProfile.address,
            dateOfBirth: editedProfile.dateOfBirth,
            joinDate: editedProfile.joinDate
        });
        setIsEditingPersonal(false);
    };

    const handleCancelPersonal = () => {
        setEditedProfile(profile);
        setIsEditingPersonal(false);
    };

    const handleSaveCertifications = () => {
        handleUpdateProfile({ certifications: editedProfile.certifications });
        setIsEditingCertifications(false);
    };

    const handleCancelCertifications = () => {
        setEditedProfile(profile);
        setIsEditingCertifications(false);
    };

    const handleSaveTrainings = () => {
        handleUpdateProfile({ trainingHistory: editedProfile.trainingHistory });
        setIsEditingTrainings(false);
    };

    const handleCancelTrainings = () => {
        setEditedProfile(profile);
        setIsEditingTrainings(false);
    };

    const handleChangePassword = () => {
        alert('Fitur ganti password akan segera hadir!');
        setIsChangingPassword(false);
    };

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-emerald-600 font-semibold">Memuat Profil Teknisi...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-screen flex items-center justify-center p-6 overflow-auto">
                <div className="bg-red-50 text-red-600 p-8 rounded-3xl shadow-lg text-center max-w-2xl">
                    <X className="w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Error!</h2>
                    <p className="font-semibold">{error}</p>
                    {errorData?.debug && (
                        <div className="mt-4 p-4 bg-white/50 rounded-xl text-left text-xs font-mono break-all">
                            <p className="font-bold mb-1">Debug:</p>
                            <p>{errorData.debug}</p>
                            {errorData.stack && (
                                <details className="mt-2">
                                    <summary className="cursor-pointer font-bold">Stack Trace</summary>
                                    <pre className="mt-2 whitespace-pre-wrap">{errorData.stack}</pre>
                                </details>
                            )}
                        </div>
                    )}
                    <button onClick={fetchProfile} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl">Coba Lagi</button>
                </div>
            </div>
        );
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
                                         <span className="text-5xl sm:text-6xl font-bold">
                                             {profile.fullName.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase()}
                                         </span>
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
                                         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                             {profile.fullName.replace(/([a-z])([A-Z])/g, '$1 $2')}
                                         </h1>
                                         <p className="text-base sm:text-lg text-emerald-600 font-semibold mb-1">{profile.position || 'Teknisi BIEON'}</p>
                                         
                                         <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-600 mb-2">
                                             <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg">
                                                 <span className="text-xs font-bold">@{profile.username}</span>
                                             </div>
                                             <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-lg">
                                                 <span className="text-xs font-bold">{profile.technicianId}</span>
                                             </div>
                                             {profile.workArea && (
                                                 <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                                     <MapPin className="w-3.5 h-3.5" />
                                                     <span className="text-xs">{profile.workArea}</span>
                                                 </div>
                                             )}
                                         </div>
                                     </div>
                                     <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${profile.status === 'aktif'
                                             ? 'bg-green-50 text-green-600'
                                             : 'bg-gray-100 text-gray-700'
                                         }`}>
                                         {profile.status === 'aktif' ? 'Available' : 'Offline'}
                                     </div>
                                 </div>

                                 {/* Quick Stats */}
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4">
                                         <div className="flex items-center gap-2 mb-1">
                                             <Star className="w-4 h-4 text-amber-500" />
                                             <span className="text-2xl font-bold text-gray-900">{stats.avgRating}</span>
                                         </div>
                                         <p className="text-xs text-gray-600">Rating</p>
                                     </div>
                                     <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4">
                                         <div className="flex items-center gap-2 mb-1">
                                             <Wrench className="w-4 h-4 text-blue-500" />
                                             <span className="text-2xl font-bold text-gray-900">{stats.totalRepairs}</span>
                                         </div>
                                         <p className="text-xs text-gray-600">Perbaikan</p>
                                     </div>
                                     <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
                                         <div className="flex items-center gap-2 mb-1">
                                             <Users className="w-4 h-4 text-purple-500" />
                                             <span className="text-2xl font-bold text-gray-900">{stats.totalPekerjaan}</span>
                                         </div>
                                         <p className="text-xs text-gray-600">Pekerjaan</p>
                                     </div>
                                     <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4">
                                         <div className="flex items-center gap-2 mb-1">
                                             <TrendingUp className="w-4 h-4 text-orange-500" />
                                             <span className="text-2xl font-bold text-gray-900">{stats.complianceRate}%</span>
                                         </div>
                                         <p className="text-xs text-gray-600">Kepatuhan</p>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - Performance & History */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors self-end sm:self-auto"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span className="text-sm font-semibold">Edit</span>
                                    </button>
                                ) : (
                                    <div className="flex flex-wrap gap-2 justify-end self-end sm:self-auto">
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
                                        <p className="text-gray-900 font-medium">{profile.nik || '-'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir</label>
                                    {isEditingPersonal ? (
                                        <input
                                            type="date"
                                            value={editedProfile.dateOfBirth?.split('T')[0] || ''}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, dateOfBirth: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium">{formatDate(profile.dateOfBirth)}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        {profile.email}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon</label>
                                    {isEditingPersonal ? (
                                        <input
                                            type="tel"
                                            value={editedProfile.phoneNumber || ''}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, phoneNumber: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            {profile.phoneNumber || '-'}
                                        </div>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
                                    {isEditingPersonal ? (
                                        <textarea
                                            value={editedProfile.address || ''}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                                            rows={2}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <div className="flex items-start gap-2 text-gray-900 font-medium">
                                            <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                            {profile.address || '-'}
                                        </div>
                                    )}
                                </div>

                                <div>
                                     <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Bergabung</label>
                                     {isEditingPersonal ? (
                                         <input
                                             type="date"
                                             value={editedProfile.joinDate?.split('T')[0] || ''}
                                             onChange={(e) => setEditedProfile({ ...editedProfile, joinDate: e.target.value })}
                                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                         />
                                     ) : (
                                         <div className="flex items-center gap-2 text-gray-900 font-medium">
                                             <Calendar className="w-4 h-4 text-gray-500" />
                                             {formatDate(profile.joinDate)}
                                         </div>
                                     )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">ID Karyawan</label>
                                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                                        <Shield className="w-4 h-4 text-gray-500" />
                                        {profile.technicianId}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Informasi Profesional</h2>
                                    <p className="text-sm text-gray-600">Data karir dan keahlian</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Posisi</label>
                                        <p className="text-gray-900 font-medium">{profile.position || 'Teknisi'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Pengalaman (Tahun)</label>
                                        <p className="text-gray-900 font-medium">{profile.experience || 0} tahun</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Spesialisasi</label>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.specializations && profile.specializations.map((spec, index) => (
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Area Coverage</label>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.coverageAreas && profile.coverageAreas.map((area, index) => (
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
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalInstalasi}</p>
                                </div>

                                <div className="bg-[#F0F7FF] rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Target className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-700">Total Perbaikan</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalRepairs}</p>
                                </div>

                                <div className="bg-[#FFF9EA] rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Star className="w-5 h-5 text-amber-500" />
                                        <span className="text-sm font-semibold text-gray-700">Rating</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.avgRating} / 5.0</p>
                                    <p className="text-[10px] text-gray-500 mt-1">rata-rata performa</p>
                                </div>

                                <div className="bg-[#FAF5FF] rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Activity className="w-5 h-5 text-purple-600" />
                                        <span className="text-sm font-semibold text-gray-700">Kepatuhan SLA</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.complianceRate}%</p>
                                </div>

                                <div className="bg-[#F0F7FF] rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-700">Avg. Completion</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.avgCompletionHours} jam</p>
                                </div>

                                <div className="bg-[#FFF5F5] rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle className="w-5 h-5 text-rose-500" />
                                        <span className="text-sm font-semibold text-gray-700">Total Pekerjaan</span>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalPekerjaan}</p>
                                </div>
                            </div>
                        </div>

                        {/* Skills & Competencies */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Skill & Kompetensi</h2>
                                    <p className="text-sm text-gray-600">Tingkat keahlian teknis</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { name: 'Kecepatan Respons', level: stats.responseSpeed },
                                    { name: 'Kecepatan Perbaikan', level: stats.repairSpeed },
                                    { name: 'Rating Layanan', level: stats.avgRating }
                                ].map((skill, index) => (
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
                                {recentWork && recentWork.length > 0 ? recentWork.map((work) => (
                                    <div
                                        key={work._id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors gap-4"
                                    >
                                        <div className="flex items-start sm:items-center gap-4">
                                            <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100">
                                                <Wrench className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{work.homeowner?.fullName || 'Pelanggan BIEON'}</p>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600 mt-1">
                                                    <span className="font-medium text-emerald-600">{work.category}</span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="line-clamp-1">{work.homeowner?.address || 'Lokasi tidak tersedia'}</span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="whitespace-nowrap">{formatDate(work.completedAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0 pl-16 sm:pl-0">
                                            {work.rating && work.rating.stars && (
                                                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-lg">
                                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                    <span className="text-sm font-bold text-amber-700">{work.rating.stars}</span>
                                                </div>
                                            )}
                                            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                                                {work.status}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-500 font-medium">Belum ada riwayat pekerjaan selesai.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Settings & Credentials */}
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
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Jadwal Kerja</h2>
                                    <p className="text-sm text-gray-600">Jam operasional</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {profile.workSchedule ? Object.entries(profile.workSchedule).map(([day, hours], index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-between p-3 rounded-xl ${hours === 'Off' ? 'bg-gray-50' : 'bg-indigo-50/50'}`}
                                    >
                                        <span className="text-sm font-semibold text-gray-700">{day}</span>
                                        <span className={`text-xs font-bold ${hours === 'Off' ? 'text-red-500' : 'text-indigo-600'}`}>
                                            {hours}
                                        </span>
                                    </div>
                                )) : <p className="text-center text-gray-400 text-sm py-4">Jadwal belum dikonfigurasi</p>}
                            </div>
                        </div>

                        {/* Certifications */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors self-end sm:self-auto"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span className="text-sm font-semibold">Edit</span>
                                    </button>
                                ) : (
                                    <div className="flex flex-wrap gap-2 justify-end self-end sm:self-auto">
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
                                    <div className="space-y-4">
                                        {editedProfile.certifications.map((cert, idx) => (
                                            <div key={idx} className="p-4 bg-gray-50 rounded-2xl space-y-3 relative group border-2 border-transparent hover:border-amber-200 transition-all">
                                                <button 
                                                    onClick={() => {
                                                        const newCerts = editedProfile.certifications.filter((_, i) => i !== idx);
                                                        setEditedProfile({ ...editedProfile, certifications: newCerts });
                                                    }}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nama Sertifikasi</label>
                                                    <input
                                                        type="text"
                                                        value={cert.name}
                                                        onChange={(e) => {
                                                            const newCerts = [...editedProfile.certifications];
                                                            newCerts[idx].name = e.target.value;
                                                            setEditedProfile({ ...editedProfile, certifications: newCerts });
                                                        }}
                                                        placeholder="Contoh: BNSP IoT Engineer"
                                                        className="w-full text-sm font-bold bg-white px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-amber-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Penerbit</label>
                                                    <input
                                                        type="text"
                                                        value={cert.issuer}
                                                        onChange={(e) => {
                                                            const newCerts = [...editedProfile.certifications];
                                                            newCerts[idx].issuer = e.target.value;
                                                            setEditedProfile({ ...editedProfile, certifications: newCerts });
                                                        }}
                                                        placeholder="Contoh: BPJS Ketenagakerjaan"
                                                        className="w-full text-xs bg-white px-3 py-2 border border-gray-200 rounded-lg outline-none"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tgl Terbit</label>
                                                        <input
                                                            type="date"
                                                            value={cert.startDate?.split('T')[0] || ''}
                                                            onChange={(e) => {
                                                                const newCerts = [...editedProfile.certifications];
                                                                newCerts[idx].startDate = e.target.value;
                                                                setEditedProfile({ ...editedProfile, certifications: newCerts });
                                                            }}
                                                            className="w-full text-xs bg-white px-3 py-2 border border-gray-200 rounded-lg outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Valid s/d</label>
                                                        <input
                                                            type="date"
                                                            value={cert.endDate?.split('T')[0] || ''}
                                                            onChange={(e) => {
                                                                const newCerts = [...editedProfile.certifications];
                                                                newCerts[idx].endDate = e.target.value;
                                                                setEditedProfile({ ...editedProfile, certifications: newCerts });
                                                            }}
                                                            className="w-full text-xs bg-white px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-amber-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setEditedProfile({
                                                ...editedProfile,
                                                certifications: [...editedProfile.certifications, { name: '', issuer: '', startDate: '', endDate: '' }]
                                            })}
                                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-amber-500 hover:text-amber-500 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Award className="w-4 h-4" />
                                            <span>Tambah Sertifikat Baru</span>
                                        </button>
                                    </div>
                                ) : (
                                    profile.certifications && profile.certifications.length > 0 ? profile.certifications.map((cert, index) => {
                                        const isExpired = cert.endDate && new Date(cert.endDate) < new Date();
                                        return (
                                            <div key={index} className={`flex gap-3 items-start p-4 rounded-2xl transition-all ${isExpired ? 'bg-red-50 border border-red-100 shadow-sm' : 'bg-gray-50 hover:bg-amber-50'}`}>
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isExpired ? 'bg-red-100' : 'bg-amber-100'}`}>
                                                    <Award className={`w-6 h-6 ${isExpired ? 'text-red-600' : 'text-amber-600'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <p className="text-sm font-bold text-gray-900">{cert.name}</p>
                                                        {isExpired && (
                                                            <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase rounded-full animate-pulse">Expired</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium mb-2">{cert.issuer}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className={`w-3 h-3 ${isExpired ? 'text-red-400' : 'text-gray-400'}`} />
                                                        <p className={`text-[10px] font-bold ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            {isExpired ? 'Kadaluarsa pada ' : 'Valid s/d '} {formatDate(cert.endDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center py-8 text-gray-400 font-medium">Belum ada sertifikasi terdaftar.</div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Training History */}
                        <div className="bg-white rounded-3xl shadow-lg p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Riwayat Training</h2>
                                        <p className="text-sm text-gray-600">{profile.trainingHistory.length} training</p>
                                    </div>
                                </div>
                                {!isEditingTrainings ? (
                                    <button
                                        onClick={() => setIsEditingTrainings(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors self-end sm:self-auto"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span className="text-sm font-semibold">Edit</span>
                                    </button>
                                ) : (
                                    <div className="flex flex-wrap gap-2 justify-end self-end sm:self-auto">
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
                                    <div className="space-y-4">
                                        {editedProfile.trainingHistory.map((training, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-teal-200 transition-all relative group">
                                                <button 
                                                    onClick={() => {
                                                        const newTrainings = editedProfile.trainingHistory.filter((_, i) => i !== index);
                                                        setEditedProfile({ ...editedProfile, trainingHistory: newTrainings });
                                                    }}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="md:col-span-2">
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nama Training</label>
                                                        <input 
                                                            type="text" 
                                                            value={training.name} 
                                                            onChange={(e) => {
                                                                const newTrainings = [...editedProfile.trainingHistory];
                                                                newTrainings[index].name = e.target.value;
                                                                setEditedProfile({ ...editedProfile, trainingHistory: newTrainings });
                                                            }}
                                                            placeholder="Contoh: Pelatihan Maintenance IoT"
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Instruktur</label>
                                                        <input 
                                                            type="text" 
                                                            value={training.instructor} 
                                                            onChange={(e) => {
                                                                const newTrainings = [...editedProfile.trainingHistory];
                                                                newTrainings[index].instructor = e.target.value;
                                                                setEditedProfile({ ...editedProfile, trainingHistory: newTrainings });
                                                            }}
                                                            placeholder="Nama Instruktur"
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tgl Selesai</label>
                                                        <input 
                                                            type="date" 
                                                            value={training.endDate?.split('T')[0] || ''} 
                                                            onChange={(e) => {
                                                                const newTrainings = [...editedProfile.trainingHistory];
                                                                newTrainings[index].endDate = e.target.value;
                                                                setEditedProfile({ ...editedProfile, trainingHistory: newTrainings });
                                                            }}
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => {
                                                setEditedProfile({ 
                                                    ...editedProfile, 
                                                    trainingHistory: [...editedProfile.trainingHistory, { name: '', instructor: '', endDate: '' }] 
                                                });
                                            }}
                                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-teal-500 hover:text-teal-500 transition-all flex items-center justify-center gap-2"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                            <span>Tambah Training Baru</span>
                                        </button>
                                    </div>
                                ) : (
                                    profile.trainingHistory && profile.trainingHistory.length > 0 ? (
                                        profile.trainingHistory.map((training, index) => (
                                            <div key={index} className="p-4 bg-gray-50 hover:bg-teal-50 rounded-2xl border border-transparent hover:border-teal-100 transition-all">
                                                <h4 className="font-bold text-gray-900 mb-1">{training.name}</h4>
                                                <p className="text-sm text-gray-600 mb-2">Instruktur: {training.instructor}</p>
                                                <div className="flex items-center gap-2 text-xs text-teal-600 font-bold">
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span>Selesai: {formatDate(training.endDate)}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 font-medium">Belum ada riwayat training.</div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Logout Section */}
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
                                onClick={async () => {
                                    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
                                        try {
                                            // Set status ke nonaktif di database sebelum logout
                                            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/technician/profile/${userId}`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({ status: 'nonaktif' })
                                            });

                                            // Hapus data sesi
                                            localStorage.removeItem('token');
                                            localStorage.removeItem('userId');
                                            localStorage.removeItem('role');
                                            localStorage.removeItem('fullName');
                                            
                                            if (onNavigate) {
                                                onNavigate('');
                                                setTimeout(() => {
                                                    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                                                }, 0);
                                            }
                                        } catch (err) {
                                            console.error('Logout status update error:', err);
                                            // Tetap logout meskipun gagal update status (opsional)
                                            localStorage.clear();
                                            if (onNavigate) onNavigate('');
                                        }
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
