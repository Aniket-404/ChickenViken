import { useState, useEffect, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { AuthContext } from './context.jsx';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');  // Sign up function (for creating new admin accounts)
  async function signup(email, password, displayName) {
    try {
      // First create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;
      
      try {
        // Then create the admin document
        await setDoc(doc(db, 'admins', uid), {
          email,
          displayName,
          role: 'admin',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        }, { merge: true }); // Use merge to avoid overwriting if document exists
        
        // Set the user role immediately to avoid permission issues
        setUserRole('admin');
        console.log('Admin document created successfully');
        
        return userCredential.user;
      } catch (docError) {
        console.error('Error creating admin document:', docError);
        // If admin document creation fails, delete the user to maintain consistency
        try {
          await userCredential.user.delete();
        } catch (deleteError) {
          console.error('Error cleaning up user after failed admin creation:', deleteError);
        }
        
        if (docError.code === 'permission-denied') {
          throw new Error('Permission denied. Please check Firestore rules.');
        } else {
          throw new Error(`Failed to create admin account: ${docError.message}`);
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.code ? `Error: ${err.code.replace('auth/', '')}` : err.message;
      setError(errorMessage);
      throw err;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      
      if (!adminDoc.exists()) {
        await signOut(auth);
        throw new Error('Unauthorized access. Admin privileges required.');
      }
      
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
  }  // Check if user has admin role
  const checkAdminRole = useCallback(async (uid) => {
    try {
      // If we already know they're an admin, don't need to check
      if (userRole === 'admin') return 'admin';
      
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
      // If this is right after signup, we already know they're an admin
      if (userRole === 'admin') return 'admin';
      
      console.error("Error checking admin role:", err);
      setUserRole(null);
      return null;
    }
  }, [userRole]);

  // Helper function to check if user is admin
  const isAdmin = () => {
    return userRole === 'admin';
  };
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
  }, [checkAdminRole]);

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
