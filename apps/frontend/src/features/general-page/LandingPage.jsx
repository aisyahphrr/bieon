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
  Rocket,
  ChevronDown,
  Search,
  X
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
import { useTranslation } from 'react-i18next';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div 
      className={`group bg-white border border-slate-200 rounded-[2rem] overflow-hidden transition-all duration-500 ease-out flex flex-col ${isOpen ? 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-[#009b7c]/30 -translate-y-1' : 'shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1'}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 lg:p-8 flex items-start justify-between text-left focus:outline-none gap-4"
      >
        <span className={`font-bold text-lg md:text-xl transition-colors duration-300 ${isOpen ? 'text-[#009b7c]' : 'text-slate-800 group-hover:text-[#009b7c]'}`}>
          {question}
        </span>
        <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#009b7c] text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-[#009b7c]'}`}>
          <ChevronDown size={20} className="transition-transform duration-500" />
        </div>
      </button>
      <div 
        className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}
      >
        <div className="px-6 lg:px-8 text-slate-500 font-medium leading-relaxed text-base">
          {answer}
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  const currentLang = i18n.language?.startsWith('id') ? 'id' : 'en';

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('bieon_language', lang);
  };

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
            <a href="#home" className="hover:text-emerald-600 transition-colors">{t('landing.nav.home')}</a>
            <a href="#features" className="hover:text-emerald-600 transition-colors">{t('landing.nav.features')}</a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">{t('landing.nav.about')}</a>
            <a href="#contact" className="hover:text-emerald-600 transition-colors">{t('landing.nav.contact')}</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg px-3 py-1 bg-white/50 select-none">
              <span
                onClick={() => handleLanguageChange('id')}
                className={`cursor-pointer transition-colors ${currentLang === 'id' ? 'text-[#009b7c]' : 'hover:text-[#009b7c]'}`}
              >
                ID
              </span>
              <span className="text-slate-300">|</span>
              <span
                onClick={() => handleLanguageChange('en')}
                className={`cursor-pointer transition-colors ${currentLang === 'en' ? 'text-[#009b7c]' : 'hover:text-[#009b7c]'}`}
              >
                EN
              </span>
            </div>
            <button onClick={() => navigate('/login')} className="group relative bg-[#009b7c] hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 border border-white/10 overflow-hidden flex items-center gap-2">
              <span className="relative z-10">{t('landing.nav.login')}</span>
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
                {t('landing.hero.title')}
              </h1>
            </div>

            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-4 mt-8 tracking-wide">
              {t('landing.hero.subtitle')}
            </h2>

            <div className="text-base lg:text-lg text-slate-500 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              <p>{t('landing.hero.desc')}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button onClick={() => navigate('/signup')} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                {t('landing.hero.btn_start')} <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.open('https://wa.me/6282320007800', '_blank')}
                className="w-full sm:w-auto bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200 text-slate-700 px-8 py-3.5 rounded-full font-bold transition-all duration-300 hover:border-emerald-200 hover:shadow-lg shadow-sm flex items-center justify-center gap-2 group"
              >
                <PlayCircle className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" /> {t('landing.hero.btn_demo')}
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
                {t('landing.hero.trusted')}
              </div>
            </div>
          </Reveal>

          {/* Right Floating Dashboard Image */}
          <Reveal animation="animate-slide-in-right" className="flex-1 w-full relative perspective-1000 hidden md:flex items-center justify-center mt-12 lg:mt-24">

            <div className="relative z-20 w-full max-w-2xl rounded-3xl shadow-2xl transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-700 ease-out">
              <img
                src="/11BIEON ECO SENSE.png"
                alt="BIEON Eco Sense Dashboard"
                className="w-full h-auto object-contain rounded-3xl hover:scale-105 transition-transform duration-700"
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
                    {t('landing.problem.title')}
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight max-w-2xl mx-auto lg:mx-0">
                    {t('landing.problem.heading')}
                  </h2>
                </Reveal>

                {/* 2x2 Grid of Points */}
                <Reveal className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                  {/* 1. Tidak Real Time */}
                  <Reveal delay="0.1s" className="flex flex-col items-center text-center sm:items-start sm:text-left gap-4 p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      <img src="/1tidakrealtime.png" alt={t('landing.problem.item1.title')} className="w-full h-full object-cover rounded-xl transition-all" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 mb-1.5">{t('landing.problem.item1.title')}</h4>
                      <p className="text-[14px] text-slate-500 font-medium leading-relaxed">{t('landing.problem.item1.desc')}</p>
                    </div>
                  </Reveal>

                  {/* 2. Sulit Monitoring */}
                  <Reveal delay="0.2s" className="flex flex-col items-center text-center sm:items-start sm:text-left gap-4 p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      <img src="/2sulitmonitoring.png" alt={t('landing.problem.item2.title')} className="w-full h-full object-cover rounded-xl transition-all" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 mb-1.5">{t('landing.problem.item2.title')}</h4>
                      <p className="text-[14px] text-slate-500 font-medium leading-relaxed">{t('landing.problem.item2.desc')}</p>
                    </div>
                  </Reveal>

                  {/* 3. Keputusan Lambat */}
                  <Reveal delay="0.3s" className="flex flex-col items-center text-center sm:items-start sm:text-left gap-4 p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      <img src="/3keputusanlambat.png" alt={t('landing.problem.item3.title')} className="w-full h-full object-cover rounded-xl transition-all" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 mb-1.5">{t('landing.problem.item3.title')}</h4>
                      <p className="text-[14px] text-slate-500 font-medium leading-relaxed">{t('landing.problem.item3.desc')}</p>
                    </div>
                  </Reveal>

                  {/* 4. Potensi Pemborosan */}
                  <Reveal delay="0.4s" className="flex flex-col items-center text-center sm:items-start sm:text-left gap-4 p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      <img src="/4potensipemborosan.png" alt={t('landing.problem.item4.title')} className="w-full h-full object-cover rounded-xl transition-all" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 mb-1.5">{t('landing.problem.item4.title')}</h4>
                      <p className="text-[14px] text-slate-500 font-medium leading-relaxed">{t('landing.problem.item4.desc')}</p>
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
              <p className="text-[#129cc0] font-extrabold text-xs uppercase tracking-[0.3em] mb-3">{t('landing.solution.title')}</p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-12">{t('landing.solution.heading')}</h2>
            </Reveal>

            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
              {/* 1. Energi */}
              <Reveal delay="0.1s" className="flex flex-col items-center group">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/5ENERGY.png" alt={t('landing.solution.energy')} className="w-full h-full object-cover rounded-[2rem] transition-all" />
                </div>
                <span className="text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mt-2">{t('landing.solution.energy')}</span>
              </Reveal>

              {/* 2. Air */}
              <Reveal delay="0.2s" className="flex flex-col items-center group">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/6AIR.png" alt={t('landing.solution.water')} className="w-full h-full object-cover rounded-[2rem] transition-all" />
                </div>
                <span className="text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mt-2">{t('landing.solution.water')}</span>
              </Reveal>

              {/* 3. Lingkungan */}
              <Reveal delay="0.3s" className="flex flex-col items-center group">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/7LINGKUNGAN.png" alt={t('landing.solution.environment')} className="w-full h-full object-cover rounded-[2rem] transition-all" />
                </div>
                <span className="text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mt-2">{t('landing.solution.environment')}</span>
              </Reveal>

              {/* 4. Keamanan */}
              <Reveal delay="0.4s" className="flex flex-col items-center group">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/8PROTEKSI.png" alt={t('landing.solution.security')} className="w-full h-full object-cover rounded-[2rem] transition-all" />
                </div>
                <span className="text-xs md:text-sm font-extrabold text-slate-700 uppercase tracking-wider mt-2">{t('landing.solution.security')}</span>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Features / Bento Grid Platform Section */}
        <section id="features" className="py-10 px-6 md:px-12 lg:px-16 w-full max-w-[1440px] mx-auto">
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <div className="text-[#129cc0] font-extrabold text-xs uppercase tracking-[0.3em] mb-3">
              {t('landing.features.title')}
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6 drop-shadow-sm">
              {t('landing.features.heading')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Feature Card 1 */}
            <Reveal delay="0.1s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/1REAL TIME MONITORING.png" alt={t('landing.features.item1.title')} className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center justify-center gap-2">
                  <Activity size={18} /> {t('landing.features.item1.title')}
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  {t('landing.features.item1.desc')}
                </p>
              </div>
            </Reveal>

            {/* Feature Card 2 */}
            <Reveal delay="0.2s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/2ANALYTICS.png" alt={t('landing.features.item2.title')} className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-amber-500 mb-4 flex items-center justify-center gap-2">
                  <BarChart3 size={18} /> {t('landing.features.item2.title')}
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  {t('landing.features.item2.desc')}
                </p>
              </div>
            </Reveal>

            {/* Feature Card 3 */}
            <Reveal delay="0.3s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-slate-500/20 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/3SMART ALERT.png" alt={t('landing.features.item3.title')} className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-slate-600 mb-4 flex items-center justify-center gap-2">
                  <Bell size={18} /> {t('landing.features.item3.title')}
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  {t('landing.features.item3.desc')}
                </p>
              </div>
            </Reveal>

            {/* Feature Card 4 */}
            <Reveal delay="0.4s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-teal-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/4DASHBOARD.png" alt={t('landing.features.item4.title')} className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-[#009b7c] mb-4 flex items-center justify-center gap-2">
                  <Cloud size={18} /> {t('landing.features.item4.title')}
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  {t('landing.features.item4.desc')}
                </p>
              </div>
            </Reveal>

          </div>
        </section>

        {/* Products Line Section */}
        <section id="products" className="py-10 pb-20 px-6 md:px-12 lg:px-16 w-full max-w-[1440px] mx-auto border-t border-slate-100">
          <div className="text-center mb-12 max-w-2xl mx-auto pt-10">
            <div className="text-[#129cc0] font-extrabold text-xs uppercase tracking-[0.3em] mb-3">
              {t('landing.products.title')}
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
              {t('landing.products.heading')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Product Card 1 */}
            <Reveal delay="0.1s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/8ECO ENERGY.png" alt={t('landing.products.item1.title')} className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center justify-center gap-2">
                  <Zap size={18} /> {t('landing.products.item1.title')}
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  {t('landing.products.item1.desc')}
                </p>
              </div>
            </Reveal>

            {/* Product Card 2 */}
            <Reveal delay="0.2s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-cyan-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/9ECOWATER.png" alt={t('landing.products.item2.title')} className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-cyan-600 mb-4 flex items-center justify-center gap-2">
                  <Droplets size={18} /> {t('landing.products.item2.title')}
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  {t('landing.products.item2.desc')}
                </p>
              </div>
            </Reveal>

            {/* Product Card 3 */}
            <Reveal delay="0.3s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/9ECO ENVIRONMENT.png" alt={t('landing.products.item3.title')} className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center justify-center gap-2">
                  <ThermometerSun size={18} /> {t('landing.products.item3.title')}
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  {t('landing.products.item3.desc')}
                </p>
              </div>
            </Reveal>

            {/* Product Card 4 */}
            <Reveal delay="0.4s" className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-slate-900/10 hover:-translate-y-2 transition-all duration-300">
              <div className="relative overflow-hidden rounded-[2rem] mb-8 border border-slate-100 shadow-inner">
                <div className="absolute inset-0 bg-slate-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                <img src="/10ECO SECURITY.png" alt={t('landing.products.item4.title')} className="w-full h-48 lg:h-56 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              <div className="px-4 pb-6 text-center">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center justify-center gap-2">
                  <ShieldCheck size={18} /> {t('landing.products.item4.title')}
                </h3>
                <p className="text-slate-500 text-[14px] font-medium leading-relaxed">
                  {t('landing.products.item4.desc')}
                </p>
              </div>
            </Reveal>

          </div>
        </section>

        {/* Customer Kami Section */}
        <section className="bg-[#f8fafc] py-16 border-t border-slate-100 relative overflow-hidden">
          <div className="w-full max-w-[1440px] mx-auto px-6 text-center relative z-10">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-12">{t('landing.customers.title')}</h2>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 lg:gap-12 items-start mt-8">
              {/* 1. Home Owner */}
              <Reveal delay="0.1s" className="flex flex-col items-center group text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/13HOME OWNER.png" alt={t('landing.customers.item1.title')} className="w-full h-full object-cover rounded-2xl transition-all" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-3">{t('landing.customers.item1.title')}</h3>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                  {t('landing.customers.item1.desc')}
                </p>
              </Reveal>

              {/* 2. Business */}
              <Reveal delay="0.2s" className="flex flex-col items-center group text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/14BUSINESS.png" alt={t('landing.customers.item2.title')} className="w-full h-full object-cover rounded-2xl transition-all" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-3">{t('landing.customers.item2.title')}</h3>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                  {t('landing.customers.item2.desc')}
                </p>
              </Reveal>

              {/* 3. Industry */}
              <Reveal delay="0.3s" className="flex flex-col items-center group text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/15INDUSTRY.png" alt={t('landing.customers.item3.title')} className="w-full h-full object-cover rounded-2xl transition-all" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-3">{t('landing.customers.item3.title')}</h3>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                  {t('landing.customers.item3.desc')}
                </p>
              </Reveal>

              {/* 4. Government */}
              <Reveal delay="0.4s" className="flex flex-col items-center group text-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                  <img src="/16GOVERNMENT.png" alt={t('landing.customers.item4.title')} className="w-full h-full object-cover rounded-2xl transition-all" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 mb-3">{t('landing.customers.item4.title')}</h3>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                  {t('landing.customers.item4.desc')}
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
                {t('landing.works.title')}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
                {t('landing.works.heading')}
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

        {/* Dampak Section */}
        <section id="dampak" className="py-10 pb-20 px-6 md:px-12 lg:px-16 w-full max-w-[1440px] mx-auto border-t border-slate-100">
          <div className="text-center mb-12 max-w-2xl mx-auto pt-10">
            <div className="text-[#129cc0] font-extrabold text-xs uppercase tracking-[0.3em] mb-3">
              {t('landing.benefit.title')}
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">
              {t('landing.benefit.heading')}
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

        {/* FAQ Section - Search & Bento Layout */}
        <section className="py-20 lg:py-28 bg-[#f8fafc] border-t border-slate-100 relative overflow-hidden">
          {/* Subtle blurred backgrounds for aesthetics */}
          <div className="absolute top-0 left-[-10%] w-[40%] h-[50%] bg-emerald-50 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 right-[-10%] w-[30%] h-[60%] bg-[#129cc0]/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
            <Reveal className="text-center mb-12 max-w-3xl mx-auto">
              <div className="text-[#129cc0] font-extrabold text-xs uppercase tracking-[0.3em] mb-3">
                {t('landing.faq.title')}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight drop-shadow-sm mb-8">
                {t('landing.faq.heading')}
              </h2>

              {/* Dynamic Search Bar */}
              <div className="relative max-w-2xl mx-auto group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-400 group-focus-within:text-[#009b7c] transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder={currentLang === 'id' ? "Cari pertanyaan Anda..." : "Search for questions..."}
                  className="block w-full pl-16 pr-12 py-5 bg-white border-2 border-slate-100 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-lg font-medium"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                />
                {faqSearchQuery && (
                  <button 
                    onClick={() => setFaqSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    <X className="h-5 w-5 bg-slate-100 rounded-full p-0.5" />
                  </button>
                )}
              </div>
            </Reveal>

            {/* Bento Grid */}
            <Reveal delay="0.1s" className="max-w-5xl mx-auto">
              {(() => {
                const items = t('landing.faq.items', { returnObjects: true });
                const faqItems = Array.isArray(items) ? items : [];
                const filteredItems = faqItems.filter(item => 
                  (item.q?.toLowerCase() || '').includes(faqSearchQuery.toLowerCase()) || 
                  (item.a?.toLowerCase() || '').includes(faqSearchQuery.toLowerCase())
                );

                if (filteredItems.length === 0) {
                  return (
                    <div className="text-center py-16 px-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Search size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700 mb-2">{currentLang === 'id' ? 'Pencarian Tidak Ditemukan' : 'No Results Found'}</h3>
                      <p className="text-slate-500">{currentLang === 'id' ? "Kami tidak dapat menemukan jawaban untuk \"" + faqSearchQuery + "\". Coba kata kunci lain." : "We couldn't find an answer for \"" + faqSearchQuery + "\". Try different keywords."}</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {filteredItems.map((item, index) => (
                      <FAQItem key={index} question={item.q} answer={item.a} />
                    ))}
                  </div>
                );
              })()}
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
                  {t('landing.cta.heading')}
                </h2>
                <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                  {t('landing.cta.desc')}
                </p>

                {/* 4 Benefit Icons */}
                <div className="flex flex-wrap gap-6 sm:gap-8 mb-10 max-w-2xl mx-0">
                  <Reveal delay="0.1s" className="flex flex-col items-start group">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                      <img src="/9EFISIENSI MENINGKAT.png" alt={t('landing.cta.benefit1')} className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 text-left leading-tight">{t('landing.cta.benefit1')}</span>
                  </Reveal>
                  <Reveal delay="0.15s" className="flex flex-col items-start group">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                      <img src="/10BIAYA BERKURANG.png" alt={t('landing.cta.benefit2')} className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 text-left leading-tight">{t('landing.cta.benefit2')}</span>
                  </Reveal>
                  <Reveal delay="0.2s" className="flex flex-col items-start group">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                      <img src="/11OPERASIONAL HIJAU.png" alt={t('landing.cta.benefit3')} className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 text-left leading-tight">{t('landing.cta.benefit3')}</span>
                  </Reveal>
                  <Reveal delay="0.25s" className="flex flex-col items-start group">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 overflow-hidden border border-slate-50">
                      <img src="/12KEPUTUSAN CEPAT.png" alt={t('landing.cta.benefit4')} className="w-full h-full object-cover rounded-2xl" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 text-left leading-tight">{t('landing.cta.benefit4')}</span>
                  </Reveal>
                </div>

                {/* CTA Button */}
                <div className="flex flex-col items-center lg:items-start gap-4">
                  <button
                    onClick={() => navigate('/signup')}
                    className="group relative bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-full font-bold text-base transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
                  >
                    <Rocket className="w-6 h-6 self-center relative z-10" />
                    <span className="relative z-10 leading-none">{t('landing.cta.btn')}</span>
                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-500 ease-in-out"></div>
                  </button>
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{t('landing.cta.trust')}</span>
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
              {t('landing.footer.desc')}
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
              <h4 className="font-bold font-sans text-[15px] pb-2 border-b border-white/30 text-white mb-4">{t('landing.footer.quick_link')}</h4>
              <ul className="space-y-3 text-[14px] text-white/80 font-medium">
                <li><a href="#home" className="hover:text-white transition-colors">{t('landing.nav.home')}</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">{t('landing.nav.features')}</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">{t('landing.nav.about')}</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">{t('landing.nav.contact')}</a></li>
              </ul>
            </div>
            <div className="w-full text-center sm:text-left">
              <h4 className="font-bold font-sans text-[15px] pb-2 border-b border-white/30 text-white mb-4">{t('landing.footer.services')}</h4>
              <ul className="space-y-3 text-[14px] text-white/80 font-medium">
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.monitoring')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.control')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.history')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('landing.footer.complaint')}</a></li>
              </ul>
            </div>
            <div className="w-full text-center sm:text-left">
              <h4 className="font-bold font-sans text-[15px] pb-2 border-b border-white/30 text-white mb-4">{t('landing.footer.contact_info')}</h4>
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
          {t('landing.footer.copyright')}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
