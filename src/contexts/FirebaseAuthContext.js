import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  getRedirectResult
} from 'firebase/auth';
import { auth } from '../services/firebase';

const FirebaseAuthContext = createContext({});

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthenticated(!!firebaseUser);
      setIsLoading(false);
    });

    // Check for redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          setIsAuthenticated(true);
        }
      })
      .catch((error) => {
        console.error('Error getting redirect result:', error);
        setError(error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const loginWithRedirect = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error during redirect login:', error);
      setError(error);
      throw error;
    }
  };

  const loginWithPopup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setIsAuthenticated(true);
      return result;
    } catch (error) {
      console.error('Error during popup login:', error);
      setError(error);
      throw error;
    }
  };

  const logout = async (options = {}) => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      
      // Handle returnTo if provided
      if (options.logoutParams?.returnTo) {
        window.location.href = options.logoutParams.returnTo;
      }
    } catch (error) {
      console.error('Error during logout:', error);
      setError(error);
      throw error;
    }
  };

  const getAccessTokenSilently = async () => {
    try {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        return token;
      }
      throw new Error('No authenticated user');
    } catch (error) {
      console.error('Error getting token:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithRedirect,
    loginWithPopup,
    logout,
    getAccessTokenSilently,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
