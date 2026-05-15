const fs = require('fs');
const content = fs.readFileSync('c:/Users/ASUS/Documents/Development/bieon/apps/frontend/src/features/dashboard/kendali.jsx', 'utf8');

let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Simple regex to find / that are not comments
    if (line.match(/[^\/]\/[^\/\*]/) && !line.match(/https?:\/\//)) {
        console.log(`${i + 1}: ${line.trim()}`);
    }
}
