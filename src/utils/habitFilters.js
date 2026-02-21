/**
 * Shared habit filtering and categorization logic
 * Used by both WeeklyHabitsList and HelpPage
 */

/**
 * Determines if a habit is time-sensitive (must be done today to stay on track)
 * @param {Object} habit - The habit object
 * @param {string} activeDate - The current date (ISO string)
 * @param {string[]} weekDays - Array of all dates in the current week
 * @returns {boolean} - True if the habit is urgent
 */
export function isHabitUrgent(habit, activeDate, weekDays) {
  // Reach goals are never urgent
  if (habit.type === "P2") return false

  // Already completed today - not urgent
  if (habit.completedDates.includes(activeDate)) return false

  // Only count completions up to and including activeDate (not future dates)
  const completedThisWeek = weekDays.filter(
    (d) => d <= activeDate && habit.completedDates.includes(d),
  ).length
  const completionsRemaining = habit.frequency.timesPerWeek - completedThisWeek

  // Calculate days remaining in week (from activeDate to end of week)
  const daysRemainingInWeek = weekDays.filter((d) => d >= activeDate).length

  const isUrgent = completionsRemaining >= daysRemainingInWeek

  // Urgent if completions remaining >= days remaining
  return isUrgent
}

/**
 * Filters habits to get only time-sensitive ones
 * @param {Object[]} habits - Array of habit objects
 * @param {string} activeDate - The current date (ISO string)
 * @param {string[]} weekDays - Array of all dates in the current week
 * @returns {Object[]} - Array of urgent habits
 */
export function getUrgentHabits(habits, activeDate, weekDays) {
  return habits.filter((habit) => isHabitUrgent(habit, activeDate, weekDays))
}

/**
 * Sorts urgent habits by remaining completions (most urgent first)
 * @param {Object[]} habits - Array of urgent habit objects
 * @param {string} activeDate - The current date (ISO string)
 * @param {string[]} weekDays - Array of all dates in the current week
 * @returns {Object[]} - Sorted array of habits
 */
export function sortUrgentHabits(habits, activeDate, weekDays) {
  return habits.sort((a, b) => {
    // Only count completions up to and including activeDate
    const completedA = weekDays.filter(
      (d) => d <= activeDate && a.completedDates.includes(d),
    ).length
    const completedB = weekDays.filter(
      (d) => d <= activeDate && b.completedDates.includes(d),
    ).length
    const remainingA = a.frequency.timesPerWeek - completedA
    const remainingB = b.frequency.timesPerWeek - completedB
    return remainingB - remainingA
  })
}

/**
 * Filters and categorizes habits by type
 * @param {Object[]} habits - Array of habit objects
 * @returns {Object} - Object with coreHabits and reachHabits arrays
 */
export function categorizeHabits(habits) {
  return {
    coreHabits: habits.filter((h) => h.type === "P1"),
    reachHabits: habits.filter((h) => h.type === "P2"),
  }
}
