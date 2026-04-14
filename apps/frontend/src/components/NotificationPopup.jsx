import React, { useState } from 'react';
import { 
  ArrowLeft, Bell, AlertTriangle, Briefcase, 
  User, Award, Hourglass, Server, Activity, 
  Fan, Flame, Zap, Lock, LogIn, CheckCircle, CheckCheck
} from 'lucide-react';

const notificationData = {
  technician: [
    {
      id: 1,
      type: 'danger',
      title: 'Peringatan SLA: TCK-0085',
      message: 'Waktu penyelesaian tiket Bpk. Andi telah melewati batas SLA (48 Jam). Mohon segera update status perbaikan!',
      time: '5 Menit yang lalu',
      icon: AlertTriangle,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Penugasan Tiket Baru',
      message: 'Anda ditugaskan pada tiket TCK-0092 (Sensor Gas Bocor) di Perum Dramaga. Segera lakukan respons awal.',
      time: '30 Menit yang lalu',
      icon: Briefcase,
    },
    {
      id: 3,
      type: 'info',
      title: 'Akses Data Log Disetujui',
      message: 'SuperAdmin telah memberikan akses log riwayat untuk Hub Node milik Ibu Siti (USR002).',
      time: '2 Jam yang lalu',
      icon: LogIn,
    },
    {
      id: 4,
      type: 'success',
      title: 'Tiket TCK-0070 Selesai',
      message: 'Kerja bagus! Tiket telah ditutup. Pelanggan memberikan penilaian ⭐ 5/5 untuk pelayanan Anda.',
      time: 'Kemarin, 14:30',
      icon: Award,
    }
  ],
  admin: [
    {
      id: 1,
      type: 'danger',
      title: 'Pelanggaran SLA: Teknisi Daffa',
      message: 'Teknisi Daffa telah melewati batas SLA perbaikan (> 48 Jam) untuk tiket TCK-0085 (Bpk. Andi). Segera lakukan eskalasi atau alihkan penugasan!',
      time: '10 Menit yang lalu',
      icon: AlertTriangle,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Menunggu Konfirmasi Hapus Akun',
      message: 'Tindakan hapus permanen untuk akun Homeowner Bpk. Rudi (USR-088) telah diteruskan. Sistem sedang menunggu konfirmasi persetujuan dari email Project Owner.',
      time: '30 Menit yang lalu',
      icon: Hourglass,
    },
    {
      id: 3,
      type: 'info',
      title: 'Klien Baru Terdaftar',
      message: 'Klien baru (Ibu Sarah - Perum Mutiara) telah berhasil melakukan setup Hub Node dan menyetujui dokumen Terms & Conditions BIEON.',
      time: '2 Jam yang lalu',
      icon: User,
    },
    {
      id: 4,
      type: 'success',
      title: 'OTA Update Berhasil',
      message: 'Pembaruan perangkat lunak (Over-The-Air Update) versi 2.1 untuk seluruh Hub Node di regional wilayah Bogor telah berhasil diterapkan tanpa kendala.',
      time: 'Kemarin, 23:30',
      icon: Server,
    }
  ],
  homeowner: [
    {
      id: 1,
      type: 'purple',
      title: 'Motion Detected',
      message: 'Gerakan terdeteksi di ruang tamu',
      time: '2 min ago',
      icon: Activity,
    },
    {
      id: 2,
      type: 'info',
      title: 'Suhu Tinggi - Kipas Auto ON',
      message: 'Suhu ruang produksi 31°C, kipas otomatis menyala',
      time: '5 min ago',
      icon: Fan,
    },
    {
      id: 3,
      type: 'danger',
      title: 'Gas Berbahaya Terdeteksi',
      message: 'Konsentrasi gas di dapur melebihi batas',
      time: '10 min ago',
      icon: AlertTriangle,
    },
    {
      id: 4,
      type: 'warning',
      title: 'Peringatan Token PLN',
      message: 'Sisa token PLN hampir habis (Rp50.000)',
      time: '1 hour ago',
      icon: Zap,
    },
    {
      id: 5,
      type: 'purple',
      title: 'Door Sensor Alert',
      message: 'Pintu depan terbuka tanpa otoritas',
      time: '15 min ago',
      icon: Lock,
    },
    // Duplicated dummy data to test scrolling
    {
      id: 6,
      type: 'purple',
      title: 'Motion Detected (Archive)',
      message: 'Gerakan terdeteksi di ruang tamu',
      time: '2 hours ago',
      icon: Activity,
    },
    {
      id: 7,
      type: 'info',
      title: 'Suhu Tinggi (Archive)',
      message: 'Suhu ruang produksi 31°C, kipas otomatis menyala',
      time: '3 hours ago',
      icon: Fan,
    },
    {
      id: 8,
      type: 'danger',
      title: 'Gas Berbahaya (Archive)',
      message: 'Konsentrasi gas di dapur melebihi batas',
      time: '4 hours ago',
      icon: AlertTriangle,
    },
    {
      id: 9,
      type: 'warning',
      title: 'Tagihan Air',
      message: 'Tagihan air PDAM bulan ini Rp125.000',
      time: '1 day ago',
      icon: Zap,
    },
    {
      id: 10,
      type: 'success',
      title: 'Sistem Optimal',
      message: 'Semua sistem berjalan dengan normal dan optimal hari ini.',
      time: '1 day ago',
      icon: CheckCircle,
    }
  ]
};

const typeStyles = {
  danger: {
    border: 'border-[#ff3b30]',
    bg: 'bg-red-50',
    iconText: 'text-[#ff3b30]',
    iconBg: 'bg-red-100'
  },
  warning: {
    border: 'border-[#ff9500]',
    bg: 'bg-orange-50',
    iconText: 'text-[#ff9500]',
    iconBg: 'bg-amber-100'
  },
  info: {
    border: 'border-[#007aff]',
    bg: 'bg-blue-50',
    iconText: 'text-[#007aff]',
    iconBg: 'bg-blue-100'
  },
  success: {
    border: 'border-[#34c759]',
    bg: 'bg-green-50',
    iconText: 'text-[#34c759]',
    iconBg: 'bg-green-100'
  },
  purple: {
    border: 'border-[#af52de]',
    bg: 'bg-purple-50',
    iconText: 'text-[#af52de]',
    iconBg: 'bg-purple-100'
  }
};

const NotificationPopup = ({ 
  isOpen, 
  onClose, 
  role = 'homeowner' // 'technician', 'admin', 'homeowner'
}) => {
  const [isAllRead, setIsAllRead] = useState(false);
  const [readIds, setReadIds] = useState(new Set());

  if (!isOpen) return null;

  const notifications = notificationData[role] || [];

  const isRead = (id) => isAllRead || readIds.has(id);
  const handleRead = (id) => {
    if (!isAllRead) {
      setReadIds(prev => new Set(prev).add(id));
    }
  };

  return (
    <div className="fixed right-3 sm:right-0 top-[68px] sm:top-[56px] md:top-[73px] z-[50] w-[calc(100vw-24px)] sm:w-[420px] max-h-[75vh] sm:max-h-none sm:h-[calc(100vh-56px)] md:h-[calc(100vh-73px)] bg-white/95 sm:bg-white/80 backdrop-blur-md shadow-2xl sm:shadow-[-10px_0_40px_rgba(0,0,0,0.08)] flex flex-col border border-gray-100 sm:border-y-0 sm:border-r-0 sm:border-l overflow-hidden rounded-[24px] sm:rounded-none sm:rounded-l-[32px] animate-in fade-in zoom-in-95 sm:slide-in-from-right-8 sm:zoom-in-100 duration-300" >
      
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50 flex-shrink-0 bg-transparent z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#059669] stroke-[2.5px]" />
            <h2 className="text-gray-900 font-bold text-[17px] tracking-tight">Notifikasi & Alert</h2>
          </div>
        </div>
        {!isAllRead && (
          <button 
            onClick={() => setIsAllRead(true)}
            className="text-[13px] text-[#059669] font-medium tracking-wide hover:text-emerald-700 transition-colors"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* Content / List Items */}
      <div className="flex-1 overflow-y-auto w-full p-4 space-y-4 bg-transparent custom-scrollbar pb-6 hidden-scrollbar">
        {notifications.map((notif) => {
          const style = typeStyles[notif.type] || typeStyles.info;
          const Icon = notif.icon;

          return (
            <div 
              key={notif.id}
              onClick={() => handleRead(notif.id)}
              className={`relative flex items-start gap-4 p-4 rounded-2xl border-l-[5px] transition-all duration-300 group cursor-pointer shadow-sm
                ${!isRead(notif.id) 
                  ? `${style.bg} ${style.border} hover:-translate-y-0.5 hover:shadow-md` 
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 border-l-gray-300'
                }`}
            >
              {/* Icon Container */}
              <div className={`shrink-0 w-11 h-11 rounded-[14px] flex items-center justify-center transition-colors duration-300
                ${!isRead(notif.id) ? style.iconBg : 'bg-gray-200'} `}>
                <Icon className={`w-5 h-5 stroke-[2px] transition-colors duration-300 ${!isRead(notif.id) ? style.iconText : 'text-gray-500'} `} />
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-gray-900 font-bold text-[15px] leading-snug mb-1.5 tracking-tight group-hover:text-gray-950 transition-colors">
                  {notif.title}
                </h3>
                <p className="text-[#64748b] text-[13.5px] leading-relaxed mb-2.5">
                  {notif.message}
                </p>
                <div className="text-[#94a3b8] text-[12px] font-medium tracking-wide">
                  {notif.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Custom Scrollbar Styles for the component only - Tailwind allows arbitrary CSS but we can add directly */}
      <style dangerouslySetInnerHTML={{__html: `
        .hidden-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}} />
    </div>
  );
};

export default NotificationPopup;
