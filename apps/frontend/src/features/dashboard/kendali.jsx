/*  */import { useState, useMemo, useEffect } from "react";
import { io } from "socket.io-client";
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
  Cpu,
  QrCode
} from "lucide-react";
import DeviceScanner from "./components/DeviceScanner";
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
  const [step, setStep] = useState("idle");
  const [bieonSystems, setBieonSystems] = useState([]);
  const [currentBieon, setCurrentBieon] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const [showScanner, setShowScanner] = useState(false);
  const [productRegForm, setProductRegForm] = useState({ id: "", name: "", category: "sensor", aspect: "none", controlCategory: "smart-switch" });
  const [registeredProducts, setRegisteredProducts] = useState([]);

  // Technician Access States
  const [isTechnicianMode, setIsTechnicianMode] = useState(() => localStorage.getItem('bieon_tech_access') === 'true');
  const [isTechnicianActiveInSystem, setIsTechnicianActiveInSystem] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [isEditingDevice, setIsEditingDevice] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Load User and Systems from Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // 1. Get Me
        const meRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!meRes.ok) throw new Error("Gagal fetch profil");
        const user = await meRes.json();
        setUserProfile(user);

        // Tentukan apakah kita dalam mode teknisi (cek localStorage langsung untuk menghindari stale state)
        const techAccess = localStorage.getItem('bieon_tech_access') === 'true';
        const activeHomeownerId = localStorage.getItem('bieon_active_homeowner_id');

        const targetId = (techAccess && activeHomeownerId)
          ? activeHomeownerId
          : user._id;

        // Update state agar UI sinkron
        setIsTechnicianMode(techAccess);

        // 2. Get Systems (Disesuaikan untuk target ID)
        const sysRes = await fetch(`/api/hubs/systems/${targetId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const systemsData = await sysRes.json();

        // 3. Get Devices (Disesuaikan untuk target ID)
        const devRes = await fetch(`/api/kendaliperangkat/user/${targetId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const devicesData = await devRes.json();

        // Join devices into hubs in systems
        const joinedSystems = systemsData.map(sys => ({
          id: sys._id,
          bieonId: sys.bieonId,
          name: sys.bieonId, // Fallback name
          totalHubs: sys.totalHubsCount,
          hubs: sys.hubs.map(hub => ({
            ...hub,
            devices: devicesData
              .filter(d => d.hubId === hub.id)
              .map(d => ({
                ...d,
                id: d._id,
                installedDate: d.createdAt,
                currentValues: d.currentValues || {},
                sensorParams: d.thresholds || {} // Tetap petakan thresholds ke sensorParams untuk UI lama
              }))
          })),
          createdAt: sys.createdAt
        }));

        setBieonSystems(joinedSystems);
        if (joinedSystems.length > 0) {
          setCurrentBieon(joinedSystems[0]);
          setStep("view-bieon");
        } else {
          setStep("idle");
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // SOCKET.IO REAL-TIME MONITORING
    const socket = io('/'); // Koneksi ke backend

    socket.on('device_telemetry', (updatedDevice) => {
      console.log('📡 Real-time Telemetry received:', updatedDevice);
      setBieonSystems(prevSystems => {
        return prevSystems.map(sys => ({
          ...sys,
          hubs: sys.hubs.map(hub => ({
            ...hub,
            devices: hub.devices.map(dev => {
              if (dev._id === updatedDevice._id || dev.id === updatedDevice._id) {
                return {
                  ...dev,
                  currentValues: updatedDevice.currentValues,
                  battery: updatedDevice.battery,
                  status: updatedDevice.status
                };
              }
              return dev;
            })
          }))
        }));
      });
    });

    socket.on('new_unassigned_device', (newDevice) => {
      setUnassignedDevices(prev => {
        if (!prev.find(d => d.ieeeAddress === newDevice.ieeeAddress)) {
          return [...prev, newDevice];
        }
        return prev;
      });
    });

    const techAccess = localStorage.getItem('bieon_tech_access');
    if (techAccess === 'true') {
      setIsTechnicianMode(true);
    }
  }, []); // Hapus userProfile dari dependency agar tidak infinite loop

  useEffect(() => {
    if (!userProfile?._id || userProfile?.role !== 'Homeowner') return;

    const checkTechStatus = async () => {
      try {
        const response = await fetch(`/api/technician-access/status/${userProfile._id}`);
        if (response.ok) {
          const data = await response.json();
          setIsTechnicianActiveInSystem(data.isAccessed);
        }
      } catch (error) {
        console.error("Gagal cek status teknisi:", error);
      }
    };

    checkTechStatus(); // Cek langsung saat load
    const interval = setInterval(checkTechStatus, 5000); // Polling tiap 5 detik
    return () => clearInterval(interval);
  }, [userProfile]);

  useEffect(() => {
    if (localStorage.getItem('openBieonInput') === 'true') {
      setStep('input-id');
      localStorage.removeItem('openBieonInput');
    }
  }, []);

  const handleGenerateToken = async () => {
    try {
      if (!userProfile?._id) {
        alert("Profil user tidak ditemukan. Mohon refresh halaman.");
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/technician-access/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homeownerId: userProfile._id
        })
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedToken(data.token);
        // Tetap simpan di localStorage untuk kompatibilitas mockup
        localStorage.setItem('bieon_active_token', data.token);
        localStorage.setItem('bieon_active_token_expiry', (Date.now() + 5 * 60 * 1000).toString());
        setShowTokenModal(true);
      } else {
        alert("Gagal generate token: " + (data.message || "Kesalahan server"));
      }
    } catch (error) {
      console.error("error generate token:", error);
      alert("Terjadi kesalahan teknis saat generate token. Pastikan koneksi server aktif.");
    }
  };

  const handleExitTechnicianMode = () => {
    localStorage.removeItem('bieon_tech_access');
    setIsTechnicianMode(false);
    onNavigate('teknisi');
  };

  const handleSubmitBieonId = async () => {
    if (!bieonIdInput.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hubs/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bieonId: bieonIdInput,
          totalHubs: 3, // Default atau ambil dari BIEON_DATABASE jika perlu
          userId: userProfile._id
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const newBieon = {
        id: data.system._id,
        bieonId: data.system.bieonId,
        name: data.system.bieonId,
        totalHubs: data.system.totalHubsCount,
        hubs: data.hubs.map(h => ({
          id: h._id,
          name: h.name,
          status: h.status,
          devices: []
        })),
        createdAt: data.system.createdAt
      };

      setBieonSystems([...bieonSystems, newBieon]);
      setCurrentBieon(newBieon);
      setBieonIdInput("");
      setStep("view-bieon");
      alert("Sistem BIEON berhasil ditambahkan!");
    } catch (error) {
      alert("Gagal: " + error.message);
    }
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
    setStep("add-device-choice");
  };

  const fetchRegisteredProducts = async () => {
    try {
      const res = await fetch('/api/products/list');
      const data = await res.json();
      setRegisteredProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };
  const handleRegisterProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productRegForm.id,
          productName: productRegForm.name,
          category: productRegForm.category,
          aspect: productRegForm.category === 'sensor' ? productRegForm.aspect : productRegForm.controlCategory
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert("Produk berhasil diregistrasi! Sekarang pilih kategori.");
        await fetchRegisteredProducts(); // Refresh data!
        setStep("select-category");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error registrasi: " + err.message);
    }
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

    // Khusus sensor, langsung arahkan ke aspek yang relevan dan AKTIFKAN parameternya
    if (selectedCategory === "sensor") {
      let aspect = null;
      // Deep copy to avoid mutation
      let newConfig = JSON.parse(JSON.stringify(sensorConfig));

      const currentAspect = selectedProduct?.aspect || (selectedDeviceType === "Sensor Kualitas Air" ? "air" : null);

      if (currentAspect === "air" || selectedDeviceType === "Sensor Kualitas Air") {
        aspect = "kualitasAir";
        newConfig.ph.enabled = true;
        newConfig.turbidity.enabled = true;
        newConfig.tds.enabled = true;
        newConfig.waterTemp.enabled = true;
      }
      else if (currentAspect === "kenyamanan" || selectedDeviceType === "Sensor Kenyamanan" || selectedDeviceType === "Humidity Sensor") {
        aspect = "kenyamanan";
        newConfig.temperature.enabled = true;
        newConfig.humidity.enabled = true;
      }
      else if (currentAspect === "keamanan" || selectedDeviceType === "Sensor Keamanan" || selectedDeviceType === "Motion Sensor") {
        aspect = "keamanan";
        newConfig.motion.enabled = true;
      }
      else if (selectedDeviceType === "Door Sensor") {
        aspect = "keamananPintu";
        newConfig.door.enabled = true;
      }

      if (aspect) {
        setActiveSensorAspect(aspect);
        setSensorConfig(newConfig);
      }
    }

    setStep("configure");
  };
  const mapToBackendData = (category, type, controlMode, aspect) => {
    let backendCategory = category;
    let backendType = type;
    let backendControl = controlMode;
    let backendAspect = null;

    // Map Category
    if (category === "sensor") {
      backendCategory = "Sensor";
    } else if (category === "control" || ["smart-plug", "smart-switch", "remote"].includes(category)) {
      backendCategory = "Control Actuator System";
    }

    // Map Type
    if (type === "Sensor Kualitas Air") {
      backendType = "Kualitas Air";
    } else if (type === "Sensor Kenyamanan") {
      backendType = "Kenyamanan";
    } else if (type === "Sensor Keamanan") {
      backendType = "Keamanan";
    }

    // Map Control Mode
    if (controlMode === "sensor") {
      backendControl = "Lingkungan";
    } else if (controlMode === "manual") {
      backendControl = "Manual";
    } else if (controlMode === "schedule") {
      backendControl = "Jadwal";
    } else if (!controlMode && category === "sensor") {
      backendControl = "Lingkungan";
    }

    // Map Aspect
    if (aspect === "kualitasAir") {
      backendAspect = "Kualitas Air";
    } else if (aspect === "kenyamanan") {
      backendAspect = "Kenyamanan";
    } else if (aspect === "keamanan" || aspect === "keamananPintu") {
      backendAspect = "Keamanan";
    }

    return { backendCategory, backendType, backendControl, backendAspect };
  };

  const transformSensorParams = (config, aspect) => {
    if (!config) return null;

    // Default empty result
    let result = {};

    if (aspect === "kualitasAir") {
      if (config.ph?.enabled) result.ph = config.ph.value;
      if (config.turbidity?.enabled) result.turbidity = config.turbidity.value;
      if (config.tds?.enabled) result.tds = config.tds.value;
      if (config.waterTemp?.enabled) result.temperature = config.waterTemp.value;
    } else if (aspect === "kenyamanan") {
      if (config.temperature?.enabled) result.temperature = config.temperature.value;
      if (config.humidity?.enabled) result.humidity = config.humidity.value;
    } else if (aspect === "keamanan" || aspect === "keamananPintu") {
      if (config.motion?.enabled) result.isMotionEnabled = true;
      if (config.door?.enabled) result.isDoorEnabled = true;
    }

    return Object.keys(result).length > 0 ? result : null;
  };

  const handleDirectSave = async (forcedMode = null) => {
    if (!deviceForm.name || !deviceForm.location) {
      alert("Mohon lengkapi nama device dan lokasi!");
      return;
    }

    if (!currentBieon || !selectedHub) return;

    try {
      const token = localStorage.getItem('token');
      const rawControl = forcedMode || (isTechnicianMode ? null : (selectedCategory === "sensor" ? "sensor" : "manual"));
      const { backendCategory, backendType, backendControl, backendAspect } = mapToBackendData(selectedCategory, selectedDeviceType, rawControl, activeSensorAspect);

      const activeHomeownerId = localStorage.getItem('bieon_active_homeowner_id');
      const targetOwnerId = (isTechnicianMode && activeHomeownerId) ? activeHomeownerId : userProfile._id;

      const deviceData = {
        name: deviceForm.name,
        deviceType: backendType,
        category: backendCategory,
        location: deviceForm.location,
        notes: deviceForm.notes,
        hubId: selectedHub.id,
        bieonId: currentBieon.bieonId,
        ownerId: targetOwnerId,
        controlMode: backendControl,
        environmentAspect: backendAspect,
        sensorParams: (selectedCategory === "sensor" || backendControl === "Lingkungan") ? transformSensorParams(sensorConfig, activeSensorAspect) : null,
        sensorData: selectedCategory === "sensor" ? generateMockSensorData(selectedDeviceType) : null
      };

      const response = await fetch('/api/kendaliperangkat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deviceData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Gagal menyimpan perangkat");
      }

      const newDevice = {
        ...data.device,
        id: data.device._id,
        status: "OFF",
        installedDate: data.device.createdAt
      };

      // Update local state
      const updatedHubs = currentBieon.hubs.map((hub) =>
        hub.id === selectedHub.id ? { ...hub, devices: [...hub.devices, newDevice] } : hub
      );
      const updatedBieon = { ...currentBieon, hubs: updatedHubs };
      setBieonSystems(bieonSystems.map((b) => b.id === currentBieon.id ? updatedBieon : b));
      setCurrentBieon(updatedBieon);

      resetForm();
      setStep("view-bieon");
      alert("Perangkat berhasil ditambahkan ke database!");
    } catch (error) {
      console.error("Save error details:", error);
      alert("Gagal simpan: " + (error.message || "Terjadi kesalahan pada server"));
    }
  };

  const handleSaveDevice = async () => {
    if (!currentBieon || !selectedHub) return;

    try {
      const token = localStorage.getItem('token');
      const rawControl = isTechnicianMode ? null : (selectedCategory === "sensor" ? "sensor" : configMode);
      const { backendCategory, backendType, backendControl, backendAspect } = mapToBackendData(selectedCategory, selectedDeviceType, rawControl, activeSensorAspect);

      const activeHomeownerId = localStorage.getItem('bieon_active_homeowner_id');
      const targetOwnerId = (isTechnicianMode && activeHomeownerId) ? activeHomeownerId : userProfile._id;

      const deviceData = {
        name: deviceForm.name,
        deviceType: backendType,
        category: backendCategory,
        location: deviceForm.location,
        notes: deviceForm.notes,
        hubId: selectedHub.id,
        bieonId: currentBieon.bieonId,
        ownerId: targetOwnerId,
        controlMode: backendControl,
        environmentAspect: backendAspect,
        sensorParams: (selectedCategory === "sensor" || backendControl === "Lingkungan") ? transformSensorParams(sensorConfig, activeSensorAspect) : null,
        scheduleSettings: configMode === "schedule" ? scheduleConfig : null,
        sensorData: selectedCategory === "sensor" ? generateMockSensorData(selectedDeviceType) : null
      };

      const endpoint = isEditingDevice
        ? `/api/kendaliperangkat/configure/${isEditingDevice}`
        : '/api/kendaliperangkat';
      const method = isEditingDevice ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deviceData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Gagal menyimpan perangkat");
      }

      const savedDevice = {
        ...data.device,
        id: data.device._id,
        status: "OFF",
        installedDate: data.device.createdAt,
        sensorParams: data.device.thresholds // MEMETAKAN PARAMETER!
      };

      // Update local state
      const updatedHubs = currentBieon.hubs.map((hub) => {
        if (hub.id === selectedHub.id) {
          // Jika edit, hapus yang lama lalu masukkan yang baru. Jika baru, langsung push.
          const filteredDevices = isEditingDevice
            ? hub.devices.filter(d => d.id !== isEditingDevice)
            : hub.devices;
          return { ...hub, devices: [...filteredDevices, savedDevice] };
        }
        return hub;
      });

      const updatedBieon = { ...currentBieon, hubs: updatedHubs };
      setBieonSystems(bieonSystems.map((b) => b.id === currentBieon.id ? updatedBieon : b));
      setCurrentBieon(updatedBieon);

      resetForm();
      setIsEditingDevice(null);
      setStep("view-bieon");
      alert(isEditingDevice ? "Perangkat berhasil diperbarui!" : "Konfigurasi perangkat berhasil disimpan!");
    } catch (error) {
      alert("Gagal simpan: " + error.message);
    }
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
  const deleteDevice = async (deviceId) => {
    if (!confirm("Yakin ingin menghapus device ini?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/kendaliperangkat/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Gagal menghapus perangkat");

      // Update local state
      const updatedSystems = bieonSystems.map((system) => ({
        ...system,
        hubs: system.hubs.map((hub) => ({
          ...hub,
          devices: hub.devices.filter((device) => device.id !== deviceId)
        }))
      }));
      setBieonSystems(updatedSystems);
      if (currentBieon) {
        const matching = updatedSystems.find((s) => s.id === currentBieon.id);
        setCurrentBieon(matching || null);
      }
      alert("Perangkat berhasil dihapus dari database!");
    } catch (error) {
      alert("Error: " + error.message);
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
    // Normalisasi kategori dari backend ("Sensor" / "Control Actuator System") kembali ke format state frontend ("sensor" / "smart-plug")
    const isSensorMode = (device.category || "").toLowerCase() === "sensor";
    const mappedCategory = isSensorMode ? "sensor" : "smart-plug";

    setSelectedCategory(mappedCategory);

    // Perbaikan: backend mengirim data tipe di field 'type', bukan 'deviceType'
    const actualDeviceType = device.type || device.deviceType;
    setSelectedDeviceType(actualDeviceType);

    // Find and set hub
    const hub = currentBieon.hubs.find(h => h.id === device.hubId);
    setSelectedHub(hub);

    // Populate Config
    if (isSensorMode || device.controlMethod === "sensor" || device.controlMethod === "Lingkungan") {
      setConfigMode("sensor");

      // Khusus sensor saat edit, tentukan aspeknya secara otomatis berdasarkan tipenya!
      if (isSensorMode) {
        if (actualDeviceType === "Sensor Kualitas Air" || actualDeviceType === "Kualitas Air") setActiveSensorAspect("kualitasAir");
        else if (actualDeviceType === "Sensor Kenyamanan" || actualDeviceType === "Humidity Sensor" || actualDeviceType === "Kenyamanan") setActiveSensorAspect("kenyamanan");
        else if (actualDeviceType === "Sensor Keamanan" || actualDeviceType === "Motion Sensor" || actualDeviceType === "Keamanan") setActiveSensorAspect("keamanan");
        else if (actualDeviceType === "Door Sensor") setActiveSensorAspect("keamananPintu");
      }
      // Untuk Actuator di mode sensor, buka aspek yang sedang aktif tapi tetap izinkan ganti aspek
      else if ((device.controlMethod === "sensor" || device.controlMethod === "Lingkungan") && device.sensorParams) {
        const p = device.sensorParams;
        if (p.temperature !== undefined || p.humidity !== undefined) setActiveSensorAspect("kenyamanan");
        else if (p.isMotionEnabled === true) setActiveSensorAspect("keamanan");
        else if (p.isDoorEnabled === true) setActiveSensorAspect("keamananPintu");
        else if (p.ph !== undefined || p.turbidity !== undefined || p.tds !== undefined) setActiveSensorAspect("kualitasAir");
      }

      if (device.sensorParams) {
        // Harus map balik dari data primitif backend ke object frontend { enabled, value }
        const p = device.sensorParams;
        const mappedConfig = { ...sensorConfig };

        if (p.temperature !== undefined) mappedConfig.temperature = { enabled: true, value: p.temperature, type: 'higher' };
        if (p.humidity !== undefined) mappedConfig.humidity = { enabled: true, value: p.humidity, type: 'higher' };
        if (p.ph !== undefined) mappedConfig.ph = { enabled: true, value: p.ph };
        if (p.turbidity !== undefined) mappedConfig.turbidity = { enabled: true, value: p.turbidity };
        if (p.tds !== undefined) mappedConfig.tds = { enabled: true, value: p.tds };
        // Untuk parameter boolean
        if (p.isMotionEnabled === true) mappedConfig.motion = { enabled: true, status: 'detected' };
        if (p.isDoorEnabled === true) mappedConfig.door = { enabled: true, status: 'opened' };

        setSensorConfig(mappedConfig);
      }
    } else {
      setConfigMode(device.controlMethod || "manual");
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 ">Memuat data sistem BIEON...</p>
          </div>
        ) : (
          <>
            {/* Banner Status Konfigurasi untuk Tampilan Homeowner - Berbasis Real-time API */}
            {isTechnicianActiveInSystem && userProfile?.role === 'Homeowner' && !isTechnicianMode && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 shadow-sm flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="p-2 bg-orange-100 rounded-xl shrink-0 mt-0.5">
                  <Activity className="w-5 h-5 text-orange-600 animate-pulse" />
                </div>
                <div>
                  <h3 className=" text-orange-800 text-sm sm:text-base mb-1">Sedang Dikonfigurasi Teknisi</h3>
                  <p className="text-orange-700 text-xs sm:text-sm leading-relaxed">
                    Sistem Anda saat ini sedang dalam proses penambahan/pengaturan perangkat oleh teknisi. Beberapa fungsi kendali mungkin dibatasi atau tidak merespons sampai sesi teknisi berakhir.
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
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl  hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                      <span>← Kembali ke Semua BIEON</span>
                    </button>
                  )}
                  {userProfile?.role === 'Homeowner' && (
                    <button
                      onClick={handleGenerateToken}
                      className="px-5 py-2.5 bg-white border-2 border-emerald-100 text-emerald-600 rounded-2xl  hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-2"
                    >
                      <Radio className="w-5 h-5" />
                      <span>Akses Teknisi</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            { /* ==================== STEP: IDLE (Dashboard) ==================== */}
            {step === "idle" && (
              <div>
                {bieonSystems.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Home className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl  text-gray-900 mb-3">Belum Ada Sistem BIEON</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Mulai dengan menambahkan sistem BIEON Anda untuk mengelola smart devices
                    </p>
                    {!isTechnicianMode && (
                      <button
                        onClick={() => setStep("input-id")}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl  shadow-lg hover:shadow-xl transition-all"
                      >
                        <Plus className="w-5 h-5 inline mr-2" />
                        Tambah BIEON Pertama
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    { /* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Home className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">BIEON Systems</p>
                            <p className="text-2xl  text-gray-900">{bieonSystems.length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <Wifi className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Hubs</p>
                            <p className="text-2xl  text-gray-900">{bieonSystems.reduce((sum, b) => sum + b.totalHubs, 0)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Settings className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Devices</p>
                            <p className="text-2xl  text-gray-900">{getAllDevices().length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Active Devices</p>
                            <p className="text-2xl  text-gray-900">{getAllDevices().filter((d) => d.status === "ON").length}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    { /* BIEON Systems List */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl  text-gray-900">Sistem BIEON Terdaftar</h2>
                        {!isTechnicianMode && (
                          <button
                            onClick={() => setStep("input-id")}
                            className="flex items-center gap-2 px-4 py-2 bg-[#009b7c] text-white rounded-lg  hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                            Tambah BIEON
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {bieonSystems.map((bieon) => (
                          <div
                            key={bieon.id}
                            className="border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => {
                              setCurrentBieon(bieon);
                              setStep("view-bieon");
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                  <Home className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg  text-gray-900">{bieon.name}</h3>
                                  <p className="text-sm text-gray-600">ID: {bieon.bieonId}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm text-gray-500">{bieon.totalHubs} Hubs</span>
                                    <span className="text-sm text-gray-500">•</span>
                                    <span className="text-sm text-gray-500">{bieon.hubs.flatMap((h) => h.devices).length} Devices</span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            { /* ==================== MODAL: INPUT BIEON ID ==================== */}
            {step === "input-id" && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl  text-gray-900">Tambah BIEON</h2>
                      <p className="text-sm text-gray-600 mt-1">Masukkan ID BIEON Anda</p>
                    </div>
                    <button
                      onClick={() => {
                        setStep("idle");
                        setBieonIdInput("");
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm  text-gray-700 mb-2">
                        ID BIEON <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bieonIdInput}
                        onChange={(e) => setBieonIdInput(e.target.value)}
                        placeholder="Contoh: BIEON-001"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Demo: Coba BIEON-001, BIEON-002, BIEON-003, atau BIEON-004
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setStep("idle");
                          setBieonIdInput("");
                        }}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl  hover:bg-gray-50 transition-all"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSubmitBieonId}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl  shadow-lg hover:shadow-xl transition-all"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            { /* ==================== STEP: VIEW BIEON INFO ==================== */}
            {step === "view-bieon" && currentBieon && (
              <div>
                { /* BIEON Info Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 sm:mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{currentBieon.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">ID: {currentBieon.bieonId}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-gray-700">{currentBieon.totalHubs} Hub Nodes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-700">{currentBieon.hubs.flatMap((h) => h.devices).length} Devices</span>
                        </div>
                      </div>
                    </div>
                    {!isTechnicianMode && (
                      <button
                        onClick={handleAddHub}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all self-start"
                      >
                        <Plus className="w-4 h-4" />
                        Add Hub
                      </button>
                    )}
                  </div>
                  { /* Hub Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {currentBieon.hubs.map((hub) => (
                      <div
                        key={hub.id}
                        className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all text-left flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                              <Wifi className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{hub.name}</h3>
                              <p className="text-xs text-gray-600 font-medium">{hub.id}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 font-semibold">Devices:</span>
                              <span className="font-bold text-gray-900">{hub.devices.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 font-semibold">Status:</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${hub.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                                {hub.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectHub(hub)}
                          className="mt-6 w-full py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 shadow-sm"
                        >
                          <Plus className="w-4 h-4" /> Add Device
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                { /* Room Filter & Device List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">Filter per Ruangan</h3>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button
                      onClick={() => setSelectedRoom("all")}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedRoom === "all" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      Semua Ruangan
                    </button>
                    {rooms.map((room) => {
                      const deviceCount = getFilteredDevices().filter((d) => d.location === room).length;
                      return (
                        <button
                          key={room}
                          onClick={() => setSelectedRoom(room)}
                          className={`px-4 py-2 rounded-lg  transition-all ${selectedRoom === room ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                          {room} ({deviceCount})
                        </button>
                      );
                    })}
                  </div>
                </div>
                { /* Device List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Kendali Perangkat</h2>
                    <p className="text-sm text-gray-500 mt-1 font-medium">CRUD, kontrol manual, status, dan detail perangkat</p>
                  </div>
                  {/* --- WIDGET RINGKASAN DATA REAL-TIME --- */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {getAllDevices()
                      .filter(d => d.category?.toLowerCase() === "sensor" && d.currentValues?.temperature !== undefined)
                      .slice(0, 3) // Ambil maksimal 3 sensor suhu saja
                      .map((sensor) => (
                        <div key={sensor.id} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">{sensor.name}</p>
                            <p className="text-xl font-black text-gray-900">{sensor.currentValues.temperature}°C</p>
                          </div>
                          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Thermometer className="w-5 h-5 text-orange-500" />
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  {getFilteredDevices().length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">Belum ada device di ruangan ini</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredDevices().map((device) => (
                        <div
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
                                  <span className="text-xs sm:text-sm font-semibold text-gray-600">{device.deviceType} • {device.location}</span>
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

                              {/* NEW: HASIL MONITORING REAL-TIME SECTION */}
                              {(device.category?.toLowerCase() === 'sensor' || device.type?.toLowerCase() === 'sensor') && (
                                <div className="mb-8">
                                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Hasil Monitoring Real-time</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {/* Temperature Card */}
                                    <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Thermometer className="w-4 h-4 text-orange-500" />
                                        <span className="text-xs font-bold text-gray-500">Suhu Sekarang</span>
                                      </div>
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-gray-900">
                                          {device.currentValues?.temperature?.toFixed(1) || '--.-'}
                                        </span>
                                        <span className="text-sm font-bold text-gray-400">°C</span>
                                      </div>
                                    </div>

                                    {/* Humidity Card */}
                                    <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Droplets className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs font-bold text-gray-500">Kelembapan</span>
                                      </div>
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-gray-900">
                                          {device.currentValues?.humidity?.toFixed(1) || '--.-'}
                                        </span>
                                        <span className="text-sm font-bold text-gray-400">%</span>
                                      </div>
                                    </div>

                                    {/* Battery/Signal (Optional) */}
                                    <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-2xl border border-emerald-100 shadow-sm col-span-2 sm:col-span-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-bold text-gray-500">Baterai Alat</span>
                                      </div>
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-gray-900">
                                          {device.battery || '--'}
                                        </span>
                                        <span className="text-sm font-bold text-gray-400">%</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Configuration Context Section - Hidden for Technicians or if no mode */}
                              {!isTechnicianMode && device.controlMethod && (
                                <div className="mb-6">
                                  <div className="flex items-center gap-3 mb-4">
                                    <p className="text-sm  text-gray-700 flex items-center gap-2">
                                      Mode: <span className={`${(device.category === "sensor" || device.controlMethod === "Lingkungan" || device.controlMethod === "sensor") ? "text-emerald-600 bg-emerald-50" : (device.controlMethod === "Manual" || device.controlMethod === "manual" ? "text-blue-600 bg-blue-50" : (device.controlMethod ? "text-purple-600 bg-purple-50" : "text-gray-500 bg-gray-100"))}  px-2 py-0.5 rounded capitalize`}>
                                        {device.controlMethod === "Manual" || device.controlMethod === "manual" ? "Mode Manual" : (device.controlMethod ? ((device.category === "sensor" || device.controlMethod === "Lingkungan" || device.controlMethod === "sensor") ? "Parameter Sensor" : "Jadwal Otomatis") : "-")}
                                      </span>
                                    </p>
                                  </div>

                                  {/* Detailed Configuration Summary */}
                                  {(device.controlMethod !== "Manual" && device.controlMethod !== "manual") && (
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap gap-3">
                                      {device.category === "sensor" || device.controlMethod === "Lingkungan" || device.controlMethod === "sensor" ? (
                                        <>
                                          {device.sensorParams && Object.keys(device.sensorParams).length > 0 ? (
                                            Object.entries(device.sensorParams)
                                              .filter(([k, v]) => {
                                                // Jangan tampilkan jika nilainya kosong/null
                                                if (v === null || v === undefined) return false;
                                                // Jangan tampilkan boolean false untuk sensor gerak/pintu
                                                if ((k === "isMotionEnabled" || k === "isDoorEnabled") && v === false) return false;
                                                // Jangan panggil key default mongoose
                                                if (k === "_id") return false;
                                                return true;
                                              })
                                              .map(([key, val], idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                  {(key === "temperature" || key === "waterTemp") && <Thermometer className="w-4 h-4 text-orange-500" />}
                                                  {key === "humidity" && <Droplets className="w-4 h-4 text-blue-500" />}
                                                  {key === "isMotionEnabled" && <Eye className="w-4 h-4 text-purple-600" />}
                                                  {key === "isDoorEnabled" && <Lock className="w-4 h-4 text-red-600" />}
                                                  {["ph", "turbidity", "tds"].includes(key) && <Waves className="w-4 h-4 text-cyan-600" />}
                                                  <span className="text-xs  text-gray-700">
                                                    {key === "temperature" ? "Suhu" :
                                                      key === "humidity" ? "Lembap" :
                                                        key === "isMotionEnabled" ? "Gerakan" :
                                                          key === "isDoorEnabled" ? "Buka Pintu" :
                                                            key === "ph" ? "pH" :
                                                              key === "turbidity" ? "Kekeruhan" :
                                                                key === "tds" ? "TDS" : "Suhu Air"}:
                                                    {val !== undefined ? ` > ${val}${key === "temperature" || key === "waterTemp" ? "°C" : key === "humidity" ? "%" : ""}` : " (Aktif)"}
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
                                                  <span className="text-xs  text-gray-700">
                                                    Jam {sched.startTime} - {sched.endTime} ({sched.action})
                                                  </span>
                                                </div>
                                                <div className="flex gap-1">
                                                  {sched.days.map((day, dIdx) => (
                                                    <span key={dIdx} className="text-[9px] bg-purple-50 text-purple-600 px-1 rounded ">{day}</span>
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

                              {/* Quick Controls Section - Hidden for Technicians (TIDAK BISA EDIT) */}
                              {!isTechnicianMode && (
                                <div className="mb-6">
                                  <p className="text-xs  text-gray-400 uppercase tracking-wider mb-3">
                                    {device.category === "sensor" ? "Status Monitoring" :
                                      (device.controlMethod === "Lingkungan" ? "Kontrol Lingkungan" :
                                        (device.controlMethod === "Jadwal" ? "Kontrol Jadwal" : "Kontrol Manual"))}
                                  </p>
                                  <div className="flex flex-wrap gap-4 p-3 bg-blue-50/50 rounded-xl border border-blue-50/50">
                                    {device.category !== "sensor" && (
                                      <button
                                        onClick={() => toggleDevicePower(device.id)}
                                        className={`flex-1 min-w-[200px] py-2.5 rounded-lg  transition-all flex items-center justify-center gap-2 ${device.status === "ON" ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-white border border-gray-200 text-gray-700 shadow-sm hover:shadow"}`}
                                      >
                                        <Power className="w-4 h-4 text-gray-500" /> Turn {device.status === "ON" ? "OFF" : "ON"}
                                      </button>
                                    )}

                                    {/* Device-specific controls horizontally laid out */}
                                    {device.deviceType === "AC" && device.status === "ON" && (
                                      <div className="flex-1 min-w-[250px] flex items-center gap-3 bg-white border border-blue-100 rounded-lg px-4 py-2">
                                        <Thermometer className="w-5 h-5 text-blue-500" />
                                        <span className="text-sm  text-gray-600">Suhu:</span>
                                        <input
                                          type="number"
                                          value={device.controls?.temperature || 24}
                                          onChange={(e) => updateDeviceControl(device.id, "temperature", parseFloat(e.target.value))}
                                          className="w-16 px-2 py-1 border border-gray-200 rounded-md text-sm  text-center focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300"
                                        />
                                        <span className="text-sm text-gray-500 ">°C</span>
                                      </div>
                                    )}
                                    {device.deviceType === "TV" && device.status === "ON" && (
                                      <div className="flex-1 min-w-[250px] flex items-center gap-3 bg-white border border-purple-100 rounded-lg px-4 py-2">
                                        <Volume2 className="w-5 h-5 text-purple-500" />
                                        <span className="text-sm  text-gray-600">Volume:</span>
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          value={device.controls?.volume || 50}
                                          onChange={(e) => updateDeviceControl(device.id, "volume", parseFloat(e.target.value))}
                                          className="flex-1 accent-purple-600"
                                        />
                                        <span className="text-sm  text-gray-700 w-10">{device.controls?.volume || 50}</span>
                                      </div>
                                    )}
                                    {(device.deviceType === "Light" || device.deviceType === "Fan") && device.status === "ON" && (
                                      <div className="flex-1 min-w-[250px] flex items-center gap-3 bg-white border border-yellow-100 rounded-lg px-4 py-2">
                                        <Sun className="w-5 h-5 text-yellow-500" />
                                        <span className="text-sm  text-gray-600">Brightness:</span>
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          value={device.controls?.brightness || 100}
                                          onChange={(e) => updateDeviceControl(device.id, "brightness", parseFloat(e.target.value))}
                                          className="flex-1 accent-yellow-500"
                                        />
                                        <span className="text-sm  text-gray-700 w-12">{device.controls?.brightness || 100}%</span>
                                      </div>
                                    )}
                                    {device.category === "sensor" && !isTechnicianMode && (
                                      <div className="flex-1 min-w-[250px] flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2">
                                        <button onClick={() => toggleDevicePower(device.id)} className="w-full text-sm  text-gray-700 flex items-center justify-center gap-2">
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
                                        <span className="text-sm  tracking-tight whitespace-nowrap">
                                          STATUS: {isAbnormal ? statusTextAbnormal : statusTextNormal}
                                        </span>
                                      </div>
                                    );
                                  })()}

                                  {/* Minimal Separator */}
                                  <div className="w-px h-8 bg-gray-200 hidden sm:block mx-1"></div>

                                  {/* Parameter Chips */}
                                  {device.sensorData.temperature !== undefined && device.sensorParams?.temperature?.enabled && (
                                    <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.sensorData.temperature) > parseFloat(device.sensorParams.temperature.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                      <Thermometer className="w-4 h-4" />
                                      <span className="text-sm">Suhu: {device.sensorData.temperature}°C</span>
                                    </div>
                                  )}
                                  {device.sensorData.humidity !== undefined && device.sensorParams?.humidity?.enabled && (
                                    <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.sensorData.humidity) > parseFloat(device.sensorParams.humidity.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                      <Droplets className="w-4 h-4" />
                                      <span className="text-sm">Lembap: {device.sensorData.humidity}%</span>
                                    </div>
                                  )}
                                  {device.sensorData.ph !== undefined && device.sensorParams?.ph?.enabled && (
                                    <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.sensorData.ph) > parseFloat(device.sensorParams.ph.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                      <Beaker className="w-4 h-4" />
                                      <span className="text-sm">pH: {device.sensorData.ph}</span>
                                    </div>
                                  )}
                                  {device.sensorData.turbidity !== undefined && device.sensorParams?.turbidity?.enabled && (
                                    <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.sensorData.turbidity) > parseFloat(device.sensorParams.turbidity.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                      <Droplets className="w-4 h-4 text-yellow-600" />
                                      <span className="text-sm">NTU: {device.sensorData.turbidity}</span>
                                    </div>
                                  )}
                                  {device.sensorData.tds !== undefined && device.sensorParams?.tds?.enabled && (
                                    <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.sensorData.tds) > parseFloat(device.sensorParams.tds.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                      <Wind className="w-4 h-4 text-teal-600" />
                                      <span className="text-sm">TDS: {device.sensorData.tds} ppm</span>
                                    </div>
                                  )}
                                  {device.sensorData.waterTemp !== undefined && device.sensorParams?.waterTemp?.enabled && (
                                    <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.sensorData.waterTemp) > parseFloat(device.sensorParams.waterTemp.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                      <Thermometer className="w-4 h-4" />
                                      <span className="text-sm">Suhu Air: {device.sensorData.waterTemp}°C</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Details Grid */}
                              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
                                <div>
                                  <p className="text-xs  text-gray-500 mb-1">Kategori</p>
                                  <p className="text-sm text-gray-900  capitalize">{device.category}</p>
                                </div>
                                <div>
                                  <p className="text-xs  text-gray-500 mb-1">Hub Node</p>
                                  <p className="text-sm text-gray-900 ">{currentBieon.hubs.find((h) => h.id === device.hubId)?.name}</p>
                                </div>
                                <div>
                                  <p className="text-xs  text-gray-500 mb-1">Installed</p>
                                  <p className="text-sm text-gray-900 ">{new Date(device.installedDate).toLocaleDateString("id-ID")}</p>
                                </div>
                                <div>
                                  <p className="text-xs  text-gray-500 mb-1">Last Activity</p>
                                  <p className="text-sm text-gray-900 ">{new Date(device.lastActivity).toLocaleString("id-ID", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-xs  text-gray-500 mb-1">Catatan</p>
                                  <p className="text-sm text-gray-900 ">{device.notes || "-"}</p>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col sm:flex-row gap-3">
                                {!isTechnicianMode && (
                                  <button
                                    onClick={() => deleteDevice(device.id)}
                                    className="sm:w-auto px-6 sm:px-10 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg  hover:bg-gray-50 transition-colors"
                                  >
                                    Hapus
                                  </button>
                                )}
                                {!isTechnicianMode && (
                                  <button
                                    onClick={() => handleEditDevice(device)}
                                    className="flex-1 px-6 py-2.5 bg-emerald-600 text-white rounded-lg  hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                  >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                  </button>
                                )}
                                {isTechnicianMode && (
                                  <div className="w-full p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                                    <ShieldAlert className="w-5 h-5 text-emerald-600" />
                                    <p className="text-xs  text-emerald-800">Mode Akses Terbatas: Anda hanya diperbolehkan melihat status perangkat.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            { /* ==================== MODAL: ADD DEVICE CHOICE (NEW) ==================== */}
            {step === "add-device-choice" && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
                  <div className="flex justify-end">
                    <button onClick={() => setStep("view-bieon")} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                  <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Cpu className="w-10 h-10 text-[#009b7c]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Tambah Perangkat</h2>
                  <p className="text-sm text-gray-600 mb-8">Apa yang ingin Anda lakukan untuk Hub {selectedHub?.name}?</p>

                  <div className="grid gap-4">
                    <button
                      onClick={() => setStep("register-product")}
                      className="group p-6 bg-white border-2 border-gray-100 rounded-3xl hover:border-[#009b7c] hover:shadow-xl transition-all text-left"
                    >
                      <h4 className="font-normal text-gray-900 group-hover:text-[#009b7c]">Registrasi Perangkat Baru</h4>
                      <p className="text-xs text-gray-500">Daftarkan ID & Nama Produk dari stiker fisik alat.</p>
                    </button>

                    <button
                      onClick={async () => {
                        await fetchRegisteredProducts();
                        setStep("select-category");
                      }}
                      className="group p-6 bg-white border-2 border-gray-100 rounded-3xl hover:border-blue-500 hover:shadow-xl transition-all text-left"
                    >
                      <h4 className="font-normal text-gray-900 group-hover:text-blue-500">Tambahkan Perangkat (Pairing)</h4>
                      <p className="text-xs text-gray-500">Lanjut ke pemilihan kategori dan scan QR Code.</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* ==================== MODAL: REGISTER PRODUCT (NEW STEP) ==================== */}
            {step === "register-product" && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 sm:p-10 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Registrasi Device</h2>
                    <button onClick={() => setStep("select-category")} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-8">Masukkan ID dan Nama Produk yang tertera pada stiker fisik perangkat.</p>
                  <form onSubmit={handleRegisterProduct} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">ID Produk (Stiker)</label>
                      <input
                        required
                        type="text"
                        value={productRegForm.id}
                        onChange={(e) => setProductRegForm({ ...productRegForm, id: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#009b7c] outline-none font-bold"
                        placeholder="Contoh: 54304000..."
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Pilih Jenis</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setProductRegForm({ ...productRegForm, category: 'sensor' })}
                          className={`p-4 rounded-2xl border-2 transition-all text-base font-bold flex items-center justify-center gap-2 ${productRegForm.category === 'sensor' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-md shadow-emerald-50' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                        >
                          <Activity className="w-5 h-5" />
                          Sensor
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductRegForm({ ...productRegForm, category: 'control' })}
                          className={`p-4 rounded-2xl border-2 transition-all text-base font-bold flex items-center justify-center gap-2 ${productRegForm.category === 'control' ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-md shadow-blue-50' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                        >
                          <Cpu className="w-5 h-5" />
                          Control
                        </button>
                      </div>
                    </div>

                    {productRegForm.category === 'control' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Kategori Smart Device</label>
                        <select
                          value={productRegForm.controlCategory}
                          onChange={(e) => setProductRegForm({ ...productRegForm, controlCategory: e.target.value })}
                          className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-gray-700"
                        >
                          <option value="smart-switch">Smart Switch</option>
                          <option value="smart-plug">Smart Plug</option>
                          <option value="remote">Remote</option>
                        </select>
                      </div>
                    )}

                    {productRegForm.category === 'sensor' && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Pilih Aspek Sensor</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['kenyamanan', 'air', 'keamanan'].map((asp) => (
                            <button
                              key={asp}
                              type="button"
                              onClick={() => setProductRegForm({ ...productRegForm, aspect: asp })}
                              className={`py-4 px-2 rounded-xl border-2 transition-all text-sm font-bold tracking-tighter text-center ${productRegForm.aspect === asp
                                ? asp === 'kenyamanan'
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm shadow-emerald-50'
                                  : asp === 'air'
                                    ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm shadow-blue-50'
                                    : 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm shadow-orange-50'
                                : 'bg-gray-50 border-gray-100 text-gray-400'
                                }`}
                            >
                              {asp === 'air' ? 'Kualitas Air' : asp.charAt(0).toUpperCase() + asp.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nama Produk</label>
                      <input
                        required
                        type="text"
                        value={productRegForm.name}
                        onChange={(e) => setProductRegForm({ ...productRegForm, name: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#009b7c] outline-none font-bold"
                        placeholder="Contoh: SNZB-02D"
                      />
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-[#009b7c] text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4">
                      Registrasi & Lanjut
                    </button>
                  </form>
                </div>
              </div>
            )}
            {/* ==================== MODAL: SELECT CATEGORY ==================== */}
            {step === "select-category" && (
              <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full p-6 sm:p-10 my-4 sm:my-0">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Kategori Smart Device</h2>
                      <p className="text-sm text-gray-500 mt-1">Pilih perangkat yang sudah Anda registrasikan sebelumnya.</p>
                    </div>
                    <button
                      onClick={() => {
                        setStep("view-bieon");
                        setSelectedHub(null);
                      }}
                      className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
                    >
                      <X className="w-8 h-8 text-gray-400" />
                    </button>
                  </div>

                  <div
                    className="bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-3xl p-3 mb-6 flex items-center justify-between group hover:border-[#009b7c] hover:bg-emerald-50 transition-all cursor-pointer shadow-sm shadow-emerald-50"
                    onClick={() => setShowScanner(true)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#009b7c] rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
                        <QrCode className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Scan QR Perangkat</h3>
                        <p className="text-xs text-gray-600">Scan untuk validasi ID perangkat yang sudah terdaftar.</p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-[#009b7c] group-hover:text-white transition-all text-[#009b7c] bg-white shadow-sm border border-emerald-100">
                      <ChevronRight className="w-7 h-7" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Kolom Sensor */}
                    <div className="bg-[#f0fdf4] border-2 border-[#bbf7d0] rounded-[2rem] p-5">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Sensor</h3>
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Monitoring System</p>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                        {registeredProducts.filter(p => p.category === 'sensor').length > 0 ? (
                          registeredProducts.filter(p => p.category === 'sensor').map((product) => (
                            <div key={product.productId} className="space-y-1.5">
                              {/* Label Aspek Spesifik */}
                              <span className={`text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded-md border ${product.aspect === 'kenyamanan' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                                product.aspect === 'air' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                                  'text-orange-600 border-orange-200 bg-orange-50'
                                }`}>
                                Sensor {product.aspect || 'Umum'}
                              </span>

                              <button
                                onClick={() => {
                                  setSelectedCategory("sensor");
                                  setSelectedProduct(product);
                                  setSelectedDeviceType(product.productName); // Selalu set sebagai fallback

                                  // Mapping aspek untuk konfigurasi
                                  if (product.aspect === 'air') {
                                    setSelectedDeviceType("Sensor Kualitas Air");
                                    setActiveSensorAspect("kualitasAir");
                                  } else if (product.aspect === 'kenyamanan') {
                                    setSelectedDeviceType("Sensor Kenyamanan");
                                    setActiveSensorAspect("kenyamanan");
                                  } else if (product.aspect === 'keamanan') {
                                    setSelectedDeviceType("Sensor Keamanan");
                                    setActiveSensorAspect("keamanan");
                                  } else {
                                    setActiveSensorAspect(null);
                                  }

                                  setDeviceForm({ name: product.productName, location: "", notes: "" });
                                  setStep("add-device-form");
                                }}
                                className={`w-full p-3 bg-white border-2 rounded-2xl flex items-center justify-between group transition-all shadow-sm ${product.aspect === 'kenyamanan' ? 'hover:border-emerald-500' :
                                  product.aspect === 'air' ? 'hover:border-blue-500' :
                                    'hover:border-orange-500'
                                  }`}
                              >
                                <div className="flex flex-col items-start text-left">
                                  <span className="font-bold text-gray-900 text-sm">{product.productName}</span>
                                  <span className="text-[9px] text-gray-400 font-bold">ID: {product.productId}</span>
                                </div>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${product.aspect === 'kenyamanan' ? 'text-emerald-500 bg-emerald-50 group-hover:bg-emerald-500 group-hover:text-white' :
                                  product.aspect === 'air' ? 'text-blue-500 bg-blue-50 group-hover:bg-blue-500 group-hover:text-white' :
                                    'text-orange-500 bg-orange-50 group-hover:bg-orange-500 group-hover:text-white'
                                  }`}>
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                            <p className="text-xs  text-gray-400">Belum ada sensor terdaftar</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Kolom Control */}
                    <div className="bg-[#eff6ff] border-2 border-[#bfdbfe] rounded-[2rem] p-5">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                          <Cpu className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Control</h3>
                          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Actuator System</p>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                        {registeredProducts.filter(p => p.category === 'control').length > 0 ? (
                          registeredProducts.filter(p => p.category === 'control').map((product) => (
                            <button
                              key={product.productId}
                              onClick={() => {
                                setSelectedCategory("control");
                                setSelectedDeviceType(product.productName);
                                // Control tidak pakai aspect di tahap awal
                                setActiveSensorAspect(null);
                                setDeviceForm({ name: product.productName, location: "", notes: "" });
                                setStep("add-device-form");
                              }}
                              className="w-full p-5 bg-white hover:bg-blue-600 hover:text-white border border-blue-100 rounded-2xl flex items-center justify-between group transition-all shadow-sm"
                            >
                              <span className="font-bold">{product.productName}</span>
                              <span className="text-[10px] px-3 py-1 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-white/20 group-hover:text-white font-black">ID: {product.productId.slice(-4)}</span>
                            </button>
                          ))
                        ) : (
                          <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                            <p className="text-xs  text-gray-400">Belum ada control terdaftar</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === "select-device-type" && (
              <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 mt-12 mb-20">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl  text-gray-900">Pilih Tipe Device</h2>
                      <p className="text-sm text-gray-600 mt-1">Kategori: <span className="capitalize ">{selectedCategory}</span></p>
                    </div>
                    <button
                      onClick={() => setStep("select-category")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {(CATEGORY_DEVICES[selectedCategory] || []).map((deviceType) => (
                      <button
                        key={deviceType}
                        onClick={() => {
                          setSelectedDeviceType(deviceType);
                          setDeviceForm({ name: deviceType, location: "", notes: "" });
                          setStep("add-device-form");
                        }}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all text-left flex items-center justify-between group"
                      >
                        <span className=" text-gray-900">{deviceType}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === "add-device-form" && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-8 sm:p-10 my-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 leading-tight">{isEditingDevice ? "Edit Informasi" : "Informasi Perangkat"}</h2>
                      <p className="text-sm text-gray-500 mt-1">Lengkapi detail untuk: <span className="font-bold text-[#009b7c]">{selectedDeviceType}</span></p>
                    </div>
                    <button
                      onClick={() => setStep("select-category")}
                      className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
                    >
                      <X className="w-8 h-8 text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {isEditingDevice && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Pilih Jenis</label>
                          <select
                            value={selectedCategory === "sensor" ? "sensor" : "control"}
                            disabled
                            className="w-full p-4 bg-gray-100 border-2 border-gray-100 rounded-2xl outline-none font-bold text-gray-500 cursor-not-allowed"
                          >
                            <option value="sensor">Sensor</option>
                            <option value="control">Control</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tipe / Spesifik</label>
                          <select
                            value={selectedDeviceType}
                            onChange={(e) => setSelectedDeviceType(e.target.value)}
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#009b7c] outline-none font-bold text-gray-700"
                          >
                            {selectedCategory === "sensor" ? (
                              <>
                                <option value="Sensor Kenyamanan">Sensor Kenyamanan</option>
                                <option value="Sensor Kualitas Air">Sensor Kualitas Air</option>
                                <option value="Sensor Keamanan">Sensor Keamanan</option>
                              </>
                            ) : (
                              <>
                                <option value="smart-switch">Smart Switch</option>
                                <option value="smart-plug">Smart Plug</option>
                                <option value="remote">Remote</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                    )}

                    {isEditingDevice && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Device ID</label>
                          <input
                            type="text"
                            value={deviceForm.customId !== undefined ? deviceForm.customId : isEditingDevice}
                            onChange={(e) => setDeviceForm({ ...deviceForm, customId: e.target.value })}
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#009b7c] outline-none text-gray-700 font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Hub Node</label>
                          <select
                            value={selectedHub?.id || ""}
                            onChange={(e) => {
                              const hub = currentBieon.hubs.find(h => h.id === e.target.value);
                              setSelectedHub(hub);
                            }}
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#009b7c] outline-none font-bold text-gray-700"
                          >
                            {currentBieon?.hubs.map((h) => (
                              <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nama Perangkat</label>
                      <input
                        type="text"
                        value={deviceForm.name}
                        onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                        placeholder="Contoh: AC Ruang Tamu"
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#009b7c] outline-none "
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Lokasi (Ruangan)</label>
                      {!showNewRoomInput ? (
                        <div className="relative">
                          <select
                            value={deviceForm.location}
                            onChange={(e) => e.target.value === "__new__" ? setShowNewRoomInput(true) : setDeviceForm({ ...deviceForm, location: e.target.value })}
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#009b7c] outline-none  appearance-none"
                          >
                            <option value="">-- Pilih Ruangan --</option>
                            {rooms.map((room) => <option key={room} value={room}>{room}</option>)}
                            <option value="__new__">+ Buat Ruangan Baru</option>
                          </select>
                          <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newRoomInput}
                            onChange={(e) => setNewRoomInput(e.target.value)}
                            placeholder="Nama Ruangan..."
                            className="flex-1 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#009b7c] outline-none "
                          />
                          <button onClick={handleAddRoom} className="p-4 bg-[#009b7c] text-white rounded-2xl  shadow-lg"><Check className="w-6 h-6" /></button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={handleSubmitDeviceForm}
                        className="flex-1 py-4 bg-[#009b7c] text-white rounded-2xl font-bold shadow-xl shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {selectedCategory === "sensor" ? "Lanjut ke Parameter" : "Lanjut ke Mode Otomatis"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* ==================== MODAL: CONFIGURE (ACTUATORS ONLY) ==================== */}
            {step === "configure" && (
              <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 mt-8 sm:mt-12 mb-20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCategory === "sensor" ? "Konfigurasi Parameter" : "Pilih Metode Pengaturan"}</h2>
                      <p className="text-sm text-gray-600">{selectedCategory === "sensor" ? "Tentukan batas/nilai referensi untuk sensor ini" : "Parameter lingkungan atau jadwal otomatis"}</p>
                    </div>
                    <button
                      onClick={() => setStep("add-device-form")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                  {selectedCategory !== "sensor" && (
                    <div className="grid grid-cols-2 gap-4 mb-6"><button
                      onClick={() => setConfigMode("sensor")}
                      className={`p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center justify-center sm:justify-start gap-4 ${configMode === "sensor" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"}`}
                    ><Settings className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 hidden sm:block" /><div className="text-center sm:text-left"><h3 className=" text-gray-900 text-sm sm:text-base mb-0.5">Parameter Lingkungan</h3><p className="text-xs text-gray-500 hidden sm:block">Pengaturan Berdasarkan Kondisi Lingkungan</p></div></button><button
                      onClick={() => setConfigMode("schedule")}
                      className={`p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center justify-center sm:justify-start gap-4 ${configMode === "schedule" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"}`}
                    ><Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 hidden sm:block" /><div className="text-center sm:text-left"><h3 className=" text-gray-900 text-sm sm:text-base mb-0.5">Jadwal Otomatis</h3><p className="text-xs text-gray-500 hidden sm:block">Pengaturan Berdasarkan Waktu</p></div></button></div>
                  )}
                  {configMode === "sensor" ? (
                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                      {!activeSensorAspect ? (
                        <div className="space-y-4">
                          <div className="px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100 mb-6">
                            <p className="text-sm  text-emerald-800 flex items-center gap-2">
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
                              <h4 className="text-sm  text-gray-900 mb-1 leading-tight">Kenyamanan</h4>
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
                              <h4 className="text-sm  text-gray-900 mb-1 leading-tight">Keamanan</h4>
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
                              <h4 className="text-sm  text-gray-900 mb-1 leading-tight">Kualitas Air</h4>
                              <p className="text-[10px] text-gray-500">pH, TDS, Keruh, Suhu</p>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {selectedCategory !== "sensor" && (
                            <button
                              onClick={() => setActiveSensorAspect(null)}
                              className="flex items-center gap-2 text-emerald-600  hover:text-emerald-700 transition-colors group mb-2"
                            >
                              <ChevronRight className="w-5 h-5 rotate-180" />
                              Kembali Pilih Aspek
                            </button>
                          )}

                          {/* ASPEK KENYAMANAN */}
                          {activeSensorAspect === "kenyamanan" && (
                            <div className="space-y-4">
                              <div className="px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                <p className="text-sm  text-emerald-800 flex items-center gap-2">
                                  <Activity className="w-4 h-4" /> Aspek Kenyamanan
                                </p>
                              </div>

                              {/* Suhu */}
                              <div className="border-2 border-gray-200 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <Thermometer className="w-6 h-6 text-orange-500" />
                                    <div>
                                      <h4 className=" text-gray-900">Suhu (Temperature)</h4>
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
                                        <span className="text-sm  text-gray-700">Default (27°C)</span>
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
                                        <span className="text-sm  text-gray-700">Custom</span>
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
                                      <h4 className=" text-gray-900">Kelembaban (Humidity)</h4>
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
                                        <span className="text-sm  text-gray-700">Default (80%)</span>
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
                                        <span className="text-sm  text-gray-700">Custom</span>
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
                                <p className="text-sm  text-purple-800 flex items-center gap-2">
                                  <ShieldAlert className="w-4 h-4" /> Aspek Keamanan
                                </p>
                              </div>

                              {/* Motion Sensor */}
                              <div className="border-2 border-gray-200 rounded-xl p-5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Eye className="w-6 h-6 text-purple-600" />
                                    <div>
                                      <h4 className=" text-gray-900">Motion Sensor</h4>
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
                                      <h4 className=" text-gray-900">Door Sensor</h4>
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



                          {/* ASPEK KUALITAS AIR */}
                          {activeSensorAspect === "kualitasAir" && (
                            <div className="space-y-4">
                              <div className="px-4 py-2 bg-cyan-50 rounded-lg border border-cyan-100">
                                <p className="text-sm font-bold text-cyan-800 flex items-center gap-2">
                                  <Waves className="w-4 h-4" /> Aspek Kualitas Air
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
                                        <span className="text-sm text-gray-700">Default (7.0)</span>
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
                                        <span className="text-sm text-gray-700">Custom</span>
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
                                        <span className="text-sm text-gray-700">Default (25 NTU)</span>
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
                                        <span className="text-sm text-gray-700">Custom</span>
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
                                      <h4 className="font-bold text-gray-900">TDS (Total Dissolved Solids)</h4>
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
                                        <span className="text-sm text-gray-700">Default (1000 mg/L)</span>
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
                                        <span className="text-sm text-gray-700">Custom</span>
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
                                      <h4 className="font-bold text-gray-900">Suhu Air (Water Temp)</h4>
                                      <p className="text-xs text-gray-500">Batas suhu air untuk ekosistem tertentu</p>
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
                                        <span className="text-sm  text-gray-700">Default (24°C)</span>
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
                                        <span className="text-sm  text-gray-700">Custom</span>
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
                              <h4 className=" text-gray-900">Jadwal #{index + 1}</h4>
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
                                <label className="block text-sm  text-gray-700 mb-2">Jam Nyala</label>
                                <input
                                  type="time"
                                  value={schedule.startTime}
                                  onChange={(e) => updateSchedule(index, "startTime", e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-sm  text-gray-700 mb-2">Jam Mati</label>
                                <input
                                  type="time"
                                  value={schedule.endTime}
                                  onChange={(e) => updateSchedule(index, "endTime", e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm  text-gray-700 mb-2 font-accent">Hari Pengulangan</label>
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
                                    className={`px-3 py-1.5 rounded-lg text-xs  transition-all ${schedule.days.includes(day)
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
                        className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl  hover:border-emerald-500 hover:text-emerald-600"
                      >
                        + Tambah Jadwal
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3 pt-6">
                    <button
                      onClick={() => setStep("add-device-form")}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl  hover:bg-gray-50 transition-all"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={handleSaveDevice}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl  shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Simpan Konfigurasi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
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
              <h3 className="text-xl ">Token Akses Teknisi</h3>
              <p className="text-emerald-100 text-xs mt-1">Berikan kode ini kepada teknisi Anda</p>
            </div>
            <div className="p-8 text-center">
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-6 mb-6">
                <span className="text-[3rem]  tracking-[0.5rem] text-emerald-600 font-mono">
                  {generatedToken}
                </span>
              </div>
              <div className="flex items-start gap-3 text-left bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed ">
                  Token ini bersifat **sekali pakai** dengan masa aktif **5 menit**. Setelah digunakan, akses konfigurasi teknisi berlaku selama **30 menit** dan akan *logout otomatis* jika waktu habis.
                </p>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="w-full py-3.5 bg-gray-900 text-white  rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ==================== MODAL: DEVICE SCANNER ==================== */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <DeviceScanner
            onCancel={() => setShowScanner(false)}
            onScanSuccess={(code) => {
              console.log("Scanned Code:", code);
              // Lanjut ke proses pairing MQTT di masa depan
              alert("Perangkat terdeteksi: " + code + ". Siap untuk proses pairing MQTT!");
              setShowScanner(false);
            }}
          />
        </div>
      )}
    </HomeownerLayout>
  );
}
