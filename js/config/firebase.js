// Firebase Configuration & Compatibility Module for ArcanaReflect
const firebaseConfig = {
  apiKey: "AIzaSyC3IvOvgqUaqCBv1eFWKFdnYzFLu-_QIl0",
  authDomain: "mysticdeck-ac9f6.firebaseapp.com",
  projectId: "mysticdeck-ac9f6",
  storageBucket: "mysticdeck-ac9f6.firebasestorage.app",
  messagingSenderId: "783768966765",
  appId: "1:783768966765:web:d1fc3cc188f01069809164",
  measurementId: "G-N5X0D6S6VM"
};

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let isFirebaseInitialized = false;

if (typeof window !== "undefined" && typeof window.firebase !== "undefined") {
  try {
    if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("YOUR_FIREBASE_API_KEY")) {
      app = window.firebase.initializeApp(firebaseConfig);
      auth = window.firebase.auth();
      db = window.firebase.firestore();
      googleProvider = new window.firebase.auth.GoogleAuthProvider();
      isFirebaseInitialized = true;
      console.log("🔥 Firebase initialized successfully.");
    } else {
      console.warn("⚠️ Firebase API Key placeholder terdeteksi. Aplikasi berjalan dalam mode Standalone / LocalStorage.");
    }
  } catch (error) {
    console.error("❌ Error initializing Firebase:", error);
  }
}

if (typeof window !== "undefined") {
  window.ArcanaFirebase = {
    app,
    auth,
    db,
    googleProvider,
    isFirebaseInitialized
  };
}
