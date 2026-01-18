/**
 * Auth Callback Page
 * 
 * This page handles the OAuth redirect after Google authentication.
 * 
 * FLOW:
 * 1. User authorizes on Google → Google redirects to /auth/callback?code=xxx
 * 2. This component mounts
 * 3. Supabase client automatically detects and exchanges the code for a session
 * 4. onAuthStateChange in SupabaseAuthContext updates the app state
 * 5. User is redirected to the main app (/)
 * 
 * SUPABASE CONFIGURATION:
 * - Add callback URL to Supabase Dashboard → Authentication → URL Configuration
 * - Allowed redirect URLs should include:
 *   - http://localhost:3000/auth/callback (local)
 *   - https://dev.your-domain.com/auth/callback (dev)
 *   - https://qa.your-domain.com/auth/callback (qa)
 *   - https://your-domain.com/auth/callback (prod)
 * 
 * ERROR HANDLING:
 * - If OAuth fails, Supabase adds error params to URL
 * - Display error message to user
 * - Provide option to retry login
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check URL for OAuth callback parameters
    const handleAuthCallback = async () => {
      try {
        // Check for error in URL params (e.g., ?error=access_denied)
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');

        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          setError(errorDescription || 'Authentication failed. Please try again.');
          return;
        }

        // Supabase client automatically handles the OAuth callback
        // It detects the code/token in URL and exchanges it for a session
        // The session is stored in localStorage and the auth state is updated
        
        // Wait for session to be established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError.message);
          setError('Failed to establish session. Please try logging in again.');
          return;
        }

        if (session) {
          console.log('Authentication successful! User:', session.user.email);
          
          // Small delay to ensure auth context updates
          setTimeout(() => {
            // Redirect to home page
            navigate('/', { replace: true });
          }, 500);
        } else {
          // No session found - might be a direct navigation to this page
          console.warn('No session found in callback');
          setError('No authentication session found.');
        }
      } catch (err) {
        console.error('Error processing auth callback:', err);
        setError('An unexpected error occurred during authentication.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // Show error state
  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            padding: '30px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>
            Authentication Error
          </h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/', { replace: true })}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Show processing state
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          padding: '30px',
        }}
      >
        <h1 style={{ color: '#4285f4', marginBottom: '20px' }}>
          Completing Sign In...
        </h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
          Please wait while we set up your session.
        </p>
        <div
          style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f0f0f0',
            borderTopColor: '#4285f4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }}
        />
      </div>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
