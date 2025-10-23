import ProgressGraph from './ProgressGraph';

export default function DailyProgressGraph({ habits, activeDate }) {
  // Filter daily habits
  const baselineHabits = habits.filter((h) => h.type === "P1");
  const reachHabits = habits.filter((h) => h.type === "P2");

  // Calculate completion %
  const p1Total = baselineHabits.length;
  const p1Completed = baselineHabits.filter((h) =>
    h.completedDates.includes(activeDate)
  ).length;
  const p1Percent = p1Total === 0 ? 0 : (p1Completed / p1Total) * 100;

  const p2Total = reachHabits.length;
  const p2Completed = reachHabits.filter((h) =>
    h.completedDates.includes(activeDate)
  ).length;
  const p2Percent =
    p2Total === 0 ? 0 : (p2Completed / Math.max(p1Total, p2Total)) * p1Percent;

  const p2Below100Raw = p2Total === 0 ? 0 : (p2Completed / p2Total) * Math.max(p1Percent, 5);

  // Combined scaled reach
  const totalPercent = p1Percent + p2Percent; // Ensure totalPercent is calculated correctly

  // Define maxPercent for the Y-axis domain
  let maxPercent = totalPercent > 100 ? Math.ceil(totalPercent / 10) * 10 : 100; // Dynamically adjust maxPercent
  maxPercent = Math.min(maxPercent, 200); // Ensure theoretical maximum of 200%

  const dailyData = {
    name: "Today",
    p1Bar: p1Percent, // Aggregate P1 progress for the day
    p2Below100Bar: Math.max(0, Math.min(p2Below100Raw, 100 - p1Percent)),
    p2Above100Bar: Math.max(0, p1Percent + p2Below100Raw - 100),
    total: p1Percent + p2Below100Raw,
  };

  const chartData = [dailyData];

  return (
    <>
      <h2 style={{ fontWeight: 700, margin: 0 }}>Daily Progress</h2>
      <ProgressGraph chartData={chartData} maxPercent={maxPercent} totalPercent={totalPercent} />
    </>
  );
}
