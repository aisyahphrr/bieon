const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
        `Firebase service account tidak ditemukan di ${serviceAccountPath}. ` +
        'Sediakan file tersebut untuk memakai login Google.'
    );
}

if (!admin.apps.length) {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = admin;
