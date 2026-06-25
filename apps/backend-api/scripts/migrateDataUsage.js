const mongoose = require('mongoose');
const BSON = require('bson');

const uri = 'mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?retryWrites=true&w=majority&appName=Cluster0';

async function runMigration() {
    console.log('Memulai migrasi perhitungan memori per user...');
    
    await mongoose.connect(uri);
    console.log('Terhubung ke database.');

    // Muat semua model agar terdaftar di mongoose.modelNames()
    const fs = require('fs');
    const path = require('path');
    const modelsDir = path.join(__dirname, '../src/models');
    fs.readdirSync(modelsDir).forEach(file => {
        if (file.endsWith('.js')) {
            require(path.join(modelsDir, file));
        }
    });

    // Dictionary untuk menyimpan total ukuran sementara per user
    const userMemoryMap = {};
    
    // Daftar field yang sering dipakai sebagai referensi user
    const userRefFields = ['owner', 'user', 'homeowner'];

    // Ambil semua daftar model yang ada (kita abaikan User karena User adalah penampungnya)
    const models = mongoose.modelNames().filter(m => m !== 'User');
    
    for (const modelName of models) {
        const Model = mongoose.model(modelName);
        console.log(`Memproses koleksi: ${modelName}...`);

        // Dapatkan cursor untuk hemat memori
        const cursor = Model.find({}).cursor();
        
        let count = 0;
        let batchUpdates = [];

        for await (const doc of cursor) {
            const docObj = doc.toObject();
            const size = BSON.calculateObjectSize(docObj);
            
            // Simpan ukuran ke dokumen itu sendiri
            batchUpdates.push({
                updateOne: {
                    filter: { _id: doc._id },
                    update: { $set: { dataSizeBytes: size } }
                }
            });

            // Cari tahu user-nya siapa
            let userId = null;
            for (const field of userRefFields) {
                if (docObj[field]) {
                    userId = docObj[field].toString();
                    break;
                }
            }

            if (userId) {
                if (!userMemoryMap[userId]) userMemoryMap[userId] = 0;
                userMemoryMap[userId] += size;
            }

            count++;

            // Eksekusi batch setiap 500 dokumen agar tidak memory leak
            if (batchUpdates.length >= 500) {
                await Model.bulkWrite(batchUpdates);
                batchUpdates = [];
            }
        }

        // Eksekusi sisa batch
        if (batchUpdates.length > 0) {
            await Model.bulkWrite(batchUpdates);
        }

        console.log(`✅ Selesai memproses ${count} dokumen di ${modelName}`);
    }

    // Terakhir, update tabel User
    console.log('Merekap total ukuran memori ke tabel User...');
    const User = mongoose.model('User');
    
    const userIds = Object.keys(userMemoryMap);
    let userUpdatedCount = 0;
    
    for (const userId of userIds) {
        const totalSize = userMemoryMap[userId];
        await User.findByIdAndUpdate(userId, {
            $set: { totalDataUsageBytes: totalSize }
        });
        userUpdatedCount++;
    }

    console.log(`✅ Selesai memperbarui memori untuk ${userUpdatedCount} user.`);
    console.log('Migrasi selesai sepenuhnya!');
    
    process.exit(0);
}

runMigration().catch(err => {
    console.error('Migrasi gagal:', err);
    process.exit(1);
});
