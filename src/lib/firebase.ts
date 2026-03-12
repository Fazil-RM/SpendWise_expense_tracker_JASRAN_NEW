import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAnwkcijyh0ve-7TR4hf3gc7EfLCSqWN44",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "spendwise-e2f56.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "spendwise-e2f56",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "spendwise-e2f56.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "496181841277",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:496181841277:web:e6f34fd8d06d01c5e75014",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CH7YXXPH59"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
