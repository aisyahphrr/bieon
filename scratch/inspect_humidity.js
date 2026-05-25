const fs = require('fs');
const content = fs.readFileSync('apps/frontend/src/features/dashboard/HomeownerDashboard.jsx', 'utf8');

const regex = /humidity/gi;
let match;
console.log('--- matches in HomeownerDashboard.jsx for "humidity" ---');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('humidity') || line.includes('Humidity')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
