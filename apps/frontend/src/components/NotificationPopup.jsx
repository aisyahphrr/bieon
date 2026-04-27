import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Bell, AlertTriangle, Briefcase, 
  User, Award, Hourglass, Server, Activity, 
  Fan, Flame, Zap, Lock, LogIn, CheckCircle, CheckCheck, MessageSquare
} from 'lucide-react';

const typeStyles = {
  danger: { border: 'border-[#ff3b30]', bg: 'bg-red-50', iconText: 'text-[#ff3b30]', iconBg: 'bg-red-100', icon: AlertTriangle, accent: 'bg-red-500' },
  warning: { border: 'border-[#ff9500]', bg: 'bg-orange-50', iconText: 'text-[#ff9500]', iconBg: 'bg-amber-100', icon: Zap, accent: 'bg-amber-500' },
  info: { border: 'border-[#007aff]', bg: 'bg-blue-50', iconText: 'text-[#007aff]', iconBg: 'bg-blue-100', icon: LogIn, accent: 'bg-blue-500' },
  success: { border: 'border-[#34c759]', bg: 'bg-green-50', iconText: 'text-[#34c759]', iconBg: 'bg-green-100', icon: CheckCircle, accent: 'bg-green-500' },
  purple: { border: 'border-[#af52de]', bg: 'bg-purple-50', iconText: 'text-[#af52de]', iconBg: 'bg-purple-100', icon: Activity, accent: 'bg-purple-500' },
  sistem: { border: 'border-teal-500', bg: 'bg-teal-50', iconText: 'text-teal-600', iconBg: 'bg-teal-100', icon: Server, accent: 'bg-teal-500' },
  pengaduan: { border: 'border-amber-500', bg: 'bg-amber-50', iconText: 'text-amber-600', iconBg: 'bg-amber-100', icon: MessageSquare, accent: 'bg-amber-500' }
};

const NotificationPopup = ({ isOpen, onClose, role = 'homeowner', onNavigate, onUnreadChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef(null);
  const token = localStorage.getItem('token');

  // Notify parent about unread status
  useEffect(() => {
    if (onUnreadChange) {
      const hasUnread = notifications.some(n => !n.isRead);
      onUnreadChange(hasUnread);
    }
  }, [notifications, onUnreadChange]);


  // Handle Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        // Cek apakah yang diklik bukan tombol lonceng (karena tombol lonceng punya logic toggle sendiri)
        if (!event.target.closest('button')) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch('/api/history/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleRead = async (notif) => {
    try {
      const id = notif._id;
      // Optimistic Update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

      // Jika ada link, arahkan ke halaman tersebut
      if (notif.link && onNavigate) {
        onNavigate(notif.link);
        onClose(); // Tutup popup setelah navigasi
      }

      // Update to backend
      await fetch(`/api/history/alerts/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Gagal menandai baca:", error);
    }
  };

  const resetReadStatus = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: false })));
      await fetch('/api/history/alerts/reset-read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Gagal reset status baca:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await fetch('/api/history/alerts/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Gagal menandai semua baca:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={popupRef}
      className="fixed right-4 top-[72px] md:top-[85px] z-[70] w-[calc(100vw-32px)] sm:w-[400px] h-auto max-h-[80vh] bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col border border-gray-100 rounded-[32px] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300"
    >
      
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50 flex-shrink-0 bg-white/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <Bell className="w-5 h-5 text-[#059669] stroke-[2.5px]" />
          </div>
          <h2 className="text-gray-900 font-bold text-[17px] tracking-tight">Notifikasi</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={resetReadStatus} className="text-[11px] text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-wider">
            Reset
          </button>
          <button onClick={markAllAsRead} className="text-[13px] text-[#059669] font-bold hover:text-emerald-700 transition-colors">
            Baca Semua
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="overflow-y-auto w-full p-4 space-y-3 custom-scrollbar">
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="w-8 h-8 border-3 border-gray-100 border-t-emerald-500 rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Memuat...</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => {
            const msg = (notif.message + " " + notif.title + " " + (notif.category || '')).toLowerCase();
            let type = notif.type?.toLowerCase();

            const category = notif.category?.toLowerCase();
            if (category === 'keamanan') type = 'purple';
            else if (category === 'air sanitasi' || category === 'kualitas air') type = 'info';
            else if (category === 'energi') type = 'warning';
            else if (category === 'pengaduan') type = 'pengaduan';
            else if (category === 'sistem') type = 'sistem';
            else if (!type || !typeStyles[type]) {
               if (msg.includes('bahaya') || msg.includes('gas') || msg.includes('melebihi')) type = 'danger';
               else if (msg.includes('waspada') || msg.includes('token') || msg.includes('peringatan')) type = 'warning';
               else if (msg.includes('gerak') || msg.includes('pintu') || msg.includes('keamanan')) type = 'purple';
               else if (msg.includes('berhasil') || msg.includes('selesai') || msg.includes('optimal')) type = 'success';
               else type = 'info';
            }


            const style = typeStyles[type] || typeStyles.info;
            const Icon = style.icon;

            return (
              <div 
                key={notif._id}
                onClick={() => handleRead(notif)}
                className={`group relative rounded-[24px] p-4 border transition-all duration-300 cursor-pointer overflow-hidden
                  ${notif.isRead 
                    ? 'bg-gray-50/40 border-gray-100 opacity-60 grayscale-[0.5]' 
                    : `${style.bg} ${style.border} hover:scale-[1.02] shadow-sm hover:shadow-md active:scale-95`
                  }`}
              >
                <div className="flex gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300
                    ${notif.isRead ? 'bg-gray-200' : style.iconBg}`}>
                    <Icon className={`w-5 h-5 ${notif.isRead ? 'text-gray-500' : style.iconText}`} strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate mb-0.5 ${notif.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notif.title || notif.category}
                    </h4>
                    <p className={`text-[13px] leading-relaxed ${notif.isRead ? 'text-gray-400' : 'text-gray-600 font-medium'}`}>
                      {notif.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] font-medium text-gray-400">
                        {notif.date ? new Date(notif.date).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace('.', ':') : 'Baru saja'}
                      </span>
                      {notif.link && !notif.isRead && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full shadow-sm animate-pulse">
                          TINDAKAN DIPERLUKAN
                        </span>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 relative">
              <Bell className="w-8 h-8 text-gray-200" />
              <div className="absolute top-5 right-5 w-3 h-3 bg-white rounded-full border-4 border-gray-50" />
            </div>
            <h3 className="text-gray-900 font-bold text-base mb-1">Hening Sekali...</h3>
            <p className="text-gray-400 text-[13px] font-medium leading-relaxed">
              Belum ada notifikasi baru untukmu saat ini. Cek kembali nanti ya!
            </p>
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-50/50 flex justify-center border-t border-gray-50">
        <button 
          onClick={onClose}
          className="w-12 h-1.5 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
          title="Tutup"
        />
      </div>
    </div>
  );
};

export default NotificationPopup;
