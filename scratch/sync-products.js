const mongoose = require('mongoose');
const RegisteredProduct = require('../apps/backend-api/src/models/RegisteredProduct');
const KendaliPerangkat = require('../apps/backend-api/src/models/KendaliPerangkat');

async function cleanUp() {
    try {
        await mongoose.connect('mongodb+srv://dafmaula123_db_user:Bieon1234@cluster0.sqclpaj.mongodb.net/bieon_db?retryWrites=true&w=majority&appName=Cluster0');
        
        // Ambil semua ID produk yang sudah ada di dashboard
        const activeDevices = await KendaliPerangkat.find({}).select('productId');
        const activeIds = activeDevices.map(d => d.productId).filter(id => id);
        
        // Tandai sebagai isUsed: true
        const result = await RegisteredProduct.updateMany(
            { productId: { $in: activeIds } },
            { isUsed: true }
        );
        
        console.log(`Pembersihan selesai! ${result.modifiedCount} perangkat lama telah ditandai sebagai terpakai.`);
    } catch (err) {
        console.error('Error cleanup:', err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

cleanUp();
