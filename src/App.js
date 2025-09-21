
import React from "react";
import AppRouter from "./AppRouter";
import theme from "./styles/theme";

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
            }}
          >
            Baseline Habit Tracker
          </h1>
        </header>
        <main>
          <AppRouter />
        </main>
      </div>
    </Auth0Provider>
  );
}
