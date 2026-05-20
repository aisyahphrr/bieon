/**
 * BIEON ECOSENSE - Homeowner Role Mock Data
 * Struktur data tiruan persis dengan format API Response dari Backend.
 */

// 1. Profil Homeowner Lengkap
export const mockProfile = {
  _id: "usr-mock-homeowner-001",
  userId: "usr-mock-homeowner-001",
  username: "asrisaras17",
  firstName: "Asri",
  lastName: "Saraswati",
  fullName: "Asri Saraswati",
  email: "asrisaras17@gmail.com",
  phoneNumber: "+6281234567890",
  phoneNo: "+6281234567890",
  address: "Kavling Hijau ECOSENSE No. 17, Jakarta Selatan, DKI Jakarta",
  dateOfBirth: "1997-04-17",
  dob: "1997-04-17",
  bieonId: "BIEON-SYS-17"
};

// 2. Data Hubs / Systems (untuk kendali.jsx & pop-up profile)
export const mockHubs = [
  {
    _id: "sys-001",
    bieonId: "BIEON-SYS-17",
    hubCount: 3,
    status: "Active",
    hubs: [
      { id: "hub-001", _id: "hub-001", name: "Smart Hub Ruang Tamu", status: "1", location: "Ruang Tamu" },
      { id: "hub-002", _id: "hub-002", name: "Smart Hub Dapur", status: "1", location: "Dapur" },
      { id: "hub-003", _id: "hub-003", name: "Smart Hub Garasi", status: "0", location: "Garasi" }
    ],
    createdAt: "2026-05-15T08:00:00Z"
  }
];

// 3. Ekosistem Device (Varian status & actuators)
export const mockDevices = [
  // HUB 1: Ruang Tamu (Online & Normal)
  {
    _id: "dev-001",
    hubId: "hub-001",
    name: "Smart Hub Ruang Tamu",
    location: "Ruang Tamu",
    category: "hub",
    type: "Gateway Hub",
    status: "1", // Online
    environmentAspect: "Sistem",
    batteryLevel: 98,
    createdAt: "2026-05-15T08:00:00Z",
    lastUpdated: "2026-05-19T08:00:00Z"
  },
  {
    _id: "dev-002",
    hubId: "hub-001",
    name: "Sensor Kenyamanan Ruang Tamu",
    location: "Ruang Tamu",
    category: "sensor",
    type: "Sensor Kenyamanan",
    status: "1",
    environmentAspect: "Kenyamanan",
    batteryLevel: 85,
    createdAt: "2026-05-15T08:00:00Z"
  },
  {
    _id: "dev-003",
    hubId: "hub-001",
    name: "Motion Sensor Ruang Tamu",
    location: "Ruang Tamu",
    category: "sensor",
    type: "Motion Sensor",
    status: "No Motion",
    environmentAspect: "Keamanan",
    batteryLevel: 92,
    createdAt: "2026-05-15T08:00:00Z"
  },
  {
    _id: "dev-003-act",
    hubId: "hub-001",
    name: "Lampu Teras",
    location: "Ruang Tamu",
    category: "actuator",
    type: "Lampu Teras",
    status: "ON",
    environmentAspect: "Kenyamanan",
    batteryLevel: 100,
    remoteState: { power: "ON" },
    createdAt: "2026-05-15T08:00:00Z"
  },

  // HUB 2: Dapur & Air (Warning State: Low Battery / Anomaly)
  {
    _id: "dev-004",
    hubId: "hub-002",
    name: "Smart Hub Dapur",
    location: "Dapur",
    category: "hub",
    type: "Gateway Hub",
    status: "1",
    environmentAspect: "Sistem",
    batteryLevel: 15, // WARNING: Baterai Lemah
    createdAt: "2026-05-15T08:00:00Z",
    lastUpdated: "2026-05-19T08:05:00Z"
  },
  {
    _id: "dev-005",
    hubId: "hub-002",
    name: "Sensor Kualitas Air",
    location: "Dapur",
    category: "sensor",
    type: "Sensor Kualitas Air",
    status: "1",
    environmentAspect: "Kualitas Air",
    batteryLevel: 76,
    createdAt: "2026-05-15T08:00:00Z"
  },
  {
    _id: "dev-006",
    hubId: "hub-002",
    name: "Door Sensor Dapur",
    location: "Dapur",
    category: "sensor",
    type: "Door Sensor",
    status: "Open", // WARNING: Pintu dibiarkan terbuka
    environmentAspect: "Keamanan",
    batteryLevel: 88,
    createdAt: "2026-05-15T08:00:00Z"
  },
  {
    _id: "dev-006-act",
    hubId: "hub-002",
    name: "Pompa Air",
    location: "Dapur",
    category: "actuator",
    type: "Pompa Air",
    status: "ON",
    environmentAspect: "Kualitas Air",
    batteryLevel: 100,
    remoteState: { power: "ON" },
    createdAt: "2026-05-15T08:00:00Z"
  },

  // HUB 3: Garasi (Offline State)
  {
    _id: "dev-007",
    hubId: "hub-003",
    name: "Smart Hub Garasi",
    location: "Garasi",
    category: "hub",
    type: "Gateway Hub",
    status: "0", // OFFLINE
    environmentAspect: "Sistem",
    batteryLevel: 0,
    createdAt: "2026-05-15T08:00:00Z",
    lastUpdated: "2026-05-18T22:00:00Z"
  },
  {
    _id: "dev-008",
    hubId: "hub-003",
    name: "Door Sensor Garasi",
    location: "Garasi",
    category: "sensor",
    type: "Door Sensor",
    status: "Offline",
    environmentAspect: "Keamanan",
    batteryLevel: 0,
    createdAt: "2026-05-15T08:00:00Z"
  },
  {
    _id: "dev-009-act",
    hubId: "hub-003",
    name: "Smart Lock Pintu Utama",
    location: "Garasi",
    category: "actuator",
    type: "Smart Lock Pintu Utama",
    status: "OFF",
    environmentAspect: "Keamanan",
    batteryLevel: 95,
    remoteState: { power: "OFF" },
    createdAt: "2026-05-15T08:00:00Z"
  },
  {
    _id: "dev-010-act",
    hubId: "hub-003",
    name: "Valve Gas",
    location: "Garasi",
    category: "actuator",
    type: "Valve Gas",
    status: "Offline",
    environmentAspect: "Keamanan",
    batteryLevel: 0,
    remoteState: { power: "OFF" },
    createdAt: "2026-05-15T08:00:00Z"
  }
];

// 4. Grafik Energi (kWh Harian & Bulanan)
export const mockEnergySummary = {
  tokenBalance: 450000, // Sisa Deposit Anggaran Rp 450.000
  tokenThreshold: 30000, // Batas Peringatan Rp 30.000
  dailyData: [
    { time: "00:00", kwh: 0.12, cost: 180 },
    { time: "02:00", kwh: 0.08, cost: 120 },
    { time: "04:00", kwh: 0.15, cost: 225 },
    { time: "06:00", kwh: 0.35, cost: 525 },
    { time: "08:00", kwh: 0.55, cost: 825 },
    { time: "10:00", kwh: 0.22, cost: 330 },
    { time: "12:00", kwh: 0.18, cost: 270 },
    { time: "14:00", kwh: 0.25, cost: 375 },
    { time: "16:00", kwh: 0.30, cost: 450 },
    { time: "18:00", kwh: 0.75, cost: 1125 },
    { time: "20:00", kwh: 0.85, cost: 1275 },
    { time: "22:00", kwh: 0.45, cost: 675 }
  ],
  monthlyData: [
    { month: "Jan", kwh: 120.5, cost: 180750 },
    { month: "Feb", kwh: 115.2, cost: 172800 },
    { month: "Mar", kwh: 130.8, cost: 196200 },
    { month: "Apr", kwh: 145.4, cost: 218100 },
    { month: "May", kwh: 155.0, cost: 232500 },
    { month: "Jun", kwh: 138.2, cost: 207300 },
    { month: "Jul", kwh: 122.1, cost: 183150 },
    { month: "Aug", kwh: 118.4, cost: 177600 },
    { month: "Sep", kwh: 125.6, cost: 188400 },
    { month: "Oct", kwh: 140.2, cost: 210300 },
    { month: "Nov", kwh: 148.8, cost: 223200 },
    { month: "Dec", kwh: 160.5, cost: 240750 }
  ]
};

// 5. Kumpulan Notifikasi Dinamis (Unread / Read)
export const mockNotifications = [
  {
    _id: "notif-001",
    title: "Tiket Pengaduan Baru",
    category: "Pengaduan",
    message: "Tiket pengaduan #TKT-8891 telah berhasil dibuat. Teknisi akan segera ditugaskan.",
    type: "Info",
    read: false,
    createdAt: "2026-05-19T08:30:00Z"
  },
  {
    _id: "notif-002",
    title: "Perangkat Terputus",
    category: "Sistem",
    message: "Smart Hub Garasi terdeteksi offline. Silakan periksa koneksi internet atau catu daya.",
    type: "Danger",
    read: false,
    createdAt: "2026-05-19T07:15:00Z"
  },
  {
    _id: "notif-003",
    title: "SLA Overdue Warning",
    category: "Pengaduan",
    message: "Perbaikan Sensor Kualitas Air dapur mendekati batas waktu SLA. Prioritas ditingkatkan.",
    type: "Warning",
    read: true,
    createdAt: "2026-05-19T06:00:00Z"
  },
  {
    _id: "notif-004",
    title: "Baterai Lemah",
    category: "Sistem",
    message: "Baterai Smart Hub Dapur tersisa 15%. Disarankan untuk segera melakukan penggantian baterai.",
    type: "Warning",
    read: false,
    createdAt: "2026-05-19T05:00:00Z"
  },
  {
    _id: "notif-005",
    title: "Anggaran Diperbarui",
    category: "Energi",
    message: "Anggaran listrik bulanan Anda berhasil diperbarui menjadi Rp 1.000.000.",
    type: "Success",
    read: true,
    createdAt: "2026-05-18T10:00:00Z"
  },
  {
    _id: "notif-006",
    title: "Konfirmasi Pekerjaan",
    category: "Pengaduan",
    message: "Konfirmasi pekerjaan teknisi untuk tiket #TKT-9912 diperlukan sebelum ditutup.",
    type: "Warning",
    read: false,
    createdAt: "2026-05-19T08:00:00Z"
  },
  {
    _id: "notif-007",
    title: "pH Air Tidak Layak",
    category: "Kualitas Air",
    message: "pH Air terdeteksi tidak layak (5.2). Sistem menyarankan pembersihan tandon air.",
    type: "Danger",
    read: false,
    createdAt: "2026-05-19T04:30:00Z"
  }
];

// 6. Log Aktivitas
export const mockActivities = [
  {
    deviceName: "Lampu Teras",
    action: "ON",
    trigger: "Web App",
    timestamp: "2026-05-19T08:45:00Z",
    status: "ON"
  },
  {
    deviceName: "Smart Lock Pintu Utama",
    action: "OFF",
    trigger: "Manual",
    timestamp: "2026-05-19T08:12:00Z",
    status: "OFF"
  },
  {
    deviceName: "Pompa Air",
    action: "ON",
    trigger: "System Control",
    timestamp: "2026-05-19T07:55:00Z",
    status: "ON"
  },
  {
    deviceName: "Valve Gas",
    action: "OFFLINE",
    trigger: "System Control",
    timestamp: "2026-05-19T07:30:00Z",
    status: "Offline"
  }
];

// 7. Sensor Nilai Real-time
export const mockSensors = {
  liveTemp: 24.8,
  liveHumidity: 55,
  livePh: 7.25,
  liveTurbidity: 1.8,
  liveTds: 62,
  liveWaterTemp: 23.5
};

// 8. Log Riwayat Komparatif Lengkap (Untuk HomeownerHistory.jsx)
export const mockHistoryData = {
  "Kenyamanan": [
    { _id: "hist-c-1", date: "2026-05-19T08:00:00Z", room: "Ruang Tamu", avgTemperature: 24.8, avgHumidity: 55, status: "Normal" },
    { _id: "hist-c-2", date: "2026-05-19T07:00:00Z", room: "Ruang Tamu", avgTemperature: 25.2, avgHumidity: 58, status: "Normal" },
    { _id: "hist-c-3", date: "2026-05-19T06:00:00Z", room: "Ruang Tamu", avgTemperature: 24.1, avgHumidity: 62, status: "Normal" },
    { _id: "hist-c-4", date: "2026-05-19T05:00:00Z", room: "Dapur", avgTemperature: 26.5, avgHumidity: 60, status: "Normal" }
  ],
  "Keamanan": [
    { _id: "hist-s-1", date: "2026-05-19T08:10:00Z", room: "Ruang Tamu", door: "-", motion: "Detected", status: "Waspada" },
    { _id: "hist-s-2", date: "2026-05-19T07:55:00Z", room: "Dapur", door: "Open", motion: "No Motion", status: "Waspada" },
    { _id: "hist-s-3", date: "2026-05-19T07:45:00Z", room: "Dapur", door: "Closed", motion: "No Motion", status: "Normal" },
    { _id: "hist-s-4", date: "2026-05-19T06:30:00Z", room: "Garasi", door: "Offline", motion: "Offline", status: "Offline" }
  ],
  "Kualitas Air": [
    { _id: "hist-w-1", date: "2026-05-19T08:00:00Z", device: "Dapur", ph: 7.25, turbidity: 1.8, tds: 62, temperature: 23.5, status: "Normal" },
    { _id: "hist-w-2", date: "2026-05-19T06:00:00Z", device: "Dapur", ph: 6.80, turbidity: 2.1, tds: 65, temperature: 24.0, status: "Normal" },
    { _id: "hist-w-3", date: "2026-05-19T04:00:00Z", device: "Dapur", ph: 5.20, turbidity: 4.5, tds: 110, temperature: 25.1, status: "Bahaya" }
  ],
  "Konsumsi Energi": [
    { _id: "hist-e-1", date: "2026-05-19T08:00:00Z", device: "Power Meter Utama", totalKwh: 12.5, voltage: 220, current: 5.4, power: 1200, pf: 0.95 },
    { _id: "hist-e-2", date: "2026-05-18T08:00:00Z", device: "Power Meter Utama", totalKwh: 14.2, voltage: 218, current: 6.1, power: 1150, pf: 0.94 },
    { _id: "hist-e-3", date: "2026-05-17T08:00:00Z", device: "Power Meter Utama", totalKwh: 11.8, voltage: 222, current: 5.1, power: 1300, pf: 0.96 }
  ],
  "Log Perangkat": [
    { _id: "hist-l-1", date: "2026-05-19T08:45:00Z", room: "Ruang Tamu", actuator: "Lampu Teras", status: "ON", trigger: "Web App" },
    { _id: "hist-l-2", date: "2026-05-19T08:12:00Z", room: "Garasi", actuator: "Smart Lock Pintu Utama", status: "OFF", trigger: "Manual" },
    { _id: "hist-l-3", date: "2026-05-19T07:55:00Z", room: "Dapur", actuator: "Pompa Air", status: "ON", trigger: "System Control" },
    { _id: "hist-l-4", date: "2026-05-19T07:30:00Z", room: "Garasi", actuator: "Valve Gas", status: "Offline", trigger: "System Control" }
  ],
  "Notifikasi & Alert": [
    { _id: "hist-n-1", date: "2026-05-19T08:30:00Z", room: "Pengaduan", category: "Pengaduan", status: "Info", message: "Tiket pengaduan #TKT-8891 telah berhasil dibuat. Teknisi akan segera ditugaskan." },
    { _id: "hist-n-2", date: "2026-05-19T07:15:00Z", room: "Sistem", category: "Sistem", status: "Danger", message: "Smart Hub Garasi terdeteksi offline. Silakan periksa koneksi internet atau catu daya." },
    { _id: "hist-n-3", date: "2026-05-19T06:00:00Z", room: "Pengaduan", category: "Pengaduan", status: "Warning", message: "Perbaikan Sensor Kualitas Air dapur mendekati batas waktu SLA. Prioritas ditingkatkan." },
    { _id: "hist-n-4", date: "2026-05-19T05:00:00Z", room: "Sistem", category: "Sistem", status: "Warning", message: "Baterai Smart Hub Dapur tersisa 15%. Disarankan untuk segera melakukan penggantian baterai." }
  ]
};

// 9. Data Tiket Pengaduan Lengkap (Diselaraskan dengan status TicketStatusBadge)
export const mockComplaints = [
  {
    _id: "comp-001",
    desc: "Smart Hub Garasi terdeteksi offline semenjak pemadaman listrik semalam.",
    status: "unassigned", // Baru / Belum Ditugaskan
    priority: "high",
    createdAt: "2026-05-19T08:30:00Z",
    device: "Smart Hub Garasi",
    issue: "Koneksi terputus",
    homeowner: {
      fullName: "Asri Saraswati",
      email: "asrisaras17@gmail.com",
      phoneNumber: "+6281234567890"
    }
  },
  {
    _id: "comp-002",
    desc: "Sensor Kualitas Air di dapur selalu memberikan pembacaan pH tidak akurat (di bawah 5).",
    status: "diproses", // Sedang Diproses (In Progress)
    priority: "medium",
    processStartedAt: "2026-05-19T07:00:00Z",
    createdAt: "2026-05-19T06:00:00Z",
    device: "Sensor Kualitas Air",
    issue: "Sensor tidak akurat",
    technician: {
      fullName: "Ahmad Jalaludin",
      email: "ahmad.jalal@bieon.id",
      phoneNumber: "+6287766554433"
    },
    homeowner: {
      fullName: "Asri Saraswati",
      email: "asrisaras17@gmail.com",
      phoneNumber: "+6281234567890"
    }
  },
  {
    _id: "comp-003",
    desc: "Lampu teras depan tidak dapat dikontrol secara otomatis menggunakan scheduler.",
    status: "selesai", // Selesai - dengan rating
    priority: "low",
    rating: 5,
    ratingStars: 5,
    reviewText: "Teknisi sangat ramah dan mereset gateway teras sehingga scheduler bekerja kembali!",
    technician: {
      fullName: "Budi Santoso",
      email: "budi.santoso@bieon.id"
    },
    homeowner: {
      fullName: "Asri Saraswati"
    },
    createdAt: "2026-05-18T10:00:00Z",
    completedAt: "2026-05-18T11:30:00Z",
    processStartedAt: "2026-05-18T10:15:00Z"
  },
  {
    _id: "comp-004",
    desc: "Smart Lock Pintu Utama kadang terhambat saat mencoba mengunci dari web app.",
    status: "selesai", // Selesai - tanpa rating
    priority: "medium",
    rating: 0,
    ratingStars: 0,
    technician: {
      fullName: "Budi Santoso",
      email: "budi.santoso@bieon.id"
    },
    homeowner: {
      fullName: "Asri Saraswati"
    },
    createdAt: "2026-05-17T15:00:00Z",
    completedAt: "2026-05-17T17:00:00Z",
    processStartedAt: "2026-05-17T15:30:00Z"
  },
  {
    _id: "comp-005",
    desc: "Salah input tipe sensor, harusnya sensor kenyamanan tapi saya pilih sensor kualitas air.",
    status: "ditolak", // Ditolak
    priority: "low",
    createdAt: "2026-05-16T12:00:00Z",
    device: "Lainnya",
    issue: "Lainnya",
    homeowner: {
      fullName: "Asri Saraswati"
    }
  },
  {
    _id: "comp-006",
    desc: "Hub Dapur berbunyi mendengung keras dan tercium aroma hangus setelah lonjakan daya PLN.",
    status: "menunggu konfirmasi pelanggan", // Menunggu Konfirmasi Pelanggan
    priority: "high",
    isEscalated: true, // Dieskalasi
    createdAt: "2026-05-19T01:00:00Z",
    device: "Smart Hub Dapur",
    issue: "Kerusakan fisik",
    technician: {
      fullName: "Bambang Pamungkas",
      email: "bambang.p@bieon.id",
      phoneNumber: "+6281299887766"
    },
    homeowner: {
      fullName: "Asri Saraswati"
    }
  }
];
