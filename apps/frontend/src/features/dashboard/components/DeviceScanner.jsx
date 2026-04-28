import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { io } from "socket.io-client";
import { 
  QrCode, 
  X, 
  Camera, 
  Keyboard, 
  Smartphone, 
  Cpu,
  Check,
  AlertCircle,
  Activity,
  Radio,
  ArrowRight
} from "lucide-react";

// Database Lokal untuk mengenali perangkat sebelum pairing
const LOCAL_DEVICE_IDENTIFIER = {
  "SNZB-02": {
    name: "Sonoff Temperature & Humidity Sensor",
    model: "SNZB-02 / SNZB-02DR2",
    params: ["Suhu", "Kelembapan"],
    icon: <Activity className="w-6 h-6 text-orange-500" />
  },
  "SNZB-03": {
    name: "Sonoff Motion Sensor",
    model: "SNZB-03",
    params: ["Deteksi Gerakan"],
    icon: <Activity className="w-6 h-6 text-red-500" />
  },
  "SNZB-04": {
    name: "Sonoff Door/Window Sensor",
    model: "SNZB-04",
    params: ["Status Buka/Tutup"],
    icon: <Activity className="w-6 h-6 text-blue-500" />
  }
};

const DeviceScanner = ({ onScanSuccess, onCancel }) => {
  const [step, setStep] = useState("idle"); // idle, scanning, detected, pairing, success
  const [detectedDevice, setDetectedDevice] = useState(null);
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState(null);
  const [pairingStatus, setPairingStatus] = useState("");
  
  const scannerRef = useRef(null);
  const socketRef = useRef(null);
  const qrRegionId = "html5qr-code-full-region";

  useEffect(() => {
    // Inisialisasi Socket.io untuk tahap pairing nanti
    socketRef.current = io(window.location.origin.replace('3000', '5000'));

    socketRef.current.on('pairing_success', (data) => {
      setDetectedDevice(data.device);
      setStep("success");
      setTimeout(() => onScanSuccess(data.device), 3000);
    });

    socketRef.current.on('pairing_error', (data) => {
      setError(data.message);
      setStep("detected");
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const recognizeDevice = async (code) => {
    setStep("scanning"); // Show loading state while validating
    setError(null);

    try {
      const response = await fetch(`/api/products/validate/${code}`);
      const data = await response.json();

      if (data.isValid) {
        // ID Valid dan terdaftar
        setDetectedDevice({ 
          name: data.productName,
          model: data.productName, // Gunakan nama produk sebagai model sementara
          params: ["Standard Monitoring"], 
          icon: <Activity className="w-6 h-6 text-emerald-500" />,
          rawCode: code 
        });
        setStep("detected");
      } else {
        // ID Tidak Valid
        setError("ID Produk Tidak Valid / Belum Diregistrasi.");
        setStep("idle"); // Kembali ke scanner dengan pesan error
      }
    } catch (err) {
      setError("Gagal melakukan validasi ID ke server.");
      setStep("idle");
    }
    
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }
  };

  const handleStartPairing = async () => {
    setError(null);
    setStep("pairing");
    setPairingStatus("Membuka Jaringan Zigbee...");

    try {
      const response = await fetch('/api/devices/pairing/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: detectedDevice.rawCode })
      });

      const data = await response.json();
      if (response.ok) {
        setPairingStatus("Jaringan Terbuka (60s). Silakan tekan tombol pairing pada alat kamu...");
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      setStep("detected");
    }
  };

  const startScanner = async () => {
    setError(null);
    setStep("scanning");
    
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode(qrRegionId);
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 20, qrbox: { width: 250, height: 250 } },
          (text) => recognizeDevice(text),
          () => {}
        );
      } catch (err) {
        setError("Gagal akses kamera.");
        setStep("idle");
      }
    }, 100);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-emerald-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <QrCode className="w-6 h-6 text-emerald-400" />
          <div>
            <h3 className="text-xl font-bold">Smart Pairing</h3>
            <p className="text-[10px] text-emerald-300 uppercase tracking-widest font-black">Identify & Connect</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-8">
        {/* Step 1: Scanning / Idle */}
        {(step === "idle" || step === "scanning") && (
          <div className="space-y-8">
            <div id={qrRegionId} className={`w-full aspect-square bg-gray-50 rounded-3xl border-4 border-dashed flex items-center justify-center ${step === "scanning" ? "border-emerald-500 bg-black" : "border-gray-200"}`}>
              {step === "idle" && (
                <div className="text-center p-6">
                  <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Camera className="w-10 h-10 text-emerald-600" />
                  </div>
                  <p className="text-gray-600 font-bold mb-6">Scan QR untuk mengenali perangkat</p>
                  <button onClick={startScanner} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl transition-all active:scale-95">
                    Buka Scanner
                  </button>
                </div>
              )}
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); if(manualInput) recognizeDevice(manualInput); }} className="space-y-4">
              <div className="relative">
                <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Atau masukkan kode manual"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 outline-none font-bold"
                />
              </div>
              <button type="submit" className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black">Kenali Perangkat</button>
            </form>
          </div>
        )}

        {/* Step 2: Detected (Preview) */}
        {step === "detected" && detectedDevice && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="bg-emerald-50 rounded-[2.5rem] p-8 text-center border-2 border-emerald-100">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                {detectedDevice.icon}
              </div>
              <h4 className="text-2xl font-black text-gray-900 leading-tight mb-2">{detectedDevice.name}</h4>
              <p className="text-emerald-700 font-bold mb-6">Model: {detectedDevice.model}</p>
              
              <div className="bg-white/60 rounded-2xl p-6 text-left border border-white mb-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Parameter Pantauan:</p>
                <div className="flex flex-wrap gap-2">
                  {detectedDevice.params.map((p, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">{p}</span>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold mb-4 flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4"/> {error}</p>}

              <div className="flex flex-col gap-3">
                <button onClick={handleStartPairing} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 group">
                  Lanjut Hubungkan ke Jaringan <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => setStep("idle")} className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Bukan alat ini? Scan ulang</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pairing (Waiting for Network) */}
        {step === "pairing" && (
          <div className="py-12 text-center animate-in fade-in duration-300">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
              <Radio className="absolute inset-0 m-auto w-10 h-10 text-emerald-600 animate-pulse" />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">Menunggu Pairing Jaringan...</h4>
            <p className="text-gray-600 text-sm animate-pulse px-6">{pairingStatus}</p>
            <button onClick={() => setStep("detected")} className="mt-8 text-sm font-bold text-red-400 hover:text-red-600">Batalkan</button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="py-12 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-emerald-600" />
            </div>
            <h4 className="text-2xl font-black text-gray-900 mb-2">Terhubung!</h4>
            <p className="text-emerald-700 font-bold">{detectedDevice?.name} berhasil diverifikasi di jaringan Zigbee.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceScanner;
