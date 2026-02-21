import React, { useState, useEffect, useRef } from "react"
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion"
import theme from "../styles/theme"

function AnimatedNumber({ value, duration = 0.4 }) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (latest) => Math.round(latest))
  const [displayValue, setDisplayValue] = useState(Math.round(value))

  useEffect(() => {
    spring.set(value)
    const unsubscribe = display.onChange(setDisplayValue)
    return unsubscribe
  }, [value, spring, display])

  return <>{displayValue}</>
}

export function IntegratedStats({
  coreWeekly,
  coreWeeklyTotal,
  corePoints,
  reachWeekly,
  reachPoints,
  totalPoints,
  weeklyP1Percent,
}) {
  const prevCorePoints = useRef(parseFloat(corePoints))
  const prevReachPoints = useRef(parseFloat(reachPoints))
  const [pulseMultiplier, setPulseMultiplier] = useState(false)

  // Calculate multiplier
  const multiplier = 0.5 + 0.5 * (weeklyP1Percent / 100)

  // Detect multiplier increase
  useEffect(() => {
    const prevMultiplier =
      0.5 + 0.5 * (prevCorePoints.current / (parseFloat(coreWeekly) || 1))
    if (multiplier > prevMultiplier && prevMultiplier > 0) {
      setPulseMultiplier(true)
      setTimeout(() => setPulseMultiplier(false), 600)
    }
  }, [multiplier, coreWeekly])

  // Update refs
  useEffect(() => {
    prevCorePoints.current = parseFloat(corePoints)
    prevReachPoints.current = parseFloat(reachPoints)
  }, [corePoints, reachPoints])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        minWidth: 100,
      }}
    >
      {/* Total - Prominent */}
      <div style={{ marginBottom: 16 }}>
        <motion.div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: theme.colors.text,
            lineHeight: 1,
          }}
        >
          <AnimatedNumber value={parseFloat(totalPoints)} /> XP
        </motion.div>
        <div
          style={{
            fontSize: 11,
            color: "#666",
            fontWeight: 600,
            marginTop: 3,
            letterSpacing: "0.3px",
          }}
        >
          This Week
        </div>
      </div>

      {/* Core */}
      <div style={{ paddingLeft: 8 }}>
        <div
          style={{
            fontSize: 9,
            color: "#999",
            textTransform: "uppercase",
            fontWeight: 500,
            letterSpacing: "0.5px",
            marginBottom: 2,
          }}
        >
          Core
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: theme.colors.text,
            lineHeight: 1.2,
          }}
        >
          {Math.round(coreWeekly)} / {Math.round(coreWeeklyTotal)}
        </div>
        <motion.div
          style={{
            fontSize: 11,
            color: theme.colors.coreColor,
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          +<AnimatedNumber value={parseFloat(corePoints)} /> XP
        </motion.div>
      </div>

      {/* Reach */}
      <div style={{ paddingLeft: 8 }}>
        <div
          style={{
            fontSize: 9,
            color: "#999",
            textTransform: "uppercase",
            fontWeight: 500,
            letterSpacing: "0.5px",
            marginBottom: 2,
          }}
        >
          Reach
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: theme.colors.text,
            lineHeight: 1.2,
          }}
        >
          {Math.round(reachWeekly)}
        </div>
        <motion.div
          style={{
            fontSize: 11,
            color: theme.colors.reachColor,
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          +<AnimatedNumber value={parseFloat(reachPoints)} /> XP
        </motion.div>
        {/* Multiplier Display - Hidden for now */}
        {/* <motion.div
          animate={pulseMultiplier ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: 9,
            color: "#999",
            fontWeight: 500,
            marginTop: 3,
          }}
        >
          ×{multiplier.toFixed(2)}
        </motion.div> */}
      </div>
    </div>
  )
}
