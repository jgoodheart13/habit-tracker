import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import theme from "../styles/theme"

export default function LevelProgress({ currentXP = 0, coreXP = 0, reachXP = 0, onToggleStats }) {
  const prefersReducedMotion = useReducedMotion()
  
  // Simple scaffolding: Level 1 always, 500 XP to Level 2
  const level = 1
  const nextLevel = 2
  const xpToNextLevel = 500
  
  // Progress calculation
  const progressPercent = Math.min((currentXP / xpToNextLevel) * 100, 100)
  const corePercent = Math.min((coreXP / xpToNextLevel) * 100, 100)
  const reachPercent = Math.min((reachXP / xpToNextLevel) * 100, 100)
  
  return (
    <div
      onClick={onToggleStats}
      style={{
        width: "100%",
        padding: "8px 16px 0 16px",
        background: theme.colors.background,
        boxSizing: "border-box",
        cursor: "pointer",
      }}
    >
      {/* Level labels and XP fraction */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: theme.colors.text,
          }}
        >
          Level {level}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#666",
          }}
        >
          {Math.round(currentXP)} / {xpToNextLevel} XP
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 10,
          background: theme.colors.border,
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        {/* Core XP portion */}
        <motion.div
          animate={{
            width: `${corePercent}%`,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.35,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            left: 0,
            height: "100%",
            background: theme.colors.coreColor,
            borderRadius: 5,
          }}
        />
        {/* Reach XP portion */}
        <motion.div
          animate={{
            width: `${reachPercent}%`,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.35,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            left: `${corePercent}%`,
            height: "100%",
            background: theme.colors.reachColor,
            borderRadius: 5,
          }}
        />
      </div>

      {/* Level 2 indicator */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 0,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#999",
          }}
        >
          Level {nextLevel}
        </span>
      </div>
    </div>
  )
}
