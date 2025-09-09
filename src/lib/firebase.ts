import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBZofg9tQr6nsfes06X4fegaMQ0KrG6yN8",
  authDomain: "studio-5580400647-47203.firebaseapp.com",
  databaseURL: "https://studio-5580400647-47203-default-rtdb.firebaseio.com",
  projectId: "studio-5580400647-47203",
  storageBucket: "studio-5580400647-47203.firebasestorage.app",
  messagingSenderId: "12532322699",
  appId: "1:12532322699:web:a07eb811326afb8a1edf8e"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
