import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserProfile } from "../api/userApi";
import { useSupabaseAuth } from "./SupabaseAuthContext";
import { AuthContext } from "../components/AuthenticationWrapper"

const UserContext = createContext()

export const useUserContext = () => useContext(UserContext)

export const UserProvider = ({ children }) => {
  const { isAuthenticated, isLoading } = useSupabaseAuth()
  const { tokenReady } = useContext(AuthContext)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUser = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Only fetch if authenticated AND token is ready in localStorage
      if (isAuthenticated && tokenReady) {
        const data = await getUserProfile()
        setUser(data)
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("[UserContext] Error fetching user profile:", err)
      setError(err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, tokenReady])

  useEffect(() => {
    // Wait for both authentication to complete AND token to be ready
    if (!isLoading) {
      fetchUser()
    }
  }, [isLoading, fetchUser])

  return (
    <UserContext.Provider
      value={{ user, loading, error, refetchUser: fetchUser }}
    >
      {children}
    </UserContext.Provider>
  )
}
