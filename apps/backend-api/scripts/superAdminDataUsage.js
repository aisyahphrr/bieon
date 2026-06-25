const mongoose = require('mongoose');
const BSON = require('bson');

const uri = 'mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?retryWrites=true&w=majority&appName=Cluster0';

async function runSuperAdminMigration() {
    console.log('Menghitung memori untuk koleksi Super Admin...');
    
    await mongoose.connect(uri);
    
    // Pastikan model User dimuat
    require('../src/models/User');
    const User = mongoose.model('User');
    
    // Cari satu SuperAdmin untuk dibebankan memorinya
    const superAdmin = await User.findOne({ role: 'SuperAdmin' });
    
    if (!superAdmin) {
        console.log('Tidak ditemukan user dengan role SuperAdmin di database!');
        process.exit(1);
    }
    
    console.log(`Ditemukan SuperAdmin: ${superAdmin.email} (${superAdmin._id})`);
    
    const collectionsToCharge = ['device_model_dictionary', 'plncategories'];
    let totalBytesToCharge = 0;
    
    for (const collName of collectionsToCharge) {
        console.log(`Menghitung ukuran koleksi: ${collName}...`);
        
        try {
            const cursor = mongoose.connection.collection(collName).find();
            const docs = await cursor.toArray();
            
            let collSize = 0;
            let batchUpdates = [];
            
            for (const doc of docs) {
                const size = BSON.calculateObjectSize(doc);
                collSize += size;
                
                batchUpdates.push({
                    updateOne: {
                        filter: { _id: doc._id },
                        update: { $set: { dataSizeBytes: size } }
                    }
                });
            }
            
            // Terapkan kolom dataSizeBytes ke masing-masing koleksi
            if (batchUpdates.length > 0) {
                await mongoose.connection.collection(collName).bulkWrite(batchUpdates);
            }
            
            console.log(`✅ Selesai memproses ${docs.length} dokumen di ${collName}. Total: ${collSize} byte.`);
            totalBytesToCharge += collSize;
            
        } catch (error) {
            console.error(`Gagal memproses koleksi ${collName}:`, error.message);
        }
    }
    
    // Bebankan totalnya ke SuperAdmin
    if (totalBytesToCharge > 0) {
        await User.findByIdAndUpdate(superAdmin._id, {
            $inc: { totalDataUsageBytes: totalBytesToCharge }
        });
        console.log(`✅ Sukses membebankan ${totalBytesToCharge} byte ke SuperAdmin (${superAdmin.email}).`);
    } else {
        console.log('Koleksi kosong, tidak ada memori yang dibebankan.');
    }
    
    process.exit(0);
}

runSuperAdminMigration().catch(console.error);
