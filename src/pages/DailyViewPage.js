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
import { addHabit, updateHabit } from "../services/habitsApi"
import DateChanger from "../components/DateChanger"

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

  useEffect(() => {
    // Fetch habits when authenticated and token is ready
    async function fetchHabits() {
      try {
        const habitsFromApi = await getHabits()
        setHabits(habitsFromApi)
      } catch (err) {
        console.error("Error fetching habits:", err)
      } finally {
        setHabitsLoading(false)
      }
    }

    if (isAuthenticated && tokenReady) {
      setHabitsLoading(true)
      fetchHabits()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, tokenReady])
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
            const updated = await getHabits()
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
      await deleteHabit(id)
      const updated = await getHabits()
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
    addHabit(newHabit).then(async () => {
      const updated = await getHabits()
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
      const updated = await getHabits()
      setHabits(updated)
    })()
  }

  const activeWeekRange = getWeekRange(activeDate) // Calculate the active week range

  if (habitsLoading || !isAuthenticated || !tokenReady) {
    return <LoadingScreen />
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh", // Changed from `height` to `minHeight` to prevent internal scrollbars
        overflowX: "hidden", // Prevent horizontal scrolling
      }}
    >
      <div
        style={{
          flexGrow: 1,
          padding: "16px",
          maxWidth: "100%", // Ensure content fits within the viewport
          margin: "0 auto",
          background: theme.colors.background,
        }}
      >
        <div>
          <WeeklyProgressGraph
            habits={habits}
            activeWeekRange={activeWeekRange}
            showHeader={false}
          />
        </div>
        <div>
          <DailyProgressGraph habits={habits} activeDate={activeDate} />
        </div>
        <DateChanger
          activeDate={activeDate}
          changeDate={changeDate}
          setActiveDate={setActiveDate}
        />
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <label style={{ marginLeft: 24, marginRight: 8, fontWeight: 500 }}>
              Sort by:
            </label>

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
            <button
              onClick={() => handleOpenHabitModal()}
              style={{
                marginLeft: 12,
                padding: "6px 12px",
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

          {/* Weekly Goals */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <WeeklyHabitsList
              habits={habits}
              activeWeekRange={activeWeekRange}
              sortMode={sortMode}
              handleComplete={handleComplete}
              handleDelete={handleDelete}
              activeDate={activeDate}
              onEdit={handleOpenHabitModal}
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
