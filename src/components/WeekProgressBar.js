import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import theme from "../styles/theme"

// Leveling system utilities
const calculateLevel = (totalXP) => {
  const BASE = 100
  const EXPONENT = 1.35
  
  let level = 1
  let xpRequired = BASE
  let xpAccumulated = 0
  
  while (xpAccumulated + xpRequired <= totalXP) {
    xpAccumulated += xpRequired
    level++
    xpRequired = Math.floor(BASE * Math.pow(level, EXPONENT))
  }
  
  const xpThisLevel = totalXP - xpAccumulated
  const xpToNextLevel = xpRequired
  
  return { level, xpThisLevel, xpToNextLevel, xpAccumulated }
}

// Animated number component (available for future use in breakdown panel)
// eslint-disable-next-line no-unused-vars
const AnimatedNumber = ({ value, duration = 400 }) => {
  const [displayValue, setDisplayValue] = useState(value)
  const prefersReducedMotion = useReducedMotion()
  
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }
    
    const start = displayValue
    const end = value
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = Math.round(start + (end - start) * progress)
      
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [value, duration, prefersReducedMotion, displayValue])
  
  return <>{displayValue}</>
}

// Expandable breakdown panel
const ExpandableBreakdown = ({ 
  isOpen, 
  onClose, 
  coreXP, 
  reachXP, 
  multiplier,
  coreCount,
  reachCount,
  basePoints 
}) => {
  if (!isOpen) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "absolute",
        left: 24,
        top: 0,
        background: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 8,
        padding: 12,
        boxShadow: theme.colors.shadow,
        zIndex: 100,
        minWidth: 220,
        fontSize: 13,
      }}
    >
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 8 
      }}>
        <strong style={{ fontSize: 14 }}>XP Breakdown</strong>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            fontSize: 16,
            color: "#999",
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${theme.colors.border}` }}>
        <div style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>Multiplier</div>
        <div style={{ fontWeight: 600, color: theme.colors.accent }}>×{multiplier.toFixed(2)}</div>
      </div>
      
      <div style={{ marginBottom: 8 }}>
        <div style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>Core XP</div>
        <div style={{ fontSize: 12, color: "#888" }}>
          {coreCount} × {basePoints} = {coreXP.toFixed(1)}
        </div>
      </div>
      
      <div style={{ marginBottom: 8 }}>
        <div style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>Reach XP</div>
        <div style={{ fontSize: 12, color: "#888" }}>
          {reachCount} × {basePoints} × {multiplier.toFixed(2)} = {reachXP.toFixed(1)}
        </div>
      </div>
      
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${theme.colors.border}` }}>
        <div style={{ fontSize: 11, color: "#999", fontStyle: "italic" }}>
          Reach multiplier increases with Core completion
        </div>
      </div>
    </motion.div>
  )
}

// Floating XP feedback
const FloatingXP = ({ amount, color, id }) => {
  const prefersReducedMotion = useReducedMotion()
  
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 0 }}
      animate={{ 
        opacity: prefersReducedMotion ? 1 : [0, 1, 1, 0],
        y: prefersReducedMotion ? -20 : -40,
      }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: -10,
        left: 20,
        fontSize: 12,
        fontWeight: 600,
        color: color,
        pointerEvents: "none",
        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
      }}
    >
      +{amount} XP
    </motion.div>
  )
}

export default function WeekProgressBar({
  totalXP = 0,
  coreXP = 0,
  reachXP = 0,
  coreCount = 0,
  reachCount = 0,
  weeklyP1Percent = 0,
  basePoints = 5,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [floatingFeedback, setFloatingFeedback] = useState(null)
  const [levelUpPulse, setLevelUpPulse] = useState(false)
  const prevTotalXPRef = useRef(totalXP)
  const prevLevelRef = useRef(1)
  const prefersReducedMotion = useReducedMotion()
  
  const { level, xpThisLevel, xpToNextLevel } = calculateLevel(totalXP)
  const progressPercent = (xpThisLevel / xpToNextLevel) * 100
  const multiplier = 0.5 + 0.5 * (weeklyP1Percent / 100)
  
  // Segment heights as percentages
  const totalForHeight = Math.max(coreXP + reachXP, 1)
  const coreHeightPercent = (coreXP / totalForHeight) * 100
  const reachHeightPercent = (reachXP / totalForHeight) * 100
  
  // Detect XP gain for floating feedback
  useEffect(() => {
    if (totalXP > prevTotalXPRef.current && prevTotalXPRef.current > 0) {
      const gained = totalXP - prevTotalXPRef.current
      const dominantColor = (totalXP - prevTotalXPRef.current) > (reachXP * 0.5) 
        ? theme.colors.coreColor 
        : theme.colors.reachColor
      
      setFloatingFeedback({
        amount: Math.round(gained),
        color: dominantColor,
        id: Date.now(),
      })
      
      setTimeout(() => setFloatingFeedback(null), 800)
    }
    prevTotalXPRef.current = totalXP
  }, [totalXP, coreXP, reachXP])
  
  // Detect level up
  useEffect(() => {
    if (level > prevLevelRef.current) {
      setLevelUpPulse(true)
      setTimeout(() => setLevelUpPulse(false), 220)
    }
    prevLevelRef.current = level
  }, [level])
  
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "stretch",
        gap: 8,
        height: "100%",
        minHeight: 120,
      }}
      role="region"
      aria-label="Weekly progress and level"
    >
      {/* Vertical Progress Bar */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
        <motion.div
          animate={levelUpPulse && !prefersReducedMotion ? { 
            scale: [1, 1.06, 1] 
          } : {}}
          transition={{ duration: 0.22 }}
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: 16,
            height: "100%",
            minHeight: 120,
            background: theme.colors.border,
            borderRadius: 8,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
          }}
          role="button"
          aria-label={`Level ${level}, ${Math.round(progressPercent)}% to next level. Click for details.`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setIsExpanded(!isExpanded)
            }
          }}
        >
          {/* Stacked segments - bottom to top */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}>
            {/* Core segment (bottom) */}
            <motion.div
              animate={{ 
                height: `${coreHeightPercent}%` 
              }}
              transition={{ 
                duration: prefersReducedMotion ? 0 : 0.4, 
                ease: "easeOut" 
              }}
              style={{
                background: theme.colors.coreColor,
                width: "100%",
                position: "absolute",
                bottom: 0,
                borderRadius: "0 0 8px 8px",
              }}
            />
            
            {/* Reach segment (top) */}
            <motion.div
              animate={{ 
                height: `${reachHeightPercent}%` 
              }}
              transition={{ 
                duration: prefersReducedMotion ? 0 : 0.4, 
                ease: "easeOut" 
              }}
              style={{
                background: theme.colors.reachColor,
                opacity: 0.7,
                width: "100%",
                position: "absolute",
                bottom: `${coreHeightPercent}%`,
                borderRadius: coreHeightPercent < 5 ? "8px" : "8px 8px 0 0",
              }}
            />
          </div>
          
          {/* Level indicator at top */}
          <div style={{
            position: "absolute",
            top: -2,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            fontWeight: 700,
            color: theme.colors.accent,
            background: theme.colors.background,
            padding: "2px 4px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            L{level}
          </div>
          
          {/* Chevron indicator */}
          <div style={{
            position: "absolute",
            bottom: 4,
            left: "50%",
            transform: `translateX(-50%) ${isExpanded ? "rotate(180deg)" : "rotate(0deg)"}`,
            fontSize: 8,
            color: "#999",
            transition: "transform 0.2s",
          }}>
            ▼
          </div>
        </motion.div>
        
        {/* Progress percentage */}
        <div style={{
          position: "absolute",
          bottom: -20,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 10,
          color: "#999",
          whiteSpace: "nowrap",
        }}>
          {Math.round(progressPercent)}%
        </div>
        
        {/* Floating XP feedback */}
        <AnimatePresence>
          {floatingFeedback && (
            <FloatingXP
              amount={floatingFeedback.amount}
              color={floatingFeedback.color}
              id={floatingFeedback.id}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Expandable breakdown panel */}
      <AnimatePresence>
        {isExpanded && (
          <ExpandableBreakdown
            isOpen={isExpanded}
            onClose={() => setIsExpanded(false)}
            coreXP={coreXP}
            reachXP={reachXP}
            multiplier={multiplier}
            coreCount={coreCount}
            reachCount={reachCount}
            basePoints={basePoints}
          />
        )}
      </AnimatePresence>
      
      {/* Aria live region for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          left: -10000,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        Total XP {Math.round(totalXP)}, Level {level}, {Math.round(progressPercent)}% to next level
      </div>
    </div>
  )
}
