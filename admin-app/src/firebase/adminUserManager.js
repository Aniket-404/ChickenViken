// adminUserManager.js
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './config';

/**
 * Promotes a regular user to admin
 * @param {string} uid - The user's UID
 * @param {string} email - The user's email
 * @param {string} role - Role (admin or superadmin)
 * @returns {Promise<boolean>} - Success or failure
 */
export async function promoteUserToAdmin(uid, email, role = 'admin') {
  if (!uid || !email) {
    console.error('UID and email are required');
    return false;
  }
  
  try {
    // Create admin document
    await setDoc(doc(db, 'admins', uid), {
      email,
      role,
      createdAt: new Date(),
      permissions: ['read', 'write', 'delete'],
      lastUpdated: new Date()
    });
    
    console.log(`User promoted to ${role}: ${email} (${uid})`);
    return true;
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return false;
  }
}

/**
 * Checks if a user is an admin
 * @param {string} uid - User ID to check
 * @returns {Promise<Object|null>} - Admin data or null if not admin
 */
export async function checkAdminStatus(uid) {
  if (!uid) return null;
  
  try {
    const adminRef = doc(db, 'admins', uid);
    const adminDoc = await getDoc(adminRef);
    
    if (adminDoc.exists()) {
      return { id: adminDoc.id, ...adminDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return null;
  }
}

/**
 * Lists all admin users
 * @returns {Promise<Array>} - List of admin users
 */
export async function listAllAdmins() {
  try {
    const adminsRef = collection(db, 'admins');
    const adminsSnapshot = await getDocs(adminsRef);
    
    const admins = [];
    adminsSnapshot.forEach(doc => {
      admins.push({ id: doc.id, ...doc.data() });
    });
    
    return admins;
  } catch (error) {
    console.error('Error listing admins:', error);
    return [];
  }
}

/**
 * Revokes admin privileges from a user
 * @param {string} uid - Admin user ID to revoke
 * @returns {Promise<boolean>} - Success or failure
 */
export async function revokeAdminAccess(uid) {
  if (!uid) return false;
  
  try {
    await deleteDoc(doc(db, 'admins', uid));
    console.log(`Admin access revoked for user: ${uid}`);
    return true;
  } catch (error) {
    console.error('Error revoking admin access:', error);
    return false;
  }
}
