import React from 'react';
import { Leaf, Zap, Link as NavLinkIcon, MapPin, Phone, Mail, Instagram, Linkedin, Github, Youtube } from 'lucide-react';

const LogoDots = () => (
  <div className="relative w-8 h-8 flex flex-wrap justify-center items-center">
    <div className="w-1.5 h-1.5 rounded-full bg-[#00A1E0] absolute top-1 left-1 md:w-2 md:h-2"></div>
    <div className="w-2 h-2 rounded-full bg-[#00A1E0] absolute top-2 left-3 md:w-2.5 md:h-2.5"></div>
    <div className="w-1.5 h-1.5 rounded-full bg-[#00A1E0] absolute top-4 left-0 md:w-2 md:h-2"></div>
    <div className="w-2.5 h-2.5 rounded-full bg-[#0089C9] absolute top-4 left-4 md:w-3 md:h-3"></div>
    <div className="w-2 h-2 rounded-full bg-[#00A1E0] absolute bottom-1 left-2 md:w-2.5 md:h-2.5"></div>
    <div className="w-1 h-1 rounded-full bg-[#00A1E0] absolute bottom-0 left-5 md:w-1.5 md:h-1.5"></div>
    <div className="w-1.5 h-1.5 rounded-full bg-[#00A1E0] absolute top-3 right-0 md:w-2 md:h-2"></div>
  </div>
);

const Logo = ({ className = "", textClass = "text-[#1F2937]" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <LogoDots />
    <span className={`font-bold text-xl tracking-wide ${textClass}`}>BIEON</span>
  </div>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-4 md:px-8 lg:px-16 py-4 bg-white relative z-50">
        <Logo />
        <div className="flex items-center gap-6 lg:gap-10">
          <nav className="hidden md:flex gap-6 lg:gap-8 items-center list-none font-bold text-sm text-[#1A5F53]">
            <a href="#" className="hover:text-[#237c6d] transition-colors">Home</a>
            <a href="#" className="hover:text-[#237c6d] transition-colors">Features</a>
            <a href="#" className="hover:text-[#237c6d] transition-colors">About</a>
            <a href="#" className="hover:text-[#237c6d] transition-colors">Contact</a>
          </nav>
          <button className="bg-[#1A5F53] hover:bg-[#144f45] text-white px-6 py-2 rounded-md font-medium text-sm transition-colors">
            Log in
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#F4F7EB] py-16 px-4 md:px-8 lg:px-16 flex flex-col md:flex-row items-center gap-12 min-h-[85vh]">
        <div className="flex-1 max-w-xl">
          <div className="inline-block border-2 border-[#1A5F53] px-3 py-1 mb-4 bg-[#F4F7EB]">
            <span className="font-bold text-3xl tracking-widest text-[#1A5F53]">BIEON</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#113a33] leading-tight mb-4">
            Smart Green Living Monitoring System
          </h1>
          <p className="font-bold text-[#113a33] text-base md:text-lg mb-4">
            Wujudkan Gaya Hidup Cerdas, Sehat, dan Hemat Energi.
          </p>
          <p className="text-gray-700 mb-8 leading-relaxed text-sm md:text-base">
            BIEON mengintegrasikan pemantauan lingkungan, kontrol perangkat otomatis, dan efisiensi listrik ke dalam satu dashboard pintar. Kendalikan kenyamanan dan keamanan ruang hidup Anda dari mana saja, kapan saja.
          </p>
          <button className="bg-[#1A5F53] hover:bg-[#144f45] text-white px-8 py-3 rounded-md font-medium transition-colors">
            Mulai Sekarang
          </button>
        </div>
        <div className="flex-1 w-full flex justify-center md:justify-end">
          <img src="/hero.png" alt="Smart Home Dashboard on Mobile" className="w-full max-w-[500px] rounded-2xl shadow-xl object-cover transform translate-y-4" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
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
              Sistem IoT kami bekerja tanpa henti untuk menampilkan data sensor lingkungan dan status perangkat secara instan, membantu Anda mengambil keputusan cepat saat terjadi anomali.
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
              Menghubungkan berbagai sensor cerdas dan smart device ke dalam satu dashboard sentral. Menciptakan ekosistem smart living yang efisien, responsif, dan saling terhubung.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white min-h-[60vh] flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-[#1A5F53] mb-12">About</h2>
        <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 flex justify-center items-center relative w-full h-[300px]">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#c9e1de] rounded-full filter blur-[80px] w-64 h-64 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
            <div className="z-10 transform scale-[3] sm:scale-[4] relative">
              <div className="flex items-center gap-2">
                <LogoDots />
                <span className="font-bold text-xl tracking-widest text-[#1F2937]">BIEON</span>
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
      <footer className="bg-[#1A5F53] text-white py-16 px-4 md:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-12">

          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 flex flex-wrap justify-center items-center">
                <div className="w-2 h-2 rounded-full bg-[#00CFFF] absolute top-1 left-1"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#00A1E0] absolute top-2 left-4"></div>
                <div className="w-2 h-2 rounded-full bg-[#00A1E0] absolute top-5 left-0"></div>
                <div className="w-3 h-3 rounded-full bg-[#0089C9] absolute top-5 left-5"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#4DB8FF] absolute bottom-1 left-2"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#00CFFF] absolute bottom-0 left-6"></div>
                <div className="w-2 h-2 rounded-full bg-[#00A1E0] absolute top-3 right-0"></div>
              </div>
              <div>
                <div className="font-bold text-2xl tracking-wide leading-none">BIEON</div>
                <div className="text-xs text-green-100 font-medium leading-tight mt-1">Smart Green Living<br />Monitoring System</div>
              </div>
            </div>
            <p className="text-xs text-green-100/70 mb-6 leading-relaxed font-light">
              Sistem pemantauan gaya hidup cerdas berbasis IoT. Mewujudkan lingkungan tempat tinggal yang lebih sehat, aman, dan efisien.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#1A5F53] text-white transition-all"><Instagram size={14} /></a>
              <a href="#" className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#1A5F53] text-white transition-all"><Linkedin size={14} /></a>
              <a href="#" className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#1A5F53] text-white transition-all"><Github size={14} /></a>
              <a href="#" className="w-8 h-8 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#1A5F53] text-white transition-all"><Youtube size={14} /></a>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            <div>
              <h4 className="font-bold mb-4 text-sm pb-2 border-b border-white/20 inline-block pr-6">Quick Link</h4>
              <ul className="space-y-3 text-xs text-green-100/80">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm pb-2 border-b border-white/20 inline-block pr-6">Layanan Sistem</h4>
              <ul className="space-y-3 text-xs text-green-100/80">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard Monitoring</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kendali Perangkat</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Riwayat & Data Log</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pusat Pengaduan</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm pb-2 border-b border-white/20 inline-block pr-6">Contact Info</h4>
              <ul className="space-y-4 text-xs text-green-100/80">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Jl. Permata Cimanggis No.3 Blok A, RT.005/RW.007, Karangbodak, Kec. Tanah Sareal, Kota Bogor, Jawa Barat 16164</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="shrink-0" />
                  <span>+62 812-121-323</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="shrink-0" />
                  <span>support.bieon@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-green-100/60 pt-6 border-t border-[#124239]">
          © Copyright 2026 | BIEON - Smart Green Living Monitoring System | All right reserved | Privacy Policy
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
