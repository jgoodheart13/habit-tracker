
import React from "react";
import AppRouter from "./AppRouter";
import theme from "./styles/theme";

export default function App() {
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
          style={{ color: theme.colors.accent, fontWeight: 800, fontSize: 28 }}
        >
          Baseline Habit Tracker
        </h1>
      </header>
      <main>
        <AppRouter />
      </main>
    </div>
  );
}
