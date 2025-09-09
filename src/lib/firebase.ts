import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-5580400647-47203",
  appId: "1:12532322699:web:a07eb811326afb8a1edf8e",
  storageBucket: "studio-5580400647-47203.firebasestorage.app",
  apiKey: "AIzaSyBZofg9tQr6nsfes06X4fegaMQ0KrG6yN8",
  authDomain: "studio-5580400647-47203.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "12532322699"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
