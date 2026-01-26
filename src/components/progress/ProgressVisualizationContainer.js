import React from 'react';

/**
 * Container for swappable progress visualizations
 * 
 * This component standardizes the interface for all progress visualizations,
 * making it easy to swap between different views (rings, coin pusher, etc.)
 */
export default function ProgressVisualizationContainer({
  // Core data
  habits = [],
  activeDate,
  activeWeekRange,
  
  // Visualization selection
  visualizationType = 'ring', // 'ring', 'coinPusher', etc.
  
  // Callbacks
  onHabitComplete,
  onRewardGranted,
  
  // Container styling
  containerStyle = {},
}) {
  // Calculate shared metrics
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(activeWeekRange.start);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const P1_habits = habits.filter((h) => h.type === 'P1');
  const P2_habits = habits.filter((h) => h.type === 'P2');

  // Calculate P1 metrics
  let P1_total = 0;
  let P1_done = 0;
  P1_habits.forEach((habit) => {
    const timesPerWeek = habit.frequency?.timesPerWeek || 0;
    P1_total += timesPerWeek;
    const completed = weekDays.filter((d) => habit.completedDates.includes(d)).length;
    P1_done += Math.min(completed, timesPerWeek);
  });

  const P1_done_before_today = P1_habits.reduce((acc, habit) => {
    const timesPerWeek = habit.frequency?.timesPerWeek || 0;
    const fromPastDays = weekDays
      .filter((d) => d < activeDate)
      .filter((d) => habit.completedDates.includes(d)).length;
    return acc + Math.min(fromPastDays, timesPerWeek);
  }, 0);

  const P1_remaining = Math.max(0, P1_total - P1_done_before_today);
  const todayIndex = weekDays.indexOf(activeDate);
  const daysRemaining = weekDays.length - todayIndex;
  const idealP1ForToday = daysRemaining > 0 ? Math.ceil(P1_remaining / daysRemaining) : P1_remaining;
  const idealP1ByToday = Math.ceil((P1_total / 7) * (todayIndex + 1));
  const idealP1PercentByToday = P1_total === 0 ? 100 : (idealP1ByToday / P1_total) * 100;

  const P1_done_today = P1_habits.filter((h) => {
    const timesPerWeek = h.frequency?.timesPerWeek || 0;
    const completedThisWeek = weekDays.filter((d) => h.completedDates.includes(d)).length;
    return h.completedDates.includes(activeDate) && completedThisWeek <= timesPerWeek;
  }).length;

  const dailyP1Percent = idealP1ForToday === 0 ? 100 : (P1_done_today / idealP1ForToday) * 100;
  const weeklyP1Percent = P1_total === 0 ? 0 : (P1_done / P1_total) * 100;

  // Calculate P2 metrics
  let P2_done = 0;
  P2_habits.forEach((habit) => {
    const completed = weekDays.filter((d) => habit.completedDates.includes(d)).length;
    P2_done += completed;
  });

  const P1s_counted_as_p2 = P1_habits.filter((h) => {
    const timesPerWeek = h.frequency?.timesPerWeek || 0;
    const completedThisWeek = weekDays.filter((d) => h.completedDates.includes(d)).length;
    return h.completedDates.includes(activeDate) && completedThisWeek > timesPerWeek;
  }).length;

  P2_done += P1s_counted_as_p2;

  const basePoints = 5;
  const P2_scale = 0.5 + 0.5 * (weeklyP1Percent / 100);
  const P2_points = P2_done * basePoints * P2_scale;
  const P1_points = weeklyP1Percent * basePoints;
  const totalPoints = P1_points + P2_points;

  // Common props for all visualizations
  const commonProps = {
    // Metrics
    dailyP1Percent,
    weeklyP1Percent,
    P1_done,
    P1_total,
    P1_done_today,
    idealP1ForToday,
    P2_done,
    P2_scale,
    P1_points,
    P2_points,
    totalPoints,
    weeklyPaceMarker: idealP1PercentByToday,
    
    // Data
    habits,
    P1_habits,
    P2_habits,
    activeDate,
    weekDays,
    
    // Callbacks
    onHabitComplete,
    onRewardGranted,
  };

  // Dynamically load the appropriate visualization
  const VisualizationComponent = require(`./${visualizationType}Visualization`).default;

  return (
    <div style={{ width: '100%', ...containerStyle }}>
      <VisualizationComponent {...commonProps} />
    </div>
  );
}
