const fs = require('fs');
const content = fs.readFileSync('c:/Users/ASUS/Documents/Development/bieon/apps/frontend/src/features/dashboard/kendali.jsx', 'utf8');
const openP = (content.match(/\(/g) || []).length;
const closeP = (content.match(/\)/g) || []).length;
const openB = (content.match(/\{/g) || []).length;
const closeB = (content.match(/\}/g) || []).length;
console.log('Open (:', openP, 'Close ):', closeP, 'Diff:', openP - closeP);
console.log('Open {:', openB, 'Close }:', closeB, 'Diff:', openB - closeB);
