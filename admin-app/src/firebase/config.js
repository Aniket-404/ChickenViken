// Import the functions you need from the SDKs you need
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

// User-app Firebase configuration (for accessing orders)
const userFirebaseConfig = {
  apiKey: import.meta.env.VITE_USER_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_USER_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_USER_FIREBASE_PROJECT_ID || "chickenviken-30bd9", // Hardcoding project ID as fallback
  storageBucket: import.meta.env.VITE_USER_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_USER_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_USER_FIREBASE_APP_ID
};

// Debug Firebase configuration
console.log('Admin Firebase Config Available:', {
  apiKey: !!import.meta.env.VITE_ADMIN_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_ADMIN_FIREBASE_PROJECT_ID || 'Not set'
});

console.log('User Firebase Config Available:', {
  apiKey: !!import.meta.env.VITE_USER_FIREBASE_API_KEY,
  projectId: userFirebaseConfig.projectId || 'Not set'
});

// Validate user Firebase config
if (!userFirebaseConfig.projectId) {
  console.error('User Firebase Project ID is missing. Using fallback "chickenviken-30bd9"');
}

// Initialize Firebase Apps
const adminApp = initializeApp(adminFirebaseConfig);
const userApp = initializeApp(userFirebaseConfig, 'user-app'); // Second parameter is a unique app name

// Initialize Auth with admin app
const auth = getAuth(adminApp);

// Initialize Firestore with both apps
const db = getFirestore(adminApp);
const userDb = getFirestore(userApp); // For accessing user orders

// Initialize Storage with admin app
const storage = getStorage(adminApp);

export { auth, db, userDb, storage };
export default adminApp;
