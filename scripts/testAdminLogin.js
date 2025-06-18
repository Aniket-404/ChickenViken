// testAdminLogin.js - Script to test admin login functionality
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPtdOYy9lRguwon8vsNySVT2PBVAPFi_c",
  authDomain: "chickenviken-30bd9.firebaseapp.com",
  projectId: "chickenviken-30bd9",
  storageBucket: "chickenviken-30bd9.firebasestorage.app",
  messagingSenderId: "235277268712",
  appId: "1:235277268712:web:7c0f02af12bcee6f047b5d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin credentials
const adminEmail = 'admin@chickenviken.com';
const adminPassword = 'Admin123!';

// Function to test admin login
async function testAdminLogin() {
  try {
    console.log(`Testing admin login with email: ${adminEmail}`);
    
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log(`Authentication successful! User UID: ${user.uid}`);
    
    // Check if the user is in the admins collection
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    
    if (adminDoc.exists()) {
      console.log('User is confirmed as admin in Firestore:', adminDoc.data());
    } else {
      console.error('User authenticated but NOT found in admins collection');
    }
  } catch (error) {
    console.error('Error testing admin login:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

// Run the test
testAdminLogin();
