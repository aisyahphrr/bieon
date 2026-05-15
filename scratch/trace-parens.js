const fs = require('fs');
const content = fs.readFileSync('c:/Users/ASUS/Documents/Development/bieon/apps/frontend/src/features/dashboard/kendali.jsx', 'utf8');

let parens = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let j = 0; j < line.length; j++) {
        if (line[j] === '(') parens++;
        if (line[j] === ')') parens--;
    }
    if (parens < 0) {
        console.log(`Paren Imbalance (went below 0) at line ${i + 1}`);
    }
}
console.log('Final Parens:', parens);
