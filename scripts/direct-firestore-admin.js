// direct-firestore-admin.js
// This script will create an admin document directly in Firestore
// It uses the Firebase JS SDK with admin credentials

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration - make sure this matches your app's config
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
const auth = getAuth(app);

// Admin credentials
const email = 'admin@chickenviken.com';
const password = 'Admin123!';

async function createAdmin() {
  console.log(`Creating admin user with email: ${email}`);
  
  try {
    // Try to sign in first (if user exists)
    let userCredential;
    try {
      console.log('Attempting to sign in...');
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Successfully signed in with existing user:', userCredential.user.uid);
    } catch (signInError) {
      console.log('Sign in failed, attempting to create user:', signInError.message);
      
      // If sign in fails, create the user
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Created new user:', userCredential.user.uid);
    }
    
    const user = userCredential.user;
    
    // Add the user to the admins collection
    console.log(`Adding user ${user.uid} to admins collection...`);
    const adminDocRef = doc(db, 'admins', user.uid);
    
    await setDoc(adminDocRef, {
      email: email,
      displayName: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    
    // Verify the admin document was created
    const adminDoc = await getDoc(adminDocRef);
    if (adminDoc.exists()) {
      console.log('Successfully created admin document in Firestore:', adminDoc.data());
    } else {
      console.error('Failed to create admin document in Firestore');
    }
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdmin()
  .then(() => {
    console.log('Admin creation completed');
    setTimeout(() => process.exit(0), 2000); // Give time for Firestore operations to complete
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
