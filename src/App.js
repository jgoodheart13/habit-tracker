import React from "react";
import AppRouter from "./AppRouter";
import theme from "./styles/theme";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthenticationWrapper } from "./components/AuthenticationWrapper"
import { Auth0Provider } from "@auth0/auth0-react"
import { isMobile } from "react-device-detect"

const domain = process.env.REACT_APP_AUTH0_DOMAIN
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID
const audience = process.env.REACT_APP_AUTH0_AUDIENCE

export default function App() {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: "openid profile email",
      }}
    >
      <AppContent />
    </Auth0Provider>
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
