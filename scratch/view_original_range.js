const { execSync } = require('child_process');
const originalFile = execSync('git show origin/main:apps/frontend/src/features/dashboard/HomeownerDashboard.jsx', { maxBuffer: 10 * 1024 * 1024 }).toString();
const lines = originalFile.split('\n');
const range = lines.slice(1220, 1275);
console.log(range.map((line, i) => `${1221 + i}: ${line}`).join('\n'));
