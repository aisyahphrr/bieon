import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  PlayCircle,
  Activity,
  ShieldCheck,
  Zap,
  CheckCircle2,
  BarChart3,
  Smartphone,
  Cpu,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ThermometerSun,
  Droplets,
  Wind,
  Users,
  Wrench,
  Boxes
} from 'lucide-react';

const StatCard = ({ icon: Icon, target, label, suffix = "+", colorClass = "text-emerald-500" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, target]);

  return (
    <div
      ref={cardRef}
      className={`flex items-center gap-6 p-6 transition-all duration-1000 transform ${isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
        }`}
    >
      <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0 ${colorClass}`}>
        <Icon size={32} />
      </div>
      <div className="text-left">
        <div className="flex items-baseline gap-1">
          <span className={`text-5xl font-black tracking-tighter ${colorClass}`}>{count}</span>
          <span className="text-4xl font-extrabold text-white/40">{suffix}</span>
        </div>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">{label}</p>
      </div>
    </div>
  );
};

const Reveal = ({ children, className = "", animation = "animate-fade-in-up", delay = "0s", threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      style={{ animationDelay: delay }}
      className={`${className} ${isVisible ? animation : "opacity-0"}`}
    >
      {children}
    </div>
  );
};


const Instagram = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
const Linkedin = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
const Github = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>;
const Youtube = ({ size, className }) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>;

const Logo = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <img src="/logo_bieon.png" alt="BIEON Logo" className="h-8 md:h-10 object-contain drop-shadow-sm" />
  </div>
);

const LandingPage = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#eefcf8] font-sans text-slate-800 selection:bg-[#009b7c] selection:text-white overflow-hidden">

      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.25] animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-teal-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.35] animate-[pulse_8s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[30%] left-[20%] w-[35%] h-[35%] bg-emerald-100 rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.4] animate-[pulse_7s_ease-in-out_infinite]" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Modern SaaS Header */}
      <header className={`fixed w-full flex justify-between items-center px-6 md:px-12 lg:px-16 py-3 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-sm' : 'bg-transparent'}`}>
        <Logo className="hover:scale-105 transition-transform duration-300" />

        <div className="flex items-center gap-8 lg:gap-12">
          <nav className="hidden md:flex gap-8 items-center list-none font-bold text-[13px] tracking-wide text-slate-600">
            <a href="#home" className="hover:text-emerald-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">About</a>
            <a href="#contact" className="hover:text-emerald-600 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg px-3 py-1 bg-white/50">
              <span className="text-[#009b7c]">ID</span>
              <span className="text-slate-300">|</span>
              <span className="hover:text-[#009b7c] cursor-pointer transition-colors">EN</span>
            </div>
            <button onClick={() => onNavigate && onNavigate('login')} className="group relative bg-[#009b7c] hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 border border-white/10 overflow-hidden flex items-center gap-2">
              <span className="relative z-10">Log in</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-500 ease-in-out"></div>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* High-Converting Hero Section */}
        <section id="home" className="pt-24 pb-8 px-6 md:px-12 lg:px-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 w-full max-w-[1440px] mx-auto">

          {/* Left Text Content */}
          <Reveal className="flex-1 w-full max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center justify-center bg-white/80 backdrop-blur-sm border border-emerald-200/60 text-[#009b7c] px-4 py-1.5 rounded-sm text-[15px] font-bold tracking-widest mb-8 shadow-sm">
              BIEON
            </div>

            <h1 className="text-5xl lg:text-[4rem] font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-6">
              Smart Green Living <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009b7c] to-teal-800">Monitoring System</span>
            </h1>

            <p className="text-xl lg:text-2xl text-slate-800 mb-6 font-bold">
              Monitor Today, Sustain Tomorrow.
            </p>

            <div className="text-sm text-slate-500 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium space-y-4">
              <p>
                Di era modern, keberlanjutan bukan lagi pilihan—tetapi kebutuhan. Smart Green Living Monitoring System dari BIEON hadir sebagai solusi untuk membantu Anda memantau, memahami, dan mengelola kehidupan Anda secara real-time melalui teknologi cerdas berbasis data.
              </p>
              <p>
                Dengan sistem monitoring terintegrasi, Anda dapat mengukur berbagai parameter penting seperti energi, kualitas air, lingkungan, dan efisiensi penggunaan sumber daya, sehingga setiap keputusan yang diambil menjadi lebih tepat, efisien, dan berdampak positif bagi lingkungan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button onClick={() => onNavigate && onNavigate('signup')} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                Mulai Sekarang <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full sm:w-auto bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200 text-slate-700 px-8 py-3.5 rounded-full font-bold transition-all duration-300 hover:border-emerald-200 hover:shadow-lg shadow-sm flex items-center justify-center gap-2 group">
                <PlayCircle className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" /> Lihat Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 pt-8 border-t border-slate-200/60 flex items-center gap-6 justify-center lg:justify-start">
              <div className="flex -space-x-4">
                <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                <img src="https://i.pravatar.cc/100?img=5" alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-[10px]">
                  +2k
                </div>
              </div>
              <div className="text-sm font-medium text-slate-500">
                Dipercaya oleh <span className="font-bold text-slate-800">2,000+</span> Homeowners.
              </div>
            </div>
          </Reveal>

          {/* Right Floating Live Mockup */}
          <Reveal animation="animate-slide-in-right" className="flex-1 w-full relative perspective-1000 hidden md:block">
            {/* Primary Dashboard Card */}
            <div className="relative z-20 bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-6 transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-0 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Living Room</h3>
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online & Syncing</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-2 rounded-xl text-slate-500"><Activity size={16} /></div>
                  <div className="bg-slate-100 p-2 rounded-xl text-slate-500"><ShieldCheck size={16} /></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-3 flex flex-col items-center justify-center">
                  <ThermometerSun className="text-orange-500 mb-1" size={20} />
                  <span className="text-[10px] text-slate-500 font-bold">Temp</span>
                  <span className="text-sm font-black text-slate-800">24.5°C</span>
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 flex flex-col items-center justify-center">
                  <Droplets className="text-blue-500 mb-1" size={20} />
                  <span className="text-[10px] text-slate-500 font-bold">Humidity</span>
                  <span className="text-sm font-black text-slate-800">62%</span>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 flex flex-col items-center justify-center">
                  <Wind className="text-emerald-500 mb-1" size={20} />
                  <span className="text-[10px] text-slate-500 font-bold">Air Qty</span>
                  <span className="text-sm font-black text-slate-800">98%</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Power Usage Today</span>
                    <div className="text-2xl font-black text-slate-800 mt-1 flex items-baseline gap-1">12.4 <span className="text-sm text-slate-400 font-bold">kWh</span></div>
                  </div>
                  <div className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">-4.2%</div>
                </div>
                {/* Mock Chart Bars */}
                <div className="flex items-end gap-2 h-16 w-full opacity-70">
                  <div className="w-1/6 bg-slate-200 rounded-t-md h-[40%]"></div>
                  <div className="w-1/6 bg-slate-200 rounded-t-md h-[60%]"></div>
                  <div className="w-1/6 bg-emerald-400 rounded-t-md h-[85%]"></div>
                  <div className="w-1/6 bg-slate-200 rounded-t-md h-[50%]"></div>
                  <div className="w-1/6 bg-slate-200 rounded-t-md h-[30%]"></div>
                  <div className="w-1/6 bg-[#009b7c] rounded-t-md h-[100%] shadow-[0_0_15px_rgba(0,155,124,0.3)]"></div>
                </div>
              </div>
            </div>

            {/* Floating widget 1 */}
            <div className="absolute top-10 -left-12 z-30 bg-white border border-slate-100 rounded-2xl shadow-xl w-48 p-4 flex items-center gap-4 animate-[bounce_4s_infinite]">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">All Devices</p>
                <p className="text-sm font-black text-slate-800">Optimized</p>
              </div>
            </div>

            {/* Floating widget 2 */}
            <div className="absolute bottom-12 -right-8 z-30 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-48 p-4 flex items-center justify-between mx-auto" style={{ animation: 'bounce 5s infinite 1s' }}>
              <div>
                <p className="text-[10px] font-bold text-slate-400">Security Ring</p>
                <p className="text-sm font-black text-white">Armed</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
            </div>

            {/* Background Blob behind mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-emerald-200/40 to-teal-200/40 blur-3xl -z-10 rounded-full mix-blend-multiply"></div>
          </Reveal>
        </section>

        {/* Section Mitra Kami (Our Partners) */}
        <section className="bg-[#f8fafc] py-16 border-y border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[100%] bg-emerald-50 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[100%] bg-teal-50 blur-[100px] rounded-full"></div>
          </div>

          <div className="w-full max-w-[1440px] mx-auto px-6 text-center relative z-10">
            <Reveal>
              <p className="text-[#009b7c] font-extrabold text-xs uppercase tracking-[0.3em] mb-3">Telah Dipercaya Oleh</p>
              <h2 className="text-3xl font-black text-slate-800 mb-12">Mitra Kami</h2>
            </Reveal>

            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
              {/* 1. Matra Kreasi */}
              <Reveal delay="0.1s" className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center p-4 mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="text-slate-400 group-hover:text-[#009b7c] transition-colors" size={32} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Matra Kreasi</span>
              </Reveal>

              {/* 2. SV IPB */}
              <Reveal delay="0.2s" className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center p-3 mb-2 group-hover:scale-110 transition-transform duration-300">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Logo_Institut_Pertanian_Bogor.png" alt="IPB" className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SV IPB</span>
              </Reveal>

              {/* 3. BPJS */}
              <Reveal delay="0.3s" className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center p-3 mb-2 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="text-slate-400 group-hover:text-blue-600 transition-colors" size={32} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">BPJS</span>
              </Reveal>

              {/* 4. BIEON CORE */}
              <Reveal delay="0.4s" className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center p-4 mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Wind className="text-slate-400 group-hover:text-cyan-500 transition-colors" size={32} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">BIEON CORE</span>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Section Statistik Animasi */}
        <section className="bg-[#050B0F] py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5"></div>

          <div className="w-full max-w-[1440px] mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 justify-items-center">
              <StatCard
                icon={Users}
                target={500}
                label="Homeowner"
                colorClass="text-emerald-400"
              />
              <StatCard
                icon={Boxes}
                target={1000}
                label="BIEON Device"
                colorClass="text-cyan-400"
              />
              <StatCard
                icon={Wrench}
                target={50}
                label="Teknisi Handal"
                colorClass="text-teal-400"
              />
            </div>
          </div>
        </section>

        {/* Features / Bento Grid Platform Section */}
        <section id="features" className="py-10 px-6 md:px-12 lg:px-16 w-full max-w-[1440px] mx-auto">
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <div className="inline-flex py-1 px-3 rounded-full bg-[#009b7c]/10 text-[#009b7c] font-bold text-[11px] uppercase tracking-widest mb-4">
              Platform Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6 drop-shadow-sm">
              Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Feature Card 1 */}
            <Reveal delay="0.1s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/feature_1.png" alt="Kontrol Intuitif" className="w-full h-56 lg:h-64 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center justify-center gap-2">
                  <Smartphone size={18} /> Kontrol Intuitif
                </h3>
                <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                  Dirancang dengan antarmuka web yang modern dan mudah digunakan. BIEON memungkinkan Anda memantau seluruh sudut ruang dan mengontrol perangkat secara praktis tanpa konfigurasi yang rumit.
                </p>
              </div>
            </Reveal>

            {/* Feature Card 2 */}
            <Reveal delay="0.2s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/feature_2.png" alt="Monitoring Real-Time" className="w-full h-56 lg:h-64 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-amber-500 mb-4 flex items-center justify-center gap-2">
                  <Zap size={18} /> Monitoring Real-Time
                </h3>
                <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                  Sistem IoT kami bekerja tanpa henti untuk menampilkan data kondisi lingkungan dan status perangkat secara real-time, membantu Anda mengambil keputusan cepat saat terjadi penyimpangan.
                </p>
              </div>
            </Reveal>

            {/* Feature Card 3 */}
            <Reveal delay="0.3s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-slate-500/20 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/feature_3.png" alt="Ekosistem Terintegrasi" className="w-full h-56 lg:h-64 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-slate-600 mb-4 flex items-center justify-center gap-2">
                  <Cpu size={18} /> Ekosistem Terintegrasi
                </h3>
                <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
                  Menghubungkan berbagai perangkat cerdas ke dalam satu dashboard sentral. Menciptakan ekosistem smart living yang efisien, responsif, dan saling terhubung.
                </p>
              </div>
            </Reveal>

          </div>
        </section>

        {/* About Solutions Section */}
        <section id="about" className="py-12 relative bg-slate-900 border-t border-slate-800">
          {/* Dark background styling */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-900/20 to-transparent pointer-events-none"></div>

          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="flex flex-col lg:flex-row gap-16 items-center">

              <Reveal animation="animate-slide-in-right" className="flex-1 w-full text-center lg:text-left">
                <div className="inline-flex py-1 px-3 rounded-full bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-400 font-bold text-[11px] uppercase tracking-widest mb-6">
                  About BIEON
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-6">
                  BIEON System
                </h2>
                <p className="text-slate-400 text-[15px] leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
                  BIEON hadir sebagai solusi Smart Green Living terpadu berbasis web. Kami memadukan pemantauan kualitas lingkungan, efisiensi konsumsi energi, dan kendali perangkat pintar untuk mendukung gaya hidup yang lebih sehat dan berkelanjutan.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-8 flex items-center justify-center lg:justify-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 size={16} />
                  </div>
                  Kolaborasi Industri & Akademisi
                </h3>
                <p className="text-slate-400 text-[15px] leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                  Sistem BIEON lahir dari kolaborasi inovatif antara <strong>PT Matra Kreasi Mandiri</strong> sebagai mitra industri dan project owner, bersama <strong>BPJS</strong> —tim pengembang dari mahasiswa Teknologi Rekayasa Komputer, Sekolah Vokasi IPB University.
                </p>
              </Reveal>

              {/* Futuristic diagram mockup */}
              <Reveal animation="animate-slide-in-right" delay="0.2s" className="flex-1 w-full">
                <div className="relative mx-auto max-w-sm">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>

                  {/* Diagram Container */}
                  <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 relative shadow-2xl">

                    <div className="flex items-center gap-4 bg-slate-900/80 p-4 border border-slate-700/50 rounded-2xl relative mb-4">
                      <Cpu className="text-amber-400" size={28} />
                      <div>
                        <h4 className="text-slate-200 font-bold text-sm">BIEON Hub Node</h4>
                        <p className="text-slate-500 text-xs">Edge Processing Unit</p>
                      </div>
                      <div className="absolute right-4 w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
                    </div>

                    <div className="flex justify-center my-2 text-slate-600">
                      <Activity size={20} className="animate-pulse" />
                    </div>

                    <div className="flex items-center gap-4 bg-[#009b7c]/20 p-4 border border-[#009b7c]/30 rounded-2xl relative mb-4 transform scale-105 shadow-[0_0_30px_rgba(0,155,124,0.15)]">
                      <div className="w-10 h-10 bg-[#009b7c] rounded-xl flex items-center justify-center">
                        <img src="/logo_bieon.png" className="h-4 brightness-0 invert" alt="B" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">BIEON Cloud Platform</h4>
                        <p className="text-emerald-300 text-xs">AI & Data Aggregation</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center px-6 mt-6">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-slate-700 rounded-full border border-slate-600 flex items-center justify-center text-slate-300 mb-2">
                          <Smartphone size={16} />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Mobile</span>
                      </div>
                      <div className="w-full border-t border-dashed border-slate-600 mx-2 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 px-2 text-[10px] text-emerald-400 font-mono rounded">sync</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-slate-700 rounded-full border border-slate-600 flex items-center justify-center text-slate-300 mb-2">
                          <BarChart3 size={16} />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Web App</span>
                      </div>
                    </div>

                  </div>
                </div>
              </Reveal>

            </div>
          </div>
        </section>
      </main>

      {/* Flat Footer */}
      <footer id="contact" className="bg-[#266355] text-white pt-16 pb-6 px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-24 mb-10 max-w-7xl mx-auto">

          <div className="max-w-[400px]">
            <img src="/logo_bieon_footer.png" alt="BIEON Footer" className="max-w-[280px] w-full h-auto object-contain mb-4 md:ml-[32px] drop-shadow-sm" />
            <p className="text-[14px] text-white/90 mb-8 leading-relaxed font-medium md:ml-[32px]">
              Sistem pemantauan gaya hidup cerdas<br className="hidden md:block" />
              berbasis IoT. Mewujudkan lingkungan tempat<br className="hidden md:block" />
              tinggal yang lebih sehat, aman, dan efisien.
            </p>
            <div className="flex gap-4 items-center md:ml-[32px]">
              <a href="#" className="hover:text-emerald-200 transition-colors"><Instagram size={22} /></a>
              <a href="#" className="hover:text-emerald-200 transition-colors"><Linkedin size={22} /></a>
              <a href="#" className="hover:text-emerald-200 transition-colors"><Github size={22} /></a>
              <a href="#" className="hover:text-emerald-200 transition-colors"><Youtube size={22} /></a>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-4 md:mr-8 lg:mr-0">
            <div className="w-full text-center sm:text-left">
              <h4 className="font-bold font-sans text-[15px] pb-2 border-b border-white/30 text-white mb-4">Quick Link</h4>
              <ul className="space-y-3 text-[14px] text-white/80 font-medium">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div className="w-full text-center sm:text-left">
              <h4 className="font-bold font-sans text-[15px] pb-2 border-b border-white/30 text-white mb-4">Layanan Sistem</h4>
              <ul className="space-y-3 text-[14px] text-white/80 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard Monitoring</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kendali Perangkat</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Riwayat & Data Log</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pusat Pengaduan</a></li>
              </ul>
            </div>
            <div className="w-full text-center sm:text-left">
              <h4 className="font-bold font-sans text-[15px] pb-2 border-b border-white/30 text-white mb-4">Contact Info</h4>
              <ul className="space-y-3 text-[14px] text-white/80 font-medium">
                <li className="flex items-start gap-3 justify-center sm:justify-start group">
                  <MapPin size={18} className="shrink-0 mt-0.5 text-white/60 group-hover:text-white transition-colors" />
                  <span className="leading-[1.6]">
                    Jl. Permata Cimanggu No.3 Blok A, RT.008/<br className="hidden xl:block" />
                    RW.007, Kedungbadak, Tanah Sareal,<br className="hidden xl:block" />
                    Kota Bogor, Jawa Barat 16164
                  </span>
                </li>
                <li className="flex items-center gap-3 justify-center sm:justify-start group">
                  <Phone size={18} className="shrink-0 text-white/60 group-hover:text-white transition-colors" />
                  <span>+62 812-121-323</span>
                </li>
                <li className="flex items-center gap-3 justify-center sm:justify-start group">
                  <Mail size={18} className="shrink-0 text-white/60 group-hover:text-white transition-colors" />
                  <span>support.bieon@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center text-[13px] text-white/60 font-medium pt-6 mt-8 border-t border-white/10 max-w-7xl mx-auto">
          © Copyright 2026 | BIEON - Smart Green Living Monitoring System | All right reserved
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
