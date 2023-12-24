// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQ1sbcukGiRdmoE7nRDfy_vMyuYYXIIS0",
  authDomain: "cmt322-7a0f1.firebaseapp.com",
  databaseURL: "https://cmt322-7a0f1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cmt322-7a0f1",
  storageBucket: "cmt322-7a0f1.appspot.com",
  messagingSenderId: "840356715981",
  appId: "1:840356715981:web:6951b405de14e0416a7884",
  measurementId: "G-LTD06E7S9D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const storage = getStorage(app)
export default app;