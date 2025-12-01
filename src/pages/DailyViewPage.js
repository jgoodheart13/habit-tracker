// DailyViewPage.js

import React, { useState, useEffect, useContext } from "react";
import theme from "../styles/theme";
import WeeklyProgressGraph from "../components/WeeklyProgressGraph"
import DailyProgressGraph from "../components/DailyProgressGraph"
import {
  getHabits,
  markHabitComplete,
  deleteHabit,
} from "../services/habitService"
import { useAuth0 } from "@auth0/auth0-react"
import LoadingScreen from "../components/LoadingScreen"
import WeeklyHabitsList from "../components/WeeklyHabitsList"
import { AuthContext } from "../components/AuthenticationWrapper"
import HabitModal from "../components/HabitModal"
import { addHabit, updateHabit } from "../services/habitService"
import DateChanger from "../components/DateChanger"
import ProgressTabs from "../components/ProgressTabs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons"

export default function DailyViewPage() {
  // Auth0 authentication status
  const { isAuthenticated } = useAuth0()
  const { tokenReady } = useContext(AuthContext)

  const [sortMode, setSortMode] = useState("priority") // 'priority', 'category', 'time', 'unspecified'
  const [habits, setHabits] = useState([])
  const [habitsLoading, setHabitsLoading] = useState(true)
  const [activeDate, setActiveDate] = useState(() =>
    new Date().toLocaleDateString("en-CA")
  )
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [activeTab, setActiveTab] = useState("daily") // State for active tab
  const [activeWeekRange, setActiveWeekRange] = useState(null)
  const [completedVisibility, setCompletedVisibility] = useState(
    localStorage.getItem("completedVisibility") === "true"
  )
  const [weekDays, setWeekDays] = useState([])

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

  function handleComplete(id, date, isChecked) {
    const prevHabits = habits

    // 1️⃣ Optimistic UI update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completedDates: isChecked
                ? [...(h.completedDates || []), date]
                : (h.completedDates || []).filter((d) => d !== date),
              pending: true, // optional flag for UI feedback
            }
          : h
      )
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
            setHabits((current) => {
              // don’t overwrite if the user changed something else since
              if (current.some((h) => h.pending)) {
                return current.map((h) => ({ ...h, pending: false }))
              }
              return updated
            })
          } catch (err) {
            console.error("Refresh failed:", err)
          }
        }
      })
      .catch(() => {
        // rollback only if still latest (avoid undoing newer actions)
        if (requestId === latestRequestRef.current) {
          setHabits(prevHabits)
          alert("Failed to update habit. Please try again.")
        }
      })
  }

  function handleDelete(id) {
    ;(async () => {
      await deleteHabit(id, activeDate)
      const updated = await getHabits(activeWeekRange.end)
      setHabits(updated)
    })()
  }

  function changeDate(offset) {
    const currentDate = new Date(activeDate)
    const newDate = new Date(currentDate)
    newDate.setUTCDate(currentDate.getUTCDate() + offset) // Use UTC methods to avoid timezone drift
    setActiveDate(newDate.toISOString().slice(0, 10))
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

  function handleAddHabit(newHabit) {
    // Close modal
    handleCloseHabitModal()
    newHabit.startDate = activeDate
    addHabit(newHabit).then(async () => {
      const updated = await getHabits(activeWeekRange.end)
      setHabits(updated)
    })
  }

  function handleUpdateHabit(updatedHabit) {
    // Close modal
    handleCloseHabitModal()
    // Update habit in backend and refresh list
    ;(async () => {
      // Assuming there's an updateHabit function in habitService
      await updateHabit(updatedHabit.id, updatedHabit)
      const updated = await getHabits(activeWeekRange.end)
      setHabits(updated)
    })()
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
        minHeight: "100vh", // Changed from `height` to `minHeight` to prevent internal scrollbars
        overflowX: "hidden", // Prevent horizontal scrolling
        overflowY: "hidden", // Prevent vertical scrolling
      }}
    >
      <div
        style={{
          flexGrow: 1,
          maxWidth: "100%", // Ensure content fits within the viewport
          margin: "0 auto",
          background: theme.colors.background,
        }}
      >
        <ProgressTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <DateChanger
          activeDate={activeDate}
          changeDate={changeDate}
          setActiveDate={setActiveDate}
          activeTab={activeTab}
        />

        {activeTab === "weekly" ? (
          <div
            style={{
              padding: `0px ${theme.defaultHorizontalPadding}`,
              paddingTop: 8,
            }}
          >
            <WeeklyProgressGraph
              habits={habits}
              activeWeekRange={activeWeekRange}
              showHeader={false}
            />
          </div>
        ) : (
          <div
            style={{
              padding: `0px ${theme.defaultHorizontalPadding}`,
              paddingTop: 8,
            }}
          >
            <DailyProgressGraph
              habits={habits}
              activeDate={activeDate}
              weekDays={weekDays}
            />
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 4,
              justifyContent: "space-between", // Push elements to opposite ends
            }}
          >
            {/* Sort */}
            {/* LEFT SIDE: Sort + Eye */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Sort */}
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: 15,
                }}
              >
                <option value="priority">Priority</option>
                <option value="category">Category</option>
                <option value="time">Time</option>
              </select>

              {/* Eye icon */}
              <button
                onClick={toggleCompletedVisibility}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
                title={
                  completedVisibility ? "Hide Completed" : "Show Completed"
                }
              >
                <FontAwesomeIcon
                  icon={completedVisibility ? faEye : faEyeSlash}
                  size="lg"
                  color="#555"
                />
              </button>
            </div>

            {/* Add button */}
            <button
              onClick={() => handleOpenHabitModal()}
              style={{
                padding: "6px 12px",
                marginRight: 8,
                borderRadius: 6,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.accent,
                color: theme.colors.text,
                cursor: "pointer",
                fontSize: 15,
              }}
            >
              Add Habit
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <WeeklyHabitsList
              habits={habits}
              sortMode={sortMode}
              handleComplete={handleComplete}
              handleDelete={handleDelete}
              activeDate={activeDate}
              onEdit={handleOpenHabitModal}
              showWeekDays={activeTab === "weekly"}
              completedVisibility={completedVisibility}
              weekDays={weekDays}
            />
          </div>
        </div>
      </div>
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
    </div>
  )
}
