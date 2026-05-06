const mongoose = require('mongoose');
const Hub = require('../src/models/Hub');
const KP = require('../src/models/KendaliPerangkat');

const uri = 'mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?appName=Cluster0';

async function cleanup() {
    try {
        await mongoose.connect(uri);
        console.log('Terhubung ke MongoDB...');
        
        const hubs = await Hub.find({}, '_id');
        const validHubIds = hubs.map(h => h._id.toString());
        
        // Hapus perangkat yang hub-nya sudah tidak ada (orphaned)
        const result = await KP.deleteMany({ 
            hubId: { $nin: validHubIds },
            location: { $ne: 'Pending' } 
        });
        
        console.log(`Berhasil menghapus ${result.deletedCount} perangkat hantu!`);
        process.exit(0);
    } catch (err) {
        console.error('Error saat pembersihan:', err);
        process.exit(1);
    }
}

cleanup();
