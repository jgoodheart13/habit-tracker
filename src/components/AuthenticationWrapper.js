// AuthenticationWrapper.js
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export function AuthenticationWrapper({ children }) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    async function setAuthToken() {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently({
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
            scope: "openid profile email"
          });
          localStorage.setItem("auth_token", token);
        } catch (err) {
          console.error("Error getting Auth0 token:", err);
        }
      }
      setTokenReady(true);
    }
    setAuthToken();
    const refreshInterval = setInterval(setAuthToken, 3600000);
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isAuthenticated && !tokenReady) return null; // or a loading spinner

  return children;
}