import React from "react"
import theme from "../styles/theme"

export function IntegratedStats({
  coreWeekly,
  coreWeeklyTotal,
  corePoints,
  reachWeekly,
  reachPoints,
  totalPoints,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        minWidth: 100,
      }}
    >
      {/* Total - Prominent */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: theme.colors.text,
            lineHeight: 1,
          }}
        >
          {Math.round(totalPoints)} XP
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#666",
            fontWeight: 600,
            marginTop: 3,
            letterSpacing: "0.3px",
          }}
        >
          This Week
        </div>
      </div>

      {/* Core */}
      <div style={{ paddingLeft: 8 }}>
        <div
          style={{
            fontSize: 9,
            color: "#999",
            textTransform: "uppercase",
            fontWeight: 500,
            letterSpacing: "0.5px",
            marginBottom: 2,
          }}
        >
          Core
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: theme.colors.text,
            lineHeight: 1.2,
          }}
        >
          {Math.round(coreWeekly)} / {Math.round(coreWeeklyTotal)}
        </div>
        <div
          style={{
            fontSize: 11,
            color: theme.colors.coreColor,
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          +{Math.round(corePoints)} XP
        </div>
      </div>

      {/* Reach */}
      <div style={{ paddingLeft: 8 }}>
        <div
          style={{
            fontSize: 9,
            color: "#999",
            textTransform: "uppercase",
            fontWeight: 500,
            letterSpacing: "0.5px",
            marginBottom: 2,
          }}
        >
          Reach
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: theme.colors.text,
            lineHeight: 1.2,
          }}
        >
          {Math.round(reachWeekly)}
        </div>
        <div
          style={{
            fontSize: 11,
            color: theme.colors.reachColor,
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          +{Math.round(reachPoints)} XP
        </div>
      </div>
    </div>
  )
}
