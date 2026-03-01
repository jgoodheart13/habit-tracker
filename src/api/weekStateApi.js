import api from "../services/axios";

/**
 * Check week rollover status with the backend
 * GET /week/state
 * @returns {Promise<Object>} { requiresLock, activeWeekStart, pendingWeekStart?, totals? }
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
 * Lock the week (commit to the new week)
 * POST /week/lock
 * @param {Object} payload - { weekStart, totals }
 * @returns {Promise<Object>} { activeWeekStart, message? }
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
