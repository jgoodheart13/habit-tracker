/**
 * Login Page Component
 *
 * Landing page for unauthenticated users with manual login button.
 * Allows users to explicitly choose to sign in with Google OAuth.
 */

import React from "react"
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext"
import theme from "../styles/theme"

export default function LoginPage() {
  const { loginWithGoogle, isLoading } = useSupabaseAuth()

  const handleLogin = () => {
    loginWithGoogle()
  }

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
        backgroundColor: theme.colors.background,
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <img
          src={`${process.env.PUBLIC_URL}/Reach4LogoMock-NoLogo-transparent.png`}
          alt="Reach 4 Logo"
          style={{
            width: "200px",
            height: "auto",
          }}
        />
        <h1
          style={{
            color: theme.colors.accent,
            margin: "0 0 10px 0",
            fontSize: "2.5rem",
          }}
        >
          Reach 4
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: theme.colors.textSecondary,
            marginBottom: "40px",
          }}
        >
          Build your core, reach for more
        </p>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            width: "100%",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "500",
            fontFamily: "Roboto, arial, sans-serif",
            color: "#3c4043",
            backgroundColor: "#fff",
            border: "1px solid #dadce0",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
            transition: "background-color 0.2s, box-shadow 0.2s",
            boxShadow: "0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)",
          }}
          onMouseOver={(e) => {
            if (!isLoading) {
              e.target.style.backgroundColor = "#f8f9fa"
              e.target.style.boxShadow = "0 1px 3px 0 rgba(60,64,67,0.30), 0 4px 8px 3px rgba(60,64,67,0.15)"
            }
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#fff"
            e.target.style.boxShadow = "0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)"
          }}
          onFocus={(e) => {
            e.target.style.outline = "none"
            e.target.style.boxShadow = "0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)"
          }}
        >
          {!isLoading && (
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <g fill="none" fillRule="evenodd">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </g>
            </svg>
          )}
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </button>

        <p
          style={{
            marginTop: "30px",
            fontSize: "0.9rem",
            color: theme.colors.textSecondary,
          }}
        >
          
        </p>
      </div>
    </div>
  )
}
