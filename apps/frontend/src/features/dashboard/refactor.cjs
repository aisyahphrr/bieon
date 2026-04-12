const fs = require('fs');
let c = fs.readFileSync('kendali.jsx', 'utf8');

const replacements = [
  { from: /className="grid grid-cols-4 gap-6 mb-8"/g, to: 'className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"' },
  { from: /className="grid grid-cols-3 gap-6"/g, to: 'className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"' },
  { from: /className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6"/g, to: 'className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-6"' },
  { from: /className="grid grid-cols-2 gap-6"/g, to: 'className="grid grid-cols-1 sm:grid-cols-2 gap-6"' },
  { from: /className="grid grid-cols-2 gap-4 mb-8"/g, to: 'className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"' },
  { from: /className="grid grid-cols-4 gap-4"/g, to: 'className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"' },
  { from: /className="grid grid-cols-2 gap-4"/g, to: 'className="grid grid-cols-1 sm:grid-cols-2 gap-4"' },
  // Also want to address the top header which I tried to replace earlier but failed
  { from: /<div className="flex items-center justify-between mb-8">/g, to: '<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">' },
  { from: /className="max-w-\[1900px\] mx-auto px-8 py-8 font-sans"/g, to: 'className="max-w-[1900px] mx-auto px-4 md:px-8 py-6 md:py-8 font-sans overflow-x-hidden"' },
  { from: /className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8/g, to: 'className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-5 sm:p-8' },
  { from: /className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8/g, to: 'className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-5 sm:p-8' }
];

replacements.forEach(r => {
  c = c.replace(r.from, r.to);
});

fs.writeFileSync('kendali.jsx', c);
