// 🔥 FIREBASE MODERNO V10 (FIX COMPLETO)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBzf4tnHd49EgHyLrU35_soY-AMIlYB-RI",
  authDomain: "freef-17074.firebaseapp.com",
  projectId: "freef-17074",
  storageBucket: "freef-17074.firebasestorage.app",
  messagingSenderId: "110638896532",
  appId: "1:110638896532:web:91c0c7219550ce18e3ab81"
};

// INIT
const app = initializeApp(firebaseConfig);

// SERVICES
const auth = getAuth(app);
const db = getFirestore(app);

// EXPORTS
export { app, auth, db };