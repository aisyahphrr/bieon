const fs = require('fs');
const content = fs.readFileSync('apps/frontend/src/features/dashboard/HomeownerDashboard.jsx', 'utf8');

const regex = /(\w+(?:\.\w+)*)\.toLowerCase\(\)/g;
let match;
console.log('--- matches in HomeownerDashboard.jsx ---');
while ((match = regex.exec(content)) !== null) {
  const index = match.index;
  const lineNo = content.substring(0, index).split('\n').length;
  console.log(`Line ${lineNo}: ${match[0]} (Expression: ${match[1]})`);
}
