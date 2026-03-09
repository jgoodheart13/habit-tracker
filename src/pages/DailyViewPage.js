// DailyViewPage.js

import React, { useState, useEffect, useContext } from "react";
import theme from "../styles/theme";
import WeeklyProgressGraph from "../components/WeeklyProgressGraph"
import LevelProgress from "../components/LevelProgress"
import {
  getHabits,
  markHabitComplete,
  deleteHabit,
} from "../services/habitService"
import { useSupabaseAuth } from "../contexts/SupabaseAuthContext"
import LoadingScreen from "../components/LoadingScreen"
import WeeklyHabitsList from "../components/WeeklyHabitsList"
import { AuthContext } from "../components/AuthenticationWrapper"
import HabitModal from "../components/HabitModal"
import { addHabit, updateHabit } from "../services/habitService"
import DateChanger from "../components/DateChanger"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faEyeSlash,
  faEye,
  faTimes,
  faBars,
  faPlus,
  faSort,
  faLock,
  faArrowRotateLeft,
} from "@fortawesome/free-solid-svg-icons"
import { resetXP } from "../api/weekStateApi"
import { clearWeekStateCache } from "../utils/weekStateCache"
import BottomSheet from "../components/BottomSheet"
import HabitActionsMenu from "../components/HabitActionsMenu"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { useWeekGuard } from "../contexts/WeekGuardContext"
import { useWeekGuardOnFocus } from "../hooks/useWeekGuardOnFocus"

export default function DailyViewPage() {
  // Supabase authentication status
  const { isAuthenticated } = useSupabaseAuth()
  const { tokenReady } = useContext(AuthContext)
  // Enriched user context
  const { user, refetchUser } =
    require("../contexts/UserContext").useUserContext()
  // Lock/reset state for WeeklyProgressGraph
  const [isLockedIn, setIsLockedIn] = useState(false)
  const [animatingLockIn, setAnimatingLockIn] = useState(false)

  // Week guard for rollover protection
  const {
    ensureWeekStateFresh,
    requestLockIn,
    pendingWeekStart,
    actualCurrentWeek,
    isReviewingPendingWeek,
    finishReview,
    lastLockedWeekStart,
    clearLastLockedWeek,
    lockCount,
  } = useWeekGuard()

  // Trigger XP bar animation whenever a lock completes (from any call site)
  useEffect(() => {
    if (lockCount > 0) {
      setIsLockedIn(true)
      setAnimatingLockIn(true)
    }
  }, [lockCount])

  // After the ring+XP animation fully completes (animatingLockIn true→false), refresh the
  // user profile so lifetimeXP settles at the correct post-lock value in the XP bar.
  const prevAnimatingRef = React.useRef(false)
  useEffect(() => {
    if (prevAnimatingRef.current && !animatingLockIn && lockCount > 0) {
      console.log("[DailyViewPage] Animation complete — refreshing user XP...")
      refetchUser()
    }
    prevAnimatingRef.current = animatingLockIn
  }, [animatingLockIn, lockCount, refetchUser])

  // Enable passive week checks on focus/visibility (only when authenticated)
  useWeekGuardOnFocus(isAuthenticated && tokenReady)

  // Check for week lock on mount
  useEffect(() => {
    async function checkWeekLockOnMount() {
      if (isAuthenticated && tokenReady && !isReviewingPendingWeek) {
        console.log("[DailyViewPage] Checking week lock on mount...")
        try {
          const { requiresLock, activeWeekStart } = await ensureWeekStateFresh()
          console.log("[DailyViewPage] Mount check result:", {
            requiresLock,
            activeWeekStart,
          })

          if (requiresLock && activeWeekStart) {
            // Set activeDate to the frozen week (old week that needs locking)
            const mondayOfFrozenWeek = activeWeekStart
            console.log(
              "[DailyViewPage] Setting activeDate to frozen week:",
              mondayOfFrozenWeek,
            )
            setActiveDate(mondayOfFrozenWeek)

            // Immediately show modal
            console.log("[DailyViewPage] Opening lock modal on mount...")
            try {
              // Need to fetch habits for the pending week first
              const pendingWeekRange = getWeekRange(mondayOfFrozenWeek)
              const pendingHabits = await getHabits(pendingWeekRange.end)
              const pendingWeekDays = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(pendingWeekRange.start)
                d.setDate(d.getDate() + i)
                return d.toISOString().slice(0, 10)
              })

              await requestLockIn(pendingHabits, pendingWeekDays)
              console.log(
                "[DailyViewPage] Lock confirmed! Updating to current week...",
              )

              // After lock, update to actual current week
              if (actualCurrentWeek) {
                setActiveDate(actualCurrentWeek)
                console.log(
                  "[DailyViewPage] Updated to current week:",
                  actualCurrentWeek,
                )
              }
            } catch (error) {
              console.log("[DailyViewPage] Lock cancelled or review started")
            }
          }
        } catch (error) {
          console.error("[DailyViewPage] Week lock check failed:", error)
        }
      }
    }

    checkWeekLockOnMount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, tokenReady, isReviewingPendingWeek]) // Re-run if review mode changes

  const [sortMode, setSortMode] = useState("priority") // 'priority', 'category', 'time', 'unspecified'
  const [habits, setHabits] = useState([])
  const [habitsLoading, setHabitsLoading] = useState(true)
  const [activeDate, setActiveDate] = useState(() =>
    new Date().toLocaleDateString("en-CA"),
  )
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [activeTab, setActiveTab] = useState("weekly") // State for active tab
  const [activeWeekRange, setActiveWeekRange] = useState(null)
  const [completedVisibility, setCompletedVisibility] = useState(
    localStorage.getItem("completedVisibility") !== "false",
  )
  const [weekDays, setWeekDays] = useState([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetContent, setSheetContent] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    show: false,
    habitId: null,
    habitName: "",
    isDeleting: false,
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [newlyAddedHabitId, setNewlyAddedHabitId] = useState(null)
  const [totalWeeklyXP, setTotalWeeklyXP] = useState(0)
  const [coreWeeklyXP, setCoreWeeklyXP] = useState(0)
  const [reachWeeklyXP, setReachWeeklyXP] = useState(0)

  function openSheet(habit) {
    setSheetContent(
      <HabitActionsMenu
        habit={habit}
        onClose={() => setSheetOpen(false)}
        onEdit={() => {
          handleOpenHabitModal(habit)
          setSheetOpen(false)
        }}
        onPause={() => {
          handlePauseHabit(habit)
          setSheetOpen(false)
        }}
        onResume={() => {
          handleResumeHabit(habit)
          setSheetOpen(false)
        }}
        onDelete={() => {
          setDeleteConfirmModal({
            show: true,
            habitId: habit.id,
            habitName: habit.name,
          })
          setSheetOpen(false)
        }}
      />,
    )
    setSheetOpen(true)
  }

  useEffect(() => {
    if (activeWeekRange) {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(activeWeekRange.start)
        d.setDate(d.getDate() + i)
        return d.toISOString().slice(0, 10)
      })
      setWeekDays(days)
    }
  }, [activeWeekRange]) // Update weekDays when activeWeekRange changes

  useEffect(() => {
    const newRange = getWeekRange(activeDate)

    // Only update if values are actually different
    setActiveWeekRange((prev) => {
      // If no previous range, or start/end changed → update
      if (!prev || prev.start !== newRange.start || prev.end !== newRange.end) {
        return newRange
      }

      // Otherwise return previous (React won't re-render)
      return prev
    })
  }, [activeDate])

  // Helper function to get week start (Monday)
  const getWeekStartForDate = React.useCallback((dateStr) => {
    const inputDate = new Date(dateStr)
    const dayOfWeek = inputDate.getUTCDay()
    const monday = new Date(inputDate)
    monday.setUTCDate(inputDate.getUTCDate() - ((dayOfWeek + 6) % 7))
    return monday.toISOString().slice(0, 10)
  }, [])

  // Determine if current week being viewed is editable
  const isCurrentWeekEditable = React.useMemo(() => {
    if (!activeWeekRange) return false

    const viewingWeekStart = activeWeekRange.start
    const currentWeekStart = getWeekStartForDate(
      new Date().toISOString().slice(0, 10),
    )

    if (isReviewingPendingWeek) {
      // During review: only the pending week is editable
      return viewingWeekStart === pendingWeekStart
    } else {
      // Normal mode: only current week is editable
      return viewingWeekStart === currentWeekStart
    }
  }, [
    activeWeekRange,
    isReviewingPendingWeek,
    pendingWeekStart,
    getWeekStartForDate,
  ])

  useEffect(() => {
    // Fetch habits when authenticated and token is ready
    async function fetchHabits() {
      try {
        const habitsFromApi = await getHabits(activeWeekRange.end)
        setHabits(habitsFromApi)
      } catch (err) {
        console.error("Error fetching habits:", err)
      } finally {
        setHabitsLoading(false)
      }
    }

    if (isAuthenticated && tokenReady && activeWeekRange?.end) {
      setHabitsLoading(true)
      fetchHabits()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, tokenReady, activeWeekRange])
  // Track the most recent completion request
  const latestRequestRef = React.useRef(0)

  async function handleComplete(id, date, isChecked) {
    // 🔒 Week guard check before write (only if authenticated)
    if (isAuthenticated && tokenReady) {
      // If already reviewing, only re-show modal if operating outside the pending week
      if (isReviewingPendingWeek) {
        if (getWeekStart(date) !== pendingWeekStart) {
          console.log(
            "[handleComplete] Operating outside pending week during review, finishing review...",
          )
          finishReview()
          return // User will need to re-attempt the operation after locking
        }
        // Operating on pending week during review — fall through and allow the write
      }

      console.log("[handleComplete] Checking week state before completion...")
      try {
        const { requiresLock } = await ensureWeekStateFresh()
        console.log("[handleComplete] Week check result:", { requiresLock })
        if (requiresLock) {
          console.log("[handleComplete] Opening lock modal...")
          await requestLockIn(habits, weekDays)
          console.log("[handleComplete] Lock confirmed, proceeding...")

          // After lock, update UI to current week
          if (actualCurrentWeek) {
            console.log(
              "[handleComplete] Updating to current week:",
              actualCurrentWeek,
            )
            setActiveDate(actualCurrentWeek)
          }
        }
      } catch (error) {
        console.error("Week guard check failed or user cancelled:", error)
        return // Abort operation
      }
    }

    const prevHabits = habits

    // 1️⃣ Optimistic UI update - immediately update the UI before API confirms
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              // Update completedDates immediately for instant UI feedback
              completedDates: isChecked
                ? [...(h.completedDates || []), date]
                : (h.completedDates || []).filter((d) => d !== date),
              // Track this change as "pending" in case API response comes back
              // with stale data (e.g., if user clicks multiple times rapidly)
              pendingUpdates: {
                ...(h.pendingUpdates || {}),
                [date]: isChecked,
              },
            }
          : h,
      ),
    )

    // 2️⃣ Increment request ID
    const requestId = ++latestRequestRef.current

    // 3️⃣ Send API call
    markHabitComplete(id, date, isChecked)
      .then(async () => {
        // only act if this is still the latest request
        if (requestId === latestRequestRef.current) {
          try {
            const updated = await getHabits(activeWeekRange.end)

            // Merge server data with any pending updates that haven't been confirmed yet
            // This prevents race conditions where rapid clicks get overwritten by slower API responses
            setHabits((current) => {
              return updated.map((serverHabit) => {
                // Find the corresponding local habit to check for pending updates
                const localHabit = current.find((h) => h.id === serverHabit.id)

                // If no pending updates, just use the server data as-is
                if (!localHabit?.pendingUpdates) {
                  return serverHabit
                }

                // Apply any pending updates on top of the server's completedDates
                // This ensures clicks that happened after this API call was sent are preserved
                let completedDates = [...serverHabit.completedDates]
                Object.entries(localHabit.pendingUpdates).forEach(
                  ([pendingDate, isChecked]) => {
                    if (isChecked && !completedDates.includes(pendingDate)) {
                      // Add the pending completion
                      completedDates.push(pendingDate)
                    } else if (!isChecked) {
                      // Remove the pending un-completion
                      completedDates = completedDates.filter(
                        (d) => d !== pendingDate,
                      )
                    }
                  },
                )

                return {
                  ...serverHabit,
                  completedDates,
                  pendingUpdates: localHabit.pendingUpdates,
                }
              })
            })

            // Clear the pending update for this specific habit/date now that it's confirmed
            // We use object destructuring to remove just this date from pendingUpdates
            setHabits((current) =>
              current.map((h) => {
                if (h.id === id && h.pendingUpdates?.[date] !== undefined) {
                  const { [date]: _, ...remainingUpdates } = h.pendingUpdates
                  return {
                    ...h,
                    pendingUpdates: remainingUpdates,
                  }
                }
                return h
              }),
            )
          } catch (err) {
            console.error("Refresh failed:", err)
          }
        }
      })
      .catch((error) => {
        // Handle 409 LOCK_REQUIRED from server first
        if (error.response?.status === 409) {
          console.log(
            "[handleComplete] Server requires lock (409), opening modal...",
          )
          ;(async () => {
            try {
              await requestLockIn(habits, weekDays)
              // Retry the operation after lock
              handleComplete(id, date, isChecked)
            } catch (lockError) {
              console.error("Lock-in failed or cancelled:", lockError)
              // Rollback optimistic update
              if (requestId === latestRequestRef.current) {
                setHabits(prevHabits)
              }
            }
          })()
        } else {
          // For all other errors, rollback only if still latest (avoid undoing newer actions)
          if (requestId === latestRequestRef.current) {
            setHabits(prevHabits)
            alert("Failed to update habit. Please try again.")
          }
        }
      })
  }

  function handleDelete(id, name) {
    setDeleteConfirmModal({
      show: true,
      habitId: id,
      habitName: name,
    })
  }

  function confirmDelete() {
    setDeleteConfirmModal((prev) => ({ ...prev, isDeleting: true }))
    ;(async () => {
      try {
        // 🔒 Week guard check before write (only if authenticated)
        if (isAuthenticated && tokenReady) {
          // If already reviewing, only re-show modal if operating outside the pending week
          if (isReviewingPendingWeek) {
            if (getWeekStart(activeDate) !== pendingWeekStart) {
              console.log(
                "[confirmDelete] Operating outside pending week during review, finishing review...",
              )
              finishReview()
              setDeleteConfirmModal((prev) => ({ ...prev, isDeleting: false }))
              return // User will need to re-attempt the operation after locking
            }
            // Operating on pending week during review — fall through and allow the write
          }

          const { requiresLock } = await ensureWeekStateFresh()
          if (requiresLock) {
            await requestLockIn(habits, weekDays)
          }
        }

        await deleteHabit(deleteConfirmModal.habitId, activeDate)
        const updated = await getHabits(activeWeekRange.end)
        setHabits(updated)
        setDeleteConfirmModal({
          show: false,
          habitId: null,
          habitName: "",
          isDeleting: false,
        })
      } catch (err) {
        console.error("Error deleting habit:", err)

        // Handle 409 LOCK_REQUIRED from server
        if (err.response?.status === 409) {
          try {
            await requestLockIn(habits, weekDays)
            // Retry the operation
            await deleteHabit(deleteConfirmModal.habitId, activeDate)
            const updated = await getHabits(activeWeekRange.end)
            setHabits(updated)
            setDeleteConfirmModal({
              show: false,
              habitId: null,
              habitName: "",
              isDeleting: false,
            })
          } catch (retryErr) {
            console.error("Retry delete failed:", retryErr)
            setDeleteConfirmModal((prev) => ({ ...prev, isDeleting: false }))
          }
        } else {
          setDeleteConfirmModal((prev) => ({ ...prev, isDeleting: false }))
        }
      }
    })()
  }

  function changeDate(offset) {
    const currentDate = new Date(activeDate)
    const newDate = new Date(currentDate)
    newDate.setUTCDate(currentDate.getUTCDate() + offset) // Use UTC methods to avoid timezone drift
    const newDateStr = newDate.toISOString().slice(0, 10)
    setActiveDate(newDateStr)

    // If reviewing, only trigger lock modal when navigating OUT of the pending week
    if (isReviewingPendingWeek) {
      const newDateWeekStart = getWeekStart(newDateStr)
      if (newDateWeekStart !== pendingWeekStart) {
        console.log(
          "[DailyViewPage] User navigated out of pending week during review, finishing review",
        )
        finishReview()
      }
    }
  }

  function handleSetActiveDate(dateStr) {
    setActiveDate(dateStr)

    // If reviewing, only trigger lock modal when navigating OUT of the pending week
    if (isReviewingPendingWeek) {
      const newDateWeekStart = getWeekStart(dateStr)
      if (newDateWeekStart !== pendingWeekStart) {
        console.log(
          "[DailyViewPage] User navigated out of pending week during review, finishing review",
        )
        finishReview()
      }
    }
  }

  function getWeekStart(dateStr) {
    const inputDate = new Date(dateStr)
    const dayOfWeek = inputDate.getUTCDay()
    const monday = new Date(inputDate)
    monday.setUTCDate(inputDate.getUTCDate() - ((dayOfWeek + 6) % 7))
    return monday.toISOString().slice(0, 10)
  }

  function getWeekRange(date) {
    const inputDate = new Date(date)
    const dayOfWeek = inputDate.getUTCDay() // Use UTC to avoid timezone drift
    const monday = new Date(inputDate)
    monday.setUTCDate(inputDate.getUTCDate() - ((dayOfWeek + 6) % 7)) // Adjust to Monday
    const sunday = new Date(monday)
    sunday.setUTCDate(monday.getUTCDate() + 6) // Add 6 days to get Sunday
    return {
      start: monday.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10),
    }
  }

  function handleOpenHabitModal(habit) {
    setEditingHabit(habit)
    setShowHabitModal(true)
  }

  function handleCloseHabitModal() {
    setEditingHabit(null)
    setShowHabitModal(false)
  }

  async function handleAddHabit(newHabit) {
    // Close modal
    handleCloseHabitModal()

    try {
      // 🔒 Week guard check before write (only if authenticated)
      if (isAuthenticated && tokenReady) {
        // If already reviewing, only re-show modal if operating outside the pending week
        if (isReviewingPendingWeek) {
          if (getWeekStart(activeDate) !== pendingWeekStart) {
            console.log(
              "[handleAddHabit] Operating outside pending week during review, finishing review...",
            )
            finishReview()
            return // User will need to re-attempt the operation after locking
          }
          // Operating on pending week during review — fall through and allow the write
        }

        const { requiresLock } = await ensureWeekStateFresh()
        if (requiresLock) {
          await requestLockIn(habits, weekDays)
        }
      }

      newHabit.startDate = activeDate
      const addedHabit = await addHabit(newHabit)
      console.log("Added habit:", addedHabit)
      const updated = await getHabits(activeWeekRange.end)
      setHabits(updated)
      // Track the newly added habit for scrolling
      if (addedHabit?.id) {
        console.log("Setting newlyAddedHabitId:", addedHabit.id)
        setNewlyAddedHabitId(addedHabit.id)
      }
    } catch (error) {
      console.error("Error adding habit:", error)

      // Handle 409 LOCK_REQUIRED from server
      if (error.response?.status === 409) {
        try {
          await requestLockIn(habits, weekDays)
          // Retry the operation
          newHabit.startDate = activeDate
          const addedHabit = await addHabit(newHabit)
          const updated = await getHabits(activeWeekRange.end)
          setHabits(updated)
          if (addedHabit?.id) {
            setNewlyAddedHabitId(addedHabit.id)
          }
        } catch (retryErr) {
          console.error("Retry add habit failed:", retryErr)
          alert("Failed to add habit. Please try again.")
        }
      } else {
        alert("Failed to add habit. Please try again.")
      }
    }
  }

  async function handleUpdateHabit(updatedHabit) {
    // Update habit in backend and refresh list
    try {
      // 🔒 Week guard check before write (only if authenticated)
      if (isAuthenticated && tokenReady) {
        // If already reviewing, only re-show modal if operating outside the pending week
        if (isReviewingPendingWeek) {
          if (getWeekStart(activeDate) !== pendingWeekStart) {
            console.log(
              "[handleUpdateHabit] Operating outside pending week during review, finishing review...",
            )
            finishReview()
            return // User will need to re-attempt the operation after locking
          }
          // Operating on pending week during review — fall through and allow the write
        }

        const { requiresLock } = await ensureWeekStateFresh()
        if (requiresLock) {
          await requestLockIn(habits, weekDays)
        }
      }

      await updateHabit(updatedHabit.id, updatedHabit)
      const updated = await getHabits(activeWeekRange.end)
      setHabits(updated)
    } catch (error) {
      console.error("Error updating habit:", error)

      // Handle 409 LOCK_REQUIRED from server
      if (error.response?.status === 409) {
        try {
          await requestLockIn(habits, weekDays)
          // Retry the operation
          await updateHabit(updatedHabit.id, updatedHabit)
          const updated = await getHabits(activeWeekRange.end)
          setHabits(updated)
        } catch (retryErr) {
          console.error("Retry update habit failed:", retryErr)
          alert("Failed to update habit. Please try again.")
        }
      } else {
        alert("Failed to update habit. Please try again.")
      }
    }
  }

  function handlePauseHabit(habit) {
    const pausedHabit = {
      ...habit,
      frequency: {
        ...habit.frequency,
        timesPerWeek: 0,
      },
    }
    handleUpdateHabit(pausedHabit)
  }

  function handleResumeHabit(habit) {
    // Resume with a default frequency of 7 (daily)
    const resumedHabit = {
      ...habit,
      frequency: {
        ...habit.frequency,
        timesPerWeek: 7,
      },
    }
    handleUpdateHabit(resumedHabit)
  }

  const toggleCompletedVisibility = () => {
    setCompletedVisibility((prev) => {
      const newValue = !prev
      localStorage.setItem("completedVisibility", newValue)
      return newValue
    })
  }

  if (habitsLoading || !isAuthenticated || !tokenReady) {
    return <LoadingScreen />
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh", // Changed from `height` to `minHeight` to prevent internal scrollbars
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flexGrow: 1,
          maxWidth: "100%", // Ensure content fits within the viewport
          margin: "0 auto",
          background: theme.colors.background,
          overflowY: "auto", // ✅ THIS enables scrolling
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Header />
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: theme.colors.background,
            // paddingBottom: 8,
          }}
        >
          {/* <ProgressTabs activeTab={activeTab} setActiveTab={setActiveTab} /> */}

          <DateChanger
            activeDate={activeDate}
            changeDate={changeDate}
            setActiveDate={handleSetActiveDate}
            activeTab={activeTab}
          />

          <div
            style={{
              paddingTop: 8,
            }}
          >
            <WeeklyProgressGraph
              habits={habits}
              activeWeekRange={activeWeekRange}
              showHeader={false}
              activeDate={activeDate}
              onXPUpdate={(xp) => {
                setTotalWeeklyXP(xp.total)
                setCoreWeeklyXP(xp.core)
                setReachWeeklyXP(xp.reach)
              }}
              isLockedIn={isLockedIn}
              animatingLockIn={animatingLockIn}
              setIsLockedIn={setIsLockedIn}
              setAnimatingLockIn={setAnimatingLockIn}
            />
          </div>

          {/* Lock-in button when reviewing pending week */}
          {isReviewingPendingWeek && (
            <div
              style={{
                padding: "12px 16px",
                background: theme.colors.accent + "15",
                borderBottom: `2px solid ${theme.colors.accent}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: theme.colors.text,
                  fontWeight: 600,
                }}
              >
                Reviewing Week for Lock-In
              </div>
              <button
                onClick={finishReview}
                style={{
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: "none",
                  background: theme.colors.accent,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Lock In Week
              </button>
            </div>
          )}

          {/* Search bar */}
          <div
            style={{
              padding: "0 16px",
              marginBottom: 4,
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "6px 12px",
                  paddingRight: searchQuery ? "32px" : "12px",
                  borderRadius: 6,
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: 15,
                  width: "100%",
                  outline: "none",
                  marginBottom: 8,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: 6,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    color: "#999",
                  }}
                  title="Clear search"
                >
                  <FontAwesomeIcon icon={faTimes} size="sm" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          {/* HABITS LIST */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              paddingBottom: 120,
            }}
          >
            <WeeklyHabitsList
              habits={habits}
              sortMode={sortMode}
              handleComplete={handleComplete}
              handleDelete={handleDelete}
              activeDate={activeDate}
              onEdit={handleOpenHabitModal}
              completedVisibility={completedVisibility}
              weekDays={weekDays}
              openSheet={openSheet}
              searchQuery={searchQuery}
              newlyAddedHabitId={newlyAddedHabitId}
              onScrollComplete={() => setNewlyAddedHabitId(null)}
              disabled={!isCurrentWeekEditable}
            />
          </div>
        </div>

        {/* Floating Utility Bar */}
        <div
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "8px 16px",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            zIndex: 100,
          }}
        >
          {/* LEFT: Menu Icon */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                border: `1px solid ${theme.colors.border}`,
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Menu"
            >
              <FontAwesomeIcon icon={faBars} size="lg" color="#555" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  bottom: 50,
                  left: 0,
                  background: "#fff",
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 6,
                  boxShadow: theme.colors.shadow,
                  minWidth: 180,
                  zIndex: 1001,
                }}
              >
                <button
                  onClick={() => {
                    toggleCompletedVisibility()
                    setMenuOpen(false)
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    border: "none",
                    background: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <FontAwesomeIcon
                    icon={completedVisibility ? faEye : faEyeSlash}
                    color="#555"
                  />
                  {completedVisibility ? "Hide Completed" : "Show Completed"}
                </button>
                {/* Admin-only: Lock In Week / Reset Lock toggle */}
                {user?.is_admin && (
                  <button
                    onClick={async () => {
                      setMenuOpen(false)
                      const activeWeekIsLocked =
                        activeWeekRange?.start === lastLockedWeekStart
                      if (activeWeekIsLocked) {
                        // Reset last lock on backend, bust the cache, then re-trigger modal
                        try {
                          console.log("[Admin] Resetting last lock...")
                          await resetXP()
                          await refetchUser()
                          clearWeekStateCache()
                          clearLastLockedWeek()
                          setIsLockedIn(false)
                          setAnimatingLockIn(false)
                          console.log("[Admin] Reset done — triggering week check...")
                          const result = await ensureWeekStateFresh()
                          if (result.requiresLock) {
                            await requestLockIn(habits, weekDays)
                          }
                        } catch (err) {
                          console.error("[Admin] Reset lock failed:", err)
                        }
                      } else {
                        // Bust the cache and let the server determine if a lock is needed
                        try {
                          console.log("[Admin] Forcing week state check...")
                          clearWeekStateCache()
                          const result = await ensureWeekStateFresh()
                          if (result.requiresLock) {
                            await requestLockIn(habits, weekDays)
                          } else {
                            console.log("[Admin] Server says no lock required for this week")
                          }
                        } catch (err) {
                          console.error("[Admin] Week check failed:", err)
                        }
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      border: "none",
                      background: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: 15,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      color:
                        activeWeekRange?.start === lastLockedWeekStart
                          ? "#e05c5c"
                          : theme.colors.coreColor,
                      fontWeight: 700,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        activeWeekRange?.start === lastLockedWeekStart
                          ? faArrowRotateLeft
                          : faLock
                      }
                      color={
                        activeWeekRange?.start === lastLockedWeekStart
                          ? "#e05c5c"
                          : theme.colors.coreColor
                      }
                    />
                    {activeWeekRange?.start === lastLockedWeekStart
                      ? "Reset Lock (Admin)"
                      : "Lock In Week"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* CENTER: Sort Dropdown */}
          <div style={{ position: "relative" }}>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              style={{
                padding: "6px 32px 6px 12px",
                borderRadius: 6,
                border: `1px solid ${theme.colors.border}`,
                fontSize: 15,
                fontWeight: 700,
                textAlign: "center",
                textAlignLast: "center",
                appearance: "none",
                background: "#fff",
                cursor: "pointer",
                minWidth: 120,
              }}
            >
              <option value="priority" style={{ textAlign: "center" }}>
                Priority
              </option>
              <option value="category" style={{ textAlign: "center" }}>
                Category
              </option>
              <option value="time" style={{ textAlign: "center" }}>
                Time
              </option>
            </select>
            <div
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <FontAwesomeIcon icon={faSort} size="sm" color="#555" />
            </div>
          </div>

          {/* RIGHT: Add Habit Button */}
          <button
            onClick={() => handleOpenHabitModal()}
            disabled={!isCurrentWeekEditable}
            style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              border: "none",
              background: isCurrentWeekEditable ? theme.colors.accent : "#ccc",
              color: "#fff",
              cursor: isCurrentWeekEditable ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: "bold",
              opacity: isCurrentWeekEditable ? 1 : 0.5,
            }}
            title={
              isCurrentWeekEditable
                ? "Add Habit"
                : "Cannot add habits to past/future weeks"
            }
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        <Footer />
      </div>
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)}>
        {sheetContent}
      </BottomSheet>
      {showHabitModal && (
        <HabitModal
          show={showHabitModal}
          onClose={handleCloseHabitModal}
          onAdd={handleAddHabit}
          onEdit={handleUpdateHabit}
          habit={editingHabit}
          isEditing={!!editingHabit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.show && (
        <>
          <style>
            {`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
          </style>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() =>
              setDeleteConfirmModal({
                show: false,
                habitId: null,
                habitName: "",
                isDeleting: false,
              })
            }
          >
            <div
              style={{
                background: theme.colors.background,
                borderRadius: 12,
                padding: 24,
                maxWidth: 400,
                width: "90%",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  color: theme.colors.text,
                }}
              >
                Delete Habit
              </h3>
              <p style={{ marginBottom: 20, color: theme.colors.text }}>
                Are you sure you want to delete "
                <strong>{deleteConfirmModal.habitName}</strong>"? This action
                cannot be undone.
              </p>
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
              >
                <button
                  onClick={() =>
                    setDeleteConfirmModal({
                      show: false,
                      habitId: null,
                      habitName: "",
                      isDeleting: false,
                    })
                  }
                  disabled={deleteConfirmModal.isDeleting}
                  style={{
                    background: theme.colors.incomplete,
                    color: theme.colors.text,
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: 6,
                    cursor: deleteConfirmModal.isDeleting
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: 600,
                    opacity: deleteConfirmModal.isDeleting ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteConfirmModal.isDeleting}
                  style={{
                    background: "#e74c3c",
                    color: "white",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: 6,
                    cursor: deleteConfirmModal.isDeleting
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: 600,
                    opacity: deleteConfirmModal.isDeleting ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {deleteConfirmModal.isDeleting ? (
                    <>
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          border: "2px solid white",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 0.6s linear infinite",
                        }}
                      />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
