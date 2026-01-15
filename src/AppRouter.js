import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { useSupabaseAuth } from "./contexts/SupabaseAuthContext"
import DailyViewPage from "./pages/DailyViewPage"
import LogoutPage from "./pages/LogoutPage"
import AuthCallbackPage from "./pages/AuthCallbackPage"

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading, loginWithGoogle } = useSupabaseAuth()

  React.useEffect(() => {
    // Redirect to Google OAuth if not authenticated
    if (!isLoading && !isAuthenticated) {
      loginWithGoogle()
    }
  }, [isLoading, isAuthenticated, loginWithGoogle])

  // Show nothing while loading or redirecting to login
  if (isLoading) return null

  // Render protected content only if authenticated
  return isAuthenticated ? children : null
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Protected route - requires authentication */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DailyViewPage />
            </PrivateRoute>
          }
        />

        {/* OAuth callback - handles redirect from Google */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Logout page */}
        <Route path="/logout" element={<LogoutPage />} />
      </Routes>
    </Router>
  )
}
