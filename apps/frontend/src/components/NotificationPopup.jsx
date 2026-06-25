import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, AlertTriangle, Briefcase, 
  User, Award, Hourglass, Server, Activity, 
  Fan, Flame, Zap, Lock, LogIn, CheckCircle, CheckCheck, MessageSquare, Droplets
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mockNotifications } from '../features/dashboard/homeownerMockData';
import { getLocalizedTitle, getLocalizedCategory, getLocalizedMessage } from '../utils/notificationI18nHelper';


const typeStyles = {
  danger: { iconText: 'text-alert-danger', iconBg: 'bg-alert-danger/10', icon: AlertTriangle, accent: 'border-l-alert-danger' },
  warning: { iconText: 'text-alert-warning', iconBg: 'bg-alert-warning/10', icon: Zap, accent: 'border-l-alert-warning' },
  info: { iconText: 'text-eco', iconBg: 'bg-eco/10', icon: LogIn, accent: 'border-l-eco' },
  success: { iconText: 'text-eco', iconBg: 'bg-eco/10', icon: CheckCircle, accent: 'border-l-eco' },
  sistem: { iconText: 'text-slate-600', iconBg: 'bg-slate-100', icon: Server, accent: 'border-l-slate-400' }
};

const NotificationPopup = ({ isOpen, onClose, role = 'homeowner', onUnreadChange, onNavigate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef(null);
  const token = localStorage.getItem('token');

  // Notify parent about unread status
  useEffect(() => {
    if (onUnreadChange) {
      const hasUnread = notifications.some(n => !n.isRead && !n.isSeen);
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
    setIsLoading(true);
    let apiData = [];
    try {
      if (token) {
        const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/alerts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          apiData = result.data || [];
        }
      }
    } catch (error) {
      console.error("Gagal mengambil notifikasi dari API, menggunakan fallback mock data:", error);
    }

    // Merge apiData and mockNotifications
    const normalizedMock = mockNotifications.map(m => ({
      _id: m._id,
      title: m.title,
      category: m.category,
      message: m.message,
      type: m.type,
      isRead: m.isRead !== undefined ? m.isRead : (m.read !== undefined ? m.read : false),
      isSeen: m.isSeen !== undefined ? m.isSeen : true,
      date: m.createdAt || m.date || new Date().toISOString()
    }));

    const normalizedApi = apiData.map(a => ({
      _id: a._id,
      title: a.title,
      category: a.category,
      message: a.message,
      type: a.type,
      isRead: a.isRead !== undefined ? a.isRead : false,
      isSeen: a.isSeen !== undefined ? a.isSeen : false,
      date: a.date || a.createdAt || new Date().toISOString(),
      metadata: a.metadata,
      link: a.link
    }));

    // Deduplicate by title or _id
    const merged = [...normalizedApi];
    normalizedMock.forEach(mockItem => {
      const exists = merged.some(apiItem => 
        apiItem._id === mockItem._id || 
        apiItem.title.toLowerCase().trim() === mockItem.title.toLowerCase().trim()
      );
      if (!exists) {
        merged.push(mockItem);
      }
    });

    // Sort chronologically (latest first)
    merged.sort((a, b) => new Date(b.date) - new Date(a.date));

    setNotifications(merged);
    setIsLoading(false);
  };

  const markAllAsSeenSilent = async () => {
    try {
      await fetch((import.meta.env.VITE_API_URL || '') + '/api/alerts/seen-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Gagal menandai lihat (silent):", error);
    }
  };

  const wasOpened = useRef(false);

  useEffect(() => {
    if (isOpen) {
      wasOpened.current = true;
      fetchNotifications();
    } else if (wasOpened.current) {
      // Ketika popup ditutup, otomatis hilangkan label NEW (isSeen = true), tapi biarkan warnanya
      setNotifications(prev => {
         const hasUnread = prev.some(n => !n.isRead && !n.isSeen);
         if (hasUnread) {
             markAllAsSeenSilent();
             return prev.map(n => ({ ...n, isSeen: true }));
         }
         return prev;
      });
      wasOpened.current = false;
    }
  }, [isOpen]);

  const handleRead = async (notif) => {
    try {
      const id = notif._id;
      // Optimistic Update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

      // Handle Deep Linking
      if (notif.link) {
        // Special Logic for Technician Dashboard (SPA state-based)
        if (role === 'technician' && onNavigate) {
           if (notif.link === 'pengaduan') {
              const msg = (notif.message || "").toLowerCase();
              const title = (notif.title || "").toLowerCase();
              // If it's about completion or rating, go to history
              if (msg.includes('rating') || msg.includes('selesai') || title.includes('rating') || title.includes('selesai')) {
                onNavigate('riwayat');
              } else {
                onNavigate('pengaduan');
              }
           } else {
             // Default state-based navigation for other links
             onNavigate(notif.link);
           }
        } 
        // Default Logic for Homeowner/Other (Route-based)
        else {
          if (notif.link === 'pengaduan') navigate('/pengaduan');
          else if (notif.link === 'kendali') {
            if (notif.metadata?.deviceId) {
              sessionStorage.setItem('pendingHighlight', notif.metadata.deviceId);
            }
            navigate('/kendali');
          }
          else if (notif.link === 'dashboard' || notif.link === 'history-energi') {
            const target = notif.metadata?.scrollTarget || 'section-energi';
            sessionStorage.setItem('pendingScroll', target);
            navigate('/dashboard');
            
            setTimeout(() => {
              const element = document.getElementById(target);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                sessionStorage.removeItem('pendingScroll');
              }
            }, 100);
          } else {
            navigate(`/${notif.link}`);
          }
        }
        onClose(); // Close popup after navigation
      }

      // Update to backend
      if (token && id && !id.startsWith('notif-')) {
        await fetch((import.meta.env.VITE_API_URL || '') + `/api/alerts/${id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Gagal menandai baca:", error);
    }
  };

  const resetReadStatus = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: false })));
      await fetch((import.meta.env.VITE_API_URL || '') + '/api/history/alerts/reset-read', {
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
      await fetch((import.meta.env.VITE_API_URL || '') + '/api/history/alerts/read-all', {
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
          <div className="p-2 bg-eco/10 rounded-xl">
            <Bell className="w-5 h-5 text-eco stroke-[2.5px]" />
          </div>
          <h2 className="text-gray-900 font-bold text-[17px] tracking-tight">{t('notification.ui.title', 'Notifikasi')}</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={resetReadStatus} className="text-[11px] text-gray-400 font-bold hover:text-gray-600 transition-colors tracking-wider">
            {t('notification.ui.reset', 'Reset')}
          </button>
          <button onClick={markAllAsRead} className="text-[13px] text-eco font-bold hover:text-eco/80 transition-colors">
            {t('notification.ui.read_all', 'Baca Semua')}
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="overflow-y-auto w-full p-4 space-y-3 custom-scrollbar">
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="w-8 h-8 border-3 border-gray-100 border-t-eco rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">{t('notification.ui.loading', 'Memuat...')}</p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => {
            const msg = (notif.message + " " + notif.title + " " + (notif.category || '')).toLowerCase();
            let resolvedType = 'info';
            let Icon = Bell; // fallback if not found

            const category = notif.category?.toLowerCase();

            // 1. Dynamic category and keyword to typeStyles mapping
            if (category === 'keamanan') {
              if (msg.includes('bahaya') || msg.includes('akses tidak sah') || msg.includes('terobos') || msg.includes('kebocoran') || msg.includes('critical')) {
                resolvedType = 'danger';
              } else if (msg.includes('gerak') || msg.includes('terbuka') || msg.includes('waspada') || msg.includes('warning') || msg.includes('anomaly')) {
                resolvedType = 'warning';
              } else {
                resolvedType = 'success';
              }
            } else if (category === 'air sanitasi' || category === 'kualitas air') {
              if (msg.includes('tidak layak') || msg.includes('kritis') || msg.includes('bahaya') || msg.includes('ph') || msg.includes('extreme') || msg.includes('danger')) {
                resolvedType = 'danger';
              } else if (msg.includes('waspada') || msg.includes('warning')) {
                resolvedType = 'warning';
              } else {
                resolvedType = 'info';
              }
            } else if (category === 'kenyamanan') {
              if (msg.includes('bahaya') || msg.includes('extreme') || msg.includes('panas')) {
                resolvedType = 'danger';
              } else if (msg.includes('waspada') || msg.includes('warning')) {
                resolvedType = 'warning';
              } else {
                resolvedType = 'info';
              }
            } else if (category === 'energi') {
              if (msg.includes('melebihi') || msg.includes('limit') || msg.includes('kritis') || msg.includes('habis') || msg.includes('over capacity')) {
                resolvedType = 'danger';
              } else if (msg.includes('lemah') || msg.includes('waspada') || msg.includes('warning') || msg.includes('terlalu rendah')) {
                resolvedType = 'warning';
              } else if (msg.includes('berhasil') || msg.includes('diperbarui') || msg.includes('success')) {
                resolvedType = 'success';
              } else {
                resolvedType = 'info';
              }
            } else if (category === 'pengaduan') {
              if (msg.includes('selesai') || msg.includes('rating') || msg.includes('berhasil') || msg.includes('ditutup')) {
                resolvedType = 'success';
              } else if (msg.includes('overdue') || msg.includes('sla') || msg.includes('warning') || msg.includes('menunggu konfirmasi')) {
                resolvedType = 'warning';
              } else if (msg.includes('ditolak') || msg.includes('dibatalkan')) {
                resolvedType = 'danger';
              } else {
                resolvedType = 'info';
              }
            } else if (category === 'sistem') {
              if (msg.includes('offline') || msg.includes('terputus') || msg.includes('critical') || msg.includes('danger')) {
                resolvedType = 'danger';
              } else if (msg.includes('lemah') || msg.includes('baterai') || msg.includes('warning') || msg.includes('waspada')) {
                resolvedType = 'warning';
              } else {
                resolvedType = 'sistem';
              }
            } else {
              // Fallback based on message keywords
              if (msg.includes('bahaya') || msg.includes('gas') || msg.includes('melebihi') || msg.includes('critical') || msg.includes('offline') || msg.includes('terputus')) {
                resolvedType = 'danger';
              } else if (msg.includes('waspada') || msg.includes('token') || msg.includes('peringatan') || msg.includes('warning') || msg.includes('baterai')) {
                resolvedType = 'warning';
              } else if (msg.includes('berhasil') || msg.includes('selesai') || msg.includes('optimal') || msg.includes('aman') || msg.includes('success')) {
                resolvedType = 'success';
              } else if (msg.includes('sistem') || msg.includes('update') || msg.includes('firmware')) {
                resolvedType = 'sistem';
              } else {
                resolvedType = 'info';
              }
            }

            // 2. Dynamically assign tailored Lucide icons
            if (category === 'keamanan') {
              Icon = (resolvedType === 'danger' || resolvedType === 'warning') ? AlertTriangle : Lock;
            } else if (category === 'air sanitasi' || category === 'kualitas air') {
              Icon = Droplets;
            } else if (category === 'kenyamanan') {
              Icon = Fan;
            } else if (category === 'energi') {
              Icon = Zap;
            } else if (category === 'pengaduan') {
              Icon = (resolvedType === 'success') ? CheckCircle : MessageSquare;
            } else if (category === 'sistem') {
              Icon = (resolvedType === 'danger' || resolvedType === 'warning') ? AlertTriangle : Server;
            } else {
              if (resolvedType === 'danger') Icon = AlertTriangle;
              else if (resolvedType === 'warning') Icon = Zap;
              else if (resolvedType === 'success') Icon = CheckCircle;
              else if (resolvedType === 'sistem') Icon = Server;
              else Icon = Bell;
            }

            const style = typeStyles[resolvedType] || typeStyles.info;

            const resolvedGetLocalizedCategory = (text) => getLocalizedCategory(text, t);
            const resolvedGetLocalizedTitle = (text, cat) => getLocalizedTitle(text, cat, t);
            const resolvedGetLocalizedMessage = (text) => getLocalizedMessage(text, notif.metadata || {}, t);

             return (
              <div 
                key={notif._id} 
                onClick={() => handleRead(notif)}
                className={`group relative rounded-2xl p-4 border border-slate-100 border-l-4 transition-all duration-300 cursor-pointer overflow-hidden
                  ${notif.isRead 
                    ? `bg-white border-l-slate-200` 
                    : `bg-white ${style.accent} hover:scale-[1.02] shadow-sm hover:shadow-md active:scale-95`
                  }`}
              >
                <div className="flex gap-4 relative z-10">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300
                    ${notif.isRead ? 'bg-slate-100 text-slate-400' : `${style.iconBg} ${style.iconText}`}`}>
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate mb-0.5 ${notif.isRead ? 'text-slate-500' : 'text-gray-900'}`}>
                      {(() => {
                        const titleStr = (notif.title || "").toLowerCase();
                        let smartType = null;
                        if (notif.type && !['info', 'danger', 'warning', 'success', 'sistem', 'pengaduan', 'purple', 'water', 'kenyamanan'].includes(notif.type.toLowerCase())) {
                          smartType = notif.type.toUpperCase();
                        } else {
                          if (titleStr.includes('overdue') || titleStr.includes('sla')) smartType = 'SLA_OVERDUE';
                          else if (titleStr.includes('ping') || titleStr.includes('teguran')) smartType = 'ACTION_REQUIRED';
                          else if (titleStr.includes('tugas perbaikan baru') || titleStr.includes('new task')) smartType = 'NEW_TASK';
                          else if (titleStr.includes('teknisi ditugaskan') || titleStr.includes('tech assigned')) smartType = 'TECH_ASSIGNED';
                          else if (titleStr.includes('mulai memproses') || titleStr.includes('started processing')) smartType = 'TECH_PROCESSING';
                          else if (titleStr.includes('pengaduan baru') || titleStr.includes('new complaint')) smartType = 'NEW_COMPLAINT_TICKET';
                          else if (titleStr.includes('terkirim') || titleStr.includes('submitted')) smartType = 'COMPLAINT_SENT';
                          else if (titleStr.includes('selesai') || titleStr.includes('finished')) smartType = 'REPAIR_FINISHED';
                          else if (titleStr.includes('dibatalkan') || titleStr.includes('cancelled')) smartType = 'TICKET_CANCELLED';
                        }
                        const dynamicTitle = smartType && t(`notifications.dynamic.${smartType}.title`, { defaultValue: '' });
                        return dynamicTitle || resolvedGetLocalizedTitle(notif.title, notif.category);

                      })()}
                    </h4>
                    <p className={`text-[13px] leading-relaxed ${notif.isRead ? 'text-gray-400' : 'text-gray-600 font-medium'}`}>
                      {(() => {
                        const titleStr = (notif.title || "").toLowerCase();
                        const msgStr = (notif.message || "").toLowerCase();
                        let smartType = null;
                        if (notif.type && !['info', 'danger', 'warning', 'success', 'sistem', 'pengaduan', 'purple', 'water', 'kenyamanan'].includes(notif.type.toLowerCase())) {
                          smartType = notif.type.toUpperCase();
                        } else {
                          if (titleStr.includes('overdue') || titleStr.includes('sla')) smartType = 'SLA_OVERDUE';
                          else if (titleStr.includes('ping') || titleStr.includes('teguran')) smartType = 'ACTION_REQUIRED';
                          else if (titleStr.includes('tugas perbaikan baru') || titleStr.includes('new task')) smartType = 'NEW_TASK';
                          else if (titleStr.includes('teknisi ditugaskan') || titleStr.includes('tech assigned')) smartType = 'TECH_ASSIGNED';
                          else if (titleStr.includes('mulai memproses') || titleStr.includes('started processing')) smartType = 'TECH_PROCESSING';
                          else if (titleStr.includes('pengaduan baru') || titleStr.includes('new complaint')) smartType = 'NEW_COMPLAINT_TICKET';
                          else if (titleStr.includes('terkirim') || titleStr.includes('submitted')) smartType = 'COMPLAINT_SENT';
                          else if (titleStr.includes('selesai') || titleStr.includes('finished')) smartType = 'REPAIR_FINISHED';
                          else if (titleStr.includes('dibatalkan') || titleStr.includes('cancelled')) smartType = 'TICKET_CANCELLED';
                        }
                        
                        const dynamicBody = smartType && t(`notifications.dynamic.${smartType}.body`, { defaultValue: '' });
                        if (dynamicBody) {
                          const extractedTicket = notif.metadata?.ticketId || notif.metadata?.ticket || notif.metadata?.topic || (msgStr.includes('tiket') ? notif.message.split(' ').pop().replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g, '') : '');
                          return t(`notifications.dynamic.${smartType}.body`, { 
                            ...notif.metadata,
                            ticket: extractedTicket,
                            technician: notif.metadata?.technicianName || notif.metadata?.technician || notif.metadata?.senderName || '',
                            topic: notif.metadata?.topic || '',
                            name: notif.metadata?.senderName || notif.metadata?.name || '',
                            hubId: notif.metadata?.hubId || '',
                            deviceName: notif.metadata?.deviceName || '',
                            status: notif.metadata?.status || '',
                            location: notif.metadata?.location || notif.metadata?.room || '',
                            percent: notif.metadata?.percent || notif.metadata?.threshold || '',
                            date: notif.metadata?.date || ''
                          });
                        }
                        return (notif.messageKey ? t(notif.messageKey, notif.metadata || {}) : resolvedGetLocalizedMessage(notif.message));

                      })()}
                    </p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] font-medium text-gray-400">
                        {notif.date ? new Date(notif.date).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace('.', ':') : t('notification.ui.just_now', 'Baru saja')}
                      </span>
                      {notif.link && !notif.isRead && !notif.isSeen && (
                        <div className="flex items-center gap-2">
                          {role === 'technician' && (
                            <div className="flex items-center justify-center w-4 h-4">
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            </div>
                          )}
                          {role === 'homeowner' && (
                            <span className="px-2 py-0.5 bg-eco/10 text-eco text-[10px] font-black rounded-md uppercase tracking-wider">
                              {t('notification.ui.new', 'Baru')}
                            </span>
                          )}
                          {(role === 'superadmin' || role === 'admin') && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-md uppercase tracking-wider">
                              {t('notification.category.review_required', 'Butuh Tinjauan')}
                            </span>
                          )}
                        </div>
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
            <h3 className="text-gray-900 font-bold text-base mb-1">{t('notification.ui.empty_title', 'Hening Sekali...')}</h3>
            <p className="text-gray-400 text-[13px] font-medium leading-relaxed">
              {t('notification.ui.empty_desc', 'Belum ada notifikasi baru untukmu saat ini.')}
            </p>
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-50/50 flex justify-center border-t border-gray-50">
        <button 
          onClick={onClose}
          className="w-12 h-1.5 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
          title={t('notification.ui.close')}
        />
      </div>
    </div>
  );
};

export default NotificationPopup;
