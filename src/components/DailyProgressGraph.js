import { act } from "react"
import ProgressGraph from "./ProgressGraph"
import RingProgressGraph from "./RingProgressGraph"
import theme from "../styles/theme"

export default function DailyProgressGraph({ habits, activeDate, weekDays }) {
  /**
   * Computes total daily points based on:
   * - P1 baseline (0–100 pts)
   * - P2 scaling with P1 ratio (0.5–1.0x)
   * - Boosts (streak + novelty)
   */
  function computeDailyTotals({
    P1_done,
    P1_total,
    P2_done,
    baseP2Point = 5,
    noveltyCount = 0,
    streakBonus = false,
  }) {
    if (P1_total === 0) {
      return {
        P1_percent: 0,
        P1_points: 0,
        P2_points: 0,
        totalBoost: 1.0,
        totalPoints: 0,
        overflowXP: 0,
      }
    }

    // 1️⃣ P1 baseline (0–100)
    const P1_ratio = P1_done / P1_total
    const P1_points = P1_ratio * 100
    const P1_percent = Math.min(P1_points, 100)

    // 2️⃣ P2 scaling (0.5x → 1.0x)
    const P2_scale = 0.5 + 0.5 * P1_ratio
    const P2_points = P2_done * baseP2Point * P2_scale

    // 3️⃣ Boosts (novelty + streak)
    const noveltyBoost = 1 + 0.05 * noveltyCount // +5% per novel P1
    const streakBoost = streakBonus ? 1.05 : 1.0 // +5% if streak achieved
    const totalBoost = Math.max(1.0, noveltyBoost * streakBoost)

    // 4️⃣ Total score + overflow
    const totalPoints = (P1_points + P2_points) * totalBoost
    const overflowXP = Math.max(0, totalPoints - 100)

    return {
      P1_percent,
      P1_points,
      P2_points,
      totalBoost,
      totalPoints,
      overflowXP,
    }
  }

  // --- Split habits by type
  // p1s that are completed above frequency count as P2s
  // completed date for current day updated when we get here

  const P1_habits = habits.filter((h) => {
    if (h.type !== "P1") return false

    const weeklyCount = weekDays.filter((d) =>
      h.completedDates.includes(d)
    ).length

    // needs to take into account ones that reached threshold today
    return (
      weeklyCount < h.frequency.timesPerWeek ||
      (weeklyCount === h.frequency.timesPerWeek &&
        h.completedDates.includes(activeDate))
    )
  })

  const p1_done = P1_habits.filter((h) => h.completedDates.includes(activeDate))

  const p1_done_count = p1_done.length

  const P2_habits = habits.filter((h) => !P1_habits.includes(h))

  const P2_done = P2_habits.filter((h) => h.completedDates.includes(activeDate))

  const p2_done_count = P2_done.length

  // --- Core stats
  const p1_total_count = P1_habits.length

  // --- Optional metadata
  const noveltyCount = P1_habits.filter((h) => h.isNovel).length
  const streakBonus = habits.some((h) => h.weeklyStreakComplete)

  // --- Compute totals
  const { P1_percent, P2_points, totalBoost, totalPoints, overflowXP } =
    computeDailyTotals({
      P1_done: p1_done_count,
      P1_total: p1_total_count,
      P2_done: p2_done_count,
      baseP2Point: 5,
      noveltyCount,
      streakBonus,
    })

  // --- Render
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Left Column: Stats */}
      <div style={{ flex: 1, textAlign: "left", fontSize: 14 }}>
        <strong>P1s:</strong> {p1_done_count}/{p1_total_count} <br />
        <strong>P2s:</strong> +{P2_points.toFixed(1)} XP <br />
        <strong>Boost:</strong> ×{totalBoost.toFixed(2)} <br />
        <strong>Total:</strong> {totalPoints.toFixed(1)} pts <br />
        <strong>Overflow:</strong>{" "}
        {overflowXP > 0 ? `+${overflowXP.toFixed(1)}` : 0}
      </div>

      {/* Center Column: RingProgressGraph */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <RingProgressGraph
          P1Points={(p1_done_count / p1_total_count) * 100}
          P2Points={P2_points}
        />
      </div>

      {/* Right Column: Empty */}
      <div style={{ flex: 1 }}></div>
    </div>
  )
}
