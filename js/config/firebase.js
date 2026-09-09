// Firebase Configuration & Compatibility Module for ArcanaReflect
const firebaseConfig = {
  apiKey: "AIzaSyYOUR_FIREBASE_API_KEY_HERE",
  authDomain: "arcanareflect-app.firebaseapp.com",
  projectId: "arcanareflect-app",
  storageBucket: "arcanareflect-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
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
