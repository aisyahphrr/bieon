import React from 'react';
const Leaf = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 14 6h7v7a7 7 0 0 1-7 7H7a7 7 0 0 1 4-14" /><path d="M11 20V12" /></svg>;
const Zap = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
const NavLinkIcon = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
const MapPin = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const Phone = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
const Mail = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;
const Instagram = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
const Linkedin = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
const Github = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>;
const Youtube = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>;

const Logo = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <img src="/logo_bieon.png" alt="BIEON Logo" className="h-8 md:h-10 object-contain" />
  </div>
);

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-4 md:px-8 lg:px-16 py-4 bg-white relative z-50">
        <Logo />
        <div className="flex items-center gap-6 lg:gap-10">
          <nav className="hidden md:flex gap-6 lg:gap-8 items-center list-none font-bold text-sm text-[#1A5F53]">
            <a href="#home" className="hover:text-[#237c6d] transition-colors">Home</a>
            <a href="#features" className="hover:text-[#237c6d] transition-colors">Features</a>
            <a href="#about" className="hover:text-[#237c6d] transition-colors">About</a>
            <a href="#contact" className="hover:text-[#237c6d] transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-4">
            {/* Language Switcher UI */}
            <div className="hidden md:flex items-center bg-[#F4F7EB] p-1 rounded-lg text-xs font-bold text-[#1A5F53] border border-[#E3E8D8]">
              <button className="px-3 py-1.5 rounded-md bg-white shadow-sm transition-all">ID</button>
              <button className="px-3 py-1.5 rounded-md hover:text-[#207565] transition-all opacity-60 hover:opacity-100">EN</button>
            </div>

            <button onClick={() => onNavigate && onNavigate('login')} className="bg-[#1A5F53] hover:bg-[#144f45] text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors">
              Log in
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-[#F4F7EB] py-16 px-4 md:px-8 lg:px-16 flex flex-col md:flex-row items-center gap-12 min-h-[85vh]">
        <div className="flex-1 max-w-xl">
          <div className="inline-block border-2 border-[#1A5F53] px-3 py-1 mb-4 bg-[#F4F7EB]">
            <span className="font-bold text-3xl tracking-widest text-[#1A5F53]">BIEON</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#113a33] leading-tight mb-4">
            Smart Green Living Monitoring System
          </h1>
          <p className="font-bold text-[#113a33] text-base md:text-lg mb-4">
            Monitor Today, Sustain Tomorrow.
          </p>
          <p className="text-gray-700 mb-8 leading-relaxed text-sm md:text-base">
            BIEON mengintegrasikan pemantauan lingkungan, kontrol perangkat otomatis, dan efisiensi listrik ke dalam satu dashboard pintar. Kendalikan kenyamanan dan keamanan ruang hidup Anda dari mana saja, kapan saja.
          </p>
          <button onClick={() => onNavigate && onNavigate('signup')} className="bg-[#1A5F53] hover:bg-[#144f45] text-white px-8 py-3 rounded-md font-medium transition-colors">
            Mulai Sekarang
          </button>
        </div>
        <div className="flex-1 w-full flex justify-center md:justify-end">
          <img src="/hero.png" alt="Smart Home Dashboard on Mobile" className="w-full max-w-[500px] rounded-2xl shadow-xl object-cover transform translate-y-4" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <h2 className="text-3xl font-bold text-[#1A5F53] mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Feature 1 */}
          <div className="flex flex-col group">
            <div className="overflow-hidden mb-6 relative pb-[100%] bg-gray-100 flex-grow-0">
              <img src="/feature_1.png" alt="Kontrol Intuitif" className="absolute top-0 left-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
            </div>
            <h3 className="text-base font-bold text-[#4CAF50] flex items-center gap-2 justify-center mb-4">
              <Leaf size={18} /> Kontrol Intuitif
            </h3>
            <p className="text-gray-500 text-sm md:text-base md:text-left leading-relaxed px-2">
              Dirancang dengan antarmuka web yang modern dan mudah digunakan. BIEON memungkinkan Anda memantau seluruh sudut ruang dan mengontrol perangkat secara praktis tanpa konfigurasi yang rumit.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="flex flex-col group">
            <div className="overflow-hidden mb-6 relative pb-[100%] bg-gray-100 flex-grow-0">
              <img src="/feature_2.png" alt="Monitoring Real-Time" className="absolute top-0 left-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
            </div>
            <h3 className="text-base font-bold text-[#D4AC0D] flex items-center gap-2 justify-center mb-4">
              <Zap size={18} /> Monitoring Real-Time
            </h3>
            <p className="text-gray-500 text-sm md:text-base md:text-left leading-relaxed px-2">
              Sistem IoT kami bekerja tanpa henti untuk menampilkan data kondisi lingkungan dan status perangkat secara real-time, membantu Anda mengambil keputusan cepat saat terjadi penyimpangan.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="flex flex-col group">
            <div className="overflow-hidden mb-6 relative pb-[100%] bg-gray-100 flex-grow-0 border border-gray-200">
              <img src="/feature_3.png" alt="Ekosistem Terintegrasi" className="absolute top-0 left-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
            </div>
            <h3 className="text-base font-bold text-[#607D8B] flex items-center gap-2 justify-center mb-4">
              <NavLinkIcon size={18} /> Ekosistem Terintegrasi
            </h3>
            <p className="text-gray-500 text-sm md:text-base md:text-left leading-relaxed px-2">
              Menghubungkan berbagai perangkat cerdas ke dalam satu dashboard sentral. Menciptakan ekosistem smart living yang efisien, responsif, dan saling terhubung.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 md:px-8 lg:px-16 bg-white min-h-[60vh] flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-[#1A5F53] mb-12">About</h2>
        <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 flex justify-center items-center relative w-full h-[300px]">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#c9e1de] rounded-full filter blur-[80px] w-64 h-64 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
            <div className="z-10 transform scale-[2] sm:scale-[2.5] relative">
              <div className="flex items-center gap-2">
                <img src="/logo_bieon.png" alt="BIEON Logo" className="h-16 object-contain" />
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-6 w-full">
            <div className="border border-[#1A5F53] rounded-md p-6 hover:shadow-md transition-shadow bg-white relative z-10 w-full">
              <h3 className="text-lg font-bold text-[#1A5F53] mb-2">BIEON System</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                BIEON hadir sebagai solusi Smart Green Living terpadu berbasis web. Kami memadukan pemantauan kualitas lingkungan, efisiensi konsumsi energi, dan kendali perangkat pintar untuk mendukung gaya hidup yang lebih sehat dan berkelanjutan.
              </p>
            </div>
            <div className="border border-[#1A5F53] rounded-md p-6 hover:shadow-md transition-shadow bg-white relative z-10 w-full">
              <h3 className="text-lg font-bold text-[#1A5F53] mb-2">Kolaborasi Industri & Akademisi</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Sistem BIEON lahir dari kolaborasi inovatif antara <strong>PT Matra Kreasi Mandiri</strong> sebagai mitra industri dan project owner, bersama <strong>BPJS</strong> —tim pengembang dari mahasiswa Teknologi Rekayasa Komputer, Sekolah Vokasi IPB University yang bertanggung jawab penuh atas perancangan hardware hingga implementasi software.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#24625A] text-white pt-12 pb-6 px-4 md:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-24 mb-10">

          <div className="max-w-[400px]">
            <img src="/logo_bieon_footer.png" alt="BIEON Footer" className="max-w-[280px] w-full h-auto object-contain mb-2 md:max-w-[320px]" />
            <p className="text-[13px] text-green-50 mb-6 leading-[1.6] font-light ml-[68px] md:ml-[52px]">
              Sistem pemantauan gaya hidup cerdas<br />
              berbasis IoT. Mewujudkan lingkungan tempat<br />
              tinggal yang lebih sehat, aman, dan efisien.
            </p>
            <div className="flex gap-4 items-center ml-[68px] md:ml-[52px]">
              <a href="#" className="hover:text-[#a1c0b8] text-white transition-all"><Instagram size={24} /></a>
              <a href="#" className="hover:text-[#a1c0b8] text-white transition-all"><Linkedin size={24} /></a>
              <a href="#" className="hover:text-[#a1c0b8] text-white transition-all"><Github size={24} /></a>
              <a href="#" className="hover:text-[#a1c0b8] text-white transition-all"><Youtube size={24} /></a>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-2">
            <div className="w-full text-center sm:text-left">
              <h4 className="font-bold mb-4 text-sm pb-1 border-b border-white/30 w-full inline-block sm:block">Quick Link</h4>
              <ul className="space-y-2 text-[12px] text-[#a1c0b8]">
                <li><a href="#home" className="hover:text-white transition-colors text-center sm:text-left">Home</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div className="w-full text-center sm:text-left">
              <h4 className="font-bold mb-4 text-sm pb-1 border-b border-white/30 w-full inline-block sm:block">Layanan Sistem</h4>
              <ul className="space-y-2 text-[12px] text-[#a1c0b8]">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard Monitoring</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kendali Perangkat</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Riwayat & Data Log</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pusat Pengaduan</a></li>
              </ul>
            </div>
            <div className="w-full text-center sm:text-left">
              <h4 className="font-bold mb-4 text-sm pb-1 border-b border-white/30 w-full inline-block sm:block">Contact Info</h4>
              <ul className="space-y-3 text-[12px] text-[#a1c0b8]">
                <li className="flex items-start gap-3 justify-center sm:justify-start">
                  <MapPin size={14} className="shrink-0 mt-0.5 text-white" />
                  <span className="leading-[1.6]">
                    Jl. Permata Cimanggu No.3 Blok A, RT.008/<br className="hidden sm:block" />
                    RW.007, Kedungbadak, Tanah Sareal,<br className="hidden sm:block" />
                    Kota Bogor, Jawa Barat 16164
                  </span>
                </li>
                <li className="flex items-center gap-3 justify-center sm:justify-start">
                  <Phone size={14} className="shrink-0 text-white" />
                  <span>+62 812-121-323</span>
                </li>
                <li className="flex items-center gap-3 justify-center sm:justify-start">
                  <Mail size={14} className="shrink-0 text-white" />
                  <span>support.bieon@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center text-[11px] md:text-[12px] text-[#a1c0b8] pt-6 border-t border-[#468A81] opacity-70">
          © Copyright 2026 | BIEON - Smart Green Living Monitoring System | All right reserved
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
