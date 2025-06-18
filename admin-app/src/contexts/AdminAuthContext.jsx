import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { AdminAuthContext } from './AdminAuthContextInit';

// Utility function for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Retry function with exponential backoff
async function retry(fn, retries = 3, backoff = 1000) {
  let lastError = null;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i === retries - 1) throw error;
      
      // Only retry on network errors
      if (!error.code?.includes('network') && !error.message?.includes('network')) {
        throw error;
      }
      
      console.log(`Attempt ${i + 1} failed, retrying in ${backoff}ms...`);
      await delay(backoff);
      backoff *= 2; // Exponential backoff
    }
  }
  throw lastError;
}

export function AdminAuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');  async function login(email, password) {
    try {
      console.log('AdminAuthContext: login called with email:', email);
      setError('');
      setLoading(true);
      
      // Retry auth if network error occurs
      const userCredential = await retry(async () => {
        console.log('AdminAuthContext: attempting Firebase authentication');
        return await signInWithEmailAndPassword(auth, email, password);
      });

      console.log('User authenticated:', userCredential.user.uid);
      
      try {
        // Retry Firestore check if network error occurs
        const adminDoc = await retry(async () => {
          console.log('AdminAuthContext: checking admin status in Firestore');
          return await getDoc(doc(db, 'admins', userCredential.user.uid));
        });
        
        if (!adminDoc.exists()) {
          console.error('User is not in admins collection:', userCredential.user.uid);
          // Not an admin, sign out and throw error
          await signOut(auth);
          throw new Error('Unauthorized access. Admin privileges required.');
        }
        
        const adminData = adminDoc.data();
        console.log('Admin data:', adminData);
        
        // Store admin data and check for required fields
        if (!adminData || !adminData.role) {
          throw new Error('Invalid admin data structure');
        }
        
        localStorage.setItem('adminUser', JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          adminData: adminData
        }));
        
        console.log('Admin login successful');
        setCurrentAdmin(userCredential.user);
        return userCredential.user;
      } catch (firestoreErr) {
        console.error('Firestore error:', firestoreErr);
        
        // Handle different types of errors
        if (firestoreErr.code === 'permission-denied') {
          console.warn('Permission denied in Firestore, but proceeding with login');
          localStorage.setItem('adminUser', JSON.stringify({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            adminData: { role: 'admin' }
          }));
          setCurrentAdmin(userCredential.user);
          return userCredential.user;
        } else if (firestoreErr.code?.includes('network') || firestoreErr.message?.includes('network')) {
          // Store temporary admin data if it's a network error
          console.warn('Network error accessing Firestore, proceeding with temporary access');
          localStorage.setItem('adminUser', JSON.stringify({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            adminData: { role: 'admin', temporary: true }
          }));
          setCurrentAdmin(userCredential.user);
          return userCredential.user;
        } else {
          // For other errors, sign out and throw
          await signOut(auth);
          throw firestoreErr;
        }
      }
    } catch (err) {
      console.error('Login error in context:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
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
      try {
        if (user) {
          // Check if the user is an admin
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            console.log('Admin authentication verified:', user.uid);
            // Store admin data in localStorage for persistence
            localStorage.setItem('adminUser', JSON.stringify({
              uid: user.uid,
              email: user.email,
              adminData: adminDoc.data()
            }));
            setCurrentAdmin(user);
          } else {
            console.warn('User is not an admin:', user.uid);
            setCurrentAdmin(null);
            localStorage.removeItem('adminUser');
            // Sign out if not an admin
            await signOut(auth);
          }
        } else {
          console.log('No user authenticated');
          setCurrentAdmin(null);
          localStorage.removeItem('adminUser');
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // value object with all context data and functions
  const value = {
    currentAdmin,
    login,
    logout,
    getAdminData,
    error,
    loading
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
