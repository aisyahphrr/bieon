// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCcLZYknqd1pTa1iFFEoAF7DPDdLKL8gr4",
    authDomain: "bieon-app.firebaseapp.com",
    projectId: "bieon-app",
    storageBucket: "bieon-app.firebasestorage.app",
    messagingSenderId: "610701383197",
    appId: "1:610701383197:web:90be5a2dfcab6698bd18f4",
    measurementId: "G-9G0T9JDC34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

import { getAuth, GoogleAuthProvider } from "firebase/auth";
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();