import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { AuthContext } from './AuthContextInit';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function signup(email, password, name, phone) {
    try {
      setError('');
      // First create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      try {
        // Update user profile with name
        await updateProfile(userCredential.user, {
          displayName: name
        });
      } catch (profileErr) {
        console.error("Error updating profile:", profileErr);
        // Continue even if profile update fails
      }
      
      try {
        // Store additional user data in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name,
          phone,
          email,
          createdAt: new Date().toISOString()
        });
      } catch (dbErr) {
        console.error("Error storing user data:", dbErr);
        // Continue even if storing data fails
      }
      
      return userCredential.user;
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message);
      throw err;
    }
  }

  async function login(email, password) {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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

  async function getUserData() {
    if (!currentUser) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    getUserData,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
