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
 * Reset the last locked week (admin/debug only)
 * POST /user/reset-xp
 * @returns {Promise<Object>} Updated user profile with reset lifetimeXP
 */
export async function resetXP() {
  try {
    const response = await api.post("user/reset-xp")
    return response.data
  } catch (error) {
    console.error("Error resetting XP:", error)
    throw error
  }
}

/**
 * Check week rollover status with admin_preview bypass (admin only)
 * GET /habits/week/state?admin_preview=true
 * @returns {Promise<Object>} { requiresLock: true, activeWeekStart, pendingWeekStart }
 */
export async function checkWeekRolloverAdminPreview() {
  try {
    const response = await api.get("habits/week/state", { params: { admin_preview: true } })
    return response.data
  } catch (error) {
    console.error("Error checking admin preview week state:", error)
    throw error
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
