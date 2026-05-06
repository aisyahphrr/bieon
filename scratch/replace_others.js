const fs = require('fs');

const files = [
  'apps/frontend/src/features/admin/AdminComplaint.jsx',
  'apps/frontend/src/features/technician/TechnicianDashboard.jsx',
  'apps/frontend/src/features/technician/KonfigurasiPerangkatPage.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    if (content.includes('status === "ON"')) {
      content = content.replace(/status === "ON"/g, 'status === "1"');
      changed = true;
    }
    if (content.includes('status === "OFF"')) {
      content = content.replace(/status === "OFF"/g, 'status === "0"');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(file, content);
      console.log(`Replaced in ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
