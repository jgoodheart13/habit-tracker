import { useEffect } from "react";
import { useWeekGuard } from "../contexts/WeekGuardContext";

/**
 * Hook that passively checks week state on window focus and visibility change
 * Does NOT auto-open the modal, just sets needsLock flag
 * 
 * Usage: Call this hook in your root component (e.g., App or DailyViewPage)
 * to enable passive week state checks when user returns to the app
 * 
 * @param {boolean} isAuthenticated - Only enable checks when authenticated
 */
export function useWeekGuardOnFocus(isAuthenticated = true) {
  const { ensureWeekStateFresh } = useWeekGuard();

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleFocusOrVisibility = async () => {
      // Only check if window is focused and document is visible
      if (!document.hidden) {
        try {
          await ensureWeekStateFresh();
          // Note: if requiresLock is true, the context will set needsLock flag
          // but we don't auto-open the modal here - that happens on write attempts
        } catch (error) {
          console.error("Passive week check failed:", error);
        }
      }
    };

    // Check on window focus
    window.addEventListener("focus", handleFocusOrVisibility);
    
    // Check on visibility change (tab switching)
    document.addEventListener("visibilitychange", handleFocusOrVisibility);

    return () => {
      window.removeEventListener("focus", handleFocusOrVisibility);
      document.removeEventListener("visibilitychange", handleFocusOrVisibility);
    };
  }, [ensureWeekStateFresh, isAuthenticated]);
}
