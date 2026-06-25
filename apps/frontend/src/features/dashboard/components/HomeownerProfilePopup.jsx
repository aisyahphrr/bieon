import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Edit2, Plus, Settings, LogOut, ChevronDown, Check, User, Camera, Zap, Cpu, Loader2 } from 'lucide-react';
import AddBieonPopup from './AddBieonPopup';
import { useTranslation } from 'react-i18next';

export default function HomeownerProfilePopup({ isOpen, onClose, onNavigate, userProfile }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [view, setView] = useState('main'); // 'main', 'edit', 'settings'
  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80');
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    username: userProfile?.username || '',
    email: userProfile?.email || '',
    fullName: userProfile?.fullName || '',
    phoneNo: userProfile?.phoneNumber || '',
    dob: userProfile?.dateOfBirth || '',
    address: userProfile?.address || ''
  });

  // Update form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        username: userProfile.username || '',
        email: userProfile.email || '',
        fullName: userProfile.fullName || '',
        phoneNo: userProfile.phoneNumber || '',
        dob: userProfile.dateOfBirth || '',
        address: userProfile.address || ''
      });
    }
  }, [userProfile]);

  const [settingsData, setSettingsData] = useState({
    theme: 'Light'
  });

  const [bieonSystems, setBieonSystems] = useState([]);
  const [showAddBieonPopup, setShowAddBieonPopup] = useState(false);
  const [isLoadingBieon, setIsLoadingBieon] = useState(false);

  // Custom Dropdown States
  const [openDropdown, setOpenDropdown] = useState(null); // 'theme' or 'language'

  // Fetch Bieon Systems
  const fetchBieonSystems = async () => {
    if (!userProfile?._id) return;
    setIsLoadingBieon(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch((import.meta.env.VITE_API_URL || '') + `/api/hubs/systems/${userProfile._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBieonSystems(data);
      }
    } catch (err) {
      console.error("Gagal ambil sistem BIEON:", err);
    } finally {
      setIsLoadingBieon(false);
    }
  };

  useEffect(() => {
    if (isOpen && userProfile?._id) {
      fetchBieonSystems();
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setView('main');
        window.location.reload();
      } else {
        alert(t('alerts.profile_update_failed'));
      }
    } catch (err) {
      console.error(err);
      alert(t('alerts.profile_update_error'));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-0 sm:p-4">
      <div className="relative bg-white/95 backdrop-blur-3xl rounded-t-[32px] sm:rounded-[36px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full sm:max-w-[420px] overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300 border-0">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-32 bg-eco/20 blur-[50px] rounded-full pointer-events-none"></div>

        {/* Header Section */}
        <div className="px-8 pt-8 pb-4 relative z-10 shrink-0 border-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {view === 'main' ? t('profile.title') : t('profile.edit_title')}
            </h2>
            <button 
              onClick={() => {
                if (view !== 'main') setView('main');
                else onClose();
              }} 
              className="p-2 hover:bg-slate-100 hover:text-slate-600 rounded-2xl transition-all duration-300 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area - Seamless Scrollable with CSS Masking */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-2 custom-scrollbar scroll-smooth"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 40px), transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 40px), transparent)'
          }}
        >
          
          {/* MAIN PROFILE VIEW */}
          {view === 'main' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pt-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                <div className="relative mb-4 group cursor-pointer" onClick={() => setView('edit')}>
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-eco to-green-600 rounded-full blur opacity-45 group-hover:opacity-80 transition duration-500 group-hover:scale-105"></div>
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-50 relative group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={profilePic} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <Edit2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setView('edit'); }}
                    className="absolute bottom-1 right-1 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl text-slate-400 hover:text-eco transition-all border-[3px] border-white scale-110"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-[22px] font-extrabold text-slate-800 tracking-tight">{formData.username || 'No Username'}</h3>
                <p className="text-[13px] text-slate-500 font-medium tracking-tight mt-0.5">{formData.email}</p>
              </div>

              {/* Info Details Glass Card */}
              <div className="space-y-4 p-5 bg-slate-50/50 rounded-2xl border-0 shadow-sm">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-bold text-slate-500">{t('profile.phone')}</span>
                  <span className="font-bold text-slate-700">{formData.phoneNo}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-bold text-slate-500">{t('profile.dob')}</span>
                  <span className="font-bold text-slate-700">{formData.dob}</span>
                </div>
                <div className="flex justify-between items-start gap-4 text-[13px]">
                  <span className="font-bold text-slate-500 shrink-0">{t('profile.address')}</span>
                  <span className="font-bold text-slate-700 text-right">{formData.address}</span>
                </div>
              </div>

              {/* Your Device Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-5 px-2">
                  <h4 className="text-lg font-extrabold text-slate-800 tracking-tight">{t('profile.your_device')}</h4>
                  <button 
                    onClick={() => setShowAddBieonPopup(true)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-eco hover:text-white transition-all shadow-sm"
                    title={t('profile.add_bieon_id')}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="px-2 mb-2 space-y-3">
                  {isLoadingBieon ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-eco animate-spin" />
                    </div>
                  ) : bieonSystems.length > 0 ? (
                    bieonSystems.map((sys) => (
                      <div 
                        key={sys._id} 
                        onClick={() => {
                          localStorage.setItem('selectedBieonId', sys._id);
                          window.dispatchEvent(new Event('bieonSelectionChanged'));
                          onClose();
                          if (onNavigate) onNavigate('kendali');
                          else navigate('/kendali');
                        }}
                        className="flex items-center gap-4 p-4 rounded-2xl border-0 bg-slate-50/50 hover:bg-white hover:shadow-[0_8px_30px_rgba(5,155,39,0.12)] transition-all duration-300 group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-sm border-0 group-hover:bg-eco/5 transition-all duration-300 flex items-center justify-center bg-white">
                          <Cpu className="w-6 h-6 text-eco group-hover:text-eco transition-colors duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-bold text-slate-800 tracking-tight group-hover:text-eco transition-colors duration-300">{sys.bieonId === userProfile.bieonId ? 'Master BIEON System' : 'BIEON System'}</div>
                          <div className="text-[12px] font-bold text-eco group-hover:text-eco font-mono mt-0.5 transition-colors duration-300">{sys.bieonId}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${sys.status === 'Active' ? 'bg-eco/10 text-eco' : sys.status === 'Inactive' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'}`}>
                            {sys.status === 'Active' ? t('homeowner_qc.device.status_active') : sys.status === 'Inactive' ? t('homeowner_qc.device.status_inactive') : t('homeowner_qc.device.status_unknown')}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">{t('homeowner_qc.device.hub_count', { count: sys.hubCount || 0 })}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm font-medium border-0 bg-slate-50/50 rounded-xl">
                      {t('profile.no_device')}
                    </div>
                  )}
                </div>
              </div>

              {/* Language Selection Row */}
              <div className="pt-2 space-y-4 px-2 relative">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">{t('profile.language')}</h4>
                
                <div className="relative">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === 'language' ? null : 'language')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-0 transition-all duration-300 ${
                      openDropdown === 'language' 
                      ? 'bg-white shadow-lg shadow-eco/10 ring-4 ring-eco/5'
                      : 'bg-slate-50/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[10px] bg-eco/10 text-eco">
                        {i18n.language === 'id' ? 'ID' : 'EN'}
                      </div>
                      <span className="text-[14px] font-bold text-slate-700">{i18n.language === 'id' ? t('profile.lang_id') : t('profile.lang_en')}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                      openDropdown === 'language' ? 'rotate-180 text-eco' : ''
                    }`} />
                  </button>

                  {openDropdown === 'language' && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-0 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                      <div 
                        onClick={() => { 
                          i18n.changeLanguage('en');
                          localStorage.setItem('bieon_language', 'en');
                          setOpenDropdown(null); 
                        }}
                        className="flex items-center justify-between p-3.5 hover:bg-eco/5 cursor-pointer group transition-colors"
                      >
                        <span className={`text-sm font-bold ${i18n.language === 'en' ? 'text-eco' : 'text-slate-600 group-hover:text-eco'}`}>{t('profile.lang_en')}</span>
                        {i18n.language === 'en' && <Check className="w-4 h-4 text-eco" />}
                      </div>
                      <div 
                        onClick={() => { 
                          i18n.changeLanguage('id');
                          localStorage.setItem('bieon_language', 'id');
                          setOpenDropdown(null); 
                        }}
                        className="flex items-center justify-between p-3.5 hover:bg-eco/5 cursor-pointer group transition-colors border-0"
                      >
                        <span className={`text-sm font-bold ${i18n.language === 'id' ? 'text-eco' : 'text-slate-600 group-hover:text-eco'}`}>{t('profile.lang_id')}</span>
                        {i18n.language === 'id' && <Check className="w-4 h-4 text-eco" />}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1 pb-4">
                  <button 
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        if (token) {
                          await fetch((import.meta.env.VITE_API_URL || '') + '/api/auth/logout', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                        }
                      } catch (e) { console.error('Logout error', e); }
                      
                      localStorage.removeItem('token');
                      localStorage.removeItem('bieon_user_role');
                      localStorage.removeItem('bieon_tech_access');
                      localStorage.removeItem('bieon_tech_access_expiry');
                      
                      if (onNavigate) onNavigate('landing');
                      else navigate('/login');
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 group transition-all p-3 -mx-3 rounded-xl hover:bg-red-50/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <span className="text-[15px] font-bold text-red-500 group-hover:text-red-600 transition-colors">{t('profile.logout')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EDIT PROFILE VIEW */}
          {view === 'edit' && (
            <div className="space-y-8 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 pb-4 pt-6">
              {/* Photo Input (Hidden) */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              {/* Editable Avatar */}
              <div className="flex flex-col items-center pt-2">
                <div 
                  className="relative mb-3 group cursor-pointer" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-eco to-green-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 group-hover:scale-105"></div>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-50 transition-transform duration-300 group-hover:scale-105 relative">
                    <img 
                      src={profilePic} 
                      alt="Avatar" 
                      className="w-full h-full object-cover group-hover:opacity-60 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Camera className="w-8 h-8 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-eco w-7 h-7 rounded-full flex items-center justify-center border-2 border-white text-white shadow-md">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-eco uppercase tracking-wider">{t('profile.change_photo')}</span>
              </div>

              <div className="space-y-4 flex-1 px-1">
                {[
                  { label: t('profile.username'), name: 'username' },
                  { label: t('profile.full_name'), name: 'fullName' },
                  { label: t('profile.phone'), name: 'phoneNo' },
                  { label: t('profile.dob'), name: 'dob' },
                  { label: t('profile.address'), name: 'address' },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col space-y-1.5 group">
                    <label className="text-[12px] font-bold text-slate-500 pl-1">{field.label}</label>
                    <input 
                      type="text"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-[13px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-eco/10 transition-all font-semibold shadow-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSave}
                  className="w-full py-3.5 bg-gradient-to-r from-eco to-green-600 text-white font-bold text-[14px] rounded-2xl hover:opacity-95 shadow-lg shadow-eco/15 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {t('profile.save_changes')}
                </button>
              </div>
            </div>
          )}


        </div>

        {/* Add Bieon Popup */}
        <AddBieonPopup 
          isOpen={showAddBieonPopup} 
          onClose={() => setShowAddBieonPopup(false)} 
          userId={userProfile?._id}
          onSuccess={() => {
            fetchBieonSystems();
          }}
        />
      </div>
    </div>
  );
}
