const fs = require('fs');
const content = fs.readFileSync('apps/frontend/src/features/dashboard/HomeownerDashboard.jsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('getMasterCardStyles') || line.includes('renderCardIcon')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
