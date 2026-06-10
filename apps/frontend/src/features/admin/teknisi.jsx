import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const MAP_COLOR_PALETTE = ['#dc2626', '#047c22', '#2563eb', '#9333ea', '#ea580c', '#0891b2', '#4f46e5', '#be123c'];

const parseApiResponse = async (response) => {
    const raw = await response.text();

    if (!raw) return {};

    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
};

const formatLocationAge = (capturedAt, t) => {
    if (!capturedAt) return t('admin_technician.map_modal.location_not_shared');

    const diffMs = Date.now() - new Date(capturedAt).getTime();
    const diffMinutes = Math.max(Math.round(diffMs / 60000), 0);

    if (diffMinutes < 1) return t('admin_technician.map_modal.location_just_now');
    if (diffMinutes < 60) return t('admin_technician.map_modal.location_minutes_ago', { count: diffMinutes });

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return t('admin_technician.map_modal.location_hours_ago', { count: diffHours });

    const diffDays = Math.round(diffHours / 24);
    return t('admin_technician.map_modal.location_days_ago', { count: diffDays });
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
    const { t } = useTranslation();
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
                        {t('admin_technician.map_modal.loading_tech_locations')}
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
    const { t } = useTranslation();
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
    const [isWorkAreaDropdownOpen, setIsWorkAreaDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isMapTechDropdownOpen, setIsMapTechDropdownOpen] = useState(false);
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
        color: tech.color || '#059b27',
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
                throw new Error(result.message || t('admin_technician.errors.fetch_failed', 'Gagal mengambil data teknisi.'));
            }

            setTechnicians((result.data || []).map(mapApiTechnicianToUi));
        } catch (error) {
            setFormError(error.message || t('admin_technician.errors.fetch_error', 'Terjadi kesalahan saat mengambil data teknisi.'));
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
                setSuccessMessage(t('admin_technician.alerts.clients_assigned', 'Berhasil menugaskan pelanggan ke teknisi.'));
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
            setFormError(t('admin_technician.validation.all_fields_required', 'Nama, email, nomor telepon, alamat, dan password wajib diisi.'));
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
                setFormError(t('admin_technician.validation.password_min_len', 'Password minimal 8 karakter.'));
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
                throw new Error(result.message || t('admin_technician.errors.add_failed', 'Gagal membuat akun teknisi.'));
            }

            setSuccessMessage(t('admin_technician.alerts.tech_added', 'Akun teknisi berhasil ditambahkan.'));
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
            setFormError(t('admin_technician.validation.id_not_found', 'ID teknisi tidak ditemukan.'));
            return;
        }

        if (!deleteReason.trim()) {
            setFormError(t('admin_technician.validation.delete_reason_required', 'Alasan penghapusan wajib diisi.'));
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
                throw new Error(result.message || t('admin_technician.errors.delete_failed', 'Gagal menghapus teknisi.'));
            }

            const deletionRequest = result.data?.deletionRequest || null;

            setTechnicians((prev) => prev.map((tech) => (
                tech._id === selectedTechnician._id
                    ? { ...tech, deletionRequest }
                    : tech
            )));
            setSuccessMessage(result.message || t('admin_technician.alerts.delete_success', 'Permintaan penghapusan teknisi berhasil dibuat.'));
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
                throw new Error(result.message || t('admin_technician.errors.update_failed', 'Gagal memperbarui data teknisi.'));
            }

            setSuccessMessage(t('admin_technician.alerts.tech_updated', 'Data teknisi berhasil diperbarui.'));
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
        <SuperAdminLayout activeMenu="Teknisi" onNavigate={handleNavigate} title={t('admin_technician.table.title', 'Manajemen Teknisi')}>
            <div className="space-y-8">
                {formError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {formError}
                    </div>
                )}
                {successMessage && (
                    <div className="rounded-2xl border border-bieon-sense/25 bg-bieon-eco/10 px-4 py-3 text-sm font-semibold text-bieon-eco">
                        {successMessage}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-white via-sky-50/50 to-sky-100/80 border border-sky-100 shadow-sm rounded-[1.5rem] p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 w-28 h-28 text-sky-500/[0.1] pointer-events-none translate-x-4 translate-y-4 transition-transform duration-700 group-hover:scale-110 z-0">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
                                <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                            </svg>
                        </div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="w-12 h-12 bg-white text-sky-500 rounded-xl flex items-center justify-center shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
                                <Users className="w-6 h-6 group-hover:rotate-6 transition-transform" />
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-slate-800 leading-none">{totalTechnicians}</span>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('admin_technician.cards.total_tech', 'Total Teknisi')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/80 border border-emerald-100 shadow-sm rounded-[1.5rem] p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 w-28 h-28 text-bieon-eco/[0.1] pointer-events-none translate-x-4 translate-y-4 transition-transform duration-700 group-hover:scale-110 z-0">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="20" y="20" width="60" height="60" rx="10" stroke="currentColor" strokeWidth="2" fill="none" transform="rotate(15 50 50)" />
                                <rect x="30" y="30" width="40" height="40" rx="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" transform="rotate(30 50 50)" />
                            </svg>
                        </div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="w-12 h-12 bg-white text-bieon-eco rounded-xl flex items-center justify-center shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
                                <UserCheck className="w-6 h-6 group-hover:-rotate-6 transition-transform" />
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-slate-800 leading-none">{activeTechnicians}</span>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('admin_technician.cards.active_tech', 'Teknisi Aktif')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-white via-violet-50/50 to-violet-100/80 border border-violet-100 shadow-sm rounded-[1.5rem] p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 w-28 h-28 text-violet-500/[0.1] pointer-events-none translate-x-4 translate-y-4 transition-transform duration-700 group-hover:scale-110 z-0">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M50 10 L90 50 L50 90 L10 50 Z" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M50 25 L75 50 L50 75 L25 50 Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                            </svg>
                        </div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="w-12 h-12 bg-white text-violet-500 rounded-xl flex items-center justify-center shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
                                <Home className="w-6 h-6 group-hover:rotate-6 transition-transform" />
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-slate-800 leading-none">{totalClients}</span>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('admin_technician.cards.total_clients', 'Total Pelanggan Ditangani')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-white via-rose-50/50 to-rose-100/80 border border-rose-100 shadow-sm rounded-[1.5rem] p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 w-28 h-28 text-rose-500/[0.1] pointer-events-none translate-x-4 translate-y-4 transition-transform duration-700 group-hover:scale-110 z-0">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 80 C 40 50, 60 20, 80 80" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M20 50 C 40 20, 60 80, 80 50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                            </svg>
                        </div>
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="w-12 h-12 bg-white text-rose-500 rounded-xl flex items-center justify-center shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
                                <TrendingUp className="w-6 h-6 group-hover:-rotate-6 transition-transform" />
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-slate-800 leading-none">{avgClientsPerTech}</span>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('admin_technician.cards.avg_clients_per_tech', 'Rata-rata Pelanggan/Teknisi')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/30">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t('admin_technician.table.title')}</h2>
                                <p className="text-sm font-medium text-gray-500 mt-1">{t('admin_technician.table.desc', 'Kelola data dan lokasi teknisi operasional BIEON.')}</p>
                            </div>
                            <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-3 w-full lg:w-auto">
                                <div className="col-span-2 flex items-center gap-2">
                                    <div className="relative group flex-1 lg:w-72">
                                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-bieon-eco transition-all" />
                                        <input
                                            type="text"
                                            placeholder={t('admin_technician.table.search_placeholder', 'Cari teknisi...')}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-bieon-eco/10 focus:border-bieon-eco transition-all shadow-sm group-focus-within:bg-white"
                                        />
                                    </div>

                                    {/* Custom Dropdown Filter */}
                                    <div className="relative col-span-1">
                                        <button
                                            type="button"
                                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                            className="flex items-center justify-between gap-4 px-4 py-2.5 w-full md:min-w-[160px] border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-all text-sm font-semibold text-gray-600 focus:outline-none focus:ring-4 focus:ring-bieon-eco/10"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-4 h-4 text-bieon-eco" />
                                                <span className="capitalize">
                                                    {filterStatus === 'all' ? t('admin_technician.table.filter_all', 'Semua Status') : filterStatus === 'aktif' ? t('admin_technician.table.filter_active', 'Aktif') : t('admin_technician.table.filter_inactive', 'Nonaktif')}
                                                </span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isFilterDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-30"
                                                    onClick={() => setIsFilterDropdownOpen(false)}
                                                ></div>
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-40 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl bg-white/95">
                                                    {[
                                                        { id: 'all', label: t('admin_technician.table.filter_all', 'Semua Status') },
                                                        { id: 'aktif', label: t('admin_technician.table.filter_active', 'Aktif') },
                                                        { id: 'nonaktif', label: t('admin_technician.table.filter_inactive', 'Nonaktif') }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => {
                                                                setFilterStatus(item.id);
                                                                setIsFilterDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-between ${filterStatus === item.id ? 'bg-bieon-eco/10 text-bieon-eco' : 'text-gray-600 hover:bg-gray-50 hover:pl-6'}`}
                                                        >
                                                            {item.label}
                                                            {filterStatus === item.id && <CheckCircle className="w-4 h-4 text-bieon-eco" />}
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
                                        className="px-4 md:px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs md:text-sm font-semibold hover:bg-gray-50 hover:text-blue-600 transition-all flex items-center justify-center gap-2 group shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-50"
                                    >
                                        <MapIcon className="w-4 h-4 shrink-0 text-blue-500 group-hover:text-blue-600" />
                                        <span className="truncate">{t('admin_technician.table.btn_view_map', 'Lihat Peta')}</span>
                                    </button>

                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="px-4 md:px-5 py-2.5 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl text-xs md:text-sm font-semibold hover:brightness-105 transition-all flex items-center justify-center gap-2 group shadow-sm shadow-bieon-eco/15"
                                    >
                                        <Plus className="w-4 h-4 shrink-0 transition-transform group-hover:rotate-90" />
                                        <span className="truncate">{t('admin_technician.table.btn_add_tech', 'Tambah Teknisi')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto md:overflow-visible p-4 md:p-0">
                        {isLoadingTechnicians && (
                            <div className="px-4 py-3 text-sm font-semibold text-gray-500">{t('admin_technician.table.loading', 'Memuat data teknisi...')}</div>
                        )}

                        {/* Desktop Table View */}
                        <table className="w-full text-left table-auto hidden md:table">
                            <thead>
                                <tr className="bg-gradient-to-r from-emerald-50/80 to-sky-50/80 text-slate-600 text-[11px] font-black uppercase tracking-widest text-left border-b border-emerald-100/60">
                                    <th className="px-8 py-4 rounded-tl-xl">{t('admin_technician.table.col_id', 'ID Teknisi')}</th>
                                    <th className="px-8 py-4">{t('admin_technician.table.col_name', 'Nama Teknisi')}</th>
                                    <th className="px-8 py-4">{t('admin_technician.table.col_region', 'Lokasi Wilayah')}</th>
                                    <th className="px-8 py-4">{t('admin_technician.table.col_contact', 'Nomor Kontak')}</th>
                                    <th className="px-8 py-4 text-center">{t('admin_technician.table.col_client_count', 'Jumlah Pelanggan')}</th>
                                    <th className="px-8 py-4">{t('admin_technician.table.col_status', 'Status')}</th>
                                    <th className="px-8 py-4 text-center rounded-tr-xl">{t('admin_technician.table.col_action', 'Aksi')}</th>
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
                                                {t('admin_technician.table.client_format', { count: tech.clientsCount })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {(() => {
                                                const deletionMeta = getDeletionRequestStatusMeta(tech.deletionRequest);
                                                const isDefaultStatus = !tech.deletionRequest;
                                                return (
                                                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${isDefaultStatus ? (tech.status === 'aktif' ? 'bg-bieon-eco/10 text-bieon-eco' : 'bg-red-50 text-red-600') : getDeletionRequestBadgeClass(deletionMeta.tone)}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isDefaultStatus ? (tech.status === 'aktif' ? 'bg-bieon-eco' : 'bg-red-600') : (deletionMeta.tone === 'warning' ? 'bg-amber-600' : deletionMeta.tone === 'danger' ? 'bg-red-600' : 'bg-slate-600')}`}></span>
                                                        {isDefaultStatus ? (tech.status === 'aktif' ? t('admin_technician.table.filter_active') : t('admin_technician.table.filter_inactive')) : deletionMeta.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(tech)}
                                                    className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all"
                                                    title={t('tooltip.view_detail')}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditTechnician(tech)}
                                                    className="p-2 bg-bieon-eco/10 text-bieon-eco hover:bg-bieon-eco/15 hover:text-bieon-eco rounded-lg transition-all"
                                                    title={t('admin_technician.form_modal.title_edit')}
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
                                                    className="p-2 bg-bieon-sense/10 text-bieon-sense hover:bg-bieon-sense/20 rounded-lg transition-all"
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
                                                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${isDefaultStatus ? (tech.status === 'aktif' ? 'bg-bieon-eco/10 text-bieon-eco' : 'bg-red-50 text-red-600') : getDeletionRequestBadgeClass(deletionMeta.tone)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isDefaultStatus ? (tech.status === 'aktif' ? 'bg-bieon-eco' : 'bg-red-600') : (deletionMeta.tone === 'warning' ? 'bg-amber-600' : deletionMeta.tone === 'danger' ? 'bg-red-600' : 'bg-slate-600')}`}></span>
                                                    {isDefaultStatus ? (tech.status === 'aktif' ? t('admin_technician.table.filter_active') : t('admin_technician.table.filter_inactive')) : deletionMeta.label}
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
                                            <span className="font-semibold text-gray-500 w-16">{t('admin_technician.detail_modal.col_bieon_count').split(' ')[1]}:</span>
                                            <span className="font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md">{t('admin_technician.table.client_format', { count: tech.clientsCount })}</span>
                                        </div>
                                    </div>

                                    <div className="p-3 border-t border-gray-50 flex items-center justify-between gap-2">
                                        <button onClick={() => handleViewDetail(tech)} className="flex-1 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition-all text-center">{t('admin_technician.table.btn_detail', 'Detail')}</button>
                                        <button onClick={() => handleEditTechnician(tech)} className="flex-1 py-2 bg-bieon-eco/10 text-bieon-eco font-bold text-xs rounded-xl hover:bg-bieon-eco/15 transition-all text-center">{t('admin_technician.table.btn_edit', 'Edit')}</button>
                                        <button onClick={() => openMapModal(tech.id)} className="flex-1 py-2 bg-bieon-sense/10 text-bieon-sense font-bold text-xs rounded-xl hover:bg-bieon-sense/20 transition-all text-center">{t('admin_technician.table.btn_map', 'Peta')}</button>
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
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-white/20 max-h-[90vh]">
                        <div className="px-6 md:px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 text-bieon-eco border border-emerald-100 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <h2 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                                    {t('admin_technician.form_modal.title_add')}
                                </h2>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl flex items-center justify-center transition-all group shrink-0">
                                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 max-h-full">
                            {/* Section: Akun & Kontak */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-bieon-eco/10 text-bieon-eco flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t('admin_technician.form_modal.cat_account')}</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_name')} <span className="text-red-500">*</span></label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-bieon-eco transition-all"
                                            placeholder={t('admin_technician.form_modal.ph_name')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_email')} <span className="text-red-500">*</span></label>
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            type="email"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-bieon-eco transition-all"
                                            placeholder={t('admin_technician.form_modal.ph_email')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_phone')} <span className="text-red-500">*</span></label>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-bieon-eco transition-all"
                                            placeholder={t('admin_technician.form_modal.ph_phone')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_password')} <span className="text-red-500">*</span></label>
                                        <input
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            type="password"
                                            placeholder="********"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-bieon-eco transition-all"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_address')} <span className="text-red-500">*</span></label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-bieon-eco transition-all"
                                            placeholder={t('admin_technician.form_modal.ph_address')}
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
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t('admin_technician.form_modal.cat_professional')}</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_position')} <span className="text-red-500">*</span></label>
                                        <input
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-bieon-eco transition-all"
                                            placeholder={t('admin_technician.form_modal.ph_position')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_experience')} <span className="text-red-500">*</span></label>
                                        <input
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            type="number"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-bieon-eco transition-all"
                                            placeholder={t('admin_technician.form_modal.ph_experience')}
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_specialization')} <span className="text-red-500">*</span></label>
                                        <div className="flex flex-wrap gap-2">
                                            {SPECIFICATION_OPTIONS.map(spec => {
                                                const isSelected = formData.specializations.includes(spec);
                                                return (
                                                    <button
                                                        key={spec}
                                                        type="button"
                                                        onClick={() => toggleOption('specializations', spec)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold ring-1 transition-all flex items-center gap-1.5 ${isSelected
                                                            ? 'bg-bieon-eco text-white ring-bieon-eco/100 shadow-md shadow-bieon-eco/15'
                                                            : 'bg-white text-gray-500 ring-gray-200 hover:ring-bieon-sense/40 hover:bg-bieon-eco/10'
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
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_work_region')} <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsWorkAreaDropdownOpen(!isWorkAreaDropdownOpen)}
                                                className={`w-full px-4 py-2.5 bg-white border ${isWorkAreaDropdownOpen ? 'border-bieon-eco ring-4 ring-bieon-eco/10' : 'border-gray-200'} rounded-xl text-sm text-left flex items-center justify-between transition-all hover:border-bieon-sense/40 focus:outline-none`}
                                            >
                                                <span className={formData.workArea ? 'text-gray-800 font-semibold' : 'text-gray-400'}>
                                                    {formData.workArea ? t(`admin_technician.form_modal.opt_city_${formData.workArea === 'Lainnya' ? 'other' : formData.workArea.toLowerCase()}`, formData.workArea) : t('admin_technician.form_modal.lbl_select_city')}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isWorkAreaDropdownOpen ? 'rotate-180 text-bieon-eco' : ''}`} />
                                            </button>
                                            
                                            {isWorkAreaDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-[700]" onClick={() => setIsWorkAreaDropdownOpen(false)}></div>
                                                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white border border-gray-100 rounded-2xl shadow-2xl z-[701] py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl bg-white/95">
                                                        {Object.keys(CITY_AREAS).map(city => {
                                                            const cityKey = city === 'Lainnya' ? 'opt_city_other' : `opt_city_${city.toLowerCase()}`;
                                                            return (
                                                                <button
                                                                    key={city}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleCityChange({ target: { value: city } });
                                                                        setIsWorkAreaDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-5 py-3 text-sm font-semibold transition-all flex items-center justify-between ${formData.workArea === city ? 'bg-bieon-eco/10 text-bieon-eco' : 'text-gray-700 hover:bg-gray-50 hover:pl-6'}`}
                                                                >
                                                                    {t(`admin_technician.form_modal.${cityKey}`, city)}
                                                                    {formData.workArea === city && <CheckCircle className="w-4 h-4 text-bieon-eco animate-in zoom-in duration-300" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_status')} <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                                className={`w-full px-4 py-2.5 bg-white border ${isStatusDropdownOpen ? 'border-bieon-eco ring-4 ring-bieon-eco/10' : 'border-gray-200'} rounded-xl text-sm text-left flex items-center justify-between transition-all hover:border-bieon-sense/40 focus:outline-none`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${formData.status === 'aktif' ? 'bg-bieon-eco' : 'bg-red-500'}`}></span>
                                                    <span className="text-gray-800 font-semibold uppercase tracking-wider">
                                                        {formData.status === 'aktif' ? t('admin_technician.form_modal.status_active') : t('admin_technician.form_modal.status_inactive')}
                                                    </span>
                                                </div>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isStatusDropdownOpen ? 'rotate-180 text-bieon-eco' : ''}`} />
                                            </button>

                                            {isStatusDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-[700]" onClick={() => setIsStatusDropdownOpen(false)}></div>
                                                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white border border-gray-100 rounded-2xl shadow-2xl z-[701] py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl bg-white/95">
                                                        {[
                                                            { id: 'aktif', label: t('admin_technician.form_modal.status_active'), color: 'bg-bieon-eco' },
                                                            { id: 'nonaktif', label: t('admin_technician.form_modal.status_inactive'), color: 'bg-red-500' }
                                                        ].map(item => (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    handleInputChange({ target: { name: 'status', value: item.id } });
                                                                    setIsStatusDropdownOpen(false);
                                                                }}
                                                                className={`w-full text-left px-5 py-3 text-sm font-semibold transition-all flex items-center justify-between ${formData.status === item.id ? 'bg-gray-50 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:pl-6'}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                                                                    {item.label}
                                                                </div>
                                                                {formData.status === item.id && <CheckCircle className="w-4 h-4 text-bieon-eco animate-in zoom-in duration-300" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">
                                            {t('admin_technician.form_modal.lbl_area_coverage', { city: formData.workArea || 'Kota Selected' })} <span className="text-red-500">*</span>
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
                                                    {t('admin_technician.form_modal.select_work_region_first', 'Silakan pilih Wilayah Kerja Standar terlebih dahulu')}
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
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t('admin_technician.form_modal.cat_schedule')}</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                    {Object.entries(formData.workSchedule).map(([day, hours]) => {
                                        const dayKey = `day_${day.toLowerCase().replace('senin', 'monday').replace('selasa', 'tuesday').replace('rabu', 'wednesday').replace('kamis', 'thursday').replace('jumat', 'friday').replace('sabtu', 'saturday').replace('minggu', 'sunday')}`;
                                        return (
                                            <div key={day} className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">{t(`admin_technician.form_modal.${dayKey}`, day)}</label>
                                                <input
                                                    type="text"
                                                    value={hours}
                                                    onChange={(e) => handleScheduleChange(day, e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-white border border-gray-100 rounded-lg text-[11px] focus:outline-none focus:border-purple-500 transition-all font-medium"
                                                    placeholder="08:00 - 17:00"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 shrink-0">
                                <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">{t('admin_technician.form_modal.btn_cancel')}</button>
                                <button onClick={handleAddTechnician} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl text-sm font-bold hover:brightness-105 transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed">
                                    <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    {isSubmitting ? t('admin_technician.form_modal.btn_save').split(' ')[0] + '...' : t('admin_technician.form_modal.btn_save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isDetailModalOpen && selectedTechnician && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-5xl w-full flex flex-col overflow-hidden max-h-[95vh] border border-white/20">

                        {/* Header */}
                        <div className="px-6 md:px-8 py-6 bg-white border-b border-gray-100 flex items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 sm:gap-5">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 text-bieon-eco border border-emerald-100 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center shadow-sm shrink-0">
                                    <UserCog className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div className="pr-2">
                                    <h2 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight leading-tight">{selectedTechnician.name}</h2>
                                    <p className="text-slate-500 text-[11px] sm:text-sm font-medium mt-1 leading-snug">ID: {selectedTechnician.id}</p>
                                    {selectedTechnician.deletionRequest && (
                                        <div className={`mt-3 inline-flex px-3 py-1.5 rounded-full text-[11px] font-bold ${getDeletionRequestBadgeClass(getDeletionRequestStatusMeta(selectedTechnician.deletionRequest).tone)}`}>
                                            {getDeletionRequestStatusMeta(selectedTechnician.deletionRequest).label}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl flex items-center justify-center transition-all group shrink-0">
                                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t('admin_technician.detail_modal.sec_contact')}</h3>
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
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{t('admin_technician.detail_modal.lbl_phone')}</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedTechnician.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{t('admin_technician.detail_modal.lbl_address')}</p>
                                                <p className="text-sm font-semibold text-gray-800 leading-relaxed">{selectedTechnician.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detail Profesional */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-bieon-eco/10 text-bieon-eco flex items-center justify-center">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t('admin_technician.detail_modal.sec_skills')}</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Award className="w-4 h-4 text-bieon-eco mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{t('admin_technician.detail_modal.sec_skills')}</p>
                                                <p className="text-sm font-semibold text-gray-800">{t('admin_technician.detail_modal.format_position', { position: selectedTechnician.position || 'Technician', years: selectedTechnician.experience || 0 })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Zap className="w-4 h-4 text-bieon-eco mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{t('admin_technician.detail_modal.lbl_specialization')}</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(selectedTechnician.specializations || []).map((s, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-bieon-eco/10 text-bieon-eco rounded text-[10px] font-bold">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <MapIcon className="w-4 h-4 text-bieon-eco mt-1 shrink-0" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{t('admin_technician.detail_modal.lbl_coverage')}</p>
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
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t('admin_technician.detail_modal.sec_schedule')}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {Object.entries(selectedTechnician.workSchedule || {}).map(([day, hours]) => {
                                            const dayKey = `day_${day.toLowerCase().replace('senin', 'monday').replace('selasa', 'tuesday').replace('rabu', 'wednesday').replace('kamis', 'thursday').replace('jumat', 'friday').replace('sabtu', 'saturday').replace('minggu', 'sunday')}`;
                                            return (
                                                <div key={day} className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{t(`admin_technician.form_modal.${dayKey}`, day)}</span>
                                                    <span className={`text-[11px] font-bold ${hours === 'Off' ? 'text-red-400' : 'text-gray-700'}`}>{hours}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Table Pelanggan section */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">{t('admin_technician.detail_modal.sec_clients')}</h3>
                                    <button
                                        onClick={() => {
                                            setIsAddClientModalOpen(true);
                                            fetchAvailableClients();
                                        }}
                                        className="px-4 py-2 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-lg text-sm font-semibold hover:brightness-105 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {t('admin_technician.detail_modal.btn_add_client')}
                                    </button>
                                </div>
                                <div className="overflow-hidden rounded-xl md:border border-gray-200">
                                    {/* Desktop Table */}
                                    <table className="w-full text-left table-auto bg-white hidden md:table">
                                        <thead className="bg-gray-50 text-gray-500 text-[12px] font-black uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">{t('admin_technician.detail_modal.col_client_name')}</th>
                                                <th className="px-6 py-4">{t('admin_technician.detail_modal.col_location')}</th>
                                                <th className="px-6 py-4">{t('admin_technician.detail_modal.col_bieon_count')}</th>
                                                <th className="px-6 py-4">{t('admin_technician.detail_modal.col_device_count')}</th>
                                                <th className="px-6 py-4">{t('admin_technician.detail_modal.col_sys_status')}</th>
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
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap ${client.status === 'online' ? 'bg-bieon-eco/10 text-bieon-eco' :
                                                                client.status === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                                                                }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'online' ? 'bg-bieon-eco' :
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
                                                        {t('admin_technician.detail_modal.empty_clients')}
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
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 whitespace-nowrap ${client.status === 'online' ? 'bg-bieon-eco/10 text-bieon-eco' :
                                                            client.status === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'online' ? 'bg-bieon-eco' :
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
                                                {t('admin_technician.detail_modal.empty_clients')}
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
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-6xl w-full flex flex-col overflow-hidden border border-white/20 h-[85vh]">
                        {/* Header */}
                        <div className="px-6 md:px-8 py-6 bg-white border-b border-gray-100 flex items-start sm:items-center justify-between gap-4 shrink-0 relative">
                            <div className="flex items-center gap-4 sm:gap-5 pr-10 md:pr-0">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 text-blue-500 border border-blue-100 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center shadow-sm shrink-0">
                                    <MapIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div className="pr-2">
                                    <h2 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight leading-tight">{t('admin_technician.map_modal.title')}</h2>
                                    <p className="text-slate-500 text-[11px] sm:text-sm font-medium mt-1 leading-snug">{t('admin_technician.map_modal.desc')}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsMapModalOpen(false)} className="absolute right-4 top-4 md:static w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl flex items-center justify-center transition-all group shrink-0">
                                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
                            <div className="flex items-center gap-6 mb-4 overflow-x-auto md:overflow-visible pb-4 snap-x snap-mandatory always-scroll w-full relative z-[2000]">
                                <div className="relative shrink-0 flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setIsMapTechDropdownOpen(!isMapTechDropdownOpen)}
                                        className="min-w-[200px] px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-all focus:outline-none focus:ring-4 focus:ring-blue-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <UserCog className="w-4 h-4 text-blue-500" />
                                            <span>
                                                {mapFilterTech === 'all' ? t('admin_technician.map_modal.ctrl_all') : (mapTechnicians.find(t => t.id === mapFilterTech)?.name || 'Pilih Teknisi')}
                                            </span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isMapTechDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isMapTechDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-[1999]" onClick={() => setIsMapTechDropdownOpen(false)}></div>
                                            <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[2000] py-2 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl bg-white/95">
                                                <button
                                                    onClick={() => {
                                                        setMapFilterTech('all');
                                                        setSelectedMapTechnicianId(null);
                                                        setIsMapTechDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-between ${mapFilterTech === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    <span>{t('admin_technician.map_modal.ctrl_all')}</span>
                                                    {mapFilterTech === 'all' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                                </button>
                                                <div className="h-px bg-gray-50 my-1"></div>
                                                {mapTechnicians.map((tech) => (
                                                    <button
                                                        key={tech.id}
                                                        onClick={() => {
                                                            setMapFilterTech(tech.id);
                                                            setSelectedMapTechnicianId(tech.id);
                                                            setIsMapTechDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-between ${mapFilterTech === tech.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tech.color }}></div>
                                                            <span className="truncate">{tech.name}</span>
                                                        </div>
                                                        {mapFilterTech === tech.id && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="w-px h-6 bg-gray-200 shrink-0 hidden md:block"></div>

                                <div className="flex items-center gap-4 shrink-0 snap-end">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap">{t('admin_technician.map_modal.ctrl_legend')}</span>
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
                                    emptyMessage={t('admin_technician.map_modal.empty_map')}
                                />

                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 overflow-y-auto">
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">{t('admin_technician.map_modal.sidebar_title')}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{t('admin_technician.map_modal.sidebar_desc')}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={fetchMapLocations}
                                            className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all"
                                        >
                                            {t('admin_technician.map_modal.btn_refresh')}
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
                                                <p>{t('admin_technician.map_modal.lbl_id')} <span className="font-semibold text-gray-800">{selectedMapTechnician.id}</span></p>
                                                <p>{t('admin_technician.map_modal.lbl_region')} <span className="font-semibold text-gray-800">{selectedMapTechnician.workArea || '-'}</span></p>
                                                <p>{t('admin_technician.map_modal.lbl_pin')} <span className="font-semibold text-gray-800">{selectedMapTechnician.mapLocation?.label || '-'}</span></p>
                                                <p>{t('admin_technician.map_modal.lbl_status')} <span className="font-semibold text-gray-800">{selectedMapTechnician.status === 'aktif' ? t('admin_technician.table.filter_active') : t('admin_technician.table.filter_inactive')}</span></p>
                                                <p>{t('admin_technician.map_modal.lbl_clients')} <span className="font-semibold text-gray-800">{selectedMapTechnician.clientsCount}</span></p>
                                                {selectedMapTechnician.currentLocation && (
                                                    <>
                                                        <p>{t('admin_technician.map_modal.lbl_coord_live')} <span className="font-semibold text-gray-800">{selectedMapTechnician.currentLocation.lat.toFixed(6)}, {selectedMapTechnician.currentLocation.lng.toFixed(6)}</span></p>
                                                        <p>{t('admin_technician.map_modal.lbl_update_live')} <span className="font-semibold text-gray-800">{formatLocationAge(selectedMapTechnician.currentLocation.capturedAt, t)}</span></p>
                                                        <p>{t('admin_technician.map_modal.lbl_accuracy')} <span className="font-semibold text-gray-800">{selectedMapTechnician.currentLocation.accuracy != null ? `${Math.round(selectedMapTechnician.currentLocation.accuracy)} m` : '-'}</span></p>
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
                                                        <p className="mt-1 text-xs text-gray-500">{tech.id} • {tech.workArea || t('admin_technician.map_modal.no_region')}</p>
                                                    </div>
                                                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${tech.currentLocation ? 'bg-bieon-eco/10 text-bieon-eco' : 'bg-slate-100 text-slate-700'}`}>
                                                        {tech.currentLocation ? t('admin_technician.map_modal.live_available') : t('admin_technician.map_modal.pin_region')}
                                                    </span>
                                                </div>
                                                {tech.currentLocation ? (
                                                    <div className="mt-2 text-xs text-gray-600">
                                                        <p>{t('admin_technician.map_modal.pin_fixed')} {tech.mapLocation?.label || tech.workArea || t('admin_technician.map_modal.pin_region')}</p>
                                                        <p className="mt-1">{t('admin_technician.map_modal.live_last')} {tech.currentLocation.lat.toFixed(5)}, {tech.currentLocation.lng.toFixed(5)}</p>
                                                        <p className="mt-1">{t('admin_technician.map_modal.updated')} {formatLocationAge(tech.currentLocation.capturedAt, t)}</p>
                                                    </div>
                                                ) : (
                                                    <p className="mt-2 text-xs text-gray-500">{t('admin_technician.map_modal.help_pin_locked', { location: tech.mapLocation?.label || tech.workArea || t('admin_technician.map_modal.pin_region') })}</p>
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
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/20 flex flex-col max-h-[80vh]">
                        <div className="px-6 md:px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 border border-blue-100 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight leading-tight">{t('admin_technician.detail_modal.btn_add_client')}</h2>
                                    <p className="text-slate-500 text-[11px] sm:text-sm font-medium mt-1 leading-snug">{t('admin_technician.detail_modal.desc_add_client', 'Tambahkan pelanggan ke delegasi tugas teknisi')}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddClientModalOpen(false)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl flex items-center justify-center transition-all group shrink-0">
                                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            <p className="text-sm font-bold text-gray-700">{t('admin_technician.detail_modal.lbl_available_clients', 'Pilih dari pelanggan yang tersedia (Homeowner):')}</p>

                            <div className="space-y-3">
                                {isLoadingClients ? (
                                    <div className="text-center py-6 text-gray-500 text-sm">{t('admin_technician.detail_modal.loading_clients', 'Memuat pelanggan yang tersedia...')}</div>
                                ) : availableClients.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 text-sm italic">{t('admin_technician.detail_modal.empty_available_clients', 'Tidak ada pelanggan (Homeowner) yang belum ditugaskan.')}</div>
                                ) : availableClients.map((pelanggan, idx) => (
                                    <label key={idx} className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedClients.includes(pelanggan._id)}
                                            onChange={() => toggleClientSelection(pelanggan._id)}
                                            className="w-5 h-5 mt-0.5 text-bieon-eco border-gray-300 rounded focus:ring-bieon-eco" 
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-sm">{pelanggan.fullName}</p>
                                            <p className="text-xs text-gray-500 mt-1">{pelanggan.email} • {pelanggan.address || t('admin_technician.map_modal.no_region')}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-md text-[10px] font-bold uppercase">{t('admin_technician.detail_modal.status_available')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>                         <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
                            <button
                                onClick={() => setIsAddClientModalOpen(false)}
                                className="px-6 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all bg-white"
                            >
                                {t('admin_technician.form_modal.btn_cancel')}
                            </button>
                            <button
                                onClick={handleAssignClients}
                                disabled={isSubmitting || selectedClients.length === 0}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-bieon-eco to-bieon-sense rounded-xl hover:brightness-105 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? t('admin_technician.form_modal.btn_save').split(' ')[0] + '...' : t('admin_technician.detail_modal.btn_save_assign', 'Simpan Penugasan')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Reuse Add Modal UI) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border border-white/20 max-h-[90vh]">
                        <div className="px-6 md:px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 text-bieon-eco border border-emerald-100 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                    <Edit3 className="w-6 h-6" />
                                </div>
                                <h2 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                                    {t('admin_technician.form_modal.title_edit')}
                                </h2>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl flex items-center justify-center transition-all group shrink-0">
                                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 max-h-full">
                            {/* Section: Akun & Kontak */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-lg bg-bieon-eco/10 text-bieon-eco flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t('admin_technician.form_modal.cat_account')}</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">{t('admin_technician.form_modal.lbl_name')}</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            disabled={true}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                                            placeholder={t('admin_technician.form_modal.ph_name')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">{t('admin_technician.form_modal.lbl_email')}</label>
                                        <input
                                            name="email"
                                            value={formData.email}
                                            disabled={true}
                                            type="email"
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                                            placeholder={t('admin_technician.form_modal.ph_email')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">{t('admin_technician.form_modal.lbl_phone')}</label>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            disabled={true}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                                            placeholder={t('admin_technician.form_modal.ph_phone')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">{t('admin_technician.form_modal.lbl_password')}</label>
                                        <input
                                            name="password"
                                            value="••••••••"
                                            disabled={true}
                                            type="password"
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed outline-none"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">{t('admin_technician.form_modal.lbl_address')}</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            disabled={true}
                                            rows="2"
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                                            placeholder={t('admin_technician.form_modal.ph_address')}
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
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t('admin_technician.form_modal.cat_professional')}</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_position')} <span className="text-red-500">*</span></label>
                                        <input
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-bieon-eco transition-all"
                                            placeholder={t('admin_technician.form_modal.ph_position')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_experience')} <span className="text-red-500">*</span></label>
                                        <input
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            type="number"
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-bieon-eco transition-all"
                                            placeholder="5"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_specialization')} <span className="text-red-500">*</span></label>
                                        <div className="flex flex-wrap gap-2">
                                            {SPECIFICATION_OPTIONS.map(spec => {
                                                const isSelected = formData.specializations.includes(spec);
                                                return (
                                                    <button
                                                        key={spec}
                                                        type="button"
                                                        onClick={() => toggleOption('specializations', spec)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold ring-1 transition-all flex items-center gap-1.5 ${isSelected
                                                            ? 'bg-bieon-eco text-white ring-bieon-eco/100 shadow-md shadow-bieon-eco/15'
                                                            : 'bg-white text-gray-500 ring-gray-200 hover:ring-bieon-sense/40 hover:bg-bieon-eco/10'
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
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_work_region')} <span className="text-red-500">*</span></label>
                                        <div className="relative group">
                                            <button
                                                type="button"
                                                onClick={() => setIsWorkAreaDropdownOpen(!isWorkAreaDropdownOpen)}
                                                className={`w-full px-4 py-2.5 bg-white border ${isWorkAreaDropdownOpen ? 'border-bieon-eco ring-4 ring-bieon-eco/10' : 'border-gray-200'} rounded-xl text-sm text-left flex items-center justify-between transition-all hover:border-bieon-sense/40 focus:outline-none`}
                                            >
                                                <span className={formData.workArea ? 'text-gray-800 font-semibold' : 'text-gray-400'}>
                                                    {formData.workArea ? t(`admin_technician.form_modal.opt_city_${formData.workArea === 'Lainnya' ? 'other' : formData.workArea.toLowerCase()}`, formData.workArea) : t('admin_technician.form_modal.lbl_select_city')}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isWorkAreaDropdownOpen ? 'rotate-180 text-bieon-eco' : ''}`} />
                                            </button>
                                            
                                            {isWorkAreaDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-[700]" onClick={() => setIsWorkAreaDropdownOpen(false)}></div>
                                                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white border border-gray-100 rounded-2xl shadow-2xl z-[701] py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl bg-white/95">
                                                        {Object.keys(CITY_AREAS).map(city => {
                                                            const cityKey = city === 'Lainnya' ? 'opt_city_other' : `opt_city_${city.toLowerCase()}`;
                                                            return (
                                                                <button
                                                                    key={city}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleCityChange({ target: { value: city } });
                                                                        setIsWorkAreaDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-5 py-3 text-sm font-semibold transition-all flex items-center justify-between ${formData.workArea === city ? 'bg-bieon-eco/10 text-bieon-eco' : 'text-gray-700 hover:bg-gray-50 hover:pl-6'}`}
                                                                >
                                                                    {t(`admin_technician.form_modal.${cityKey}`, city)}
                                                                    {formData.workArea === city && <CheckCircle className="w-4 h-4 text-bieon-eco animate-in zoom-in duration-300" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t('admin_technician.form_modal.lbl_status')} <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                                className={`w-full px-4 py-2.5 bg-white border ${isStatusDropdownOpen ? 'border-bieon-eco ring-4 ring-bieon-eco/10' : 'border-gray-200'} rounded-xl text-sm text-left flex items-center justify-between transition-all hover:border-bieon-sense/40 focus:outline-none`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${formData.status === 'aktif' ? 'bg-bieon-eco' : 'bg-red-500'}`}></span>
                                                    <span className="text-gray-800 font-semibold uppercase tracking-wider">
                                                        {formData.status === 'aktif' ? t('admin_technician.form_modal.status_active') : t('admin_technician.form_modal.status_inactive')}
                                                    </span>
                                                </div>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isStatusDropdownOpen ? 'rotate-180 text-bieon-eco' : ''}`} />
                                            </button>

                                            {isStatusDropdownOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-[700]" onClick={() => setIsStatusDropdownOpen(false)}></div>
                                                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white border border-gray-100 rounded-2xl shadow-2xl z-[701] py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl bg-white/95">
                                                        {[
                                                            { id: 'aktif', label: 'Aktif', color: 'bg-bieon-eco' },
                                                            { id: 'nonaktif', label: 'Nonaktif', color: 'bg-red-500' }
                                                        ].map(item => (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    handleInputChange({ target: { name: 'status', value: item.id } });
                                                                    setIsStatusDropdownOpen(false);
                                                                }}
                                                                className={`w-full text-left px-5 py-3 text-sm font-semibold transition-all flex items-center justify-between ${formData.status === item.id ? 'bg-gray-50 text-gray-900' : 'text-gray-700 hover:bg-gray-50 hover:pl-6'}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                                                                    {item.label}
                                                                </div>
                                                                {formData.status === item.id && <CheckCircle className="w-4 h-4 text-bieon-eco animate-in zoom-in duration-300" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2 space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">
                                            {t('admin_technician.form_modal.lbl_area_coverage', { city: formData.workArea || 'Selected City' })} <span className="text-red-500">*</span>
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
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t('admin_technician.form_modal.cat_schedule')}</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                    {Object.entries(formData.workSchedule).map(([day, hours]) => {
                                        const dayKey = `day_${day.toLowerCase().replace('senin', 'monday').replace('selasa', 'tuesday').replace('rabu', 'wednesday').replace('kamis', 'thursday').replace('jumat', 'friday').replace('sabtu', 'saturday').replace('minggu', 'sunday')}`;
                                        return (
                                            <div key={day} className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">{t(`admin_technician.form_modal.${dayKey}`, day)}</label>
                                                <input
                                                    type="text"
                                                    value={hours}
                                                    onChange={(e) => handleScheduleChange(day, e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-white border border-gray-100 rounded-lg text-[11px] focus:outline-none focus:border-purple-500 transition-all font-medium"
                                                    placeholder="08:00 - 17:00"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 shrink-0">
                                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">{t('admin_technician.form_modal.btn_cancel')}</button>
                                <button onClick={handleSaveEdit} disabled={isSubmitting} className="flex-1 py-3 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl text-sm font-bold hover:brightness-105 transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed">
                                    <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                                    {isSubmitting ? t('admin_technician.form_modal.btn_save').split(' ')[0] + '...' : t('admin_technician.form_modal.btn_save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Modal */}
            {isDeleteModalOpen && selectedTechnician && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[800] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/20">
                        <div className="px-6 md:px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-50 text-red-500 border border-red-100 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <h2 className="text-lg sm:text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                                    {t('admin_technician.delete_modal.title')}
                                </h2>
                            </div>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl flex items-center justify-center transition-all group shrink-0">
                                <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto">
                            <div className="bg-red-50/50 p-5 rounded-2xl">
                                <p className="text-sm font-medium text-gray-600 mb-2">{t('admin_technician.delete_modal.desc')}</p>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedTechnician.name}</h3>
                                <p className="text-sm text-gray-500">ID: {selectedTechnician.id} • {selectedTechnician.email}</p>
                                {selectedTechnician.deletionRequest?.status === 'pending' && (
                                    <p className="mt-2 text-xs font-semibold text-amber-700">Akun ini sudah memiliki permintaan approval yang sedang menunggu keputusan Project Owner.</p>
                                )}
                            </div>

                            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-red-600 mb-3">
                                    <AlertCircle className="w-5 h-5" /> {t('admin_technician.delete_modal.warning_title')}
                                </h4>
                                <ul className="list-disc list-outside space-y-2 text-xs font-medium text-red-700/80 ml-4">
                                    <li>{t('admin_technician.delete_modal.warning_1')}</li>
                                    <li>{t('admin_technician.delete_modal.warning_2')}</li>
                                    <li>{t('admin_technician.delete_modal.warning_3')}</li>
                                    <li>{t('admin_technician.delete_modal.warning_4')}</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900">{t('admin_technician.delete_modal.lbl_reason')} <span className="text-red-500">*</span></label>
                                <textarea
                                    rows="3"
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder={t('admin_technician.delete_modal.placeholder_reason')}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-500 transition-all shadow-sm"
                                ></textarea>
                            </div>

                            <p className="text-[11px] font-medium text-gray-500">
                                {t('admin_technician.delete_modal.help_text')}
                            </p>
                        </div>

                        <div className="px-8 py-5 border-t border-gray-50 bg-gray-50 flex items-center justify-between gap-4 shrink-0">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                            >
                                {t('admin_technician.form_modal.btn_cancel')}
                            </button>
                            <button
                                onClick={confirmDeleteTechnician}
                                disabled={!deleteReason.trim() || isSubmitting}
                                className={`flex-1 py-3 text-white rounded-2xl text-sm font-bold transition-all shadow-lg ${deleteReason.trim()
                                    ? 'bg-[#dc2626] hover:bg-[#b91c1c] shadow-red-100 cursor-pointer'
                                    : 'bg-[#fca5a5] cursor-not-allowed shadow-none opacity-80'
                                    }`}
                            >
                                {isSubmitting ? t('admin_technician.delete_modal.btn_submit').split(' ')[2] + '...' : t('admin_technician.delete_modal.btn_submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
