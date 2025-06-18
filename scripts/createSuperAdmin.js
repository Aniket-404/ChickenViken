// createSuperAdmin.js
// Run this script to create your first admin user in Firestore
// Usage: node createSuperAdmin.js admin@example.com adminUserId

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
initializeApp({
  projectId: 'chickenviken-30bd9'
});

const db = getFirestore();

async function createSuperAdmin() {
  if (process.argv.length < 4) {
    console.error('Usage: node createSuperAdmin.js admin@example.com adminUserId');
    process.exit(1);
  }

  const email = process.argv[2];
  const userId = process.argv[3];

  try {
    // Create admin document
    await db.collection('admins').doc(userId).set({
      email: email,
      role: 'superadmin',
      createdAt: new Date(),
      permissions: ['read', 'write', 'delete', 'create_admin']
    });

    console.log(`Super admin created successfully: ${email} (${userId})`);
  } catch (error) {
    console.error('Error creating super admin:', error);
  }
}

createSuperAdmin();
