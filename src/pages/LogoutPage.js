/**
 * Logout Page Component
 *
 * Handles user sign out from Supabase.
 *
 * LOGOUT FLOW:
 * 1. Component mounts
 * 2. Clear auth_token from localStorage
 * 3. Call Supabase signOut
 * 4. Redirect to home page (login screen)
 *
 * MIGRATION FROM AUTH0:
 * - Replaced Auth0 logout with Supabase logout
 * - Removed Auth0 logoutParams.returnTo
 * - Manual redirect to home page after sign out
 */

import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext"
import theme from "../styles/theme"

export default function LogoutPage() {
  const { logout } = useSupabaseAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Perform Supabase logout and redirect to home page
    const performLogout = async () => {
      try {
        // Clear cached token
        localStorage.removeItem("auth_token")

        // Sign out from Supabase
        await logout()

        // Redirect to login page
        setTimeout(() => {
          navigate("/login", { replace: true })
        }, 1000)
      } catch (error) {
        console.error("Logout error:", error)
        // Redirect anyway
        navigate("/", { replace: true })
      }
    }

    const timer = setTimeout(performLogout, 500)

    return () => clearTimeout(timer)
  }, [logout, navigate])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          color: theme.colors.accent,
          marginBottom: "20px",
        }}
      >
        Logging out...
      </h1>
      <p
        style={{
          fontSize: "18px",
          color: theme.colors.text,
        }}
      >
        You are being securely logged out.
      </p>
      <div
        style={{
          marginTop: "30px",
          width: "50px",
          height: "50px",
          border: `3px solid ${theme.colors.border}`,
          borderTopColor: theme.colors.accent,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
