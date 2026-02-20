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
        gap: 10,
        minWidth: 100,
      }}
    >
      {/* Total - Prominent */}
      <div>
        <div
          style={{
            fontSize: 9,
            color: "#999",
            textTransform: "uppercase",
            fontWeight: 600,
            letterSpacing: "0.5px",
            marginBottom: 4,
          }}
        >
          Total XP
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: theme.colors.accent,
            lineHeight: 1,
          }}
        >
          {totalPoints}
        </div>
      </div>

      {/* Subtle divider */}
      <div
        style={{
          width: 40,
          height: 1,
          background: `linear-gradient(90deg, ${theme.colors.coreColor}40, ${theme.colors.reachColor}40)`,
        }}
      />

      {/* Core */}
      <div>
        <div
          style={{
            fontSize: 9,
            color: "#999",
            textTransform: "uppercase",
            fontWeight: 600,
            letterSpacing: "0.5px",
            marginBottom: 3,
          }}
        >
          Core
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: theme.colors.coreColor,
            lineHeight: 1.2,
          }}
        >
          {coreWeekly}/{coreWeeklyTotal}
        </div>
        <div
          style={{
            fontSize: 11,
            color: theme.colors.coreColor,
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          +{corePoints}
        </div>
      </div>

      {/* Reach */}
      <div>
        <div
          style={{
            fontSize: 9,
            color: "#999",
            textTransform: "uppercase",
            fontWeight: 600,
            letterSpacing: "0.5px",
            marginBottom: 3,
          }}
        >
          Reach
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: theme.colors.reachColor,
            lineHeight: 1.2,
          }}
        >
          {reachWeekly}
        </div>
        <div
          style={{
            fontSize: 11,
            color: theme.colors.reachColor,
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          +{reachPoints}
        </div>
      </div>
    </div>
  )
}
