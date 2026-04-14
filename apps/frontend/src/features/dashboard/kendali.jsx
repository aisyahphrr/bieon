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
  Lock
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
  "sensor": ["Temperature Sensor", "Humidity Sensor", "Air Quality Sensor", "Motion Sensor", "Light Sensor"],
  "smart-switch": ["Light", "Fan", "Exhaust Fan", "Ceiling Fan"],
  "smart-plug": ["AC", "TV", "Heater", "Water Heater", "Refrigerator", "Washing Machine"],
  "remote": ["AC", "TV", "Set-Top Box", "Sound System", "Projector"]
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
    temperature: { enabled: false, value: 24, useDefault: true },
    humidity: { enabled: false, value: 60, useDefault: true },
    motion: { enabled: false },
    door: { enabled: false },
    ph: { enabled: false, value: 7, useDefault: true },
    turbidity: { enabled: false, value: 5, useDefault: true },
    tds: { enabled: false, value: 100, useDefault: true },
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
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedDeviceType("");
    setStep("select-device-type");
  };
  const handleSelectDeviceType = (deviceType) => {
    setSelectedDeviceType(deviceType);
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
    if (selectedCategory === "sensor") {
      handleSaveDevice();
    } else {
      setStep("configure");
    }
  };
  const handleSaveDevice = () => {
    if (!currentBieon || !selectedHub) return;
    const newDevice = {
      id: `dev-${Date.now()}`,
      name: deviceForm.name,
      deviceType: selectedDeviceType,
      category: selectedCategory,
      location: deviceForm.location,
      notes: deviceForm.notes,
      hubId: selectedHub.id,
      bieonId: currentBieon.bieonId,
      status: "OFF",
      installedDate: (/* @__PURE__ */ new Date()).toISOString(),
      lastActivity: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (selectedCategory !== "sensor") {
      newDevice.controlMode = configMode;
      if (configMode === "sensor") {
        newDevice.sensorParams = sensorConfig;
      } else {
        newDevice.scheduleSettings = scheduleConfig;
      }
      newDevice.controls = {};
    } else {
      newDevice.sensorData = generateMockSensorData(selectedDeviceType);
    }
    const updatedBieon = {
      ...currentBieon,
      hubs: currentBieon.hubs.map(
        (hub) => hub.id === selectedHub.id ? { ...hub, devices: [...hub.devices, newDevice] } : hub
      )
    };
    setBieonSystems(bieonSystems.map((b) => b.id === currentBieon.id ? updatedBieon : b));
    setCurrentBieon(updatedBieon);
    resetForm();
    setStep("view-bieon");

    // Dynamic success message
    if (selectedCategory !== "actuator") {
      const modeText = configMode === "sensor" ? "Parameter Sensor" : "Jadwal Otomatis";
      alert(`Berhasil! Perangkat ditambahkan dengan mode ${modeText}.`);
    } else {
      alert("Device berhasil ditambahkan!");
    }
  };
  const generateMockSensorData = (deviceType) => {
    const data = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (deviceType === "Temperature Sensor") {
      data.temperature = Math.round(20 + Math.random() * 10);
    } else if (deviceType === "Humidity Sensor") {
      data.humidity = Math.round(40 + Math.random() * 40);
    } else if (deviceType === "Air Quality Sensor") {
      data.airQuality = Math.round(30 + Math.random() * 100);
    } else if (deviceType === "Light Sensor") {
      data.lightLevel = Math.round(100 + Math.random() * 400);
    } else if (deviceType === "Motion Sensor") {
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
      temperature: { enabled: false, value: 24, useDefault: true },
      humidity: { enabled: false, value: 60, useDefault: true },
      motion: { enabled: false },
      door: { enabled: false },
      ph: { enabled: false, value: 7, useDefault: true },
      turbidity: { enabled: false, value: 5, useDefault: true },
      tds: { enabled: false, value: 100, useDefault: true },
      waterTemp: { enabled: false, value: 24, useDefault: true }
    });
    setScheduleConfig([]);
    setConfigMode("sensor");
    setActiveSensorAspect(null);
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
    setEditingDevice(device);
    setShowEditPage(true);
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
    const devices = currentBieon ? currentBieon.hubs.flatMap((hub) => hub.devices) : getAllDevices();
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
            </div>
          </div>
        </div>{
          /* ==================== STEP: IDLE (Dashboard) ==================== */
        }{step === "idle" && <div>{bieonSystems.length === 0 ? <div className="text-center py-20"><div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6"><Home className="w-12 h-12 text-emerald-600" /></div><h2 className="text-2xl font-bold text-gray-900 mb-3">Belum Ada Sistem BIEON</h2><p className="text-gray-600 mb-8 max-w-md mx-auto">
          Mulai dengan menambahkan sistem BIEON Anda untuk mengelola smart devices
        </p><button
          onClick={() => setStep("input-id")}
          className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        ><Plus className="w-5 h-5 inline mr-2" />
            Tambah BIEON Pertama
          </button></div> : <div>{
            /* Stats */
          }<div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8"><div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center"><Home className="w-6 h-6 text-white" /></div><div><p className="text-sm text-gray-600">BIEON Systems</p><p className="text-2xl font-bold text-gray-900">{bieonSystems.length}</p></div></div></div><div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"><Wifi className="w-6 h-6 text-white" /></div><div><p className="text-sm text-gray-600">Total Hubs</p><p className="text-2xl font-bold text-gray-900">{bieonSystems.reduce((sum, b) => sum + b.totalHubs, 0)}</p></div></div></div><div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"><Settings className="w-6 h-6 text-white" /></div><div><p className="text-sm text-gray-600">Total Devices</p><p className="text-2xl font-bold text-gray-900">{getAllDevices().length}</p></div></div></div><div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center"><Zap className="w-6 h-6 text-white" /></div><div><p className="text-sm text-gray-600">Active Devices</p><p className="text-2xl font-bold text-gray-900">{getAllDevices().filter((d) => d.status === "ON").length}</p></div></div></div></div>{
            /* BIEON Systems List */
          }<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sistem BIEON Terdaftar</h2>
              <button 
                onClick={() => setStep("input-id")}
                className="flex items-center gap-2 px-4 py-2 bg-[#009b7c] text-white rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Tambah BIEON
              </button>
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
                {/* Configuration Context Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      Mode: <span className={`${device.controlMode === "sensor" ? "text-emerald-600 bg-emerald-50" : "text-purple-600 bg-purple-50"} font-bold px-2 py-0.5 rounded capitalize`}>
                        {device.controlMode === "sensor" ? "Parameter Sensor" : "Jadwal Otomatis"}
                      </span>
                    </p>
                  </div>

                  {/* Detailed Configuration Summary */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap gap-3">
                    {device.controlMode === "sensor" ? (
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
                </div>

                {/* Quick Controls Section */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kontrol Manual</p>
                  <div className="flex flex-wrap gap-4 p-3 bg-blue-50/50 rounded-xl border border-blue-50/50">
                    <button
                      onClick={() => toggleDevicePower(device.id)}
                      className={`flex-1 min-w-[200px] py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${device.status === "ON" ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-white border border-gray-200 text-gray-700 shadow-sm hover:shadow"}`}
                    >
                      <Power className="w-4 h-4 text-gray-500" /> Turn {device.status === "ON" ? "OFF" : "ON"}
                    </button>

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
                    {device.category === "sensor" && (
                      <div className="flex-1 min-w-[250px] flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2">
                        <button onClick={() => toggleDevicePower(device.id)} className="w-full text-sm font-semibold text-gray-700 flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4" /> {device.status === "ON" ? "Stop Monitoring" : "Start Monitoring"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sensor Only Data Block */}
                {device.category === "sensor" && device.status === "ON" && device.sensorData && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {device.sensorData.temperature !== undefined && (
                      <div className="px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-bold text-orange-700">{device.sensorData.temperature}°C</span>
                      </div>
                    )}
                    {device.sensorData.humidity !== undefined && (
                      <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-bold text-blue-700">{device.sensorData.humidity}%</span>
                      </div>
                    )}
                    {device.sensorData.airQuality !== undefined && (
                      <div className="px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2">
                        <Wind className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-bold text-green-700">AQI: {device.sensorData.airQuality}</span>
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
                  <button
                    onClick={() => deleteDevice(device.id)}
                    className="sm:w-auto px-6 sm:px-10 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => handleEditDevice(device)}
                    className="flex-1 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
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
          ><X className="w-6 h-6 text-gray-500" /></button></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"><button
            onClick={() => handleSelectCategory("sensor")}
            className="p-8 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-xl transition-all text-left group"
          ><Activity className="w-12 h-12 text-emerald-600 mb-4 group-hover:scale-110 transition-transform" /><h3 className="text-xl font-bold text-gray-900 mb-2">Sensor</h3><p className="text-sm text-gray-600">
              Monitoring - Energi, Kesehatan Air, Keamanan dan Kenyamanan.
            </p></button><button
              onClick={() => handleSelectCategory("smart-switch")}
              className="p-8 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-xl transition-all text-left group"
            ><Lightbulb className="w-12 h-12 text-yellow-600 mb-4 group-hover:scale-110 transition-transform" /><h3 className="text-xl font-bold text-gray-900 mb-2">Smart Switch</h3><p className="text-sm text-gray-600">
                Aktuator - Light, Fan, Exhaust Fan
              </p></button><button
                onClick={() => handleSelectCategory("smart-plug")}
                className="p-8 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-xl transition-all text-left group"
              ><Zap className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" /><h3 className="text-xl font-bold text-gray-900 mb-2">Smart Plug</h3><p className="text-sm text-gray-600">
                Aktuator - AC, TV, Heater, Water Heater, Refrigerator
              </p></button><button
                onClick={() => handleSelectCategory("remote")}
                className="p-8 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-xl transition-all text-left group"
              ><Radio className="w-12 h-12 text-purple-600 mb-4 group-hover:scale-110 transition-transform" /><h3 className="text-xl font-bold text-gray-900 mb-2">Remote</h3><p className="text-sm text-gray-600">
                Aktuator - AC, TV, Set-Top Box, Sound System
              </p></button></div></div></div>}{
          /* ==================== MODAL: SELECT DEVICE TYPE ==================== */
        }{step === "select-device-type" && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8"><div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-gray-900">Pilih Tipe Device</h2><p className="text-sm text-gray-600 mt-1">
          Kategori: <span className="capitalize font-semibold">{selectedCategory}</span></p></div><button
            onClick={() => setStep("select-category")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          ><X className="w-6 h-6 text-gray-500" /></button></div><div className="space-y-3">{CATEGORY_DEVICES[selectedCategory]?.map((deviceType) => <button
            key={deviceType}
            onClick={() => handleSelectDeviceType(deviceType)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all text-left flex items-center justify-between group"
          ><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"><Settings className="w-5 h-5 text-emerald-600" /></div><span className="font-semibold text-gray-900">{deviceType}</span></div><ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" /></button>)}</div></div></div>}{
          /* ==================== MODAL: ADD DEVICE FORM ==================== */
        }{step === "add-device-form" && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"><div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8"><div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-gray-900">Informasi Device</h2><p className="text-sm text-gray-600 mt-1">
          Device: <span className="font-semibold">{selectedDeviceType}</span></p></div><button
            onClick={() => setStep("select-device-type")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          ><X className="w-6 h-6 text-gray-500" /></button></div><div className="space-y-6"><div><label className="block text-sm font-semibold text-gray-700 mb-2">
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
              /></div><div className="flex gap-3 pt-4"><button
                onClick={() => setStep("select-device-type")}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Kembali
              </button><button
                onClick={handleSubmitDeviceForm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >{selectedCategory === "sensor" ? "Simpan" : "Lanjut ke Konfigurasi"}</button></div></div></div></div>}{
          /* ==================== MODAL: CONFIGURE (ACTUATORS ONLY) ==================== */
        }{step === "configure" && selectedCategory !== "sensor" && <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto"><div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-8 my-4 sm:my-8"><div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold text-gray-900">Pilih Metode Pengaturan</h2><p className="text-sm text-gray-600 mt-1">Parameter sensor atau jadwal otomatis</p></div><button
          onClick={() => setStep("add-device-form")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
        ><X className="w-6 h-6 text-gray-500" /></button></div>{
            /* Method Selection */
          }<div className="grid grid-cols-2 gap-4 mb-8"><button
            onClick={() => setConfigMode("sensor")}
            className={`p-6 rounded-xl border-2 transition-all ${configMode === "sensor" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"}`}
          ><Settings className="w-8 h-8 text-emerald-600 mb-3" /><h3 className="font-bold text-gray-900 mb-1">Parameter Sensor</h3><p className="text-sm text-gray-600">Atur berdasarkan kondisi lingkungan & keamanan</p></button><button
            onClick={() => setConfigMode("schedule")}
            className={`p-6 rounded-xl border-2 transition-all ${configMode === "schedule" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"}`}
          ><Calendar className="w-8 h-8 text-emerald-600 mb-3" /><h3 className="font-bold text-gray-900 mb-1">Jadwal Otomatis</h3><p className="text-sm text-gray-600">Atur jadwal harian dan mingguan</p></button></div>
          {configMode === "sensor" ? (
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {!activeSensorAspect ? (
                <div className="space-y-4">
                  <div className="px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100 mb-6">
                    <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Pilih Aspek untuk Dikonfigurasi
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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

                    {/* ASPEK KEAMANAN (Lengkap) */}
                    <button
                      onClick={() => setActiveSensorAspect("keamanan")}
                      className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group text-center"
                    >
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ShieldAlert className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight">Keamanan Motion</h4>
                      <p className="text-[10px] text-gray-500">Deteksi Gerak</p>
                    </button>

                    {/* ASPEK KEAMANAN (Pintu) */}
                    <button
                      onClick={() => setActiveSensorAspect("keamananPintu")}
                      className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all group text-center"
                    >
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Lock className="w-6 h-6 text-red-600" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight">Keamanan Pintu</h4>
                      <p className="text-[10px] text-gray-500">Smart Door</p>
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
                  <button
                    onClick={() => setActiveSensorAspect(null)}
                    className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors group mb-2"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    Kembali Pilih Aspek
                  </button>

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
                              <p className="text-xs text-gray-500">Device ON jika suhu mencapai threshold</p>
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
                                    temperature: { ...sensorConfig.temperature, useDefault: true, value: 24 }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Default (25°C)</span>
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
                              <p className="text-xs text-gray-500">Device ON jika kelembaban mencapai threshold</p>
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
                                    humidity: { ...sensorConfig.humidity, useDefault: true, value: 60 }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Default (60%)</span>
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
                              <p className="text-xs text-gray-500">Device ON jika terdeteksi gerakan</p>
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
                              <p className="text-xs text-gray-500">Device ON jika pintu terbuka</p>
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

                  {/* ASPEK KEAMANAN (Pintu) */}
                  {activeSensorAspect === "keamananPintu" && (
                    <div className="space-y-4">
                      <div className="px-4 py-2 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-sm font-bold text-red-800 flex items-center gap-2">
                          <Lock className="w-4 h-4" /> Aspek Keamanan (Pintu)
                        </p>
                      </div>

                      {/* Door Sensor Only */}
                      <div className="border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Lock className="w-6 h-6 text-red-600" />
                            <div>
                              <h4 className="font-bold text-gray-900">Door Sensor</h4>
                              <p className="text-xs text-gray-500">Device ON jika pintu terbuka</p>
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
                              <p className="text-xs text-gray-500">Device ON jika pH di luar rentang normal</p>
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
                                    ph: { ...sensorConfig.ph, useDefault: true, value: 7 }
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
                              <p className="text-xs text-gray-500">Device ON jika air keruh</p>
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
                                    turbidity: { ...sensorConfig.turbidity, useDefault: true, value: 5 }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Default (5 NTU)</span>
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
                              <p className="text-xs text-gray-500">Device ON jika padatan terlarut tinggi</p>
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
                                    tds: { ...sensorConfig.tds, useDefault: true, value: 100 }
                                  })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700">Default (100 ppm)</span>
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
                              <p className="text-xs text-gray-500">Device ON jika air panas/dingin</p>
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
        {showEditPage && editingDevice && currentBieon && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
            <EditHubNodePage
              device={editingDevice}
              bieonSystem={currentBieon}
              onSave={handleSaveEditedDevice}
              onCancel={handleCancelEdit}
            />
          </div>
        )}
      </div>
    </HomeownerLayout>
  );
}
