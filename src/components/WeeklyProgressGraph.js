import ProgressGraph from "./ProgressGraph"
import RingProgressGraph from "./RingProgressGraph"


// NEW PROPS:
// - dailyP1Percent must be passed from parent
export default function WeeklyProgressGraph({ habits, activeWeekRange }) {
  // --- Build list of all week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(activeWeekRange.start)
    d.setDate(d.getDate() + i)
    return d.toISOString().slice(0, 10)
  })

  const activeDate = weekDays[0] // start-of-week date, or pass real activeDate from parent

  // --- Split by type
  const P1_habits = habits.filter((h) => h.type === "P1")
  const P2_habits = habits.filter((h) => h.type === "P2")

  // --- Compute Weekly P1 Totals
  let P1_total = 0
  let P1_done = 0

  P1_habits.forEach((habit) => {
    const timesPerWeek = habit.frequency?.timesPerWeek || 0
    P1_total += timesPerWeek

    const completed = weekDays.filter((d) =>
      habit.completedDates.includes(d)
    ).length

    P1_done += Math.min(completed, timesPerWeek)
  })

  // -------------------------
  // DAILY P1 PACE CALCULATION
  // -------------------------

  // 1) How many P1 completions were done before today?
  const P1_done_before_today = P1_habits.reduce((acc, habit) => {
    const timesPerWeek = habit.frequency?.timesPerWeek || 0

    const fromPastDays = weekDays
      .filter((d) => d < activeDate)
      .filter((d) => habit.completedDates.includes(d)).length

    return acc + Math.min(fromPastDays, timesPerWeek)
  }, 0)

  const P1_remaining = Math.max(0, P1_total - P1_done_before_today)

  // 2) Days remaining (including today)
  const todayIndex = weekDays.indexOf(activeDate)
  const daysRemaining = weekDays.length - todayIndex

  // 3) Ideal target for today
  const idealP1ForToday =
    daysRemaining > 0 ? Math.ceil(P1_remaining / daysRemaining) : P1_remaining

  // 4) How many P1s were actually done today?
  const P1_done_today = P1_habits.filter((h) =>
    h.completedDates.includes(activeDate)
  ).length

  const dailyP1Percent =
    idealP1ForToday === 0 ? 100 : (P1_done_today / idealP1ForToday) * 100

  // -------------------------
  // WEEKLY P1 % FOR OUTER RING
  // -------------------------

  const weeklyP1Percent =
    P1_total === 0 ? 0 : (P1_done / P1_total) * 100

  // -------------------------
  // XP Logic (unchanged)
  // -------------------------

  let P2_done = 0
  P2_habits.forEach((habit) => {
    const completed = weekDays.filter((d) =>
      habit.completedDates.includes(d)
    ).length
    P2_done += completed
  })

  const baseP2Point = 5
  const P2_scale = 0.5 + 0.5 * (weeklyP1Percent / 100)
  const P2_points = P2_done * baseP2Point * P2_scale

  const totalPoints = (weeklyP1Percent + P2_points)
  const overflowXP = Math.max(0, totalPoints - 100)

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
        <strong>P1s:</strong> {P1_done}/{P1_total} <br />
        <strong>P1 Today:</strong> {P1_done_today}/{idealP1ForToday} <br />
        <strong>P2s:</strong> +{P2_points.toFixed(1)} XP <br />
        <strong>Total:</strong> {totalPoints.toFixed(1)} pts <br />
      </div>

      {/* Center Column: Ring */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <RingProgressGraph
          dailyP1={dailyP1Percent}       // INNER RING
          weeklyP1={weeklyP1Percent}     // OUTER RING
        />
      </div>

      <div style={{ flex: 1 }}></div>
    </div>
  )
}