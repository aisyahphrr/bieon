const fs = require('fs');
try {
    const root = fs.readFileSync('package.json', 'utf8');
    JSON.parse(root);
    console.log('Root package.json is valid');
} catch (e) {
    console.error('Root package.json error:', e.message);
}

try {
    const backend = fs.readFileSync('apps/backend-api/package.json', 'utf8');
    JSON.parse(backend);
    console.log('Backend package.json is valid');
} catch (e) {
    console.error('Backend package.json error:', e.message);
}

try {
    const frontend = fs.readFileSync('apps/frontend/package.json', 'utf8');
    JSON.parse(frontend);
    console.log('Frontend package.json is valid');
} catch (e) {
    console.error('Frontend package.json error:', e.message);
}
