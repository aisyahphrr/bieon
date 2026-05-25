const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const diff = execSync('git diff origin/main -- apps/frontend/src/features/dashboard/HomeownerDashboard.jsx', { maxBuffer: 10 * 1024 * 1024 }).toString();
const lines = diff.split('\n');

const deletedLines = lines.filter(line => line.startsWith('-') && !line.startsWith('---'));
fs.writeFileSync(path.join(__dirname, 'deleted_lines.txt'), deletedLines.join('\n'));
console.log('Done, wrote', deletedLines.length, 'deleted lines');
