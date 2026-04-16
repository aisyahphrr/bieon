import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Home,
  Wifi,
  Settings,
  Power,
  Trash2,
  Calendar,
  Thermometer,
  Sun,
  Volume2,
  Droplets,
  Eye,
  ChevronRight,
  ChevronDown,
  Save,
  X,
  Check,
  AlertCircle,
  Zap,
  Activity,
  Wind,
  Lightbulb,
  Radio,
  Bell,
  MessageSquare,
  ShieldAlert,
  Waves,
  Beaker,
  Lock,
  Cpu
} from "lucide-react";
import { EditHubNodePage } from "./edithub";
import NotificationPopup from "../../components/NotificationPopup";
import HomeownerLayout from "./HomeownerLayout";

const BIEON_DATABASE = {
  "BIEON-001": { name: "BIEON Smart Home System A", totalHubs: 2 },
  "BIEON-002": { name: "BIEON Smart Home System B", totalHubs: 3 },
  "BIEON-003": { name: "BIEON Smart Home System C", totalHubs: 1 },
  "BIEON-004": { name: "BIEON Smart Home System D", totalHubs: 4 }
};
const CATEGORY_DEVICES = {
  "sensor": ["Sensor Kenyamanan", "Humidity Sensor", "Sensor Kualitas Air", "Sensor Keamanan", "Light Sensor"],
  "smart-switch": ["Light", "Fan", "Exhaust Fan", "Ceiling Fan"],
  "smart-plug": ["AC", "TV", "Heater", "Water Heater", "Refrigerator", "Washing Machine"],
  "remote": ["AC", "TV", "Set-Top Box", "Sound System", "Projector"],
  "other": ["Custom Device"]
};
export function DeviceControlPage({ onNavigate }) {
  const initialBieon = {
    id: `bieon-sys-1`,
    bieonId: 'BIEON-001',
    name: BIEON_DATABASE['BIEON-001'].name,
    totalHubs: BIEON_DATABASE['BIEON-001'].totalHubs,
    hubs: [
      { id: 'hub-1775530705366-1', name: 'Hub 1', devices: [], status: 'active' },
      { id: 'hub-1775530705366-2', name: 'Hub 2', devices: [], status: 'active' }
    ],
    createdAt: new Date().toISOString()
  };

  const [step, setStep] = useState("idle");
  const [bieonSystems, setBieonSystems] = useState([initialBieon]);
  const [currentBieon, setCurrentBieon] = useState(initialBieon);
  const [rooms, setRooms] = useState(["R1", "R2", "R3", "R4"]);
  const [bieonIdInput, setBieonIdInput] = useState("");
  const [selectedHub, setSelectedHub] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDeviceType, setSelectedDeviceType] = useState("");
  const [deviceForm, setDeviceForm] = useState({
    name: "",
    location: "",
    notes: ""
  });
  const [newRoomInput, setNewRoomInput] = useState("");
  const [showNewRoomInput, setShowNewRoomInput] = useState(false);
  const [configMode, setConfigMode] = useState("sensor");
  const [sensorConfig, setSensorConfig] = useState({
    temperature: { enabled: false, value: 27, useDefault: true },
    humidity: { enabled: false, value: 70, useDefault: true },
    motion: { enabled: false },
    door: { enabled: false },
    ph: { enabled: false, value: 7.0, useDefault: true },
    turbidity: { enabled: false, value: 25, useDefault: true },
    tds: { enabled: false, value: 1000, useDefault: true },
    waterTemp: { enabled: false, value: 24, useDefault: true }
  });
  const [scheduleConfig, setScheduleConfig] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [showEditPage, setShowEditPage] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [activeSensorAspect, setActiveSensorAspect] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unassignedDevices, setUnassignedDevices] = useState([
    { id: "ud-1", name: "Soket Pintar A1" },
    { id: "ud-2", name: "Saklar Dinding 2-Gang" },
    { id: "ud-3", name: "IR Remote Kustom" }
  ]);
  const [dynamicDevices, setDynamicDevices] = useState({
    "smart-plug": [],
    "smart-switch": [],
    "remote": [],
    "sensor": [],
    "other": []
  });
  const [showUnassignedPopup, setShowUnassignedPopup] = useState(false);

  // Technician Access States
  const [isTechnicianMode, setIsTechnicianMode] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [isEditingDevice, setIsEditingDevice] = useState(null);

  useEffect(() => {
    const techAccess = localStorage.getItem('bieon_tech_access');
    if (techAccess) {
      setIsTechnicianMode(true);
    }
  }, []);

  const handleGenerateToken = () => {
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedToken(token);
    // Simpan token aktif di localStorage (mocking backend)
    localStorage.setItem('bieon_active_token', token);
    localStorage.setItem('bieon_active_token_expiry', (Date.now() + 5 * 60 * 1000).toString());
    setShowTokenModal(true);
  };

  const handleExitTechnicianMode = () => {
    localStorage.removeItem('bieon_tech_access');
    setIsTechnicianMode(false);
    onNavigate('teknisi');
  };

  useEffect(() => {
    if (localStorage.getItem('openBieonInput') === 'true') {
      setStep('input-id');
      localStorage.removeItem('openBieonInput');
    }
  }, []);

  const handleSubmitBieonId = () => {
    const bieonData = BIEON_DATABASE[bieonIdInput];
    if (!bieonData) {
      alert("ID BIEON tidak ditemukan! Coba: BIEON-001, BIEON-002, BIEON-003, atau BIEON-004");
      return;
    }
    if (bieonSystems.find((b) => b.bieonId === bieonIdInput)) {
      alert("BIEON ini sudah ditambahkan!");
      return;
    }
    const hubs = [];
    for (let i = 1; i <= bieonData.totalHubs; i++) {
      hubs.push({
        id: `hub-${Date.now()}-${i}`,
        name: `Hub ${i}`,
        devices: [],
        status: "active"
      });
    }
    const newBieon = {
      id: `bieon-sys-${Date.now()}`,
      bieonId: bieonIdInput,
      name: bieonData.name,
      totalHubs: bieonData.totalHubs,
      hubs,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setBieonSystems([...bieonSystems, newBieon]);
    setCurrentBieon(newBieon);
    setBieonIdInput("");
    setStep("view-bieon");
  };
  const handleAddHub = () => {
    if (!currentBieon) return;
    const newHub = {
      id: `hub-${Date.now()}`,
      name: `Hub ${currentBieon.hubs.length + 1}`,
      devices: [],
      status: "active"
    };
    const updatedBieon = {
      ...currentBieon,
      totalHubs: currentBieon.totalHubs + 1,
      hubs: [...currentBieon.hubs, newHub]
    };
    setBieonSystems(bieonSystems.map((b) => b.id === currentBieon.id ? updatedBieon : b));
    setCurrentBieon(updatedBieon);
  };
  const handleSelectHub = (hub) => {
    setSelectedHub(hub);
    setStep("select-category");
  };
  const handleQuickSelect = (category, deviceType) => {
    setSelectedCategory(category);
    setSelectedDeviceType(deviceType);
    setDeviceForm({ name: deviceType === "other" ? "" : deviceType, location: "", notes: "" });
    setStep("add-device-form");

    // Auto-open relevant aspect for configuration step later
    if (deviceType === "Sensor Kualitas Air") setActiveSensorAspect("kualitasAir");
    else if (deviceType === "Sensor Kenyamanan" || deviceType === "Humidity Sensor") setActiveSensorAspect("kenyamanan");
    else if (deviceType === "Sensor Keamanan" || deviceType === "Door Sensor") setActiveSensorAspect("keamanan");
  };
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedDeviceType("");
    setStep("select-device-type");
  };
  const handleSelectDeviceType = (deviceType) => {
    setSelectedDeviceType(deviceType);
    setDeviceForm({ name: deviceType === "other" ? "" : deviceType, location: "", notes: "" });
    setStep("add-device-form");
  };
  const handleAddRoom = () => {
    if (!newRoomInput.trim()) return;
    if (rooms.includes(newRoomInput.trim())) {
      alert("Ruangan sudah ada!");
      return;
    }
    setRooms([...rooms, newRoomInput.trim()]);
    setDeviceForm({ ...deviceForm, location: newRoomInput.trim() });
    setNewRoomInput("");
    setShowNewRoomInput(false);
  };
  const handleSubmitDeviceForm = () => {
    if (!deviceForm.name || !deviceForm.location) {
      alert("Mohon lengkapi nama device dan lokasi!");
      return;
    }

    // Khusus sensor, langsung arahkan ke aspek yang relevan
    if (selectedCategory === "sensor") {
      if (selectedDeviceType === "Sensor Kualitas Air") setActiveSensorAspect("kualitasAir");
      else if (selectedDeviceType === "Sensor Kenyamanan" || selectedDeviceType === "Humidity Sensor") setActiveSensorAspect("kenyamanan");
      else if (selectedDeviceType === "Sensor Keamanan" || selectedDeviceType === "Motion Sensor") setActiveSensorAspect("keamanan");
      else if (selectedDeviceType === "Door Sensor") setActiveSensorAspect("keamananPintu");
    }

    setStep("configure");
  };
  const handleDirectSave = (forcedMode = null) => {
    if (!deviceForm.name || !deviceForm.location) {
      alert("Mohon lengkapi nama device dan lokasi!");
      return;
    }

    if (!currentBieon || !selectedHub) return;

    // Build the device object
    const deviceData = {
      name: deviceForm.name,
      deviceType: selectedDeviceType,
      category: selectedCategory,
      location: deviceForm.location,
      notes: deviceForm.notes,
      hubId: selectedHub.id,
      bieonId: currentBieon.bieonId,
      lastActivity: new Date().toISOString(),
      controlMode: forcedMode || (isTechnicianMode ? null : (selectedCategory === "sensor" ? "sensor" : "manual"))
    };

    if (selectedCategory !== "sensor") {
      deviceData.controls = deviceData.controls || {};
    } else {
      if (!isEditingDevice) {
        deviceData.sensorData = generateMockSensorData(selectedDeviceType);
      }
      if (!isTechnicianMode) {
        deviceData.sensorParams = sensorConfig;
      }
    }

    let updatedHubs;
    if (isEditingDevice) {
      updatedHubs = currentBieon.hubs.map((hub) => {
        const filteredDevices = hub.devices.filter(d => d.id !== isEditingDevice);
        if (hub.id === selectedHub.id) {
          const originalDevice = allDevices.find(d => d.id === isEditingDevice);
          return { ...hub, devices: [...filteredDevices, { ...originalDevice, ...deviceData }] };
        }
        return { ...hub, devices: filteredDevices };
      });
    } else {
      const newDevice = {
        ...deviceData,
        id: `dev-${Date.now()}`,
        status: "OFF",
        installedDate: new Date().toISOString(),
      };
      updatedHubs = currentBieon.hubs.map((hub) =>
        hub.id === selectedHub.id ? { ...hub, devices: [...hub.devices, newDevice] } : hub
      );
    }

    const updatedBieon = { ...currentBieon, hubs: updatedHubs };
    setBieonSystems(bieonSystems.map((b) => b.id === currentBieon.id ? updatedBieon : b));
    setCurrentBieon(updatedBieon);
    resetForm();
    setStep("view-bieon");
    alert(isEditingDevice ? "Perangkat berhasil diperbarui!" : "Perangkat berhasil ditambahkan!");
  };
  const handleSaveDevice = () => {
    if (!currentBieon || !selectedHub) return;

    const deviceData = {
      name: deviceForm.name,
      deviceType: selectedDeviceType,
      category: selectedCategory,
      location: deviceForm.location,
      notes: deviceForm.notes,
      hubId: selectedHub.id,
      bieonId: currentBieon.bieonId,
      lastActivity: new Date().toISOString()
    };

    if (selectedCategory !== "sensor") {
      deviceData.controlMode = isTechnicianMode ? null : configMode;
      if (!isTechnicianMode) {
        if (configMode === "sensor") {
          deviceData.sensorParams = sensorConfig;
        } else {
          deviceData.scheduleSettings = scheduleConfig;
        }
      }
      deviceData.controls = deviceData.controls || {};
    } else {
      if (!isEditingDevice) {
        deviceData.sensorData = generateMockSensorData(selectedDeviceType);
      }
      deviceData.controlMode = isTechnicianMode ? null : "sensor";
      if (!isTechnicianMode) {
        deviceData.sensorParams = sensorConfig;
      }
    }

    let updatedHubs;
    if (isEditingDevice) {
      updatedHubs = currentBieon.hubs.map((hub) => {
        const filteredDevices = hub.devices.filter(d => d.id !== isEditingDevice);
        if (hub.id === selectedHub.id) {
          const originalDevice = allDevices.find(d => d.id === isEditingDevice);
          return { ...hub, devices: [...filteredDevices, { ...originalDevice, ...deviceData }] };
        }
        return { ...hub, devices: filteredDevices };
      });
    } else {
      const newDevice = {
        ...deviceData,
        id: `dev-${Date.now()}`,
        status: "OFF",
        installedDate: new Date().toISOString(),
      };
      updatedHubs = currentBieon.hubs.map((hub) =>
        hub.id === selectedHub.id ? { ...hub, devices: [...hub.devices, newDevice] } : hub
      );
    }

    const updatedBieon = { ...currentBieon, hubs: updatedHubs };
    setBieonSystems(bieonSystems.map((b) => b.id === currentBieon.id ? updatedBieon : b));
    setCurrentBieon(updatedBieon);
    resetForm();
    setStep("view-bieon");
    alert(isEditingDevice ? "Perangkat berhasil diperbarui!" : "Perangkat berhasil ditambahkan!");
  };
  const generateMockSensorData = (deviceType) => {
    const data = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (deviceType === "Sensor Kenyamanan") {
      data.temperature = Math.round(20 + Math.random() * 10);
    } else if (deviceType === "Humidity Sensor") {
      data.humidity = Math.round(40 + Math.random() * 40);
    } else if (deviceType === "Sensor Kualitas Air") {
      data.ph = (6.5 + Math.random() * 2).toFixed(1);
      data.turbidity = Math.round(10 + Math.random() * 40);
      data.tds = Math.round(200 + Math.random() * 300);
      data.waterTemp = Math.round(20 + Math.random() * 10);
    } else if (deviceType === "Air Quality Sensor") {
      data.airQuality = Math.round(30 + Math.random() * 100);
    } else if (deviceType === "Light Sensor") {
      data.lightLevel = Math.round(100 + Math.random() * 400);
    } else if (deviceType === "Sensor Keamanan") {
      data.motion = Math.random() > 0.5;
    }
    return data;
  };
  const resetForm = () => {
    setDeviceForm({ name: "", location: "", notes: "" });
    setSelectedHub(null);
    setSelectedCategory("");
    setSelectedDeviceType("");
    setSensorConfig({
      temperature: { enabled: false, value: 27, useDefault: true },
      humidity: { enabled: false, value: 70, useDefault: true },
      motion: { enabled: false },
      door: { enabled: false },
      ph: { enabled: false, value: 7.0, useDefault: true },
      turbidity: { enabled: false, value: 25, useDefault: true },
      tds: { enabled: false, value: 1000, useDefault: true },
      waterTemp: { enabled: false, value: 24, useDefault: true }
    });
    setScheduleConfig([]);
    setConfigMode("sensor");
    setActiveSensorAspect(null);
    setIsEditingDevice(null);
  };
  const toggleDevicePower = (deviceId) => {
    const updatedSystems = bieonSystems.map((system) => ({
      ...system,
      hubs: system.hubs.map((hub) => ({
        ...hub,
        devices: hub.devices.map((device) => {
          if (device.id === deviceId) {
            if (device.category === "sensor") {
              return {
                ...device,
                status: device.status === "ON" ? "OFF" : "ON",
                sensorData: device.status === "OFF" ? generateMockSensorData(device.deviceType) : device.sensorData,
                lastActivity: (/* @__PURE__ */ new Date()).toISOString()
              };
            }
            return {
              ...device,
              status: device.status === "ON" ? "OFF" : "ON",
              lastActivity: (/* @__PURE__ */ new Date()).toISOString()
            };
          }
          return device;
        })
      }))
    }));
    setBieonSystems(updatedSystems);
    if (currentBieon) {
      setCurrentBieon(updatedSystems.find((s) => s.id === currentBieon.id) || null);
    }
  };
  const updateDeviceControl = (deviceId, controlType, value) => {
    const updatedSystems = bieonSystems.map((system) => ({
      ...system,
      hubs: system.hubs.map((hub) => ({
        ...hub,
        devices: hub.devices.map(
          (device) => device.id === deviceId ? {
            ...device,
            controls: { ...device.controls, [controlType]: value },
            lastActivity: (/* @__PURE__ */ new Date()).toISOString()
          } : device
        )
      }))
    }));
    setBieonSystems(updatedSystems);
  };
  const deleteDevice = (deviceId) => {
    if (!confirm("Yakin ingin menghapus device ini?")) return;
    const updatedSystems = bieonSystems.map((system) => ({
      ...system,
      hubs: system.hubs.map((hub) => ({
        ...hub,
        devices: hub.devices.filter((device) => device.id !== deviceId)
      }))
    }));
    setBieonSystems(updatedSystems);
    if (currentBieon) {
      setCurrentBieon(updatedSystems.find((s) => s.id === currentBieon.id) || null);
    }
  };
  const handleEditDevice = (device) => {
    setIsEditingDevice(device.id);

    // Populate Basic Info
    setDeviceForm({
      name: device.name,
      location: device.location,
      notes: device.notes || ""
    });
    setSelectedCategory(device.category);
    setSelectedDeviceType(device.deviceType);

    // Find and set hub
    const hub = currentBieon.hubs.find(h => h.id === device.hubId);
    setSelectedHub(hub);

    // Populate Config
    if (device.category === "sensor" || device.controlMode === "sensor") {
      setConfigMode("sensor");

      // Khusus sensor saat edit, tentukan aspeknya secara otomatis
      if (device.category === "sensor") {
        const type = device.deviceType;
        if (type === "Sensor Kualitas Air") setActiveSensorAspect("kualitasAir");
        else if (type === "Sensor Kenyamanan" || type === "Humidity Sensor") setActiveSensorAspect("kenyamanan");
        else if (type === "Sensor Keamanan" || type === "Motion Sensor") setActiveSensorAspect("keamanan");
        else if (type === "Door Sensor") setActiveSensorAspect("keamananPintu");
      }
      // Untuk Actuator di mode sensor, buka aspek yang sedang aktif tapi tetap izinkan ganti aspek
      else if (device.controlMode === "sensor" && device.sensorParams) {
        if (device.sensorParams.temperature?.enabled || device.sensorParams.humidity?.enabled) setActiveSensorAspect("kenyamanan");
        else if (device.sensorParams.motion?.enabled) setActiveSensorAspect("keamanan");
        else if (device.sensorParams.door?.enabled) setActiveSensorAspect("keamananPintu");
        else if (device.sensorParams.ph?.enabled || device.sensorParams.turbidity?.enabled || device.sensorParams.tds?.enabled) setActiveSensorAspect("kualitasAir");
      }

      if (device.sensorParams) {
        setSensorConfig({ ...sensorConfig, ...device.sensorParams });
      }
    } else {
      setConfigMode(device.controlMode || "manual");
      if (device.scheduleSettings) {
        setScheduleConfig([...device.scheduleSettings]);
      }
    }

    setStep("add-device-form");
  };
  const handleSaveEditedDevice = (updatedDevice) => {
    const updatedSystems = bieonSystems.map((system) => ({
      ...system,
      hubs: system.hubs.map((hub) => {
        const devicesWithoutOld = hub.devices.filter((d) => d.id !== updatedDevice.id);
        if (hub.id === updatedDevice.hubId) {
          return {
            ...hub,
            devices: [...devicesWithoutOld, updatedDevice]
          };
        }
        return {
          ...hub,
          devices: devicesWithoutOld
        };
      })
    }));
    setBieonSystems(updatedSystems);
    if (currentBieon) {
      setCurrentBieon(updatedSystems.find((s) => s.id === currentBieon.id) || null);
    }
    setShowEditPage(false);
    setEditingDevice(null);
    alert("Device berhasil diupdate!");
  };
  const handleCancelEdit = () => {
    setShowEditPage(false);
    setEditingDevice(null);
  };
  const addSchedule = () => {
    setScheduleConfig([
      ...scheduleConfig,
      {
        enabled: true,
        startTime: "08:00",
        endTime: "17:00",
        days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
        action: "ON"
      }
    ]);
  };
  const removeSchedule = (index) => {
    setScheduleConfig(scheduleConfig.filter((_, i) => i !== index));
  };
  const updateSchedule = (index, field, value) => {
    const updated = [...scheduleConfig];
    updated[index] = { ...updated[index], [field]: value };
    setScheduleConfig(updated);
  };
  // Memoized — recomputes only when bieonSystems changes (not on every render)
  const allDevices = useMemo(
    () => bieonSystems.flatMap((system) => system.hubs.flatMap((hub) => hub.devices)),
    [bieonSystems]
  );

  const getAllDevices = () => allDevices;

  const getFilteredDevices = () => {
    let devices = currentBieon ? currentBieon.hubs.flatMap((hub) => hub.devices) : getAllDevices();

    // Urutkan berdasarkan tanggal instalasi terbaru di atas
    devices = [...devices].sort((a, b) => new Date(b.installedDate) - new Date(a.installedDate));

    if (selectedRoom === "all") return devices;
    return devices.filter((device) => device.location === selectedRoom);
  };
  const getCategoryIcon = (category) => {
    switch (category) {
      case "sensor":
        return Activity;
      case "smart-switch":
        return Lightbulb;
      case "smart-plug":
        return Zap;
      case "remote":
        return Radio;
      default:
        return Settings;
    }
  };
  const isModalOpen = step !== "view-bieon" && step !== "idle" || showEditPage;

  return (
    <HomeownerLayout
      currentPage="kendali"
      onNavigate={onNavigate}
      hideBottomNav={isModalOpen}
    >
      <div className="max-w-[1900px] mx-auto px-3 sm:px-4 md:px-8 py-4 md:py-8">
        {/* Banner Status Konfigurasi untuk Tampilan Homeowner */}
        {localStorage.getItem('bieon_tech_access') === 'true' && !isTechnicianMode && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 shadow-sm flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-2 bg-orange-100 rounded-xl shrink-0 mt-0.5">
               <Activity className="w-5 h-5 text-orange-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-orange-800 text-sm sm:text-base mb-1">Sedang Dikonfigurasi Teknisi</h3>
              <p className="text-orange-700 text-xs sm:text-sm">
                 Sistem Anda saat ini sedang dalam proses penambahan/pengaturan perangkat oleh teknisi. 
                 Beberapa fungsi kendali mungkin dibatasi atau tidak merespons sampai sesi teknisi berakhir.
              </p>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Settings className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-lg">Kendali Perangkat</h3>
              </div>
              <p className="text-sm text-gray-500">Kelola smart devices dengan sistem BIEON</p>
            </div>
            <div className="flex gap-3 sm:gap-4">
              {step === "view-bieon" && currentBieon && (
                <button
                  onClick={() => setStep("idle")}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <span>← Kembali ke Semua BIEON</span>
                </button>
              )}
              {!isTechnicianMode && (
                <button
                  onClick={handleGenerateToken}
                  className="px-5 py-2.5 bg-white border-2 border-emerald-100 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-2"
                >
                  <Radio className="w-5 h-5" />
                  <span>Akses Teknisi</span>
                </button>
              )}
            </div>
          </div>
        </div>{
          /* ==================== STEP: IDLE (Dashboard) ==================== */
        }{step === "idle" && <div>{bieonSystems.length === 0 ? <div className="text-center py-20"><div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6"><Home className="w-12 h-12 text-emerald-600" /></div><h2 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Sistem BIEON</h2><p className="text-gray-600 mb-8 max-w-md mx-auto">
          Mulai dengan menambahkan sistem BIEON Anda untuk mengelola smart devices
        </p>{!isTechnicianMode && (
          <button
            onClick={() => setStep("input-id")}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          ><Plus className="w-5 h-5 inline mr-2" />
            Tambah BIEON Pertama
          </button>
        )}</div> : <div>{
          /* Stats */
        }<div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8"><div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center"><Home className="w-6 h-6 text-white" /></div><div><p className="text-sm text-gray-600">BIEON Systems</p><p className="text-2xl font-bold text-gray-900">{bieonSystems.length}</p></div></div></div><div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"><Wifi className="w-6 h-6 text-white" /></div><div><p className="text-sm text-gray-600">Total Hubs</p><p className="text-2xl font-bold text-gray-900">{bieonSystems.reduce((sum, b) => sum + b.totalHubs, 0)}</p></div></div></div><div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"><Settings className="w-6 h-6 text-white" /></div><div><p className="text-sm text-gray-600">Total Devices</p><p className="text-2xl font-bold text-gray-900">{getAllDevices().length}</p></div></div></div><div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"><Zap className="w-6 h-6 text-white" /></div><div><p className="text-sm text-gray-600">Active Devices</p><p className="text-2xl font-bold text-gray-900">{getAllDevices().filter((d) => d.status === "ON").length}</p></div></div></div></div>{
            /* BIEON Systems List */
          }<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sistem BIEON Terdaftar</h2>
              {!isTechnicianMode && (
                <button
                  onClick={() => setStep("input-id")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#009b7c] text-white rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Tambah BIEON
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4">{bieonSystems.map((bieon) => <div
              key={bieon.id}
              className="border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => {
                setCurrentBieon(bieon);
                setStep("view-bieon");
              }}
            ><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center"><Home className="w-8 h-8 text-white" /></div><div><h3 className="text-lg font-bold text-gray-900">{bieon.name}</h3><p className="text-sm text-gray-600">ID: {bieon.bieonId}</p><div className="flex items-center gap-4 mt-2"><span className="text-sm text-gray-500">{bieon.totalHubs} Hubs
            </span><span className="text-sm text-gray-500">•</span><span className="text-sm text-gray-500">{bieon.hubs.flatMap((h) => h.devices).length} Devices
              </span></div></div></div><ChevronRight className="w-6 h-6 text-gray-400" /></div></div>)}</div></div></div>}</div>}{
          /* ==================== MODAL: INPUT BIEON ID ==================== */
        }{step === "input-id" && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"><div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-gray-900">Tambah BIEON</h2><p className="text-sm text-gray-600 mt-1">Masukkan ID BIEON Anda</p></div><button
          onClick={() => {
            setStep("idle");
            setBieonIdInput("");
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        ><X className="w-6 h-6 text-gray-500" /></button></div><div className="space-y-6"><div><label className="block text-sm font-semibold text-gray-700 mb-2">
          ID BIEON <span className="text-red-500">*</span></label><input
            type="text"
            value={bieonIdInput}
            onChange={(e) => setBieonIdInput(e.target.value)}
            placeholder="Contoh: BIEON-001"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          /><p className="text-xs text-gray-500 mt-2">
            Demo: Coba BIEON-001, BIEON-002, BIEON-003, atau BIEON-004
          </p></div><div className="flex gap-3"><button
            onClick={() => {
              setStep("idle");
              setBieonIdInput("");
            }}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Batal
          </button><button
            onClick={handleSubmitBieonId}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
                Submit
              </button></div></div></div></div>}{
          /* ==================== STEP: VIEW BIEON INFO ==================== */
        }{step === "view-bieon" && currentBieon && <div>{
          /* BIEON Info Card */
        }<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 mb-6 sm:mb-8"><div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 sm:mb-6"><div><h2 className="text-xl sm:text-2xl font-bold text-gray-900">{currentBieon.name}</h2><p className="text-sm text-gray-600 mt-1">ID: {currentBieon.bieonId}</p><div className="flex items-center gap-4 mt-3"><div className="flex items-center gap-2"><Wifi className="w-4 h-4 text-emerald-600" /><span className="text-sm font-semibold text-gray-700">{currentBieon.totalHubs} Hub Nodes
        </span></div><div className="flex items-center gap-2"><Settings className="w-4 h-4 text-blue-600" /><span className="text-sm font-semibold text-gray-700">{currentBieon.hubs.flatMap((h) => h.devices).length} Devices
        </span></div></div></div><button
          onClick={handleAddHub}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all self-start"
        ><Plus className="w-4 h-4" />
            Add Hub
          </button></div>{
              /* Hub Grid */
            }<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{currentBieon.hubs.map((hub) => <div
              key={hub.id}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all text-left flex flex-col justify-between"
            ><div><div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center"><Wifi className="w-6 h-6 text-white" /></div><div><h3 className="font-bold text-gray-900">{hub.name}</h3><p className="text-xs text-gray-600">{hub.id}</p></div></div><div className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="text-gray-600">Devices:</span><span className="font-bold text-gray-900">{hub.devices.length}</span></div><div className="flex items-center justify-between text-sm"><span className="text-gray-600">Status:</span><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${hub.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{hub.status}</span></div></div></div><button
              onClick={() => handleSelectHub(hub)}
              className="mt-6 w-full py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 shadow-sm"
            ><Plus className="w-4 h-4" /> Add Device</button></div>)}</div></div>{
            /* Room Filter & Device List */
          }<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8"><h3 className="font-bold text-gray-900 mb-4">Filter per Ruangan</h3><div className="flex flex-wrap gap-3 mb-6"><button
            onClick={() => setSelectedRoom("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedRoom === "all" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Semua Ruangan
          </button>{rooms.map((room) => {
            const deviceCount = getFilteredDevices().filter((d) => d.location === room).length;
            return <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedRoom === room ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >{room} ({deviceCount})
            </button>;
          })}</div></div>{
            /* Device List */
          }<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8"><div className="mb-8"><h2 className="text-2xl font-bold text-gray-900">Kendali Perangkat</h2><p className="text-sm text-gray-500 mt-1">CRUD, kontrol manual, status, dan detail perangkat</p></div>{getFilteredDevices().length === 0 ? <div className="text-center py-12"><AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-600">Belum ada device di ruangan ini</p></div> : <div className="space-y-4">{getFilteredDevices().map((device) => <div
            key={device.id}
            className={`border border-gray-200 rounded-xl p-4 sm:p-5 transition-all ${expandedDevice === device.id ? "shadow-md bg-white" : "hover:shadow-md bg-white"}`}
          >
            {/* Slim Header - Always visible */}
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedDevice(expandedDevice === device.id ? null : device.id)}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${device.status === "ON" ? "bg-emerald-600" : "bg-gray-200"}`}>
                  <Power className={`w-5 h-5 sm:w-6 sm:h-6 ${device.status === "ON" ? "text-white" : "text-gray-500"}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{device.name}</h3>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-3 mt-1">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">{device.deviceType} • {device.location}</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${device.status === "ON" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                      {device.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 hidden sm:block">ID: {device.id} • Installed: {new Date(device.installedDate).toLocaleDateString("id-ID")}</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                {expandedDevice === device.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>

            {/* Expanded Content */}
            {expandedDevice === device.id && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                {/* Configuration Context Section - Hidden for Technicians or if no mode */}
                {!isTechnicianMode && device.controlMode && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Mode: <span className={`${(device.category === "sensor" || device.controlMode === "sensor") ? "text-emerald-600 bg-emerald-50" : (device.controlMode === "manual" ? "text-blue-600 bg-blue-50" : (device.controlMode ? "text-purple-600 bg-purple-50" : "text-gray-500 bg-gray-100"))} font-bold px-2 py-0.5 rounded capitalize`}>
                          {device.controlMode === "manual" ? "Mode Manual" : (device.controlMode ? ((device.category === "sensor" || device.controlMode === "sensor") ? "Parameter Sensor" : "Jadwal Otomatis") : "-")}
                        </span>
                      </p>
                    </div>

                    {/* Detailed Configuration Summary */}
                    {device.controlMode !== "manual" && (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap gap-3">
                        {device.category === "sensor" || device.controlMode === "sensor" ? (
                          <>
                            {device.sensorParams && Object.entries(device.sensorParams).filter(([_, cfg]) => cfg.enabled).length > 0 ? (
                              Object.entries(device.sensorParams)
                                .filter(([_, cfg]) => cfg.enabled)
                                .map(([key, cfg], idx) => (
                                  <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    {key === "temperature" && <Thermometer className="w-4 h-4 text-orange-500" />}
                                    {key === "humidity" && <Droplets className="w-4 h-4 text-blue-500" />}
                                    {key === "motion" && <Eye className="w-4 h-4 text-purple-600" />}
                                    {key === "door" && <Lock className="w-4 h-4 text-red-600" />}
                                    {["ph", "turbidity", "tds", "waterTemp"].includes(key) && <Waves className="w-4 h-4 text-cyan-600" />}
                                    <span className="text-xs font-bold text-gray-700">
                                      {key === "temperature" ? "Suhu" :
                                        key === "humidity" ? "Lembap" :
                                          key === "motion" ? "Gerakan" :
                                            key === "door" ? "Buka Pintu" :
                                              key === "ph" ? "pH" :
                                                key === "turbidity" ? "Kekeruhan" :
                                                  key === "tds" ? "TDS" : "Suhu Air"}:
                                      {cfg.value !== undefined ? ` > ${cfg.value}${key === "temperature" || key === "waterTemp" ? "°C" : key === "humidity" ? "%" : ""}` : " (Aktif)"}
                                    </span>
                                  </div>
                                ))
                            ) : (
                              <p className="text-xs text-gray-500 italic">Belum ada sensor yang diaktifkan</p>
                            )}
                          </>
                        ) : (
                          <>
                            {device.scheduleSettings && device.scheduleSettings.length > 0 ? (
                              device.scheduleSettings.map((sched, idx) => (
                                <div key={idx} className="flex flex-col gap-1 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm w-full md:w-auto">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-bold text-gray-700">
                                      Jam {sched.startTime} - {sched.endTime} ({sched.action})
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    {sched.days.map((day, dIdx) => (
                                      <span key={dIdx} className="text-[9px] bg-purple-50 text-purple-600 px-1 rounded font-medium">{day}</span>
                                    ))}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-500 italic">Belum ada jadwal yang diatur</p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Controls Section - Hidden for Technicians */}
                {!isTechnicianMode && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{device.category === "sensor" ? "Status Monitoring" : "Kontrol Manual"}</p>
                    <div className="flex flex-wrap gap-4 p-3 bg-blue-50/50 rounded-xl border border-blue-50/50">
                      {device.category !== "sensor" && (
                        <button
                          onClick={() => toggleDevicePower(device.id)}
                          className={`flex-1 min-w-[200px] py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${device.status === "ON" ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-white border border-gray-200 text-gray-700 shadow-sm hover:shadow"}`}
                        >
                          <Power className="w-4 h-4 text-gray-500" /> Turn {device.status === "ON" ? "OFF" : "ON"}
                        </button>
                      )}

                      {/* Device-specific controls horizontally laid out */}
                      {device.deviceType === "AC" && device.status === "ON" && (
                        <div className="flex-1 min-w-[250px] flex items-center gap-3 bg-white border border-blue-100 rounded-lg px-4 py-2">
                          <Thermometer className="w-5 h-5 text-blue-500" />
                          <span className="text-sm font-medium text-gray-600">Suhu:</span>
                          <input
                            type="number"
                            value={device.controls?.temperature || 24}
                            onChange={(e) => updateDeviceControl(device.id, "temperature", parseFloat(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-200 rounded-md text-sm font-semibold text-center focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
                          />
                          <span className="text-sm text-gray-500 font-medium">°C</span>
                        </div>
                      )}
                      {device.deviceType === "TV" && device.status === "ON" && (
                        <div className="flex-1 min-w-[250px] flex items-center gap-3 bg-white border border-purple-100 rounded-lg px-4 py-2">
                          <Volume2 className="w-5 h-5 text-purple-500" />
                          <span className="text-sm font-medium text-gray-600">Volume:</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={device.controls?.volume || 50}
                            onChange={(e) => updateDeviceControl(device.id, "volume", parseFloat(e.target.value))}
                            className="flex-1 accent-purple-600"
                          />
                          <span className="text-sm font-semibold text-gray-700 w-10">{device.controls?.volume || 50}</span>
                        </div>
                      )}
                      {(device.deviceType === "Light" || device.deviceType === "Fan") && device.status === "ON" && (
                        <div className="flex-1 min-w-[250px] flex items-center gap-3 bg-white border border-yellow-100 rounded-lg px-4 py-2">
                          <Sun className="w-5 h-5 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-600">Brightness:</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={device.controls?.brightness || 100}
                            onChange={(e) => updateDeviceControl(device.id, "brightness", parseFloat(e.target.value))}
                            className="flex-1 accent-yellow-500"
                          />
                          <span className="text-sm font-semibold text-gray-700 w-12">{device.controls?.brightness || 100}%</span>
                        </div>
                      )}
                      {device.category === "sensor" && !isTechnicianMode && (
                        <div className="flex-1 min-w-[250px] flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2">
                          <button onClick={() => toggleDevicePower(device.id)} className="w-full text-sm font-semibold text-gray-700 flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" /> {device.status === "ON" ? "Stop Monitoring" : "Start Monitoring"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sensor Only Data Block - Single Row Compact Version */}
                {device.category === "sensor" && device.status === "ON" && device.sensorData && (
                  <div className="mb-6 flex flex-wrap items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                    {/* Compact Eligibility Badge */}
                    {(() => {
                      const enabledParams = Object.entries(device.sensorParams || {}).filter(([_, cfg]) => cfg.enabled);
                      let isAbnormal = false;
                      enabledParams.forEach(([key, cfg]) => {
                        const currentVal = parseFloat(device.sensorData[key]);
                        const threshold = parseFloat(cfg.value);
                        if (!isNaN(currentVal) && !isNaN(threshold)) {
                          if (currentVal > threshold) isAbnormal = true;
                        }
                      });

                      const StatusIcon = isAbnormal ? AlertCircle : Check;

                      // Contextual Status Text
                      let statusTextNormal = "LAYAK PAKAI";
                      let statusTextAbnormal = "TIDAK LAYAK";

                      const type = device.deviceType;
                      if (type === "Sensor Kenyamanan" || type === "Humidity Sensor") {
                        statusTextNormal = "NYAMAN";
                        statusTextAbnormal = "TIDAK NYAMAN";
                      } else if (type === "Sensor Keamanan" || type === "Door Sensor") {
                        statusTextNormal = "AMAN";
                        statusTextAbnormal = "TIDAK AMAN";
                      } else if (type === "Sensor Kualitas Air") {
                        statusTextNormal = "LAYAK PAKAI";
                        statusTextAbnormal = "TIDAK LAYAK PAKAI";
                      }

                      return (
                        <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 shadow-sm transition-all ${isAbnormal ? 'bg-red-600 border-red-700 text-white animate-pulse' : 'bg-emerald-600 border-emerald-700 text-white'}`}>
                          <StatusIcon className="w-5 h-5" />
                          <span className="text-sm font-black tracking-tight whitespace-nowrap">
                            STATUS: {isAbnormal ? statusTextAbnormal : statusTextNormal}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Minimal Separator */}
                    <div className="w-px h-8 bg-gray-200 hidden sm:block mx-1"></div>

                    {/* Parameter Chips */}
                    {device.sensorData.temperature !== undefined && device.sensorParams?.temperature?.enabled && (
                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 font-bold transition-all ${parseFloat(device.sensorData.temperature) > parseFloat(device.sensorParams.temperature.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                        <Thermometer className="w-4 h-4" />
                        <span className="text-sm">Suhu: {device.sensorData.temperature}°C</span>
                      </div>
                    )}
                    {device.sensorData.humidity !== undefined && device.sensorParams?.humidity?.enabled && (
                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 font-bold transition-all ${parseFloat(device.sensorData.humidity) > parseFloat(device.sensorParams.humidity.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                        <Droplets className="w-4 h-4" />
                        <span className="text-sm">Lembap: {device.sensorData.humidity}%</span>
                      </div>
                    )}
                    {device.sensorData.ph !== undefined && device.sensorParams?.ph?.enabled && (
                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 font-bold transition-all ${parseFloat(device.sensorData.ph) > parseFloat(device.sensorParams.ph.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                        <Beaker className="w-4 h-4" />
                        <span className="text-sm">pH: {device.sensorData.ph}</span>
                      </div>
                    )}
                    {device.sensorData.turbidity !== undefined && device.sensorParams?.turbidity?.enabled && (
                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 font-bold transition-all ${parseFloat(device.sensorData.turbidity) > parseFloat(device.sensorParams.turbidity.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                        <Droplets className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm">NTU: {device.sensorData.turbidity}</span>
                      </div>
                    )}
                    {device.sensorData.tds !== undefined && device.sensorParams?.tds?.enabled && (
                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 font-bold transition-all ${parseFloat(device.sensorData.tds) > parseFloat(device.sensorParams.tds.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                        <Wind className="w-4 h-4 text-teal-600" />
                        <span className="text-sm">TDS: {device.sensorData.tds} ppm</span>
                      </div>
                    )}
                    {device.sensorData.waterTemp !== undefined && device.sensorParams?.waterTemp?.enabled && (
                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 font-bold transition-all ${parseFloat(device.sensorData.waterTemp) > parseFloat(device.sensorParams.waterTemp.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                        <Thermometer className="w-4 h-4" />
                        <span className="text-sm">Suhu Air: {device.sensorData.waterTemp}°C</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Kategori</p>
                    <p className="text-sm text-gray-900 font-medium capitalize">{device.category}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Hub Node</p>
                    <p className="text-sm text-gray-900 font-medium">{currentBieon.hubs.find((h) => h.id === device.hubId)?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Installed</p>
                    <p className="text-sm text-gray-900 font-medium">{new Date(device.installedDate).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Last Activity</p>
                    <p className="text-sm text-gray-900 font-medium">{new Date(device.lastActivity).toLocaleString("id-ID", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Catatan</p>
                    <p className="text-sm text-gray-900 font-medium">{device.notes || "-"}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!isTechnicianMode && (
                    <button
                      onClick={() => deleteDevice(device.id)}
                      className="sm:w-auto px-6 sm:px-10 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                  {!isTechnicianMode && (
                    <button
                      onClick={() => handleEditDevice(device)}
                      className="flex-1 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>)}</div>}</div></div>}{
          /* ==================== MODAL: SELECT CATEGORY ==================== */
        }{step === "select-category" && <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto"><div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-5 sm:p-8 my-4 sm:my-0"><div className="flex items-center justify-between mb-5 sm:mb-6"><div><h2 className="text-xl sm:text-2xl font-bold text-gray-900">Kategori Smart Device</h2><p className="text-sm text-gray-600 mt-1">
          Pilih Kategori Device untuk: {selectedHub?.name}</p></div><button
            onClick={() => {
              setStep("view-bieon");
              setSelectedHub(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          ><X className="w-6 h-6 text-gray-500" /></button></div>          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mt-4">
            {/* SENSOR BLOCK */}
            <div className="flex flex-col h-full bg-white border-2 border-[#009b7c] rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <Activity className="w-8 h-8 text-[#009b7c]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">Sensor</h3>
                  <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Monitoring System</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <button
                  onClick={() => handleQuickSelect("sensor", "Sensor Kualitas Air")}
                  className="flex items-center gap-4 text-gray-600 hover:text-blue-600 transition-all w-full text-left group/item"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shadow-sm group-hover/item:bg-blue-100 transition-colors">
                    <Waves className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-bold text-sm tracking-tight">Sensor Kualitas Air</span>
                </button>
                <button
                  onClick={() => handleQuickSelect("sensor", "Sensor Kenyamanan")}
                  className="flex items-center gap-4 text-gray-600 hover:text-orange-600 transition-all w-full text-left group/item"
                >
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shadow-sm group-hover/item:bg-orange-100 transition-colors">
                    <Thermometer className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="font-bold text-sm tracking-tight">Sensor Kenyamanan</span>
                </button>
                <button
                  onClick={() => handleQuickSelect("sensor", "Sensor Keamanan")}
                  className="flex items-center gap-4 text-gray-600 hover:text-red-600 transition-all w-full text-left group/item"
                >
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shadow-sm group-hover/item:bg-red-100 transition-colors">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="font-bold text-sm tracking-tight">Keamanan</span>
                </button>
              </div>
            </div>

            {/* CONTROL BLOCK */}
            <div className="flex flex-col h-full bg-white border-2 border-gray-200 rounded-3xl p-6 sm:p-8 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">Control</h3>
                  <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Actuator System</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <button
                  onClick={() => handleSelectCategory("smart-plug")}
                  className="flex items-center gap-4 text-gray-600 hover:text-blue-600 transition-all w-full text-left group/item"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shadow-sm group-hover/item:bg-blue-100 transition-colors">
                    <Zap className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-bold text-sm tracking-tight">Smart Plug</span>
                </button>

                <button
                  onClick={() => handleSelectCategory("smart-switch")}
                  className="flex items-center gap-4 text-gray-600 hover:text-yellow-600 transition-all w-full text-left group/item"
                >
                  <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center shadow-sm group-hover/item:bg-yellow-100 transition-colors">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="font-bold text-sm tracking-tight">Smart Switch</span>
                </button>

                <button
                  onClick={() => handleSelectCategory("remote")}
                  className="flex items-center gap-4 text-gray-600 hover:text-purple-600 transition-all w-full text-left group/item"
                >
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shadow-sm group-hover/item:bg-purple-100 transition-colors">
                    <Radio className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="font-bold text-sm tracking-tight">Remote (IR/RF)</span>
                </button>
              </div>
            </div>
          </div></div></div>}{
          /* ==================== MODAL: SELECT DEVICE TYPE ==================== */
        }{step === "select-device-type" && <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"><div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 mt-8 sm:mt-12 mb-20"><div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-gray-900">Pilih Tipe Device</h2><p className="text-sm text-gray-600 mt-1">
          Kategori: <span className="capitalize font-semibold">{selectedCategory}</span></p></div><div className="flex items-center gap-3">
            {unassignedDevices.length > 0 && ["smart-plug", "smart-switch", "remote"].includes(selectedCategory) && (
              <button
                onClick={() => setShowUnassignedPopup(true)}
                className="relative p-2 hover:bg-emerald-50 rounded-lg transition-all"
              >
                <Cpu className="w-6 h-6 text-emerald-600" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse border-2 border-white">
                  {unassignedDevices.length}
                </span>
              </button>
            )}
            <button
              onClick={() => setStep("select-category")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            ><X className="w-6 h-6 text-gray-500" /></button></div></div><div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">{(CATEGORY_DEVICES[selectedCategory] || []).concat(dynamicDevices[selectedCategory] || []).map((deviceType) => <button
              key={deviceType}
              onClick={() => handleSelectDeviceType(deviceType)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all text-left flex items-center justify-between group"
            ><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"><Settings className="w-5 h-5 text-emerald-600" /></div><span className="font-semibold text-gray-900">{deviceType}</span></div><ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" /></button>)}</div></div></div>}{
          /* ==================== SUB-MODAL: UNASSIGNED DEVICES ==================== */
        }{showUnassignedPopup && <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[60] p-4 overflow-y-auto"><div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 mt-12 mb-20"><div className="flex items-center justify-between mb-6"><div><h2 className="text-xl font-bold text-gray-900">Perangkat Ditemukan</h2><p className="text-sm text-gray-600 mt-1">Pilih untuk ditambahkan ke {selectedCategory}</p></div><button
          onClick={() => setShowUnassignedPopup(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        ><X className="w-5 h-5 text-gray-500" /></button></div><div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">{unassignedDevices.map((device) => <button
          key={device.id}
          onClick={() => {
            setDynamicDevices(prev => ({ ...prev, [selectedCategory]: [...prev[selectedCategory], device.name] }));
            setUnassignedDevices(prev => prev.filter(d => d.id !== device.id));
            setShowUnassignedPopup(false);
          }}
          className="w-full p-4 border-2 border-emerald-100 bg-emerald-50 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all text-left flex items-center justify-between group"
        ><div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center"><Zap className="w-5 h-5 text-emerald-600" /></div><span className="font-semibold text-gray-900">{device.name}</span></div><Plus className="w-5 h-5 text-emerald-600 opacity-50 group-hover:opacity-100 transition-opacity" /></button>)}</div></div></div>}{
          /* ==================== MODAL: ADD DEVICE FORM ==================== */
        }{step === "add-device-form" && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"><div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8"><div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-gray-900">{isEditingDevice ? "Edit Informasi Device" : "Informasi Device"}</h2><p className="text-sm text-gray-600 mt-1">
          Device: <span className="font-semibold">{selectedDeviceType}</span></p></div><button
            onClick={() => {
              if (isEditingDevice) {
                setStep("view-bieon");
                setIsEditingDevice(null);
              } else {
                setStep(selectedCategory === "sensor" ? "select-category" : "select-device-type");
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          ><X className="w-6 h-6 text-gray-500" /></button></div><div className="space-y-5">
            {isEditingDevice && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Hub Node <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={selectedHub?.id || ""}
                    onChange={(e) => setSelectedHub(currentBieon.hubs.find(h => h.id === e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 bg-white"
                  >
                    {currentBieon.hubs.map((hub) => (
                      <option key={hub.id} value={hub.id}>
                        {hub.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}
            <div><label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Device <span className="text-red-500">*</span></label><input
                type="text"
                value={deviceForm.name}
                onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                placeholder="Contoh: AC Ruang Tamu"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              /></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">
                Lokasi Device (Ruangan) <span className="text-red-500">*</span></label>{!showNewRoomInput ? <div className="space-y-2"><select
                  value={deviceForm.location}
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      setShowNewRoomInput(true);
                    } else {
                      setDeviceForm({ ...deviceForm, location: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ><option value="">-- Pilih Ruangan --</option>{rooms.map((room) => <option key={room} value={room}>{room}</option>)}<option value="__new__">+ Buat Ruangan Baru</option></select></div> : <div className="flex gap-2"><input
                  type="text"
                  value={newRoomInput}
                  onChange={(e) => setNewRoomInput(e.target.value)}
                  placeholder="Contoh: R5"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                /><button
                  onClick={handleAddRoom}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
                ><Check className="w-5 h-5" /></button><button
                  onClick={() => {
                    setShowNewRoomInput(false);
                    setNewRoomInput("");
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                ><X className="w-5 h-5" /></button></div>}</div><div><label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catatan (Optional)
                </label><textarea
                value={deviceForm.notes}
                onChange={(e) => setDeviceForm({ ...deviceForm, notes: e.target.value })}
                placeholder="Tambahkan catatan..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              /></div><div className="flex flex-col sm:flex-row gap-3 pt-4">
              {isTechnicianMode ? (
                <button
                  onClick={() => handleDirectSave("manual")}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                >
                  Simpan
                </button>
              ) : (
                <>
                  {selectedCategory !== "sensor" && (
                    <button
                      onClick={() => handleDirectSave("manual")}
                      className="flex-1 px-6 py-3 border-2 border-emerald-500 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all text-sm sm:text-base"
                    >
                      Simpan (Mode Manual)
                    </button>
                  )}
                  <button
                    onClick={handleSubmitDeviceForm}
                    className="flex-1 sm:flex-[1.5] px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                  >
                    {selectedCategory === "sensor" ? "Lanjut ke Parameter" : "Lanjut ke Mode Otomatis"}
                  </button>
                </>
              )}
            </div></div></div></div>}{
          /* ==================== MODAL: CONFIGURE (ACTUATORS ONLY) ==================== */
        }{step === "configure" && <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"><div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 mt-8 sm:mt-12 mb-20"><div className="flex items-center justify-between mb-4"><div><h2 className="text-2xl font-bold text-gray-900">{selectedCategory === "sensor" ? "Konfigurasi Parameter" : "Pilih Metode Pengaturan"}</h2><p className="text-sm text-gray-600">{selectedCategory === "sensor" ? "Tentukan batas/nilai referensi untuk sensor ini" : "Parameter lingkungan atau jadwal otomatis"}</p></div><button
          onClick={() => setStep("add-device-form")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        ><X className="w-6 h-6 text-gray-500" /></button></div>{
            /* Method Selection */
          }
          {selectedCategory !== "sensor" && (
            <div className="grid grid-cols-2 gap-4 mb-6"><button
              onClick={() => setConfigMode("sensor")}
              className={`p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center justify-center sm:justify-start gap-4 ${configMode === "sensor" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"}`}
            ><Settings className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 hidden sm:block" /><div className="text-center sm:text-left"><h3 className="font-bold text-gray-900 text-sm sm:text-base mb-0.5">Parameter Lingkungan</h3><p className="text-xs text-gray-500 hidden sm:block">Sesuai kondisi lingkungan (sensor)</p></div></button><button
              onClick={() => setConfigMode("schedule")}
              className={`p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center justify-center sm:justify-start gap-4 ${configMode === "schedule" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"}`}
            ><Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 hidden sm:block" /><div className="text-center sm:text-left"><h3 className="font-bold text-gray-900 text-sm sm:text-base mb-0.5">Jadwal Otomatis</h3><p className="text-xs text-gray-500 hidden sm:block">Sesuai waktu</p></div></button></div>
          )}
          {configMode === "sensor" ? (
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {!activeSensorAspect ? (
                <div className="space-y-4">
                  <div className="px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100 mb-6">
                    <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Pilih Aspek untuk Dikonfigurasi
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {/* ASPEK KENYAMANAN */}
                    <button
                      onClick={() => setActiveSensorAspect("kenyamanan")}
                      className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-center"
                    >
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight">Kenyamanan</h4>
                      <p className="text-[10px] text-gray-500">Suhu & Lembap</p>
                    </button>

                    {/* ASPEK KEAMANAN (Gabungan Motion & Pintu) */}
                    <button
                      onClick={() => setActiveSensorAspect("keamanan")}
                      className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group text-center"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ShieldAlert className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight">Keamanan</h4>
                      <p className="text-[10px] text-gray-500">Motion & Door Sensor</p>
                    </button>

                    {/* KUALITAS AIR */}
                    <button
                      onClick={() => setActiveSensorAspect("kualitasAir")}
                      className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-2xl hover:border-cyan-500 hover:bg-cyan-50 transition-all group text-center"
                    >
                      <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Waves className="w-6 h-6 text-cyan-600" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight">Kualitas Air</h4>
                      <p className="text-[10px] text-gray-500">pH, TDS, Keruh, Suhu</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedCategory !== "sensor" && (
                    <button
                      onClick={() => setActiveSensorAspect(null)}
                      className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors group mb-2"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                      Kembali Pilih Aspek
                    </button>
                  )}

                  {/* ASPEK KENYAMANAN */}
                  {activeSensorAspect === "kenyamanan" && (
                    <div className="space-y-4">
                      <div className="px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                        <p className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Aspek Kenyamanan
                        </p>
                      </div>

                      {/* Suhu */}
                      <div className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Thermometer className="w-6 h-6 text-orange-500" />
                            <div>
                              <h4 className="font-bold text-gray-900">Suhu (Temperature)</h4>
                              <p className="text-xs text-gray-500">Status "Tidak Nyaman" jika suhu abnormal</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={sensorConfig.temperature.enabled}
                            onChange={(e) => setSensorConfig({
                              ...sensorConfig,
                              temperature: { ...sensorConfig.temperature, enabled: e.target.checked }
                            })}
                            className="w-5 h-5 text-emerald-600 rounded"
                          />
                        </div>
                        {sensorConfig.temperature.enabled && (
                          <div className="space-y-3 pl-9">
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={sensorConfig.temperature.useDefault}
                                  onChange={() => setSensorConfig({
                                    ...sensorConfig,
                                    temperature: { ...sensorConfig.temperature, useDefault: true, value: 27 }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Default (27°C)</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={!sensorConfig.temperature.useDefault}
                                  onChange={() => setSensorConfig({
                                    ...sensorConfig,
                                    temperature: { ...sensorConfig.temperature, useDefault: false }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Custom</span>
                              </label>
                            </div>
                            {!sensorConfig.temperature.useDefault && (
                              <input
                                type="number"
                                value={sensorConfig.temperature.value}
                                onChange={(e) => setSensorConfig({
                                  ...sensorConfig,
                                  temperature: { ...sensorConfig.temperature, value: parseFloat(e.target.value) }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="Masukkan nilai suhu (°C)"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Kelembaban */}
                      <div className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Droplets className="w-6 h-6 text-blue-500" />
                            <div>
                              <h4 className="font-bold text-gray-900">Kelembaban (Humidity)</h4>
                              <p className="text-xs text-gray-500">Status "Tidak Nyaman" jika kelembapan abnormal</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={sensorConfig.humidity.enabled}
                            onChange={(e) => setSensorConfig({
                              ...sensorConfig,
                              humidity: { ...sensorConfig.humidity, enabled: e.target.checked }
                            })}
                            className="w-5 h-5 text-emerald-600 rounded"
                          />
                        </div>
                        {sensorConfig.humidity.enabled && (
                          <div className="space-y-3 pl-9">
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={sensorConfig.humidity.useDefault}
                                  onChange={() => setSensorConfig({
                                    ...sensorConfig,
                                    humidity: { ...sensorConfig.humidity, useDefault: true, value: 80 }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Default (80%)</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={!sensorConfig.humidity.useDefault}
                                  onChange={() => setSensorConfig({
                                    ...sensorConfig,
                                    humidity: { ...sensorConfig.humidity, useDefault: false }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Custom</span>
                              </label>
                            </div>
                            {!sensorConfig.humidity.useDefault && (
                              <input
                                type="number"
                                value={sensorConfig.humidity.value}
                                onChange={(e) => setSensorConfig({
                                  ...sensorConfig,
                                  humidity: { ...sensorConfig.humidity, value: parseFloat(e.target.value) }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="Masukkan nilai kelembaban (%)"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ASPEK KEAMANAN (Lengkap) */}
                  {activeSensorAspect === "keamanan" && (
                    <div className="space-y-4">
                      <div className="px-4 py-2 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-sm font-bold text-purple-800 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4" /> Aspek Keamanan
                        </p>
                      </div>

                      {/* Motion Sensor */}
                      <div className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Eye className="w-6 h-6 text-purple-600" />
                            <div>
                              <h4 className="font-bold text-gray-900">Motion Sensor</h4>
                              <p className="text-xs text-gray-500">Terdeteksi gerakan pada area pemantauan</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={sensorConfig.motion.enabled}
                            onChange={(e) => setSensorConfig({
                              ...sensorConfig,
                              motion: { ...sensorConfig.motion, enabled: e.target.checked }
                            })}
                            className="w-5 h-5 text-emerald-600 rounded"
                          />
                        </div>
                      </div>

                      {/* Door Sensor */}
                      <div className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Lock className="w-6 h-6 text-red-600" />
                            <div>
                              <h4 className="font-bold text-gray-900">Door Sensor</h4>
                              <p className="text-xs text-gray-500">Memantau status pintu (Terbuka/Tertutup)</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={sensorConfig.door.enabled}
                            onChange={(e) => setSensorConfig({
                              ...sensorConfig,
                              door: { ...sensorConfig.door, enabled: e.target.checked }
                            })}
                            className="w-5 h-5 text-emerald-600 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  )}



                  {/* KUALITAS AIR */}
                  {activeSensorAspect === "kualitasAir" && (
                    <div className="space-y-4">
                      <div className="px-4 py-2 bg-cyan-50 rounded-lg border border-cyan-100">
                        <p className="text-sm font-bold text-cyan-800 flex items-center gap-2">
                          <Waves className="w-4 h-4" /> Kualitas Air
                        </p>
                      </div>

                      {/* pH */}
                      <div className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Beaker className="w-6 h-6 text-cyan-500" />
                            <div>
                              <h4 className="font-bold text-gray-900">pH Air</h4>
                              <p className="text-xs text-gray-500">Status "Tidak Layak" jika batas pH abnormal</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={sensorConfig.ph.enabled}
                            onChange={(e) => setSensorConfig({
                              ...sensorConfig,
                              ph: { ...sensorConfig.ph, enabled: e.target.checked }
                            })}
                            className="w-5 h-5 text-emerald-600 rounded"
                          />
                        </div>
                        {sensorConfig.ph.enabled && (
                          <div className="space-y-3 pl-9">
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={sensorConfig.ph.useDefault}
                                  onChange={() => setSensorConfig({
                                    ...sensorConfig,
                                    ph: { ...sensorConfig.ph, useDefault: true, value: 7.0 }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Default (7.0)</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={!sensorConfig.ph.useDefault}
                                  onChange={() => setSensorConfig({
                                    ...sensorConfig,
                                    ph: { ...sensorConfig.ph, useDefault: false }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Custom</span>
                              </label>
                            </div>
                            {!sensorConfig.ph.useDefault && (
                              <input
                                type="number"
                                step="0.1"
                                value={sensorConfig.ph.value}
                                onChange={(e) => setSensorConfig({
                                  ...sensorConfig,
                                  ph: { ...sensorConfig.ph, value: parseFloat(e.target.value) }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Turbidity */}
                      <div className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Droplets className="w-6 h-6 text-blue-600" />
                            <div>
                              <h4 className="font-bold text-gray-900">Kekeruhan (Turbidity)</h4>
                              <p className="text-xs text-gray-500">Status "Tidak Layak" jika air terlalu keruh</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={sensorConfig.turbidity.enabled}
                            onChange={(e) => setSensorConfig({
                              ...sensorConfig,
                              turbidity: { ...sensorConfig.turbidity, enabled: e.target.checked }
                            })}
                            className="w-5 h-5 text-emerald-600 rounded"
                          />
                        </div>
                        {sensorConfig.turbidity.enabled && (
                          <div className="space-y-3 pl-9">
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={sensorConfig.turbidity.useDefault}
                                  onChange={() => setSensorConfig({
                                    ...sensorConfig,
                                    turbidity: { ...sensorConfig.turbidity, useDefault: true, value: 25 }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Default (25 NTU)</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={!sensorConfig.turbidity.useDefault}
                                  onChange={() => setSensorConfig({
                                    ...sensorConfig,
                                    turbidity: { ...sensorConfig.turbidity, useDefault: false }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Custom</span>
                              </label>
                            </div>
                            {!sensorConfig.turbidity.useDefault && (
                              <input
                                type="number"
                                value={sensorConfig.turbidity.value}
                                onChange={(e) => setSensorConfig({
                                  ...sensorConfig,
                                  turbidity: { ...sensorConfig.turbidity, value: parseFloat(e.target.value) }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* TDS */}
                      <div className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Wind className="w-6 h-6 text-teal-600" />
                            <div>
                              <h4 className="font-bold text-gray-900">TDS</h4>
                              <p className="text-xs text-gray-500">Status "Tidak Layak" jika TDS air terlalu tinggi</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={sensorConfig.tds.enabled}
                            onChange={(e) => setSensorConfig({
                              ...sensorConfig,
                              tds: { ...sensorConfig.tds, enabled: e.target.checked }
                            })}
                            className="w-5 h-5 text-emerald-600 rounded"
                          />
                        </div>
                        {sensorConfig.tds.enabled && (
                          <div className="space-y-3 pl-9">
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={sensorConfig.tds.useDefault}
                                  onChange={() => setSensorConfig({
                                    ...sensorConfig,
                                    tds: { ...sensorConfig.tds, useDefault: true, value: 1000 }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Default (1000 mg/L)</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={!sensorConfig.tds.useDefault}
                                  onChange={() => setSensorConfig({
                                    ...sensorConfig,
                                    tds: { ...sensorConfig.tds, useDefault: false }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Custom</span>
                              </label>
                            </div>
                            {!sensorConfig.tds.useDefault && (
                              <input
                                type="number"
                                value={sensorConfig.tds.value}
                                onChange={(e) => setSensorConfig({
                                  ...sensorConfig,
                                  tds: { ...sensorConfig.tds, value: parseFloat(e.target.value) }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Water Temp */}
                      <div className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Thermometer className="w-6 h-6 text-blue-500" />
                            <div>
                              <h4 className="font-bold text-gray-900">Suhu Air</h4>
                              <p className="text-xs text-gray-500">Status "Tidak Layak" jika derajat suhu abnormal</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={sensorConfig.waterTemp.enabled}
                            onChange={(e) => setSensorConfig({
                              ...sensorConfig,
                              waterTemp: { ...sensorConfig.waterTemp, enabled: e.target.checked }
                            })}
                            className="w-5 h-5 text-emerald-600 rounded"
                          />
                        </div>
                        {sensorConfig.waterTemp.enabled && (
                          <div className="space-y-3 pl-9">
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={sensorConfig.waterTemp.useDefault}
                                  onChange={() => setSensorConfig({
                                    ...sensorConfig,
                                    waterTemp: { ...sensorConfig.waterTemp, useDefault: true, value: 24 }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Default (24°C)</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  checked={!sensorConfig.waterTemp.useDefault}
                                  onChange={() => setSensorConfig({
                                    ...sensorConfig,
                                    waterTemp: { ...sensorConfig.waterTemp, useDefault: false }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Custom</span>
                              </label>
                            </div>
                            {!sensorConfig.waterTemp.useDefault && (
                              <input
                                type="number"
                                value={sensorConfig.waterTemp.value}
                                onChange={(e) => setSensorConfig({
                                  ...sensorConfig,
                                  waterTemp: { ...sensorConfig.waterTemp, value: parseFloat(e.target.value) }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {scheduleConfig.map((schedule, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:border-emerald-200 transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-gray-900">Jadwal #{index + 1}</h4>
                    </div>
                    <button
                      onClick={() => removeSchedule(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Jam Nyala</label>
                        <input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => updateSchedule(index, "startTime", e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Jam Mati</label>
                        <input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => updateSchedule(index, "endTime", e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 font-accent">Hari Pengulangan</label>
                      <div className="flex flex-wrap gap-2">
                        {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => (
                          <button
                            key={day}
                            onClick={() => {
                              const days = schedule.days.includes(day)
                                ? schedule.days.filter((d) => d !== day)
                                : [...schedule.days, day];
                              updateSchedule(index, "days", days);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${schedule.days.includes(day)
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                          >
                            {day.substring(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addSchedule}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-semibold hover:border-emerald-500 hover:text-emerald-600"
              >
                + Tambah Jadwal
              </button>
            </div>
          )}
          <div className="flex gap-3 pt-6">
            <button
              onClick={() => setStep("add-device-form")}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Kembali
            </button><button
              onClick={handleSaveDevice}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            ><Save className="w-5 h-5" />
              Simpan Konfigurasi
            </button></div></div></div>}
      </div>
      {/* Token Generation Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-600 p-6 text-center text-white relative">
              <button
                onClick={() => setShowTokenModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Radio className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-xl font-bold">Token Akses Teknisi</h3>
              <p className="text-emerald-100 text-xs mt-1">Berikan kode ini kepada teknisi Anda</p>
            </div>
            <div className="p-8 text-center">
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-6 mb-6">
                <span className="text-[3rem] font-black tracking-[0.5rem] text-emerald-600 font-mono">
                  {generatedToken}
                </span>
              </div>
              <div className="flex items-start gap-3 text-left bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                  Token ini bersifat **sekali pakai** dengan masa aktif **5 menit**. Setelah digunakan, akses konfigurasi teknisi berlaku selama **30 menit** dan akan *logout otomatis* jika waktu habis.
                </p>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </HomeownerLayout>
  );
}
