import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, AlertTriangle, Briefcase, 
  User, Award, Hourglass, Server, Activity, 
  Fan, Flame, Zap, Lock, LogIn, CheckCircle, CheckCheck, MessageSquare
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const typeStyles = {
  danger: { border: 'border-red-100', bg: 'bg-red-50/50', iconText: 'text-red-500', iconBg: 'bg-red-100/50', icon: AlertTriangle, accent: 'border-red-500' },
  warning: { border: 'border-amber-100', bg: 'bg-amber-50/50', iconText: 'text-amber-600', iconBg: 'bg-amber-100/50', icon: Zap, accent: 'border-amber-500' },
  info: { border: 'border-sense/20', bg: 'bg-sense/5', iconText: 'text-sense', iconBg: 'bg-sense/10', icon: LogIn, accent: 'border-sense' },
  success: { border: 'border-eco/20', bg: 'bg-eco/5', iconText: 'text-eco', iconBg: 'bg-eco/10', icon: CheckCircle, accent: 'border-eco' },
  purple: { border: 'border-purple-100', bg: 'bg-purple-50/50', iconText: 'text-purple-600', iconBg: 'bg-purple-100/50', icon: Lock, accent: 'border-purple-500' },
  sistem: { border: 'border-slate-100', bg: 'bg-slate-50/50', iconText: 'text-slate-600', iconBg: 'bg-slate-100/50', icon: Server, accent: 'border-slate-500' },
  pengaduan: { border: 'border-orange-100', bg: 'bg-orange-50/50', iconText: 'text-orange-600', iconBg: 'bg-orange-100/50', icon: MessageSquare, accent: 'border-orange-500' },
  water: { border: 'border-indigo-100', bg: 'bg-indigo-50/50', iconText: 'text-indigo-600', iconBg: 'bg-indigo-100/50', icon: Activity, accent: 'border-indigo-500' },
  kenyamanan: { border: 'border-sense/20', bg: 'bg-sense/5', iconText: 'text-sense', iconBg: 'bg-sense/10', icon: Fan, accent: 'border-sense' }
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
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await fetch('/api/alerts', {
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

  const markAllAsSeenSilent = async () => {
    try {
      await fetch('/api/alerts/seen-all', {
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
      await fetch(`/api/alerts/${id}/read`, {
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
          <div className="p-2 bg-eco/10 rounded-xl">
            <Bell className="w-5 h-5 text-eco stroke-[2.5px]" />
          </div>
          <h2 className="text-gray-900 font-bold text-[17px] tracking-tight">{t('notification.ui.title', 'Notifikasi')}</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={resetReadStatus} className="text-[11px] text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase tracking-wider">
            {t('notification.ui.reset', 'Reset')}
          </button>
          <button onClick={markAllAsRead} className="text-[13px] text-eco font-bold hover:text-green-700 transition-colors">
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
            let type = notif.type?.toLowerCase();

            const category = notif.category?.toLowerCase();
            if (category === 'keamanan') type = 'purple';
            else if (category === 'air sanitasi' || category === 'kualitas air') type = 'water';
            else if (category === 'kenyamanan') type = 'kenyamanan';
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

            const getLocalizedCategory = (text) => {
              if (!text) return t('notification.ui.title', 'Notifikasi');
              const lower = text.toLowerCase();
              
              // Mapping Judul/Kategori ke Key i18n menggunakan partial match
              if (lower.includes('bahaya')) return t('notification.category.danger', 'Bahaya');
              if (lower.includes('waspada')) return t('notification.category.warning', 'Waspada');
              if (lower.includes('keamanan')) return t('notification.category.security', 'Keamanan');
              if (lower.includes('sistem') || lower.includes('hub') || lower.includes('kontrol')) return t('notification.category.system', 'Sistem');
              
              // Menangkap "Pengaduan Terkirim", "Tiket Baru", "Tugas Baru", dll
              if (lower.includes('pengaduan') || lower.includes('tiket') || lower.includes('tugas') || lower.includes('perbaikan')) {
                return t('notification.category.complaint', 'Pengaduan');
              }
              
              if (lower.includes('kenyamanan')) return t('notification.category.comfort', 'Kenyamanan');
              
              // Menangkap "Anggaran", "Tarif", "Topup"
              if (lower.includes('energi') || lower.includes('anggaran') || lower.includes('tarif')) {
                return t('notification.category.energy', 'Energi');
              }
              
              if (lower.includes('air') || lower.includes('tandon') || lower.includes('ph')) {
                return t('notification.category.water', 'Air Sanitasi');
              }
              
              return text;
            };

            const getLocalizedTitle = (text, category) => {
              if (!text) return getLocalizedCategory(category);
              const lower = text.toLowerCase();
              
              // Mapping Judul Spesifik ke Key i18n
              if (lower.includes('terkirim')) return t('notification.title.complaint_sent', text);
              if (lower.includes('tiket pengaduan baru')) return t('notification.title.new_complaint_ticket', text);
              if (lower.includes('mulai memproses')) return t('notification.title.tech_processing', text);
              if (lower.includes('perbaikan selesai')) return t('notification.title.repair_finished', text);
              if (lower.includes('pekerjaan selesai')) return t('notification.title.job_finished', text);
              if (lower.includes('ditolak')) return t('notification.title.complaint_rejected', text);
              if (lower.includes('dibatalkan')) return t('notification.title.ticket_cancelled', text);
              if (lower.includes('update perbaikan')) return t('notification.title.repair_update', text);
              if (lower.includes('permintaan data log')) return t('notification.title.log_request', text);
              if (lower.includes('akses log diberikan')) return t('notification.title.log_granted', text);
              if (lower.includes('akses log ditolak')) return t('notification.title.log_denied', text);
              if (lower.includes('tugas perbaikan baru')) return t('notification.title.new_task', text);
              if (lower.includes('teknisi ditugaskan')) return t('notification.title.tech_assigned', text);
              if (lower.includes('overdue')) return t('notification.title.sla_overdue', text);
              if (lower.includes('anggaran diperbarui')) return t('notification.title.budget_updated', text);
              if (lower.includes('peringatan anggaran diperbarui')) return t('notification.title.threshold_updated', text);
              if (lower.includes('terlalu rendah')) return t('notification.title.low_budget', text);
              if (lower.includes('kontrol perangkat')) return t('notification.title.device_control', text);

              // Jika tidak ada yang cocok, gunakan pelokalan kategori sebagai judul
              return getLocalizedCategory(category || text);
            };

            const getLocalizedMessage = (text) => {
              if (!text) return '';
              const lower = text.toLowerCase();
              
              if (lower.includes('terkirim dan menunggu')) return t('notification.msg.complaint_sent', text);
              if (lower.includes('diajukan oleh') || lower.includes('tiket pengaduan baru telah')) return t('notification.msg.new_ticket', text);
              if (lower.includes('dalam perjalanan') || lower.includes('mulai memproses')) return t('notification.msg.tech_processing', text);
              if (lower.includes('selesai dilakukan') || lower.includes('berikan rating')) return t('notification.msg.repair_finished', text);
              if (lower.includes('pekerjaan perbaikan telah selesai')) return t('notification.msg.job_finished', text);
              if (lower.includes('tidak dapat diproses') || lower.includes('ditolak')) return t('notification.msg.complaint_rejected', text);
              if (lower.includes('telah dibatalkan')) return t('notification.msg.ticket_cancelled', text);
              if (lower.includes('meminta akses log')) return t('notification.msg.log_request', text);
              if (lower.includes('akses log') && lower.includes('diberikan')) return t('notification.msg.log_granted', text);
              if (lower.includes('akses log') && lower.includes('ditolak')) return t('notification.msg.log_denied', text);
              if (lower.includes('ditambahkan ke jadwal')) return t('notification.msg.new_task', text);
              if (lower.includes('teknisi baru telah ditugaskan')) return t('notification.msg.tech_assigned', text);
              if (lower.includes('penyesuaian pada pengaturan') || lower.includes('anggaran energi')) return t('notification.msg.budget_updated', text);
              if (lower.includes('dihidupkan/dimatikan') || lower.includes('melalui dasbor')) return t('notification.msg.device_control', text);
              if (lower.includes('kadar air') || lower.includes('di bawah ambang batas')) return t('notification.msg.water_alert', text);
              if (lower.includes('tegangan') || lower.includes('melebihi kapasitas')) return t('notification.msg.power_alert', text);
              if (lower.includes('hub') && lower.includes('kehilangan koneksi')) return t('notification.msg.hub_offline', text);
              if (lower.includes('akses tidak sah')) return t('notification.msg.unauthorized_access', text);
              if (lower.includes('batas waktu sla')) return t('notification.msg.sla_overdue', text);
              
              return text;
            };

            return (
              <div 
                key={notif._id} 
                onClick={() => handleRead(notif)}
                className={`group relative rounded-[24px] p-4 border border-l-[6px] transition-all duration-300 cursor-pointer overflow-hidden
                  ${notif.isRead 
                    ? 'bg-gray-50/40 border-gray-100 opacity-60 grayscale-[0.5]' 
                    : `${style.bg} ${style.border} ${style.accent} hover:scale-[1.02] shadow-sm hover:shadow-md active:scale-95`
                  }`}
              >
                <div className="flex gap-4 relative z-10">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300
                    ${notif.isRead ? 'bg-gray-200' : style.iconBg}`}>
                    <Icon className={`w-5 h-5 ${notif.isRead ? 'text-gray-500' : style.iconText}`} strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate mb-0.5 ${notif.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
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
                        return dynamicTitle || getLocalizedTitle(notif.title, notif.category);
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
                        return (notif.messageKey ? t(notif.messageKey, notif.metadata || {}) : getLocalizedMessage(notif.message));
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
          title="Tutup"
        />
      </div>
    </div>
  );
};

export default NotificationPopup;
