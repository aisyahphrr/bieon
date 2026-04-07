import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Save,
    X,
    Settings,
    Info,
    AlertCircle,
    Check,
    Zap,
    Home,
    Wifi,
    Radio,
    Power,
} from 'lucide-react';

const CATEGORY_DEVICES = {
    'sensor': ['Temperature Sensor', 'Humidity Sensor', 'Air Quality Sensor', 'Motion Sensor', 'Light Sensor'],
    'smart-switch': ['Light', 'Fan', 'Exhaust Fan', 'Ceiling Fan'],
    'smart-plug': ['AC', 'TV', 'Heater', 'Water Heater', 'Refrigerator', 'Washing Machine'],
    'remote': ['AC', 'TV', 'Set-Top Box', 'Sound System', 'Projector'],
};

const CATEGORY_LABELS = {
    'sensor': 'Sensor',
    'smart-switch': 'Smart Switch',
    'smart-plug': 'Smart Plug',
    'remote': 'Remote',
};

export function EditHubNodePage({ device, bieonSystem, onSave, onCancel }) {
    // ==================== STATE MANAGEMENT ====================
    const [formData, setFormData] = useState({
        name: device.name,
        hubId: device.hubId,
        location: device.location,
        category: device.category,
        deviceType: device.deviceType,
        notes: device.notes,
    });

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Track if hub or category changed (requires reconfiguration)
    const hubChanged = formData.hubId !== device.hubId;
    const categoryChanged = formData.category !== device.category;
    const deviceTypeChanged = formData.deviceType !== device.deviceType;
    const requiresReconfiguration = hubChanged || categoryChanged || deviceTypeChanged;

    // Get current hub name
    const getCurrentHub = (hubId) => {
        return bieonSystem.hubs.find(h => h.id === hubId);
    };

    const currentHub = getCurrentHub(device.hubId);
    const selectedHub = getCurrentHub(formData.hubId);

    // ==================== HANDLERS ====================
    useEffect(() => {
        // Check if any field has changed
        const changed =
            formData.name !== device.name ||
            formData.hubId !== device.hubId ||
            formData.location !== device.location ||
            formData.category !== device.category ||
            formData.deviceType !== device.deviceType ||
            formData.notes !== device.notes;

        setHasChanges(changed);
    }, [formData, device]);

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setFormData({
            ...formData,
            category: category,
            deviceType: '', // Reset device type when category changes
        });
    };

    const handleSave = () => {
        if (!formData.name.trim()) {
            alert('Nama device tidak boleh kosong!');
            return;
        }
        if (!formData.deviceType) {
            alert('Tipe device harus dipilih!');
            return;
        }

        const updatedDevice = {
            ...device,
            name: formData.name,
            hubId: formData.hubId,
            location: formData.location,
            category: formData.category,
            deviceType: formData.deviceType,
            notes: formData.notes,
            lastActivity: new Date().toISOString(),
        };

        onSave(updatedDevice);
    };

    const handleCancel = () => {
        if (hasChanges) {
            setShowConfirmation(true);
        } else {
            onCancel();
        }
    };

    const confirmCancel = () => {
        setShowConfirmation(false);
        onCancel();
    };

    // ==================== RENDER ====================
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-6 z-50 relative">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-6">
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors mb-4 cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Kembali ke Kendali Perangkat</span>
                </button>

                <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Setting Hub Node</h1>
                            <p className="text-gray-600">Edit dan konfigurasi ulang device Anda</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Current Configuration Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 mb-1">Konfigurasi Saat Ini</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-blue-700">Hub:</span>{' '}
                                    <span className="font-semibold text-blue-900">{currentHub?.name}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700">Room:</span>{' '}
                                    <span className="font-semibold text-blue-900">{device.location}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700">Kategori:</span>{' '}
                                    <span className="font-semibold text-blue-900">{CATEGORY_LABELS[device.category]}</span>
                                </div>
                                <div>
                                    <span className="text-blue-700">Device Type:</span>{' '}
                                    <span className="font-semibold text-blue-900">{device.deviceType}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-600" />
                        Edit Konfigurasi Device
                    </h2>

                    <div className="space-y-6">
                        {/* Device Name */}
                        <div>
                            <label htmlFor="device-name" className="text-gray-700 font-semibold mb-2 block">
                                Nama Device <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="device-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: AC Ruang Tamu"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Hub Selection */}
                        <div>
                            <label className="text-gray-700 font-semibold mb-2 block">Pilih Hub <span className="text-red-500">*</span></label>
                            <select 
                                value={formData.hubId} 
                                onChange={(e) => setFormData({ ...formData, hubId: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Pilih hub...</option>
                                {bieonSystem.hubs.map((hub) => (
                                    <option key={hub.id} value={hub.id}>
                                        {hub.name} {hub.status === 'active' ? '(Active)' : ''}
                                    </option>
                                ))}
                            </select>
                            {hubChanged && (
                                <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    Hub berubah: {currentHub?.name} → {selectedHub?.name}
                                </p>
                            )}
                        </div>

                        {/* Room Selection */}
                        <div>
                            <label className="text-gray-700 font-semibold mb-2 block">Pilih Ruangan <span className="text-red-500">*</span></label>
                            <select 
                                value={formData.location} 
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Pilih ruangan...</option>
                                {['R1', 'R2', 'R3', 'R4'].map((room) => (
                                    <option key={room} value={room}>Ruangan {room}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label className="text-gray-700 font-semibold mb-2 block">Kategori Device <span className="text-red-500">*</span></label>
                            <select 
                                value={formData.category} 
                                onChange={handleCategoryChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Pilih kategori...</option>
                                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            {categoryChanged && (
                                <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    Kategori berubah: {CATEGORY_LABELS[device.category]} → {CATEGORY_LABELS[formData.category]}
                                </p>
                            )}
                        </div>

                        {/* Device Type Selection */}
                        <div>
                            <label className="text-gray-700 font-semibold mb-2 block">Tipe Device <span className="text-red-500">*</span></label>
                            <select
                                value={formData.deviceType}
                                onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                                disabled={!formData.category}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                            >
                                <option value="">{formData.category ? "Pilih tipe device..." : "Pilih kategori terlebih dahulu"}</option>
                                {formData.category && CATEGORY_DEVICES[formData.category]?.map((deviceType) => (
                                    <option key={deviceType} value={deviceType}>{deviceType}</option>
                                ))}
                            </select>
                            {deviceTypeChanged && formData.deviceType && (
                                <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    Tipe device berubah: {device.deviceType} → {formData.deviceType}
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes" className="text-gray-700 font-semibold mb-2 block">
                                Catatan (Opsional)
                            </label>
                            <textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Tambahkan catatan tentang device ini..."
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Reconfiguration Warning */}
                {requiresReconfiguration && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-amber-900 mb-1">Perhatian: Konfigurasi Ulang Diperlukan</h3>
                                <p className="text-sm text-amber-700 mb-2">
                                    Anda mengubah hub, kategori, atau tipe device. Setelah menyimpan, Anda perlu melakukan konfigurasi ulang untuk:
                                </p>
                                <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
                                    {hubChanged && <li>Hubungkan device ke hub baru ({selectedHub?.name})</li>}
                                    {categoryChanged && <li>Sesuaikan kategori ke {CATEGORY_LABELS[formData.category]}</li>}
                                    {deviceTypeChanged && <li>Atur parameter untuk {formData.deviceType}</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                            Batal
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || !formData.deviceType}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Save className="w-5 h-5" />
                            Simpan Perubahan
                        </button>
                    </div>

                    {!hasChanges && (
                        <p className="text-center text-sm text-gray-500 mt-3">
                            Tidak ada perubahan yang dibuat
                        </p>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Batalkan Perubahan?</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin membatalkan?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                Lanjut Edit
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all cursor-pointer"
                            >
                                Ya, Batalkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
