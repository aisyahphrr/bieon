const fs = require('fs');
const file = 'apps/frontend/src/features/dashboard/kendali.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/status === "ON"/g, 'status === "1"');
content = content.replace(/status === "OFF"/g, 'status === "0"');
fs.writeFileSync(file, content);
console.log("Replaced successfully!");
