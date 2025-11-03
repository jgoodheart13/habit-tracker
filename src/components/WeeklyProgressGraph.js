import ProgressGraph from "./ProgressGraph"
import RingProgressGraph from "./RingProgressGraph"

export default function WeeklyProgressGraph({ habits, activeWeekRange }) {
  // --- Build list of all week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(activeWeekRange.start)
    d.setDate(d.getDate() + i)
    return d.toISOString().slice(0, 10)
  })

  // --- Split by type
  const P1_habits = habits.filter((h) => h.type === "P1")
  const P2_habits = habits.filter((h) => h.type === "P2")

  // --- Compute totals for P1
  let P1_total = 0
  let P1_done = 0
  P1_habits.forEach((habit) => {
    const timesPerWeek = habit.frequency.timesPerWeek || 0
    P1_total += timesPerWeek
    const completed = weekDays.filter((d) =>
      habit.completedDates.includes(d)
    ).length
    P1_done += Math.min(completed, timesPerWeek)
  })

  // --- Compute totals for P2
  let P2_done = 0
  P2_habits.forEach((habit) => {
    const completed = weekDays.filter((d) =>
      habit.completedDates.includes(d)
    ).length
    P2_done += completed
  })

  // --- Optional metadata
  const noveltyCount = P1_habits.filter((h) => h.isNovel).length
  const streakBonus = habits.some((h) => h.weeklyStreakComplete)

  // --- Core weekly point logic (same philosophy as Daily)
  const P1_ratio = P1_total === 0 ? 0 : P1_done / P1_total
  const P1_points = P1_ratio * 100

  const baseP2Point = 5
  const P2_scale = 0.5 + 0.5 * P1_ratio
  const P2_points = P2_done * baseP2Point * P2_scale

  const noveltyBoost = 1 + 0.05 * noveltyCount
  const streakBoost = streakBonus ? 1.05 : 1.0
  const totalBoost = Math.max(1.0, noveltyBoost * streakBoost)

  const totalPoints = (P1_points + P2_points) * totalBoost
  const overflowXP = Math.max(0, totalPoints - 100)

  // --- Render
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h2 style={{ fontWeight: 700, margin: 0 }}>Weekly Progress</h2>
      <RingProgressGraph P1Points={P1_points} P2Points={P2_points} size={200} />
      <ProgressGraph primaryPercentage={P1_points} />

      <div style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>
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
