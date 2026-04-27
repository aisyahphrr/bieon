const admin = require("firebase-admin");
// Arahkan ke file JSON yang di-download dari Service Accounts
const serviceAccount = require("../../firebase-service-account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
