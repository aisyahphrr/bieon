// Device Control Dashboard
import { useState, useMemo, useEffect, useRef } from "react";
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
  Search,
  Activity,
  AlertCircle,
  Zap,
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
  Pin,
  PinOff,
  Pencil,
  CheckCircle,
  Info,
  Minus,
  WifiOff
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
  "remote": ["AC", "TV", "Kipas Angin"],
  "other": ["Custom Device"]
};

const REMOTE_DEVICE_TYPES = [
  { value: "TV", label: "TV" },
  { value: "AC", label: "AC" },
  { value: "Kipas Angin", label: "Kipas Angin" },
  { value: "Lampu", label: "Lampu" },
  { value: "Speaker", label: "Speaker" },
  { value: "Set Top Box", label: "Set Top Box" },
  { value: "Proyektor", label: "Proyektor" },
  { value: "Custom", label: "Custom" }
];

const REMOTE_BRANDS = [
  "Polytron",
  "LG",
  "Samsung",
  "Sharp",
  "Sony",
  "Toshiba",
  "Panasonic",
  "Midea",
  "Daikin",
  "AUX",
  "Gree",
  "Cosmos",
  "Miyako",
  "Maspion",
  "Sanken",
  "Other"
];

const REMOTE_FUNCTION_LIBRARY = {
  TV: [
    { value: "power", label: "Power" },
    { value: "volume_up", label: "Volume +" },
    { value: "volume_down", label: "Volume -" },
    { value: "channel_up", label: "Channel +" },
    { value: "channel_down", label: "Channel -" },
    { value: "mute", label: "Mute" },
    { value: "input", label: "Input" }
  ],
  AC: [
    { value: "power", label: "Power" },
    { value: "temp_up", label: "Temp +" },
    { value: "temp_down", label: "Temp -" },
    { value: "speed_up", label: "Speed +" },
    { value: "speed_down", label: "Speed -" },
    { value: "swing", label: "Swing" },
    { value: "mode", label: "Mode" }
  ],
  "Kipas Angin": [
    { value: "power", label: "Power" },
    { value: "speed_up", label: "Speed +" },
    { value: "speed_down", label: "Speed -" },
    { value: "swing", label: "Swing" },
    { value: "timer", label: "Timer" }
  ],
  Lampu: [
    { value: "power", label: "Power" },
    { value: "brightness_up", label: "Bright +" },
    { value: "brightness_down", label: "Bright -" },
    { value: "color_next", label: "Color +" },
    { value: "color_prev", label: "Color -" }
  ],
  Speaker: [
    { value: "power", label: "Power" },
    { value: "volume_up", label: "Volume +" },
    { value: "volume_down", label: "Volume -" },
    { value: "mute", label: "Mute" },
    { value: "input", label: "Input" }
  ],
  "Set Top Box": [
    { value: "power", label: "Power" },
    { value: "channel_up", label: "Channel +" },
    { value: "channel_down", label: "Channel -" },
    { value: "number_pad", label: "Number Pad" },
    { value: "menu", label: "Menu" }
  ],
  Proyektor: [
    { value: "power", label: "Power" },
    { value: "source", label: "Source" },
    { value: "menu", label: "Menu" },
    { value: "keystone", label: "Keystone" },
    { value: "focus", label: "Focus" }
  ],
  Custom: [
    { value: "power", label: "Power" },
    { value: "toggle", label: "Toggle" },
    { value: "start", label: "Start" },
    { value: "stop", label: "Stop" },
    { value: "mode", label: "Mode" }
  ]
};

const REMOTE_FUNCTION_LABELS = REMOTE_DEVICE_TYPES.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

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
  // Helper: normalize IEEE string (strip separators, uppercase)
  const normalizeIeee = (s) => {
    if (!s && s !== 0) return '';
    return String(s).replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  };
  const formatIeeeDisplay = (s) => {
    const n = normalizeIeee(s);
    return n || '-';
  };
  const formatModelDisplay = (s) => s ? String(s).toUpperCase() : '-';
  const isPlaceholderText = (value) => {
    const text = String(value || '').trim().toLowerCase();
    return !text || text === 'unknown' || text === 'unknown unknown' || text === '-' || text === 'null' || text === 'undefined';
  };
  const formatDeviceName = (name, fallbackIeee) => {
    const cleanName = isPlaceholderText(name) ? '' : String(name || '').trim();
    if (cleanName) return cleanName;
    const normalizedIeee = normalizeIeee(fallbackIeee);
    return normalizedIeee ? `Device ${normalizedIeee}` : 'Perangkat Baru';
  };
  // Extract a concise bit representation from a catalog item or raw strings
  const extractBitsFromCatalog = (item) => {
    if (!item) return '';
    // Prefer explicit fields
    if (item.bits) return String(item.bits);
    if (item.rawBitBinary) return String(item.rawBitBinary);
    if (item.rawBitHex) return String(item.rawBitHex);
    // If rawBitText is a JSON string, try to parse and extract common keys
    const tryParse = (v) => {
      if (!v) return null;
      if (typeof v !== 'string') return v;
      try {
        return JSON.parse(v);
      } catch (e) {
        return null;
      }
    };

    if (item.bit_length) return String(item.bit_length);
    const candidates = [item.rawBitText, item.rawBitHex, item.rawBitBinary, item.rawSignature];
    for (const c of candidates) {
      const parsed = tryParse(c);
      if (parsed && typeof parsed === 'object') {
        if (parsed.bit_length) return String(parsed.bit_length);
        if (parsed.bits) return String(parsed.bits);
        if (parsed.raw && parsed.raw.bits) return String(parsed.raw.bits);
        if (parsed.raw_bit && parsed.raw.bits) return String(parsed.raw.bits);
        if (parsed.raw_hex) return String(parsed.raw_hex);
        if (parsed.raw_value) return String(parsed.raw_value);
      }
    }

    // Fallbacks: prefer shorter representations
    if (item.rawBitText && String(item.rawBitText).length < 200) return String(item.rawBitText);
    if (item.rawBitHex) return String(item.rawBitHex);
    if (item.rawBitBinary) return String(item.rawBitBinary);
    return String(item.rawSignature || '').slice(0, 200);
  };
  const normalizeRemoteDeviceType = (value) => {
    const text = String(value || '').trim();
    if (!text) return 'Custom';
    const lower = text.toLowerCase();
    if (lower.includes('tv')) return 'TV';
    if (lower.includes('ac') || lower.includes('air conditioner')) return 'AC';
    if (lower.includes('kipas') || lower.includes('fan')) return 'Kipas Angin';
    if (lower.includes('lampu') || lower.includes('light')) return 'Lampu';
    if (lower.includes('speaker') || lower.includes('audio')) return 'Speaker';
    if (lower.includes('set top') || lower.includes('stb')) return 'Set Top Box';
    if (lower.includes('proyektor') || lower.includes('projector')) return 'Proyektor';
    return text;
  };
  const normalizeRemoteFunctionKey = (value) => {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return 'power';
    if (text.includes('volume') && text.includes('up')) return 'volume_up';
    if (text.includes('volume') && text.includes('down')) return 'volume_down';
    if (text.includes('channel') && text.includes('up')) return 'channel_up';
    if (text.includes('channel') && text.includes('down')) return 'channel_down';
    if (text.includes('temp') && text.includes('up')) return 'temp_up';
    if (text.includes('temp') && text.includes('down')) return 'temp_down';
    if (text.includes('speed') && text.includes('up')) return 'speed_up';
    if (text.includes('speed') && text.includes('down')) return 'speed_down';
    if (text.includes('brightness') && text.includes('up')) return 'brightness_up';
    if (text.includes('brightness') && text.includes('down')) return 'brightness_down';
    if (text.includes('color') && text.includes('next')) return 'color_next';
    if (text.includes('color') && text.includes('prev')) return 'color_prev';
    if (text.includes('mute')) return 'mute';
    if (text.includes('input')) return 'input';
    if (text.includes('swing')) return 'swing';
    if (text.includes('timer')) return 'timer';
    if (text.includes('menu')) return 'menu';
    if (text.includes('source')) return 'source';
    if (text.includes('focus')) return 'focus';
    if (text.includes('keystone')) return 'keystone';
    if (text.includes('start')) return 'start';
    if (text.includes('stop')) return 'stop';
    if (text.includes('toggle')) return 'toggle';
    if (text.includes('power')) return 'power';
    return text.replace(/\s+/g, '_');
  };
  const getRemoteFunctionOptions = (deviceType) => {
    const normalized = normalizeRemoteDeviceType(deviceType);
    return REMOTE_FUNCTION_LIBRARY[normalized] || REMOTE_FUNCTION_LIBRARY.Custom;
  };
  const getRemoteFunctionLabel = (deviceType, functionKey) => {
    const options = getRemoteFunctionOptions(deviceType);
    const match = options.find((item) => item.value === functionKey);
    return match ? match.label : String(functionKey || '').replace(/_/g, ' ');
  };
  const groupRemoteMappings = (mappings = []) => {
    const groups = new Map();
    mappings.forEach((item) => {
      const type = normalizeRemoteDeviceType(item?.deviceType || item?.type || item?.targetType || 'Custom');
      const brand = String(item?.brand || item?.brandName || item?.manufacturer || 'Other').trim() || 'Other';
      const key = `${type}__${brand}`;
      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          deviceType: type,
          brand,
          mappings: []
        });
      }
      groups.get(key).mappings.push({
        ...item,
        deviceType: type,
        brand,
        functionKey: normalizeRemoteFunctionKey(item?.functionKey || item?.controlAction || item?.function || item?.action),
        functionLabel: item?.functionLabel || item?.label || getRemoteFunctionLabel(type, item?.functionKey || item?.controlAction || item?.function || item?.action),
        isActive: item?.isActive !== false,
        captureStatus: item?.captureStatus || 'mapped'
      });
    });
    return Array.from(groups.values());
  };
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterCategory, setActiveFilterCategory] = useState("all");
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
  const [productRegForm, setProductRegForm] = useState({ id: "", name: "", category: "sensor", aspect: "none", controlCategory: "smart-switch" });
  const [registeredProducts, setRegisteredProducts] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");

  // Technician Access States
  const [isTechnicianMode, setIsTechnicianMode] = useState(() => localStorage.getItem('bieon_tech_access') === 'true');
  const [isTechnicianActiveInSystem, setIsTechnicianActiveInSystem] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState("");
  const [isEditingDevice, setIsEditingDevice] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lastPageStep, setLastPageStep] = useState("idle");
  const [remoteTargets, setRemoteTargets] = useState([]);
  const [remoteRooms, setRemoteRooms] = useState({});
  const [remoteBrands, setRemoteBrands] = useState({});
  const [remoteCustomNames, setRemoteCustomNames] = useState({});
  const [editingRemoteNameFor, setEditingRemoteNameFor] = useState(null);
  const [customNameInput, setCustomNameInput] = useState("");
  const [customSubTargets, setCustomSubTargets] = useState([]); // Array of { id: string, type: 'AC'|'TV'|'Kipas Angin'|'Lainnya' }
  const [pairingStates, setPairingStates] = useState({}); // { targetId: 'idle'|'pairing'|'connected'|'out_of_range' }
  const [pairingSuccessInfo, setPairingSuccessInfo] = useState(null); // { name: string, brand: string }
  const [detectedTypes, setDetectedTypes] = useState({}); // { targetId: 'AC'|'TV'|'Kipas Angin' }
  const [customRemoteInput, setCustomRemoteInput] = useState("");
  const [showCustomRemoteInput, setShowCustomRemoteInput] = useState(false);
  const [remoteAddingRoomFor, setRemoteAddingRoomFor] = useState(null);
  const [targetConfigs, setTargetConfigs] = useState({}); // { AC: { mode: 'manual', aspect: 'none' } }
  const [activeConfigTarget, setActiveConfigTarget] = useState(null);
  const [isRemoteDetailView, setIsRemoteDetailView] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isOpenJoinRequestPending, setIsOpenJoinRequestPending] = useState(false);
  const [scanAttempted, setScanAttempted] = useState(false);
  const [scanTimer, setScanTimer] = useState(0);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const [remoteBitCatalogByBieon, setRemoteBitCatalogByBieon] = useState({});
  const [remoteRegistrationStateByBieon, setRemoteRegistrationStateByBieon] = useState({});
  const [remoteRegistrationDeviceId, setRemoteRegistrationDeviceId] = useState(null);
  const [remoteCatalogLoading, setRemoteCatalogLoading] = useState(false);
  const [remoteMappingDraft, setRemoteMappingDraft] = useState(null);
  const [joinedDevicesPool, setJoinedDevicesPool] = useState([]);
  const [leavingDevices, setLeavingDevices] = useState({}); // { deviceId: seconds }
  const [pendingOpenJoinDevice, setPendingOpenJoinDevice] = useState(null);
  const [pendingOpenJoinAction, setPendingOpenJoinAction] = useState(null); // 'save' | 'configure'
  const openJoinSubmitLockRef = useRef(false);

  // Efek Hitung Mundur untuk Pembuangan Perangkat
  useEffect(() => {
    const timers = Object.keys(leavingDevices);
    if (timers.length === 0) return;

    const interval = setInterval(() => {
      setLeavingDevices(prev => {
        const next = { ...prev };
        let hasChanges = false;

        for (const id in next) {
          if (next[id] <= 1) {
            // Timer habis, eksekusi leave ke backend (backend publish MQTT leave)
            const expiredDevice = discoveredDevices.find(dev => dev.id === id);
            if (expiredDevice && (expiredDevice.isFromDb || expiredDevice.dbId || expiredDevice._id)) {
              const targetId = expiredDevice.dbId || expiredDevice._id || expiredDevice.id;
              if (targetId) {
                void deleteDevice(targetId, {
                  requireConfirmation: false,
                  showSuccessAlert: false,
                  showErrorAlert: false
                });
              }
            }
            setJoinedDevicesPool(p => p.filter(pId => pId !== id));
            setDiscoveredDevices(d => d.filter(dev => dev.id !== id));
            delete next[id];
            hasChanges = true;
          } else {
            next[id] -= 1;
            hasChanges = true;
          }
        }
        return hasChanges ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [leavingDevices]);

  // Efek Hitung Mundur untuk Scanning Open Join
  useEffect(() => {
    let interval;
    if (isScanning && scanTimer > 0) {
      interval = setInterval(() => {
        setScanTimer(prev => prev - 1);
      }, 1000);
    } else if (scanTimer === 0 && isScanning) {
      setIsScanning(false);
    }
    return () => clearInterval(interval);
  }, [isScanning, scanTimer]);

  const toggleJoinDevice = (deviceId) => {
    if (joinedDevicesPool.includes(deviceId)) {
      setJoinedDevicesPool(prev => prev.filter(id => id !== deviceId));
      setDiscoveredDevices(prev => prev.filter(dev => dev.id !== deviceId));
    } else {
      setJoinedDevicesPool(prev => prev.includes(deviceId) ? prev : [...prev, deviceId]);
    }
  };

  const isDeviceAlreadyRegisteredOrConfigured = (deviceId) => {
    // Periksa di daftar produk terdaftar
    const inRegistered = registeredProducts.some(p => p.productId && (p.productId.includes(deviceId) || deviceId.includes(p.productId)));
    if (inRegistered) return true;

    // Periksa di perangkat yang sudah dikonfigurasi (masuk ke hub)
    if (currentBieon && currentBieon.hubs) {
      for (const hub of currentBieon.hubs) {
        if (hub.devices && hub.devices.some(d => {
          const checkId = d.productId || d.modelId || d.id;
          return checkId && (checkId.includes(deviceId) || deviceId.includes(checkId));
        })) {
          return true;
        }
      }
    }
    return false;
  };

  const handleStartDiscovery = async () => {
    if (openJoinSubmitLockRef.current || isScanning || isOpenJoinRequestPending) {
      return;
    }

    openJoinSubmitLockRef.current = true;
    setIsOpenJoinRequestPending(true);

    try {
      // Minta backend untuk membuka open-join TARGET ke hub yang dipilih (publish ke ESP-B topic)
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/devices/pairing/open', { method: 'POST', headers, body: JSON.stringify({ hubId: selectedHub?.id, duration: 30 }) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Gagal mengaktifkan open join');
      }

      setIsScanning(true);
      setScanAttempted(true);
      setDiscoveredDevices([]);
      setJoinedDevicesPool([]);
      setLeavingDevices({});
      setScanTimer(30);
    } catch (err) {
      alert('Gagal membuka Open Join: ' + err.message);
      setIsOpenJoinRequestPending(false);
      openJoinSubmitLockRef.current = false;
      return;
    } finally {
      setIsOpenJoinRequestPending(false);
      openJoinSubmitLockRef.current = false;
    }

    // Waiting for real device_discovered events from backend via Socket.IO
  };

  const DEVICE_BRANDS = {
    "AC": ["Samsung", "LG", "Daikin", "Panasonic", "Sharp", "Gree", "Midea", "TCL"],
    "TV": ["Samsung", "LG", "Sony", "Panasonic", "Sharp", "Polytron", "Xiaomi", "Hisense", "TCL"],
    "Kipas Angin": ["Miyako", "Maspion", "Cosmos", "Sekai", "Panasonic", "KDK", "Turbo"]
  };

  const getTargetSummary = (target) => {
    const config = targetConfigs[target];
    if (!config || config.mode === 'manual') return 'Mode Manual';

    if (config.mode === 'schedule') {
      const count = scheduleConfig.filter(s => s.target === target || !s.target).length;
      return count > 0 ? `Jadwal (${count} Jadwal)` : 'Jadwal (Belum Diatur)';
    }

    if (config.mode === 'sensor') {
      if (!config.aspect) return 'Parameter (Belum Pilih)';

      if (config.aspect === 'kenyamanan') {
        const parts = [];
        if (sensorConfig.temperature.enabled) parts.push(`${sensorConfig.temperature.value}°C`);
        if (sensorConfig.humidity.enabled) parts.push(`${sensorConfig.humidity.value}%`);
        return parts.length > 0 ? `Kenyamanan (${parts.join(", ")})` : 'Kenyamanan (Belum Aktif)';
      }

      if (config.aspect === 'keamanan') {
        const parts = [];
        if (sensorConfig.motion.enabled) parts.push('Motion');
        if (sensorConfig.door.enabled) parts.push('Pintu');
        return parts.length > 0 ? `Keamanan (${parts.join("/")})` : 'Keamanan (Belum Aktif)';
      }

      if (config.aspect === 'kualitasAir') {
        const parts = [];
        if (sensorConfig.ph.enabled) parts.push(`pH ${sensorConfig.ph.value}`);
        if (sensorConfig.turbidity.enabled) parts.push(`Keruh`);
        return parts.length > 0 ? `Air (${parts.join(", ")})` : 'Air (Belum Aktif)';
      }

      return 'Parameter Lingkungan';
    }

    return 'Mode Manual';
  };


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
        const devRes = await fetch(`/api/kendaliperangkat/my-devices?ownerId=${targetId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const devicesData = await devRes.json();
        const normalizeIeee = (value) => String(value || '').replace(/[:\-\s]/g, '').toUpperCase();
        const uniqueDevicesData = Array.from(
          new Map(devicesData.map((device) => {
            const key = normalizeIeee(device.device_ieee) || String(device._id || device.id || '');
            return [key, device];
          }))
        ).map(([, device]) => device);

        // Join devices into hubs in systems
        const joinedSystems = systemsData.map(sys => ({
          id: sys._id,
          bieonId: sys.bieonId,
          name: sys.bieonId, // Fallback name
          totalHubs: sys.hubCount || sys.hubs?.length || 0,
          hubs: sys.hubs.map(hub => ({
            ...hub,
            devices: uniqueDevicesData
              .filter(d => String(d.hubId) === String(hub.id))
              .map(d => ({
                ...d,
                id: d._id,
                installedDate: d.createdAt,
                currentValues: d.currentValues || {},
                sensorParams: d.thresholds || {},
                controls: d.remoteState || {},
                remoteState: d.remoteState || {},
                remoteMappings: Array.isArray(d.remoteState?.mappings) ? d.remoteState.mappings : (Array.isArray(d.remoteMappings) ? d.remoteMappings : [])
              }))
          })),
          createdAt: sys.createdAt
        }));

        setBieonSystems(joinedSystems);
        if (joinedSystems.length > 0) {
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
      // Prefer device_ieee as canonical identifier when available
      const deviceKey = String(updatedDevice.device_ieee || updatedDevice._id || updatedDevice.id || '');
      console.log('📡 Real-time Telemetry received:', deviceKey, updatedDevice.status);
      const pending = pendingToggleRef.current.get(deviceKey);

      if (pending && updatedDevice.status !== undefined) {
        const telemetryStatus = String(updatedDevice.status);
        if (telemetryStatus === pending.targetStatus) {
          clearTimeout(pending.timeoutId);
          pendingToggleRef.current.delete(deviceKey);
        }
      }

      setBieonSystems(prevSystems => {
        return prevSystems.map(sys => ({
          ...sys,
          hubs: sys.hubs.map(hub => ({
            ...hub,
            devices: hub.devices.map(dev => {
                      const devIeee = normalizeIeee(dev.device_ieee || dev.id || dev._id || '');
                      const updIeee = normalizeIeee(updatedDevice.device_ieee || updatedDevice._id || updatedDevice.id || '');
                      const isMatch = devIeee && updIeee ? devIeee === updIeee : (String(dev._id) === String(updatedDevice._id) || String(dev.id) === String(updatedDevice._id));
              if (isMatch) {
                return {
                  ...dev,
                  device_ieee: updatedDevice.device_ieee || dev.device_ieee,
                  model: updatedDevice.model || dev.model,
                  manufacturer: updatedDevice.manufacturer || dev.manufacturer,
                  currentValues: updatedDevice.currentValues || dev.currentValues,
                  battery: updatedDevice.battery || dev.battery,
                  status: updatedDevice.status !== undefined ? String(updatedDevice.status) : dev.status,
                  isToggling: pending ? String(updatedDevice.status) !== pending.targetStatus : false
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

    socket.on('device_discovered', (newDevice) => {
      setDiscoveredDevices(prev => {
        const raw = (newDevice && typeof newDevice.raw === 'object' && newDevice.raw !== null) ? newDevice.raw : {};
        const ieee = normalizeIeee(newDevice?.device_ieee || raw?.device_ieee || raw?.ieee || raw?.device_ieee_raw || '');
        const manufacturer = String(newDevice?.manufacturer || raw?.manufacturer || '').trim();
        const model = String(newDevice?.model || raw?.model || raw?.model_id || '').trim();
        const explicitName = String(newDevice?.name || raw?.display_name || raw?.name || '').trim();
        const fallbackName = [manufacturer, model].filter(Boolean).join(' ').trim();
        const name = isPlaceholderText(explicitName) ? '' : explicitName;
        const displayName = name || (isPlaceholderText(fallbackName) ? '' : fallbackName) || (ieee ? `Device ${ieee}` : 'Perangkat Baru');

        let type = String(newDevice?.type || raw?.type || model || '').trim();
        if (isPlaceholderText(type)) {
          type = 'Sensor';
        } else if (/SNZB[_-]?02|TH|AIRGUARD/i.test(type)) {
          type = 'Sensor Kenyamanan';
        } else if (/S60|PLUG|SWITCH/i.test(type)) {
          type = 'Control';
        }

        const nextId = ieee || String(newDevice?._id || newDevice?.id || name).trim();
        if (!nextId) return prev;

        const alreadyExists = prev.some(dev => {
          const existingIeee = normalizeIeee(dev?.device_ieee || dev?.id || '');
          const candidateIeee = normalizeIeee(nextId);
          if (existingIeee && candidateIeee) {
            return existingIeee === candidateIeee;
          }
          return String(dev?.id || dev?._id || dev?.name || '') === String(nextId);
        });
        if (alreadyExists) return prev;

        return [...prev, {
          ...newDevice,
          id: nextId,
          device_ieee: ieee || undefined,
          manufacturer: manufacturer || undefined,
          model: model || undefined,
          name: displayName,
          type,
          status: newDevice?.claimed ? 'CLAIMED' : (newDevice?.lifecycleState || newDevice?.status || 'DISCOVERED')
        }];
      });
    });

    socket.on('remote_registration_state', (registrationState) => {
      const bieonId = String(registrationState?.bieonId || currentBieon?.bieonId || '').trim();
      if (!bieonId) return;

      setRemoteRegistrationStateByBieon(prev => ({
        ...prev,
        [bieonId]: {
          ...registrationState,
          bieonId,
          updatedAt: registrationState?.updatedAt || Date.now()
        }
      }));
    });

    socket.on('remote_bit_registration', (eventPayload) => {
      const bieonId = String(eventPayload?.bieonId || currentBieon?.bieonId || '').trim();
      const catalogItem = eventPayload?.catalogItem;
      if (!bieonId || !catalogItem) return;

      setRemoteBitCatalogByBieon(prev => {
        const currentItems = Array.isArray(prev[bieonId]) ? prev[bieonId] : [];
        const nextItems = currentItems.filter((item) => item._id !== catalogItem._id && item.rawSignature !== catalogItem.rawSignature);
        return {
          ...prev,
          [bieonId]: [catalogItem, ...nextItems].sort((a, b) => new Date(b.lastSeenAt || b.createdAt || 0) - new Date(a.lastSeenAt || a.createdAt || 0))
        };
      });
    });

    socket.on('remote_bit_catalog_updated', (eventPayload) => {
      const bieonId = String(eventPayload?.bieonId || currentBieon?.bieonId || '').trim();
      const catalogItem = eventPayload?.catalogItem;
      if (!bieonId || !catalogItem) return;

      setRemoteBitCatalogByBieon(prev => {
        const currentItems = Array.isArray(prev[bieonId]) ? prev[bieonId] : [];
        const found = currentItems.some((item) => item._id === catalogItem._id || item.rawSignature === catalogItem.rawSignature);
        const nextItems = found
          ? currentItems.map((item) => (item._id === catalogItem._id || item.rawSignature === catalogItem.rawSignature) ? catalogItem : item)
          : [catalogItem, ...currentItems];
        return {
          ...prev,
          [bieonId]: nextItems.sort((a, b) => new Date(b.lastSeenAt || b.createdAt || 0) - new Date(a.lastSeenAt || a.createdAt || 0))
        };
      });
    });

    const techAccess = localStorage.getItem('bieon_tech_access');
    if (techAccess === 'true') {
      setIsTechnicianMode(true);
    }

    return () => {
      socket.off('device_telemetry');
      socket.off('new_unassigned_device');
      socket.off('device_discovered');
      socket.off('remote_registration_state');
      socket.off('remote_bit_registration');
      socket.off('remote_bit_catalog_updated');
      socket.disconnect();
    };
  }, []); // Hapus userProfile dari dependency agar tidak infinite loop

  useEffect(() => {
    const bieonId = currentBieon?.bieonId;
    if (!bieonId) return;

    let cancelled = false;

    const loadRemoteCatalog = async () => {
      try {
        setRemoteCatalogLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/devices/registration/${encodeURIComponent(bieonId)}/catalog`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!cancelled && response.ok) {
          setRemoteBitCatalogByBieon(prev => ({
            ...prev,
            [bieonId]: Array.isArray(data.items) ? data.items : []
          }));
        }
      } catch (error) {
        console.error('Gagal memuat katalog raw bit:', error);
      } finally {
        if (!cancelled) setRemoteCatalogLoading(false);
      }
    };

    loadRemoteCatalog();

    return () => {
      cancelled = true;
    };
  }, [currentBieon?.bieonId]);

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

  useEffect(() => {
    if (step === "idle" || step === "view-bieon") {
      setLastPageStep(step);
    }
  }, [step]);

  // [FIX] Sinkronisasi otomatis currentBieon ketika bieonSystems berubah
  useEffect(() => {
    const handleSelection = () => {
      const selectedId = localStorage.getItem('selectedBieonId');
      const shouldOpenInput = localStorage.getItem('openBieonInput') === 'true';

      if (selectedId && bieonSystems.length > 0) {
        const target = bieonSystems.find(s =>
          String(s.id) === String(selectedId) ||
          String(s.bieonId) === String(selectedId)
        );
        if (target) {
          setCurrentBieon(target);
          localStorage.removeItem('selectedBieonId');
          return true; // Selection handled
        }
      }

      if (shouldOpenInput) {
        setStep('input-id');
        localStorage.removeItem('openBieonInput');
      }
      return false;
    };

    if (bieonSystems.length > 0) {
      const selectionHandled = handleSelection();

      // Fallback logic
      if (!selectionHandled) {
        if (!currentBieon) {
          setCurrentBieon(bieonSystems[0]);
        } else {
          // Update data currentBieon jika ada perubahan di bieonSystems
          const updated = bieonSystems.find(s => s.id === currentBieon.id);
          if (updated) setCurrentBieon(updated);
        }
      }
    }

    const eventListener = () => handleSelection();
    window.addEventListener('bieonSelectionChanged', eventListener);
    return () => window.removeEventListener('bieonSelectionChanged', eventListener);
  }, [bieonSystems]);

  // [ADD] AUTO-HIGHLIGHT LOGIC FOR DEEP-LINKING
  useEffect(() => {
    const highlightId = sessionStorage.getItem('pendingHighlight');
    if (highlightId && step === "view-bieon") {
      // 1. Expand the device card
      setExpandedDevice(highlightId);

      // 2. Scroll to it after a short delay to allow rendering
      setTimeout(() => {
        const element = document.getElementById(`device-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // 3. Cleanup
          sessionStorage.removeItem('pendingHighlight');
        }
      }, 600);
    }
  }, [step, bieonSystems]);

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
    if (!userProfile?._id) {
      alert("Profil pengguna belum siap. Silakan refresh halaman.");
      return;
    }

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
          totalHubs: BIEON_DATABASE[bieonIdInput]?.totalHubs || 1,
          userId: userProfile._id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Gagal setup hub");
      }

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
  const handleSelectHub = async (hub) => {
    resetForm();
    setSelectedHub(hub);
    setStep("add-device-choice");
    await fetchRegisteredProducts();
  };

  const fetchRegisteredProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/products/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      // Safety Check: Pastikan data adalah array supaya tidak bikin blank putih
      if (Array.isArray(data)) {
        setRegisteredProducts(data);
      } else {
        console.error("Data produk bukan array:", data);
        setRegisteredProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setRegisteredProducts([]);
    }
  };
  const handleRegisterProduct = async (e, targetStep = "select-category") => {
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
        alert("Produk berhasil diregistrasi!");
        await fetchRegisteredProducts(); // Refresh data!

        if (targetStep === "add-device-form") {
          // Set produk yang baru saja dibuat sebagai produk aktif untuk konfigurasi
          setSelectedProduct(data.product);
          // Set kategori dan tipe perangkat berdasarkan produk baru
          setSelectedCategory(data.product.category);
          setSelectedDeviceType(data.product.productName);
          // Pre-populate nama perangkat di form setting
          setDeviceForm(prev => ({ ...prev, name: data.product.productName }));

          // Auto-open relevant aspect for sensor
          if (data.product.category === "sensor") {
            const aspect = data.product.aspect;
            if (aspect === "air") setActiveSensorAspect("kualitasAir");
            else if (aspect === "kenyamanan") setActiveSensorAspect("kenyamanan");
            else if (aspect === "keamanan") setActiveSensorAspect("keamanan");
          }
        }

        setStep(targetStep);
      } else {
        if (data.message === "ID Produk sudah terdaftar di sistem.") {
          const wantToSetup = window.confirm(
            "ID Produk ini sudah terdaftar di sistem.\n\nApakah Anda ingin diarahkan ke daftar 'Perangkat Anda' untuk segera melakukan konfigurasi?"
          );
          if (wantToSetup) {
            await fetchRegisteredProducts();
            setStep("select-category");
          }
        } else {
          alert(data.message);
        }
      }
    } catch (err) {
      alert("Error registrasi: " + err.message);
    }
  };

  const handleDeleteRegisteredProduct = async (productId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini dari daftar terdaftar?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert("Produk berhasil dihapus!");
        await fetchRegisteredProducts();
      } else {
        alert(data.message || "Gagal menghapus produk");
      }
    } catch (err) {
      alert("Error hapus: " + err.message);
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

  const initOpenJoinDeviceConfiguration = (dev, action = "configure") => {
    setPendingOpenJoinDevice(dev);
    setPendingOpenJoinAction(action);
    setSelectedCategory("");
    setSelectedDeviceType("");
    setSelectedProduct(null);
    setDeviceForm({ name: dev.name || "", location: "", notes: "" });
    // Keep the Open Join popup open and ask category selection inline
  };

  const determineSensorAspect = (dev) => {
    const nameLower = (dev.name || "").toLowerCase();
    const typeLower = (dev.type || "").toLowerCase();
    if (nameLower.includes("bluecheck") || typeLower.includes("water") || typeLower.includes("air")) return "kualitasAir";
    if (nameLower.includes("airguard") || typeLower.includes("th") || typeLower.includes("humidity") || nameLower.includes("kenyamanan")) return "kenyamanan";
    if (nameLower.includes("motion") || nameLower.includes("keamanan") || nameLower.includes("door")) return "keamanan";
    return "kenyamanan";
  };

  const handleOpenJoinCategorySelection = async (category) => {
    if (!pendingOpenJoinDevice) return;

    if (pendingOpenJoinAction === "save") {
      await handleQuickSave(pendingOpenJoinDevice, category);
      setPendingOpenJoinDevice(null);
      setPendingOpenJoinAction(null);
      return;
    }

    setSelectedCategory(category);
    const defaultType = category === "sensor"
      ? pendingOpenJoinDevice.type || "Sensor"
      : pendingOpenJoinDevice.type || "Control Actuator";
    setSelectedDeviceType(defaultType);
    setSelectedProduct({ id: pendingOpenJoinDevice.id, productId: pendingOpenJoinDevice.id });
    setDeviceForm(prev => ({ ...prev, name: pendingOpenJoinDevice.name || defaultType, location: "", notes: "" }));
    if (category === "sensor") {
      setActiveSensorAspect(determineSensorAspect(pendingOpenJoinDevice));
    } else {
      setActiveSensorAspect(null);
    }
    setStep("add-device-form");
    setPendingOpenJoinDevice(null);
    setPendingOpenJoinAction(null);
  };

  const handleStartRemoteRegistration = async (device) => {
    if (!currentBieon?.bieonId) return;
    if (!device?.id) return;

    try {
      setRemoteMappingDraft(null);
      setRemoteRegistrationDeviceId(device.id);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/devices/registration/${encodeURIComponent(currentBieon.bieonId)}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          duration: 30,
          sessionId: `web_${Date.now()}`
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Gagal memulai registrasi remote');
      }

      setRemoteRegistrationStateByBieon(prev => ({
        ...prev,
        [currentBieon.bieonId]: {
          bieonId: currentBieon.bieonId,
          state: 'active',
          active: true,
          sessionId: data.sessionId || `web_${Date.now()}`,
          duration: data.duration || 90,
          payload: data,
          updatedAt: Date.now()
        }
      }));

      alert('Mode registrasi remote aktif. Silakan tekan tombol remote untuk menangkap bit.');
    } catch (error) {
      alert(`Gagal memulai registrasi remote: ${error.message}`);
    }
  };

  const handleOpenRemoteMapping = (device, catalogItem) => {
    if (!device || !catalogItem) return;

    const fallbackType = normalizeRemoteDeviceType(device.deviceType || device.type || 'Custom');
    const currentMappings = Array.isArray(device.remoteMappings)
      ? device.remoteMappings
      : Array.isArray(device.remoteState?.mappings)
        ? device.remoteState.mappings
        : [];
    const existingMapping = currentMappings.find((item) => item.rawSignature === catalogItem.rawSignature || item._id === catalogItem._id);

    setRemoteMappingDraft({
      deviceId: device.id,
      catalogId: catalogItem._id,
      rawSignature: catalogItem.rawSignature,
      rawBitText: catalogItem.rawBitText || '-',
      rawBitHex: catalogItem.rawBitHex || '',
      rawBitBinary: catalogItem.rawBitBinary || '',
      sourceRemoteIeee: existingMapping?.sourceRemoteIeee || catalogItem.sourceRemoteIeee || '',
      sourceRemoteId: existingMapping?.sourceRemoteId || catalogItem.sourceRemoteId || '',
      deviceType: existingMapping?.deviceType || fallbackType,
      functionKey: existingMapping?.functionKey || 'power',
      brand: existingMapping?.brand || 'Other',
      customBrand: existingMapping?.brand && existingMapping.brand !== 'Other' ? existingMapping.brand : '',
      functionLabel: existingMapping?.functionLabel || getRemoteFunctionLabel(fallbackType, existingMapping?.functionKey || 'power'),
      label: existingMapping?.label || ''
    });
  };

  const handleCancelRemoteMapping = () => {
    setRemoteMappingDraft(null);
  };

  const handleDisableRemoteBit = async (catalogItem) => {
    if (!catalogItem?._id) return;

    if (!window.confirm('Hapus raw bit ini dari katalog?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/devices/registration/catalog/${catalogItem._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          captureStatus: 'disabled',
          isActive: false
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Gagal menghapus raw bit');
      }

      const bieonId = String(currentBieon?.bieonId || '').trim();
      if (bieonId) {
        setRemoteBitCatalogByBieon(prev => {
          const currentItems = Array.isArray(prev[bieonId]) ? prev[bieonId] : [];
          const nextItems = currentItems.map((item) => (item._id === data.item._id || item.rawSignature === data.item.rawSignature) ? data.item : item);
          return { ...prev, [bieonId]: nextItems };
        });
      }

      if (remoteMappingDraft?.catalogId === catalogItem._id) {
        setRemoteMappingDraft(null);
      }
    } catch (error) {
      alert(`Gagal menghapus raw bit: ${error.message}`);
    }
  };

  const handleSaveRemoteMapping = async () => {
    if (!remoteMappingDraft || !currentBieon) return;

    const device = getAllDevices().find((item) => String(item.id) === String(remoteMappingDraft.deviceId) || String(item._id) === String(remoteMappingDraft.deviceId));
    if (!device) {
      alert('Remote card tidak ditemukan.');
      return;
    }

    const deviceType = normalizeRemoteDeviceType(remoteMappingDraft.deviceType);
    const functionKey = normalizeRemoteFunctionKey(remoteMappingDraft.functionKey);
    const functionLabel = getRemoteFunctionLabel(deviceType, functionKey);
    const brand = String(remoteMappingDraft.customBrand || remoteMappingDraft.brand || 'Other').trim() || 'Other';
    const label = String(remoteMappingDraft.label || functionLabel || functionKey).trim() || functionLabel;

    const existingMappings = Array.isArray(device.remoteMappings)
      ? device.remoteMappings
      : Array.isArray(device.remoteState?.mappings)
        ? device.remoteState.mappings
        : [];

    const nextMapping = {
      catalogId: remoteMappingDraft.catalogId,
      rawSignature: remoteMappingDraft.rawSignature,
      rawBitText: remoteMappingDraft.rawBitText,
      rawBitHex: remoteMappingDraft.rawBitHex,
      rawBitBinary: remoteMappingDraft.rawBitBinary,
      sourceRemoteIeee: remoteMappingDraft.sourceRemoteIeee,
      sourceRemoteId: remoteMappingDraft.sourceRemoteId,
      deviceType,
      functionKey,
      functionLabel,
      label,
      brand,
      isActive: true,
      captureStatus: 'mapped',
      mappedAt: new Date().toISOString()
    };

    const nextMappings = [
      ...existingMappings.filter((item) => item.rawSignature !== nextMapping.rawSignature && item.catalogId !== nextMapping.catalogId),
      nextMapping
    ];

    const nextRemoteState = {
      ...(device.remoteState || {}),
      mappings: nextMappings,
      profiles: groupRemoteMappings(nextMappings)
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/kendaliperangkat/configure/${device.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: device.name,
          location: device.location,
          notes: String(device.notes || '').includes('Quick Saved') ? device.notes : device.notes,
          controlledDevice: nextMappings.map((item) => `${item.deviceType} (${item.brand})`).join(', '),
          remoteState: nextRemoteState,
          controlMethod: device.controlMethod || 'Manual'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Gagal menyimpan mapping remote');
      }

      const updatedDevice = {
        ...data.device,
        id: data.device._id,
        remoteState: nextRemoteState,
        remoteMappings: nextMappings
      };

      const updatedSystems = bieonSystems.map((system) => ({
        ...system,
        hubs: system.hubs.map((hub) => ({
          ...hub,
          devices: hub.devices.map((item) => String(item.id) === String(device.id) ? {
            ...item,
            ...updatedDevice,
            remoteState: nextRemoteState,
            remoteMappings: nextMappings
          } : item)
        }))
      }));

      setBieonSystems(updatedSystems);
      setCurrentBieon(updatedSystems.find((system) => system.id === currentBieon.id) || currentBieon);
      setRemoteBitCatalogByBieon(prev => ({
        ...prev,
        [currentBieon.bieonId]: (prev[currentBieon.bieonId] || []).map((item) => item._id === remoteMappingDraft.catalogId ? { ...item, captureStatus: 'mapped', isActive: true, controlAction: functionKey, controlLabel: label, deviceType, controlGroup: brand } : item)
      }));
      setRemoteMappingDraft(null);
      alert('Mapping remote berhasil disimpan dan kontrol card sudah aktif.');
    } catch (error) {
      alert(`Gagal menyimpan mapping remote: ${error.message}`);
    }
  };

  const handleAddRoom = (targetType = null) => {
    if (!newRoomInput.trim()) return;
    const roomName = newRoomInput.trim();
    if (rooms.includes(roomName)) {
      alert("Ruangan sudah ada!");
      return;
    }
    setRooms([...rooms, roomName]);

    if (targetType) {
      setRemoteRooms(prev => ({ ...prev, [targetType]: roomName }));
      // Sync main location if this is the first selected remote
      if (targetType === remoteTargets[0]) setDeviceForm(prev => ({ ...prev, location: roomName }));
      setRemoteAddingRoomFor(null);
    } else {
      setDeviceForm({ ...deviceForm, location: roomName });
      setShowNewRoomInput(false);
    }
    setNewRoomInput("");
  };
  const handleSubmitDeviceForm = () => {
    const isRemote = (selectedProduct?.aspect === 'remote' || selectedDeviceType.toLowerCase().includes('remote'));
    if (!deviceForm.name || (!isRemote && !deviceForm.location)) {
      alert("Mohon lengkapi nama device dan lokasi!");
      return;
    }

    if ((selectedProduct?.aspect === 'remote' || selectedDeviceType.toLowerCase().includes('remote'))) {
      if (remoteTargets.length === 0) {
        alert("Mohon pilih perangkat yang dikontrol!");
        return;
      }
      const missingRoom = remoteTargets.find(t => !remoteRooms[t]);
      if (missingRoom) {
        alert(`Mohon pilih ruangan untuk ${missingRoom}!`);
        return;
      }
    }

    // Sinkronisasi Parameter otomatis berdasarkan tipe yang dipilih di dropdown
    if (selectedCategory === "sensor") {
      let aspect = null;
      let newConfig = JSON.parse(JSON.stringify(sensorConfig));

      const nameLower = (deviceForm.name || "").toLowerCase();
      const isAir = selectedDeviceType.includes("Kualitas Air") || selectedProduct?.aspect === "air" || nameLower.includes("water") || nameLower.includes("bluecheck");
      const isComfort = selectedDeviceType.includes("Kenyamanan") || selectedDeviceType.includes("Humidity") || selectedProduct?.aspect === "kenyamanan" || nameLower.includes("sonoff") || nameLower.includes("th snzb");
      const isSecurity = selectedDeviceType.includes("Keamanan") || selectedDeviceType.includes("Motion") || selectedProduct?.aspect === "keamanan" || nameLower.includes("motion");
      const isDoor = selectedDeviceType.includes("Door") || nameLower.includes("door");

      if (isAir) {
        aspect = "kualitasAir";
        newConfig.ph.enabled = true;
        newConfig.turbidity.enabled = true;
        newConfig.tds.enabled = true;
        newConfig.waterTemp.enabled = true;
      }
      else if (isComfort) {
        aspect = "kenyamanan";
        newConfig.temperature.enabled = true;
        newConfig.humidity.enabled = true;
      }
      else if (isSecurity) {
        aspect = "keamanan";
        newConfig.motion.enabled = true;
      }
      else if (isDoor) {
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
    const isRemote = (selectedProduct?.aspect === 'remote' || selectedDeviceType.toLowerCase().includes('remote'));
    if (!deviceForm.name || (!isRemote && !deviceForm.location)) {
      alert("Mohon lengkapi nama device dan lokasi!");
      return;
    }

    if ((selectedProduct?.aspect === 'remote' || selectedDeviceType.toLowerCase().includes('remote'))) {
      if (remoteTargets.length === 0) {
        alert("Mohon pilih perangkat yang dikontrol!");
        return;
      }
      const missingRoom = remoteTargets.find(t => !remoteRooms[t]);
      if (missingRoom) {
        alert(`Mohon pilih ruangan untuk ${missingRoom}!`);
        return;
      }
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
        productId: selectedProduct?.productId || selectedProduct?.id || pendingOpenJoinDevice?.id || pendingOpenJoinDevice?.device_ieee || deviceForm?.name || null,
        controlledDevice: remoteTargets.map(t => remoteRooms[t] ? `${t} (${remoteRooms[t]})` : t).join(", "),
        sensorParams: (selectedCategory === "sensor" || backendControl === "Lingkungan") ? transformSensorParams(sensorConfig, activeSensorAspect) : null,
        sensorData: selectedCategory === "sensor" ? generateMockSensorData(selectedDeviceType) : null,
        remoteConfig: targetConfigs
      };

      const editingId = isEditingDevice;
      const endpoint = editingId
        ? `/api/kendaliperangkat/configure/${editingId}`
        : '/api/kendaliperangkat';
      const method = editingId ? 'PUT' : 'POST';

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

      const newDevice = {
        ...data.device,
        id: data.device._id,
        status: "0",
        installedDate: data.device.createdAt
      };

      // Update local state
      const updatedHubs = currentBieon.hubs.map((hub) => {
        if (hub.id === selectedHub.id) {
          const filteredDevices = editingId
            ? hub.devices.filter(d => d.id !== editingId)
            : hub.devices;
          return { ...hub, devices: [...filteredDevices, newDevice] };
        }
        return hub;
      });
      const updatedBieon = { ...currentBieon, hubs: updatedHubs };
      setBieonSystems(bieonSystems.map((b) => b.id === currentBieon.id ? updatedBieon : b));
      setCurrentBieon(updatedBieon);

      await fetchRegisteredProducts();

      resetForm();
      setIsEditingDevice(null);
      setStep("view-bieon");
      alert(editingId ? "Perangkat berhasil diperbarui!" : "Perangkat berhasil ditambahkan ke database!");
    } catch (error) {
      console.error("Save error details:", error);
      alert("Gagal simpan: " + (error.message || "Terjadi kesalahan pada server"));
    }
  };

  const handleQuickSave = async (dev, chosenCategory = null) => {
    if (!currentBieon || !selectedHub) return;

    try {
      const token = localStorage.getItem('token');

      const actionCategory = chosenCategory || (dev.type?.toLowerCase().includes("plug") ? "control" : "sensor");
      const isAirguard = dev.id.includes("SNZB-02DR2") || dev.id.includes("SNZB_02DR2");
      const isSmartPlug = dev.id.includes("S60BTPF") || dev.id.includes("S60ZBTPF");
      const isBluecheck = dev.id.toLowerCase().includes("bluecheck") || dev.name.toLowerCase().includes("bluecheck");

      let category = actionCategory;
      let aspect = "kenyamanan";
      if (chosenCategory) {
        if (category === "control") aspect = dev.type.toLowerCase().includes("plug") ? "smart-plug" : "smart-switch";
        else aspect = determineSensorAspect(dev);
      } else {
        if (isAirguard) aspect = "kenyamanan";
        else if (isSmartPlug) category = "control", aspect = "smart-plug";
        else if (isBluecheck) aspect = "kualitasAir";
      }

      const typeLabel = actionCategory === "sensor" ? (dev.type || "Sensor") : (dev.type || "Control Actuator");
      const { backendCategory, backendType, backendControl, backendAspect } = mapToBackendData(category, typeLabel, "manual", aspect);

      const activeHomeownerId = localStorage.getItem('bieon_active_homeowner_id');
      const targetOwnerId = (isTechnicianMode && activeHomeownerId) ? activeHomeownerId : userProfile._id;

      const deviceData = {
        name: dev.name,
        productId: dev.id,
        deviceType: backendType,
        category: backendCategory,
        location: "Ruangan Utama",
        notes: "Quick Saved",
        hubId: selectedHub.id || selectedHub._id,
        bieonId: currentBieon.bieonId,
        ownerId: targetOwnerId,
        controlMode: backendControl,
        environmentAspect: backendAspect,
        sensorParams: null,
        scheduleSettings: null,
        sensorData: category === "sensor" ? generateMockSensorData(dev.type) : null,
        onlyRegister: true, // TAMBAHKAN INI: Agar cuma masuk ke list "Perangkat Terdaftar"
      };

      const response = await fetch('/api/kendaliperangkat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deviceData)
      });

      const text = await response.text();
      console.log("Raw response:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response (Status: ${response.status}): ${text.substring(0, 50)}`);
      }

      if (!response.ok) throw new Error(data.error || data.message || 'Gagal menyimpan perangkat');

      // Update local state (Hanya jika device benar-benar dibuat, untuk Quick Register biasanya cuma product)
      if (data.device) {
        const savedDevice = { ...data.device, id: data.device._id };
        const updatedHubs = currentBieon.hubs.map((hub) => {
          if (hub.id === selectedHub.id) {
            return { ...hub, devices: [...hub.devices, savedDevice] };
          }
          return hub;
        });

        const updatedBieon = { ...currentBieon, hubs: updatedHubs };
        setBieonSystems(bieonSystems.map((b) => b.id === currentBieon.id ? updatedBieon : b));
        setCurrentBieon(updatedBieon);
      }

      // Hapus dari pool Scanning & Temuan
      setJoinedDevicesPool(prev => prev.filter(id => id !== dev.id));
      setDiscoveredDevices(prev => prev.filter(d => d.id !== dev.id));

      alert(data.message || `Berhasil! ${dev.name} telah terdaftar.`);

      // Refresh produk terdaftar dulu biar sinkron
      await fetchRegisteredProducts();
      // Jangan setStep("select-category") di sini agar modal Open Join tidak tertutup
      // biarkan user tetap di modal Open Join untuk mengelola perangkat lainnya

    } catch (error) {
      console.error('Quick Save Error:', error);
      alert(`Gagal simpan: ${error.message}`);
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

      const productIdValue = selectedProduct?.productId || selectedProduct?.id || pendingOpenJoinDevice?.id || pendingOpenJoinDevice?.device_ieee || deviceForm?.name || null;
      if (!productIdValue) {
        alert('Product ID tidak tersedia. Pilih produk terlebih dahulu atau gunakan fitur Quick Save agar sistem dapat mendaftarkan productId.');
        return;
      }

      const deviceData = {
        name: deviceForm.name,
        productId: productIdValue,
        deviceType: backendType,
        category: backendCategory,
        location: deviceForm.location,
        notes: deviceForm.notes,
        hubId: selectedHub.id,
        bieonId: currentBieon.bieonId,
        ownerId: targetOwnerId,
        controlMode: backendControl,
        environmentAspect: backendAspect,
        controlledDevice: remoteTargets.map(t => remoteRooms[t] ? `${t} (${remoteRooms[t]})` : t).join(", "),
        sensorParams: (selectedCategory === "sensor" || backendControl === "Lingkungan") ? transformSensorParams(sensorConfig, activeSensorAspect) : null,
        scheduleSettings: configMode === "schedule" ? scheduleConfig : null,
        sensorData: selectedCategory === "sensor" ? generateMockSensorData(selectedDeviceType) : null,
        remoteConfig: targetConfigs
      };

      const editingId = isEditingDevice; // Capture current state
      const endpoint = editingId
        ? `/api/kendaliperangkat/configure/${editingId}`
        : '/api/kendaliperangkat';
      const method = editingId ? 'PUT' : 'POST';

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
        status: "0",
        installedDate: data.device.createdAt,
        sensorParams: data.device.thresholds // MEMETAKAN PARAMETER!
      };

      // Update local state
      const updatedHubs = currentBieon.hubs.map((hub) => {
        if (hub.id === selectedHub.id) {
          // Jika edit, hapus yang lama lalu masukkan yang baru. Jika baru, langsung push.
          const filteredDevices = editingId
            ? hub.devices.filter(d => d.id !== editingId)
            : hub.devices;
          return { ...hub, devices: [...filteredDevices, savedDevice] };
        }
        return hub;
      });

      const updatedBieon = { ...currentBieon, hubs: updatedHubs };
      setBieonSystems(bieonSystems.map((b) => b.id === currentBieon.id ? updatedBieon : b));
      setCurrentBieon(updatedBieon);

      // REMOVE FROM POOL: Jika ini perangkat baru, hapus dari antrean terpilih setelah sukses simpan
      if (!editingId) {
        setJoinedDevicesPool(prev => prev.filter(id => id !== (selectedProduct?.productId || selectedProduct?.id)));
      }

      await fetchRegisteredProducts();

      resetForm();
      setIsEditingDevice(null);
      setStep("view-bieon");
      alert(editingId ? "Perangkat berhasil diperbarui!" : "Perangkat berhasil ditambahkan ke database!");
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
    setRemoteTargets([]);
    setRemoteRooms({});
    setTargetConfigs({});
    setIsEditingDevice(null);
  };
  const findDeviceById = (deviceId) => {
    let found = null;
    for (const sys of bieonSystems) {
      for (const hub of sys.hubs) {
        const d = hub.devices.find(dv => String(dv._id) === String(deviceId) || String(dv.id) === String(deviceId) || String(dv.device_ieee) === String(deviceId));
        if (d) return d;
      }
    }
    return found;
  };

  const toggleDevicePower = async (deviceIdOrObj) => {
    try {
      const deviceObj = typeof deviceIdOrObj === 'object' ? deviceIdOrObj : findDeviceById(deviceIdOrObj);
      if (!deviceObj) return;

      const deviceId = String(deviceObj._id || deviceObj.id || '');
      const ieeeKey = String(deviceObj.device_ieee || deviceObj.ieee || '').trim().toUpperCase();
      const newStatus = String(deviceObj.status) === '1' ? '0' : '1';

      // Update UI immediately, no waiting for telemetry confirmation.
      setBieonSystems(prev => prev.map(system => ({
        ...system,
        hubs: system.hubs.map(hub => ({
          ...hub,
          devices: hub.devices.map(device => {
            const matchesById = String(device._id || device.id || '') === deviceId;
            const matchesByIeee = ieeeKey && String(device.device_ieee || device.ieee || '').trim().toUpperCase() === ieeeKey;
            return (matchesById || matchesByIeee)
              ? { ...device, status: newStatus, isToggling: true }
              : device;
          })
        }))
      })));

      const response = await fetch(`/api/kendaliperangkat/${deviceId}/toggle`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal mengubah status perangkat");
      }

      setBieonSystems(prev => prev.map(system => ({
        ...system,
        hubs: system.hubs.map(hub => ({
          ...hub,
          devices: hub.devices.map(device => {
            const matchesById = String(device._id || device.id || '') === deviceId;
            const matchesByIeee = ieeeKey && String(device.device_ieee || device.ieee || '').trim().toUpperCase() === ieeeKey;
            return (matchesById || matchesByIeee)
              ? { ...device, isToggling: false }
              : device;
          })
        }))
      })));
    } catch (error) {
      alert("Gagal mengirim perintah: " + error.message);
      setBieonSystems(prev => prev.map(system => ({
        ...system,
        hubs: system.hubs.map(hub => ({
          ...hub,
          devices: hub.devices.map(device => ({ ...device, isToggling: false }))
        }))
      })));
    }
  };
  const updateDeviceControl = async (deviceId, controlType, value) => {
    // 1. Optimistic Update (Local State)
    const updatedSystems = bieonSystems.map((system) => ({
      ...system,
      hubs: system.hubs.map((hub) => ({
        ...hub,
        devices: hub.devices.map(
          (device) => device.id === deviceId ? {
            ...device,
            controls: { ...device.controls, [controlType]: value },
            lastActivity: (new Date()).toISOString()
          } : device
        )
      }))
    }));
    setBieonSystems(updatedSystems);

    // 2. Persistent Update (Backend API)
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/kendaliperangkat/${deviceId}/params`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ controlType, value })
      });
    } catch (err) {
      console.error("Gagal update parameter di backend:", err);
    }
  };

  const handleSendRemoteCommand = async (device, mapping) => {
    if (!device?.id || !mapping) return;

    const payload = {
      catalogId: mapping.catalogId,
      rawSignature: mapping.rawSignature,
      rawBitText: mapping.rawBitText,
      rawBitHex: mapping.rawBitHex,
      rawBitBinary: mapping.rawBitBinary,
      sourceRemoteIeee: mapping.sourceRemoteIeee,
      sourceRemoteId: mapping.sourceRemoteId,
      functionKey: mapping.functionKey,
      functionLabel: mapping.functionLabel,
      label: mapping.label
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/kendaliperangkat/${device.id}/remote-command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gagal mengirim perintah remote:', errorData);
      }
    } catch (err) {
      console.error('Gagal publish remote command:', err);
    }
  };

  const deleteDevice = async (deviceId, options = {}) => {
    const {
      requireConfirmation = true,
      showSuccessAlert = true,
      showErrorAlert = true
    } = options;

    if (requireConfirmation && !confirm("Yakin ingin menghapus device ini?")) return false;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/kendaliperangkat/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Gagal menghapus perangkat");
      }

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
      await fetchRegisteredProducts();
      if (showSuccessAlert) {
        alert("Perangkat berhasil dihapus dari database!");
      }
      return true;
    } catch (error) {
      if (showErrorAlert) {
        alert("Error: " + error.message);
      }
      console.error("Error delete device:", error);
      return false;
    }
  };

  const togglePinDevice = async (deviceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/kendaliperangkat/${deviceId}/pin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal menyematkan perangkat");
      }

      // Update local state
      setBieonSystems(prevSystems => prevSystems.map(system => ({
        ...system,
        hubs: system.hubs.map(hub => ({
          ...hub,
          devices: hub.devices.map(dev =>
            (dev._id === deviceId || dev.id === deviceId) ? { ...dev, isPinned: data.device.isPinned } : dev
          )
        }))
      })));

      // Also update currentBieon if needed
      if (currentBieon) {
        setCurrentBieon(prev => ({
          ...prev,
          hubs: prev.hubs.map(hub => ({
            ...hub,
            devices: hub.devices.map(dev =>
              (dev._id === deviceId || dev.id === deviceId) ? { ...dev, isPinned: data.device.isPinned } : dev
            )
          }))
        }));
      }

    } catch (error) {
      alert(error.message);
    }
  };
  const handleEditDevice = (device) => {
    setIsEditingDevice(device.id);

    // Populate Basic Info
    setDeviceForm({
      name: device.name,
      location: device.location,
      notes: (device.notes === "Quick Saved" || device.thresholds?.notes === "Quick Saved") ? "" : (device.notes || device.thresholds?.notes || "")
    });

    // Populate Remote Target
    // Populate Remote Target
    if (device.controlledDevice) {
      const targets = [];
      const roomsMap = {};

      const rawTargets = typeof device.controlledDevice === 'string'
        ? device.controlledDevice.split(",").map(t => t.trim()).filter(Boolean)
        : (Array.isArray(device.controlledDevice) ? device.controlledDevice : []);

      rawTargets.forEach(rt => {
        // Cek format "Type (Room)"
        const match = rt.match(/(.+)\s\((.+)\)/);
        if (match) {
          const type = match[1].trim();
          const room = match[2].trim();
          targets.push(type);
          roomsMap[type] = room;
        } else {
          targets.push(rt);
        }
      });

      setRemoteTargets(targets);
      setRemoteRooms(roomsMap);

      // Populate Target Configs if exists
      if (device.remoteConfig) {
        setTargetConfigs(device.remoteConfig);
      } else {
        // Fallback or default
        const initialConfigs = {};
        targets.forEach(t => {
          initialConfigs[t] = { mode: device.controlMethod === 'manual' ? 'manual' : (device.controlMethod === 'sensor' || device.controlMethod === 'Lingkungan' ? 'sensor' : 'schedule'), aspect: device.environmentAspect || 'none' };
        });
        setTargetConfigs(initialConfigs);
      }
    }

    // Normalisasi kategori dari backend ("Sensor" / "Control Actuator System") kembali ke format state frontend ("sensor" / "control")
    const isSensorMode = (device.category || "").toLowerCase() === "sensor";
    const mappedCategory = isSensorMode ? "sensor" : "control";

    setSelectedCategory(mappedCategory);
    setIsEditingDevice(device.id);

    let actualDeviceType = device.type || device.deviceType || "";
    const devNameLower = (device.name || "").toLowerCase();

    // Auto-correct device type based on name if it's a sensor
    if (mappedCategory === "sensor") {
      if (devNameLower.includes("water") || devNameLower.includes("bluecheck")) {
        actualDeviceType = "Sensor Kualitas Air";
      } else if (devNameLower.includes("sonoff") || devNameLower.includes("th snzb") || devNameLower.includes("kenyamanan") || devNameLower.includes("airguard")) {
        actualDeviceType = "Sensor Kenyamanan";
      }
    }

    // Normalize type for modal options
    const normalizedType = actualDeviceType.toLowerCase().includes('remote') ? 'remote' :
      actualDeviceType.toLowerCase().includes('switch') ? 'smart-switch' :
        actualDeviceType.toLowerCase().includes('plug') ? 'smart-plug' :
          actualDeviceType;

    setSelectedDeviceType(normalizedType);

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
    const isRemote = selectedProduct?.aspect === 'remote' || selectedDeviceType.toLowerCase().includes('remote');
    const target = isRemote ? (activeConfigTarget || remoteTargets[0]) : null;
    setScheduleConfig([
      ...scheduleConfig,
      {
        enabled: true,
        startTime: "08:00",
        endTime: "17:00",
        days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
        action: "ON",
        target: target
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

  // [ADD] Dynamic Rooms based on current BIEON devices
  const dynamicRooms = useMemo(() => {
    if (!currentBieon) return [];
    const devices = currentBieon.hubs.flatMap(h => h.devices);
    const roomsFound = devices
      .map(d => d.location)
      .filter(loc => loc && loc !== 'Pending');
    return [...new Set(roomsFound)].sort();
  }, [currentBieon]);

  const getFilteredDevices = () => {
    let devices = currentBieon ? currentBieon.hubs.flatMap((hub) => hub.devices) : getAllDevices();

    // 1. Filter berdasarkan Ruangan
    if (selectedRoom !== "all") {
      devices = devices.filter((device) => device.location === selectedRoom);
    }

    // 2. Filter berdasarkan Kategori (Sensor / Aktuator)
    if (activeFilterCategory !== "all") {
      devices = devices.filter((device) => {
        const categoryKey = getDeviceCategoryKey(device);

        if (activeFilterCategory === "sensor") {
          return categoryKey === "sensor";
        }
        if (activeFilterCategory === "control") {
          return categoryKey === "control";
        }
        return true;
      });
    }

    // 3. Sembunyikan perangkat yang belum diatur (Quick Saved)
    devices = devices.filter((device) => device.notes !== "Quick Saved" && device.thresholds?.notes !== "Quick Saved");

    // 4. Filter berdasarkan Pencarian (Nama / ID)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      devices = devices.filter((device) =>
        device.name.toLowerCase().includes(q) ||
        device.id.toLowerCase().includes(q)
      );
    }

    // 4. Urutkan: Pinned dulu (max 2), baru tanggal instalasi terbaru
    return [...devices].sort((a, b) => {
      // Prioritaskan yang di-pin
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Jika sama-sama di-pin atau sama-sama tidak, urutkan berdasarkan tanggal terbaru
      return new Date(b.installedDate) - new Date(a.installedDate);
    });
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

  const getDeviceCategoryKey = (device) => {
    const category = String(device.category || "").trim().toLowerCase();
    const type = String(device.type || device.deviceType || "").trim().toLowerCase();

    if (category.includes("sensor")) return "sensor";
    if (category.includes("control") || category.includes("actuator") || category.includes("remote")) return "control";
    if (type.includes("sensor")) return "sensor";
    if (type.includes("plug") || type.includes("switch") || type.includes("remote") || type.includes("control")) return "control";
    return "";
  };

  const getDeviceCategoryLabel = (device) => {
    const value = String(device.category || device.type || device.deviceType || "").trim();
    return value || "Device";
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
            <div className="w-16 h-16 border-4 border-bieon-eco border-t-transparent rounded-full animate-spin mb-4"></div>
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
                    <Settings className="w-5 h-5 text-bieon-eco" />
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
                      className="px-5 py-2.5 bg-white border-2 border-bieon-eco/20 text-bieon-eco rounded-2xl  hover:bg-bieon-eco/5 transition-all shadow-sm flex items-center gap-2"
                    >
                      <Radio className="w-5 h-5" />
                      <span>Akses Teknisi</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            { /* ==================== STEP: IDLE (Dashboard) ==================== */}
            {lastPageStep === "idle" && (
              <div>
                {bieonSystems.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gradient-to-br from-bieon-eco/20 to-bieon-sense/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Home className="w-12 h-12 text-bieon-eco" />
                    </div>
                    <h2 className="text-2xl  text-gray-900 mb-3">Belum Ada Sistem BIEON</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Mulai dengan menambahkan sistem BIEON Anda untuk mengelola smart devices
                    </p>
                    {!isTechnicianMode && (
                      <button
                        onClick={() => setStep("input-id")}
                        className="px-8 py-4 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl  shadow-lg hover:shadow-xl transition-all"
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
                          <div className="w-12 h-12 bg-gradient-to-br from-bieon-eco to-bieon-sense rounded-xl flex items-center justify-center">
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
                            <p className="text-2xl  text-gray-900">{bieonSystems.reduce((sum, b) => sum + (Number(b.totalHubs) || 0), 0)}</p>
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
                            <p className="text-2xl  text-gray-900">
                              {getAllDevices().filter((d) => {
                                const isRemote = d.controlledDevice && d.controlledDevice.trim() !== "";
                                const isAnySubOn = d.controls && Object.keys(d.controls).some(key => key.endsWith('_power') && d.controls[key] === 1);
                                return String(d.status) === "1" || (isRemote && isAnySubOn);
                              }).length}
                            </p>
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
                            className="flex items-center gap-2 px-4 py-2 bg-bieon-eco text-white rounded-lg  hover:bg-bieon-eco/90 transition-all shadow-md active:scale-95"
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
                            className="border-2 border-gray-200 rounded-xl p-6 hover:border-bieon-eco hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => {
                              setCurrentBieon(bieon);
                              setSelectedRoom("all");
                              setStep("view-bieon");
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-bieon-eco to-bieon-sense rounded-xl flex items-center justify-center">
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bieon-eco"
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
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl  shadow-lg hover:shadow-xl transition-all"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            { /* ==================== STEP: VIEW BIEON INFO ==================== */}
            {lastPageStep === "view-bieon" && currentBieon && (
              <div>
                { /* BIEON Info Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 sm:mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{currentBieon.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">ID: {currentBieon.bieonId}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-bieon-eco" />
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
                        className="flex items-center gap-2 px-4 py-2 bg-bieon-eco text-white rounded-lg font-bold hover:bg-bieon-eco/90 transition-all self-start"
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
                        className="bg-gradient-to-br from-bieon-eco/5 to-bieon-sense/5 border-2 border-bieon-eco/30 rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all text-left flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-bieon-eco to-bieon-sense rounded-lg flex items-center justify-center">
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
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${hub.status === "active" ? "bg-bieon-eco/10 text-bieon-eco/90" : "bg-gray-100 text-gray-600"}`}>
                                {hub.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectHub(hub)}
                          className="mt-6 w-full py-2.5 bg-bieon-eco text-white font-bold rounded-lg hover:bg-bieon-eco/90 transition-colors flex justify-center items-center gap-2 shadow-sm"
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
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedRoom === "all" ? "bg-gradient-to-r from-bieon-eco to-green-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      Semua Ruangan ({currentBieon?.hubs.flatMap(h => h.devices).length || 0})
                    </button>
                    {dynamicRooms.map((room) => {
                      const allBieonDevices = currentBieon ? currentBieon.hubs.flatMap(h => h.devices) : [];
                      const deviceCount = allBieonDevices.filter((d) => d.location === room).length;
                      return (
                        <button
                          key={room}
                          onClick={() => setSelectedRoom(room)}
                          className={`px-4 py-2 rounded-lg transition-all font-semibold ${selectedRoom === room ? "bg-gradient-to-r from-bieon-eco to-green-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                          {room} ({deviceCount})
                        </button>
                      );
                    })}
                  </div>
                </div>
                { /* Device List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Kendali Perangkat</h2>
                      <p className="text-sm text-gray-500 mt-1 font-medium">CRUD, kontrol manual, status, dan detail perangkat</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {/* Search Bar */}
                      <div className="relative w-full sm:w-64 group">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-bieon-eco transition-colors" />
                        <input
                          type="text"
                          placeholder="Cari perangkat..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-bieon-eco focus:bg-white transition-all shadow-sm"
                        />
                      </div>

                      {/* Category Filter */}
                      <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                        <button
                          onClick={() => setActiveFilterCategory("all")}
                          className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFilterCategory === "all" ? "bg-white text-bieon-eco shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          Semua
                        </button>
                        <button
                          onClick={() => setActiveFilterCategory("sensor")}
                          className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFilterCategory === "sensor" ? "bg-white text-bieon-eco shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          Sensor
                        </button>
                        <button
                          onClick={() => setActiveFilterCategory("control")}
                          className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFilterCategory === "control" ? "bg-white text-bieon-eco shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          Aktuator
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* --- WIDGET RINGKASAN DATA REAL-TIME --- */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {getAllDevices()
                      .filter(d => d.category?.toLowerCase() === "sensor" && d.currentValues?.temperature !== undefined)
                      .slice(0, 3) // Ambil maksimal 3 sensor suhu saja
                      .map((sensor) => (
                        <div key={sensor.id} className="bg-white p-4 rounded-xl border border-bieon-eco/20 shadow-sm flex items-center justify-between">
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

                  {getFilteredDevices().length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">Belum ada device di ruangan ini</p>
                    </div>
                  )}

                  {getFilteredDevices().length > 0 && (
                    <div className="space-y-4">
                      {getFilteredDevices().map((device) => {
                        const isRemote = (device.controlledDevice && device.controlledDevice.trim() !== "");
                        const deviceCategoryKey = getDeviceCategoryKey(device);
                        const deviceCategoryLabel = getDeviceCategoryLabel(device);
                        const isAnySubOn = device.controls && Object.keys(device.controls).some(key => key.endsWith('_power') && device.controls[key] === 1);
                        const isActuallyOn = String(device.status) === "1" || (isRemote && isAnySubOn);
                        const isWaterQuality = (device.deviceType === "Kualitas Air" || device.deviceType === "Sensor Kualitas Air" || device.environmentAspect?.toLowerCase() === "kualitas air" || (device.name || "").toLowerCase().includes("bluecheck"));
                        const isActuatorDevice = (
                          (Array.isArray(device.remoteMappings) && device.remoteMappings.length > 0) ||
                          (Array.isArray(device.remoteState?.mappings) && device.remoteState.mappings.length > 0) ||
                          (String(device.controlledDevice || '').trim() !== '') ||
                          deviceCategoryKey !== 'sensor'
                        );
                        const currentRemoteCatalog = remoteBitCatalogByBieon[currentBieon?.bieonId] || [];
                        const currentRemoteRegistration = remoteRegistrationStateByBieon[currentBieon?.bieonId] || null;
                        const deviceRemoteMappings = Array.isArray(device.remoteMappings)
                          ? device.remoteMappings
                          : Array.isArray(device.remoteState?.mappings)
                            ? device.remoteState.mappings
                            : [];
                        const deviceRemoteProfiles = groupRemoteMappings(deviceRemoteMappings);
                        const hasRemoteProfile = deviceRemoteProfiles.length > 0;

                        return (
                          <div
                            key={device.id}
                            id={`device-${device.id}`}
                            className={`border border-gray-200 rounded-xl p-4 sm:p-5 transition-all ${expandedDevice === device.id ? "shadow-md bg-white ring-2 ring-bieon-eco" : "hover:shadow-md bg-white"}`}
                          >
                            {/* Slim Header - Always visible */}
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedDevice(expandedDevice === device.id ? null : device.id)}>
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                  deviceCategoryKey === "sensor"
                                    ? "bg-bieon-eco shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                    : (isActuallyOn ? "bg-bieon-eco shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-gray-900")
                                }`}>
                                  {deviceCategoryKey === "sensor" ? (
                                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                  ) : (
                                    <Power className={`w-5 h-5 sm:w-6 sm:h-6 ${isActuallyOn ? "text-white" : "text-bieon-eco/90"}`} />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-lg truncate">{device.name || formatModelDisplay(device.model || device.deviceType || device.name)}</h3>
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-3 mt-1">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-600">{device.deviceType} • {device.location}</span>
                                    <span className="text-xs sm:text-sm font-semibold text-gray-500">IEEE: {formatIeeeDisplay(device.device_ieee || device.id)}</span>
                                    {getDeviceCategoryKey(device) === "sensor" ? (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-bieon-eco/10 text-bieon-eco/90 shadow-sm border border-bieon-eco/30">
                                        {getDeviceCategoryLabel(device).toUpperCase()}
                                      </span>
                                    ) : (
                                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${isActuallyOn ? "bg-bieon-eco/10 text-bieon-eco/90 shadow-sm border border-bieon-eco/30" : "bg-gray-800 text-gray-300 border border-gray-700"}`}>
                                        {isActuallyOn ? "ON / ACTIVE" : "OFF / STANDBY"}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1 hidden sm:block italic">Manufacture: {device.manufacturer || '-'}</p>
                                  {(device.notes || device.thresholds?.notes) && (
                                    <p className="text-[10px] text-bieon-eco font-medium mt-1 bg-bieon-eco/5 px-2 py-0.5 rounded-md w-fit border border-bieon-eco/20 italic">
                                      "{device.notes || device.thresholds.notes}"
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePinDevice(device.id);
                                  }}
                                  className={`p-2 rounded-lg transition-all ${device.isPinned ? "text-bieon-eco bg-bieon-eco/5" : "text-gray-300 hover:text-gray-500 hover:bg-gray-50"}`}
                                  title={device.isPinned ? "Lepas Sematan" : "Sematkan di Atas"}
                                >
                                  {device.isPinned ? <Pin className="w-5 h-5 fill-bieon-eco" /> : <PinOff className="w-5 h-5" />}
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                  {expandedDevice === device.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                </button>
                              </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedDevice === device.id && (
                              <div className="mt-5 pt-5 border-t border-gray-100">

                                {/* NEW: HASIL MONITORING REAL-TIME SECTION */}
                                {(device.category?.toLowerCase() === 'sensor' || device.type?.toLowerCase() === 'sensor') && (() => {
                                  const hasParams = device.sensorParams && Object.keys(device.sensorParams).length > 0;
                                  
                                  if (isWaterQuality) {
                                    const showPh = !hasParams || device.sensorParams?.ph !== undefined;
                                    const showTurbidity = !hasParams || device.sensorParams?.turbidity !== undefined;
                                    const showTds = !hasParams || device.sensorParams?.tds !== undefined;
                                    const showWaterTemp = !hasParams || device.sensorParams?.temperature !== undefined;
                                    
                                    return (
                                      <div className="mb-8 animate-in fade-in duration-500">
                                        <p className="text-[10px] font-black text-bieon-eco uppercase tracking-widest mb-4">Hasil Monitoring Real-time</p>
                                        <div className="flex flex-row gap-4 overflow-x-auto pb-2 scrollbar-thin">
                                          {showPh && (
                                            <div className="bg-gradient-to-br from-cyan-50 to-white p-4 rounded-2xl border border-cyan-100 shadow-sm transition-all hover:shadow-md flex-1 min-w-[140px] sm:min-w-0">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Beaker className="w-4 h-4 text-cyan-500" />
                                                <span className="text-xs font-bold text-gray-500">pH Air</span>
                                              </div>
                                              <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-gray-900">
                                                  {device.currentValues?.ph !== undefined ? parseFloat(device.currentValues.ph).toFixed(1) : '--.-'}
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {showTurbidity && (
                                            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl border border-blue-100 shadow-sm transition-all hover:shadow-md flex-1 min-w-[140px] sm:min-w-0">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Waves className="w-4 h-4 text-blue-500 animate-pulse" />
                                                <span className="text-xs font-bold text-gray-500">Kekeruhan</span>
                                              </div>
                                              <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-gray-900">
                                                  {device.currentValues?.turbidity !== undefined ? parseFloat(device.currentValues.turbidity).toFixed(0) : '--'}
                                                </span>
                                                <span className="text-sm font-bold text-gray-400 font-bold ml-1">NTU</span>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {showTds && (
                                            <div className="bg-gradient-to-br from-teal-50 to-white p-4 rounded-2xl border border-teal-100 shadow-sm transition-all hover:shadow-md flex-1 min-w-[140px] sm:min-w-0">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Droplets className="w-4 h-4 text-teal-500" />
                                                <span className="text-xs font-bold text-gray-500">TDS</span>
                                              </div>
                                              <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-gray-900">
                                                  {device.currentValues?.tds !== undefined ? parseFloat(device.currentValues.tds).toFixed(0) : '--'}
                                                </span>
                                                <span className="text-sm font-bold text-gray-400 font-bold ml-1">mg/L</span>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {showWaterTemp && (
                                            <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-2xl border border-orange-100 shadow-sm transition-all hover:shadow-md flex-1 min-w-[140px] sm:min-w-0">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Thermometer className="w-4 h-4 text-orange-500" />
                                                <span className="text-xs font-bold text-gray-500">Suhu Air</span>
                                              </div>
                                              <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-gray-900">
                                                  {device.currentValues?.waterTemp !== undefined 
                                                    ? parseFloat(device.currentValues.waterTemp).toFixed(1) 
                                                    : (device.currentValues?.temperature !== undefined 
                                                        ? parseFloat(device.currentValues.temperature).toFixed(1) 
                                                        : '--.-')}
                                                </span>
                                                <span className="text-sm font-bold text-gray-400 font-bold ml-1">°C</span>
                                              </div>
                                            </div>
                                          )}
                                          
                                          <div className="bg-gradient-to-br from-bieon-eco/5 to-white p-4 rounded-2xl border border-bieon-eco/20 shadow-sm transition-all hover:shadow-md flex-1 min-w-[140px] sm:min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Zap className="w-4 h-4 text-bieon-eco" />
                                              <span className="text-xs font-bold text-gray-500">Baterai Alat</span>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                              <span className="text-2xl font-black text-gray-900">
                                                {device.battery || '--'}
                                              </span>
                                              <span className="text-sm font-bold text-gray-400 font-bold ml-1">%</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  // Default for Comfort or other sensors
                                  const showTemp = !hasParams || device.sensorParams?.temperature !== undefined;
                                  const showHumid = !hasParams || device.sensorParams?.humidity !== undefined;
                                  
                                  return (
                                    <div className="mb-8 animate-in fade-in duration-500">
                                      <p className="text-[10px] font-black text-bieon-eco uppercase tracking-widest mb-4">Hasil Monitoring Real-time</p>
                                      <div className="flex flex-row gap-4 overflow-x-auto pb-2 scrollbar-thin">
                                        {showTemp && (
                                          <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-2xl border border-orange-100 shadow-sm transition-all hover:shadow-md flex-1 min-w-[140px] sm:min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Thermometer className="w-4 h-4 text-orange-500" />
                                              <span className="text-xs font-bold text-gray-500">Suhu Sekarang</span>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                              <span className="text-2xl font-black text-gray-900">
                                                {device.currentValues?.temperature?.toFixed(1) || '--.-'}
                                              </span>
                                              <span className="text-sm font-bold text-gray-400 font-bold ml-1">°C</span>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {showHumid && (
                                          <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl border border-blue-100 shadow-sm transition-all hover:shadow-md flex-1 min-w-[140px] sm:min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Droplets className="w-4 h-4 text-blue-500" />
                                              <span className="text-xs font-bold text-gray-500">Kelembapan</span>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                              <span className="text-2xl font-black text-gray-900">
                                                {device.currentValues?.humidity?.toFixed(1) || '--.-'}
                                              </span>
                                              <span className="text-sm font-bold text-gray-400 font-bold ml-1">%</span>
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div className="bg-gradient-to-br from-bieon-eco/5 to-white p-4 rounded-2xl border border-bieon-eco/20 shadow-sm transition-all hover:shadow-md flex-1 min-w-[140px] sm:min-w-0">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Zap className="w-4 h-4 text-bieon-eco" />
                                            <span className="text-xs font-bold text-gray-500">Baterai Alat</span>
                                          </div>
                                          <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-gray-900">
                                              {device.battery || '--'}
                                            </span>
                                            <span className="text-sm font-bold text-gray-400 font-bold ml-1">%</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Configuration Context Section - Hidden for Technicians or if no mode */}
                                {!isTechnicianMode && device.controlMethod && (
                                  <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-4">
                                      <p className="text-sm  text-gray-700 flex items-center gap-2">
                                        Mode: <span className={`${(device.category === "sensor" || device.controlMethod === "Lingkungan" || device.controlMethod === "sensor") ? "text-bieon-eco bg-bieon-eco/5" : (device.controlMethod === "Manual" || device.controlMethod === "manual" ? "text-blue-600 bg-blue-50" : (device.controlMethod ? "text-purple-600 bg-purple-50" : "text-gray-500 bg-gray-100"))}  px-2 py-0.5 rounded capitalize`}>
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
                                                    <span className="text-xs text-gray-700">
                                                      {key === "temperature" ? (isWaterQuality ? "Suhu Air" : "Suhu") :
                                                        key === "humidity" ? "Lembap" :
                                                          key === "isMotionEnabled" ? "Gerakan" :
                                                            key === "isDoorEnabled" ? "Buka Pintu" :
                                                              key === "ph" ? "pH" :
                                                                key === "turbidity" ? "Kekeruhan" :
                                                                  key === "tds" ? "TDS" : "Suhu Air"}:
                                                      {val !== undefined ? ` > ${val}${(key === "temperature" || key === "waterTemp") ? "°C" : key === "humidity" ? "%" : ""}` : " (Aktif)"}
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

                                {!isTechnicianMode && isActuatorDevice && (
                                  <div className="mb-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                                      <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Remote Registration</p>
                                        <h4 className="text-sm font-bold text-gray-900 mt-1">Raw bit catalog untuk {device.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {currentRemoteRegistration?.active ? 'Mode registrasi aktif. Tekan tombol remote untuk menangkap raw bit.' : 'Tekan Register untuk memulai tangkap raw bit.'}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${currentRemoteRegistration?.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                          {currentRemoteRegistration?.active ? 'Registering' : 'Idle'}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleStartRemoteRegistration(device)}
                                          className="px-4 py-2 rounded-xl bg-bieon-eco text-white text-xs font-black uppercase tracking-widest shadow-sm hover:bg-bieon-eco/90 transition-all"
                                        >
                                          Register
                                        </button>
                                      </div>
                                    </div>

                                    {remoteRegistrationDeviceId === device.id && (
                                      <div className="space-y-3">
                                        {remoteCatalogLoading && currentRemoteCatalog.length === 0 ? (
                                          <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center text-xs text-gray-500">
                                            Memuat katalog raw bit...
                                          </div>
                                        ) : currentRemoteCatalog.length === 0 ? (
                                          <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center text-xs text-gray-500">
                                            Belum ada raw bit yang tertangkap.
                                          </div>
                                        ) : (
                                          currentRemoteCatalog.map((bitItem) => {
                                            const isSelected = remoteMappingDraft?.catalogId === bitItem._id;
                                            const isMapped = String(bitItem.captureStatus) === 'mapped';
                                            return (
                                              <div key={bitItem._id || bitItem.rawSignature} className={`rounded-2xl border p-4 transition-all ${isSelected ? 'border-bieon-eco bg-bieon-eco/5 shadow-sm' : 'border-gray-200 bg-white'}`}>
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                  <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">
                                                        {bitItem.protocol || 'raw'}
                                                      </span>
                                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${isMapped ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                        {isMapped ? 'Mapped' : 'Captured'}
                                                      </span>
                                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">
                                                        x{bitItem.captureCount || 1}
                                                      </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900 break-all">{extractBitsFromCatalog(bitItem)}</p>
                                                    <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-gray-500">
                                                      <span>Remote: {bitItem.sourceRemoteIeee || bitItem.sourceRemoteId || '-'}</span>
                                                      <span>Seen: {bitItem.lastSeenAt ? new Date(bitItem.lastSeenAt).toLocaleString('id-ID') : '-'}</span>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                      type="button"
                                                      onClick={() => handleOpenRemoteMapping(device, bitItem)}
                                                      className="w-10 h-10 rounded-xl bg-bieon-eco text-white flex items-center justify-center hover:bg-bieon-eco/90 transition-all"
                                                      title="Tambah mapping"
                                                    >
                                                      <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => handleDisableRemoteBit(bitItem)}
                                                      className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center hover:bg-red-100 transition-all"
                                                      title="Hapus raw bit"
                                                    >
                                                      <Minus className="w-4 h-4" />
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>
                                    )}

                                    {remoteRegistrationDeviceId === device.id && remoteMappingDraft?.deviceId === device.id && (
                                      <div className="mt-4 p-4 rounded-2xl border border-bieon-eco/20 bg-bieon-eco/5">
                                        <div className="flex items-center justify-between gap-3 mb-4">
                                          <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-bieon-eco">Mapping Bit</p>
                                              <p className="text-sm font-bold text-gray-900 break-all mt-1">{extractBitsFromCatalog(remoteMappingDraft)}</p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={handleCancelRemoteMapping}
                                            className="p-2 rounded-lg text-gray-500 hover:bg-white transition-all"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Jenis Perangkat</label>
                                            <select
                                              value={remoteMappingDraft.deviceType}
                                              onChange={(e) => setRemoteMappingDraft(prev => ({ ...prev, deviceType: e.target.value, functionKey: getRemoteFunctionOptions(e.target.value)[0]?.value || 'power' }))}
                                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-bieon-eco"
                                            >
                                              {REMOTE_DEVICE_TYPES.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                              ))}
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Fungsi</label>
                                            <select
                                              value={remoteMappingDraft.functionKey}
                                              onChange={(e) => setRemoteMappingDraft(prev => ({ ...prev, functionKey: e.target.value, functionLabel: getRemoteFunctionLabel(prev.deviceType, e.target.value) }))}
                                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-bieon-eco"
                                            >
                                              {getRemoteFunctionOptions(remoteMappingDraft.deviceType).map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                              ))}
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Merek</label>
                                            <select
                                              value={remoteMappingDraft.brand}
                                              onChange={(e) => setRemoteMappingDraft(prev => ({ ...prev, brand: e.target.value, customBrand: e.target.value === 'Other' ? prev.customBrand : '' }))}
                                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-bieon-eco"
                                            >
                                              {REMOTE_BRANDS.map((brand) => (
                                                <option key={brand} value={brand}>{brand}</option>
                                              ))}
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Label Kontrol</label>
                                            <input
                                              type="text"
                                              value={remoteMappingDraft.label}
                                              onChange={(e) => setRemoteMappingDraft(prev => ({ ...prev, label: e.target.value }))}
                                              placeholder="Contoh: Power TV"
                                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-bieon-eco"
                                            />
                                          </div>
                                          {remoteMappingDraft.brand === 'Other' && (
                                            <div className="md:col-span-2">
                                              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Brand Custom</label>
                                              <input
                                                type="text"
                                                value={remoteMappingDraft.customBrand}
                                                onChange={(e) => setRemoteMappingDraft(prev => ({ ...prev, customBrand: e.target.value }))}
                                                placeholder="Contoh: Polytron"
                                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-bieon-eco"
                                              />
                                            </div>
                                          )}
                                        </div>

                                        <div className="flex items-center justify-end gap-3 mt-4">
                                          <button
                                            type="button"
                                            onClick={handleCancelRemoteMapping}
                                            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-black uppercase tracking-widest hover:bg-white transition-all"
                                          >
                                            Batal
                                          </button>
                                          <button
                                            type="button"
                                            onClick={handleSaveRemoteMapping}
                                            className="px-4 py-2 rounded-xl bg-bieon-eco text-white text-xs font-black uppercase tracking-widest hover:bg-bieon-eco/90 transition-all flex items-center gap-2"
                                          >
                                            <Save className="w-4 h-4" />
                                            Simpan Mapping
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {hasRemoteProfile && (
                                      <div className="mt-4 space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Remote Control Console</p>
                                        <div className="grid grid-cols-1 gap-3">
                                          {deviceRemoteProfiles.map((profile) => (
                                            <div key={profile.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                                <div>
                                                  <p className="text-sm font-black text-gray-900">{profile.deviceType}</p>
                                                  <p className="text-xs text-gray-500">{profile.brand}</p>
                                                </div>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">
                                                  {profile.mappings.length} mapping
                                                </span>
                                              </div>
                                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                                {profile.mappings.map((mapping) => (
                                                  <button
                                                    key={mapping.catalogId || mapping.rawSignature}
                                                    type="button"
                                                    onClick={() => handleSendRemoteCommand(device, mapping)}
                                                    title={`Kirim ${mapping.functionLabel}`}
                                                    className="w-full text-left"
                                                  >
                                                    <div className="rounded-2xl border border-bieon-eco/20 bg-bieon-eco/5 px-4 py-3 hover:bg-bieon-eco hover:text-white transition-all cursor-pointer">
                                                      <p className="text-sm font-extrabold uppercase tracking-widest text-bieon-eco">{mapping.functionLabel}</p>
                                                      <p className="text-xs text-gray-600 mt-1 truncate">{mapping.label || mapping.rawBitText || mapping.rawSignature}</p>
                                                    </div>
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        {/* Restore a simple ON/OFF toggle so user can still power the device directly */}
                                        <div className="mt-3">
                                          <button
                                            onClick={() => toggleDevicePower(device.id)}
                                            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-medium active:scale-95 ${device.isToggling ? "opacity-70 cursor-wait" : "cursor-pointer"} ${String(device.status) === "1" ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"}`}
                                          >
                                            {device.isToggling ? (
                                              <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin"></div>
                                                Memproses...
                                              </div>
                                            ) : (
                                              <>
                                                <Power className="w-4 h-4" /> {String(device.status) === "1" ? "Turn OFF" : "Turn ON"}
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Quick Controls Section - Hidden for Technicians (TIDAK BISA EDIT) */}
                                {!isTechnicianMode && !hasRemoteProfile && (
                                  <div className="mb-6">
                                    <p className="text-xs  text-gray-400 uppercase tracking-wider mb-3">
                                      {device.category?.toLowerCase() === "sensor" ? "Status Monitoring" :
                                        (device.controlMethod === "Lingkungan" ? "Kontrol Lingkungan" :
                                          (device.controlMethod === "Jadwal" ? "Kontrol Jadwal" : "Kontrol Manual"))}
                                    </p>
                                    <div className={`flex flex-col gap-4 p-3 ${(device.controlledDevice && device.controlledDevice.trim() !== "") ? 'bg-transparent border-none' : 'bg-blue-50/50 rounded-xl border border-blue-50/50'}`}>
                                      {(device.controlledDevice && device.controlledDevice.trim() !== "") ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                          {(() => {
                                            const targets = (device.controlledDevice || "").split(",").map(t => {
                                              const trimmed = t.trim();
                                              // Robust regex to handle spaces and empty rooms
                                              const match = trimmed.match(/^(.+?)\s*\((.*)\)$/) || trimmed.match(/^(.+)$/);
                                              if (match) {
                                                return {
                                                  type: match[1].trim(),
                                                  room: match[2] ? match[2].trim() : ""
                                                };
                                              }
                                              return { type: trimmed, room: "" };
                                            }).filter(t => t.type);

                                            if (targets.length === 0) return <p className="text-xs text-gray-500 italic p-4 text-center bg-white rounded-xl border border-dashed border-gray-200">Belum ada perangkat yang dikonfigurasi pada remote ini.</p>;

                                            return targets.map((target, idx) => (
                                              <div key={idx} className="bg-white p-5 rounded-[1.5rem] border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-4">
                                                  <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${device.controls?.[`${target.type}_power`] === 1 ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                      {target.type === "AC" && <Thermometer className="w-5 h-5" />}
                                                      {target.type === "TV" && <Volume2 className="w-5 h-5" />}
                                                      {(target.type === "Kipas Angin" || target.type === "Fan") && <Wind className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                      <p className="text-sm font-black text-gray-900">{target.type}</p>
                                                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.1em]">{target.room || "No Room"}</p>
                                                    </div>
                                                  </div>
                                                  <button
                                                    onClick={() => {
                                                      const currentPower = device.controls?.[`${target.type}_power`] || 0;
                                                      updateDeviceControl(device.id, `${target.type}_power`, currentPower === 1 ? 0 : 1);
                                                    }}
                                                    className={`p-2.5 rounded-xl transition-all active:scale-90 ${device.controls?.[`${target.type}_power`] === 1 ? "bg-bieon-eco/5 text-bieon-eco border border-bieon-eco/20" : "bg-gray-50 text-gray-300 border border-gray-100"}`}
                                                  >
                                                    <Power className="w-4 h-4" />
                                                  </button>
                                                </div>

                                                {device.controls?.[`${target.type}_power`] === 1 ? (
                                                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                    {target.type === "AC" && (
                                                      <div className="flex items-center justify-between bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-2">Temperature</span>
                                                        <div className="flex items-center gap-3">
                                                          <button
                                                            onClick={() => updateDeviceControl(device.id, `${target.type}_temp`, (device.controls?.[`${target.type}_temp`] || 24) - 1)}
                                                            className="w-9 h-9 flex items-center justify-center bg-white border-2 border-blue-100 rounded-xl text-blue-600 hover:border-blue-400 transition-all font-bold"
                                                          >-</button>
                                                          <div className="flex items-center">
                                                            <input
                                                              type="number"
                                                              value={device.controls?.[`${target.type}_temp`] || 24}
                                                              onChange={(e) => updateDeviceControl(device.id, `${target.type}_temp`, parseInt(e.target.value) || 0)}
                                                              className="w-10 text-lg font-black text-gray-800 bg-transparent text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            <span className="text-lg font-black text-gray-800">°</span>
                                                          </div>
                                                          <button
                                                            onClick={() => updateDeviceControl(device.id, `${target.type}_temp`, (device.controls?.[`${target.type}_temp`] || 24) + 1)}
                                                            className="w-9 h-9 flex items-center justify-center bg-white border-2 border-blue-100 rounded-xl text-blue-600 hover:border-blue-400 transition-all font-bold"
                                                          >+</button>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {target.type === "TV" && (
                                                      <div className="flex flex-col gap-2 bg-purple-50/50 p-3 rounded-2xl border border-purple-100/50">
                                                        <div className="flex items-center justify-between px-2">
                                                          <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Volume</span>
                                                          <div className="flex items-center gap-0.5">
                                                            <input
                                                              type="number"
                                                              min="0"
                                                              max="100"
                                                              value={device.controls?.[`${target.type}_volume`] || 50}
                                                              onChange={(e) => updateDeviceControl(device.id, `${target.type}_volume`, parseInt(e.target.value) || 0)}
                                                              className="w-8 text-xs font-black text-purple-700 bg-transparent text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            <span className="text-xs font-black text-purple-700">%</span>
                                                          </div>
                                                        </div>
                                                        <input
                                                          type="range"
                                                          min="0"
                                                          max="100"
                                                          value={device.controls?.[`${target.type}_volume`] || 50}
                                                          onChange={(e) => updateDeviceControl(device.id, `${target.type}_volume`, parseInt(e.target.value))}
                                                          className="w-full h-1.5 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                        />
                                                      </div>
                                                    )}
                                                    {(target.type.toLowerCase().includes("kipas") || target.type.toLowerCase().includes("fan")) && (
                                                      <div className="flex flex-col gap-3 bg-bieon-eco/5 p-3 rounded-2xl border border-bieon-eco/10">
                                                        <div className="flex items-center justify-between px-2">
                                                          <span className="text-[10px] font-black text-bieon-eco uppercase tracking-widest">Fan Speed</span>
                                                          <input
                                                            type="number"
                                                            min="1"
                                                            max="3"
                                                            value={device.controls?.[`${target.type}_speed`] || 1}
                                                            onChange={(e) => updateDeviceControl(device.id, `${target.type}_speed`, parseInt(e.target.value) || 1)}
                                                            className="w-6 text-[10px] font-black text-bieon-eco bg-bieon-eco/5 rounded text-center focus:outline-none border border-bieon-eco/20"
                                                          />
                                                        </div>
                                                        <div className="flex gap-2">
                                                          {[1, 2, 3].map(speed => (
                                                            <button
                                                              key={speed}
                                                              onClick={() => updateDeviceControl(device.id, `${target.type}_speed`, speed)}
                                                              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${device.controls?.[`${target.type}_speed`] === speed ? "bg-bieon-eco text-white shadow-lg shadow-bieon-eco/20" : "bg-white border-2 border-bieon-eco/10 border-bieon-eco/20 text-bieon-eco/60 hover:border-bieon-eco/50"}`}
                                                            >
                                                              {speed}
                                                            </button>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <div className="h-[60px] flex items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Device is OFF</p>
                                                  </div>
                                                )}
                                              </div>
                                            ));
                                          })()}
                                        </div>
                                      ) : (
                                        <div className="flex flex-wrap gap-4">
                                          {device.category?.toLowerCase() !== "sensor" && (
                                            <button
                                              onClick={() => toggleDevicePower(device.id)}
                                              className={`flex-1 min-w-[200px] py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium active:scale-95
                                        ${device.isToggling ? "opacity-70 cursor-wait" : "cursor-pointer"}
                                        ${String(device.status) === "1" ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"}`}
                                            >
                                              {device.isToggling ? (
                                                <div className="flex items-center gap-2">
                                                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin"></div>
                                                  Memproses...
                                                </div>
                                              ) : (
                                                <>
                                                  <Power className="w-4 h-4" /> Turn {String(device.status) === "1" ? "OFF" : "ON"}
                                                </>
                                              )}
                                            </button>
                                          )}

                                          {/* Device-specific controls horizontally laid out */}
                                          {device.deviceType === "AC" && device.status === "1" && (
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
                                          {device.deviceType === "TV" && device.status === "1" && (
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
                                          {(device.deviceType === "Light" || device.deviceType === "Fan") && device.status === "1" && (
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
                                          {device.category?.toLowerCase() === "sensor" && !isTechnicianMode && (
                                            <button
                                              onClick={() => toggleDevicePower(device.id)}
                                              className={`flex-1 min-w-[200px] py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium active:scale-95
                                                ${device.isToggling ? "opacity-70 cursor-wait" : "cursor-pointer"}
                                                ${String(device.status) === "1" ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"}`}
                                            >
                                              {device.isToggling ? (
                                                <div className="flex items-center gap-2">
                                                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin"></div>
                                                  Memproses...
                                                </div>
                                              ) : (
                                                <>
                                                  <Eye className="w-4 h-4" /> {String(device.status) === "1" ? "Stop Monitoring" : "Start Monitoring"}
                                                </>
                                              )}
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}


                                {/* Sensor Only Data Block - Single Row Compact Version */}
                                {device.category?.toLowerCase() === "sensor" && device.status === "1" && device.currentValues && (
                                  <div className="mb-6 flex flex-wrap items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    {/* Compact Eligibility Badge */}
                                    {(() => {
                                      const enabledParams = Object.entries(device.sensorParams || {}).filter(([_, cfg]) => cfg.enabled);
                                      let isAbnormal = false;
                                      enabledParams.forEach(([key, cfg]) => {
                                        const currentVal = parseFloat(device.currentValues[key]);
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
                                        <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 shadow-sm transition-all ${isAbnormal ? 'bg-red-600 border-red-700 text-white animate-pulse' : 'bg-bieon-eco border-bieon-eco/80 text-white'}`}>
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
                                    {device.currentValues.temperature !== undefined && device.sensorParams?.temperature?.enabled && (
                                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.currentValues.temperature) > parseFloat(device.sensorParams.temperature.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <Thermometer className="w-4 h-4" />
                                        <span className="text-sm">Suhu: {device.currentValues.temperature}°C</span>
                                      </div>
                                    )}
                                    {device.currentValues.humidity !== undefined && device.sensorParams?.humidity?.enabled && (
                                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.currentValues.humidity) > parseFloat(device.sensorParams.humidity.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <Droplets className="w-4 h-4" />
                                        <span className="text-sm">Lembap: {device.currentValues.humidity}%</span>
                                      </div>
                                    )}
                                    {device.currentValues.ph !== undefined && device.sensorParams?.ph?.enabled && (
                                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.currentValues.ph) > parseFloat(device.sensorParams.ph.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <Beaker className="w-4 h-4" />
                                        <span className="text-sm">pH: {device.currentValues.ph}</span>
                                      </div>
                                    )}
                                    {device.currentValues.turbidity !== undefined && device.sensorParams?.turbidity?.enabled && (
                                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.currentValues.turbidity) > parseFloat(device.sensorParams.turbidity.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <Droplets className="w-4 h-4 text-yellow-600" />
                                        <span className="text-sm">NTU: {device.currentValues.turbidity}</span>
                                      </div>
                                    )}
                                    {device.currentValues.tds !== undefined && device.sensorParams?.tds?.enabled && (
                                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.currentValues.tds) > parseFloat(device.sensorParams.tds.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <Wind className="w-4 h-4 text-bieon-sense" />
                                        <span className="text-sm">TDS: {device.currentValues.tds} ppm</span>
                                      </div>
                                    )}
                                    {device.currentValues.waterTemp !== undefined && device.sensorParams?.waterTemp?.enabled && (
                                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.currentValues.waterTemp) > parseFloat(device.sensorParams.waterTemp.value) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <Thermometer className="w-4 h-4" />
                                        <span className="text-sm">Suhu Air: {device.currentValues.waterTemp}°C</span>
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
                                  <div className="col-span-2 mt-2 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Keterangan Tambahan</p>
                                    <p className="text-sm text-gray-700 italic">"{device.notes || device.thresholds?.notes || "-"}"</p>
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
                                      className="flex-1 px-6 py-2.5 bg-bieon-eco text-white rounded-lg  hover:bg-bieon-eco/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                      <Settings className="w-4 h-4" />
                                      Settings
                                    </button>
                                  )}
                                  {isTechnicianMode && (
                                    <div className="w-full p-4 bg-bieon-eco/5 rounded-xl border border-bieon-eco/20 flex items-center gap-3">
                                      <ShieldAlert className="w-5 h-5 text-bieon-eco" />
                                      <p className="text-xs  text-gray-700">Mode Akses Terbatas: Anda hanya diperbolehkan melihat status perangkat.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === "add-device-choice" && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
                  <div className="flex justify-end">
                    <button onClick={() => setStep("view-bieon")} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                  <div className="w-20 h-20 bg-bieon-eco/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Cpu className="w-10 h-10 text-bieon-eco" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Manajemen Perangkat</h2>
                  <p className="text-sm text-gray-600 mb-8">Apa yang ingin Anda lakukan untuk Hub {selectedHub?.name}?</p>

                  <div className="grid gap-4">
                    <button
                      onClick={() => setStep("open-join")}
                      className="group p-6 bg-white border-2 border-gray-100 rounded-3xl hover:border-bieon-eco hover:shadow-xl transition-all text-left"
                    >
                      <h4 className="font-normal text-gray-900 group-hover:text-bieon-eco">Akses "Open Join"</h4>
                      <p className="text-xs text-gray-500">Kirim Instruksi open join ke hub melalui backend, mqtt dan esp B</p>
                    </button>

                    <button
                      onClick={async () => {
                        await fetchRegisteredProducts();
                        setStep("select-category");
                      }}
                      className="group p-6 bg-white border-2 border-gray-100 rounded-3xl hover:border-blue-500 hover:shadow-xl transition-all text-left"
                    >
                      <h4 className="font-normal text-gray-900 group-hover:text-blue-500">Perangkat Terdaftar</h4>
                      <p className="text-xs text-gray-500">Lanjutkan proses pengaturan & konfigurasi perangkat Anda.</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== MODAL: BUKA OPEN JOIN (NEW REVISION) ==================== */}
            {step === "open-join" && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 sm:p-10 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black text-gray-900">Buka Open Join</h2>
                    <button onClick={() => { setStep("add-device-choice"); setScanAttempted(false); }} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    Pilih hub yang ingin dibuka jendela join-nya. Instruksi akan diteruskan dari web ke backend, lalu ke ESP B dan ESP A.
                  </p>

                  <div className="space-y-6">
                    {/* HUB TARGET CARD */}
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Hub Target</p>
                      <div className="bg-gray-50 border border-gray-100 p-5 rounded-3xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Cpu className="w-6 h-6 text-bieon-eco" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{selectedHub?.name || "Hub Node"}</h4>
                          <p className="text-xs text-gray-500">{selectedHub?.id || "Unknown ID"}</p>
                        </div>
                      </div>
                    </div>

                    {/* INFO BOX GREEN */}
                    <div className="bg-bieon-eco/5 border border-bieon-eco/20 p-5 rounded-3xl">
                      <p className="text-xs text-gray-700 leading-relaxed font-medium">
                        Open join akan aktif selama 30 detik. Saat device berhasil join dan teridentifikasi, backend akan membuat device map otomatis.
                      </p>
                    </div>

                    {/* FOOTER BUTTONS */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => { setStep("add-device-choice"); setScanAttempted(false); setDiscoveredDevices([]); setJoinedDevicesPool([]); setLeavingDevices({}); }}
                        className="flex-1 py-4 px-6 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        Kembali
                      </button>
                      <button
                        onClick={handleStartDiscovery}
                        disabled={isScanning || isOpenJoinRequestPending}
                        className="flex-[1.5] py-4 px-6 bg-bieon-eco hover:bg-bieon-eco/90 rounded-2xl text-sm font-bold text-white shadow-lg shadow-bieon-eco/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isScanning ? (
                          <>
                            <div className="relative w-5 h-5 flex items-center justify-center">
                              <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/30" />
                                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray={50.26} strokeDashoffset={50.26 - (scanTimer / 30) * 50.26} strokeLinecap="round" className="text-white transition-all duration-1000 ease-linear" />
                              </svg>
                              <span className="relative z-10 text-[8px] font-black">{scanTimer}</span>
                            </div>
                            Scanning...
                          </>
                        ) : (
                          "Buka Open Join 30 Detik"
                        )}
                      </button>
                    </div>

                    {/* CONNECTED DEVICES SECTION */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Perangkat Terdaftar Anda</p>

                      {(() => {
                        // Ambil perangkat dari scan live
                        const fromScan = (discoveredDevices || []).filter(dev => {
                          const devIeee = normalizeIeee(dev?.device_ieee || dev?.id || '');
                          const isAlreadyInDb = (currentBieon?.hubs || []).some(hub =>
                            (hub?.devices || []).some(d => {
                              const dbIeee = normalizeIeee(d?.device_ieee || d?.id || '');
                              return d?.modelId === dev?.id ||
                                     d?.productId === dev?.id ||
                                     (devIeee && dbIeee && devIeee === dbIeee);
                            })
                          );
                          return !isAlreadyInDb;
                        });

                        // Ambil perangkat "Quick Saved" dari database
                        const quickSaved = (currentBieon?.hubs || []).flatMap(h => h?.devices || [])
                          .filter(d => d?.notes === "Quick Saved")
                          .map(d => ({
                            id: d?.productId || d?.modelId || d?.id,
                            dbId: d?._id || d?.id,
                            name: formatDeviceName(d?.name, d?.device_ieee || d?.productId || d?.modelId || d?.id),
                            type: isPlaceholderText(d?.type) ? (d?.category === 'sensor' ? 'Sensor' : 'Control') : (d?.type || d?.deviceType || ""),
                            category: d?.category || "",
                            status: "Belum Dikonfigurasi",
                            isFromDb: true,
                            originalDevice: d
                          })) || [];

                        // Ambil perangkat "Registered" yang belum terpakai dari database
                        const registeredUnused = registeredProducts
                          .filter(p => !p.isUsed)
                          .map(p => ({
                            id: p.productId,
                            dbId: p?._id || p?.id,
                            name: formatDeviceName(p.productName, p.productId),
                            type: p.category === 'sensor' ? (p.aspect === 'air' ? 'Sensor Kualitas Air' : p.aspect === 'kenyamanan' ? 'Sensor Kenyamanan' : p.aspect === 'keamanan' ? 'Sensor Keamanan' : 'Sensor') : 'Control',
                            category: p.category || "",
                            status: "Belum Dikonfigurasi",
                            isFromDb: true,
                            isFromRegistered: true,
                            originalProduct: p
                          })) || [];

                        const allCandidates = [];
                        const seenIds = new Set();
                        const pushUnique = (item) => {
                          const id = item.id || item.productId || item.dbId;
                          if (!id || seenIds.has(id)) return;
                          seenIds.add(id);
                          allCandidates.push(item);
                        };

                        fromScan.forEach(pushUnique);
                        quickSaved.forEach(pushUnique);
                        registeredUnused.forEach(pushUnique);

                        return (
                          <div className="space-y-3">
                            {allCandidates.length === 0 && !isScanning && !scanAttempted && (
                              <div className="flex flex-col items-center justify-center py-10 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-400 italic">Menunggu perangkat bergabung...</p>
                                <p className="text-[10px] text-gray-300 mt-2 text-center px-6">Klik tombol Buka Open Join untuk mulai mendeteksi perangkat baru.</p>
                              </div>
                            )}

                            {isScanning && allCandidates.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-10 bg-bieon-eco/5/30 rounded-3xl border border-dashed border-bieon-eco/30 animate-pulse">
                                <div className="relative w-12 h-12 mb-3">
                                  <div className="absolute inset-0 bg-bieon-eco/20 rounded-full animate-ping" />
                                  <div className="relative bg-white p-3 rounded-full shadow-sm flex items-center justify-center">
                                    <span className="font-bold text-bieon-eco">{scanTimer}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-bieon-eco font-medium">Sedang mencari perangkat...</p>
                              </div>
                            )}

                            {!isScanning && scanAttempted && fromScan.length === 0 && joinedDevicesPool.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-10 bg-orange-50/50 rounded-3xl border border-dashed border-orange-200">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                  <WifiOff className="w-6 h-6 text-orange-500" />
                                </div>
                                <h4 className="text-sm font-bold text-orange-600">Perangkat Tidak Ditemukan</h4>
                                <p className="text-[10px] text-orange-500 mt-2 text-center px-6 leading-relaxed">
                                  Tidak ada perangkat baru yang terdeteksi. Perangkat yang sudah ada di Perangkat Terdaftar atau Hub tidak akan dimunculkan lagi.
                                </p>
                              </div>
                            )}

                            <div className="grid gap-3">
                              {allCandidates.map((dev) => {
                                const isJoined = joinedDevicesPool.includes(dev.id) || dev.isFromDb;
                                const isSensor = (dev.type || "").toLowerCase().includes("sensor") || 
                                                 dev.category === 'sensor' ||
                                                 registeredProducts.find(p => p.productId === dev.id)?.category === 'sensor';
                                
                                return (
                                  <div
                                    key={dev.id}
                                    className={`w-full flex items-center justify-between p-3 bg-white border ${
                                      isJoined ? 'border-bieon-eco shadow-md ring-1 ring-bieon-eco/20' : 'border-gray-100'
                                    } ${
                                      isSensor ? 'hover:bg-[#f0fdf4] hover:border-bieon-eco/20' : 'hover:bg-blue-50/50 hover:border-blue-200'
                                    } rounded-2xl transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500`}
                                  >
                                    <div className="min-w-0 pr-3 flex-1 text-left">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-xs font-bold text-gray-900 truncate">{dev.name}</p>
                                        {(() => {
                                          const registeredMatch = registeredProducts.find(p => p.productId === dev.id || p.productId === dev.originalDevice?.productId || p.productId === dev.originalProduct?.productId);
                                          const aspect = registeredMatch?.aspect || dev.originalDevice?.aspect || dev.originalProduct?.aspect;
                                          
                                          let aspectLabel = aspect;
                                          if (isSensor) {
                                            aspectLabel = "sensor";
                                          } else if (!aspectLabel) {
                                            const nameLower = (dev.name || "").toLowerCase();
                                            const typeLower = (dev.type || "").toLowerCase();
                                            const isControl = nameLower.includes("plug") || nameLower.includes("control") || typeLower.includes("control") || typeLower.includes("plug") ||
                                                              (registeredMatch && registeredMatch.category === 'control') || dev.originalProduct?.category === 'control';
                                            if (isControl) {
                                              aspectLabel = "controll";
                                            } else if (typeLower.includes("air") || typeLower.includes("water") || typeLower.includes("bluecheck")) {
                                              aspectLabel = "air";
                                            } else if (typeLower.includes("kenyamanan") || typeLower.includes("comfort") || typeLower.includes("airguard")) {
                                              aspectLabel = "kenyamanan";
                                            } else if (typeLower.includes("keamanan") || typeLower.includes("security")) {
                                              aspectLabel = "keamanan";
                                            }
                                          }
                                          
                                          if (!aspectLabel) return null;
                                          return (
                                            <span className={`text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${
                                              (aspectLabel === 'kenyamanan' || aspectLabel === 'sensor') ? 'text-bieon-eco border-bieon-eco/20 bg-bieon-eco/5' : 
                                              aspectLabel === 'air' ? 'text-blue-500 border-blue-100 bg-blue-50' : 
                                              aspectLabel === 'controll' ? 'text-blue-500 border-blue-100 bg-blue-50' : 
                                              'text-orange-500 border-orange-100 bg-orange-50'
                                            }`}>
                                              {aspectLabel}
                                            </span>
                                          );
                                        })()}
                                      </div>
                                      <p className="text-[9px] text-gray-400 font-medium">ID: {dev.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {dev.isFromDb ? (
                                        <>
                                          <button
                                            onClick={() => {
                                              if (dev.isFromRegistered) {
                                                const p = dev.originalProduct;
                                                setSelectedCategory(p.category);
                                                setSelectedProduct(p);
                                                setSelectedDeviceType(p.productName);
                                                if (p.aspect === 'air') {
                                                  setSelectedDeviceType("Sensor Kualitas Air");
                                                  setActiveSensorAspect("kualitasAir");
                                                } else if (p.aspect === 'kenyamanan') {
                                                  setSelectedDeviceType("Sensor Kenyamanan");
                                                  setActiveSensorAspect("kenyamanan");
                                                } else if (p.aspect === 'keamanan') {
                                                  setSelectedDeviceType("Sensor Keamanan");
                                                  setActiveSensorAspect("keamanan");
                                                } else {
                                                  setActiveSensorAspect(null);
                                                }
                                                setDeviceForm({ name: p.productName, location: "", notes: "" });
                                                setStep("add-device-form");
                                              } else {
                                                handleEditDevice(dev.originalDevice);
                                              }
                                            }}
                                            className={`px-3 py-2 ${
                                              isSensor ? 'bg-bieon-eco hover:bg-bieon-eco/90 shadow-bieon-eco/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                            } text-white text-[9px] font-bold rounded-xl transition-all uppercase tracking-wider whitespace-nowrap shadow-sm`}
                                          >
                                            Atur Sekarang
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (dev.isFromRegistered) {
                                                handleDeleteRegisteredProduct(dev.id);
                                              } else {
                                                deleteDevice(dev.dbId || dev.id);
                                              }
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Hapus Produk"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </>
                                      ) : (
                                    <>
                                      {/* TOMBOL + (JOIN) */}
                                      <button
                                        onClick={() => !isJoined && leavingDevices[dev.id] === undefined && toggleJoinDevice(dev.id)}
                                        disabled={isJoined || leavingDevices[dev.id] !== undefined}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isJoined
                                          ? 'bg-bieon-eco text-white shadow-lg shadow-bieon-eco/20 cursor-default'
                                          : leavingDevices[dev.id] !== undefined
                                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200'
                                            : 'bg-bieon-eco/5 text-bieon-eco hover:bg-bieon-eco hover:text-white border border-bieon-eco/20'
                                          }`}
                                        title={isJoined ? "Sudah masuk antrean" : leavingDevices[dev.id] !== undefined ? "Sedang leave, tidak bisa ditambah" : "Tambahkan ke antrean"}
                                      >
                                        {isJoined ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                      </button>

                                      {/* TOMBOL - (LEAVE) WITH CIRCULAR TIMER */}
                                      <div className="relative w-10 h-10 flex items-center justify-center">
                                        <button
                                          onClick={() => {
                                            if (leavingDevices[dev.id] === undefined) {
                                              setLeavingDevices(prev => ({ ...prev, [dev.id]: 50 }));
                                            }
                                          }}
                                          disabled={leavingDevices[dev.id] !== undefined}
                                          className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${leavingDevices[dev.id] !== undefined
                                            ? 'bg-transparent border-transparent'
                                            : 'bg-pink-50 text-pink-500 hover:bg-pink-500 hover:text-white border-pink-100'
                                            }`}
                                        >
                                          {leavingDevices[dev.id] !== undefined ? (
                                            <>
                                              {/* CIRCULAR PROGRESS SVG */}
                                              <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                <circle
                                                  cx="20"
                                                  cy="20"
                                                  r="18"
                                                  stroke="currentColor"
                                                  strokeWidth="3.5"
                                                  fill="transparent"
                                                  className="text-pink-100"
                                                />
                                                <circle
                                                  cx="20"
                                                  cy="20"
                                                  r="18"
                                                  stroke="currentColor"
                                                  strokeWidth="3.5"
                                                  fill="transparent"
                                                  strokeDasharray={113.1}
                                                  strokeDashoffset={113.1 - (leavingDevices[dev.id] / 50) * 113.1}
                                                  strokeLinecap="round"
                                                  className="text-pink-500 transition-all duration-1000 ease-linear"
                                                />
                                              </svg>
                                              <span className="relative z-10 text-[10px] font-black text-pink-600">
                                                {leavingDevices[dev.id]}
                                              </span>
                                            </>
                                          ) : (
                                            <Minus className="w-5 h-5" />
                                          )}
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ACTION BOX: POOL ACTIONS [NEW REFINED] */}
                      {joinedDevicesPool.length === 0 ? null : (
                        <div className="mt-8 p-6 bg-bieon-eco rounded-[2rem] shadow-xl shadow-bieon-eco/20 animate-in zoom-in-95 duration-300">
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3 text-white">
                              <div className="bg-white/20 p-2 rounded-xl">
                                <CheckCircle className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold">{joinedDevicesPool.length} Perangkat Terpilih</h4>
                                <p className="text-[10px] text-white/70">Kelola masing-masing atau simpan sekaligus</p>
                              </div>
                            </div>
                          </div>

                          {/* SCROLLABLE DEVICE LIST INSIDE GREEN BOX */}
                          <div className="space-y-2 mb-6 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                            {joinedDevicesPool.map((deviceId) => {
                              const dev = discoveredDevices.find(d => d.id === deviceId);
                              if (!dev) return null;
                              return (
                                <div key={deviceId} className="flex items-center justify-between bg-white/10 p-3 rounded-2xl border border-white/10 group/item hover:bg-white/20 transition-all">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                      {dev.type.includes("Sensor") ? <Info className="w-4 h-4 text-white" /> : <Cpu className="w-4 h-4 text-white" />}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-white">{dev.name}</p>
                                      <p className="text-[9px] text-white/60 uppercase font-black">{dev.type}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {pendingOpenJoinDevice?.id === dev.id ? (
                                      <>
                                        <select
                                          key={`${dev.id}-${pendingOpenJoinAction}`}
                                          defaultValue=""
                                          onChange={(e) => {
                                            const category = e.target.value;
                                            if (category) handleOpenJoinCategorySelection(category);
                                          }}
                                          className="px-2.5 py-1.5 bg-white text-gray-800 text-[10px] font-bold rounded-lg outline-none cursor-pointer min-w-[7.5rem] max-w-[9rem]"
                                          aria-label="Pilih kategori perangkat"
                                        >
                                          <option value="" disabled>
                                            {pendingOpenJoinAction === "save" ? "Simpan sebagai…" : "Atur sebagai…"}
                                          </option>
                                          <option value="sensor">Sensor</option>
                                          <option value="control">Control Aktuator</option>
                                        </select>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPendingOpenJoinDevice(null);
                                            setPendingOpenJoinAction(null);
                                          }}
                                          className="px-2 py-1.5 text-white/70 hover:text-white text-[10px] font-bold"
                                        >
                                          Batal
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => initOpenJoinDeviceConfiguration(dev, "save")}
                                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-all border border-white/20"
                                        >
                                          Simpan
                                        </button>
                                        <button
                                          onClick={() => initOpenJoinDeviceConfiguration(dev, "configure")}
                                          className="px-3 py-1.5 bg-white hover:bg-bieon-eco/5 text-bieon-eco text-[10px] font-bold rounded-lg transition-all shadow-sm"
                                        >
                                          Atur
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-4 flex items-start gap-2">
                            <span className="text-yellow-500 text-xs">✨</span>
                            <p className="text-[10px] text-gray-400 italic leading-relaxed">
                              Device baru akan otomatis muncul dan dipisahkan berdasarkan tipe (Sensor/Aktuator) saat bergabung.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* ==================== MODAL: REGISTER PRODUCT (NEW STEP) ==================== */}
            {step === "register-product" && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 sm:p-10 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">Tambahkan Perangkat Baru</h2>
                    <button onClick={() => setStep("add-device-choice")} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-8">Masukkan ID dan Nama Produk yang tertera pada stiker fisik perangkat.</p>
                  <form onSubmit={handleRegisterProduct} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">ID Device (Stiker)</label>
                      <input
                        required
                        list="device-ids"
                        type="text"
                        value={productRegForm.id}
                        onChange={(e) => setProductRegForm({ ...productRegForm, id: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none font-bold"
                        placeholder="Ketik atau pilih ID (Contoh: SNZB...)"
                      />
                      <datalist id="device-ids">
                        <option value="SNZB_02DR2" />
                        <option value="S60ZBTPF" />
                        <option value="BLCK04WQS" />
                      </datalist>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Jenis Device</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setProductRegForm({ ...productRegForm, category: 'sensor' })}
                          className={`p-4 rounded-2xl border-2 transition-all text-base font-bold flex items-center justify-center gap-2 ${productRegForm.category === 'sensor' ? 'bg-bieon-eco/5 border-bieon-eco text-bieon-eco shadow-md shadow-bieon-eco/10' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
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
                          Aktuator
                        </button>
                      </div>
                    </div>

                    {productRegForm.category === 'control' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Kategori Aktuator</label>
                        <select
                          value={productRegForm.controlCategory}
                          onChange={(e) => setProductRegForm({ ...productRegForm, controlCategory: e.target.value })}
                          className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-gray-700"
                        >
                          <option value="">-- Pilih Kategori --</option>
                          <option value="smart-switch">Smart Switch</option>
                          <option value="smart-plug">Smart Plug</option>
                          <option value="remote">Remote</option>
                        </select>
                      </div>
                    )}

                    {productRegForm.category === 'sensor' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Kategori Sensor</label>
                        <select
                          value={productRegForm.aspect}
                          onChange={(e) => setProductRegForm({ ...productRegForm, aspect: e.target.value })}
                          className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none font-bold text-gray-700"
                        >
                          <option value="">-- Pilih Kategori --</option>
                          <option value="kenyamanan">Kenyamanan</option>
                          <option value="air">Kualitas Air</option>
                          <option value="keamanan">Keamanan</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nama Device</label>
                      <input
                        required
                        type="text"
                        value={productRegForm.name}
                        onChange={(e) => setProductRegForm({ ...productRegForm, name: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none font-bold"
                        placeholder="Contoh: SNZB-02D"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button
                        type="button"
                        onClick={(e) => handleRegisterProduct(e, "add-device-choice")}
                        className="flex-1 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-base transition-all hover:bg-gray-50 active:scale-[0.98]"
                      >
                        Simpan
                      </button>
                      <button
                        type="submit"
                        onClick={(e) => handleRegisterProduct(e, "add-device-form")}
                        className="flex-1 py-3.5 bg-bieon-eco text-white rounded-xl font-bold text-base shadow-lg shadow-bieon-eco/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Registrasi & Lanjut
                      </button>
                    </div>
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
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Perangkat Terdaftar</h2>
                      <p className="text-sm text-gray-500 mt-1">Lanjutkan proses pengaturan dan konfigurasi perangkat Anda.</p>
                    </div>
                    <button
                      onClick={() => {
                        setStep("add-device-choice");
                        setProductSearchQuery("");
                      }}
                      className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
                    >
                      <X className="w-8 h-8 text-gray-400" />
                    </button>
                  </div>

                  <div className="relative mb-8 group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400 group-focus-within:text-bieon-eco transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="Cari perangkat berdasarkan nama atau ID..."
                      className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:bg-white focus:border-bieon-eco focus:ring-4 focus:ring-bieon-eco/10 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-400 placeholder:font-normal shadow-sm"
                    />
                  </div>

                  {/* NEW: Devices rendering logic */}
                  {(() => {
                    const quickSaved = (currentBieon?.hubs || []).flatMap(h => h?.devices || []).filter(d => d?.notes === "Quick Saved") || [];
                    const sq = productSearchQuery.toLowerCase();
                    const quickSavedSensors = quickSaved.filter(d =>
                      (d?.category?.toLowerCase() === 'sensor' || (d?.type || "").toLowerCase().includes("sensor") || (d?.name || "").toLowerCase().includes("airguard") || (d?.name || "").toLowerCase().includes("bluecheck")) &&
                      ((d?.name || "").toLowerCase().includes(sq) || (d?.id || "").toLowerCase().includes(sq))
                    );
                    const quickSavedControls = quickSaved.filter(d =>
                      (d?.category?.toLowerCase() === 'control' || (d?.type || "").toLowerCase().includes("plug") || (d?.name || "").toLowerCase().includes("plug")) &&
                      ((d?.name || "").toLowerCase().includes(sq) || (d?.id || "").toLowerCase().includes(sq))
                    );

                    const filteredSensorProducts = registeredProducts.filter(p => p.category === 'sensor' && !p.isUsed && (p.productName.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.productId.toLowerCase().includes(productSearchQuery.toLowerCase())));
                    const filteredControlProducts = registeredProducts.filter(p => p.category === 'control' && !p.isUsed && (p.productName.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.productId.toLowerCase().includes(productSearchQuery.toLowerCase())));

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Kolom Sensor */}
                        <div className="bg-[#f0fdf4] border-2 border-[#bbf7d0] rounded-[2rem] p-5">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-bieon-eco rounded-2xl flex items-center justify-center text-white shadow-lg shadow-bieon-eco/30">
                              <Activity className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">Sensor</h3>
                              <p className="text-[9px] font-bold text-bieon-eco uppercase tracking-widest">Monitoring System</p>
                            </div>
                          </div>

                          <div className="bg-white rounded-3xl border border-bieon-eco/20 overflow-hidden shadow-sm">
                            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
                              {/* Quick Saved Sensors */}
                              {quickSavedSensors.map((dev) => (
                                <div key={dev.id} className="flex items-center justify-between p-3 mb-2 bg-white hover:bg-[#f0fdf4] border border-gray-100 hover:border-bieon-eco/20 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                  <div className="min-w-0 pr-3 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <p className="text-xs font-bold text-gray-900 truncate">{dev.name}</p>
                                      {(() => {
                                        const registeredMatch = registeredProducts.find(p => p.productId === dev.id || p.productId === dev.originalDevice?.productId);
                                        const aspect = registeredMatch?.aspect || dev.originalDevice?.aspect || 'Sensor';
                                        return (
                                          <span className={`text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${aspect === 'kenyamanan' ? 'text-bieon-eco border-bieon-eco/20 bg-bieon-eco/5' : aspect === 'air' ? 'text-blue-500 border-blue-100 bg-blue-50' : 'text-orange-500 border-orange-100 bg-orange-50'}`}>
                                            {aspect}
                                          </span>
                                        );
                                      })()}
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-medium">ID: {dev.id}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEditDevice(dev)}
                                      className="px-3 py-2 bg-bieon-eco text-white text-[9px] font-bold rounded-xl hover:bg-bieon-eco/90 transition-all uppercase tracking-wider whitespace-nowrap shadow-sm shadow-bieon-eco/20"
                                    >
                                      Atur Sekarang
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteDevice(dev.id);
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                      title="Hapus Produk"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {/* Separator if both exist */}
                              {quickSavedSensors.length > 0 && filteredSensorProducts.length > 0 && (
                                <div className="w-full h-px bg-gray-100 my-3"></div>
                              )}

                              {/* Registered Products (Not Configured) */}
                              {filteredSensorProducts.length > 0 ? (
                                filteredSensorProducts.map((product, idx, filteredArr) => (
                                  <div key={product.productId} className="flex items-center justify-between p-3 mb-2 bg-white hover:bg-[#f0fdf4] border border-gray-100 hover:border-bieon-eco/20 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                    <div className="min-w-0 pr-3 flex-1">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-xs font-bold text-gray-900 truncate">{product.productName}</p>
                                        <span className={`text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${product.aspect === 'kenyamanan' ? 'text-bieon-eco border-bieon-eco/20 bg-bieon-eco/5' : product.aspect === 'air' ? 'text-blue-500 border-blue-100 bg-blue-50' : 'text-orange-500 border-orange-100 bg-orange-50'}`}>
                                          {product.aspect || 'Sensor'}
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-gray-400 font-medium">ID: {product.productId}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setSelectedCategory("sensor");
                                          setSelectedProduct(product);
                                          setSelectedDeviceType(product.productName);
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
                                          setProductSearchQuery("");
                                        }}
                                        className="px-3 py-2 bg-bieon-eco text-white text-[9px] font-bold rounded-xl hover:bg-bieon-eco/90 transition-all uppercase tracking-wider whitespace-nowrap shadow-sm shadow-bieon-eco/20"
                                      >
                                        Atur Sekarang
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteRegisteredProduct(product.productId);
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Hapus Produk"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (quickSavedSensors.length === 0 && (
                                <div className="py-12 text-center">
                                  <p className="text-xs font-medium text-gray-400">Belum ada sensor terdaftar</p>
                                </div>
                              ))}
                            </div>
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

                          <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">
                            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
                              {/* Quick Saved Controls */}
                              {quickSavedControls.map((dev) => (
                                <div key={dev.id} className="flex items-center justify-between p-3 mb-2 bg-white hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                  <div className="min-w-0 pr-3 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <p className="text-xs font-bold text-gray-900 truncate">{dev.name}</p>
                                      <span className="text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border text-blue-500 border-blue-100 bg-blue-50">
                                        controll
                                      </span>
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-medium">ID: {dev.id}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEditDevice(dev)}
                                      className="px-3 py-2 bg-blue-600 text-white text-[9px] font-bold rounded-xl hover:bg-blue-700 transition-all uppercase tracking-wider whitespace-nowrap shadow-sm shadow-blue-600/20"
                                    >
                                      Atur Sekarang
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteDevice(dev.id);
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                      title="Hapus Produk"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {/* Separator if both exist */}
                              {quickSavedControls.length > 0 && filteredControlProducts.length > 0 && (
                                <div className="w-full h-px bg-gray-100 my-3"></div>
                              )}

                              {/* Registered Products (Not Configured) */}
                              {filteredControlProducts.length > 0 ? (
                                filteredControlProducts.map((product, idx, filteredArr) => (
                                  <div key={product.productId} className="flex items-center justify-between p-3 mb-2 bg-white hover:bg-blue-50/50 border border-gray-100 hover:border-blue-200 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                                    <div className="min-w-0 pr-3 flex-1">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-xs font-bold text-gray-900 truncate">{product.productName}</p>
                                        <span className="text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border text-blue-500 border-blue-100 bg-blue-50">
                                          controll
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-gray-400 font-medium">ID: {product.productId}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setSelectedCategory("control");
                                          setSelectedProduct(product);
                                          setSelectedDeviceType(product.productName);
                                          setActiveSensorAspect(null);
                                          setDeviceForm({ name: product.productName, location: "", notes: "" });
                                          setStep("add-device-form");
                                          setProductSearchQuery("");
                                        }}
                                        className="px-3 py-2 bg-blue-600 text-white text-[9px] font-bold rounded-xl hover:bg-blue-700 transition-all uppercase tracking-wider whitespace-nowrap shadow-sm shadow-blue-600/20"
                                      >
                                        Atur Sekarang
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteRegisteredProduct(product.productId);
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Hapus Produk"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (quickSavedControls.length === 0 && (
                                <div className="py-12 text-center">
                                  <p className="text-xs font-medium text-gray-400">Belum ada control terdaftar</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
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
                        className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-bieon-eco hover:shadow-lg transition-all text-left flex items-center justify-between group"
                      >
                        <span className=" text-gray-900">{deviceType}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-bieon-eco" />
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
                      <p className="text-sm text-gray-500 mt-1">Lengkapi detail untuk: <span className="font-bold text-bieon-eco">{selectedDeviceType}</span></p>
                    </div>
                    <button
                      onClick={() => {
                        if (isEditingDevice) {
                          setStep(null);
                        } else {
                          setStep("select-category");
                        }
                        resetForm();
                      }}
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
                            disabled
                            className="w-full p-4 bg-gray-100 border-2 border-gray-100 rounded-2xl outline-none font-bold text-gray-500 cursor-not-allowed"
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
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none text-gray-700 font-mono text-sm"
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
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none font-bold text-gray-700"
                          >
                            {currentBieon?.hubs.map((h) => (
                              <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Khusus Remote: Pilih Perangkat yang Dikontrol */}
                    {(selectedProduct?.aspect === 'remote' || selectedDeviceType.toLowerCase().includes('remote')) && (
                      <div className="p-6 bg-blue-50/50 rounded-[2rem] border-2 border-blue-100/50">
                        <label className="block text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Pilih Perangkat yang Dikontrol (Bisa Lebih Dari 1)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {CATEGORY_DEVICES.remote.map((type) => (
                            <div key={type} className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  if (remoteTargets.includes(type)) {
                                    setRemoteTargets(prev => prev.filter(t => t !== type));
                                    setPairingStates(prev => ({ ...prev, [type]: 'idle' }));
                                  } else {
                                    setRemoteTargets(prev => [...prev, type]);
                                    // Trigger Pairing
                                    setPairingStates(prev => ({ ...prev, [type]: 'pairing' }));
                                    setTimeout(() => {
                                      const isOutOfRange = Math.random() > 0.8;
                                      const status = isOutOfRange ? 'out_of_range' : 'connected';
                                      setPairingStates(prev => ({ ...prev, [type]: status }));
                                      if (status === 'connected') {
                                        const brands = DEVICE_BRANDS[type] || ["Samsung", "LG", "Sony"];
                                        const foundBrand = brands[Math.floor(Math.random() * brands.length)];
                                        setRemoteBrands(prev => ({ ...prev, [type]: foundBrand }));
                                        setRemoteCustomNames(prev => ({ ...prev, [type]: type }));
                                        setPairingSuccessInfo({ name: type, brand: foundBrand });
                                        setTimeout(() => setPairingSuccessInfo(null), 3000);
                                      }
                                    }, 2000);
                                  }
                                }}
                                className={`py-3.5 px-4 rounded-2xl font-bold text-sm transition-all border-2 ${remoteTargets.includes(type) ? "border-blue-500 bg-white text-blue-600 shadow-md" : "border-transparent bg-white/50 text-gray-400 hover:bg-white"}`}
                              >
                                <div className="flex items-center justify-between w-full gap-2 min-w-0">
                                  <div className="flex-1 min-w-0">
                                    {editingRemoteNameFor === type ? (
                                      <input
                                        type="text"
                                        value={customNameInput}
                                        onChange={(e) => setCustomNameInput(e.target.value)}
                                        onBlur={() => {
                                          if (customNameInput.trim()) {
                                            setRemoteCustomNames(prev => ({ ...prev, [type]: customNameInput.trim() }));
                                          }
                                          setEditingRemoteNameFor(null);
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            if (customNameInput.trim()) {
                                              setRemoteCustomNames(prev => ({ ...prev, [type]: customNameInput.trim() }));
                                            }
                                            setEditingRemoteNameFor(null);
                                          }
                                        }}
                                        autoFocus
                                        className="w-full bg-transparent border-b-2 border-blue-500 outline-none text-sm font-bold text-blue-600 pb-0.5"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <div className="flex flex-col">
                                        <span className="truncate block">{remoteCustomNames[type] || type}</span>
                                        {pairingStates[type] === 'pairing' && <span className="text-[8px] text-blue-500 animate-pulse">Pairing...</span>}
                                        {pairingStates[type] === 'out_of_range' && <span className="text-[8px] text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-2 h-2" /> Out of Range</span>}
                                        {pairingStates[type] === 'connected' && <span className="text-[8px] text-bieon-eco font-bold">Connected</span>}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {remoteTargets.includes(type) && pairingStates[type] !== 'pairing' && (
                                      <>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingRemoteNameFor(type);
                                            setCustomNameInput(remoteCustomNames[type] || type);
                                          }}
                                          className="p-1 hover:bg-blue-100 rounded-md transition-colors text-blue-400 hover:text-blue-600"
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </button>
                                        {pairingStates[type] === 'connected' ? (
                                          <div className="flex items-center gap-1">
                                            <Check className="w-4 h-4 text-bieon-eco" />
                                          </div>
                                        ) : pairingStates[type] === 'out_of_range' ? (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setRemoteTargets(prev => prev.filter(t => t !== type));
                                              setPairingStates(prev => ({ ...prev, [type]: 'idle' }));
                                            }}
                                            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        ) : (
                                          <Check className="w-4 h-4" />
                                        )}
                                      </>
                                    )}
                                    {pairingStates[type] === 'pairing' && (
                                      <Radio className="w-4 h-4 text-blue-400 animate-spin" />
                                    )}
                                  </div>
                                </div>
                              </button>

                              {remoteTargets.includes(type) && (
                                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                                  {/* Brand Selector */}
                                  <div className="relative">
                                    <select
                                      value={remoteBrands[type] || ""}
                                      onChange={(e) => setRemoteBrands(prev => ({ ...prev, [type]: e.target.value }))}
                                      className="w-full pl-3 pr-8 py-2.5 bg-white border-2 border-blue-100 rounded-xl outline-none text-xs font-bold text-gray-700 focus:border-blue-400 appearance-none transition-all cursor-pointer hover:border-blue-200"
                                    >
                                      <option value="">-- Pilih Merk --</option>
                                      {DEVICE_BRANDS[type]?.map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                      ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-blue-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  </div>

                                  {/* Room Selector */}
                                  <div className="relative">
                                    {remoteAddingRoomFor === type ? (
                                      <div className="flex gap-1.5 items-center">
                                        <input
                                          type="text"
                                          value={newRoomInput}
                                          onChange={(e) => setNewRoomInput(e.target.value)}
                                          autoFocus
                                          placeholder="Ruangan..."
                                          className="flex-1 pl-3 pr-1 py-2 bg-white border-2 border-blue-200 rounded-xl outline-none text-[10px] font-bold text-gray-700 focus:border-blue-500 transition-all shadow-inner"
                                        />
                                        <button
                                          onClick={() => handleAddRoom(type)}
                                          className="p-1.5 bg-blue-500 text-white rounded-lg shadow-md shadow-blue-100 hover:bg-blue-600 transition-all active:scale-95"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => setRemoteAddingRoomFor(null)}
                                          className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 transition-all"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <select
                                          value={remoteRooms[type] || ""}
                                          onChange={(e) => {
                                            const r = e.target.value;
                                            if (r === "__new__") {
                                              setRemoteAddingRoomFor(type);
                                              setNewRoomInput("");
                                            } else {
                                              setRemoteRooms(prev => ({ ...prev, [type]: r }));
                                              if (type === remoteTargets[0]) setDeviceForm(prev => ({ ...prev, location: r }));
                                            }
                                          }}
                                          className="w-full pl-3 pr-8 py-2.5 bg-white border-2 border-blue-100 rounded-xl outline-none text-xs font-bold text-gray-700 focus:border-blue-400 appearance-none transition-all cursor-pointer hover:border-blue-200"
                                        >
                                          <option value="">-- Pilih Ruangan --</option>
                                          {rooms.map(room => (
                                            <option key={room} value={room}>{room}</option>
                                          ))}
                                          <option value="__new__">+ Buat R. Baru</option>
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-blue-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          {/* Rendering Custom Targets */}
                          {customSubTargets.map((type) => (
                            <div key={type} className="flex flex-col gap-2">
                              {/* ... similar button as above ... */}
                              <button
                                onClick={() => {
                                  if (remoteTargets.includes(type)) {
                                    setRemoteTargets(prev => prev.filter(t => t !== type));
                                  } else {
                                    setRemoteTargets(prev => [...prev, type]);
                                    setPairingStates(prev => ({ ...prev, [type]: 'pairing' }));
                                    setTimeout(() => {
                                      const isOutOfRange = Math.random() > 0.8;
                                      const status = isOutOfRange ? 'out_of_range' : 'connected';
                                      setPairingStates(prev => ({ ...prev, [type]: status }));
                                      if (status === 'connected') {
                                        const possibleTypes = ["AC", "TV", "Kipas Angin"];
                                        const foundType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
                                        const brands = DEVICE_BRANDS[foundType];
                                        const foundBrand = brands[Math.floor(Math.random() * brands.length)];

                                        setDetectedTypes(prev => ({ ...prev, [type]: foundType }));
                                        setRemoteBrands(prev => ({ ...prev, [type]: foundBrand }));
                                        setRemoteCustomNames(prev => ({ ...prev, [type]: foundType }));
                                        setPairingSuccessInfo({ name: foundType, brand: foundBrand });
                                        setTimeout(() => setPairingSuccessInfo(null), 3000);
                                      }
                                    }, 2000);
                                  }
                                }}
                                className={`py-3.5 px-4 rounded-2xl font-bold text-sm transition-all border-2 ${remoteTargets.includes(type) ? "border-blue-500 bg-white text-blue-600 shadow-md" : "border-transparent bg-white/50 text-gray-400 hover:bg-white"}`}
                              >
                                {/* Same content as standard buttons */}
                                <div className="flex items-center justify-between w-full gap-2 min-w-0">
                                  <div className="flex-1 min-w-0">
                                    {editingRemoteNameFor === type ? (
                                      <input
                                        type="text"
                                        value={customNameInput}
                                        onChange={(e) => setCustomNameInput(e.target.value)}
                                        onBlur={() => {
                                          if (customNameInput.trim()) setRemoteCustomNames(prev => ({ ...prev, [type]: customNameInput.trim() }));
                                          setEditingRemoteNameFor(null);
                                        }}
                                        autoFocus
                                        className="w-full bg-transparent border-b-2 border-blue-500 outline-none text-sm font-bold text-blue-600 pb-0.5"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <div className="flex flex-col">
                                        <span className="truncate block">{remoteCustomNames[type] || type}</span>
                                        {pairingStates[type] === 'pairing' && <span className="text-[8px] text-blue-500 animate-pulse">Pairing...</span>}
                                        {pairingStates[type] === 'out_of_range' && <span className="text-[8px] text-red-500 font-bold">Out of Range</span>}
                                        {pairingStates[type] === 'connected' && <span className="text-[8px] text-bieon-eco font-bold">Connected</span>}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {remoteTargets.includes(type) && pairingStates[type] !== 'pairing' && (
                                      <div className="flex items-center gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingRemoteNameFor(type); setCustomNameInput(remoteCustomNames[type] || type); }} className="p-1 hover:bg-blue-100 rounded-md"><Pencil className="w-3 h-3" /></button>
                                        {(pairingStates[type] === 'out_of_range' || true) && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setCustomSubTargets(prev => prev.filter(t => t !== type));
                                              setRemoteTargets(prev => prev.filter(t => t !== type));
                                            }}
                                            className="p-1 hover:bg-red-100 rounded-md text-red-500"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    {remoteTargets.includes(type) && pairingStates[type] === 'connected' && <Check className="w-4 h-4 text-bieon-eco" />}
                                  </div>
                                </div>
                              </button>

                              {remoteTargets.includes(type) && pairingStates[type] === 'connected' && (
                                <div className="space-y-2">
                                  <div className="relative">
                                    <select
                                      value={remoteBrands[type] || ""}
                                      onChange={(e) => setRemoteBrands(prev => ({ ...prev, [type]: e.target.value }))}
                                      className="w-full pl-3 pr-8 py-2.5 bg-white border-2 border-blue-100 rounded-xl outline-none text-xs font-bold text-gray-700 focus:border-blue-400 appearance-none"
                                    >
                                      <option value="">-- Pilih Merk --</option>
                                      {(DEVICE_BRANDS[type] || DEVICE_BRANDS[detectedTypes[type]])?.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-blue-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                  </div>
                                  <select
                                    value={remoteRooms[type] || ""}
                                    onChange={(e) => setRemoteRooms(prev => ({ ...prev, [type]: e.target.value }))}
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border-2 border-blue-100 rounded-xl outline-none text-xs font-bold text-gray-700"
                                  >
                                    <option value="">-- Pilih Ruangan --</option>
                                    {rooms.map(room => <option key={room} value={room}>{room}</option>)}
                                  </select>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Success Toast */}
                          {pairingSuccessInfo && (
                            <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
                              <div className="bg-bieon-eco text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-bieon-eco/70">
                                <div className="bg-white/20 p-1.5 rounded-full">
                                  <Check className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold opacity-90 uppercase tracking-wider">Pairing Berhasil!</p>
                                  <p className="text-sm font-black">{pairingSuccessInfo.name} Terhubung</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* + Perangkat Lain Button */}
                          <button
                            onClick={() => {
                              const newId = `Target_${Date.now()}`;
                              setCustomSubTargets([...customSubTargets, newId]);
                              setRemoteCustomNames(prev => ({ ...prev, [newId]: "Perangkat Baru" }));
                            }}
                            className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-blue-200 rounded-2xl text-blue-500 hover:bg-blue-50 transition-all gap-1"
                          >
                            <Plus className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Perangkat Lain</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nama Perangkat <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={deviceForm.name}
                        onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                        disabled={Boolean(isEditingDevice || selectedProduct)}
                        className={`w-full p-4 border-2 border-gray-100 rounded-2xl outline-none font-bold ${(isEditingDevice || selectedProduct) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:border-bieon-eco text-gray-900'}`}
                        placeholder="Contoh: AC Ruang Tamu"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Keterangan</label>
                      <textarea
                        value={deviceForm.notes}
                        onChange={(e) => setDeviceForm({ ...deviceForm, notes: e.target.value })}
                        placeholder="Tambahkan catatan untuk perangkat ini..."
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none min-h-[100px] resize-none"
                      />
                    </div>
                    {!(selectedProduct?.aspect === 'remote' || selectedDeviceType.toLowerCase().includes('remote')) && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Lokasi (Ruangan) <span className="text-red-500">*</span></label>
                          {!showNewRoomInput ? (
                            <div className="relative">
                              <select
                                value={deviceForm.location}
                                onChange={(e) => e.target.value === "__new__" ? setShowNewRoomInput(true) : setDeviceForm({ ...deviceForm, location: e.target.value })}
                                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none  appearance-none"
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
                                className="flex-1 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none "
                              />
                              <button onClick={handleAddRoom} className="p-4 bg-bieon-eco text-white rounded-2xl  shadow-lg"><Check className="w-6 h-6" /></button>
                              <button onClick={() => setShowNewRoomInput(false)} className="p-4 bg-gray-100 text-gray-400 rounded-2xl"><X className="w-6 h-6" /></button>
                            </div>
                          )}
                        </div>


                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-6">
                    {(() => {
                      const isRemoteType = (selectedProduct?.aspect === 'remote' || selectedDeviceType.toLowerCase().includes('remote'));
                      const isValidLocation = Boolean(deviceForm.location && rooms.includes(deviceForm.location));
                      const isFormValid = isRemoteType
                        ? (deviceForm.name && remoteTargets.length > 0 && !remoteTargets.some(t => !remoteRooms[t]))
                        : (deviceForm.name && isValidLocation);

                      if (isRemoteType) {
                        return (
                          <>
                            <button
                              onClick={() => handleDirectSave()}
                              disabled={!isFormValid}
                              className={`flex-1 py-4 border-2 rounded-2xl font-bold transition-all ${isFormValid ? 'bg-white border-bieon-eco text-bieon-eco hover:bg-bieon-eco/5 active:scale-[0.98]' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                              Simpan
                            </button>
                            <button
                              onClick={handleSubmitDeviceForm}
                              disabled={!isFormValid}
                              className={`flex-[1.5] py-4 rounded-2xl font-bold transition-all ${isFormValid ? 'bg-bieon-eco text-white shadow-xl shadow-bieon-eco/20 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                              Lanjut ke Mode Otomatis
                            </button>
                          </>
                        );
                      } else {
                        return (
                          <button
                            onClick={handleSubmitDeviceForm}
                            disabled={!isFormValid}
                            className={`flex-1 py-4 rounded-2xl font-bold transition-all ${isFormValid ? 'bg-bieon-eco text-white shadow-xl shadow-bieon-eco/20 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                          >
                            {selectedCategory === "sensor" ? "Lanjut ke Parameter" : "Lanjut ke Mode Otomatis"}
                          </button>
                        );
                      }
                    })()}
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
                    <>
                      {(selectedProduct?.aspect === 'remote' || selectedDeviceType.toLowerCase().includes('remote')) && !activeSensorAspect ? (
                        <div className="space-y-10 mb-8">
                          {/* Subtle Device Selector at Top */}
                          <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-4 scrollbar-hide">
                            {remoteTargets.map((target) => {
                              const isActive = (activeConfigTarget || remoteTargets[0]) === target;
                              const config = targetConfigs[target] || { mode: 'manual' };
                              return (
                                <button
                                  key={target}
                                  onClick={() => {
                                    setActiveConfigTarget(target);
                                    setIsRemoteDetailView(false);
                                  }}
                                  className={`px-4 py-2 rounded-xl border-2 transition-all shrink-0 flex items-center gap-2 ${isActive ? "border-bieon-eco bg-bieon-eco/5 text-bieon-eco/90" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-bieon-eco/30"}`}
                                >
                                  <div className={`w-2 h-2 rounded-full ${config.mode === 'manual' ? 'bg-gray-300' : 'bg-bieon-eco animate-pulse'}`} />
                                  <div className="flex flex-col items-start">
                                    <span className="text-xs font-bold">{remoteCustomNames[target] || target} {remoteBrands[target] && <span className="text-[10px] font-normal opacity-70">({remoteBrands[target]})</span>}</span>
                                    <span className="text-[9px] text-gray-500 font-medium">
                                      {getTargetSummary(target)}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Active Target Config Area (matches Plug UI) */}
                          {(() => {
                            const target = activeConfigTarget || remoteTargets[0];
                            const config = targetConfigs[target] || { mode: 'manual', aspect: 'none' };

                            return (
                              <div className="space-y-6 animate-in fade-in duration-300">
                                {/* CONSISTENT BIG BUTTONS (same as Plug) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                  <button
                                    onClick={() => {
                                      setTargetConfigs(prev => ({ ...prev, [target]: { ...config, mode: config.mode === 'sensor' ? 'manual' : 'sensor' } }));
                                      if (config.mode !== 'sensor') setIsRemoteDetailView(true);
                                    }}
                                    className={`p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center justify-center sm:justify-start gap-4 ${config.mode === 'sensor' ? "border-bieon-eco bg-bieon-eco/5" : "border-gray-200 hover:border-bieon-eco/50"}`}
                                  >
                                    <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-bieon-eco hidden sm:block" />
                                    <div className="text-center sm:text-left">
                                      <h3 className=" text-gray-900 text-sm sm:text-base mb-0.5">Parameter Lingkungan</h3>
                                      <p className="text-xs text-gray-500 hidden sm:block">Pengaturan Berdasarkan Kondisi Lingkungan</p>
                                    </div>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setTargetConfigs(prev => ({ ...prev, [target]: { ...config, mode: config.mode === 'schedule' ? 'manual' : 'schedule' } }));
                                      if (config.mode !== 'schedule') setIsRemoteDetailView(true);
                                    }}
                                    className={`p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center justify-center sm:justify-start gap-4 ${config.mode === 'schedule' ? "border-bieon-eco bg-bieon-eco/5" : "border-gray-200 hover:border-bieon-eco/50"}`}
                                  >
                                    <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-bieon-eco hidden sm:block" />
                                    <div className="text-center sm:text-left">
                                      <h3 className=" text-gray-900 text-sm sm:text-base mb-0.5">Jadwal Otomatis</h3>
                                      <p className="text-xs text-gray-500 hidden sm:block">Pengaturan Berdasarkan Waktu</p>
                                    </div>
                                  </button>
                                </div>

                                {/* ASPECT SELECTOR (Only if sensor is selected) */}
                                {config.mode === 'sensor' && (
                                  <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="px-4 py-3 bg-bieon-eco/5 rounded-xl border border-bieon-eco/20 mb-2">
                                      <p className="text-xs text-gray-700 flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Pilih Aspek untuk Dikonfigurasi
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                      {/* KENYAMANAN */}
                                      <button
                                        onClick={() => {
                                          setTargetConfigs(prev => ({ ...prev, [target]: { ...config, aspect: "kenyamanan" } }));
                                          setActiveSensorAspect("kenyamanan");
                                        }}
                                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all group text-center ${config.aspect === 'kenyamanan' ? "border-bieon-eco bg-bieon-eco/5" : "border-gray-200 hover:border-bieon-eco hover:bg-bieon-eco/5"}`}
                                      >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${config.aspect === 'kenyamanan' ? "bg-bieon-eco/30" : "bg-bieon-eco/10"}`}>
                                          <Activity className="w-6 h-6 text-bieon-eco" />
                                        </div>
                                        <h4 className="text-sm text-gray-900 mb-1 leading-tight">Kenyamanan</h4>
                                        <p className="text-[10px] text-gray-500">Suhu & Lembap</p>
                                      </button>

                                      {/* KEAMANAN */}
                                      <button
                                        onClick={() => {
                                          setTargetConfigs(prev => ({ ...prev, [target]: { ...config, aspect: "keamanan" } }));
                                          setActiveSensorAspect("keamanan");
                                        }}
                                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all group text-center ${config.aspect === 'keamanan' ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-500 hover:bg-purple-50"}`}
                                      >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${config.aspect === 'keamanan' ? "bg-purple-200" : "bg-purple-100"}`}>
                                          <ShieldAlert className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <h4 className="text-sm text-gray-900 mb-1 leading-tight">Keamanan</h4>
                                        <p className="text-[10px] text-gray-500">Motion & Door Sensor</p>
                                      </button>

                                      {/* KUALITAS AIR */}
                                      <button
                                        onClick={() => {
                                          setTargetConfigs(prev => ({ ...prev, [target]: { ...config, aspect: "kualitasAir" } }));
                                          setActiveSensorAspect("kualitasAir");
                                        }}
                                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all group text-center ${config.aspect === 'kualitasAir' ? "border-cyan-500 bg-cyan-50" : "border-gray-200 hover:border-cyan-500 hover:bg-cyan-50"}`}
                                      >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${config.aspect === 'kualitasAir' ? "bg-cyan-200" : "bg-cyan-100"}`}>
                                          <Waves className="w-6 h-6 text-cyan-600" />
                                        </div>
                                        <h4 className="text-sm text-gray-900 mb-1 leading-tight">Kualitas Air</h4>
                                        <p className="text-[10px] text-gray-500">pH, TDS, Keruh, Suhu</p>
                                      </button>
                                    </div>
                                  </div>
                                )}


                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <button
                            onClick={() => setConfigMode("sensor")}
                            className={`p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center justify-center sm:justify-start gap-4 ${configMode === "sensor" ? "border-bieon-eco bg-bieon-eco/5" : "border-gray-200 hover:border-bieon-eco/50"}`}
                          >
                            <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-bieon-eco hidden sm:block" />
                            <div className="text-center sm:text-left">
                              <h3 className=" text-gray-900 text-sm sm:text-base mb-0.5">Parameter Lingkungan</h3>
                              <p className="text-xs text-gray-500 hidden sm:block">Pengaturan Berdasarkan Kondisi Lingkungan</p>
                            </div>
                          </button>
                          <button
                            onClick={() => setConfigMode("schedule")}
                            className={`p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center justify-center sm:justify-start gap-4 ${configMode === "schedule" ? "border-bieon-eco bg-bieon-eco/5" : "border-gray-200 hover:border-bieon-eco/50"}`}
                          >
                            <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-bieon-eco hidden sm:block" />
                            <div className="text-center sm:text-left">
                              <h3 className=" text-gray-900 text-sm sm:text-base mb-0.5">Jadwal Otomatis</h3>
                              <p className="text-xs text-gray-500 hidden sm:block">Pengaturan Berdasarkan Waktu</p>
                            </div>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {(() => {
                    const isRemote = (selectedProduct?.aspect === 'remote' || selectedDeviceType.toLowerCase().includes('remote'));
                    const target = activeConfigTarget || remoteTargets[0];
                    const config = targetConfigs[target] || { mode: 'manual' };

                    const showSensorDetail = isRemote ? (config.mode === 'sensor' && activeSensorAspect && isRemoteDetailView) : (configMode === "sensor");

                    if (showSensorDetail) {
                      return (
                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                          {!activeSensorAspect ? (
                            <div className="space-y-4">
                              <div className="px-4 py-3 bg-bieon-eco/5 rounded-xl border border-bieon-eco/20 mb-6">
                                <p className="text-sm  text-gray-700 flex items-center gap-2">
                                  <Activity className="w-4 h-4" /> Pilih Aspek untuk Dikonfigurasi
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                {/* ASPEK KENYAMANAN */}
                                <button
                                  onClick={() => setActiveSensorAspect("kenyamanan")}
                                  className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-2xl hover:border-bieon-eco hover:bg-bieon-eco/5 transition-all group text-center"
                                >
                                  <div className="w-12 h-12 bg-bieon-eco/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Activity className="w-6 h-6 text-bieon-eco" />
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
                                  className="flex items-center gap-2 text-bieon-eco  hover:text-bieon-eco/90 transition-colors group mb-2"
                                >
                                  <ChevronRight className="w-5 h-5 rotate-180" />
                                  Kembali Pilih Aspek
                                </button>
                              )}

                              {/* ASPEK KENYAMANAN */}
                              {activeSensorAspect === "kenyamanan" && (
                                <div className="space-y-4">
                                  <div className="px-4 py-2 bg-bieon-eco/5 rounded-lg border border-bieon-eco/20">
                                    <p className="text-sm  text-gray-700 flex items-center gap-2">
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
                                        className="w-5 h-5 text-bieon-eco rounded"
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
                                        className="w-5 h-5 text-bieon-eco rounded"
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
                                        className="w-5 h-5 text-bieon-eco rounded"
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
                                        className="w-5 h-5 text-bieon-eco rounded"
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
                                        className="w-5 h-5 text-bieon-eco rounded"
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
                                        className="w-5 h-5 text-bieon-eco rounded"
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
                                        <Wind className="w-6 h-6 text-bieon-sense" />
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
                                        className="w-5 h-5 text-bieon-eco rounded"
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
                                        className="w-5 h-5 text-bieon-eco rounded"
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
                      );
                    } else if (isRemote && (!isRemoteDetailView || config.mode === 'manual')) {
                      return null;
                    } else {
                      // Schedule flow
                      return (
                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                          {(() => {
                            const currentTarget = isRemote ? target : null;

                            return scheduleConfig.map((schedule, index) => {
                              // Filter logic
                              if (isRemote && schedule.target !== currentTarget) return null;

                              return (
                                <div key={index} className="border-2 border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:border-bieon-eco/30 transition-all">
                                  <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-5 h-5 text-bieon-eco" />
                                      <h4 className=" text-gray-900">Jadwal #{index + 1} {isRemote && <span className="text-xs font-normal text-bieon-eco">({schedule.target})</span>}</h4>
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
                                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bieon-eco focus:border-transparent transition-all"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm  text-gray-700 mb-2">Jam Mati</label>
                                        <input
                                          type="time"
                                          value={schedule.endTime}
                                          onChange={(e) => updateSchedule(index, "endTime", e.target.value)}
                                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bieon-eco focus:border-transparent transition-all"
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
                                              ? "bg-bieon-eco text-white shadow-md shadow-bieon-eco/30"
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
                              );
                            });
                          })()}
                          <button
                            onClick={addSchedule}
                            className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl  hover:border-bieon-eco hover:text-bieon-eco"
                          >
                            + Tambah Jadwal
                          </button>
                        </div>
                      );
                    }
                  })()}
                  <div className="flex gap-3 pt-6">
                    <button
                      onClick={() => setStep("add-device-form")}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl  hover:bg-gray-50 transition-all"
                    >
                      Kembali
                    </button>
                    <button
                      id="actual-save-trigger"
                      onClick={((selectedProduct?.aspect === 'remote' || selectedDeviceType.toLowerCase().includes('remote')) && isRemoteDetailView) ? () => { setIsRemoteDetailView(false); setActiveSensorAspect(null); } : handleSaveDevice}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl  shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {((selectedProduct?.aspect === 'remote' || selectedDeviceType.toLowerCase().includes('remote')) && isRemoteDetailView) ? "Selesai Atur Perangkat" : "Simpan Konfigurasi"}
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
            <div className="bg-bieon-eco p-6 text-center text-white relative">
              <button
                onClick={() => setShowTokenModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <Radio className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-white">Token Akses Teknisi</h3>
              <p className="text-white/80 text-xs mt-1">Berikan kode ini kepada teknisi Anda</p>
            </div>
            <div className="p-8 text-center">
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-6 mb-6">
                <span className="text-[3rem]  tracking-[0.5rem] text-bieon-eco font-mono">
                  {generatedToken}
                </span>
              </div>
              <div className="flex items-start gap-3 text-left bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Token ini bersifat <strong className="font-extrabold text-amber-950">sekali pakai</strong> dengan masa aktif <strong className="font-extrabold text-amber-950">5 menit</strong>. Setelah digunakan, akses konfigurasi teknisi berlaku selama <strong className="font-extrabold text-amber-950">30 menit</strong> dan akan <em className="italic">logout otomatis</em> jika waktu habis.
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
    </HomeownerLayout>
  );
}
