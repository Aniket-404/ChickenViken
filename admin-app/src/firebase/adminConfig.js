import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Admin Firebase configuration
const adminFirebaseConfig = {
  apiKey: import.meta.env.VITE_ADMIN_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_ADMIN_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_ADMIN_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_ADMIN_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_ADMIN_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_ADMIN_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_ADMIN_FIREBASE_MEASUREMENT_ID
};

// Initialize Admin Firebase
const app = initializeApp(adminFirebaseConfig);

// Initialize Admin services
const auth = getAuth(app);
auth.useDeviceLanguage();

// Initialize Admin Firestore
const db = getFirestore(app);

// Initialize Admin Storage
const storage = getStorage(app);

// Export with both original names and admin-prefixed names for flexibility
export { 
  auth, 
  db, 
  storage,
  auth as adminAuth, 
  db as adminDb, 
  storage as adminStorage 
};
export default app;
