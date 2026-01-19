import { useEffect, useState } from "react"
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext"
import React from "react"

export const AuthContext = React.createContext({ tokenReady: false })

export function AuthenticationWrapper({ children }) {
  const { isAuthenticated, getAccessToken } = useSupabaseAuth()
  const [tokenReady, setTokenReady] = useState(false)

  useEffect(() => {
    async function setAuthToken() {
      if (isAuthenticated) {
        try {
          // Get Supabase access token
          const token = await getAccessToken()

          if (token) {
            localStorage.setItem("auth_token", token)
            setTokenReady(true)
          }
        } catch (err) {
          console.error("Error getting Supabase token:", err)
        }
      } else {
        // Clear token if not authenticated
        setTokenReady(false)
      }
    }

    if (isAuthenticated) {
      setAuthToken()
    }

    // Refresh token every hour
    // Supabase automatically handles token refresh, but we update localStorage
    const refreshInterval = setInterval(setAuthToken, 3600000)

    return () => clearInterval(refreshInterval)
  }, [isAuthenticated, getAccessToken])

  // Optional: Show loading screen until token is ready
  // if (!tokenReady && window.location.href.endsWith("logout") === false) {
  //   return <LoadingScreen />;
  // }

  return (
    <AuthContext.Provider value={{ tokenReady }}>
      {children}
    </AuthContext.Provider>
  )
}
