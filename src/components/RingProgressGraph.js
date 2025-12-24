import React from "react"
import theme from "../styles/theme"
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion"
import { useEffect, useRef } from "react"

export default function RingProgressGraph({
  dailyP1 = 0,
  weeklyP1 = 0,
  p2Count = 0,
  size = 140,
  strokeInner = 10,
  strokeOuter = 10,
  showNumbers = true,
  weeklyPaceMarker = 0,
}) {
  // Allow values above 100% to show full progress
  const daily = Math.max(0, dailyP1)
  const weekly = Math.max(0, weeklyP1)
  const paceMarker = Math.max(0, Math.min(100, weeklyPaceMarker)) // Clamp pace marker to 0-100

  const center = size / 2

  const outerR = center - strokeOuter / 2 - 6
  const innerR = center - strokeOuter - strokeInner / 2 - 10
  const diamondOrbitR = outerR + strokeOuter / 2 + 12 // Orbit outside the rings
  const diamondSize = 6
  const expandedSize = size + diamondSize * 4 // Extra space for diamonds
  const expandedCenter = expandedSize / 2

  const C_outer = 2 * Math.PI * outerR
  const C_inner = 2 * Math.PI * innerR

  // Cap visual display at 100% but allow number to go higher
  const arcOuter = (pct) => (Math.min(pct, 100) / 100) * C_outer
  const arcInner = (pct) => (Math.min(pct, 100) / 100) * C_inner

  const controls = useAnimation()
  const glowControls = useAnimation()
  const prevDailyRef = useRef(daily)
  const prevWasBelow100 = useRef(daily < 100)
  const dashProgress = useMotionValue(daily)

  const dashArray = useTransform(dashProgress, (v) => {
    const filled = arcInner(v)
    return `${filled} ${C_inner - filled}`
  })

  // Pulse animation on daily progress increase
  useEffect(() => {
    if (daily > prevDailyRef.current) {
      controls.start({
        scale: [1, 1.04, 1],
        transition: {
          duration: 0.18,
          ease: ["easeOut", "easeIn"],
        },
      })
    }
  }, [daily, controls])

  // Glow animation when crossing 100%
  useEffect(() => {
    if (daily >= 100 && prevWasBelow100.current) {
      // Big burst glow when first hitting 100%, then smooth fade to no glow
      glowControls.start({
        filter: [
          `drop-shadow(0 0 8px ${theme.colors.p2Above100}) drop-shadow(0 0 16px ${theme.colors.p2Above100})`,
          `drop-shadow(0 0 20px ${theme.colors.p2Above100}) drop-shadow(0 0 40px ${theme.colors.p2Above100})`,
          `drop-shadow(0 0 4px ${theme.colors.p2Above100}) drop-shadow(0 0 8px ${theme.colors.p2Above100})`,
          "drop-shadow(0 0 0px transparent)",
        ],
        transition: {
          duration: 1.2,
          times: [0, 0.25, 0.5, 1],
          ease: ["easeOut", "easeInOut", "easeInOut"],
        },
      })
    } else if (daily < 100) {
      // No glow below 100%
      glowControls.start({
        filter: "drop-shadow(0 0 0px transparent)",
        transition: { duration: 0.3 },
      })
    }
    prevWasBelow100.current = daily < 100
  }, [daily, glowControls])

  // Animate dash progress changes
  // overshoot on increase feature
  useEffect(() => {
    const prev = prevDailyRef.current
    const delta = daily - prev

    if (delta > 0) {
      const overshootTarget = daily + delta * 0.3

      animate(dashProgress, overshootTarget, {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }).then(() => {
        animate(dashProgress, daily, {
          duration: 0.14,
          ease: "easeOut",
        })
      })
    } else {
      animate(dashProgress, daily, {
        duration: 0.4,
        ease: "easeOut",
      })
    }

    prevDailyRef.current = daily
  }, [daily, dashProgress])

  return (
    <div style={{ textAlign: "center" }}>
      <motion.div
        animate={controls}
        style={{
          width: expandedSize,
          height: expandedSize,
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.svg
          animate={glowControls}
          width={expandedSize}
          height={expandedSize}
          viewBox={`0 0 ${expandedSize} ${expandedSize}`}
          style={{ transform: "rotate(-90deg)", overflow: "visible" }}
        >
          {/* OUTER SHADOW */}
          <circle
            cx={expandedCenter}
            cy={expandedCenter}
            r={outerR}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={strokeOuter + 4}
          />

          {/* OUTER TRACK */}
          <circle
            cx={expandedCenter}
            cy={expandedCenter}
            r={outerR}
            fill="none"
            stroke={theme.colors.border}
            strokeWidth={strokeOuter}
            strokeLinecap="round"
          />

          {/* OUTER WEEKLY PROGRESS (gradient) */}
          {weekly > 0 && (
            <circle
              cx={expandedCenter}
              cy={expandedCenter}
              r={outerR}
              fill="none"
              stroke={`url(#weeklyGrad)`}
              strokeWidth={strokeOuter - 3}
              strokeDasharray={`${arcOuter(weekly)} ${
                C_outer - arcOuter(weekly)
              }`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.4s ease" }}
            />
          )}

          {/* PACE MARKER ON OUTER RING */}
          {paceMarker > 0 && (
            <>
              {/* Red gauge tick extending from inner edge of outer ring */}
              <line
                x1={expandedCenter}
                y1={expandedCenter - outerR + strokeOuter / 2 - 1}
                x2={expandedCenter}
                y2={expandedCenter - outerR - strokeOuter / 2 + 1}
                stroke="red"
                strokeWidth={2.5}
                strokeLinecap="round"
                transform={`rotate(${
                  90 + (paceMarker / 100) * 360
                } ${expandedCenter} ${expandedCenter})`}
              />
            </>
          )}

          {/* INNER SHADOW */}
          <circle
            cx={expandedCenter}
            cy={expandedCenter}
            r={innerR}
            fill="none"
            stroke="rgba(0,0,0,0.03)"
            strokeWidth={strokeInner + 4}
          />

          {/* INNER TRACK */}
          <circle
            cx={expandedCenter}
            cy={expandedCenter}
            r={innerR}
            fill="none"
            stroke={theme.colors.border}
            strokeWidth={strokeInner}
            strokeLinecap="round"
          />

          {/* INNER DAILY PROGRESS (gradient) */}
          {daily > 0 && (
            <motion.circle
              cx={expandedCenter}
              cy={expandedCenter}
              r={innerR}
              fill="none"
              stroke="url(#dailyGrad)"
              strokeWidth={strokeInner}
              strokeLinecap="round"
              style={{
                strokeDasharray: dashArray,
              }}
            />
          )}

          {/* GRADIENT DEFINITIONS */}
          <defs>
            <linearGradient id="dailyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor={
                  daily >= 100 ? theme.colors.p2Above100 : theme.colors.p1
                }
              />
              <stop
                offset="100%"
                stopColor={
                  daily >= 100 ? theme.colors.p2Above100 : theme.colors.p1
                }
              />
            </linearGradient>

            <linearGradient id="weeklyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor={theme.colors.p1}
                stopOpacity={0.35}
              />
              <stop
                offset="100%"
                stopColor={theme.colors.p1}
                stopOpacity={0.35}
              />
            </linearGradient>
          </defs>

          {/* P2 DIAMONDS ORBITING THE RINGS */}
          {Array.from({ length: p2Count }).map((_, i) => {
            const angle = (360 / p2Count) * i - 90 // Start at top, -90 adjusts for SVG coords
            const rad = (angle * Math.PI) / 180
            const x = expandedCenter + diamondOrbitR * Math.cos(rad)
            const y = expandedCenter + diamondOrbitR * Math.sin(rad)

            return (
              <motion.g
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3, ease: "backOut" }}
              >
                <polygon
                  points={`${x},${y - diamondSize} ${
                    x + diamondSize
                  },${y} ${x},${y + diamondSize} ${x - diamondSize},${y}`}
                  fill={theme.colors.p2Below100}
                  stroke={theme.colors.background}
                  strokeWidth="1.5"
                  style={{
                    transform: "rotate(90deg)",
                    transformOrigin: `${x}px ${y}px`,
                  }}
                />
              </motion.g>
            )
          })}
        </motion.svg>

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
      </motion.div>
    </div>
  )
}
