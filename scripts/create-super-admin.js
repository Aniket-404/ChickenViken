// Create First Super Admin Script
// Run this script once to create the first super-admin user

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Super admin details - CHANGE THESE
const ADMIN_EMAIL = 'superadmin@chickenviken.com';
const ADMIN_PASSWORD = 'StrongPassword123!'; // Change this after creation!
const ADMIN_NAME = 'Super Admin';

async function createSuperAdmin() {
  try {
    console.log(`Creating super admin account for ${ADMIN_EMAIL}...`);
    
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const uid = userCredential.user.uid;
    
    console.log(`User created with UID: ${uid}`);
    
    // Add the user to the admins collection as a super-admin
    await setDoc(doc(db, 'admins', uid), {
      uid,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'super-admin',
      permissions: ['read', 'write', 'delete', 'manageAdmins'],
      createdAt: serverTimestamp()
    });
    
    console.log('Super admin created successfully!');
    console.log('IMPORTANT: Sign in and change the password immediately.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
