import React, { useState } from 'react';
import { User, Lock, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { auth, googleProvider } from '../../config/firebase';
import { signInWithPopup } from 'firebase/auth';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24V28H35.3C33.6 32.7 29.2 36 24 36C17.4 36 12 30.6 12 24C12 17.4 17.4 12 24 12C27 12 29.8 13.1 31.9 15L37.6 9.3C34 6 29.3 4 24 4C13 4 4 13 4 24C4 35 13 44 24 44C35 44 44 35 44 24C44 22.7 43.9 21.4 43.6 20.1Z" />
    <path fill="#FF3D00" d="M37.6 9.3L31.9 15C29.8 13.1 27 12 24 12C17.4 12 12 17.4 12 24H4C4 16.5 8.1 10 14.1 6.3L20 12L37.6 9.3Z" />
    <path fill="#4CAF50" d="M24 44C29.2 44 33.9 42 37.5 38.8L31.5 33.3C29.4 35 26.8 36 24 36C18.8 36 14.4 32.7 12.7 28L6.8 32.7C10.5 39.4 16.8 44 24 44Z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24V28H35.3C34.7 30 33.3 31.9 31.5 33.3L37.5 38.8C39.6 36.8 44 31.8 44 24C44 22.7 43.9 21.4 43.6 20.1Z" />
  </svg>
);

const Logo = () => (
  <div className="flex justify-center mb-10 items-center">
    <img src="/logo_bieon.png" alt="BIEON Logo" className="h-10 md:h-12 object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300" />
  </div>
);

import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const response = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login Google gagal');
      }

      // Use the same key used across the app
      localStorage.setItem('token', data.token);
      // Backward-compat (if any code still reads this)
      localStorage.setItem('bieon_token', data.token);

      const userRole = data.user?.role;
      if (userRole === 'SuperAdmin') {
        navigate('/admin');
      } else if (userRole === 'Technician') {
        navigate('/teknisi');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Gagal login menggunakan Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email dan Password wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal. Cek kembali email dan password Anda.');
      }

      // Simpan data ke local storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('fullName', data.user.fullName);

      // Arahkan berdasarkan role
      const userRole = data.user?.role;
      if (userRole === 'SuperAdmin') {
        navigate('/admin');
      } else if (userRole === 'Technician') {
        navigate('/teknisi');
      } else {
        // Default (Homeowner)
        navigate('/dashboard');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-[#009b7c] selection:text-white pb-12 pt-8">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-300/40 rounded-full mix-blend-multiply filter blur-[120px] animate-[pulse_8s_ease-in-out_infinite] z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-teal-200/40 rounded-full mix-blend-multiply filter blur-[120px] animate-[pulse_10s_ease-in-out_infinite] z-0" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-[440px]">

        {/* Animated Card Container */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2.5rem] p-8 sm:p-12 transform transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/10">

          <Logo />

          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              Login your Account
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Selamat datang kembali di BIEON Smart Living.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-bold text-slate-700 ml-1">Email / Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#009b7c] transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email or Username here"
                  className="w-full bg-slate-50/50 text-[14px] text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 focus:bg-white focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-bold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#009b7c] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Password here"
                  className="w-full bg-slate-50/50 text-[14px] text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 focus:bg-white focus:border-[#009b7c] focus:ring-4 focus:ring-[#009b7c]/10 outline-none transition-all shadow-sm tracking-widest"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-semibold bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* Login Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group bg-[#009b7c] hover:bg-emerald-600 text-white font-bold rounded-xl py-3.5 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 overflow-hidden flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:hover:translate-y-0"
              >
                <span className="relative z-10">{loading ? 'Memproses...' : 'Login'}</span>
                {!loading ? (
                  <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform border border-emerald-400/30 rounded-full bg-white/10 p-0.5 ml-1" />
                ) : (
                  <Loader2 size={18} className="animate-spin" />
                )}
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-500 ease-in-out"></div>
              </button>
            </div>
          </form>

          {/* OR Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">- or -</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl py-3.5 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 size={20} className="animate-spin text-slate-500" />
            ) : (
              <div className="group-hover:scale-110 transition-transform">
                <GoogleIcon />
              </div>
            )}
            <span className="text-[14px] font-bold text-slate-700">
              {googleLoading ? 'Memproses Google...' : 'Continue with Google'}
            </span>
          </button>

          {/* Footer Links */}
          <div className="flex justify-between items-center mt-10 text-[13px] text-slate-500 font-medium">
            <a href="#" className="hover:text-[#009b7c] transition-colors font-bold">Forgot Password</a>
            <div>
              Don't have an account?
              <button onClick={() => onNavigate && onNavigate('signup')} className="text-[#009b7c] font-bold hover:underline ml-1.5 transition-all">
                Sign Up
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-xs font-bold text-slate-400 hover:text-slate-500 cursor-pointer transition-colors">
          Terms of Service & Privacy Policy BIEON
        </div>
      </div>
    </div>
  );
};

export default Login;
