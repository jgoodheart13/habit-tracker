import React from "react"
import theme from "../styles/theme"

// Double-ring progress graph:
// - Inner ring: daily P1 pace completion (0–100)
// - Outer ring: weekly P1 completion (0–100)
export default function RingProgressGraph({
  dailyP1 = 0,
  weeklyP1 = 0,
  size = 120,
  strokeInner = 10,
  strokeOuter = 10,
  showNumbers = true,
}) {
  const clamp = (v) => Math.max(0, Math.min(100, v))

  const daily = clamp(dailyP1)
  const weekly = clamp(weeklyP1)

  // geometry
  const center = size / 2

  // outer ring slightly larger radius
  const outerR = center - strokeOuter / 2
  const innerR = center - strokeOuter - strokeInner / 2 - 4 // spacing between rings

  const C_outer = 2 * Math.PI * outerR
  const C_inner = 2 * Math.PI * innerR

  const arcOuter = (pct) => (pct / 100) * C_outer
  const arcInner = (pct) => (pct / 100) * C_inner

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >

        {/* OUTER TRACK */}
        <circle
          cx={center}
          cy={center}
          r={outerR}
          fill="none"
          stroke={theme.colors.border}
          strokeWidth={strokeOuter}
        />

        {/* OUTER WEEKLY PROGRESS */}
        {weekly > 0 && (
          <circle
            cx={center}
            cy={center}
            r={outerR}
            fill="none"
            stroke={theme.colors.p1} // weekly color (adjust if needed)
            strokeWidth={strokeOuter}
            strokeDasharray={`${arcOuter(weekly)} ${C_outer - arcOuter(weekly)}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
        )}

        {/* INNER TRACK */}
        <circle
          cx={center}
          cy={center}
          r={innerR}
          fill="none"
          stroke={theme.colors.border}
          strokeWidth={strokeInner}
        />

        {/* INNER DAILY PROGRESS */}
        {daily > 0 && (
          <circle
            cx={center}
            cy={center}
            r={innerR}
            fill="none"
            stroke={theme.colors.p1} // daily color
            strokeWidth={strokeInner}
            strokeDasharray={`${arcInner(daily)} ${C_inner - arcInner(daily)}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
        )}

      </svg>

      {showNumbers && (
        <div
          style={{
            position: "absolute",
            textAlign: "center",
            color: theme.colors.text,
            lineHeight: 1.1,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {Math.round(daily)}% Today
          </div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            {Math.round(weekly)}% This Week
          </div>
        </div>
      )}
    </div>
  )
}
