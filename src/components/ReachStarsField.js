// ReachStarsField.js
import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import theme from "../styles/theme"

// Usage example:
// <ReachStarsField spawnKey={weeklyReachCount}>
//   <YourRings />
// </ReachStarsField>
//
// Every time spawnKey changes, a new star spawns.

export default function ReachStarsField({
  children,
  spawnKey,
  maxStars = 16,
  minFallMs = 1200,
  maxFallMs = 1800,
  padding = 10,
  style = {},
}) {
  const containerRef = React.useRef(null)
  const [bounds, setBounds] = React.useState({ width: 0, height: 0 })
  const [stars, setStars] = React.useState([])

  // Measure container using ResizeObserver so it works on mobile and responsive layouts.
  React.useEffect(() => {
    if (!containerRef.current) return

    const el = containerRef.current
    const ro = new ResizeObserver((entries) => {
      const cr = entries?.[0]?.contentRect
      if (!cr) return
      setBounds({ width: cr.width, height: cr.height })
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Spawn a star whenever spawnKey changes.
  React.useEffect(() => {
    if (!spawnKey) return
    if (bounds.width <= 0 || bounds.height <= 0) return

    const id =
      (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
      `${Date.now()}_${Math.random().toString(16).slice(2)}`

    const startX = rand(padding, Math.max(padding, bounds.width - padding))
    const endX = rand(padding, Math.max(padding, bounds.width - padding))
    const endY = rand(padding, Math.max(padding, bounds.height - padding))

    const durationMs = rand(minFallMs, maxFallMs)
    const rotate = rand(-18, 18)
    const driftX = rand(-10, 10)

    const next = {
      id,
      startX,
      endX: clamp(endX + driftX, padding, Math.max(padding, bounds.width - padding)),
      endY,
      durationMs,
      rotate,
      size: 30,
      opacity: rand(0.65, 0.95),
    }

    setStars((prev) => {
      const combined = [...prev, next]
      return combined.slice(Math.max(0, combined.length - maxStars))
    })
  }, [spawnKey, bounds.width, bounds.height, maxStars, minFallMs, maxFallMs, padding])

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Stars layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <AnimatePresence initial={false}>
          {stars.map((s, index) => (
            <ReachStar
              key={s.id}
              {...s}
              // older stars fade slightly so the field does not get visually heavy
              settledOpacity={clamp(s.opacity - index * 0.03, 0.35, 1)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Content layer (rings etc) */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  )
}

function ReachStar({
  startX,
  endX,
  endY,
  durationMs,
  rotate,
  size,
  opacity,
  settledOpacity,
}) {
  // soft accent color; tweak to taste
  const starColor = theme?.colors?.p2Above100 || "#FFD54F"

  return (
    <motion.div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: size,
        height: size,
        opacity: settledOpacity ?? opacity,
        filter: "drop-shadow(0px 0px 6px rgba(255, 213, 79, 0.25))",
      }}
      initial={{
        x: startX,
        y: -12,
        opacity: 0,
        rotate: rotate,
        scale: 0.85,
      }}
      animate={{
        x: endX,
        y: endY,
        opacity: settledOpacity ?? opacity,
        rotate: rotate + rand(-10, 10),
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      transition={{
        duration: durationMs / 1000,
        ease: "easeOut",
      }}
    >
      <StarSvg color={starColor} />
    </motion.div>
  )
}

function StarSvg({ color }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <path
        d="M12 2.6l2.8 6.1 6.6.6-5 4.3 1.5 6.4L12 16.9 6.1 20l1.5-6.4-5-4.3 6.6-.6L12 2.6z"
        fill={color}
      />
    </svg>
  )
}

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}
