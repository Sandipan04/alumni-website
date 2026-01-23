// js/config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
    apiKey: "AIzaSyCM4gTTek83M2jKSxymcjnq2qDlAz-tCC0",
    authDomain: "niser-alumni.firebaseapp.com",
    projectId: "niser-alumni",
    storageBucket: "niser-alumni.firebasestorage.app",
    messagingSenderId: "816418809535",
    appId: "1:816418809535:web:ea86a6e49d3406a4d6c80a",
    measurementId: "G-GJ6VNSJ82P"
};

// Initialize and Export
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);