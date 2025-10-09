// AuthenticationWrapper.js
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export function AuthenticationWrapper({ children }) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  
  useEffect(() => {
    async function setAuthToken() {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem("auth_token", token);
          console.log("Auth token set successfully");
        } catch (err) {
          console.error("Error getting Auth0 token:", err);
        }
      }
    }
    
    setAuthToken();
    
    // Set up a token refresh interval - adjust time based on your token expiration
    const refreshInterval = setInterval(() => {
      setAuthToken();
    }, 3600000); // Refresh every hour (or adjust based on your token lifetime)
    
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, getAccessTokenSilently]);
  
  return children;
}