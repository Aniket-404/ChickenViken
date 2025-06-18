// test-firebase-connection.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPtdOYy9lRguwon8vsNySVT2PBVAPFi_c",
  authDomain: "chickenviken-30bd9.firebaseapp.com",
  projectId: "chickenviken-30bd9",
  storageBucket: "chickenviken-30bd9.firebasestorage.app",
  messagingSenderId: "235277268712",
  appId: "1:235277268712:web:7c0f02af12bcee6f047b5d"
};

console.log('Testing Firebase connectivity...');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Test anonymous sign-in (this should work even without admin privileges)
async function testConnection() {
  try {
    console.log('Attempting anonymous sign in...');
    const result = await signInAnonymously(auth);
    console.log('Successfully connected to Firebase! User ID:', result.user.uid);
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('Firebase connection test passed!');
    } else {
      console.log('Firebase connection test failed!');
    }
    setTimeout(() => process.exit(success ? 0 : 1), 2000);
  });
