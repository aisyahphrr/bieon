import React, { useState } from 'react';
import { X, Edit2, Plus, Settings, LogOut, ChevronDown, Check, User } from 'lucide-react';

export default function HomeownerProfilePopup({ isOpen, onClose, onNavigate }) {
  const [view, setView] = useState('main'); // 'main', 'edit', 'settings'

  // Form State
  const [formData, setFormData] = useState({
    username: 'asrisarassufi',
    firstName: 'Asri',
    lastName: 'Aisah',
    phoneNo: '+62 812 345 678',
    dob: '17-08-2005',
    address: 'Jl. Dalurung'
  });

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

  const handleSave = () => {
    // In real app, save to backend here
    setView('main');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white rounded-t-[2rem] sm:rounded-[24px] shadow-2xl w-full sm:max-w-[420px] overflow-hidden flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in duration-500 mt-[10vh] sm:mt-0">
        
        {/* Header Section */}
        <div className="px-8 pt-8 pb-4 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
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
                <div className="relative mb-3">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80" 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button 
                    onClick={() => setView('edit')}
                    className="absolute bottom-1 right-1 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl text-gray-400 hover:text-emerald-600 transition-all border-2 border-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{formData.username}</h3>
                <p className="text-sm text-gray-500 font-medium tracking-tight">yourname@gmail.com</p>
              </div>

              {/* Info Details */}
              <div className="space-y-4 px-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-600">Phone No</span>
                  <span className="font-medium text-gray-500">{formData.phoneNo}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-600">Date of Birth</span>
                  <span className="font-medium text-gray-500">{formData.dob}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-600">Address</span>
                  <span className="font-medium text-gray-500">{formData.address}</span>
                </div>
              </div>

              {/* Your Device Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-6 px-2">
                  <h4 className="text-xl font-bold text-gray-800 tracking-tight">Your Device</h4>
                  <button 
                    onClick={() => {
                        onClose();
                        if (onNavigate) onNavigate('kendali');
                    }}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-6 px-2 mb-8">
                  {[
                    { name: 'BIEON 01', id: 'B68ut75770', img: 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&w=100&q=80' },
                    { name: 'BIEON 02', id: 'Bvohw78070', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=100&q=80' }
                  ].map((device, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100">
                        <img src={device.img} alt={device.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-800 tracking-tight">{device.name}</div>
                        <div className="text-[10px] font-medium text-gray-400">Id_BIEON: {device.id}</div>
                      </div>
                      <button className="px-3 py-1 bg-[#489C74]/20 text-[#489C74] text-[10px] font-bold rounded-full hover:bg-[#489C74] hover:text-white transition-all">
                        Detail
                      </button>
                    </div>
                  ))}
                </div>

                <div className="px-2">
                    <button className="w-full py-4 bg-[#A0D4A8] text-gray-800 font-bold text-sm rounded-full hover:bg-[#8EC697] transition-all">
                    See All
                    </button>
                </div>
              </div>

              {/* Settings Action Row */}
              <div className="pt-6 space-y-6 px-2">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">SETTINGS</h4>
                <div className="space-y-6 pb-4">
                  <button 
                    onClick={() => setView('settings')}
                    className="w-full flex items-center gap-4 group transition-all"
                  >
                    <Settings className="w-6 h-6 text-gray-800 group-hover:rotate-45 transition-transform" />
                    <span className="text-lg font-bold text-gray-800">Settings</span>
                  </button>
                  <button 
                    className="w-full flex items-center gap-4 group transition-all"
                  >
                    <LogOut className="w-6 h-6 text-red-500" />
                    <span className="text-lg font-bold text-red-500">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EDIT VIEW */}
          {view === 'edit' && (
            <div className="space-y-8 flex flex-col min-h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-6 flex-1 px-2 pt-4">
                {[
                  { label: 'Username', name: 'username' },
                  { label: 'First Name', name: 'firstName' },
                  { label: 'Last Name', name: 'lastName' },
                  { label: 'Phone No', name: 'phoneNo' },
                  { label: 'Date of Birth', name: 'dob' },
                  { label: 'Address', name: 'address' },
                ].map((field) => (
                  <div key={field.name} className="flex justify-between items-center group">
                    <label className="text-sm font-medium text-gray-600">{field.label}</label>
                    <input 
                      type="text"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="text-right bg-transparent border-none focus:ring-0 focus:outline-none font-medium text-sm text-gray-500 hover:text-gray-900 transition-colors p-0 w-2/3"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-8 pb-4 flex justify-center">
                <button 
                  onClick={handleSave}
                  className="px-12 py-3.5 bg-[#558580] text-white font-bold rounded-xl hover:opacity-90 transition-all active:scale-95"
                >
                  Save Change
                </button>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {view === 'settings' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pt-4 px-2">
              <div className="flex justify-between items-center group cursor-pointer">
                <span className="text-lg font-bold text-gray-800">Theme</span>
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  {settingsData.theme}
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
              
              <div className="flex justify-between items-center group cursor-pointer">
                <span className="text-lg font-bold text-gray-800">Language</span>
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  {settingsData.language}
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
