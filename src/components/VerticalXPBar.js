import React, { useState, useEffect, useRef } from "react"
import { motion, useReducedMotion, useAnimation } from "framer-motion"
import theme from "../styles/theme"
import { useUserContext } from "../contexts/UserContext"

// Module-level constant — not a ref, so changes survive hot reload
const XP_THRESHOLDS = [
  0, 100, 350, 800, 1600, 3000, 5500, 9500, 16000, 26000, 42000,
]

export default function VerticalXPBar({
  currentXP = 0, // Deprecated - kept for backward compatibility
  coreXP = 0,
  reachXP = 0,
  animatingLockIn = false,
  isLockedIn = false,
  animationDelay = 0,
  animationDuration = 0.35,
}) {
  const { user } = useUserContext()
  const lifetimeXP = user?.lifetimeXP || 0
  const prefersReducedMotion = useReducedMotion()
  const coreControls = useAnimation()
  const reachControls = useAnimation()

  // Helper function to calculate level from XP - memoized to avoid recreating
  const getLevelInfo = React.useCallback((xp) => {
    let level = 1
    let xpForLevel = 0
    let xpForNextLevel = XP_THRESHOLDS[1]

    for (let i = 0; i < XP_THRESHOLDS.length - 1; i++) {
      if (xp >= XP_THRESHOLDS[i + 1]) {
        level = i + 2
        xpForLevel = XP_THRESHOLDS[i + 1]
        xpForNextLevel = XP_THRESHOLDS[i + 2] || XP_THRESHOLDS[i + 1] + 2000
      } else {
        break
      }
    }

    return { level, xpForLevel, xpForNextLevel }
  }, [])

  // State for displaying current animation segment
  const [displayLevel, setDisplayLevel] = useState(
    () => getLevelInfo(lifetimeXP).level,
  )
  const [displayXpForLevel, setDisplayXpForLevel] = useState(
    () => getLevelInfo(lifetimeXP).xpForLevel,
  )
  const [displayXpForNextLevel, setDisplayXpForNextLevel] = useState(
    () => getLevelInfo(lifetimeXP).xpForNextLevel,
  )
  const [currentBarPercent, setCurrentBarPercent] = useState(0)
  const [isGlowing, setIsGlowing] = useState(false)
  const [displayXpInLevel, setDisplayXpInLevel] = useState(() => {
    const info = getLevelInfo(lifetimeXP)
    return lifetimeXP - info.xpForLevel
  })

  // Track if we've initialized the bar position
  const hasInitialized = useRef(false)
  const prevIsLockedIn = useRef(isLockedIn)
  // Prevent animation from re-triggering if lifetimeXP/coreXP props change mid-animation
  // (e.g. when the background refetchUser resolves during the ring/XP animation)
  const animationRunningRef = useRef(false)

  // Detect reset (when isLockedIn changes from true to false)
  useEffect(() => {
    if (prevIsLockedIn.current && !isLockedIn) {
      // Reset detected - return to initial state
      const initialLevelInfo = getLevelInfo(lifetimeXP)
      const initialXpInLevel = lifetimeXP - initialLevelInfo.xpForLevel
      const initialNeeded =
        initialLevelInfo.xpForNextLevel - initialLevelInfo.xpForLevel
      const initialPercent = Math.min(
        (initialXpInLevel / initialNeeded) * 100,
        100,
      )

      setDisplayLevel(initialLevelInfo.level)
      setDisplayXpForLevel(initialLevelInfo.xpForLevel)
      setDisplayXpForNextLevel(initialLevelInfo.xpForNextLevel)
      setDisplayXpInLevel(initialXpInLevel)
      setCurrentBarPercent(initialPercent)
      coreControls.set({ height: `${initialPercent}%` })

      console.log(
        "[VerticalXPBar] Reset detected, bar reset to:",
        initialPercent + "%",
      )
    }
    prevIsLockedIn.current = isLockedIn
  }, [isLockedIn, lifetimeXP, getLevelInfo, coreControls])

  useEffect(() => {
    const initialLevelInfo = getLevelInfo(lifetimeXP)
    const initialXpInLevel = lifetimeXP - initialLevelInfo.xpForLevel
    const initialNeeded =
      initialLevelInfo.xpForNextLevel - initialLevelInfo.xpForLevel
    const initialPercent = Math.min(
      (initialXpInLevel / initialNeeded) * 100,
      100,
    )

    console.log("[VerticalXPBar] Initialization check:", {
      lifetimeXP,
      initialXpInLevel,
      initialNeeded,
      initialPercent,
      hasInitialized: hasInitialized.current,
    })

    // Skip re-initialization if the lock-in animation is actively running —
    // the async animation sequence owns display state until it finishes.
    if ((!hasInitialized.current || !animatingLockIn) && !animationRunningRef.current) {
      setCurrentBarPercent(initialPercent)
      setDisplayLevel(initialLevelInfo.level)
      setDisplayXpForLevel(initialLevelInfo.xpForLevel)
      setDisplayXpForNextLevel(initialLevelInfo.xpForNextLevel)
      setDisplayXpInLevel(initialXpInLevel)
      coreControls.set({ height: `${initialPercent}%` })
      hasInitialized.current = true
      console.log(
        "[VerticalXPBar] Bar initialized/updated to",
        initialPercent + "%",
      )
    }
  }, [lifetimeXP, getLevelInfo, coreControls, animatingLockIn])

  // Handle the sequential level-up animations
  useEffect(() => {
    console.log("[VerticalXPBar] Animation effect triggered:", {
      animatingLockIn,
      prefersReducedMotion,
      lifetimeXP,
      coreXP,
    })

    if (!animatingLockIn || prefersReducedMotion) return

    // Guard: if animation already running, ignore prop changes (e.g. lifetimeXP updating
    // mid-animation from the background refetchUser call in WeekGuardContext)
    if (animationRunningRef.current) return
    animationRunningRef.current = true

    console.log("[VerticalXPBar] Starting animation:", {
      lifetimeXP,
      coreXP,
      animationDelay,
      animationDuration,
    })

    const runLevelUpSequence = async () => {
      // Build animation sequence
      const segments = []
      let currentAnimXP = lifetimeXP
      let targetAnimXP = coreXP

      while (currentAnimXP < targetAnimXP) {
        const levelInfo = getLevelInfo(currentAnimXP)
        const xpInLevel = currentAnimXP - levelInfo.xpForLevel
        const xpNeeded = levelInfo.xpForNextLevel - levelInfo.xpForLevel
        const startPercent = (xpInLevel / xpNeeded) * 100

        // Determine how much XP to add in this segment
        const remainingXP = targetAnimXP - currentAnimXP
        const xpToLevelUp = levelInfo.xpForNextLevel - currentAnimXP

        if (remainingXP >= xpToLevelUp) {
          // Will level up - fill to 100%
          segments.push({
            level: levelInfo.level,
            xpForLevel: levelInfo.xpForLevel,
            xpForNextLevel: levelInfo.xpForNextLevel,
            startPercent,
            endPercent: 100,
            xpGained: xpToLevelUp,
            willLevelUp: true,
          })
          currentAnimXP = levelInfo.xpForNextLevel
        } else {
          // Final segment - partial fill
          const finalXpInLevel = remainingXP + xpInLevel
          const endPercent = (finalXpInLevel / xpNeeded) * 100
          segments.push({
            level: levelInfo.level,
            xpForLevel: levelInfo.xpForLevel,
            xpForNextLevel: levelInfo.xpForNextLevel,
            startPercent,
            endPercent,
            xpGained: remainingXP,
            willLevelUp: false,
          })
          currentAnimXP = targetAnimXP
        }
      }

      console.log("[VerticalXPBar] Animation segments:", segments)

      // Execute animation sequence
      let cumulativeDelay = animationDelay

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]

        // Update display values
        setDisplayLevel(segment.level)
        setDisplayXpForLevel(segment.xpForLevel)
        setDisplayXpForNextLevel(segment.xpForNextLevel)

        // Calculate duration proportional to bar distance traveled within this level.
        // animationDuration = time for a full 0→100% fill, so partial fills scale down.
        const barDistance = segment.endPercent - segment.startPercent
        const segmentDuration = (barDistance / 100) * animationDuration

        console.log(`[VerticalXPBar] Segment ${i}:`, {
          level: segment.level,
          startPercent: segment.startPercent,
          endPercent: segment.endPercent,
          segmentDuration,
          cumulativeDelay,
        })

        // Animate the XP numerator value
        const startXpInLevel =
          (segment.startPercent *
            (segment.xpForNextLevel - segment.xpForLevel)) /
          100
        const endXpInLevel =
          (segment.endPercent * (segment.xpForNextLevel - segment.xpForLevel)) /
          100

        // Animate this segment with both bar and text updates
        const animationPromise = coreControls.start({
          height: `${segment.endPercent}%`,
          transition: {
            duration: segmentDuration,
            delay: cumulativeDelay,
            ease: "circIn", // slow start → fast finish, builds momentum toward level-up
          },
        })

        // Animate the XP text separately, matching circIn easing so it stays in sync with bar.
        // circIn: f(t) = 1 - sqrt(1 - t²)
        const circIn = (t) => 1 - Math.sqrt(1 - t * t)

        const startTime = Date.now() + cumulativeDelay * 1000
        const endTime = startTime + segmentDuration * 1000

        const animateXpText = () => {
          const now = Date.now()
          if (now < startTime) {
            requestAnimationFrame(animateXpText)
            return
          }

          if (now >= endTime) {
            setDisplayXpInLevel(Math.round(endXpInLevel))
            return
          }

          const t = (now - startTime) / (segmentDuration * 1000)
          const currentXpValue =
            startXpInLevel + (endXpInLevel - startXpInLevel) * circIn(t)
          setDisplayXpInLevel(Math.round(currentXpValue))
          requestAnimationFrame(animateXpText)
        }

        if (segmentDuration > 0) {
          animateXpText()
        }

        await animationPromise

        cumulativeDelay = 0 // Only first segment has initial delay

        // If we leveled up: glow in, hold, reset bar, let glow fade during next fill
        if (segment.willLevelUp && i < segments.length - 1) {
          setIsGlowing(true)
          await new Promise((resolve) => setTimeout(resolve, 700))
          coreControls.set({ height: "0%" })
          setDisplayXpInLevel(0)
          // Don't await — glow fades out while next level fill begins
          setTimeout(() => setIsGlowing(false), 50)
        }
      }
    }

    runLevelUpSequence().finally(() => {
      animationRunningRef.current = false
    })
  }, [
    animatingLockIn,
    animationDelay,
    animationDuration,
    lifetimeXP,
    coreXP,
    prefersReducedMotion,
    getLevelInfo,
    coreControls,
  ])

  // Calculate display values for XP text
  const xpNeededForLevel = displayXpForNextLevel - displayXpForLevel

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: 200,
        padding: "0 8px",
      }}
    >
      {/* XP fraction at top */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 500,
          color: "#666",
          marginBottom: 2,
          whiteSpace: "nowrap",
        }}
      >
        {Math.round(displayXpInLevel)} / {xpNeededForLevel}
      </div>

      {/* Level label */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "#999",
          marginBottom: 4,
        }}
      >
        Lv {displayLevel}
      </div>

      {/* Vertical bar */}
      <div
        style={{
          position: "relative",
          width: 16,
          height: "100%",
          background: theme.colors.border,
          borderRadius: 8,
          overflow: "hidden",
          transition: "box-shadow 0.3s ease",
          boxShadow: isGlowing
            ? `0 0 8px 3px ${theme.colors.completeColor}, 0 0 16px 6px ${theme.colors.completeColor}88`
            : "none",
        }}
      >
        {/* Core XP portion (from bottom) */}
        <motion.div
          animate={coreControls}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: isGlowing
              ? theme.colors.completeColor
              : theme.colors.coreColor,
            transition: "background-color 0.3s ease",
            borderRadius: 8,
          }}
        />
        {/* Reach XP portion (stacked on top of core) - for future implementation */}
        {!animatingLockIn && (
          <motion.div
            animate={reachControls}
            style={{
              position: "absolute",
              bottom: `${currentBarPercent}%`,
              left: 0,
              right: 0,
              background: theme.colors.reachColor,
              borderRadius: 8,
              height: 0,
            }}
          />
        )}
      </div>

      {/* Current level at bottom */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: theme.colors.text,
          marginTop: 4,
        }}
      >
        Lvl {displayLevel}
      </div>
    </div>
  )
}
