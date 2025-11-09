import React from "react"
import theme from "../styles/theme"

// Ring progress with "wrap-around" for P2 overflow.
// P1 fills first, P2 fills remainder up to 100 (p2Below), and any extra P2 (p2Above)
// wraps from the start and overlays previous segments (tail-eating effect).
export default function RingProgressGraph({
  P1Points = 0,
  P2Points = 0,
  size = 120,
  stroke = 12,
  showNumbers = true,
}) {
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

  // 1) the three quantities
  const p1 = clamp(P1Points, 0, 100)
  const p2Below = clamp(P2Points, 0, 100 - p1)
  const p2Above = Math.max(0, P2Points - p2Below) // can be 0..∞ (we just draw one more lap)

  // ring geometry
  const radius = size / 2
  const r = radius - stroke / 2
  const C = 2 * Math.PI * r

  // helpers to convert % (0..100) to arc lengths
  const arc = (pct) => (clamp(pct, 0, 100) / 100) * C

  // stroke lengths for each slice (first lap arcs)
  const p1Len = arc(p1)
  const p2BelowLen = arc(p2Below)

  // NOTE: p2Above overlays from the start of the circle, wrapping around.
  // If p2Above >= 100, the overlay completely covers the ring in p2Above100 color.
  const p2AboveLen = arc(Math.min(p2Above, 100))

  // offsets: start at 12 o’clock by rotating the whole SVG -90deg.
  const startOffset = 0
  const offsetAfterP1 = C - p1Len
  const offsetAfterP1AndP2Below = C - (p1Len + p2BelowLen)

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
        style={{ transform: "rotate(-90deg)" }}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* track */}
        <circle
          cx={radius}
          cy={radius}
          r={r}
          fill="none"
          stroke={theme.colors.border}
          strokeWidth={stroke}
        />

        {/* P1 (first part of ring) */}
        {p1 > 0 && (
          <circle
            cx={radius}
            cy={radius}
            r={r}
            fill="none"
            stroke={theme.colors.p1}
            strokeWidth={stroke}
            strokeDasharray={`${p1Len} ${C - p1Len}`}
            strokeDashoffset={startOffset}
            strokeLinecap="round"
          />
        )}

        {/* P2 up to 100 - P1 (continues the first lap after P1) */}
        {p2Below > 0 && (
          <circle
            cx={radius}
            cy={radius}
            r={r}
            fill="none"
            stroke={theme.colors.p2Below100}
            strokeWidth={stroke}
            strokeDasharray={`${p2BelowLen} ${C - p2BelowLen}`}
            strokeDashoffset={offsetAfterP1}
            strokeLinecap="round"
          />
        )}

        {/* P2 overflow (wraps from the start, overlays everything) */}
        {p2Above > 0 && (
          <circle
            cx={radius}
            cy={radius}
            r={r}
            fill="none"
            stroke={theme.colors.p2Above100}
            strokeWidth={stroke}
            strokeDasharray={`${p2AboveLen} ${C - p2AboveLen}`}
            strokeDashoffset={startOffset}
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* center labels */}
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
            {Math.round(P1Points + P2Points)} XP
          </div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            P1 {Math.round(p1)} / P2 {Math.round(P2Points)}
          </div>
        </div>
      )}
    </div>
  )
}
