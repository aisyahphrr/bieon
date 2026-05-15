const fs = require('fs');
const c = fs.readFileSync('c:/Users/ASUS/Documents/Development/bieon/apps/frontend/src/features/dashboard/kendali.jsx', 'utf8');
console.log('Single quotes:', (c.match(/'/g) || []).length % 2);
console.log('Double quotes:', (c.match(/\"/g) || []).length % 2);
console.log('Backticks:', (c.match(/`/g) || []).length % 2);
console.log('Parens:', (c.match(/\(/g) || []).length - (c.match(/\)/g) || []).length);
console.log('Braces:', (c.match(/\{/g) || []).length - (c.match(/\}/g) || []).length);
