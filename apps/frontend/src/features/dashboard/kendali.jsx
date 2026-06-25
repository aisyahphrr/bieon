// Device Control Dashboard
import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";
import {
  Plus,
  Home,
  Wifi,
  Settings,
  Power,
  Trash2,
  Calendar,
  Clock,
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
  { value: "Custom", label: "Lainnya" }
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
  const { t, i18n } = useTranslation();
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
  const normalizeBieonId = (s) => {
    if (!s) return '';
    return String(s).trim().toLowerCase().replace(/-/g, '_');
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
  const [remoteRegCountdown, setRemoteRegCountdown] = useState(0);
  const [isAddingSubDevice, setIsAddingSubDevice] = useState(false);
  const [wizardTargetDeviceId, setWizardTargetDeviceId] = useState(null);
  const [wizardDeviceType, setWizardDeviceType] = useState('TV');
  const [isCustomWizardDeviceType, setIsCustomWizardDeviceType] = useState(false);
  const [wizardCustomDeviceType, setWizardCustomDeviceType] = useState('');
  const [wizardBrand, setWizardBrand] = useState('Polytron');
  const [isCustomWizardBrand, setIsCustomWizardBrand] = useState(false);
  const [wizardCustomBrand, setWizardCustomBrand] = useState('');
  const [wizardNotes, setWizardNotes] = useState('');
  const [wizardMappingDrafts, setWizardMappingDrafts] = useState({});
  const [editingMappingDevice, setEditingMappingDevice] = useState(null);
  const [editingMapping, setEditingMapping] = useState(null);
  const [editingRemoteProfile, setEditingRemoteProfile] = useState(null);

  const [joinedDevicesPool, setJoinedDevicesPool] = useState([]);
  const [leavingDevices, setLeavingDevices] = useState({}); // { deviceId: seconds }
  const [pendingOpenJoinDevice, setPendingOpenJoinDevice] = useState(null);
  const [pendingOpenJoinAction, setPendingOpenJoinAction] = useState(null); // 'save' | 'configure'

  // Declaring missing and new refs / states
  const openJoinSubmitLockRef = useRef(false);
  const pendingToggleRef = useRef(new Map());

  const [isHubScanning, setIsHubScanning] = useState(false);
  const [isOpenHubJoinRequestPending, setIsOpenHubJoinRequestPending] = useState(false);
  const [hubScanAttempted, setHubScanAttempted] = useState(false);
  const [hubScanTimer, setHubScanTimer] = useState(0);
  const [discoveredHubs, setDiscoveredHubs] = useState([]);
  const openHubJoinSubmitLockRef = useRef(false);
  const isControlActuator = useMemo(() => {
    const categoryLower = String(selectedCategory || "").toLowerCase();
    const typeLower = String(selectedDeviceType || "").toLowerCase();
    const nameLower = String(deviceForm.name || "").toLowerCase();
    const productAspectLower = String(selectedProduct?.aspect || "").toLowerCase();

    return categoryLower !== "sensor" ||
      typeLower.includes('remote') ||
      typeLower.includes('switch') ||
      typeLower.includes('plug') ||
      nameLower.includes('remote') ||
      nameLower.includes('switch') ||
      nameLower.includes('plug') ||
      productAspectLower.includes('remote') ||
      productAspectLower.includes('switch') ||
      productAspectLower.includes('plug');
  }, [selectedCategory, selectedDeviceType, deviceForm.name, selectedProduct]);

  // Sinkronisasi daftar ruangan berdasarkan perangkat yang ada di sistem BIEON saat ini
  useEffect(() => {
    if (currentBieon && currentBieon.hubs) {
      const existingLocations = new Set();
      const defaultRooms = ["R1", "R2", "R3", "R4"];
      defaultRooms.forEach(r => existingLocations.add(r));

      currentBieon.hubs.forEach(hub => {
        if (hub.devices) {
          hub.devices.forEach(dev => {
            if (dev.location) {
              existingLocations.add(dev.location);
            }
          });
        }
      });
      setRooms(Array.from(existingLocations));
    }
  }, [currentBieon]);

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

  // Efek Hitung Mundur untuk Scanning Open Join Hub
  useEffect(() => {
    let interval;
    if (isHubScanning && hubScanTimer > 0) {
      interval = setInterval(() => {
        setHubScanTimer(prev => prev - 1);
      }, 1000);
    } else if (hubScanTimer === 0 && isHubScanning) {
      setIsHubScanning(false);
    }
    return () => clearInterval(interval);
  }, [isHubScanning, hubScanTimer]);

  // Efek Hitung Mundur untuk Registrasi Remote (30 detik)
  useEffect(() => {
    let timer;
    if (remoteRegCountdown > 0) {
      timer = setInterval(() => {
        setRemoteRegCountdown((prev) => {
          if (prev <= 1) {
            // Ketika hitung mundur selesai, reset status registrasi remote ke idle secara lokal
            const bieonId = currentBieon?.bieonId;
            if (bieonId) {
              setRemoteRegistrationStateByBieon((states) => ({
                ...states,
                [bieonId]: {
                  ...(states[bieonId] || {}),
                  state: 'idle',
                  active: false
                }
              }));
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [remoteRegCountdown, currentBieon?.bieonId]);

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
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/devices/pairing/open', { method: 'POST', headers, body: JSON.stringify({ hubId: selectedHub?.id, duration: 30 }) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || t('kendali.open_join.error_activate', 'Gagal mengaktifkan open join'));
      }

      setIsScanning(true);
      setScanAttempted(true);
      setDiscoveredDevices([]);
      setJoinedDevicesPool([]);
      setLeavingDevices({});
      setScanTimer(30);
    } catch (err) {
      alert(t('kendali.open_join.error_open', 'Gagal membuka Open Join: ') + err.message);
      setIsOpenJoinRequestPending(false);
      openJoinSubmitLockRef.current = false;
      return;
    } finally {
      setIsOpenJoinRequestPending(false);
      openJoinSubmitLockRef.current = false;
    }

    // Waiting for real device_discovered events from backend via Socket.IO
  };

  const handleStartHubDiscovery = async () => {
    if (openHubJoinSubmitLockRef.current || isHubScanning || isOpenHubJoinRequestPending) {
      return;
    }

    openHubJoinSubmitLockRef.current = true;
    setIsOpenHubJoinRequestPending(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/hubs/open_join', {
        method: 'POST',
        headers,
        body: JSON.stringify({ bieonId: currentBieon?.bieonId, duration: 30 })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || t('kendali.open_join_hub.error_activate', 'Gagal mengaktifkan open join hub'));
      }

      setIsHubScanning(true);
      setHubScanAttempted(true);
      setDiscoveredHubs([]);
      setHubScanTimer(30);
    } catch (err) {
      alert(t('kendali.open_join_hub.error_open', 'Gagal membuka Open Join Hub: ') + err.message);
      setIsOpenHubJoinRequestPending(false);
      openHubJoinSubmitLockRef.current = false;
      return;
    } finally {
      setIsOpenHubJoinRequestPending(false);
      openHubJoinSubmitLockRef.current = false;
    }
  };

  const handleConfirmHub = async (hub) => {
    try {
      const token = localStorage.getItem('token');
      const hubId = hub._id || hub.id;
      
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/hubs/${hubId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan Hub');
      }

      setHubScanAttempted(false);
      setIsHubScanning(false);
      setDiscoveredHubs([]);
      
      await fetchData(); // Refresh data real-time agar hub langsung muncul di UI
      setStep("view-bieon");
      alert(t('kendali.open_join_hub.success_claim', 'Hub berhasil disimpan ke daftar perangkat Anda!'));
    } catch (err) {
      alert(t('kendali.open_join_hub.error_save', 'Gagal menyimpan Hub: ') + err.message);
    }
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

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // 1. Get Me
      const meRes = await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/me', {
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
      const sysRes = await fetch((import.meta.env.VITE_API_URL || '') + `/api/hubs/systems/${targetId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const systemsData = await sysRes.json();

      // 3. Get Devices (Disesuaikan untuk target ID)
      const devRes = await fetch((import.meta.env.VITE_API_URL || '') + `/api/kendaliperangkat/my-devices?ownerId=${targetId}`, {
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

  // Load User and Systems from Backend
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // SOCKET.IO REAL-TIME MONITORING
    // Gunakan URL eksplisit ke backend agar tidak bergantung pada Vite proxy untuk WebSocket
    const backendUrl = window.location.hostname === 'localhost'
      ? `http://${window.location.hostname}:5000`
      : window.location.origin;
    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected! ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket.IO connection error:', err.message);
    });

    socket.on('device_telemetry', (updatedDevice) => {
      // Prefer device_ieee as canonical identifier when available
      const deviceKey = String(updatedDevice.device_ieee || updatedDevice.ieee || updatedDevice._id || updatedDevice.id || '');
      console.log('📡 Real-time Telemetry received:', deviceKey, updatedDevice.status, updatedDevice.currentValues);
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
              const devIeee = normalizeIeee(dev.device_ieee || '');
              const updIeee = normalizeIeee(updatedDevice.device_ieee || updatedDevice.ieee || '');

              let isMatch = false;
              if (devIeee && updIeee) {
                isMatch = devIeee === updIeee;
              } else if (dev._id && updatedDevice._id) {
                isMatch = String(dev._id) === String(updatedDevice._id);
              } else if (dev.id && updatedDevice.id) {
                isMatch = String(dev.id) === String(updatedDevice.id);
              }

              if (isMatch) {
                return {
                  ...dev,
                  device_ieee: updatedDevice.device_ieee || updatedDevice.ieee || dev.device_ieee,
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

    socket.on('hub_added', (data) => {
      if (!data || !data.hub) return;
      const { bieonId, hub } = data;
      console.log('🔌 Hub Added event received:', bieonId, hub);

      const hubId = String(hub._id || hub.id || '');
      if (!hubId) return;

      // Update the discovered list for the scanning modal
      setDiscoveredHubs(prev => {
        if (prev.some(h => String(h._id || h.id || '') === hubId || (h.device_ieee && hub.device_ieee && h.device_ieee === hub.device_ieee))) {
          // Jika sudah ada (berdasarkan ID atau IEEE), update datanya saja
          return prev.map(h => 
            (String(h._id || h.id || '') === hubId || (h.device_ieee && hub.device_ieee && h.device_ieee === hub.device_ieee)) 
              ? { ...h, ...hub } 
              : h
          );
        }
        return [...prev, hub];
      });

      // Update bieonSystems with the new hub
      setBieonSystems(prevSystems => {
        return prevSystems.map(sys => {
          if (String(sys.bieonId).toLowerCase() === String(bieonId).toLowerCase() || String(sys.id) === String(hub.systemId)) {
            const alreadyExists = sys.hubs.some(h => String(h._id || h.id || '') === hubId);
            if (alreadyExists) return sys;

            const formattedHub = {
              ...hub,
              id: hubId,
              devices: []
            };

            return {
              ...sys,
              totalHubs: (sys.totalHubs || 0) + 1,
              hubs: [...sys.hubs, formattedHub]
            };
          }
          return sys;
        });
      });

      // Also update currentBieon if it matches
      setCurrentBieon(prevCurrent => {
        if (!prevCurrent) return null;
        if (String(prevCurrent.bieonId).toLowerCase() === String(bieonId).toLowerCase() || String(prevCurrent.id) === String(hub.systemId)) {
          const alreadyExists = prevCurrent.hubs.some(h => String(h._id || h.id || '') === hubId);
          if (alreadyExists) return prevCurrent;

          const formattedHub = {
            ...hub,
            id: hubId,
            devices: []
          };

          return {
            ...prevCurrent,
            totalHubs: (prevCurrent.totalHubs || 0) + 1,
            hubs: [...prevCurrent.hubs, formattedHub]
          };
        }
        return prevCurrent;
      });
    });

    socket.on('remote_registration_state', (registrationState) => {
      const bieonId = String(registrationState?.bieonId || currentBieon?.bieonId || '').trim();
      if (!bieonId) return;

      if (registrationState.active) {
        setRemoteRegCountdown(prev => prev > 0 ? prev : 30);
      } else {
        setRemoteRegCountdown(0);
      }

      setRemoteRegistrationStateByBieon(prev => ({
        ...prev,
        [normalizeBieonId(bieonId)]: {
          ...registrationState,
          bieonId: normalizeBieonId(bieonId),
          updatedAt: registrationState?.updatedAt || Date.now()
        }
      }));
    });

    socket.on('remote_bit_registration', (eventPayload) => {
      const bieonId = String(eventPayload?.bieonId || currentBieon?.bieonId || '').trim();
      const catalogItem = eventPayload?.catalogItem;
      if (!bieonId || !catalogItem) return;

      setRemoteBitCatalogByBieon(prev => {
        const normalizedKey = normalizeBieonId(bieonId);
        const currentItems = Array.isArray(prev[normalizedKey]) ? prev[normalizedKey] : [];
        const nextItems = currentItems.filter((item) => item._id !== catalogItem._id && item.rawSignature !== catalogItem.rawSignature);
        return {
          ...prev,
          [normalizedKey]: [catalogItem, ...nextItems].sort((a, b) => new Date(b.lastSeenAt || b.createdAt || 0) - new Date(a.lastSeenAt || a.createdAt || 0))
        };
      });
    });

    socket.on('remote_bit_catalog_updated', (eventPayload) => {
      const bieonId = String(eventPayload?.bieonId || currentBieon?.bieonId || '').trim();
      const catalogItem = eventPayload?.catalogItem;
      if (!bieonId || !catalogItem) return;

      setRemoteBitCatalogByBieon(prev => {
        const normalizedKey = normalizeBieonId(bieonId);
        const currentItems = Array.isArray(prev[normalizedKey]) ? prev[normalizedKey] : [];
        const found = currentItems.some((item) => item._id === catalogItem._id || item.rawSignature === catalogItem.rawSignature);
        const nextItems = found
          ? currentItems.map((item) => (item._id === catalogItem._id || item.rawSignature === catalogItem.rawSignature) ? catalogItem : item)
          : [catalogItem, ...currentItems];
        return {
          ...prev,
          [normalizedKey]: nextItems.sort((a, b) => new Date(b.lastSeenAt || b.createdAt || 0) - new Date(a.lastSeenAt || a.createdAt || 0))
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
      socket.off('hub_added');
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
        const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/devices/registration/${encodeURIComponent(bieonId)}/catalog`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!cancelled && response.ok) {
          setRemoteBitCatalogByBieon(prev => ({
            ...prev,
            [normalizeBieonId(bieonId)]: Array.isArray(data.items) ? data.items : []
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
        const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/technician-access/status/${userProfile._id}`);
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
        alert(t('alerts.profile_not_found'));
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/technician-access/generate-token', {
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
        alert(t('alerts.token_generate_failed', { message: data.message || t('kendali.server_error', 'Kesalahan server') }));
      }
    } catch (error) {
      console.error("error generate token:", error);
      alert(t('alerts.token_generate_error'));
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
      alert(t('alerts.profile_not_ready'));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/hubs/setup', {
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
      alert(t('homeowner_qc.add_bieon.success', 'Sistem BIEON berhasil ditambahkan!'));
    } catch (error) {
      alert(t('homeowner_qc.add_bieon.error_failed', 'Gagal menambahkan BIEON ID') + ': ' + error.message);
    }
  };

  const handleDeleteHub = async (hubId, hubName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus Hub Node "${hubName}"? Semua perangkat di dalamnya juga akan terhapus.`)) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Akses ditolak: Token tidak ditemukan.");
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/hubs/${hubId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Gagal menghapus Hub Node');
      }
      alert("Hub Node berhasil dihapus!");
      await fetchData();
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    }
  };

  const handleAddHub = () => {
    if (!currentBieon) return;
    setDiscoveredHubs([]);
    setIsHubScanning(false);
    setHubScanAttempted(false);
    setHubScanTimer(0);
    setStep("open-join-hub");
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
      const res = await fetch((import.meta.env.VITE_API_URL || '') + '/api/products/list', {
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
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/products/register', {
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
        alert(t('alerts.product_registered'));
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
            t('alerts.product_already_registered_confirm')
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
      alert(t('alerts.registration_error', { message: err.message }));
    }
  };

  const handleDeleteRegisteredProduct = async (productId) => {
    if (!window.confirm(t('alerts.delete_product_confirm'))) return;

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert(t('alerts.product_deleted'));
        await fetchRegisteredProducts();
      } else {
        alert(data.message || t('alerts.product_delete_failed'));
      }
    } catch (err) {
      alert(t('alerts.product_delete_error', { message: err.message }));
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
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/devices/registration/${encodeURIComponent(currentBieon.bieonId)}/start`, {
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
      setRemoteRegCountdown(30);

      alert(t('alerts.remote_mode_active'));
    } catch (error) {
      alert(t('alerts.remote_start_failed', { message: error.message }));
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

    const detectedType = catalogItem.deviceType ? normalizeRemoteDeviceType(catalogItem.deviceType) : null;
    const detectedBrand = catalogItem.controlGroup || null;
    const detectedKey = catalogItem.controlAction || null;

    setRemoteMappingDraft({
      deviceId: device.id,
      catalogId: catalogItem._id,
      rawSignature: catalogItem.rawSignature,
      rawBitText: catalogItem.rawBitText || '-',
      rawBitHex: catalogItem.rawBitHex || '',
      rawBitBinary: catalogItem.rawBitBinary || '',
      sourceRemoteIeee: existingMapping?.sourceRemoteIeee || catalogItem.sourceRemoteIeee || '',
      sourceRemoteId: existingMapping?.sourceRemoteId || catalogItem.sourceRemoteId || '',
      deviceType: existingMapping?.deviceType || detectedType || fallbackType,
      functionKey: existingMapping?.functionKey || detectedKey || 'power',
      brand: existingMapping?.brand || (detectedBrand ? (['Samsung', 'LG', 'Daikin', 'Panasonic', 'Sharp', 'Gree', 'Midea', 'TCL', 'Sony', 'Polytron', 'Xiaomi', 'Hisense', 'Miyako', 'Maspion', 'Cosmos', 'Sekai', 'KDK', 'Turbo'].includes(detectedBrand) ? detectedBrand : 'Other') : 'Other'),
      customBrand: existingMapping?.brand && existingMapping.brand !== 'Other' ? existingMapping.brand : (detectedBrand && !['Samsung', 'LG', 'Daikin', 'Panasonic', 'Sharp', 'Gree', 'Midea', 'TCL', 'Sony', 'Polytron', 'Xiaomi', 'Hisense', 'Miyako', 'Maspion', 'Cosmos', 'Sekai', 'KDK', 'Turbo'].includes(detectedBrand) ? detectedBrand : ''),
      functionLabel: existingMapping?.functionLabel || getRemoteFunctionLabel(existingMapping?.deviceType || detectedType || fallbackType, existingMapping?.functionKey || detectedKey || 'power'),
      label: existingMapping?.label || catalogItem.controlLabel || ''
    });
  };

  const handleCancelRemoteMapping = () => {
    setRemoteMappingDraft(null);
  };

  const handleDisableRemoteBit = async (catalogItem) => {
    if (!catalogItem?._id) return;

    if (!window.confirm(t('alerts.delete_raw_bit_confirm'))) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/devices/registration/catalog/${catalogItem._id}`, {
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
          const normalizedKey = normalizeBieonId(bieonId);
          const currentItems = Array.isArray(prev[normalizedKey]) ? prev[normalizedKey] : [];
          const nextItems = currentItems.map((item) => (item._id === data.item._id || item.rawSignature === data.item.rawSignature) ? data.item : item);
          return { ...prev, [normalizedKey]: nextItems };
        });
      }

      if (remoteMappingDraft?.catalogId === catalogItem._id) {
        setRemoteMappingDraft(null);
      }
    } catch (error) {
      alert(t('alerts.raw_bit_delete_failed', { message: error.message }));
    }
  };

  const executeDeleteRemoteBit = async (catalogItem) => {
    if (!catalogItem?._id) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/devices/registration/catalog/${catalogItem._id}`, {
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
          const normalizedKey = normalizeBieonId(bieonId);
          const currentItems = Array.isArray(prev[normalizedKey]) ? prev[normalizedKey] : [];
          const nextItems = currentItems.map((item) => (item._id === data.item._id || item.rawSignature === data.item.rawSignature) ? data.item : item);
          return { ...prev, [normalizedKey]: nextItems };
        });
      }

      if (remoteMappingDraft?.catalogId === catalogItem._id) {
        setRemoteMappingDraft(null);
      }
    } catch (error) {
      alert(t('alerts.raw_bit_delete_failed', { message: error.message }));
    }
  };

  const handleSaveRemoteMapping = async (directDraft) => {
    const draft = directDraft || remoteMappingDraft;
    if (!draft || !currentBieon) return;

    const device = getAllDevices().find((item) => String(item.id) === String(draft.deviceId) || String(item._id) === String(draft.deviceId));
    if (!device) {
      alert(t('alerts.remote_card_not_found'));
      return;
    }

    const deviceType = normalizeRemoteDeviceType(draft.deviceType);
    const functionKey = normalizeRemoteFunctionKey(draft.functionKey);
    const functionLabel = getRemoteFunctionLabel(deviceType, functionKey);
    const brand = String(draft.customBrand || draft.brand || 'Other').trim() || 'Other';
    const label = String(draft.label || functionLabel || functionKey).trim() || functionLabel;

    const existingMappings = Array.isArray(device.remoteMappings)
      ? device.remoteMappings
      : Array.isArray(device.remoteState?.mappings)
        ? device.remoteState.mappings
        : [];

    const nextMapping = {
      catalogId: draft.catalogId,
      rawSignature: draft.rawSignature,
      rawBitText: draft.rawBitText,
      rawBitHex: draft.rawBitHex,
      rawBitBinary: draft.rawBitBinary,
      sourceRemoteIeee: draft.sourceRemoteIeee,
      sourceRemoteId: draft.sourceRemoteId,
      deviceType,
      functionKey,
      functionLabel,
      label,
      brand,
      deviceNotes: draft.deviceNotes || '',
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
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/kendaliperangkat/configure/${device.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: device.name,
          location: device.location,
          notes: device.notes,
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
      setRemoteBitCatalogByBieon(prev => {
        const normalizedKey = normalizeBieonId(currentBieon.bieonId);
        return {
          ...prev,
          [normalizedKey]: (prev[normalizedKey] || []).map((item) => item._id === draft.catalogId ? { ...item, captureStatus: 'mapped', isActive: true, controlAction: functionKey, controlLabel: label, deviceType, controlGroup: brand } : item)
        };
      });
      setRemoteMappingDraft(null);
      alert(t('alerts.remote_mapping_saved'));
    } catch (error) {
      alert(t('alerts.remote_mapping_failed', { message: error.message }));
    }
  };

  const handleSaveAllRemoteMappings = async (device) => {
    if (!device || !currentBieon) return;

    const finalType = isCustomWizardDeviceType ? wizardCustomDeviceType : wizardDeviceType;
    const finalBrand = isCustomWizardBrand ? wizardCustomBrand : wizardBrand;

    const existingMappings = Array.isArray(device.remoteMappings)
      ? device.remoteMappings
      : Array.isArray(device.remoteState?.mappings)
        ? device.remoteState.mappings
        : [];

    const unmappedItems = (remoteBitCatalogByBieon[normalizeBieonId(currentBieon?.bieonId)] || [])
      .filter(item => item.isActive !== false && item.captureStatus !== 'disabled' && String(item.captureStatus) !== 'mapped');

    let nextMappings = [...existingMappings];
    let hasProfileChanges = false;

    if (editingRemoteProfile) {
      const origType = editingRemoteProfile.deviceType;
      const origBrand = editingRemoteProfile.brand;
      const origNotes = existingMappings.find(m => m.deviceType === origType && m.brand === origBrand)?.deviceNotes || '';

      if (finalType !== origType || finalBrand !== origBrand || wizardNotes !== origNotes) {
        hasProfileChanges = true;
        nextMappings = existingMappings.map(item => {
          if (item.deviceType === origType && item.brand === origBrand) {
            return {
              ...item,
              deviceType: finalType,
              brand: finalBrand,
              deviceNotes: wizardNotes
            };
          }
          return item;
        });
      }
    }

    // Update any existing mappings whose function draft was modified in wizardMappingDrafts
    existingMappings.forEach(item => {
      const draft = wizardMappingDrafts[item.catalogId];
      if (draft) {
        const finalFunc = draft.functionKey === 'custom_action' ? draft.customFunctionKey : draft.functionKey;
        const finalLabel = draft.label || getRemoteFunctionLabel(finalType, finalFunc);
        if (finalFunc && (item.functionKey !== finalFunc || item.label !== finalLabel)) {
          hasProfileChanges = true;
          nextMappings = nextMappings.map(m => m.catalogId === item.catalogId ? {
            ...m,
            functionKey: finalFunc,
            functionLabel: finalLabel,
            label: finalLabel
          } : m);
        }
      }
    });

    if (unmappedItems.length === 0 && !hasProfileChanges) {
      alert("Tidak ada perubahan profil atau tombol baru yang perlu disimpan.");
      return;
    }

    for (const bitItem of unmappedItems) {
      const functionOptions = [
        ...getRemoteFunctionOptions(finalType),
        { value: 'custom_action', label: 'Lainnya' }
      ];

      const currentDraft = wizardMappingDrafts[bitItem._id] || {
        functionKey: functionOptions[0]?.value || 'power',
        customFunctionKey: '',
        label: getRemoteFunctionLabel(finalType, functionOptions[0]?.value || 'power')
      };

      const finalFunc = currentDraft.functionKey === 'custom_action' ? currentDraft.customFunctionKey : currentDraft.functionKey;
      const finalLabel = currentDraft.label || getRemoteFunctionLabel(finalType, finalFunc);

      if (!finalFunc) {
        alert("Nama fungsi/tombol kustom tidak boleh kosong.");
        return;
      }

      const nextMapping = {
        catalogId: bitItem._id,
        rawSignature: bitItem.rawSignature,
        rawBitText: bitItem.rawBitText,
        rawBitHex: bitItem.rawBitHex,
        rawBitBinary: bitItem.rawBitBinary,
        sourceRemoteIeee: bitItem.sourceRemoteIeee,
        sourceRemoteId: bitItem.sourceRemoteId,
        deviceType: finalType,
        functionKey: finalFunc,
        functionLabel: finalLabel,
        label: finalLabel,
        brand: finalBrand,
        deviceNotes: wizardNotes,
        isActive: true,
        captureStatus: 'mapped',
        mappedAt: new Date().toISOString()
      };

      nextMappings = [
        ...nextMappings.filter((item) => item.rawSignature !== nextMapping.rawSignature && item.catalogId !== nextMapping.catalogId),
        nextMapping
      ];
    }

    const nextRemoteState = {
      ...(device.remoteState || {}),
      mappings: nextMappings,
      profiles: groupRemoteMappings(nextMappings)
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/kendaliperangkat/configure/${device.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: device.name,
          location: device.location,
          notes: device.notes,
          controlledDevice: nextMappings.map((item) => `${item.deviceType} (${item.brand})`).join(', '),
          remoteState: nextRemoteState,
          controlMethod: device.controlMethod || 'Manual'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Gagal menyimpan semua mapping remote');
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
      
      setRemoteBitCatalogByBieon(prev => {
        const normalizedKey = normalizeBieonId(currentBieon.bieonId);
        let updatedCatalog = [...(prev[normalizedKey] || [])];
        for (const bitItem of unmappedItems) {
          const functionOptions = [
            ...getRemoteFunctionOptions(finalType),
            { value: 'custom_action', label: 'Lainnya' }
          ];

          const currentDraft = wizardMappingDrafts[bitItem._id] || {
            functionKey: functionOptions[0]?.value || 'power',
            customFunctionKey: '',
            label: getRemoteFunctionLabel(finalType, functionOptions[0]?.value || 'power')
          };

          const finalFunc = currentDraft.functionKey === 'custom_action' ? currentDraft.customFunctionKey : currentDraft.functionKey;
          const finalLabel = currentDraft.label || getRemoteFunctionLabel(finalType, finalFunc);

          updatedCatalog = updatedCatalog.map((item) => 
            item._id === bitItem._id 
              ? { ...item, captureStatus: 'mapped', isActive: true, controlAction: finalFunc, controlLabel: finalLabel, deviceType: finalType, controlGroup: finalBrand } 
              : item
          );
        }
        return {
          ...prev,
          [normalizedKey]: updatedCatalog
        };
      });

      setWizardMappingDrafts({});
      setIsAddingSubDevice(false);
    } catch (error) {
      alert(`Gagal menyimpan semua bit raw: ${error.message}`);
    }
  };

  const handleDeleteSubDevice = async (device, profile) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus sub-perangkat ${profile.deviceType} (${profile.brand}) beserta semua tombolnya?`)) {
      return;
    }

    const existingMappings = Array.isArray(device.remoteMappings)
      ? device.remoteMappings
      : Array.isArray(device.remoteState?.mappings)
        ? device.remoteState.mappings
        : [];

    const nextMappings = existingMappings.filter(
      (item) => !(item.deviceType === profile.deviceType && item.brand === profile.brand)
    );

    const nextRemoteState = {
      ...(device.remoteState || {}),
      mappings: nextMappings,
      profiles: groupRemoteMappings(nextMappings)
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/kendaliperangkat/configure/${device.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: device.name,
          location: device.location,
          notes: device.notes,
          controlledDevice: nextMappings.map((item) => `${item.deviceType} (${item.brand})`).join(', '),
          remoteState: nextRemoteState,
          controlMethod: device.controlMethod || 'Manual'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Gagal menghapus sub-perangkat');
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
      alert('Sub-perangkat berhasil dihapus.');
    } catch (error) {
      alert(`Gagal menghapus sub-perangkat: ${error.message}`);
    }
  };

  const handleDeleteSingleMapping = async (device, mapping) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus tombol "${mapping.label || mapping.functionLabel || mapping.functionKey}"?`)) {
      return;
    }

    const existingMappings = Array.isArray(device.remoteMappings)
      ? device.remoteMappings
      : Array.isArray(device.remoteState?.mappings)
        ? device.remoteState.mappings
        : [];

    const nextMappings = existingMappings.filter(
      (item) => !(item.catalogId === mapping.catalogId && item.rawSignature === mapping.rawSignature)
    );

    const nextRemoteState = {
      ...(device.remoteState || {}),
      mappings: nextMappings,
      profiles: groupRemoteMappings(nextMappings)
    };

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/kendaliperangkat/configure/${device.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: device.name,
          location: device.location,
          notes: device.notes,
          controlledDevice: nextMappings.map((item) => `${item.deviceType} (${item.brand})`).join(', '),
          remoteState: nextRemoteState,
          controlMethod: device.controlMethod || 'Manual'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Gagal menghapus tombol');
      }

      if (mapping.catalogId) {
        await fetch((import.meta.env.VITE_API_URL || '') + `/api/devices/registration/catalog/${mapping.catalogId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            captureStatus: 'captured',
            isActive: true,
            controlAction: '',
            controlLabel: '',
            deviceType: '',
            controlGroup: ''
          })
        });
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

      if (mapping.catalogId) {
        setRemoteBitCatalogByBieon(prev => {
          const normalizedKey = normalizeBieonId(currentBieon.bieonId);
          return {
            ...prev,
            [normalizedKey]: (prev[normalizedKey] || []).map((item) => 
              item._id === mapping.catalogId 
                ? { 
                    ...item, 
                    captureStatus: 'captured', 
                    isActive: true, 
                    controlAction: '', 
                    controlLabel: '', 
                    deviceType: '', 
                    controlGroup: '' 
                  } 
                : item
            )
          };
        });
      }

    } catch (error) {
      alert(`Gagal menghapus tombol: ${error.message}`);
    }
  };

  const openMappingConfig = (device, mapping) => {
    setEditingMappingDevice(device);
    setEditingMapping({
      ...mapping,
      controlMethod: mapping.controlMethod || 'Manual',
      scheduleSettings: mapping.scheduleSettings || [],
      sensorParams: mapping.sensorParams || {
        temperature: 28,
        humidity: 70,
        ph: 7.0,
        tds: 500,
        turbidity: 100,
        isMotionEnabled: false,
        isDoorEnabled: false
      },
      environmentAspect: mapping.environmentAspect || 'Kenyamanan'
    });
  };

  const handleSaveMappingAutomation = async () => {
    if (!editingMappingDevice || !editingMapping) return;

    const existingMappings = Array.isArray(editingMappingDevice.remoteMappings)
      ? editingMappingDevice.remoteMappings
      : Array.isArray(editingMappingDevice.remoteState?.mappings)
        ? editingMappingDevice.remoteState.mappings
        : [];

    const nextMapping = {
      ...editingMapping,
      isActive: true,
      captureStatus: 'mapped',
      mappedAt: new Date().toISOString()
    };

    const nextMappings = existingMappings.map((item) =>
      (item.catalogId === nextMapping.catalogId || item.rawSignature === nextMapping.rawSignature) ? nextMapping : item
    );

    const nextRemoteState = {
      ...(editingMappingDevice.remoteState || {}),
      mappings: nextMappings,
      profiles: groupRemoteMappings(nextMappings)
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/kendaliperangkat/configure/${editingMappingDevice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingMappingDevice.name,
          location: editingMappingDevice.location,
          notes: editingMappingDevice.notes,
          controlledDevice: nextMappings.map((item) => `${item.deviceType} (${item.brand})`).join(', '),
          remoteState: nextRemoteState,
          controlMethod: editingMappingDevice.controlMethod || 'Manual'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Gagal menyimpan konfigurasi otomasi');
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
          devices: hub.devices.map((item) => String(item.id) === String(editingMappingDevice.id) ? {
            ...item,
            ...updatedDevice,
            remoteState: nextRemoteState,
            remoteMappings: nextMappings
          } : item)
        }))
      }));

      setBieonSystems(updatedSystems);
      setCurrentBieon(updatedSystems.find((system) => system.id === currentBieon.id) || currentBieon);
      alert('Otomatisasi tombol berhasil disimpan.');
      setEditingMapping(null);
      setEditingMappingDevice(null);
    } catch (error) {
      alert(`Gagal menyimpan otomasi: ${error.message}`);
    }
  };

  const handleAddRoom = (targetType = null) => {
    if (!newRoomInput.trim()) return;
    const roomName = newRoomInput.trim();
    if (rooms.includes(roomName)) {
      alert(t('alerts.room_already_exists'));
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
    if (!deviceForm.name || !deviceForm.location) {
      alert(t('alerts.fill_device_location'));
      return;
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
    if (!deviceForm.name || !deviceForm.location) {
      alert(t('alerts.fill_device_location'));
      return;
    }

    if (!currentBieon || !selectedHub) return;

    try {
      const token = localStorage.getItem('token');
      const rawControl = forcedMode || (isTechnicianMode ? null : ((selectedCategory === "sensor" && !isControlActuator) ? "sensor" : "manual"));
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
        scheduleSettings: backendControl === "Jadwal" ? scheduleConfig : null,
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
      alert(editingId ? t('alerts.device_updated') : t('alerts.device_added'));
    } catch (error) {
      console.error("Save error details:", error);
      alert(t('alerts.device_save_failed', { message: error.message || '' }));
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

      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/kendaliperangkat', {
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

      alert(data.message || t('kendali.open_join.registered_success', 'Berhasil! {{name}} telah terdaftar.', { name: dev.name }));

      // Refresh produk terdaftar dulu biar sinkron
      await fetchRegisteredProducts();
      // Jangan setStep("select-category") di sini agar modal Open Join tidak tertutup
      // biarkan user tetap di modal Open Join untuk mengelola perangkat lainnya

    } catch (error) {
      console.error('Quick Save Error:', error);
      alert(t('kendali.open_join.save_failed', 'Gagal simpan: ') + error.message);
    }
  };

  const handleSaveDevice = async () => {
    if (!currentBieon || !selectedHub) return;

    try {
      const token = localStorage.getItem('token');
      const rawControl = isTechnicianMode ? null : ((selectedCategory === "sensor" && !isControlActuator) ? "sensor" : configMode);
      const { backendCategory, backendType, backendControl, backendAspect } = mapToBackendData(selectedCategory, selectedDeviceType, rawControl, activeSensorAspect);

      const activeHomeownerId = localStorage.getItem('bieon_active_homeowner_id');
      const targetOwnerId = (isTechnicianMode && activeHomeownerId) ? activeHomeownerId : userProfile._id;

      const productIdValue = selectedProduct?.productId || selectedProduct?.id || pendingOpenJoinDevice?.id || pendingOpenJoinDevice?.device_ieee || deviceForm?.name || null;
      if (!productIdValue) {
        alert(t('alerts.product_id_unavailable'));
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
      alert(editingId ? t('alerts.device_updated') : t('alerts.device_added'));
    } catch (error) {
      alert(t('alerts.device_save_failed', { message: error.message || '' }));
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

      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/kendaliperangkat/${deviceId}/toggle`, {
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
      alert(t('alerts.device_send_failed', { message: error.message }));
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
      await fetch((import.meta.env.VITE_API_URL || '') + `/api/kendaliperangkat/${deviceId}/params`, {
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
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/kendaliperangkat/${device.id}/remote-command`, {
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

    if (requireConfirmation && !confirm(t('alerts.delete_device_confirm'))) return false;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/kendaliperangkat/${deviceId}`, {
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
        alert(t('alerts.device_deleted'));
      }
      return true;
    } catch (error) {
      if (showErrorAlert) {
        alert(t('alerts.device_save_failed', { message: error.message }));
      }
      console.error("Error delete device:", error);
      return false;
    }
  };

  const togglePinDevice = async (deviceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch((import.meta.env.VITE_API_URL || '') + `/api/kendaliperangkat/${deviceId}/pin`, {
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

    const devNameLower = (device.name || "").toLowerCase();
    const devTypeLower = (device.type || device.deviceType || "").toLowerCase();
    const devCategoryLower = (device.category || "").toLowerCase();

    const isDeviceRemote = devNameLower.includes("remote") ||
      devTypeLower.includes("remote") ||
      devCategoryLower.includes("remote");

    // Normalisasi kategori dari backend ("Sensor" / "Control Actuator System") kembali ke format state frontend ("sensor" / "control")
    const isSensorMode = isDeviceRemote ? false : ((device.category || "").toLowerCase() === "sensor");
    const mappedCategory = isSensorMode ? "sensor" : "control";

    setSelectedCategory(mappedCategory);
    setIsEditingDevice(device.id);

    let actualDeviceType = isDeviceRemote ? "remote" : (device.type || device.deviceType || "");

    // Normalisasi tipe sensor dari backend ke format dropdown frontend
    if (mappedCategory === "sensor") {
      const typeLower = actualDeviceType.toLowerCase();
      if (typeLower === "kenyamanan" || typeLower === "comfort" || typeLower === "humidity sensor") {
        actualDeviceType = "Sensor Kenyamanan";
      } else if (typeLower === "kualitas air" || typeLower === "water quality") {
        actualDeviceType = "Sensor Kualitas Air";
      } else if (typeLower === "keamanan" || typeLower === "security") {
        actualDeviceType = "Sensor Keamanan";
      } else if (devNameLower.includes("water") || devNameLower.includes("bluecheck")) {
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
      // PENTING: Normalisasi nilai backend ke nilai frontend
      // Backend: 'Jadwal' → Frontend: 'schedule'
      // Backend: 'Lingkungan' → Frontend: 'sensor' (sudah ditangani di if-block atas)
      // Backend: 'Manual' → Frontend: 'manual'
      const normalizedMode = (device.controlMethod === 'Jadwal' || device.controlMethod === 'schedule')
        ? 'schedule'
        : 'manual';
      setConfigMode(normalizedMode);
      if (device.scheduleSettings && device.scheduleSettings.length > 0) {
        setScheduleConfig([...device.scheduleSettings]);
      } else {
        setScheduleConfig([]); // Reset jika tidak ada jadwal
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
    alert(t('alerts.device_updated_db'));
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
    const name = String(device.name || "").trim().toLowerCase();
    const category = String(device.category || "").trim().toLowerCase();
    const type = String(device.type || device.deviceType || "").trim().toLowerCase();

    if (name.includes("remote") || category.includes("remote") || type.includes("remote")) return "control";
    if (category.includes("sensor")) return "sensor";
    if (category.includes("control") || category.includes("actuator")) return "control";
    if (type.includes("sensor")) return "sensor";
    if (type.includes("plug") || type.includes("switch") || type.includes("control")) return "control";
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
                    <h3 className="font-bold text-gray-900 text-lg">{t('kendali.title', 'Kendali Perangkat')}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{t('kendali.subtitle', 'Manajemen Hub & Smart Device BIEON')}</p>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  {step === "view-bieon" && currentBieon && (
                    <button
                      onClick={() => setStep("idle")}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl  hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                      <span>{t('kendali.back_to_all', '← Kembali ke Semua BIEON')}</span>
                    </button>
                  )}
                  {userProfile?.role === 'Homeowner' && (
                    <button
                      onClick={handleGenerateToken}
                      className="px-5 py-2.5 bg-white border-2 border-bieon-eco/20 text-bieon-eco rounded-2xl  hover:bg-bieon-eco/5 transition-all shadow-sm flex items-center gap-2"
                    >
                      <Radio className="w-5 h-5" />
                      <span>{t('kendali.tech_access_token', 'Token Akses Teknisi')}</span>
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
                    <h2 className="text-2xl  text-gray-900 mb-3">{t('kendali.no_system', 'Belum Ada Sistem BIEON')}</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {t('kendali.no_system_desc', 'Daftarkan ID perangkat BIEON Anda untuk memulai monitoring.')}
                    </p>
                    {!isTechnicianMode && (
                      <button
                        onClick={() => setStep("input-id")}
                        className="px-8 py-4 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl  shadow-lg hover:shadow-xl transition-all"
                      >
                        <Plus className="w-5 h-5 inline mr-2" />
                        {t('kendali.add_first_bieon', 'Tambah BIEON Pertama')}
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
                            <p className="text-sm text-gray-600">{t('kendali.bieon_systems', 'BIEON Systems')}</p>
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
                            <p className="text-sm text-gray-600">{t('kendali.total_hubs', 'Total Hubs')}</p>
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
                            <p className="text-sm text-gray-600">{t('kendali.total_devices', 'Total Devices')}</p>
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
                            <p className="text-sm text-gray-600">{t('kendali.active_devices', 'Active Devices')}</p>
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
                        <h2 className="text-xl  text-gray-900">{t('kendali.registered_systems', 'Sistem BIEON Terdaftar')}</h2>
                        {!isTechnicianMode && (
                          <button
                            onClick={() => setStep("input-id")}
                            className="flex items-center gap-2 px-4 py-2 bg-bieon-eco text-white rounded-lg  hover:bg-bieon-eco/90 transition-all shadow-md active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                            {t('kendali.add_bieon', 'Tambah BIEON')}
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
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm font-semibold text-gray-700">
                                      {t('kendali.hub_device_count', { hubCount: bieon.totalHubs, deviceCount: bieon.hubs.flatMap((h) => h.devices).length }, `${bieon.totalHubs} Hubs • ${bieon.hubs.flatMap((h) => h.devices).length} Devices`)}
                                    </span>
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
                      <h2 className="text-2xl  text-gray-900">{t('homeowner_qc.add_bieon.title', 'Tambah BIEON')}</h2>
                      <p className="text-sm text-gray-600 mt-1">{t('homeowner_qc.add_bieon.subtitle', 'Masukkan ID BIEON Anda')}</p>
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
                        {t('homeowner_qc.add_bieon.label_id', 'ID BIEON')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bieonIdInput}
                        onChange={(e) => setBieonIdInput(e.target.value)}
                        placeholder={t('homeowner_qc.add_bieon.placeholder_id', 'Demo: Coba BIEON-001...')}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bieon-eco"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {t('homeowner_qc.add_bieon.demo_tip', 'Demo: Coba BIEON-001, BIEON-002, BIEON-003, atau BIEON-004')}
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
                        {t('homeowner_qc.add_bieon.btn_cancel', 'Batal')}
                      </button>
                      <button
                        onClick={handleSubmitBieonId}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl  shadow-lg hover:shadow-xl transition-all"
                      >
                        {t('homeowner_qc.add_bieon.btn_submit', 'Submit')}
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
                          <span className="text-sm font-semibold text-gray-700">
                            {t('kendali.hub_nodes_count', { count: currentBieon.totalHubs }, `${currentBieon.totalHubs} Hub Nodes`)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-700">
                            {t('kendali.devices_count', { count: currentBieon.hubs.flatMap((h) => h.devices).length }, `${currentBieon.hubs.flatMap((h) => h.devices).length} Devices`)}
                          </span>
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
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900">
                                {/^[0-9a-fA-F]{16}$/.test(hub.name) ? 'BIEON Hub Node' : hub.name}
                              </h3>
                              <p className="text-xs text-gray-600 font-medium font-mono">
                                IEEE: {/^[0-9a-fA-F]{16}$/.test(hub.name) ? hub.name : (hub.device_ieee || hub.id)}
                              </p>
                            </div>
                            {!isTechnicianMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteHub(hub.id, hub.name);
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Hub Node"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 font-semibold">{t('kendali.devices_label', 'Devices:')}</span>
                              <span className="font-bold text-gray-900">{hub.devices.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 font-semibold">{t('kendali.status_label', 'Status:')}</span>
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
                          <Plus className="w-4 h-4" /> {t('kendali.btn_add_device', 'Add Device')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                { /* Room Filter & Device List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-4">{t('kendali.room_filter', 'Filter per Ruangan')}</h3>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button
                      onClick={() => setSelectedRoom("all")}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${selectedRoom === "all" ? "bg-gradient-to-r from-bieon-eco to-green-600 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      {t('kendali.all_rooms', { count: currentBieon?.hubs.flatMap(h => h.devices).length || 0 }, `Semua Ruangan (${currentBieon?.hubs.flatMap(h => h.devices).length || 0})`)}

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
                      <h2 className="text-2xl font-bold text-gray-900">{t('kendali.device_control', 'Kendali Perangkat')}</h2>
                      <p className="text-sm text-gray-500 mt-1 font-medium">{t('kendali.device_control_desc', 'CRUD, kontrol manual, status, dan detail perangkat')}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {/* Search Bar */}
                      <div className="relative w-full sm:w-64 group">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-bieon-eco transition-colors" />
                        <input
                          type="text"
                          placeholder={t('kendali.search_device', 'Cari perangkat...')}
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
                          {t('kendali.tab_all', 'Semua')}
                        </button>
                        <button
                          onClick={() => setActiveFilterCategory("sensor")}
                          className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFilterCategory === "sensor" ? "bg-white text-bieon-eco shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          {t('kendali.tab_sensor', 'Sensor')}
                        </button>
                        <button
                          onClick={() => setActiveFilterCategory("control")}
                          className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFilterCategory === "control" ? "bg-white text-bieon-eco shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          {t('kendali.tab_actuator', 'Aktuator')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {getFilteredDevices().length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">{t('kendali.empty_room', 'Belum ada device di ruangan ini')}</p>
                    </div>
                  )}

                  {getFilteredDevices().length > 0 && (
                    <div className="space-y-4">
                      {getFilteredDevices().map((device) => {
                        const isRemote = (device.controlledDevice && device.controlledDevice.trim() !== "");
                        const isDeviceRemote = String(device.name || "").toLowerCase().includes("remote") ||
                          String(device.type || device.deviceType || "").toLowerCase().includes("remote") ||
                          String(device.category || "").toLowerCase().includes("remote");
                        const deviceCategoryKey = getDeviceCategoryKey(device);
                        const deviceCategoryLabel = getDeviceCategoryLabel(device);
                        const isAnySubOn = device.controls && Object.keys(device.controls).some(key => key.endsWith('_power') && device.controls[key] === 1);
                        const isActuallyOn = String(device.status) === "1" || (isRemote && isAnySubOn);
                        const isWaterQuality = (device.deviceType === "Kualitas Air" || device.deviceType === "Sensor Kualitas Air" || device.environmentAspect?.toLowerCase() === "kualitas air" || (device.name || "").toLowerCase().includes("bluecheck"));
                        const isActuatorDevice = (
                          isDeviceRemote ||
                          (Array.isArray(device.remoteMappings) && device.remoteMappings.length > 0) ||
                          (Array.isArray(device.remoteState?.mappings) && device.remoteState.mappings.length > 0) ||
                          (String(device.controlledDevice || '').trim() !== '') ||
                          deviceCategoryKey !== 'sensor'
                        );
                        const currentRemoteCatalog = (remoteBitCatalogByBieon[normalizeBieonId(currentBieon?.bieonId)] || []).filter(item => item.isActive !== false && item.captureStatus !== 'disabled');
                        const currentRemoteRegistration = remoteRegistrationStateByBieon[normalizeBieonId(currentBieon?.bieonId)] || null;
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
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${deviceCategoryKey === "sensor"
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
                                {!isDeviceRemote && (device.category?.toLowerCase() === 'sensor' || device.type?.toLowerCase() === 'sensor') && (() => {
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
                                                <span className="text-xs font-bold text-gray-500">{t('kendali.params.water_temp', 'Suhu Air')}</span>
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
                                              <span className="text-xs font-bold text-gray-500">{t('kendali.device_details.device_battery', 'Baterai Alat')}</span>
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
                                      <p className="text-[10px] font-black text-bieon-eco uppercase tracking-widest mb-4">{t('kendali.device_details.realtime_monitoring', 'Hasil Monitoring Real-time')}</p>
                                      <div className="flex flex-row gap-4 overflow-x-auto pb-2 scrollbar-thin">
                                        {showTemp && (
                                          <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-2xl border border-orange-100 shadow-sm transition-all hover:shadow-md flex-1 min-w-[140px] sm:min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Thermometer className="w-4 h-4 text-orange-500" />
                                              <span className="text-xs font-bold text-gray-500">{t('kendali.device_details.current_temperature', 'Suhu Sekarang')}</span>
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
                                              <span className="text-xs font-bold text-gray-500">{t('kendali.params.humidity', 'Kelembapan')}</span>
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
                                            <span className="text-xs font-bold text-gray-500">{t('kendali.device_details.device_battery', 'Baterai Alat')}</span>
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
                                          {device.controlMethod === "Manual" || device.controlMethod === "manual" ? t('kendali.device_details.mode_manual', 'Mode Manual') : (device.controlMethod ? ((device.category === "sensor" || device.controlMethod === "Lingkungan" || device.controlMethod === "sensor") ? t('kendali.device_details.parameter_sensor', 'Parameter Sensor') : t('kendali.device_details.schedule_auto', 'Jadwal Otomatis')) : "-")}
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
                                                      {key === "temperature" ? (isWaterQuality ? t('kendali.device_details.param_water_temp', 'Suhu Air') : t('kendali.device_details.param_temp', 'Suhu')) :
                                                        key === "humidity" ? t('kendali.device_details.param_humidity', 'Lembap') :
                                                          key === "isMotionEnabled" ? t('kendali.device_details.param_motion', 'Gerakan') :
                                                            key === "isDoorEnabled" ? t('kendali.device_details.param_door', 'Buka Pintu') :
                                                              key === "ph" ? t('kendali.device_details.param_ph', 'pH') :
                                                                key === "turbidity" ? t('kendali.device_details.param_turbidity', 'Kekeruhan') :
                                                                  key === "tds" ? t('kendali.device_details.param_tds', 'TDS') : t('kendali.device_details.param_water_temp', 'Suhu Air')}:
                                                      {val !== undefined ? ` > ${val}${(key === "temperature" || key === "waterTemp") ? "°C" : key === "humidity" ? "%" : ""}` : t('kendali.device_details.active_label', ' (Aktif)')}
                                                    </span>
                                                  </div>
                                                ))
                                            ) : (
                                              <p className="text-xs text-gray-500 italic">{t('kendali.device_details.no_sensor_active', 'Belum ada sensor yang diaktifkan')}</p>
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
                                                      {t('kendali.device_details.hour', 'Jam')} {sched.startTime} - {sched.endTime} ({sched.action})
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
                                              <p className="text-xs text-gray-500 italic">{t('kendali.device_details.no_schedule_set', 'Belum ada jadwal yang diatur')}</p>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {isDeviceRemote && (
                                  <div className="mb-6">
                                    {isAddingSubDevice && String(wizardTargetDeviceId) === String(device.id) ? (
                                      /* Render Inline Wizard Form */
                                      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm space-y-4 animate-fade-in">
                                        <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                                          <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-bieon-eco">
                                              Detail & Rekam Tombol Sub-Perangkat
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                              Pilih jenis perangkat elektronik, merek, dan rekam remote fisik
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setIsAddingSubDevice(false);
                                              setWizardMappingDrafts({});
                                              setEditingRemoteProfile(null);
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>

                                        <div className="space-y-4">
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end animate-fade-in">
                                            {/* Box 1: Tipe Perangkat */}
                                            <div>
                                              <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Tipe Perangkat</label>
                                              {isCustomWizardDeviceType ? (
                                                <div className="flex items-center gap-1.5 h-[38px]">
                                                  <input
                                                    type="text"
                                                    value={wizardCustomDeviceType}
                                                    onChange={(e) => setWizardCustomDeviceType(e.target.value)}
                                                    placeholder="Nama Tipe Perangkat Kustom"
                                                    className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-xs h-full focus:outline-none focus:border-bieon-eco transition-all"
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setIsCustomWizardDeviceType(false);
                                                      setWizardDeviceType('TV');
                                                      setWizardCustomDeviceType('');
                                                    }}
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 transition-all shrink-0 h-full flex items-center justify-center animate-fade-in"
                                                    title="Kembali ke Dropdown"
                                                  >
                                                    <X className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              ) : (
                                                <select
                                                  value={wizardDeviceType}
                                                  onChange={(e) => {
                                                    if (e.target.value === 'Custom') {
                                                      setIsCustomWizardDeviceType(true);
                                                      setWizardDeviceType('Custom');
                                                      setWizardCustomDeviceType('Lainnya');
                                                    } else {
                                                      setIsCustomWizardDeviceType(false);
                                                      setWizardDeviceType(e.target.value);
                                                      setWizardCustomDeviceType('');
                                                    }
                                                  }}
                                                  className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-xs h-[38px] focus:outline-none focus:border-bieon-eco"
                                                >
                                                  {REMOTE_DEVICE_TYPES.map((type) => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                  ))}
                                                </select>
                                              )}
                                            </div>

                                            {/* Box 2: Merek */}
                                            <div>
                                              <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Merek</label>
                                              {isCustomWizardBrand ? (
                                                <div className="flex items-center gap-1.5 h-[38px]">
                                                  <input
                                                    type="text"
                                                    value={wizardCustomBrand}
                                                    onChange={(e) => setWizardCustomBrand(e.target.value)}
                                                    placeholder="Nama Merek Kustom"
                                                    className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-xs h-full focus:outline-none focus:border-bieon-eco transition-all"
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setIsCustomWizardBrand(false);
                                                      setWizardBrand('Polytron');
                                                      setWizardCustomBrand('');
                                                    }}
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 transition-all shrink-0 h-full flex items-center justify-center animate-fade-in"
                                                    title="Kembali ke Dropdown Merek"
                                                  >
                                                    <X className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              ) : (
                                                <select
                                                  value={wizardBrand}
                                                  onChange={(e) => {
                                                    if (e.target.value === 'Other') {
                                                      setIsCustomWizardBrand(true);
                                                      setWizardBrand('Other');
                                                      setWizardCustomBrand('Lainnya');
                                                    } else {
                                                      setIsCustomWizardBrand(false);
                                                      setWizardBrand(e.target.value);
                                                      setWizardCustomBrand('');
                                                    }
                                                  }}
                                                  className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-xs h-[38px] focus:outline-none focus:border-bieon-eco"
                                                >
                                                  {REMOTE_BRANDS.map((brand) => (
                                                    <option key={brand} value={brand}>{brand === "Other" ? "Lainnya" : brand}</option>
                                                  ))}
                                                </select>
                                              )}
                                            </div>

                                            {/* Box 3: Keterangan / Lokasi */}
                                            <div>
                                              <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Keterangan / Lokasi (Opsional)</label>
                                              <input
                                                type="text"
                                                value={wizardNotes}
                                                onChange={(e) => setWizardNotes(e.target.value)}
                                                placeholder="Contoh: Kamar Utama, Lantai 1"
                                                className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-xs h-[38px] focus:outline-none focus:border-bieon-eco"
                                              />
                                            </div>
                                          </div>

                                          {/* Active Recording Panel */}
                                          <div className="border border-gray-150 rounded-2xl p-3 bg-gray-50/50 space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200/60 pb-2">
                                              <div>
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Recording Mode</h5>
                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                  {remoteRegCountdown > 0 ? `Mode registrasi aktif (${remoteRegCountdown}s)...` : 'Klik tombol rekam lalu tekan remote fisik.'}
                                                </p>
                                              </div>
                                              <button
                                                type="button"
                                                disabled={remoteRegCountdown > 0}
                                                onClick={() => handleStartRemoteRegistration(device)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${remoteRegCountdown > 0
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-bieon-eco text-white hover:bg-bieon-eco/90 active:scale-95'
                                                  }`}
                                              >
                                                <Radio className={`w-3.5 h-3.5 ${remoteRegCountdown > 0 ? 'animate-ping text-red-500' : ''}`} />
                                                {remoteRegCountdown > 0 ? `Merekam (${remoteRegCountdown}s)` : 'Mulai Rekam'}
                                              </button>
                                            </div>

                                            {/* Captured list */}
                                            <div className="space-y-2">
                                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Captured Raw Bits</p>
                                              {remoteCatalogLoading && currentRemoteCatalog.length === 0 ? (
                                                <div className="p-3 rounded-xl border border-dashed border-gray-200 bg-white text-center text-xs text-gray-500">
                                                  Memuat katalog...
                                                </div>
                                              ) : currentRemoteCatalog.length === 0 ? (
                                                <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-white text-center text-xs text-gray-400 italic">
                                                  Belum ada raw bit. Tekan "Mulai Rekam" lalu tekan tombol remote fisik Anda.
                                                </div>
                                              ) : (
                                                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                                    {currentRemoteCatalog.map((bitItem) => {
                                                    const isMapped = String(bitItem.captureStatus) === 'mapped';
                                                    const hex = String(bitItem.rawBitHex || bitItem.rawSignature || '').trim();
                                                    const last4 = hex.length > 4 ? hex.slice(-4) : hex;
                                                    const bitLen = bitItem.bits || bitItem.bit_length || 32;
                                                    const rawDisplay = `Raw: ${last4.toUpperCase()} | Length: ${bitLen} bits`;

                                                    const finalDeviceType = isCustomWizardDeviceType ? wizardCustomDeviceType : wizardDeviceType;
                                                    const functionOptions = [
                                                      ...getRemoteFunctionOptions(finalDeviceType),
                                                      { value: 'custom_action', label: 'Lainnya' }
                                                    ];

                                                    const existingMappings = Array.isArray(device.remoteMappings)
                                                      ? device.remoteMappings
                                                      : Array.isArray(device.remoteState?.mappings)
                                                        ? device.remoteState.mappings
                                                        : [];

                                                    const existingMapping = existingMappings.find(m => 
                                                      (m.catalogId && String(m.catalogId) === String(bitItem._id)) || 
                                                      (m.rawSignature && m.rawSignature === bitItem.rawSignature)
                                                    );

                                                    let initialFunctionKey = functionOptions[0]?.value || 'power';
                                                    let initialCustomKey = '';
                                                    let initialLabel = getRemoteFunctionLabel(finalDeviceType, initialFunctionKey);

                                                    if (existingMapping) {
                                                      const isStandard = getRemoteFunctionOptions(finalDeviceType).some(opt => opt.value === existingMapping.functionKey);
                                                      if (isStandard) {
                                                        initialFunctionKey = existingMapping.functionKey;
                                                        initialLabel = existingMapping.label;
                                                      } else {
                                                        initialFunctionKey = 'custom_action';
                                                        initialCustomKey = existingMapping.functionKey;
                                                        initialLabel = existingMapping.label;
                                                      }
                                                    }

                                                    const currentDraft = wizardMappingDrafts[bitItem._id] || {
                                                      functionKey: initialFunctionKey,
                                                      customFunctionKey: initialCustomKey,
                                                      label: initialLabel
                                                    };

                                                    const isCustomFunction = currentDraft.functionKey === 'custom_action';

                                                    return (
                                                      <div key={bitItem._id || bitItem.rawSignature} className={`rounded-xl border p-2.5 transition-all bg-white text-xs ${isMapped ? 'border-blue-100 bg-blue-50/5' : 'border-gray-200'}`}>
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                                                          {/* Bagian Kiri: Info Teks */}
                                                          <div className="flex flex-col gap-1 min-w-0 shrink-0">
                                                            <div className="flex items-center gap-1.5">
                                                              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[9px] font-black uppercase text-gray-600">
                                                                {bitItem.protocol || 'raw'}
                                                              </span>
                                                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${isMapped ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                                                                {isMapped ? 'Mapped' : 'Captured'}
                                                              </span>
                                                            </div>
                                                            <p className="font-bold text-gray-800 font-mono text-[11px]">{rawDisplay}</p>
                                                          </div>

                                                          {/* Bagian Kanan: Kontrol Baris Tunggal Dinamis */}
                                                          <div className="flex flex-col sm:flex-row items-center gap-1.5 w-full md:w-auto">
                                                            <div className="w-full sm:w-[220px]">
                                                              {isCustomFunction ? (
                                                                <div className="flex items-center gap-1.5 h-[34px]">
                                                                  <input
                                                                    type="text"
                                                                    value={currentDraft.customFunctionKey}
                                                                    onChange={(e) => {
                                                                      const customKey = e.target.value;
                                                                      setWizardMappingDrafts(prev => ({
                                                                        ...prev,
                                                                        [bitItem._id]: {
                                                                          ...currentDraft,
                                                                          customFunctionKey: customKey,
                                                                          label: customKey
                                                                        }
                                                                      }));
                                                                    }}
                                                                    placeholder="Nama Fungsi Baru"
                                                                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-[11px] h-full focus:outline-none focus:border-bieon-eco transition-all"
                                                                  />
                                                                  <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                      const defaultFunc = functionOptions[0]?.value || 'power';
                                                                      const defaultLabel = getRemoteFunctionLabel(finalDeviceType, defaultFunc);
                                                                      setWizardMappingDrafts(prev => ({
                                                                        ...prev,
                                                                        [bitItem._id]: {
                                                                          ...currentDraft,
                                                                          functionKey: defaultFunc,
                                                                          customFunctionKey: '',
                                                                          label: defaultLabel
                                                                        }
                                                                      }));
                                                                    }}
                                                                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 transition-all shrink-0 h-full flex items-center justify-center animate-fade-in"
                                                                    title="Kembali ke Dropdown"
                                                                  >
                                                                    <X className="w-3.5 h-3.5" />
                                                                  </button>
                                                                </div>
                                                              ) : (
                                                                <select
                                                                  value={currentDraft.functionKey}
                                                                  onChange={(e) => {
                                                                    const key = e.target.value;
                                                                    const label = key === 'custom_action' ? 'Lainnya' : getRemoteFunctionLabel(finalDeviceType, key);
                                                                    setWizardMappingDrafts(prev => ({
                                                                      ...prev,
                                                                      [bitItem._id]: {
                                                                        ...currentDraft,
                                                                        functionKey: key,
                                                                        customFunctionKey: key === 'custom_action' ? 'Lainnya' : '',
                                                                        label: label
                                                                      }
                                                                    }));
                                                                  }}
                                                                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-[11px] h-[34px] focus:outline-none focus:border-bieon-eco"
                                                                >
                                                                  {functionOptions.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                  ))}
                                                                </select>
                                                              )}
                                                            </div>

                                                            <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                                                              <button
                                                                type="button"
                                                                onClick={() => {
                                                                  const finalType = isCustomWizardDeviceType ? wizardCustomDeviceType : wizardDeviceType;
                                                                  const finalBrand = isCustomWizardBrand ? wizardCustomBrand : wizardBrand;
                                                                  const finalFunc = currentDraft.functionKey === 'custom_action' ? currentDraft.customFunctionKey : currentDraft.functionKey;
                                                                  const finalLabel = currentDraft.label || getRemoteFunctionLabel(finalType, finalFunc);
                                                                  if (!finalFunc) {
                                                                    alert("Nama fungsi/tombol tidak boleh kosong.");
                                                                    return;
                                                                  }
                                                                  handleSaveRemoteMapping({
                                                                    deviceId: device.id,
                                                                    catalogId: bitItem._id,
                                                                    rawSignature: bitItem.rawSignature,
                                                                    rawBitText: bitItem.rawBitText,
                                                                    rawBitHex: bitItem.rawBitHex,
                                                                    rawBitBinary: bitItem.rawBitBinary,
                                                                    sourceRemoteIeee: bitItem.sourceRemoteIeee,
                                                                    sourceRemoteId: bitItem.sourceRemoteId,
                                                                    deviceType: finalType,
                                                                    brand: finalBrand,
                                                                    functionKey: finalFunc,
                                                                    label: finalLabel,
                                                                    deviceNotes: wizardNotes
                                                                  });
                                                                }}
                                                                className="h-[34px] w-[34px] flex items-center justify-center rounded-xl bg-bieon-eco text-white hover:bg-bieon-eco/90 transition-all active:scale-95 shadow-sm"
                                                                title="Simpan Tombol"
                                                              >
                                                                <Check className="w-4 h-4" />
                                                              </button>
                                                              <button
                                                                type="button"
                                                                onClick={() => executeDeleteRemoteBit(bitItem)}
                                                                className="h-[34px] w-[34px] flex items-center justify-center rounded-xl border bg-red-50 text-red-600 border-red-100 hover:bg-red-100 transition-all active:scale-95"
                                                                title="Hapus Raw Bit"
                                                              >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                              </button>
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Footer Action Buttons */}
                                        <div className="flex items-center justify-between border-t border-gray-150 pt-3">
                                          <div>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setIsAddingSubDevice(false);
                                                setWizardMappingDrafts({});
                                                setEditingRemoteProfile(null);
                                              }}
                                              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                                            >
                                              Batal
                                            </button>
                                          </div>

                                          <div>
                                            <button
                                              type="button"
                                              onClick={() => handleSaveAllRemoteMappings(device)}
                                              className="px-5 py-2 rounded-xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-md"
                                            >
                                              SIMPAN SEMUA
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Render Configured list or Empty state */
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-gray-150 pb-3">
                                          <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Daftar Sub-Perangkat</p>
                                            <h4 className="text-sm font-bold text-gray-900 mt-1 font-sans">Perangkat yang Dikontrol</h4>
                                          </div>
                                          {!isTechnicianMode && deviceRemoteProfiles.length > 0 && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setIsAddingSubDevice(true);
                                                setWizardDeviceType('TV');
                                                setIsCustomWizardDeviceType(false);
                                                setWizardCustomDeviceType('');
                                                setWizardBrand('Polytron');
                                                setIsCustomWizardBrand(false);
                                                setWizardCustomBrand('');
                                                setWizardNotes('');
                                                setWizardTargetDeviceId(device.id);
                                              }}
                                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bieon-eco text-white text-xs font-black uppercase tracking-widest hover:bg-bieon-eco/90 transition-all active:scale-95 shadow-sm font-sans"
                                            >
                                              <Plus className="w-3.5 h-3.5" />
                                              Tambah Perangkat
                                            </button>
                                          )}
                                        </div>

                                        {deviceRemoteProfiles.length === 0 ? (
                                          <div className="p-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 text-center flex flex-col items-center justify-center">
                                            <Radio className="w-8 h-8 text-gray-400 mb-2 animate-pulse" />
                                            <p className="text-xs text-gray-500 font-medium">Belum ada sub-perangkat yang dikonfigurasi.</p>

                                            {!isTechnicianMode && (
                                              <>
                                                <p className="text-[10px] text-gray-400 mt-1 mb-4">Klik "+ Tambah Perangkat" untuk mulai mendaftarkan tombol remote.</p>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setIsAddingSubDevice(true);
                                                    setWizardDeviceType('TV');
                                                    setIsCustomWizardDeviceType(false);
                                                    setWizardCustomDeviceType('');
                                                    setWizardBrand('Polytron');
                                                    setIsCustomWizardBrand(false);
                                                    setWizardCustomBrand('');
                                                    setWizardNotes('');
                                                    setWizardTargetDeviceId(device.id);
                                                  }}
                                                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-bieon-eco text-white text-xs font-black uppercase tracking-widest hover:bg-bieon-eco/90 transition-all active:scale-95 shadow-md font-sans"
                                                >
                                                  <Plus className="w-4 h-4" />
                                                  Tambah Perangkat
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="space-y-4">
                                            {deviceRemoteProfiles.map((profile) => {
                                              const profileNotes = profile.mappings[0]?.deviceNotes || '';
                                              return (
                                                <div key={profile.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-50">
                                                    <div>
                                                      <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs font-extrabold uppercase tracking-wider">
                                                          {profile.deviceType === "Custom" ? "Lainnya" : profile.deviceType}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                          {profile.brand === "Other" ? "Lainnya" : profile.brand}
                                                        </span>
                                                      </div>
                                                      {profileNotes && (
                                                        <p className="text-xs text-gray-500 mt-1.5 font-medium flex items-center gap-1">
                                                          <span className="w-1.5 h-1.5 rounded-full bg-bieon-eco"></span>
                                                          {profileNotes}
                                                        </p>
                                                      )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      {!isTechnicianMode && (
                                                        <>
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              setIsAddingSubDevice(true);
                                                               setWizardDeviceType(profile.deviceType);
                                                               setIsCustomWizardDeviceType(!REMOTE_DEVICE_TYPES.some(t => t.value === profile.deviceType));
                                                               setWizardCustomDeviceType(!REMOTE_DEVICE_TYPES.some(t => t.value === profile.deviceType) ? profile.deviceType : '');
                                                               setWizardBrand(profile.brand);
                                                               setIsCustomWizardBrand(!REMOTE_BRANDS.includes(profile.brand));
                                                               setWizardCustomBrand(!REMOTE_BRANDS.includes(profile.brand) ? profile.brand : '');
                                                               setWizardNotes(profileNotes);
                                                               setWizardTargetDeviceId(device.id);
                                                               setEditingRemoteProfile({ deviceType: profile.deviceType, brand: profile.brand });
                                                            }}
                                                            className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-1"
                                                          >
                                                            <Pencil className="w-3 h-3" />
                                                            Edit / Tambah Tombol
                                                          </button>
                                                          <button
                                                            type="button"
                                                            onClick={() => handleDeleteSubDevice(device, profile)}
                                                            className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all active:scale-95"
                                                            title="Hapus Sub-Perangkat"
                                                          >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                          </button>
                                                        </>
                                                      )}
                                                    </div>
                                                  </div>

                                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                                                    {profile.mappings.map((mapping) => (
                                                      <div
                                                        key={mapping.catalogId || mapping.rawSignature}
                                                        className="relative w-full"
                                                      >
                                                        <button
                                                          type="button"
                                                          onClick={() => handleSendRemoteCommand(device, mapping)}
                                                          title={`Kirim ${mapping.functionLabel}`}
                                                          className="w-full text-left focus:outline-none group"
                                                        >
                                                          <div className="rounded-2xl border border-bieon-eco/20 bg-bieon-eco/5 px-3.5 py-3 hover:bg-bieon-eco hover:text-white transition-all cursor-pointer pr-10 shadow-sm">
                                                            <p className="text-xs font-black uppercase tracking-widest text-bieon-eco group-hover:text-white transition-all truncate">{mapping.functionLabel}</p>
                                                            <p className="text-[10px] text-gray-500 mt-1 truncate group-hover:text-white/80 transition-all">{mapping.label || mapping.rawBitText || mapping.rawSignature}</p>
                                                            {mapping.controlMethod && mapping.controlMethod !== 'Manual' && (
                                                              <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-wider text-bieon-eco group-hover:text-white bg-bieon-eco/10 group-hover:bg-white/20 px-1.5 py-0.5 rounded">
                                                                {mapping.controlMethod === 'Jadwal' ? (
                                                                  <>
                                                                    <Calendar className="w-2.5 h-2.5" /> Jadwal
                                                                  </>
                                                                ) : (
                                                                  <>
                                                                    <Activity className="w-2.5 h-2.5" /> Sensor
                                                                  </>
                                                                )}
                                                              </span>
                                                            )}
                                                          </div>
                                                        </button>
                                                        {/* Actions Panel */}
                                                        <div className="absolute top-2 right-2 flex items-center gap-1 z-10 animate-fade-in">
                                                          {/* Settings Gear Button */}
                                                          <button
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              openMappingConfig(device, mapping);
                                                            }}
                                                            title="Atur Otomatisasi Tombol"
                                                            className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-400 hover:text-bieon-eco border border-gray-100 hover:border-bieon-eco/20 transition-all shadow-sm active:scale-90 flex items-center justify-center"
                                                          >
                                                            <Settings className="w-3.5 h-3.5" />
                                                          </button>
                                                          {/* Delete Button */}
                                                          {!isTechnicianMode && (
                                                            <button
                                                              type="button"
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteSingleMapping(device, mapping);
                                                              }}
                                                              title="Hapus Tombol"
                                                              className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-red-400 hover:text-red-650 border border-gray-100 hover:border-red-200 transition-all shadow-sm active:scale-90 flex items-center justify-center"
                                                            >
                                                              <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                          )}
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Disabled Remote Registration for non-remote actuators */}
                                {false && !isTechnicianMode && isActuatorDevice && !isDeviceRemote && (
                                  <div className="mb-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                                      <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Remote Registration</p>
                                        <h4 className="text-sm font-bold text-gray-900 mt-1">Raw bit catalog untuk {device.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {remoteRegCountdown > 0 ? `Mode registrasi aktif (${remoteRegCountdown} detik). Tekan tombol remote untuk menangkap raw bit.` : currentRemoteRegistration?.active ? 'Mode registrasi aktif. Tekan tombol remote untuk menangkap raw bit.' : 'Tekan Register untuk memulai tangkap raw bit.'}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${currentRemoteRegistration?.active || remoteRegCountdown > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                          {remoteRegCountdown > 0 ? `Registering (${remoteRegCountdown}s)` : currentRemoteRegistration?.active ? 'Registering' : 'Idle'}
                                        </span>
                                        <button
                                          type="button"
                                          disabled={remoteRegCountdown > 0 || currentRemoteRegistration?.active}
                                          onClick={() => handleStartRemoteRegistration(device)}
                                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-all ${(remoteRegCountdown > 0 || currentRemoteRegistration?.active)
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-bieon-eco text-white hover:bg-bieon-eco/90 active:scale-95'
                                            }`}
                                        >
                                          {remoteRegCountdown > 0 ? `Registering (${remoteRegCountdown}s)` : currentRemoteRegistration?.active ? 'Registering' : 'Register'}
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
                                                      {bitItem.deviceType && bitItem.controlGroup && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 border border-green-200 shadow-sm flex items-center gap-1 animate-pulse">
                                                          Terdeteksi: {bitItem.controlGroup} {bitItem.deviceType} ({bitItem.controlLabel || bitItem.controlAction})
                                                        </span>
                                                      )}
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900 break-all">{extractBitsFromCatalog(bitItem)}</p>
                                                    {bitItem.notes && (
                                                      <p className="text-xs text-bieon-eco font-bold mt-1.5 flex items-center gap-1.5 bg-bieon-eco/5 px-2.5 py-1 rounded-lg w-fit border border-bieon-eco/10">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-bieon-eco animate-ping"></span>
                                                        {bitItem.notes}
                                                      </p>
                                                    )}
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
                                                      title={t('placeholder.title_add_mapping')}
                                                    >
                                                      <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => executeDeleteRemoteBit(bitItem)}
                                                      className="w-10 h-10 flex items-center justify-center rounded-xl border bg-red-50 text-red-600 border-red-100 hover:bg-red-100 transition-all"
                                                      title={t('placeholder.title_delete_raw_bit')}
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
                                                <option key={brand} value={brand}>{brand === "Other" ? "Lainnya" : brand}</option>
                                              ))}
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Label Kontrol</label>
                                            <input
                                              type="text"
                                              value={remoteMappingDraft.label}
                                              onChange={(e) => setRemoteMappingDraft(prev => ({ ...prev, label: e.target.value }))}
                                              placeholder={t('placeholder.example_tv')}
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
                                                placeholder={t('placeholder.example_brand')}
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

                                    {hasRemoteProfile && !isDeviceRemote && (
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
                                                <Power className="w-4 h-4" /> {String(device.status) === "1" ? "OFF" : "ON"}
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Quick Controls Section - Hidden for Technicians (TIDAK BISA EDIT) */}
                                {!isTechnicianMode && !hasRemoteProfile && !isDeviceRemote && (
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
                                          {(device.category?.toLowerCase() !== "sensor" || isDeviceRemote) && (
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
                                                  <Power className="w-4 h-4" /> {String(device.status) === "1" ? "OFF" : "ON"}
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
                                          {device.category?.toLowerCase() === "sensor" && !isDeviceRemote && !isTechnicianMode && (
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
                                                  <Eye className="w-4 h-4" /> {String(device.status) === "1" ? "Stop Monitoring (Status: Aktif)" : `Start Monitoring (Status: ${device.status === "0" ? "Nonaktif" : device.status || "Nonaktif"})`}
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
                                {device.category?.toLowerCase() === "sensor" && !isDeviceRemote && device.status === "1" && device.currentValues && (
                                  <div className="mb-6 flex flex-wrap items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    {/* Compact Eligibility Badge */}
                                    {(() => {
                                      let isAbnormal = false;
                                      
                                      const type = device.deviceType || "";
                                      const typeLower = type.toLowerCase();
                                      const nameLower = String(device.name || "").toLowerCase();
                                      const aspectLower = String(device.environmentAspect || "").toLowerCase();
                                      
                                      const isWater = typeLower.includes("kualitas air") || aspectLower === "kualitas air" || nameLower.includes("bluecheck");
                                      const isComfort = aspectLower === "kenyamanan" || nameLower.includes("comfort") || (!isWater && (device.currentValues.temperature !== undefined || device.currentValues.humidity !== undefined));
                                      const isSecurity = typeLower.includes("keamanan") || typeLower.includes("security") || typeLower.includes("door") || typeLower.includes("motion") || aspectLower === "keamanan";
                                      
                                      if (isWater) {
                                        const phVal = device.currentValues.ph !== undefined ? parseFloat(device.currentValues.ph) : NaN;
                                        const turbVal = device.currentValues.turbidity !== undefined ? parseFloat(device.currentValues.turbidity) : NaN;
                                        const tdsVal = device.currentValues.tds !== undefined ? parseFloat(device.currentValues.tds) : NaN;
                                        
                                        const phEnabled = device.sensorParams?.ph !== undefined;
                                        const turbEnabled = device.sensorParams?.turbidity !== undefined;
                                        const tdsEnabled = device.sensorParams?.tds !== undefined;
                                        
                                        if (phEnabled && !isNaN(phVal) && (phVal < 6.5 || phVal > 8.5)) isAbnormal = true;
                                        if (turbEnabled && !isNaN(turbVal) && turbVal > 25) isAbnormal = true;
                                        if (tdsEnabled && !isNaN(tdsVal) && tdsVal > 1000) isAbnormal = true;
                                      } else if (isComfort) {
                                        const tempVal = device.currentValues.temperature !== undefined ? parseFloat(device.currentValues.temperature) : NaN;
                                        const humVal = device.currentValues.humidity !== undefined ? parseFloat(device.currentValues.humidity) : NaN;
                                        
                                        const tempEnabled = device.sensorParams?.temperature !== undefined;
                                        const humEnabled = device.sensorParams?.humidity !== undefined;
                                        
                                        if (tempEnabled && !isNaN(tempVal) && (tempVal < 20.5 || tempVal > 27.1)) isAbnormal = true;
                                        if (humEnabled && !isNaN(humVal) && (humVal < 50 || humVal > 80)) isAbnormal = true;
                                      } else if (isSecurity) {
                                        const statusVal = String(device.currentValues.status || "").toLowerCase();
                                        const motionEnabled = device.sensorParams?.isMotionEnabled !== undefined;
                                        const doorEnabled = device.sensorParams?.isDoorEnabled !== undefined;
                                        
                                        if (motionEnabled && statusVal !== 'no motion' && statusVal !== 'normal' && statusVal !== 'closed') isAbnormal = true;
                                        if (doorEnabled && statusVal !== 'closed' && statusVal !== 'normal' && statusVal !== 'no motion') isAbnormal = true;
                                      } else {
                                        Object.entries(device.sensorParams || {}).forEach(([key, val]) => {
                                          if (key === "_id") return;
                                          const currentVal = parseFloat(device.currentValues[key]);
                                          const threshold = parseFloat(val);
                                          if (!isNaN(currentVal) && !isNaN(threshold)) {
                                            if (currentVal > threshold) isAbnormal = true;
                                          }
                                        });
                                      }

                                      const StatusIcon = isAbnormal ? AlertCircle : Check;

                                      // Contextual Status Text
                                      // Reuse variables from above

                                      let statusTextNormal = t('kendali.device_details.comfortable', 'NYAMAN');
                                      let statusTextAbnormal = t('kendali.device_details.uncomfortable', 'TIDAK NYAMAN');

                                      if (typeLower.includes("kualitas air") || aspectLower === "kualitas air" || nameLower.includes("bluecheck")) {
                                        statusTextNormal = t('kendali.device_details.water_usable', 'LAYAK PAKAI');
                                        statusTextAbnormal = t('kendali.device_details.water_unusable', 'TIDAK LAYAK PAKAI');
                                      } else if (typeLower.includes("keamanan") || typeLower.includes("security") || typeLower.includes("door") || typeLower.includes("motion") || aspectLower === "keamanan") {
                                        statusTextNormal = t('kendali.device_details.safe', 'AMAN');
                                        statusTextAbnormal = t('kendali.device_details.unsafe', 'TIDAK AMAN');
                                      }

                                      return (
                                        <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 shadow-sm transition-all ${isAbnormal ? 'bg-red-600 border-red-700 text-white animate-pulse' : 'bg-bieon-eco border-bieon-eco/80 text-white'}`}>
                                          <StatusIcon className="w-5 h-5" />
                                          <span className="text-sm  tracking-tight whitespace-nowrap">
                                            {t('kendali.device_details.status_label', 'STATUS: ')}{isAbnormal ? statusTextAbnormal : statusTextNormal}
                                          </span>
                                        </div>
                                      );
                                    })()}

                                    {/* Minimal Separator */}
                                    <div className="w-px h-8 bg-gray-200 hidden sm:block mx-1"></div>

                                    {/* Parameter Chips */}
                                    {device.currentValues.temperature !== undefined && device.sensorParams?.temperature !== undefined && (
                                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${(parseFloat(device.currentValues.temperature) < 20.5 || parseFloat(device.currentValues.temperature) > 27.1) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <Thermometer className="w-4 h-4" />
                                        <span className="text-sm">{t('kendali.device_details.param_temp', 'Suhu')}: {device.currentValues.temperature}°C</span>
                                      </div>
                                    )}
                                    {device.currentValues.humidity !== undefined && device.sensorParams?.humidity !== undefined && (
                                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${(parseFloat(device.currentValues.humidity) < 50 || parseFloat(device.currentValues.humidity) > 80) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <Droplets className="w-4 h-4" />
                                        <span className="text-sm">{t('kendali.device_details.param_humidity', 'Lembap')}: {device.currentValues.humidity}%</span>
                                      </div>
                                    )}
                                    {device.currentValues.ph !== undefined && device.sensorParams?.ph !== undefined && (
                                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${(parseFloat(device.currentValues.ph) < 6.5 || parseFloat(device.currentValues.ph) > 8.5) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <Beaker className="w-4 h-4" />
                                        <span className="text-sm">{t('kendali.device_details.param_ph', 'pH')}: {device.currentValues.ph}</span>
                                      </div>
                                    )}
                                    {device.currentValues.turbidity !== undefined && device.sensorParams?.turbidity !== undefined && (
                                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.currentValues.turbidity) > 25 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <Droplets className="w-4 h-4 text-yellow-600" />
                                        <span className="text-sm">{t('kendali.device_details.param_turbidity', 'Kekeruhan')}: {device.currentValues.turbidity}</span>
                                      </div>
                                    )}
                                    {device.currentValues.tds !== undefined && device.sensorParams?.tds !== undefined && (
                                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.currentValues.tds) > 1000 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <Wind className="w-4 h-4 text-bieon-sense" />
                                        <span className="text-sm">{t('kendali.device_details.param_tds', 'TDS')}: {device.currentValues.tds} ppm</span>
                                      </div>
                                    )}
                                    {device.currentValues.waterTemp !== undefined && (device.sensorParams?.waterTemp !== undefined || device.sensorParams?.temperature !== undefined) && (
                                      <div className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2  transition-all ${parseFloat(device.currentValues.waterTemp) > parseFloat(device.sensorParams.waterTemp || device.sensorParams.temperature) ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>
                                        <Thermometer className="w-4 h-4" />
                                        <span className="text-sm">{t('kendali.device_details.param_water_temp', 'Suhu Air')}: {device.currentValues.waterTemp}°C</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
                                  <div>
                                    <p className="text-xs  text-gray-500 mb-1">{t('kendali.device_details.category', 'Kategori')}</p>
                                    <p className="text-sm text-gray-900  capitalize">{isDeviceRemote ? t('kendali.device_details.control_actuator_system', 'Control Actuator System') : (device.category === 'sensor' ? t('kendali.sensor_title', 'Sensor') : t('kendali.control_title', 'Control'))}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs  text-gray-500 mb-1">{t('kendali.device_details.hub_node', 'Hub Node')}</p>
                                    <p className="text-sm text-gray-900 ">{currentBieon.hubs.find((h) => h.id === device.hubId)?.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs  text-gray-500 mb-1">{t('kendali.device_details.installed', 'Installed')}</p>
                                    <p className="text-sm text-gray-900 ">{new Date(device.installedDate).toLocaleDateString((i18n.language && i18n.language.startsWith('en')) ? 'en-US' : 'id-ID')}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs  text-gray-500 mb-1">{t('kendali.device_details.last_activity', 'Last Activity')}</p>
                                    <p className="text-sm text-gray-900 ">{new Date(device.lastActivity).toLocaleString((i18n.language && i18n.language.startsWith('en')) ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                  </div>
                                  <div className="col-span-2 mt-2 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">{t('kendali.device_details.additional_notes', 'Keterangan Tambahan')}</p>
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
                                      {t('kendali.device_details.delete_btn', 'Hapus')}
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
                                      <p className="text-xs  text-gray-700">{t('kendali.device_details.tech_mode_warning', 'Mode Akses Terbatas: Anda hanya diperbolehkan melihat status perangkat.')}</p>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('kendali.device_management', 'Manajemen Perangkat')}</h2>
                  <p className="text-sm text-gray-600 mb-8">{t('kendali.hub_action_prompt', 'Apa yang ingin Anda lakukan untuk Hub {{hubName}}?', { hubName: selectedHub?.name })}</p>

                  <div className="grid gap-4">
                    <button
                      onClick={() => setStep("open-join")}
                      className="group p-6 bg-white border-2 border-gray-100 rounded-3xl hover:border-bieon-eco hover:shadow-xl transition-all text-left"
                    >
                      <h4 className="font-normal text-gray-900 group-hover:text-bieon-eco">{t('kendali.access_open_join', 'Akses "Open Join"')}</h4>
                      <p className="text-xs text-gray-500">{t('kendali.access_open_join_desc', 'Kirim Instruksi open join ke hub melalui backend, mqtt dan esp B')}</p>
                    </button>

                    <button
                      onClick={async () => {
                        await fetchRegisteredProducts();
                        setStep("select-category");
                      }}
                      className="group p-6 bg-white border-2 border-gray-100 rounded-3xl hover:border-blue-500 hover:shadow-xl transition-all text-left"
                    >
                      <h4 className="font-normal text-gray-900 group-hover:text-blue-500">{t('kendali.registered_devices', 'Perangkat Terdaftar')}</h4>
                      <p className="text-xs text-gray-500">{t('kendali.registered_devices_desc', 'Lanjutkan proses pengaturan & konfigurasi perangkat Anda.')}</p>
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
                    <h2 className="text-2xl font-black text-gray-900">{t('kendali.open_join.title', 'Buka Open Join')}</h2>
                    <button onClick={() => { setStep("add-device-choice"); setScanAttempted(false); }} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    {t('kendali.open_join.desc', 'Pilih hub yang ingin dibuka jendela join-nya. Instruksi akan diteruskan dari web ke backend, lalu ke ESP B dan ESP A.')}
                  </p>

                  <div className="space-y-6">
                    {/* HUB TARGET CARD */}
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('kendali.open_join.target_hub', 'Hub Target')}</p>
                      <div className="bg-gray-50 border border-gray-100 p-5 rounded-3xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Cpu className="w-6 h-6 text-bieon-eco" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {selectedHub?.name && /^[0-9a-fA-F]{16}$/.test(selectedHub.name) ? 'BIEON Hub Node' : (selectedHub?.name || "Hub Node")}
                          </h4>
                          <p className="text-xs text-gray-500 font-mono">
                            IEEE: {selectedHub?.name && /^[0-9a-fA-F]{16}$/.test(selectedHub.name) ? selectedHub.name : (selectedHub?.device_ieee || selectedHub?.id || "Unknown ID")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* INFO BOX GREEN */}
                    <div className="bg-bieon-eco/5 border border-bieon-eco/20 p-5 rounded-3xl">
                      <p className="text-xs text-gray-700 leading-relaxed font-medium">
                        {t('kendali.open_join.info', 'Open join akan aktif selama 30 detik. Saat device berhasil join dan teridentifikasi, backend akan membuat device map otomatis.')}
                      </p>
                    </div>

                    {/* FOOTER BUTTONS */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => { setStep("add-device-choice"); setScanAttempted(false); setDiscoveredDevices([]); setJoinedDevicesPool([]); setLeavingDevices({}); }}
                        className="flex-1 py-4 px-6 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        {t('kendali.open_join.back', 'Kembali')}
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
                            {t('kendali.open_join.scanning_label', 'Scanning...')}
                          </>
                        ) : (
                          t('kendali.open_join.start_button', 'Buka Open Join 30 Detik')
                        )}
                      </button>
                    </div>

                    {/* CONNECTED DEVICES SECTION */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">{t('kendali.open_join.registered_devices', 'Perangkat Terdaftar Anda')}</p>

                      {(() => {
                        // Ambil perangkat dari scan live
                        const fromScan = (discoveredDevices || []).filter(dev => {
                          const devIeee = normalizeIeee(dev?.device_ieee || dev?.id || '');
                          
                          // 1. Cek apakah ini sebenarnya adalah Hub itu sendiri
                          const isHubItself = (currentBieon?.hubs || []).some(hub => 
                            normalizeIeee(hub?.device_ieee || '') === devIeee
                          );

                          // 2. Cek apakah perangkat sudah ada di DB
                          const isAlreadyInDb = (currentBieon?.hubs || []).some(hub =>
                            (hub?.devices || []).some(d => {
                              const dbIeee = normalizeIeee(d?.device_ieee || d?.id || '');
                              return d?.modelId === dev?.id ||
                                d?.productId === dev?.id ||
                                (devIeee && dbIeee && devIeee === dbIeee);
                            })
                          );
                          
                          return !isAlreadyInDb && !isHubItself;
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
                                <p className="text-sm text-gray-400 italic">{t('kendali.open_join.waiting_devices', 'Menunggu perangkat bergabung...')}</p>
                                <p className="text-[10px] text-gray-300 mt-2 text-center px-6">{t('kendali.open_join.click_start_desc', 'Klik tombol Buka Open Join untuk mulai mendeteksi perangkat baru.')}</p>
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
                                <p className="text-sm text-bieon-eco font-medium">{t('kendali.open_join.scanning_countdown', { timeLeft: scanTimer }, `${scanTimer} Sedang mencari perangkat...`)}</p>
                              </div>
                            )}

                            {!isScanning && scanAttempted && fromScan.length === 0 && joinedDevicesPool.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-10 bg-orange-50/50 rounded-3xl border border-dashed border-orange-200">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                  <WifiOff className="w-6 h-6 text-orange-500" />
                                </div>
                                <h4 className="text-sm font-bold text-orange-600">{t('kendali.open_join.devices_not_found', 'Perangkat Tidak Ditemukan')}</h4>
                                <p className="text-[10px] text-orange-500 mt-2 text-center px-6 leading-relaxed">
                                  {t('kendali.open_join.devices_not_found_desc', 'Tidak ada perangkat baru yang terdeteksi. Perangkat yang sudah ada di Perangkat Terdaftar atau Hub tidak akan dimunculkan lagi.')}
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
                                    className={`w-full flex items-center justify-between p-3 bg-white border ${isJoined ? 'border-bieon-eco shadow-md ring-1 ring-bieon-eco/20' : 'border-gray-100'
                                      } ${isSensor ? 'hover:bg-[#f0fdf4] hover:border-bieon-eco/20' : 'hover:bg-blue-50/50 hover:border-blue-200'
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
                                            <span className={`text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${(aspectLabel === 'kenyamanan' || aspectLabel === 'sensor') ? 'text-bieon-eco border-bieon-eco/20 bg-bieon-eco/5' :
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
                                            className={`px-3 py-2 ${isSensor ? 'bg-bieon-eco hover:bg-bieon-eco/90 shadow-bieon-eco/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                              } text-white text-[9px] font-bold rounded-xl transition-all uppercase tracking-wider whitespace-nowrap shadow-sm`}
                                          >
                                            {t('kendali.btn_configure', 'Atur Sekarang')}
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
                                            title={t('kendali.tooltip_delete_product', 'Hapus Produk')}
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
                                            title={isJoined ? t('kendali.open_join.tooltip_already_joined', 'Sudah masuk antrean') : leavingDevices[dev.id] !== undefined ? t('kendali.open_join.tooltip_leaving', 'Sedang leave, tidak bisa ditambah') : t('kendali.open_join.tooltip_add_queue', 'Tambahkan ke antrean')}
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
                                <h4 className="text-sm font-bold">{t('kendali.open_join.selected_devices', { count: joinedDevicesPool.length }, `${joinedDevicesPool.length} Perangkat Terpilih`)}</h4>
                                <p className="text-[10px] text-white/70">{t('kendali.open_join.selected_devices_desc', 'Kelola masing-masing atau simpan sekaligus')}</p>
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
                                            {pendingOpenJoinAction === "save" ? t('kendali.open_join.save_as', 'Simpan sebagai…') : t('kendali.open_join.configure_as', 'Atur sebagai…')}
                                          </option>
                                          <option value="sensor">{t('kendali.open_join.option_sensor', 'Sensor')}</option>
                                          <option value="control">{t('kendali.open_join.option_actuator', 'Control Aktuator')}</option>
                                        </select>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPendingOpenJoinDevice(null);
                                            setPendingOpenJoinAction(null);
                                          }}
                                          className="px-2 py-1.5 text-white/70 hover:text-white text-[10px] font-bold"
                                        >
                                          {t('kendali.open_join.btn_cancel', 'Batal')}
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => initOpenJoinDeviceConfiguration(dev, "save")}
                                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-all border border-white/20"
                                        >
                                          {t('kendali.open_join.btn_save', 'Simpan')}
                                        </button>
                                        <button
                                          onClick={() => initOpenJoinDeviceConfiguration(dev, "configure")}
                                          className="px-3 py-1.5 bg-white hover:bg-bieon-eco/5 text-bieon-eco text-[10px] font-bold rounded-lg transition-all shadow-sm"
                                        >
                                          {t('kendali.open_join.btn_configure_short', 'Atur')}
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
                              {t('kendali.open_join.auto_detect_note', 'Device baru akan otomatis muncul dan dipisahkan berdasarkan tipe (Sensor/Aktuator) saat bergabung.')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== MODAL: BUKA OPEN JOIN HUB ==================== */}
            {step === "open-join-hub" && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 sm:p-10 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black text-gray-900">{t('kendali.open_join_hub.title', 'Buka Open Join Hub')}</h2>
                    <button
                      onClick={() => {
                        setStep("view-bieon");
                        setHubScanAttempted(false);
                        setIsHubScanning(false);
                        setDiscoveredHubs([]);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-all"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    {t('kendali.open_join_hub.desc', 'Buka jaringan pencarian Hub Node baru BIEON. Backend akan secara otomatis mendeteksi Hub yang mengumumkan dirinya dan mendaftarkannya ke sistem secara real-time.')}
                  </p>

                  <div className="space-y-6">
                    {/* BIEON SYSTEM INFO */}
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('kendali.open_join.target_hub', 'Sistem Target')}</p>
                      <div className="bg-gray-50 border border-gray-100 p-5 rounded-3xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Cpu className="w-6 h-6 text-bieon-eco" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{currentBieon?.name || "BIEON System"}</h4>
                          <p className="text-xs text-gray-500">{currentBieon?.bieonId || "Unknown ID"}</p>
                        </div>
                      </div>
                    </div>

                    {/* GREEN INFO BOX */}
                    <div className="bg-bieon-eco/5 border border-bieon-eco/20 p-5 rounded-3xl">
                      <p className="text-xs text-gray-700 leading-relaxed font-medium">
                        {t('kendali.open_join_hub.info', 'Masa pencarian berlangsung selama 30 detik. Silakan aktifkan mode pairing pada perangkat Hub Anda.')}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setStep("view-bieon");
                          setHubScanAttempted(false);
                          setIsHubScanning(false);
                          setDiscoveredHubs([]);
                        }}
                        className="flex-1 py-4 px-6 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        {t('kendali.open_join.back', 'Kembali')}
                      </button>
                      <button
                        onClick={handleStartHubDiscovery}
                        disabled={isHubScanning || isOpenHubJoinRequestPending}
                        className={`flex-1 py-4 px-6 rounded-2xl text-sm font-bold text-white transition-all shadow-lg ${isHubScanning
                          ? 'bg-gray-400 shadow-none cursor-not-allowed'
                          : 'bg-bieon-eco hover:bg-bieon-eco-dark hover:shadow-bieon-eco/30'
                          }`}
                      >
                        {isHubScanning ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            {t('kendali.open_join_hub.scanning_label', 'Mencari...')}
                          </span>
                        ) : (
                          t('kendali.open_join_hub.start_button', 'Buka Open Join Hub')
                        )}
                      </button>
                    </div>

                    {/* SCANNING STATE & LIST OF DISCOVERED HUBS */}
                    <div className="mt-8">
                      {isHubScanning ? (
                        <div className="flex items-center justify-center gap-3 py-6 bg-bieon-eco/5 border border-dashed border-bieon-eco/30 rounded-3xl mb-6 animate-pulse">
                          <span className="w-2.5 h-2.5 bg-bieon-eco rounded-full animate-ping"></span>
                          <p className="text-sm text-bieon-eco font-medium">
                            {t('kendali.open_join_hub.scanning_countdown', { timeLeft: hubScanTimer }, `Mencari Hub Node... Sisa waktu: ${hubScanTimer} s`)}
                          </p>
                        </div>
                      ) : hubScanAttempted && discoveredHubs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-3xl mb-6">
                          <p className="text-sm text-gray-400 italic">{t('kendali.open_join_hub.hubs_not_found', 'Hub tidak ditemukan')}</p>
                          <p className="text-[10px] text-gray-300 mt-2 text-center px-6">
                            {t('kendali.open_join_hub.hubs_not_found_desc', 'Tidak ada hub baru yang terdeteksi. Hub Anda mungkin sudah terdaftar.')}
                          </p>
                        </div>
                      ) : discoveredHubs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-3xl mb-6">
                          <p className="text-sm text-gray-400 italic">{t('kendali.open_join_hub.waiting_hubs', 'Menunggu Hub bergabung...')}</p>
                          <p className="text-[10px] text-gray-300 mt-2 text-center px-6">
                            {t('kendali.open_join_hub.click_start_desc', 'Klik tombol di atas untuk membuka jaringan pencarian Hub.')}
                          </p>
                        </div>
                      ) : null}

                      {/* DISCOVERED HUBS LIST */}
                      {discoveredHubs.length > 0 && (
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Hub Baru Terdeteksi</p>
                          <div className="space-y-3">
                            {discoveredHubs.map((hub) => (
                              <div key={hub._id || hub.id} className="bg-gray-50 border border-green-200 p-5 rounded-3xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                                    <Cpu className="w-6 h-6 text-green-500" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900">{hub.name || "Hub Node Baru"}</h4>
                                    <p className="text-xs text-gray-500">IEEE: {formatIeeeDisplay(hub.device_ieee)}</p>
                                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-medium bg-green-100 text-green-800">
                                      Terdaftar & Online
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmHub(hub)}
                                  className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 cursor-pointer hover:bg-green-600 transition-all text-white border-0 outline-none animate-bounce"
                                  title={t('kendali.open_join_hub.save_button', 'Simpan Hub')}
                                >
                                  <Check className="w-5 h-5 text-white" />
                                </button>
                              </div>
                            ))}
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
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">{t('kendali.add_new_device', 'Tambahkan Perangkat Baru')}</h2>
                    <button onClick={() => setStep("add-device-choice")} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-8">{t('kendali.add_new_device_desc', 'Masukkan ID dan Nama Produk yang tertera pada stiker fisik perangkat.')}</p>
                  <form onSubmit={handleRegisterProduct} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('kendali.device_id_sticker', 'ID Device (Stiker)')}</label>
                      <input
                        required
                        list="device-ids"
                        type="text"
                        value={productRegForm.id}
                        onChange={(e) => setProductRegForm({ ...productRegForm, id: e.target.value })}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none font-bold"
                        placeholder={t('placeholder.sensor_id_input')}
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
                          <option value="remote">Remote Universal</option>
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
                        placeholder={t('placeholder.example_sensor_id')}
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
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{t('kendali.registered_devices_title', 'Perangkat Terdaftar')}</h2>
                      <p className="text-sm text-gray-500 mt-1">{t('kendali.registered_devices_desc', 'Lanjutkan proses pengaturan & konfigurasi perangkat Anda.')}</p>
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
                      placeholder={t('kendali.search_placeholder', 'Cari perangkat berdasarkan nama atau ID ...')}
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
                              <h3 className="text-xl font-bold text-gray-900">{t('kendali.sensor_title', 'Sensor')}</h3>
                              <p className="text-[9px] font-bold text-bieon-eco uppercase tracking-widest">{t('kendali.sensor_desc', 'Monitoring System')}</p>
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
                                      {t('kendali.btn_configure', 'Atur Sekarang')}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteDevice(dev.id);
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                      title={t('kendali.tooltip_delete_product', 'Hapus Produk')}
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
                                        {t('kendali.btn_configure', 'Atur Sekarang')}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteRegisteredProduct(product.productId);
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title={t('kendali.tooltip_delete_product', 'Hapus Produk')}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (quickSavedSensors.length === 0 && (
                                <div className="py-12 text-center">
                                  <p className="text-xs font-medium text-gray-400">{t('kendali.empty_sensor', 'Belum ada sensor terdaftar')}</p>
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
                              <h3 className="text-xl font-bold text-gray-900">{t('kendali.control_title', 'Control')}</h3>
                              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{t('kendali.control_desc', 'Actuator System')}</p>
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
                                      {t('kendali.btn_configure', 'Atur Sekarang')}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteDevice(dev.id);
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                      title={t('kendali.tooltip_delete_product', 'Hapus Produk')}
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
                                        {t('kendali.btn_configure', 'Atur Sekarang')}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteRegisteredProduct(product.productId);
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title={t('kendali.tooltip_delete_product', 'Hapus Produk')}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (quickSavedControls.length === 0 && (
                                <div className="py-12 text-center">
                                  <p className="text-xs font-medium text-gray-400">{t('kendali.empty_control', 'Belum ada control terdaftar')}</p>
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
                            onChange={(e) => {
                              const nextCategory = e.target.value;
                              setSelectedCategory(nextCategory);
                              if (nextCategory === "sensor") {
                                setSelectedDeviceType("Sensor Kenyamanan");
                                setActiveSensorAspect("kenyamanan");
                                setConfigMode("sensor");
                              } else {
                                setSelectedDeviceType("smart-switch");
                                setConfigMode("manual");
                              }
                            }}
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none font-bold text-gray-700"
                          >
                            <option value="sensor">Sensor</option>
                            <option value="control">Control Actuator System</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tipe / Spesifik</label>
                          <select
                            value={selectedDeviceType}
                            onChange={(e) => {
                              const nextType = e.target.value;
                              setSelectedDeviceType(nextType);
                              if (selectedCategory === "sensor") {
                                if (nextType === "Sensor Kenyamanan") {
                                  setActiveSensorAspect("kenyamanan");
                                } else if (nextType === "Sensor Kualitas Air") {
                                  setActiveSensorAspect("kualitasAir");
                                } else if (nextType === "Sensor Keamanan") {
                                  setActiveSensorAspect("keamanan");
                                }
                              }
                            }}
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none font-bold text-gray-700"
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
                                <option value="remote">Remote Universal</option>
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

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nama Perangkat <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={deviceForm.name}
                        onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                        disabled={Boolean(isEditingDevice || selectedProduct)}
                        className={`w-full p-4 border-2 border-gray-100 rounded-2xl outline-none font-bold ${(isEditingDevice || selectedProduct) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50 focus:border-bieon-eco text-gray-900'}`}
                        placeholder={t('placeholder.device_name_example')}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Keterangan</label>
                      <textarea
                        value={deviceForm.notes}
                        onChange={(e) => setDeviceForm({ ...deviceForm, notes: e.target.value })}
                        placeholder={t('placeholder.device_notes_alt')}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none min-h-[100px] resize-none"
                      />
                    </div>

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
                              <option value="">{t('kendali.select_room_placeholder', '-- Pilih Ruangan --')}</option>
                              {rooms.map((room) => <option key={room} value={room}>{room}</option>)}
                              <option value="__new__">{t('kendali.create_new_room', '+ Buat Ruangan Baru')}</option>
                            </select>
                            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newRoomInput}
                              onChange={(e) => setNewRoomInput(e.target.value)}
                              placeholder={t('placeholder.room_name')}
                              className="flex-1 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-bieon-eco outline-none "
                            />
                            <button onClick={handleAddRoom} className="p-4 bg-bieon-eco text-white rounded-2xl  shadow-lg"><Check className="w-6 h-6" /></button>
                            <button onClick={() => setShowNewRoomInput(false)} className="p-4 bg-gray-100 text-gray-400 rounded-2xl"><X className="w-6 h-6" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    {(() => {
                      const isValidLocation = Boolean(deviceForm.location && rooms.includes(deviceForm.location));
                      const isFormValid = deviceForm.name && isValidLocation;

                      if (isControlActuator) {
                        return (
                          <>
                            <button
                              onClick={() => handleDirectSave()}
                              disabled={!isFormValid}
                              className={`flex-1 py-4 border-2 rounded-2xl font-bold transition-all ${isFormValid ? 'bg-white border-bieon-eco text-bieon-eco hover:bg-bieon-eco/5 active:scale-[0.98]' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                              {t('kendali.save_only', 'Simpan')}
                            </button>
                            <button
                              onClick={handleSubmitDeviceForm}
                              disabled={!isFormValid}
                              className={`flex-[1.5] py-4 rounded-2xl font-bold transition-all ${isFormValid ? 'bg-bieon-eco text-white shadow-xl shadow-bieon-eco/20 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                              {t('kendali.continue_to_auto', 'Lanjut ke Metode Otomatis')}
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
                            {t('kendali.continue_to_params', 'Lanjut ke Parameter')}
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
                      <h2 className="text-2xl font-bold text-gray-900">{!isControlActuator ? t('kendali.configure_params_title', 'Konfigurasi Parameter') : t('kendali.select_method_title', 'Pilih Metode Pengaturan')}</h2>
                      <p className="text-sm text-gray-600">{!isControlActuator ? t('kendali.configure_params_desc', 'Tentukan batas/nilai referensi untuk sensor ini') : t('kendali.select_method_desc', 'Parameter aspek sensor atau jadwal harian')}</p>
                    </div>
                    <button
                      onClick={() => setStep("add-device-form")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                  {isControlActuator && (
                    <>
                      {false && !activeSensorAspect ? (
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
                                      <h3 className=" text-gray-900 text-sm sm:text-base mb-0.5">{t('kendali.aspects.environment', 'Parameter Aspek Sensor')}</h3>
                                      <p className="text-xs text-gray-500 hidden sm:block">{t('kendali.environment_setup_desc', 'Pengaturan berdasarkan parameter aspek-aspek sensor')}</p>
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
                                      <h3 className=" text-gray-900 text-sm sm:text-base mb-0.5">{t('kendali.aspects.schedule', 'Jadwal Harian')}</h3>
                                      <p className="text-xs text-gray-500 hidden sm:block">{t('kendali.schedule_setup_desc', 'Pengaturan berdasarkan waktu/jadwal harian')}</p>
                                    </div>
                                  </button>
                                </div>

                                {/* ASPECT SELECTOR (Only if sensor is selected) */}
                                {config.mode === 'sensor' && (
                                  <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="px-4 py-3 bg-bieon-eco/5 rounded-xl border border-bieon-eco/20 mb-2">
                                      <p className="text-xs text-gray-700 flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> {t('kendali.select_aspect_config', 'Pilih Aspek untuk Dikonfigurasi')}
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
                                        <h4 className="text-sm text-gray-900 mb-1 leading-tight">{t('kendali.aspects.comfort', 'Kenyamanan')}</h4>
                                        <p className="text-[10px] text-gray-500">{t('kendali.aspect_comfort_desc', 'Suhu & Lembap')}</p>
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
                                        <h4 className="text-sm text-gray-900 mb-1 leading-tight">{t('kendali.aspects.security', 'Keamanan')}</h4>
                                        <p className="text-[10px] text-gray-500">{t('kendali.aspect_security_desc', 'Motion & Door Sensor')}</p>
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
                                        <h4 className="text-sm text-gray-900 mb-1 leading-tight">{t('kendali.aspects.water_quality', 'Kualitas Air')}</h4>
                                        <p className="text-[10px] text-gray-500">{t('kendali.aspect_water_desc', 'pH, TDS, Keruh, Suhu')}</p>
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
                              <h3 className=" text-gray-900 text-sm sm:text-base mb-0.5">{t('kendali.aspects.environment', 'Parameter Aspek Sensor')}</h3>
                              <p className="text-xs text-gray-500 hidden sm:block">{t('kendali.environment_setup_desc', 'Pengaturan berdasarkan parameter aspek-aspek sensor')}</p>
                            </div>
                          </button>
                          <button
                            onClick={() => setConfigMode("schedule")}
                            className={`p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center justify-center sm:justify-start gap-4 ${configMode === "schedule" ? "border-bieon-eco bg-bieon-eco/5" : "border-gray-200 hover:border-bieon-eco/50"}`}
                          >
                            <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-bieon-eco hidden sm:block" />
                            <div className="text-center sm:text-left">
                              <h3 className=" text-gray-900 text-sm sm:text-base mb-0.5">{t('kendali.aspects.schedule', 'Jadwal Harian')}</h3>
                              <p className="text-xs text-gray-500 hidden sm:block">{t('kendali.schedule_setup_desc', 'Pengaturan berdasarkan waktu/jadwal harian')}</p>
                            </div>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {(() => {
                    const isRemote = false;
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
                                  <Activity className="w-4 h-4" /> {t('kendali.select_aspect_config', 'Pilih Aspek untuk Dikonfigurasi')}
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
                                  <h4 className="text-sm  text-gray-900 mb-1 leading-tight">{t('kendali.aspects.comfort', 'Kenyamanan')}</h4>
                                  <p className="text-[10px] text-gray-500">{t('kendali.aspect_comfort_desc', 'Suhu & Lembap')}</p>
                                </button>

                                {/* ASPEK KEAMANAN (Gabungan Motion & Pintu) */}
                                <button
                                  onClick={() => setActiveSensorAspect("keamanan")}
                                  className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group text-center"
                                >
                                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <ShieldAlert className="w-6 h-6 text-purple-600" />
                                  </div>
                                  <h4 className="text-sm  text-gray-900 mb-1 leading-tight">{t('kendali.aspects.security', 'Keamanan')}</h4>
                                  <p className="text-[10px] text-gray-500">{t('kendali.aspect_security_desc', 'Motion & Door Sensor')}</p>
                                </button>

                                {/* KUALITAS AIR */}
                                <button
                                  onClick={() => setActiveSensorAspect("kualitasAir")}
                                  className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-2xl hover:border-cyan-500 hover:bg-cyan-50 transition-all group text-center"
                                >
                                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Waves className="w-6 h-6 text-cyan-600" />
                                  </div>
                                  <h4 className="text-sm  text-gray-900 mb-1 leading-tight">{t('kendali.aspects.water_quality', 'Kualitas Air')}</h4>
                                  <p className="text-[10px] text-gray-500">{t('kendali.aspect_water_desc', 'pH, TDS, Keruh, Suhu')}</p>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {isControlActuator && (
                                <button
                                  onClick={() => setActiveSensorAspect(null)}
                                  className="flex items-center gap-2 text-bieon-eco  hover:text-bieon-eco/90 transition-colors group mb-2"
                                >
                                  <ChevronRight className="w-5 h-5 rotate-180" />
                                  {t('kendali.back_to_aspect', 'Kembali Pilih Aspek')}
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
                                            placeholder={t('placeholder.temperature_value')}
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
                                            placeholder={t('placeholder.humidity_value')}
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
                            {t('kendali.add_schedule', '+ Tambah Jadwal')}
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
                      {t('kendali.btn_back', 'Kembali')}
                    </button>
                    <button
                      id="actual-save-trigger"
                      onClick={handleSaveDevice}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-bieon-eco to-bieon-sense text-white rounded-xl  shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {t('kendali.save_config', 'Simpan Konfigurasi')}
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
              <h3 className="text-xl font-black text-white">{t('kendali.tech_access_token', 'Token Akses Teknisi')}</h3>
              <p className="text-white/80 text-xs mt-1">{t('kendali.tech_access_desc', 'Berikan kode ini kepada teknisi Anda')}</p>
            </div>
            <div className="p-8 text-center">
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-6 mb-6">
                <span className="text-[3rem]  tracking-[0.5rem] text-bieon-eco font-mono">
                  {generatedToken}
                </span>
              </div>
              <div className="flex items-start gap-3 text-left bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('kendali.tech_access_warning') }} />
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="w-full py-3.5 bg-gray-900 text-white  rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                {t('kendali.done', 'Selesai')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Otomatisasi Tombol Remote */}
      {editingMapping && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 pb-4 flex items-center justify-between shrink-0 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 font-sans">{t('kendali.select_method_title', 'Pilih Metode Pengaturan')}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium font-sans">
                  {t('kendali.select_method_desc', 'Parameter aspek sensor atau jadwal harian')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingMapping(null);
                  setEditingMappingDevice(null);
                }}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-gray-700">
              {/* Mode Selection */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'Manual', label: t('kendali.manual_control', 'Kontrol Manual'), icon: Power, desc: t('kendali.manual_control_desc', 'Kontrol tombol secara manual kapan saja') },
                    { value: 'Lingkungan', label: t('kendali.sensor_aspect_param', 'Parameter Aspek Sensor'), icon: Settings, desc: t('kendali.config_based_on_sensor', 'Pengaturan berdasarkan aspek sensor') },
                    { value: 'Jadwal', label: t('kendali.daily_schedule', 'Jadwal Harian'), icon: Calendar, desc: t('kendali.config_based_on_time', 'Pengaturan berdasarkan waktu & hari') }
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = editingMapping.controlMethod === mode.value;
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => {
                          setEditingMapping(prev => ({
                            ...prev,
                            controlMethod: mode.value,
                            scheduleSettings: mode.value === 'Jadwal' && (!prev.scheduleSettings || prev.scheduleSettings.length === 0) ? [{
                              enabled: true,
                              startTime: "08:00",
                              endTime: "17:00",
                              days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
                              action: "ON"
                            }] : prev.scheduleSettings
                          }));
                        }}
                        className={`group p-4 rounded-2xl border-2 flex items-center gap-3 transition-all duration-200 text-left ${isSelected
                            ? 'border-[#009b7c] bg-gradient-to-br from-[#009b7c]/5 to-[#009b7c]/12 text-gray-900 shadow-[0_8px_24px_-8px_rgba(0,155,124,0.25)] ring-1 ring-[#009b7c]/15 -translate-y-0.5'
                            : 'border-gray-200 bg-white text-gray-500 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300'
                          }`}
                      >
                        <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${isSelected ? 'bg-[#009b7c]/20 text-[#009b7c]' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold transition-colors duration-200 ${isSelected ? 'text-[#009b7c]' : 'text-gray-700 group-hover:text-[#009b7c]'}`}>{mode.label}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-normal truncate">{mode.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Jadwal Settings */}
              {editingMapping.controlMethod === 'Jadwal' && (
                <div className="space-y-4 animate-fade-in">
                  {(!editingMapping.scheduleSettings || editingMapping.scheduleSettings.length === 0) ? (
                    <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center text-xs text-gray-400 italic">
                      {t('kendali.no_schedule_desc', 'Belum ada jadwal. Silakan klik "Tambah Jadwal".')}
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                      {editingMapping.scheduleSettings.map((sched, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border border-gray-200 bg-white space-y-4 relative group">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                              <Calendar className="w-4 h-4 text-[#009b7c]" />
                              Jadwal #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                      setEditingMapping(prev => ({
                                        ...prev,
                                        scheduleSettings: prev.scheduleSettings.filter((_, i) => i !== idx)
                                      }));
                                    }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                              title={t('kendali.delete_schedule', 'Hapus Jadwal')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Jam Nyala</label>
                              <div className="relative">
                                <input
                                  type="time"
                                  value={sched.startTime || "08:00"}
                                  onChange={(e) => {
                                    const updated = [...editingMapping.scheduleSettings];
                                    updated[idx] = { ...updated[idx], startTime: e.target.value };
                                    setEditingMapping(prev => ({ ...prev, scheduleSettings: updated }));
                                  }}
                                  className="w-full pl-3 pr-10 py-1.5 rounded-xl border border-gray-200 bg-white text-xs h-[38px] focus:outline-none focus:border-[#009b7c]"
                                />
                                <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Jam Mati</label>
                              <div className="relative">
                                <input
                                  type="time"
                                  value={sched.endTime || "17:00"}
                                  onChange={(e) => {
                                    const updated = [...editingMapping.scheduleSettings];
                                    updated[idx] = { ...updated[idx], endTime: e.target.value };
                                    setEditingMapping(prev => ({ ...prev, scheduleSettings: updated }));
                                  }}
                                  className="w-full pl-3 pr-10 py-1.5 rounded-xl border border-gray-200 bg-white text-xs h-[38px] focus:outline-none focus:border-[#009b7c]"
                                />
                                <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Hari Pengulangan</label>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { key: "Senin", label: "Sen" },
                                { key: "Selasa", label: "Sel" },
                                { key: "Rabu", label: "Rab" },
                                { key: "Kamis", label: "Kam" },
                                { key: "Jumat", label: "Jum" },
                                { key: "Sabtu", label: "Sab" },
                                { key: "Minggu", label: "Min" }
                              ].map((day) => {
                                const isSelected = sched.days.includes(day.key);
                                return (
                                  <button
                                    key={day.key}
                                    type="button"
                                    onClick={() => {
                                      const nextDays = isSelected
                                        ? sched.days.filter(d => d !== day.key)
                                        : [...sched.days, day.key];
                                      const updated = [...editingMapping.scheduleSettings];
                                      updated[idx] = { ...updated[idx], days: nextDays };
                                      setEditingMapping(prev => ({ ...prev, scheduleSettings: updated }));
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${isSelected
                                        ? "bg-[#009b7c] text-white shadow-sm"
                                        : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
                                      }`}
                                  >
                                    {day.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingMapping(prev => ({
                        ...prev,
                        scheduleSettings: [
                          ...(prev.scheduleSettings || []),
                          {
                            enabled: true,
                            startTime: "08:00",
                            endTime: "17:00",
                            days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
                            action: "ON"
                          }
                        ]
                      }));
                    }}
                    className="w-full py-3 rounded-2xl border border-dashed border-gray-300 hover:border-gray-400 text-gray-500 hover:bg-gray-50/50 transition-all text-xs font-semibold flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                    <span>{t('kendali.add_schedule_button', 'Tambah Jadwal')}</span>
                  </button>
                </div>
              )}

              {/* Mode Sensor Settings */}
              {editingMapping.controlMethod === 'Lingkungan' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <div className="rounded-xl bg-green-50/50 border border-green-100 px-4 py-2.5 flex items-center gap-2 text-xs text-gray-600 font-medium font-sans mb-4">
                      <Activity className="w-4 h-4 text-[#009b7c]" />
                      <span>{t('kendali.select_aspect_config', 'Pilih Aspek untuk Dikonfigurasi')}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'Kenyamanan', label: 'Kenyamanan', sub: t('kendali.aspect_comfort_desc', 'Suhu & Lembap'), icon: Activity, bgClass: 'bg-green-50 text-green-600', selectedBg: 'border-[#009b7c] bg-[#009b7c]/5 ring-1 ring-[#009b7c]/20' },
                        { value: 'Keamanan', label: 'Keamanan', sub: t('kendali.aspect_security_desc', 'Motion & Door Sensor'), icon: ShieldAlert, bgClass: 'bg-purple-50 text-purple-600', selectedBg: 'border-purple-600 bg-purple-50/5 ring-1 ring-purple-600/20' },
                        { value: 'Kualitas Air', label: 'Kualitas Air', sub: t('kendali.aspect_water_desc', 'pH, TDS, Keruh, Suhu'), icon: Waves, bgClass: 'bg-cyan-50 text-cyan-600', selectedBg: 'border-cyan-600 bg-cyan-50/5 ring-1 ring-cyan-600/20' }
                      ].map((aspect) => {
                        const Icon = aspect.icon;
                        const isSelected = (editingMapping.environmentAspect || 'Kenyamanan') === aspect.value;
                        return (
                          <button
                            key={aspect.value}
                            type="button"
                            onClick={() => {
                              setEditingMapping(prev => ({
                                ...prev,
                                environmentAspect: aspect.value,
                                sensorParams: aspect.value === 'Kenyamanan' ? { temperature: 28, humidity: 70 } :
                                  aspect.value === 'Keamanan' ? { isMotionEnabled: true } :
                                    { ph: 7.0, tds: 500, turbidity: 100, waterTemp: 30 }
                              }));
                            }}
                            className={`p-3 py-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all text-center ${isSelected
                                ? aspect.selectedBg
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                              }`}
                          >
                            <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${aspect.bgClass}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 text-center">
                              <p className={`text-xs font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                {aspect.value === 'Kenyamanan' ? t('dashboard.comfort', 'Kenyamanan') :
                                 aspect.value === 'Keamanan' ? t('dashboard.security.title', 'Keamanan') :
                                 t('dashboard.water_health', 'Kualitas Air')}
                              </p>
                              <p className="text-[9px] text-gray-400 mt-0.5 leading-normal">{aspect.sub}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conditional Aspect Params Render */}
                  <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4">
                    {editingMapping.environmentAspect === 'Kenyamanan' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                            <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Suhu Ambang (°C)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={editingMapping.sensorParams?.temperature ?? 28}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setEditingMapping(prev => ({
                                ...prev,
                                sensorParams: { ...prev.sensorParams, temperature: isNaN(val) ? undefined : val }
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs h-[38px] focus:outline-none focus:border-[#009b7c]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                            <Droplets className="w-3.5 h-3.5 text-blue-500" /> Kelembapan (%)
                          </label>
                          <input
                            type="number"
                            value={editingMapping.sensorParams?.humidity ?? 70}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setEditingMapping(prev => ({
                                ...prev,
                                sensorParams: { ...prev.sensorParams, humidity: isNaN(val) ? undefined : val }
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs h-[38px] focus:outline-none focus:border-[#009b7c]"
                          />
                        </div>
                      </div>
                    )}

                    {editingMapping.environmentAspect === 'Keamanan' && (
                      <div className="space-y-3">
                        <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-gray-150 cursor-pointer transition-all hover:bg-gray-100/50">
                          <input
                            type="checkbox"
                            checked={Boolean(editingMapping.sensorParams?.isMotionEnabled)}
                            onChange={(e) => {
                              setEditingMapping(prev => ({
                                ...prev,
                                sensorParams: { ...prev.sensorParams, isMotionEnabled: e.target.checked }
                              }));
                            }}
                            className="w-4.5 h-4.5 text-[#009b7c] rounded-md focus:ring-[#009b7c]/30"
                          />
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                            <Eye className="w-4 h-4 text-purple-600" /> {t('kendali.enable_on_motion', 'Aktifkan pada Sensor Gerakan')}
                          </div>
                        </label>
                        <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-gray-150 cursor-pointer transition-all hover:bg-gray-100/50">
                          <input
                            type="checkbox"
                            checked={Boolean(editingMapping.sensorParams?.isDoorEnabled)}
                            onChange={(e) => {
                              setEditingMapping(prev => ({
                                ...prev,
                                sensorParams: { ...prev.sensorParams, isDoorEnabled: e.target.checked }
                              }));
                            }}
                            className="w-4.5 h-4.5 text-[#009b7c] rounded-md focus:ring-[#009b7c]/30"
                          />
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                            <Lock className="w-4 h-4 text-red-600" /> {t('kendali.enable_on_door_open', 'Aktifkan pada Sensor Pintu Terbuka')}
                          </div>
                        </label>
                      </div>
                    )}

                    {editingMapping.environmentAspect === 'Kualitas Air' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                            <Beaker className="w-3.5 h-3.5 text-cyan-500" /> pH Air
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={editingMapping.sensorParams?.ph ?? 7.0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setEditingMapping(prev => ({
                                ...prev,
                                sensorParams: { ...prev.sensorParams, ph: isNaN(val) ? undefined : val }
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs h-[38px] focus:outline-none focus:border-[#009b7c]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                            <Waves className="w-3.5 h-3.5 text-blue-500" /> TDS (mg/L)
                          </label>
                          <input
                            type="number"
                            value={editingMapping.sensorParams?.tds ?? 500}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setEditingMapping(prev => ({
                                ...prev,
                                sensorParams: { ...prev.sensorParams, tds: isNaN(val) ? undefined : val }
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs h-[38px] focus:outline-none focus:border-[#009b7c]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                            <Waves className="w-3.5 h-3.5 text-teal-500" /> Kekeruhan (NTU)
                          </label>
                          <input
                            type="number"
                            value={editingMapping.sensorParams?.turbidity ?? 100}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setEditingMapping(prev => ({
                                ...prev,
                                sensorParams: { ...prev.sensorParams, turbidity: isNaN(val) ? undefined : val }
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs h-[38px] focus:outline-none focus:border-[#009b7c]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                            <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Suhu Air (°C)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={editingMapping.sensorParams?.waterTemp ?? 30.0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setEditingMapping(prev => ({
                                ...prev,
                                sensorParams: { ...prev.sensorParams, waterTemp: isNaN(val) ? undefined : val }
                              }));
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs h-[38px] focus:outline-none focus:border-[#009b7c]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-150 bg-white flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEditingMapping(null);
                  setEditingMappingDevice(null);
                }}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-600 text-xs font-black uppercase tracking-widest hover:bg-gray-55 transition-all active:scale-95 text-center"
              >
                {t('common.back', 'Kembali')}
              </button>
              <button
                type="button"
                onClick={handleSaveMappingAutomation}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#009b7c] hover:bg-[#009b7c]/90 text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" /> {t('kendali.save_config', 'Simpan Konfigurasi')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: DEVICE SCANNER ==================== */}
    </HomeownerLayout>
  );
}
