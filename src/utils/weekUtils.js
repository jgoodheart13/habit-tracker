/**
 * Week boundary utilities shared across DailyViewPage, WeekGuardContext, and WeekDayRow.
 * All date strings are UTC ISO-8601 (YYYY-MM-DD). All arithmetic uses UTC methods.
 */

/**
 * Returns the YYYY-MM-DD start of the week containing dateStr.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {"monday"|"sunday"} weekStartDay
 * @returns {string} YYYY-MM-DD
 */
export function getWeekStart(dateStr, weekStartDay = "monday") {
  const inputDate = new Date(dateStr + "T00:00:00Z")
  const dayOfWeek = inputDate.getUTCDay() // 0=Sun … 6=Sat
  const daysBack = weekStartDay === "sunday" ? dayOfWeek : (dayOfWeek + 6) % 7
  const start = new Date(inputDate)
  start.setUTCDate(inputDate.getUTCDate() - daysBack)
  return start.toISOString().slice(0, 10)
}

/**
 * Returns { start, end } (both YYYY-MM-DD) for the week containing dateStr.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {"monday"|"sunday"} weekStartDay
 * @returns {{ start: string, end: string }}
 */
export function getWeekRange(dateStr, weekStartDay = "monday") {
  const start = getWeekStart(dateStr, weekStartDay)
  const startDate = new Date(start + "T00:00:00Z")
  const endDate = new Date(startDate)
  endDate.setUTCDate(startDate.getUTCDate() + 6)
  return { start, end: endDate.toISOString().slice(0, 10) }
}

/**
 * Returns the single-character day label (S/M/T/W/T/F/S) for a YYYY-MM-DD date string.
 * Used by WeekDayRow to render pill labels dynamically regardless of week start preference.
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string}
 */
export function weekDayLabel(dateStr) {
  return "SMTWTFS"[new Date(dateStr + "T00:00:00Z").getUTCDay()]
}
