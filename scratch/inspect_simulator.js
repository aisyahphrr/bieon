const fs = require('fs');
const content = fs.readFileSync('apps/frontend/src/features/dashboard/HomeownerDashboard.jsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('Gaya Ikon') || line.includes('gayaIkon') || line.includes('Ikon Master') || line.includes('masterCardIconMode')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
