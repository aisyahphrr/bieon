
import fs from 'fs';

const content = fs.readFileSync('apps/frontend/src/features/dashboard/HomeownerDashboard.jsx', 'utf8');

function count(char) {
  return content.split(char).length - 1;
}

console.log('Open {:', count('{'));
console.log('Close }:', count('}'));
console.log('Open (:', count('('));
console.log('Close ):', count(')'));
console.log('Open <:', count('<'));
console.log('Close >:', count('>'));
console.log('Open <div:', count('<div'));
console.log('Close </div:', count('</div'));
