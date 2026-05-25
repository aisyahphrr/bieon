const { execSync } = require('child_process');
const fs = require('fs');

const diff = execSync('git diff HEAD -- apps/frontend/src/features/dashboard/HomeownerDashboard.jsx', { maxBuffer: 10 * 1024 * 1024 }).toString();
const lines = diff.split('\n');

const relevantLines = [];
let capture = false;
let blockLines = [];

for (const line of lines) {
  if (line.includes('renderCardIcon') || line.includes('masterCardMode') || line.includes('solid-white-icon') || line.includes('animate-spin-slow')) {
    capture = true;
    blockLines.push(line);
  } else if (capture) {
    blockLines.push(line);
    if (blockLines.length > 30) {
      relevantLines.push(...blockLines);
      blockLines = [];
      capture = false;
    }
  }
}
if (blockLines.length > 0) {
  relevantLines.push(...blockLines);
}

fs.writeFileSync('scratch/uncommitted_mastercard_diff.txt', relevantLines.join('\n'));
console.log('Wrote relevant diff lines');
