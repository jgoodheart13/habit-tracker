import React, { useEffect, useRef, useState } from "react"
import theme from "../styles/theme"
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion"

// Per-month icon colors
const MONTH_COLORS = [
  "#7EC8E3", // Jan  - ice blue
  "#F472B6", // Feb  - pink
  "#4ADE80", // Mar  - green
  "#C084FC", // Apr  - lavender
  "#FACC15", // May  - gold
  "#FB923C", // Jun  - amber
  "#F87171", // Jul  - coral red
  "#38BDF8", // Aug  - sky blue
  "#FB923C", // Sep  - orange (fall)
  "#A78BFA", // Oct  - violet
  "#D97706", // Nov  - amber brown
  "#BAE6FD", // Dec  - light ice blue
]

// Pure-SVG shapes centered at (0,0), ~±7 unit radius.
// Using only SVG primitives — no foreignObject, works on every browser / iOS WebKit.
const MONTH_SHAPES = [
  // 0 — January: Snowflake
  (c) => (
    <>
      <line x1="0" y1="-6.5" x2="0" y2="6.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="-5.6" y1="-3.25" x2="5.6" y2="3.25" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="-5.6" y1="3.25" x2="5.6" y2="-3.25" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="0" cy="0" r="1" fill={c}/>
    </>
  ),
  // 1 — February: Heart
  (c) => (
    <path d="M0,5 C-7,1 -5,-5 0,-2 C5,-5 7,1 0,5 Z" fill={c}/>
  ),
  // 2 — March: Three-leaf clover + stem
  (c) => (
    <>
      <circle cx="0" cy="-3" r="2.8" fill={c}/>
      <circle cx="-2.5" cy="0.5" r="2.8" fill={c}/>
      <circle cx="2.5" cy="0.5" r="2.8" fill={c}/>
      <rect x="-0.8" y="2.5" width="1.6" height="4.5" rx="0.8" fill={c}/>
    </>
  ),
  // 3 — April: Four-petal flower
  (c) => (
    <>
      <ellipse cx="0" cy="-3.5" rx="1.8" ry="3" fill={c}/>
      <ellipse cx="3.5" cy="0" rx="3" ry="1.8" fill={c}/>
      <ellipse cx="0" cy="3.5" rx="1.8" ry="3" fill={c}/>
      <ellipse cx="-3.5" cy="0" rx="3" ry="1.8" fill={c}/>
      <circle cx="0" cy="0" r="2" fill="#fff"/>
      <circle cx="0" cy="0" r="1.3" fill={c}/>
    </>
  ),
  // 4 — May: Five-pointed star
  (c) => (
    <polygon
      points="0,-7 1.65,-2.27 6.66,-2.17 2.66,0.87 4.11,5.66 0,2.8 -4.11,5.66 -2.66,0.87 -6.66,-2.17 -1.65,-2.27"
      fill={c}
    />
  ),
  // 5 — June: Sun (circle + 8 rays)
  (c) => (
    <>
      <circle cx="0" cy="0" r="3" fill={c}/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (Math.PI * deg) / 180
        return (
          <line
            key={deg}
            x1={Math.cos(rad) * 4.5} y1={Math.sin(rad) * 4.5}
            x2={Math.cos(rad) * 6.5} y2={Math.sin(rad) * 6.5}
            stroke={c} strokeWidth="1.5" strokeLinecap="round"
          />
        )
      })}
    </>
  ),
  // 6 — July: Eight-pointed starburst
  (c) => (
    <polygon
      points="0,-6 0.95,-2.31 4.24,-4.24 2.31,-0.95 6,0 2.31,0.95 4.24,4.24 0.95,2.31 0,6 -0.95,2.31 -4.24,4.24 -2.31,0.95 -6,0 -2.31,-0.95 -4.24,-4.24 -0.95,-2.31"
      fill={c}
    />
  ),
  // 7 — August: Wave
  (c) => (
    <path
      d="M-7,0 Q-5.25,-4 -3.5,0 Q-1.75,4 0,0 Q1.75,-4 3.5,0 Q5.25,4 7,0"
      stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"
    />
  ),
  // 8 — September: Leaf with vein
  (c) => (
    <>
      <path d="M0,7 C-5.5,3 -6,-4 0,-7 C6,-4 5.5,3 0,7 Z" fill={c}/>
      <line x1="0" y1="-6" x2="0" y2="6" stroke="#ffffff88" strokeWidth="1" strokeLinecap="round"/>
    </>
  ),
  // 9 — October: Crescent moon
  (c) => (
    <path d="M2,-6.5 A6.5,6.5,0,1,0,2,6.5 A4.5,4.5,0,1,1,2,-6.5 Z" fill={c}/>
  ),
  // 10 — November: Acorn (body + cap + stem)
  (c) => (
    <>
      <ellipse cx="0" cy="2" rx="4" ry="5" fill={c}/>
      <rect x="-4.5" y="-4.5" width="9" height="3.5" rx="1.5" fill={c} opacity="0.75"/>
      <rect x="-0.7" y="-7" width="1.4" height="2.5" rx="0.7" fill={c}/>
    </>
  ),
  // 11 — December: Snowflake (distinct lighter color)
  (c) => (
    <>
      <line x1="0" y1="-6.5" x2="0" y2="6.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="-5.6" y1="-3.25" x2="5.6" y2="3.25" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="-5.6" y1="3.25" x2="5.6" y2="-3.25" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="0" cy="0" r="1" fill={c}/>
    </>
  ),
]

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

  const currentMonth = new Date().getMonth()
  const diamondColor = MONTH_COLORS[currentMonth]

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
  const [diamondsExploding, setDiamondsExploding] = useState(false)
  const isAnimatingRef = useRef(false) // Prevent animation re-runs
  const segmentDashProgress = useMotionValue(100) // For draining animation
  const innerRingOpacity = useMotionValue(1) // For fading out inner ring

  const dashArray = useTransform(dashProgress, (v) => {
    const filled = arcInner(v)
    return `${filled} ${C_inner - filled}`
  })

  const segmentDashArray = useTransform(segmentDashProgress, (v) => {
    const filled = arcOuter(v)
    return `${filled} ${C_outer - filled}`
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
          `drop-shadow(0 0 3px ${diamondColor}) drop-shadow(0 0 6px ${diamondColor})`,
          `drop-shadow(0 0 1.5px ${diamondColor}66) drop-shadow(0 0 3px ${diamondColor}33)`,
        ],
        transition: {
          duration: 0.8,
          ease: "easeOut",
        },
      })
    }
    prevP2CountRef.current = p2Count
  }, [p2Count, diamondSpinControls, diamondGlowControls])

  // Lock-in animation - fade out inner ring, spin outer ring to 12 o'clock and drain
  useEffect(() => {
    if (animatingLockIn && !isAnimatingRef.current) {
      isAnimatingRef.current = true
      const runAnimation = async () => {
        // Capture current weekly progress
        setLockedInProgress(weekly)
        segmentDashProgress.set(weekly) // Set initial dash to current weekly progress
        setShowArcSegment(true)

        // Fade out inner ring to 40% opacity
        animate(innerRingOpacity, 0.4, {
          duration: 0.3,
          ease: "easeOut",
        })

        await new Promise((resolve) => setTimeout(resolve, 50))

        // Calculate timing:
        // - Tip is at weekly% position, needs to rotate (100-weekly)% to reach noon
        // - Then drain the remaining weekly% while rotating
        const percentToNoon = 100 - weekly // e.g., 100 - 63 = 37%
        const percentToDrain = weekly // e.g., 63%
        const totalDuration = 1.2
        const timeToNoon = (percentToNoon / 100) * totalDuration
        const timeToDrain = (percentToDrain / 100) * totalDuration

        // Notify parent of XP bar timing:
        // - delay: wait for the full circle animation to complete before starting bar fill
        // - duration: fixed 6s fill for a slow, satisfying drain-to-fill visual handoff
        if (onXPBarDelayCalculated) {
          onXPBarDelayCalculated({
            delay: totalDuration,
            duration: 2.5,
          })
        }

        // Spin diamonds as a group around the ring during the drain
        diamondSpinControls.start({
          rotate: [0, 720],
          transition: { duration: totalDuration, ease: "easeIn" },
        })

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

        // Ring fully drained — explode diamonds outward before handing off
        setDiamondsExploding(true)
        await new Promise((resolve) => setTimeout(resolve, 500))

        setShowArcSegment(false)
        isAnimatingRef.current = false
        if (onAnimationComplete) {
          onAnimationComplete()
        }
      }

      runAnimation()
    } else if (!animatingLockIn) {
      isAnimatingRef.current = false
      setDiamondsExploding(false)
      diamondSpinControls.set({ rotate: 0 })
    }
  }, [
    animatingLockIn,
    weekly,
    arcSegmentControls,
    segmentDashProgress,
    innerRingOpacity,
    onAnimationComplete,
    diamondSpinControls,
    onXPBarDelayCalculated,
  ])

  // Reset inner ring opacity when lock-in is cancelled/reset
  useEffect(() => {
    if (!isLockedIn) {
      innerRingOpacity.set(1)
    }
  }, [isLockedIn, innerRingOpacity])

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
          {weekly > 0 && !showArcSegment && !isLockedIn && (
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

          {/* INNER DAILY PROGRESS (gradient) - always visible but fades during animation */}
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
                opacity: innerRingOpacity,
              }}
            />
          )}

          {/* Arc segment that spins during lock-in - uses outer ring with core color */}
          {showArcSegment && (
            <motion.g animate={arcSegmentControls} initial={{ rotate: 0 }}>
              <motion.circle
                cx={expandedCenter}
                cy={expandedCenter}
                r={outerR}
                fill="none"
                stroke={theme.colors.coreColor}
                strokeWidth={strokeOuter - 3}
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
          {/* translate-rotate-translate: moves CSS origin to SVG center before rotating,
              ensuring correct pivot point on iOS WebKit (avoids transform-box bugs) */}
          <g transform={`translate(${expandedCenter} ${expandedCenter})`}>
            <motion.g
              animate={diamondSpinControls}
              style={{ transformOrigin: "0px 0px" }}
            >
              <g transform={`translate(${-expandedCenter} ${-expandedCenter})`}>
                {Array.from({ length: p2Count }).map((_, i) => {
                  const angle = (360 / p2Count) * i - 90
                  const rad = (angle * Math.PI) / 180
                  const x = expandedCenter + diamondOrbitR * Math.cos(rad)
                  const y = expandedCenter + diamondOrbitR * Math.sin(rad)
                  const explodeX = Math.cos(rad) * 55
                  const explodeY = Math.sin(rad) * 55

                  return (
                    // Static SVG translate positions each diamond; animations then happen
                    // relative to its own center (0,0 in the translated space)
                    <g key={i} transform={`translate(${x} ${y})`}>
                      <motion.g
                        initial={{ scale: 0, opacity: 0 }}
                        animate={
                          diamondsExploding
                            ? { scale: 0, opacity: 0, x: explodeX, y: explodeY }
                            : { scale: 1, opacity: 1, x: 0, y: 0 }
                        }
                        transition={
                          diamondsExploding
                            ? { duration: 0.45, ease: "easeOut", delay: i * 0.04 }
                            : { delay: i * 0.05, duration: 0.3, ease: "backOut" }
                        }
                        style={{ transformOrigin: "0px 0px" }}
                      >
                        {/* Month-themed icon — pure SVG, no foreignObject */}
                        <motion.g
                          animate={diamondGlowControls}
                          style={{
                            filter: `drop-shadow(0 0 1.5px ${diamondColor}66) drop-shadow(0 0 3px ${diamondColor}33)`,
                          }}
                        >
                          {/* rotate(90) cancels the parent SVG's rotate(-90deg) so icons appear upright */}
                          <g transform="rotate(90)">
                            {MONTH_SHAPES[currentMonth](diamondColor)}
                          </g>
                        </motion.g>
                      </motion.g>
                    </g>
                  )
                })}
              </g>
            </motion.g>
          </g>

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
