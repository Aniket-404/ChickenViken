// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase with retry settings
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with custom settings
const auth = getAuth(app);
auth.useDeviceLanguage(); // Use browser's language
auth.settings.appVerificationDisabledForTesting = true; // Disable app verification for testing

// Initialize Firestore with optimized settings
const db = getFirestore(app);
// Apply settings to Firestore instance
db._settings = {
  experimentalForceLongPolling: true, // Use long polling for better reliability
  useFetchStreams: false, // Disable fetch streams which can cause issues
  cacheSizeBytes: 50000000, // Increase cache size to 50MB
  retry: {
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffFactor: 1.3
  }
};

const storage = getStorage(app);

// Export configured services
export { auth, db, storage };
export default app;
