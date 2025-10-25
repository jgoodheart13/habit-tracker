// AuthenticationWrapper.js
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import React from "react";
import LoadingScreen from "./LoadingScreen";
import settings from "../config/settings"

export const AuthContext = React.createContext({ tokenReady: false })

export function AuthenticationWrapper({ children }) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [tokenReady, setTokenReady] = useState(false)

  useEffect(() => {
    async function setAuthToken() {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently({
            audience: settings.authAudience,
            scope: "openid profile email",
          })
          localStorage.setItem("auth_token", token)
          setTokenReady(true)
          console.log("Auth0 token set in localStorage")
        } catch (err) {
          console.error("Error getting Auth0 token:", err)
        }
      }
    }
    if (isAuthenticated) setAuthToken()
    const refreshInterval = setInterval(setAuthToken, 3600000)
    return () => clearInterval(refreshInterval)
  }, [isAuthenticated])

  // if (!tokenReady && window.location.href.endsWith("logout")=== false) {
  //   return <LoadingScreen />;
  // }

  return (
    <AuthContext.Provider value={{ tokenReady }}>
      {children}
    </AuthContext.Provider>
  )
}