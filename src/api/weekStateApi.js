import api from "../services/axios";

/**
 * Check week rollover status with backend
 * GET /habits/week/state
 * @returns {Promise<Object>} { requiresLock, activeWeekStart, pendingWeekStart? }
 */
export async function checkWeekRollover() {
  try {
    const response = await api.get("habits/week/state");
    return response.data;
  } catch (error) {
    console.error("Error checking week rollover:", error);
    throw error;
  }
}

/**
 * Lock the week (commit XP for the week)
 * POST /habits/week/lock
 * @param {Object} payload - { weekStart: "YYYY-MM-DD", xpEarned: number }
 * @returns {Promise<Object>} { lockedWeekStart, activeWeekStart, lifetimeXP, level, committed }
 */
export async function lockWeek(payload) {
  try {
    const response = await api.post("habits/week/lock", payload);
    return response.data;
  } catch (error) {
    console.error("Error locking week:", error);
    throw error;
  }
}
