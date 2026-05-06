const fs = require('fs');
const path = 'c:/Users/Lenovo/BIEON_BPJS/bieon/apps/frontend/src/features/dashboard/HomeownerDashboard.jsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Line 187 (0-indexed: 186)
// Line 381 (0-indexed: 380)

const startIdx = 186; 
const endIdx = 380;

console.log('Line 187:', lines[startIdx]);
console.log('Line 380:', lines[endIdx-1]);
console.log('Line 381:', lines[endIdx]);

if (lines[startIdx].includes('function ComplaintModal') && lines[endIdx-1].trim() === '}') {
    lines.splice(startIdx, endIdx - startIdx + 1);
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Successfully removed damaged lines 187-381');
} else {
    console.error('Line mismatch! Check current file state.');
}
