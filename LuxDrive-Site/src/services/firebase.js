// services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDRQXBxo3VFBNAT7ccuBpXVXnt1uRpOLhE",
  authDomain: "luxdrive-wash.vercel.app",
  projectId: "site-luxdrive",
  storageBucket: "site-luxdrive.firebasestorage.app",
  messagingSenderId: "543815599538",
  appId: "1:543815599538:web:bce9a3013dd6e3a09590ab"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
