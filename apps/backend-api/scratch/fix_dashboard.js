const fs = require('fs');
const path = 'c:\\Users\\Lenovo\\BIEON_BPJS\\bieon\\apps\\frontend\\src\\features\\dashboard\\HomeownerDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// The problematic block
const problematic = /  \);\r?\n      <\/div>\r?\n    <\/div>\r?\n  \);\r?\n}/;
const fixed = '  );\n}';

if (content.match(problematic)) {
    console.log("Found problematic block, fixing...");
    content = content.replace(problematic, fixed);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Fixed successfully.");
} else {
    console.log("Problematic block not found via regex.");
    // Try without \r
    const problematic2 = /  \);\n      <\/div>\n    <\/div>\n  \);\n}/;
    if (content.match(problematic2)) {
        console.log("Found problematic block (LF), fixing...");
        content = content.replace(problematic2, fixed);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Fixed successfully.");
    } else {
        console.log("Problematic block still not found.");
    }
}
