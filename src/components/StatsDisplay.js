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
  basePoints,
  multiplier,
}) {
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
      {/* Core */}
      <div style={{ paddingLeft: 8 }}>
        <div
          style={{
            fontSize: 10,
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
            fontSize: 16,
            fontWeight: 700,
            color: theme.colors.text,
            lineHeight: 1.2,
          }}
        >
          {Math.round(coreWeekly)} / {Math.round(coreWeeklyTotal)}
        </div>
        <motion.div
          style={{
            fontSize: 12,
            color: theme.colors.coreColor,
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          +<AnimatedNumber value={parseFloat(corePoints)} /> XP
        </motion.div>
        <div
          style={{
            fontSize: 9,
            color: "#999",
            fontWeight: 500,
            marginTop: 2,
          }}
        >
          {basePoints} base pts
        </div>
      </div>

      {/* Reach */}
      <div style={{ paddingLeft: 8 }}>
        <div
          style={{
            fontSize: 10,
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
            fontSize: 16,
            fontWeight: 700,
            color: theme.colors.text,
            lineHeight: 1.2,
          }}
        >
          {Math.round(reachWeekly)}
        </div>
        <motion.div
          style={{
            fontSize: 12,
            color: theme.colors.reachColor,
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          +<AnimatedNumber value={parseFloat(reachPoints)} /> XP
        </motion.div>
        <div
          style={{
            fontSize: 9,
            color: "#999",
            fontWeight: 500,
            marginTop: 2,
          }}
        >
          ×{multiplier.toFixed(2)} multiplier
        </div>
      </div>
    </div>
  )
}
