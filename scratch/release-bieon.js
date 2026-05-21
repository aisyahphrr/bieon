const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend-api/.env') });
const User = require('../apps/backend-api/src/models/User');
const BieonSystem = require('../apps/backend-api/src/models/BieonSystem');
const { bieonIdFilter } = require('../apps/backend-api/src/shared/bieonId');

async function release() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const targetId = process.argv[2] || 'bieon_001';
        const filter = bieonIdFilter(targetId);

        const oldOwner = await User.findOneAndUpdate(
            filter,
            { $unset: { bieonId: '' } }
        );

        await BieonSystem.findOneAndUpdate(filter, { owner: null });

        console.log(`✅ BERHASIL: Kepemilikan ${targetId} telah dilepaskan!`);
        if (oldOwner) {
            console.log(`- Mantan pemilik: ${oldOwner.email}`);
        } else {
            console.log('- Tidak ditemukan pemilik aktif untuk ID tersebut.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

release();
