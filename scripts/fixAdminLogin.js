// Fix Firestore security rules to ensure admins can access their data
// Run this script with: npm run fix-admin-login

import { getFirestore, writeBatch, doc, collection, getDocs, setDoc } from 'firebase/firestore';
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

// Function to ensure the admins collection exists and has proper structure
async function fixAdminCollection() {
  try {
    console.log('Running admin login fix script...');

    // Check if admins collection exists and has documents
    const adminsSnapshot = await getDocs(collection(db, 'admins'));
    
    if (adminsSnapshot.empty) {
      console.log('No admins found. Creating a default admin...');
      
      // Create a placeholder admin document to ensure the collection exists
      // You'll need to replace this with a real admin in production
      await setDoc(doc(db, 'admins', 'admin123'), {
        email: 'admin@chickenviken.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
        displayName: 'Default Admin'
      });
      
      console.log('Created default admin document');
    } else {
      console.log(`Found ${adminsSnapshot.size} admin documents. Collection exists.`);
    }

    console.log('Admin login fix completed successfully');
  } catch (error) {
    console.error('Error fixing admin login:', error);
  }
}

// Run the fix
fixAdminCollection();
