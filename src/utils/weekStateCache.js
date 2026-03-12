/**
 * Week state localStorage cache utilities
 * Stores the active week start date to avoid unnecessary server checks
 */

const CACHE_KEY = "week_state_v1";

/**
 * Get cached week state from localStorage
 * @returns {Object|null} { activeWeekStart: "YYYY-MM-DD", updatedAt: number } or null
 */
export function getWeekStateCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch (err) {
    console.error("Error reading week state cache:", err);
    return null;
  }
}

/**
 * Save week state to localStorage
 * @param {Object} state - { activeWeekStart: "YYYY-MM-DD" or ISO timestamp }
 */
export function setWeekStateCache({ activeWeekStart }) {
  try {
    // Normalize to date-only format (strip time component if present)
    const normalizedDate = activeWeekStart?.slice(0, 10);
    
    const cacheData = {
      activeWeekStart: normalizedDate,
      updatedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (err) {
    console.error("Error saving week state cache:", err);
  }
}

/**
 * Clear week state cache from localStorage
 */
export function clearWeekStateCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (err) {
    console.error("Error clearing week state cache:", err);
  }
}
