import ProgressGraph from "./ProgressGraph"

export default function DailyProgressGraph({ habits, activeDate }) {
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
  const P1_habits = habits.filter((h) => h.type === "P1")
  const P2_habits = habits.filter((h) => h.type === "P2")

  // --- Core stats
  const P1_total = P1_habits.length
  const P1_done = P1_habits.filter((h) =>
    h.completedDates.includes(activeDate)
  ).length
  const P2_done = P2_habits.filter((h) =>
    h.completedDates.includes(activeDate)
  ).length

  // --- Optional metadata
  const noveltyCount = P1_habits.filter((h) => h.isNovel).length
  const streakBonus = habits.some((h) => h.weeklyStreakComplete)

  // --- Compute totals
  const { P1_percent, P2_points, totalBoost, totalPoints, overflowXP } =
    computeDailyTotals({
      P1_done,
      P1_total,
      P2_done,
      baseP2Point: 5,
      noveltyCount,
      streakBonus,
    })

  // --- Render
  return (
    <div>
      <h2 style={{ fontWeight: 700, margin: 0 }}>Daily Progress</h2>

      <ProgressGraph primaryPercentage={P1_percent} />

      <div style={{ marginTop: 12, fontSize: 14 }}>
        <strong>P1s:</strong> {P1_done}/{P1_total} &nbsp;|&nbsp;
        <strong>P2s:</strong> +{P2_points.toFixed(1)} XP &nbsp;|&nbsp;
        <strong>Boost:</strong> ×{totalBoost.toFixed(2)} &nbsp;|&nbsp;
        <strong>Total:</strong> {totalPoints.toFixed(1)} pts &nbsp;|&nbsp;
        <strong>Overflow:</strong>{" "}
        {overflowXP > 0 ? `+${overflowXP.toFixed(1)}` : 0}
      </div>
    </div>
  )
}
