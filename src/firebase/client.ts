import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgpvAKB1SfXHureSpPBJJheyPmOFo--pg",
  authDomain: "prepme-64d9b.firebaseapp.com",
  projectId: "prepme-64d9b",
  storageBucket: "prepme-64d9b.firebasestorage.app",
  messagingSenderId: "143128993121",
  appId: "1:143128993121:web:38bf45a3d9d5fd79c9b920",
  measurementId: "G-N8VR2CP4D7",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
