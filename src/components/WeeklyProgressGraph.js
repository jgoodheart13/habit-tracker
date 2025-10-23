// WeeklyProgressGraph.js
import ProgressGraph from './ProgressGraph';

export default function WeeklyProgressGraph({ habits, activeWeekRange }) {
  const weeklyHabits = habits;
  // Get all days in current week (Monday-Sunday)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(activeWeekRange.start);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  }); // Calculate week days based on activeWeekRange

  // Calculate P1 and P2 segments
  let totalP1 = 0;
  let totalP2Possible = 0;
  let p1Completed = 0;
  let p2Completed = 0;
  weeklyHabits.forEach((habit) => {
    const n = habit.frequency.timesPerWeek;
    totalP1 += n;
    totalP2Possible += 7 - n;
    const completed = weekDays.filter((d) =>
      habit.completedDates.includes(d)
    ).length;
    p1Completed += Math.min(completed, n);
    p2Completed += Math.max(completed - n, 0);
  });
  // Calculate percentages
  const p1Percent = totalP1 === 0 ? 0 : (p1Completed / totalP1) * 100;
  const p2Below100Raw =
    totalP2Possible === 0 ? 0 : (p2Completed / totalP2Possible) * 100;
  let p1Bar = p1Percent;
  let p2Below100Bar = Math.max(0, Math.min(p2Below100Raw, 100 - p1Percent));
  let p2Above100Bar = Math.max(0, p1Percent + p2Below100Raw - 100);
  let totalPercent = p1Percent + p2Below100Raw;
  if (totalPercent >= 100) {
    p1Bar = 0;
    p2Below100Bar = 0;
    p2Above100Bar = totalPercent;
  }
  const weeklyData = {
    name: "Current Week",
    p1Bar: p1Percent, // Aggregate P1 progress for the week
    p2Below100Bar: Math.max(0, Math.min(p2Below100Raw, 100 - p1Percent)),
    p2Above100Bar: Math.max(0, p1Percent + p2Below100Raw - 100),
    total: p1Percent + p2Below100Raw,
  };

  const chartData = [weeklyData]; // Single bar for the entire week

  // Calculate dynamic axis domain
  const maxPercent = Math.min(
    Math.max(100, Math.ceil((p1Bar + p2Below100Bar + p2Above100Bar) / 10) * 10),
    200
  );

  return (
    <>
      <h2 style={{ fontWeight: 700, margin: 0 }}>Weekly Progress</h2>
      <ProgressGraph chartData={chartData} maxPercent={maxPercent} totalPercent={totalPercent} />
    </>
  );
}
