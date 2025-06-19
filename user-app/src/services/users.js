import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * IMPORTANT: For these functions to work properly, Firestore security rules must be deployed
 * to your Firebase project. See FIREBASE_RULES_DEPLOYMENT.md for instructions.
 */

/**
 * Fetches user data from Firestore
 * @param {string} userId - The user's ID
 * @returns {Promise<Object|null>} The user data or null if not found
 */
export const fetchUserData = async (userId) => {
  try {
    if (!userId) return null;
    
    console.log('fetchUserData - UserId:', userId);
    console.log('fetchUserData - Project ID:', db._databaseId.projectId);
    
    const userRef = doc(db, 'users', userId);
    console.log('fetchUserData - Attempting to get document from path:', userRef.path);
    
    const userDoc = await getDoc(userRef);
    console.log('fetchUserData - Document exists?', userDoc.exists());
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

/**
 * Creates a new user in Firestore
 * @param {string} userId - The user's ID
 * @param {Object} userData - The user data to store
 * @returns {Promise<void>}
 */
export const createUser = async (userId, userData) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    console.log('createUser - UserId:', userId);
    console.log('createUser - Project ID:', db._databaseId.projectId);
    console.log('createUser - User data:', userData);
    
    const userRef = doc(db, 'users', userId);
    console.log('createUser - Document path:', userRef.path);
    
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date()
    });
    
    console.log('createUser - User document created successfully');
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Updates user data in Firestore
 * @param {string} userId - The user's ID
 * @param {Object} userData - The user data to update
 * @returns {Promise<void>}
 */
export const updateUserData = async (userId, userData) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    const userRef = doc(db, 'users', userId);
    
    // Check if the document exists first
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      // Update existing document
      console.log('Updating existing user document');
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date()
      });
    } else {
      // Create new document if it doesn't exist
      console.log('Creating new user document');
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};

/**
 * Creates or updates user data in Firestore
 * This function will create the document if it doesn't exist,
 * or update it if it does.
 * 
 * @param {string} userId - The user's ID
 * @param {Object} userData - The user data
 * @returns {Promise<void>}
 */
export const createOrUpdateUser = async (userId, userData) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    console.log('Creating or updating user document for:', userId);
    
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    }, { merge: true }); // merge: true will update fields in the document or create it if it doesn't exist
    
    console.log('User document created or updated successfully');
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

/**
 * Fetches user addresses from Firestore
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of addresses
 */
export const fetchUserAddresses = async (userId) => {
  try {
    const userData = await fetchUserData(userId);
    return userData?.addresses || [];
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    throw error;
  }
};

/**
 * Updates user addresses in Firestore
 * @param {string} userId - The user's ID
 * @param {Array} addresses - The updated addresses array
 * @returns {Promise<void>}
 */
export const updateUserAddresses = async (userId, addresses) => {
  try {
    await updateUserData(userId, { addresses });
  } catch (error) {
    console.error('Error updating user addresses:', error);
    throw error;
  }
};

/**
 * Adds a new address to a user's addresses
 * @param {string} userId - The user's ID
 * @param {Object} address - The address to add
 * @returns {Promise<{id: string}>} The address with the generated ID
 */
export const addUserAddress = async (userId, address) => {
  try {
    if (!userId) throw new Error('User ID is required');
    
    // Get current user data
    const userData = await fetchUserData(userId);
    
    // Generate a unique ID for the address
    const addressId = `addr_${Date.now()}`;
    
    // Create address with ID
    const newAddress = {
      ...address,
      id: addressId
    };
    
    // Get existing addresses or initialize empty array
    const existingAddresses = userData?.addresses || [];
    
    // Add new address to the array
    const updatedAddresses = [...existingAddresses, newAddress];
    
    // Update user with new addresses array
    await updateUserData(userId, { addresses: updatedAddresses });
    
    // Return the address with ID for client-side usage
    return {
      id: addressId
    };
  } catch (error) {
    console.error('Error adding user address:', error);
    throw error;
  }
};
