import React, { useState } from "react";

export default function Sidebar({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Icon Bar */}
      <div
        style={{
          width: 50,
          background: "#f4f4f4", // Match app background color
          color: "#1976D2", // Match app's blue color
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "8px 0",
          boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: "transparent",
            border: "none",
            color: "#1976D2", // Match app's blue color
            cursor: "pointer",
            fontSize: 24,
          }}
        >
          {isExpanded ? "\u25C0" : "\u25B6"} {/* Unicode arrows for better visuals */}
        </button>
      </div>

      {/* Sidebar Content */}
      {isExpanded && (
        <div
          style={{
            width: 200,
            background: "#f4f4f4",
            boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            padding: "16px",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}