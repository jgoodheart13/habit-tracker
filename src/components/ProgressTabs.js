import React from "react";
import theme from "../styles/theme";

export default function ProgressTabs({ activeTab, setActiveTab }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between", // Spread tabs across the row
        alignItems: "center",
        padding: "0", // Remove padding for full height
        background: theme.colors.background,
        borderBottom: `1px solid ${theme.colors.border}`,
        height: "40px", // Full height for the row
      }}
    >
      <button
        onClick={() => setActiveTab("daily")}
        style={{
          flex: 1, // Make tabs take equal width
          height: "100%", // Full height for the tab
          fontSize: 16,
          border: "none", // Remove border for seamless look
          background:
            activeTab === "daily"
              ? theme.colors.accent
              : theme.colors.background,
          color: theme.colors.text,
          cursor: "pointer",
        }}
      >
        Daily Progress
      </button>
      <button
        onClick={() => setActiveTab("weekly")}
        style={{
          flex: 1, // Make tabs take equal width
          height: "100%", // Full height for the tab
          fontSize: 16,
          border: "none", // Remove border for seamless look
          background:
            activeTab === "weekly"
              ? theme.colors.accent
              : theme.colors.background,
          color: theme.colors.text,
          cursor: "pointer",
        }}
      >
        Weekly Progress
      </button>
    </div>
  )
}