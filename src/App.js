
import React from "react";
import AppRouter from "./AppRouter";
import theme from "./styles/theme";
import { useAuth0 } from "@auth0/auth0-react";

import { Auth0Provider } from "@auth0/auth0-react";

const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

export default function App() {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <AppContent />
    </Auth0Provider>
  );
}

function LogoutButton() {
  const { logout } = useAuth0();
  return (
    <button
      onClick={() =>
        logout({
          logoutParams: {
            returnTo: window.location.origin,
          },
        })
      }
      style={{
        background: theme.colors.accent,
        color: theme.colors.background,
        border: "none",
        borderRadius: 6,
        padding: "8px 18px",
        fontWeight: 600,
        fontSize: 15,
        boxShadow: theme.colors.shadow,
        cursor: "pointer",
        marginTop: 8,
        minWidth: 100,
      }}
    >
      Log Out
    </button>
  );
}

function AppContent() {
  const { user, isAuthenticated } = useAuth0();
  const [showDropdown, setShowDropdown] = React.useState(false);
  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        fontFamily: "Inter, Arial, sans-serif",
        background: "#f7f7f7",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 24,
          background: "#fff",
          borderBottom: "1px solid #eee",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <h1
          style={{
            color: theme.colors.accent,
            fontWeight: 800,
            fontSize: 28,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          Reach 4
        </h1>
        <div style={{ position: "absolute", right: 32, top: 24 }}>
          {isAuthenticated && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowDropdown((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
                title={user?.name || "Account"}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                    stroke="#555"
                    strokeWidth="2"
                    fill="#eee"
                  />
                  <path
                    d="M4 20c0-4 8-4 8-4s8 0 8 4"
                    stroke="#555"
                    strokeWidth="2"
                    fill="#eee"
                  />
                </svg>
              </button>
              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: 36,
                    right: 0,
                    background: "#fff",
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: 8,
                    boxShadow: theme.colors.shadow,
                    padding: 12,
                    zIndex: 100,
                  }}
                >
                  <div style={{ marginBottom: 8, fontWeight: 600 }}>
                    {user?.name || user?.email || "Account"}
                  </div>
                  <LogoutButton />
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <main>
        <AppRouter />
      </main>
    </div>
  );
}
