// adminHelpers.js
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';

/**
 * Verifies if a user exists in the admins collection
 * @param {string} uid - User ID to check
 * @returns {Promise<boolean>} - Whether the user is an admin
 */
export async function verifyAdminUser(uid) {
  if (!uid) return false;
  
  try {
    const adminRef = doc(db, 'admins', uid);
    const adminDoc = await getDoc(adminRef);
    return adminDoc.exists();
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return false;
  }
}

/**
 * Creates a temporary admin record for testing
 * IMPORTANT: Use only in development, remove in production!
 */
export async function createTestAdmin(uid, email) {
  if (!uid || !email) return false;
  
  try {
    const adminRef = doc(db, 'admins', uid);
    const adminDoc = await getDoc(adminRef);
    
    if (!adminDoc.exists()) {
      await setDoc(adminRef, {
        email,
        role: 'admin',
        createdAt: new Date(),
        isTestUser: true
      });
      console.log('Test admin created:', uid);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating test admin:', error);
    return false;
  }
}
