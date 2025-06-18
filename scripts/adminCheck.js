// adminCheck.js - Script to check for admins in Firestore
// @ts-check

import { getFirestore, collection, getDocs } from 'firebase/firestore';
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
const db = getFirestore(app);

// Function to check for admins
async function checkAdmins() {
  try {
    console.log('Checking for admins in Firestore...');
    const adminsSnapshot = await getDocs(collection(db, 'admins'));
    
    if (adminsSnapshot.empty) {
      console.log('No admins found in Firestore!');
      return;
    }
    
    console.log(`Found ${adminsSnapshot.size} admin(s):`);
    adminsSnapshot.forEach(doc => {
      console.log(`Admin ID: ${doc.id}, Data:`, doc.data());
    });
  } catch (error) {
    console.error('Error checking admins:', error);
  }
}

// Run the check
checkAdmins();
