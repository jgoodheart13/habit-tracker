import React from "react"
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom"
import { useSupabaseAuth } from "./contexts/SupabaseAuthContext"
import DailyViewPage from "./pages/DailyViewPage"
import LoginPage from "./pages/LoginPage"
import LogoutPage from "./pages/LogoutPage"
import AuthCallbackPage from "./pages/AuthCallbackPage"
import DownloadPage from "./pages/DownloadPage"

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useSupabaseAuth()

  // Show nothing while loading
  if (isLoading) return null

  // Redirect to login page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Render protected content if authenticated
  return children
}

export default function AppRouter() {
  const { isAuthenticated, isLoading } = useSupabaseAuth()

  return (
    <Router>
      <Routes>
        {/* Public download/install page */}
        <Route path="/download" element={<DownloadPage />} />

        {/* Login page for unauthenticated users */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected route - requires authentication */}
        <Route
          path="/"
          element={
            isLoading ? null : !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <DailyViewPage />
            )
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
