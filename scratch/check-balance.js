const fs = require('fs');
const content = fs.readFileSync('c:/Users/ASUS/Documents/Development/bieon/apps/frontend/src/features/dashboard/kendali.jsx', 'utf8');

let stack = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let j = 0; j < line.length; j++) {
        let char = line[j];
        if (char === '{' || char === '(' || char === '[') {
            stack.push({ char, line: i + 1, col: j + 1 });
        } else if (char === '}' || char === ')' || char === ']') {
            if (stack.length > 0) stack.pop();
        }
    }
    if ([2240, 2241, 2242, 2243, 2244, 2245, 2246].includes(i + 1)) {
        console.log(`Line ${i + 1}: Stack:`, stack.map(s => s.char).join(''));
    }
}
