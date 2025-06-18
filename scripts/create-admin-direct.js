// create-admin-direct.js
// This script will create an admin user directly in the Firestore database
// Use this when you have permissions issues

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK without requiring a service account key
// This works for local development with emulators
admin.initializeApp({
  projectId: 'chickenviken-30bd9'
});

// Set environment variables for Firebase emulators
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

const db = admin.firestore();

async function createAdmin() {
  const email = 'admin@chickenviken.com';
  const displayName = 'Admin User';
  
  try {
    // First, create the user in Firebase Auth
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
      console.log('User already exists:', user.uid);
    } catch (error) {
      // User doesn't exist, create it
      user = await admin.auth().createUser({
        email: email,
        password: 'Admin123!',
        displayName: displayName,
      });
      console.log('User created with UID:', user.uid);
    }
    
    // Set custom claims to mark as admin
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log('Set admin custom claims for user:', user.uid);
    
    // Add or update the user in the admins collection
    await db.collection('admins').doc(user.uid).set({
      email: email,
      displayName: displayName,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Admin user successfully created/updated in Firestore');
    
    // Verify admin exists in Firestore
    const adminDoc = await db.collection('admins').doc(user.uid).get();
    if (adminDoc.exists) {
      console.log('Verified admin exists in Firestore:', adminDoc.data());
    } else {
      console.error('Failed to verify admin in Firestore');
    }
      } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdmin()
  .then(() => {
    console.log('Admin creation process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
