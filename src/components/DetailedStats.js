import React from "react"
import { motion } from "framer-motion"
import theme from "../styles/theme"

function AnimatedNumber({ value }) {
  return <>{Math.round(value)}</>
}

export default function DetailedStats({
  coreWeekly,
  coreWeeklyTotal,
  corePoints,
  reachWeekly,
  reachPoints,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
        padding: "0 8px",
        fontSize: 11,
      }}
    >
      {/* Core Section */}
      <div>
        <div
          style={{
            fontSize: 10,
            color: "#999",
            textTransform: "uppercase",
            fontWeight: 500,
            letterSpacing: "0.5px",
            marginBottom: 3,
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
            marginBottom: 2,
          }}
        >
          {Math.round(coreWeekly)} / {Math.round(coreWeeklyTotal)}
        </div>
        <div
          style={{
            fontSize: 12,
            color: theme.colors.coreColor,
            fontWeight: 600,
          }}
        >
          +<AnimatedNumber value={parseFloat(corePoints)} /> XP
        </div>
      </div>

      {/* Reach Section */}
      <div>
        <div
          style={{
            fontSize: 10,
            color: "#999",
            textTransform: "uppercase",
            fontWeight: 500,
            letterSpacing: "0.5px",
            marginBottom: 3,
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
            marginBottom: 2,
          }}
        >
          {Math.round(reachWeekly)}
        </div>
        <div
          style={{
            fontSize: 12,
            color: theme.colors.reachColor,
            fontWeight: 600,
          }}
        >
          +<AnimatedNumber value={parseFloat(reachPoints)} /> XP
        </div>
      </div>
    </div>
  )
}
