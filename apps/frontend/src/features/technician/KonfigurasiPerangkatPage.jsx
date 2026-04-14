import React, { useState } from 'react';
import { Info, Save, X, CheckCircle2 } from 'lucide-react';

export function KonfigurasiPerangkatPage({ clients = [] }) {
  const [formData, setFormData] = useState({
    pelangganId: '',
    idBieon: '',
    hubNode: '',
    namaDevice: '',
    tipeDevice: '',
    lokasiDevice: '',
    ruangan: ''
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear err on type
    if (errorMessage) setErrorMessage('');
  };

  const handleReset = () => {
    setFormData({
      pelangganId: '',
      idBieon: '',
      hubNode: '',
      namaDevice: '',
      tipeDevice: '',
      lokasiDevice: '',
      ruangan: ''
    });
    setErrorMessage('');
  };

  const handleSimpan = (e) => {
    e.preventDefault();
    
    // Basic validation check
    const requiredFields = Object.values(formData);
    if (requiredFields.some(field => field.trim() === '')) {
      setErrorMessage('Mohon lengkapi seluruh kolom yang bertanda bintang (*).');
      return;
    }

    // Success logic
    setShowSuccessModal(true);
  };

  const closeSuccessAndReset = () => {
    setShowSuccessModal(false);
    handleReset();
  };

  return (
    <div className="py-8 w-full max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Konfigurasi Perangkat</h1>
        <p className="text-gray-500 mt-1">Tambah atau konfigurasi device untuk pelanggan</p>
      </div>

      {/* Info Alert Box */}
      <div className="bg-[#FFFDF4] border border-[#FBE6A2] rounded-xl p-5 flex items-start gap-3 mb-8 shadow-sm">
        <Info className="w-6 h-6 text-orange-500 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-gray-800 text-sm">Akses Teknisi</h3>
          <p className="text-gray-600 text-sm mt-1 leading-relaxed">
            Teknisi hanya memiliki akses konfigurasi perangkat tanpa dapat mengontrol perangkat secara langsung. Semua perubahan akan tercatat dalam sistem untuk keperluan audit.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Form Header */}
        <div className="bg-[#009270] p-6 text-white min-h-[90px] flex flex-col justify-center">
          <h2 className="text-xl font-bold">Form Konfigurasi Device</h2>
          <p className="text-emerald-100 text-sm mt-1">Lengkapi semua informasi device yang akan dikonfigurasi</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-lg border border-red-100">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSimpan}>
            {/* Pilih Pelanggan - Full Width */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Pilih Pelanggan <span className="text-red-500">*</span>
              </label>
              <select 
                name="pelangganId"
                value={formData.pelangganId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 bg-white"
              >
                <option value="" disabled>Pilih Pelanggan...</option>
                {clients && clients.map(client => (
                  <option key={client.id} value={client.id}>{client.nama} - {client.id}</option>
                ))}
                {(!clients || clients.length === 0) && (
                  <>
                    <option value="dummy-1">Aisyah Putri - C001</option>
                    <option value="dummy-2">Budi Santoso - C002</option>
                    <option value="dummy-3">Citra Lestari - C003</option>
                  </>
                )}
              </select>
            </div>

            {/* Grid 2 Columns for details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              
              {/* ID BIEON */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  ID BIEON <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="idBieon"
                  value={formData.idBieon}
                  onChange={handleChange}
                  placeholder="Contoh: BIEON-001"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                />
                <p className="text-[11px] text-gray-400 mt-1.5 ml-1">Format: BIEON-XXX</p>
              </div>

              {/* Hub Node */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Hub Node <span className="text-red-500">*</span>
                </label>
                <select 
                  name="hubNode"
                  value={formData.hubNode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 bg-white"
                >
                  <option value="" disabled>Pilih hub node...</option>
                  <option value="hub-utama">Hub Utama (Living Room)</option>
                  <option value="hub-kamar">Hub Kamar Utama</option>
                  <option value="hub-dapur">Hub Dapur</option>
                </select>
              </div>

              {/* Nama Device */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Nama Device <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="namaDevice"
                  value={formData.namaDevice}
                  onChange={handleChange}
                  placeholder="Contoh: AC Kamar Tidur"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                />
              </div>

              {/* Tipe Device */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Tipe Device <span className="text-red-500">*</span>
                </label>
                <select 
                  name="tipeDevice"
                  value={formData.tipeDevice}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 bg-white"
                >
                  <option value="" disabled>Pilih tipe device...</option>
                  <option value="ac">Air Conditioner (AC)</option>
                  <option value="lamp">Smart Lamp</option>
                  <option value="cctv">IP Camera / CCTV</option>
                  <option value="door">Smart Door Lock</option>
                  <option value="sensor">Motion Sensor</option>
                </select>
              </div>

              {/* Lokasi Device */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Lokasi Device <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  name="lokasiDevice"
                  value={formData.lokasiDevice}
                  onChange={handleChange}
                  placeholder="Contoh: Dinding sebelah kanan pintu"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                />
                <p className="text-[11px] text-gray-400 mt-1.5 ml-1">Deskripsi posisi fisik device</p>
              </div>

              {/* Ruangan */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Ruangan <span className="text-red-500">*</span>
                </label>
                <select 
                  name="ruangan"
                  value={formData.ruangan}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700 bg-white"
                >
                  <option value="" disabled>Pilih ruangan...</option>
                  <option value="ruangTamu">Ruang Tamu</option>
                  <option value="kamarUtama">Kamar Utama</option>
                  <option value="dapur">Dapur</option>
                  <option value="garasi">Garasi</option>
                  <option value="taman">Taman</option>
                </select>
              </div>

            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-8"></div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full mt-2">
              <button 
                type="button" 
                onClick={handleReset}
                className="w-full sm:flex-1 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Reset Form
              </button>
              <button 
                type="submit"
                className="w-full sm:flex-1 py-3.5 px-4 bg-[#009270] hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <Save className="w-5 h-5 shrink-0" />
                <span className="truncate">Simpan Konfigurasi</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sukses!</h3>
            <p className="text-gray-600 mb-8">
              Perangkat berhasil disimpan dan telah ditambahkan ke sistem Homeowner yang bersangkutan.
            </p>
            <button
              onClick={closeSuccessAndReset}
              className="w-full py-3 bg-[#009270] hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
            >
              Tutup & Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
