// create-admin-browser.js - Script using Firebase web SDK
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPtdOYy9lRguwon8vsNySVT2PBVAPFi_c",
  authDomain: "chickenviken-30bd9.firebaseapp.com",
  projectId: "chickenviken-30bd9",
  storageBucket: "chickenviken-30bd9.firebasestorage.app",
  messagingSenderId: "235277268712",
  appId: "1:235277268712:web:7c0f02af12bcee6f047b5d"
};

console.log('Initializing Firebase app...');
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized:', app.name);

const auth = getAuth(app);
console.log('Firebase Auth initialized');

const db = getFirestore(app);
console.log('Firestore initialized');

// Admin credentials
const email = 'admin@chickenviken.com';
const password = 'Admin123!';

async function createAdmin() {
  console.log('Starting admin creation process...');
  console.log(`Target email: ${email}`);
  
  try {
    // First try to create new user
    console.log('Attempting to create new user...');
    let userCredential;
    
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Successfully created new user:', userCredential.user.uid);
    } catch (createError) {
      console.log('User creation failed, might already exist:', createError.message);
      
      // If user exists, try to sign in
      console.log('Attempting to sign in...');
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Successfully signed in existing user:', userCredential.user.uid);
    }
    
    const user = userCredential.user;
    console.log('Got user object:', user.uid);
    
    // Add user to admins collection in Firestore
    const adminData = {
      email: user.email,
      displayName: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    console.log('Adding admin document to Firestore...');
    const adminDocRef = doc(db, 'admins', user.uid);
    await setDoc(adminDocRef, adminData);
    console.log('Admin document added successfully');
    
    // Verify the document exists
    const verifyDoc = await getDoc(adminDocRef);
    if (verifyDoc.exists()) {
      console.log('Verified admin document exists:', verifyDoc.data());
    } else {
      throw new Error('Failed to verify admin document creation');
    }
    
    console.log('Admin creation process completed successfully');
    return { success: true, userId: user.uid };
    
  } catch (error) {
    console.error('Error in admin creation process:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
}

// Run the admin creation process
console.log('Starting script execution...');

createAdmin()
  .then((result) => {
    console.log('Script completed successfully:', result);
    setTimeout(() => process.exit(0), 3000);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    setTimeout(() => process.exit(1), 3000);
  });
