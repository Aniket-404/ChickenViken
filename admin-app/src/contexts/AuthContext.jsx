import { createContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sign up function (for creating new admin accounts)
  async function signup(email, password, displayName) {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create admin document in Firestore
      await setDoc(doc(db, 'admins', userCredential.user.uid), {
        email,
        displayName,
        role: 'admin',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is an admin
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      
      if (!adminDoc.exists()) {
        // Not an admin, sign out and throw error
        await signOut(auth);
        throw new Error('Unauthorized access. Admin privileges required.');
      }
      
      // Update last login timestamp
      await setDoc(doc(db, 'admins', userCredential.user.uid), {
        lastLogin: serverTimestamp()
      }, { merge: true });
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Logout function
  async function logout() {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Check if user has admin role
  async function checkAdminRole(uid) {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', uid));
      if (adminDoc.exists()) {
        const data = adminDoc.data();
        setUserRole(data.role);
        return data.role;
      } else {
        setUserRole(null);
        return null;
      }
    } catch (err) {
      console.error("Error checking admin role:", err);
      setUserRole(null);
      return null;
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await checkAdminRole(user.uid);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);
  // Helper function to check if user is admin
  const isAdmin = () => {
    return userRole === 'admin';
  };

  const value = {
    currentUser,
    userRole,
    login,
    signup,
    logout,
    error,
    loading,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
