const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
    // Firebase Admin bersifat opsional. Jika file tidak ada, backend tetap bisa jalan
    // dan hanya fitur login Google yang dinonaktifkan.
    module.exports = null;
    return;
}

if (!admin.apps.length) {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = admin;
