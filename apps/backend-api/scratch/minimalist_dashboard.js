const fs = require('fs');
const path = 'c:\\Users\\Lenovo\\BIEON_BPJS\\bieon\\apps\\frontend\\src\\features\\dashboard\\HomeownerDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const minimalistVersion = `function WarningLimitModal({ isOpen, onClose, limit, setLimit, deposit, setDeposit }) {
  const [inputLimit, setInputLimit] = useState(limit.toString());
  const [inputDeposit, setInputDeposit] = useState(deposit.toString());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setInputLimit(limit.toString());
    setInputDeposit(deposit.toString());
  }, [limit, deposit, isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[32px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Minimalist Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Batas Peringatan</h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Token Listrik</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-2 space-y-6">
          {/* Subtle Info Section */}
          <div className="space-y-2 py-4 border-y border-gray-50">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-400">Saldo Saat Ini</span>
              <span className={\`font-bold \${isKritis ? 'text-red-500' : 'text-emerald-500'}\`}>Rp {deposit.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-400">Batas Aktif</span>
              <span className="text-gray-600 font-bold">Rp {limit.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Input Limit */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ingatkan Saya Jika Saldo Di Bawah</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">Rp</span>
                <input
                  type="number"
                  value={inputLimit}
                  onChange={(e) => setInputLimit(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  placeholder="30000"
                />
              </div>
            </div>

            {/* Input Deposit */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Update Saldo (Top-up)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-300">Rp</span>
                <input
                  type="number"
                  value={inputDeposit}
                  onChange={(e) => setInputDeposit(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
                  placeholder="150000"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitted}
            className={\`w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2
              \${submitted 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-900 text-white hover:bg-black hover:shadow-md active:scale-95'
              }\`}
          >
            {submitted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Tersimpan</span>
              </>
            ) : (
              'Update Pengaturan'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}`;

const functionRegex = /function WarningLimitModal[\s\S]*?return \([\s\S]*?\n  \);\n}/;

if (content.match(functionRegex)) {
    console.log("Found function block, applying minimalist redesign...");
    content = content.replace(functionRegex, minimalistVersion);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Applied successfully.");
} else {
    console.log("Function block not found via regex.");
}
