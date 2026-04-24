import React, { useState, useRef, useEffect } from 'react';
import { X, Edit2, Plus, Settings, LogOut, ChevronDown, Check, User, Camera, Zap } from 'lucide-react';

export default function HomeownerProfilePopup({ isOpen, onClose, onNavigate, userProfile }) {
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

  // Settings State
  const [settingsData, setSettingsData] = useState({
    theme: 'Light',
    language: 'Eng'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('bieon_token');
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
                    onClick={() => {
                        onClose();
                        localStorage.setItem('openBieonInput', 'true');
                        if (onNavigate) onNavigate('kendali');
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#009b7c] hover:text-white transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="px-2 mb-6">
                  {userProfile?.bieonId ? (
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-sm border border-emerald-100 group-hover:border-emerald-300 transition-colors flex items-center justify-center bg-white">
                        <Zap className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold text-slate-800 tracking-tight">ID BIEON Master</div>
                        <div className="text-[12px] font-bold text-emerald-600 font-mono mt-0.5">{userProfile.bieonId}</div>
                      </div>
                      <button className="px-4 py-1.5 bg-emerald-50 text-[#009b7c] text-[11px] font-bold rounded-full hover:bg-[#009b7c] hover:text-white transition-all opacity-80 group-hover:opacity-100">
                        Tersambung
                      </button>
                    </div>
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
                        const token = localStorage.getItem('bieon_token');
                        if (token) {
                          await fetch('/api/auth/logout', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                        }
                      } catch (e) { console.error('Logout error', e); }
                      
                      localStorage.removeItem('bieon_token');
                      localStorage.removeItem('bieon_user_role');
                      localStorage.removeItem('bieon_tech_access');
                      localStorage.removeItem('bieon_tech_access_expiry');
                      
                      if (onNavigate) onNavigate('landing');
                      else window.location.href = '/login';
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
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 pt-2 px-1">
              <div className="flex justify-between items-center group cursor-pointer p-4 bg-slate-50/70 border border-slate-100 rounded-2xl hover:bg-white hover:border-emerald-200 transition-all shadow-sm">
                <span className="text-[15px] font-bold text-slate-800">Theme</span>
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[13px] group-hover:text-[#009b7c]">
                  {settingsData.theme}
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              
              <div className="flex justify-between items-center group cursor-pointer p-4 bg-slate-50/70 border border-slate-100 rounded-2xl hover:bg-white hover:border-emerald-200 transition-all shadow-sm">
                <span className="text-[15px] font-bold text-slate-800">Language</span>
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[13px] group-hover:text-[#009b7c]">
                  {settingsData.language}
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
