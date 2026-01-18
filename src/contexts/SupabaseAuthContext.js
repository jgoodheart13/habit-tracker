/**
 * Supabase Authentication Context
 * 
 * Replaces Auth0Provider with Supabase Auth implementation.
 * 
 * AUTHENTICATION FLOW:
 * 1. User clicks login → loginWithGoogle() called
 * 2. Redirect to Google OAuth consent screen
 * 3. User authorizes → Google redirects to /auth/callback
 * 4. AuthCallbackPage handles the redirect and extracts session
 * 5. onAuthStateChange listener updates user state
 * 6. App renders with authenticated user
 * 
 * SESSION MANAGEMENT:
 * - Sessions persist in localStorage automatically
 * - Tokens auto-refresh before expiration
 * - onAuthStateChange fires on login/logout/token refresh
 * 
 * USAGE:
 * const { user, session, isAuthenticated, isLoading, loginWithGoogle, logout } = useSupabaseAuth();
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const SupabaseAuthContext = createContext({});

/**
 * Hook to access Supabase authentication context
 * @throws {Error} If used outside SupabaseAuthProvider
 */
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get initial session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    // Listen for auth state changes
    // This fires on: sign in, sign out, token refresh, session recovery
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with Google using OAuth redirect
   * 
   * IMPORTANT: This redirects the entire page to Google OAuth.
   * After authorization, Google redirects to /auth/callback.
   * The AuthCallbackPage component handles the callback and extracts the session.
   * 
   * CONFIGURATION:
   * - Redirect URL must be configured in Supabase Dashboard
   * - Format: http://localhost:3000/auth/callback (for local)
   * - Format: https://your-domain.com/auth/callback (for production)
   * - Add all environments (local, dev, qa, prod) to Supabase allowed redirect URLs
   * 
   * @returns {Promise<void>}
   */
  const loginWithGoogle = async () => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect back to /auth/callback after Google authorization
          redirectTo: `${window.location.origin}/auth/callback`,
          
          // Optional: Request additional Google scopes
          // scopes: 'email profile',
          
          // Optional: Query parameters to pass to redirect URL
          // queryParams: {
          //   access_type: 'offline',
          //   prompt: 'consent',
          // },
        },
      });

      if (error) {
        console.error('Error initiating Google sign-in:', error.message);
        setError(error);
        throw error;
      }

      // After this point, the browser will redirect to Google
      // Code execution stops here
    } catch (error) {
      console.error('Login error:', error);
      setError(error);
      throw error;
    }
  };

  /**
   * Sign out the current user
   * 
   * This clears the session from localStorage and Supabase backend.
   * The onAuthStateChange listener will automatically update state.
   * 
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      setError(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error during sign out:", error.message)
        setError(error)
        throw error
      }

      // Clear any app-specific cached data
      localStorage.removeItem("auth_token")

      // Clear all Supabase session data from localStorage
      // This prevents auto-login on page reload
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-")) {
          localStorage.removeItem(key)
        }
      })

      // State will be updated by onAuthStateChange listener
    } catch (error) {
      console.error('Logout error:', error);
      setError(error);
      throw error;
    }
  };

  /**
   * Get access token for the current session
   * 
   * This token can be sent to your backend API in the Authorization header.
   * Supabase automatically refreshes tokens before expiration.
   * 
   * @returns {Promise<string|null>} Access token or null if not authenticated
   */
  const getAccessToken = async () => {
    try {
      if (!session) {
        return null;
      }

      // Session object contains access_token
      // Supabase automatically refreshes it if expired
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error.message);
        throw error;
      }

      return currentSession?.access_token ?? null;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  /**
   * Get user metadata (email, name, avatar, etc.)
   * 
   * @returns {Object|null} User metadata from OAuth provider
   */
  const getUserMetadata = () => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
      avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      provider: user.app_metadata?.provider,
    };
  };

  const value = {
    user,                    // Supabase user object
    session,                 // Supabase session object (contains tokens)
    isAuthenticated,         // Boolean: true if user is signed in
    isLoading,               // Boolean: true while determining auth state
    error,                   // Error object if auth operation fails
    loginWithGoogle,         // Function: initiate Google OAuth redirect
    logout,                  // Function: sign out current user
    getAccessToken,          // Function: get access token for API calls
    getUserMetadata,         // Function: get formatted user info
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};
