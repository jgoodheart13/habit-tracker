import React from "react"
import AppRouter from "./AppRouter"
import { AuthenticationWrapper } from "./components/AuthenticationWrapper"
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext"
import { UserProvider } from "./contexts/UserContext"
import { WeekGuardProvider } from "./contexts/WeekGuardContext"
import LockModal from "./components/LockModal"
import { isMobile } from "react-device-detect"


export default function App() {
  return (
    <SupabaseAuthProvider>
      <UserProvider>
        <WeekGuardProvider>
          <AppContent />
          <LockModal />
        </WeekGuardProvider>
      </UserProvider>
    </SupabaseAuthProvider>
  )
}

function AppContent() {
  return (
    <AuthenticationWrapper>
      <div
        className="App"
        style={{
          maxWidth: isMobile ? "100%" : 800, // Conditionally set maxWidth based on device
          margin: isMobile ? "0" : "0 auto", // Center on desktop
        }}
      >
        <main
          style={{
            flex: 1,
            overflowY: "auto", // ⬅️ main scrolls
            WebkitOverflowScrolling: "touch",
          }}
        >
          <AppRouter />
        </main>
      </div>
    </AuthenticationWrapper>
  )
}
