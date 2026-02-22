import React, { useEffect, useRef, useState } from "react"
import theme from "../styles/theme"
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGem } from "@fortawesome/free-solid-svg-icons"

export default function RingProgressGraph({
  dailyP1 = 0,
  weeklyP1 = 0,
  p2Count = 0,
  size = 140,
  strokeInner = 10,
  strokeOuter = 10,
  showNumbers = true,
  weeklyPaceMarker = 0,
  isLockedIn = false,
  animatingLockIn = false,
  onAnimationComplete,
  onXPBarDelayCalculated,
}) {
  // Allow values above 100% to show full progress
  const daily = Math.max(0, dailyP1)
  const weekly = Math.max(0, weeklyP1)
  const paceMarker = Math.max(0, Math.min(100, weeklyPaceMarker)) // Clamp pace marker to 0-100

  const center = size / 2

  const outerR = center - strokeOuter / 2 - 6
  const innerR = center - strokeOuter - strokeInner / 2 - 10
  const diamondOrbitR = outerR + strokeOuter / 2 + 12 // Orbit outside the rings
  const textArcR = outerR + strokeOuter / 2 + 13 // Further outside for breathing room from red marker
  const diamondSize = 6
  const expandedSize = size + diamondSize * 4 + 30 // Extra space for diamonds and glow
  const expandedCenter = expandedSize / 2

  const C_outer = 2 * Math.PI * outerR
  const C_inner = 2 * Math.PI * innerR

  // Cap visual display at 100% but allow number to go higher
  const arcOuter = (pct) => (Math.min(pct, 100) / 100) * C_outer
  const arcInner = (pct) => (Math.min(pct, 100) / 100) * C_inner

  const controls = useAnimation()
  const glowControls = useAnimation()
  const diamondSpinControls = useAnimation()
  const diamondGlowControls = useAnimation()
  const arcSegmentControls = useAnimation()
  const prevDailyRef = useRef(daily)
  const prevWasBelow100 = useRef(daily < 100)
  const prevP2CountRef = useRef(p2Count)
  const dashProgress = useMotionValue(daily)
  const [showArcSegment, setShowArcSegment] = useState(false)
  const [lockedInProgress, setLockedInProgress] = useState(0)
  const isAnimatingRef = useRef(false) // Prevent animation re-runs
  const segmentDashProgress = useMotionValue(100) // For draining animation

  const dashArray = useTransform(dashProgress, (v) => {
    const filled = arcInner(v)
    return `${filled} ${C_inner - filled}`
  })

  const segmentDashArray = useTransform(segmentDashProgress, (v) => {
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
          `drop-shadow(0 0 6px ${theme.colors.completeColor}) drop-shadow(0 0 12px ${theme.colors.completeColor})`,
          `drop-shadow(0 0 15px ${theme.colors.completeColor}) drop-shadow(0 0 30px ${theme.colors.completeColor})`,
          `drop-shadow(0 0 3px ${theme.colors.completeColor}) drop-shadow(0 0 6px ${theme.colors.completeColor})`,
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

  // Spin animation when a new diamond is added
  useEffect(() => {
    if (p2Count > prevP2CountRef.current && prevP2CountRef.current > 0) {
      diamondSpinControls.start({
        rotate: [0, 360],
        transition: {
          duration: 0.8,
          ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
        },
      })

      // Animate glow during spin
      diamondGlowControls.start({
        filter: [
          `drop-shadow(0 0 3px ${theme.colors.reachColor}) drop-shadow(0 0 6px ${theme.colors.reachColor})`,
          `drop-shadow(0 0 1.5px rgba(139, 92, 246, 0.4)) drop-shadow(0 0 3px rgba(139, 92, 246, 0.2))`,
        ],
        transition: {
          duration: 0.8,
          ease: "easeOut",
        },
      })
    }
    prevP2CountRef.current = p2Count
  }, [p2Count, diamondSpinControls, diamondGlowControls])

  // Lock-in animation - spin arc to 12 o'clock and fill XP bar
  useEffect(() => {
    if (animatingLockIn && !isAnimatingRef.current) {
      isAnimatingRef.current = true
      const runAnimation = async () => {
        // Capture current progress
        setLockedInProgress(daily)
        segmentDashProgress.set(daily) // Set initial dash to current progress
        setShowArcSegment(true)
        await new Promise((resolve) => setTimeout(resolve, 50))

        // Calculate timing:
        // - Tip is at daily% position, needs to rotate (100-daily)% to reach noon
        // - Then drain the remaining daily% while rotating
        const percentToNoon = 100 - daily // e.g., 100 - 63 = 37%
        const percentToDrain = daily // e.g., 63%
        const totalDuration = 1.2
        const timeToNoon = (percentToNoon / 100) * totalDuration
        const timeToDrain = (percentToDrain / 100) * totalDuration

        // Notify parent of XP bar delay (when draining starts)
        // Make XP bar animation 2x slower for better visibility
        if (onXPBarDelayCalculated) {
          onXPBarDelayCalculated({
            delay: timeToNoon,
            duration: timeToDrain * 2,
          })
        }

        // Start both animations, but delay the drain
        await Promise.all([
          // Rotate full 360° clockwise
          arcSegmentControls.start({
            rotate: 360,
            transition: { duration: totalDuration, ease: "linear" },
          }),
          // Wait until tip reaches noon, then drain
          (async () => {
            await new Promise((resolve) =>
              setTimeout(resolve, timeToNoon * 1000),
            )
            await animate(segmentDashProgress, 0, {
              duration: timeToDrain,
              ease: "linear",
            })
          })(),
        ])

        setShowArcSegment(false)
        isAnimatingRef.current = false
        if (onAnimationComplete) {
          onAnimationComplete()
        }
      }

      runAnimation()
    } else if (!animatingLockIn) {
      isAnimatingRef.current = false
    }
  }, [
    animatingLockIn,
    daily,
    arcSegmentControls,
    segmentDashProgress,
    onAnimationComplete,
  ])

  return (
    <div style={{ textAlign: "center", isolation: "isolate" }}>
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

          {/* 7-DAY SEGMENT DIVIDERS */}
          {Array.from({ length: 7 }).map((_, i) => {
            const angle = (360 / 7) * i
            const rad = (angle * Math.PI) / 180
            const innerEdge = outerR - strokeOuter / 2 + 1
            const outerEdge = outerR + strokeOuter / 2 - 1
            const x1 = expandedCenter + innerEdge * Math.cos(rad)
            const y1 = expandedCenter + innerEdge * Math.sin(rad)
            const x2 = expandedCenter + outerEdge * Math.cos(rad)
            const y2 = expandedCenter + outerEdge * Math.sin(rad)

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(0,0,0,0.12)"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            )
          })}

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
                strokeWidth={2}
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
          {daily > 0 && !showArcSegment && !isLockedIn && (
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

          {/* Arc segment that spins during lock-in */}
          {showArcSegment && (
            <motion.g animate={arcSegmentControls} initial={{ rotate: 0 }}>
              <motion.circle
                cx={expandedCenter}
                cy={expandedCenter}
                r={innerR}
                fill="none"
                stroke="url(#dailyGrad)"
                strokeWidth={strokeInner}
                strokeLinecap="round"
                style={{
                  strokeDasharray: segmentDashArray,
                }}
              />
            </motion.g>
          )}

          {/* GRADIENT DEFINITIONS */}
          <defs>
            <linearGradient id="dailyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor={
                  daily >= 100
                    ? theme.colors.completeColor
                    : theme.colors.coreColor
                }
              />
              <stop
                offset="100%"
                stopColor={
                  daily >= 100
                    ? theme.colors.completeColor
                    : theme.colors.coreColor
                }
              />
            </linearGradient>

            <linearGradient id="weeklyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor={theme.colors.coreColor}
                stopOpacity={0.35}
              />
              <stop
                offset="100%"
                stopColor={theme.colors.coreColor}
                stopOpacity={0.35}
              />
            </linearGradient>
          </defs>

          {/* P2 DIAMONDS ORBITING THE RINGS */}
          <motion.g
            animate={diamondSpinControls}
            style={{
              transformOrigin: `${expandedCenter}px ${expandedCenter}px`,
              transformBox: "fill-box",
            }}
          >
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
                  transition={{
                    delay: i * 0.05,
                    duration: 0.3,
                    ease: "backOut",
                  }}
                >
                  <foreignObject
                    x={x - 10}
                    y={y - 10}
                    width={20}
                    height={20}
                    style={{
                      overflow: "visible",
                    }}
                  >
                    <motion.div
                      animate={diamondGlowControls}
                      style={{
                        width: 20,
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.colors.reachColor,
                        filter: `drop-shadow(0 0 1.5px rgba(139, 92, 246, 0.4)) drop-shadow(0 0 3px rgba(139, 92, 246, 0.2))`,
                        transform: "rotate(90deg)",
                      }}
                    >
                      <FontAwesomeIcon icon={faGem} size="sm" />
                    </motion.div>
                  </foreignObject>
                </motion.g>
              )
            })}
          </motion.g>

          {/* WEEKLY PERCENTAGE TEXT ALONG ARC - Rendered last for top z-index */}
          {weekly > 0 &&
            (() => {
              // Calculate position at the end of the weekly arc
              // In SVG coordinates (before rotation), 0° is at 3 o'clock
              // Progress starts at 0° and moves clockwise
              const progressAngle = (Math.min(weekly, 100) / 100) * 360
              const angleInRadians = (progressAngle * Math.PI) / 180
              const textX = expandedCenter + textArcR * Math.cos(angleInRadians)
              const textY = expandedCenter + textArcR * Math.sin(angleInRadians)

              return (
                <g transform={`translate(${textX}, ${textY}) rotate(90)`}>
                  <text
                    fill="rgba(0, 0, 0, 0.7)"
                    fontSize="13"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan fontWeight="500">{Math.round(weekly)}</tspan>
                    <tspan fontWeight="400">%</tspan>
                  </text>
                </g>
              )
            })()}
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
          </div>
        )}
      </motion.div>
    </div>
  )
}
