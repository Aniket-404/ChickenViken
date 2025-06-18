// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// User Firebase configuration - for user authentication, profile, cart, etc.
const userFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Admin Firebase configuration - for product data only
const adminFirebaseConfig = {
  apiKey: import.meta.env.VITE_ADMIN_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_ADMIN_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_ADMIN_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_ADMIN_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_ADMIN_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_ADMIN_FIREBASE_APP_ID
};

// Initialize Firebase Apps
const userApp = initializeApp(userFirebaseConfig);
const adminApp = initializeApp(adminFirebaseConfig, 'admin'); // Second parameter is a unique app name

// Initialize Firebase services for USER app (auth, user data, orders, cart)
export const auth = getAuth(userApp);
export const db = getFirestore(userApp);
export const storage = getStorage(userApp);

// Initialize Firebase services for ADMIN app (products data only)
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

// Use emulators for local development
// Set VITE_USE_FIREBASE_EMULATORS=true in your .env file to enable
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  console.log("Using Firebase Emulators");
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
  
  // No need to connect emulators to the admin app in user-app
  // because we're not using auth or directly modifying data there
}

export { userApp, adminApp };
