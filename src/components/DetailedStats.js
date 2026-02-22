import React, { useEffect, useRef, useState } from "react"
import { motion, useSpring } from "framer-motion"
import theme from "../styles/theme"

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevValueRef = useRef(value)
  
  useEffect(() => {
    if (prevValueRef.current !== value) {
      const startValue = prevValueRef.current
      const endValue = value
      const startTime = Date.now()
      const duration = 2000 // 2 seconds
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Ease out function
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        const currentValue = startValue + (endValue - startValue) * easedProgress
        
        setDisplayValue(currentValue)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          prevValueRef.current = value
        }
      }
      
      animate()
    }
  }, [value])
  
  return <>{Math.round(displayValue)}</>
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
            fontSize: 12,
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
            fontSize: 20,
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
            fontSize: 14,
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
            fontSize: 12,
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
            fontSize: 20,
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
            fontSize: 14,
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
