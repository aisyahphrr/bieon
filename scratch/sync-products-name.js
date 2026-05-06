const mongoose = require('mongoose');
const RegisteredProduct = require('../apps/backend-api/src/models/RegisteredProduct');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

async function cleanUp() {
    try {
        await mongoose.connect('mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?retryWrites=true&w=majority&appName=Cluster0');
        
        // Ambil semua Nama perangkat yang sudah ada di dashboard
        const activeDevices = await KendaliPerangkat.find({}).select('name');
        const activeNames = activeDevices.map(d => d.name);
        
        // Tandai produk dengan nama yang sama sebagai isUsed: true
        const result = await RegisteredProduct.updateMany(
            { productName: { $in: activeNames } },
            { isUsed: true }
        );
        
        console.log(`Pembersihan Nama Selesai! ${result.modifiedCount} perangkat lama telah diarsipkan.`);
    } catch (err) {
        console.error('Error cleanup:', err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

cleanUp();
