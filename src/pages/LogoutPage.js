import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import theme from '../styles/theme';

export default function LogoutPage() {
  const { logout } = useAuth0();
  
  useEffect(() => {
    // Clear any stored tokens
    localStorage.removeItem('auth_token');
    
    // Perform Auth0 logout and redirect to home page
    const timer = setTimeout(() => {
      logout({ 
        logoutParams: {
          returnTo: window.location.origin,
        }
      });
    }, 500); // Small delay to ensure component mounts
    
    return () => clearTimeout(timer);
  }, [logout]);
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        color: theme.colors.accent,
        marginBottom: '20px'
      }}>
        Logging out...
      </h1>
      <p style={{ 
        fontSize: '18px',
        color: theme.colors.text
      }}>
        You are being securely logged out.
      </p>
      <div style={{ 
        marginTop: '30px',
        width: '50px',
        height: '50px',
        border: `3px solid ${theme.colors.border}`,
        borderTopColor: theme.colors.accent,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}