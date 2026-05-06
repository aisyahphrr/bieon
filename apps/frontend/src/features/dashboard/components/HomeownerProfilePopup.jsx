import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Edit2, Plus, Settings, LogOut, ChevronDown, Check, User, Camera, Zap, Cpu, Loader2 } from 'lucide-react';
import AddBieonPopup from './AddBieonPopup';

export default function HomeownerProfilePopup({ isOpen, onClose, onNavigate, userProfile }) {
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
    theme: 'Light',
    language: 'Eng'
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
      const res = await fetch(`/api/hubs/systems/${userProfile._id}`, {
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
      const response = await fetch('/api/auth/settings', {
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
        alert('Gagal menyimpan pembaruan profil');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan profil');
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
      <div className="relative bg-white/90 backdrop-blur-3xl rounded-[24px] sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,155,124,0.3)] w-full sm:max-w-[420px] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-500 border border-white/50">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-32 bg-emerald-400/20 blur-[50px] rounded-full pointer-events-none"></div>

        {/* Header Section */}
        <div className="px-8 pt-8 pb-4 relative z-10 shrink-0 border-b border-gray-100/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {view === 'main' ? 'Your Profile' : view === 'edit' ? 'Edit Profile' : 'Settings'}
            </h2>
            <button 
              onClick={() => {
                if (view !== 'main') setView('main');
                else onClose();
              }} 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {view !== 'main' && <div className="mt-4 border-b border-gray-100" />}
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar">
          
          {view === 'main' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4 group cursor-pointer" onClick={() => setView('edit')}>
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-[0_8px_30px_rgba(0,155,124,0.2)] bg-slate-50 relative group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={profilePic} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Edit2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setView('edit'); }}
                    className="absolute bottom-1 right-1 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl text-slate-400 hover:text-[#009b7c] transition-all border-[3px] border-white scale-110"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-[22px] font-extrabold text-slate-800 tracking-tight">{formData.username || 'No Username'}</h3>
                <p className="text-[13px] text-slate-500 font-medium tracking-tight mt-0.5">{formData.email}</p>
              </div>

              {/* Info Details Glass Card */}
              <div className="space-y-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50 shadow-sm">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-bold text-slate-500">Phone No</span>
                  <span className="font-bold text-slate-700">{formData.phoneNo}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-bold text-slate-500">Date of Birth</span>
                  <span className="font-bold text-slate-700">{formData.dob}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-bold text-slate-500">Address</span>
                  <span className="font-bold text-slate-700">{formData.address}</span>
                </div>
              </div>

              {/* Your Device Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-5 px-2">
                  <h4 className="text-lg font-extrabold text-slate-800 tracking-tight">Your Device</h4>
                  <button 
                    onClick={() => setShowAddBieonPopup(true)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#009b7c] hover:text-white transition-all shadow-sm"
                    title="Tambah BIEON ID"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="px-2 mb-6 space-y-3">
                  {isLoadingBieon ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
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
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-500 hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-sm border border-emerald-100 group-hover:bg-emerald-50 transition-colors flex items-center justify-center bg-white">
                          <Cpu className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-bold text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">{sys.bieonId === userProfile.bieonId ? 'Master BIEON System' : 'BIEON System'}</div>
                          <div className="text-[12px] font-bold text-emerald-600 font-mono mt-0.5">{sys.bieonId}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${sys.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {sys.status}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">{sys.hubCount || 0} Hubs</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-xl">
                      Belum ada perangkat BIEON terdaftar.
                    </div>
                  )}
                </div>
              </div>

              {/* Settings Action Row */}
              <div className="pt-8 space-y-6 px-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">SETTINGS</h4>
                <div className="space-y-3 pb-4">
                  <button 
                    onClick={() => setView('settings')}
                    className="w-full flex items-center gap-4 group transition-all p-3 -mx-3 rounded-xl hover:bg-slate-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#009b7c] group-hover:text-white transition-all">
                      <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                    </div>
                    <span className="text-[15px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Settings</span>
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        if (token) {
                          await fetch('/api/auth/logout', {
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
                    <span className="text-[15px] font-bold text-red-500 group-hover:text-red-600 transition-colors">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EDIT VIEW */}
          {view === 'edit' && (
            <div className="space-y-8 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
              
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
                  className="relative mb-2 group cursor-pointer" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-[0_4px_20px_rgba(0,155,124,0.15)] bg-slate-50 transition-transform duration-300 group-hover:scale-105">
                    <img 
                      src={profilePic} 
                      alt="Avatar" 
                      className="w-full h-full object-cover group-hover:opacity-60 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-[#009b7c] w-7 h-7 rounded-full flex items-center justify-center border-2 border-white text-white shadow-md">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#009b7c]">Change Photo</span>
              </div>

              <div className="space-y-4 flex-1 px-1">
                {[
                  { label: 'Username', name: 'username' },
                  { label: 'Full Name', name: 'fullName' },
                  { label: 'Phone No', name: 'phoneNo' },
                  { label: 'Date of Birth', name: 'dob' },
                  { label: 'Address', name: 'address' },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col space-y-1.5 group">
                    <label className="text-[12px] font-bold text-slate-500 pl-1">{field.label}</label>
                    <input 
                      type="text"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all font-semibold shadow-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSave}
                  className="w-full py-3.5 bg-[#009b7c] text-white font-bold text-[14px] rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {view === 'settings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pt-2 px-1 pb-6">
              {/* Theme Dropdown */}
              <div className="space-y-2.5">
                <label className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Tampilan Tema</label>
                <div className="relative">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === 'theme' ? null : 'theme')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                      openDropdown === 'theme' 
                      ? 'bg-white border-emerald-500 shadow-lg shadow-emerald-500/10 ring-4 ring-emerald-500/5' 
                      : 'bg-slate-50/50 border-slate-200 hover:border-emerald-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${settingsData.theme === 'Dark' ? 'bg-slate-800 text-white' : 'bg-amber-100 text-amber-600'}`}>
                        {settingsData.theme === 'Dark' ? <Zap className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-amber-500" />}
                      </div>
                      <span className="text-[15px] font-bold text-slate-700">{settingsData.theme === 'Dark' ? 'Gelap (Dark)' : 'Terang (Light)'}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openDropdown === 'theme' ? 'rotate-180 text-emerald-500' : ''}`} />
                  </button>

                  {openDropdown === 'theme' && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                      <div 
                        onClick={() => { setSettingsData({...settingsData, theme: 'Light'}); setOpenDropdown(null); }}
                        className="flex items-center justify-between p-4 hover:bg-emerald-50 cursor-pointer group transition-colors"
                      >
                        <span className={`text-sm font-bold ${settingsData.theme === 'Light' ? 'text-emerald-600' : 'text-slate-600 group-hover:text-emerald-600'}`}>Terang (Light)</span>
                        {settingsData.theme === 'Light' && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div 
                        onClick={() => { setSettingsData({...settingsData, theme: 'Dark'}); setOpenDropdown(null); }}
                        className="flex items-center justify-between p-4 hover:bg-emerald-50 cursor-pointer group transition-colors border-t border-slate-50"
                      >
                        <span className={`text-sm font-bold ${settingsData.theme === 'Dark' ? 'text-emerald-600' : 'text-slate-600 group-hover:text-emerald-600'}`}>Gelap (Dark)</span>
                        {settingsData.theme === 'Dark' && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Language Dropdown */}
              <div className="space-y-2.5">
                <label className="text-[12px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Pilihan Bahasa</label>
                <div className="relative">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === 'language' ? null : 'language')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                      openDropdown === 'language' 
                      ? 'bg-white border-emerald-500 shadow-lg shadow-emerald-500/10 ring-4 ring-emerald-500/5' 
                      : 'bg-slate-50/50 border-slate-200 hover:border-emerald-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                        {settingsData.language === 'Indo' ? 'ID' : 'EN'}
                      </div>
                      <span className="text-[15px] font-bold text-slate-700">{settingsData.language === 'Indo' ? 'Indonesia (Indonesian)' : 'Inggris (English)'}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openDropdown === 'language' ? 'rotate-180 text-emerald-500' : ''}`} />
                  </button>

                  {openDropdown === 'language' && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                      <div 
                        onClick={() => { setSettingsData({...settingsData, language: 'Eng'}); setOpenDropdown(null); }}
                        className="flex items-center justify-between p-4 hover:bg-emerald-50 cursor-pointer group transition-colors"
                      >
                        <span className={`text-sm font-bold ${settingsData.language === 'Eng' ? 'text-emerald-600' : 'text-slate-600 group-hover:text-emerald-600'}`}>Inggris (English)</span>
                        {settingsData.language === 'Eng' && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div 
                        onClick={() => { setSettingsData({...settingsData, language: 'Indo'}); setOpenDropdown(null); }}
                        className="flex items-center justify-between p-4 hover:bg-emerald-50 cursor-pointer group transition-colors border-t border-slate-50"
                      >
                        <span className={`text-sm font-bold ${settingsData.language === 'Indo' ? 'text-emerald-600' : 'text-slate-600 group-hover:text-emerald-600'}`}>Indonesia (Indonesian)</span>
                        {settingsData.language === 'Indo' && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <Settings className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-[12px] text-emerald-800 font-bold leading-relaxed">
                    Perubahan akan diterapkan secara otomatis. Kami akan menyimpan preferensi Anda ke cloud segera.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
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
  );
}
