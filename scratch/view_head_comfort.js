const { execSync } = require('child_process');
const fs = require('fs');

const headFile = execSync('git show HEAD:apps/frontend/src/features/dashboard/HomeownerDashboard.jsx', { maxBuffer: 10 * 1024 * 1024 }).toString();
const lines = headFile.split('\n');

const start = 1180;
const end = 1270;
console.log(lines.slice(start, end).map((l, i) => `${start + i + 1}: ${l}`).join('\n'));
