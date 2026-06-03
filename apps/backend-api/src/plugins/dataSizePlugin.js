const mongoose = require('mongoose');
const BSON = require('bson');

/**
 * Plugin untuk melacak ukuran dokumen (dalam byte) 
 * dan menambahkan totalnya ke model User.
 */
module.exports = function dataSizePlugin(schema, options) {
    // Pastikan schema memiliki kolom dataSizeBytes
    schema.add({
        dataSizeBytes: {
            type: Number,
            default: 0
        }
    });

    // Hook saat dokumen baru dibuat atau disimpan
    schema.pre('save', async function () {
        // Kita hanya menghitung penambahan memori secara agresif saat dokumen BARU dibuat
        // Untuk dokumen lama yang di-update, perubahan ukurannya biasanya sangat kecil (negligible)
        // sehingga demi performa kita tidak terus-menerus menembak update ke koleksi User
        if (this.isNew) {
            try {
                // Hitung ukuran dokumen dalam BSON
                const docObj = this.toObject();
                // BSON.calculateObjectSize akan menghitung byte yang akurat
                const size = BSON.calculateObjectSize(docObj);
                
                this.dataSizeBytes = size;

                // Cari field owner/user/homeowner yang mereferensikan ke User
                const userRefField = options && options.userField ? options.userField : 
                    (this.owner ? 'owner' : (this.user ? 'user' : (this.homeowner ? 'homeowner' : null)));

                if (userRefField && this[userRefField]) {
                    const userId = this[userRefField];
                    
                    // Asinkron update ke User agar tidak memblokir proses save saat ini
                    if (mongoose.models.User) {
                        mongoose.models.User.findByIdAndUpdate(
                            userId,
                            { $inc: { totalDataUsageBytes: size } }
                        ).catch(err => {
                            console.error(`[DataSizePlugin] Gagal mengupdate totalDataUsageBytes untuk user ${userId}:`, err);
                        });
                    }
                }
            } catch (error) {
                console.error('[DataSizePlugin] Gagal menghitung ukuran dokumen:', error);
            }
        }
    });

    // Hook saat dokumen dihapus (opsional, untuk memastikan memori kembali kosong saat data dihapus)
    schema.pre('remove', async function() {
        try {
            if (this.dataSizeBytes > 0) {
                const userRefField = options && options.userField ? options.userField : 
                    (this.owner ? 'owner' : (this.user ? 'user' : (this.homeowner ? 'homeowner' : null)));

                if (userRefField && this[userRefField]) {
                    const userId = this[userRefField];
                    if (mongoose.models.User) {
                        mongoose.models.User.findByIdAndUpdate(
                            userId,
                            { $inc: { totalDataUsageBytes: -this.dataSizeBytes } }
                        ).catch(err => console.error(err));
                    }
                }
            }
        } catch (error) {
            console.error('[DataSizePlugin] Gagal mengurangi memori saat penghapusan:', error);
        }
    });
};
