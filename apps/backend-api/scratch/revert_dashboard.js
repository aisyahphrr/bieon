const fs = require('fs');
const path = 'c:\\Users\\Lenovo\\BIEON_BPJS\\bieon\\apps\\frontend\\src\\features\\dashboard\\HomeownerDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const polishedPreviousVersion = `function WarningLimitModal({ isOpen, onClose, limit, setLimit, deposit, setDeposit }) {
  const [inputLimit, setInputLimit] = useState(limit.toString());
  const [inputDeposit, setInputDeposit] = useState(deposit.toString());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setInputLimit(limit.toString());
    setInputDeposit(deposit.toString());
  }, [limit, deposit, isOpen]);

  if (!isOpen) return null;

  const totalTerpakai = window.totalCostToday || 0;
  const isKritis = deposit <= limit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedLimit = parseInt(inputLimit.replace(/[^0-9]/g, ''), 10);
    const parsedDeposit = parseInt(inputDeposit.replace(/[^0-9]/g, ''), 10);

    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\` 
      };

      if (!isNaN(parsedLimit) && parsedLimit !== limit) {
        const resThr = await fetch('/api/admin/tariffs/threshold', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ threshold: parsedLimit })
        });
        if (resThr.ok) setLimit(parsedLimit);
      }

      if (!isNaN(parsedDeposit) && parsedDeposit > deposit) {
        const diff = parsedDeposit - deposit;
        const resTop = await fetch('/api/admin/tariffs/topup', {
          method: 'POST',
          headers,
          body: JSON.stringify({ amount: diff })
        });
        if (resTop.ok) {
          const resData = await resTop.json();
          setDeposit(resData.tokenBalance);
        }
      } else if (!isNaN(parsedDeposit) && parsedDeposit !== deposit) {
          setDeposit(parsedDeposit);
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Gagal update pengaturan token:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        {/* Header with Gradient - User's Favorite */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 sm:px-8 py-6 text-white relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <Zap className="w-7 h-7 text-white fill-white/20" />
            </div>
            <div className="pr-8">
              <h2 className="text-xl font-bold leading-tight">Pengaturan Token Listrik</h2>
              <p className="text-amber-100 text-xs mt-1 font-medium opacity-90">Monitoring saldo & batas peringatan kritis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
          {/* Status Section */}
          <div className={\`border rounded-2xl p-5 flex flex-col gap-3 mb-8 transition-colors \${isKritis ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}\`}>
            <div className="flex justify-between items-center text-[13px] font-semibold text-gray-600">
              <span>Saldo Saat Ini:</span>
              <span className="font-bold text-gray-900">Rp {deposit.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-[13px] font-semibold text-gray-600">
              <span>Konsumsi Hari Ini:</span>
              <span className="font-bold text-gray-900">Rp {totalTerpakai.toLocaleString('id-ID')}</span>
            </div>
            <div className={\`flex justify-between items-center text-sm font-bold mt-1 pt-3 border-t \${isKritis ? 'border-red-200' : 'border-emerald-200'}\`}>
              <span className={isKritis ? 'text-red-800' : 'text-emerald-800'}>Estimasi Sisa Saldo:</span>
              <span className={\`text-xl font-black \${isKritis ? 'text-red-600' : 'text-emerald-600'}\`}>Rp {Math.max(0, deposit).toLocaleString('id-ID')}</span>
            </div>
            <div className={\`flex justify-between items-center text-[10px] mt-2 p-2 rounded-xl font-black uppercase tracking-widest \${isKritis ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-700'}\`}>
              <span>Status:</span>
              <span className="flex items-center gap-1.5">
                {isKritis ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {isKritis ? 'Peringatan Kritis' : 'Kondisi Aman'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Batas Peringatan (Rp)</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[10000, 20000, 30000, 50000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setInputLimit(val.toString())}
                    className={\`py-2.5 rounded-xl text-xs font-bold transition-all border \${inputLimit === val.toString()
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-100 bg-white text-gray-500 hover:border-amber-200'
                    }\`}
                  >
                    Rp {val.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300 group-focus-within:text-amber-500 transition-colors">Rp</div>
                <input
                  type="number"
                  value={inputLimit}
                  onChange={(e) => setInputLimit(e.target.value)}
                  placeholder="30000"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Isi / Update Saldo Token (Rp)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300 group-focus-within:text-emerald-500 transition-colors">Rp</div>
                <input
                  type="number"
                  value={inputDeposit}
                  onChange={(e) => setInputDeposit(e.target.value)}
                  placeholder="150000"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitted}
              className={\`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2
                \${submitted 
                  ? 'bg-emerald-500 text-white shadow-emerald-200' 
                  : 'bg-gray-900 text-white hover:bg-black hover:shadow-xl'
                }\`}
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Berhasil Disimpan</span>
                </>
              ) : (
                'Simpan Pengaturan'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}`;

const functionRegex = /function WarningLimitModal[\s\S]*?return \([\s\S]*?\n  \);\n}/;

if (content.match(functionRegex)) {
    console.log("Found function block, reverting to polished previous version...");
    content = content.replace(functionRegex, polishedPreviousVersion);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Reverted successfully.");
} else {
    console.log("Function block not found via regex.");
}
