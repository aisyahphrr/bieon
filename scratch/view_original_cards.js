const { execSync } = require('child_process');
const fs = require('fs');

const originalFile = execSync('git show origin/main:apps/frontend/src/features/dashboard/HomeownerDashboard.jsx', { maxBuffer: 10 * 1024 * 1024 }).toString();
const lines = originalFile.split('\n');

// Find lines containing keywords
const matches = [];
lines.forEach((line, index) => {
  if (line.includes('comfort') || line.includes('Comfort') || line.includes('kenyamanan') || line.includes('Kenyamanan')) {
    matches.push({ index: index + 1, content: line.trim() });
  }
});

fs.writeFileSync('scratch/original_comfort_matches.json', JSON.stringify(matches, null, 2));
console.log('Found', matches.length, 'matches');
