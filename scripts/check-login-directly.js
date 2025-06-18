// check-login-directly.js - Simple script to test login functionality
// Run this script with: node check-login-directly.js

const email = 'admin@chickenviken.com';
const password = 'Admin123!';

// Importing Firebase directly to check login
async function testLogin() {
  try {
    // Import Firebase modules dynamically
    const { initializeApp } = await import('firebase/app');
    const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');

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

    console.log(`Attempting to login with email: ${email}`);
    
    // Sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful!', userCredential.user.uid);
    
    // Check if user is admin
    const adminDocRef = doc(db, 'admins', userCredential.user.uid);
    const adminDoc = await getDoc(adminDocRef);
    
    if (adminDoc.exists()) {
      console.log('User is confirmed as admin!');
      console.log('Admin data:', adminDoc.data());
    } else {
      console.log('User is NOT an admin in Firestore!');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// Run the test
testLogin();
