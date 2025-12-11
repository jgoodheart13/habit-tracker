import React from "react"
import theme from "../styles/theme"

export default function RingProgressGraph({
  dailyP1 = 0,
  weeklyP1 = 0,
  size = 140,
  strokeInner = 10,
  strokeOuter = 10,
  showNumbers = true,
}) {
  const clamp = (v) => Math.max(0, Math.min(100, v))

  const daily = clamp(dailyP1)
  const weekly = clamp(weeklyP1)

  const center = size / 2

  const outerR = center - strokeOuter / 2 - 6
  const innerR = center - strokeOuter - strokeInner / 2 - 10

  const C_outer = 2 * Math.PI * outerR
  const C_inner = 2 * Math.PI * innerR

  const arcOuter = (pct) => (pct / 100) * C_outer
  const arcInner = (pct) => (pct / 100) * C_inner

  return (
    <div style={{ textAlign: "center" }}>
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
          {/* OUTER SHADOW */}
          <circle
            cx={center}
            cy={center}
            r={outerR}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={strokeOuter + 4}
          />

          {/* OUTER TRACK */}
          <circle
            cx={center}
            cy={center}
            r={outerR}
            fill="none"
            stroke={theme.colors.border}
            strokeWidth={strokeOuter}
            strokeLinecap="round"
          />

          {/* OUTER WEEKLY PROGRESS (gradient) */}
          {weekly > 0 && (
            <circle
              cx={center}
              cy={center}
              r={outerR}
              fill="none"
              stroke={`url(#weeklyGrad)`}
              strokeWidth={strokeOuter}
              strokeDasharray={`${arcOuter(weekly)} ${
                C_outer - arcOuter(weekly)
              }`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.4s ease" }}
            />
          )}

          {/* INNER SHADOW */}
          <circle
            cx={center}
            cy={center}
            r={innerR}
            fill="none"
            stroke="rgba(0,0,0,0.03)"
            strokeWidth={strokeInner + 4}
          />

          {/* INNER TRACK */}
          <circle
            cx={center}
            cy={center}
            r={innerR}
            fill="none"
            stroke={theme.colors.border}
            strokeWidth={strokeInner}
            strokeLinecap="round"
          />

          {/* INNER DAILY PROGRESS (gradient) */}
          {daily > 0 && (
            <circle
              cx={center}
              cy={center}
              r={innerR}
              fill="none"
              stroke={`url(#dailyGrad)`}
              strokeWidth={strokeInner}
              strokeDasharray={`${arcInner(daily)} ${
                C_inner - arcInner(daily)
              }`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.4s ease" }}
            />
          )}

          {/* GRADIENT DEFINITIONS */}
          <defs>
            <linearGradient id="dailyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.colors.p1} />
              <stop offset="100%" stopColor={theme.colors.p1} />
            </linearGradient>

            <linearGradient id="weeklyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.colors.p2Below100} />
              <stop offset="100%" stopColor="#b4d3ff" />
            </linearGradient>
          </defs>
        </svg>

        {showNumbers && (
          <div
            style={{
              position: "absolute",
              textAlign: "center",
              color: theme.colors.text,
              pointerEvents: "none",
              lineHeight: 1.2,
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 700 }}>
              {Math.round(daily)}
            </div>
            <div style={{ fontSize: 18, opacity: 0.65 }}>
              {Math.round(weekly)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
