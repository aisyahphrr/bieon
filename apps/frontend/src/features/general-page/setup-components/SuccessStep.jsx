import React from 'react';

const CheckBadgeIcon = () => (
    <div className="relative flex items-center justify-center w-full min-h-[160px] mb-6">
        <div className="absolute w-40 h-40 bg-emerald-50 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute w-32 h-32 bg-emerald-100/50 rounded-full"></div>
        <div className="absolute top-2 right-[35%] w-3 h-3 bg-[#00B482]/30 rounded-full animate-bounce duration-1000"></div>
        <div className="absolute bottom-6 left-[30%] w-2 h-2 bg-[#7fc78d]/40 rounded-full animate-pulse"></div>
        <div className="absolute top-10 left-[35%] w-4 h-6 bg-[#00B482]/10 rounded-full rotate-45 scale-x-75"></div>
        <div className="absolute bottom-10 right-[32%] w-4 h-6 bg-[#00B482]/10 rounded-full -rotate-12 scale-x-75"></div>
        <div className="relative w-24 h-24 bg-white rounded-full shadow-[0_10px_40px_-10px_rgba(0,180,130,0.3)] border-[6px] border-[#00B482] flex items-center justify-center transform transition-all duration-700 hover:scale-110 group">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#00B482] animate-in zoom-in duration-500 delay-300">
                <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute inset-1 border-2 border-dashed border-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    </div>
);

const SuccessStep = ({
    loading,
    error,
    handleRegister
}) => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4">
            <div className="mb-8">
                <CheckBadgeIcon />
            </div>

            <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight">
                    Semua Sudah Siap! <span className="inline-block animate-bounce">🎉</span>
                </h1>

                <p className="text-[15px] text-gray-500 max-w-[380px] leading-relaxed mx-auto font-medium">
                    Selamat, sistem <span className="text-[#00B482] font-bold">BIEON</span> berhasil terhubung. Yuk, mulai pantau gaya hidup cerdasmu sekarang!
                </p>
            </div>

            <div className="mt-12 w-full max-w-[280px]">
                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-xl bg-[#009b7c] p-4 text-sm font-bold text-white transition-all hover:bg-[#008268] disabled:bg-[#009b7c]/50 active:scale-95 shadow-lg shadow-emerald-200"
                >
                    <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]"></div>
                    <span className="relative flex items-center justify-center gap-2">
                        {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </span>
                </button>
                {error && (
                    <div className="mt-4 text-center text-[13px] font-bold text-red-500 bg-red-50 py-2.5 rounded-xl border border-red-100">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuccessStep;
