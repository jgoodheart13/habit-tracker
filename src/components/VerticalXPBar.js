import React, { useState, useEffect, useRef } from "react"
import { motion, useReducedMotion, useAnimation } from "framer-motion"
import theme from "../styles/theme"

export default function VerticalXPBar({
  currentXP = 0,
  coreXP = 0,
  reachXP = 0,
  animatingLockIn = false,
  isLockedIn = false,
  animationDelay = 0,
  animationDuration = 0.35,
}) {
  const prefersReducedMotion = useReducedMotion()
  const coreControls = useAnimation()
  const reachControls = useAnimation()

  // Level progression logic
  const xpThresholds = useRef([0, 500, 1200, 2000, 3000, 4200, 5600, 7200, 9000])
  
  // Helper function to calculate level from XP - memoized to avoid recreating
  const getLevelInfo = React.useCallback((xp) => {
    let level = 1
    let xpForLevel = 0
    let xpForNextLevel = xpThresholds.current[1]
    
    for (let i = 0; i < xpThresholds.current.length - 1; i++) {
      if (xp >= xpThresholds.current[i + 1]) {
        level = i + 2
        xpForLevel = xpThresholds.current[i + 1]
        xpForNextLevel = xpThresholds.current[i + 2] || xpThresholds.current[i + 1] + 2000
      } else {
        break
      }
    }
    
    return { level, xpForLevel, xpForNextLevel }
  }, [])
  
  // State for displaying current animation segment
  const [displayLevel, setDisplayLevel] = useState(() => getLevelInfo(currentXP).level)
  const [displayXpForLevel, setDisplayXpForLevel] = useState(() => getLevelInfo(currentXP).xpForLevel)
  const [displayXpForNextLevel, setDisplayXpForNextLevel] = useState(() => getLevelInfo(currentXP).xpForNextLevel)
  const [currentBarPercent, setCurrentBarPercent] = useState(0)
  const [displayXpInLevel, setDisplayXpInLevel] = useState(() => {
    const info = getLevelInfo(currentXP)
    return currentXP - info.xpForLevel
  })
  
  // Track if we've initialized the bar position
  const hasInitialized = useRef(false)
  const prevIsLockedIn = useRef(isLockedIn)
  
  // Detect reset (when isLockedIn changes from true to false)
  useEffect(() => {
    if (prevIsLockedIn.current && !isLockedIn) {
      // Reset detected - return to initial state
      const initialLevelInfo = getLevelInfo(currentXP)
      const initialXpInLevel = currentXP - initialLevelInfo.xpForLevel
      const initialNeeded = initialLevelInfo.xpForNextLevel - initialLevelInfo.xpForLevel
      const initialPercent = Math.min((initialXpInLevel / initialNeeded) * 100, 100)
      
      setDisplayLevel(initialLevelInfo.level)
      setDisplayXpForLevel(initialLevelInfo.xpForLevel)
      setDisplayXpForNextLevel(initialLevelInfo.xpForNextLevel)
      setDisplayXpInLevel(initialXpInLevel)
      setCurrentBarPercent(initialPercent)
      coreControls.set({ height: `${initialPercent}%` })
      
      console.log('[VerticalXPBar] Reset detected, bar reset to:', initialPercent + '%')
    }
    prevIsLockedIn.current = isLockedIn
  }, [isLockedIn, currentXP, getLevelInfo, coreControls])
  
  useEffect(() => {
    const initialLevelInfo = getLevelInfo(currentXP)
    const initialXpInLevel = currentXP - initialLevelInfo.xpForLevel
    const initialNeeded = initialLevelInfo.xpForNextLevel - initialLevelInfo.xpForLevel
    const initialPercent = Math.min((initialXpInLevel / initialNeeded) * 100, 100)
    
    console.log('[VerticalXPBar] Initialization check:', {
      currentXP,
      initialXpInLevel,
      initialNeeded,
      initialPercent,
      hasInitialized: hasInitialized.current,
    })
    
    if (!hasInitialized.current) {
      setCurrentBarPercent(initialPercent)
      coreControls.set({ height: `${initialPercent}%` })
      hasInitialized.current = true
      console.log('[VerticalXPBar] Bar initialized to', initialPercent + '%')
    }
  }, [currentXP, getLevelInfo, coreControls])
  
  // Handle the sequential level-up animations
  useEffect(() => {
    console.log('[VerticalXPBar] Animation effect triggered:', {
      animatingLockIn,
      prefersReducedMotion,
      currentXP,
      coreXP,
    })
    
    if (!animatingLockIn || prefersReducedMotion) return
    
    console.log('[VerticalXPBar] Starting animation:', { currentXP, coreXP, animationDelay, animationDuration })
    
    const runLevelUpSequence = async () => {
      // Build animation sequence
      const segments = []
      let currentAnimXP = currentXP
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
      
      console.log('[VerticalXPBar] Animation segments:', segments)
      
      // Execute animation sequence
      let cumulativeDelay = animationDelay
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        
        // Update display values
        setDisplayLevel(segment.level)
        setDisplayXpForLevel(segment.xpForLevel)
        setDisplayXpForNextLevel(segment.xpForNextLevel)
        
        // Calculate duration for this segment proportional to XP gained
        const totalXPToGain = coreXP - currentXP
        const segmentDuration = (segment.xpGained / totalXPToGain) * animationDuration
        
        console.log(`[VerticalXPBar] Segment ${i}:`, {
          level: segment.level,
          startPercent: segment.startPercent,
          endPercent: segment.endPercent,
          segmentDuration,
          cumulativeDelay,
        })
        
        // Animate the XP numerator value
        const startXpInLevel = segment.startPercent * (segment.xpForNextLevel - segment.xpForLevel) / 100
        const endXpInLevel = segment.endPercent * (segment.xpForNextLevel - segment.xpForLevel) / 100
        
        // Animate this segment with both bar and text updates
        const animationPromise = coreControls.start({
          height: `${segment.endPercent}%`,
          transition: {
            duration: segmentDuration,
            delay: cumulativeDelay,
            ease: "linear",
          },
        })
        
        // Animate the XP text separately
        const startTime = Date.now() + (cumulativeDelay * 1000)
        const endTime = startTime + (segmentDuration * 1000)
        
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
          
          const progress = (now - startTime) / (segmentDuration * 1000)
          const currentXpValue = startXpInLevel + (endXpInLevel - startXpInLevel) * progress
          setDisplayXpInLevel(Math.round(currentXpValue))
          requestAnimationFrame(animateXpText)
        }
        
        if (segmentDuration > 0) {
          animateXpText()
        }
        
        await animationPromise
        
        cumulativeDelay = 0 // Only first segment has initial delay
        
        // If we leveled up, reset bar to 0 for next level
        if (segment.willLevelUp && i < segments.length - 1) {
          coreControls.set({ height: "0%" })
          setDisplayXpInLevel(0)
        }
      }
    }
    
    runLevelUpSequence()
  }, [animatingLockIn, animationDelay, animationDuration, currentXP, coreXP, prefersReducedMotion, getLevelInfo, coreControls])
  
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
            background: theme.colors.coreColor,
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
