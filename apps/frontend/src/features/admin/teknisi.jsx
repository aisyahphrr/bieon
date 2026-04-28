import { useEffect, useRef, useState } from 'react';
import { SuperAdminLayout } from './SuperAdminLayout';
import { getDeletionRequestBadgeClass, getDeletionRequestStatusMeta } from './deletionRequestUi';
import {
    Users,
    User,
    UserCheck,
    Home,
    TrendingUp,
    Search,
    Filter,
    Plus,
    Eye,
    Edit3,
    Trash2,
    MapPin,
    Phone,
    Mail,
    X,
    Save,
    ChevronDown,
    AlertCircle,
    Map as MapIcon,
    UserCog,
    CheckCircle,
    Zap,
    ArrowRight,
    ShieldCheck,
    LogOut,
    Award,
    Briefcase,
    Clock,
    BookOpen,
    Calendar as CalendarIcon
} from 'lucide-react';

const SPECIFICATION_OPTIONS = [
    'IoT Systems',
    'Smart Home Integration',
    'Network Configuration',
    'Electrical Systems',
    'CCTV & Security',
    'Solar Energy',
    'System Architecture',
    'Repair & Maintenance'
];

const CITY_AREAS = {
    'Bandung': ['Bandung Kota', 'Bandung Timur', 'Bandung Barat', 'Bandung Selatan', 'Bandung Pusat', 'Cimahi', 'Kabupaten Bandung'],
    'Jakarta': ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Timur', 'Jakarta Barat'],
    'Surabaya': ['Surabaya Pusat', 'Surabaya Utara', 'Surabaya Timur', 'Surabaya Selatan', 'Surabaya Barat'],
    'Lainnya': ['Area Luar Kota', 'Nasional']
};

const WORK_AREA_COORDINATES = {
    Jakarta: { lat: -6.2088, lng: 106.8456, label: 'Jakarta' },
    Bandung: { lat: -6.9175, lng: 107.6191, label: 'Bandung' },
    Surabaya: { lat: -7.2575, lng: 112.7521, label: 'Surabaya' },
    Lainnya: { lat: -6.9, lng: 107.6, label: 'Area teknisi' },
};

const MAP_COLOR_PALETTE = ['#dc2626', '#059669', '#2563eb', '#9333ea', '#ea580c', '#0891b2', '#4f46e5', '#be123c'];

const parseApiResponse = async (response) => {
    const raw = await response.text();

    if (!raw) return {};

    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
};

const formatLocationAge = (capturedAt) => {
    if (!capturedAt) return 'Belum pernah dibagikan';

    const diffMs = Date.now() - new Date(capturedAt).getTime();
    const diffMinutes = Math.max(Math.round(diffMs / 60000), 0);

    if (diffMinutes < 1) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} hari lalu`;
};

const loadLeafletAssets = async () => {
    if (window.L) return window.L;

    if (!document.querySelector('link[data-leaflet-css="true"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.dataset.leafletCss = 'true';
        document.head.appendChild(link);
    }

    await new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[data-leaflet-js="true"]');

        if (existingScript && window.L) {
            resolve();
            return;
        }

        if (existingScript) {
            existingScript.addEventListener('load', resolve, { once: true });
            existingScript.addEventListener('error', reject, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.dataset.leafletJs = 'true';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });

    return window.L;
};

function TechnicianLiveMap({
    technicians,
    selectedTechnicianId,
    onSelectTechnician,
    isLoading,
    emptyMessage,
}) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const layerGroupRef = useRef(null);

    useEffect(() => {
        let disposed = false;

        const initMap = async () => {
            if (!containerRef.current) return;

            const L = await loadLeafletAssets();
            if (disposed || !containerRef.current) return;

            if (!mapRef.current) {
                mapRef.current = L.map(containerRef.current, {
                    zoomControl: true,
                    scrollWheelZoom: true,
                }).setView([-6.2, 106.816666], 8);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                    maxZoom: 19,
                }).addTo(mapRef.current);

                layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
            }

            const map = mapRef.current;
            const group = layerGroupRef.current;
            group.clearLayers();

            if (!technicians.length) {
                map.setView([-6.2, 106.816666], 8);
                setTimeout(() => map.invalidateSize(), 0);
                return;
            }

            const bounds = [];

            technicians.forEach((tech) => {
                if (!tech.mapLocation) return;

                const { lat, lng } = tech.mapLocation;
                bounds.push([lat, lng]);

                const isSelected = selectedTechnicianId === tech.id;
                const markerHtml = `
                    <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-6px);">
                        <div style="
                            background:${tech.color};
                            color:#fff;
                            font-weight:700;
                            font-size:11px;
                            padding:4px 10px;
                            border-radius:999px;
                            margin-bottom:6px;
                            box-shadow:0 8px 20px rgba(15,23,42,0.18);
                            white-space:nowrap;
                            border:${isSelected ? '2px solid #111827' : '0'};
                        ">
                            ${tech.name}
                        </div>
                        <div style="
                            width:${isSelected ? 22 : 18}px;
                            height:${isSelected ? 22 : 18}px;
                            border-radius:999px;
                            background:#fff;
                            border:4px solid ${tech.color};
                            box-shadow:0 8px 20px rgba(15,23,42,0.18);
                        "></div>
                    </div>
                `;

                const marker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        html: markerHtml,
                        className: 'bieon-technician-marker',
                        iconSize: [140, 52],
                        iconAnchor: [70, 48],
                    }),
                });

                marker.on('click', () => onSelectTechnician?.(tech.id));
                marker.addTo(group);
            });

            if (bounds.length === 1) {
                map.setView(bounds[0], 11);
            } else if (bounds.length > 1) {
                map.fitBounds(bounds, { padding: [40, 40] });
            }

            setTimeout(() => map.invalidateSize(), 0);
        };

        initMap().catch((error) => {
            console.error('Gagal memuat Leaflet map:', error);
        });

        return () => {
            disposed = true;
        };
    }, [technicians, selectedTechnicianId, onSelectTechnician]);

    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                layerGroupRef.current = null;
            }
        };
    }, []);

    return (
        <div className="relative w-full h-full min-h-[360px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
            <div ref={containerRef} className="absolute inset-0" />

            {isLoading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-[500]">
                    <div className="px-4 py-3 rounded-2xl bg-white shadow-lg text-sm font-semibold text-gray-700">
                        Memuat lokasi teknisi...
                    </div>
                </div>
            )}

            {!isLoading && technicians.length === 0 && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center p-6 z-[500]">
                    <div className="max-w-md text-center">
                        <p className="text-base font-bold text-gray-800">{emptyMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

const resolveWorkAreaLocation = (workArea, fallbackLocation) => {
    const area = String(workArea || '').trim();
    const matchedArea = Object.keys(WORK_AREA_COORDINATES).find((key) => area.toLowerCase().includes(key.toLowerCase()));

    if (matchedArea) {
        return WORK_AREA_COORDINATES[matchedArea];
    }

    if (fallbackLocation) {
        return {
            lat: fallbackLocation.lat,
            lng: fallbackLocation.lng,
            label: area || fallbackLocation.label || 'Lokasi teknisi',
        };
    }

    return {
        ...WORK_AREA_COORDINATES.Lainnya,
        label: area || WORK_AREA_COORDINATES.Lainnya.label,
    };
};

export function ManajemenTeknisiPage({ onNavigate }) {
    const [technicians, setTechnicians] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [mapFilterTech, setMapFilterTech] = useState('all');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [availableClients, setAvailableClients] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [mapTechnicians, setMapTechnicians] = useState([]);
    const [isLoadingMap, setIsLoadingMap] = useState(false);
    const [mapError, setMapError] = useState('');
    const [selectedMapTechnicianId, setSelectedMapTechnicianId] = useState(null);

    const getInitialFormData = () => ({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        status: 'aktif',
        position: 'Senior Technician',
        experience: 5,
        workArea: 'Bandung',
        specializations: [],
        coverageAreas: [],
        workSchedule: {
            'Senin': '08:00 - 17:00',
            'Selasa': '08:00 - 17:00',
            'Rabu': '08:00 - 17:00',
            'Kamis': '08:00 - 17:00',
            'Jumat': '08:00 - 17:00',
            'Sabtu': '09:00 - 14:00',
            'Minggu': 'Off'
        }
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const mapApiTechnicianToUi = (tech) => ({
        _id: tech._id,
        id: tech.technicianId || '-',
        name: tech.fullName || '-',
        email: tech.email || '-',
        phone: tech.phoneNumber || '-',
        address: tech.address || '-',
        workArea: tech.workArea || '-',
        status: tech.status || 'aktif',
        clientsCount: Number(tech.clientsCount) || 0,
        color: tech.color || '#10b981',
        clients: Array.isArray(tech.clients) ? tech.clients : [],
        position: tech.position || 'Senior Technician',
        experience: Number(tech.experience) || 0,
        specializations: Array.isArray(tech.specializations) ? tech.specializations : [],
        coverageAreas: Array.isArray(tech.coverageAreas) ? tech.coverageAreas : [],
        workSchedule: tech.workSchedule || getInitialFormData().workSchedule,
        currentLocation: tech.currentLocation ? {
            lat: Number(tech.currentLocation.lat),
            lng: Number(tech.currentLocation.lng),
            accuracy: tech.currentLocation.accuracy ?? null,
            source: tech.currentLocation.source || 'browser',
            capturedAt: tech.currentLocation.capturedAt || null,
            label: tech.currentLocation.label || '',
        } : null,
        mapLocation: resolveWorkAreaLocation(
            tech.workArea,
            tech.currentLocation ? {
                lat: Number(tech.currentLocation.lat),
                lng: Number(tech.currentLocation.lng),
                label: tech.currentLocation.label || '',
            } : null
        ),
        deletionRequest: tech.deletionRequest || null,
    });

    const getMapTechnicianColor = (techId, index) => {
        if (!techId) return MAP_COLOR_PALETTE[index % MAP_COLOR_PALETTE.length];

        const hash = Array.from(String(techId)).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return MAP_COLOR_PALETTE[hash % MAP_COLOR_PALETTE.length];
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    };

    const loadTechnicians = async () => {
        setIsLoadingTechnicians(true);
        setFormError('');

        try {
            const response = await fetch('/api/admin/technicians', {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Gagal mengambil data teknisi.');
            }

            setTechnicians((result.data || []).map(mapApiTechnicianToUi));
        } catch (error) {
            setFormError(error.message || 'Terjadi kesalahan saat mengambil data teknisi.');
            setTechnicians([]);
        } finally {
            setIsLoadingTechnicians(false);
        }
    };

    useEffect(() => {
        loadTechnicians();
    }, []);

    const fetchMapLocations = async () => {
        setIsLoadingMap(true);
        setMapError('');

        try {
            const response = await fetch('/api/admin/technicians/locations', {
                headers: getAuthHeaders(),
            });
            const result = await parseApiResponse(response);

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Gagal mengambil lokasi teknisi.');
            }

            const mapped = (result.data || []).map((tech, index) => ({
                ...mapApiTechnicianToUi(tech),
                color: getMapTechnicianColor(tech.technicianId || tech._id, index),
            }));

            setMapTechnicians(mapped);
        } catch (error) {
            setMapError(error.message || 'Terjadi kesalahan saat memuat peta teknisi.');
            setMapTechnicians([]);
        } finally {
            setIsLoadingMap(false);
        }
    };

    const openMapModal = async (techId = 'all') => {
        setMapFilterTech(techId);
        setSelectedMapTechnicianId(techId === 'all' ? null : techId);
        setIsMapModalOpen(true);
        await fetchMapLocations();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCityChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            workArea: value,
            coverageAreas: [] // Reset sub-areas when city changes
        }));
    };

    const handleScheduleChange = (day, value) => {
        setFormData(prev => ({
            ...prev,
            workSchedule: {
                ...prev.workSchedule,
                [day]: value
            }
        }));
    };

    const toggleOption = (field, option) => {
        setFormData(prev => {
            const current = Array.isArray(prev[field]) ? prev[field] : [];
            const updated = current.includes(option)
                ? current.filter(item => item !== option)
                : [...current, option];
            return { ...prev, [field]: updated };
        });
    };

    const handleNavigate = (id) => {
        if (onNavigate) onNavigate(id);
    };

    const fetchAvailableClients = async () => {
        setIsLoadingClients(true);
        try {
            const response = await fetch('/api/admin/homeowners/available', {
                headers: getAuthHeaders(),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setAvailableClients(result.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch available clients', error);
        } finally {
            setIsLoadingClients(false);
        }
    };

    const toggleClientSelection = (clientId) => {
        setSelectedClients(prev => 
            prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]
        );
    };

    const handleAssignClients = async () => {
        if (!selectedTechnician || selectedClients.length === 0) return;
        
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/admin/technicians/${selectedTechnician._id || selectedTechnician.id}/assign-clients`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ clientIds: selectedClients }),
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                setSuccessMessage('Berhasil menugaskan pelanggan ke teknisi.');
                setIsAddClientModalOpen(false);
                setSelectedClients([]);
                
                // Refresh technician details to show updated clients
                const techRes = await fetch(`/api/admin/technicians/${selectedTechnician._id || selectedTechnician.id}`, {
                    headers: getAuthHeaders(),
                });
                const techResult = await techRes.json();
                if (techRes.ok && techResult.success) {
                    setSelectedTechnician(mapApiTechnicianToUi(techResult.data));
                }
                
                loadTechnicians(); // Refresh main list
            } else {
                throw new Error(result.message || 'Gagal menugaskan pelanggan');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter technicians
    const filteredTechnicians = technicians.filter(tech => {
        const matchesSearch =
            tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tech.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tech.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tech.workArea && tech.workArea.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = filterStatus === 'all' || tech.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    // Calculate stats
    const totalTechnicians = technicians.length;
    const activeTechnicians = technicians.filter(t => t.status === 'aktif').length;
    const totalClients = technicians.reduce((sum, t) => sum + (t.clientsCount || 0), 0);
    const avgClientsPerTech = totalClients > 0 && activeTechnicians > 0 ? (totalClients / activeTechnicians).toFixed(1) : 0;
    const visibleMapTechnicians = mapTechnicians.filter((tech) => mapFilterTech === 'all' || tech.id === mapFilterTech);
    const visibleMapTechniciansWithLocation = visibleMapTechnicians.filter((tech) => tech.mapLocation);
    const selectedMapTechnician = visibleMapTechnicians.find((tech) => tech._id === selectedMapTechnicianId || tech.id === selectedMapTechnicianId) || null;

    const handleAddTechnician = async () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.password) {
            setFormError('Nama, email, nomor telepon, alamat, dan password wajib diisi.');
            return;
        }

        setIsSubmitting(true);
        setFormError('');

        try {
            // Pastikan tipe data benar
            const payload = {
                fullName: formData.name,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phone,
                address: formData.address,
                position: formData.position,
                experience: Number(formData.experience),
                specializations: Array.isArray(formData.specializations) ? formData.specializations : [],
                workArea: formData.workArea,
                coverageAreas: Array.isArray(formData.coverageAreas) ? formData.coverageAreas : [],
                workSchedule: typeof formData.workSchedule === 'object' && !Array.isArray(formData.workSchedule) ? formData.workSchedule : {},
                status: formData.status,
            };

            // Validasi frontend
            const requiredFields = ['fullName', 'email', 'password', 'phoneNumber', 'address', 'position', 'workArea'];
            for (const field of requiredFields) {
                if (!payload[field] || String(payload[field]).trim() === '') {
                    setFormError(`Field ${field} wajib diisi.`);
                    setIsSubmitting(false);
                    return;
                }
            }
            if (payload.password.length < 8) {
                setFormError('Password minimal 8 karakter.');
                setIsSubmitting(false);
                return;
            }

            const response = await fetch('/api/admin/technicians', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Gagal membuat akun teknisi.');
            }

            setSuccessMessage('Akun teknisi berhasil ditambahkan.');
            setIsAddModalOpen(false);
            setFormData(getInitialFormData());
            await loadTechnicians();
        } catch (error) {
            setFormError(error.message || 'Terjadi kesalahan saat menambahkan teknisi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTechnician = (tech) => {
        setSelectedTechnician(tech);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteTechnician = async () => {
        if (!selectedTechnician?._id) {
            setFormError('ID teknisi tidak ditemukan.');
            return;
        }

        if (!deleteReason.trim()) {
            setFormError('Alasan penghapusan wajib diisi.');
            return;
        }

        setIsSubmitting(true);
        setFormError('');

        try {
            const response = await fetch(`/api/admin/technicians/${selectedTechnician._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
                body: JSON.stringify({ reason: deleteReason.trim() }),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Gagal menghapus teknisi.');
            }

            const deletionRequest = result.data?.deletionRequest || null;

            setTechnicians((prev) => prev.map((tech) => (
                tech._id === selectedTechnician._id
                    ? { ...tech, deletionRequest }
                    : tech
            )));
            setSuccessMessage(result.message || 'Permintaan penghapusan teknisi berhasil dibuat.');
            setIsDeleteModalOpen(false);
            setDeleteReason('');
            setSelectedTechnician(null);
        } catch (error) {
            setFormError(error.message || 'Terjadi kesalahan saat menghapus teknisi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewDetail = async (tech) => {
        setSelectedTechnician(tech);
        setIsDetailModalOpen(true);
        
        try {
            const response = await fetch(`/api/admin/technicians/${tech._id}`, {
                headers: getAuthHeaders(),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setSelectedTechnician(mapApiTechnicianToUi(result.data));
            }
        } catch (error) {
            console.error('Failed to fetch full technician details', error);
        }
    };

    const handleEditTechnician = (tech) => {
        setSelectedTechnician(tech);

        // Find a valid city key from CITY_AREAS that might be part of the tech.workArea string
        const validCities = Object.keys(CITY_AREAS);
        let mappedCity = validCities.find(city => tech.workArea.includes(city)) || 'Lainnya';

        setFormData({
            ...tech,
            workArea: mappedCity,
            specializations: Array.isArray(tech.specializations) ? tech.specializations : (tech.specializations ? tech.specializations.split(', ') : []),
            coverageAreas: Array.isArray(tech.coverageAreas) ? tech.coverageAreas : (tech.coverageAreas ? tech.coverageAreas.split(', ') : []),
            password: '' // Don't pre-fill password for editing
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedTechnician?._id) {
            setFormError('ID teknisi tidak ditemukan.');
            return;
        }

        setIsSubmitting(true);
        setFormError('');

        try {
            const payload = {
                fullName: formData.name,
                email: formData.email,
                phoneNumber: formData.phone,
                address: formData.address,
                position: formData.position,
                experience: Number(formData.experience),
                specializations: formData.specializations,
                workArea: formData.workArea,
                coverageAreas: formData.coverageAreas,
                workSchedule: formData.workSchedule,
                status: formData.status,
                ...(formData.password ? { password: formData.password } : {}),
            };

            const response = await fetch(`/api/admin/technicians/${selectedTechnician._id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Gagal memperbarui data teknisi.');
            }

            setSuccessMessage('Data teknisi berhasil diperbarui.');
            setIsEditModalOpen(false);
            setSelectedTechnician(null);
            setFormData(getInitialFormData());
            await loadTechnicians();
        } catch (error) {
            setFormError(error.message || 'Terjadi kesalahan saat memperbarui data teknisi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SuperAdminLayout activeMenu="Teknisi" onNavigate={handleNavigate} title="Manajemen Teknisi">
            <div className="space-y-8">
                {formError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {formError}
                    </div>
                )}
                {successMessage && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {successMessage}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#2563eb] rounded-3xl p-6 shadow-xl shadow-blue-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{totalTechnicians}</span>
                                <p className="text-[11px] font-medium text-white mt-1">Total Teknisi</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#009b7c] rounded-3xl p-6 shadow-xl shadow-emerald-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{activeTechnicians}</span>
                                <p className="text-[11px] font-medium text-white mt-1">Teknisi Aktif</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#a855f7] rounded-3xl p-6 shadow-xl shadow-purple-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Home className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{totalClients}</span>
                                <p className="text-[11px] font-medium text-white mt-1">Total Pelanggan Ditangani</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#ff6600] rounded-3xl p-6 shadow-xl shadow-orange-200/50 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold">{avgClientsPerTech}</span>
                                <p className="text-[11px] font-medium text-white mt-1">Rata-rata Pelanggan/Teknisi</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Daftar Teknisi</h2>
                            </div>
                            <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-3 w-full lg:w-auto">
                                <div className="col-span-2 flex items-center gap-2">
                                    <div className="relative group flex-1 lg:w-72">
                                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-all" />
                                        <input
                                            type="text"
                                            placeholder="Cari teknisi..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-sm group-focus-within:bg-white"
                                        />
                                    </div>

                                    {/* Custom Dropdown Filter */}
                                    <div className="relative shrink-0 flex items-center justify-center relative">
                                        <button
                                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                            className="w-[42px] h-[42px] md:w-auto md:h-auto md:pl-11 md:pr-10 md:py-2.5 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-50 focus:border-gray-300 transition-all shadow-sm relative z-20"
                                        >
                                            <Filter className="w-[18px] md:w-4 h-[18px] md:h-4 text-gray-500 md:text-gray-400 md:absolute md:left-4 md:top-1/2 md:-translate-y-1/2" />
                                            <span className="hidden md:inline-block">
                                                {filterStatus === 'all' ? 'Semua Status' : filterStatus === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 hidden md:block transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />

                                            {/* Notification dot for mobile if filter is active */}
                                            {filterStatus !== 'all' && (
                                                <span className="md:hidden absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
                                            )}
                                        </button>

                                        {isFilterDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-30"
                                                    onClick={() => setIsFilterDropdownOpen(false)}
                                                ></div>
                                                <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-40 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {[
                                                        { id: 'all', label: 'Semua Status' },
                                                        { id: 'aktif', label: 'Aktif' },
                                                        { id: 'nonaktif', label: 'Nonaktif' }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => {
                                                                setFilterStatus(item.id);
                                                                setIsFilterDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between ${filterStatus === item.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                        >
                                                            {item.label}
                                                            {filterStatus === item.id && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="col-span-2 grid grid-cols-2 gap-2 w-full md:w-auto md:flex md:flex-row">
                                    <button
                                        onClick={() => openMapModal('all')}
                                        className="px-4 md:px-5 py-2.5 bg-[#1d4ed8] text-white rounded-xl text-xs md:text-sm font-semibold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-100"
                                    >
                                        <MapIcon className="w-4 h-4 shrink-0" />
                                        <span className="truncate">Lihat Peta</span>
                                    </button>

                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="px-4 md:px-5 py-2.5 bg-[#009b7c] text-white rounded-xl text-xs md:text-sm font-semibold hover:bg-[#008268] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-emerald-100"
                                    >
                                        <Plus className="w-4 h-4 shrink-0 transition-transform group-hover:rotate-90" />
                                        <span className="truncate">Tambah Teknisi</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto md:overflow-visible p-4 md:p-0">
                        {isLoadingTechnicians && (
                            <div className="px-4 py-3 text-sm font-semibold text-gray-500">Memuat data teknisi...</div>
                        )}

                        {/* Desktop Table View */}
                        <table className="w-full text-left table-auto hidden md:table">
                            <thead>
                                <tr className="bg-[#009b7c] text-white text-sm font-semibold text-left">
                                    <th className="px-8 py-4 rounded-tl-xl">ID Teknisi</th>
                                    <th className="px-8 py-4">Nama Teknisi</th>
                                    <th className="px-8 py-4">Lokasi Wilayah</th>
                                    <th className="px-8 py-4">Nomor Kontak</th>
                                    <th className="px-8 py-4 text-center">Jumlah Pelanggan</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4 text-center rounded-tr-xl">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTechnicians.map((tech) => (
                                    <tr key={tech.id} className="hover:bg-gray-50/50 transition-all group bg-white">
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-800 text-sm">{tech.id}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{tech.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{tech.email}</p>
                                                {tech.deletionRequest && (
                                                    <p className={`mt-1 text-[11px] font-medium ${getDeletionRequestStatusMeta(tech.deletionRequest).tone === 'danger' ? 'text-red-600' : 'text-amber-700'}`}>
                                                        {getDeletionRequestStatusMeta(tech.deletionRequest).note}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm text-gray-600">{tech.workArea}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm text-gray-600">{tech.phone}</p>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-4 py-1.5 bg-purple-100 text-purple-600 rounded-full text-xs font-bold whitespace-nowrap">
                                                {tech.clientsCount} Pelanggan
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {(() => {
                                                const deletionMeta = getDeletionRequestStatusMeta(tech.deletionRequest);
                                                const isDefaultStatus = !tech.deletionRequest;
                                                return (
                                                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${isDefaultStatus ? (tech.status === 'aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600') : getDeletionRequestBadgeClass(deletionMeta.tone)}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isDefaultStatus ? (tech.status === 'aktif' ? 'bg-emerald-600' : 'bg-red-600') : (deletionMeta.tone === 'warning' ? 'bg-amber-600' : deletionMeta.tone === 'danger' ? 'bg-red-600' : 'bg-slate-600')}`}></span>
                                                        {isDefaultStatus ? `${tech.status.charAt(0).toUpperCase()}${tech.status.slice(1)}` : deletionMeta.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(tech)}
                                                    className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditTechnician(tech)}
                                                    className="p-2 bg-emerald-50 text-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 rounded-lg transition-all"
                                                    title="Edit Data"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTechnician(tech)}
                                                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openMapModal(tech.id)}
                                                    className="p-2 bg-cyan-50 text-cyan-500 hover:bg-cyan-100 hover:text-cyan-600 rounded-lg transition-all"
                                                >
                                                    <MapPin className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Cards View */}
                        <div className="md:hidden flex flex-col gap-4">
                            {filteredTechnicians.map((tech) => (
                                <div key={tech.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-gray-50 flex justify-between items-start">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                                                <User className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm">{tech.name}</h3>
                                                <p className="text-xs text-gray-500">{tech.email}</p>
                                            </div>
                                        </div>
                                        {(() => {
                                            const deletionMeta = getDeletionRequestStatusMeta(tech.deletionRequest);
                                            const isDefaultStatus = !tech.deletionRequest;
                                            return (
                                                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${isDefaultStatus ? (tech.status === 'aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600') : getDeletionRequestBadgeClass(deletionMeta.tone)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isDefaultStatus ? (tech.status === 'aktif' ? 'bg-emerald-600' : 'bg-red-600') : (deletionMeta.tone === 'warning' ? 'bg-amber-600' : deletionMeta.tone === 'danger' ? 'bg-red-600' : 'bg-slate-600')}`}></span>
                                                    {isDefaultStatus ? `${tech.status.charAt(0).toUpperCase()}${tech.status.slice(1)}` : deletionMeta.label}
                                                </span>
                                            );
                                        })()}
                                    </div>

                                    <div className="p-4 bg-gray-50/50 flex flex-col gap-2.5">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-semibold text-gray-500 w-16">ID:</span>
                                            <span className="font-bold text-gray-900">{tech.id}</span>
                                        </div>
                                        {tech.deletionRequest && (
                                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
                                                {getDeletionRequestStatusMeta(tech.deletionRequest).note}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-semibold text-gray-500 w-16">Lokasi:</span>
                                            <span className="font-semibold text-gray-700 truncate">{tech.workArea}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-semibold text-gray-500 w-16">Kontak:</span>
                                            <span className="font-semibold text-gray-700">{tech.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-semibold text-gray-500 w-16">Klien:</span>
                                            <span className="font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md">{tech.clientsCount} Pelanggan</span>
                                        </div>
                                    </div>

                                    <div className="p-3 border-t border-gray-50 flex items-center justify-between gap-2">
                                        <button onClick={() => handleViewDetail(tech)} className="flex-1 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition-all text-center">Detail</button>
                                        <button onClick={() => handleEditTechnician(tech)} className="flex-1 py-2 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-all text-center">Edit</button>
                                        <button onClick={() => openMapModal(tech.id)} className="flex-1 py-2 bg-cyan-50 text-cyan-600 font-bold text-xs rounded-xl hover:bg-cyan-100 transition-all text-center">Peta</button>
                                        <button onClick={() => handleDeleteTechnician(tech)} className="w-[45px] flex items-center justify-center py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all shrink-0">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-gray-50 rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-white/20 max-h-[90vh]">
                        <div className="px-6 py-5 bg-[#009b7c] text-white flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Plus className="w-6 h-6" /> Tambah Teknisi Baru
                            </h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 max-h-full">
                            {/* Section: Akun & Kontak */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Akun & Kontak</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Nama Teknisi <span className="text-red-500">*</span></label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all"
                                            placeholder="Budi Santoso"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Email <span className="text-red-500">*</span></label>
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            type="email"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all"
                                            placeholder="budi.santoso@bieon.id"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Nomor Telepon <span className="text-red-500">*</span></label>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all"
                                            placeholder="+62 812-3456-7890"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Password <span className="text-red-500">*</span></label>
                                        <input
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            type="password"
                                            placeholder="********"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Alamat <span className="text-red-500">*</span></label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all"
                                            placeholder="Jl. Sudirman No. 45, Jakarta Pusat"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Informasi Profesional */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Informasi Profesional</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Posisi <span className="text-red-500">*</span></label>
                                        <input
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all"
                                            placeholder="Senior Technician"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Pengalaman (Tahun) <span className="text-red-500">*</span></label>
                                        <input
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            type="number"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all"
                                            placeholder="5"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Spesialisasi (Pilih yang sesuai) <span className="text-red-500">*</span></label>
                                        <div className="flex flex-wrap gap-2">
                                            {SPECIFICATION_OPTIONS.map(spec => {
                                                const isSelected = formData.specializations.includes(spec);
                                                return (
                                                    <button
                                                        key={spec}
                                                        type="button"
                                                        onClick={() => toggleOption('specializations', spec)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold ring-1 transition-all flex items-center gap-1.5 ${isSelected
                                                            ? 'bg-emerald-500 text-white ring-emerald-500 shadow-md shadow-emerald-100'
                                                            : 'bg-white text-gray-500 ring-gray-200 hover:ring-emerald-300 hover:bg-emerald-50'
                                                            }`}
                                                    >
                                                        {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                                                        {spec}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Wilayah Kerja Standar <span className="text-red-500">*</span></label>
                                        <select
                                            name="workArea"
                                            value={formData.workArea}
                                            onChange={handleCityChange}
                                            className="appearance-none w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#009b7c] transition-all cursor-pointer"
                                        >
                                            <option value="">Pilih Kota</option>
                                            {Object.keys(CITY_AREAS).map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-9 pointer-events-none" />
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Status Teknisi <span className="text-red-500">*</span></label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="appearance-none w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#009b7c] transition-all cursor-pointer"
                                        >
                                            <option value="aktif">Aktif</option>
                                            <option value="nonaktif">Nonaktif</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-9 pointer-events-none" />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">
                                            Area Coverage Detail (Pilih Wilayah di {formData.workArea || 'Kota Selected'}) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.workArea ? (
                                                (CITY_AREAS[formData.workArea] || []).map(area => {
                                                    const isSelected = formData.coverageAreas.includes(area);
                                                    return (
                                                        <button
                                                            key={area}
                                                            type="button"
                                                            onClick={() => toggleOption('coverageAreas', area)}
                                                            className={`px-4 py-2 rounded-xl text-xs font-bold ring-1 transition-all flex items-center gap-1.5 ${isSelected
                                                                ? 'bg-blue-500 text-white ring-blue-500 shadow-md shadow-blue-100'
                                                                : 'bg-white text-gray-500 ring-gray-200 hover:ring-blue-300 hover:bg-blue-50'
                                                                }`}
                                                        >
                                                            {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                                                            {area}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="w-full py-4 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-xs font-medium">
                                                    Silakan pilih Wilayah Kerja Standar terlebih dahulu
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Jadwal Kerja */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Jadwal Kerja</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                    {Object.entries(formData.workSchedule).map(([day, hours]) => (
                                        <div key={day} className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">{day}</label>
                                            <input
                                                type="text"
                                                value={hours}
                                                onChange={(e) => handleScheduleChange(day, e.target.value)}
                                                className="w-full px-2 py-1.5 bg-white border border-gray-100 rounded-lg text-[11px] focus:outline-none focus:border-purple-500 transition-all font-medium"
                                                placeholder="08:00 - 17:00"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 shrink-0">
                                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">Batal</button>
                                <button onClick={handleAddTechnician} disabled={isSubmitting} className="flex-1 py-3 bg-[#009b7c] text-white rounded-xl text-sm font-bold hover:bg-[#008268] transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed">
                                    <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isDetailModalOpen && selectedTechnician && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col overflow-hidden max-h-[95vh]">

                        {/* Header */}
                        <div className="p-6 bg-[#009b7c] text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <UserCog className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedTechnician.name}</h2>
                                    <p className="text-xs font-medium text-teal-100 mt-0.5">ID: {selectedTechnician.id}</p>
                                    {selectedTechnician.deletionRequest && (
                                        <div className={`mt-3 inline-flex px-3 py-1.5 rounded-full text-[11px] font-bold ${getDeletionRequestBadgeClass(getDeletionRequestStatusMeta(selectedTechnician.deletionRequest).tone)}`}>
                                            {getDeletionRequestStatusMeta(selectedTechnician.deletionRequest).label}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Body Container */}
                        <div className="p-8 overflow-y-auto space-y-8 bg-white">

                            {/* Cards Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Informasi Teknisi */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Kontak & Alamat</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Mail className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedTechnician.email}</p>
                                                {selectedTechnician.deletionRequest && (
                                                    <p className="mt-1 text-xs font-medium text-amber-700">{getDeletionRequestStatusMeta(selectedTechnician.deletionRequest).note}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Nomor Kontak</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedTechnician.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Alamat</p>
                                                <p className="text-sm font-semibold text-gray-800 leading-relaxed">{selectedTechnician.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Profesional */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Keahlian & Karir</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Award className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Posisi & Pengalaman</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedTechnician.position || 'Technician'} • {selectedTechnician.experience || 0} Tahun</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Zap className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Spesialisasi</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(selectedTechnician.specializations || []).map((s, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapIcon className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Area Coverage</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(selectedTechnician.coverageAreas || []).map((a, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{a}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Jadwal Kerja */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Jadwal Mingguan</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {Object.entries(selectedTechnician.workSchedule || {}).map(([day, hours]) => (
                                            <div key={day} className="flex flex-col">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase">{day}</span>
                                                <span className={`text-[11px] font-bold ${hours === 'Off' ? 'text-red-400' : 'text-gray-700'}`}>{hours}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Table Pelanggan section */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">Daftar Pelanggan yang Ditangani</h3>
                                    <button
                                        onClick={() => {
                                            setIsAddClientModalOpen(true);
                                            fetchAvailableClients();
                                        }}
                                        className="px-4 py-2 bg-[#009b7c] text-white rounded-lg text-sm font-semibold hover:bg-[#008268] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tambah Pelanggan
                                    </button>
                                </div>
                                <div className="overflow-hidden rounded-xl md:border border-gray-200">
                                    {/* Desktop Table */}
                                    <table className="w-full text-left table-auto bg-white hidden md:table">
                                        <thead>
                                            <tr className="bg-[#009b7c] text-white text-sm font-semibold">
                                                <th className="px-6 py-4">Nama Pelanggan</th>
                                                <th className="px-6 py-4">Lokasi</th>
                                                <th className="px-6 py-4">Jumlah BIEON</th>
                                                <th className="px-6 py-4">Jumlah Device</th>
                                                <th className="px-6 py-4">Status Sistem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedTechnician.clients && selectedTechnician.clients.length > 0 ? (
                                                selectedTechnician.clients.map(client => (
                                                    <tr key={client.id} className="hover:bg-gray-50 transition-all">
                                                        <td className="px-6 py-4">
                                                            <span className="font-bold text-gray-800 text-sm">{client.name}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-600">{client.location}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-800 font-medium">{client.bieonDevices}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-800 font-medium">{client.smartDevices}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap ${client.status === 'online' ? 'bg-green-50 text-green-600' :
                                                                client.status === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                                                                }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'online' ? 'bg-green-600' :
                                                                    client.status === 'warning' ? 'bg-yellow-500' : 'bg-red-600'
                                                                    }`}></span>
                                                                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm italic">
                                                        Tidak ada pelanggan yang ditangani saat ini.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Mobile Cards */}
                                    <div className="md:hidden flex flex-col gap-3">
                                        {selectedTechnician.clients && selectedTechnician.clients.length > 0 ? (
                                            selectedTechnician.clients.map(client => (
                                                <div key={client.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="font-bold text-gray-800 text-sm block">{client.name}</span>
                                                            <span className="text-xs text-gray-500">{client.location}</span>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 whitespace-nowrap ${client.status === 'online' ? 'bg-green-50 text-green-600' :
                                                            client.status === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'online' ? 'bg-green-600' :
                                                                client.status === 'warning' ? 'bg-yellow-500' : 'bg-red-600'
                                                                }`}></span>
                                                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1 bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Jml BIEON</p>
                                                            <p className="text-sm font-bold text-gray-800 mt-0.5">{client.bieonDevices}</p>
                                                        </div>
                                                        <div className="flex-1 bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Jml Device</p>
                                                            <p className="text-sm font-bold text-gray-800 mt-0.5">{client.smartDevices}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-6 text-center text-gray-500 text-sm italic bg-white rounded-xl border border-gray-100">
                                                Tidak ada pelanggan yang ditangani saat ini.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Map Modal */}
            {isMapModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full flex flex-col overflow-hidden border border-white/20 h-[85vh]">
                        {/* Header */}
                        <div className="p-5 md:p-6 bg-[#2563eb] text-white flex items-start md:items-center justify-between shrink-0 relative">
                            <div className="flex flex-row items-start md:items-center gap-3 md:gap-4 pr-10 md:pr-0">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md shrink-0">
                                    <MapIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div className="mt-0.5 md:mt-0">
                                    <h2 className="text-lg md:text-xl font-bold leading-tight">Peta Lokasi Teknisi Real-Time</h2>
                                    <p className="text-[11px] md:text-xs font-medium text-blue-100 mt-1 md:mt-1.5 leading-snug">Super admin dapat melihat persebaran teknisi dari koordinat aktual perangkat teknisi</p>
                                </div>
                            </div>
                            <button onClick={() => setIsMapModalOpen(false)} className="absolute right-4 top-4 md:static md:w-10 md:h-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all shrink-0">
                                <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </button>
                        </div>

                        {/* Body / Map Container */}
                        <div className="p-6 flex flex-col flex-1 overflow-hidden bg-gray-50/50">
                            {/* Memaksa scrollbar selalu muncul di HP untuk area Peta */}
                            <style>{`
                                .always-scroll::-webkit-scrollbar {
                                    -webkit-appearance: none;
                                    height: 6px;
                                    display: block;
                                }
                                .always-scroll::-webkit-scrollbar-thumb {
                                    border-radius: 4px;
                                    background-color: rgba(0,0,0,.25);
                                }
                                .always-scroll::-webkit-scrollbar-track {
                                    background-color: rgba(0,0,0,.05);
                                    border-radius: 4px;
                                }
                            `}</style>

                            {/* Toolbar Map */}
                            <div className="flex items-center gap-6 mb-4 overflow-x-auto pb-4 snap-x snap-mandatory always-scroll w-full">
                                <div className="flex items-center gap-3 shrink-0 snap-start">
                                    <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Filter Teknisi:</span>
                                    <select
                                        className="py-1.5 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={mapFilterTech}
                                        onChange={(e) => {
                                            setMapFilterTech(e.target.value);
                                            setSelectedMapTechnicianId(e.target.value === 'all' ? null : e.target.value);
                                        }}
                                    >
                                        <option value="all">Semua Teknisi</option>
                                        {mapTechnicians.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-px h-6 bg-gray-200 shrink-0 hidden md:block"></div>

                                <div className="flex items-center gap-4 shrink-0 snap-end">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Legend:</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {visibleMapTechnicians.slice(0, 6).map((tech) => (
                                            <button
                                                key={tech.id}
                                                type="button"
                                                onClick={() => setSelectedMapTechnicianId(tech.id)}
                                                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm"
                                            >
                                                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: tech.color }}></span>
                                                <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{tech.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 flex-1 min-h-0">
                                <TechnicianLiveMap
                                    technicians={visibleMapTechniciansWithLocation}
                                    selectedTechnicianId={selectedMapTechnician?.id || null}
                                    onSelectTechnician={setSelectedMapTechnicianId}
                                    isLoading={isLoadingMap}
                                    emptyMessage="Belum ada pin wilayah teknisi yang tersedia. Lengkapi workArea teknisi agar pin tampil stabil di peta."
                                />

                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 overflow-y-auto">
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">Status Lokasi Teknisi</h3>
                                            <p className="text-xs text-gray-500 mt-1">Pin peta dikunci ke wilayah kerja teknisi, sedangkan lokasi live tetap ditampilkan sebagai informasi pendukung.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={fetchMapLocations}
                                            className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all"
                                        >
                                            Refresh
                                        </button>
                                    </div>

                                    {mapError && (
                                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                                            {mapError}
                                        </div>
                                    )}

                                    {selectedMapTechnician && (
                                        <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedMapTechnician.color }}></span>
                                                <p className="text-sm font-bold text-gray-900">{selectedMapTechnician.name}</p>
                                            </div>
                                            <div className="space-y-1.5 text-xs text-gray-600">
                                                <p>ID: <span className="font-semibold text-gray-800">{selectedMapTechnician.id}</span></p>
                                                <p>Wilayah: <span className="font-semibold text-gray-800">{selectedMapTechnician.workArea || '-'}</span></p>
                                                <p>Pin Peta: <span className="font-semibold text-gray-800">{selectedMapTechnician.mapLocation?.label || '-'}</span></p>
                                                <p>Status: <span className="font-semibold text-gray-800">{selectedMapTechnician.status}</span></p>
                                                <p>Pelanggan: <span className="font-semibold text-gray-800">{selectedMapTechnician.clientsCount}</span></p>
                                                {selectedMapTechnician.currentLocation && (
                                                    <>
                                                        <p>Koordinat Live: <span className="font-semibold text-gray-800">{selectedMapTechnician.currentLocation.lat.toFixed(6)}, {selectedMapTechnician.currentLocation.lng.toFixed(6)}</span></p>
                                                        <p>Update Live: <span className="font-semibold text-gray-800">{formatLocationAge(selectedMapTechnician.currentLocation.capturedAt)}</span></p>
                                                        <p>Akurasi: <span className="font-semibold text-gray-800">{selectedMapTechnician.currentLocation.accuracy != null ? `${Math.round(selectedMapTechnician.currentLocation.accuracy)} m` : '-'}</span></p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {visibleMapTechnicians.map((tech) => (
                                            <button
                                                key={tech.id}
                                                type="button"
                                                onClick={() => tech.currentLocation && setSelectedMapTechnicianId(tech.id)}
                                                className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${selectedMapTechnician?.id === tech.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'} ${tech.currentLocation ? 'hover:border-blue-200' : 'opacity-80'}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tech.color }}></span>
                                                            <p className="text-sm font-bold text-gray-900">{tech.name}</p>
                                                        </div>
                                                        <p className="mt-1 text-xs text-gray-500">{tech.id} • {tech.workArea || 'Tanpa wilayah'}</p>
                                                    </div>
                                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${tech.currentLocation ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                                        {tech.currentLocation ? 'Live tersedia' : 'Pin wilayah'}
                                                    </span>
                                                </div>
                                                {tech.currentLocation ? (
                                                    <div className="mt-2 text-xs text-gray-600">
                                                        <p>Pin tetap: {tech.mapLocation?.label || tech.workArea || 'Area teknisi'}</p>
                                                        <p className="mt-1">Live terakhir: {tech.currentLocation.lat.toFixed(5)}, {tech.currentLocation.lng.toFixed(5)}</p>
                                                        <p className="mt-1">Diperbarui {formatLocationAge(tech.currentLocation.capturedAt)}</p>
                                                    </div>
                                                ) : (
                                                    <p className="mt-2 text-xs text-gray-500">Pin peta dikunci ke wilayah kerja `{tech.mapLocation?.label || tech.workArea || 'Area teknisi'}`.</p>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Client To Technician Modal */}
            {isAddClientModalOpen && selectedTechnician && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[700] flex items-center justify-center p-6 animate-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/20 flex flex-col max-h-[80vh]">
                        <div className="p-6 bg-[#009b7c] text-white flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-bold">Pilih Pelanggan</h2>
                                <p className="text-xs font-medium text-teal-50 opacity-90 mt-1">Tambahkan pelanggan ke delegasi tugas teknisi</p>
                            </div>
                            <button onClick={() => setIsAddClientModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            <p className="text-sm font-bold text-gray-700">Pilih dari pelanggan yang tersedia (Homeowner):</p>

                            <div className="space-y-3">
                                {isLoadingClients ? (
                                    <div className="text-center py-6 text-gray-500 text-sm">Memuat pelanggan yang tersedia...</div>
                                ) : availableClients.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 text-sm italic">Tidak ada pelanggan (Homeowner) yang belum ditugaskan.</div>
                                ) : availableClients.map((pelanggan, idx) => (
                                    <label key={idx} className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedClients.includes(pelanggan._id)}
                                            onChange={() => toggleClientSelection(pelanggan._id)}
                                            className="w-5 h-5 mt-0.5 text-[#009b7c] border-gray-300 rounded focus:ring-[#009b7c]" 
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-sm">{pelanggan.fullName}</p>
                                            <p className="text-xs text-gray-500 mt-1">{pelanggan.email} • {pelanggan.address || 'Alamat tidak tersedia'}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-md text-[10px] font-bold uppercase">Tersedia</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
                            <button
                                onClick={() => setIsAddClientModalOpen(false)}
                                className="px-6 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all bg-white"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleAssignClients}
                                disabled={isSubmitting || selectedClients.length === 0}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-[#009b7c] rounded-xl hover:bg-[#008268] transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Penugasan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Reuse Add Modal UI) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-gray-50 rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-white/20 max-h-[90vh]">
                        <div className="px-6 py-5 bg-[#009b7c] text-white flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Edit3 className="w-6 h-6" /> Edit Data Teknisi
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 max-h-full">
                            {/* Section: Akun & Kontak */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Akun & Kontak</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Nama Teknisi</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            disabled={true}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                                            placeholder="Budi Santoso"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                                        <input
                                            name="email"
                                            value={formData.email}
                                            disabled={true}
                                            type="email"
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                                            placeholder="budi.santoso@bieon.id"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Nomor Telepon</label>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            disabled={true}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                                            placeholder="+62 812-3456-7890"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
                                        <input
                                            name="password"
                                            value="••••••••"
                                            disabled={true}
                                            type="password"
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed outline-none"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Alamat</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            disabled={true}
                                            rows="2"
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                                            placeholder="Jl. Sudirman No. 45, Jakarta Pusat"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Informasi Profesional */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Informasi Profesional</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Posisi <span className="text-red-500">*</span></label>
                                        <input
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all"
                                            placeholder="Senior Technician"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Pengalaman (Tahun) <span className="text-red-500">*</span></label>
                                        <input
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            type="number"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#009b7c] transition-all"
                                            placeholder="5"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Spesialisasi (Pilih yang sesuai) <span className="text-red-500">*</span></label>
                                        <div className="flex flex-wrap gap-2">
                                            {SPECIFICATION_OPTIONS.map(spec => {
                                                const isSelected = formData.specializations.includes(spec);
                                                return (
                                                    <button
                                                        key={spec}
                                                        type="button"
                                                        onClick={() => toggleOption('specializations', spec)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold ring-1 transition-all flex items-center gap-1.5 ${isSelected
                                                            ? 'bg-emerald-500 text-white ring-emerald-500 shadow-md shadow-emerald-100'
                                                            : 'bg-white text-gray-500 ring-gray-200 hover:ring-emerald-300 hover:bg-emerald-50'
                                                            }`}
                                                    >
                                                        {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                                                        {spec}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Wilayah Kerja Standar <span className="text-red-500">*</span></label>
                                        <select
                                            name="workArea"
                                            value={formData.workArea}
                                            onChange={handleCityChange}
                                            className="appearance-none w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#009b7c] transition-all cursor-pointer"
                                        >
                                            <option value="">Pilih Kota</option>
                                            {Object.keys(CITY_AREAS).map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-9 pointer-events-none" />
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Status Teknisi <span className="text-red-500">*</span></label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="appearance-none w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#009b7c] transition-all cursor-pointer"
                                        >
                                            <option value="aktif">Aktif</option>
                                            <option value="nonaktif">Nonaktif</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-9 pointer-events-none" />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">
                                            Area Coverage Detail (Pilih Wilayah di {formData.workArea || 'Kota Selected'}) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.workArea ? (
                                                (CITY_AREAS[formData.workArea] || []).map(area => {
                                                    const isSelected = formData.coverageAreas.includes(area);
                                                    return (
                                                        <button
                                                            key={area}
                                                            type="button"
                                                            onClick={() => toggleOption('coverageAreas', area)}
                                                            className={`px-4 py-2 rounded-xl text-xs font-bold ring-1 transition-all flex items-center gap-1.5 ${isSelected
                                                                ? 'bg-blue-500 text-white ring-blue-500 shadow-md shadow-blue-100'
                                                                : 'bg-white text-gray-500 ring-gray-200 hover:ring-blue-300 hover:bg-blue-50'
                                                                }`}
                                                        >
                                                            {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                                                            {area}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <div className="w-full py-4 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-xs font-medium">
                                                    Silakan pilih Wilayah Kerja Standar terlebih dahulu
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Jadwal Kerja */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Jadwal Kerja</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                    {Object.entries(formData.workSchedule).map(([day, hours]) => (
                                        <div key={day} className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">{day}</label>
                                            <input
                                                type="text"
                                                value={hours}
                                                onChange={(e) => handleScheduleChange(day, e.target.value)}
                                                className="w-full px-2 py-1.5 bg-white border border-gray-100 rounded-lg text-[11px] focus:outline-none focus:border-purple-500 transition-all font-medium"
                                                placeholder="08:00 - 17:00"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 shrink-0">
                                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">Batal</button>
                                <button onClick={handleSaveEdit} disabled={isSubmitting} className="flex-1 py-3 bg-[#009b7c] text-white rounded-xl text-sm font-bold hover:bg-[#008268] transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed">
                                    <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Modal */}
            {isDeleteModalOpen && selectedTechnician && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[800] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
                        <div className="px-8 py-6 bg-[#dc2626] flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trash2 className="w-6 h-6" /> Hapus Teknisi
                            </h2>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto">
                            <div className="bg-red-50/50 p-5 rounded-2xl">
                                <p className="text-sm font-medium text-gray-600 mb-2">Anda akan menghapus teknisi/karyawan:</p>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedTechnician.name}</h3>
                                <p className="text-sm text-gray-500">ID: {selectedTechnician.id} • {selectedTechnician.email}</p>
                                {selectedTechnician.deletionRequest?.status === 'pending' && (
                                    <p className="mt-2 text-xs font-semibold text-amber-700">Akun ini sudah memiliki permintaan approval yang sedang menunggu keputusan Project Owner.</p>
                                )}
                            </div>

                            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-red-600 mb-3">
                                    <AlertCircle className="w-5 h-5" /> Peringatan!
                                </h4>
                                <ul className="list-disc list-outside space-y-2 text-xs font-medium text-red-700/80 ml-4">
                                    <li>Setelah disetujui Project Owner, proses penghapusan bersifat final dan tidak dapat dibatalkan</li>
                                    <li>Seluruh jadwal delegasi pelanggan teknisi ini akan dialokasikan menjadi "Unassigned"</li>
                                    <li>Riwayat pekerjaan teknisi tetap disimpan secara historis dengan label "(Dihapus)"</li>
                                    <li>Akses teknisi ke aplikasi mobile BIEON akan ditutup sepenuhnya</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900">Alasan Penghapusan <span className="text-red-500">*</span></label>
                                <textarea
                                    rows="3"
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder="Masukkan alasan mengapa akun teknisi ini perlu dihapus..."
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-500 transition-all shadow-sm"
                                ></textarea>
                            </div>

                            <p className="text-[11px] font-medium text-gray-500">
                                * Form ini akan dikirimkan ke Project Owner untuk persetujuan dan akan disimpan dalam laporan mutasi.
                            </p>
                        </div>

                        <div className="px-8 py-5 border-t border-gray-50 bg-gray-50 flex items-center justify-between gap-4 shrink-0">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDeleteTechnician}
                                disabled={!deleteReason.trim() || isSubmitting}
                                className={`flex-1 py-3 text-white rounded-2xl text-sm font-bold transition-all shadow-lg ${deleteReason.trim()
                                    ? 'bg-[#dc2626] hover:bg-[#b91c1c] shadow-red-100 cursor-pointer'
                                    : 'bg-[#fca5a5] cursor-not-allowed shadow-none opacity-80'
                                    }`}
                            >
                                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Teknisi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
