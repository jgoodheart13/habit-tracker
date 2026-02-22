import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import theme from "../styles/theme"

export default function VerticalXPBar({
  currentXP = 0,
  coreXP = 0,
  reachXP = 0,
  animatingLockIn = false,
  animationDelay = 0,
  animationDuration = 0.35,
}) {
  const prefersReducedMotion = useReducedMotion()

  // Simple scaffolding: Level 1 always, 500 XP to Level 2
  const level = 1
  const nextLevel = 2
  const xpToNextLevel = 500

  // Progress calculation (percentages from bottom)
  const corePercent = Math.min((coreXP / xpToNextLevel) * 100, 100)
  const reachPercent = Math.min((reachXP / xpToNextLevel) * 100, 100)

  // Use the calculated delay and duration from parent
  const fillDelay = animationDelay
  const fillDuration = animationDuration > 0 ? animationDuration : 0.35

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
        {Math.round(currentXP)} / {xpToNextLevel}
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
        Lvl {nextLevel}
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
        }}
      >
        {/* Core XP portion (from bottom) */}
        <motion.div
          initial={{ height: "0%" }}
          animate={{
            height: `${corePercent}%`,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : fillDuration,
            delay: fillDelay,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: theme.colors.coreColor,
            borderRadius: 8,
          }}
        />
        {/* Reach XP portion (stacked on top of core) */}
        <motion.div
          initial={{ height: "0%" }}
          animate={{
            height: `${reachPercent}%`,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : fillDuration,
            delay: fillDelay,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            bottom: `${corePercent}%`,
            left: 0,
            right: 0,
            background: theme.colors.reachColor,
            borderRadius: 8,
          }}
        />
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
        Lvl {level}
      </div>
    </div>
  )
}
