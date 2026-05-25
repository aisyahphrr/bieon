const { execSync } = require('child_process');
const fs = require('fs');

const files = [
  'apps/frontend/src/features/dashboard/HomeownerDashboard.jsx',
  'apps/frontend/src/features/dashboard/HomeownerHistory.jsx',
  'apps/frontend/src/features/dashboard/HomeownerComplaint.jsx',
  'apps/frontend/src/features/complaints/ComplaintDetailModal.jsx',
  'apps/frontend/src/components/NotificationPopup.jsx'
];

for (const file of files) {
  try {
    const diff = execSync(`git diff HEAD -- "${file}"`, { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
    const name = file.split('/').pop().replace('.jsx', '_diff_utf8.txt');
    fs.writeFileSync(`scratch/${name}`, diff, 'utf8');
    console.log(`Wrote scratch/${name}`);
  } catch (e) {
    console.error(e);
  }
}
