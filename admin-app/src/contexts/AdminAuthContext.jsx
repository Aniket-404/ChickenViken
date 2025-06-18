import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { adminAuth, adminDb } from '../firebase/adminConfig';
import { AdminAuthContext } from './AdminAuthContextInit';

export function AdminAuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sign up function for creating new admin users
  async function signup(email, password, displayName) {
    try {
      setError('');
      setLoading(true);

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(adminAuth, email, password);
      console.log('Admin user created:', userCredential.user.uid);

      // Create admin document in Firestore
      await setDoc(doc(adminDb, 'admins', userCredential.user.uid), {
        email,
        displayName,
        role: 'admin',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });

      return userCredential.user;
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }
  // Login function
  async function login(email, password, retryCount = 0) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1500; // 1.5 seconds
    
    try {
      setError('');
      setLoading(true);

      // Try to log in with Firebase
      try {
        const userCredential = await signInWithEmailAndPassword(adminAuth, email, password);
        console.log('Admin logged in:', userCredential.user.uid);

        // Try to update last login timestamp (but don't fail if this part fails)
        try {
          await setDoc(doc(adminDb, 'admins', userCredential.user.uid), {
            lastLogin: serverTimestamp()
          }, { merge: true });
        } catch (firestoreErr) {
          console.warn('Could not update last login timestamp, but login was successful:', firestoreErr);
        }

        return userCredential.user;
      } catch (authErr) {
        console.error('Auth error:', authErr.code, authErr.message);
        
        // Handle service unavailable errors with retries
        if ((authErr.code === 'auth/visibility-check-was-unavailable' || 
             authErr.code === 'auth/network-request-failed' ||
             authErr.message?.includes('Service Unavailable')) && 
            retryCount < MAX_RETRIES) {
          
          console.log(`Retrying login attempt (${retryCount + 1}/${MAX_RETRIES})...`);
          setError(`Service temporarily unavailable. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return login(email, password, retryCount + 1);
        }
        
        // If it's another error or we've exhausted retries, rethrow
        throw authErr;
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Create user-friendly error message
      let errorMessage = 'Login failed. ';
      if (err.code === 'auth/visibility-check-was-unavailable' || err.message?.includes('visibility-check')) {
        errorMessage += 'Firebase authentication service is temporarily unavailable. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage += 'Network connection issue. Please check your internet connection.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage += 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage += 'Too many unsuccessful login attempts. Please try again later.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Logout function
  async function logout() {
    try {
      await signOut(adminAuth);
      localStorage.removeItem('adminUser');
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
      throw err;
    }
  }

  // Get admin data
  async function getAdminData(uid) {
    try {
      const adminDoc = await getDoc(doc(adminDb, 'admins', uid));
      return adminDoc.exists() ? adminDoc.data() : null;
    } catch (err) {
      console.error('Error fetching admin data:', err);
      return null;
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(adminAuth, async (user) => {
      if (user) {
        const adminData = await getAdminData(user.uid);
        if (adminData) {
          setCurrentAdmin({ ...user, adminData });
          localStorage.setItem('adminUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            adminData
          }));
        } else {
          setCurrentAdmin(null);
          localStorage.removeItem('adminUser');
        }
      } else {
        setCurrentAdmin(null);
        localStorage.removeItem('adminUser');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentAdmin,
    signup,
    login,
    logout,
    loading,
    error
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
}
