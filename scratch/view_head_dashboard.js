const { execSync } = require('child_process');
const fs = require('fs');

const headFile = execSync('git show HEAD:apps/frontend/src/features/dashboard/HomeownerDashboard.jsx', { maxBuffer: 10 * 1024 * 1024 }).toString();
const lines = headFile.split('\n');

// Search for renderCardIcon in HEAD
let foundIdx = -1;
lines.forEach((line, index) => {
  if (line.includes('renderCardIcon')) {
    foundIdx = index;
  }
});

if (foundIdx !== -1) {
  console.log('Found renderCardIcon in HEAD around line', foundIdx + 1);
  const start = Math.max(0, foundIdx - 10);
  const end = Math.min(lines.length, foundIdx + 40);
  console.log(lines.slice(start, end).map((l, i) => `${start + i + 1}: ${l}`).join('\n'));
} else {
  console.log('renderCardIcon not found in HEAD!');
  // Let's search for "Status Kenyamanan" or other elements in HEAD
  const comfortLines = [];
  lines.forEach((line, index) => {
    if (line.includes('Kenyamanan') || line.includes('comfort_status')) {
      comfortLines.push(`${index + 1}: ${line.trim()}`);
    }
  });
  console.log('Matches for comfort/Kenyamanan in HEAD:');
  console.log(comfortLines.slice(0, 20).join('\n'));
}
