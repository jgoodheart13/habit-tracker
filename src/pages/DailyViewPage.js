// DailyViewPage.js

import React, { useState, useEffect, useContext } from "react";
import theme from "../styles/theme";
import WeeklyProgressGraph from "../components/WeeklyProgressGraph";
import HabitForm from "../components/HabitForm";
import DailyProgressGraph from "../components/DailyProgressGraph";
import {
  getHabits,
  markHabitComplete,
  deleteHabit,
} from "../services/habitService";
import { useAuth0 } from "@auth0/auth0-react";
import LoadingScreen from "../components/LoadingScreen";
import WeeklyHabitsList from "../components/WeeklyHabitsList";
import { AuthContext } from "../components/AuthenticationWrapper";

export default function DailyViewPage() {
  // Auth0 authentication status
  const { isAuthenticated } = useAuth0();
  const { tokenReady } = useContext(AuthContext);

  const [sortMode, setSortMode] = useState("priority"); // 'priority', 'category', 'time', 'unspecified'
  const [habits, setHabits] = useState([]);
  const [habitsLoading, setHabitsLoading] = useState(true);
  const [activeDate, setActiveDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    // Fetch habits when authenticated and token is ready
    async function fetchHabits() {
      try {
        const habitsFromApi = await getHabits();
        setHabits(habitsFromApi);
      } catch (err) {
        console.error("Error fetching habits:", err);
      } finally {
        setHabitsLoading(false);
      }
    }

    if (isAuthenticated && tokenReady) {
      setHabitsLoading(true);
      fetchHabits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, tokenReady]);
  // Track the most recent completion request
  const latestRequestRef = React.useRef(0);

  function handleComplete(id, date, isChecked) {
    const prevHabits = habits;

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
    );

    // 2️⃣ Increment request ID
    const requestId = ++latestRequestRef.current;

    // 3️⃣ Send API call
    markHabitComplete(id, date, isChecked)
      .then(async () => {
        // only act if this is still the latest request
        if (requestId === latestRequestRef.current) {
          try {
            const updated = await getHabits();
            setHabits((current) => {
              // don’t overwrite if the user changed something else since
              if (current.some((h) => h.pending)) {
                return current.map((h) => ({ ...h, pending: false }));
              }
              return updated;
            });
          } catch (err) {
            console.error("Refresh failed:", err);
          }
        }
      })
      .catch(() => {
        // rollback only if still latest (avoid undoing newer actions)
        if (requestId === latestRequestRef.current) {
          setHabits(prevHabits);
          alert("Failed to update habit. Please try again.");
        }
      });
  }

  function handleDelete(id) {
    (async () => {
      await deleteHabit(id);
      const updated = await getHabits();
      setHabits(updated);
    })();
  }

  function changeDate(offset) {
    const currentDate = new Date(activeDate);
    const newDate = new Date(currentDate);
    newDate.setUTCDate(currentDate.getUTCDate() + offset); // Use UTC methods to avoid timezone drift
    setActiveDate(newDate.toISOString().slice(0, 10));
  }

  function getWeekRange(date) {
    const inputDate = new Date(date);
    const dayOfWeek = inputDate.getUTCDay(); // Use UTC to avoid timezone drift
    const monday = new Date(inputDate);
    monday.setUTCDate(inputDate.getUTCDate() - ((dayOfWeek + 6) % 7)); // Adjust to Monday
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6); // Add 6 days to get Sunday
    return {
      start: monday.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10),
    };
  }

  const activeWeekRange = getWeekRange(activeDate); // Calculate the active week range

  if (habitsLoading || !isAuthenticated || !tokenReady) {
    return <LoadingScreen />;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
      }}
    >
      <div
        style={{
          flexGrow: 1,
          padding: "16px",
          maxWidth: 700,
          margin: "0 auto",
          background: theme.colors.background,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            background: theme.colors.background,
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => changeDate(-7)}
              style={{
                fontSize: 16,
                padding: "4px 8px",
                borderRadius: 4,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.background,
                color: theme.colors.text,
                cursor: "pointer",
              }}
            >
              &#171;
            </button>
            <button
              onClick={() => changeDate(-1)}
              style={{
                fontSize: 16,
                padding: "4px 8px",
                borderRadius: 4,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.background,
                color: theme.colors.text,
                cursor: "pointer",
              }}
            >
              &larr;
            </button>
            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                textAlign: "center",
                color: theme.colors.text,
              }}
            >
              {activeDate === new Date().toISOString().slice(0, 10)
                ? "Today"
                : activeDate}
            </span>
            <button
              onClick={() => changeDate(1)}
              style={{
                fontSize: 16,
                padding: "4px 8px",
                borderRadius: 4,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.background,
                color: theme.colors.text,
                cursor: "pointer",
              }}
            >
              &rarr;
            </button>
            <button
              onClick={() => changeDate(7)}
              style={{
                fontSize: 16,
                padding: "4px 8px",
                borderRadius: 4,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.background,
                color: theme.colors.text,
                cursor: "pointer",
              }}
            >
              &#187;
            </button>
            <button
              onClick={() =>
                setActiveDate(new Date().toISOString().slice(0, 10))
              }
              title="Go to Today"
              style={{
                background: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: "50%",
                padding: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                role="img"
                aria-label="clock"
                style={{ fontSize: 16, color: theme.colors.text }}
              >
                &#128337;
              </span>
            </button>
          </div>
        </div>
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Habit modal for Daily/Overview tabs (outside main return)
export function AddHabitModal({ show, onClose, onAdd, tab }) {
  if (!show) return null;
  const isWeeklyHabitsList = tab === "goals";
  const defaultHabit = isWeeklyHabitsList
    ? {
        name: "",
        type: undefined,
        frequency: { timesPerWeek: 1 },
      }
    : {
        name: "",
        type: "P1",
        frequency: { timesPerWeek: 7 },
      };
  // Only show 'Add Weekly Habit' for Weekly Goals tab
  const modalTitle = isWeeklyHabitsList ? "Add Weekly Habit" : "Add Daily Habit";
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: theme.colors.background,
          padding: 32,
          borderRadius: 16,
          minWidth: 340,
          boxShadow: theme.colors.shadow,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <h2
          style={{
            marginBottom: 18,
            fontWeight: 700,
            color: theme.colors.text,
          }}
        >
          {modalTitle}
        </h2>
        <HabitForm onAdd={onAdd} defaultHabit={defaultHabit} />
        <button
          onClick={onClose}
          style={{
            marginTop: 18,
            background: theme.colors.incomplete,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            padding: "8px 18px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
