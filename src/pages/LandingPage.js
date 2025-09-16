// LandingPage.js
import React from "react";

// Azure AD B2C config (replace with your actual values)
const azureB2cConfig = {
  tenant: "jspedickgmail.onmicrosoft.com",
  clientId: process.env.REACT_APP_B2C_CLIENT_ID,
  policy: "B2C_1A_SIGNUP_SIGNIN",
  redirectUri: window.location.origin,
};

function getAzureB2CLoginUrl() {
  const base = `https://${azureB2cConfig.tenant}.b2clogin.com/${azureB2cConfig.tenant}/oauth2/v2.0/authorize`;
  const params = new URLSearchParams({
    client_id: azureB2cConfig.clientId,
    response_type: "token id_token",
    redirect_uri: azureB2cConfig.redirectUri,
    scope: "openid profile email",
    response_mode: "fragment",
    nonce: "defaultNonce",
    p: azureB2cConfig.policy,
    prompt: "login",
  });
  return `${base}?${params.toString()}`;
}

export default function LandingPage() {
  React.useEffect(() => {
    // If token is present, redirect to root
    if (localStorage.getItem("b2c_token")) {
      window.location.replace("/");
      return;
    }
    // If token is in URL fragment, store and redirect
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash.replace(/&/g, "&"));
      const token = params.get("id_token") || params.get("access_token");
      if (token) {
        localStorage.setItem("b2c_token", token);
        window.location.replace("/");
      }
    }
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = getAzureB2CLoginUrl();
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f7f7fa",
    }}>
      <h1 style={{ fontSize: 38, fontWeight: 700, marginBottom: 18 }}>
        Welcome to Habit Tracker
      </h1>
      <p style={{ fontSize: 18, color: "#555", marginBottom: 32 }}>
        Track your habits, visualize your progress, and sign in securely.
      </p>
      <button
        onClick={handleGoogleLogin}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#4285F4",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "12px 32px",
          fontSize: 20,
          fontWeight: 600,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          cursor: "pointer",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <g>
            <path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.93-6.93C35.62 2.34 30.13 0 24 0 14.61 0 6.27 5.7 2.13 14.07l8.53 6.63C12.7 14.13 17.89 9.5 24 9.5z"/>
            <path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.43-4.75H24v9.02h12.44c-.54 2.92-2.18 5.39-4.64 7.06l7.19 5.59C43.73 37.13 46.1 31.27 46.1 24.5z"/>
            <path fill="#FBBC05" d="M10.66 28.7c-1.01-2.92-1.01-6.08 0-9l-8.53-6.63C.7 16.61 0 20.19 0 24c0 3.81.7 7.39 2.13 10.93l8.53-6.63z"/>
            <path fill="#EA4335" d="M24 48c6.13 0 11.62-2.02 15.44-5.5l-7.19-5.59c-2.01 1.35-4.59 2.15-8.25 2.15-6.11 0-11.3-4.63-13.34-10.8l-8.53 6.63C6.27 42.3 14.61 48 24 48z"/>
          </g>
        </svg>
        Sign in with Google
      </button>
    </div>
  );
}
