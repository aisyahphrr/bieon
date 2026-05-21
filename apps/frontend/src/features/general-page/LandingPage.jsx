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
  Boxes,
  Bell,
  Cloud,
  Rocket
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

import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
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
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#059b27] rounded-full filter blur-[150px] opacity-[0.15] animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#129cc0] rounded-full filter blur-[150px] opacity-[0.2] animate-[pulse_8s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>
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
            <button onClick={() => navigate('/login')} className="group relative bg-[#009b7c] hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 border border-white/10 overflow-hidden flex items-center gap-2">
              <span className="relative z-10">Log in</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-500 ease-in-out"></div>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* High-Converting Hero Section */}
        <section id="home" className="min-h-screen pt-24 pb-8 px-6 md:px-12 lg:px-16 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 w-full max-w-[1440px] mx-auto">

          {/* Left Text Content */}
          <Reveal className="flex-1 w-full max-w-2xl text-center lg:text-left">
            <div className="mb-8">
              <div className="mb-4 flex justify-center lg:justify-start">
                <img src="/ecosense.png" alt="EcoSense" className="h-16 lg:h-24 w-auto object-contain" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-[1.2]">
                Smart Living <br className="hidden lg:block" />
                Monitoring System
              </h1>
            </div>

            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-4 mt-8 tracking-wide">
              Monitor Today, Sustain Tomorrow.
            </h2>

            <div className="text-base lg:text-lg text-slate-500 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              <p>Real-time monitoring untuk energi, air, udara, dan lingkungan.</p>
              <p>Data akurat, keputusan lebih cepat, hidup lebih berkelanjutan.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button onClick={() => navigate('/signup')} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                Mulai Sekarang <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.open('https://wa.me/6282320007800', '_blank')}
                className="w-full sm:w-auto bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200 text-slate-700 px-8 py-3.5 rounded-full font-bold transition-all duration-300 hover:border-emerald-200 hover:shadow-lg shadow-sm flex items-center justify-center gap-2 group"
              >
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

          {/* Right Floating Dashboard Image */}
          <Reveal animation="animate-slide-in-right" className="flex-1 w-full relative perspective-1000 hidden md:flex items-center justify-center mt-12 lg:mt-24">

            <div className="relative z-20 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-700 ease-out">
              <img
                src="/11BIEON ECO SENSE.png"
                alt="BIEON Eco Sense Dashboard"
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Background Blob behind mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#059b27]/20 to-[#129cc0]/20 blur-3xl -z-10 rounded-full"></div>
          </Reveal>
        </section>

        {/* Section Problem */}
        <section className="bg-[#f8fafc] py-16 lg:py-24 border-y border-slate-100 relative overflow-hidden min-h-screen lg:min-h-[90vh] flex items-center">
          <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[100%] bg-emerald-50 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[100%] bg-teal-50 blur-[100px] rounded-full"></div>
          </div>

          <div className="w-full max-w-[1440px] mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Left Content: Title + Grid Points */}
              <div className="flex-1 w-full">

                {/* Title Section moved inside Left Content */}
                <Reveal className="w-full text-center lg:text-left mb-10">
                  <div className="text-[#129cc0] font-extrabold text-xs uppercase tracking-[0.3em] mb-3">
                    PROBLEM
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight max-w-2xl mx-auto lg:mx-0">
                    Masih Mengandalkan <br className="hidden sm:inline" />
                    Data Manual?
                  </h2>
                </Reveal>

                {/* 2x2 Grid of Points */}
                <Reveal className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                  {/* 1. Tidak Real Time */}
                  <Reveal delay="0.1s" className="flex flex-col items-center text-center sm:items-start sm:text-left gap-4 p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      <img src="/1tidakrealtime.png" alt="Tidak Real Time" className="w-full h-full object-cover rounded-xl transition-all" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 mb-1.5">Tidak Real Time</h4>
                      <p className="text-[14px] text-slate-500 font-medium leading-relaxed">Data seringkali terlambat dan tidak akurat.</p>
                    </div>
                  </Reveal>

                  {/* 2. Sulit Monitoring */}
                  <Reveal delay="0.2s" className="flex flex-col items-center text-center sm:items-start sm:text-left gap-4 p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      <img src="/2sulitmonitoring.png" alt="Sulit Monitoring" className="w-full h-full object-cover rounded-xl transition-all" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 mb-1.5">Sulit Monitoring</h4>
                      <p className="text-[14px] text-slate-500 font-medium leading-relaxed">Pemantauan manual memakan waktu.</p>
                    </div>
                  </Reveal>

                  {/* 3. Keputusan Lambat */}
                  <Reveal delay="0.3s" className="flex flex-col items-center text-center sm:items-start sm:text-left gap-4 p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      <img src="/3keputusanlambat.png" alt="Keputusan Lambat" className="w-full h-full object-cover rounded-xl transition-all" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 mb-1.5">Keputusan Lambat</h4>
                      <p className="text-[14px] text-slate-500 font-medium leading-relaxed">Keterlambatan aksi saat kondisi kritis.</p>
                    </div>
                  </Reveal>

                  {/* 4. Potensi Pemborosan */}
                  <Reveal delay="0.4s" className="flex flex-col items-center text-center sm:items-start sm:text-left gap-4 p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      <img src="/4potensipemborosan.png" alt="Potensi Pemborosan" className="w-full h-full object-cover rounded-xl transition-all" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 mb-1.5">Potensi Pemborosan</h4>
                      <p className="text-[14px] text-slate-500 font-medium leading-relaxed">Kerugian biaya karena inefisiensi.</p>
                    </div>
                  </Reveal>
                </Reveal>
              </div>

              {/* Right Content: The Stressed Man Image */}
              <Reveal animation="animate-slide-in-right" className="flex-1 w-full relative perspective-1000 mt-12 lg:mt-0">
                <div className="relative z-20 rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:-translate-y-2 transition-all duration-700 ease-out">
                  <img
                    src="/problem_illustration.png"
                    alt="Mengandalkan Data Manual"
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-amber-500/20 to-red-500/10 blur-3xl -z-10 rounded-full"></div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Section Solution */}
        <section className="bg-white py-16 border-b border-slate-100 relative overflow-hidden">
          <div className="w-full max-w-[1440px] mx-auto px-6 text-center relative z-10">
            <Reveal>
              <p className="text-[#129cc0] font-extrabold text-xs uppercase tracking-[0.3em] mb-3">SOLUTION</p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-12">ONE PLATFORM. TOTAL MONITORING</h2>
            </Reveal>

            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
              {/* 1. Energi */}
              <Reveal delay="0.1s" className="flex flex-col items-center group">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/5ENERGY.png" alt="Energi" className="w-full h-full object-cover rounded-[2rem] transition-all" />
                </div>
                <span className="text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mt-2">Energi</span>
              </Reveal>

              {/* 2. Air */}
              <Reveal delay="0.2s" className="flex flex-col items-center group">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/6AIR.png" alt="Air" className="w-full h-full object-cover rounded-[2rem] transition-all" />
                </div>
                <span className="text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mt-2">Air</span>
              </Reveal>

              {/* 3. Lingkungan */}
              <Reveal delay="0.3s" className="flex flex-col items-center group">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/7LINGKUNGAN.png" alt="Lingkungan" className="w-full h-full object-cover rounded-[2rem] transition-all" />
                </div>
                <span className="text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mt-2">Lingkungan</span>
              </Reveal>

              {/* 4. Keamanan */}
              <Reveal delay="0.4s" className="flex flex-col items-center group">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/8PROTEKSI.png" alt="Keamanan" className="w-full h-full object-cover rounded-[2rem] transition-all" />
                </div>
                <span className="text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mt-2">Keamanan</span>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Features / Bento Grid Platform Section */}
        <section id="features" className="py-10 px-6 md:px-12 lg:px-16 w-full max-w-[1440px] mx-auto">
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <div className="text-[#129cc0] font-extrabold text-xs uppercase tracking-[0.3em] mb-3">
              Platform Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6 drop-shadow-sm">
              FITUR
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Feature Card 1 */}
            <Reveal delay="0.1s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/1REAL TIME MONITORING.png" alt="Real Time Monitoring" className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center justify-center gap-2">
                  <Activity size={18} /> Real Time Monitoring
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  Pengguna dapat memantau seluruh parameter secara langsung dan real-time untuk pengambilan keputusan yang lebih cepat dan akurat.
                </p>
              </div>
            </Reveal>

            {/* Feature Card 2 */}
            <Reveal delay="0.2s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/2ANALYTICS.png" alt="Analytics" className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-amber-500 mb-4 flex items-center justify-center gap-2">
                  <BarChart3 size={18} /> Analytics
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  Data diolah menjadi insight dan visualisasi yang membantu analisis tren, efisiensi, dan kondisi sistem secara lebih mendalam.
                </p>
              </div>
            </Reveal>

            {/* Feature Card 3 */}
            <Reveal delay="0.3s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-slate-500/20 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/3SMART ALERT.png" alt="Smart Alert" className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-slate-600 mb-4 flex items-center justify-center gap-2">
                  <Bell size={18} /> Smart Alert
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  Sistem memberikan notifikasi otomatis ketika terjadi kondisi abnormal atau parameter melewati batas tertentu.
                </p>
              </div>
            </Reveal>

            {/* Feature Card 4 */}
            <Reveal delay="0.4s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-teal-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/4DASHBOARD.png" alt="Cloud Dashboard" className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-[#009b7c] mb-4 flex items-center justify-center gap-2">
                  <Cloud size={18} /> Cloud Dashboard
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  Seluruh data dapat diakses kapan saja dan di mana saja melalui dashboard berbasis cloud yang terintegrasi.
                </p>
              </div>
            </Reveal>

          </div>
        </section>

        {/* Dampak Section */}
        <section id="dampak" className="py-10 pb-20 px-6 md:px-12 lg:px-16 w-full max-w-[1440px] mx-auto border-t border-slate-100">
          <div className="text-center mb-12 max-w-2xl mx-auto pt-10">
            <div className="text-[#129cc0] font-extrabold text-xs uppercase tracking-[0.3em] mb-3">
              Platform Benefit
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
              DAMPAK
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Impact Card 1 */}
            <Reveal delay="0.1s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 shadow-inner h-full">
                <div className="absolute inset-0 bg-slate-100/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/5 30BIAYA.png" alt="- 30% Biaya" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
            </Reveal>

            {/* Impact Card 2 */}
            <Reveal delay="0.2s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 shadow-inner h-full">
                <div className="absolute inset-0 bg-slate-100/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/6EFISIENSI.png" alt="+ 50% Efisiensi" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
            </Reveal>

            {/* Impact Card 3 */}
            <Reveal delay="0.3s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 shadow-inner h-full">
                <div className="absolute inset-0 bg-slate-100/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/7SUSTAINBILITY.png" alt="Sustainability Ready" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
            </Reveal>

          </div>
        </section>

        {/* Products Line Section */}
        <section id="products" className="py-10 pb-20 px-6 md:px-12 lg:px-16 w-full max-w-[1440px] mx-auto border-t border-slate-100">
          <div className="text-center mb-12 max-w-2xl mx-auto pt-10">
            <div className="text-[#129cc0] font-extrabold text-xs uppercase tracking-[0.3em] mb-3">
              Our Products
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
              Products Line
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Product Card 1 */}
            <Reveal delay="0.1s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/8ECO ENERGY.png" alt="EcoSense Energy" className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center justify-center gap-2">
                  <Zap size={18} /> EcoSense Energy
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  Sistem monitoring energi cerdas untuk memantau konsumsi listrik, efisiensi penggunaan energi, dan performa sistem secara real-time.
                </p>
              </div>
            </Reveal>

            {/* Product Card 2 */}
            <Reveal delay="0.2s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-cyan-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/9ECOWATER.png" alt="EcoSense Water" className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-cyan-600 mb-4 flex items-center justify-center gap-2">
                  <Droplets size={18} /> EcoSense Water
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  Solusi monitoring kualitas dan penggunaan air untuk membantu menjaga kesehatan, keamanan, efisiensi dan keberlanjutan sumber daya air.
                </p>
              </div>
            </Reveal>

            {/* Product Card 3 */}
            <Reveal delay="0.3s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/9ECO ENVIRONMENT.png" alt="EcoSense Environment" className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center justify-center gap-2">
                  <ThermometerSun size={18} /> EcoSense Environment
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  Platform monitoring lingkungan yang mengukur berbagai parameter seperti kualitas udara, suhu, kelembaban, dan kondisi lingkungan lainnya secara terintegrasi.
                </p>
              </div>
            </Reveal>

            {/* Product Card 4 */}
            <Reveal delay="0.4s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-slate-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-slate-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/10ECO SECURITY.png" alt="EcoSense Security" className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center justify-center gap-2">
                  <ShieldCheck size={18} /> EcoSense Security
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  Sistem monitoring dan notifikasi cerdas untuk meningkatkan keamanan area, aset, dan infrastruktur melalui pemantauan real-time dan smart alert system.
                </p>
              </div>
            </Reveal>

          </div>
        </section>


        {/* Customer Kami Section */}
        <section className="bg-[#f8fafc] py-16 border-t border-slate-100 relative overflow-hidden">
          <div className="w-full max-w-[1440px] mx-auto px-6 text-center relative z-10">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-12">Customer Kami</h2>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 lg:gap-12 items-start mt-8">
              {/* 1. Home Owner */}
              <Reveal delay="0.1s" className="flex flex-col items-center group text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/13HOME OWNER.png" alt="Home Owner" className="w-full h-full object-cover rounded-2xl transition-all" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-3">Home Owner</h3>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                  Solusi monitoring cerdas untuk membantu rumah lebih efisien, nyaman, dan berkelanjutan melalui pemantauan energi, air, dan lingkungan secara real-time.
                </p>
              </Reveal>

              {/* 2. Business */}
              <Reveal delay="0.2s" className="flex flex-col items-center group text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/14BUSINESS.png" alt="Business" className="w-full h-full object-cover rounded-2xl transition-all" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-3">Business</h3>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                  Membantu bisnis memantau operasional, efisiensi sumber daya, dan kualitas lingkungan untuk mendukung produktivitas dan pengambilan keputusan berbasis data.
                </p>
              </Reveal>

              {/* 3. Industry */}
              <Reveal delay="0.3s" className="flex flex-col items-center group text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/15INDUSTRY.png" alt="Industry" className="w-full h-full object-cover rounded-2xl transition-all" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-3">Industry</h3>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                  Sistem monitoring terintegrasi untuk industri dalam meningkatkan efisiensi, kontrol operasional, keamanan, dan sustainability secara lebih optimal.
                </p>
              </Reveal>

              {/* 4. Government */}
              <Reveal delay="0.4s" className="flex flex-col items-center group text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/16GOVERNMENT.png" alt="Government" className="w-full h-full object-cover rounded-2xl transition-all" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-3">Government</h3>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                  Mendukung pemerintah dalam pengelolaan data lingkungan, infrastruktur, dan utilitas publik melalui sistem monitoring cerdas yang terhubung dan real-time.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white py-20 lg:py-28 border-t border-slate-100">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
            <Reveal className="text-center mb-12 max-w-2xl mx-auto">
              <div className="text-[#129cc0] font-extrabold text-xs uppercase tracking-[0.3em] mb-3">
                HOW IT WORKS
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
                Bagaimana Sistem Ini Bekerja
              </h2>
            </Reveal>

            <Reveal>
              <img
                src="/14BIEON.png"
                alt="Alur Kerja Sistem EcoSense: Sensor → Cloud → Dashboard → Insight"
                className="w-full max-w-5xl mx-auto h-auto object-contain"
              />
            </Reveal>
          </div>
        </section>

        {/* CTA Section - Mulai Transformasi */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-[#f0fdf9] via-white to-[#e0f7f1]">
          {/* Subtle ambient blurs */}
          <div className="absolute top-[-15%] right-[-10%] w-[45%] h-[70%] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] bg-teal-50/50 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

              {/* Left Content */}
              <Reveal className="flex-1 w-full text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
                  MULAI<br />
                  TRANSFORMASI<br />
                  SISTEM ANDA<br />
                  SAAT INI!
                </h2>
                <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                  Tingkatkan efisiensi, kurangi biaya,<br className="hidden sm:inline" />
                  dan ciptakan masa depan yang lebih cerdas<br className="hidden sm:inline" />
                  dengan EcoSense.
                </p>

                {/* 4 Benefit Icons */}
                <div className="flex flex-wrap gap-6 sm:gap-8 mb-10 max-w-lg mx-0">
                  <Reveal delay="0.1s" className="flex flex-col items-start group">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                      <img src="/9EFISIENSI MENINGKAT.png" alt="Efisiensi Meningkat" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 text-left leading-tight">Efisiensi<br />Meningkat</span>
                  </Reveal>
                  <Reveal delay="0.15s" className="flex flex-col items-start group">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                      <img src="/10BIAYA BERKURANG.png" alt="Biaya Berkurang" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 text-left leading-tight">Biaya<br />Berkurang</span>
                  </Reveal>
                  <Reveal delay="0.2s" className="flex flex-col items-start group">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                      <img src="/11OPERASIONAL HIJAU.png" alt="Operasional Lebih Hijau" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 text-left leading-tight">Operasional<br />Lebih Hijau</span>
                  </Reveal>
                  <Reveal delay="0.25s" className="flex flex-col items-start group">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                      <img src="/12KEPUTUSAN CEPAT.png" alt="Keputusan Lebih Cepat" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 text-left leading-tight">Keputusan<br />Lebih Cepat</span>
                  </Reveal>
                </div>

                {/* CTA Button */}
                <div className="flex flex-col items-center lg:items-start gap-4">
                  <button
                    onClick={() => navigate('/signup')}
                    className="group relative bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-full font-bold text-base transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
                  >
                    <Rocket className="w-6 h-6 self-center relative z-10" />
                    <span className="relative z-10 leading-none">MULAI SEKARANG</span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-500 ease-in-out"></div>
                  </button>
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Aman, Terpercaya, dan Terintegrasi</span>
                  </div>
                </div>
              </Reveal>

              {/* Right Content - Image */}
              <Reveal animation="animate-slide-in-right" className="flex-1 w-full flex justify-center lg:justify-end">
                <div className="relative max-w-xl lg:max-w-2xl w-full">
                  <div className="absolute inset-0 bg-emerald-400/10 rounded-full blur-[80px] scale-90 pointer-events-none"></div>
                  <img
                    src="/12BIEON.png"
                    alt="EcoSense Dashboard & Devices"
                    className="relative w-full h-auto object-cover rounded-[2rem] drop-shadow-2xl overflow-hidden"
                  />
                </div>
              </Reveal>

            </div>
          </div>
        </section>
      </main>

      {/* Flat Footer */}
      <footer id="contact" className="relative text-white pt-16 pb-6 px-6 md:px-12 lg:px-20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/13BIEON.png')" }}>
        {/* Brand Overlay to preserve design color and readability, reduced opacity to make background image visible */}
        <div className="absolute inset-0 bg-[#266355]/25 pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-24 mb-10 max-w-7xl mx-auto relative z-10">

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
        <div className="text-center text-[13px] text-white/60 font-medium pt-6 mt-8 border-t border-white/10 max-w-7xl mx-auto relative z-10">
          © Copyright 2026 | BIEON - Smart Green Living Monitoring System | All right reserved
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
