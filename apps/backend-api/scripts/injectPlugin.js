const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../src/models');
const files = fs.readdirSync(modelsDir);

let modifiedCount = 0;

for (const file of files) {
    if (file === 'User.js' || !file.endsWith('.js')) continue;

    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Cek apakah file ini memiliki referensi ke User (owner, user, homeowner)
    // atau jika user ingin SEMUA koleksi
    // Kita cek apakah ada deklarasi Schema
    if (content.includes('new mongoose.Schema') && !content.includes('dataSizePlugin')) {
        
        // 1. Tambahkan require plugin di bagian atas (setelah mongoose)
        content = content.replace(
            /const mongoose = require\(['"]mongoose['"]\);/,
            "const mongoose = require('mongoose');\nconst dataSizePlugin = require('../plugins/dataSizePlugin');"
        );

        // 2. Cari nama variabel schema
        const schemaMatch = content.match(/const\s+(\w+Schema)\s*=\s*new\s+mongoose\.Schema/);
        if (schemaMatch && schemaMatch[1]) {
            const schemaName = schemaMatch[1];
            
            // 3. Sisipkan plugin sebelum module.exports
            content = content.replace(
                /module\.exports = mongoose\.model/,
                `${schemaName}.plugin(dataSizePlugin);\n\nmodule.exports = mongoose.model`
            );

            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`Plugin disuntikkan ke ${file}`);
            modifiedCount++;
        }
    }
}

console.log(`Berhasil menyuntikkan plugin ke ${modifiedCount} file model.`);
