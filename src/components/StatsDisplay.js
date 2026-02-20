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
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Total - Prominent but elegant */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            color: "#bbb",
            textTransform: "uppercase",
            fontWeight: 500,
            letterSpacing: "1px",
            marginBottom: 6,
          }}
        >
          Total XP
        </div>
        <div
          style={{
            fontSize: 32,
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
          width: 60,
          height: 1,
          background: `linear-gradient(90deg, ${theme.colors.coreColor}40, ${theme.colors.reachColor}40)`,
        }}
      />

      {/* Core + Reach - Side by side, minimal */}
      <div
        style={{
          display: "flex",
          gap: 32,
          fontSize: 13,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: theme.colors.coreColor,
              fontWeight: 700,
              marginBottom: 3,
            }}
          >
            {coreWeekly}/{coreWeeklyTotal}
          </div>
          <div style={{ fontSize: 10, color: "#aaa" }}>Core</div>
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

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: theme.colors.reachColor,
              fontWeight: 700,
              marginBottom: 3,
            }}
          >
            {reachWeekly}
          </div>
          <div style={{ fontSize: 10, color: "#aaa" }}>Reach</div>
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
    </div>
  )
}
