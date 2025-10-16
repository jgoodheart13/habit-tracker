// DailyViewPage.js

import React, { useState, useEffect } from "react";
import theme from "../styles/theme";
import HabitChecklist from "../components/HabitChecklist";
import HabitChart from "../components/HabitChart";
import WeeklyHabitBar from "../components/WeeklyHabitBar";
import WeeklyProgressChart from "../components/WeeklyProgressChart";
import HabitForm from "../components/HabitForm";
import DailyProgressBar from "../components/DailyProgressBar";
import {
  getHabits,
  addHabit,
  markHabitComplete,
  deleteHabit,
  updateHabit,
} from "../services/habitService";
import { useAuth0 } from "@auth0/auth0-react";
import LoadingScreen from "../components/LoadingScreen";

export default function DailyViewPage() {
  // Auth0 authentication status
  const { isAuthenticated, user } = useAuth0();

  const [sortMode, setSortMode] = useState("priority"); // 'priority', 'category', 'time', 'unspecified'
  const [habits, setHabits] = useState([]);
  const [habitsLoading, setHabitsLoading] = useState(true);
  // Tabs: 'daily', 'overview', 'goals'
  const [activeTab, setActiveTab] = useState("daily");
  // Track the active date (default to today)
  const [activeDate, setActiveDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  // Modal state for Add Habit
  const [showAddHabit, setShowAddHabit] = useState(false);
  // Edit habit state
  const [editHabit, setEditHabit] = useState(null);
  // Context-sensitive default for HabitForm
  function getDefaultHabit() {
    if (activeTab === "daily" || activeTab === "overview") {
      return {
        name: "",
        type: "P1",
        frequency: { daily: true, timesPerWeek: 7 },
      };
    } else {
      return {
        name: "",
        type: undefined,
        frequency: { daily: false, timesPerWeek: 1 },
      };
    }
  }

  async function handleAddHabit(newHabit) {
    await addHabit(newHabit);
    const updated = await getHabits();
    setHabits(updated);
    setShowAddHabit(false);
  }

  useEffect(() => {
    // Fetch habits when authenticated
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

    if (isAuthenticated) {
      setHabitsLoading(true);
      fetchHabits();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
  // Arrow navigation handlers
  function changeDate(offset) {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + offset);
    setActiveDate(d.toISOString().slice(0, 10));
  }

  function handleComplete(id, date, isChecked) {
    // Save previous state for rollback
    const prevHabits = habits;
    // Optimistically update UI
    setHabits((habits) =>
      habits.map((h) =>
        h.id === id
          ? {
              ...h,
              completedDates: isChecked
                ? [...(h.completedDates || []), date]
                : (h.completedDates || []).filter((d) => d !== date),
            }
          : h
      )
    );
    // Make API call
    markHabitComplete(id, date, isChecked)
      .then(async () => {
        // Optionally refresh from backend for consistency
        const updated = await getHabits();
        setHabits(updated);
      })
      .catch(() => {
        // On error, revert UI and show error
        setHabits(prevHabits);
        alert("Failed to update habit. Please try again.");
      });
  }

  function handleDelete(id) {
    (async () => {
      await deleteHabit(id);
      const updated = await getHabits();
      setHabits(updated);
    })();
  }

  function handleEditHabit(id, newName) {
    (async () => {
      await updateHabit(id, { name: newName });
      const updated = await getHabits();
      setHabits(updated);
      setEditHabit(null);
    })();
  }

  function handleEditClick(habit) {
    setEditHabit(habit);
  }

  function handleEditHabitSave(updatedHabit) {
    (async () => {
      await updateHabit(updatedHabit.id, updatedHabit);
      const updated = await getHabits();
      setHabits(updated);
      setEditHabit(null);
    })();
  }

  function handleEditHabitCancel() {
    setEditHabit(null);
  }

  // Chart and checklist should use the active date as the reference
  const last14Days = (() => {
    const dates = [];
    const d = new Date(activeDate);
    for (let i = 13; i >= 0; i--) {
      const dd = new Date(d);
      dd.setDate(d.getDate() - i);
      dates.push(dd.toISOString().slice(0, 10));
    }
    return dates;
  })();
  // Organize habits by type and daily logic
  const baselineHabits = habits.filter(
    (h) => h.type === "P1" && h.frequency && h.frequency.timesPerWeek === 7
  );
  const reachHabits = habits.filter(
    (h) => h.type === "P2" && h.frequency && h.frequency.timesPerWeek === 7
  );

  // Helper to get start of week (Monday)
  function getMonday(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  // Static 7-day week starting Monday for lookback chart
  function getWeekDates(dateStr) {
    const monday = getMonday(dateStr);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const dd = new Date(monday);
      dd.setDate(monday.getDate() + i);
      dates.push(dd.toISOString().slice(0, 10));
    }
    return dates;
  }

  // Checklist grouping
  function renderGroupedChecklist() {
    // Filter out non-daily habits for Daily View (daily = timesPerWeek === 7)
    let filteredHabits = habits.filter(
      (h) => h.frequency && h.frequency.timesPerWeek === 7
    );
    let grouped = [];
    if (sortMode === "priority") {
      grouped = [
        {
          label: "Baseline (P1)",
          color: theme.colors.p1,
          habits: filteredHabits.filter((h) => h.type === "P1"),
        },
        {
          label: "Reach (P2)",
          color: theme.colors.accent,
          habits: filteredHabits.filter((h) => h.type === "P2"),
        },
      ];
    } else if (sortMode === "category" || sortMode === "time") {
      // Updated logic for new tags structure
      const withTag = filteredHabits.filter(
        (h) => h.tags && h.tags[sortMode] && h.tags[sortMode].label
      );
      const tagGroups = {};
      withTag.forEach((h) => {
        const tag = h.tags[sortMode].label;
        if (!tagGroups[tag]) tagGroups[tag] = [];
        tagGroups[tag].push(h);
      });
      grouped = Object.keys(tagGroups).map((tag) => ({
        label: tag,
        color: theme.colors.accent,
        habits: tagGroups[tag],
      }));
      // Unspecified
      const unspecified = filteredHabits.filter(
        (h) => !h.tags || !h.tags[sortMode] || !h.tags[sortMode].label
      );
      if (unspecified.length) {
        grouped.push({
          label: "Unspecified",
          color: theme.colors.incomplete,
          habits: unspecified,
        });
      }
    } else {
      // All unspecified
      grouped = [
        {
          label: "Unspecified",
          color: theme.colors.incomplete,
          habits: filteredHabits,
        },
      ];
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {grouped.map((group) => (
          <div key={group.label}>
            <h3 style={{ margin: "8px 0", color: group.color }}>
              {group.label}
            </h3>
            <HabitChecklist
              habits={group.habits}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onEdit={handleEditClick}
              date={activeDate}
            />
          </div>
        ))}
      </div>
    );
  }

  // Chart data for stacked lines (7-day static week)
  const weekDates = getWeekDates(activeDate);
  const chartData = weekDates.map((date) => {
    const p1Total = baselineHabits.length;
    const p1Completed = baselineHabits.filter((h) =>
      h.completedDates.includes(date)
    ).length;
    const p1Percent = p1Total === 0 ? 0 : (p1Completed / p1Total) * 100;
    const p2Total = reachHabits.length;
    const p2Completed = reachHabits.filter((h) =>
      h.completedDates.includes(date)
    ).length;
    const p2Percent = p2Total === 0 ? 0 : (p2Completed / p2Total) * 100;
    const reachScaled = p2Percent * (p1Percent / 100);
    const combined = p1Percent + reachScaled;
    return {
      date,
      p1Percent,
      p2Percent,
      reachScaled,
      combined,
    };
  });

  if (habitsLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      style={{
        padding: 16,
        maxWidth: 700,
        margin: "0 auto",
        background: theme.colors.background,
      }}
    >
      {/* Tab header + Add Habit button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setActiveTab("daily")}
            style={{
              fontWeight: activeTab === "daily" ? 700 : 400,
              background:
                activeTab === "daily"
                  ? theme.colors.accent
                  : theme.colors.background,
              color:
                activeTab === "daily"
                  ? theme.colors.background
                  : theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 6,
              padding: "6px 18px",
              cursor: "pointer",
              fontSize: 16,
              boxShadow: activeTab === "daily" ? theme.colors.shadow : "none",
              transition: "background 0.2s",
            }}
          >
            Daily View
          </button>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              fontWeight: activeTab === "overview" ? 700 : 400,
              background:
                activeTab === "overview"
                  ? theme.colors.accent
                  : theme.colors.background,
              color:
                activeTab === "overview"
                  ? theme.colors.background
                  : theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 6,
              padding: "6px 18px",
              cursor: "pointer",
              fontSize: 16,
              boxShadow:
                activeTab === "overview" ? theme.colors.shadow : "none",
              transition: "background 0.2s",
            }}
          >
            Weekly Overview
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            style={{
              fontWeight: activeTab === "goals" ? 700 : 400,
              background:
                activeTab === "goals"
                  ? theme.colors.accent
                  : theme.colors.background,
              color:
                activeTab === "goals"
                  ? theme.colors.background
                  : theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 6,
              padding: "6px 18px",
              cursor: "pointer",
              fontSize: 16,
              boxShadow: activeTab === "goals" ? theme.colors.shadow : "none",
              transition: "background 0.2s",
            }}
          >
            Weekly Goals
          </button>
        </div>
      </div>
      {/* Add Habit Modal (simple inline modal for now) */}
      {showAddHabit && (
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
              Add{" "}
              {activeTab === "daily" || activeTab === "overview"
                ? "Daily"
                : "Weekly"}{" "}
              Habit
            </h2>
            <HabitForm
              onAdd={handleAddHabit}
              defaultHabit={getDefaultHabit()}
            />
            <button
              onClick={() => setShowAddHabit(false)}
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
      )}
      {/* Edit Habit Modal */}
      {editHabit && (
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
              Edit Habit
            </h2>
            <HabitForm onAdd={handleEditHabitSave} defaultHabit={editHabit} />
            <button
              onClick={handleEditHabitCancel}
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
      )}
      {/* Date navigation header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <button
          onClick={() => changeDate(-7)}
          style={{
            fontSize: 22,
            padding: "4px 12px",
            borderRadius: 6,
            boxShadow: theme.colors.shadow,
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
            fontSize: 22,
            padding: "4px 12px",
            borderRadius: 6,
            boxShadow: theme.colors.shadow,
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
            fontSize: 20,
            minWidth: 140,
            textAlign: "center",
            color: theme.colors.text,
          }}
        >
          {(() => {
            const todayStr = new Date().toISOString().slice(0, 10);
            return activeDate === todayStr ? "Today" : activeDate;
          })()}
        </span>
        <button
          onClick={() => changeDate(1)}
          style={{
            fontSize: 22,
            padding: "4px 12px",
            borderRadius: 6,
            boxShadow: theme.colors.shadow,
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
            fontSize: 22,
            padding: "4px 12px",
            borderRadius: 6,
            boxShadow: theme.colors.shadow,
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background,
            color: theme.colors.text,
            cursor: "pointer",
            marginRight: 8,
          }}
        >
          &#187;
        </button>
        <button
          onClick={() => setActiveDate(new Date().toISOString().slice(0, 10))}
          title="Go to Today"
          style={{
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "50%",
            padding: "4px 8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            boxShadow: theme.colors.shadow,
          }}
        >
          <span
            role="img"
            aria-label="clock"
            style={{ fontSize: 20, color: theme.colors.text }}
          >
            &#128337;
          </span>
        </button>
      </div>
      {activeTab === "daily" && (
        <>
          {/* Daily Progress Bar */}
          <div style={{ marginTop: 12, marginBottom: 48 }}>
            <DailyProgressBar
              habits={habits}
              activeDate={activeDate}
              showHeader={false}
            />
          </div>
          {/* Sort Button + Add Habit Button Row */}
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
          >
            <label style={{ marginRight: 8, fontWeight: 500 }}>Sort by:</label>
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
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setShowAddHabit(true)}
              style={{
                padding: "8px 20px",
                background: theme.colors.accent,
                color: theme.colors.background,
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 16,
                boxShadow: theme.colors.shadow,
                cursor: "pointer",
                marginLeft: 12,
              }}
            >
              Add Habit
            </button>
          </div>
          {/* Checklist */}
          {renderGroupedChecklist()}
        </>
      )}
      {/* Weekly Overview Tab */}
      {activeTab === "overview" && (
        <>
          <div style={{ marginTop: 12, marginBottom: 48 }}>
            <HabitChart data={chartData} activeDate={activeDate} />
          </div>
          {/* Sort Button + Add Habit Button Row */}
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
          >
            <label style={{ marginRight: 8, fontWeight: 500 }}>Sort by:</label>
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
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setShowAddHabit(true)}
              style={{
                padding: "8px 20px",
                background: theme.colors.accent,
                color: theme.colors.background,
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 16,
                boxShadow: theme.colors.shadow,
                cursor: "pointer",
                marginLeft: 12,
              }}
            >
              Add Habit
            </button>
          </div>
          {/* Checklist (same as daily, but could be filtered differently if needed) */}
          {renderGroupedChecklist()}
        </>
      )}
      {/* Weekly Goals Tab */}
      {activeTab === "goals" && (
        <>
          <div style={{ marginTop: 12, marginBottom: 48 }}>
            <WeeklyProgressChart
              habits={habits}
              activeDate={activeDate}
              showHeader={false}
            />
          </div>
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 style={{ fontWeight: 700, marginBottom: 0 }}>Weekly Goals</h2>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setShowAddHabit(true)}
                style={{
                  padding: "8px 20px",
                  background: theme.colors.accent,
                  color: theme.colors.background,
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 16,
                  boxShadow: theme.colors.shadow,
                  cursor: "pointer",
                  marginLeft: 12,
                }}
              >
                Add Habit
              </button>
            </div>
            {habits
              .filter((h) => h.frequency && h.frequency.timesPerWeek !== 7)
              .map((habit) => (
                <WeeklyHabitBar
                  key={habit.id}
                  habit={habit}
                  activeDate={activeDate}
                  handleComplete={handleComplete}
                  handleDelete={handleDelete}
                  onEdit={handleEditClick}
                />
              ))}
          </div>
          {/* Add Habit Modal for Weekly Goals */}
          {showAddHabit && activeTab === "goals" && (
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
                  Add Weekly Habit
                </h2>
                <HabitForm
                  onAdd={handleAddHabit}
                  defaultHabit={{
                    name: "",
                    type: "P1",
                    frequency: { timesPerWeek: 3 },
                  }}
                />
                <button
                  onClick={() => setShowAddHabit(false)}
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
          )}
        </>
      )}
    </div>
  );
}

// Add Habit modal for Daily/Overview tabs (outside main return)
export function AddHabitModal({ show, onClose, onAdd, tab }) {
  if (!show) return null;
  const isWeeklyGoals = tab === "goals";
  const defaultHabit = isWeeklyGoals
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
  const modalTitle = isWeeklyGoals ? "Add Weekly Habit" : "Add Daily Habit";
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
