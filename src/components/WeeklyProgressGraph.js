import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import RingProgressGraph from "./RingProgressGraph"
import DetailedStats from "./DetailedStats"
import VerticalXPBar from "./VerticalXPBar"
import { BASE_POINTS } from "../constants/habitDefaults"
import theme from "../styles/theme"

// NEW PROPS:
// - dailyP1Percent must be passed from parent
export default function WeeklyProgressGraph({
  habits,
  activeWeekRange,
  activeDate,
  onXPUpdate,
}) {
  const [floatingXP, setFloatingXP] = useState(null)
  const [isLockedIn, setIsLockedIn] = useState(false)
  const [animatingLockIn, setAnimatingLockIn] = useState(false)
  const [xpBarTiming, setXpBarTiming] = useState({ delay: 0, duration: 0 }) // Timing for XP bar
  const [xpBeforeLockIn, setXpBeforeLockIn] = useState(0) // Track XP before lock-in starts
  const prevTotalPointsRef = useRef(0)
  const prevCorePointsRef = useRef(0)
  const prevReachPointsRef = useRef(0)
  // --- Build list of all week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(activeWeekRange.start)
    d.setDate(d.getDate() + i)
    return d.toISOString().slice(0, 10)
  })

  // --- Split by type
  const P1_habits = habits.filter((h) => h.type === "P1")
  const P2_habits = habits.filter((h) => h.type === "P2")

  // --- Compute Weekly P1 Totals
  let P1_total = 0
  let P1_done = 0

  P1_habits.forEach((habit) => {
    const timesPerWeek = habit.frequency?.timesPerWeek || 0
    P1_total += timesPerWeek

    const completed = weekDays.filter((d) =>
      habit.completedDates.includes(d),
    ).length

    P1_done += Math.min(completed, timesPerWeek)
  })

  // How many P1 completions were done before today?
  const P1_done_before_today = P1_habits.reduce((acc, habit) => {
    const timesPerWeek = habit.frequency?.timesPerWeek || 0

    const fromPastDays = weekDays
      .filter((d) => d < activeDate)
      .filter((d) => habit.completedDates.includes(d)).length

    return acc + Math.min(fromPastDays, timesPerWeek)
  }, 0)

  const P1_remaining = Math.max(0, P1_total - P1_done_before_today)

  // Days remaining (including today)
  const todayIndex = weekDays.indexOf(activeDate)
  const daysRemaining = weekDays.length - todayIndex

  // Ideal target for today
  const idealP1ForToday =
    daysRemaining > 0 ? Math.ceil(P1_remaining / daysRemaining) : P1_remaining

  // Pace marker: 1/7th should be done for each day of the week (Mon=1/7, Tue=2/7, etc.)
  const idealP1ByToday = Math.ceil((P1_total / 7) * (todayIndex + 1))
  const idealP1PercentByToday =
    P1_total === 0 ? 100 : (idealP1ByToday / P1_total) * 100

  // How many P1s were actually done today?
  // Only count P1s that have NOT already completed their required frequency for the week
  const P1_done_today = P1_habits.filter((h) => {
    const timesPerWeek = h.frequency?.timesPerWeek || 0
    const completedThisWeek = weekDays.filter((d) =>
      h.completedDates.includes(d),
    ).length
    // Only count if not already completed for the week
    return (
      h.completedDates.includes(activeDate) && completedThisWeek <= timesPerWeek
    )
  }).length

  const dailyP1Percent =
    idealP1ForToday === 0 ? 100 : (P1_done_today / idealP1ForToday) * 100
  const weeklyP1Percent = P1_total === 0 ? 0 : (P1_done / P1_total) * 100

  let P2_done = 0
  P2_habits.forEach((habit) => {
    const completed = weekDays.filter((d) =>
      habit.completedDates.includes(d),
    ).length
    P2_done += completed
  })

  // P1s done above frequency also count towards P2 XP
  const P1s_counted_as_p2 = P1_habits.filter((h) => {
    const timesPerWeek = h.frequency?.timesPerWeek || 0
    const completedThisWeek = weekDays.filter((d) =>
      h.completedDates.includes(d),
    ).length
    // Only count if not already completed for the week
    return (
      h.completedDates.includes(activeDate) && completedThisWeek > timesPerWeek
    )
  }).length

  P2_done += P1s_counted_as_p2

  const P2_scale = 0.5 + 0.5 * (weeklyP1Percent / 100)
  const P2_points = P2_done * BASE_POINTS * P2_scale

  const P1_points = weeklyP1Percent * BASE_POINTS
  const totalPoints = P1_points + P2_points

  // Detect XP gain and show floating feedback
  useEffect(() => {
    const currentTotal = parseFloat(totalPoints.toFixed(1))
    const currentCore = parseFloat(P1_points.toFixed(1))
    const currentReach = parseFloat(P2_points.toFixed(1))
    const prevTotal = prevTotalPointsRef.current
    const prevCore = prevCorePointsRef.current
    const prevReach = prevReachPointsRef.current

    if (currentTotal > prevTotal && prevTotal > 0) {
      const gainedXP = currentTotal - prevTotal
      const coreGained = currentCore - prevCore
      const reachGained = currentReach - prevReach

      // Determine color based on which type increased more
      const color =
        coreGained >= reachGained
          ? theme.colors.coreColor
          : theme.colors.reachColor

      setFloatingXP({
        amount: Math.round(gainedXP),
        color: color,
        id: Date.now(),
      })

      // Clear floating XP after animation
      setTimeout(() => setFloatingXP(null), 1500)
    }

    prevTotalPointsRef.current = currentTotal
    prevCorePointsRef.current = currentCore
    prevReachPointsRef.current = currentReach

    // Notify parent of XP update with breakdown
    if (onXPUpdate) {
      onXPUpdate({
        total: currentTotal,
        core: currentCore,
        reach: currentReach,
      })
    }
  }, [totalPoints, P1_points, P2_points, onXPUpdate])

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "10px 16px 60px 16px",
        boxSizing: "border-box",
        position: "relative",
        isolation: "isolate",
      }}
    >
      {/* Detailed Stats - Absolute positioned left */}
      <div style={{ position: "absolute", left: 16, zIndex: 1 }}>
        <DetailedStats
          coreWeekly={P1_done}
          coreWeeklyTotal={P1_total}
          corePoints={P1_points.toFixed(1)}
          reachWeekly={P2_done}
          reachPoints={P2_points.toFixed(1)}
        />
      </div>

      {/* Ring Graph - True center */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <RingProgressGraph
          dailyP1={dailyP1Percent} // INNER RING
          weeklyP1={weeklyP1Percent} // OUTER RING
          p2Count={P2_done} // P2 diamonds
          weeklyPaceMarker={idealP1PercentByToday} // PACE MARKER
          isLockedIn={isLockedIn}
          animatingLockIn={animatingLockIn}
          onAnimationComplete={() => setAnimatingLockIn(false)}
          onXPBarDelayCalculated={setXpBarTiming}
        />
      </div>

      {/* Vertical XP Bar - Absolute positioned right */}
      <div style={{ position: "absolute", right: 16, zIndex: 1 }}>
        <VerticalXPBar
          currentXP={xpBeforeLockIn}
          coreXP={xpBeforeLockIn + parseFloat(P1_points.toFixed(1))}
          reachXP={xpBeforeLockIn + parseFloat(totalPoints.toFixed(1))}
          animatingLockIn={animatingLockIn}
          isLockedIn={isLockedIn}
          animationDelay={xpBarTiming.delay}
          animationDuration={xpBarTiming.duration}
        />
      </div>

      {/* Lock In Test Button */}
      <button
        onClick={() => {
          if (isLockedIn) {
            // Reset
            setIsLockedIn(false)
            setAnimatingLockIn(false)
            setXpBeforeLockIn(0)
          } else {
            // Lock in - for testing, start from 0 XP (or could be a test value like 100)
            // In production, this would be the user's actual accumulated XP
            setXpBeforeLockIn(0) // TODO: Replace with actual user XP from database
            setIsLockedIn(true)
            setAnimatingLockIn(true)
          }
        }}
        style={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "8px 16px",
          background: isLockedIn ? "#666" : theme.colors.coreColor,
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        {isLockedIn ? "Reset" : "Lock In Week"}
      </button>

      {/* Floating +XP Feedback */}
      <AnimatePresence>
        {floatingXP && (
          <motion.div
            key={floatingXP.id}
            initial={{ opacity: 0, x: -20, y: -20, scale: 0.8 }}
            animate={{
              opacity: 1,
              x: -20,
              y: -35,
              scale: 1,
              transition: { duration: 0.3, ease: "easeOut" },
            }}
            exit={{
              opacity: 0,
              x: -20,
              y: -50,
              scale: 0.8,
              transition: { duration: 1, ease: "easeOut" },
            }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 13,
              fontWeight: 600,
              color: floatingXP.color,
              pointerEvents: "none",
              textShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            +{floatingXP.amount} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right space reserved for future content */}
    </div>
  )
}
