import React, { useState } from "react";

export default function Sidebar({ children }) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div style={{ display: "flex" }}>
      {isVisible && (
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
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: "absolute",
          top: 16,
          left: isVisible ? 216 : 16,
          zIndex: 1000,
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          padding: "8px 16px",
          cursor: "pointer",
        }}
      >
        {isVisible ? "Hide" : "Show"} Sidebar
      </button>
    </div>
  );
}