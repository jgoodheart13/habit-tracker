import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react"
import { getWeekStateCache, setWeekStateCache } from "../utils/weekStateCache"
import { checkWeekRollover, checkWeekRolloverAdminPreview, lockWeek } from "../api/weekStateApi"
import { useUserContext } from "./UserContext"

/**
 * Calculate the Monday (start of week) for a given date
 * Reuses the logic from DailyViewPage
 * @param {string} date - ISO date string "YYYY-MM-DD"
 * @returns {string} Monday ISO date "YYYY-MM-DD"
 */
function getWeekStart(date) {
  const inputDate = new Date(date)
  const dayOfWeek = inputDate.getUTCDay()
  const monday = new Date(inputDate)
  monday.setUTCDate(inputDate.getUTCDate() - ((dayOfWeek + 6) % 7))
  return monday.toISOString().slice(0, 10)
}

const WeekGuardContext = createContext(null)

export function WeekGuardProvider({ children }) {
  const { user } = useUserContext()
  const [needsLock, setNeedsLock] = useState(false)
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [serverPendingInfo, setServerPendingInfo] = useState(null)
  const [pendingWeekStart, setPendingWeekStart] = useState(null) // Week that needs locking
  const [actualCurrentWeek, setActualCurrentWeek] = useState(null) // Real current week
  const [isReviewingPendingWeek, setIsReviewingPendingWeek] = useState(false) // User is reviewing week before lock
  const [lastLockedWeekStart, setLastLockedWeekStart] = useState(null) // Most recently locked week
  const [lockCount, setLockCount] = useState(0) // Increments on every successful lock; watchers use this to trigger animations

  // Seed from user profile on load (persists across page reloads)
  useEffect(() => {
    if (user?.lastLockedWeek) {
      setLastLockedWeekStart(user.lastLockedWeek)
    }
  }, [user?.lastLockedWeek])

  // Promise resolution for requestLockIn()
  const pendingResolveRef = useRef(null)
  const pendingRejectRef = useRef(null)

  /**
   * Ensure week state is fresh - short-circuit if cache matches current week
   * @returns {Promise<Object>} { requiresLock, activeWeekStart, pendingWeekStart?, totals? }
   */
  const ensureWeekStateFresh = useCallback(async (adminPreview = false) => {
    const currentWeekStart = getWeekStart(new Date().toISOString().slice(0, 10))
    const cache = getWeekStateCache()

    // Normalize cached value to date-only (remove time component if present)
    const cachedWeekStart = cache?.activeWeekStart?.slice(0, 10)

    // Short-circuit: cache matches current week, no server call needed
    if (!adminPreview && cachedWeekStart === currentWeekStart) {
      return {
        requiresLock: false,
        activeWeekStart: cachedWeekStart,
      }
    }

    try {
      const result = await (adminPreview ? checkWeekRolloverAdminPreview() : checkWeekRollover())

      // Update cache with server's activeWeekStart
      if (result.activeWeekStart) {
        setWeekStateCache({ activeWeekStart: result.activeWeekStart })
      }

      // Set internal flag if lock is required
      if (result.requiresLock) {
        setNeedsLock(true)
        setPendingWeekStart(result.pendingWeekStart || result.activeWeekStart)
        setActualCurrentWeek(result.activeWeekStart) // Current week for after lock
        setServerPendingInfo({
          pendingWeekStart: result.pendingWeekStart || result.activeWeekStart,
        })
      } else {
        setPendingWeekStart(null)
        setActualCurrentWeek(null)
      }

      return result
    } catch (error) {
      console.error("Week state check failed:", error)
      // Fail gracefully - don't hard-block, server will enforce with 409
      return { requiresLock: false }
    }
  }, [])

  /**
   * Request lock-in (opens modal and returns promise that resolves when lock completes)
   * @param {Array} habits - All habits for the pending week
   * @param {Array} weekDays - Array of dates for the pending week
   * @returns {Promise<void>}
   */
  const requestLockIn = useCallback(
    (habits, weekDays) => {
      return new Promise((resolve, reject) => {
        pendingResolveRef.current = resolve
        pendingRejectRef.current = reject

        // Store habits and weekDays for lockIn to use
        setServerPendingInfo({
          pendingWeekStart: pendingWeekStart,
          habits,
          weekDays,
        })

        setIsLockModalOpen(true)
      })
    },
    [pendingWeekStart],
  )

  /**
   * Lock in the week (called when user confirms in modal)
   * Calculates totals from stored habits/weekDays and sends xpEarned to backend
   */
  const lockIn = useCallback(async () => {
    try {
      // Import calculator dynamically to avoid circular deps
      const { calculateWeekTotals } =
        await import("../utils/weekTotalsCalculator")

      const habits = serverPendingInfo?.habits || []
      const weekDays = serverPendingInfo?.weekDays || []

      // Calculate totals on frontend
      const totals = calculateWeekTotals(habits, weekDays)

      const payload = {
        weekStart: pendingWeekStart,
        xpEarned: totals.totalXP,
      }

      const result = await lockWeek(payload)

      // Update cache with new activeWeekStart from response
      if (result.activeWeekStart) {
        setWeekStateCache({ activeWeekStart: result.activeWeekStart })
      }

      // Track which week was just locked
      if (result.lockedWeekStart) {
        setLastLockedWeekStart(result.lockedWeekStart)
      }

      // Clear lock state and trigger animation. DailyViewPage calls refetchUser after the
      // animation completes — do NOT call it here, as it can race with the animation setup
      // and cause VerticalXPBar to start from the wrong (post-lock) lifetimeXP baseline.
      setNeedsLock(false)
      setServerPendingInfo(null)
      setPendingWeekStart(null)
      setActualCurrentWeek(null)
      setIsLockModalOpen(false)
      setLockCount((c) => c + 1)

      // Resolve pending promise
      if (pendingResolveRef.current) {
        pendingResolveRef.current()
        pendingResolveRef.current = null
        pendingRejectRef.current = null
      }
    } catch (error) {
      console.error("Week lock failed:", error)

      // Reject pending promise
      if (pendingRejectRef.current) {
        pendingRejectRef.current(error)
        pendingResolveRef.current = null
        pendingRejectRef.current = null
      }

      throw error
    }
  }, [pendingWeekStart, serverPendingInfo])

  /**
   * Start review mode - closes modal without rejecting, allows user to review week
   */
  const startReview = useCallback(() => {
    setIsLockModalOpen(false)
    setIsReviewingPendingWeek(true)
    // Don't reject promise - keep it pending until user decides to lock or navigates away
  }, [])

  /**
   * Cancel lock-in completely (closes modal and rejects promise)
   */
  const cancelLock = useCallback(() => {
    setIsLockModalOpen(false)
    setIsReviewingPendingWeek(false)

    // Reject pending promise
    if (pendingRejectRef.current) {
      pendingRejectRef.current(new Error("Lock cancelled by user"))
      pendingResolveRef.current = null
      pendingRejectRef.current = null
    }
  }, [])

  /**
   * Complete review and show lock modal again
   */
  const finishReview = useCallback(() => {
    setIsReviewingPendingWeek(false)
    setIsLockModalOpen(true)
  }, [])

  const value = {
    ensureWeekStateFresh,
    requestLockIn,
    lockIn,
    cancelLock,
    startReview,
    finishReview,
    needsLock,
    isLockModalOpen,
    serverPendingInfo,
    pendingWeekStart,
    actualCurrentWeek,
    isReviewingPendingWeek,
    lastLockedWeekStart,
    clearLastLockedWeek: () => setLastLockedWeekStart(null),
    lockCount,
  }

  return (
    <WeekGuardContext.Provider value={value}>
      {children}
    </WeekGuardContext.Provider>
  )
}

/**
 * Hook to access week guard functionality
 */
export function useWeekGuard() {
  const context = useContext(WeekGuardContext)
  if (!context) {
    throw new Error("useWeekGuard must be used within WeekGuardProvider")
  }
  return context
}
