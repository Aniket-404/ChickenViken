import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { AdminAuthContext } from './AdminAuthContextInit';

export function AdminAuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function login(email, password) {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if the user is an admin
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      
      if (!adminDoc.exists()) {
        // Not an admin, sign out and throw error
        await signOut(auth);
        throw new Error('Unauthorized access. Admin privileges required.');
      }
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function logout() {
    try {
      setError('');
      return await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function getAdminData() {
    if (!currentAdmin) return null;
    
    try {
      const adminDoc = await getDoc(doc(db, 'admins', currentAdmin.uid));
      if (adminDoc.exists()) {
        return adminDoc.data();
      } else {
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if the user is an admin
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          setCurrentAdmin(user);
        } else {
          setCurrentAdmin(null);
        }
      } else {
        setCurrentAdmin(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentAdmin,
    login,
    logout,
    getAdminData,
    error
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
}
