// simple-admin.js - Simplified script to create admin
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createSimpleAdmin() {
  console.log('Creating admin document...');
  
  try {
    // Create a custom admin ID
    const adminId = 'admin_' + Date.now();
    
    // Admin data
    const adminData = {
      email: 'admin@chickenviken.com',
      displayName: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    // Add to Firestore
    console.log(`Adding admin document with ID: ${adminId}`);
    await setDoc(doc(db, 'admins', adminId), adminData);
    
    console.log('Admin document created successfully');
    console.log('Admin data:', adminData);
    
    return { success: true, adminId };
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
}

// Run the script
console.log('Starting admin creation...');

createSimpleAdmin()
  .then(result => {
    console.log('Successfully created admin:', result);
    setTimeout(() => process.exit(0), 2000);
  })
  .catch(error => {
    console.error('Failed to create admin:', error);
    setTimeout(() => process.exit(1), 2000);
  });
