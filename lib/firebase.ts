import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCSM6_Lgb0-nocjsywjA-ORW7YhiJRsKUU",
    authDomain: "iqm-employee.firebaseapp.com",
    projectId: "iqm-employee",
    storageBucket: "iqm-employee.firebasestorage.app",
    messagingSenderId: "615717163878",
    appId: "1:615717163878:web:17b6266aea7f9cd479aea7",
    measurementId: "G-72L3N16ZEM"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
