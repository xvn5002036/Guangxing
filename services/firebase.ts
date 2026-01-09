import firebase from "firebase/compat/app";
import "firebase/compat/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCE3slgt232Jjyer2kq5b8PHWD0iDvOpJ0",
  authDomain: "chi-fu-wang.firebaseapp.com",
  projectId: "chi-fu-wang",
  storageBucket: "chi-fu-wang.firebasestorage.app",
  messagingSenderId: "388080849834",
  appId: "1:388080849834:web:fb5ecca09d9695f12e91d3",
  measurementId: "G-BP2CEERBHR"
  // API Secret for Measurement Protocol (Server-side): uuoY8GkqROi47SPlRKHrgA
  // For client-side SDK, measurementId is sufficient.
};

// Initialize Firebase using Compat SDK to handle potential environment/typing issues
const app = firebase.initializeApp(firebaseConfig);

// Initialize Services
// Use modular getFirestore (assuming line 2 didn't error implies it's available)
export const db = getFirestore(app);
// Use compat analytics as fallback
export const analytics = firebase.analytics(app);

// Helper to check if config is set
export const isFirebaseConfigured = () => {
    return true;
};