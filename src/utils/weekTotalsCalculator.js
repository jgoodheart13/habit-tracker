import { BASE_POINTS } from "../constants/habitDefaults";

/**
 * Calculate week totals for lock-in modal
 * Reuses the same logic as WeeklyProgressGraph
 * 
 * @param {Array} habits - All habits for the week
 * @param {Array} weekDays - Array of dates ["YYYY-MM-DD", ...]
 * @returns {Object} { coreCompletions, reachCompletions, totalXP, coreXP, reachXP }
 */
export function calculateWeekTotals(habits, weekDays) {
  const P1_habits = habits.filter((h) => h.type === "P1");
  const P2_habits = habits.filter((h) => h.type === "P2");

  // Calculate P1 (Core) completions and totals
  let P1_total = 0;
  let P1_done = 0;

  P1_habits.forEach((habit) => {
    const timesPerWeek = habit.frequency?.timesPerWeek || 0;
    P1_total += timesPerWeek;

    const completed = weekDays.filter((d) =>
      habit.completedDates.includes(d)
    ).length;

    P1_done += Math.min(completed, timesPerWeek);
  });

  const weeklyP1Percent = P1_total === 0 ? 0 : (P1_done / P1_total) * 100;
  const P1_points = P1_done * BASE_POINTS;

  // Calculate P2 (Reach) completions
  let P2_done = 0;
  P2_habits.forEach((habit) => {
    const completed = weekDays.filter((d) =>
      habit.completedDates.includes(d)
    ).length;
    P2_done += completed;
  });

  // P1s done above frequency also count towards P2 XP
  const P1s_counted_as_p2 = P1_habits.reduce((count, h) => {
    const timesPerWeek = h.frequency?.timesPerWeek || 0;
    const completedThisWeek = weekDays.filter((d) =>
      h.completedDates.includes(d)
    ).length;
    return count + Math.max(0, completedThisWeek - timesPerWeek);
  }, 0);

  P2_done += P1s_counted_as_p2;

  const P2_scale = 0.5 + 0.5 * (weeklyP1Percent / 100);
  const P2_points = P2_done * BASE_POINTS * P2_scale;

  const totalXP = Math.round(P1_points + P2_points);

  return {
    coreCompletions: P1_done,
    coreTotal: P1_total,
    reachCompletions: P2_done,
    totalXP: totalXP,
    coreXP: Math.round(P1_points),
    reachXP: Math.round(P2_points),
  };
}
