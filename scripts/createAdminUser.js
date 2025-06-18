// createAdminUser.js - Script to create a test admin user
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
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

// Admin details
const adminEmail = 'admin@chickenviken.com';
const adminPassword = 'Admin123!';

// Function to create a test admin user
async function createAdminUser() {
  try {
    console.log(`Creating admin user with email: ${adminEmail}`);
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log(`User created with UID: ${user.uid}`);
    
    // Add user to admins collection in Firestore
    await setDoc(doc(db, 'admins', user.uid), {
      email: adminEmail,
      role: 'admin',
      createdAt: new Date().toISOString(),
      displayName: 'Test Admin'
    });
    
    console.log('Successfully created admin user in Firestore');
  } catch (error) {
    console.error('Error creating admin user:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('User already exists. Try logging in with this email.');
    }
  }
}

// Run the function
createAdminUser();
