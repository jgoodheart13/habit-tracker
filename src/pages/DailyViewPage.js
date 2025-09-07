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
  markHabitComplete,
  deleteHabit,
  updateHabit,
} from "../services/habitService";

export default function DailyViewPage() {
  const [sortMode, setSortMode] = useState("priority"); // 'priority', 'category', 'time', 'unspecified'
  // Toggle for chart view: 'daily' or 'lookback'
  const [chartView, setChartView] = useState("lookback");
  const [habits, setHabits] = useState([]);
  const [activeTab, setActiveTab] = useState("daily"); // 'daily' or 'weekly'
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
    if (activeTab === "daily") {
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

  function handleAddHabit(newHabit) {
    setHabits((prev) => [...prev, newHabit]);
    setShowAddHabit(false);
    // Optionally persist using habitService
    // import { addHabit } from habitService if needed
    // addHabit(newHabit);
  }

  useEffect(() => {
    setHabits(getHabits());
  }, []);

  // Arrow navigation handlers
  function changeDate(offset) {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + offset);
    setActiveDate(d.toISOString().slice(0, 10));
  }

  function handleComplete(id, date, isChecked) {
    markHabitComplete(id, date, isChecked);
    setHabits(getHabits());
  }

  function handleDelete(id) {
    deleteHabit(id);
    setHabits(getHabits());
  }

  function handleEditHabit(id, newName) {
    updateHabit(id, { name: newName });
    setHabits(getHabits());
    setEditHabit(null);
  }

  function handleEditClick(habit) {
    setEditHabit(habit);
  }

  function handleEditHabitSave(updatedHabit) {
    updateHabit(updatedHabit.id, updatedHabit);
    setHabits(getHabits());
    setEditHabit(null);
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
  // Organize habits by type
  const baselineHabits = habits.filter((h) => h.type === "P1");
  const reachHabits = habits.filter((h) => h.type === "P2");

  // Checklist grouping
  function renderGroupedChecklist() {
    // Filter out weekly habits for Daily View
    let filteredHabits = habits.filter((h) => h.frequency && h.frequency.daily);
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

  // Chart data for stacked lines
  const chartData = last14Days.map((date) => {
    // Baseline (P1)
    const p1Total = baselineHabits.length;
    const p1Completed = baselineHabits.filter((h) =>
      h.completedDates.includes(date)
    ).length;
    const p1Percent = p1Total === 0 ? 0 : (p1Completed / p1Total) * 100;
    // Reach (P2)
    const p2Total = reachHabits.length;
    const p2Completed = reachHabits.filter((h) =>
      h.completedDates.includes(date)
    ).length;
    const p2Percent = p2Total === 0 ? 0 : (p2Completed / p2Total) * 100;
    // Inverse relationship: scaled reach
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
          justifyContent: "space-between",
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
            onClick={() => setActiveTab("weekly")}
            style={{
              fontWeight: activeTab === "weekly" ? 700 : 400,
              background:
                activeTab === "weekly"
                  ? theme.colors.accent
                  : theme.colors.background,
              color:
                activeTab === "weekly"
                  ? theme.colors.background
                  : theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 6,
              padding: "6px 18px",
              cursor: "pointer",
              fontSize: 16,
              boxShadow: activeTab === "weekly" ? theme.colors.shadow : "none",
              transition: "background 0.2s",
            }}
          >
            Weekly View
          </button>
        </div>
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
          }}
        >
          Add Habit
        </button>
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
              Add {activeTab === "daily" ? "Daily" : "Weekly"} Habit
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
          {activeDate}
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
      </div>
      {activeTab === "daily" && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              margin: "24px 0 12px 0",
            }}
          >
            <button
              onClick={() => setChartView("daily")}
              style={{
                fontWeight: chartView === "daily" ? 700 : 400,
                background:
                  chartView === "daily"
                    ? theme.colors.accent
                    : theme.colors.background,
                color:
                  chartView === "daily"
                    ? theme.colors.background
                    : theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 6,
                padding: "6px 18px",
                cursor: "pointer",
                fontSize: 15,
                boxShadow: chartView === "daily" ? theme.colors.shadow : "none",
                transition: "background 0.2s",
              }}
            >
              Daily
            </button>
            <button
              onClick={() => setChartView("lookback")}
              style={{
                fontWeight: chartView === "lookback" ? 700 : 400,
                background:
                  chartView === "lookback"
                    ? theme.colors.accent
                    : theme.colors.background,
                color:
                  chartView === "lookback"
                    ? theme.colors.background
                    : theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: 6,
                padding: "6px 18px",
                cursor: "pointer",
                fontSize: 15,
                boxShadow:
                  chartView === "lookback" ? theme.colors.shadow : "none",
                transition: "background 0.2s",
              }}
            >
              7 Day Lookback
            </button>
            {/* Sort Button */}
            <div style={{ marginLeft: "auto" }}>
              <label style={{ marginRight: 8, fontWeight: 500 }}>
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
          </div>
          <div style={{ marginTop: 12, marginBottom: 48 }}>
            {chartView === "daily" ? (
              <DailyProgressBar habits={habits} activeDate={activeDate} />
            ) : (
              <HabitChart
                data={chartData}
                title="Daily Habit Completion (7 Day Lookback)"
              />
            )}
          </div>
          {renderGroupedChecklist()}
        </>
      )}
      {activeTab === "weekly" &&
        habits.filter((h) => !h.frequency.daily).length > 0 && (
          <>
            <WeeklyProgressChart habits={habits} activeDate={activeDate} />
            <div style={{ marginTop: 16 }}>
              <h2 style={{ fontWeight: 700, marginBottom: 16 }}>
                Weekly Goals
              </h2>
              {habits
                .filter((h) => !h.frequency.daily)
                .map((habit) => (
                  <WeeklyHabitBar
                    key={habit.id}
                    habit={habit}
                    activeDate={activeDate}
                    handleComplete={handleComplete}
                    handleDelete={handleDelete}
                  />
                ))}
            </div>
          </>
        )}
    </div>
  );
}
