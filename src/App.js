import React from "react"
import AppRouter from "./AppRouter"
import { AuthenticationWrapper } from "./components/AuthenticationWrapper"
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext"
import { UserProvider } from "./contexts/UserContext"
import { WeekGuardProvider } from "./contexts/WeekGuardContext"
import { SettingsProvider } from "./contexts/SettingsContext"
import LockModal from "./components/LockModal"
import { isMobile } from "react-device-detect"


export default function App() {
  return (
    <SupabaseAuthProvider>
      <AuthenticationWrapper>
        <UserProvider>
          <SettingsProvider>
            <WeekGuardProvider>
              <AppContent />
              <LockModal />
            </WeekGuardProvider>
          </SettingsProvider>
        </UserProvider>
      </AuthenticationWrapper>
    </SupabaseAuthProvider>
  )
}

function AppContent() {
  return (
    <div
      className="App"
      style={{
        maxWidth: isMobile ? "100%" : 800,
        margin: isMobile ? "0" : "0 auto",
      }}
    >
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <AppRouter />
      </main>
    </div>
  )
}
