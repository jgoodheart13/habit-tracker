import ProgressGraph from "./ProgressGraph"

export default function DailyProgressGraph({ habits, activeDate }) {
  function computeDailyScore(
    P1_done,
    P1_total,
    P2_done,
    baseP2Point = 5,
    referenceP1Goal = 4,
    k = 2
  ) {
    if (P1_total === 0) return { p1Percent: 0, p2Points: 0 }

    const P1_ratio = P1_done / P1_total
    const p1Percent = Math.min(P1_ratio * 100, 100)

    const taper = P1_ratio < 1 ? 1 - Math.pow(P1_ratio, k) : 1
    const perP2Point = baseP2Point * (P1_total / referenceP1Goal)
    const p2Points = Number((P2_done * perP2Point).toFixed(2))

    return { p1Percent, p2Points }
  }

  // Filter daily habits
  const baselineHabits = habits.filter((h) => h.type === "P1")
  const reachHabits = habits.filter((h) => h.type === "P2")

  const p1Total = baselineHabits.length
  const p1Completed = baselineHabits.filter((h) =>
    h.completedDates.includes(activeDate)
  ).length

  const p2Total = reachHabits.length
  const p2Completed = reachHabits.filter((h) =>
    h.completedDates.includes(activeDate)
  ).length

  const { p1Percent, p2Points } = computeDailyScore(
    p1Completed,
    p1Total,
    p2Completed,
    5,
    4,
    2
  )

  // Combined scaled reach
  const combinedScore = p1Percent + p2Points
  const totalPercent = Math.min(combinedScore, 100) // Ensure totalPercent is calculated correctly
  const overflowScore = combinedScore > 100 ? combinedScore - 100 : 0
  const secondaryPercentage =
    combinedScore < 100 ? p2Points : 100 - combinedScore

  return (
    <>
      <h2 style={{ fontWeight: 700, margin: 0 }}>Daily Progress</h2>
      <ProgressGraph
        primaryPercentage={[totalPercent]}
        secondaryPercentage={[secondaryPercentage]}
      />
    </>
  )
}
