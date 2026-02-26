import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { getWeekStateCache, setWeekStateCache } from "../utils/weekStateCache";
import { checkWeekRollover, lockWeek } from "../api/weekStateApi";

/**
 * Calculate the Monday (start of week) for a given date
 * Reuses the logic from DailyViewPage
 * @param {string} date - ISO date string "YYYY-MM-DD"
 * @returns {string} Monday ISO date "YYYY-MM-DD"
 */
function getWeekStart(date) {
  const inputDate = new Date(date);
  const dayOfWeek = inputDate.getUTCDay();
  const monday = new Date(inputDate);
  monday.setUTCDate(inputDate.getUTCDate() - ((dayOfWeek + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

const WeekGuardContext = createContext(null);

export function WeekGuardProvider({ children }) {
  const [needsLock, setNeedsLock] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [serverPendingInfo, setServerPendingInfo] = useState(null);
  
  // Promise resolution for requestLockIn()
  const pendingResolveRef = useRef(null);
  const pendingRejectRef = useRef(null);

  /**
   * Ensure week state is fresh - short-circuit if cache matches current week
   * @returns {Promise<Object>} { requiresLock, activeWeekStart, pendingWeekStart?, totals? }
   */
  const ensureWeekStateFresh = useCallback(async () => {
    const currentWeekStart = getWeekStart(new Date().toISOString().slice(0, 10));
    const cache = getWeekStateCache();

    // Normalize cached value to date-only (remove time component if present)
    const cachedWeekStart = cache?.activeWeekStart?.slice(0, 10);

    // Short-circuit: cache matches current week, no server call needed
    if (cachedWeekStart === currentWeekStart) {
      console.log("[WeekGuard] ✓ Week state fresh (cached):", currentWeekStart);
      return {
        requiresLock: false,
        activeWeekStart: cachedWeekStart,
      };
    }

    // Cache miss or week changed - call backend
    console.log("[WeekGuard] 🔍 Cache miss, checking server. Current:", currentWeekStart, "Cached:", cachedWeekStart);
    try {
      const result = await checkWeekRollover();
      console.log("[WeekGuard] Server response:", result);
      
      // Update cache with server's activeWeekStart
      if (result.activeWeekStart) {
        setWeekStateCache({ activeWeekStart: result.activeWeekStart });
      }

      // Set internal flag if lock is required
      if (result.requiresLock) {
        console.log("[WeekGuard] 🔒 Lock required!");
        setNeedsLock(true);
        setServerPendingInfo({
          pendingWeekStart: result.pendingWeekStart,
          totals: result.totals,
        });
      }

      return result;
    } catch (error) {
      console.error("Week state check failed:", error);
      // Fail gracefully - don't hard-block, server will enforce with 409
      return { requiresLock: false };
    }
  }, []);

  /**
   * Request lock-in (opens modal and returns promise that resolves when lock completes)
   * @returns {Promise<void>}
   */
  const requestLockIn = useCallback(() => {
    return new Promise((resolve, reject) => {
      pendingResolveRef.current = resolve;
      pendingRejectRef.current = reject;
      setIsLockModalOpen(true);
    });
  }, []);

  /**
   * Lock in the week (called when user confirms in modal)
   */
  const lockIn = useCallback(async () => {
    try {
      const result = await lockWeek();
      
      // Update cache with new activeWeekStart
      if (result.activeWeekStart) {
        setWeekStateCache({ activeWeekStart: result.activeWeekStart });
      }

      // Clear lock state
      setNeedsLock(false);
      setServerPendingInfo(null);
      setIsLockModalOpen(false);

      // Resolve pending promise
      if (pendingResolveRef.current) {
        pendingResolveRef.current();
        pendingResolveRef.current = null;
        pendingRejectRef.current = null;
      }
    } catch (error) {
      console.error("Week lock failed:", error);
      
      // Reject pending promise
      if (pendingRejectRef.current) {
        pendingRejectRef.current(error);
        pendingResolveRef.current = null;
        pendingRejectRef.current = null;
      }
      
      throw error;
    }
  }, []);

  /**
   * Cancel lock-in (closes modal and rejects promise)
   */
  const cancelLock = useCallback(() => {
    setIsLockModalOpen(false);
    
    // Reject pending promise
    if (pendingRejectRef.current) {
      pendingRejectRef.current(new Error("Lock cancelled by user"));
      pendingResolveRef.current = null;
      pendingRejectRef.current = null;
    }
  }, []);

  const value = {
    ensureWeekStateFresh,
    requestLockIn,
    lockIn,
    cancelLock,
    needsLock,
    isLockModalOpen,
    serverPendingInfo,
  };

  return (
    <WeekGuardContext.Provider value={value}>
      {children}
    </WeekGuardContext.Provider>
  );
}

/**
 * Hook to access week guard functionality
 */
export function useWeekGuard() {
  const context = useContext(WeekGuardContext);
  if (!context) {
    throw new Error("useWeekGuard must be used within WeekGuardProvider");
  }
  return context;
}
