// verify-firestore-access.js
// This script verifies if we can access Firestore from the browser

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase configuration - same as in your app
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
const db = getFirestore(app);

// Function to test Firestore access
async function testFirestoreAccess() {
  console.log('Testing Firestore access...');
  
  try {
    // Try to get all collections
    const collections = ['admins', 'users', 'products', 'orders'];
    
    for (const collName of collections) {
      try {
        console.log(`Trying to access collection: ${collName}`);
        const snapshot = await getDocs(collection(db, collName));
        console.log(`Success! Found ${snapshot.size} documents in ${collName}`);
      } catch (err) {
        console.error(`Error accessing ${collName}:`, err);
      }
    }
    
  } catch (error) {
    console.error('Error testing Firestore access:', error);
  }
}

// Run the test
testFirestoreAccess();
