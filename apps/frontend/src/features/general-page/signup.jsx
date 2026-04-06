import React from 'react';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24V28H35.3C33.6 32.7 29.2 36 24 36C17.4 36 12 30.6 12 24C12 17.4 17.4 12 24 12C27 12 29.8 13.1 31.9 15L37.6 9.3C34 6 29.3 4 24 4C13 4 4 13 4 24C4 35 13 44 24 44C35 44 44 35 44 24C44 22.7 43.9 21.4 43.6 20.1Z" />
    <path fill="#FF3D00" d="M37.6 9.3L31.9 15C29.8 13.1 27 12 24 12C17.4 12 12 17.4 12 24H4C4 16.5 8.1 10 14.1 6.3L20 12L37.6 9.3Z" />
    <path fill="#4CAF50" d="M24 44C29.2 44 33.9 42 37.5 38.8L31.5 33.3C29.4 35 26.8 36 24 36C18.8 36 14.4 32.7 12.7 28L6.8 32.7C10.5 39.4 16.8 44 24 44Z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24V28H35.3C34.7 30 33.3 31.9 31.5 33.3L37.5 38.8C39.6 36.8 44 31.8 44 24C44 22.7 43.9 21.4 43.6 20.1Z" />
  </svg>
);



const Signup = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F2F8F5] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[2rem] shadow-sm p-10 md:p-14 w-full max-w-[460px]">
        <h1 className="text-[22px] md:text-2xl font-bold text-center text-[#111827] mb-10">
          Create your Account
        </h1>

        <form className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">Email</label>
            <input 
              type="email" 
              placeholder="Enter your Email here" 
              className="w-full bg-[#F3F8F5] text-[13px] text-gray-700 placeholder-gray-400 border-none rounded-lg px-4 py-3.5 focus:ring-1 focus:ring-[#1A5F53] outline-none transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#374151]">Password</label>
            <input 
              type="password" 
              placeholder="Enter your Password here" 
              className="w-full bg-[#F3F8F5] text-[13px] text-gray-700 placeholder-gray-400 border-none rounded-lg px-4 py-3.5 focus:ring-1 focus:ring-[#1A5F53] outline-none transition-all"
            />
          </div>

          {/* Create Account Button */}
          <div className="flex justify-center pt-2">
             <button 
               onClick={() => onNavigate && onNavigate('setup')}
               type="button" 
               className="w-full max-w-[220px] bg-[#24625A] hover:bg-[#1A5F53] text-white font-medium rounded-lg py-3 transition-colors duration-300 text-sm"
             >
               Create Account
             </button>
          </div>
        </form>

        {/* OR Divider */}
        <div className="flex items-center justify-center mt-7 mb-4">
          <span className="text-gray-400 text-sm">- or -</span>
        </div>

        {/* Google Button */}
        <div className="flex justify-center">
            <button 
              type="button" 
              className="w-full max-w-[220px] flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition-colors duration-300"
            >
              <GoogleIcon />
              <span className="text-[13px] font-medium text-gray-600">Sign Up with Google</span>
            </button>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-12 text-[11px] md:text-xs text-gray-500">
          Already have a account? <button onClick={() => onNavigate('login')} className="text-[#64C27B] font-medium hover:underline ml-1">Log in</button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
