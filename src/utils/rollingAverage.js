// rollingAverage.js
// Utility to calculate rolling percentage average for habits

export function calculateRollingAverage(completedDates, totalDays, windowSize = 7) {
  // completedDates: array of date strings (YYYY-MM-DD)
  // totalDays: array of date strings for the period
  // windowSize: number of days for rolling window
  const result = [];
  for (let i = 0; i < totalDays.length; i++) {
    const windowStart = Math.max(0, i - windowSize + 1);
    const windowDates = totalDays.slice(windowStart, i + 1);
    const completedInWindow = windowDates.filter(d => completedDates.includes(d)).length;
    const percent = (completedInWindow / windowDates.length) * 100;
    result.push({ date: totalDays[i], percent });
  }
  return result;
}
