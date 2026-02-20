import React from "react"
import { VERSION, BUILD_DATE } from "../version"
import theme from "../styles/theme"

export default function Footer() {
  return (
    <footer
      style={{
        position: "sticky",
        bottom: 0,
        textAlign: "center",
        padding: "8px",
        background: theme.colors.background,
        borderTop: `1px solid ${theme.colors.border}`,
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#999",
          fontFamily: "monospace",
          userSelect: "none",
        }}
        title={`Build: ${BUILD_DATE}`}
      >
        v{VERSION}
      </div>
    </footer>
  )
}
