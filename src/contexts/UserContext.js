import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/axios";
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

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      setError(null)
      try {
        // Only fetch if authenticated AND token is ready in localStorage
        if (isAuthenticated && tokenReady) {
          console.log("[UserContext] Fetching user profile with auth token...")
          const { data } = await api.get("/user/profile")
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
    }

    // Wait for both authentication to complete AND token to be ready
    if (!isLoading) {
      fetchUser()
    }
  }, [isAuthenticated, isLoading, tokenReady])

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  )
}
